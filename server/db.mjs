import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Thư mục dữ liệu và sao lưu bền vững
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(__dirname, 'backups', 'excel');
const DB_BACKUP_DIR = process.env.DB_BACKUP_DIR || path.resolve(__dirname, 'backups', 'db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
if (!fs.existsSync(DB_BACKUP_DIR)) {
  fs.mkdirSync(DB_BACKUP_DIR, { recursive: true });
}

// Đường dẫn file SQLite Database Persistent
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'crm_xoan_server.db');

// Khởi tạo Database Connection duy nhất (Persistent Connection Pool)
const db = new DatabaseSync(DB_PATH);

// Tối ưu SQLite: Bật WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
`);

// 2. PRODUCTION SAFETY LOCK
export const verifyProductionSafety = (sqlStatement) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDestructive = process.env.ALLOW_DESTRUCTIVE_DATABASE_OPERATION === 'true';

  if (isProduction && !allowDestructive) {
    const upper = sqlStatement.toUpperCase();
    if (upper.includes('DROP TABLE') || upper.includes('DROP DATABASE') || upper.includes('TRUNCATE')) {
      throw new Error('⛔ PRODUCTION SAFETY LOCK: Thao tác phá hủy database bị chặn trên môi trường Production! Đặt ALLOW_DESTRUCTIVE_DATABASE_OPERATION=true nếu muốn thực hiện.');
    }
  }
};

// 3. TRANSACTION RUNNER
export const runTransaction = (fn) => {
  db.exec('BEGIN TRANSACTION');
  try {
    const result = fn(db);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

// 4. BẢNG QUẢN LÝ MIGRATIONS
db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    version INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// 5. MIGRATION SYSTEM (ZERO-DATA-LOSS)
const runSafeMigrations = () => {
  const existingMigrations = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map(r => r.version)
  );

  // Helper kiểm tra cột đã tồn tại chưa
  const getTableColumns = (tableName) => {
    try {
      return db.prepare(`PRAGMA table_info(${tableName})`).all().map(c => c.name);
    } catch {
      return [];
    }
  };

  // Helper thêm cột an toàn nếu chưa có
  const addColumnIfNotExists = (tableName, columnName, columnType) => {
    const columns = getTableColumns(tableName);
    if (!columns.includes(columnName)) {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      console.log(`[Migration] ➕ Đã thêm cột ${tableName}.${columnName} (${columnType})`);
    }
  };

  // Migration 1: Khởi tạo các bảng gốc (nếu chưa có)
  if (!existingMigrations.has(1)) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        school_name TEXT,
        class_name TEXT,
        province TEXT,
        lead_source TEXT,
        pipeline_stage TEXT DEFAULT 'New Lead',
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

      CREATE TABLE IF NOT EXISTS sync_outbox (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        target_zone TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 5,
        next_retry_at TEXT,
        error_log TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS excel_export_history (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size_bytes INTEGER DEFAULT 0,
        export_type TEXT NOT NULL,
        period_label TEXT,
        record_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'success',
        error_message TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
      .run('mig-1', 1, 'initial_base_tables');
  }

  // Migration 2: Bảng Audit Logs
  if (!existingMigrations.has(2)) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        old_data TEXT,
        new_data TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    `);

    db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
      .run('mig-2', 2, 'create_audit_logs');
  }

  // Migration 3: Mở rộng trường Customer đầy đủ & Soft Delete
  if (!existingMigrations.has(3)) {
    addColumnIfNotExists('customers', 'facebook', 'TEXT');
    addColumnIfNotExists('customers', 'tiktok', 'TEXT');
    addColumnIfNotExists('customers', 'zalo', 'TEXT');
    addColumnIfNotExists('customers', 'school_id', 'TEXT');
    addColumnIfNotExists('customers', 'grade', 'TEXT');
    addColumnIfNotExists('customers', 'academic_year', 'TEXT');
    addColumnIfNotExists('customers', 'region', 'TEXT');
    addColumnIfNotExists('customers', 'city', 'TEXT');
    addColumnIfNotExists('customers', 'district', 'TEXT');
    addColumnIfNotExists('customers', 'representative_role', 'TEXT');
    addColumnIfNotExists('customers', 'student_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('customers', 'service_type', 'TEXT');
    addColumnIfNotExists('customers', 'service_package_id', 'TEXT');
    addColumnIfNotExists('customers', 'service_package_name', 'TEXT');
    addColumnIfNotExists('customers', 'concept', 'TEXT');
    addColumnIfNotExists('customers', 'expected_shoot_date', 'TEXT');
    addColumnIfNotExists('customers', 'shooting_locations', 'TEXT');
    addColumnIfNotExists('customers', 'expected_budget', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'special_requests', 'TEXT');
    addColumnIfNotExists('customers', 'raw_drive_url', 'TEXT');
    addColumnIfNotExists('customers', 'drive_url', 'TEXT');
    addColumnIfNotExists('customers', 'photo_notes', 'TEXT');
    addColumnIfNotExists('customers', 'shot_date', 'TEXT');
    addColumnIfNotExists('customers', 'photo_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('customers', 'campaign_name', 'TEXT');
    addColumnIfNotExists('customers', 'utm_json', 'TEXT');
    addColumnIfNotExists('customers', 'assigned_care_staff_id', 'TEXT');
    addColumnIfNotExists('customers', 'assigned_care_staff_name', 'TEXT');
    addColumnIfNotExists('customers', 'created_by_id', 'TEXT');
    addColumnIfNotExists('customers', 'created_by_name', 'TEXT');
    addColumnIfNotExists('customers', 'total_revenue', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'paid_amount', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'last_contacted_at', 'TEXT');
    addColumnIfNotExists('customers', 'deleted_at', 'TEXT');
    addColumnIfNotExists('customers', 'deleted_by', 'TEXT');

    db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
      .run('mig-3', 3, 'expand_customer_fields_and_soft_delete');
  }

  // Migration 4: Mở rộng trường Booking đầy đủ & Soft Delete
  if (!existingMigrations.has(4)) {
    addColumnIfNotExists('bookings', 'code', 'TEXT');
    addColumnIfNotExists('bookings', 'customer_name', 'TEXT');
    addColumnIfNotExists('bookings', 'school_name', 'TEXT');
    addColumnIfNotExists('bookings', 'class_name', 'TEXT');
    addColumnIfNotExists('bookings', 'start_time', 'TEXT');
    addColumnIfNotExists('bookings', 'end_time', 'TEXT');
    addColumnIfNotExists('bookings', 'city', 'TEXT');
    addColumnIfNotExists('bookings', 'district', 'TEXT');
    addColumnIfNotExists('bookings', 'student_count', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('bookings', 'package_id', 'TEXT');
    addColumnIfNotExists('bookings', 'package_name', 'TEXT');
    addColumnIfNotExists('bookings', 'assignments_json', 'TEXT');
    addColumnIfNotExists('bookings', 'deposit_amount', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('bookings', 'remaining_amount', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('bookings', 'payment_status', "TEXT DEFAULT 'Chưa cọc'");
    addColumnIfNotExists('bookings', 'booking_status', "TEXT DEFAULT 'Chờ xác nhận'");
    addColumnIfNotExists('bookings', 'notes', 'TEXT');
    addColumnIfNotExists('bookings', 'deleted_at', 'TEXT');
    addColumnIfNotExists('bookings', 'deleted_by', 'TEXT');

    db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
      .run('mig-4', 4, 'expand_booking_fields_and_soft_delete');
  }

  // Migration 5: Chuẩn hóa 10 Stage Pipeline, bộ tính giá tự động & Lead Stage History
  if (!existingMigrations.has(5)) {
    // 1. Thêm các cột tài chính & nghiệp vụ chi tiết cho Lead/Customer
    addColumnIfNotExists('customers', 'unit_price', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'subtotal', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'extra_fee', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'discount', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'total_amount', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'remaining_amount', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('customers', 'deposit_date', 'TEXT');
    addColumnIfNotExists('customers', 'payment_method', 'TEXT');
    addColumnIfNotExists('customers', 'shoot_time', 'TEXT');
    addColumnIfNotExists('customers', 'shoot_address', 'TEXT');
    addColumnIfNotExists('customers', 'editor_name', 'TEXT');
    addColumnIfNotExists('customers', 'edit_deadline', 'TEXT');
    addColumnIfNotExists('customers', 'edit_progress', 'INTEGER DEFAULT 0');
    addColumnIfNotExists('customers', 'delivered_date', 'TEXT');
    addColumnIfNotExists('customers', 'delivered_drive_url', 'TEXT');
    addColumnIfNotExists('customers', 'delivery_method', 'TEXT');
    addColumnIfNotExists('customers', 'lost_reason', 'TEXT');
    addColumnIfNotExists('customers', 'lost_note', 'TEXT');
    addColumnIfNotExists('customers', 'delete_reason', 'TEXT');

    // 2. Tạo bảng lưu trữ lịch sử thay đổi giai đoạn Lead (lead_stage_history)
    db.exec(`
      CREATE TABLE IF NOT EXISTS lead_stage_history (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL,
        from_stage TEXT,
        to_stage TEXT NOT NULL,
        changed_by TEXT,
        changed_by_id TEXT,
        changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        note TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_stage_hist_lead ON lead_stage_history(lead_id);
      CREATE INDEX IF NOT EXISTS idx_stage_hist_date ON lead_stage_history(changed_at);
    `);

    // 3. Chuẩn hóa an toàn dữ liệu stage cũ sang 10 stage mới (Không mất dữ liệu)
    db.exec(`
      UPDATE customers SET pipeline_stage = 'New Lead' WHERE pipeline_stage IN ('Đã liên hệ', 'Chăm sóc lại');
      UPDATE customers SET pipeline_stage = 'Đã gửi báo giá' WHERE pipeline_stage = 'Đang thương lượng';
      UPDATE customers SET pipeline_stage = 'Đã cọc' WHERE pipeline_stage = 'Đã đặt cọc';
      UPDATE customers SET pipeline_stage = 'Book ngày' WHERE pipeline_stage = 'Đã Booking';
      UPDATE customers SET pipeline_stage = 'Giao ảnh' WHERE pipeline_stage = 'Đã bàn giao';

      -- Đồng bộ giá trị tài chính ban đầu cho các bản ghi cũ
      UPDATE customers 
      SET 
        total_amount = COALESCE(NULLIF(total_revenue, 0), NULLIF(contract_value, 0), expected_budget, 0),
        remaining_amount = MAX(0, COALESCE(NULLIF(total_revenue, 0), NULLIF(contract_value, 0), expected_budget, 0) - COALESCE(paid_amount, deposit_amount, 0))
      WHERE total_amount = 0 OR total_amount IS NULL;
    `);

    db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
      .run('mig-5', 5, 'lead_pipeline_pricing_and_stage_history');
    console.log('[Migration] ✅ Đã hoàn tất Migration 5: Chuẩn hóa 10 stage & bộ tính giá tự động');
  }

  // Migration 6: Mở rộng trường Thùy lao / Lương thưởng Thợ & Quản lý Tài khoản Sales
  if (!existingMigrations.has(6)) {
    // 1. Thêm các cột thùy lao, lương thưởng, tài khoản cho photographers
    addColumnIfNotExists('photographers', 'salary_type', "TEXT DEFAULT 'per_shoot'");
    addColumnIfNotExists('photographers', 'monthly_salary', 'NUMERIC DEFAULT 0');
    addColumnIfNotExists('photographers', 'skills_json', "TEXT DEFAULT '[]'");
    addColumnIfNotExists('photographers', 'active_regions_json', "TEXT DEFAULT '[]'");
    addColumnIfNotExists('photographers', 'equipment_list_json', "TEXT DEFAULT '[]'");
    addColumnIfNotExists('photographers', 'avatar', "TEXT DEFAULT ''");
    addColumnIfNotExists('photographers', 'experience_years', 'INTEGER DEFAULT 1');
    addColumnIfNotExists('photographers', 'notes', "TEXT DEFAULT ''");
    addColumnIfNotExists('photographers', 'username', "TEXT DEFAULT ''");
    addColumnIfNotExists('photographers', 'password', "TEXT DEFAULT ''");
    addColumnIfNotExists('photographers', 'can_login', 'INTEGER DEFAULT 1');
    addColumnIfNotExists('photographers', 'updated_at', 'TEXT');

    // 2. Thêm các cột tài khoản, avatar, khu vực cho sales_staff
    addColumnIfNotExists('sales_staff', 'username', "TEXT DEFAULT ''");
    addColumnIfNotExists('sales_staff', 'password', "TEXT DEFAULT ''");
    addColumnIfNotExists('sales_staff', 'can_login', 'INTEGER DEFAULT 1');
    addColumnIfNotExists('sales_staff', 'avatar', "TEXT DEFAULT ''");
    addColumnIfNotExists('sales_staff', 'active_regions_json', "TEXT DEFAULT '[]'");
    addColumnIfNotExists('sales_staff', 'updated_at', 'TEXT');

    // 3. Chuẩn hóa & điền dữ liệu mặc định từ file cấu hình nếu các cột mới đang trống
    try {
      const photosPath = path.resolve(__dirname, '..', 'src', 'data', 'photographersData.json');
      if (fs.existsSync(photosPath)) {
        const photos = JSON.parse(fs.readFileSync(photosPath, 'utf-8'));
        const updatePhoto = db.prepare(`
          UPDATE photographers
          SET 
            salary_type = COALESCE(NULLIF(salary_type, ''), ?),
            monthly_salary = CASE WHEN monthly_salary = 0 THEN ? ELSE monthly_salary END,
            rate_per_shoot = CASE WHEN rate_per_shoot = 0 THEN ? ELSE rate_per_shoot END,
            skills_json = CASE WHEN skills_json = '[]' OR skills_json IS NULL THEN ? ELSE skills_json END,
            active_regions_json = CASE WHEN active_regions_json = '[]' OR active_regions_json IS NULL THEN ? ELSE active_regions_json END,
            equipment_list_json = CASE WHEN equipment_list_json = '[]' OR equipment_list_json IS NULL THEN ? ELSE equipment_list_json END,
            avatar = CASE WHEN avatar = '' OR avatar IS NULL THEN ? ELSE avatar END,
            experience_years = CASE WHEN experience_years = 1 THEN ? ELSE experience_years END,
            notes = CASE WHEN notes = '' OR notes IS NULL THEN ? ELSE notes END,
            username = CASE WHEN username = '' OR username IS NULL THEN ? ELSE username END,
            password = CASE WHEN password = '' OR password IS NULL THEN ? ELSE password END,
            can_login = 1
          WHERE id = ?
        `);

        for (const p of photos) {
          updatePhoto.run(
            p.salaryType || 'per_shoot',
            p.monthlySalary || 0,
            p.ratePerShoot || 1000000,
            JSON.stringify(p.skills || ['Chụp chính']),
            JSON.stringify(p.activeRegions || ['Hải Phòng']),
            JSON.stringify(p.equipmentList || []),
            p.avatar || '',
            p.experienceYears || 1,
            p.notes || '',
            p.username || '',
            p.password || '',
            p.id
          );
        }
      }

      // Chuẩn hóa Sales Staff
      const updateSales = db.prepare(`
        UPDATE sales_staff
        SET
          username = CASE WHEN username = '' OR username IS NULL THEN ? ELSE username END,
          password = CASE WHEN password = '' OR password IS NULL THEN ? ELSE password END,
          avatar = CASE WHEN avatar = '' OR avatar IS NULL THEN ? ELSE avatar END,
          active_regions_json = CASE WHEN active_regions_json = '[]' OR active_regions_json IS NULL THEN ? ELSE active_regions_json END,
          can_login = 1
        WHERE id = ?
      `);
      updateSales.run('son.lh@xoanmedia.vn', 'SonLead@2024', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', JSON.stringify(['Hải Phòng', 'Hà Nội']), 'user-2');
      updateSales.run('huong.nt@xoanmedia.vn', 'HuongSales@2024', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', JSON.stringify(['Hải Phòng', 'Hà Nội']), 'user-sales-1');
      updateSales.run('dang.th@xoanmedia.vn', 'DangSales@2024', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', JSON.stringify(['Hải Phòng']), 'user-sales-2');
      updateSales.run('phuong.vm@xoanmedia.vn', 'PhuongSales@2024', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', JSON.stringify(['Hải Phòng']), 'user-sales-3');
    } catch (enrichErr) {
      console.warn('[Migration 6] Điền dữ liệu mặc định bổ sung:', enrichErr.message);
    }

    db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
      .run('mig-6', 6, 'expand_photographer_and_sales_salary_and_account_fields');
    console.log('[Migration] ✅ Đã hoàn tất Migration 6: Mở rộng thùy lao/lương thưởng thợ & tài khoản Sales');
  }

  // Migration 7: Chuẩn hóa tên giai đoạn Pipeline (Đã đặt cọc -> Đã cọc, Đã Booking -> Book ngày, Đã bàn giao -> Giao ảnh)
  if (!existingMigrations.has(7)) {
    try {
      db.prepare(`
        UPDATE customers 
        SET pipeline_stage = 'Đã cọc' 
        WHERE pipeline_stage = 'Đã đặt cọc'
      `).run();

      db.prepare(`
        UPDATE customers 
        SET pipeline_stage = 'Book ngày' 
        WHERE pipeline_stage = 'Đã Booking'
      `).run();

      db.prepare(`
        UPDATE customers 
        SET pipeline_stage = 'Giao ảnh' 
        WHERE pipeline_stage = 'Đã bàn giao'
      `).run();

      db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
        .run('mig-7', 7, 'standardize_legacy_pipeline_stages');
      console.log('[Migration] ✅ Đã hoàn tất Migration 7: Chuẩn hóa tên giai đoạn Pipeline (Đã cọc, Book ngày, Giao ảnh)');
    } catch (mig7Err) {
      console.warn('[Migration 7] Lỗi chuẩn hóa stage:', mig7Err.message);
    }
  }

  // Migration 8: Bảng Notifications lưu trữ thông báo bền vững & đồng bộ đa thiết bị (iOS, Android, PC)
  if (!existingMigrations.has(8)) {
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          booking_id TEXT,
          customer_id TEXT,
          target_user_id TEXT,
          target_role TEXT,
          severity TEXT DEFAULT 'info',
          timestamp TEXT NOT NULL,
          read INTEGER DEFAULT 0,
          metadata_json TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
        CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
      `);

      // Seed sẵn thông báo cập nhật v1.2.7 và thông báo mẫu cho các tài khoản
      const insertNotif = db.prepare(`
        INSERT OR IGNORE INTO notifications (id, type, title, message, customer_id, target_user_id, target_role, severity, timestamp, read)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertNotif.run(
        'notif-system-v127',
        'system',
        '🚀 CRM XOĂN MEDIA CẬP NHẬT PHIÊN BẢN V1.2.7',
        'Hệ thống đã nâng cấp phiên bản v1.2.7 thành công: Tối ưu hiển thị cho thiết bị di động, cá nhân hóa thông báo trúng đích theo từng tài khoản (Lead mới cho Sales & Admin, Lịch chụp cho Photographer).',
        null,
        null,
        'all',
        'info',
        new Date().toISOString(),
        0
      );

      insertNotif.run(
        'notif-admin-1',
        'new_lead',
        '🌟 LEAD MỚI TIẾP NHẬN: Cô Giá',
        'Khách hàng Cô Giá (12A3 - THPT Marie Curie Hải Phòng) từ kênh Facebook Ads đã được tiếp nhận vào Pipeline.',
        'cust-1',
        null,
        'admin',
        'info',
        new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        0
      );

      insertNotif.run(
        'notif-sales-son-1',
        'new_lead',
        '🎯 BẠN CÓ LEAD MỚI PHỤ TRÁCH',
        'Bạn được phân công chăm sóc Lead: Cô Giá (12A3 - THPT Marie Curie Hải Phòng). Hãy liên hệ tư vấn sớm!',
        'cust-1',
        'user-2',
        'sales',
        'info',
        new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        0
      );

      insertNotif.run(
        'notif-photo-long-1',
        'shoot_assigned',
        '📸 CA CHỤP MỚI ĐƯỢC PHÂN CÔNG (Trưởng nháy)',
        'Bạn được phân công làm Trưởng nháy cho ca chụp: Lớp 12A3 THPT Marie Curie vào ngày 28/10/2026 tại Hải Phòng. Vui lòng kiểm tra thiết bị!',
        'cust-1',
        'photo-1',
        'photographer',
        'info',
        new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        0
      );

      db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
        .run('mig-8', 8, 'persistent_notifications_table_and_sync');
      console.log('[Migration] ✅ Đã hoàn tất Migration 8: Bảng notifications lưu trữ bền vững & đồng bộ đa thiết bị');
    } catch (mig8Err) {
      console.warn('[Migration 8] Lỗi tạo bảng notifications:', mig8Err.message);
    }
  }

  // Migration 9: Phân quyền Sales Lead và Cấp Dưới (leader_id, leader_name)
  if (!existingMigrations.has(9)) {
    try {
      addColumnIfNotExists('sales_staff', 'leader_id', "TEXT DEFAULT ''");
      addColumnIfNotExists('sales_staff', 'leader_name', "TEXT DEFAULT ''");

      // Gán Lê Hoàng Sơn (user-2) làm leader mặc định cho nhân sự Sales cấp dưới nếu chưa có
      db.prepare(`
        UPDATE sales_staff
        SET leader_id = 'user-2', leader_name = 'Lê Hoàng Sơn'
        WHERE id != 'user-2' AND (leader_id IS NULL OR leader_id = '')
      `).run();

      db.prepare('INSERT INTO schema_migrations (id, version, name) VALUES (?, ?, ?)')
        .run('mig-9', 9, 'sales_lead_hierarchy_leader_id_and_leader_name');
      console.log('[Migration] ✅ Đã hoàn tất Migration 9: Phân quyền Sales Lead và Cấp Dưới (leader_id, leader_name)');
    } catch (mig9Err) {
      console.warn('[Migration 9] Lỗi phân quyền Sales Lead:', mig9Err.message);
    }
  }
};

runSafeMigrations();

// 6. GHI NHẬN AUDIT LOG
export const logAudit = ({
  userId = 'system',
  userName = 'Hệ thống',
  action,
  tableName,
  recordId,
  oldData = null,
  newData = null,
  ipAddress = ''
}) => {
  try {
    const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, action, table_name, record_id, old_data, new_data, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      id,
      userId,
      userName,
      action,
      tableName,
      recordId,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
      ipAddress
    );
  } catch (err) {
    console.warn('[Audit] Ghi nhận log thất bại:', err.message);
  }
};

// 7. THIẾT LẬP CẤU HÌNH BAN ĐẦU
const initSettings = () => {
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)
  `);
  insertSetting.run('primary_storage', 'server_sqlite');
  insertSetting.run('auto_excel_export_enabled', 'true');
  insertSetting.run('auto_excel_export_hour', '1');
  insertSetting.run('auto_excel_export_type', 'full_and_delta');
  insertSetting.run('google_spreadsheet_id', '1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU');
};
initSettings();

// 8. TỰ ĐỘNG SEED NHÂN SỰ NẾU BẢNG HOÀN TOÀN TRỐNG (Chỉ chạy 1 lần khi khởi tạo DB mới tinh)
const initStaffAndPhotographers = () => {
  try {
    const salesCount = db.prepare('SELECT count(*) as c FROM sales_staff').get().c;
    if (salesCount === 0) {
      const insertSales = db.prepare(`
        INSERT OR IGNORE INTO sales_staff (id, name, phone, email, role_title, commission_type, commission_rate, commission_fixed_amount, status)
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
          INSERT OR IGNORE INTO photographers (id, full_name, phone, email, photographer_type, rating, completed_shoots_count, rate_per_shoot, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of photos) {
          insertPhoto.run(
            p.id,
            p.fullName || '',
            p.phone || '',
            p.email || '',
            p.photographerType || 'Full-time',
            p.rating || 5.0,
            p.completedShootsCount || 0,
            p.ratePerShoot || 1000000,
            p.status || 'available'
          );
        }
      }
    }
  } catch (e) {
    console.warn('[Staff] Khởi tạo nhân sự mặc định:', e.message);
  }
};
initStaffAndPhotographers();

export { db, DATA_DIR, BACKUP_DIR, DB_BACKUP_DIR, DB_PATH };
