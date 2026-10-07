import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  Check,
  Sparkles,
  Camera,
  DollarSign,
  Trash2,
  ArrowRight,
  Smartphone,
  Volume2,
  Share,
  Info
} from 'lucide-react';
import { SystemNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentRole,
    userNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setSelectedCustomerId,
    setSelectedBookingId,
    setActiveTab,
    triggerPushBanner
  } = useApp();

  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'unread'>('all');
  const [testSent, setTestSent] = useState(false);

  // Trạng thái quyền thông báo Web Notification API
  const [hasNotificationSupport, setHasNotificationSupport] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationSupport(true);
      setPermissionState(Notification.permission);
    }
  }, [isOpen]);

  // Lọc thông báo theo tab
  const displayedNotifications = useMemo(() => {
    if (activeFilterTab === 'unread') {
      return userNotifications.filter(n => !n.read);
    }
    return userNotifications;
  }, [userNotifications, activeFilterTab]);

  const unreadCount = useMemo(() => {
    return userNotifications.filter(n => !n.read).length;
  }, [userNotifications]);

  if (!isOpen) return null;

  const handleNotificationClick = (notif: SystemNotification) => {
    markNotificationAsRead(notif.id);

    if (notif.customerId) {
      setSelectedCustomerId(notif.customerId);
      onClose();
    } else if (notif.bookingId) {
      setSelectedBookingId(notif.bookingId);
      if (currentRole === 'photographer') {
        setActiveTab('calendar');
      } else {
        setActiveTab('bookings');
      }
      onClose();
    }
  };

  // Phát âm thanh chuông báo (Ding Chime) bằng Web Audio API
  const playNotificationTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.16); // D6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Bỏ qua nếu audio bị chặn
    }
  };

  // Xin quyền thông báo đẩy của hệ điều hành
  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        if (perm === 'granted') {
          handleSendTestNotification();
        }
      } catch (e) {
        console.warn('Lỗi xin quyền thông báo:', e);
      }
    }
  };

  // Bắn thông báo thử nghiệm tới thiết bị di động / iOS
  const handleSendTestNotification = () => {
    // 1. Phát âm thanh chuông chuông ngân
    playNotificationTone();

    // 2. Rung máy (Hỗ trợ điện thoại)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch {}
    }

    // 3. Kích hoạt thông báo hệ thống (Tương thích chuẩn iOS PWA & Desktop/Android)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notifTitle = '🔔 CRM Xoăn Media (iOS & Mobile)';
      const notifOptions = {
        body: `Thông báo thử nghiệm cho ${currentUser.name} (${roleText}) hoạt động thành công!`,
        icon: './favicon.png',
        badge: './favicon.png',
        tag: 'crm-test-' + Date.now()
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification(notifTitle, notifOptions);
          })
          .catch(() => {
            try {
              new Notification(notifTitle, notifOptions);
            } catch {}
          });
      } else {
        try {
          new Notification(notifTitle, notifOptions);
        } catch {}
      }
    }

    // 4. Bắn banner đẩy kiểu iOS (Dynamic Island) trượt từ đỉnh màn hình xuống
    const testNotif: SystemNotification = {
      id: `notif-test-${Date.now()}`,
      type: 'system',
      title: '🔔 THỬ NGHIỆM THÔNG BÁO THÀNH CÔNG',
      message: `Thiết bị của ${currentUser.name} (${roleText}) đã kết nối thông báo thành công. Mọi Lead mới và lịch chụp sẽ được báo về ngay lập tức!`,
      targetUserId: currentUser.id,
      severity: 'success',
      timestamp: new Date().toISOString(),
      read: false
    };

    triggerPushBanner(testNotif);
    addNotification(testNotif);

    setTestSent(true);
    // Tự động đóng Drawer sau 300ms để người dùng nhìn thấy banner iOS trượt xuống màn hình chính
    setTimeout(() => {
      onClose();
    }, 350);
    setTimeout(() => setTestSent(false), 4000);
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

  const getNotificationIconAndBadge = (notif: SystemNotification) => {
    switch (notif.type) {
      case 'new_lead':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
          badgeText: 'Lead Mới',
          badgeClass: 'bg-purple-100 text-purple-700 border-purple-200'
        };
      case 'shoot_scheduled':
        return {
          icon: <Calendar className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
          badgeText: 'Lịch Chụp',
          badgeClass: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'shoot_assigned':
        return {
          icon: <Camera className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          badgeText: 'Ca Chụp Ekip',
          badgeClass: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'deposit':
        return {
          icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          badgeText: 'Chốt Cọc',
          badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      case 'unassigned':
      case 'conflict':
      case 'overload':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          badgeText: 'Cảnh Báo',
          badgeClass: 'bg-rose-100 text-rose-700 border-rose-200'
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-neutral-600" />,
          bg: 'bg-neutral-100 border-neutral-200 text-neutral-700',
          badgeText: 'Hệ Thống',
          badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200'
        };
    }
  };

  const roleText =
    currentRole === 'admin'
      ? 'Quản Trị Viên (Admin)'
      : currentRole === 'sales'
      ? 'Chuyên Viên Sales'
      : currentRole === 'photographer'
      ? 'Photographer Ekip'
      : 'Thành Viên Hệ Thống';

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
              <div className="min-w-0">
                <h2 className="text-sm font-extrabold text-white tracking-tight truncate">
                  Thông Báo Cá Nhân Hóa
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8F23D] shrink-0" />
                  <p className="text-[11px] text-neutral-300 truncate">
                    {currentUser.name} <span className="text-neutral-500">•</span> <strong className="text-[#B8F23D] font-medium">{roleText}</strong>
                  </p>
                </div>
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

          {/* Subheader: Bộ lọc Tab Tất Cả / Chưa Đọc */}
          <div className="px-5 py-2.5 bg-neutral-100/80 border-b border-black/[0.06] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-black/[0.06] shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeFilterTab === 'all'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Tất cả ({userNotifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilterTab('unread')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilterTab === 'unread'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <span>Chưa đọc</span>
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeFilterTab === 'unread'
                      ? 'bg-[#B8F23D] text-neutral-950'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="text-[#79ba07] hover:text-[#5d9004] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Đánh dấu tất cả thông báo của bạn là đã đọc"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đã đọc tất cả</span>
                </button>
              )}

              {userNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-neutral-400 hover:text-rose-500 text-xs p-1 rounded-lg transition-colors cursor-pointer"
                  title="Xóa danh sách thông báo của tài khoản này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Công cụ hỗ trợ iOS & Thông báo Đẩy (Device Push & Test Tool) */}
          <div className="p-3 bg-[#B8F23D]/10 border-b border-[#B8F23D]/20 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-neutral-800 text-xs font-bold">
                <Smartphone className="w-3.5 h-3.5 text-[#5d9004]" />
                <span>Hỗ Trợ Thiết Bị Di Động & iOS</span>
              </div>

              {testSent && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-in fade-in">
                  ✅ Đã bắn thông báo!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {permissionState !== 'granted' && hasNotificationSupport ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="flex-1 py-1.5 px-2.5 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 font-black rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Bật Thông Báo Đẩy Trên Máy</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleSendTestNotification}
                className="flex-1 py-1.5 px-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#B8F23D]" />
                <span>🧪 Test Thông Báo Trên Máy Này</span>
              </button>
            </div>

            {/* Mẹo nhận thông báo trên iPhone */}
            <div className="text-[10px] text-neutral-600 bg-white/70 rounded-xl p-2 border border-black/[0.04] flex items-start gap-1.5 leading-tight">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Mẹo trên iPhone / iPad:</strong> Nhấn biểu tượng <strong>Chia sẻ (Share ⬆️)</strong> trên Safari ➔ Chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong> để nhận thông báo đẩy tức thì như ứng dụng gốc!
              </span>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-neutral-50/40">
            {displayedNotifications.length === 0 ? (
              <div className="py-20 text-center text-neutral-400 text-xs">
                <CheckCircle2 className="w-11 h-11 mx-auto text-emerald-500 mb-2.5 opacity-60" />
                <p className="font-bold text-neutral-700 text-sm">
                  {activeFilterTab === 'unread' ? 'Không có thông báo chưa đọc nào!' : 'Hộp thông báo trống'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  {activeFilterTab === 'unread'
                    ? 'Bạn đã xem hết các thông báo mới nhất. Tuyệt vời!'
                    : 'Hiện chưa có phát sinh Lead mới hoặc lịch chụp nào gán cho bạn.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const { icon, bg, badgeText, badgeClass } = getNotificationIconAndBadge(notif);
                const hasInteractiveTarget = !!(notif.customerId || notif.bookingId);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      !notif.read
                        ? 'bg-white border-blue-300 shadow-xs hover:border-blue-500 ring-1 ring-blue-500/10'
                        : 'bg-white/85 hover:bg-white border-black/[0.06] hover:border-black/[0.12]'
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notif.read && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${bg}`}>
                        {icon}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        {/* Badge category & Target tag */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${badgeClass}`}>
                            {badgeText}
                          </span>
                          {notif.targetRole === 'admin' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-900 text-white">
                              Admin
                            </span>
                          )}
                          {notif.targetRole === 'sales' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                              Sales
                            </span>
                          )}
                          {notif.targetRole === 'photographer' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-600 text-white">
                              Photographer
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className={`text-xs leading-snug ${!notif.read ? 'font-black text-neutral-950' : 'font-bold text-neutral-800'}`}>
                          {notif.title}
                        </p>

                        {/* Message body */}
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Footer row: Timestamp & Action Hint */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/[0.04] text-[10px]">
                          <span className="text-neutral-400 font-medium font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatNotificationTime(notif.timestamp)}
                          </span>

                          {hasInteractiveTarget && (
                            <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              Xem chi tiết <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Drawer */}
          <div className="p-3.5 bg-white border-t border-black/[0.06] text-center shrink-0 flex items-center gap-2">
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
