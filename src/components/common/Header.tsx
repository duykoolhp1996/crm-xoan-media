import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Calendar as CalendarIcon,
  Shield,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface HeaderProps {
  onSwitchToSaas?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSwitchToSaas }) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    notifications,
    setIsSearchOpen,
    dateFilter,
    setDateFilter
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Đóng dropdown vai trò khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    if (isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoleDropdownOpen]);

  const roleLabels: Record<UserRole, { label: string; badgeClass: string; desc: string }> = {
    admin: {
      label: 'Admin (Toàn Quyền)',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      desc: 'Quản trị hệ thống, dữ liệu tài chính & cài đặt'
    },
    manager: {
      label: 'Quản Lý Vận Hành',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      desc: 'Điều phối thợ, xem toàn bộ Booking & Báo cáo'
    },
    sales: {
      label: 'Sales Tư Vấn',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      desc: 'Chăm sóc Lead, chốt cọc & tạo Task'
    },
    marketing: {
      label: 'Marketing Growth',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      desc: 'Chạy Campaign, Segment & Remarketing'
    },
    photographer: {
      label: 'Photographer',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      desc: 'Xem lịch chụp được phân công của mình'
    }
  };

  return (
    <header className="h-16 bg-neutral-950/40 backdrop-blur-2xl border-b border-white/[0.08] px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      {/* Left: Global Search Pill Trigger (Apple Spotlight Style) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 w-full bg-white/[0.05] hover:bg-white/[0.09] active:scale-[0.99] text-white/50 hover:text-white/80 px-4 py-2 rounded-2xl text-xs sm:text-sm border border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-200 group"
        >
          <Search className="w-4 h-4 text-white/40 group-hover:text-orange-400 transition-colors" />
          <span className="flex-1 text-left truncate tracking-normal">
            Tìm kiếm khách hàng, lớp, số ĐT, thợ, booking...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-white/[0.08] border border-white/[0.15] px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white/70 shadow-sm backdrop-blur-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Bộ lọc thời gian chuẩn kính mờ */}
        <div className="hidden lg:flex items-center bg-white/[0.05] hover:bg-white/[0.08] rounded-2xl px-2.5 py-1 border border-white/[0.1] text-xs transition-colors">
          <CalendarIcon className="w-3.5 h-3.5 text-white/50 mr-1.5" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-white/85 font-medium py-1 pr-1 text-xs focus:outline-none cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="today">Hôm nay</option>
            <option value="this_week">Tuần này</option>
            <option value="this_month">Tháng này (Mùa Kỷ Yếu)</option>
            <option value="quarter">Quý này</option>
            <option value="all">Toàn bộ thời gian</option>
          </select>
        </div>

        {/* Role Switcher Popover (RBAC Switcher) */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-sm ${roleLabels[currentRole].badgeClass}`}
            title="Đổi vai trò để kiểm thử phân quyền (RBAC)"
          >
            <Shield className="w-3.5 h-3.5 stroke-[2]" />
            <span>{roleLabels[currentRole].label.split(' ')[0]}</span>
            <ChevronDown className={`w-3 h-3 opacity-70 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-76 rounded-2xl p-2 bg-neutral-900/90 backdrop-blur-3xl border border-white/[0.18] shadow-[0_24px_50px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)_inset] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/[0.08]">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Mô Phỏng Phân Quyền (RBAC)
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Chuyển đổi giao diện theo vai trò người dùng:
                </p>
              </div>

              <div className="space-y-1 mt-1">
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex flex-col transition-all duration-150 ${
                      currentRole === role
                        ? 'bg-orange-500/20 border border-orange-500/30 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={currentRole === role ? 'text-orange-300 font-bold' : ''}>
                        {roleLabels[role].label}
                      </span>
                      {currentRole === role && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    </div>
                    <span className="text-[10px] text-white/45 mt-0.5">{roleLabels[role].desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell Circular Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
            title="Xem cảnh báo & thông báo"
          >
            <Bell className="w-4 h-4 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-neutral-900 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Chuyển sang SaaS Dashboard */}
        {onSwitchToSaas && (
          <button
            onClick={onSwitchToSaas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B8F23D]/20 hover:bg-[#B8F23D]/30 border border-[#B8F23D]/50 text-[#B8F23D] text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Mở SaaS Business Analytics Dashboard"
          >
            <span>✦ SaaS Analytics</span>
          </button>
        )}

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white/90 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-white/45">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* Drawer Thông Báo Kính Mờ */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </header>
  );
};
