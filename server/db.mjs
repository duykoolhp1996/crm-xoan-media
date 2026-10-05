import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục dữ liệu và sao lưu bền vững
const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUP_DIR = path.resolve(__dirname, 'backups', 'excel');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'crm_xoan_server.db');
const db = new DatabaseSync(DB_PATH);

// Tối ưu SQLite: Bật WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
`);

// Khởi tạo Schema các bảng cốt lõi
db.exec(`
  -- 1. BẢNG KHÁCH HÀNG (PRIMARY SOURCE)
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    school_name TEXT,
    class_name TEXT,
    province TEXT,
    lead_source TEXT,
    pipeline_stage TEXT DEFAULT 'lead',
    assigned_sales_id TEXT,
    assigned_sales_name TEXT,
    contract_value NUMERIC DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    shoot_date TEXT,
    notes TEXT,
    version INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. BẢNG LỊCH CHỤP (BOOKINGS)
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    title TEXT NOT NULL,
    shoot_date TEXT NOT NULL,
    shoot_time TEXT,
    location TEXT,
    concept TEXT,
    photographer_id TEXT,
    photographer_name TEXT,
    support_photographer_id TEXT,
    status TEXT DEFAULT 'confirmed',
    deposit_paid INTEGER DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    version INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. BẢNG THỢ CHỤP / EKIP
  CREATE TABLE IF NOT EXISTS photographers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    photographer_type TEXT,
    rating REAL DEFAULT 5.0,
    completed_shoots_count INTEGER DEFAULT 0,
    rate_per_shoot NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'available',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 4. BẢNG NHÂN SỰ SALES
  CREATE TABLE IF NOT EXISTS sales_staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role_title TEXT,
    commission_type TEXT DEFAULT 'percentage',
    commission_rate NUMERIC DEFAULT 0,
    commission_fixed_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 5. BẢNG HÀNG ĐỢI ĐỒNG BỘ (OUTBOX QUEUE - ĐẢM BẢO KHÔNG MẤT DỮ LIỆU)
  CREATE TABLE IF NOT EXISTS sync_outbox (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,       -- 'customer' | 'booking' | 'photographer' | 'sales_staff'
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,            -- 'UPSERT' | 'DELETE'
    payload_json TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    target_zone TEXT NOT NULL,       -- 'google_sheets' | 'supabase'
    status TEXT DEFAULT 'pending',   -- 'pending' | 'syncing' | 'completed' | 'failed'
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    next_retry_at TEXT,
    error_log TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_outbox_status_retry ON sync_outbox(status, next_retry_at);
  CREATE INDEX IF NOT EXISTS idx_outbox_idempotency ON sync_outbox(entity_type, entity_id, version, target_zone);

  -- 6. BẢNG LỊCH SỬ XUẤT EXCEL (.xlsx) HẰNG THÁNG
  CREATE TABLE IF NOT EXISTS excel_export_history (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER DEFAULT 0,
    export_type TEXT NOT NULL,       -- 'monthly_full_snapshot' | 'monthly_delta' | 'manual_admin'
    period_label TEXT,               -- '2026-10', '2026-09'...
    record_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'success',   -- 'success' | 'failed'
    error_message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- 7. BẢNG CẤU HÌNH HỆ THỐNG (APP SETTINGS)
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Thiết lập cấu hình mặc định nếu chưa có
const initSettings = () => {
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)
  `);
  insertSetting.run('primary_storage', 'server_sqlite');
  insertSetting.run('auto_excel_export_enabled', 'true');
  insertSetting.run('auto_excel_export_hour', '1'); // 01:00 AM
  insertSetting.run('auto_excel_export_type', 'full_and_delta');
  insertSetting.run('google_spreadsheet_id', '1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU');
};
initSettings();

// Tự động khởi tạo dữ liệu nhân sự Sales & Thợ Chụp nếu bảng chưa có dữ liệu
const initStaffAndPhotographers = () => {
  try {
    const salesCount = db.prepare('SELECT count(*) as c FROM sales_staff').get().c;
    if (salesCount === 0) {
      const insertSales = db.prepare(`
        INSERT OR REPLACE INTO sales_staff (id, name, phone, email, role_title, commission_type, commission_rate, commission_fixed_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const defaultSales = [
        ['user-2', 'Lê Hoàng Sơn', '0912345678', 'son.lh@xoanmedia.vn', 'Trưởng Nhóm Sales Lead', 'percentage', 10, 500000, 'active'],
        ['user-sales-1', 'Nguyễn Thu Hương', '0987654321', 'huong.nt@xoanmedia.vn', 'Chuyên viên Sales Tư Vấn', 'percentage', 8, 400000, 'active'],
        ['user-sales-2', 'Trần Hải Đăng', '0966554433', 'dang.th@xoanmedia.vn', 'Chuyên viên Sales Tư Vấn', 'percentage', 8, 400000, 'active'],
        ['user-sales-3', 'Vũ Mai Phương', '0911223344', 'phuong.vm@xoanmedia.vn', 'Cộng Tác Viên (CTV) Sales', 'fixed', 5, 300000, 'active']
      ];
      for (const s of defaultSales) {
        insertSales.run(...s);
      }
    }

    const photoCount = db.prepare('SELECT count(*) as c FROM photographers').get().c;
    if (photoCount === 0) {
      const photosPath = path.resolve(__dirname, '..', 'src', 'data', 'photographersData.json');
      if (fs.existsSync(photosPath)) {
        const photos = JSON.parse(fs.readFileSync(photosPath, 'utf-8'));
        const insertPhoto = db.prepare(`
          INSERT OR REPLACE INTO photographers (id, name, phone, email, role_type, tier, rating, status, province, equipment)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of photos) {
          insertPhoto.run(
            p.id,
            p.fullName || '',
            p.phone || '',
            p.email || '',
            p.skills ? p.skills.join(', ') : 'Thợ chính',
            p.photographerType || 'Full-time',
            p.rating || 5.0,
            p.status || 'sẵn sàng',
            p.activeRegions ? p.activeRegions.join(', ') : '',
            p.equipmentList ? p.equipmentList.join(', ') : ''
          );
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi seed dữ liệu nhân sự trên server:', e.message);
  }
};
initStaffAndPhotographers();

export { db, DATA_DIR, BACKUP_DIR, DB_PATH };
