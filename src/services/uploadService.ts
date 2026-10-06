import { apiClient } from './apiClient';

/**
 * Tự động căn chỉnh crop hình vuông và nén nhẹ ảnh phía Client (Canvas API)
 * Giúp avatar luôn vuông vắn, chất lượng cao nhưng dung lượng siêu nhẹ (~30KB - 80KB)
 */
export const compressImageToSquare = (
  file: File,
  maxDimension: number = 400,
  quality: number = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Vui lòng chọn đúng định dạng file ảnh (JPG, PNG, WebP)'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể xử lý hình ảnh'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        // 1. Tính toán vùng crop vuông ở chính giữa bức ảnh
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        // 2. Kích thước xuất chuẩn
        const outputSize = Math.min(minDim, maxDimension);
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Bật làm mịn ảnh
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 3. Vẽ crop vuông
        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          outputSize,
          outputSize
        );

        // 4. Xuất Data URL (JPEG nén)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Tải ảnh đại diện lên hệ thống:
 * 1. Nén ảnh vuông tối ưu phía Client
 * 2. Upload lên Backend SQL Server REST API lưu trữ vĩnh viễn trong server/data/uploads/
 * 3. Fallback tự động sang Data URL nếu offline hoặc chưa kết nối server
 */
export const uploadAvatarFile = async (
  file: File,
  userId?: string
): Promise<{ success: boolean; url: string; message: string }> => {
  try {
    // 1. Kiểm tra kích thước file gốc (tối đa 10MB trước khi nén)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        url: '',
        message: 'File ảnh quá lớn! Vui lòng chọn ảnh dung lượng dưới 10MB.'
      };
    }

    // 2. Nén ảnh vuông chuẩn Avatar
    const compressedBase64 = await compressImageToSquare(file, 400, 0.85);

    // 3. Gửi lên Server REST API
    const res = await apiClient.uploadAvatar({
      base64Data: compressedBase64,
      fileName: file.name,
      fileType: file.type || 'image/jpeg',
      userId
    });

    if (res && (res.fullUrl || res.url)) {
      return {
        success: true,
        url: res.fullUrl || res.url,
        message: 'Tải ảnh đại diện lên máy chủ thành công!'
      };
    }

    // 4. Fallback: Nếu server không phản hồi (offline/gh-pages), dùng Data URL nén
    return {
      success: true,
      url: compressedBase64,
      message: 'Đã tối ưu và áp dụng ảnh đại diện thành công!'
    };
  } catch (err: any) {
    console.error('[UploadService] Lỗi upload avatar:', err);
    return {
      success: false,
      url: '',
      message: err.message || 'Lỗi xử lý file ảnh'
    };
  }
};
