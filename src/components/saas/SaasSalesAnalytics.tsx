import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { CRM_SALES_PERIODS } from '../../data/crmBusinessData';
import { TrendingUp, GraduationCap, DollarSign } from 'lucide-react';

export const SaasSalesAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const currentData = CRM_SALES_PERIODS[period];
  const totalSales = currentData.reduce((acc, curr) => acc + curr.sales, 0);
  const totalClasses = currentData.reduce((acc, curr) => acc + curr.classesClosed, 0);
  const avgContractValue = totalClasses > 0 ? (totalSales / totalClasses).toFixed(1) : '18.5';

  const periodLabels: Record<'day' | 'week' | 'month', string> = {
    day: 'Theo ngày',
    week: 'Theo tuần',
    month: 'Theo tháng'
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900/95 text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="font-bold text-neutral-400 mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-400">Doanh số:</span>
              <strong className="text-[#B8F23D]">{data.sales} triệu đ</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-400">Số lớp chốt:</span>
              <span className="text-white font-semibold">{data.classesClosed} lớp</span>
            </div>
            <div className="flex justify-between gap-3 pt-1 border-t border-white/10 text-[11px]">
              <span className="text-neutral-400">Giá trị TB/lớp:</span>
              <span className="text-neutral-200">{data.avgContractValue} tr/lớp</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="saas-card p-6 flex flex-col justify-between h-full">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Tốc Độ Chốt Hợp Đồng Kỷ Yếu
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Doanh số và số lượng lớp học chốt cọc thành công
          </p>
        </div>

        {/* Day / Week / Month Tab */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-xl transition-all ${
                period === p
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Mini KPIs Strip */}
      <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-neutral-50/80 rounded-2xl mb-4 border border-black/[0.03] text-xs">
        <div>
          <span className="text-[11px] text-neutral-400 font-medium">Doanh số kỳ này</span>
          <p className="font-extrabold text-neutral-900 text-sm mt-0.5">
            {totalSales.toLocaleString()} tr
          </p>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 font-medium">Tổng lớp chốt</span>
          <p className="font-extrabold text-neutral-900 text-sm mt-0.5">
            {totalClasses} lớp
          </p>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 font-medium">TB / hợp đồng</span>
          <p className="font-extrabold text-[#79ba07] text-sm mt-0.5">
            {avgContractValue} tr
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
            <XAxis
              dataKey="timeLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#737373', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a3a3a3', fontSize: 10 }}
              tickFormatter={(v) => `${v}tr`}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="sales"
              fill="#111827"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
