# Quy Tắc & Nghiệp Vụ CRM Xoăn Media

## 1. Phân Quyền & Quản Lý Tài Khoản (User & Permissions)
- **Cơ chế cấp tài khoản**: Cả nhân sự **Sales** và **Photographer (Thợ chụp / Ekip)** đều là các user thành viên được **Admin** tạo và cấp tài khoản + mật khẩu riêng biệt để đăng nhập và thực hiện các nghiệp vụ theo quyền hạn:
  - **Admin (Toàn quyền)**: Quản trị toàn bộ hệ thống, cấp tài khoản, thiết lập cấu hình, xem dữ liệu doanh thu & phân bổ hoa hồng.
  - **Sales Tư Vấn**: Sử dụng tài khoản được cấp để nhận lead tự động (round-robin), chăm sóc khách hàng trên Pipeline, báo giá, gửi hợp đồng, chốt cọc và tạo booking.
  - **Photographer (Thợ chụp / Ekip)**: Sử dụng tài khoản được cấp để tra cứu lịch chụp cá nhân, xác nhận nhận ca chụp, cập nhật tình trạng buổi chụp và tiến độ hậu kỳ bàn giao.
  - **Manager / Vận hành**: Điều phối thợ chụp, gán ekip cho booking, giải quyết trùng lịch và giám sát KPI.

## 2. Quy Tắc Tự Động Hóa (Automation Rules)
- Kéo thẻ khách hàng từ `New Lead` sang `Đã liên hệ` trong Pipeline: Tự động phân bổ và gán nhân viên Sales tư vấn phụ trách.
- Khách hàng từ chối hoặc hủy hợp đồng: Sử dụng nút `Khách từ chối (Lost)` trong Hồ sơ 360° để chuyển trạng thái sang Lost và lưu lý do.

## 3. Vai Trò Zalo Bot (AI Task Man - Trợ Lý Công Việc Nội Bộ)
- **Định vị cốt lõi**: Bot `Bot ai task mam` (ID: `663760632193924350`) **CHỈ LÀ TRỢ LÝ CÔNG VIỆC NỘI BỘ (Task & Ops Assistant)**, hoàn toàn **KHÔNG PHẢI** là chatbot tư vấn bán hàng hay nhắn tin tương tác với khách hàng.
- **Phạm vi nghiệp vụ chính**:
  1. **Nhắc việc & Quản trị Task**: Thông báo các task công việc cần xử lý, nhắc deadline hợp đồng hoặc công việc quá hạn.
  2. **Bắn lịch ca chụp cho Ekip**: Báo lịch chụp mới, ngày chụp, trường lớp, địa điểm và phân công trưởng nháy/thợ phụ.
  3. **Thông báo vận hành cho Quản lý / Admin**: Bắn thông báo chốt cọc VietQR, cập nhật tình trạng booking cho anh Tạ Duy và ban điều phối.
