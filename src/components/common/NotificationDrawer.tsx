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
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900/90 backdrop-blur-3xl border-l border-white/15 text-white shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold tracking-tight text-white">Trung Tâm Cảnh Báo & Thông Báo</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-white/60 font-medium">
              {notifications.filter(n => !n.read).length} cảnh báo chưa xử lý
            </span>
            <button
              onClick={markAllNotificationsAsRead}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Đánh dấu đã đọc tất cả
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-white/40">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-2.5 opacity-80" />
                <p className="text-sm font-medium text-white/80">Không có cảnh báo nào!</p>
                <p className="text-xs text-white/40 mt-1">Hệ thống đang vận hành hoàn hảo.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isConflict = notif.type === 'conflict';
                const isUnassigned = notif.type === 'unassigned';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      notif.read
                        ? 'bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-100 hover:bg-white/[0.05]'
                        : 'bg-white/[0.06] border-white/[0.14] hover:bg-white/[0.09] shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 shrink-0 border ${
                          isConflict
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : isUnassigned
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        {isConflict ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isUnassigned ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <Calendar className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold leading-tight ${isConflict ? 'text-rose-300' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-white/40 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {notif.timestamp}
                          </span>
                        </div>

                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        {notif.bookingId && (
                          <div className="mt-2 inline-flex items-center text-[11px] font-semibold text-orange-400 hover:text-orange-300">
                            👉 Nhấn để xem và xử lý Booking ngay
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] text-[11px] text-white/50 leading-relaxed">
            💡 <strong className="text-white/80">Mẹo vận hành:</strong> Các cảnh báo trùng lịch thợ hoặc booking chưa có ekip cần được xử lý trước ít nhất 48 giờ để đảm bảo chất lượng dịch vụ.
          </div>
        </div>
      </div>
    </div>
  );
};
