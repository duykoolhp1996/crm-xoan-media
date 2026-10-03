# Hướng Dẫn Cài Đặt & Phát Hành Ứng Dụng CRM Xoăn Media Trên iOS (iPhone / iPad)

Dự án đã được tích hợp đầy đủ 2 phương thức triển khai iOS tối ưu nhất:

---

## 📱 CÁCH 1: Cài Đặt Tức Thì Qua PWA Web Clip (Khuyên Dùng Cho Sales & Ekip Thợ Chụp)

> **Ưu điểm vượt trội:**
> - Không cần cài đặt Xcode cồng kềnh.
> - Không cần tài khoản Apple Developer (\$99/năm).
> - Nhân sự ở bất cứ đâu chỉ mất đúng 10 giây để cài đặt.
> - Tự động cập nhật mọi tính năng mới từ server mà không phải tải lại.

### Các Bước Cài Đặt Trên iPhone:
1. Mở trình duyệt **Safari** trên iPhone.
2. Truy cập vào địa chỉ chính thức: **`https://crm.xoanmedia.com`** (hoặc link staging test: `https://duykoolhp1996.github.io/crm-xoan-media/`).
3. Bấm vào nút **Chia sẻ (Share)** ở thanh đáy Safari *(biểu tượng ô vuông có mũi tên chỉ lên)*.
4. Cuộn xuống và chọn dòng **"Thêm vào MH chính" (Add to Home Screen)** *(biểu tượng dấu `+` trong ô vuông)*.
5. Kiểm tra tên ứng dụng hiển thị là **CRM Xoăn Media** rồi bấm nút **Thêm (Add)** ở góc trên bên phải.

🎉 **Hoàn tất:** Logo Xoăn Media sẽ xuất hiện ngay trên màn hình chính iPhone. Khi chạm vào mở app:
- Chạy toàn màn hình (Standalone), ẩn hoàn toàn thanh điều hướng của Safari.
- Đầy đủ đệm tai thỏ / Dynamic Island và thanh Home Indicator của iPhone.
- Thanh Dock đáy Native chuyển đổi mượt mà.

---

## 🛠️ CÁCH 2: Dự Án Native Xcode (`ios/App/App.xcodeproj`)

Dự án Native iOS bằng **Capacitor 7** đã được tạo sẵn tại thư mục [`ios/`](file:///Users/Admin/Documents/CRM%20Xoan/ios/).

### Thông Số Cấu Hình Ứng Dụng:
- **App Name**: `CRM Xoăn Media`
- **Bundle Identifier**: `vn.xoanmedia.crm`
- **Quyền đã cấu hình trong `Info.plist`**:
  - `NSCameraUsageDescription`: Cho phép chụp ảnh hợp đồng, biên lai chuyển khoản VietQR và check-in ca chụp.
  - `NSPhotoLibraryUsageDescription`: Cho phép chọn ảnh từ thư viện để tải lên hồ sơ khách hàng.
  - `NSPhotoLibraryAddUsageDescription`: Cho phép lưu hợp đồng và phiếu thu về máy.

### Các Lệnh Thao Tác:
1. **Đồng bộ code web mới nhất vào dự án iOS**:
   ```bash
   npm run build
   npx cap sync ios
   ```
2. **Mở dự án trực tiếp bằng Xcode**:
   ```bash
   npx cap open ios
   # Hoặc mở file: ios/App/App.xcodeproj
   ```
3. **Cài đặt vào iPhone thực tế qua cáp USB**:
   - Mở Xcode > vào **Signing & Capabilities** > Chọn Apple ID cá nhân tại mục **Team**.
   - Cắm iPhone vào máy Mac qua cáp USB/Type-C.
   - Chọn thiết bị iPhone của bạn ở thanh trên cùng và bấm nút **Build & Run (▶)**.
