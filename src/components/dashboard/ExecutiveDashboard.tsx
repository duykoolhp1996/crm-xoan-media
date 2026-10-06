import React, { useMemo, useState } from 'react';
import logoXoan from '../../assets/logo-xoan.png';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Camera,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
  Award,
  Layers,
  Filter,
  UserCheck,
  CheckCircle2,
  LogIn,
  Percent,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CRM_CTV_SALES } from '../../data/crmBusinessData';
import {
  isCustomerBookedOrDeposited,
  getCustomerTotalOrderValue,
  getCustomerPaidDeposit,
  getCustomerRemainingDebt
} from '../../lib/revenueUtils';

export const ExecutiveDashboard: React.FC = () => {
  const {
    customers,
    bookings,
    photographers,
    feedbacks,
    salesStaff,
    currentUser,
    currentRole,
    loginAsStaff,
    setActiveTab,
    setSelectedBookingId
  } = useApp();

  const isSalesUser = currentUser?.role === 'sales' || currentRole === 'sales';

  // Nhận diện nhân sự Sales tương ứng với tài khoản đang đăng nhập
  const mySalesStaff = useMemo(() => {
    if (!isSalesUser) return null;
    return salesStaff.find(s => 
      s.id === currentUser.id || 
      s.name.toLowerCase() === currentUser.name.toLowerCase() ||
      (currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser.phone && s.phone === currentUser.phone)
    ) || salesStaff[0];
  }, [salesStaff, currentUser, isSalesUser]);

  // State lọc doanh số theo tài khoản nhân sự (Chỉ Admin / Manager mới được đổi selectedStaffId; Sales luôn khóa chặt vào tài khoản cá nhân)
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    if (currentUser?.role === 'sales') {
      const match = salesStaff.find(s => 
        s.id === currentUser.id || 
        s.name.toLowerCase() === currentUser.name.toLowerCase()
      );
      return match?.id || currentUser.id;
    }
    return 'all';
  });

  // ID nhân sự có hiệu lực thực tế: Nếu là Sales thì BẮT BUỘC luôn là ID của chính mình, KHÔNG thể là 'all' hay ID của người khác
  const effectiveStaffId = isSalesUser
    ? (mySalesStaff?.id || currentUser.id)
    : selectedStaffId;

  // Tìm thông tin nhân sự đang được chọn
  const activeStaff = useMemo(() => {
    if (effectiveStaffId === 'all') return null;
    return salesStaff.find(s => s.id === effectiveStaffId) || mySalesStaff || null;
  }, [effectiveStaffId, salesStaff, mySalesStaff]);

  // Lọc danh sách khách hàng / lớp học theo nhân sự được chọn
  const filteredCustomers = useMemo(() => {
    if (isSalesUser) {
      const myId = mySalesStaff?.id || currentUser.id;
      const myName = mySalesStaff?.name || currentUser.name;
      return customers.filter(c => c.assignedSalesId === myId || c.assignedSalesName === myName);
    }
    if (effectiveStaffId === 'all') return customers;
    return customers.filter(c => c.assignedSalesId === effectiveStaffId);
  }, [customers, effectiveStaffId, isSalesUser, mySalesStaff, currentUser]);

  // 1. Tính toán KPIs Khách hàng & Lớp học
  const totalLeads = filteredCustomers.length;
  const totalStudents = useMemo(() => {
    return filteredCustomers.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  }, [filteredCustomers]);

  const consultingLeads = filteredCustomers.filter(c => ['Đang tư vấn', 'Đã liên hệ', 'Mới tiếp nhận', 'New Lead'].includes(c.pipelineStage)).length;
  const quotedLeads = filteredCustomers.filter(c => c.pipelineStage === 'Đã gửi báo giá').length;
  const bookedLeads = filteredCustomers.filter(c => ['Đã đặt cọc', 'Đã Booking'].includes(c.pipelineStage) || (c.paidAmount && c.paidAmount > 0)).length;
  const shootingLeads = filteredCustomers.filter(c => ['Đang chụp', 'Đã chụp', 'Đang hậu kỳ', 'Đã bàn giao'].includes(c.pipelineStage)).length;
  const completedCustomers = filteredCustomers.filter(c => c.pipelineStage === 'Hoàn thành').length;

  // 2. Định nghĩa các giai đoạn đã chốt hợp đồng (phát sinh cọc trở đi)
  const CLOSED_STAGES = [
    'Đã cọc',
    'Book ngày',
    'Đã chụp',
    'Đang hậu kỳ',
    'Giao ảnh',
    'Hoàn thành',
    'Đã đặt cọc',
    'Đã Booking',
    'Đã bàn giao'
  ];

  // Danh sách các đơn đã chốt thành công (đã book & cọc thực tế)
  const closedDeals = useMemo(() => {
    return filteredCustomers.filter(c => isCustomerBookedOrDeposited(c, bookings));
  }, [filteredCustomers, bookings]);

  // DOANH THU ĐƠN ĐÃ CHỐT ĐƯỢC (FULL GIÁ TRỊ HỢP ĐỒNG CỦA CÁC ĐƠN ĐÃ BOOK VÀ CỌC)
  const closedDealsRevenue = useMemo(() => {
    return closedDeals.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
  }, [closedDeals]);

  // TỔNG TIỀN THỰC THU (TIỀN THỰC TẾ ĐÃ THU ĐƯỢC VÀO TÀI KHOẢN TỪ CÁC ĐƠN ĐÃ CHỐT)
  const totalCollectedRevenue = useMemo(() => {
    return closedDeals.reduce((sum, c) => sum + getCustomerPaidDeposit(c), 0);
  }, [closedDeals]);

  // CÔNG NỢ CÒN LẠI CẦN THU (DOANH THU ĐÃ CHỐT - THỰC THU ĐÃ NHẬN)
  const totalRemainingDebt = Math.max(0, closedDealsRevenue - totalCollectedRevenue);

  // TỔNG TIỀM NĂNG PIPELINE (TOÀN BỘ NGÂN SÁCH DỰ KIẾN KỂ CẢ LEAD MỚI TIẾP NHẬN)
  const pipelinePotentialRevenue = useMemo(() => {
    return filteredCustomers.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
  }, [filteredCustomers]);

  // 3. Tính toán hoa hồng chi tiết cho từng nhân viên Sales
  const staffPerformanceList = useMemo(() => {
    return salesStaff.map(staff => {
      const staffCustomers = customers.filter(c => c.assignedSalesId === staff.id);
      const totalRev = staffCustomers.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
      const closedList = staffCustomers.filter(c => isCustomerBookedOrDeposited(c, bookings));
      const closedCount = closedList.length;
      const closedRev = closedList.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
      const collectedRev = closedList.reduce((sum, c) => sum + getCustomerPaidDeposit(c), 0);
      
      // Tính hoa hồng theo cơ chế chính sách từng tài khoản
      let commission = 0;
      if (staff.commissionType === 'percentage') {
        const rate = staff.commissionRate || 8;
        commission = Math.round(closedRev * (rate / 100));
      } else if (staff.commissionType === 'fixed') {
        const fixedAmt = staff.commissionFixedAmount || 500000;
        commission = closedCount * fixedAmt;
      } else {
        commission = Math.round(closedRev * 0.08);
      }

      const conversionRate = staffCustomers.length > 0 
        ? Math.round((closedCount / staffCustomers.length) * 100) 
        : 0;

      return {
        staff,
        totalCustomers: staffCustomers.length,
        consultingCount: staffCustomers.filter(c => ['Đang tư vấn', 'Đã liên hệ', 'Mới tiếp nhận', 'New Lead'].includes(c.pipelineStage)).length,
        closedCount,
        totalRev,
        collectedRev,
        debtRev: Math.max(0, closedRev - collectedRev),
        closedRev,
        commission,
        conversionRate
      };
    });
  }, [salesStaff, customers]);

  // Hoa hồng hiển thị trên Card 4:
  const activeStaffCommission = useMemo(() => {
    if (isSalesUser) {
      const found = staffPerformanceList.find(s => s.staff.id === effectiveStaffId);
      return found ? found.commission : 0;
    }
    if (selectedStaffId === 'all') {
      return staffPerformanceList.reduce((sum, s) => sum + s.commission, 0);
    }
    const found = staffPerformanceList.find(s => s.staff.id === selectedStaffId);
    return found ? found.commission : 0;
  }, [selectedStaffId, staffPerformanceList, isSalesUser, effectiveStaffId]);

  // Tỷ lệ chốt chung hoặc theo cá nhân
  const winRate = totalLeads > 0 ? Math.round((bookedLeads / totalLeads) * 100) : 0;

  // 4. KPIs Đội ngũ Thợ & Ekip thực tế
  const totalPhotographers = photographers.length;
  const availablePhotographers = photographers.filter(p => p.status === 'available').length;
  const busyPhotographers = photographers.filter(p => p.status === 'busy').length;
  const readinessRate = totalPhotographers > 0 ? Math.round((availablePhotographers / totalPhotographers) * 100) : 0;
  const avgRating = useMemo(() => {
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, f) => acc + (f.aspects?.photographerCrew || f.rating || 5), 0);
      return (sum / feedbacks.length).toFixed(1);
    }
    const ratedPhotos = photographers.filter(p => p.rating && p.rating > 0);
    if (ratedPhotos.length > 0) {
      const sum = ratedPhotos.reduce((acc, p) => acc + (p.rating || 0), 0);
      return (sum / ratedPhotos.length).toFixed(1);
    }
    return 'Chưa có review';
  }, [photographers, feedbacks]);

  // 5. Marketing Breakdown (Nguồn khách hàng theo dữ liệu đang lọc)
  const sourceStats = useMemo(() => {
    const stats: Record<string, { count: number; revenue: number }> = {};
    filteredCustomers.forEach(c => {
      const src = c.source || 'Khác';
      if (!stats[src]) {
        stats[src] = { count: 0, revenue: 0 };
      }
      stats[src].count += 1;
      stats[src].revenue += (c.totalRevenue || c.expectedBudget || 0);
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      value: data.count,
      revenue: data.revenue
    }));
  }, [filteredCustomers]);

  const COLORS = ['#111827', '#84cc16', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  // 6. Funnel Pipeline Data chính xác từ danh sách lớp (KHÔNG padding ảo)
  const funnelData = useMemo(() => {
    const newLeadCount = filteredCustomers.filter(c => ['New Lead', 'Mới tiếp nhận'].includes(c.pipelineStage)).length;
    return [
      { name: 'Lead Mới Tiếp Nhận', value: newLeadCount, fill: '#94a3b8' },
      { name: 'Đang Tư Vấn & Khảo Sát', value: consultingLeads, fill: '#60a5fa' },
      { name: 'Đã Gửi Báo Giá Concept', value: quotedLeads, fill: '#818cf8' },
      { name: 'Đã Đặt Cọc / Booking', value: bookedLeads, fill: '#B8F23D' },
      { name: 'Đang Chụp & Hậu Kỳ', value: shootingLeads, fill: '#34d399' },
      { name: 'Hoàn Thành Bàn Giao', value: completedCustomers, fill: '#10b981' }
    ];
  }, [filteredCustomers, consultingLeads, quotedLeads, bookedLeads, shootingLeads, completedCustomers]);

  // 7. Doanh thu theo tháng: Tính từ Bookings thực tế kết hợp tiến độ mùa vụ
  const monthlyRevenueData = useMemo(() => {
    const bookingByMonth: Record<string, { revenue: number; bookings: number }> = {};
    bookings.forEach(b => {
      const parts = b.shootDate.split('-');
      if (parts.length >= 2) {
        const monthNum = parseInt(parts[1], 10);
        const key = `T${monthNum}`;
        if (!bookingByMonth[key]) {
          bookingByMonth[key] = { revenue: 0, bookings: 0 };
        }
        bookingByMonth[key].revenue += (b.totalAmount / 1000000);
        bookingByMonth[key].bookings += 1;
      }
    });

    const timeline = [
      { month: 'T7', baseRev: 0, baseCost: 0, baseBks: 0 },
      { month: 'T8', baseRev: 0, baseCost: 0, baseBks: 0 },
      { month: 'T9', baseRev: 0, baseCost: 0, baseBks: 0 },
      { month: 'T10', baseRev: 0, baseCost: 0, baseBks: 0 },
      { month: 'T11 (Cao Điểm)', baseRev: 0, baseCost: 0, baseBks: 0 },
      { month: 'T12', baseRev: 0, baseCost: 0, baseBks: 0 },
    ];

    return timeline.map(m => {
      const cleanKey = m.month.split(' ')[0]; // 'T10', 'T11'
      const bkData = bookingByMonth[cleanKey] || { revenue: 0, bookings: 0 };
      const totalRev = Number((m.baseRev + bkData.revenue).toFixed(1));
      const totalBks = m.baseBks + bkData.bookings;
      const totalCost = Number((m.baseCost + (bkData.revenue * 0.2)).toFixed(1));
      return {
        month: m.month,
        revenue: totalRev,
        cost: totalCost,
        bookings: totalBks
      };
    });
  }, [bookings]);

  const peakMonth = useMemo(() => {
    return monthlyRevenueData.reduce(
      (max, m) => (m.revenue > max.revenue ? m : max),
      monthlyRevenueData[0] || { month: 'T11', revenue: 0 }
    );
  }, [monthlyRevenueData]);

  // 8. Lịch chụp sắp tới - Sắp xếp theo ngày chụp sớm nhất
  const upcomingBookings = useMemo(() => {
    const myCustomerIds = new Set(filteredCustomers.map(c => c.id));
    return [...bookings]
      .filter(b => !isSalesUser || myCustomerIds.has(b.customerId))
      .sort((a, b) => new Date(a.shootDate).getTime() - new Date(b.shootDate).getTime())
      .slice(0, 4);
  }, [bookings, isSalesUser, filteredCustomers]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          GIAO DIỆN MOBILE ĐỈNH CAO CHUẨN PAYTIN (FINTECH APP STYLE)
          Hiển thị ưu tiên trên Mobile / Tablet - BẢO TOÀN 100% CÔNG NĂNG & SỐ LIỆU
          ======================================================== */}
      <div className="md:hidden space-y-4">
        {/* 1. Paytin Header: Avatar tròn + Welcome Back */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || mySalesStaff?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#B8F23D] shadow-xs"
            />
            <div>
              <p className="text-[11px] text-neutral-500 font-medium">Chào mừng trở lại 👋</p>
              <h2 className="text-base font-black text-neutral-900 leading-tight">
                {currentUser.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8F23D] animate-ping" />
            <span className="px-2.5 py-1 rounded-full bg-neutral-900 text-[#B8F23D] text-[10px] font-extrabold uppercase tracking-wide">
              {currentRole}
            </span>
          </div>
        </div>

        {/* 2. Paytin Hero Black Card + Side Neon Card (Thẻ Doanh Thu & Thực Thu) */}
        <div className="flex flex-col gap-2.5">
          {/* Main Card (Thẻ Đen Than Sang Xịn) */}
          <div className="bg-[#121316] text-white rounded-[28px] p-5 relative overflow-hidden shadow-xl border border-white/5">
            {/* Họa tiết sao lấp lánh ✦ */}
            <div className="absolute top-4 right-16 text-[#B8F23D]/30 text-xl font-mono select-none pointer-events-none">✦</div>
            <div className="absolute bottom-5 right-8 text-[#B8F23D]/20 text-xs font-mono select-none pointer-events-none">✦</div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-widest text-[#B8F23D] uppercase">XOĂN CRM</span>
                <span className="text-[9px] bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full font-bold">Mùa 2024</span>
              </div>
              <button
                onClick={() => setActiveTab('bookings')}
                className="bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <span>+ Lập Booking</span>
              </button>
            </div>

            <div className="my-2">
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider block mb-0.5">
                Doanh Thu Đơn Đã Chốt (Đã Cọc)
              </span>
              <div className="text-3xl font-black text-white tracking-tight">
                ₫ {(closedDealsRevenue).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono tracking-widest text-[11px] text-neutral-300">
                •••• •••• {closedDeals.length} ĐƠN ĐÃ CHỐT
              </span>
              <span className="text-[11px] font-bold text-[#B8F23D]">
                {totalStudents.toLocaleString('vi-VN')} Học sinh
              </span>
            </div>
          </div>

          {/* Mini Card Đôi Màu Xanh Neon Dựng Kèm (Side NFC Card) */}
          <div
            onClick={() => setActiveTab('bookings')}
            className="bg-[#B8F23D] text-neutral-950 rounded-2xl p-3.5 flex items-center justify-between shadow-md cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-950/10 flex items-center justify-center font-black text-lg">
                )))
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  Thực Thu Đã Nhận (Cọc + Thanh Toán)
                </span>
                <span className="text-sm font-black leading-tight block">
                  ₫ {(totalCollectedRevenue).toLocaleString('vi-VN')} ({((totalCollectedRevenue / (closedDealsRevenue || 1)) * 100).toFixed(0)}%)
                </span>
                <span className="text-[10px] text-neutral-800 font-semibold">
                  Nợ còn lại: ₫ {(totalRemainingDebt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-neutral-800 bg-white/40 px-2 py-0.5 rounded-full">
                Xem Lịch &gt;
              </span>
            </div>
          </div>
        </div>

        {/* 3. Paytin Quick Actions: 4 Nút Tròn Trắng Bo Mềm */}
        <div className="grid grid-cols-4 gap-2 select-none">
          <button
            onClick={() => setActiveTab('customers')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] shadow-xs active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F4FBE8] text-neutral-900 flex items-center justify-center group-hover:bg-[#B8F23D] transition-colors shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-800 tracking-tight">+ Khách</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] shadow-xs active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F4FBE8] text-neutral-900 flex items-center justify-center group-hover:bg-[#B8F23D] transition-colors shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-800 tracking-tight">Báo Giá</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] shadow-xs active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F4FBE8] text-neutral-900 flex items-center justify-center group-hover:bg-[#B8F23D] transition-colors shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-800 tracking-tight">Booking</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] shadow-xs active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F4FBE8] text-neutral-900 flex items-center justify-center group-hover:bg-[#B8F23D] transition-colors shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-neutral-800 tracking-tight">Pipeline</span>
          </button>
        </div>

        {/* 4. Paytin Quick Contacts: Ekip Trực Chiến & Sales Hôm Nay (Quick Send) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
              Ekip & Sales Hôm Nay
            </h3>
            <button
              onClick={() => setActiveTab('photographers')}
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900"
            >
              Xem tất cả &gt;
            </button>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {salesStaff.length === 0 ? (
              <p className="text-[11px] text-neutral-400 py-1.5 italic">Chưa có tài khoản Sales nào (Thêm tại Cài Đặt &gt; Quản Lý Nhân Sự)</p>
            ) : (
              salesStaff.slice(0, 6).map(staff => (
                <div
                  key={staff.id}
                  onClick={() => {
                    if (!isSalesUser) setSelectedStaffId(staff.id);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                >
                  <div className={`relative p-0.5 rounded-full ${selectedStaffId === staff.id ? 'ring-2 ring-[#B8F23D]' : ''}`}>
                    <img
                      src={staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={staff.name}
                      className="w-11 h-11 rounded-full object-cover border border-black/[0.08] group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-700 truncate max-w-[60px]">
                    {staff.name.split(' ')[0]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Paytin Statistics: 2 Thẻ KPI Song Song (1 Xanh Neon, 1 Đen Than) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Xanh Neon (Tỉ lệ chốt đơn & Goal) */}
          <div
            onClick={() => setActiveTab('pipeline')}
            className="bg-[#D8FC64] text-neutral-950 rounded-3xl p-4 flex flex-col justify-between shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Tỉ Lệ Chốt
              </span>
              <span className="w-2 h-2 rounded-full bg-neutral-950/20" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-black tracking-tight">{winRate}%</span>
              <p className="text-[10px] font-medium opacity-80 mt-0.5">
                {bookedLeads}/{totalLeads} HĐ chốt cọc
              </p>
            </div>
            <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-bold">
              <span>Mục tiêu mùa:</span>
              <span>{bookedLeads}/300</span>
            </div>
          </div>

          {/* Card 2: Đen Than (Thực Thu & Công Nợ) */}
          <div
            onClick={() => setActiveTab('bookings')}
            className="bg-[#121316] text-white rounded-3xl p-4 flex flex-col justify-between shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#B8F23D]" /> Đã Thu Cọc
              </span>
              <span className="w-2 h-2 rounded-full bg-[#B8F23D]" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-white tracking-tight">
                {((totalCollectedRevenue) / 1000000).toFixed(1)} Tr
              </span>
              <p className="text-[10px] text-neutral-400 font-medium mt-0.5">
                Nợ: {((totalRemainingDebt) / 1000000).toFixed(1)} Tr
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400 font-bold">
              <span>Đạt tiến độ:</span>
              <span className="text-[#B8F23D]">
                {closedDealsRevenue > 0 ? Math.round((totalCollectedRevenue / closedDealsRevenue) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* 6. Paytin Recent Activity: Lịch Chụp & Booking Gần Nhất (Thiết kế ô vuông aspect-square) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
              Lịch Chụp & Booking Gần Nhất
            </h3>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900"
            >
              Xem tất cả &gt;
            </button>
          </div>
          {/* Lưới 2 cột các ô vuông bo góc chuẩn Paytin (aspect-square) hoặc Thông báo trống */}
          {upcomingBookings.length === 0 ? (
            <div
              onClick={() => setActiveTab('bookings')}
              className="p-6 text-center bg-white rounded-3xl border border-dashed border-neutral-200 cursor-pointer active:scale-98 transition-all shadow-xs"
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-xs font-bold text-neutral-800">Chưa có lịch chụp nào</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Chạm vào đây để lập booking lịch chụp mới</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {upcomingBookings.map(bk => (
                <div
                  key={bk.id}
                  onClick={() => {
                    setSelectedBookingId(bk.id);
                    setActiveTab('bookings');
                  }}
                  className="bg-white hover:bg-neutral-50 p-3 sm:p-3.5 rounded-3xl border border-black/[0.06] shadow-xs aspect-square flex flex-col justify-between cursor-pointer transition-all active:scale-95 group"
                >
                  {/* Top: Icon máy ảnh + Huy hiệu trạng thái */}
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-black shadow-2xs group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {bk.bookingStatus}
                    </span>
                  </div>

                  {/* Middle: Tên lớp & Trường */}
                  <div className="my-1">
                    <h4 className="text-xs font-black text-neutral-900 line-clamp-2 leading-tight">
                      {bk.className}
                    </h4>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      {bk.schoolName}
                    </p>
                  </div>

                  {/* Bottom: Ngày chụp + Số tiền */}
                  <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" /> {bk.shootDate.slice(5)}
                    </span>
                    <span className="text-xs font-black text-neutral-900">
                      {(bk.totalAmount / 1000000).toFixed(1)} Tr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          PHẦN ĐIỀU HÀNH CHI TIẾT (DESKTOP & TOÀN HỆ THỐNG CRM)
          BẢO TOÀN 100% TẤT CẢ CÁC BẢNG BIỂU, BỘ LỌC, RECHARTS & PHÂN BỔ HOA HỒNG
          ======================================================== */}
      {/* Welcome Banner - Soft Glassmorphism Light Style */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#B8F23D]/25 via-emerald-50/60 to-white/80 backdrop-blur-2xl border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#B8F23D] text-neutral-950 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              MÙA CAO ĐIỂM KỶ YẾU 2024
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              Hệ thống CRM Vận Hành & Quản Lý Doanh Thu Xoăn Media
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight text-neutral-900">
            Tổng Quan Doanh Thu & Điều Hành Ekip
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Kiểm soát hợp đồng thực tế, tiến độ {customers.length} lớp kỷ yếu ({totalStudents.toLocaleString('vi-VN')} học sinh), điều phối {totalPhotographers} thợ chụp và đội ngũ Sales tư vấn chuyên nghiệp.
          </p>
        </div>

        {/* Studio Brand Badge */}
        <div className="relative z-10 shrink-0 hidden md:flex items-center gap-3.5 bg-white/80 backdrop-blur-md p-3 pr-5 rounded-2xl border border-black/[0.06] shadow-xs">
          <img
            src={logoXoan}
            alt="Xoăn Media Studio"
            className="w-12 h-12 rounded-xl object-cover shadow-sm border border-neutral-200"
          />
          <div>
            <p className="text-xs font-black text-neutral-900 leading-tight">XOĂN MEDIA STUDIO</p>
            <p className="text-[10px] text-neutral-500 font-medium">Kỷ yếu & Nghệ thuật học đường</p>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
              Hệ thống vận hành 2026
            </span>
          </div>
        </div>
      </div>

      {/* Bộ Lọc Xem Doanh Số Theo Tài Khoản Sales */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.06] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-black shadow-xs shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-neutral-900">
                {isSalesUser ? 'Báo Cáo Doanh Số & Hoa Hồng Cá Nhân' : 'Xem Báo Cáo Doanh Số Theo Tài Khoản'}
              </h3>
              {isSalesUser ? (
                <span className="text-[11px] font-bold bg-[#B8F23D] text-neutral-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Tài khoản: {mySalesStaff?.name || currentUser.name}
                </span>
              ) : activeStaff ? (
                <span className="text-[11px] font-bold bg-[#B8F23D] text-neutral-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Đang lọc: {activeStaff.name}
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                  🏢 Toàn bộ Studio ({salesStaff.length} Sales)
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isSalesUser ? (
                `Dữ liệu hợp đồng cá nhân & chính sách hoa hồng: ${mySalesStaff?.commissionType === 'percentage' ? `${mySalesStaff.commissionRate}% Doanh thu` : `${(mySalesStaff?.commissionFixedAmount || 500000).toLocaleString('vi-VN')}đ / HĐ chốt thành công`}`
              ) : activeStaff ? (
                `Chính sách hoa hồng: ${activeStaff.commissionType === 'percentage' ? `${activeStaff.commissionRate}% Doanh thu` : `${(activeStaff.commissionFixedAmount || 0).toLocaleString('vi-VN')}đ / HĐ chốt thành công`}`
              ) : (
                `Tổng hợp doanh số và hoa hồng phân bổ cho ${salesStaff.length} tài khoản Sales & CTV trong hệ thống Xoăn Media`
              )}
            </p>
          </div>
        </div>

        {isSalesUser ? (
          <div className="flex items-center gap-2.5 bg-neutral-50 border border-black/[0.08] px-3.5 py-2 rounded-2xl shadow-xs">
            <img
              src={mySalesStaff?.avatar || currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={mySalesStaff?.name || currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-neutral-300"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-neutral-900 leading-tight">{mySalesStaff?.name || currentUser.name}</p>
              <p className="text-[10px] text-neutral-500 font-medium">{filteredCustomers.length} lớp được phân công</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button
              onClick={() => setSelectedStaffId('all')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedStaffId === 'all'
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <span>🏢 Toàn Studio</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedStaffId === 'all' ? 'bg-[#B8F23D] text-neutral-900' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {customers.length} lớp
              </span>
            </button>

            {salesStaff.map(s => {
              const isSelected = selectedStaffId === s.id;
              const staffPerf = staffPerformanceList.find(p => p.staff.id === s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaffId(s.id)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 border-black/[0.08]'
                  }`}
                >
                  <img
                    src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={s.name}
                    className="w-5 h-5 rounded-full object-cover border border-neutral-300"
                  />
                  <span className="truncate max-w-[110px]">{s.name.split('(')[0].trim()}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-[#B8F23D] text-neutral-900' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {((staffPerf?.closedRev || 0) / 1000000).toFixed(1)} Tr
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Cards: 4 Cột chuẩn Soft Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu đơn đã chốt (đã phát sinh cọc) */}
        <div
          onClick={() => setActiveTab('bookings')}
          className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group border-b-2 border-b-[#B8F23D]"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">DOANH THU ĐƠN ĐÃ CHỐT</span>
              <p className="text-[10px] text-neutral-500 font-medium truncate max-w-[130px]">
                {activeStaff ? activeStaff.name.split('(')[0] : `${closedDeals.length} HĐ Đã Cọc`}
              </p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-[#B8F23D]/30 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4 text-neutral-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {(closedDealsRevenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Thu: {(totalCollectedRevenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
            <span>Công nợ còn lại:</span>
            <strong className="text-rose-600 font-bold">
              {(totalRemainingDebt / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr ({((totalRemainingDebt / (closedDealsRevenue || 1)) * 100).toFixed(0)}%)
            </strong>
          </div>
        </div>

        {/* Card 2: Khách hàng / Leads */}
        <div
          onClick={() => setActiveTab('customers')}
          className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">TỔNG LỚP & HỌC SINH</span>
              <p className="text-[10px] text-neutral-500 font-medium">
                {activeStaff ? 'Lớp được giao phụ trách' : 'Toàn hệ thống'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 text-neutral-800" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">{totalLeads} Lớp</span>
            <span className="text-xs font-bold text-neutral-800 bg-[#B8F23D]/40 px-2 py-0.5 rounded-full">
              {totalStudents.toLocaleString('vi-VN')} học sinh
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
            <span>Đang tư vấn: <strong className="text-neutral-800">{consultingLeads}</strong></span>
            <span>Đã cọc: <strong className="text-emerald-700 font-bold">{bookedLeads}</strong></span>
          </div>
        </div>

        {/* Card 3: Hiệu suất chốt Sale (khi lọc theo tài khoản) hoặc Đội ngũ thợ (khi toàn studio) */}
        {activeStaff ? (
          <div
            onClick={() => setActiveTab('pipeline')}
            className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group border-b-2 border-b-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">HIỆU SUẤT CHỐT SALE</span>
                <p className="text-[10px] text-neutral-500 font-medium">Tỷ lệ chuyển đổi lead</p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">{winRate}%</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {bookedLeads}/{totalLeads} HĐ chốt
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
              <span>Đã gửi báo giá: <strong className="text-indigo-600 font-bold">{quotedLeads}</strong></span>
              <span>Hoàn thành: <strong className="text-emerald-700 font-bold">{completedCustomers}</strong></span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setActiveTab('photographers')}
            className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">ĐỘI NGŨ THỢ & EKIP</span>
                <p className="text-[10px] text-neutral-500 font-medium">Năng lực sản xuất</p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4 text-neutral-800" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">{totalPhotographers} Thợ</span>
              <span className="text-xs font-bold text-neutral-800 bg-[#B8F23D]/40 px-2 py-0.5 rounded-full">
                {readinessRate}% sẵn sàng
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
              <span>Đang bấm máy: <strong className="text-amber-600 font-bold">{busyPhotographers}</strong></span>
              <span>Đánh giá TB: <strong className="text-neutral-900 font-bold">{avgRating}{avgRating !== 'Chưa có review' ? ' ★' : ''}</strong></span>
            </div>
          </div>
        )}

        {/* Card 4: Hoa Hồng Thực Nhận / Tích Lũy */}
        <div
          onClick={() => setActiveTab('pipeline')}
          className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group border-b-2 border-b-[#B8F23D]"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {activeStaff ? 'HOA HỒNG THỰC NHẬN' : 'TỔNG HOA HỒNG SALES'}
              </span>
              <p className="text-[10px] text-neutral-500 font-medium truncate max-w-[130px]">
                {activeStaff ? activeStaff.roleTitle : `${salesStaff.length} tài khoản`}
              </p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-[#B8F23D]/30 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4 text-neutral-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {(activeStaffCommission / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
              <Award className="w-3.5 h-3.5" /> {activeStaff ? (activeStaff.commissionType === 'percentage' ? `${activeStaff.commissionRate}%` : 'Cố định') : `${salesStaff.length} Sales`}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
            <span>{activeStaff ? 'Doanh số tính thưởng:' : 'Tổng DS chốt có hoa hồng:'}</span>
            <strong className="text-neutral-900 font-bold">
              {activeStaff 
                ? `${((staffPerformanceList.find(p => p.staff.id === activeStaff.id)?.closedRev || 0) / 1000000).toFixed(1)} Tr (${bookedLeads} lớp)`
                : `${(staffPerformanceList.reduce((sum, p) => sum + p.closedRev, 0) / 1000000).toFixed(1)} Tr`
              }
            </strong>
          </div>
        </div>
      </div>

          {/* Row 2: Biểu Đồ Doanh Thu & Nguồn Lead Marketing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Doanh thu theo tháng */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Tăng Trưởng Doanh Thu Kỷ Yếu Theo Tháng (Triệu VNĐ)</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Thống kê theo dữ liệu hợp đồng và lịch chụp thực tế các tháng</p>
                </div>
                <span className="text-xs font-bold text-neutral-900 bg-[#B8F23D] px-3 py-1 rounded-full shadow-xs">
                  {peakMonth.revenue > 0 ? `Tháng ${peakMonth.month} Đỉnh Điểm: ${peakMonth.revenue}tr` : 'Sẵn sàng ghi nhận hợp đồng mới'}
                </span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#84cc16" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.04)" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="M" />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} Triệu VNĐ`,
                        name === 'revenue' ? 'Doanh Thu Thực' : 'Chi Phí MKT & CTV'
                      ]}
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderRadius: '16px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#65a30d" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Doanh Thu Thực" />
                    <Area type="monotone" dataKey="cost" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCost)" name="Chi Phí MKT & CTV" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Nguồn Khách Hàng (Marketing Attribution) */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Phân Bổ Kênh Khách Hàng</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Tỷ lệ lớp và doanh thu từ CTV, Facebook, TikTok...</p>

                <div className="h-56 mt-2 flex items-center justify-center">
                  {sourceStats.length === 0 ? (
                    <div className="text-center text-neutral-400 text-xs px-4">
                      <p className="font-semibold text-neutral-600">Chưa có dữ liệu kênh tiếp cận</p>
                      <p className="text-[11px] text-neutral-400 mt-1">Dữ liệu sẽ tự động tổng hợp khi bạn thêm khách hàng đầu tiên!</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceStats}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {sourceStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111827',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '11px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mt-2 border-t border-black/[0.04] pt-3">
                {sourceStats.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-2">Chưa có lớp nào</p>
                ) : (
                  sourceStats.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-neutral-600">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        {s.name}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {s.value} Lớp ({(s.revenue / 1000000).toFixed(1)} Tr)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Funnel Kỷ Yếu & Lịch Chụp Sắp Tới */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phễu Chuyển Đổi Kỷ Yếu */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Phễu Chuyển Đổi Kỷ Yếu</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Từ Lead ban đầu đến hoàn thành bàn giao</p>
                </div>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="text-xs font-bold text-neutral-900 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  Mở Kanban <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {funnelData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-700">
                      <span>{item.name}</span>
                      <span className="font-extrabold text-neutral-900">
                        {item.value} lớp ({((item.value / (totalLeads || 1)) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${Math.max((item.value / (totalLeads || 1)) * 100, 6)}%`,
                          backgroundColor: item.fill === '#B8F23D' ? '#84cc16' : item.fill
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lịch Chụp Sắp Tới & Ekip (2 Cột) */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Lịch Chụp Sắp Tới & Điều Phối Thợ</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Theo dõi lịch trình các lớp đã chốt ngày chụp</p>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-xs font-bold text-neutral-900 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                >
                  Xem Toàn Bộ Lịch <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-500">Chưa có lịch chụp nào trong hệ thống</p>
                    <p className="text-[11px] text-neutral-400 mt-1">Khi bạn tạo booking lịch chụp mới, thông tin điều phối thợ sẽ xuất hiện tại đây.</p>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="mt-3 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      + Tạo Booking Đầu Tiên
                    </button>
                  </div>
                ) : (
                  upcomingBookings.map((bk) => {
                    const hasConflict = bk.assignments.leadPhotographerName?.includes('Trùng Lịch');
                    const isUnassigned = !bk.assignments.leadPhotographerId;

                    return (
                      <div
                      key={bk.id}
                      onClick={() => {
                        setSelectedBookingId(bk.id);
                        setActiveTab('bookings');
                      }}
                      className="p-3.5 rounded-2xl bg-white hover:bg-neutral-50 border border-black/[0.06] transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="bg-[#B8F23D]/30 text-neutral-950 px-3 py-2 rounded-2xl text-center shrink-0 border border-[#B8F23D]/50 font-bold">
                          <p className="text-[9px] uppercase tracking-wider text-neutral-600">Ngày</p>
                          <p className="text-base font-black leading-tight">
                            {bk.shootDate.split('-')[2]}
                          </p>
                          <p className="text-[10px] text-neutral-500">T{bk.shootDate.split('-')[1]}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-neutral-900 group-hover:text-neutral-700 transition-colors">
                              {bk.className} - {bk.schoolName}
                            </span>
                            <span className="text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                              {bk.code}
                            </span>
                            {hasConflict && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Trùng Lịch!
                              </span>
                            )}
                            {isUnassigned && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                ⚠️ Chưa gán thợ
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-neutral-500 flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" /> {bk.startTime} - {bk.endTime}
                            </span>
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <MapPin className="w-3 h-3 text-neutral-400" /> {bk.location}
                            </span>
                          </p>

                          <p className="text-[11px] text-neutral-600 mt-1 font-medium">
                            Thợ chính: <span className="text-neutral-900 font-semibold">{bk.assignments.leadPhotographerName || 'Chưa phân công'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-neutral-900">
                          {bk.totalAmount.toLocaleString('vi-VN')}đ
                        </p>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-block mt-1 border ${
                          bk.paymentStatus === 'Đã thanh toán đủ'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : bk.paymentStatus === 'Đã cọc'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {bk.paymentStatus}
                        </span>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>

          {/* Row 4: Bảng Theo Dõi & Xếp Hạng Doanh Số Từng Tài Khoản Sales */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#B8F23D]/30 text-neutral-900 flex items-center justify-center font-black">
                  <Award className="w-5 h-5 text-neutral-900" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                    {isSalesUser ? 'Báo Cáo Hiệu Suất & Hoa Hồng Của Bạn' : 'Bảng Xếp Hạng & Doanh Số Từng Tài Khoản Sales'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isSalesUser 
                      ? 'Thống kê chi tiết doanh thu ký hợp đồng, thực thu, công nợ và hoa hồng cá nhân'
                      : 'Thống kê chi tiết doanh thu ký hợp đồng, thực thu, công nợ và hoa hồng từng nhân sự'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
                >
                  Mở Pipeline Chăm Sóc <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.05] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Tài Khoản & Nhân Sự</th>
                    <th className="py-3 px-3">Số Lớp Phụ Trách</th>
                    <th className="py-3 px-3 text-right">Doanh Thu HĐ</th>
                    <th className="py-3 px-3 text-right">Thực Thu</th>
                    <th className="py-3 px-3 text-right">Công Nợ</th>
                    <th className="py-3 px-3 text-center">Tỷ Lệ Chốt</th>
                    <th className="py-3 px-3 text-right">Hoa Hồng</th>
                    {!isSalesUser && <th className="py-3 px-3 text-center">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] text-xs font-medium">
                  {staffPerformanceList
                    .filter(item => {
                      if (!isSalesUser) return true;
                      return item.staff.id === effectiveStaffId || 
                             (mySalesStaff && item.staff.id === mySalesStaff.id) ||
                             item.staff.name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
                             currentUser.name.toLowerCase().includes(item.staff.name.toLowerCase());
                    })
                    .sort((a, b) => b.closedRev - a.closedRev)
                    .map((item, index) => {
                      const isCurrentFiltered = selectedStaffId === item.staff.id;
                      return (
                        <tr
                          key={item.staff.id}
                          className={`transition-colors hover:bg-neutral-50/80 ${
                            isCurrentFiltered ? 'bg-[#B8F23D]/10' : ''
                          }`}
                        >
                          {/* Cột 1: Thông tin nhân sự */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                index === 0 ? 'bg-amber-400 text-neutral-900 shadow-xs' :
                                index === 1 ? 'bg-neutral-300 text-neutral-800' :
                                index === 2 ? 'bg-amber-700/20 text-amber-900' :
                                'bg-neutral-100 text-neutral-500'
                              }`}>
                                {index + 1}
                              </span>
                              <img
                                src={item.staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={item.staff.name}
                                className="w-9 h-9 rounded-full object-cover border border-neutral-200 shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-neutral-900">{item.staff.name}</span>
                                  {isCurrentFiltered && (
                                    <span className="text-[9px] font-bold bg-[#B8F23D] text-neutral-950 px-1.5 py-0.2 rounded-full">
                                      Đang chọn
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-500">{item.staff.roleTitle} • {item.staff.phone}</p>
                              </div>
                            </div>
                          </td>

                          {/* Cột 2: Số lớp phụ trách */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-0.5">
                              <span className="font-bold text-neutral-900">{item.totalCustomers} lớp</span>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                <span>Tư vấn: <strong className="text-neutral-700">{item.consultingCount}</strong></span>
                                <span>•</span>
                                <span>Đã cọc: <strong className="text-emerald-700 font-bold">{item.closedCount}</strong></span>
                              </div>
                            </div>
                          </td>

                          {/* Cột 3: Doanh thu HĐ */}
                          <td className="py-3.5 px-3 text-right">
                            <span className="font-extrabold text-neutral-900 text-sm">
                              {(item.closedRev / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
                            </span>
                            {item.totalRev > item.closedRev && (
                              <span className="block text-[10px] text-neutral-400 font-normal">
                                Tiềm năng: {((item.totalRev) / 1000000).toFixed(1)} Tr
                              </span>
                            )}
                          </td>

                          {/* Cột 4: Thực thu */}
                          <td className="py-3.5 px-3 text-right">
                            <span className="font-bold text-emerald-700">
                              {(item.collectedRev / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
                            </span>
                          </td>

                          {/* Cột 5: Công nợ */}
                          <td className="py-3.5 px-3 text-right">
                            <span className="font-semibold text-rose-600">
                              {(item.debtRev / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr
                            </span>
                          </td>

                          {/* Cột 6: Tỷ lệ chốt */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {item.conversionRate}%
                            </span>
                          </td>

                          {/* Cột 7: Hoa hồng */}
                          <td className="py-3.5 px-3 text-right">
                            <div>
                              <span className="font-extrabold text-neutral-900 text-sm">
                                {(item.commission / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tr
                              </span>
                              <p className="text-[10px] text-neutral-500">
                                {item.staff.commissionType === 'percentage'
                                  ? `${item.staff.commissionRate}% doanh số`
                                  : `${(item.staff.commissionFixedAmount || 0).toLocaleString('vi-VN')}đ/HĐ`
                                }
                              </p>
                            </div>
                          </td>

                          {/* Cột 8: Thao tác (Chỉ Admin / Manager) */}
                          {!isSalesUser && (
                            <td className="py-3.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedStaffId(item.staff.id)}
                                  title="Xem thống kê tài khoản này trên Dashboard"
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                                    isCurrentFiltered
                                      ? 'bg-neutral-900 text-[#B8F23D]'
                                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                  }`}
                                >
                                  {isCurrentFiltered ? '✓ Đang xem' : 'Lọc số liệu'}
                                </button>

                                {currentRole === 'admin' && (
                                  <button
                                    onClick={() => loginAsStaff({
                                      id: item.staff.id,
                                      name: item.staff.name,
                                      role: 'sales',
                                      avatar: item.staff.avatar,
                                      email: item.staff.email,
                                      phone: item.staff.phone
                                    })}
                                    title="Đăng nhập thử vai bằng tài khoản Sales này"
                                    className="p-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
};

