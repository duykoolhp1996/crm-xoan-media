import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, PipelineStage } from '../../types';
import {
  Kanban as KanbanIcon,
  Plus,
  Phone,
  School,
  Sparkles,
  UserCheck,
  UserX
} from 'lucide-react';
import { CustomerDetail360 } from '../crm/CustomerDetail360';
import { CustomerModal } from '../crm/CustomerModal';

export const KanbanPipeline: React.FC = () => {
  const {
    customers,
    salesStaff,
    updateCustomerStage,
    updateCustomer,
    currentUser,
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

  // Stage highlight accent colors (top borders)
  const stageHeaderAccents: Record<PipelineStage, string> = {
    'New Lead': 'border-t-slate-400',
    'Đã liên hệ': 'border-t-cyan-500',
    'Đang tư vấn': 'border-t-sky-500',
    'Đã gửi báo giá': 'border-t-indigo-500',
    'Đang thương lượng': 'border-t-purple-500',
    'Đã đặt cọc': 'border-t-[#79ba07]',
    'Đã Booking': 'border-t-amber-500',
    'Đã chụp': 'border-t-blue-500',
    'Đang hậu kỳ': 'border-t-violet-500',
    'Đã bàn giao': 'border-t-teal-500',
    'Hoàn thành': 'border-t-emerald-500',
    'Lost': 'border-t-rose-500',
    'Chăm sóc lại': 'border-t-pink-500'
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
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <KanbanIcon className="w-5 h-5 text-neutral-900" />
            Customer Pipeline (13 Trạng Thái Kỷ Yếu)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kéo thả để cập nhật tiến độ từ Lead mới đến khi bàn giao trọn gói kỷ yếu
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
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
              className={`w-72 shrink-0 bg-white rounded-2xl border border-black/[0.08] shadow-xs flex flex-col max-h-[75vh] border-t-4 ${stageHeaderAccents[stage]}`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-black/[0.05] bg-neutral-50/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-900 tracking-tight truncate" title={stage}>
                    {stage}
                  </h3>
                  <span className="text-[10px] font-bold bg-neutral-200/70 text-neutral-800 px-2 py-0.5 rounded-full">
                    {stageCustomers.length}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 font-medium">
                  Tổng: <strong className="text-neutral-700">{(stageTotalMoney / 1000000).toFixed(1)}M đ</strong>
                </p>
              </div>

              {/* Cards List */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar min-h-[160px] bg-neutral-50/30">
                {stageCustomers.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400 text-[11px] italic border border-dashed border-neutral-300 rounded-2xl m-1">
                    Kéo thả lead vào đây
                  </div>
                ) : (
                  stageCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cust.id)}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className="bg-white hover:bg-neutral-50/80 p-3.5 rounded-2xl border border-black/[0.06] hover:border-black/[0.14] shadow-xs hover:shadow-sm transition-all cursor-grab active:cursor-grabbing group"
                    >
                      {/* Class & School */}
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-900 bg-[#B8F23D]/40 border border-[#B8F23D]/60 px-2 py-0.5 rounded-lg">
                            {cust.className}
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 mt-1.5 group-hover:text-neutral-700 transition-colors">
                            {cust.name}
                          </h4>
                        </div>
                        <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                          {cust.studentCount} bạn
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-1.5 truncate">
                        <School className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{cust.schoolName}</span>
                      </p>

                      {/* Concept & Package */}
                      <div className="mt-2.5 text-[10px] bg-neutral-50 p-2 rounded-xl border border-black/[0.04]">
                        <p className="text-neutral-700 truncate">
                          ✨ <strong className="text-neutral-900">Concept:</strong> {cust.concept}
                        </p>
                        <p className="text-neutral-500 truncate mt-0.5">
                          📦 {cust.servicePackageName || 'Gói tùy chọn'}
                        </p>
                      </div>

                      {/* Nhân viên Sales phụ trách tư vấn */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2"
                      >
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border w-full text-[11px] transition-all ${
                          cust.assignedSalesName && cust.assignedSalesName !== 'Chưa gán'
                            ? 'bg-blue-50/90 border-blue-200/80 text-blue-900'
                            : 'bg-neutral-100/70 border-neutral-200/60 text-neutral-500'
                        }`}>
                          <UserCheck className={`w-3.5 h-3.5 shrink-0 ${
                            cust.assignedSalesName && cust.assignedSalesName !== 'Chưa gán' ? 'text-blue-600' : 'text-neutral-400'
                          }`} />
                          <span className="text-[10px] font-bold text-neutral-600 shrink-0">Sales:</span>
                          <select
                            value={cust.assignedSalesName || 'Chưa gán'}
                            onChange={(e) => {
                              const val = e.target.value;
                              const matched = salesStaff.find(s => s.name === val);
                              updateCustomer({
                                ...cust,
                                assignedSalesName: val,
                                assignedSalesId: matched?.id || (val === currentUser.name ? currentUser.id : 'user-2'),
                                updatedAt: new Date().toISOString()
                              });
                            }}
                            className="bg-transparent text-[11px] font-bold text-neutral-900 focus:outline-none cursor-pointer truncate w-full"
                            title="Đổi nhân viên Sales tư vấn"
                          >
                            <option value="Chưa gán">Chưa gán Sales</option>
                            {salesStaff.map((staff) => (
                              <option key={staff.id} value={staff.name}>
                                {staff.name}
                              </option>
                            ))}
                            {currentUser.role === 'sales' && !salesStaff.some(s => s.name === currentUser.name) && (
                              <option value={currentUser.name}>{currentUser.name}</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Footer: Phone & Budget */}
                      <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {cust.phone}
                        </span>
                        <span className="font-bold text-neutral-900">
                          {(cust.expectedBudget / 1000000).toFixed(1)}M đ
                        </span>
                      </div>

                      {/* Nhanh: chuyển stage */}
                      <div className="mt-2 pt-1.5 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Nguồn: {cust.source}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(cust.id);
                          }}
                          className="text-[#79ba07] hover:text-neutral-900 font-bold"
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

      {/* Detail Drawer */}
      {selectedCustomerId && (
        <CustomerDetail360
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Add Lead Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
