# QUY TRÌNH TRIỂN KHAI AN TOÀN – ZERO DATA LOSS DEPLOYMENT

Tài liệu quy định quy trình triển khai và phát hành phiên bản mới của CRM Xoăn Media lên Server Production mà tuyệt đối không ảnh hưởng đến dữ liệu.

---

## 1. NGUYÊN TẮC CỐT LÕI

```
              PHIÊN BẢN CŨ (v1.1.4)
                       │
                       ▼
       [BƯỚC 1: SAO LƯU DATABASE TỰ ĐỘNG]
                       │
                       ▼
            [BƯỚC 2: BUILD FRONTEND]
                       │
                       ▼
      [BƯỚC 3: RSYNC (LOẠI TRỪ DATA & BACKUPS)]
                       │
                       ▼
       [BƯỚC 4: AUTO SAFE MIGRATION & RESTART]
                       │
                       ▼
            [BƯỚC 5: HEALTH CHECK]
                       │
                       ▼
             PHIÊN BẢN MỚI (v1.1.5)
              (DỮ LIỆU BẢO TOÀN 100%)
```

---

## 2. QUY TẮC PHÁT HÀNH

Theo quy định dự án tại `GEMINI.md`:
1. **Kiểm thử trên GitHub Pages trước:** Mọi thay đổi code cần được build và kiểm thử trên GitHub Pages (`npm run deploy`).
2. **Triển khai Server Production:** Khi cần phát hành chính thức, chạy `./deploy.sh`.
3. **Số phiên bản (Versioning):** Mỗi lần phát hành lên Production phải tăng version (ví dụ: `v1.1.4` -> `v1.1.5`).

---

## 3. CÁC BƯỚC THỰC HIỆN KHI DEPLOY

Chỉ cần chạy lệnh:
```bash
./deploy.sh
```

Quy trình tự động thực hiện 5 bước an toàn:
1. **Bước 1: Auto Backup:**
   Kết nối SSH tới server và chạy:
   `node server/backup.mjs pre-deploy`
   Tạo snapshot file dạng `crm_backup_YYYY-MM-DD_HHmmss_pre-deploy.db`.
2. **Bước 2: Build Frontend:**
   Chạy `npm run build` tạo bundle production trong thư mục `dist/`.
3. **Bước 3: Rsync an toàn:**
   Đồng bộ mã nguồn sang server với các cờ loại trừ nghiêm ngặt:
   `--exclude 'node_modules' --exclude '.git' --exclude 'server/data' --exclude 'server/backups' --exclude '.env'`
   Đảm bảo thư mục dữ liệu `server/data/` không bao giờ bị ghi đè.
4. **Bước 4: Cập nhật web root & Restart PM2:**
   Sao chép `dist/*` vào `/var/www/crm-xoan-media/`. Khởi động lại service `crm-xoan-server` qua PM2.
   Khi backend khởi động lại, `server/db.mjs` tự động chạy migration idempotent để bổ sung cột mới nếu có mà không làm mất dòng nào.
5. **Bước 5: Post-deployment Health Check:**
   Tự động kiểm tra `https://crm.xoanmedia.com/api/health` và `https://crm.xoanmedia.com/api/health/database`.

---

## 4. QUY TRÌNH ROLLBACK (KHI CẦN HOÀN TÁC)

Nếu phiên bản mới phát sinh lỗi logic giao diện:
1. **Rollback Frontend:**
   - Triển khai lại bản build cũ từ git commit trước đó.
   - Database SQL Server giữ nguyên hoàn toàn.
2. **Khôi phục Database từ Backup (nếu cần):**
   Nếu cần phục hồi dữ liệu về trạng thái trước deploy:
   ```bash
   ssh server-pc-tunnel "
     cd /home/minh/crm-xoan-media
     pm2 stop crm-xoan-server
     cp server/backups/db/[tên_file_backup].db server/data/crm_xoan_server.db
     pm2 start crm-xoan-server
   "
   ```
