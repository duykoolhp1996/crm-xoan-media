import React, { useMemo, useState } from 'react';
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
  Layers
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
import { SaasPhotographerTable } from '../saas/SaasPhotographerTable';
import { SaasCtvSalesTable } from '../saas/SaasCtvSalesTable';

export const ExecutiveDashboard: React.FC = () => {
  const {
    customers,
    bookings,
    photographers,
    setActiveTab,
    setSelectedBookingId
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'crew' | 'ctv'>('overview');

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

  const COLORS = ['#111827', '#B8F23D', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  // Funnel Pipeline Data
  const funnelData = [
    { name: 'Lead Mới', value: customers.filter(c => c.pipelineStage === 'New Lead').length + 5, fill: '#94a3b8' },
    { name: 'Đang Tư Vấn', value: consultingLeads + 4, fill: '#60a5fa' },
    { name: 'Đã Báo Giá', value: quotedLeads + 3, fill: '#818cf8' },
    { name: 'Đã Cọc / Booking', value: bookedLeads, fill: '#B8F23D' },
    { name: 'Đã Chụp & Bàn Giao', value: bookings.filter(b => b.bookingStatus === 'Đã chụp' || b.bookingStatus === 'Đã bàn giao').length + 1, fill: '#34d399' },
    { name: 'Hoàn Thành', value: completedCustomers, fill: '#10b981' }
  ];

  // Doanh thu theo tháng
  const monthlyRevenueData = [
    { month: 'T1', revenue: 145, cost: 35, bookings: 12 },
    { month: 'T2', revenue: 168, cost: 40, bookings: 14 },
    { month: 'T3', revenue: 195, cost: 48, bookings: 18 },
    { month: 'T4', revenue: 215, cost: 52, bookings: 22 },
    { month: 'T5', revenue: 342, cost: 80, bookings: 35 },
    { month: 'T6', revenue: 428, cost: 95, bookings: 44 },
    { month: 'T7', revenue: 565, cost: 120, bookings: 58 },
    { month: 'T8 (Đỉnh)', revenue: 721, cost: 145, bookings: 75 }
  ];

  // Lịch chụp sắp tới
  const upcomingBookings = bookings.slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Welcome Banner - Soft Glassmorphism Light Style */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#B8F23D]/25 via-emerald-50/60 to-white/80 backdrop-blur-2xl border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#B8F23D] text-neutral-950 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              MÙA CAO ĐIỂM KỶ YẾU 2024
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              Hệ thống CRM Vận Hành & Quản Lý Doanh Thu Xoắn Media
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight text-neutral-900">
            Tổng Quan Doanh Thu & Điều Hành Ekip
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Kiểm soát doanh thu thực tế, tiến độ 148 lớp kỷ yếu, hiệu suất 38 thợ chụp và hoa hồng mạng lưới CTV sale các trường.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-black/[0.06]'
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveSubTab('crew')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === 'crew'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-black/[0.06]'
            }`}
          >
            Đội Ngũ Thợ ({photographers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ctv')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === 'ctv'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-black/[0.06]'
            }`}
          >
            CTV Sale & Hoa Hồng
          </button>
        </div>
      </div>

      {/* Subtab View 1: Overview */}
      {activeSubTab === 'overview' && (
        <>
          {/* KPI Cards: 4 Cột chuẩn Soft Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Doanh thu thực tế */}
            <div
              onClick={() => setActiveTab('bookings')}
              className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group border-b-2 border-b-[#B8F23D]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">DOANH THU THỰC TẾ</span>
                <div className="w-9 h-9 rounded-2xl bg-[#B8F23D]/30 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4 text-neutral-900" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                  2.780M
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.6%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
                <span>Công nợ còn lại:</span>
                <strong className="text-rose-600 font-bold">142.5M đ</strong>
              </div>
            </div>

            {/* Card 2: Khách hàng / Leads */}
            <div
              onClick={() => setActiveTab('customers')}
              className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">TỔNG LỚP & KHÁCH</span>
                <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 text-neutral-800" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">148 Lớp</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
                <span>Đang tư vấn: <strong className="text-neutral-800">{consultingLeads}</strong></span>
                <span>Đã cọc: <strong className="text-emerald-700 font-bold">{bookedLeads}</strong></span>
              </div>
            </div>

            {/* Card 3: Đội ngũ Thợ / Photographer */}
            <div
              onClick={() => setActiveSubTab('crew')}
              className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">ĐỘI NGŨ THỢ & EKIP</span>
                <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4 text-neutral-800" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">38 Thợ</span>
                <span className="text-xs font-bold text-neutral-800 bg-[#B8F23D]/40 px-2 py-0.5 rounded-full">
                  94.5% sẵn sàng
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
                <span>Đang chụp: <strong className="text-amber-600 font-bold">{busyPhotographers}</strong></span>
                <span>Đánh giá: <strong className="text-neutral-900 font-bold">4.95 ★</strong></span>
              </div>
            </div>

            {/* Card 4: CTV Sale & Hoa Hồng */}
            <div
              onClick={() => setActiveSubTab('ctv')}
              className="glass-card p-5 sm:p-6 rounded-3xl cursor-pointer group border-b-2 border-b-[#B8F23D]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">HOA HỒNG CTV ĐÃ CHI</span>
                <div className="w-9 h-9 rounded-2xl bg-[#B8F23D]/30 flex items-center justify-center text-neutral-900 group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4 text-neutral-900" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">186.5M</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +22.8%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs text-neutral-500">
                <span>Doanh số từ CTV:</span>
                <strong className="text-[#79ba07] font-bold">1.168.000.000đ</strong>
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
                  <p className="text-xs text-neutral-400 mt-0.5">Doanh thu thực tế bứt phá mạnh từ tháng 5 đến tháng 8 mùa cao điểm</p>
                </div>
                <span className="text-xs font-bold text-neutral-900 bg-[#B8F23D] px-3 py-1 rounded-full shadow-xs">
                  Tháng 8 Đỉnh Điểm: 721tr
                </span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B8F23D" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#B8F23D" stopOpacity={0.0} />
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
                    <Area type="monotone" dataKey="revenue" stroke="#83c906" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Doanh Thu Thực" />
                    <Area type="monotone" dataKey="cost" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorCost)" name="Chi Phí MKT & CTV" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Nguồn Khách Hàng (Marketing Attribution) */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Phân Bổ Kênh Khách Hàng</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Tỷ lệ lớp đến từ CTV, Facebook, TikTok</p>

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
                          backgroundColor: '#111827',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-1.5 mt-2 border-t border-black/[0.04] pt-3">
                {sourceStats.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-neutral-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      {s.name}
                    </span>
                    <span className="font-semibold text-neutral-900">{s.value} Lớp ({((s.value / totalLeads) * 100).toFixed(0)}%)</span>
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
                      <span className="font-extrabold text-neutral-900">{item.value} lớp</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${Math.max((item.value / 15) * 100, 8)}%`,
                          backgroundColor: item.fill === '#B8F23D' ? '#83c906' : item.fill
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
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Subtab View 2: Quản lý Thợ & Ekip */}
      {activeSubTab === 'crew' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <SaasPhotographerTable />
        </div>
      )}

      {/* Subtab View 3: Quản lý Đội ngũ CTV Sale */}
      {activeSubTab === 'ctv' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <SaasCtvSalesTable />
        </div>
      )}
    </div>
  );
};
