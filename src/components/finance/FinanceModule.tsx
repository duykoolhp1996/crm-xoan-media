import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, PipelineStage } from '../../types';
import {
  canUserAccessFinance,
  filterAccessibleCustomers,
  getSalesHierarchyInfo
} from '../../utils/salesPermissions';
import {
  getCustomerTotalOrderValue,
  getCustomerPaidDeposit,
  getCustomerRemainingDebt,
  isCustomerBookedOrDeposited,
  isCustomerPaidInFull
} from '../../lib/revenueUtils';
import { DepositQrModal } from '../payment/DepositQrModal';
import {
  CircleDollarSign,
  Search,
  Filter,
  ArrowUpDown,
  Lock,
  QrCode,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  Receipt,
  UserCheck,
  Calendar,
  Building2,
  Phone,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const {
    customers,
    bookings,
    currentUser,
    currentRole,
    salesStaff,
    setSelectedCustomerId,
    setActiveTab
  } = useApp();

  // 1. Phân quyền bảo mật cao: Chỉ Admin & Sales ĐÃ ĐƯỢC CẤP QUYỀN mới được xem
  const hasAccess = canUserAccessFinance(currentUser, currentRole, salesStaff);

  // Modal VietQR Thu Tiền / Cọc
  const [qrCustomer, setQrCustomer] = useState<Customer | null>(null);
  const [qrMode, setQrMode] = useState<'deposit' | 'final'>('deposit');

  // Bộ lọc & Tìm kiếm (Mặc định là 'deposited' - Chỉ hiển thị các đơn ĐÃ CHỐT CỌC & CÓ DÒNG TIỀN)
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'deposited' | 'paid_in_full' | 'has_debt' | 'no_deposit'>('deposited');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [salesFilter, setSalesFilter] = useState<string>('all');

  // Lọc danh sách khách theo phân cấp Sales (nếu user là Sales)
  const scopedCustomers = useMemo<Customer[]>(() => {
    return filterAccessibleCustomers(customers, currentUser, currentRole, salesStaff);
  }, [customers, currentUser, currentRole, salesStaff]);

  // Danh sách các đơn (loại trừ đã xóa mềm và Lost)
  const financeCustomers = useMemo(() => {
    return scopedCustomers.filter(c => !c.isDeleted && c.pipelineStage !== 'Lost');
  }, [scopedCustomers]);

  // Lọc theo từ khóa và trạng thái
  const filteredList = useMemo(() => {
    return financeCustomers.filter(c => {
      // 1. Tìm kiếm
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(term);
        const matchSchool = (c.schoolName || '').toLowerCase().includes(term);
        const matchClass = (c.className || '').toLowerCase().includes(term);
        const matchPhone = (c.phone || '').includes(term);
        const matchSales = (c.assignedSalesName || '').toLowerCase().includes(term);
        if (!matchName && !matchSchool && !matchClass && !matchPhone && !matchSales) {
          return false;
        }
      }

      // 2. Lọc theo trạng thái thanh toán chuẩn xác
      const total = getCustomerTotalOrderValue(c);
      const paid = getCustomerPaidDeposit(c);
      const isDeposited = isCustomerBookedOrDeposited(c, bookings);
      const isPaidFull = isCustomerPaidInFull(c, bookings);
      const hasDebt = isDeposited && total > paid && (total - paid) > 0;
      const isNoDeposit = !isDeposited || paid === 0;

      if (paymentFilter === 'deposited') {
        if (!isDeposited) return false;
      } else if (paymentFilter === 'paid_in_full') {
        if (!isPaidFull) return false;
      } else if (paymentFilter === 'has_debt') {
        if (!hasDebt) return false;
      } else if (paymentFilter === 'no_deposit') {
        if (!isNoDeposit) return false;
      }

      // 3. Lọc theo Pipeline Stage
      if (stageFilter !== 'all') {
        if (c.pipelineStage !== stageFilter) return false;
      }

      // 4. Lọc theo Sales
      if (salesFilter !== 'all') {
        if (c.assignedSalesId !== salesFilter && c.assignedSalesName !== salesFilter) return false;
      }

      return true;
    });
  }, [financeCustomers, searchTerm, paymentFilter, stageFilter, salesFilter, bookings]);

  // Thống kê tài chính tổng hợp (Chỉ tính các đơn ĐÃ CHỐT CỌC / ĐÃ PHÁT SINH BOOKING)
  const stats = useMemo(() => {
    let totalContractValue = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let totalDepositedCount = 0;
    let totalPaidFullCount = 0;

    financeCustomers.forEach(c => {
      if (isCustomerBookedOrDeposited(c, bookings)) {
        const total = getCustomerTotalOrderValue(c);
        const paid = getCustomerPaidDeposit(c);
        const debt = getCustomerRemainingDebt(c);

        totalContractValue += total;
        totalCollected += paid;
        totalRemaining += debt;
        totalDepositedCount += 1;

        if (isCustomerPaidInFull(c, bookings)) {
          totalPaidFullCount += 1;
        }
      }
    });

    const recoveryRate = totalContractValue > 0 ? Math.round((totalCollected / totalContractValue) * 100) : 0;

    return {
      totalContractValue,
      totalCollected,
      totalRemaining,
      totalDepositedCount,
      totalPaidFullCount,
      recoveryRate
    };
  }, [financeCustomers, bookings]);

  // MÀN HÌNH KHÓA BẢO MẬT: Nếu Sales hoặc người dùng chưa được cấp quyền
  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-black/[0.08] p-8 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-neutral-900 tracking-tight">
              Bảng Tài Chính & Cọc Bị Khóa
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Khu vực này chứa dữ liệu tài chính, doanh thu hợp đồng và dòng tiền nhạy cảm của Studio. 
              Chỉ <strong>Admin</strong> và các nhân viên <strong>Sales đã được cấp quyền</strong> mới có thể truy cập.
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Cách kích hoạt quyền truy cập:
            </p>
            <p className="text-[11px] text-amber-700">
              Vui lòng liên hệ Admin để bật cờ <em>"Cấp quyền xem Bảng Tài Chính & Cọc"</em> trong Cài đặt Quản lý tài khoản Sales.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-emerald-600" />
            Bảng Quản Lý Tài Chính & Cọc Kỷ Yếu
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
            <span>Theo dõi doanh thu, số tiền đã cọc, công nợ còn lại và tạo mã VietQR thanh toán</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Quyền xem bảo mật (Admin & Sales ủy quyền)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-2 rounded-xl">
            Tổng {filteredList.length} lớp / đơn hàng
          </span>
        </div>
      </div>

      {/* 4 THẺ KPI TÀI CHÍNH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Doanh Thu Hợp Đồng */}
        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Tổng Giá Trị Hợp Đồng
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-50 text-[#79ba07] flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono tracking-tight">
            {(stats.totalContractValue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            Từ <strong>{stats.totalDepositedCount}</strong> lớp đã chốt cọc trong hệ thống
          </p>
        </div>

        {/* Card 2: Thực Thu (Đã Cọc & Thanh Toán) */}
        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Số Tiền Đã Thu (Thực Thu)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
            {(stats.totalCollected / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã thu vào tài khoản • Đạt {stats.recoveryRate}% tổng giá trị
          </p>
        </div>

        {/* Card 3: Công Nợ Còn Lại */}
        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Công Nợ Còn Lại (Chưa Thu)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
            {(stats.totalRemaining / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            Cần thu khi tiến hành chụp & bàn giao ảnh
          </p>
        </div>

        {/* Card 4: Tỷ Lệ Tất Toán */}
        <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Tất Toán Đủ 100%
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono tracking-tight">
            {stats.totalPaidFullCount} / {stats.totalDepositedCount} Đơn
          </div>
          <p className="text-[11px] text-purple-600 font-semibold">
            Đã thanh toán đủ toàn bộ hợp đồng
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-black/[0.08] p-3.5 sm:p-4 rounded-2xl shadow-xs space-y-3">
        {/* Hàng 1: Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setPaymentFilter('deposited')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              paymentFilter === 'deposited'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Đã chốt cọc ({stats.totalDepositedCount})
          </button>
          <button
            type="button"
            onClick={() => setPaymentFilter('paid_in_full')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              paymentFilter === 'paid_in_full'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Đã thu đủ 100% ({stats.totalPaidFullCount})
          </button>
          <button
            type="button"
            onClick={() => setPaymentFilter('has_debt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              paymentFilter === 'has_debt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Còn nợ ({Math.max(0, stats.totalDepositedCount - stats.totalPaidFullCount)})
          </button>
          <button
            type="button"
            onClick={() => setPaymentFilter('no_deposit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              paymentFilter === 'no_deposit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Chưa chốt cọc (Lead)
          </button>
          <button
            type="button"
            onClick={() => setPaymentFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              paymentFilter === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Tất cả ({financeCustomers.length})
          </button>
        </div>

        {/* Hàng 2: Tìm kiếm và các bộ lọc chi tiết */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-1 border-t border-black/[0.04]">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên lớp, trường, khách hàng, số điện thoại, Sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Lọc tiến trình chụp */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả tiến trình chụp</option>
              <option value="Đã cọc">Đã cọc</option>
              <option value="Book ngày">Book ngày</option>
              <option value="Đã chụp">Đã chụp</option>
              <option value="Đang hậu kỳ">Đang hậu kỳ</option>
              <option value="Giao ảnh">Giao ảnh</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>

            {/* Lọc theo Sales (dành cho Admin hoặc Lead) */}
            {salesStaff.length > 0 && (
              <select
                value={salesFilter}
                onChange={(e) => setSalesFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
              >
                <option value="all">Tất cả Sales</option>
                {salesStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.roleTitle})</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* TABLE TÀI CHÍNH & CỌC */}
      <div className="bg-white rounded-3xl border border-black/[0.08] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-black/[0.06] uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Lớp Học & Khách Hàng</th>
                <th className="py-3.5 px-4">Gói Dịch Vụ & Sĩ Số</th>
                <th className="py-3.5 px-4">Sales & CSKH</th>
                <th className="py-3.5 px-4">Tổng Hợp Đồng</th>
                <th className="py-3.5 px-4">Đã Thu (Cọc / Tất Toán)</th>
                <th className="py-3.5 px-4">Công Nợ Còn Lại</th>
                <th className="py-3.5 px-4">Tiến Trình Chụp</th>
                <th className="py-3.5 px-4 text-right">Thao Tác VietQR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] font-medium text-neutral-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold text-sm text-neutral-800">Không tìm thấy bản ghi tài chính nào phù hợp</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Thử chuyển sang tab "Tất cả" hoặc điều chỉnh lại từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((cust) => {
                  const total = getCustomerTotalOrderValue(cust);
                  const paid = getCustomerPaidDeposit(cust);
                  const isDeposited = isCustomerBookedOrDeposited(cust, bookings);
                  const isPaidFull = isCustomerPaidInFull(cust, bookings);
                  const debt = isDeposited ? Math.max(0, total - paid) : 0;
                  const hasDebt = isDeposited && debt > 0;

                  return (
                    <tr key={cust.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* 1. Lớp học & Trường */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                            <span className="text-[#79ba07]">{cust.className || 'Chưa rõ lớp'}</span>
                            <span className="text-neutral-400">•</span>
                            <span className="truncate max-w-[170px]">{cust.schoolName}</span>
                          </p>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-3 h-3 text-neutral-400" />
                            <span>{cust.name}</span>
                            {cust.representativeRole && (
                              <span className="text-[10px] text-neutral-400">({cust.representativeRole})</span>
                            )}
                          </p>
                          {cust.phone && (
                            <p className="text-[10px] text-neutral-400 font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              {cust.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 2. Gói dịch vụ & Sĩ số */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900 max-w-[180px] truncate" title={cust.servicePackageName}>
                          {cust.servicePackageName || 'Chưa chọn gói'}
                        </p>
                        <p className="text-[11px] text-[#79ba07] font-semibold mt-0.5">
                          Concept: {cust.concept || 'Tự do'}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Sĩ số: <strong>{cust.studentCount || 0}</strong> học sinh
                        </p>
                      </td>

                      {/* 3. Sales phụ trách */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900 text-xs">
                          {cust.assignedSalesName || 'Chưa gán'}
                        </p>
                        {cust.assignedCareStaffName && (
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            CSKH: {cust.assignedCareStaffName}
                          </p>
                        )}
                        {cust.depositDate && (
                          <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                            Ngày cọc: {cust.depositDate}
                          </p>
                        )}
                      </td>

                      {/* 4. Tổng Giá Trị Hợp Đồng */}
                      <td className="py-3.5 px-4">
                        {isDeposited ? (
                          <span className="font-black text-neutral-900 text-xs font-mono">
                            {total.toLocaleString('vi-VN')}đ
                          </span>
                        ) : (
                          <div>
                            <span className="font-bold text-neutral-600 text-xs font-mono">
                              {total > 0 ? `${total.toLocaleString('vi-VN')}đ` : '0đ'}
                            </span>
                            <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                              (Dự toán chào giá)
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 5. Tiền Đã Thu */}
                      <td className="py-3.5 px-4">
                        {paid > 0 ? (
                          <div>
                            <span className="font-bold text-emerald-700 text-xs font-mono">
                              {paid.toLocaleString('vi-VN')}đ
                            </span>
                            {total > 0 && (
                              <p className="text-[10px] text-neutral-500 mt-0.5">
                                Đạt {Math.min(100, Math.round((paid / total) * 100))}% HĐ
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-neutral-400 text-xs font-mono">0đ</span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Chưa có cọc
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 6. Công Nợ Còn Lại / Tình Trạng Thanh Toán */}
                      <td className="py-3.5 px-4">
                        {isPaidFull ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Đã thu đủ 100%
                            </span>
                            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                              Hết nợ (Đã tất toán)
                            </p>
                          </div>
                        ) : hasDebt ? (
                          <div>
                            <span className="font-bold text-rose-600 text-xs font-mono">
                              {debt.toLocaleString('vi-VN')}đ
                            </span>
                            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">
                              ⚠️ Còn thiếu
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                              Chưa chốt cọc
                            </span>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              Lead chưa phát sinh nợ
                            </p>
                          </div>
                        )}
                      </td>

                      {/* 7. Tiến Trình Chụp (Pipeline Stage) */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          cust.pipelineStage === 'Hoàn thành'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : cust.pipelineStage === 'Đã cọc'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : cust.pipelineStage === 'Book ngày'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}>
                          {cust.pipelineStage}
                        </span>
                      </td>

                      {/* 8. Thao tác VietQR & Hồ sơ */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Tạo QR Cọc / Tất Toán */}
                          <button
                            type="button"
                            onClick={() => {
                              setQrCustomer(cust);
                              setQrMode(isPaidFull ? 'final' : hasDebt ? 'final' : 'deposit');
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer ${
                              isPaidFull
                                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                                : hasDebt
                                ? 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D]'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title={isPaidFull ? "Xem lại mã QR tất toán" : hasDebt ? "Tạo mã QR thu số tiền còn nợ" : "Tạo mã QR VietQR thu cọc"}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{isPaidFull ? 'Xem QR' : hasDebt ? 'Thu Nốt' : 'Thu Cọc'}</span>
                          </button>

                          {/* Nút Xem Hồ Sơ CRM */}
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs transition-colors cursor-pointer"
                            title="Mở Hồ Sơ Khách Hàng CRM 360°"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẠO CỌC & TẤT TOÁN VIETQR */}
      <DepositQrModal
        customer={qrCustomer}
        isOpen={Boolean(qrCustomer)}
        mode={qrMode}
        onClose={() => setQrCustomer(null)}
      />
    </div>
  );
};
