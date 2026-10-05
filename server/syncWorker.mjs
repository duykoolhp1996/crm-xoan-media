import { db } from './db.mjs';

/**
 * Tính thời điểm retry tiếp theo theo cơ chế Exponential Backoff
 */
const getNextRetryTime = (retryCount) => {
  // Khoảng thời gian lùi (giây): 10s, 30s, 120s (2m), 600s (10m), 1800s (30m)
  const delaysSeconds = [10, 30, 120, 600, 1800];
  const delaySec = delaysSeconds[Math.min(retryCount, delaysSeconds.length - 1)];
  const nextTime = new Date(Date.now() + delaySec * 1000);
  return nextTime.toISOString();
};

/**
 * Thêm một tác vụ vào Hàng Đợi Đồng Bộ (Outbox Queue)
 */
export function enqueueSyncTask({ entityType, entityId, action, payload, version = 1, targetZone }) {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payloadStr = JSON.stringify(payload);
  
  // Idempotency: Kiểm tra xem đã có task tương đương đang chờ chưa
  const existing = db.prepare(`
    SELECT id, version FROM sync_outbox 
    WHERE entity_type = ? AND entity_id = ? AND target_zone = ? AND status IN ('pending', 'syncing')
  `).get(entityType, entityId, targetZone);

  if (existing) {
    if (existing.version >= version) {
      // Đã có task mới hơn hoặc bằng phiên bản này, bỏ qua để bảo vệ dữ liệu
      return existing.id;
    }
    // Cập nhật payload mới cho task đang chờ
    db.prepare(`
      UPDATE sync_outbox 
      SET payload_json = ?, version = ?, action = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(payloadStr, version, action, existing.id);
    return existing.id;
  }

  db.prepare(`
    INSERT INTO sync_outbox (
      id, entity_type, entity_id, action, payload_json, version, target_zone, status, retry_count, next_retry_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, CURRENT_TIMESTAMP)
  `).run(taskId, entityType, entityId, action, payloadStr, version, targetZone);

  return taskId;
}

/**
 * Xử lý từng tác vụ đồng bộ
 */
async function processTask(task) {
  const payload = JSON.parse(task.payload_json);
  
  // VÙNG 1: GOOGLE SHEETS
  if (task.target_zone === 'google_sheets') {
    const webhookSetting = db.prepare(`SELECT value FROM app_settings WHERE key = 'google_sheets_webhook_url'`).get();
    const webhookUrl = webhookSetting ? webhookSetting.value : process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    
    if (!webhookUrl) {
      // Nếu chưa có Webhook URL, giữ ở trạng thái pending hoặc ghi chú
      throw new Error('Chưa cấu hình Google Sheets Webhook URL.');
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: task.action, // 'UPSERT' hoặc 'DELETE'
        type: task.entity_type,
        data: payload,
        spreadsheetId: '1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU',
        timestamp: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Sheets HTTP Error ${res.status}: ${errText}`);
    }
    return true;
  }

  // VÙNG 2: SUPABASE CLOUD
  if (task.target_zone === 'supabase') {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://etvbrbdysphrfzvnwvbk.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseKey) {
      // Supabase chưa có key, đánh dấu standby
      return true;
    }

    const tableMap = {
      customer: 'customers',
      booking: 'bookings',
      photographer: 'photographers',
      sales_staff: 'sales_staff'
    };
    const tableName = tableMap[task.entity_type] || 'customers';

    let url = `${supabaseUrl}/rest/v1/${tableName}`;
    let method = 'POST';
    let headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    };

    if (task.action === 'DELETE') {
      url = `${supabaseUrl}/rest/v1/${tableName}?id=eq.${encodeURIComponent(task.entity_id)}`;
      method = 'DELETE';
      const res = await fetch(url, { method, headers });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Supabase Delete Error ${res.status}`);
      }
      return true;
    } else {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase Sync Error ${res.status}: ${errText}`);
      }
      return true;
    }
  }

  return true;
}

/**
 * Vòng lặp quét hàng đợi (Outbox Worker Runner)
 */
export async function runOutboxWorkerBatch(limit = 10) {
  const now = new Date().toISOString();
  
  // Lấy các tác vụ sẵn sàng xử lý
  const readyTasks = db.prepare(`
    SELECT * FROM sync_outbox 
    WHERE (status = 'pending' OR (status = 'failed' AND retry_count < max_retries))
      AND (next_retry_at IS NULL OR next_retry_at <= ?)
    ORDER BY created_at ASC
    LIMIT ?
  `).all(now, limit);

  if (readyTasks.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  let succeeded = 0;
  let failed = 0;

  for (const task of readyTasks) {
    // Đánh dấu đang xử lý
    db.prepare(`UPDATE sync_outbox SET status = 'syncing', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(task.id);

    try {
      await processTask(task);
      // Đánh dấu thành công
      db.prepare(`
        UPDATE sync_outbox 
        SET status = 'completed', error_log = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(task.id);
      succeeded++;
    } catch (err) {
      failed++;
      const nextRetryCount = task.retry_count + 1;
      const isPermanentlyFailed = nextRetryCount >= task.max_retries;
      const nextTime = isPermanentlyFailed ? null : getNextRetryTime(nextRetryCount);
      const newStatus = isPermanentlyFailed ? 'failed' : 'pending';

      db.prepare(`
        UPDATE sync_outbox 
        SET status = ?, 
            retry_count = ?, 
            next_retry_at = ?, 
            error_log = ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(newStatus, nextRetryCount, nextTime, err.message, task.id);
    }
  }

  return { processed: readyTasks.length, succeeded, failed };
}

/**
 * Thống kê tình trạng Outbox Queue
 */
export function getOutboxQueueStats() {
  const pendingCount = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'pending'`).get().count;
  const syncingCount = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'syncing'`).get().count;
  const completedCount = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'completed'`).get().count;
  const failedCount = db.prepare(`SELECT COUNT(*) as count FROM sync_outbox WHERE status = 'failed'`).get().count;
  
  const recentErrors = db.prepare(`
    SELECT id, entity_type, entity_id, target_zone, retry_count, error_log, updated_at
    FROM sync_outbox 
    WHERE status = 'failed' OR error_log IS NOT NULL
    ORDER BY updated_at DESC LIMIT 5
  `).all();

  return {
    pending: pendingCount,
    syncing: syncingCount,
    completed: completedCount,
    failed: failedCount,
    total: pendingCount + syncingCount + completedCount + failedCount,
    recentErrors
  };
}

/**
 * Đặt lại tất cả các tác vụ lỗi để thử lại ngay
 */
export function retryAllFailedTasks() {
  const res = db.prepare(`
    UPDATE sync_outbox 
    SET status = 'pending', retry_count = 0, next_retry_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE status = 'failed'
  `).run();
  return res.changes;
}
