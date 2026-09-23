import React from 'react';
import { DollarSign, GraduationCap, Camera, Handshake, ArrowUpRight } from 'lucide-react';
import { CrmKpiMetric } from '../../data/crmBusinessData';

interface SaasKpiCardsProps {
  metrics: CrmKpiMetric[];
}

export const SaasKpiCards: React.FC<SaasKpiCardsProps> = ({ metrics }) => {
  const renderIcon = (name: CrmKpiMetric['iconName']) => {
    switch (name) {
      case 'dollar':
        return <DollarSign className="w-4 h-4 text-neutral-800" />;
      case 'school-class':
        return <GraduationCap className="w-4 h-4 text-neutral-800" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-neutral-800" />;
      case 'users-handshake':
        return <Handshake className="w-4 h-4 text-neutral-800" />;
    }
  };

  // Helper để vẽ mini SVG sparkline mềm mại
  const renderSparkline = (data: number[], isLime: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = isLime ? '#79ba07' : '#111827';
    const fillColor = isLime ? 'rgba(184, 242, 61, 0.25)' : 'rgba(17, 24, 39, 0.06)';

    // Path đóng lại để đổ màu gradient phía dưới
    const areaPoints = `${points} ${width},${height} 0,${height}`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polygon points={areaPoints} fill={fillColor} />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {metrics.map((kpi, idx) => {
        const hasLimeAccent = idx === 0 || idx === 3;

        return (
          <div
            key={kpi.id}
            className={`saas-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer ${
              hasLimeAccent ? 'border-b-2 border-b-[#B8F23D]' : ''
            }`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {kpi.label}
              </span>
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-colors ${
                  hasLimeAccent ? 'bg-[#B8F23D]/30' : 'bg-neutral-100'
                }`}
              >
                {renderIcon(kpi.iconName)}
              </div>
            </div>

            {/* Middle: Big Value */}
            <div className="my-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {kpi.value}
              </h3>
              {kpi.subLabel && (
                <p className="text-[11px] text-neutral-400 mt-1">
                  {kpi.subLabel}
                </p>
              )}
            </div>

            {/* Bottom: Change Badge & Mini Sparkline */}
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                    hasLimeAccent
                      ? 'saas-lime-badge'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  {kpi.change}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">tăng trưởng</span>
              </div>

              {/* Sparkline Visual */}
              <div className="shrink-0 group-hover:scale-105 transition-transform">
                {renderSparkline(kpi.sparkline, hasLimeAccent)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
