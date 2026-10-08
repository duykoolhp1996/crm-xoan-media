import React, { useState, useRef, useEffect } from 'react';
import { useApp, AppMode } from '../../context/AppContext';
import {
  LayoutGrid,
  Building2,
  MessageSquare,
  ExternalLink,
  Check,
  Sparkles,
  ArrowRight,
  Monitor
} from 'lucide-react';

interface AppSwitcherModalProps {
  buttonClassName?: string;
}

export const AppSwitcherModal: React.FC<AppSwitcherModalProps> = ({ buttonClassName }) => {
  const { activeApp, switchApp, unreadMessengerCount } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectApp = (app: AppMode, inNewTab: boolean = false) => {
    switchApp(app, inNewTab);
    if (!inNewTab) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* 9-Dots App Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          'p-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition-all flex items-center justify-center relative'
        }
        title="Bộ Chuyển Đổi Ứng Dụng (App Switcher)"
        aria-label="App Switcher"
      >
        <LayoutGrid className="w-5 h-5 text-neutral-800" />
        {activeApp === 'crm' && unreadMessengerCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border-2 border-white" />
        )}
      </button>

      {/* Floating App Switcher Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-92 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/[0.1] p-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-neutral-900 select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8F23D] shadow-xs" />
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                Hệ Sinh Thái Xoăn Media
              </h3>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 font-mono">App Suite</span>
          </div>

          {/* App Cards List */}
          <div className="space-y-2.5">
            {/* APP 1: CRM XOĂN MEDIA */}
            <div
              className={`p-3 rounded-2xl border transition-all relative ${
                activeApp === 'crm'
                  ? 'bg-[#F4FBE8] border-[#B8F23D] ring-2 ring-[#B8F23D]/50 shadow-xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 border-black/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  onClick={() => handleSelectApp('crm', false)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center shrink-0 shadow-sm font-black text-sm">
                    🏢
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-neutral-900">CRM Xoăn Media</h4>
                      {activeApp === 'crm' && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-neutral-900 text-[#B8F23D]">
                          Đang Mở
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      Quản lý Lead, Pipeline 10 bước, Lịch ca, Ekip & Báo cáo
                    </p>
                  </div>
                </div>

                {/* Open in new tab action */}
                <button
                  type="button"
                  onClick={() => handleSelectApp('crm', true)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-white rounded-xl transition-colors shrink-0"
                  title="Mở CRM Xoăn trong Tab mới ↗"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {activeApp !== 'crm' && (
                <button
                  type="button"
                  onClick={() => handleSelectApp('crm', false)}
                  className="w-full mt-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Chuyển sang CRM Xoăn</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B8F23D]" />
                </button>
              )}
            </div>

            {/* APP 2: PANCAKE XOĂN */}
            <div
              className={`p-3 rounded-2xl border transition-all relative ${
                activeApp === 'pancake'
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/50 shadow-xs'
                  : 'bg-neutral-50 hover:bg-neutral-100 border-black/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  onClick={() => handleSelectApp('pancake', false)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-sm font-black text-sm">
                    🥞
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-neutral-900">Pancake Xoăn</h4>
                      {activeApp === 'pancake' && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950">
                          Đang Mở
                        </span>
                      )}
                      {unreadMessengerCount > 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
                          {unreadMessengerCount} tin mới
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      Hộp thư đa kênh (FB, Zalo, TikTok), Chat & POS tạo đơn
                    </p>
                  </div>
                </div>

                {/* Open in new tab action */}
                <button
                  type="button"
                  onClick={() => handleSelectApp('pancake', true)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-white rounded-xl transition-colors shrink-0"
                  title="Mở Pancake Xoăn trong Tab mới ↗"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {activeApp !== 'pancake' && (
                <button
                  type="button"
                  onClick={() => handleSelectApp('pancake', false)}
                  className="w-full mt-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:opacity-95 text-neutral-950 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <span>Chuyển sang Pancake Xoăn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Footer Guide: Chạy 2 App trên 2 màn hình */}
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[10px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5 text-neutral-500" />
              Mở 2 tab độc lập trên 2 màn hình
            </span>
            <span className="font-bold text-neutral-600">Sync Realtime</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default AppSwitcherModal;
