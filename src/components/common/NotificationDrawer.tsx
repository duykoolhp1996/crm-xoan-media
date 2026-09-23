import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Calendar,
  UserCheck,
  Clock,
  Check
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setSelectedBookingId, setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.bookingId) {
      setSelectedBookingId(notif.bookingId);
      setActiveTab('bookings');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white/95 backdrop-blur-2xl border-l border-black/[0.08] text-neutral-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-neutral-50/80 border-b border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900">Trung Tâm Cảnh Báo & Vận Hành</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-2.5 bg-white border-b border-black/[0.04] flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">
              Chưa đọc: <strong>{notifications.filter(n => !n.read).length}</strong> thông báo
            </span>
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[#79ba07] hover:text-[#5d9004] font-bold flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Đánh dấu đã đọc tất cả
            </button>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                <p>Không có thông báo mới.</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Tất cả lịch chụp và cọc đều ổn định!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUrgent = notif.severity === 'danger';
                const isWarning = notif.severity === 'warning';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      !notif.read
                        ? 'bg-neutral-50/80 border-black/[0.08] shadow-xs'
                        : 'bg-white hover:bg-neutral-50/60 border-black/[0.04] opacity-80'
                    }`}
                  >
                    {!notif.read && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#B8F23D] ring-2 ring-white" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isUrgent
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {isUrgent ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isWarning ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-neutral-900 truncate">
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-medium block mt-1.5">
                          {notif.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
