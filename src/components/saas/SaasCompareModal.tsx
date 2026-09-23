import React, { useState } from 'react';
import { X, SlidersHorizontal, ArrowUpRight, TrendingUp, Calendar, Check } from 'lucide-react';

interface SaasCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaasCompareModal: React.FC<SaasCompareModalProps> = ({ isOpen, onClose }) => {
  const [selectedBenchmark, setSelectedBenchmark] = useState<'prev-month' | 'prev-year' | 'target'>('prev-month');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-auto z-10 text-neutral-900 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">So Sánh Chu Kỳ Doanh Thu</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Đối chiếu doanh thu thực tế mùa này so với dữ liệu quá khứ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            {[
              { id: 'prev-month', title: 'Tháng trước (Tháng 7/2024)', diff: '+18.6% Tăng trưởng', desc: 'So sánh cùng kỳ chu kỳ 30 ngày trước' },
              { id: 'prev-year', title: 'Mùa kỷ yếu năm ngoái (2023)', diff: '+42.3% YoY', desc: 'Tốc độ bứt phá doanh số so với mùa trước' },
              { id: 'target', title: 'Chỉ tiêu Doanh thu Quý 3', diff: '106% Đạt kế hoạch', desc: 'Đo lường tiến độ mục tiêu doanh thu 2.5 tỷ đề ra' }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedBenchmark(item.id as any)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedBenchmark === item.id
                    ? 'border-neutral-900 bg-neutral-50/90 shadow-sm'
                    : 'border-black/[0.06] hover:bg-neutral-50/40'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-neutral-900">{item.title}</p>
                    <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.diff}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">{item.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  selectedBenchmark === item.id ? 'bg-neutral-900 border-neutral-900 text-white' : 'border-neutral-300'
                }`}>
                  {selectedBenchmark === item.id && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.04] space-y-2 text-xs">
            <span className="font-bold text-neutral-900">Chỉ số tác động chính:</span>
            <div className="flex justify-between text-neutral-600">
              <span>Biên lợi nhuận gộp sau chi phí thợ:</span>
              <strong className="text-emerald-700">+38.5%</strong>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Hiệu suất chuyển đổi từ đội CTV:</span>
              <strong className="text-emerald-700">+42.0%</strong>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-black/[0.06] bg-neutral-50/60 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Đóng
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            Áp dụng đối chiếu
          </button>
        </div>
      </div>
    </div>
  );
};
