# Quy Tắc & Nghiệp Vụ CRM Xoắn Media

## 1. Phân Quyền & Quản Lý Tài Khoản (User & Permissions)
- **Cơ chế cấp tài khoản**: Cả nhân sự **Sales** và **Photographer (Thợ chụp / Ekip)** đều là các user thành viên được **Admin** tạo và cấp tài khoản + mật khẩu riêng biệt để đăng nhập và thực hiện các nghiệp vụ theo quyền hạn:
  - **Admin (Toàn quyền)**: Quản trị toàn bộ hệ thống, cấp tài khoản, thiết lập cấu hình, xem dữ liệu doanh thu & phân bổ hoa hồng.
  - **Sales Tư Vấn**: Sử dụng tài khoản được cấp để nhận lead tự động (round-robin), chăm sóc khách hàng trên Pipeline, báo giá, gửi hợp đồng, chốt cọc và tạo booking.
  - **Photographer (Thợ chụp / Ekip)**: Sử dụng tài khoản được cấp để tra cứu lịch chụp cá nhân, xác nhận nhận ca chụp, cập nhật tình trạng buổi chụp và tiến độ hậu kỳ bàn giao.
  - **Manager / Vận hành**: Điều phối thợ chụp, gán ekip cho booking, giải quyết trùng lịch và giám sát KPI.

## 2. Quy Tắc Tự Động Hóa (Automation Rules)
- Kéo thẻ khách hàng từ `New Lead` sang `Đã liên hệ` trong Pipeline: Tự động phân bổ và gán nhân viên Sales tư vấn phụ trách.
- Khách hàng từ chối hoặc hủy hợp đồng: Sử dụng nút `Khách từ chối (Lost)` trong Hồ sơ 360° để chuyển trạng thái sang Lost và lưu lý do.
