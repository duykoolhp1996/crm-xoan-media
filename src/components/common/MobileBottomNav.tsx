import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessengerIcon } from '../chat/MessengerIcon';
import {
  LayoutDashboard,
  Kanban,
  CalendarDays,
  Menu,
  Sparkles
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    currentUser,
    customers,
    unreadMessengerCount,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  const isPhotoRole = currentRole === 'photographer' || currentUser?.role === 'photographer';
  const newLeadsCount = customers.filter(c => c.pipelineStage === 'New Lead').length;

  const tab2 = isPhotoRole ? 'calendar' : 'pipeline';
  const tab4 = isPhotoRole ? 'feedbacks' : 'calendar';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tổng Quan',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: tab2,
      label: isPhotoRole ? 'Lịch Ca' : 'Pipeline',
      icon: isPhotoRole ? CalendarDays : Kanban,
      badge: !isPhotoRole && newLeadsCount > 0 ? newLeadsCount : undefined
    },
    {
      id: 'chat-messenger',
      label: 'Messenger',
      icon: MessengerIcon,
      badge: unreadMessengerCount > 0 ? unreadMessengerCount : undefined,
      isSpecial: true
    },
    {
      id: tab4,
      label: isPhotoRole ? 'Feedback' : 'Lịch Chụp',
      icon: CalendarDays,
      badge: undefined
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-black/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] select-none">
      <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileSidebarOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-neutral-900 font-extrabold' : 'text-neutral-400 hover:text-neutral-600 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-[#B8F23D] shadow-xs scale-105'
                      : 'hover:bg-neutral-100 text-neutral-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Badge số tin nhắn hoặc lead mới */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-neutral-900 font-bold' : 'text-neutral-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Nút Menu Drawer mở toàn bộ chức năng */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            isMobileSidebarOpen ? 'text-neutral-900 font-extrabold' : 'text-neutral-400 hover:text-neutral-600 font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isMobileSidebarOpen
                ? 'bg-neutral-900 text-[#B8F23D] shadow-xs scale-105'
                : 'hover:bg-neutral-100 text-neutral-500'
            }`}
          >
            <Menu className="w-4 h-4" />
          </div>
          <span className={`text-[10px] mt-0.5 tracking-tight ${isMobileSidebarOpen ? 'text-neutral-900 font-bold' : 'text-neutral-400'}`}>
            Menu
          </span>
        </button>
      </div>
    </div>
  );
};
