import React, { useState } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Sparkles,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { SaasTab } from './SaasSidebar';

interface SaasHeaderProps {
  activeTab: SaasTab;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProModal: () => void;
  onSwitchWorkspace?: () => void;
}

export const SaasHeader: React.FC<SaasHeaderProps> = ({
  activeTab,
  onOpenSearch,
  onOpenNotifications,
  onOpenProModal,
  onSwitchWorkspace
}) => {
  const [selectedRange] = useState('Mùa Kỷ Yếu 2024');

  const tabLabels: Record<SaasTab, string> = {
    dashboard: 'Tổng Quan Doanh Thu & Ekip',
    'doanh-thu': 'Doanh Thu CRM & Hợp Đồng',
    'tho-chup': 'Quản Lý Thợ Chụp & Ekip',
    'ctv-sale': 'Đội Ngũ CTV Sale & Hoa Hồng',
    'hop-dong': 'Hợp Đồng Lớp & Công Nợ',
    'lich-chup': 'Lịch Trình Ekip Studio',
    'bao-cao': 'Báo Cáo Hoạt Động & Lợi Nhuận',
    'cai-dat': 'Cài Đặt Hệ Thống CRM'
  };

  return (
    <header className="h-16 px-6 sm:px-8 flex items-center justify-between z-20 transition-all">
      {/* Left: Minimal Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <span className="text-neutral-400 font-medium">Hệ Thống CRM Xoắn Media</span>
        <span className="text-neutral-300">/</span>
        <span className="font-semibold text-neutral-900 tracking-tight">
          {tabLabels[activeTab]}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar / Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 bg-white/80 hover:bg-white text-neutral-400 hover:text-neutral-700 px-3.5 py-1.5 rounded-full border border-black/[0.06] text-xs font-medium shadow-sm transition-all group"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-neutral-800 transition-colors" />
          <span className="hidden md:inline">Tìm kiếm lớp, thợ chụp, CTV sale...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-neutral-100 text-neutral-500 rounded border border-neutral-200">
            ⌘K
          </kbd>
        </button>

        {/* Date Range Selector Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-white/80 border border-black/[0.06] px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-700 shadow-sm cursor-pointer hover:bg-white transition-colors">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>{selectedRange}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400 opacity-60" />
        </div>

        {/* Small "Nâng cấp" / VIP Badge Button */}
        <button
          onClick={onOpenProModal}
          className="flex items-center gap-1.5 bg-[#B8F23D] hover:bg-[#a5e426] text-neutral-950 font-bold px-3 py-1.5 rounded-full text-xs shadow-sm hover:shadow transition-all group active:scale-95"
        >
          <Sparkles className="w-3 h-3" />
          <span>Bản Pro VIP</span>
          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>

        {/* Notification Icon */}
        <button
          onClick={onOpenNotifications}
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-black/[0.06] flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors shadow-sm relative"
          title="Thông báo vận hành"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neutral-900" />
        </button>

        {/* Workspace Switcher Link */}
        {onSwitchWorkspace && (
          <button
            onClick={onSwitchWorkspace}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition-colors border border-black/[0.05]"
            title="Chuyển sang module Bàn Vận Hành Kỷ Yếu"
          >
            <span>🌀 Bàn Vận Hành</span>
          </button>
        )}
      </div>
    </header>
  );
};
