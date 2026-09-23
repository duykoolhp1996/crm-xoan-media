import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { CRM_MONTHLY_REVENUE_DATA } from '../../data/crmBusinessData';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export const SaasRevenueChart: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'target'>('revenue');

  // Custom Glass Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const current = payload[0].value;
      const previous = payload[1]?.value || 0;
      const diff = current - previous;

      return (
        <div className="bg-neutral-900/95 backdrop-blur-xl text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="font-bold text-neutral-400 mb-2">{label} / 2024</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-[#B8F23D]" />
                Doanh thu thực:
              </span>
              <strong className="font-extrabold text-[#B8F23D] text-sm">
                {current.toLocaleString()} triệu đ
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
                Cùng kỳ năm ngoái:
              </span>
              <span className="font-semibold text-neutral-300">
                {previous.toLocaleString()} triệu đ
              </span>
            </div>
            {diff > 0 && (
              <div className="pt-1.5 mt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>Tăng trưởng:</span>
                <span>+{diff.toLocaleString()} tr ({( (diff / previous) * 100 ).toFixed(1)}%)</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="saas-card p-6 flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Biểu Đồ Doanh Thu Kỷ Yếu Theo Tháng
            </h2>
            <span className="saas-lime-badge text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +18.6%
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            So sánh doanh thu thực tế và chỉ tiêu kinh doanh theo tháng (Triệu VNĐ)
          </p>
        </div>

        {/* Legend / Toggles */}
        <div className="flex items-center gap-2 bg-neutral-100/80 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setSelectedMetric('revenue')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedMetric === 'revenue'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Doanh thu thực
          </button>
          <button
            onClick={() => setSelectedMetric('target')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedMetric === 'target'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Mục tiêu chỉ tiêu
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={CRM_MONTHLY_REVENUE_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="crmRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8F23D" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#B8F23D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="crmPrevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.04)"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#737373', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#a3a3a3', fontSize: 11 }}
              tickFormatter={(v) => `${v}tr`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="previousPeriod"
              stroke="#cbd5e1"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#crmPrevGrad)"
            />

            <Area
              type="monotone"
              dataKey={selectedMetric === 'revenue' ? 'revenue' : 'target'}
              stroke="#83c906"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#crmRevenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 pt-4 border-t border-black/[0.04] grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[11px] text-neutral-400">Cao điểm tháng 8</span>
          <p className="font-extrabold text-neutral-900 mt-0.5 text-sm">721 triệu đ</p>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400">Doanh thu TB/tháng</span>
          <p className="font-extrabold text-neutral-900 mt-0.5 text-sm">347.5 triệu đ</p>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400">Tỷ lệ hoàn thành KPI</span>
          <p className="font-extrabold text-emerald-600 mt-0.5 text-sm">106%</p>
        </div>
      </div>
    </div>
  );
};
