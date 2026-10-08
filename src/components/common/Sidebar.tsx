import React from 'react';
import logoXoan from '../../assets/logo-xoan.png';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarDays,
  Camera,
  Layers,
  BarChart3,
  TrendingUp,
  Settings,
  CalendarCheck,
  LogOut,
  X,
  Trash2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    notifications,
    customers,
    deletedCustomers,
    currentUser,
    logout,
    photographers,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  const newLeadsCount = customers.filter(c => c.pipelineStage === 'New Lead').length;
  const unreadAlerts = notifications.filter(n => !n.read && n.severity === 'danger').length;

  const isPhotoRole = currentRole === 'photographer' || currentUser?.role === 'photographer';
  const myPhoto = isPhotoRole
    ? photographers.find(
        p =>
          p.id === currentUser.id ||
          p.fullName.toLowerCase() === currentUser.name.toLowerCase() ||
          (currentUser.phone && p.phone === currentUser.phone)
      )
    : null;
  const isPhotoLead = Boolean(
    myPhoto?.notes?.toUpperCase().includes('LEAD') || myPhoto?.fullName?.toLowerCase().includes('lead')
  );

  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    roles?: string[];
  }

  interface NavGroup {
    groupTitle: string;
    items: NavItem[];
  }

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: 'TỔNG QUAN',
      items: [
        {
          id: 'dashboard',
          label: isPhotoRole
            ? (isPhotoLead ? 'Dashboard Team Chụp' : 'Dashboard Cá Nhân')
            : (currentRole === 'sales' ? 'Dashboard Doanh Số' : 'Dashboard Điều Hành'),
          icon: LayoutDashboard,
          roles: ['admin', 'manager', 'sales', 'marketing', 'photographer']
        }
      ]
    },
    {
      groupTitle: 'CRM & KHÁCH HÀNG',
      items: [
        {
          id: 'customers',
          label: 'Danh Sách Khách Hàng',
          icon: Users,
          badge: newLeadsCount > 0 ? newLeadsCount : undefined,
          roles: ['admin', 'manager', 'sales', 'marketing']
        },
        {
          id: 'pipeline',
          label: 'Lead Pipeline (10 Bước)',
          icon: Kanban,
          roles: ['admin', 'manager', 'sales']
        },
        {
          id: 'trash',
          label: 'Thùng Rác & Đã Xóa',
          icon: Trash2,
          badge: deletedCustomers.length > 0 ? deletedCustomers.length : undefined,
          roles: ['admin', 'manager', 'sales']
        }
      ]
    },
    {
      groupTitle: 'BOOKING & ĐỘI NGŨ',
      items: [
        {
          id: 'bookings',
          label: 'Quản Lý Booking & Cọc',
          icon: CalendarCheck,
          badge: unreadAlerts > 0 ? unreadAlerts : undefined,
          roles: ['admin', 'manager', 'sales']
        },
        {
          id: 'calendar',
          label: 'Calendar Lịch Chụp',
          icon: CalendarDays,
          roles: ['admin', 'manager', 'sales', 'photographer']
        },
        {
          id: 'photographers',
          label: isPhotoRole ? (isPhotoLead ? 'Thành Viên Trong Team' : 'Hồ Sơ Của Tôi') : 'Đội Ngũ Thợ & Ekip',
          icon: Camera,
          roles: ['admin', 'manager', 'photographer']
        },
        {
          id: 'services',
          label: 'Gói Dịch Vụ Kỷ Yếu',
          icon: Layers,
          roles: ['admin', 'manager', 'sales']
        }
      ]
    },
    {
      groupTitle: 'BÁO CÁO & HỆ THỐNG',
      items: [
        {
          id: 'reports-photographer',
          label: isPhotoRole ? (isPhotoLead ? 'Hiệu Suất & DS Team' : 'Thù Lao & Ca Chụp') : 'Hiệu Suất Thợ Chụp',
          icon: BarChart3,
          roles: ['admin', 'manager', 'photographer']
        },
        {
          id: 'settings',
          label: isPhotoRole || currentRole === 'sales' ? 'Tài Khoản Của Tôi' : 'Cài Đặt Hệ Thống',
          icon: Settings,
          roles: ['admin', 'sales', 'photographer']
        }
      ]
    }
  ];

  // Hàm render nội dung điều hướng
  const renderNavList = (isMobile = false) => (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
      {navigationGroups.map((group, idx) => {
        const accessibleItems = group.items.filter(item => !item.roles || item.roles.includes(currentRole));
        if (accessibleItems.length === 0) return null;

        return (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              {group.groupTitle}
            </h4>
            <div className="space-y-1 mt-1.5">
              {accessibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-neutral-900 text-[#B8F23D] font-bold shadow-sm'
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-[#B8F23D]' : 'text-neutral-400'}`} />
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-[#B8F23D] text-neutral-950'
                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Hàm render thông tin user và đăng xuất
  const renderUserFooter = () => (
    <div className="p-3 border-t border-black/[0.06] bg-white/40 space-y-2">
      <div className="flex items-center justify-between p-2 rounded-2xl bg-neutral-50 border border-black/[0.04]">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-black/[0.06] shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-900 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-neutral-400 capitalize">{currentRole}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-xl transition-colors shrink-0"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50/50 rounded-xl border border-black/[0.03] text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#79ba07] shadow-[0_0_8px_#B8F23D] animate-pulse"></span>
          <span className="text-[10px] font-medium text-neutral-500">Mùa 2026</span>
        </div>
        <span className="text-[10px] font-bold font-mono text-neutral-900 bg-[#B8F23D]/50 border border-[#B8F23D] px-2 py-0.5 rounded-full shadow-sm" title="Phiên bản CRM">
          v1.2.7
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Ẩn trên mobile, hiện trên màn hình lớn lg:) */}
      <aside className="hidden lg:flex w-64 bg-white/80 backdrop-blur-2xl text-neutral-600 flex-col h-screen sticky top-0 shrink-0 select-none z-20 border-r border-black/[0.06] shadow-sm">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-black/[0.06] bg-white/40">
          <img
            src={logoXoan}
            alt="Xoăn Media"
            className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-black/[0.08]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-neutral-900 text-sm tracking-tight">XOĂN MEDIA</span>
              <span className="text-[10px] font-bold bg-[#B8F23D] text-neutral-950 px-1.5 py-0.2 rounded-full shadow-xs">
                CRM
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-medium tracking-wide">Kỷ Yếu & Hình Ảnh Học Đường</p>
          </div>
        </div>

        {renderNavList(false)}
        {renderUserFooter()}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (Trượt ra khi bấm Menu hoặc nút Hamburger) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
          {/* Backdrop tối làm mờ */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer trượt từ bên trái */}
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250 select-none">
            {/* Header Mobile Drawer với nút đóng X */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoXoan}
                  alt="Xoăn Media"
                  className="w-8 h-8 rounded-xl object-cover shadow-xs border border-black/[0.08]"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-neutral-900 text-xs">XOĂN MEDIA</span>
                    <span className="text-[9px] font-bold bg-[#B8F23D] text-neutral-950 px-1.5 py-0.2 rounded-full">
                      CRM
                    </span>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-medium">Kỷ Yếu & Học Đường</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
                title="Đóng menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renderNavList(true)}
            {renderUserFooter()}
          </aside>
        </div>
      )}
    </>
  );
};
