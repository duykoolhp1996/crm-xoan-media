import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const MarketingReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('this_month');

  // Dữ liệu tổng hợp theo nguồn
  const sourcePerformance = [
    { source: 'Facebook Ads', leads: 48, bookings: 12, revenue: 86.5, cost: 18.2, cpl: 379, roas: 4.75 },
    { source: 'TikTok Ads', leads: 34, bookings: 8, revenue: 54.0, cost: 12.5, cpl: 367, roas: 4.32 },
    { source: 'Referral (Giới thiệu)', leads: 22, bookings: 14, revenue: 112.0, cost: 2.5, cpl: 113, roas: 44.8 },
    { source: 'Website / SEO', leads: 18, bookings: 5, revenue: 32.5, cost: 4.0, cpl: 222, roas: 8.12 },
    { source: 'Facebook Organic', leads: 15, bookings: 4, revenue: 26.0, cost: 1.5, cpl: 100, roas: 17.3 }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            Báo Cáo Hiệu Quả Marketing & Kênh Tiếp Cận
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Phân tích chi phí quảng cáo (Cost per Lead), tỷ lệ chuyển đổi chốt cọc và ROAS theo từng nguồn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-semibold text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="this_week">Tuần này</option>
            <option value="this_month">Tháng này (Mùa Kỷ Yếu)</option>
            <option value="quarter">Quý 4/2024</option>
            <option value="year">Cả năm 2024</option>
          </select>

          <button
            onClick={() => alert('Đã xuất file báo cáo Excel Marketing!')}
            className="px-3.5 py-2 glass-btn-secondary rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">TỔNG CHI PHÍ ADS</span>
          <p className="text-2xl font-black text-white mt-2">38.7M đ</p>
          <span className="text-[11px] text-white/50 mt-1 block">Facebook + TikTok Ads</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">COST PER LEAD (CPL)</span>
          <p className="text-2xl font-black text-sky-400 mt-2">282,000đ</p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center">
            <ArrowUpRight className="w-3 h-3" /> Tối ưu hơn 15% mùa trước
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">TỶ LỆ CHỐT CỌC</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">31.4%</p>
          <span className="text-[11px] text-white/50 mt-1 block">Lead tư vấn → Chốt Booking</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/45">ROAS TOÀN MÙA</span>
          <p className="text-2xl font-black text-orange-400 mt-2">8.03x</p>
          <span className="text-[11px] text-white/50 mt-1 block">311M Doanh thu / 38.7M Ads</span>
        </div>
      </div>

      {/* Chart: Doanh thu theo kênh */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white">Doanh Thu & Số Booking Theo Từng Kênh</h2>
              <p className="text-xs text-white/50 mt-0.5">So sánh hiệu quả mang lại của từng kênh truyền thông</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.45)' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.45)' }} unit="M" />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}M VNĐ`, name === 'revenue' ? 'Doanh Thu' : 'Chi Phí']}
                  contentStyle={{
                    backgroundColor: 'rgba(22, 23, 27, 0.92)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
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

        {/* Bảng tổng kết */}
        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <h2 className="text-sm font-bold text-white">Chi Tiết Từng Kênh</h2>
          <div className="space-y-2.5 pt-2">
            {sourcePerformance.map((item, idx) => (
              <div key={idx} className="p-3 bg-white/[0.04] rounded-2xl border border-white/[0.08] text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{item.source}</span>
                  <span className="text-orange-400">{item.revenue}M đ</span>
                </div>
                <div className="flex justify-between text-white/50 text-[11px]">
                  <span>{item.leads} Lead • {item.bookings} Booking</span>
                  <span className="font-semibold text-emerald-400">ROAS: {item.roas}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
