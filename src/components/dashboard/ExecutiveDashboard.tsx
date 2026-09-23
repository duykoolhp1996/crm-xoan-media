import React, { useMemo } from 'react';
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
  Clock
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

export const ExecutiveDashboard: React.FC = () => {
  const {
    customers,
    bookings,
    photographers,
    setActiveTab,
    setSelectedBookingId
  } = useApp();

  // 1. Tính toán KPIs Khách hàng
  const totalLeads = customers.length;
  const consultingLeads = customers.filter(c => c.pipelineStage === 'Đang tư vấn').length;
  const quotedLeads = customers.filter(c => c.pipelineStage === 'Đã gửi báo giá').length;
  const bookedLeads = customers.filter(c => ['Đã đặt cọc', 'Đã Booking'].includes(c.pipelineStage)).length;
  const completedCustomers = customers.filter(c => c.pipelineStage === 'Hoàn thành').length;
  const lostCustomers = customers.filter(c => c.pipelineStage === 'Lost').length;

  // 2. Tính toán KPIs Đơn hàng & Tài chính
  const totalBookings = bookings.length;
  const expectedRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const actualRevenue = bookings.reduce((sum, b) => sum + b.depositAmount, 0);
  const remainingDebt = expectedRevenue - actualRevenue;

  // 3. KPIs Đội ngũ Thợ
  const activePhotographers = photographers.filter(p => p.status === 'available' || p.status === 'busy').length;
  const busyPhotographers = photographers.filter(p => p.status === 'busy').length;

  // 4. Marketing Breakdown
  const sourceStats = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach(c => {
      counts[c.source] = (counts[c.source] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [customers]);

  const COLORS = ['#f97316', '#38bdf8', '#34d399', '#a78bfa', '#f43f5e', '#fbbf24', '#818cf8'];

  // Funnel Pipeline Data
  const funnelData = [
    { name: 'Lead Mới', value: customers.filter(c => c.pipelineStage === 'New Lead').length + 5, fill: '#64748b' },
    { name: 'Đang Tư Vấn', value: consultingLeads + 4, fill: '#38bdf8' },
    { name: 'Đã Báo Giá', value: quotedLeads + 3, fill: '#a78bfa' },
    { name: 'Đã Cọc / Booking', value: bookedLeads, fill: '#f97316' },
    { name: 'Đã Chụp & Bàn Giao', value: bookings.filter(b => b.bookingStatus === 'Đã chụp' || b.bookingStatus === 'Đã bàn giao').length + 1, fill: '#22d3ee' },
    { name: 'Hoàn Thành', value: completedCustomers, fill: '#34d399' }
  ];

  // Doanh thu theo tháng
  const monthlyRevenueData = [
    { month: 'T6', revenue: 45, cost: 12, bookings: 5 },
    { month: 'T7', revenue: 60, cost: 15, bookings: 7 },
    { month: 'T8', revenue: 85, cost: 22, bookings: 11 },
    { month: 'T9', revenue: 140, cost: 35, bookings: 18 },
    { month: 'T10 (Cao điểm)', revenue: 230, cost: 48, bookings: 29 },
    { month: 'T11 (Dự kiến)', revenue: 310, cost: 65, bookings: 42 }
  ];

  // Lịch chụp sắp tới
  const upcomingBookings = bookings.slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Welcome Banner - Apple Liquid Glass Elevation */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-purple-500/10 backdrop-blur-2xl border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-orange-500/20 border border-orange-500/30 text-orange-300 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              MÙA CAO ĐIỂM KỶ YẾU 2024 - 2025
            </span>
            <span className="text-xs text-white/50">
              Chu kỳ chụp lớp cao nhất năm
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight text-white">
            Dashboard Điều Hành Xoắn Media
          </h1>
          <p className="text-white/60 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Theo dõi dòng chảy khách hàng liên tục từ <strong className="text-white/90">Lead Mới</strong> qua tư vấn, điều phối thợ chụp tới chăm sóc khách hàng cũ bằng Remarketing Automation.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm backdrop-blur-md"
          >
            <Calendar className="w-4 h-4 text-orange-400" />
            Xem Calendar
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className="px-4 py-2.5 rounded-2xl glass-btn-primary text-xs font-semibold flex items-center gap-1.5"
          >
            Tạo Booking Mới
          </button>
        </div>
      </div>

      {/* KPI Cards: 4 Cột chuẩn Apple Liquid Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Khách hàng / Leads */}
        <div
          onClick={() => setActiveTab('customers')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">TỔNG LEADS & KHÁCH</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalLeads}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
            <span>Đang tư vấn: <strong className="text-white/85">{consultingLeads}</strong></span>
            <span>Đã cọc: <strong className="text-orange-400">{bookedLeads}</strong></span>
          </div>
        </div>

        {/* Card 2: Doanh thu thực tế */}
        <div
          onClick={() => setActiveTab('bookings')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">DOANH THU THỰC TẾ</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {(actualRevenue / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs font-medium text-white/45">
              / {(expectedRevenue / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
            <span>Công nợ còn lại:</span>
            <strong className="text-rose-400">{(remainingDebt / 1000000).toFixed(1)}M đ</strong>
          </div>
        </div>

        {/* Card 3: Đơn Booking kỷ yếu */}
        <div
          onClick={() => setActiveTab('bookings')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">BOOKING KỶ YẾU</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalBookings}</span>
            <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/25 px-2 py-0.5 rounded-full">
              Lớp đã chốt
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
            <span>Hoàn thành: <strong className="text-white/85">{completedCustomers}</strong></span>
            <span>Hủy / Lost: <strong className="text-white/40">{lostCustomers}</strong></span>
          </div>
        </div>

        {/* Card 4: Đội ngũ Thợ / Photographer */}
        <div
          onClick={() => setActiveTab('photographers')}
          className="glass-card p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">PHOTOGRAPHERS</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{photographers.length}</span>
            <span className="text-xs font-semibold text-purple-300">
              {activePhotographers} sẵn sàng
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
            <span>Đang bận: <strong className="text-amber-400">{busyPhotographers}</strong></span>
            <span>Đánh giá: <strong className="text-white/85">4.92 ★</strong></span>
          </div>
        </div>
      </div>

      {/* Row 2: Biểu Đồ Doanh Thu & Nguồn Lead Marketing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu & Chi phí Marketing (2 Cột) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Tăng Trưởng Doanh Thu Kỷ Yếu & Số Lớp Chụp</h2>
              <p className="text-xs text-white/45 mt-0.5">So sánh doanh thu (Triệu VNĐ) theo từng tháng trong mùa</p>
            </div>
            <span className="text-xs font-semibold text-white/80 bg-white/[0.06] border border-white/[0.1] px-3 py-1 rounded-full">
              ROAS trung bình: <strong className="text-orange-400">4.8x</strong>
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.45)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.45)' }} unit="M" />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Triệu VNĐ`,
                    name === 'revenue' ? 'Doanh Thu' : 'Chi Phí MKT'
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(22, 23, 27, 0.92)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Doanh Thu" />
                <Area type="monotone" dataKey="cost" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" name="Chi Phí MKT" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nguồn Khách Hàng (Marketing Attribution) */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Phân Bổ Nguồn Lead Kỷ Yếu</h2>
            <p className="text-xs text-white/45 mt-0.5">Tỷ lệ chuyển đổi theo kênh tiếp cận</p>

            <div className="h-56 mt-2">
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
                      backgroundColor: 'rgba(22, 23, 27, 0.92)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 border-t border-white/[0.08] pt-3">
            {sourceStats.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white/60">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {s.name}
                </span>
                <span className="font-semibold text-white/90">{s.value} Lead ({((s.value / totalLeads) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Funnel Kỷ Yếu & Lịch Chụp Sắp Tới */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phễu Chuyển Đổi Kỷ Yếu */}
        <div className="glass-panel p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Phễu Chuyển Đổi Kỷ Yếu</h2>
              <p className="text-xs text-white/45 mt-0.5">Từ Lead ban đầu đến hoàn thành bàn giao</p>
            </div>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              Mở Kanban <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {funnelData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-white/70">
                  <span>{item.name}</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.max((item.value / 15) * 100, 8)}%`,
                      backgroundColor: item.fill
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
              <h2 className="text-sm font-bold text-white tracking-wide">Lịch Chụp Sắp Tới & Điều Phối Thợ</h2>
              <p className="text-xs text-white/45 mt-0.5">Theo dõi lịch trình các lớp đã chốt ngày chụp</p>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              Xem Toàn Bộ Lịch <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {upcomingBookings.map((bk) => {
              const hasConflict = bk.assignments.leadPhotographerName?.includes('Trùng Lịch');
              const isUnassigned = !bk.assignments.leadPhotographerId;

              return (
                <div
                  key={bk.id}
                  onClick={() => {
                    setSelectedBookingId(bk.id);
                    setActiveTab('bookings');
                  }}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.16] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="bg-orange-500/15 text-orange-400 px-3 py-2 rounded-2xl text-center shrink-0 border border-orange-500/25">
                      <p className="text-[9px] uppercase font-bold tracking-wider">Ngày</p>
                      <p className="text-base font-black leading-tight">
                        {bk.shootDate.split('-')[2]}
                      </p>
                      <p className="text-[10px] text-white/50">T{bk.shootDate.split('-')[1]}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-white group-hover:text-orange-300 transition-colors">
                          {bk.className} - {bk.schoolName}
                        </span>
                        <span className="text-[10px] font-mono font-semibold bg-white/[0.08] text-white/70 px-2 py-0.5 rounded-md border border-white/[0.08]">
                          {bk.code}
                        </span>
                        {hasConflict && (
                          <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Trùng Thợ!
                          </span>
                        )}
                        {isUnassigned && (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            ⚠️ Chưa gán thợ
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-white/45 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-white/30" /> {bk.startTime} - {bk.endTime}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-white/30" /> {bk.location}
                        </span>
                      </p>

                      <p className="text-[11px] text-white/60 mt-1 font-medium">
                        Photographer: <span className="text-white/90 font-semibold">{bk.assignments.leadPhotographerName || 'Chưa phân công'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-white">
                      {bk.totalAmount.toLocaleString('vi-VN')}đ
                    </p>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-block mt-1 border ${
                      bk.paymentStatus === 'Đã thanh toán đủ'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : bk.paymentStatus === 'Đã cọc'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {bk.paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
