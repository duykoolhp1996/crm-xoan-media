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

export const BookingModule: React.FC = () => {
  const { bookings, updateBooking } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    'Chờ xác nhận': 'bg-white/[0.08] text-white/70 border-white/[0.12]',
    'Đã xác nhận': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'Đã đặt cọc': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Sắp chụp': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Đang chụp': 'bg-orange-500/25 text-orange-300 border-orange-500/40 animate-pulse',
    'Đã chụp': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Hậu kỳ': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Đã bàn giao': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    'Hoàn thành': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Hủy': 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  };

  const handleStatusChange = (booking: Booking, newStatus: BookingStatus) => {
    updateBooking({ ...booking, bookingStatus: newStatus });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-400" />
            Quản Lý Booking & Lịch Chụp Kỷ Yếu
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Theo dõi tiến trình từ đặt lịch, cọc tiền, gán thợ chụp đến hậu kỳ và bàn giao album
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo Đơn Booking Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn (BK-...), trường, lớp, thợ ảnh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-medium text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
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
            className="px-3 py-2 glass-input rounded-xl text-xs font-medium text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="Chưa cọc">Chưa cọc</option>
            <option value="Đã cọc">Đã cọc</option>
            <option value="Đã thanh toán đủ">Đã thanh toán đủ</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-white/45 font-bold border-b border-white/[0.08] uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Đơn & Lớp</th>
                <th className="py-3.5 px-4">Thời Gian & Địa Điểm</th>
                <th className="py-3.5 px-4">Gói Dịch Vụ</th>
                <th className="py-3.5 px-4">Ekip Thực Hiện</th>
                <th className="py-3.5 px-4">Tài Chính & Cọc</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Cập Nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-medium text-white/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/50">
                    <p className="font-semibold text-sm text-white/80">Chưa có đơn booking lịch chụp nào trong hệ thống</p>
                    <p className="text-xs text-white/40 mt-1">Bấm nút "+ Tạo Booking Mới" ở góc trên bên phải để lên lịch chụp cho lớp!</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((bk) => {
                  const hasConflict = bk.assignments.leadPhotographerName?.includes('Trùng Lịch');
                  const isUnassigned = !bk.assignments.leadPhotographerId;

                  return (
                    <tr
                      key={bk.id}
                      className="hover:bg-white/[0.06] transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-500/30">
                            {bk.code}
                          </span>
                          <div>
                            <p className="font-bold text-white group-hover:text-orange-300 transition-colors">
                              {bk.className}
                            </p>
                            <p className="text-[11px] text-white/45">{bk.schoolName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          {bk.shootDate} ({bk.startTime} - {bk.endTime})
                        </p>
                        <p className="text-[11px] text-white/45 flex items-center gap-1 mt-0.5 max-w-xs truncate">
                          <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                          {bk.location}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white/90">{bk.packageName}</p>
                        <p className="text-[11px] text-white/45">{bk.studentCount} học sinh</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {isUnassigned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            ⚠️ Chưa gán thợ
                          </span>
                        ) : (
                          <div>
                            <p className={`font-bold flex items-center gap-1 ${hasConflict ? 'text-rose-400' : 'text-white'}`}>
                              <Camera className="w-3.5 h-3.5 text-white/40" />
                              {bk.assignments.leadPhotographerName}
                            </p>
                            {hasConflict && (
                              <p className="text-[10px] text-rose-400 font-bold">
                                ⚠️ Trùng lịch với đơn khác!
                              </p>
                            )}
                            {bk.assignments.videographerName && (
                              <p className="text-[10px] text-white/45">
                                Quay: {bk.assignments.videographerName}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">
                          {bk.totalAmount.toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold">
                          Đã cọc: {bk.depositAmount.toLocaleString('vi-VN')}đ
                        </p>
                        {bk.remainingAmount > 0 && (
                          <p className="text-[10px] text-rose-400">
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
                          onChange={(e) => handleStatusChange(bk, e.target.value as BookingStatus)}
                          className="px-2 py-1 glass-input rounded-lg text-[11px] font-semibold text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
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

        <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-xs text-white/45">
          <span>Tổng cộng <strong className="text-white/80">{filteredBookings.length}</strong> đơn booking</span>
          <span>Hệ thống tự động phát hiện xung đột lịch và cảnh báo thông minh</span>
        </div>
      </div>

      {/* Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
