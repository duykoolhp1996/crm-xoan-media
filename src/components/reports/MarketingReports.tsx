import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Download,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Calendar,
  Layers
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
import {
  isCustomerBookedOrDeposited,
  getCustomerTotalOrderValue,
  getCustomerPaidDeposit,
  getCustomerRemainingDebt
} from '../../lib/revenueUtils';

export const MarketingReports: React.FC = () => {
  const { customers, bookings } = useApp();
  const [timeRange, setTimeRange] = useState<'this_week' | 'this_month' | 'quarter' | 'year' | 'all'>('all');

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

  // 2. Tổng hợp hiệu quả theo từng nguồn Lead thực tế từ customers & bookings (Không có chi phí marketing)
  const sourcePerformance = useMemo(() => {
    const sourcesSet = new Set<string>();
    filteredCustomers.forEach(c => {
      if (c.source) sourcesSet.add(c.source);
    });

    if (sourcesSet.size === 0 && filteredCustomers.length === 0) {
      return [];
    }

    const result = Array.from(sourcesSet).map(sourceName => {
      const channelCustomers = filteredCustomers.filter(c => (c.source || 'Khác') === sourceName);
      const leads = channelCustomers.length;

      // Số booking chốt thành công từ kênh này (Chỉ các lớp đã cọc & book)
      const bookedCustomers = channelCustomers.filter(c =>
        isCustomerBookedOrDeposited(c, bookings)
      );
      const bookingCount = bookedCustomers.length;

      // Doanh thu và tiền cọc thực tế
      const revenueRaw = bookedCustomers.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
      const revenueMillions = Number((revenueRaw / 1000000).toFixed(1));

      const depositRaw = bookedCustomers.reduce((sum, c) => sum + getCustomerPaidDeposit(c), 0);
      const depositMillions = Number((depositRaw / 1000000).toFixed(1));

      const debtRaw = Math.max(0, revenueRaw - depositRaw);
      const debtMillions = Number((debtRaw / 1000000).toFixed(1));

      // Tỷ lệ chốt
      const conversionRate = leads > 0 ? Number(((bookingCount / leads) * 100).toFixed(1)) : 0;

      return {
        source: sourceName,
        leads,
        bookings: bookingCount,
        revenue: revenueMillions,
        revenueRaw,
        depositMillions,
        depositRaw,
        debtMillions,
        debtRaw,
        conversionRate
      };
    });

    // Sắp xếp theo doanh thu giảm dần
    return result.sort((a, b) => b.revenueRaw - a.revenueRaw);
  }, [filteredCustomers, bookings]);

  // Tổng số toàn hệ thống
  const totalLeads = filteredCustomers.length;
  const bookedCustomersTotal = useMemo(() => {
    return filteredCustomers.filter(c => isCustomerBookedOrDeposited(c, bookings));
  }, [filteredCustomers, bookings]);

  const totalBookings = bookedCustomersTotal.length;
  const totalRevenue = useMemo(() => {
    return bookedCustomersTotal.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
  }, [bookedCustomersTotal]);

  const totalDeposit = useMemo(() => {
    return bookedCustomersTotal.reduce((sum, c) => sum + getCustomerPaidDeposit(c), 0);
  }, [bookedCustomersTotal]);

  const overallConversionRate = totalLeads > 0
    ? Number(((totalBookings / totalLeads) * 100).toFixed(1))
    : 0;

  // Xuất file CSV thực tế
  const handleExportCsv = () => {
    if (sourcePerformance.length === 0) {
      alert('Chưa có dữ liệu kênh trong kỳ này để xuất file!');
      return;
    }

    const headers = ['Kênh / Nguồn', 'Số Lead', 'Số Booking', 'Tỷ Lệ Chốt (%)', 'Doanh Thu HĐ (Tr Đ)', 'Đã Cọc (Tr Đ)', 'Còn Nợ (Tr Đ)'];
    const rows = sourcePerformance.map(s => [
      `"${s.source}"`,
      s.leads,
      s.bookings,
      `${s.conversionRate}%`,
      `${s.revenue.toFixed(1)} Tr`,
      `${s.depositMillions.toFixed(1)} Tr`,
      `${s.debtMillions.toFixed(1)} Tr`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Kenh_Tiep_Can_XoanMedia_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Báo Cáo Hiệu Quả Kênh Tiếp Cận Khách Hàng
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Thống kê chuyển đổi từ <strong>{totalLeads} khách hàng / lớp</strong> trong hệ thống CRM
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-black/[0.08] rounded-xl text-xs font-bold text-neutral-800 cursor-pointer shadow-xs focus:outline-none"
          >
            <option value="this_week">7 ngày qua</option>
            <option value="this_month">Tháng này</option>
            <option value="quarter">Quý này (3 tháng)</option>
            <option value="year">Cả năm</option>
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
        {/* Card 1: Tổng số Lead */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">TỔNG SỐ LEAD TIẾP NHẬN</span>
          <p className="text-2xl font-black text-neutral-900 mt-2">
            {totalLeads} Lead
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Từ Facebook, CTV, Giới thiệu, v.v.
          </span>
        </div>

        {/* Card 2: Số Lớp Chốt Cọc */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">SỐ LỚP ĐÃ CHỐT CỌC</span>
          <p className="text-2xl font-black text-sky-600 mt-2">
            {totalBookings} Lớp
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Đã chuyển sang lịch chụp chính thức
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

        {/* Card 4: Tổng doanh thu đã chốt */}
        <div className="bg-white border border-black/[0.08] p-5 rounded-3xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">TỔNG DOANH THU ĐÃ CHỐT</span>
          <p className="text-2xl font-black text-orange-600 mt-2">
            {(totalRevenue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
          </p>
          <div className="text-[11px] text-neutral-500 mt-1 space-y-0.5">
            <span className="block font-semibold text-neutral-800">
              Đã thu cọc: {(totalDeposit / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M đ
            </span>
          </div>
        </div>
      </div>

      {/* Biểu đồ & Chi tiết từng kênh */}
      {sourcePerformance.length === 0 ? (
        <div className="bg-white border border-black/[0.08] p-12 rounded-3xl text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Chưa Có Dữ Liệu Kênh Tiếp Cận</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Dữ liệu sẽ tự động tổng hợp khi bạn gán Nguồn Tiếp Cận cho khách hàng trong CRM.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart: Doanh thu theo kênh thực tế */}
          <div className="lg:col-span-2 bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Doanh Thu & Tiền Cọc Theo Kênh Tiếp Cận Thực Tế</h2>
                <p className="text-xs text-neutral-500 mt-0.5">So sánh hiệu quả doanh số mang lại của từng nguồn khách hàng</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourcePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.04)" />
                  <XAxis dataKey="source" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="M" />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}M VNĐ`, name]}
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="revenue" name="Doanh Thu Hợp Đồng" fill="#65a30d" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="depositMillions" name="Tiền Cọc Đã Thu" fill="#0284c7" radius={[6, 6, 0, 0]} />
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
                    <span className="text-emerald-700 shrink-0">{item.revenue}M đ</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>{item.leads} Lead • {item.bookings} Chốt ({item.conversionRate}%)</span>
                  </div>
                  {item.revenueRaw > 0 && (
                    <div className="text-[10px] text-neutral-600 flex justify-between bg-white px-2 py-1 rounded-lg border border-black/[0.04]">
                      <span>Đã cọc: <strong className="text-emerald-700">{item.depositMillions}M đ</strong></span>
                      <span>Còn nợ: <strong className="text-rose-600">{item.debtMillions}M đ</strong></span>
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
