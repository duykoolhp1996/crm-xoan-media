import React, { useState } from 'react';
import { X, Plus, Check, Sparkles, LayoutGrid, BarChart2, Globe, ShieldCheck } from 'lucide-react';

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
    name: 'Customer Geo Heatmap',
    desc: 'Bản đồ mật độ khách hàng & đơn hàng theo khu vực toàn cầu',
    category: 'Analytics',
    icon: Globe,
    isPopular: true
  },
  {
    id: 'w-forecast',
    name: 'AI Revenue Forecast',
    desc: 'Mô hình máy học dự báo doanh thu 90 ngày tiếp theo',
    category: 'AI & Intelligence',
    icon: Sparkles,
    isPopular: true
  },
  {
    id: 'w-cohort',
    name: 'Cohort Retention Matrix',
    desc: 'Bảng theo dõi tỷ lệ duy trì người dùng theo từng tháng đăng ký',
    category: 'Customers',
    icon: LayoutGrid
  },
  {
    id: 'w-churn',
    name: 'Churn Risk Detection',
    desc: 'Cảnh báo sớm các tài khoản có nguy cơ hủy dịch vụ',
    category: 'Risk Management',
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
              <h2 className="text-base font-extrabold tracking-tight">Add Dashboard Widgets</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Customize your SaaS analytics display</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Widgets */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {AVAILABLE_WIDGETS.map(w => {
            const Icon = w.icon;
            const isSelected = selectedWidgets.includes(w.id);

            return (
              <div
                key={w.id}
                onClick={() => toggleSelect(w.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50/90 shadow-sm'
                    : 'border-black/[0.06] hover:bg-neutral-50/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isSelected ? 'bg-neutral-900 text-[#B8F23D]' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900">{w.name}</h3>
                      {w.isPopular && (
                        <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{w.desc}</p>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'border-neutral-300'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-black/[0.06] bg-neutral-50/60 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {selectedWidgets.length} widgets selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Apply to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
