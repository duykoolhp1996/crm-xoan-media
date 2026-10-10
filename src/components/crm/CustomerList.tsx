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
  AlertCircle,
  RotateCcw
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
  const [selectedSales, setSelectedSales] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedFinance, setSelectedFinance] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<string>('all');
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

  // Thống kê Lead Mới & Toàn bộ Lead cho Top KPI Cards & Quick Filters
  const leadStats = useMemo(() => {
    const total = accessibleCustomers.length;
    const newLeads = accessibleCustomers.filter(c => ['New Lead', 'Mới tiếp nhận'].includes(c.pipelineStage));
    const unassigned = accessibleCustomers.filter(c => !c.assignedSalesName || c.assignedSalesName === 'Chưa gán' || c.assignedSalesName.trim() === '');
    const consulting = accessibleCustomers.filter(c => ['Đang tư vấn', 'Đã liên hệ'].includes(c.pipelineStage));
    const quote = accessibleCustomers.filter(c => ['Đã gửi báo giá', 'Đang thương lượng'].includes(c.pipelineStage));
    const deposited = accessibleCustomers.filter(c => ['Đã cọc', 'Đã đặt cọc'].includes(c.pipelineStage));
    const booked = accessibleCustomers.filter(c => ['Book ngày', 'Đã Booking'].includes(c.pipelineStage));
    const withDebt = accessibleCustomers.filter(c => getCustomerRemainingDebt(c) > 0);

    return {
      total,
      newLeadsCount: newLeads.length,
      unassignedCount: unassigned.length,
      consultingCount: consulting.length,
      quoteCount: quote.length,
      depositedCount: deposited.length,
      bookedCount: booked.length,
      withDebtCount: withDebt.length
    };
  }, [accessibleCustomers]);

  // Danh sách các Tỉnh/Thành phố có trong data
  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    accessibleCustomers.forEach(c => {
      if (c.city && c.city.trim()) locs.add(c.city.trim());
      else if (c.district && c.district.trim()) locs.add(c.district.trim());
      else if (c.region && c.region.trim()) locs.add(c.region.trim());
    });
    return Array.from(locs).sort();
  }, [accessibleCustomers]);

  // Danh sách các Nhân viên Sales có trong hệ thống + trong data
  const availableSalesList = useMemo(() => {
    const map = new Map<string, string>();
    salesStaff.forEach(s => map.set(s.name, s.name));
    accessibleCustomers.forEach(c => {
      if (c.assignedSalesName && c.assignedSalesName !== 'Chưa gán' && c.assignedSalesName.trim()) {
        map.set(c.assignedSalesName, c.assignedSalesName);
      }
    });
    return Array.from(map.values()).sort();
  }, [salesStaff, accessibleCustomers]);

  const isFiltered = useMemo(() => {
    return Boolean(
      searchTerm ||
      selectedSource !== 'all' ||
      selectedStage !== 'all' ||
      selectedSales !== 'all' ||
      selectedLocation !== 'all' ||
      selectedFinance !== 'all' ||
      selectedTime !== 'all' ||
      quickFilter !== 'all' ||
      leadMemberFilter !== 'all_team'
    );
  }, [searchTerm, selectedSource, selectedStage, selectedSales, selectedLocation, selectedFinance, selectedTime, quickFilter, leadMemberFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSource('all');
    setSelectedStage('all');
    setSelectedSales('all');
    setSelectedLocation('all');
    setSelectedFinance('all');
    setSelectedTime('all');
    setQuickFilter('all');
    setLeadMemberFilter('all_team');
  };

  // Lọc dữ liệu đa chiều
  const filteredCustomers = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return accessibleCustomers.filter(c => {
      // 1. Text Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match =
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          c.schoolName.toLowerCase().includes(term) ||
          c.className.toLowerCase().includes(term) ||
          c.concept.toLowerCase().includes(term) ||
          (c.city && c.city.toLowerCase().includes(term)) ||
          (c.district && c.district.toLowerCase().includes(term)) ||
          (c.region && c.region.toLowerCase().includes(term)) ||
          (c.representativeRole && c.representativeRole.toLowerCase().includes(term)) ||
          (c.assignedSalesName && c.assignedSalesName.toLowerCase().includes(term));
        if (!match) return false;
      }

      // 2. Nguồn
      if (selectedSource !== 'all' && c.source !== selectedSource) {
        return false;
      }

      // 3. Giai đoạn
      if (selectedStage !== 'all' && !isCustomerInStage(c.pipelineStage, selectedStage)) {
        return false;
      }

      // 4. Sales phụ trách
      if (selectedSales !== 'all') {
        if (selectedSales === 'unassigned') {
          if (c.assignedSalesName && c.assignedSalesName !== 'Chưa gán' && c.assignedSalesName.trim() !== '') {
            return false;
          }
        } else {
          if (c.assignedSalesName?.toLowerCase() !== selectedSales.toLowerCase()) {
            return false;
          }
        }
      }

      // 5. Khu vực / Tỉnh thành
      if (selectedLocation !== 'all') {
        const loc = selectedLocation.toLowerCase();
        const matchLoc = (c.city && c.city.toLowerCase().includes(loc)) ||
                         (c.district && c.district.toLowerCase().includes(loc)) ||
                         (c.region && c.region.toLowerCase().includes(loc));
        if (!matchLoc) return false;
      }

      // 6. Tài chính / Cọc
      if (selectedFinance !== 'all') {
        const isBooked = isCustomerBookedOrDeposited(c, bookings);
        const debt = getCustomerRemainingDebt(c);
        const total = getCustomerTotalOrderValue(c);
        const paid = getCustomerPaidDeposit(c);

        if (selectedFinance === 'deposited') {
          if (!isBooked) return false;
        } else if (selectedFinance === 'unbooked') {
          if (isBooked) return false;
        } else if (selectedFinance === 'has_debt') {
          if (debt <= 0) return false;
        } else if (selectedFinance === 'paid_full') {
          if (!isBooked || total === 0 || paid < total) return false;
        }
      }

      // 7. Thời gian
      if (selectedTime !== 'all') {
        const createdDate = c.createdAt ? new Date(c.createdAt) : null;
        if (selectedTime === 'today') {
          if (!createdDate || c.createdAt?.slice(0, 10) !== todayStr) return false;
        } else if (selectedTime === '7days') {
          if (!createdDate) return false;
          const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 7) return false;
        } else if (selectedTime === 'this_month') {
          if (!createdDate) return false;
          if (createdDate.getMonth() !== now.getMonth() || createdDate.getFullYear() !== now.getFullYear()) return false;
        } else if (selectedTime === 'has_shoot_date') {
          if (!c.expectedShootDate && !c.shotDate) return false;
        } else if (selectedTime === 'no_shoot_date') {
          if (c.expectedShootDate || c.shotDate) return false;
        }
      }

      // 8. Quick Filter Chips
      if (quickFilter !== 'all') {
        if (quickFilter === 'new_lead') {
          if (!['New Lead', 'Mới tiếp nhận'].includes(c.pipelineStage)) return false;
        } else if (quickFilter === 'consulting') {
          if (!['Đang tư vấn', 'Đã liên hệ'].includes(c.pipelineStage)) return false;
        } else if (quickFilter === 'quote') {
          if (!['Đã gửi báo giá', 'Đang thương lượng'].includes(c.pipelineStage)) return false;
        } else if (quickFilter === 'deposited') {
          if (!['Đã cọc', 'Đã đặt cọc'].includes(c.pipelineStage)) return false;
        } else if (quickFilter === 'booked') {
          if (!['Book ngày', 'Đã Booking'].includes(c.pipelineStage)) return false;
        } else if (quickFilter === 'unassigned') {
          if (c.assignedSalesName && c.assignedSalesName !== 'Chưa gán' && c.assignedSalesName.trim() !== '') return false;
        } else if (quickFilter === 'has_debt') {
          if (getCustomerRemainingDebt(c) <= 0) return false;
        }
      }

      return true;
    });
  }, [accessibleCustomers, searchTerm, selectedSource, selectedStage, selectedSales, selectedLocation, selectedFinance, selectedTime, quickFilter, bookings]);

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

      {/* Financial & Lead Overview Summary Bar: 5 Thẻ KPI Toàn Diện (Bổ sung SỐ LƯỢNG LEAD MỚI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Số lượng Lead mới (Yêu cầu trọng tâm của người dùng) */}
        <div 
          onClick={() => {
            setQuickFilter(quickFilter === 'new_lead' ? 'all' : 'new_lead');
            setSelectedStage(quickFilter === 'new_lead' ? 'all' : 'New Lead');
          }}
          className={`bg-white border p-4 rounded-2xl shadow-2xs transition-all cursor-pointer hover:border-[#B8F23D] active:scale-[0.98] ${
            selectedStage === 'New Lead' || quickFilter === 'new_lead'
              ? 'ring-2 ring-[#B8F23D] border-[#B8F23D] bg-[#B8F23D]/5'
              : 'border-black/[0.08]'
          }`}
          title="Bấm để lọc nhanh các Lead Mới tiếp nhận"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">SỐ LƯỢNG LEAD MỚI</span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-neutral-900 mt-1">
            {leadStats.newLeadsCount} <span className="text-xs font-bold text-neutral-500">Lead Mới</span>
          </p>
          <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center justify-between gap-1">
            <span>Tổng: <strong>{leadStats.total}</strong></span>
            <span className={leadStats.unassignedCount > 0 ? 'text-amber-700 font-bold' : 'text-neutral-400'}>
              • Chưa gán: {leadStats.unassignedCount}
            </span>
          </div>
        </div>

        {/* Card 2: Doanh thu đơn đã book & cọc */}
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

        {/* Card 3: Thực thu đã nhận */}
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

        {/* Card 4: Công nợ phải thu */}
        <div 
          onClick={() => {
            setSelectedFinance(selectedFinance === 'has_debt' ? 'all' : 'has_debt');
          }}
          className={`bg-white border p-4 rounded-2xl shadow-2xs transition-all cursor-pointer hover:border-rose-400 active:scale-[0.98] ${
            selectedFinance === 'has_debt'
              ? 'ring-2 ring-rose-400 border-rose-400 bg-rose-50/20'
              : 'border-black/[0.08]'
          }`}
          title="Bấm để lọc nhanh các lớp còn công nợ"
        >
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
            {leadStats.withDebtCount} lớp cần thanh toán tiếp
          </span>
        </div>

        {/* Card 5: Dự toán chào giá */}
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
            {accessibleCustomers.length - financialStats.bookedCount} lead đang chăm sóc/báo giá
          </span>
        </div>
      </div>

      {/* Filters Bar & Quick Filters Section (Hệ Thống Bộ Lọc Toàn Diện) */}
      <div className="glass-panel p-4 rounded-3xl space-y-3.5 shadow-xs">
        {/* Row 1: Search & Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Search Box */}
          <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên, SĐT, trường, lớp, concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 hover:bg-white focus:bg-white border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all"
            />
          </div>

          {/* 2. Giai đoạn Lead Pipeline */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                if (e.target.value !== 'all') setQuickFilter('all');
              }}
              className="w-full px-2.5 py-2 bg-neutral-50 hover:bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            >
              <option value="all">🎯 Tất cả giai đoạn ({accessibleCustomers.length})</option>
              <option value="New Lead">⚡ New Lead ({leadStats.newLeadsCount})</option>
              <option value="Đang tư vấn">💬 Đang tư vấn ({leadStats.consultingCount})</option>
              <option value="Đã gửi báo giá">📄 Đã gửi báo giá ({leadStats.quoteCount})</option>
              <option value="Đã cọc">💰 Đã cọc ({leadStats.depositedCount})</option>
              <option value="Book ngày">📅 Book ngày ({leadStats.bookedCount})</option>
              <option value="Đã chụp">📸 Đã chụp</option>
              <option value="Đang hậu kỳ">🎨 Đang hậu kỳ</option>
              <option value="Giao ảnh">📦 Giao ảnh</option>
              <option value="Hoàn thành">✅ Hoàn thành</option>
              <option value="Lost">❌ Khách từ chối (Lost)</option>
            </select>
          </div>

          {/* 3. Sales phụ trách */}
          <div>
            <select
              value={selectedSales}
              onChange={(e) => setSelectedSales(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 hover:bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            >
              <option value="all">👤 Tất cả Sales</option>
              <option value="unassigned">⚠️ Chưa gán Sales ({leadStats.unassignedCount})</option>
              {availableSalesList.map(salesName => (
                <option key={salesName} value={salesName}>
                  👤 {salesName}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Khu vực / Tỉnh thành */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 hover:bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            >
              <option value="all">📍 Tất cả khu vực</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Tình trạng Cọc & Tài chính */}
          <div>
            <select
              value={selectedFinance}
              onChange={(e) => setSelectedFinance(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-50 hover:bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            >
              <option value="all">💳 Tất cả tài chính</option>
              <option value="deposited">💰 Đã cọc & Book ({financialStats.bookedCount})</option>
              <option value="unbooked">📝 Chưa cọc (Báo giá/Lead)</option>
              <option value="has_debt">⏳ Còn nợ công nợ ({leadStats.withDebtCount})</option>
              <option value="paid_full">✅ Đã thu đủ 100%</option>
            </select>
          </div>
        </div>

        {/* Row 2: Secondary Filters (Nguồn marketing, Khoảng thời gian, Nhóm Lead, Bộ đếm & Nút Đặt lại) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-black/[0.04]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Nguồn tiếp cận */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-neutral-400">Nguồn:</span>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-2.5 py-1.5 bg-neutral-50 hover:bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
              >
                <option value="all">Tất cả nguồn</option>
                <option value="Facebook Organic">Facebook Organic</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Khách hàng cũ">Khách hàng cũ</option>
              </select>
            </div>

            {/* Thời gian */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-neutral-400">Thời gian:</span>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-2.5 py-1.5 bg-neutral-50 hover:bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
              >
                <option value="all">Toàn bộ thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="7days">7 ngày qua</option>
                <option value="this_month">Tháng này</option>
                <option value="has_shoot_date">Đã có ngày chụp</option>
                <option value="no_shoot_date">Chưa chốt ngày</option>
              </select>
            </div>

            {/* Phân quyền nhóm Sales Lead */}
            {salesHierarchy.isLead && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-400">Nhóm:</span>
                <select
                  value={leadMemberFilter}
                  onChange={(e) => setLeadMemberFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-neutral-900 text-[#B8F23D] border border-black/[0.08] rounded-xl text-xs font-bold cursor-pointer focus:outline-none"
                >
                  <option value="all_team">👑 Toàn bộ nhóm Sales ({salesHierarchy.subordinateStaff.length + 1})</option>
                  <option value="mine">👤 Riêng của tôi (Sales Lead)</option>
                  {salesHierarchy.subordinateStaff.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      ↳ {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Bộ đếm kết quả & Nút Reset Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">
              Hiển thị <strong className="text-neutral-900 font-bold">{filteredCustomers.length}</strong> / {accessibleCustomers.length} khách hàng
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="Xóa toàn bộ bộ lọc và quay về mặc định"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Quick Filter Chips (1 Chạm là lọc) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-[11px] font-bold text-neutral-400 shrink-0 mr-1">Lọc nhanh:</span>

          <button
            type="button"
            onClick={() => {
              setQuickFilter('all');
              setSelectedStage('all');
              setSelectedFinance('all');
              setSelectedSales('all');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              quickFilter === 'all' && selectedStage === 'all' && selectedFinance === 'all' && selectedSales === 'all'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Tất cả ({accessibleCustomers.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'new_lead' ? 'all' : 'new_lead');
              setSelectedStage(quickFilter === 'new_lead' ? 'all' : 'New Lead');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              quickFilter === 'new_lead' || selectedStage === 'New Lead'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Lead Mới ({leadStats.newLeadsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'consulting' ? 'all' : 'consulting');
              setSelectedStage(quickFilter === 'consulting' ? 'all' : 'Đang tư vấn');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              quickFilter === 'consulting' || selectedStage === 'Đang tư vấn'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/60'
            }`}
          >
            💬 Đang tư vấn ({leadStats.consultingCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'quote' ? 'all' : 'quote');
              setSelectedStage(quickFilter === 'quote' ? 'all' : 'Đã gửi báo giá');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              quickFilter === 'quote' || selectedStage === 'Đã gửi báo giá'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            📄 Báo giá ({leadStats.quoteCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'deposited' ? 'all' : 'deposited');
              setSelectedStage(quickFilter === 'deposited' ? 'all' : 'Đã cọc');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              quickFilter === 'deposited' || selectedStage === 'Đã cọc'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            💰 Đã cọc ({leadStats.depositedCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'booked' ? 'all' : 'booked');
              setSelectedStage(quickFilter === 'booked' ? 'all' : 'Book ngày');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              quickFilter === 'booked' || selectedStage === 'Book ngày'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            📅 Book ngày ({leadStats.bookedCount})
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'unassigned' ? 'all' : 'unassigned');
              setSelectedSales(quickFilter === 'unassigned' ? 'all' : 'unassigned');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              quickFilter === 'unassigned' || selectedSales === 'unassigned'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Chưa gán Sales ({leadStats.unassignedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickFilter(quickFilter === 'has_debt' ? 'all' : 'has_debt');
              setSelectedFinance(quickFilter === 'has_debt' ? 'all' : 'has_debt');
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              quickFilter === 'has_debt' || selectedFinance === 'has_debt'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            ⏳ Còn công nợ ({leadStats.withDebtCount})
          </button>
        </div>
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
                <div onClick={(e) => e.stopPropagation()}>
                  <select
                    value={cust.pipelineStage}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newStage = e.target.value as PipelineStage;
                      updateCustomerStage(cust.id, newStage);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs ${
                      stageBadges[cust.pipelineStage] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                    title="Đổi nhanh giai đoạn Lead Pipeline"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Đang tư vấn">Đang tư vấn</option>
                    <option value="Đã gửi báo giá">Đã gửi báo giá</option>
                    <option value="Đã cọc">Đã cọc</option>
                    <option value="Book ngày">Book ngày</option>
                    <option value="Đã chụp">Đã chụp</option>
                    <option value="Đang hậu kỳ">Đang hậu kỳ</option>
                    <option value="Giao ảnh">Giao ảnh</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Lost">Khách từ chối (Lost)</option>
                  </select>
                </div>
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

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={cust.pipelineStage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newStage = e.target.value as PipelineStage;
                          updateCustomerStage(cust.id, newStage);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs ${
                          stageBadges[cust.pipelineStage] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        }`}
                        title="Đổi nhanh giai đoạn Lead Pipeline (đồng bộ tức thì với Kanban Pipeline)"
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Đang tư vấn">Đang tư vấn</option>
                        <option value="Đã gửi báo giá">Đã gửi báo giá</option>
                        <option value="Đã cọc">Đã cọc</option>
                        <option value="Book ngày">Book ngày</option>
                        <option value="Đã chụp">Đã chụp</option>
                        <option value="Đang hậu kỳ">Đang hậu kỳ</option>
                        <option value="Giao ảnh">Giao ảnh</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Lost">Khách từ chối (Lost)</option>
                      </select>
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
