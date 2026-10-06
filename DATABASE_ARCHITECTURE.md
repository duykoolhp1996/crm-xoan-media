# KIẾN TRÚC DATABASE CHO CRM XOĂN MEDIA (DATA PERSISTENCE & SAFE UPDATE)

Tài liệu thiết kế và vận hành hệ thống lưu trữ dữ liệu bền vững, độc lập hoàn toàn với vòng đời của ứng dụng và frontend.

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Dữ liệu CRM được thiết kế theo mô hình phân tầng chặt chẽ:

```
                  USER BROWSER / CLIENT
                           │
                           ▼ HTTPS
           CRM FRONTEND (React + Vite SPA)
     - Giao diện UI/UX, Dashboard, Form nhập liệu
     - Nạp dữ liệu từ REST API qua apiClient.ts
     - Tuyệt đối không chứa database production
                           │
                           ▼ REST API / HTTPS (/api/...)
           CRM BACKEND (Node.js Engine :4321)
     - Single Connection Handle / Persistent Database Pool
     - REST API Endpoints: /api/customers, /api/bookings, /api/health
     - Soft Delete (is_deleted, deleted_at, deleted_by)
     - Audit Log (bảng audit_logs ghi nhận mọi thay đổi)
     - Database Transactions (runTransaction)
     - Production Safety Lock (chặn lệnh phá hủy)
                           │
                           ▼ Local File Handle (WAL Mode)
           SQL DATABASE SERVER (crm_xoan_server.db)
     - SINGLE SOURCE OF TRUTH (Nguồn dữ liệu chính duy nhất)
     - Vị trí vật lý: /home/minh/crm-xoan-media/server/data/
     - Tách biệt khỏi thư mục web root (/var/www/crm-xoan-media)
     - Được loại trừ khỏi git và rsync khi deploy
```

---

## 2. VỊ TRÍ VẬT LÝ & SINGLE SOURCE OF TRUTH

- **Database Engine:** SQLite Persistent (Node.js `node:sqlite` built-in với chế độ `journal_mode = WAL` và `synchronous = NORMAL`).
- **Đường dẫn trên Server Production:** `/home/minh/crm-xoan-media/server/data/crm_xoan_server.db`
- **Các file phụ trợ SQLite:**
  - `crm_xoan_server.db-wal` (Write-Ahead Log)
  - `crm_xoan_server.db-shm` (Shared Memory)
- **Thư mục sao lưu:** `/home/minh/crm-xoan-media/server/backups/db/`
- **Nguyên tắc vàng:** Mọi cập nhật code, build frontend, thay đổi giao diện **KHÔNG BAO GIỜ** tác động hay ghi đè lên thư mục `server/data/`.

---

## 3. CƠ CHẾ SAFE DATABASE MIGRATION (ZERO DATA LOSS)

Hệ thống quản lý version database thông qua bảng `schema_migrations`:

```sql
CREATE TABLE schema_migrations (
  id TEXT PRIMARY KEY,
  version INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  applied_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Quy tắc Migration:
1. **Không dùng `DROP TABLE` hoặc `TRUNCATE TABLE`**.
2. **Kiểm tra sự tồn tại của cột trước khi thêm**: Sử dụng `PRAGMA table_info(table_name)` để kiểm tra danh sách cột. Nếu cột chưa có, chạy lệnh `ALTER TABLE table_name ADD COLUMN column_name TYPE`.
3. **Tính Idempotent**: Mỗi migration chỉ chạy 1 lần duy nhất và ghi nhận `version` vào bảng `schema_migrations`. Chạy lại server nhiều lần không gây lỗi và không thay đổi dữ liệu đã có.

### Lịch sử các Version Schema:
- **Version 1 (Initial Schema):** Bảng `customers`, `bookings`, `photographers`, `sales_staff`, `sync_outbox`, `excel_export_history`, `app_settings`.
- **Version 2 (Audit Logs):** Bảng `audit_logs` lưu lịch sử CREATE, UPDATE, DELETE, RESTORE, BACKUP.
- **Version 3 (Expand Customer & Soft Delete):** Thêm các cột MXH (facebook, tiktok, zalo), trường lớp chi tiết, budget, concept, links Drive và các trường Soft Delete (`is_deleted`, `deleted_at`, `deleted_by`).
- **Version 4 (Expand Booking & Soft Delete):** Thêm các cột chi tiết booking, assignments JSON, thanh toán và Soft Delete.

---

## 4. PRODUCTION SAFETY LOCK

Trong file `server/db.mjs`:
```javascript
export const verifyProductionSafety = (sqlStatement) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowDestructive = process.env.ALLOW_DESTRUCTIVE_DATABASE_OPERATION === 'true';

  if (isProduction && !allowDestructive) {
    const upper = sqlStatement.toUpperCase();
    if (upper.includes('DROP TABLE') || upper.includes('DROP DATABASE') || upper.includes('TRUNCATE')) {
      throw new Error('⛔ PRODUCTION SAFETY LOCK: Thao tác phá hủy database bị chặn!');
    }
  }
};
```
Mặc định cờ `ALLOW_DESTRUCTIVE_DATABASE_OPERATION = false`. Bất kỳ câu lệnh nào cố tình phá hủy cấu trúc database đều bị chặn đứng ngay lập tức.

---

## 5. SOFT DELETE & AUDIT LOGS

### Cơ chế Soft Delete:
- Khi người dùng xóa khách hàng hoặc booking, hệ thống **không xóa bản ghi vật lý**.
- Bản ghi được đánh dấu: `is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, deleted_by = username`.
- Các query thông thường tự động lọc `WHERE is_deleted = 0`.
- Cho phép khôi phục qua endpoint: `POST /api/customers/:id/restore`.

### Bảng Audit Logs:
Mọi thao tác thay đổi dữ liệu đều được ghi lại trong bảng `audit_logs`:
- `id`: Mã log duy nhất
- `user_id`: ID người thực hiện
- `user_name`: Tên người thực hiện
- `action`: Hành động (`CREATE`, `UPDATE`, `DELETE`, `RESTORE`, `BACKUP`)
- `table_name`: Bảng bị tác động (`customers`, `bookings`, `database`)
- `record_id`: ID bản ghi
- `old_data`: Dữ liệu JSON trước khi thay đổi
- `new_data`: Dữ liệu JSON sau khi thay đổi
- `ip_address`: Địa chỉ IP của client
- `created_at`: Thời gian thực hiện

---

## 6. CHIẾN LƯỢC SAO LƯU (BACKUP STRATEGY)

1. **Auto Backup Trước Mỗi Lần Deploy:** Script `deploy.sh` tự động kích hoạt `node server/backup.mjs pre-deploy` trên server trước khi đồng bộ file mới.
2. **Cơ chế Snapshot Đồng Nhất (VACUUM INTO):** Sử dụng tính năng `VACUUM INTO` nguyên tử của SQLite giúp tạo file `.db` hoàn chỉnh mà không cần dừng server hay khóa các request đọc/ghi của người dùng.
3. **Retention Policy:** Hệ thống tự động giữ lại tối đa 30 bản sao lưu gần nhất và dọn dẹp các bản sao lưu cũ hơn.
4. **Vị trí lưu trữ:** `/home/minh/crm-xoan-media/server/backups/db/crm_backup_YYYY-MM-DD_HHmmss_[label].db`.

---

## 7. CÁC REST API ENDPOINTS CHÍNH

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/health` | Health check tổng quan, uptime & version |
| `GET` | `/api/health/database` | Trạng thái SQL Engine, số lượng bản ghi & migration version |
| `GET` | `/api/customers` | Lấy danh sách khách hàng (hỗ trợ phân trang, tìm kiếm) |
| `GET` | `/api/customers/:id` | Xem chi tiết 1 khách hàng |
| `POST` | `/api/customers` | Tạo mới khách hàng (có Transaction + Audit Log) |
| `PUT` | `/api/customers/:id` | Cập nhật thông tin khách hàng (có Transaction + Audit Log) |
| `DELETE` | `/api/customers/:id` | Soft delete khách hàng vào thùng rác |
| `POST` | `/api/customers/:id/restore` | Khôi phục khách hàng đã xóa |
| `GET` | `/api/bookings` | Danh sách lịch booking chụp |
| `POST` | `/api/bookings` | Tạo mới booking |
| `PUT` | `/api/bookings/:id` | Cập nhật booking |
| `DELETE` | `/api/bookings/:id` | Soft delete booking |
| `GET` | `/api/audit-logs` | Xem lịch sử thao tác hệ thống |
| `POST` | `/api/backups/create` | Kích hoạt tạo bản sao lưu DB thủ công |
| `GET` | `/api/backups` | Xem danh sách các bản sao lưu hiện có |
