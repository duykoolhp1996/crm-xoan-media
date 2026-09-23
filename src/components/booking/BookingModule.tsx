import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import {
  CalendarCheck,
  Plus,
  Search,
  Clock,
  MapPin,
  Camera
} from 'lucide-react';
import { BookingModal } from './BookingModal';
import { BookingDetailModal } from './BookingDetailModal';

export const BookingModule: React.FC = () => {
  const { bookings, updateBooking } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // Lọc Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch =
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.district && b.district.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
      const matchPayment = paymentFilter === 'all' || b.paymentStatus === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

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

  const handleStatusChange = (booking: Booking, newStatus: BookingStatus) => {
    updateBooking({ ...booking, bookingStatus: newStatus });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-500" />
            Quản Lý Booking & Lịch Chụp Kỷ Yếu
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Theo dõi tiến trình từ đặt lịch, cọc tiền, gán thợ chụp đến hậu kỳ và bàn giao album
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tạo Đơn Booking Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white border border-black/[0.08] p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn (BK-...), trường, lớp, thợ ảnh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="all">Tất cả trạng thái tiến độ</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã đặt cọc">Đã đặt cọc</option>
            <option value="Sắp chụp">Sắp chụp</option>
            <option value="Đã chụp">Đã chụp</option>
            <option value="Hậu kỳ">Hậu kỳ</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="Chưa cọc">Chưa cọc</option>
            <option value="Đã cọc">Đã cọc</option>
            <option value="Đã thanh toán đủ">Đã thanh toán đủ</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-black/[0.08] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-black/[0.06] uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Đơn & Lớp</th>
                <th className="py-3.5 px-4">Thời Gian & Địa Điểm</th>
                <th className="py-3.5 px-4">Gói Dịch Vụ</th>
                <th className="py-3.5 px-4">Ekip Thực Hiện</th>
                <th className="py-3.5 px-4">Tài Chính & Cọc</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Cập Nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] font-medium text-neutral-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold text-sm text-neutral-800">Chưa có đơn booking lịch chụp nào trong hệ thống</p>
                    <p className="text-xs text-neutral-400 mt-1">Bấm nút "+ Tạo Booking Mới" ở góc trên bên phải để lên lịch chụp cho lớp!</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bk) => {
                  const hasConflict = bk.assignments.leadPhotographerName?.includes('Trùng Lịch');
                  const isUnassigned = !bk.assignments.leadPhotographerId;

                  return (
                    <tr
                      key={bk.id}
                      onClick={() => setSelectedBookingForDetail(bk)}
                      className="hover:bg-neutral-50/90 transition-colors group cursor-pointer"
                      title="Nhấp vào dòng để xem chi tiết đơn booking & lịch chụp"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                            {bk.code}
                          </span>
                          <div>
                            <p className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                              {bk.className}
                            </p>
                            <p className="text-[11px] text-neutral-500">{bk.schoolName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {bk.shootDate} ({bk.startTime} - {bk.endTime})
                        </p>
                        <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5 max-w-xs truncate">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                          {bk.location}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-neutral-900">{bk.packageName}</p>
                        <p className="text-[11px] text-neutral-500">{bk.studentCount} học sinh</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            ⚠️ Chưa gán thợ
                          </span>
                        ) : (
                          <div>
                            <p className={`font-bold flex items-center gap-1 ${hasConflict ? 'text-rose-600' : 'text-neutral-900'}`}>
                              <Camera className="w-3.5 h-3.5 text-neutral-400" />
                              {bk.assignments.leadPhotographerName}
                            </p>
                            {hasConflict && (
                              <p className="text-[10px] text-rose-600 font-bold">
                                ⚠️ Trùng lịch với đơn khác!
                              </p>
                            )}
                            {bk.assignments.videographerName && (
                              <p className="text-[10px] text-neutral-500">
                                Quay: {bk.assignments.videographerName}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900">
                          {bk.totalAmount.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Đã cọc: {bk.depositAmount.toLocaleString('vi-VN')}đ
                        </p>
                        {bk.remainingAmount > 0 && (
                          <p className="text-[10px] text-rose-600 font-semibold">
                            Thiếu: {bk.remainingAmount.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bookingStatusBadges[bk.bookingStatus]}`}>
                          {bk.bookingStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={bk.bookingStatus}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(bk, e.target.value as BookingStatus);
                          }}
                          className="px-2 py-1 bg-neutral-50 border border-black/[0.08] rounded-lg text-[11px] font-semibold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
                        >
                          <option value="Chờ xác nhận">Chờ xác nhận</option>
                          <option value="Đã xác nhận">Đã xác nhận</option>
                          <option value="Đã đặt cọc">Đã đặt cọc</option>
                          <option value="Sắp chụp">Sắp chụp</option>
                          <option value="Đã chụp">Đã chụp</option>
                          <option value="Hậu kỳ">Hậu kỳ</option>
                          <option value="Đã bàn giao">Đã bàn giao</option>
                          <option value="Hoàn thành">Hoàn thành</option>
                          <option value="Hủy">Hủy</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-neutral-50/50 border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-500">
          <span>Tổng cộng <strong className="text-neutral-900">{filteredBookings.length}</strong> đơn booking (Nhấp vào hàng để xem chi tiết)</span>
          <span>Hệ thống tự động phát hiện xung đột lịch và cảnh báo thông minh</span>
        </div>
      </div>

      {/* Modal Tạo Booking Mới */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal Xem Chi Tiết Đơn Booking */}
      <BookingDetailModal
        booking={selectedBookingForDetail}
        isOpen={Boolean(selectedBookingForDetail)}
        onClose={() => setSelectedBookingForDetail(null)}
      />
    </div>
  );
};
