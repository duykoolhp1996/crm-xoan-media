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
  UserX,
  FileText,
  QrCode,
  Calendar
} from 'lucide-react';
import { CustomerDetail360 } from '../crm/CustomerDetail360';
import { CustomerModal } from '../crm/CustomerModal';
import { PriceQuoteModal } from '../quote/PriceQuoteModal';
import { DepositQrModal } from '../payment/DepositQrModal';
import { ScheduleBookingModal } from '../booking/ScheduleBookingModal';

export const KanbanPipeline: React.FC = () => {
  const {
    customers,
    salesStaff,
    updateCustomerStage,
    updateCustomer,
    currentUser,
    currentRole,
    selectedCustomerId,
    setSelectedCustomerId
  } = useApp();

  const [draggedCustomerId, setDraggedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteCustomer, setQuoteCustomer] = useState<Customer | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<{ customer: Customer; mode: 'deposit' | 'final' } | null>(null);
  const [scheduleBookingCustomer, setScheduleBookingCustomer] = useState<Customer | null>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);

  const isSalesUser = currentUser?.role === 'sales' || currentRole === 'sales';
  const mySalesStaff = React.useMemo(() => {
    if (!isSalesUser) return null;
    return salesStaff.find(s => 
      s.id === currentUser.id || 
      s.name.toLowerCase() === currentUser.name.toLowerCase() ||
      (currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser.phone && s.phone === currentUser.phone)
    ) || salesStaff[0];
  }, [salesStaff, currentUser, isSalesUser]);

  // Chỉ hiển thị các khách hàng được gán cho Sales này hoặc khách chưa được gán ai
  const accessibleCustomers = React.useMemo(() => {
    if (!isSalesUser) return customers;
    const myId = mySalesStaff?.id || currentUser.id;
    const myName = mySalesStaff?.name || currentUser.name;
    return customers.filter(c => {
      const isMine = 
        c.assignedSalesId === myId ||
        c.assignedSalesName === myName ||
        (mySalesStaff && c.assignedSalesName?.toLowerCase() === mySalesStaff.name.toLowerCase());
      const isUnassigned = !c.assignedSalesId || !c.assignedSalesName || c.assignedSalesName === 'Chưa gán';
      return isMine || isUnassigned;
    });
  }, [customers, isSalesUser, mySalesStaff, currentUser]);

  // Cuộn ngang siêu mượt khi dùng chuột cuộn dọc hoặc trackpad
  const handleBoardWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!boardRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const target = e.target as HTMLElement;
      const scrollableCol = target.closest('.column-cards-scroll');
      if (scrollableCol) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableCol;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          boardRef.current.scrollLeft += e.deltaY;
        }
      } else {
        boardRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  // 13 Giai đoạn chuẩn của Xoăn Media
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
      // BẮT BUỘC: Muốn chuyển sang "Đã đặt cọc" (từ Đang thương lượng hoặc các bước trước) PHẢI có số tiền cọc!
      if (targetStage === 'Đã đặt cọc') {
        const cust = customers.find(c => c.id === customerId);
        if (cust) {
          // Tự động mở modal cọc để nhập/chọn số tiền cọc và xác nhận thanh toán
          setPaymentConfig({ customer: cust, mode: 'deposit' });
          setDraggedCustomerId(null);
          return;
        }
      }

      // BẮT BUỘC: Muốn chuyển sang "Đã Booking" PHẢI chốt được ngày chụp!
      if (targetStage === 'Đã Booking') {
        const cust = customers.find(c => c.id === customerId);
        if (cust) {
          // Tự động mở modal chốt ngày chụp & lên booking
          setScheduleBookingCustomer(cust);
          setDraggedCustomerId(null);
          return;
        }
      }

      // Nếu kéo thả sang "Hoàn thành" từ "Đã bàn giao" mà còn tiền chưa tất toán
      if (targetStage === 'Hoàn thành') {
        const cust = customers.find(c => c.id === customerId);
        if (cust && cust.pipelineStage === 'Đã bàn giao') {
          const remaining = (cust.totalRevenue || cust.expectedBudget || 0) - (cust.paidAmount || 0);
          if (remaining > 0) {
            setPaymentConfig({ customer: cust, mode: 'final' });
            setDraggedCustomerId(null);
            return;
          }
        }
      }

      updateCustomerStage(customerId, targetStage);
    }
    setDraggedCustomerId(null);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150 flex-1 flex flex-col min-h-0 h-full">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl shrink-0">
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
      <div
        ref={boardRef}
        onWheel={handleBoardWheel}
        className="flex gap-3.5 overflow-x-auto pb-3 pt-1 items-stretch custom-scrollbar flex-1 min-h-0 overscroll-x-contain"
      >
        {STAGES.map((stage) => {
          const stageCustomers = accessibleCustomers.filter(c => c.pipelineStage === stage);
          const stageTotalMoney = stageCustomers.reduce((acc, curr) => acc + curr.expectedBudget, 0);

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className={`w-72 shrink-0 bg-white rounded-2xl border border-black/[0.08] shadow-xs flex flex-col h-full max-h-full min-h-0 border-t-4 ${stageHeaderAccents[stage]}`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-black/[0.05] bg-neutral-50/60 shrink-0">
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
              <div className="column-cards-scroll p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar min-h-0 bg-neutral-50/30 overscroll-y-contain">
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
                      className="bg-white hover:bg-neutral-50 p-3.5 rounded-2xl border border-black/[0.06] hover:border-black/[0.14] shadow-xs hover:shadow-sm transition-colors duration-150 cursor-grab active:cursor-grabbing group"
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

                      {/* Badge Số Tiền Đã Cọc & Nút Chốt Ngày Chụp (Nếu đang ở Đã đặt cọc) */}
                      {cust.pipelineStage === 'Đã đặt cọc' && (
                        <>
                          <div className="mt-2 p-2 bg-gradient-to-r from-emerald-50 to-lime-50 border border-emerald-200/90 rounded-xl flex items-center justify-between text-[11px] shadow-2xs">
                            <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Đã nhận cọc:
                            </span>
                            <span className="font-extrabold text-emerald-950 text-xs">
                              {cust.paidAmount && cust.paidAmount > 0
                                ? `${cust.paidAmount.toLocaleString('vi-VN')} đ`
                                : '2.000.000 đ'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setScheduleBookingCustomer(cust);
                            }}
                            className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-purple-600 hover:bg-purple-700 text-white border border-purple-700"
                            title="Bắt buộc chốt ngày chụp để chuyển sang Đã Booking"
                          >
                            <Calendar className="w-3.5 h-3.5 text-white" />
                            <span>📅 Chốt Ngày Chụp (Lên Booking)</span>
                          </button>
                        </>
                      )}

                      {/* Badge Ngày Chụp Đã Chốt (Nếu đang ở Đã Booking) */}
                      {cust.pipelineStage === 'Đã Booking' && (
                        <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/90 rounded-xl flex items-center justify-between text-[11px] shadow-2xs">
                          <span className="text-purple-900 font-semibold flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            Lịch chụp:
                          </span>
                          <span className="font-extrabold text-purple-950 text-xs bg-white px-2 py-0.5 rounded-lg border border-purple-200">
                            {cust.expectedShootDate
                              ? new Date(cust.expectedShootDate).toLocaleDateString('vi-VN')
                              : 'Chưa có ngày'}
                          </span>
                        </div>
                      )}

                      {/* 1. Nút Tạo / Chỉnh Sửa Báo Giá: CHỈ hiển thị ở Đang tư vấn, Đã gửi báo giá, Đang thương lượng */}
                      {(cust.pipelineStage === 'Đang tư vấn' || cust.pipelineStage === 'Đã gửi báo giá' || cust.pipelineStage === 'Đang thương lượng') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuoteCustomer(cust);
                          }}
                          className={`w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
                            cust.pipelineStage === 'Đang tư vấn'
                              ? 'bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 text-neutral-900 border border-amber-200/90'
                              : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-900 border border-indigo-200/90'
                          }`}
                          title={cust.pipelineStage === 'Đang tư vấn' ? 'Lập bảng báo giá PDF chi tiết cho lớp' : 'Chỉnh sửa lại bảng báo giá'}
                        >
                          <FileText className={`w-3.5 h-3.5 ${cust.pipelineStage === 'Đang tư vấn' ? 'text-emerald-600' : 'text-indigo-600'}`} />
                          <span>{cust.pipelineStage === 'Đang tư vấn' ? 'Tạo Báo Giá PDF' : 'Chỉnh Sửa Báo Giá'}</span>
                        </button>
                      )}

                      {/* 2. Nút Tạo Cọc & Mã QR: CHỈ hiển thị ở Đang thương lượng */}
                      {cust.pipelineStage === 'Đang thương lượng' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentConfig({ customer: cust, mode: 'deposit' });
                          }}
                          className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 border border-black/[0.08]"
                          title="Bắt buộc nhập số tiền cọc & xác nhận chuyển sang Đã đặt cọc"
                        >
                          <QrCode className="w-3.5 h-3.5 text-neutral-950" />
                          <span>💰 Xác Nhận Cọc & Chuyển Đã Cọc</span>
                        </button>
                      )}

                      {/* 3. Nút Tạo QR Thanh Toán Hết (Tất toán): CHỈ hiển thị ở Đã bàn giao */}
                      {cust.pipelineStage === 'Đang hậu kỳ' ? null : cust.pipelineStage === 'Đã bàn giao' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentConfig({ customer: cust, mode: 'final' });
                          }}
                          className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 text-teal-950 border border-teal-300"
                          title="Tất toán: Tạo mã VietQR thanh toán toàn bộ số tiền còn lại (Tổng bill - cọc)"
                        >
                          <QrCode className="w-3.5 h-3.5 text-teal-700" />
                          <span>Tạo QR Thanh Toán Hết</span>
                        </button>
                      )}

                      {/* Nhanh: chuyển stage */}
                      <div className="mt-2 pt-1.5 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Nguồn: {cust.source}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomerId(cust.id);
                          }}
                          className="text-[#79ba07] hover:text-neutral-900 font-bold cursor-pointer"
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

      {/* Modal Xuất Báo Giá PDF Kỷ Yếu */}
      <PriceQuoteModal
        customer={quoteCustomer}
        isOpen={Boolean(quoteCustomer)}
        onClose={() => setQuoteCustomer(null)}
      />

      {/* Modal Tạo Cọc & Tất Toán QR Chuyển Khoản */}
      <DepositQrModal
        customer={paymentConfig?.customer || null}
        isOpen={Boolean(paymentConfig)}
        mode={paymentConfig?.mode}
        onClose={() => setPaymentConfig(null)}
      />

      {/* Modal Chốt Ngày Chụp Bắt Buộc Khi Sang Đã Booking */}
      <ScheduleBookingModal
        customer={scheduleBookingCustomer}
        isOpen={Boolean(scheduleBookingCustomer)}
        onClose={() => setScheduleBookingCustomer(null)}
      />
    </div>
  );
};
