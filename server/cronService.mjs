import fs from 'node:fs';
import path from 'node:path';
import { db, BACKUP_DIR } from './db.mjs';
import { exportCrmExcelReport } from './excelExporter.mjs';

const LOCK_FILE = path.join(BACKUP_DIR, 'export.lock');

/**
 * Kiểm tra xem có đang có tiến trình xuất Excel nào chạy không
 */
const acquireLock = () => {
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const stats = fs.statSync(LOCK_FILE);
      // Nếu lock file cũ hơn 30 phút, coi như tiến trình trước đã chết
      if (Date.now() - stats.mtimeMs > 30 * 60 * 1000) {
        fs.unlinkSync(LOCK_FILE);
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
  try {
    fs.writeFileSync(LOCK_FILE, String(process.pid));
    return true;
  } catch {
    return false;
  }
};

const releaseLock = () => {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (err) {
    console.error('Không thể xóa lock file:', err);
  }
};

/**
 * Thực hiện xuất tự động kỳ báo cáo hằng tháng
 */
export async function executeMonthlyExport(isCatchUp = false) {
  if (!acquireLock()) {
    console.log('⚠️ Đang có tiến trình xuất Excel khác đang chạy. Bỏ qua lượt này.');
    return { skipped: true, reason: 'locked' };
  }

  try {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const periodLabel = `${curYear}-${curMonth}`;

    console.log(`🚀 [CRON] Bắt đầu tự động xuất Excel kỳ ${periodLabel} (CatchUp: ${isCatchUp})...`);

    // 1. Xuất Full Snapshot
    const fullRes = await exportCrmExcelReport({
      mode: 'full',
      targetMonth: periodLabel,
      exportType: isCatchUp ? 'catchup_full_snapshot' : 'monthly_full_snapshot'
    });

    // 2. Xuất Delta Tháng Trước
    const deltaRes = await exportCrmExcelReport({
      mode: 'delta',
      targetMonth: periodLabel,
      exportType: isCatchUp ? 'catchup_delta' : 'monthly_delta'
    });

    console.log(`✅ [CRON] Đã xuất thành công:\n - Full: ${fullRes.filename} (${fullRes.recordCount} dòng)\n - Delta: ${deltaRes.filename} (${deltaRes.recordCount} dòng)`);

    return {
      success: true,
      periodLabel,
      full: fullRes,
      delta: deltaRes
    };
  } catch (err) {
    console.error('❌ [CRON] Lỗi khi tự động xuất Excel:', err);
    return { success: false, error: err.message };
  } finally {
    releaseLock();
  }
}

/**
 * Phát hiện và bù kỳ bị lỡ (Catch-up detection) khi khởi động Server
 */
export async function checkAndRunMissedExport() {
  try {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const periodLabel = `${curYear}-${curMonth}`;

    // Kiểm tra xem trong tháng này đã có file snapshot xuất chưa
    const existing = db.prepare(`
      SELECT COUNT(*) as count FROM excel_export_history 
      WHERE period_label = ? AND status = 'success'
    `).get(periodLabel);

    if (existing.count === 0) {
      console.log(`📢 [CATCH-UP] Phát hiện chưa có bản sao lưu Excel kỳ ${periodLabel}. Tiến hành bù kỳ tự động...`);
      await executeMonthlyExport(true);
    } else {
      console.log(`ℹ️ [CATCH-UP] Kỳ ${periodLabel} đã có ${existing.count} bản xuất Excel lưu trữ.`);
    }
  } catch (err) {
    console.error('Lỗi kiểm tra catch-up:', err);
  }
}

/**
 * Khởi động Timer định kỳ quét lịch lúc 01:00 AM Ngày 1 hằng tháng
 */
export function startMonthlyCronScheduler() {
  console.log('⏰ Khởi động Cron Scheduler: Tự động xuất Excel lúc 01:00 AM Ngày 1 hằng tháng (Asia/Ho_Chi_Minh)');

  // Kiểm tra bù kỳ ngay khi khởi động
  checkAndRunMissedExport();

  // Kiểm tra mỗi phút một lần
  setInterval(async () => {
    try {
      const now = new Date();
      // Chuyển sang múi giờ Việt Nam (UTC+7)
      const vnTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
      const vnDate = new Date(vnTimeStr);

      const dayOfMonth = vnDate.getDate();
      const hour = vnDate.getHours();
      const minute = vnDate.getMinutes();

      // Kiểm tra cấu hình có bật auto export không
      const setting = db.prepare(`SELECT value FROM app_settings WHERE key = 'auto_excel_export_enabled'`).get();
      if (setting && setting.value === 'false') return;

      const targetHourSetting = db.prepare(`SELECT value FROM app_settings WHERE key = 'auto_excel_export_hour'`).get();
      const targetHour = targetHourSetting ? parseInt(targetHourSetting.value, 10) : 1;

      // Kích hoạt đúng vào Ngày 1 hàng tháng, đúng giờ chỉ định (mặc định 01:00) và phút thứ 0
      if (dayOfMonth === 1 && hour === targetHour && minute === 0) {
        console.log(`🎯 [CRON ALARM] Đúng 01:00 AM Ngày 1 hằng tháng. Kích hoạt xuất báo cáo...`);
        await executeMonthlyExport(false);
      }
    } catch (e) {
      console.error('Lỗi scheduler loop:', e);
    }
  }, 60 * 1000);
}
