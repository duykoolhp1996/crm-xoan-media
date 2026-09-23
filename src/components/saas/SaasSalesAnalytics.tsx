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
import { SAAS_SALES_ANALYTICS } from '../../data/saasData';
import { ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export const SaasSalesAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const currentData = SAAS_SALES_ANALYTICS[period];
  const totalSales = currentData.reduce((acc, curr) => acc + curr.sales, 0);
  const totalOrders = currentData.reduce((acc, curr) => acc + curr.orders, 0);
  const avgOrderValue = Math.round(totalSales / totalOrders) || 128;

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900/95 text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="font-bold text-neutral-400 mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-neutral-400">Sales:</span>
              <strong className="text-[#B8F23D]">${data.sales.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-neutral-400">Orders:</span>
              <span className="text-white font-semibold">{data.orders}</span>
            </div>
            <div className="flex justify-between gap-3 pt-1 border-t border-white/10 text-[11px]">
              <span className="text-neutral-400">AOV:</span>
              <span className="text-neutral-200">${data.aov}</span>
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
            Sales Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Order volume and transaction velocity distribution
          </p>
        </div>

        {/* Day / Week / Month Tab */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-xl capitalize transition-all ${
                period === p
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Mini KPIs Strip */}
      <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-neutral-50/80 rounded-2xl mb-4 border border-black/[0.03] text-xs">
        <div>
          <span className="text-[11px] text-neutral-400 font-medium">Period Sales</span>
          <p className="font-extrabold text-neutral-900 text-sm mt-0.5">
            ${totalSales.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 font-medium">Total Orders</span>
          <p className="font-extrabold text-neutral-900 text-sm mt-0.5">
            {totalOrders.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-neutral-400 font-medium">Avg Order Value</span>
          <p className="font-extrabold text-emerald-700 text-sm mt-0.5">
            ${avgOrderValue}
          </p>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.04)" />
            <XAxis
              dataKey="timeLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar
              dataKey="sales"
              fill="#111827"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
