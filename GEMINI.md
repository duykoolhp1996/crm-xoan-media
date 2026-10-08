# Quy Tắc & Nghiệp Vụ CRM Xoăn Media

## 1. Phân Quyền & Quản Lý Tài Khoản (User & Permissions)
- **Bảo Vệ Tài Khoản Admin Cố Định (Bất Di Bất Dịch)**:
  - **TUYỆT ĐỐI KHÔNG TỰ Ý ĐỔI TÀI KHOẢN VÀ MẬT KHẨU ADMIN**: Tài khoản và mật khẩu Admin luôn giữ nguyên 100%, không được tự ý sửa, thay thế hoặc can thiệp dưới bất kỳ hình thức nào.
  - Tài khoản Admin và mật khẩu cố định của hệ thống:
    - ID đăng nhập: `admin` hoặc `admin@xoanmedia.vn`
    - Mật khẩu: `XoanAdmin@2026`, `admin123`, `123456`
- **Cơ chế cấp tài khoản**: Cả nhân sự **Sales** và **Photographer (Thợ chụp / Ekip)** đều là các user thành viên được **Admin** tạo và cấp tài khoản + mật khẩu riêng biệt để đăng nhập và thực hiện các nghiệp vụ theo quyền hạn:
  - **Admin (Toàn quyền)**: Quản trị toàn bộ hệ thống, cấp tài khoản, thiết lập cấu hình, xem dữ liệu doanh thu & phân bổ hoa hồng.
  - **Sales Tư Vấn**: Sử dụng tài khoản được cấp để nhận lead tự động (round-robin), chăm sóc khách hàng trên Pipeline, báo giá, gửi hợp đồng, chốt cọc và tạo booking.
  - **Photographer (Thợ chụp / Ekip)**: Sử dụng tài khoản được cấp để tra cứu lịch chụp cá nhân, xác nhận nhận ca chụp, cập nhật tình trạng buổi chụp và tiến độ hậu kỳ bàn giao.
  - **Manager / Vận hành**: Điều phối thợ chụp, gán ekip cho booking, giải quyết trùng lịch và giám sát KPI.
- **Nguyên Tắc Dữ Liệu Thực Tế (Single Source of Truth From Database Data)**:
  - Mọi thông tin danh sách tài khoản (Sales, Thợ chụp) và trạng thái hoạt động **BẮT BUỘC** phải lấy trực tiếp từ **CSDL Data thực tế** (Database SQL / Server API `https://crm.xoanmedia.com/api`), TUYỆT ĐỐI không dùng trí nhớ / bộ nhớ tĩnh (mock hardcode) để trả lời hoặc hiển thị.
  - Nếu Admin đã xóa hoặc vô hiệu hóa tài khoản trong hệ thống, hệ thống và trợ lý phải cập nhật theo đúng dữ liệu đã xóa, tuyệt đối không tự ý hồi sinh hay liệt kê lại các tài khoản đã bị Admin xóa.

## 2. Quy Tắc Tự Động Hóa (Automation Rules)
- Kéo thẻ khách hàng từ `New Lead` sang `Đã liên hệ` trong Pipeline: Tự động phân bổ và gán nhân viên Sales tư vấn phụ trách.
- Khách hàng từ chối hoặc hủy hợp đồng: Sử dụng nút `Khách từ chối (Lost)` trong Hồ sơ 360° để chuyển trạng thái sang Lost và lưu lý do.

## 3. Vai Trò Zalo Bot (AI Task Man - Trợ Lý Công Việc Nội Bộ)
- **Định vị cốt lõi**: Bot `Bot ai task mam` (ID: `663760632193924350`) **CHỈ LÀ TRỢ LÝ CÔNG VIỆC NỘI BỘ (Task & Ops Assistant)**, hoàn toàn **KHÔNG PHẢI** là chatbot tư vấn bán hàng hay nhắn tin tương tác với khách hàng.
- **Phạm vi nghiệp vụ chính**:
  1. **Nhắc việc & Quản trị Task**: Thông báo các task công việc cần xử lý, nhắc deadline hợp đồng hoặc công việc quá hạn.
  2. **Bắn lịch ca chụp cho Ekip**: Báo lịch chụp mới, ngày chụp, trường lớp, địa điểm và phân công trưởng nháy/thợ phụ.
  3. **Thông báo vận hành cho Quản lý / Admin**: Bắn thông báo chốt cọc VietQR, cập nhật tình trạng booking cho anh Tạ Duy và ban điều phối.

## 4. Quy Trình Phát Triển & Quản Lý Phiên Bản (Release & Versioning Strategy)
- **Quy tắc phát triển trên GitHub trước (Testing & Staging)**:
  - Mọi chỉnh sửa, cập nhật code, tính năng mới và fix lỗi **BẮT BUỘC** phải được triển khai và kiểm thử trên **GitHub Pages** trước (`npm run deploy`).
  - GitHub Pages: `duykoolhp1996.github.io/crm-xoan-media/`.
- **Quy tắc phát hành lên Server Production (`crm.xoanmedia.com`)**:
  - **CHỈ KHI NÀO** người dùng yêu cầu "up bản mới nhất" hoặc phê duyệt deploy, hệ thống mới được phép chạy lệnh deploy lên Server Ubuntu (`npm run deploy:server`).
  - **Bắt buộc thể hiện Version**:
    - Mỗi lần phát hành lên Server Production, hệ thống phải tăng và thể hiện rõ **Số Phiên Bản (Version)** (ví dụ: `v1.0.0`, `v1.0.1`, `v1.1.0`...).
    - Số phiên bản phải được hiển thị trực tiếp trên giao diện UI (chân Sidebar / Footer / Cài đặt) và trong commit log + thông báo phản hồi để người dùng kiểm tra ngay lập tức.

## 5. Nguyên Tắc Sống Còn: Bảo Toàn Dữ Liệu 100% (Zero Data Loss Policy)
- **Cấm Tuyệt Đối**:
  - Không bao giờ chạy các lệnh `DROP DATABASE`, `DROP TABLE`, `TRUNCATE TABLE`, xóa database production hoặc ghi đè file database.
  - Không re-seed lại dữ liệu mặc định/demo đè lên dữ liệu thật của người dùng.
- **Bảo Vệ Khi Deploy & Update Version**:
  - Thư mục chứa dữ liệu `server/data/` và `server/backups/` **bắt buộc loại trừ khỏi `rsync`** và không bao giờ bị ghi đè khi đồng bộ code mới.
  - **Auto-Backup bắt buộc**: Trước mỗi lần deploy lên Production, script deploy BẮT BUỘC tự động tạo 1 bản snapshot backup DB (`server/backup.mjs pre-deploy`).
  - **Schema Migrations An Toàn**: Mọi cập nhật cấu trúc database phải luôn sử dụng cú pháp idempotent (ví dụ: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`), giữ nguyên 100% các hàng dữ liệu cũ.
- **Frontend & Cầu Nối API**:
  - Luôn kết nối trực tiếp Single Source of Truth về SQL Server API (`https://crm.xoanmedia.com/api`).
  - Khi khởi động app hay update frontend, tuyệt đối không ghi đè mảng rỗng hay mock data lên dữ liệu đang có của người dùng.

## 6. Tách Biệt Tuyệt Đối Giữa CRM và Pancake (Hai Ứng Dụng Độc Lập)
- **CRM Xoăn Media** và **Pancake** là **2 ứng dụng hoàn toàn độc lập và tách biệt**:
  - Codebase này (`/Users/Admin/Documents/CRM Xoan`) **CHỈ PHỤC VỤ HỆ THỐNG CRM XOĂN MEDIA** (Quản lý Khách hàng, Lead Pipeline 10 bước, Lịch chụp Ekip, Booking cọc, Phân quyền Sales & Thợ chụp, Báo cáo hiệu suất, Cài đặt hệ thống).
  - TUYỆT ĐỐI không tự ý phát triển, nhúng, tích hợp các tính năng của App Pancake (Meta Graph API, Facebook Webhook, chat đa kênh, POS Pancake...) vào trong hệ thống CRM.
  - Mọi yêu cầu chỉnh sửa trong repository này đều là **chỉnh sửa nghiệp vụ cho hệ thống CRM**.

