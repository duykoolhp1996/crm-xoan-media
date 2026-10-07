import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ChevronRight, Bell, Calendar, UserPlus, DollarSign, Sparkles } from 'lucide-react';
import { playNotificationTone, vibrateDevice } from '../../utils/notificationAudio';

export const IosPushBanner: React.FC = () => {
  const {
    activePushBanner,
    closePushBanner,
    setSelectedCustomerId,
    setSelectedBookingId,
    setActiveTab,
    currentRole,
    markNotificationAsRead
  } = useApp();

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (activePushBanner) {
      setIsExiting(false);
      // Phát âm thanh và rung ngay khi banner xuất hiện
      playNotificationTone();
      vibrateDevice([120, 60, 120]);

      // Tự động rút lại sau 6 giây
      const timer = setTimeout(() => {
        handleDismiss();
      }, 6500);

      return () => clearTimeout(timer);
    }
  }, [activePushBanner]);

  if (!activePushBanner) return null;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      closePushBanner();
      setIsExiting(false);
    }, 250);
  };

  const handleClickAction = () => {
    if (!activePushBanner) return;
    markNotificationAsRead(activePushBanner.id);

    if (activePushBanner.customerId) {
      setSelectedCustomerId(activePushBanner.customerId);
    } else if (activePushBanner.bookingId) {
      setSelectedBookingId(activePushBanner.bookingId);
      if (currentRole === 'photographer') {
        setActiveTab('calendar');
      } else {
        setActiveTab('bookings');
      }
    }
    handleDismiss();
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'new_lead':
        return <UserPlus className="w-4 h-4 text-[#B8F23D]" />;
      case 'shoot_assigned':
      case 'shoot_scheduled':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case 'deposit':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#B8F23D]" />;
    }
  };

  return (
    <aside
      aria-label="Thông báo đẩy kiểu iOS"
      className={`fixed top-2 sm:top-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[410px] z-[99999] transition-all duration-300 ease-out select-none ${
        isExiting
          ? '-translate-y-12 opacity-0 scale-95'
          : 'translate-y-0 opacity-100 scale-100 animate-in slide-in-from-top-6 duration-300'
      }`}
    >
      <div
        onClick={handleClickAction}
        className="bg-neutral-950/95 backdrop-blur-2xl border border-white/15 text-white rounded-[26px] p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-1 ring-white/10 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      >
        {/* Ambient neon light */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#B8F23D]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header hàng trên: Kiểu iOS notification badge */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <img
              src="./logo-xoan.png"
              alt="Logo"
              className="w-4 h-4 rounded-full object-cover border border-[#B8F23D]/40"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-extrabold text-[#B8F23D] tracking-wider uppercase text-[10px]">
              CRM XOĂN MEDIA
            </span>
            <span className="text-neutral-500">•</span>
            <span className="font-semibold text-neutral-400 text-[10px]">VỪA XONG</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Nội dung thông báo kiểu iOS */}
        <div className="flex items-start gap-3 mt-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
            {getNotifIcon(activePushBanner.type)}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-1">
              {activePushBanner.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-neutral-300 mt-0.5 leading-relaxed line-clamp-2">
              {activePushBanner.message}
            </p>
          </div>
        </div>

        {/* Nút hành động xem nhanh */}
        <div className="mt-3 pt-2 flex items-center justify-between border-t border-white/5">
          <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
            <Bell className="w-3 h-3 text-[#B8F23D]" /> Chạm để mở chi tiết
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#B8F23D] bg-[#B8F23D]/10 hover:bg-[#B8F23D]/20 px-2.5 py-1 rounded-xl transition-colors">
            <span>Xem ngay</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </aside>
  );
};
