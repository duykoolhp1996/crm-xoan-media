import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import {
  CalendarCheck,
  Plus,
  Search,
  Clock,
  MapPin,
  Camera,
  Eye,
  CircleDollarSign,
  Ban,
  Trash2,
  AlertTriangle,
  Database,
  X,
  Check,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { BookingModal } from './BookingModal';
import { BookingDetailModal } from './BookingDetailModal';
import {
  filterAccessibleCustomers,
  filterAccessibleBookingsForSales,
  canUserAccessFinance
} from '../../utils/salesPermissions';

export const BookingModule: React.FC = () => {
  const {
    bookings,
    updateBooking,
    deleteBooking,
    cancelBooking,
    currentUser,
    currentRole,
    photographers,
    customers,
    salesStaff,
    setSelectedCustomerId,
    setActiveTab
  } = useApp();

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';
  const isPhotographerUser = currentRole === 'photographer' || currentUser?.role === 'photographer';
  const isSalesUser = currentRole === 'sales' || currentUser?.role === 'sales';
  const hasFinanceAccess = canUserAccessFinance(currentUser, currentRole, salesStaff);

  // Danh sách khách hàng Sales được phép xem
  const accessibleCustomers = useMemo(() => {
    if (!isSalesUser) return customers;
    return filterAccessibleCustomers(customers, currentUser, currentRole, salesStaff);
  }, [customers, currentUser, currentRole, salesStaff, isSalesUser]);

  const currentPhotographer = useMemo(() => {
    if (!isPhotographerUser) return null;
    return (
      photographers.find(
        p =>
          p.id === currentUser.id ||
          p.fullName.toLowerCase() === currentUser.name.toLowerCase() ||
          (currentUser.phone && p.phone === currentUser.phone)
      ) || photographers[0]
    );
  }, [photographers, currentUser, isPhotographerUser]);

  const isPhotoLead = useMemo(() => {
    if (!isPhotographerUser || !currentPhotographer) return false;
    return Boolean(
      currentPhotographer.notes?.toUpperCase().includes('LEAD') ||
      currentPhotographer.fullName.toLowerCase().includes('lead')
    );
  }, [isPhotographerUser, currentPhotographer]);

  const myTeam = useMemo(() => {
    if (!currentPhotographer) return 'Toàn Studio';
    if (
      currentPhotographer.activeRegions?.includes('Hà Nội') ||
      currentPhotographer.notes?.toUpperCase().includes('HÀ NỘI')
    ) {
      return 'Hà Nội';
    }
    return 'Hải Phòng';
  }, [currentPhotographer]);

  const myTeamPhotographerIds = useMemo(() => {
    if (!isPhotoLead) return new Set<string>();
    const teamPhotos = photographers.filter(
      p =>
        p.activeRegions?.includes(myTeam) ||
        p.notes?.toUpperCase().includes(myTeam.toUpperCase())
    );
    return new Set(teamPhotos.map(p => p.id));
  }, [photographers, isPhotoLead, myTeam]);

  // Lọc Bookings:
  // - Sales / Sales Lead: Chỉ xem booking thuộc các khách hàng mình có quyền truy cập
  // - Photo Lead: Xem các booking của Team mình
  // - Photo thường: Xem ca chụp mình tham gia
  // - Admin: Xem toàn bộ
  const accessibleBookings = useMemo(() => {
    if (isSalesUser) {
      return filterAccessibleBookingsForSales(bookings, accessibleCustomers, true);
    }
    if (!isPhotographerUser) return bookings;
    if (isPhotoLead) {
      return bookings.filter(b => {
        const hasTeamStaff =
          (b.assignments.leadPhotographerId && myTeamPhotographerIds.has(b.assignments.leadPhotographerId)) ||
          (b.assignments.videographerId && myTeamPhotographerIds.has(b.assignments.videographerId)) ||
          b.assignments.assistantPhotographerIds?.some(id => myTeamPhotographerIds.has(id));
        const matchesCity = b.city?.toLowerCase().includes(myTeam.toLowerCase()) || b.location?.toLowerCase().includes(myTeam.toLowerCase());
        return hasTeamStaff || matchesCity;
      });
    }
    const myId = currentPhotographer?.id || currentUser.id;
    const myName = currentPhotographer?.fullName || currentUser.name;
    return bookings.filter(
      b =>
        b.assignments.leadPhotographerId === myId ||
        b.assignments.videographerId === myId ||
        b.assignments.assistantPhotographerIds?.includes(myId) ||
        b.assignments.leadPhotographerName === myName
    );
  }, [bookings, isSalesUser, accessibleCustomers, isPhotographerUser, isPhotoLead, myTeam, myTeamPhotographerIds, currentPhotographer, currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // State quản trị Hủy & Xóa Booking (Chỉ dành cho Admin)
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsProcessing(true);
    try {
      const ok = await cancelBooking(bookingToCancel.id, cancelReason);
      if (ok) {
        setActionNotice({
          type: 'success',
          message: `Đã hủy đơn ${bookingToCancel.code}! Đã giải phóng lịch cho Ekip và lưu vào CSDL.`
        });
        setBookingToCancel(null);
        setCancelReason('');
        setTimeout(() => setActionNotice(null), 4500);
      } else {
        setActionNotice({
          type: 'error',
          message: 'Không thể hủy đơn booking. Thao tác yêu cầu quyền Quản trị viên (Admin)!'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    setIsProcessing(true);
    try {
      const ok = await deleteBooking(bookingToDelete.id);
      if (ok) {
        setActionNotice({
          type: 'success',
          message: `Đã chuyển đơn ${bookingToDelete.code} vào thùng rác CSDL SQLite an toàn.`
        });
        setBookingToDelete(null);
        setTimeout(() => setActionNotice(null), 4500);
      } else {
        setActionNotice({
          type: 'error',
          message: 'Không thể xóa đơn booking. Thao tác yêu cầu quyền Quản trị viên (Admin)!'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Lọc Bookings
  const filteredBookings = useMemo(() => {
    return accessibleBookings.filter(b => {
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
  }, [accessibleBookings, searchTerm, statusFilter, paymentFilter]);

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
            Quản Lý Booking
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Theo dõi tiến trình từ đặt lịch, gán thợ chụp đến hậu kỳ và bàn giao album
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasFinanceAccess && (
            <button
              onClick={() => setActiveTab('finance')}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Mở Bảng Quản Lý Tài Chính & Cọc riêng biệt"
            >
              <CircleDollarSign className="w-4 h-4 text-emerald-600" />
              <span>Bảng Tài Chính & Cọc Riêng</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo Đơn Booking Mới
          </button>
        </div>
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

      {/* Thông báo thao tác Admin nếu có */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all animate-in fade-in duration-200 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                <th className="py-3.5 px-4">{hasFinanceAccess ? 'Tài Chính & Cọc' : 'Thanh Toán'}</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">{isAdmin ? 'Quản Trị (Admin)' : 'Tiến Độ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] font-medium text-neutral-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold text-sm text-neutral-800">Chưa có đơn booking lịch chụp nào trong hệ thống</p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                      Đơn booking chỉ được tạo cho các lớp đã chốt cọc trong CRM. Bấm nút "+ Tạo Đơn Booking Mới" ở góc trên bên phải để chọn lớp đã cọc và lên lịch!
                    </p>
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
                              {bk.className ? `Lớp ${bk.className}` : ''}
                            </p>
                            <p className="text-[11px] text-neutral-500">{bk.schoolName}</p>
                            {bk.customerId && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCustomerId(bk.customerId);
                                }}
                                className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 hover:bg-neutral-900 text-neutral-700 hover:text-[#B8F23D] rounded-md text-[10px] font-bold border border-black/[0.08] transition-colors"
                                title="Mở Hồ Sơ Khách Hàng CRM 360°"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Hồ sơ CRM</span>
                              </button>
                            )}
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
                            {bk.assignments.assistantNames && bk.assignments.assistantNames.length > 0 && (
                              <p className="text-[10px] text-neutral-500 font-medium truncate max-w-[160px]" title={bk.assignments.assistantNames.join(', ')}>
                                Phụ: {bk.assignments.assistantNames.join(', ')}
                              </p>
                            )}
                            {bk.assignments.videographerName && (
                              <p className="text-[10px] text-sky-600 font-medium">
                                Quay: {bk.assignments.videographerName}
                              </p>
                            )}
                            {bk.assignments.individualPhotographerName && (
                              <p className="text-[10px] text-purple-600 font-medium">
                                Cá nhân: {bk.assignments.individualPhotographerName}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasFinanceAccess ? (
                          <>
                            <p className="font-bold text-neutral-900">
                              {bk.totalAmount.toLocaleString('vi-VN')}đ
                            </p>
                            <p className="text-[11px] text-emerald-700 font-semibold">
                              Đã cọc: {bk.depositAmount.toLocaleString('vi-VN')}đ
                            </p>
                            {bk.remainingAmount > 0 ? (
                              <p className="text-[10px] text-rose-600 font-semibold">
                                Thiếu: {bk.remainingAmount.toLocaleString('vi-VN')}đ
                              </p>
                            ) : (
                              <p className="text-[10px] text-emerald-600 font-semibold">
                                ✓ Đủ 100%
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {bk.paymentStatus || 'Chưa cọc'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bookingStatusBadges[bk.bookingStatus]}`}>
                          {bk.bookingStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={bk.bookingStatus}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              const nextVal = e.target.value as BookingStatus;
                              if (nextVal === 'Hủy') {
                                if (!isAdmin) {
                                  alert('⛔ Chỉ tài khoản Quản trị viên (Admin) mới có quyền Hủy đơn booking!');
                                  return;
                                }
                                setBookingToCancel(bk);
                                return;
                              }
                              handleStatusChange(bk, nextVal);
                            }}
                            className="px-2 py-1 bg-neutral-50 border border-black/[0.08] rounded-lg text-[11px] font-semibold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
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

                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              {bk.bookingStatus !== 'Hủy' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setBookingToCancel(bk);
                                  }}
                                  className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                                  title="Admin: Hủy đơn booking & giải phóng lịch thợ vào Database"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBookingToDelete(bk);
                                }}
                                className="p-1.5 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                                title="Admin: Xóa đơn booking vào thùng rác Database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-neutral-50/50 border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Tổng cộng <strong className="text-neutral-900">{filteredBookings.length}</strong> đơn booking (Nhấp vào hàng để xem chi tiết)</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md font-semibold text-[10px]">
              <Database className="w-3 h-3" /> REST API SQL Server
            </span>
          </div>
          <span>Hệ thống tự động đồng bộ CSDL và bảo vệ phân quyền Admin</span>
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

      {/* ================= MODAL XÁC NHẬN HỦY BOOKING (CHỈ ADMIN) ================= */}
      {bookingToCancel && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div
            onClick={() => {
              if (!isProcessing) {
                setBookingToCancel(null);
                setCancelReason('');
              }
            }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
          />

          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
            {/* Header */}
            <div className="px-6 py-5 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900">
                    Xác Nhận Hủy Đơn Booking
                  </h3>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Phân quyền Quản trị viên (Admin) • Đồng bộ Database
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setBookingToCancel(null);
                  setCancelReason('');
                }}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors font-bold disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 text-[11px]">
                    {bookingToCancel.code}
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    {bookingToCancel.shootDate} ({bookingToCancel.startTime} - {bookingToCancel.endTime})
                  </span>
                </div>
                <p className="font-bold text-neutral-900 text-sm">
                  Lớp {bookingToCancel.className} - {bookingToCancel.schoolName}
                </p>
                <p className="text-neutral-600">
                  <strong>Thợ phụ trách:</strong> {bookingToCancel.assignments?.leadPhotographerName || 'Chưa gán'}
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Khi hủy, đơn booking sẽ chuyển trạng thái sang <strong>"Hủy"</strong> trong Database. <strong>Lịch chụp của toàn bộ Ekip thợ liên quan sẽ được tự động giải phóng</strong> để nhận các đơn chụp khác mà không bị báo trùng lịch.
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  Lý do hủy đơn (Tùy chọn, sẽ lưu vào lịch sử & Database):
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Khách dời lịch sang tháng sau, lớp hủy hợp đồng kỷ yếu, thời tiết xấu hoãn chụp..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.1] rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-neutral-50/80 border-t border-black/[0.06] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setBookingToCancel(null);
                  setCancelReason('');
                }}
                className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-black/[0.08] transition-colors cursor-pointer text-xs disabled:opacity-50"
              >
                Quay Lại
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? 'Đang lưu CSDL...' : 'Xác Nhận Hủy Booking'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= MODAL XÁC NHẬN XÓA BOOKING VÀO THÙNG RÁC (CHỈ ADMIN) ================= */}
      {bookingToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div
            onClick={() => {
              if (!isProcessing) setBookingToDelete(null);
            }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
          />

          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
            {/* Header */}
            <div className="px-6 py-5 bg-rose-50/80 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-900">
                    Xóa Đơn Booking Vào Thùng Rác
                  </h3>
                  <p className="text-[11px] text-rose-800 font-medium">
                    Chỉ Admin • Xóa an toàn vào CSDL SQLite (Soft-delete)
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setBookingToDelete(null)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors font-bold disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 text-[11px]">
                    {bookingToDelete.code}
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    {bookingToDelete.shootDate} ({bookingToDelete.startTime} - {bookingToDelete.endTime})
                  </span>
                </div>
                <p className="font-bold text-neutral-900 text-sm">
                  Lớp {bookingToDelete.className} - {bookingToDelete.schoolName}
                </p>
                <p className="text-neutral-600">
                  <strong>Khách hàng:</strong> {bookingToDelete.customerName} • <strong>Ekip:</strong> {bookingToDelete.assignments?.leadPhotographerName || 'Chưa gán'}
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200 flex items-start gap-2.5 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <p className="font-bold">Cảnh báo bảo mật:</p>
                  <p className="mt-0.5">
                    Hành động này sẽ xóa đơn khỏi bảng điều hành hiện tại và chuyển vào thùng rác CSDL SQL Server với cờ <code>is_deleted = 1</code>. Thợ ảnh liên quan sẽ được giải phóng lịch chụp hoàn toàn.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-neutral-50/80 border-t border-black/[0.06] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setBookingToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-black/[0.08] transition-colors cursor-pointer text-xs disabled:opacity-50"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? 'Đang xóa trong CSDL...' : 'Xóa Đơn (Đồng Bộ Database)'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
