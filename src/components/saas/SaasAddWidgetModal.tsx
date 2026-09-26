import React, { useState } from 'react';
import { X, Plus, Check, Sparkles, LayoutGrid, Calendar, Camera, ShieldCheck, Users } from 'lucide-react';

interface SaasAddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetTitle: string) => void;
}

interface WidgetItem {
  id: string;
  name: string;
  desc: string;
  category: string;
  icon: React.ElementType;
  isPopular?: boolean;
}

const AVAILABLE_WIDGETS: WidgetItem[] = [
  {
    id: 'w-geo',
    name: 'Bản Đồ Phân Bổ Ekip Theo Trường',
    desc: 'Bản đồ mật độ các lớp chụp và thợ chụp được gán theo quận/huyện',
    category: 'Vận hành Ekip',
    icon: Camera,
    isPopular: true
  },
  {
    id: 'w-forecast',
    name: 'Dự Báo Doanh Thu Tháng Đỉnh Điểm',
    desc: 'Thuật toán dự báo doanh thu và số lớp đăng ký thêm trong tháng 9-11',
    category: 'Tài chính CRM',
    icon: Sparkles,
    isPopular: true
  },
  {
    id: 'w-cohort',
    name: 'Bảng Đối Soát Hoa Hồng CTV',
    desc: 'Bảng chi tiết số tiền hoa hồng cần quyết toán cho các CTV trường',
    category: 'Quản lý CTV',
    icon: Users
  },
  {
    id: 'w-churn',
    name: 'Cảnh Báo Chậm Cọc & Trùng Lịch',
    desc: 'Cảnh báo sớm các lớp chưa thanh toán đợt 2 hoặc thợ bị xếp trùng giờ',
    category: 'Kiểm soát rủi ro',
    icon: ShieldCheck
  }
];

export const SaasAddWidgetModal: React.FC<SaasAddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget
}) => {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['w-geo']);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    selectedWidgets.forEach(id => {
      const found = AVAILABLE_WIDGETS.find(w => w.id === id);
      if (found) onAddWidget(found.name);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] p-4 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-auto z-10 text-neutral-900 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Thêm Khối Tiện Ích Chỉ Số</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Tùy biến bảng điều khiển CRM Xoăn Media theo nhu cầu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Widgets Selection List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {AVAILABLE_WIDGETS.map((w) => {
            const Icon = w.icon;
            const isChecked = selectedWidgets.includes(w.id);

            return (
              <div
                key={w.id}
                onClick={() => toggleSelect(w.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                    : 'border-black/[0.06] hover:bg-neutral-50/50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-neutral-900 text-[#B8F23D]' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900">{w.name}</h4>
                      {w.isPopular && (
                        <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Khuyên dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{w.desc}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-neutral-500 bg-neutral-200/60 px-2 py-0.5 rounded-md">
                      {w.category}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                    isChecked
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'border-neutral-300'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/[0.06] bg-neutral-50/60 flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-medium">
            Đã chọn <strong>{selectedWidgets.length}</strong> tiện ích
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95"
            >
              Thêm vào Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
