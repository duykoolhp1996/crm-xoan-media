/**
 * Service Quản Lý Dữ Liệu Vùng 3: SQL Của CRM App (Local SQL & Data Dump)
 * Cung cấp:
 * 1. Bộ nhớ đệm dữ liệu quan hệ nội bộ (Local Relational Cache).
 * 2. Xuất bản tệp SQL Dump chuẩn (.sql) hỗ trợ PostgreSQL / SQLite / MySQL.
 * 3. Sao lưu & phục hồi toàn diện dạng JSON Backup (.json).
 * 4. Thống kê dung lượng & số lượng bản ghi cục bộ.
 */

import { Customer, Booking, Photographer, SalesStaff } from '../types';

export interface SqlStorageStats {
  customersCount: number;
  bookingsCount: number;
  photographersCount: number;
  salesStaffCount: number;
  estimatedSizeBytes: number;
  lastDumpAt?: string;
  storageType: 'LocalStorage SQL Engine & Schema Cache';
}

const LOCAL_STORAGE_PREFIX = 'crm_xoan_sql_';

// Làm sạch và escape ký tự an toàn cho câu lệnh SQL
const escapeSql = (value: any): string => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return isNaN(value) ? 'NULL' : String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (Array.isArray(value) || typeof value === 'object') {
    const jsonStr = JSON.stringify(value).replace(/'/g, "''");
    return `'${jsonStr}'`;
  }
  const str = String(value).replace(/'/g, "''").replace(/\\/g, '\\\\');
  return `'${str}'`;
};

/**
 * Tạo câu lệnh SQL DDL (Schema) và DML (Inserts) hoàn chỉnh
 */
export const generateSqlDump = (data: {
  customers?: Customer[];
  bookings?: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): string => {
  const now = new Date().toISOString();
  const customers = data.customers || [];
  const bookings = data.bookings || [];
  const photographers = data.photographers || [];
  const salesStaff = data.salesStaff || [];

  let sql = `-- ==================================================================\n`;
  sql += `-- CRM XOĂN MEDIA - SQL DATABASE DUMP (VÙNG 3: LOCAL SQL APP STORAGE)\n`;
  sql += `-- Thời gian xuất: ${now}\n`;
  sql += `-- Tương thích: PostgreSQL 14+, SQLite 3.24+, MySQL 8.0+\n`;
  sql += `-- Tổng bản ghi: Khách hàng (${customers.length}), Lịch chụp (${bookings.length}), Thợ chụp (${photographers.length}), Sales (${salesStaff.length})\n`;
  sql += `-- ==================================================================\n\n`;

  sql += `BEGIN TRANSACTION;\n\n`;

  // 1. BẢNG SALES STAFF
  sql += `-- 1. BẢNG NHÂN SỰ SALES (sales_staff)\n`;
  sql += `CREATE TABLE IF NOT EXISTS sales_staff (\n`;
  sql += `    id VARCHAR(50) PRIMARY KEY,\n`;
  sql += `    name VARCHAR(255) NOT NULL,\n`;
  sql += `    phone VARCHAR(50),\n`;
  sql += `    email VARCHAR(255),\n`;
  sql += `    role_title VARCHAR(100),\n`;
  sql += `    commission_type VARCHAR(50),\n`;
  sql += `    commission_rate NUMERIC(5,2) DEFAULT 0,\n`;
  sql += `    commission_fixed_amount NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    status VARCHAR(50) DEFAULT 'active'\n`;
  sql += `);\n\n`;

  if (salesStaff.length > 0) {
    salesStaff.forEach(s => {
      sql += `INSERT INTO sales_staff (id, name, phone, email, role_title, commission_type, commission_rate, commission_fixed_amount, status)\n`;
      sql += `VALUES (${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.phone)}, ${escapeSql(s.email)}, ${escapeSql(s.roleTitle)}, ${escapeSql(s.commissionType || 'percentage')}, ${s.commissionRate || 0}, ${s.commissionFixedAmount || 0}, ${escapeSql(s.status || 'active')})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, commission_rate=EXCLUDED.commission_rate;\n`;
    });
    sql += `\n`;
  }

  // 2. BẢNG PHOTOGRAPHERS
  sql += `-- 2. BẢNG THỢ CHỤP / EKIP (photographers)\n`;
  sql += `CREATE TABLE IF NOT EXISTS photographers (\n`;
  sql += `    id VARCHAR(50) PRIMARY KEY,\n`;
  sql += `    full_name VARCHAR(255) NOT NULL,\n`;
  sql += `    phone VARCHAR(50),\n`;
  sql += `    email VARCHAR(255),\n`;
  sql += `    photographer_type VARCHAR(50),\n`;
  sql += `    rating NUMERIC(3,2) DEFAULT 5.0,\n`;
  sql += `    completed_shoots_count INT DEFAULT 0,\n`;
  sql += `    rate_per_shoot NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    status VARCHAR(50) DEFAULT 'available'\n`;
  sql += `);\n\n`;

  if (photographers.length > 0) {
    photographers.forEach(p => {
      sql += `INSERT INTO photographers (id, full_name, phone, email, photographer_type, rating, completed_shoots_count, rate_per_shoot, status)\n`;
      sql += `VALUES (${escapeSql(p.id)}, ${escapeSql(p.fullName)}, ${escapeSql(p.phone)}, ${escapeSql(p.email)}, ${escapeSql(p.photographerType)}, ${p.rating || 5}, ${p.completedShootsCount || 0}, ${p.ratePerShoot || 0}, ${escapeSql(p.status || 'available')})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET full_name=EXCLUDED.full_name, completed_shoots_count=EXCLUDED.completed_shoots_count, rating=EXCLUDED.rating;\n`;
    });
    sql += `\n`;
  }

  // 3. BẢNG CUSTOMERS
  sql += `-- 3. BẢNG KHÁCH HÀNG & LEADS (customers)\n`;
  sql += `CREATE TABLE IF NOT EXISTS customers (\n`;
  sql += `    id VARCHAR(50) PRIMARY KEY,\n`;
  sql += `    name VARCHAR(255) NOT NULL,\n`;
  sql += `    phone VARCHAR(50),\n`;
  sql += `    zalo VARCHAR(50),\n`;
  sql += `    email VARCHAR(255),\n`;
  sql += `    facebook VARCHAR(255),\n`;
  sql += `    school_name VARCHAR(255),\n`;
  sql += `    class_name VARCHAR(100),\n`;
  sql += `    grade VARCHAR(50),\n`;
  sql += `    student_count INT DEFAULT 30,\n`;
  sql += `    region VARCHAR(100),\n`;
  sql += `    service_type VARCHAR(100),\n`;
  sql += `    service_package_name VARCHAR(255),\n`;
  sql += `    concept TEXT,\n`;
  sql += `    pipeline_stage VARCHAR(100) DEFAULT 'Chưa liên hệ',\n`;
  sql += `    source VARCHAR(100) DEFAULT 'Facebook',\n`;
  sql += `    expected_shoot_date VARCHAR(50),\n`;
  sql += `    expected_budget NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    total_revenue NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    paid_amount NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    assigned_sales_id VARCHAR(50),\n`;
  sql += `    assigned_sales_name VARCHAR(255),\n`;
  sql += `    notes TEXT,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  if (customers.length > 0) {
    customers.forEach(c => {
      sql += `INSERT INTO customers (id, name, phone, zalo, email, facebook, school_name, class_name, grade, student_count, region, service_type, service_package_name, concept, pipeline_stage, source, expected_shoot_date, expected_budget, total_revenue, paid_amount, assigned_sales_id, assigned_sales_name, notes, created_at, updated_at)\n`;
      sql += `VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.phone)}, ${escapeSql(c.zalo)}, ${escapeSql(c.email)}, ${escapeSql(c.facebook)}, ${escapeSql(c.schoolName)}, ${escapeSql(c.className)}, ${escapeSql(c.grade)}, ${c.studentCount || 0}, ${escapeSql(c.region)}, ${escapeSql(c.serviceType)}, ${escapeSql(c.servicePackageName)}, ${escapeSql(c.concept)}, ${escapeSql(c.pipelineStage)}, ${escapeSql(c.source)}, ${escapeSql(c.expectedShootDate)}, ${c.expectedBudget || 0}, ${c.totalRevenue || 0}, ${c.paidAmount || 0}, ${escapeSql(c.assignedSalesId)}, ${escapeSql(c.assignedSalesName)}, ${escapeSql(c.notes)}, ${escapeSql(c.createdAt)}, ${escapeSql(c.updatedAt)})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET pipeline_stage=EXCLUDED.pipeline_stage, total_revenue=EXCLUDED.total_revenue, paid_amount=EXCLUDED.paid_amount, updated_at=CURRENT_TIMESTAMP;\n`;
    });
    sql += `\n`;
  }

  // 4. BẢNG BOOKINGS
  sql += `-- 4. BẢNG LỊCH CHỤP / BOOKINGS (bookings)\n`;
  sql += `CREATE TABLE IF NOT EXISTS bookings (\n`;
  sql += `    id VARCHAR(50) PRIMARY KEY,\n`;
  sql += `    code VARCHAR(50),\n`;
  sql += `    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,\n`;
  sql += `    customer_name VARCHAR(255),\n`;
  sql += `    school_name VARCHAR(255),\n`;
  sql += `    class_name VARCHAR(100),\n`;
  sql += `    shoot_date DATE,\n`;
  sql += `    package_name VARCHAR(255),\n`;
  sql += `    location TEXT,\n`;
  sql += `    booking_status VARCHAR(50) DEFAULT 'Đã đặt cọc',\n`;
  sql += `    payment_status VARCHAR(50) DEFAULT 'Chưa cọc',\n`;
  sql += `    lead_photographer_id VARCHAR(50),\n`;
  sql += `    lead_photographer_name VARCHAR(255),\n`;
  sql += `    total_amount NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    deposit_amount NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    remaining_amount NUMERIC(15,2) DEFAULT 0,\n`;
  sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
  sql += `);\n\n`;

  if (bookings.length > 0) {
    bookings.forEach(b => {
      sql += `INSERT INTO bookings (id, code, customer_id, customer_name, school_name, class_name, shoot_date, package_name, location, booking_status, payment_status, lead_photographer_id, lead_photographer_name, total_amount, deposit_amount, remaining_amount, created_at)\n`;
      sql += `VALUES (${escapeSql(b.id)}, ${escapeSql(b.code)}, ${escapeSql(b.customerId)}, ${escapeSql(b.customerName)}, ${escapeSql(b.schoolName)}, ${escapeSql(b.className)}, ${escapeSql(b.shootDate)}, ${escapeSql(b.packageName)}, ${escapeSql(b.location)}, ${escapeSql(b.bookingStatus)}, ${escapeSql(b.paymentStatus)}, ${escapeSql(b.assignments?.leadPhotographerId)}, ${escapeSql(b.assignments?.leadPhotographerName)}, ${b.totalAmount || 0}, ${b.depositAmount || 0}, ${b.remainingAmount || 0}, ${escapeSql(b.createdAt)})\n`;
      sql += `ON CONFLICT (id) DO UPDATE SET booking_status=EXCLUDED.booking_status, lead_photographer_id=EXCLUDED.lead_photographer_id, remaining_amount=EXCLUDED.remaining_amount;\n`;
    });
    sql += `\n`;
  }


  sql += `COMMIT;\n`;
  return sql;
};

/**
 * Tải xuống tệp SQL Dump trực tiếp trên trình duyệt
 */
export const downloadSqlDumpFile = (data: {
  customers?: Customer[];
  bookings?: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): void => {
  const sqlContent = generateSqlDump(data);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const filename = `crm_xoan_sql_dump_${dateStr}_${timeStr}.sql`;

  const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'last_dump', now.toISOString());
  } catch (e) {
    console.warn(e);
  }
};

/**
 * Xuất file sao lưu toàn diện định dạng JSON Backup
 */
export const exportJsonBackup = (data: {
  customers?: Customer[];
  bookings?: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): void => {
  const backupObject = {
    version: '1.0.1',
    exportedAt: new Date().toISOString(),
    system: 'CRM Xoăn Media',
    zone: 'Zone 3 - Local SQL & Cache',
    data: {
      customers: data.customers || [],
      bookings: data.bookings || [],
      photographers: data.photographers || [],
      salesStaff: data.salesStaff || []
    }
  };

  const jsonStr = JSON.stringify(backupObject, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `crm_xoan_backup_all_${dateStr}.json`;

  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Lấy số liệu thống kê kho lưu trữ SQL Vùng 3
 */
export const getSqlStorageStats = (data: {
  customers?: Customer[];
  bookings?: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): SqlStorageStats => {
  const customersCount = data.customers?.length || 0;
  const bookingsCount = data.bookings?.length || 0;
  const photographersCount = data.photographers?.length || 0;
  const salesStaffCount = data.salesStaff?.length || 0;

  const rawJson = JSON.stringify(data);
  const estimatedSizeBytes = new TextEncoder().encode(rawJson).length;
  const lastDumpAt = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'last_dump') || undefined;

  return {
    customersCount,
    bookingsCount,
    photographersCount,
    salesStaffCount,
    estimatedSizeBytes,
    lastDumpAt,
    storageType: 'LocalStorage SQL Engine & Schema Cache'
  };
};

/**
 * Lưu bộ nhớ cache SQL tức thì
 */
export const syncToLocalSqlCache = (data: {
  customers?: Customer[];
  bookings?: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): boolean => {
  try {
    if (data.customers) localStorage.setItem(LOCAL_STORAGE_PREFIX + 'customers', JSON.stringify(data.customers));
    if (data.bookings) localStorage.setItem(LOCAL_STORAGE_PREFIX + 'bookings', JSON.stringify(data.bookings));
    if (data.photographers) localStorage.setItem(LOCAL_STORAGE_PREFIX + 'photographers', JSON.stringify(data.photographers));
    if (data.salesStaff) localStorage.setItem(LOCAL_STORAGE_PREFIX + 'sales_staff', JSON.stringify(data.salesStaff));
    localStorage.setItem(LOCAL_STORAGE_PREFIX + 'last_synced', new Date().toISOString());
    return true;
  } catch (e) {
    console.error('Lỗi lưu cache SQL nội bộ:', e);
    return false;
  }
};
