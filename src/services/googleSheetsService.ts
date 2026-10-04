/**
 * Service Quản Lý Đồng Bộ Dữ Liệu Vùng 1: Google Sheets (Bảng Tính Google)
 * Hỗ trợ Webhook Google Apps Script tự động cập nhật dòng mới và xuất file tương thích
 */

import { Customer, Booking } from '../types';

export interface GoogleSheetsConfig {
  webhookUrl: string;
  spreadsheetId?: string;
  sheetNameCustomers: string;
  sheetNameBookings: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

const STORAGE_KEY = 'crm_xoan_google_sheets_config';

const DEFAULT_CONFIG: GoogleSheetsConfig = {
  webhookUrl: '',
  spreadsheetId: '',
  sheetNameCustomers: 'Khách Hàng',
  sheetNameBookings: 'Lịch Chụp',
  autoSync: true,
  lastSyncedAt: undefined
};

export const getGoogleSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Lỗi đọc cấu hình Google Sheets:', e);
  }
  return DEFAULT_CONFIG;
};

export const saveGoogleSheetsConfig = (config: Partial<GoogleSheetsConfig>): GoogleSheetsConfig => {
  const current = getGoogleSheetsConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Lỗi lưu cấu hình Google Sheets:', e);
  }
  return updated;
};

/**
 * Gửi bản ghi khách hàng lên Google Sheets thông qua Webhook Apps Script
 */
export const syncCustomerToGoogleSheet = async (customer: Customer): Promise<{ success: boolean; message: string }> => {
  const config = getGoogleSheetsConfig();
  if (!config.webhookUrl) {
    return { success: false, message: 'Chưa cấu hình URL Webhook Google Sheets trong Cài Đặt.' };
  }

  try {
    const payload = {
      action: 'UPSERT_CUSTOMER',
      sheetName: config.sheetNameCustomers || 'Khách Hàng',
      data: {
        id: customer.id,
        ngayTao: new Date(customer.createdAt).toLocaleDateString('vi-VN'),
        tenLop: customer.className,
        truongHoc: customer.schoolName,
        khuVuc: customer.region,
        siSo: customer.studentCount,
        daiDien: customer.name,
        soDienThoai: customer.phone,
        zalo: customer.zalo || customer.phone,
        goiConcept: customer.servicePackageName || customer.concept || '',
        ngayChupDuKien: customer.expectedShootDate || '',
        trangThai: customer.pipelineStage,
        salesPhuTrach: customer.assignedSalesName || '',
        tongDoanhThu: customer.totalRevenue || customer.expectedBudget || 0,
        daThucThu: customer.paidAmount || 0,
        conLai: (customer.totalRevenue || customer.expectedBudget || 0) - (customer.paidAmount || 0),
        ghiChu: customer.notes || ''
      }
    };

    // Google Apps Script Webhook redirect (no-cors support)
    await fetch(config.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    saveGoogleSheetsConfig({ lastSyncedAt: new Date().toISOString() });
    return { success: true, message: `Đã gửi bản ghi lớp ${customer.className} lên Google Sheet.` };
  } catch (err: any) {
    console.error('Lỗi đồng bộ khách hàng lên Google Sheet:', err);
    return { success: false, message: `Lỗi kết nối Google Sheets: ${err.message}` };
  }
};

/**
 * Gửi bản ghi lịch chụp Booking lên Google Sheets
 */
export const syncBookingToGoogleSheet = async (booking: Booking): Promise<{ success: boolean; message: string }> => {
  const config = getGoogleSheetsConfig();
  if (!config.webhookUrl) {
    return { success: false, message: 'Chưa cấu hình URL Webhook Google Sheets.' };
  }

  try {
    const payload = {
      action: 'UPSERT_BOOKING',
      sheetName: config.sheetNameBookings || 'Lịch Chụp',
      data: {
        id: booking.id,
        maBooking: booking.code,
        tenLop: booking.className,
        truongHoc: booking.schoolName,
        ngayChup: booking.shootDate,
        gioBatDau: booking.startTime,
        diaDiem: booking.location || '',
        goiConcept: booking.packageName,
        siSo: booking.studentCount,
        thoChinh: booking.assignments?.leadPhotographerName || '',
        quayPhim: booking.assignments?.videographerName || '',
        thoPhu: (booking.assignments?.assistantNames || []).join(', '),
        trangThaiBooking: booking.bookingStatus,
        trangThaiThanhToan: booking.paymentStatus,
        tongTien: booking.totalAmount,
        daDatCoc: booking.depositAmount,
        conLai: booking.totalAmount - booking.depositAmount,
        ghiChu: booking.notes || ''
      }
    };

    await fetch(config.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    saveGoogleSheetsConfig({ lastSyncedAt: new Date().toISOString() });
    return { success: true, message: `Đã gửi booking ${booking.code} lên Google Sheet.` };
  } catch (err: any) {
    return { success: false, message: `Lỗi: ${err.message}` };
  }
};

/**
 * Đồng bộ toàn bộ dữ liệu hiện tại lên Google Sheet (Batch Sync)
 */
export const syncAllToGoogleSheet = async (
  customers: Customer[],
  bookings: Booking[]
): Promise<{ success: boolean; totalCustomers: number; totalBookings: number; message: string }> => {
  const config = getGoogleSheetsConfig();
  if (!config.webhookUrl) {
    return {
      success: false,
      totalCustomers: 0,
      totalBookings: 0,
      message: 'Chưa cấu hình Webhook URL. Hãy dán Webhook URL Google Apps Script vào phần Cài Đặt.'
    };
  }

  try {
    const batchPayload = {
      action: 'SYNC_ALL',
      timestamp: new Date().toISOString(),
      sheetNameCustomers: config.sheetNameCustomers || 'Khách Hàng',
      sheetNameBookings: config.sheetNameBookings || 'Lịch Chụp',
      customers: customers.map(c => ({
        id: c.id,
        ngayTao: new Date(c.createdAt).toLocaleDateString('vi-VN'),
        tenLop: c.className,
        truongHoc: c.schoolName,
        khuVuc: c.region,
        siSo: c.studentCount,
        daiDien: c.name,
        soDienThoai: c.phone,
        zalo: c.zalo || c.phone,
        goiConcept: c.servicePackageName || c.concept || '',
        ngayChupDuKien: c.expectedShootDate || '',
        trangThai: c.pipelineStage,
        salesPhuTrach: c.assignedSalesName || '',
        tongDoanhThu: c.totalRevenue || c.expectedBudget || 0,
        daThucThu: c.paidAmount || 0,
        conLai: (c.totalRevenue || c.expectedBudget || 0) - (c.paidAmount || 0),
        ghiChu: c.notes || ''
      })),
      bookings: bookings.map(b => ({
        id: b.id,
        maBooking: b.code,
        tenLop: b.className,
        truongHoc: b.schoolName,
        ngayChup: b.shootDate,
        gioBatDau: b.startTime,
        gioKetThuc: b.endTime,
        diaDiem: b.location || '',
        goiConcept: b.packageName,
        siSo: b.studentCount,
        thoChinh: b.assignments?.leadPhotographerName || '',
        quayPhim: b.assignments?.videographerName || '',
        thoPhu: (b.assignments?.assistantNames || []).join(', '),
        trangThaiBooking: b.bookingStatus,
        trangThaiThanhToan: b.paymentStatus,
        tongTien: b.totalAmount,
        daDatCoc: b.depositAmount,
        conLai: b.totalAmount - b.depositAmount,
        ghiChu: b.notes || ''
      }))
    };

    await fetch(config.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchPayload)
    });

    saveGoogleSheetsConfig({ lastSyncedAt: new Date().toISOString() });
    return {
      success: true,
      totalCustomers: customers.length,
      totalBookings: bookings.length,
      message: `Đã phát lệnh đồng bộ thành công ${customers.length} khách hàng và ${bookings.length} lịch chụp sang Google Sheet!`
    };
  } catch (err: any) {
    return {
      success: false,
      totalCustomers: 0,
      totalBookings: 0,
      message: `Lỗi đồng bộ: ${err.message}`
    };
  }
};

/**
 * Xuất file CSV hỗ trợ tiếng Việt có dấu (UTF-8 BOM) để mở trực tiếp trong Excel hoặc Google Sheets
 */
export const exportToGoogleSheetsCsv = (customers: Customer[]): void => {
  const headers = [
    'ID',
    'Ngày Tạo',
    'Tên Lớp',
    'Trường Học',
    'Khu Vực',
    'Sĩ Số',
    'Đại Diện Lớp',
    'Số Điện Thoại',
    'Zalo',
    'Gói Concept',
    'Ngày Chụp Dự Kiến',
    'Giai Đoạn Pipeline',
    'Sales Phụ Trách',
    'Tổng Doanh Thu (VNĐ)',
    'Đã Thu Cọc (VNĐ)',
    'Còn Lại (VNĐ)',
    'Ghi Chú'
  ];

  const rows = customers.map(c => [
    `"${c.id}"`,
    `"${new Date(c.createdAt).toLocaleDateString('vi-VN')}"`,
    `"${c.className}"`,
    `"${c.schoolName}"`,
    `"${c.region || ''}"`,
    c.studentCount || 0,
    `"${c.name}"`,
    `"${c.phone}"`,
    `"${c.zalo || c.phone}"`,
    `"${c.servicePackageName || c.concept || ''}"`,
    `"${c.expectedShootDate || ''}"`,
    `"${c.pipelineStage}"`,
    `"${c.assignedSalesName || ''}"`,
    c.totalRevenue || c.expectedBudget || 0,
    c.paidAmount || 0,
    (c.totalRevenue || c.expectedBudget || 0) - (c.paidAmount || 0),
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `XoanMedia_GoogleSheets_KhachHang_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Mã nguồn mẫu Google Apps Script để Admin dán vào Google Sheet
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * MÃ NGUỒN GOOGLE APPS SCRIPT ĐỒNG BỘ CRM XOĂN MEDIA -> GOOGLE SHEETS
 * Hướng dẫn cài đặt:
 * 1. Mở file Google Sheets của bạn.
 * 2. Vào Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xóa code cũ, dán toàn bộ đoạn mã này vào và bấm Lưu (Ctrl+S).
 * 4. Bấm nút Triển khai (Deploy) > Tùy chọn triển khai mới (New deployment).
 * 5. Chọn loại: "Ứng dụng web" (Web App).
 *    - Mô tả: "Xoan CRM Sync Webhook"
 *    - Thực thi dưới dạng: "Tôi (Địa chỉ email của bạn)"
 *    - Người có quyền truy cập: "Bất kỳ ai (Anyone)"
 * 6. Bấm Triển khai > Sao chép URL ứng dụng web và dán vào CRM Xoăn Media!
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var json = JSON.parse(rawData);
    var action = json.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'UPSERT_CUSTOMER') {
      var sheetName = json.sheetName || 'Khách Hàng';
      var sheet = getOrCreateSheet(ss, sheetName, [
        'ID', 'Ngày Tạo', 'Tên Lớp', 'Trường Học', 'Khu Vực', 'Sĩ Số',
        'Người Đại Diện', 'Số Điện Thoại', 'Zalo', 'Gói Concept',
        'Ngày Chụp', 'Trạng Thái', 'Sales Phụ Trách', 'Tổng Doanh Thu',
        'Đã Thu Cọc', 'Còn Nợ', 'Ghi Chú'
      ]);
      var d = json.data;
      var row = [
        d.id, d.ngayTao, d.tenLop, d.truongHoc, d.khuVuc, d.siSo,
        d.daiDien, d.soDienThoai, d.zalo, d.goiConcept,
        d.ngayChupDuKien, d.trangThai, d.salesPhuTrach, d.tongDoanhThu,
        d.daThucThu, d.conLai, d.ghiChu
      ];
      upsertRowById(sheet, d.id, row);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', action: action })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'UPSERT_BOOKING') {
      var sheetName = json.sheetName || 'Lịch Chụp';
      var sheet = getOrCreateSheet(ss, sheetName, [
        'ID', 'Mã Booking', 'Tên Lớp', 'Trường Học', 'Ngày Chụp',
        'Bắt Đầu', 'Kết Thúc', 'Địa Điểm', 'Gói Concept', 'Sĩ Số',
        'Thợ Chính (Lead)', 'Quay Phim', 'Thợ Phụ', 'Trạng Thái Booking',
        'Thanh Toán', 'Tổng Tiền', 'Đã Cọc', 'Còn Nợ', 'Ghi Chú'
      ]);
      var b = json.data;
      var row = [
        b.id, b.maBooking, b.tenLop, b.truongHoc, b.ngayChup,
        b.gioBatDau, b.gioKetThuc, b.diaDiem, b.goiConcept, b.siSo,
        b.thoChinh, b.quayPhim, b.thoPhu, b.trangThaiBooking,
        b.trangThaiThanhToan, b.tongTien, b.daDatCoc, b.conLai, b.ghiChu
      ];
      upsertRowById(sheet, b.id, row);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', action: action })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'SYNC_ALL') {
      if (json.customers && json.customers.length > 0) {
        var cSheet = getOrCreateSheet(ss, json.sheetNameCustomers || 'Khách Hàng', [
          'ID', 'Ngày Tạo', 'Tên Lớp', 'Trường Học', 'Khu Vực', 'Sĩ Số',
          'Người Đại Diện', 'Số Điện Thoại', 'Zalo', 'Gói Concept',
          'Ngày Chụp', 'Trạng Thái', 'Sales Phụ Trách', 'Tổng Doanh Thu',
          'Đã Thu Cọc', 'Còn Nợ', 'Ghi Chú'
        ]);
        json.customers.forEach(function(d) {
          var row = [
            d.id, d.ngayTao, d.tenLop, d.truongHoc, d.khuVuc, d.siSo,
            d.daiDien, d.soDienThoai, d.zalo, d.goiConcept,
            d.ngayChupDuKien, d.trangThai, d.salesPhuTrach, d.tongDoanhThu,
            d.daThucThu, d.conLai, d.ghiChu
          ];
          upsertRowById(cSheet, d.id, row);
        });
      }

      if (json.bookings && json.bookings.length > 0) {
        var bSheet = getOrCreateSheet(ss, json.sheetNameBookings || 'Lịch Chụp', [
          'ID', 'Mã Booking', 'Tên Lớp', 'Trường Học', 'Ngày Chụp',
          'Bắt Đầu', 'Kết Thúc', 'Địa Điểm', 'Gói Concept', 'Sĩ Số',
          'Thợ Chính (Lead)', 'Quay Phim', 'Thợ Phụ', 'Trạng Thái Booking',
          'Thanh Toán', 'Tổng Tiền', 'Đã Cọc', 'Còn Nợ', 'Ghi Chú'
        ]);
        json.bookings.forEach(function(b) {
          var row = [
            b.id, b.maBooking, b.tenLop, b.truongHoc, b.ngayChup,
            b.gioBatDau, b.gioKetThuc, b.diaDiem, b.goiConcept, b.siSo,
            b.thoChinh, b.quayPhim, b.thoPhu, b.trangThaiBooking,
            b.trangThaiThanhToan, b.tongTien, b.daDatCoc, b.conLai, b.ghiChu
          ];
          upsertRowById(bSheet, b.id, row);
        });
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', action: 'SYNC_ALL' })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'unknown_action' })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#B8F23D').setFontColor('#000000');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function upsertRowById(sheet, id, rowData) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
      return;
    }
  }
  sheet.appendRow(rowData);
}
`;
