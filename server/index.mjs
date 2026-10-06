import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { db, BACKUP_DIR, DB_PATH } from './db.mjs';
import { exportCrmExcelReport } from './excelExporter.mjs';
import { 
  enqueueSyncTask, 
  runOutboxWorkerBatch, 
  getOutboxQueueStats, 
  retryAllFailedTasks 
} from './syncWorker.mjs';
import { startMonthlyCronScheduler, executeMonthlyExport } from './cronService.mjs';

const PORT = process.env.PORT || 4321;

// Helper đọc body request JSON
const readJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
};

// Helper gửi JSON response kèm CORS
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // 1. Health Check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.1.3'
      });
    }

    // 2. Trạng thái 3 nơi & Thống kê lưu trữ
    if (pathname === '/api/storage/status' && req.method === 'GET') {
      const customersCount = db.prepare(`SELECT COUNT(*) as c FROM customers WHERE is_deleted = 0`).get().c;
      const bookingsCount = db.prepare(`SELECT COUNT(*) as c FROM bookings WHERE is_deleted = 0`).get().c;
      const photographersCount = db.prepare(`SELECT COUNT(*) as c FROM photographers`).get().c;
      const salesStaffCount = db.prepare(`SELECT COUNT(*) as c FROM sales_staff`).get().c;
      
      let dbSizeBytes = 0;
      try {
        dbSizeBytes = fs.statSync(DB_PATH).size;
      } catch {}

      const queueStats = getOutboxQueueStats();
      const excelFilesCount = db.prepare(`SELECT COUNT(*) as c FROM excel_export_history WHERE status = 'success'`).get().c;

      return sendJson(res, 200, {
        success: true,
        primarySource: 'Server SQL (SQLite Database)',
        primaryDatabasePath: DB_PATH,
        zones: {
          zone1_google_sheets: {
            name: 'Google Sheets (Báo Cáo)',
            spreadsheetId: '1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU',
            status: 'connected',
            role: 'Replica'
          },
          zone2_supabase: {
            name: 'Supabase Cloud PostgreSQL',
            status: process.env.VITE_SUPABASE_ANON_KEY ? 'connected' : 'standby_mock',
            role: 'Replica'
          },
          zone3_server_sql: {
            name: 'Server SQL Engine (SQLite Persistent)',
            status: 'active',
            role: 'Primary Source',
            dbSizeBytes,
            records: {
              customers: customersCount,
              bookings: bookingsCount,
              photographers: photographersCount,
              salesStaff: salesStaffCount
            }
          }
        },
        queue: queueStats,
        excelBackups: {
          totalFiles: excelFilesCount,
          backupDir: BACKUP_DIR
        }
      });
    }

    // 3. Nhận dữ liệu từ CRM Client để ghi vào Primary Database & đưa vào Outbox
    if (pathname === '/api/storage/save-data' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const { customers = [], bookings = [], photographers = [], salesStaff = [] } = body;

      const customerStmt = db.prepare(`
        INSERT INTO customers (
          id, name, phone, email, school_name, class_name, province, lead_source, 
          pipeline_stage, assigned_sales_id, assigned_sales_name, contract_value, 
          deposit_amount, shoot_date, notes, version, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, phone=excluded.phone, email=excluded.email,
          school_name=excluded.school_name, class_name=excluded.class_name,
          province=excluded.province, lead_source=excluded.lead_source,
          pipeline_stage=excluded.pipeline_stage, assigned_sales_id=excluded.assigned_sales_id,
          assigned_sales_name=excluded.assigned_sales_name, contract_value=excluded.contract_value,
          deposit_amount=excluded.deposit_amount, shoot_date=excluded.shoot_date,
          notes=excluded.notes, version=excluded.version + 1, updated_at=CURRENT_TIMESTAMP
      `);

      for (const c of customers) {
        customerStmt.run(
          c.id, c.name, c.phone || '', c.email || '', c.schoolName || '', c.className || '',
          c.province || '', c.leadSource || '', c.pipelineStage || 'lead',
          c.assignedSalesId || '', c.assignedSalesName || '', c.contractValue || 0,
          c.depositAmount || 0, c.shootDate || '', c.notes || '', 1
        );

        // Đưa vào Outbox Queue để đồng bộ sang Google Sheets
        enqueueSyncTask({
          entityType: 'customer',
          entityId: c.id,
          action: 'UPSERT',
          payload: c,
          version: 1,
          targetZone: 'google_sheets'
        });
      }

      // Xử lý Bookings
      const bookingStmt = db.prepare(`
        INSERT INTO bookings (
          id, customer_id, title, shoot_date, shoot_time, location, concept,
          photographer_id, photographer_name, support_photographer_id, status,
          deposit_paid, total_amount, version, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          customer_id=excluded.customer_id, title=excluded.title, shoot_date=excluded.shoot_date,
          shoot_time=excluded.shoot_time, location=excluded.location, concept=excluded.concept,
          photographer_id=excluded.photographer_id, photographer_name=excluded.photographer_name,
          status=excluded.status, deposit_paid=excluded.deposit_paid,
          total_amount=excluded.total_amount, version=excluded.version + 1, updated_at=CURRENT_TIMESTAMP
      `);

      for (const b of bookings) {
        bookingStmt.run(
          b.id, b.customerId || '', b.title || 'Lịch Chụp Kỷ Yếu', b.shootDate || '',
          b.shootTime || '', b.location || '', b.concept || '', b.photographerId || '',
          b.photographerName || '', b.supportPhotographerId || '', b.status || 'confirmed',
          b.depositPaid ? 1 : 0, b.totalAmount || 0, 1
        );

        enqueueSyncTask({
          entityType: 'booking',
          entityId: b.id,
          action: 'UPSERT',
          payload: b,
          version: 1,
          targetZone: 'google_sheets'
        });
      }

      return sendJson(res, 200, {
        success: true,
        message: `Đã lưu bền vững ${customers.length} khách hàng & ${bookings.length} lịch chụp vào Server SQLite và xếp hàng đợi Outbox.`
      });
    }

    // 4. Kích hoạt xuất Excel ngay lập tức
    if (pathname === '/api/storage/export-excel' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const mode = body.mode || 'full';
      const targetMonth = body.targetMonth;

      const result = await exportCrmExcelReport({
        mode,
        targetMonth,
        exportType: 'manual_admin'
      });

      return sendJson(res, 200, {
        success: true,
        message: 'Đã xuất file Excel thành công!',
        data: result
      });
    }

    // 5. Danh sách lịch sử các lần xuất Excel
    if (pathname === '/api/storage/excel-history' && req.method === 'GET') {
      const history = db.prepare(`
        SELECT * FROM excel_export_history 
        ORDER BY created_at DESC 
        LIMIT 50
      `).all();

      return sendJson(res, 200, {
        success: true,
        history
      });
    }

    // 6. Tải file Excel (.xlsx) về máy
    if (pathname.startsWith('/api/storage/download-excel/') && req.method === 'GET') {
      const rawFilename = pathname.replace('/api/storage/download-excel/', '');
      const filename = path.basename(decodeURIComponent(rawFilename));
      const targetFilePath = path.join(BACKUP_DIR, filename);

      if (!fs.existsSync(targetFilePath)) {
        return sendJson(res, 404, { success: false, message: 'File không tồn tại trên server.' });
      }

      const stat = fs.statSync(targetFilePath);
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="${filename}"`
      });

      const readStream = fs.createReadStream(targetFilePath);
      readStream.pipe(res);
      return;
    }

    // 7. Đồng bộ thủ công hoặc Thử lại các lỗi Outbox
    if (pathname === '/api/storage/sync' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body.action === 'retry_failed') {
        const retried = retryAllFailedTasks();
        return sendJson(res, 200, {
          success: true,
          message: `Đã đưa ${retried} tác vụ lỗi trở lại hàng đợi để đồng bộ lại.`
        });
      }

      // Chạy một đợt worker ngay lập tức
      const workerRes = await runOutboxWorkerBatch(20);
      return sendJson(res, 200, {
        success: true,
        message: 'Đã thực hiện quét hàng đợi đồng bộ.',
        result: workerRes
      });
    }

    // 404
    sendJson(res, 404, { success: false, message: 'Endpoint không tồn tại' });
  } catch (err) {
    console.error('Server Internal Error:', err);
    sendJson(res, 500, { success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CRM Xoăn Media Server Engine đang chạy trên cổng ${PORT}`);
  console.log(`📁 Cơ sở dữ liệu Primary SQLite: ${DB_PATH}`);
  console.log(`📊 Google Sheets kết nối: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU`);
  console.log(`📁 Kho sao lưu Excel (.xlsx): ${BACKUP_DIR}`);
  console.log(`=======================================================`);

  // Bắt đầu Cron Scheduler tự động xuất Excel 01:00 AM ngày 1 hằng tháng
  startMonthlyCronScheduler();

  // Bắt đầu Outbox Worker chạy ngầm mỗi 10 giây
  setInterval(() => {
    runOutboxWorkerBatch(10).catch(err => {
      console.error('Lỗi Outbox Worker loop:', err.message);
    });
  }, 10 * 1000);
});
