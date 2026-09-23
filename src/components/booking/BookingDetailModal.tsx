import React from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Camera,
  User,
  Phone,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Video,
  Sparkles,
  FileText
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  const { updateBooking, customers, setSelectedCustomerId, setActiveTab } = useApp();

  if (!isOpen || !booking) return null;

  const customer = customers.find(c => c.id === booking.customerId);

  const bookingStatusBadges: Record<BookingStatus, string> = {
    'Chờ xác nhận': 'bg-neutral-100 text-neutral-700 border-neutral-200',
    'Đã xác nhận': 'bg-sky-50 text-sky-700 border-sky-200',
    'Đã đặt cọc': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Sắp chụp': 'bg-amber-50 text-amber-700 border-amber-200',
    'Đang chụp': 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse',
    'Đã chụp': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Hậu kỳ': 'bg-purple-50 text-purple-700 border-purple-200',
    'Đã bàn giao': 'bg-teal-50 text-teal-700 border-teal-200',
    'Hoàn thành': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Hủy': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const handleStatusChange = (newStatus: BookingStatus) => {
    updateBooking({ ...booking, bookingStatus: newStatus });
  };

  const hasConflict = booking.assignments.leadPhotographerName?.includes('Trùng Lịch');
  const isUnassigned = !booking.assignments.leadPhotographerId;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white border border-black/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-neutral-50/90 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
              {booking.code}
            </span>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                {booking.className} - {booking.schoolName}
              </h2>
              <p className="text-xs text-neutral-500">
                Đơn đặt lịch chụp kỷ yếu & tiến độ thực hiện
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bookingStatusBadges[booking.bookingStatus]}`}>
              {booking.bookingStatus}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
          {/* Conflict Alert if applicable */}
          {hasConflict && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">Cảnh báo: Trùng lịch thợ chính!</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Thợ ảnh {booking.assignments.leadPhotographerName} đang bị trùng thời gian với đơn booking khác trong ngày. Vui lòng điều phối lại thợ.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Thời Gian & Địa Điểm */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-black/[0.06] space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Thời Gian & Địa Điểm Chụp
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>
                  Ngày chụp: <strong className="text-neutral-900">{booking.shootDate}</strong> ({booking.startTime} - {booking.endTime})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>
                  Khu vực: <strong className="text-neutral-900">{booking.district || 'Lê Chân'}, {booking.city || 'Hải Phòng'}</strong>
                </span>
              </div>
              <div className="sm:col-span-2 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>
                  Địa điểm chi tiết: <strong className="text-neutral-900">{booking.location}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Gói Dịch Vụ & Tài Chính */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-black/[0.06] space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Gói Dịch Vụ & Tài Chính Đặt Cọc
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-black/[0.06]">
                <p className="text-neutral-400 text-[10px] font-bold uppercase">Gói dịch vụ</p>
                <p className="font-bold text-neutral-900 mt-1">{booking.packageName}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{booking.studentCount} học sinh</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-black/[0.06]">
                <p className="text-neutral-400 text-[10px] font-bold uppercase">Tổng giá trị hợp đồng</p>
                <p className="font-extrabold text-neutral-900 mt-1 text-sm">
                  {booking.totalAmount.toLocaleString('vi-VN')}đ
                </p>
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  booking.paymentStatus === 'Đã thanh toán đủ'
                    ? 'bg-emerald-50 text-emerald-700'
                    : booking.paymentStatus === 'Đã cọc'
                    ? 'bg-sky-50 text-sky-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {booking.paymentStatus}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-black/[0.06]">
                <p className="text-neutral-400 text-[10px] font-bold uppercase">Tiền cọc & Công nợ</p>
                <p className="font-bold text-emerald-700 mt-1">
                  Đã cọc: {booking.depositAmount.toLocaleString('vi-VN')}đ
                </p>
                <p className={`text-[11px] font-bold mt-0.5 ${booking.remainingAmount > 0 ? 'text-rose-600' : 'text-neutral-400'}`}>
                  Còn thiếu: {booking.remainingAmount.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Đội Ngũ Ekip Được Gán */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-black/[0.06] space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-600" />
              Đội Ngũ Ekip Thực Hiện
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Thợ chụp chính</p>
                  <p className="font-bold text-neutral-900 mt-0.5">
                    {booking.assignments.leadPhotographerName || (
                      <span className="text-amber-600 font-bold">⚠️ Chưa gán thợ</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase">Thợ quay phim / Flycam</p>
                  <p className="font-bold text-neutral-900 mt-0.5">
                    {booking.assignments.videographerName || 'Theo gói tiêu chuẩn'}
                  </p>
                </div>
              </div>

              {booking.assignments.makeupStaffName && (
                <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Chuyên viên Makeup</p>
                    <p className="font-bold text-neutral-900 mt-0.5">{booking.assignments.makeupStaffName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Đại diện lớp & Ghi chú */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-black/[0.06] space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Thông Tin Khách Hàng / Đại Diện Lớp
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-neutral-700">
              <div>
                <p className="font-bold text-neutral-900 text-sm">{booking.customerName}</p>
                {customer?.phone && (
                  <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> SĐT: {customer.phone}
                  </p>
                )}
              </div>

              {customer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(customer.id);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold transition-all text-xs"
                >
                  Xem Hồ Sơ Khách Hàng 360°
                </button>
              )}
            </div>

            {booking.notes && (
              <div className="pt-2 border-t border-black/[0.06] mt-2">
                <p className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Ghi chú đặc biệt
                </p>
                <p className="text-neutral-800 mt-1 italic">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Update Status Bar */}
          <div className="p-4 bg-white border border-black/[0.08] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-neutral-900">Cập nhật nhanh trạng thái tiến độ:</p>
              <p className="text-neutral-500 text-[11px]">Chuyển đổi trạng thái đơn từ đặt cọc, sắp chụp sang hậu kỳ hoặc hoàn thành</p>
            </div>

            <select
              value={booking.bookingStatus}
              onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
              className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-bold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            >
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã đặt cọc">Đã đặt cọc</option>
              <option value="Sắp chụp">Sắp chụp</option>
              <option value="Đang chụp">Đang chụp</option>
              <option value="Đã chụp">Đã chụp</option>
              <option value="Hậu kỳ">Hậu kỳ</option>
              <option value="Đã bàn giao">Đã bàn giao</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Hủy">Hủy</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50/80 border-t border-black/[0.06] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
