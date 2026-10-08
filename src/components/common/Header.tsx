import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Calendar as CalendarIcon,
  LogOut,
  Menu
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { ProfileModal } from './ProfileModal';
import { VersionUpdateBanner } from './VersionUpdateBanner';
import { AppSwitcherModal } from './AppSwitcherModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    unreadNotificationCount,
    setIsSearchOpen,
    dateFilter,
    setDateFilter,
    isImpersonating,
    returnToAdmin,
    logout,
    activeTab,
    setActiveTab,
    setIsMobileSidebarOpen
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = unreadNotificationCount;
  const isSalesOrPhoto = currentRole === 'sales' || currentRole === 'photographer';

  const roleLabels: Record<UserRole, { label: string; badgeClass: string; desc: string }> = {
    admin: {
      label: 'Admin (Toàn Quyền)',
      badgeClass: 'bg-neutral-900 text-[#B8F23D]',
      desc: 'Quản trị hệ thống, dữ liệu tài chính & cài đặt'
    },
    manager: {
      label: 'Quản Lý Vận Hành',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Điều phối thợ, xem toàn bộ Booking & Báo cáo'
    },
    sales: {
      label: 'Sales Tư Vấn',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Chăm sóc Lead, chốt cọc & tạo Task'
    },
    marketing: {
      label: 'Marketing & CTV',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Chạy Campaign, Segment & Quản lý CTV'
    },
    photographer: {
      label: 'Photographer',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Xem lịch chụp được phân công của mình'
    }
  };

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard Điều Hành',
    customers: 'Danh Sách Khách Hàng',
    pipeline: 'Customer Pipeline (13 Bước)',
    schools: 'Quản Lý Trường / Lớp Kỷ Yếu',
    bookings: 'Quản Lý Booking & Hợp Đồng',
    calendar: 'Calendar Lịch Chụp Ekip',
    photographers: 'Đội Ngũ Thợ Chụp & Ekip',
    services: 'Gói Dịch Vụ & Combo',
    pancake: 'App Pancake (Hộp Thư Đa Kênh & POS Bán Hàng)',
    'chat-messenger': 'App Pancake (Hộp Thư Đa Kênh & POS Bán Hàng)',
    'reports-photographer': 'Hiệu Suất Thợ Chụp',
    settings: 'Cài Đặt Hệ Thống'
  };

  return (
    <header className="h-14 sm:h-16 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-all duration-200 shadow-xs">
      {/* Left: Mobile Menu Toggle Button & Spotlight Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 -ml-1 rounded-xl text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 active:scale-95 transition-all"
          title="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 sm:gap-3 w-full bg-neutral-100/80 hover:bg-neutral-100 active:scale-[0.99] text-neutral-500 hover:text-neutral-800 px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm border border-black/[0.05] shadow-xs transition-all duration-200 group"
        >
          <Search className="w-4 h-4 text-neutral-400 group-hover:text-neutral-800 transition-colors shrink-0" />
          <span className="flex-1 text-left truncate tracking-normal">
            <span className="inline sm:hidden">Tìm nhanh...</span>
            <span className="hidden sm:inline">Tìm kiếm khách hàng, lớp, số ĐT, thợ, booking...</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border border-neutral-200 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-neutral-500 shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Banner Đang đăng nhập với tư cách nhân viên */}
        {isImpersonating && (
          <div className="flex items-center gap-2 bg-neutral-900 text-[#B8F23D] px-3 py-1.5 rounded-2xl text-xs shadow-sm animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-[#B8F23D] animate-ping" />
            <span className="font-medium text-white truncate max-w-[180px] hidden sm:inline">
              Đang xem quyền: <strong className="text-[#B8F23D] font-bold">{currentUser.name}</strong>
            </span>
            <button
              onClick={returnToAdmin}
              className="bg-white/10 hover:bg-white/20 text-white hover:text-[#B8F23D] px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-colors flex items-center gap-1 border border-white/10"
              title="Quay lại quyền quản trị Admin"
            >
              Quay lại Admin
            </button>
          </div>
        )}

        {/* Bộ lọc thời gian chuẩn kính mờ */}
        <div className="hidden lg:flex items-center bg-white/90 hover:bg-white rounded-2xl px-3 py-1.5 border border-black/[0.06] text-xs font-semibold text-neutral-700 shadow-xs transition-colors">
          <CalendarIcon className="w-3.5 h-3.5 text-neutral-400 mr-2" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border-none text-neutral-800 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">Toàn bộ mùa kỷ yếu</option>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng 8 (Cao điểm)</option>
          </select>
        </div>

        {/* User Role Badge (Chỉ hiện trên desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-neutral-100/90 border border-black/[0.06] rounded-2xl px-3 py-1.5 text-xs shadow-2xs">
          <div className="w-2 h-2 rounded-full bg-[#79ba07]"></div>
          <span className="font-bold text-neutral-800">
            {roleLabels[currentRole]?.label.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Bộ Chuyển Đổi Ứng Dụng (9 Chấm - App Launcher) */}
        <AppSwitcherModal buttonClassName="w-9 h-9 rounded-2xl bg-white/90 hover:bg-white border border-black/[0.06] flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors shadow-xs cursor-pointer" />

        {/* Notifications Icon Button */}
        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative w-9 h-9 rounded-2xl bg-white/90 hover:bg-white border border-black/[0.06] flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors shadow-xs"
          title="Thông báo hệ thống"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B8F23D] text-neutral-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs border border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="w-9 h-9 rounded-2xl bg-neutral-200 overflow-hidden border border-black/[0.08] shadow-xs hover:ring-2 hover:ring-[#B8F23D] transition-all cursor-pointer group"
          title={`${currentUser.name} - Bấm để xem hồ sơ & đổi ảnh đại diện`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </button>

        {/* Logout Button (Desktop only - mobile dùng trong menu drawer) */}
        <button
          onClick={logout}
          className="hidden md:flex p-2 bg-white/90 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-black/[0.06] rounded-2xl items-center gap-1.5 text-xs font-bold transition-colors shadow-xs"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {/* Notification Drawer Modal */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Profile Modal — Hỗ trợ tất cả người dùng (Admin, Sales, Photographer) */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Floating Toast: Thông báo cập nhật phiên bản mới v1.2.7 */}
      <VersionUpdateBanner
        onOpenNotifications={() => setIsNotifOpen(true)}
      />
    </header>
  );
};
