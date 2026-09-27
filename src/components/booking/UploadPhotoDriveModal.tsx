import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Customer, Booking, PipelineStage, BookingStatus } from '../../types';
import {
  X,
  Camera,
  FolderOpen,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  FileImage,
  UserCheck,
  Calendar
} from 'lucide-react';
import { notifyShootingCompletedToZaloGroup } from '../../lib/zaloBotService';

interface UploadPhotoDriveModalProps {
  customer?: Customer | null;
  booking?: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (driveUrl: string) => void;
}

export const UploadPhotoDriveModal: React.FC<UploadPhotoDriveModalProps> = ({
  customer: propCustomer,
  booking: propBooking,
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    customers,
    updateCustomer,
    bookings,
    updateBooking,
    addActivityLog,
    photographers,
    currentUser,
    addNotification
  } = useApp();

  // Xác định customer và booking liên quan
  const customer = propCustomer || (propBooking ? customers.find(c => c.id === propBooking.customerId) : null);
  const matchedBooking = propBooking || (customer ? bookings.find(b => b.customerId === customer.id) : null);

  const [driveUrl, setDriveUrl] = useState('');
  const [photographerId, setPhotographerId] = useState('');
  const [photoCount, setPhotoCount] = useState<number>(1200);
  const [photoNotes, setPhotoNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existingUrl = customer?.rawDriveUrl || customer?.driveUrl || matchedBooking?.rawDriveUrl || '';
      setDriveUrl(existingUrl);
      setPhotoNotes(customer?.photoNotes || matchedBooking?.photoNotes || '');
      setPhotoCount(customer?.photoCount || matchedBooking?.photoCount || 1200);

      // Thợ chụp phụ trách
      if (matchedBooking?.assignments?.leadPhotographerId) {
        setPhotographerId(matchedBooking.assignments.leadPhotographerId);
      } else if (currentUser.role === 'photographer') {
        const found = photographers.find(p => p.fullName === currentUser.name || p.id === currentUser.id);
        if (found) setPhotographerId(found.id);
      }
      setIsSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, customer, matchedBooking, currentUser, photographers]);

  if (!isOpen || (!customer && !matchedBooking)) return null;

  const currentLeadPhoto = photographers.find(p => p.id === photographerId) ||
    (matchedBooking?.assignments?.leadPhotographerName ? { fullName: matchedBooking.assignments.leadPhotographerName } : null);

  // Validate Link Drive
  const isDriveUrlValid = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    // Kiểm tra định dạng link: có thể là drive.google.com hoặc http(s)://
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('drive.google.com');
  };

  const handleConfirm = () => {
    const trimmedUrl = driveUrl.trim();
    if (!trimmedUrl) {
      setErrorMsg('⚠️ Bắt buộc phải nhập Link Google Drive ảnh gốc!');
      return;
    }
    if (!isDriveUrlValid(trimmedUrl)) {
      setErrorMsg('⚠️ Link Google Drive không hợp lệ! Vui lòng nhập link bắt đầu bằng https://');
      return;
    }

    const className = customer?.className || matchedBooking?.className || 'Lớp Kỷ Yếu';
    const schoolName = customer?.schoolName || matchedBooking?.schoolName || 'Trường THPT';
    const photoName = currentLeadPhoto?.fullName || currentUser.name;

    // 1. Cập nhật Customer sang "Đã chụp"
    if (customer) {
      const updatedCust: Customer = {
        ...customer,
        pipelineStage: 'Đã chụp' as PipelineStage,
        rawDriveUrl: trimmedUrl,
        driveUrl: trimmedUrl,
        photoNotes: photoNotes.trim(),
        photoCount: Number(photoCount) || undefined,
        shotDate: customer.shotDate || new Date().toISOString().split('T')[0],
        notes: `${customer.notes ? customer.notes + '\n' : ''}[${new Date().toLocaleDateString('vi-VN')}] Đã chụp xong - Bàn giao Link Drive: ${trimmedUrl}. ${photoNotes ? 'Ghi chú photo: ' + photoNotes : ''}`.trim(),
        updatedAt: new Date().toISOString()
      };
      updateCustomer(updatedCust);

      // Bắn Zalo Bot thông báo hoàn thành buổi chụp
      notifyShootingCompletedToZaloGroup({
        customer: updatedCust,
        rawDriveUrl: trimmedUrl,
        photographerName: photoName,
        photoCount: Number(photoCount) || undefined,
        notes: photoNotes.trim()
      }).catch(err => console.warn('[Zalo Bot] Lỗi gửi thông báo đã chụp:', err));
    }

    // 2. Cập nhật Booking sang "Đã chụp"
    if (matchedBooking) {
      const updatedBk: Booking = {
        ...matchedBooking,
        bookingStatus: 'Đã chụp' as BookingStatus,
        rawDriveUrl: trimmedUrl,
        driveUrl: trimmedUrl,
        photoNotes: photoNotes.trim(),
        photoCount: Number(photoCount) || undefined,
        updatedAt: new Date().toISOString()
      };
      updateBooking(updatedBk);
    }

    // 3. Ghi Activity Log
    if (customer) {
      addActivityLog({
        customerId: customer.id,
        type: 'shooting_done',
        title: '📸 Đã chụp & Bàn giao Link Google Drive',
        description: `Photographer "${photoName}" đã hoàn thành buổi chụp cho lớp ${className} (${schoolName}) và bàn giao Link Google Drive ảnh gốc: ${trimmedUrl}. ${photoNotes ? `Ghi chú: ${photoNotes}` : ''}`,
        performedByName: currentUser.name
      });
    }

    // 4. Chuông thông báo nội bộ
    addNotification({
      type: 'upcoming_booking',
      title: `📸 ĐÃ CÓ ẢNH CHỤP: ${className}`,
      message: `Photo ${photoName} đã bàn giao Link Google Drive ảnh gốc cho lớp ${className} (${schoolName}). Bộ phận hậu kỳ có thể tiến hành làm việc!`,
      severity: 'info'
    });

    setIsSuccess(true);
    if (onSuccess) onSuccess(trimmedUrl);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="p-5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Photo Bàn Giao File Gốc
                </span>
                <span className="text-xs text-neutral-400 font-medium">Bắt buộc Link Google Drive</span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
                Xác Nhận Đã Chụp & Nộp Link Drive
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-neutral-900">
          
          {/* Thông tin lớp chụp */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-neutral-900 bg-[#B8F23D]/50 border border-[#B8F23D] px-2 py-0.5 rounded-md">
                {customer?.className || matchedBooking?.className}
              </span>
              <h3 className="text-xs font-bold text-neutral-900 mt-1 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-neutral-500" />
                {customer?.schoolName || matchedBooking?.schoolName}
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Concept: <strong>{customer?.concept || 'Kỷ yếu truyền thống'}</strong> • Gói: <strong>{customer?.servicePackageName || matchedBooking?.packageName || 'Tiêu chuẩn'}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 font-medium block">Ngày chụp</span>
              <span className="text-xs font-extrabold text-blue-600 font-mono">
                {matchedBooking?.shootDate || customer?.expectedShootDate || 'Hôm nay'}
              </span>
            </div>
          </div>

          {/* Ô BẮT BUỘC: Link Google Drive */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-blue-50/50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-neutral-900 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Link Google Drive Ảnh Gốc</span>
                <span className="text-rose-500 font-bold">* (Bắt buộc)</span>
              </label>

              {driveUrl && isDriveUrlValid(driveUrl) && (
                <a
                  href={driveUrl.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  Mở thử link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type="url"
                required
                value={driveUrl}
                onChange={(e) => {
                  setDriveUrl(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full p-3 pr-10 rounded-xl border border-blue-300 focus:border-blue-600 focus:outline-none bg-white text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 shadow-2xs font-mono"
              />
              <div className="absolute right-3 top-3 text-neutral-400">
                <FolderOpen className="w-4 h-4 text-blue-500" />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 flex items-center gap-1">
              <span>💡 Link thư mục Google Drive chứa ảnh chụp RAW hoặc JPG gốc để Ekip Hậu Kỳ tải về chỉnh màu.</span>
            </p>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in duration-100">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Chọn Thợ Bàn Giao & Số lượng file */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-neutral-500" />
                Thợ chụp bàn giao
              </label>
              <select
                value={photographerId}
                onChange={(e) => setPhotographerId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-black/[0.08] focus:outline-none bg-neutral-50 text-xs font-semibold"
              >
                <option value="">{currentLeadPhoto?.fullName || 'Thợ chính phụ trách'}</option>
                {photographers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.photographerType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1 mb-1">
                <FileImage className="w-3.5 h-3.5 text-neutral-500" />
                Số lượng ảnh ước tính
              </label>
              <input
                type="number"
                min={1}
                step={50}
                value={photoCount}
                onChange={(e) => setPhotoCount(Number(e.target.value))}
                placeholder="VD: 1200 ảnh"
                className="w-full p-2.5 rounded-xl border border-black/[0.08] focus:outline-none bg-neutral-50 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Lời dặn dò cho Hậu kỳ / Designer */}
          <div>
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Lời dặn dò cho Bộ Phận Hậu Kỳ / Designer (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={photoNotes}
              onChange={(e) => setPhotoNotes(e.target.value)}
              placeholder="VD: Đã up đủ 1.250 tấm (RAW + JPG). Concept Retro ấm, lớp thích tone màu hoài niệm..."
              className="w-full p-2.5 rounded-xl border border-black/[0.08] focus:outline-none bg-neutral-50 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 placeholder:text-neutral-400"
            />
          </div>

          {/* Hộp Thông Báo Tự Động Hóa */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] text-neutral-600 text-[11px] space-y-1">
            <p className="font-bold text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Tự Động Hóa CRM Xoăn Media:
            </p>
            <p>✓ Cập nhật tiến độ khách hàng sang <strong>"Đã chụp"</strong> & lưu Link Google Drive vĩnh viễn.</p>
            <p>✓ Bắn thông báo Zalo Bot tới nhóm để <strong>Bộ Phận Hậu Kỳ</strong> truy cập lấy file làm việc ngay.</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-black/[0.06] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-black/[0.08] text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!driveUrl.trim()}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : !driveUrl.trim()
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer shadow-blue-500/20'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
                <span>Đã Bàn Giao Drive Thành Công!</span>
              </>
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                <span>Xác Nhận Đã Chụp & Bàn Giao Drive</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
