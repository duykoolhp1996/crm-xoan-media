import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CRM_PACKAGE_REVENUE_DATA } from '../../data/crmBusinessData';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export const SaasSalesPerformance: React.FC = () => {
  const { totalFormatted, growth, categories } = CRM_PACKAGE_REVENUE_DATA;

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900/95 text-white p-2.5 rounded-xl shadow-lg border border-white/10 text-xs">
          <p className="font-semibold text-neutral-300">{data.name}</p>
          <p className="font-bold text-[#B8F23D] text-sm mt-0.5">{data.amount} ({data.value}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="saas-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Cơ Cấu Gói Kỷ Yếu
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Tỷ trọng doanh số theo từng gói chụp</p>
        </div>

        <span className="saas-lime-badge text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {growth}
        </span>
      </div>

      {/* Radial / Donut Chart with Center Total */}
      <div className="relative h-56 w-full flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={88}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Tổng Doanh Số
          </span>
          <span className="text-xl font-black text-neutral-900 tracking-tight mt-0.5">
            {totalFormatted}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" />
            {growth} cùng kỳ
          </span>
        </div>
      </div>

      {/* Category Breakdown Legend */}
      <div className="space-y-2.5 pt-3 border-t border-black/[0.04]">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-neutral-600">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-neutral-900">{cat.amount}</span>
              <span className="text-neutral-400 text-[11px] w-8 text-right font-medium">
                {cat.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
