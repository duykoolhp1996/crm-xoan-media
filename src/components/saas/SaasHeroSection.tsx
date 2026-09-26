import React, { useState } from 'react';
import {
  Calendar,
  Layers,
  Plus,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface SaasHeroSectionProps {
  onOpenCompare: () => void;
  onOpenAddWidget: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const SaasHeroSection: React.FC<SaasHeroSectionProps> = ({
  onOpenCompare,
  onOpenAddWidget,
  activeFilter,
  onFilterChange
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterOptions = [
    'Toàn bộ mùa kỷ yếu (2024)',
    'Tháng này (Tháng 8/2024)',
    '30 ngày gần nhất',
    'Quý 3 cao điểm',
    'Từ đầu năm đến nay'
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2 pb-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Tổng Quan Doanh Thu & Vận Hành CRM
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Theo dõi doanh số hợp đồng kỷ yếu, tiến độ ekip chụp và hiệu quả đội CTV sale Xoăn Media.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex items-center gap-2 bg-white/90 hover:bg-white text-neutral-800 px-3.5 py-2 rounded-2xl border border-black/[0.06] text-xs font-semibold shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{activeFilter}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange(opt);
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeFilter === opt
                      ? 'bg-neutral-900 text-[#B8F23D] font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Compare Button */}
        <button
          onClick={onOpenCompare}
          className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-950 px-3.5 py-2 rounded-2xl border border-black/[0.06] text-xs font-semibold shadow-sm transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
          <span>So sánh mùa</span>
        </button>

        {/* Add Widget Button */}
        <button
          onClick={onOpenAddWidget}
          className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-[#B8F23D]" />
          <span>Thêm chỉ số</span>
        </button>
      </div>
    </div>
  );
};
