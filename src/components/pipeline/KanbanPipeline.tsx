import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, PipelineStage } from '../../types';
import {
  Kanban as KanbanIcon,
  Plus,
  Phone,
  School,
  Sparkles
} from 'lucide-react';
import { CustomerDetail360 } from '../crm/CustomerDetail360';
import { CustomerModal } from '../crm/CustomerModal';

export const KanbanPipeline: React.FC = () => {
  const {
    customers,
    updateCustomerStage,
    selectedCustomerId,
    setSelectedCustomerId
  } = useApp();

  const [draggedCustomerId, setDraggedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 13 Giai đoạn chuẩn của Xoắn Media
  const STAGES: PipelineStage[] = [
    'New Lead',
    'Đã liên hệ',
    'Đang tư vấn',
    'Đã gửi báo giá',
    'Đang thương lượng',
    'Đã đặt cọc',
    'Đã Booking',
    'Đã chụp',
    'Đang hậu kỳ',
    'Đã bàn giao',
    'Hoàn thành',
    'Lost',
    'Chăm sóc lại'
  ];

  // Stage highlight accent colors
  const stageHeaderAccents: Record<PipelineStage, string> = {
    'New Lead': 'border-t-slate-400',
    'Đã liên hệ': 'border-t-cyan-400',
    'Đang tư vấn': 'border-t-sky-400',
    'Đã gửi báo giá': 'border-t-indigo-400',
    'Đang thương lượng': 'border-t-purple-400',
    'Đã đặt cọc': 'border-t-amber-400',
    'Đã Booking': 'border-t-orange-500',
    'Đã chụp': 'border-t-blue-400',
    'Đang hậu kỳ': 'border-t-violet-400',
    'Đã bàn giao': 'border-t-teal-400',
    'Hoàn thành': 'border-t-emerald-400',
    'Lost': 'border-t-rose-500',
    'Chăm sóc lại': 'border-t-pink-400'
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, customerId: string) => {
    e.dataTransfer.setData('text/plain', customerId);
    setDraggedCustomerId(customerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const customerId = e.dataTransfer.getData('text/plain') || draggedCustomerId;
    if (customerId) {
      updateCustomerStage(customerId, targetStage);
    }
    setDraggedCustomerId(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <KanbanIcon className="w-5 h-5 text-orange-400" />
            Customer Pipeline (13 Trạng Thái Kỷ Yếu)
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Kéo thả để cập nhật tiến độ từ Lead mới đến khi bàn giao trọn gói kỷ yếu
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Lead Vào Pipeline
        </button>
      </div>

      {/* Kanban Board Container (Horizontal Scrollable 13 Columns) */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start custom-scrollbar">
        {STAGES.map((stage) => {
          const stageCustomers = customers.filter(c => c.pipelineStage === stage);
          const stageTotalMoney = stageCustomers.reduce((acc, curr) => acc + curr.expectedBudget, 0);

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className={`w-72 shrink-0 bg-white/[0.035] backdrop-blur-2xl rounded-2xl border border-white/[0.1] shadow-lg flex flex-col max-h-[75vh] border-t-4 ${stageHeaderAccents[stage]}`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate" title={stage}>
                    {stage}
                  </h3>
                  <span className="text-[10px] font-bold bg-white/[0.1] text-white/80 border border-white/[0.15] px-2 py-0.5 rounded-full">
                    {stageCustomers.length}
                  </span>
                </div>
                <p className="text-[10px] text-white/45 mt-1 font-medium">
                  Tổng: <strong className="text-white/80">{(stageTotalMoney / 1000000).toFixed(1)}M đ</strong>
                </p>
              </div>

              {/* Cards List */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar min-h-[160px]">
                {stageCustomers.length === 0 ? (
                  <div className="py-8 text-center text-white/30 text-[11px] italic border border-dashed border-white/10 rounded-2xl m-1">
                    Kéo thả lead vào đây
                  </div>
                ) : (
                  stageCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cust.id)}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className="bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-xl p-3.5 rounded-2xl border border-white/[0.1] hover:border-white/[0.22] shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all cursor-grab active:cursor-grabbing group"
                    >
                      {/* Class & School */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold text-orange-300 bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-lg">
                            {cust.className}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1.5 group-hover:text-orange-300 transition-colors">
                            {cust.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-white/50 bg-white/[0.08] px-1.5 py-0.5 rounded-md border border-white/[0.06]">
                          {cust.studentCount} bạn
                        </span>
                      </div>

                      <p className="text-[11px] text-white/50 flex items-center gap-1.5 mt-1.5 truncate">
                        <School className="w-3 h-3 text-white/30 shrink-0" />
                        <span className="truncate">{cust.schoolName}</span>
                      </p>

                      {/* Concept & Package */}
                      <div className="mt-2.5 text-[10px] bg-white/[0.03] p-2 rounded-xl border border-white/[0.06]">
                        <p className="text-white/70 truncate">
                          ✨ <strong className="text-white/90">Concept:</strong> {cust.concept}
                        </p>
                        <p className="text-white/50 truncate mt-0.5">
                          📦 {cust.servicePackageName || 'Gói tùy chọn'}
                        </p>
                      </div>

                      {/* Footer: Phone & Budget */}
                      <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                        <span className="text-white/50 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-white/30" />
                          {cust.phone}
                        </span>
                        <span className="font-bold text-white">
                          {(cust.expectedBudget / 1000000).toFixed(1)}M đ
                        </span>
                      </div>

                      {/* Nhanh: chuyển stage */}
                      <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/40">
                        <span>Nguồn: {cust.source}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(cust.id);
                          }}
                          className="text-orange-400 hover:text-orange-300 font-semibold"
                        >
                          Chi tiết →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer 360 Drawer */}
      {selectedCustomerId && (
        <CustomerDetail360
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
