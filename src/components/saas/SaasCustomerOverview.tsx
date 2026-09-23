import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SAAS_CUSTOMER_SEGMENTS, SAAS_CUSTOMER_METRICS } from '../../data/saasData';
import { Users, UserPlus, UserCheck, UserMinus } from 'lucide-react';

export const SaasCustomerOverview: React.FC = () => {
  const { total, newCount, returningCount, churnRate, clv } = SAAS_CUSTOMER_METRICS;

  const CustomCustomerTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900/95 text-white p-2.5 rounded-xl shadow-lg border border-white/10 text-xs">
          <p className="font-semibold text-neutral-300">{data.name}</p>
          <p className="font-bold text-[#B8F23D] text-sm mt-0.5">
            {data.count.toLocaleString()} users ({data.value}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="saas-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Customer Overview
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Retention and lifecycle cohort breakdown</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-neutral-400 font-medium">Customer LTV</span>
          <p className="text-sm font-extrabold text-neutral-900">{clv}</p>
        </div>
      </div>

      {/* Donut Chart & Middle Totals */}
      <div className="relative h-44 w-full flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomCustomerTooltip />} />
            <Pie
              data={SAAS_CUSTOMER_SEGMENTS}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {SAAS_CUSTOMER_SEGMENTS.map((entry, index) => (
                <Cell key={`customer-cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-neutral-400">Total Base</span>
          <span className="text-xl font-black text-neutral-900">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Segment Metrics List */}
      <div className="space-y-2 pt-3 border-t border-black/[0.04] text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8F23D]" />
            <span className="text-neutral-600 font-medium">New Customers</span>
          </div>
          <strong className="text-neutral-900">{newCount.toLocaleString()} (48%)</strong>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
            <span className="text-neutral-600 font-medium">Returning Users</span>
          </div>
          <strong className="text-neutral-900">{returningCount.toLocaleString()} (36%)</strong>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
            <span className="text-neutral-400 font-medium">Monthly Churn</span>
          </div>
          <span className="text-rose-500 font-bold">{churnRate}</span>
        </div>
      </div>
    </div>
  );
};
