import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, PipelineStage, LeadSource } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  School,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  Headphones,
  UserCheck,
  Trash2,
  Edit3,
  DollarSign,
  Wallet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerDetail360 } from './CustomerDetail360';
import { CustomerModal } from './CustomerModal';
import {
  isCustomerBookedOrDeposited,
  getCustomerTotalOrderValue,
  getCustomerPaidDeposit,
  getCustomerRemainingDebt,
  calculateCrmFinancials,
  isCustomerInStage
} from '../../lib/revenueUtils';
import {
  getSalesHierarchyInfo,
  filterAccessibleCustomers
} from '../../utils/salesPermissions';

export const CustomerList: React.FC = () => {
  const {
    customers,
    bookings,
    selectedCustomerId,
    setSelectedCustomerId,
    updateCustomerStage,
    deleteCustomer,
    currentUser,
    currentRole,
    salesStaff
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [leadMemberFilter, setLeadMemberFilter] = useState<string>('all_team');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const handleOpenCreate = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomerToEdit(cust);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCustomerToEdit(null);
  };

  // Thông tin phân cấp Sales & Sales Lead
  const salesHierarchy = useMemo(() => {
    return getSalesHierarchyInfo(currentUser, currentRole, salesStaff);
  }, [currentUser, currentRole, salesStaff]);

  // Lọc quyền truy cập:
  // - Admin: Xem toàn bộ
  // - Sales Lead: Data do Admin phân quyền + Data các nhân sự dưới quyền thu thập được
  // - Sales thường: Chỉ data của chính mình
  const accessibleCustomers = useMemo(() => {
    const baseAccessible = filterAccessibleCustomers(customers, currentUser, currentRole, salesStaff);

    // Nếu là Sales Lead và có chọn xem riêng theo nhân sự trong nhóm
    if (salesHierarchy.isLead && leadMemberFilter !== 'all_team') {
      if (leadMemberFilter === 'mine') {
        const myId = salesHierarchy.myStaff?.id || currentUser.id;
        const myName = (salesHierarchy.myStaff?.name || currentUser.name).toLowerCase();
        return baseAccessible.filter(c => 
          c.assignedSalesId === myId || 
          c.assignedSalesName?.toLowerCase() === myName ||
          c.createdById === myId ||
          c.createdByName?.toLowerCase() === myName
        );
      } else {
        // Lọc theo một nhân viên cấp dưới cụ thể
        const targetStaff = salesHierarchy.subordinateStaff.find(s => s.id === leadMemberFilter);
        const targetName = targetStaff?.name?.toLowerCase() || '';
        return baseAccessible.filter(c =>
          c.assignedSalesId === leadMemberFilter ||
          (targetName && c.assignedSalesName?.toLowerCase() === targetName) ||
          c.createdById === leadMemberFilter ||
          (targetName && c.createdByName?.toLowerCase() === targetName)
        );
      }
    }

    return baseAccessible;
  }, [customers, currentUser, currentRole, salesStaff, salesHierarchy, leadMemberFilter]);

  // Lọc dữ liệu
  const filteredCustomers = useMemo(() => {
    return accessibleCustomers.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.region && c.region.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSource = selectedSource === 'all' || c.source === selectedSource;
      const matchStage = selectedStage === 'all' || isCustomerInStage(c.pipelineStage, selectedStage);

      return matchSearch && matchSource && matchStage;
    });
  }, [accessibleCustomers, searchTerm, selectedSource, selectedStage]);

  // Thống kê tài chính thời gian thực: chỉ tính doanh thu với các lớp đã book & cọc, tách cọc và công nợ
  const financialStats = useMemo(() => {
    return calculateCrmFinancials(accessibleCustomers, bookings);
  }, [accessibleCustomers, bookings]);

  // Stage badges colors on light glass
  const stageBadges: Record<string, string> = {
    'New Lead': 'bg-neutral-100 text-neutral-700 border-neutral-200',
    'Đang tư vấn': 'bg-sky-50 text-sky-700 border-sky-200',
    'Đã gửi báo giá': 'bg-purple-50 text-purple-700 border-purple-200',
    'Đã cọc': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold',
    'Book ngày': 'bg-purple-50 text-purple-800 border-purple-300 font-extrabold',
    'Đã chụp': 'bg-blue-50 text-blue-800 border-blue-300 font-extrabold',
    'Đang hậu kỳ': 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold',
    'Giao ảnh': 'bg-teal-50 text-teal-800 border-teal-300 font-extrabold',
    'Hoàn thành': 'bg-emerald-100 text-emerald-900 border-emerald-400 font-extrabold',
    'Lost': 'bg-rose-50 text-rose-700 border-rose-200',
    'Đã đặt cọc': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Đã Booking': 'bg-purple-50 text-purple-800 border-purple-300',
    'Đã bàn giao': 'bg-teal-50 text-teal-800 border-teal-300'
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-900" />
            Hồ Sơ Khách Hàng & Leads Kỷ Yếu
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Quản lý tập trung thông tin lớp, ban đại diện, nhu cầu concept và nguồn tiếp cận
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/danh_sach_khach_hang_xoan_media.xlsx"
            download="danh_sach_khach_hang_xoan_media.xlsx"
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            title="Tải Mẫu Bảng Tính Khách Hàng Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5" />
            Tải File Sheet (.xlsx)
          </a>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Khách Hàng Mới
          </button>
        </div>
      </div>

      {/* Financial Overview Summary Bar: Ghi nhận Tổng Doanh Thu với Lớp Đã Book & Cọc, tách riêng Thực Thu & Công Nợ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Doanh thu đơn đã book & cọc */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">DOANH THU ĐÃ CHỐT</span>
            <div className="w-7 h-7 rounded-xl bg-[#B8F23D]/30 flex items-center justify-center text-neutral-900">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-neutral-900 mt-1">
            {(financialStats.totalRevenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </p>
          <span className="text-[10px] font-semibold text-emerald-700 mt-0.5 block">
            {financialStats.bookedCount} lớp đã book & cọc
          </span>
        </div>

        {/* Card 2: Thực thu đã nhận */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">THỰC THU (ĐÃ NHẬN)</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-emerald-700 mt-1">
            {(financialStats.totalCollected / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </p>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">
            {((financialStats.totalCollected / (financialStats.totalRevenue || 1)) * 100).toFixed(0)}% giá trị đơn
          </span>
        </div>

        {/* Card 3: Công nợ phải thu */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">CÔNG NỢ CÒN LẠI</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-rose-600 mt-1">
            {(financialStats.totalRemainingDebt / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </p>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">
            Chờ thanh toán các đợt tiếp & giao ảnh
          </span>
        </div>

        {/* Card 4: Dự toán chào giá */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">DỰ TOÁN CHƯA CỌC</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-neutral-700 mt-1">
            {(financialStats.unbookedPotential / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </p>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">
            {financialStats.totalCount - financialStats.bookedCount} lead đang chăm sóc/báo giá
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel-subtle p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, SĐT, trường (Ams, Chu Văn An...), lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 shrink-0">Nguồn:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
          >
            <option value="all">Tất cả nguồn ({accessibleCustomers.length})</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Khách hàng cũ">Khách hàng cũ</option>
          </select>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 shrink-0">Trạng thái:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
          >
            <option value="all">Tất cả giai đoạn</option>
            <option value="New Lead">New Lead</option>
            <option value="Đang tư vấn">Đang tư vấn</option>
            <option value="Đã gửi báo giá">Đã gửi báo giá</option>
            <option value="Đã cọc">Đã cọc (Đã chốt)</option>
            <option value="Book ngày">Book ngày</option>
            <option value="Đã chụp">Đã chụp</option>
            <option value="Đang hậu kỳ">Đang hậu kỳ</option>
            <option value="Giao ảnh">Giao ảnh</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Lost">Khách từ chối (Lost)</option>
          </select>
        </div>

        {/* Bộ Lọc Theo Nhân Sự Cho Sales Lead */}
        {salesHierarchy.isLead && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 shrink-0">Nhóm:</span>
            <select
              value={leadMemberFilter}
              onChange={(e) => setLeadMemberFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-900 text-[#B8F23D] border border-black/[0.08] rounded-xl text-xs font-bold cursor-pointer focus:outline-none"
            >
              <option value="all_team">👑 Toàn bộ nhóm Sales ({salesHierarchy.subordinateStaff.length + 1} nhân sự)</option>
              <option value="mine">👤 Riêng của tôi (Sales Lead)</option>
              {salesHierarchy.subordinateStaff.map(sub => (
                <option key={sub.id} value={sub.id}>
                  ↳ {sub.name} ({sub.roleTitle || 'Sales'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mobile Card View (Chuyên dụng cho màn hình điện thoại - Tuyệt đối không bị vỡ/tràn) */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 bg-white rounded-3xl border border-black/[0.06]">
            <p className="font-semibold text-sm">Chưa có khách hàng hoặc lớp học nào trong hệ thống</p>
          </div>
        ) : (
          filteredCustomers.map(cust => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomerId(cust.id)}
              className="bg-white p-4 rounded-3xl border border-black/[0.06] shadow-xs space-y-3 cursor-pointer active:scale-[0.99] transition-all"
            >
              {/* Header card: Lớp + Badge Stage */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-10 h-10 rounded-2xl bg-[#B8F23D]/30 border border-[#B8F23D]/60 text-neutral-950 font-black flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {(cust.className || cust.name || 'CRM').slice(0, 3).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-black text-sm text-neutral-900 truncate">
                      {cust.className || cust.schoolName}
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                      <School className="w-3 h-3 shrink-0" /> {cust.className ? cust.schoolName : (cust.district || cust.city || 'Chưa rõ trường')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${
                  stageBadges[cust.pipelineStage] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}>
                  {cust.pipelineStage}
                </span>
              </div>

              {/* Thông tin đại diện & SĐT */}
              <div className="p-2.5 bg-neutral-50 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">{cust.name} ({cust.representativeRole})</span>
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-neutral-400" /> {cust.phone ? cust.phone : <span className="italic text-neutral-400">Chưa có SĐT</span>}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                    {cust.assignedSalesName || 'Chưa gán'}
                  </span>
                </div>
              </div>

              {/* Gói & Concept + Tài chính */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 font-medium uppercase block">Gói & Concept</span>
                  <span className="font-bold text-[#79ba07] text-[11px]">
                    {cust.servicePackageName || 'Kỷ yếu Concept'} • {cust.concept}
                  </span>
                </div>
                <div className="text-right">
                  {isCustomerBookedOrDeposited(cust, bookings) ? (
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">DOANH THU HĐ</span>
                      <span className="font-black text-neutral-900 text-xs block">
                        {getCustomerTotalOrderValue(cust).toLocaleString('vi-VN')}đ
                      </span>
                      <div className="text-[10px] font-semibold flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-emerald-700">Đã thu: {getCustomerPaidDeposit(cust).toLocaleString('vi-VN')}đ</span>
                        {getCustomerRemainingDebt(cust) > 0 ? (
                          <span className="text-rose-600">• Nợ: {getCustomerRemainingDebt(cust).toLocaleString('vi-VN')}đ</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">• Xong 100%</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-neutral-400 font-medium uppercase block">DỰ TOÁN BÁO GIÁ</span>
                      <span className="font-bold text-neutral-700 text-xs block">
                        {getCustomerTotalOrderValue(cust).toLocaleString('vi-VN')}đ
                      </span>
                      <div className="text-[10px] text-neutral-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                        <span>Đã thu: 0đ</span>
                        <span className="italic">• Chưa chốt (Không nợ)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Data Table (Chỉ hiện trên Desktop/Tablet lớn) */}
      <div className="hidden md:block glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-400 font-bold border-b border-black/[0.05] uppercase tracking-wider">
                <th className="py-3.5 px-4">Lớp & Trường Học</th>
                <th className="py-3.5 px-4">Người Đại Diện</th>
                <th className="py-3.5 px-4">Gói & Concept</th>
                <th className="py-3.5 px-4">Nguồn Tiếp Cận</th>
                <th className="py-3.5 px-4">Giai Đoạn</th>
                <th className="py-3.5 px-4">Tài Chính</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium text-neutral-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <p className="font-semibold text-sm">Chưa có khách hàng hoặc lớp học nào trong hệ thống</p>
                    <p className="text-xs text-neutral-400 mt-1">Bấm nút "+ Thêm Lớp Mới" ở góc trên bên phải để bắt đầu nhập dữ liệu mới!</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomerId(cust.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#B8F23D]/30 border border-[#B8F23D]/50 text-neutral-900 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {(cust.className || cust.name || 'CRM').slice(0, 3).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                            {cust.className || cust.schoolName}
                          </p>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <School className="w-3 h-3 text-neutral-400" /> {cust.className ? cust.schoolName : (cust.district || cust.city || 'Chưa rõ trường')}
                          </p>
                          {(cust.district || cust.city || cust.region) && (
                            <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                              <span>{cust.district ? `${cust.district}, ` : ''}{cust.city || cust.region}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-neutral-900">{cust.name}</p>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-neutral-400" /> {cust.phone ? cust.phone : <span className="italic text-neutral-400">Chưa có SĐT</span>} ({cust.representativeRole})
                      </p>
                      <p className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-blue-700 font-semibold">
                          <UserCheck className="w-3 h-3 text-blue-500" /> Sales: {cust.assignedSalesName || 'Chưa gán'}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="flex items-center gap-1 text-neutral-600">
                          <Headphones className="w-3 h-3 text-neutral-400" /> CSKH: {cust.assignedCareStaffName || 'Phạm Quỳnh Nga'}
                        </span>
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-neutral-900">{cust.servicePackageName || 'Chưa chọn'}</p>
                      <p className="text-[11px] text-[#79ba07] font-semibold">Concept: {cust.concept}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {cust.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                        stageBadges[cust.pipelineStage] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}>
                        {cust.pipelineStage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isCustomerBookedOrDeposited(cust, bookings) ? (
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-neutral-900 text-xs">
                            {getCustomerTotalOrderValue(cust).toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-[11px] font-semibold flex items-center gap-1.5 flex-wrap">
                            <span className="text-emerald-700">Đã thu: {getCustomerPaidDeposit(cust).toLocaleString('vi-VN')}đ</span>
                            {getCustomerRemainingDebt(cust) > 0 ? (
                              <span className="text-rose-600 font-bold">• Nợ: {getCustomerRemainingDebt(cust).toLocaleString('vi-VN')}đ</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">• Đủ 100%</span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="font-bold text-neutral-700 text-xs">
                            {getCustomerTotalOrderValue(cust).toLocaleString('vi-VN')}đ
                          </p>
                          <p className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5 flex-wrap">
                            <span className="text-neutral-600 font-semibold">Đã thu: 0đ</span>
                            <span className="text-neutral-400 italic">• Chưa chốt cọc (Không nợ)</span>
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(cust, e)}
                          title="Chỉnh sửa thông tin khách hàng"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(cust.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-[#B8F23D] text-neutral-800 text-[11px] font-bold transition-all"
                        >
                          Chi tiết
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${cust.name}" (${cust.className ? `${cust.className} - ` : ''}${cust.phone || 'Chưa có SĐT'}) khỏi hệ thống CRM không?`)) {
                              deleteCustomer(cust.id);
                            }
                          }}
                          title="Xóa khách hàng này"
                          className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 Detail Drawer / Modal */}
      {selectedCustomerId && (
        <CustomerDetail360
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};
