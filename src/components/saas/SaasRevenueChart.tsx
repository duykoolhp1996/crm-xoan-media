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
import { SAAS_REVENUE_CHART_DATA } from '../../data/saasData';
import { ArrowUpRight } from 'lucide-react';

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
          <p className="font-bold text-neutral-400 mb-2">{label} 2024</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-[#B8F23D]" />
                Current:
              </span>
              <strong className="font-extrabold text-[#B8F23D] text-sm">
                ${current.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
                Prev Period:
              </span>
              <span className="font-semibold text-neutral-300">
                ${previous.toLocaleString()}
              </span>
            </div>
            {diff > 0 && (
              <div className="pt-1.5 mt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>Growth:</span>
                <span>+${diff.toLocaleString()} ({( (diff / previous) * 100 ).toFixed(1)}%)</span>
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
              Revenue Overview
            </h2>
            <span className="saas-lime-badge text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +18.6%
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monthly gross revenue comparison vs previous cycle
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
            Gross Revenue
          </button>
          <button
            onClick={() => setSelectedMetric('target')}
            className={`px-3 py-1 rounded-xl transition-all ${
              selectedMetric === 'target'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Target Plan
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={SAAS_REVENUE_CHART_DATA}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="limeRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8F23D" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#B8F23D" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="prevPeriodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="rgba(0,0,0,0.04)"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `$${v / 1000}k`}
              dx={-4}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Previous Period Series (Dashed Line) */}
            <Area
              type="monotone"
              dataKey="previousPeriod"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#prevPeriodGradient)"
            />

            {/* Main Series (Lime Accent Line) */}
            <Area
              type="monotone"
              dataKey={selectedMetric === 'revenue' ? 'revenue' : 'target'}
              stroke="#83c906"
              strokeWidth={2.5}
              fill="url(#limeRevenueGradient)"
              activeDot={{
                r: 6,
                fill: '#B8F23D',
                stroke: '#111827',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Legend Footer */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-black/[0.04] text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#83c906]" />
            <span className="font-medium text-neutral-600">Current Period (Jan - Aug)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-neutral-400" />
            <span className="font-medium text-neutral-400">Previous Period</span>
          </div>
        </div>
        <div className="text-neutral-500 font-semibold text-[11px]">
          Peak: <strong className="text-neutral-900">$278,860</strong>
        </div>
      </div>
    </div>
  );
};
