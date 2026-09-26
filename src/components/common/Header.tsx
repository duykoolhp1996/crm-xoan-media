import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Calendar as CalendarIcon,
  LogOut
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { ProfileModal } from './ProfileModal';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    notifications,
    setIsSearchOpen,
    dateFilter,
    setDateFilter,
    isImpersonating,
    returnToAdmin,
    logout
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
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
    feedbacks: 'Khoảnh Khắc & Feedback',
    remarketing: 'Remarketing & Automation',
    'reports-photographer': 'Hiệu Suất Thợ Chụp',
    settings: 'Cài Đặt Hệ Thống'
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] px-6 flex items-center justify-between sticky top-0 z-10 transition-all duration-200 shadow-xs">
      {/* Left: Global Search Pill Trigger (Apple Spotlight Style) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 w-full bg-neutral-100/80 hover:bg-neutral-100 active:scale-[0.99] text-neutral-500 hover:text-neutral-800 px-4 py-2 rounded-2xl text-xs sm:text-sm border border-black/[0.05] shadow-xs transition-all duration-200 group"
        >
          <Search className="w-4 h-4 text-neutral-400 group-hover:text-neutral-800 transition-colors" />
          <span className="flex-1 text-left truncate tracking-normal">
            Tìm kiếm khách hàng, lớp, số ĐT, thợ, booking...
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

        {/* User Role Badge (Cố định theo tài khoản đăng nhập) */}
        <div className="flex items-center gap-2 bg-neutral-100/90 border border-black/[0.06] rounded-2xl px-3 py-1.5 text-xs shadow-2xs">
          <div className="w-2 h-2 rounded-full bg-[#79ba07]"></div>
          <span className="font-bold text-neutral-800 hidden sm:inline">
            {roleLabels[currentRole]?.label.split(' ')[0] || 'User'}
          </span>
        </div>

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
        <div
          className="w-9 h-9 rounded-2xl bg-neutral-200 overflow-hidden border border-black/[0.08] shadow-xs"
          title={currentUser.name}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 bg-white/90 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-black/[0.06] rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-colors shadow-xs"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span className="hidden md:inline">Đăng Xuất</span>
        </button>
      </div>

      {/* Notification Drawer Modal */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Profile Modal — chỉ Sales & Photographer */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </header>
  );
};
