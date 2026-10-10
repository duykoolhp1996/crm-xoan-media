import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, ArrowRight, Bell, Smartphone, ShieldCheck } from 'lucide-react';

interface VersionUpdateBannerProps {
  onOpenNotifications: () => void;
}

export const VersionUpdateBanner: React.FC<VersionUpdateBannerProps> = ({ onOpenNotifications }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('xoan_crm_seen_update_v136');
      if (!seen) {
        // Trì hoãn 1s sau khi tải trang để hiệu ứng mượt mà
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Bỏ qua lỗi localStorage
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('xoan_crm_seen_update_v136', 'true');
    } catch {}
  };

  const handleOpenNotif = () => {
    handleDismiss();
    onOpenNotifications();
  };

  if (!isVisible || typeof document === 'undefined') return null;

  return createPortal(
    <aside
      aria-label="Thông báo cập nhật phiên bản"
      className="fixed z-[9999] bottom-20 lg:bottom-6 right-3 lg:right-6 left-3 sm:left-auto sm:max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 text-white rounded-3xl p-4 sm:p-4.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8F23D]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          {/* Neon Icon */}
          <div className="w-10 h-10 rounded-2xl bg-[#B8F23D] text-neutral-950 flex items-center justify-center shrink-0 shadow-lg shadow-[#B8F23D]/20 mt-0.5 font-black">
            <Sparkles className="w-5 h-5 text-neutral-950 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#B8F23D]/20 text-[#B8F23D] px-2 py-0.5 rounded-full border border-[#B8F23D]/30">
                Phiên Bản Mới v1.3.6
              </span>
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                Chính thức
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-extrabold text-white mt-1 leading-snug">
              Cập Nhật CRM Xoăn Media v1.3.6
            </h3>

            <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
              Khắc phục triệt để lỗi kiểm tra trùng lịch thợ: Tự động loại trừ chính đơn đang chỉnh sửa, phân định chuẩn xác ca chụp và chỉ cảnh báo khi thực sự có đơn khác trùng lịch!
            </p>

            {/* Quick feature tags */}
            <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#B8F23D]" /> Fix trùng lịch ảo
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-[#B8F23D]" /> Phân công mượt mà
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-[#B8F23D]" /> Check lịch chuẩn xác
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
              <button
                type="button"
                onClick={handleOpenNotif}
                className="px-3.5 py-1.5 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <span>Xem Thông Báo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>,
    document.body
  );
};
