import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarDays,
  Menu
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    currentUser,
    customers,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useApp();

  const isPhotoRole = currentRole === 'photographer' || currentUser?.role === 'photographer';
  const newLeadsCount = customers.filter(c => c.pipelineStage === 'New Lead').length;

  const centerTab = isPhotoRole ? 'calendar' : 'pipeline';
  const tab4 = isPhotoRole ? 'feedbacks' : 'calendar';

  return (
    <div className="lg:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-40 flex justify-center pointer-events-none px-4 select-none">
      {/* Floating Island Dock (Paytin Fintech Style) */}
      <div className="pointer-events-auto bg-[#121316]/95 backdrop-blur-2xl text-white rounded-full p-2 px-3 sm:px-4 shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-white/10 flex items-center gap-2 sm:gap-4 max-w-sm w-full justify-around">
        {/* Nút 1: Tổng Quan (Dashboard) */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
            activeTab === 'dashboard'
              ? 'text-[#B8F23D] font-extrabold scale-110'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Tổng quan"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">Tổng Quan</span>
        </button>

        {/* Nút 2: Khách Hàng (Customers) */}
        <button
          onClick={() => {
            setActiveTab('customers');
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all relative ${
            activeTab === 'customers' || activeTab === 'leads'
              ? 'text-[#B8F23D] font-extrabold scale-110'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Khách Hàng"
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">Khách Hàng</span>
        </button>

        {/* Nút 3 (Trung Tâm - Hero Neon Button): Pipeline / Lịch Ca */}
        <button
          onClick={() => {
            setActiveTab(centerTab as any);
            setIsMobileSidebarOpen(false);
          }}
          className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#B8F23D] text-neutral-950 font-black shadow-[0_4px_20px_rgba(184,242,61,0.45)] hover:scale-105 active:scale-95 transition-all -translate-y-2 border-2 border-[#121316]"
          title={isPhotoRole ? 'Lịch Ca Ekip' : 'Pipeline Bán Hàng'}
        >
          {isPhotoRole ? <CalendarDays className="w-6 h-6" /> : <Kanban className="w-6 h-6" />}
          {newLeadsCount > 0 && !isPhotoRole && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#121316] shadow-sm animate-bounce">
              {newLeadsCount}
            </span>
          )}
        </button>

        {/* Nút 4: Lịch Chụp / Feedback */}
        <button
          onClick={() => {
            setActiveTab(tab4 as any);
            setIsMobileSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
            activeTab === tab4
              ? 'text-[#B8F23D] font-extrabold scale-110'
              : 'text-neutral-400 hover:text-white'
          }`}
          title={isPhotoRole ? 'Feedback' : 'Lịch Chụp'}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">{isPhotoRole ? 'Feedback' : 'Lịch Chụp'}</span>
        </button>

        {/* Nút 5: Menu Drawer mở toàn bộ CRM */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
            isMobileSidebarOpen
              ? 'text-[#B8F23D] font-extrabold scale-110'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Tất cả phân hệ CRM"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </div>
  );
};
