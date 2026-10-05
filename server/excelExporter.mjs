import ExcelJS from 'exceljs';
import path from 'node:path';
import fs from 'node:fs';
import { db, BACKUP_DIR } from './db.mjs';

/**
 * Làm sạch chuỗi chống Excel Formula Injection (CSV/Excel Formula Injection Prevention)
 * Ký tự nguy hiểm: =, +, -, @
 */
const sanitizeCellValue = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  const str = String(val).trim();
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    return `'${str}`;
  }
  return str;
};

/**
 * Định dạng số điện thoại chuẩn Text để giữ nguyên số 0 ở đầu
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const clean = String(phone).trim();
  // Giữ nguyên số 0 đầu bằng chuỗi text an toàn
  return sanitizeCellValue(clean);
};

/**
 * Format tiền tệ VND
 */
const formatMoney = (val) => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

/**
 * Xuất file Excel (.xlsx) chuẩn doanh nghiệp Xoăn Media
 * @param {Object} options
 * @param {'full'|'delta'} options.mode - 'full' xuất toàn bộ snapshot; 'delta' xuất phát sinh tháng trước
 * @param {string} [options.targetMonth] - Kỳ xuất (VD: '2026-10')
 * @param {string} [options.exportType] - Loại xuất ghi log ('monthly_full_snapshot' | 'monthly_delta' | 'manual_admin')
 */
export async function exportCrmExcelReport(options = {}) {
  const mode = options.mode || 'full';
  const now = new Date();
  
  // Xác định kỳ tháng xuất
  let periodLabel = options.targetMonth;
  if (!periodLabel) {
    if (mode === 'delta') {
      // Tháng trước
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      periodLabel = `${y}-${m}`;
    } else {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      periodLabel = `${y}-${m}`;
    }
  }

  // Truy vấn dữ liệu từ SQLite Database
  let customerRows = [];
  let bookingRows = [];
  let photographerRows = [];
  let salesStaffRows = [];

  if (mode === 'delta') {
    // Chỉ lấy bản ghi tạo hoặc cập nhật trong tháng mục tiêu
    customerRows = db.prepare(`
      SELECT * FROM customers 
      WHERE is_deleted = 0 AND (created_at LIKE ? OR updated_at LIKE ?)
      ORDER BY created_at DESC
    `).all(`${periodLabel}%`, `${periodLabel}%`);

    bookingRows = db.prepare(`
      SELECT * FROM bookings 
      WHERE is_deleted = 0 AND (created_at LIKE ? OR updated_at LIKE ? OR shoot_date LIKE ?)
      ORDER BY shoot_date DESC
    `).all(`${periodLabel}%`, `${periodLabel}%`, `${periodLabel}%`);
  } else {
    // Toàn bộ Snapshot
    customerRows = db.prepare(`SELECT * FROM customers WHERE is_deleted = 0 ORDER BY created_at DESC`).all();
    bookingRows = db.prepare(`SELECT * FROM bookings WHERE is_deleted = 0 ORDER BY shoot_date DESC`).all();
  }

  photographerRows = db.prepare(`SELECT * FROM photographers ORDER BY completed_shoots_count DESC`).all();
  salesStaffRows = db.prepare(`SELECT * FROM sales_staff ORDER BY name ASC`).all();

  // Khởi tạo Workbook ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CRM Xoăn Media Automation Engine';
  workbook.lastModifiedBy = 'Admin Xoăn Media';
  workbook.created = now;
  workbook.modified = now;

  const BRAND_COLOR_FILL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'B8F23D' } // Xanh neon thương hiệu Xoăn Media
  };

  const HEADER_FONT = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: '000000' }
  };

  const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: 'E5E5E5' } },
    left: { style: 'thin', color: { argb: 'E5E5E5' } },
    bottom: { style: 'thin', color: { argb: 'E5E5E5' } },
    right: { style: 'thin', color: { argb: 'E5E5E5' } }
  };

  // ==========================================
  // SHEET 1: KHÁCH HÀNG & LEADS
  // ==========================================
  const sheetCustomers = workbook.addWorksheet('Khách Hàng', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  sheetCustomers.columns = [
    { header: 'Mã Khách Hàng', key: 'id', width: 22 },
    { header: 'Họ Và Tên', key: 'name', width: 26 },
    { header: 'Số Điện Thoại', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 24 },
    { header: 'Trường Học', key: 'school_name', width: 28 },
    { header: 'Lớp', key: 'class_name', width: 14 },
    { header: 'Khu Vực / Tỉnh Thành', key: 'province', width: 20 },
    { header: 'Nguồn Khách (Lead Source)', key: 'lead_source', width: 22 },
    { header: 'Giai Đoạn Pipeline', key: 'pipeline_stage', width: 20 },
    { header: 'Sales Phụ Trách', key: 'assigned_sales_name', width: 22 },
    { header: 'Giá Trị Hợp Đồng (VNĐ)', key: 'contract_value', width: 22 },
    { header: 'Tiền Cọc (VNĐ)', key: 'deposit_amount', width: 18 },
    { header: 'Ngày Dự Kiến Chụp', key: 'shoot_date', width: 18 },
    { header: 'Ghi Chú & Yêu Cầu', key: 'notes', width: 35 },
    { header: 'Ngày Tạo', key: 'created_at', width: 20 }
  ];

  // Áp dụng định dạng Header
  sheetCustomers.getRow(1).eachCell((cell) => {
    cell.fill = BRAND_COLOR_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_STYLE;
  });
  sheetCustomers.getRow(1).height = 28;

  // Thêm dữ liệu Khách hàng
  customerRows.forEach((c) => {
    const row = sheetCustomers.addRow({
      id: sanitizeCellValue(c.id),
      name: sanitizeCellValue(c.name),
      phone: formatPhoneNumber(c.phone),
      email: sanitizeCellValue(c.email),
      school_name: sanitizeCellValue(c.school_name),
      class_name: sanitizeCellValue(c.class_name),
      province: sanitizeCellValue(c.province),
      lead_source: sanitizeCellValue(c.lead_source),
      pipeline_stage: sanitizeCellValue(c.pipeline_stage),
      assigned_sales_name: sanitizeCellValue(c.assigned_sales_name),
      contract_value: formatMoney(c.contract_value),
      deposit_amount: formatMoney(c.deposit_amount),
      shoot_date: sanitizeCellValue(c.shoot_date),
      notes: sanitizeCellValue(c.notes),
      created_at: sanitizeCellValue(c.created_at)
    });

    row.eachCell((cell, colNumber) => {
      cell.border = BORDER_STYLE;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (colNumber === 3) {
        // Cột số điện thoại: Ép định dạng Text tuyệt đối để không mất số 0
        cell.numFmt = '@';
        cell.alignment = { horizontal: 'center' };
      } else if (colNumber === 11 || colNumber === 12) {
        // Cột tiền tệ
        cell.numFmt = '#,##0 "₫"';
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // ==========================================
  // SHEET 2: LỊCH CHỤP (BOOKINGS)
  // ==========================================
  const sheetBookings = workbook.addWorksheet('Lịch Chụp', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  sheetBookings.columns = [
    { header: 'Mã Booking', key: 'id', width: 20 },
    { header: 'Tên Buổi Chụp', key: 'title', width: 30 },
    { header: 'Mã Khách Hàng', key: 'customer_id', width: 22 },
    { header: 'Ngày Chụp', key: 'shoot_date', width: 16 },
    { header: 'Giờ Chụp', key: 'shoot_time', width: 14 },
    { header: 'Địa Điểm Chụp', key: 'location', width: 30 },
    { header: 'Concept / Phong Cách', key: 'concept', width: 24 },
    { header: 'Trưởng Nháy (Photographer)', key: 'photographer_name', width: 24 },
    { header: 'Trạng Thái', key: 'status', width: 18 },
    { header: 'Đã Cọc', key: 'deposit_paid', width: 14 },
    { header: 'Tổng Giá Trị (VNĐ)', key: 'total_amount', width: 20 },
    { header: 'Ngày Tạo', key: 'created_at', width: 20 }
  ];

  sheetBookings.getRow(1).eachCell((cell) => {
    cell.fill = BRAND_COLOR_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_STYLE;
  });
  sheetBookings.getRow(1).height = 28;

  bookingRows.forEach((b) => {
    const row = sheetBookings.addRow({
      id: sanitizeCellValue(b.id),
      title: sanitizeCellValue(b.title),
      customer_id: sanitizeCellValue(b.customer_id),
      shoot_date: sanitizeCellValue(b.shoot_date),
      shoot_time: sanitizeCellValue(b.shoot_time),
      location: sanitizeCellValue(b.location),
      concept: sanitizeCellValue(b.concept),
      photographer_name: sanitizeCellValue(b.photographer_name),
      status: sanitizeCellValue(b.status),
      deposit_paid: b.deposit_paid ? 'Đã Cọc' : 'Chưa Cọc',
      total_amount: formatMoney(b.total_amount),
      created_at: sanitizeCellValue(b.created_at)
    });

    row.eachCell((cell, colNumber) => {
      cell.border = BORDER_STYLE;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (colNumber === 11) {
        cell.numFmt = '#,##0 "₫"';
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // ==========================================
  // SHEET 3: EKIP THỢ CHỤP
  // ==========================================
  const sheetPhoto = workbook.addWorksheet('Ekip Thợ Chụp', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  sheetPhoto.columns = [
    { header: 'Mã Thợ', key: 'id', width: 18 },
    { header: 'Họ Và Tên', key: 'full_name', width: 26 },
    { header: 'Số Điện Thoại', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 24 },
    { header: 'Phân Loại Thợ', key: 'photographer_type', width: 20 },
    { header: 'Đánh Giá (Rating)', key: 'rating', width: 16 },
    { header: 'Số Ca Hoàn Thành', key: 'completed_shoots_count', width: 18 },
    { header: 'Đơn Giá / Ca (VNĐ)', key: 'rate_per_shoot', width: 20 },
    { header: 'Trạng Thái', key: 'status', width: 16 }
  ];

  sheetPhoto.getRow(1).eachCell((cell) => {
    cell.fill = BRAND_COLOR_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_STYLE;
  });
  sheetPhoto.getRow(1).height = 28;

  photographerRows.forEach((p) => {
    const row = sheetPhoto.addRow({
      id: sanitizeCellValue(p.id),
      full_name: sanitizeCellValue(p.full_name),
      phone: formatPhoneNumber(p.phone),
      email: sanitizeCellValue(p.email),
      photographer_type: sanitizeCellValue(p.photographer_type),
      rating: Number(p.rating) || 5.0,
      completed_shoots_count: Number(p.completed_shoots_count) || 0,
      rate_per_shoot: formatMoney(p.rate_per_shoot),
      status: sanitizeCellValue(p.status)
    });

    row.eachCell((cell, colNumber) => {
      cell.border = BORDER_STYLE;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (colNumber === 3) {
        cell.numFmt = '@';
        cell.alignment = { horizontal: 'center' };
      } else if (colNumber === 8) {
        cell.numFmt = '#,##0 "₫"';
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // ==========================================
  // SHEET 4: NHÂN SỰ SALES
  // ==========================================
  const sheetSales = workbook.addWorksheet('Nhân Sự Sales', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  sheetSales.columns = [
    { header: 'Mã Sales', key: 'id', width: 18 },
    { header: 'Họ Và Tên', key: 'name', width: 26 },
    { header: 'Số Điện Thoại', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 24 },
    { header: 'Chức Danh', key: 'role_title', width: 22 },
    { header: 'Loại Hoa Hồng', key: 'commission_type', width: 18 },
    { header: 'Tỷ Lệ (%)', key: 'commission_rate', width: 14 },
    { header: 'Mức Cố Định (VNĐ)', key: 'commission_fixed_amount', width: 20 },
    { header: 'Trạng Thái', key: 'status', width: 16 }
  ];

  sheetSales.getRow(1).eachCell((cell) => {
    cell.fill = BRAND_COLOR_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = BORDER_STYLE;
  });
  sheetSales.getRow(1).height = 28;

  salesStaffRows.forEach((s) => {
    const row = sheetSales.addRow({
      id: sanitizeCellValue(s.id),
      name: sanitizeCellValue(s.name),
      phone: formatPhoneNumber(s.phone),
      email: sanitizeCellValue(s.email),
      role_title: sanitizeCellValue(s.role_title),
      commission_type: sanitizeCellValue(s.commission_type),
      commission_rate: Number(s.commission_rate) || 0,
      commission_fixed_amount: formatMoney(s.commission_fixed_amount),
      status: sanitizeCellValue(s.status)
    });

    row.eachCell((cell, colNumber) => {
      cell.border = BORDER_STYLE;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (colNumber === 3) {
        cell.numFmt = '@';
        cell.alignment = { horizontal: 'center' };
      } else if (colNumber === 7) {
        cell.numFmt = '0.00"%"';
        cell.alignment = { horizontal: 'right' };
      } else if (colNumber === 8) {
        cell.numFmt = '#,##0 "₫"';
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // Tên file và đường dẫn lưu trữ
  const timestampStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const typeTag = mode === 'delta' ? 'Delta' : 'Snapshot_Toan_Bo';
  const filename = `Bao_Cao_CRM_Xoan_Media_${periodLabel}_${typeTag}_${timestampStr}.xlsx`;
  const filePath = path.join(BACKUP_DIR, filename);

  // Ghi file ra ổ cứng server
  await workbook.xlsx.writeFile(filePath);

  const stats = fs.statSync(filePath);
  const totalRecords = customerRows.length + bookingRows.length + photographerRows.length + salesStaffRows.length;

  // Ghi nhật ký vào database
  const exportType = options.exportType || (mode === 'delta' ? 'monthly_delta' : 'monthly_full_snapshot');
  const historyId = 'exp_' + Date.now();
  db.prepare(`
    INSERT INTO excel_export_history (
      id, filename, file_path, file_size_bytes, export_type, period_label, record_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    historyId,
    filename,
    filePath,
    stats.size,
    exportType,
    periodLabel,
    totalRecords,
    'success'
  );

  return {
    success: true,
    historyId,
    filename,
    filePath,
    fileSizeBytes: stats.size,
    recordCount: totalRecords,
    customerCount: customerRows.length,
    bookingCount: bookingRows.length,
    periodLabel,
    exportType
  };
}
