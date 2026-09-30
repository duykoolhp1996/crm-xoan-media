# Hướng Dẫn Build App Mobile Flutter Cho CRM Xoăn Media

Mã nguồn này cho phép bạn đóng gói hệ thống CRM Xoăn Media thành ứng dụng Native **Android (.apk)** và **iOS (.ipa)** bằng Flutter.

---

## 📱 1. Khởi Tạo Dự Án Flutter (Nếu Chưa Có)
Tại thư mục máy tính của bạn, mở Terminal và chạy lệnh:
```bash
flutter create --org vn.xoanmedia crm_xoan_mobile
cd crm_xoan_mobile
```

Sau đó:
1. Sao chép file `pubspec.yaml` từ thư mục này vào thư mục dự án vừa tạo.
2. Sao chép file `lib/main.dart` vào thư mục `lib/` của dự án.
3. Chạy lệnh cài đặt thư viện:
```bash
flutter pub get
```

---

## ⚙️ 2. Cấu Hình Quyền Truy Cập (Permissions)

### Android (`android/app/src/main/AndroidManifest.xml`)
Thêm các dòng sau vào trước thẻ `<application>`:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### iOS (`ios/Runner/Info.plist`)
Thêm các khóa xin quyền Camera và Thư viện ảnh:
```xml
<key>NSCameraUsageDescription</key>
<string>Cho phép CRM sử dụng Camera để chụp ảnh check-in ca chụp và học sinh.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Cho phép CRM truy cập thư viện để upload ảnh mẫu concept và bill chuyển khoản.</string>
<key>io.flutter.embedded_views_preview</key>
<true/>
```

---

## 🚀 3. Lệnh Build Ứng Dụng

### Xuất file APK cài đặt thoại Android:
```bash
flutter build apk --release
```
File APK thành phẩm sẽ nằm tại: `build/app/outputs/flutter-apk/app-release.apk` (có thể gửi qua Zalo cho thợ chụp và Sales cài trực tiếp).

### Xuất bản cho iPhone (iOS):
Mở thư mục `ios/` bằng **Xcode** trên máy Mac:
```bash
open ios/Runner.xcworkspace
```
Chọn Apple Developer Team của bạn và bấm **Product > Archive** để xuất file cài đặt lên TestFlight hoặc App Store.
