import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ArrowUpRight,
  Download,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const MarketingReports: React.FC = () => {
  const { customers, bookings, campaigns, setActiveTab } = useApp();
  const [timeRange, setTimeRange] = useState<'this_week' | 'this_month' | 'quarter' | 'year' | 'all'>('this_month');

  // 1. Lọc khách hàng thực tế theo khoảng thời gian được chọn
  const filteredCustomers = useMemo(() => {
    if (timeRange === 'all') return customers;
    const now = new Date();
    return customers.filter(c => {
      if (!c.createdAt) return true;
      const created = new Date(c.createdAt);
      if (isNaN(created.getTime())) return true;
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (timeRange === 'this_week') return diffDays <= 7;
      if (timeRange === 'this_month') return diffDays <= 31;
      if (timeRange === 'quarter') return diffDays <= 92;
      if (timeRange === 'year') return diffDays <= 365;
      return true;
    });
  }, [customers, timeRange]);

  // 2. Tính chi phí Ads từ các chiến dịch Marketing thực tế
  const adsSpendByChannel = useMemo(() => {
    const map: Record<string, number> = {
      'Facebook Ads': 0,
      'TikTok Ads': 0,
      'Zalo': 0,
      'Google': 0
    };
    campaigns.forEach(camp => {
      if (camp.channel === 'Facebook') map['Facebook Ads'] = (map['Facebook Ads'] || 0) + (camp.spent || 0);
      else if (camp.channel === 'TikTok') map['TikTok Ads'] = (map['TikTok Ads'] || 0) + (camp.spent || 0);
      else if (camp.channel === 'Zalo') map['Zalo'] = (map['Zalo'] || 0) + (camp.spent || 0);
    });
    return map;
  }, [campaigns]);

  // 3. Tổng hợp hiệu quả theo từng nguồn Lead thực tế từ customers & bookings
  const sourcePerformance = useMemo(() => {
    // Thu thập tất cả các kênh xuất hiện trong dữ liệu thực tế
    const sourcesSet = new Set<string>();
    filteredCustomers.forEach(c => {
      if (c.source) sourcesSet.add(c.source);
    });
    Object.keys(adsSpendByChannel).forEach(k => {
      if (adsSpendByChannel[k] > 0) sourcesSet.add(k);
    });

    if (sourcesSet.size === 0 && filteredCustomers.length === 0) {
      return [];
    }

    const result = Array.from(sourcesSet).map(sourceName => {
      const channelCustomers = filteredCustomers.filter(c => (c.source || 'Khác') === sourceName);
      const leads = channelCustomers.length;

      // Số booking chốt thành công từ kênh này
      const bookedCustomers = channelCustomers.filter(c =>
        ['Đã đặt cọc', 'Đã Booking', 'Đã chụp', 'Đang hậu kỳ', 'Đã bàn giao', 'Hoàn thành'].includes(c.pipelineStage) ||
        bookings.some(b => b.customerId === c.id)
      );
      const bookingCount = bookedCustomers.length;

      // Doanh thu thực tế (VNĐ & Triệu VNĐ)
      const revenueRaw = channelCustomers.reduce((sum, c) => sum + (c.totalRevenue || c.paidAmount || c.expectedBudget || 0), 0);
      const revenueMillions = Number((revenueRaw / 1000000).toFixed(1));

      // Chi phí Ads (VNĐ & Triệu VNĐ)
      const costRaw = adsSpendByChannel[sourceName] || 0;
      const costMillions = Number((costRaw / 1000000).toFixed(1));

      // Tỷ lệ chốt
      const conversionRate = leads > 0 ? Number(((bookingCount / leads) * 100).toFixed(1)) : 0;

      // Cost per Lead (CPL)
      const cpl = leads > 0 && costRaw > 0 ? Math.round(costRaw / leads) : 0;

      // ROAS
      const roas = costRaw > 0
        ? `${Number((revenueRaw / costRaw).toFixed(2))}x`
        : (revenueRaw > 0 ? 'Tự nhiên (0đ Ads)' : '0x');

      return {
        source: sourceName,
        leads,
        bookings: bookingCount,
        revenue: revenueMillions,
        revenueRaw,
        cost: costMillions,
        costRaw,
        cpl,
        roas,
        conversionRate
      };
    });

    // Sắp xếp theo doanh thu giảm dần
    return result.sort((a, b) => b.revenueRaw - a.revenueRaw);
  }, [filteredCustomers, bookings, adsSpendByChannel]);

  // 4. Tổng hợp các chỉ số KPI Toàn Kênh từ dữ liệu thực tế
  const totalLeads = filteredCustomers.length;
  const totalBookings = useMemo(() => {
    return filteredCustomers.filter(c =>
      ['Đã đặt cọc', 'Đã Booking', 'Đã chụp', 'Đang hậu kỳ', 'Đã bàn giao', 'Hoàn thành'].includes(c.pipelineStage) ||
      bookings.some(b => b.customerId === c.id)
    ).length;
  }, [filteredCustomers, bookings]);

  const totalRevenue = useMemo(() => {
    return filteredCustomers.reduce((sum, c) => sum + (c.totalRevenue || c.paidAmount || c.expectedBudget || 0), 0);
  }, [filteredCustomers]);

  const totalAdsCost = useMemo(() => {
    return Object.values(adsSpendByChannel).reduce((sum, val) => sum + val, 0);
  }, [adsSpendByChannel]);

  const avgCpl = totalLeads > 0 && totalAdsCost > 0 ? Math.round(totalAdsCost / totalLeads) : 0;
  const overallConversionRate = totalLeads > 0 ? Number(((totalBookings / totalLeads) * 100).toFixed(1)) : 0;
  const overallRoas = totalAdsCost > 0
    ? `${Number((totalRevenue / totalAdsCost).toFixed(2))}x`
    : (totalRevenue > 0 ? 'Tự nhiên (0đ Ads)' : '0x');

  // Xuất file CSV thực tế
  const handleExportCsv = () => {
    if (sourcePerformance.length === 0) {
      alert('Chưa có dữ liệu kênh marketing trong kỳ này để xuất file!');
      return;
    }

    const headers = ['Kênh / Nguồn', 'Số Lead', 'Số Booking', 'Tỷ Lệ Chốt (%)', 'Doanh Thu (Tr Đ)', 'Chi Phí Ads (Tr Đ)', 'CPL (VNĐ)', 'ROAS'];
    const rows = sourcePerformance.map(s => [
      `"${s.source}"`,
      s.leads,
      s.bookings,
      `${s.conversionRate}%`,
      `${s.revenue.toFixed(1)} Tr`,
      `${s.cost.toFixed(1)} Tr`,
      s.cpl.toLocaleString('vi-VN'),
      `"${s.roas}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Marketing_XoanMedia_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neutral-900" />
            Báo Cáo Hiệu Quả Marketing & Kênh Tiếp Cận
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Dữ liệu tính toán thời gian thực từ <strong>{totalLeads} khách hàng / lớp</strong> và các chiến dịch quảng cáo thực tế
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-black/[0.08] rounded-xl text-xs font-bold text-neutral-800 cursor-pointer shadow-xs focus:outline-none"
          >
            <option value="this_week">7 ngày qua</option>
            <option value="this_month">Tháng này (Mùa Kỷ Yếu)</option>
            <option value="quarter">Quý này (3 tháng)</option>
            <option value="year">Cả năm 2024</option>
            <option value="all">Toàn bộ thời gian</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* KPI Cards: Dữ liệu thực tế 100% */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng chi phí Ads */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">TỔNG CHI PHÍ ADS</span>
          <p className="text-2xl font-black text-neutral-900 mt-2">
            {(totalAdsCost / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {totalAdsCost > 0 ? 'Chiến dịch Facebook + TikTok Ads' : 'Chưa phát sinh chi phí Ads'}
          </span>
        </div>

        {/* Card 2: Cost Per Lead */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">COST PER LEAD (CPL)</span>
          <p className="text-2xl font-black text-sky-600 mt-2">
            {avgCpl > 0 ? `${avgCpl.toLocaleString('vi-VN')}đ` : '0đ'}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {totalLeads > 0 ? `Tính trên ${totalLeads} lead tiếp nhận` : 'Chưa có lead trong kỳ'}
          </span>
        </div>

        {/* Card 3: Tỷ lệ chốt cọc */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">TỶ LỆ CHỐT CỌC</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {overallConversionRate}%
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {totalBookings} lớp chốt / {totalLeads} lead tư vấn
          </span>
        </div>

        {/* Card 4: ROAS Toàn Mùa */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">ROAS KINH DOANH</span>
          <p className="text-2xl font-black text-orange-600 mt-2">
            {overallRoas}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Doanh thu {(totalRevenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </span>
        </div>
      </div>

      {/* Main Content: Chart & Breakdown */}
      {sourcePerformance.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-black/[0.08] rounded-3xl space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 shadow-2xs">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">Chưa có dữ liệu khách hàng thực tế trong kỳ này</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Hệ thống đã xóa toàn bộ data demo và chuyển sang liên kết trực tiếp với dữ liệu khách hàng thực tế. Khi có lead mới từ Facebook Ads, TikTok Ads, Website... hoặc tạo lớp mới, biểu đồ sẽ hiển thị ngay lập tức.
          </p>
          <button
            onClick={() => setActiveTab('customers')}
            className="mt-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tiếp Nhận Lead / Lớp Mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart: Doanh thu & Chi phí theo kênh thực tế */}
          <div className="lg:col-span-2 bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Doanh Thu & Chi Phí Theo Kênh Tiếp Cận Thực Tế</h2>
                <p className="text-xs text-neutral-500 mt-0.5">So sánh hiệu quả mang lại của từng nguồn lead trong hệ thống</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourcePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.04)" />
                  <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="M" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}M VNĐ`, name === 'revenue' ? 'Doanh Thu' : 'Chi Phí Ads']}
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="revenue" name="Doanh Thu" fill="#f97316" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cost" name="Chi Phí Ads" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bảng tổng kết chi tiết từng kênh */}
          <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <h2 className="text-sm font-bold text-neutral-900">Chi Tiết Từng Kênh ({sourcePerformance.length})</h2>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Thực tế</span>
            </div>

            <div className="space-y-2.5 pt-1 overflow-y-auto max-h-[300px]">
              {sourcePerformance.map((item, idx) => (
                <div key={idx} className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.05] text-xs space-y-1.5 shadow-2xs">
                  <div className="flex justify-between font-bold text-neutral-900">
                    <span className="truncate pr-2">{item.source}</span>
                    <span className="text-orange-600 shrink-0">{item.revenue}M đ</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>{item.leads} Lead • {item.bookings} Chốt ({item.conversionRate}%)</span>
                    <span className="font-semibold text-emerald-700">ROAS: {item.roas}</span>
                  </div>
                  {item.cpl > 0 && (
                    <div className="text-[10px] text-neutral-400 pt-0.5 border-t border-black/[0.04] flex justify-between">
                      <span>CPL:</span>
                      <strong className="text-neutral-700">{item.cpl.toLocaleString('vi-VN')}đ / lead</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
