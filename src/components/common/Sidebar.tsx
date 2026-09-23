import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Kanban,
  GraduationCap,
  CalendarDays,
  Camera,
  Layers,
  Sparkles,
  BarChart3,
  TrendingUp,
  Settings,
  CalendarCheck,
  Heart
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentRole, notifications, customers, feedbacks } = useApp();

  const newLeadsCount = customers.filter(c => c.pipelineStage === 'New Lead').length;
  const unreadAlerts = notifications.filter(n => !n.read && n.severity === 'danger').length;

  interface NavItem {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
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
          label: 'Dashboard Điều Hành',
          icon: LayoutDashboard,
          roles: ['admin', 'manager', 'sales', 'marketing']
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
          badgeColor: 'bg-orange-500/30 text-orange-300 border border-orange-500/40',
          roles: ['admin', 'manager', 'sales', 'marketing']
        },
        {
          id: 'pipeline',
          label: 'Customer Pipeline (13 B)',
          icon: Kanban,
          roles: ['admin', 'manager', 'sales']
        },
        {
          id: 'schools',
          label: 'Quản Lý Trường / Lớp',
          icon: GraduationCap,
          roles: ['admin', 'manager', 'sales']
        }
      ]
    },
    {
      groupTitle: 'BOOKING & ĐỘI NGŨ',
      items: [
        {
          id: 'bookings',
          label: 'Quản Lý Booking',
          icon: CalendarCheck,
          badge: unreadAlerts > 0 ? unreadAlerts : undefined,
          badgeColor: 'bg-rose-500/30 text-rose-300 border border-rose-500/40',
          roles: ['admin', 'manager', 'sales', 'photographer']
        },
        {
          id: 'calendar',
          label: 'Calendar Lịch Chụp',
          icon: CalendarDays,
          roles: ['admin', 'manager', 'sales', 'photographer']
        },
        {
          id: 'photographers',
          label: 'Đội Ngũ Thợ / Photo',
          icon: Camera,
          roles: ['admin', 'manager']
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
      groupTitle: 'TĂNG TRƯỞNG & VẬN HÀNH',
      items: [
        {
          id: 'feedbacks',
          label: 'Khoảnh Khắc & Feedback',
          icon: Heart,
          badge: feedbacks.length > 0 ? feedbacks.length : undefined,
          badgeColor: 'bg-rose-500/30 text-rose-300 border border-rose-500/40',
          roles: ['admin', 'manager', 'sales', 'marketing', 'photographer']
        },
        {
          id: 'remarketing',
          label: 'Remarketing & Automation',
          icon: Sparkles,
          badge: 3,
          badgeColor: 'bg-purple-500/30 text-purple-300 border border-purple-500/40',
          roles: ['admin', 'manager', 'marketing']
        }
      ]
    },
    {
      groupTitle: 'BÁO CÁO & HỆ THỐNG',
      items: [
        {
          id: 'reports-marketing',
          label: 'Báo Cáo Marketing',
          icon: TrendingUp,
          roles: ['admin', 'manager', 'marketing']
        },
        {
          id: 'reports-photographer',
          label: 'Hiệu Suất Thợ Chụp',
          icon: BarChart3,
          roles: ['admin', 'manager']
        },
        {
          id: 'settings',
          label: 'Cài Đặt & Tích Hợp',
          icon: Settings,
          roles: ['admin']
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-neutral-950/60 backdrop-blur-2xl text-white/70 flex flex-col h-screen sticky top-0 shrink-0 select-none z-40 border-r border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.08] bg-white/[0.015]">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/20 font-black text-lg">
          🌀
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm tracking-tight">XOẮN MEDIA</span>
            <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full">
              CRM
            </span>
          </div>
          <p className="text-[10px] text-white/40 font-medium tracking-wide">Kỷ Yếu & Hình Ảnh Học Đường</p>
        </div>
      </div>

      {/* Navigation Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navigationGroups.map((group, idx) => {
          const accessibleItems = group.items.filter(item => !item.roles || item.roles.includes(currentRole));
          if (accessibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold tracking-widest text-white/35 uppercase">
                {group.groupTitle}
              </h4>
              <div className="space-y-1 mt-1.5">
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-orange-500/20 text-white font-semibold border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)]'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-orange-400' : 'text-white/45'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-orange-500 text-white shadow-sm'
                              : item.badgeColor || 'bg-white/10 text-white/80 border border-white/10'
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

      {/* Footer System Status */}
      <div className="p-3 border-t border-white/[0.08] bg-white/[0.01]">
        <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
            <span className="text-[11px] font-medium text-white/70">Vận hành kỷ yếu</span>
          </div>
          <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
            Mùa 2024-2025
          </span>
        </div>
      </div>
    </aside>
  );
};
