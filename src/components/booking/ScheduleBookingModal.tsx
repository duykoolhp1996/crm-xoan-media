import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Customer, PipelineStage } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Camera,
  CheckCircle2,
  Sparkles,
  School,
  AlertCircle,
  Phone
} from 'lucide-react';
import { notifyShootDateScheduledToZaloGroup } from '../../lib/zaloBotService';

interface ScheduleBookingModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (shootDate: string) => void;
}

export const ScheduleBookingModal: React.FC<ScheduleBookingModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    updateCustomer,
    addBooking,
    addActivityLog,
    photographers,
    getPhotographerAvailability,
    currentUser,
    addNotification
  } = useApp();

  // Khởi tạo ngày chụp mặc định: Thứ 7 hoặc Chủ Nhật kế tiếp
  const defaultShootDate = useMemo(() => {
    if (customer?.expectedShootDate) return customer.expectedShootDate;
    const now = new Date();
    const day = now.getDay();
    const daysUntilNextSaturday = (6 - day + 7) % 7 || 7;
    const nextSat = new Date(now);
    nextSat.setDate(now.getDate() + daysUntilNextSaturday);
    return nextSat.toISOString().split('T')[0];
  }, [customer]);

  const [shootDate, setShootDate] = useState<string>(defaultShootDate);
  const [timeSlot, setTimeSlot] = useState<'Cả ngày' | 'Ca Sáng' | 'Ca Chiều'>('Cả ngày');
  const [location, setLocation] = useState<string>('');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (customer) {
      setShootDate(customer.expectedShootDate || defaultShootDate);
      setLocation(
        Array.isArray(customer.shootingLocations) && customer.shootingLocations.length > 0
          ? customer.shootingLocations.join(', ')
          : customer.schoolName || ''
      );
      setNotes(customer.notes || '');
      setIsSuccess(false);
    }
  }, [customer, defaultShootDate, isOpen]);

  if (!isOpen || !customer) return null;

  // Tính các mốc ngày nhanh: T7 tuần này, CN tuần này, T7 tuần sau, CN tuần sau
  const getQuickDates = () => {
    const now = new Date();
    const day = now.getDay();
    const daysToSat = (6 - day + 7) % 7 || 7;
    const daysToSun = (7 - day + 7) % 7 || 7;

    const thisSat = new Date(now);
    thisSat.setDate(now.getDate() + daysToSat);

    const thisSun = new Date(now);
    thisSun.setDate(now.getDate() + daysToSun);

    const nextSat = new Date(thisSat);
    nextSat.setDate(thisSat.getDate() + 7);

    const nextSun = new Date(thisSun);
    nextSun.setDate(thisSun.getDate() + 7);

    const toStr = (d: Date) => d.toISOString().split('T')[0];
    const toLabel = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

    return [
      { label: `T7 tuần này (${toLabel(thisSat)})`, value: toStr(thisSat) },
      { label: `CN tuần này (${toLabel(thisSun)})`, value: toStr(thisSun) },
      { label: `T7 tuần tới (${toLabel(nextSat)})`, value: toStr(nextSat) },
      { label: `CN tuần tới (${toLabel(nextSun)})`, value: toStr(nextSun) },
    ];
  };

  const quickDates = getQuickDates();

  // Kiểm tra tình trạng sẵn sàng của thợ được chọn
  const photoAvailability = selectedPhotoId
    ? getPhotographerAvailability(selectedPhotoId, shootDate)
    : { available: true, totalShootsOnDay: 0 };

  const selectedPhotographer = photographers.find(p => p.id === selectedPhotoId);

  // Xác nhận chốt ngày chụp và chuyển sang Đã Booking
  const handleConfirmSchedule = () => {
    if (!shootDate) {
      alert('Vui lòng chọn ngày chụp cụ thể để chuyển sang trạng thái Đã Booking!');
      return;
    }

    const currentYear = new Date().getFullYear();
    const bookingCode = `BK-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const startTime = timeSlot === 'Ca Sáng' ? '07:30' : timeSlot === 'Ca Chiều' ? '13:30' : '07:30';
    const endTime = timeSlot === 'Ca Sáng' ? '11:30' : timeSlot === 'Ca Chiều' ? '17:30' : '17:30';
    const totalAmount = customer.totalRevenue || customer.expectedBudget || 10000000;
    const depositAmount = customer.paidAmount || 2000000;
    const remainingAmount = Math.max(0, totalAmount - depositAmount);

    // 1. Cập nhật khách hàng sang giai đoạn "Đã Booking"
    const updatedCustomer: Customer = {
      ...customer,
      expectedShootDate: shootDate,
      pipelineStage: 'Đã Booking' as PipelineStage,
      shootingLocations: location ? location.split(',').map(s => s.trim()) : customer.shootingLocations,
      notes: `${customer.notes ? customer.notes + '\n' : ''}[${new Date().toLocaleDateString('vi-VN')}] Đã chốt ngày chụp: ${new Date(shootDate).toLocaleDateString('vi-VN')} (${timeSlot}). ${notes ? 'Ghi chú: ' + notes : ''}`.trim(),
      updatedAt: new Date().toISOString()
    };
    updateCustomer(updatedCustomer);

    // 2. Tự động sinh đơn Booking đồng bộ
    addBooking({
      code: bookingCode,
      customerId: customer.id,
      customerName: `${customer.name} (${customer.className} - ${customer.schoolName})`,
      schoolName: customer.schoolName,
      className: customer.className,
      shootDate: shootDate,
      startTime,
      endTime,
      city: customer.city || 'Hải Phòng',
      district: customer.district || '',
      location: location || customer.schoolName,
      studentCount: customer.studentCount || 35,
      packageId: customer.servicePackageId || 'pkg-2',
      packageName: customer.servicePackageName || 'Gói Kỷ Yếu STANDARD',
      totalAmount,
      depositAmount,
      remainingAmount,
      paymentStatus: depositAmount >= totalAmount ? 'Đã thanh toán đủ' : 'Đã cọc',
      bookingStatus: 'Đã đặt cọc',
      assignments: {
        leadPhotographerId: selectedPhotographer?.id,
        leadPhotographerName: selectedPhotographer?.fullName
      },
      notes: `Đã chốt lịch chụp từ CRM Pipeline. ${notes}`.trim()
    });

    // 3. Ghi Activity Log
    addActivityLog({
      customerId: customer.id,
      type: 'booking_scheduled',
      title: '📅 Đã chốt ngày chụp & Lên Booking',
      description: `Khách hàng ${customer.className} (${customer.schoolName}) đã chốt ngày chụp chính thức vào ngày ${new Date(shootDate).toLocaleDateString('vi-VN')} (${timeSlot}). Mã đơn booking: ${bookingCode}. Tiến trình chuyển sang "Đã Booking".`,
      performedByName: currentUser.name
    });

    // 4. Bắn Zalo Bot thông báo chốt ngày chụp vào nhóm điều phối
    notifyShootDateScheduledToZaloGroup({
      customer: updatedCustomer,
      shootDate,
      timeSlot,
      location: location || customer.schoolName,
      leadPhotographerName: selectedPhotographer?.fullName
    }).catch(err => {
      console.warn('[Zalo Bot] Lỗi gửi thông báo chốt lịch chụp:', err);
    });

    // 5. Chuông thông báo nội bộ
    addNotification({
      type: 'upcoming_booking',
      title: `📅 ĐÃ CHỐT LỊCH CHỤP: ${customer.className}`,
      message: `Lớp ${customer.className} (${customer.schoolName}) đã chốt ngày chụp vào ngày ${new Date(shootDate).toLocaleDateString('vi-VN')}.`,
      severity: 'info'
    });

    setIsSuccess(true);
    if (onSuccess) onSuccess(shootDate);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="p-5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B8F23D] text-neutral-950 flex items-center justify-center font-black shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Chốt Ngày Chụp & Lên Booking</h3>
                <span className="text-[10px] bg-[#B8F23D]/20 text-[#B8F23D] border border-[#B8F23D]/40 px-2 py-0.5 rounded-full font-bold">
                  Bắt buộc
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Chuyển khách sang giai đoạn <strong>"Đã Booking"</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* THÔNG BÁO XÁC NHẬN THÀNH CÔNG */}
        {isSuccess && (
          <div className="p-4 bg-emerald-500 text-white text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-5 h-5" />
            <span>Đã chốt ngày chụp thành công! Khách hàng đã chuyển sang giai đoạn "Đã Booking".</span>
          </div>
        )}

        {/* BODY FORM */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs custom-scrollbar">
          
          {/* Thông tin lớp tóm tắt */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <p className="font-extrabold text-neutral-900 text-sm truncate">
                {customer.className} - {customer.schoolName}
              </p>
              <p className="text-neutral-500 text-[11px] flex items-center gap-2">
                <span>👤 {customer.name}</span>
                <span>•</span>
                <span>📞 {customer.phone}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-neutral-400 block font-medium">Tiền cọc đã thu:</span>
              <span className="font-black text-emerald-700 text-xs">
                {customer.paidAmount && customer.paidAmount > 0
                  ? `${customer.paidAmount.toLocaleString('vi-VN')} đ`
                  : '2.000.000 đ'}
              </span>
            </div>
          </div>

          {/* Ô CHỌN NGÀY CHỤP (BẮT BUỘC) */}
          <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>1. Chọn Ngày Chụp Chính Thức (Bắt Buộc)</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {shootDate ? new Date(shootDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa chọn'}
              </span>
            </div>

            <input
              type="date"
              value={shootDate}
              onChange={(e) => setShootDate(e.target.value)}
              className="w-full text-base sm:text-lg font-black text-neutral-900 px-4 py-2.5 rounded-xl border border-black/[0.1] focus:outline-none focus:border-emerald-500 bg-neutral-50/50 font-mono"
              required
            />

            {/* Phím chọn nhanh ngày cuối tuần */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-neutral-400 font-medium block">Gợi ý chọn nhanh cuối tuần:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {quickDates.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setShootDate(item.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      shootDate === item.value
                        ? 'bg-neutral-900 text-[#B8F23D] shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Khung giờ / Ca chụp */}
          <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs space-y-2">
            <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>2. Khung Giờ / Ca Chụp</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Cả ngày', desc: '07:30 - 17:30' },
                { label: 'Ca Sáng', desc: '07:30 - 11:30' },
                { label: 'Ca Chiều', desc: '13:30 - 17:30' },
              ].map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => setTimeSlot(slot.label as any)}
                  className={`p-2.5 rounded-xl text-center transition-all border cursor-pointer ${
                    timeSlot === slot.label
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-xs'
                      : 'bg-neutral-50 border-black/[0.06] text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <p className="text-xs">{slot.label}</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">{slot.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Địa điểm chụp chính */}
          <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs space-y-2">
            <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>3. Địa Điểm Chụp Dự Kiến</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Trường THPT Chuyên Trần Phú, Nhà Hát Lớn, Bãi biển Đồ Sơn..."
              className="w-full p-2.5 rounded-xl border border-black/[0.08] focus:outline-none focus:border-rose-400 bg-neutral-50 text-xs"
            />
          </div>

          {/* Gán Trưởng nháy / Photographer chỉ định (Tùy chọn) */}
          <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-600" />
                <span>4. Chỉ Định Trưởng Nháy / Ekip (Tùy chọn)</span>
              </label>
              <span className="text-[11px] text-neutral-400">Có thể điều phối sau</span>
            </div>

            <select
              value={selectedPhotoId}
              onChange={(e) => setSelectedPhotoId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-black/[0.08] focus:outline-none bg-neutral-50 text-xs font-semibold"
            >
              <option value="">Chưa chỉ định (Để Ban Điều Phối xếp sau)</option>
              {photographers
                .filter(p => p.photographerType !== 'Đối tác Studio')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.experienceYears} năm KN - {p.photographerType})
                  </option>
                ))}
            </select>

            {selectedPhotoId && (
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                photoAvailability.available
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {photoAvailability.available ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thợ <strong>{selectedPhotographer?.fullName}</strong> đang trống lịch ngày này, sẵn sàng nhận ca!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Cảnh báo: Thợ <strong>{selectedPhotographer?.fullName}</strong> đã có {photoAvailability.totalShootsOnDay} ca chụp ngày {shootDate}!</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-neutral-50/80 border-t border-black/[0.06] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-black/[0.08] bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmSchedule}
            disabled={!shootDate}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ${
              !shootDate
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#B8F23D]" />
            <span>
              {!shootDate
                ? '⚠️ Vui lòng chọn ngày chụp'
                : `Xác Nhận Ngày Chụp & Chuyển "Đã Booking"`}
            </span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
