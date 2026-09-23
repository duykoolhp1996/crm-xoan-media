import React, { useState, useRef, useEffect } from 'react';
import {
  MoreHorizontal,
  Pin,
  Lock,
  Scan,
  Search,
  Folder,
  Grid,
  Trash2,
  Share2,
  ExternalLink,
  CheckCircle,
  Eye
} from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  danger?: boolean;
}

interface GlassActionMenuProps {
  onPin?: () => void;
  onLock?: () => void;
  onScan?: () => void;
  isPinned?: boolean;
  isLocked?: boolean;
  items?: ActionMenuItem[];
  align?: 'left' | 'right';
  triggerButtonClass?: string;
}

export const GlassActionMenu: React.FC<GlassActionMenuProps> = ({
  onPin,
  onLock,
  onScan,
  isPinned = false,
  isLocked = false,
  items,
  align = 'right',
  triggerButtonClass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const defaultItems: ActionMenuItem[] = items || [
    {
      id: 'search',
      label: 'Tìm trong lớp / ghi chú',
      icon: Search,
      onClick: () => alert('Tìm kiếm nhanh trong hồ sơ lớp...')
    },
    {
      id: 'move',
      label: 'Chuyển thư mục / Lớp',
      icon: Folder,
      onClick: () => alert('Di chuyển vào phân loại concept...')
    },
    {
      id: 'grid',
      label: 'Bố cục lưới & Showcase',
      icon: Grid,
      onClick: () => alert('Đổi kiểu hiển thị lưới...')
    },
    {
      id: 'delete',
      label: 'Xóa bài / Ẩn phản hồi',
      icon: Trash2,
      danger: true,
      onClick: () => alert('Đã ẩn phản hồi khỏi trang chính.')
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Nút trigger tròn chuẩn Apple */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={
          triggerButtonClass ||
          `w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isOpen
              ? 'bg-white text-neutral-900 shadow-md scale-105'
              : 'bg-neutral-800/70 hover:bg-neutral-700/80 text-neutral-300 hover:text-white backdrop-blur-md'
          }`
        }
        title="Tùy chọn nhanh"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Menu Kính Mờ (Apple Liquid Glassmorphism Menu Popover) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-2.5 z-50 w-64 rounded-[26px] p-2.5 backdrop-blur-3xl bg-neutral-900/95 border border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset] text-white keep-white animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            color: '#ffffff'
          }}
        >
          {/* Hàng icon thao tác nhanh trên cùng (Quick Actions Bar) */}
          <div className="flex items-center justify-around py-1.5 px-2">
            {/* Action 1: Scan / View */}
            <button
              onClick={() => {
                onScan ? onScan() : alert('Quét mã / Mở toàn màn hình');
                setIsOpen(false);
              }}
              className="p-2 rounded-xl hover:bg-white/15 text-white transition-colors"
              style={{ color: '#ffffff' }}
              title="Quét / Phóng to"
            >
              <Scan className="w-5 h-5 stroke-[1.75]" style={{ color: '#ffffff' }} />
            </button>

            {/* Action 2: Pin / Ghim */}
            <button
              onClick={() => {
                onPin ? onPin() : alert('Đã ghim bài viết lên đầu trang!');
                setIsOpen(false);
              }}
              className={`p-2 rounded-xl transition-colors ${
                isPinned
                  ? 'bg-[#B8F23D]/20 text-[#B8F23D]'
                  : 'hover:bg-white/15 text-white'
              }`}
              style={{ color: isPinned ? '#B8F23D' : '#ffffff' }}
              title="Ghim nổi bật"
            >
              <Pin className="w-5 h-5 stroke-[1.75]" style={{ color: isPinned ? '#B8F23D' : '#ffffff' }} />
            </button>

            {/* Action 3: Lock / Bảo mật duyệt */}
            <button
              onClick={() => {
                onLock ? onLock() : alert('Đã khóa duyệt nội dung!');
                setIsOpen(false);
              }}
              className={`p-2 rounded-xl transition-colors ${
                isLocked
                  ? 'bg-amber-500/30 text-amber-300'
                  : 'hover:bg-white/15 text-white'
              }`}
              style={{ color: isLocked ? '#fcd34d' : '#ffffff' }}
              title="Khóa / Duyệt"
            >
              <Lock className="w-5 h-5 stroke-[1.75]" style={{ color: isLocked ? '#fcd34d' : '#ffffff' }} />
            </button>
          </div>

          {/* Đường hairline ngăn cách mờ */}
          <div className="my-2 border-t border-white/10" />

          {/* Danh sách hành động (List items) */}
          <div className="space-y-0.5">
            {defaultItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 ${
                    item.danger
                      ? '!text-rose-400 hover:bg-rose-500/20 hover:!text-rose-300'
                      : '!text-white hover:bg-white/15'
                  }`}
                  style={{ color: item.danger ? '#fb7185' : '#ffffff' }}
                >
                  <span className="tracking-wide" style={{ color: item.danger ? '#fb7185' : '#ffffff' }}>
                    {item.label}
                  </span>
                  <Icon
                    className="w-4 h-4 stroke-[1.75]"
                    style={{ color: item.danger ? '#fb7185' : '#ffffff', opacity: 0.85 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
