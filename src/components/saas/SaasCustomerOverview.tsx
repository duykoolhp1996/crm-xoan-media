import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CRM_LEAD_SOURCES } from '../../data/crmBusinessData';
import { Users, Megaphone, Share2, Compass } from 'lucide-react';

export const SaasCustomerOverview: React.FC = () => {
  const CustomSourceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900/95 text-white p-2.5 rounded-xl shadow-lg border border-white/10 text-xs">
          <p className="font-semibold text-neutral-300">{data.name}</p>
          <p className="font-bold text-[#B8F23D] text-sm mt-0.5">
            {data.classCount} lớp ({data.value}%)
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Doanh số: {data.revenue}</p>
        </div>
      );
    }
    return null;
  };

  const totalClasses = CRM_LEAD_SOURCES.reduce((acc, curr) => acc + curr.classCount, 0);

  return (
    <div className="saas-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Nguồn Khách & Tiếp Cận
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Tỷ lệ lớp học theo kênh tiếp cận</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-neutral-400 font-medium">Kênh hiệu quả nhất</span>
          <p className="text-xs font-extrabold text-[#79ba07]">Đội CTV Sale (42%)</p>
        </div>
      </div>

      {/* Donut Chart & Middle Totals */}
      <div className="relative h-44 w-full flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomSourceTooltip />} />
            <Pie
              data={CRM_LEAD_SOURCES}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {CRM_LEAD_SOURCES.map((entry, index) => (
                <Cell key={`source-cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold text-neutral-400">Tổng Số Lớp</span>
          <span className="text-xl font-black text-neutral-900">
            {totalClasses} Lớp
          </span>
        </div>
      </div>

      {/* Segment Metrics List */}
      <div className="space-y-2 pt-3 border-t border-black/[0.04] text-xs">
        {CRM_LEAD_SOURCES.map((source) => (
          <div key={source.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <span className="text-neutral-600 font-medium">{source.name}</span>
            </div>
            <strong className="text-neutral-900">
              {source.classCount} lớp ({source.value}%)
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};
