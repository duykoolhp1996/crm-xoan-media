// Script Import 12 Lịch Chụp & Quay Kỷ Yếu Thực Tế Vào Database SQLite CRM Xoăn Media
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, DB_PATH, BACKUP_DIR, runTransaction } from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚀 Bắt đầu Import 12 Lớp Chụp & Quay vào CRM Xoăn Media');
console.log('====================================================');

// 1. Sao lưu DB trước khi import (Zero Data Loss)
const backupFilename = `crm_backup_before_import_schedule_${Date.now()}.db`;
const backupPath = path.join(BACKUP_DIR, 'db', backupFilename);
if (fs.existsSync(DB_PATH)) {
  fs.mkdirSync(path.join(BACKUP_DIR, 'db'), { recursive: true });
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`💾 [Backup] Đã tạo bản sao lưu an toàn: ${backupFilename}`);
}

// 2. Dữ liệu chuẩn từ bảng Excel của Anh Duy
const scheduleData = [
  {
    rawDate: '1.11',
    shootDate: '2026-11-01',
    className: 'D14',
    schoolName: 'THCS Chu Văn An',
    grade: 'Khối 9',
    studentCount: 68,
    concept: 'XÁM VEST XÁM',
    depositAmount: 2000000,
    unitPrice: 650000,
    totalAmount: 44200000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-3', name: 'Thắng' },
    assistantPhotographers: [
      { id: 'photo-4', name: 'Thành Con' },
      { id: 'photo-2', name: 'Thành To' },
      { id: 'photo-18', name: 'Bin Hoàng' },
      { id: 'photo-16', name: 'Dũng Đen' },
      { id: 'photo-11', name: 'Tú Voi' }
    ],
    videographer: { id: 'photo-6', name: 'Thành An Quay' },
    individualPhotographer: { id: 'photo-8', name: 'Quang Thái' },
    phone: '',
    notes: 'Concept: XÁM VEST XÁM. Thợ chụp: THẮNG, THÀNH CON, THÀNH TO, BIN, DŨNG, TÚ. Thợ quay: THÀNH AN QUAY. Thợ cá nhân: QUANG THÁI.'
  },
  {
    rawDate: '21.11',
    shootDate: '2026-11-21',
    className: 'A8',
    schoolName: 'THCS Võ Thị Sáu',
    grade: 'Khối 9',
    studentCount: 63,
    concept: 'Kỷ yếu THCS',
    depositAmount: 1000000,
    unitPrice: 0,
    totalAmount: 0,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-2', name: 'Thành To' },
    assistantPhotographers: [
      { id: 'photo-11', name: 'Tú Voi' },
      { id: 'photo-4', name: 'Thành Con' }
    ],
    videographer: null,
    individualPhotographer: null,
    phone: '',
    notes: 'Thợ chụp: THÀNH TO, TÚ, THÀNH CON. Đang cập nhật gói chụp & concept chi tiết.'
  },
  {
    rawDate: '22.11',
    shootDate: '2026-11-22',
    className: 'D5',
    schoolName: 'THCS Chu Văn An',
    grade: 'Khối 9',
    studentCount: 55,
    concept: 'Kỷ yếu THCS',
    depositAmount: 2000000,
    unitPrice: 650000,
    totalAmount: 26400000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-1', name: 'Doanh Béo' },
    assistantPhotographers: [
      { id: 'photo-18', name: 'Bin Hoàng' },
      { id: 'photo-11', name: 'Tú Voi' },
      { id: 'photo-4', name: 'Thành Con' }
    ],
    videographer: null,
    individualPhotographer: null,
    phone: '',
    notes: 'Gói 650k/HS. Thợ chụp: DOANH BÉO, BIN, TÚ, THÀNH CON.'
  },
  {
    rawDate: '5.12',
    shootDate: '2026-12-05',
    className: '12A2',
    schoolName: 'THPT Lương Khánh Thiện',
    grade: 'Khối 12',
    studentCount: 23,
    concept: 'ĐEN VEST ĐEN',
    depositAmount: 2000000,
    unitPrice: 550000,
    totalAmount: 12650000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-2', name: 'Thành To' },
    assistantPhotographers: [
      { id: 'photo-1', name: 'Doanh Béo' }
    ],
    videographer: null,
    individualPhotographer: null,
    phone: '',
    notes: 'Concept: ĐEN VEST ĐEN. Thợ chụp: THÀNH, DOANH.'
  },
  {
    rawDate: '13.12',
    shootDate: '2026-12-13',
    className: 'A3',
    schoolName: 'THPT Quốc Tuấn',
    grade: 'Khối 12',
    studentCount: 38,
    concept: 'Kỷ yếu THPT',
    depositAmount: 1000000,
    unitPrice: 450000,
    totalAmount: 17100000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-1', name: 'Doanh Béo' },
    assistantPhotographers: [
      { id: 'photo-4', name: 'Thành Con' },
      { id: 'photo-3', name: 'Thắng' }
    ],
    videographer: null,
    individualPhotographer: null,
    phone: '',
    notes: 'Gói 450k/HS. Thợ chụp: DOANH, THÀNH, THẮNG.'
  },
  {
    rawDate: '20.12',
    shootDate: '2026-12-20',
    className: 'A2',
    schoolName: 'THPT Trần Hưng Đạo',
    grade: 'Khối 12',
    studentCount: 48,
    concept: 'NAM VEST ĐEN NỮ SƠ MI TRUNG CÀ VẠT ĐEN(SASH)',
    depositAmount: 1000000,
    unitPrice: 550000,
    totalAmount: 26400000,
    laborCost: 14000000,
    profit: 12400000,
    profitMargin: 47,
    leadPhotographer: { id: 'photo-32', name: 'Công Thành' },
    assistantPhotographers: [
      { id: 'photo-1', name: 'Doanh Béo' },
      { id: 'photo-4', name: 'Thành Con' }
    ],
    videographer: { id: 'photo-6', name: 'Thành An Quay' },
    individualPhotographer: null,
    phone: '0328380573',
    notes: 'Concept: NAM VEST ĐEN NỮ SƠ MI TRUNG CÀ VẠT ĐEN(SASH). Công thợ: 14.000.000đ, Lợi nhuận: 12.400.000đ (47%). Thợ chụp: CÔNG THÀNH, DOANH BÉO, THÀNH CON. Thợ quay: THÀNH AN QUAY. SĐT: 0328380573.'
  },
  {
    rawDate: '27.12',
    shootDate: '2026-12-27',
    className: '12',
    schoolName: 'THPT Tân Trào',
    grade: 'Khối 12',
    studentCount: 30,
    concept: 'VEST ĐEN CHÂN VÁY ĐEN',
    depositAmount: 1000000,
    unitPrice: 650000,
    totalAmount: 19500000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-32', name: 'Công Thành' },
    assistantPhotographers: [
      { id: 'photo-1', name: 'Doanh Béo' },
      { id: 'photo-4', name: 'Thành Con' }
    ],
    videographer: { id: 'photo-13', name: 'Hữu Long Quay' },
    individualPhotographer: null,
    phone: '',
    notes: 'Concept: VEST ĐEN CHÂN VÁY ĐEN. Thợ chụp: CÔNG THÀNH, DOANH BÉO, THÀNH CON. Thợ quay: HỮU LONG QUAY.'
  },
  {
    rawDate: '3.1',
    shootDate: '2027-01-03',
    className: 'A5',
    schoolName: 'THPT Thụy Hương',
    grade: 'Khối 12',
    studentCount: 42,
    concept: 'VÁY ĐEN VEST ĐEN(SASH)',
    depositAmount: 1000000,
    unitPrice: 650000,
    totalAmount: 27300000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-32', name: 'Công Thành' },
    assistantPhotographers: [
      { id: 'photo-1', name: 'Doanh Béo' },
      { id: 'photo-4', name: 'Thành Con' }
    ],
    videographer: { id: 'photo-7', name: 'Thắng Quay Phim' },
    individualPhotographer: { id: 'photo-17', name: 'Hoàng Nhân' },
    phone: '',
    notes: 'Concept: VÁY ĐEN VEST ĐEN(SASH). Thợ chụp: CÔNG THÀNH, DOANH BÉO, THÀNH CON. Thợ quay: THẮNG QUAY PHIM. Thợ cá nhân: HOÀNG NHÂN.'
  },
  {
    rawDate: '10.1',
    shootDate: '2027-01-10',
    className: 'A1',
    schoolName: 'THPT Kiến Thụy',
    grade: 'Khối 12',
    studentCount: 50,
    concept: 'PHOTOBOOTH(SASH)',
    depositAmount: 1000000,
    unitPrice: 450000,
    totalAmount: 22500000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-32', name: 'Công Thành' },
    assistantPhotographers: [
      { id: 'photo-3', name: 'Thắng' },
      { id: 'photo-4', name: 'Thành Con' },
      { id: 'photo-20', name: 'Doãn Hiểu (Sáng)' }
    ],
    videographer: { id: 'photo-photobooth', name: 'Sơn Photobooth' },
    individualPhotographer: { id: 'photo-24', name: 'Hổ Phách' },
    phone: '',
    notes: 'Concept: PHOTOBOOTH(SASH). Thợ chụp: CÔNG THÀNH, THẮNG, THÀNH CON, DOÃN HIỂU (SÁNG). Thợ quay: SƠN PHOTOBOOTH. Thợ cá nhân: HỔ PHÁCH.'
  },
  {
    rawDate: '31.1',
    shootDate: '2027-01-31',
    className: 'A7',
    schoolName: 'THPT Quốc Tuấn',
    grade: 'Khối 12',
    studentCount: 39,
    concept: 'CHÂN VÁY XÁM SƠ MI ÁO DÀI TAY BỒNG CỬ NHÂN QUỐC TẾ',
    depositAmount: 1000000,
    unitPrice: 450000,
    totalAmount: 17550000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-4', name: 'Thành Con' },
    assistantPhotographers: [
      { id: 'photo-2', name: 'Thành To' },
      { id: 'photo-1', name: 'Doanh Béo' }
    ],
    videographer: null,
    individualPhotographer: null,
    phone: '',
    notes: 'Concept: CHÂN VÁY XÁM SƠ MI ÁO DÀI TAY BỒNG CỬ NHÂN QUỐC TẾ. Thợ chụp: THÀNH CON, THÀNH TO, DOANH.'
  },
  {
    rawDate: '31.1',
    shootDate: '2027-01-31',
    className: 'A13',
    schoolName: 'THPT Lê Ích Mộc',
    grade: 'Khối 12',
    studentCount: 42,
    concept: 'VÁY ĐEN SƠ MI TRẮNG',
    depositAmount: 2000000,
    unitPrice: 550000,
    totalAmount: 23100000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-3', name: 'Thắng' },
    assistantPhotographers: [
      { id: 'photo-18', name: 'Bin Hoàng' },
      { id: 'photo-15', name: 'Lê Lâm Tùng' }
    ],
    videographer: null,
    individualPhotographer: null,
    phone: '',
    notes: 'Concept: VÁY ĐEN SƠ MI TRẮNG (3 chụp xe di chuyển). Thợ chụp: THẮNG, BIN, TÙNG.'
  },
  {
    rawDate: '14.2',
    shootDate: '2027-02-14',
    className: 'A2',
    schoolName: 'THPT Thụy Hương',
    grade: 'Khối 12',
    studentCount: 46,
    concept: 'VÁY ĐEN VEST ĐEN(SASH)',
    depositAmount: 1000000,
    unitPrice: 650000,
    totalAmount: 29900000,
    laborCost: 0,
    profit: 0,
    profitMargin: 0,
    leadPhotographer: { id: 'photo-32', name: 'Công Thành' },
    assistantPhotographers: [
      { id: 'photo-1', name: 'Doanh Béo' }
    ],
    videographer: { id: 'photo-7', name: 'Thắng Quay Phim' },
    individualPhotographer: null,
    phone: '',
    notes: 'Concept: VÁY ĐEN VEST ĐEN(SASH). Thợ chụp: CÔNG THÀNH, DOANH BÉO. Thợ quay: THẮNG QUAY.'
  }
];

// Helper tạo slug id an toàn
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// 3. Thực thi Insert vào SQLite Transaction
const insertCustomerStmt = db.prepare(`
  INSERT OR REPLACE INTO customers (
    id, name, phone, email, school_name, class_name, grade, academic_year,
    city, district, region, representative_role, student_count, service_type,
    service_package_id, service_package_name, concept, expected_shoot_date,
    shoot_date, expected_budget, total_amount, deposit_amount, paid_amount,
    remaining_amount, pipeline_stage, notes, created_by_name, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
`);

const insertBookingStmt = db.prepare(`
  INSERT OR REPLACE INTO bookings (
    id, code, customer_id, customer_name, school_name, class_name,
    title, shoot_date, start_time, end_time, location, city, district,
    student_count, concept, package_id, package_name, assignments_json,
    photographer_id, photographer_name, support_photographer_id,
    total_amount, deposit_amount, remaining_amount, payment_status,
    booking_status, deposit_paid, notes, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
`);

let insertedCount = 0;

runTransaction(() => {
  scheduleData.forEach((item, index) => {
    const custId = `cust-sched-${item.shootDate.replace(/-/g, '')}-${slugify(item.schoolName)}-${slugify(item.className)}`;
    const bookId = `bk-sched-${item.shootDate.replace(/-/g, '')}-${slugify(item.schoolName)}-${slugify(item.className)}`;
    const bookCode = `BK-${item.shootDate.slice(2).replace(/-/g, '')}-${item.className}`;
    const customerDisplayName = `Lớp ${item.className} - ${item.schoolName}`;

    const remaining = Math.max(0, item.totalAmount - item.depositAmount);
    const paymentStatus = item.depositAmount > 0 ? 'Đã cọc' : 'Chưa cọc';

    // 1. Chèn Khách hàng vào CRM
    insertCustomerStmt.run(
      custId,
      customerDisplayName,
      item.phone || '',
      '',
      item.schoolName,
      item.className,
      item.grade,
      '2026-2027',
      'Hải Phòng',
      'Hải Phòng',
      'Hải Phòng',
      'Ban cán sự lớp',
      item.studentCount,
      'Kỷ yếu Concept & Quay phim',
      `pkg-${item.unitPrice / 1000}k`,
      item.unitPrice > 0 ? `Gói Kỷ Yếu ${item.unitPrice / 1000}K/HS` : 'Gói Kỷ Yếu Tiêu Chuẩn',
      item.concept,
      item.shootDate,
      item.shootDate,
      item.totalAmount,
      item.totalAmount,
      item.depositAmount,
      item.depositAmount,
      remaining,
      'Đã cọc',
      item.notes,
      'Admin Tạ Duy'
    );

    // 2. Chèn Lịch Booking & Lịch Quay
    const assignments = {
      leadPhotographerId: item.leadPhotographer?.id || '',
      leadPhotographerName: item.leadPhotographer?.name || '',
      assistantPhotographerIds: item.assistantPhotographers.map(a => a.id),
      assistantNames: item.assistantPhotographers.map(a => a.name),
      videographerId: item.videographer?.id || '',
      videographerName: item.videographer?.name || '',
      individualPhotographerId: item.individualPhotographer?.id || '',
      individualPhotographerName: item.individualPhotographer?.name || '',
      laborCost: item.laborCost || 0,
      profit: item.profit || 0,
      profitMargin: item.profitMargin || 0
    };

    insertBookingStmt.run(
      bookId,
      bookCode,
      custId,
      customerDisplayName,
      item.schoolName,
      item.className,
      `Chụp & Quay Kỷ Yếu ${customerDisplayName}`,
      item.shootDate,
      '07:30',
      '17:30',
      `${item.schoolName}, Hải Phòng`,
      'Hải Phòng',
      'Hải Phòng',
      item.studentCount,
      item.concept,
      `pkg-${item.unitPrice / 1000}k`,
      item.unitPrice > 0 ? `Gói Chụp ${item.unitPrice / 1000}K/HS` : 'Gói Kỷ Yếu Tiêu Chuẩn',
      JSON.stringify(assignments),
      item.leadPhotographer?.id || '',
      item.leadPhotographer?.name || '',
      item.assistantPhotographers[0]?.id || '',
      item.totalAmount,
      item.depositAmount,
      remaining,
      paymentStatus,
      'Đã xác nhận',
      item.depositAmount > 0 ? 1 : 0,
      item.notes
    );

    insertedCount++;
    console.log(`✅ [${insertedCount}/12] Đã thêm: ${item.shootDate} | Lớp ${item.className} - ${item.schoolName} (${item.studentCount} HS) | Đã cọc: ${(item.depositAmount).toLocaleString('vi-VN')}đ | Thợ: ${item.leadPhotographer?.name} + ${item.assistantPhotographers.length} phụ`);
  });
});

console.log('====================================================');
console.log(`🎉 HOÀN THÀNH: Đã thêm thành công trọn vẹn ${insertedCount} lớp chụp & lịch quay vào CRM!`);
console.log('====================================================');
