# Hướng Dẫn Đóng Gói Native App Android & iOS Bằng Capacitor

Nếu bạn không muốn cài Flutter hoặc học Dart, **Capacitor** là phương án nhanh nhất để biến chính mã nguồn React Vite này thành App Android (.apk) và iOS (.ipa).

---

## ⚡ Các Bước Thực Hiện:

### 1. Cài đặt Capacitor vào dự án:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 2. Thêm nền tảng Android & iOS:
```bash
npx cap add android
npx cap add ios
```

### 3. Đồng bộ code Web mới nhất:
```bash
npm run build
npx cap sync
```

### 4. Mở trình biên dịch Native để xuất file cài đặt:
- **Để xuất file APK cho Android**:
  ```bash
  npx cap open android
  ```
  *(Lệnh này sẽ tự động mở Android Studio, bạn chỉ cần bấm **Build > Build Bundle(s) / APK(s) > Build APK**).*

- **Để xuất file cho iPhone / iPad (iOS)**:
  ```bash
  npx cap open ios
  ```
  *(Lệnh này sẽ tự động mở Xcode trên máy Mac, bạn chọn iPhone của mình và bấm **Run** để cài thẳng vào máy).*
