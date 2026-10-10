import React, { useState } from 'react';
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
  Users,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Video,
  Sparkles,
  FileText,
  Eye,
  Ban,
  Trash2,
  Database,
  ShieldAlert
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
  const {
    updateBooking,
    deleteBooking,
    cancelBooking,
    customers,
    setSelectedCustomerId,
    setActiveTab,
    photographers,
    currentUser,
    currentRole
  } = useApp();

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !booking) return null;

  const customer = customers.find(c => c.id === booking.customerId);

  // Tra cứu thông tin chi tiết thợ từ DATA 38 thợ của Xoăn Media
  const getPhotographerInfo = (id?: string, name?: string) => {
    if (!id && !name) return null;
    return photographers.find(p =>
      (id && p.id === id) ||
      (name && (
        p.fullName.toLowerCase() === name.toLowerCase() ||
        p.fullName.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.fullName.toLowerCase())
      ))
    );
  };

  const leadPhoto = getPhotographerInfo(booking.assignments?.leadPhotographerId, booking.assignments?.leadPhotographerName);
  const videoPhoto = getPhotographerInfo(booking.assignments?.videographerId, booking.assignments?.videographerName);
  const indivPhoto = getPhotographerInfo(booking.assignments?.individualPhotographerId, booking.assignments?.individualPhotographerName);

  const assistantList = (booking.assignments?.assistantNames || []).map((name, i) => {
    const id = booking.assignments?.assistantPhotographerIds?.[i];
    return {
      name,
      info: getPhotographerInfo(id, name)
    };
  });

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

          {/* Section 3: Đội Ngũ Ekip Được Gán (Đồng bộ từ DATA 38 Thợ Xoăn Media) */}
          <div className="bg-neutral-50 p-4 rounded-2xl border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />
                Đội Ngũ Ekip Thực Hiện
              </h3>
              <span className="text-[10px] text-neutral-400 font-semibold bg-white px-2.5 py-0.5 rounded-full border border-black/[0.06]">
                Đồng bộ từ DATA {photographers.length} Thợ Ekip
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Thợ Chụp Chính */}
              <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 font-bold">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">Thợ chụp chính</p>
                    <p className="font-bold text-neutral-900 mt-0.5 truncate">
                      {booking.assignments?.leadPhotographerName || leadPhoto?.fullName || (
                        <span className="text-amber-600 font-bold">⚠️ Chưa gán thợ</span>
                      )}
                    </p>
                  </div>
                </div>
                {leadPhoto?.phone && (
                  <a
                    href={`tel:${leadPhoto.phone}`}
                    className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{leadPhoto.phone}</span>
                  </a>
                )}
              </div>

              {/* 2. Thợ Phụ / Trợ Lý Chụp */}
              {assistantList.length > 0 && (
                <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex flex-col justify-center gap-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      Thợ phụ / Trợ lý chụp ({assistantList.length})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {assistantList.map((ast, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-neutral-50 border border-black/[0.06] px-2.5 py-1 rounded-lg text-xs"
                      >
                        <span className="font-bold text-neutral-900">{ast.name}</span>
                        {ast.info?.phone && (
                          <a
                            href={`tel:${ast.info.phone}`}
                            className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 font-medium ml-1"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            {ast.info.phone}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Thợ Quay Phim / Flycam */}
              {booking.assignments?.videographerName && (
                <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Thợ quay phim / Flycam</p>
                      <p className="font-bold text-neutral-900 mt-0.5 truncate">
                        {booking.assignments.videographerName}
                      </p>
                    </div>
                  </div>
                  {videoPhoto?.phone && (
                    <a
                      href={`tel:${videoPhoto.phone}`}
                      className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{videoPhoto.phone}</span>
                    </a>
                  )}
                </div>
              )}

              {/* 4. Thợ Chụp Cá Nhân */}
              {booking.assignments?.individualPhotographerName && (
                <div className="bg-white p-3 rounded-xl border border-black/[0.06] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Thợ chụp cá nhân</p>
                      <p className="font-bold text-neutral-900 mt-0.5 truncate">
                        {booking.assignments.individualPhotographerName}
                      </p>
                    </div>
                  </div>
                  {indivPhoto?.phone && (
                    <a
                      href={`tel:${indivPhoto.phone}`}
                      className="shrink-0 flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{indivPhoto.phone}</span>
                    </a>
                  )}
                </div>
              )}

              {/* 5. Chuyên viên Makeup */}
              {booking.assignments?.makeupStaffName && (
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

            {/* Chi tiết tài chính công thợ & lợi nhuận nếu có */}
            {((booking.assignments?.laborCost || 0) > 0 || (booking.assignments?.profit || 0) > 0) && (
              <div className="mt-2 p-3 bg-white rounded-xl border border-black/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-500">Công thợ: </span>
                  <strong className="text-neutral-900">{(booking.assignments?.laborCost || 0).toLocaleString('vi-VN')}đ</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Lợi nhuận dự kiến: </span>
                  <strong className="text-emerald-700">{(booking.assignments?.profit || 0).toLocaleString('vi-VN')}đ</strong>
                  {booking.assignments?.profitMargin ? (
                    <span className="ml-1 text-[10px] text-emerald-600 font-bold">({booking.assignments.profitMargin}%)</span>
                  ) : null}
                </div>
              </div>
            )}
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
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Hồ Sơ Khách Hàng 360°</span>
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

          {/* Admin Cancel Confirmation Box */}
          {isConfirmingCancel && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5 text-amber-900">
                <Ban className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Xác Nhận Hủy Đơn Booking {booking.code}</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Đơn sẽ chuyển trạng thái "Hủy" trong Database. Toàn bộ lịch chụp của Ekip sẽ được giải phóng tự động.
                  </p>
                </div>
              </div>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy (khách dời lịch, hoãn chụp, hủy hợp đồng...)"
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setIsConfirmingCancel(false);
                    setCancelReason('');
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-black/[0.08] text-xs transition-colors cursor-pointer"
                >
                  Quay Lại
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={async () => {
                    setIsProcessing(true);
                    const ok = await cancelBooking(booking.id, cancelReason);
                    setIsProcessing(false);
                    if (ok) {
                      onClose();
                    }
                  }}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Đang lưu CSDL...' : 'Xác Nhận Hủy (Đồng Bộ DB)'}
                </button>
              </div>
            </div>
          )}

          {/* Admin Delete Confirmation Box */}
          {isConfirmingDelete && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5 text-rose-900">
                <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Xác Nhận Xóa Đơn Booking {booking.code} Vào Thùng Rác</h4>
                  <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                    Chỉ Quản trị viên (Admin) mới có quyền xóa. Đơn sẽ được chuyển vào thùng rác CSDL SQLite (is_deleted = 1) và giải phóng lịch thợ.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-black/[0.08] text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={async () => {
                    setIsProcessing(true);
                    const ok = await deleteBooking(booking.id);
                    setIsProcessing(false);
                    if (ok) {
                      onClose();
                    }
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Đang xóa...' : 'Xóa Đơn (Đồng Bộ Database)'}
                </button>
              </div>
            </div>
          )}

          {/* Update Status Bar */}
          {!isConfirmingCancel && !isConfirmingDelete && (
            <div className="p-4 bg-white border border-black/[0.08] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-neutral-900">Cập nhật nhanh trạng thái tiến độ:</p>
                <p className="text-neutral-500 text-[11px]">Chuyển đổi trạng thái đơn từ đặt cọc, sắp chụp sang hậu kỳ hoặc hoàn thành</p>
              </div>

              <select
                value={booking.bookingStatus}
                onChange={(e) => {
                  const val = e.target.value as BookingStatus;
                  if (val === 'Hủy') {
                    if (!isAdmin) {
                      alert('⛔ Chỉ tài khoản Quản trị viên (Admin) mới có quyền Hủy đơn booking!');
                      return;
                    }
                    setIsConfirmingCancel(true);
                    return;
                  }
                  handleStatusChange(val);
                }}
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
                <option value="Hủy" disabled={!isAdmin}>
                  {isAdmin ? 'Hủy đơn' : 'Hủy đơn (Chỉ Admin)'}
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50/80 border-t border-black/[0.06] flex items-center justify-between">
          <div>
            {isAdmin && !isConfirmingCancel && !isConfirmingDelete && (
              <div className="flex items-center gap-2">
                {booking.bookingStatus !== 'Hủy' && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(true)}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Admin: Hủy đơn & giải phóng lịch thợ"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Hủy Đơn</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Admin: Xóa đơn vào thùng rác CSDL"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Đơn (Admin)</span>
                </button>
              </div>
            )}
          </div>

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
