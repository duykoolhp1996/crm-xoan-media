import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Calendar,
  UserCheck,
  Clock,
  Check,
  Sparkles
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSelectedBookingId,
    setActiveTab
  } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.bookingId) {
      setSelectedBookingId(notif.bookingId);
      setActiveTab('bookings');
      onClose();
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);

      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;

      return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${date.toLocaleDateString('vi-VN')}`;
    } catch {
      return timestamp;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return createPortal(
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Backdrop mờ che phủ toàn màn hình */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer trượt từ cạnh phải */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-white border-l border-black/[0.08] text-neutral-900 shadow-2xl flex flex-col h-full pointer-events-auto animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-neutral-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#B8F23D] text-neutral-950 flex items-center justify-center font-black shadow-sm shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight">
                  Trung Tâm Cảnh Báo & Vận Hành
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  CRM Xoăn Media Realtime Notifications
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-5 py-2.5 bg-neutral-50 border-b border-black/[0.06] flex items-center justify-between text-xs shrink-0">
            <span className="text-neutral-500 font-medium">
              Chưa đọc: <strong className="text-neutral-900">{unreadCount}</strong> thông báo
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[#79ba07] hover:text-[#5d9004] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-neutral-50/30">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-60" />
                <p className="font-bold text-neutral-700">Không có thông báo mới.</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Tất cả lịch chụp, tiền cọc và tiến độ đều đang hoạt động tốt!
                </p>
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
                        ? 'bg-white border-blue-200/90 shadow-xs hover:border-blue-400'
                        : 'bg-white/80 hover:bg-white border-black/[0.05] opacity-75'
                    }`}
                  >
                    {!notif.read && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
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
                          <p className={`text-xs truncate ${!notif.read ? 'font-black text-neutral-900' : 'font-bold text-neutral-700'}`}>
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-medium block mt-1.5 font-mono">
                          {formatNotificationTime(notif.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Drawer */}
          <div className="p-3.5 bg-white border-t border-black/[0.06] text-center shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Đóng thông báo
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
