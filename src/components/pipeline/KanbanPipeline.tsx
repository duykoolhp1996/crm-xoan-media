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
  FileText,
  QrCode,
  Calendar,
  FolderOpen,
  ExternalLink,
  Trash2,
  RotateCcw,
  UserX,
  AlertCircle,
  Camera,
  Settings2,
  Users,
  Video,
  ChevronDown
} from 'lucide-react';
import { CustomerDetail360 } from '../crm/CustomerDetail360';
import { CustomerModal } from '../crm/CustomerModal';
import { PriceQuoteModal } from '../quote/PriceQuoteModal';
import { DepositQrModal } from '../payment/DepositQrModal';
import { ScheduleBookingModal } from '../booking/ScheduleBookingModal';
import { AssignCrewModal } from '../booking/AssignCrewModal';
import { UploadPhotoDriveModal } from '../booking/UploadPhotoDriveModal';
import { TrashBinModal } from '../crm/TrashBinModal';
import {
  CLOSED_BOOKED_STAGES,
  isCustomerBookedOrDeposited,
  isCustomerInStage,
  getCustomerTotalOrderValue
} from '../../lib/revenueUtils';
import {
  getSalesHierarchyInfo,
  filterAccessibleCustomers,
  getAssignableSalesList
} from '../../utils/salesPermissions';

export const KanbanPipeline: React.FC = () => {
  const {
    customers,
    deletedCustomers,
    salesStaff,
    bookings,
    photographers,
    updateBooking,
    addBooking,
    addActivityLog,
    updateCustomerStage,
    updateCustomer,
    deleteCustomer,
    currentUser,
    currentRole,
    selectedCustomerId,
    setSelectedCustomerId
  } = useApp();

  const [draggedCustomerId, setDraggedCustomerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [showLostView, setShowLostView] = useState(false);
  const [leadMemberFilter, setLeadMemberFilter] = useState<string>('all_team');
  const [quoteCustomer, setQuoteCustomer] = useState<Customer | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<{ customer: Customer; mode: 'deposit' | 'final' } | null>(null);
  const [scheduleBookingCustomer, setScheduleBookingCustomer] = useState<Customer | null>(null);
  const [assignCrewCustomer, setAssignCrewCustomer] = useState<Customer | null>(null);
  const [uploadDriveCustomer, setUploadDriveCustomer] = useState<Customer | null>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Helper lấy thông tin Booking và Ekip thợ chụp của một khách hàng
  const getCustomerBookingInfo = (cust: Customer) => {
    const matched = bookings.find(
      b => b.customerId === cust.id ||
      (b.className && b.className === cust.className && b.schoolName === cust.schoolName)
    );

    let leadPhotoName = matched?.assignments?.leadPhotographerName || '';
    let leadPhotoId = matched?.assignments?.leadPhotographerId || '';

    // Fallback từ ghi chú nếu booking chưa gán tên thợ
    if (!leadPhotoName && cust.notes) {
      const found = photographers.find(p => cust.notes?.toLowerCase().includes(p.fullName.toLowerCase()));
      if (found) {
        leadPhotoName = found.fullName;
        leadPhotoId = found.id;
      }
    }

    // Tra cứu lại photographer object để lấy id chuẩn
    const leadPhotographer = photographers.find(
      p => p.id === leadPhotoId || (leadPhotoName && p.fullName.toLowerCase() === leadPhotoName.toLowerCase())
    );

    return {
      booking: matched,
      leadPhotographerId: leadPhotographer?.id || leadPhotoId,
      leadPhotographerName: leadPhotographer?.fullName || leadPhotoName,
      assistantNames: matched?.assignments?.assistantNames || [],
      videographerName: matched?.assignments?.videographerName || '',
      shootDate: matched?.shootDate || cust.expectedShootDate || ''
    };
  };

  // Đổi nhanh Thợ chụp chính (Trưởng nháy) ngay trên thẻ
  const handleQuickChangePhotographer = (cust: Customer, newPhotographerId: string) => {
    const newPhoto = photographers.find(p => p.id === newPhotographerId);
    const newName = newPhoto ? newPhoto.fullName : '';

    const matchedBooking = bookings.find(
      b => b.customerId === cust.id ||
      (b.className && b.className === cust.className && b.schoolName === cust.schoolName)
    );

    if (matchedBooking) {
      const updatedAssignments = {
        ...matchedBooking.assignments,
        leadPhotographerId: newPhotographerId,
        leadPhotographerName: newName
      };
      updateBooking({
        ...matchedBooking,
        assignments: updatedAssignments,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Tạo booking mới nếu chưa có
      const newBooking = {
        code: `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${cust.className || 'CLASS'}`,
        customerId: cust.id,
        customerName: cust.name,
        schoolName: cust.schoolName || '',
        className: cust.className || '',
        shootDate: cust.expectedShootDate || new Date().toISOString().split('T')[0],
        startTime: '07:30',
        endTime: '17:30',
        location: cust.shootAddress || cust.schoolName || '',
        city: cust.city || 'Hải Phòng',
        district: cust.district || '',
        studentCount: cust.studentCount || 35,
        packageId: cust.servicePackageId || 'pkg-2',
        packageName: cust.servicePackageName || 'Gói tùy chọn',
        concept: cust.concept || 'Tùy chọn',
        totalAmount: getCustomerTotalOrderValue(cust),
        depositAmount: Number(cust.depositAmount || cust.paidAmount || 0),
        remainingAmount: Math.max(0, getCustomerTotalOrderValue(cust) - Number(cust.paidAmount || cust.depositAmount || 0)),
        paymentStatus: Number(cust.depositAmount || cust.paidAmount || 0) > 0 ? ('Đã cọc' as const) : ('Chưa cọc' as const),
        bookingStatus: 'Đã xác nhận' as const,
        assignments: {
          leadPhotographerId: newPhotographerId,
          leadPhotographerName: newName
        },
        notes: `Trưởng nháy: ${newName || 'Chưa gán'}`
      };
      addBooking(newBooking);
    }

    // Đồng bộ vào ghi chú khách hàng để bảo toàn thông tin
    let updatedNotes = cust.notes || '';
    if (newName) {
      if (updatedNotes.includes('Thợ chụp:')) {
        updatedNotes = updatedNotes.replace(/Thợ chụp:[^.\n]*\.?/gi, `Thợ chụp: ${newName}.`);
      } else {
        updatedNotes = `${updatedNotes ? updatedNotes + '\n' : ''}Thợ chụp: ${newName}.`.trim();
      }
    }

    updateCustomer({
      ...cust,
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    });

    addActivityLog({
      customerId: cust.id,
      type: 'photographer_assigned',
      title: 'Phân công Trưởng nháy',
      description: newName
        ? `Đã phân công Trưởng nháy: ${newName} cho lớp ${cust.className || cust.name}`
        : `Đã hủy phân công thợ chụp cho lớp ${cust.className || cust.name}`,
      performedByName: currentUser.name
    });
  };

  // Thông tin phân cấp Sales & Sales Lead
  const salesHierarchy = React.useMemo(() => {
    return getSalesHierarchyInfo(currentUser, currentRole, salesStaff);
  }, [currentUser, currentRole, salesStaff]);

  const assignableSales = React.useMemo(() => {
    return getAssignableSalesList(currentUser, currentRole, salesStaff);
  }, [currentUser, currentRole, salesStaff]);

  const canReassignSales = currentRole === 'admin' || currentRole === 'manager' || salesHierarchy.isLead;

  // Chỉ hiển thị các khách hàng thuộc quyền hạn:
  // - Admin: Xem toàn bộ
  // - Sales Lead: Data được Admin gán + Data cấp dưới thu thập được
  // - Sales thường: Chỉ data của chính mình
  const accessibleCustomers = React.useMemo(() => {
    const baseAccessible = filterAccessibleCustomers(customers, currentUser, currentRole, salesStaff);

    // Nếu là Sales Lead và có chọn xem riêng theo nhân sự trong nhóm
    if (salesHierarchy.isLead && leadMemberFilter !== 'all_team') {
      if (leadMemberFilter === 'mine') {
        const myId = salesHierarchy.myStaff?.id || currentUser.id;
        const myName = (salesHierarchy.myStaff?.name || currentUser.name).toLowerCase();
        return baseAccessible.filter(c => 
          c.assignedSalesId === myId || 
          c.assignedSalesName?.toLowerCase() === myName ||
          c.createdById === myId ||
          c.createdByName?.toLowerCase() === myName
        );
      } else {
        const targetStaff = salesHierarchy.subordinateStaff.find(s => s.id === leadMemberFilter);
        const targetName = targetStaff?.name?.toLowerCase() || '';
        return baseAccessible.filter(c =>
          c.assignedSalesId === leadMemberFilter ||
          (targetName && c.assignedSalesName?.toLowerCase() === targetName) ||
          c.createdById === leadMemberFilter ||
          (targetName && c.createdByName?.toLowerCase() === targetName)
        );
      }
    }

    return baseAccessible;
  }, [customers, currentUser, currentRole, salesStaff, salesHierarchy, leadMemberFilter]);

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

  // 9 Giai đoạn chính chuẩn tuần tự của Lead Pipeline Xoăn Media (Lost tách thành tab nhánh riêng)
  const STAGES: PipelineStage[] = [
    'New Lead',
    'Đang tư vấn',
    'Đã gửi báo giá',
    'Đã cọc',
    'Book ngày',
    'Đã chụp',
    'Đang hậu kỳ',
    'Giao ảnh',
    'Hoàn thành'
  ];

  // Stage highlight accent colors (top borders)
  const stageHeaderAccents: Partial<Record<PipelineStage, string>> = {
    'New Lead': 'border-t-slate-400',
    'Đang tư vấn': 'border-t-sky-500',
    'Đã gửi báo giá': 'border-t-indigo-500',
    'Đã cọc': 'border-t-[#79ba07]',
    'Book ngày': 'border-t-purple-500',
    'Đã chụp': 'border-t-blue-500',
    'Đang hậu kỳ': 'border-t-amber-500',
    'Giao ảnh': 'border-t-teal-500',
    'Hoàn thành': 'border-t-emerald-500',
    'Lost': 'border-t-rose-500',
    'Đã liên hệ': 'border-t-cyan-500',
    'Đang thương lượng': 'border-t-purple-500',
    'Đã đặt cọc': 'border-t-[#79ba07]',
    'Đã Booking': 'border-t-purple-500',
    'Đã bàn giao': 'border-t-teal-500'
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
      // 1. Muốn chuyển sang "Đã cọc": Nếu chưa có số tiền cọc, mở modal tạo cọc
      if (targetStage === 'Đã cọc' || targetStage === 'Đã đặt cọc') {
        const cust = customers.find(c => c.id === customerId);
        if (cust && (!cust.paidAmount || cust.paidAmount <= 0) && (!cust.depositAmount || cust.depositAmount <= 0)) {
          setPaymentConfig({ customer: cust, mode: 'deposit' });
          setDraggedCustomerId(null);
          return;
        }
      }

      // 2. Muốn chuyển sang "Book ngày": Nếu chưa có ngày chụp, mở modal lên booking
      if (targetStage === 'Book ngày' || targetStage === 'Đã Booking') {
        const cust = customers.find(c => c.id === customerId);
        if (cust && !cust.expectedShootDate) {
          setScheduleBookingCustomer(cust);
          setDraggedCustomerId(null);
          return;
        }
      }

      // 3. Muốn chuyển sang "Đã chụp": Nếu chưa có link Google Drive, mở modal nộp Drive
      if (targetStage === 'Đã chụp') {
        const cust = customers.find(c => c.id === customerId);
        if (cust && !cust.rawDriveUrl && !cust.driveUrl) {
          setUploadDriveCustomer(cust);
          setDraggedCustomerId(null);
          return;
        }
      }

      // 4. Muốn chuyển sang "Hoàn thành": Bắt buộc đã chụp/giao ảnh và mở modal quyết toán
      if (targetStage === 'Hoàn thành') {
        const cust = customers.find(c => c.id === customerId);
        if (cust) {
          const hasShotOrDelivered = ['Đã chụp', 'Đang hậu kỳ', 'Giao ảnh', 'Đã bàn giao'].includes(cust.pipelineStage) || Boolean(cust.shotDate);
          if (!hasShotOrDelivered) {
            alert(`⚠️ Khách hàng ${cust.className || cust.name} (${cust.schoolName}) CHƯA CHỤP KỶ YẾU nên chưa thể chuyển sang "Hoàn thành" được!\n\nTiến trình chỉ được chuyển sang Hoàn thành sau khi đã chụp và bàn giao sản phẩm.`);
            setDraggedCustomerId(null);
            return;
          }
          setPaymentConfig({ customer: cust, mode: 'final' });
          setDraggedCustomerId(null);
          return;
        }
      }

      updateCustomerStage(customerId, targetStage);
    }
    setDraggedCustomerId(null);
  };

  const handleDeleteToTrash = (cust: Customer) => {
    const reason = prompt(`Chuyển Lead "${cust.name}" vào thùng rác?\nNhập lý do xóa (tùy chọn):`, 'Khách hủy hoặc trùng dữ liệu');
    if (reason !== null) {
      deleteCustomer(cust.id, reason);
    }
  };

  const lostCustomers = accessibleCustomers.filter(c => c.pipelineStage === 'Lost');

  return (
    <div className="space-y-3 animate-in fade-in duration-150 flex-1 flex flex-col min-h-0 h-full">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-4 sm:p-5 rounded-3xl shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
              <KanbanIcon className="w-5 h-5 text-neutral-900" />
              Lead Pipeline (10 Giai Đoạn Kỷ Yếu Chuẩn)
            </h1>
            <span className="text-[10px] font-bold bg-[#B8F23D] text-neutral-900 px-2 py-0.5 rounded-full">
              {accessibleCustomers.length} Lead
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Quy trình chuẩn hóa 9 bước tuần tự + nhánh Lost riêng. Tự động tính giá và bảo toàn Database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bộ Lọc Theo Nhân Sự Cho Sales Lead */}
          {salesHierarchy.isLead && (
            <div className="flex items-center gap-1.5 bg-neutral-900 text-[#B8F23D] px-2.5 py-1.5 rounded-xl border border-black/[0.08] shadow-xs">
              <span className="text-[11px] font-bold text-neutral-300">Nhóm Sales:</span>
              <select
                value={leadMemberFilter}
                onChange={(e) => setLeadMemberFilter(e.target.value)}
                className="bg-transparent text-[#B8F23D] text-xs font-black cursor-pointer focus:outline-none"
              >
                <option value="all_team" className="text-neutral-900 bg-white">👑 Toàn bộ nhóm ({salesHierarchy.subordinateStaff.length + 1} người)</option>
                <option value="mine" className="text-neutral-900 bg-white">👤 Riêng của tôi (Lead)</option>
                {salesHierarchy.subordinateStaff.map(sub => (
                  <option key={sub.id} value={sub.id} className="text-neutral-900 bg-white">
                    ↳ {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nút Chuyển Tab Xem Lost */}
          <button
            onClick={() => setShowLostView(!showLostView)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
              showLostView
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-black/[0.08]'
            }`}
          >
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span>Khách Từ Chối (Lost)</span>
            {lostCustomers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-200/80 text-rose-900 rounded-full text-[10px] font-black">
                {lostCustomers.length}
              </span>
            )}
          </button>

          {/* Nút Mở Thùng Rác */}
          <button
            onClick={() => setIsTrashOpen(true)}
            className="px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-black/[0.08] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
            title="Xem danh sách Lead đã xóa mềm trong thùng rác"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Thùng Rác</span>
            {deletedCustomers.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black">
                {deletedCustomers.length}
              </span>
            )}
          </button>

          {/* Nút Thêm Lead Mới */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nhập Lead Mới</span>
          </button>
        </div>
      </div>

      {/* VIEW RIÊNG: KHÁCH HÀNG TỪ CHỐI (LOST) */}
      {showLostView ? (
        <div className="bg-white rounded-2xl border border-black/[0.08] p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <h2 className="text-sm font-black text-neutral-900">
                Danh Sách Khách Hàng Từ Chối / Dừng Tư Vấn (Lost - {lostCustomers.length} Khách)
              </h2>
            </div>
            <button
              onClick={() => setShowLostView(false)}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
            >
              ← Quay lại 9 Bước Pipeline
            </button>
          </div>

          {lostCustomers.length === 0 ? (
            <div className="py-16 text-center text-neutral-400 text-xs italic">
              Hiện tại không có khách hàng nào ở trạng thái Lost.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lostCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className="bg-neutral-50/70 hover:bg-neutral-50 p-4 rounded-2xl border border-rose-200/60 shadow-2xs cursor-pointer space-y-2 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        {cust.className || 'Chưa rõ lớp'}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 mt-1">{cust.name}</h4>
                    </div>
                    <span className="text-xs font-extrabold text-neutral-800">
                      {(cust.totalAmount ?? cust.totalRevenue ?? cust.expectedBudget ?? 0) > 0
                        ? `${(((cust.totalAmount ?? cust.totalRevenue ?? cust.expectedBudget ?? 0)) / 1000000).toFixed(1)}M đ`
                        : '0 đ'}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <School className="w-3 h-3 text-neutral-400" />
                    <span className="truncate">{cust.schoolName}</span>
                  </p>

                  <div className="bg-rose-50/80 p-2 rounded-xl border border-rose-200/50 text-[11px] text-rose-800">
                    <strong>Lý do từ chối:</strong> {cust.lostReason || cust.notes || 'Không ghi nhận'}
                  </div>

                  <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCustomerStage(cust.id, 'Đang tư vấn', 'Mở lại tư vấn từ Lost');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Khôi phục tư vấn
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteToTrash(cust);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* KANBAN BOARD CONTAINER (9 CỘT CHUẨN TUẦN TỰ) */
        <div
          ref={boardRef}
          onWheel={handleBoardWheel}
          className="flex gap-3.5 overflow-x-auto pb-3 pt-1 items-stretch custom-scrollbar flex-1 min-h-0 overscroll-x-contain"
        >
          {STAGES.map((stage) => {
            const stageCustomers = accessibleCustomers.filter(c => isCustomerInStage(c.pipelineStage, stage));
            const stageTotalMoney = stageCustomers.reduce((acc, curr) => {
              const money = curr.totalAmount ?? curr.totalRevenue ?? curr.expectedBudget ?? 0;
              return acc + money;
            }, 0);

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
                    {CLOSED_BOOKED_STAGES.includes(stage) ? 'Doanh thu: ' : 'Dự toán: '}
                    <strong className={CLOSED_BOOKED_STAGES.includes(stage) ? 'text-emerald-800 font-extrabold' : 'text-neutral-700'}>
                      {(stageTotalMoney / 1000000).toFixed(1)}M đ
                    </strong>
                  </p>
                </div>

                {/* Cards List */}
                <div className="column-cards-scroll p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar min-h-0 bg-neutral-50/30 overscroll-y-contain">
                  {stageCustomers.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 text-[11px] italic border border-dashed border-neutral-300 rounded-2xl m-1">
                      Kéo thả lead vào đây
                    </div>
                  ) : (
                    stageCustomers.map((cust) => {
                      const displayAmount = (cust.totalAmount ?? cust.totalRevenue ?? cust.expectedBudget ?? 0);

                      return (
                        <div
                          key={cust.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, cust.id)}
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className="bg-white hover:bg-neutral-50 p-3.5 rounded-2xl border border-black/[0.06] hover:border-black/[0.14] shadow-xs hover:shadow-sm transition-colors duration-150 cursor-grab active:cursor-grabbing group relative"
                        >
                          {/* Class & School */}
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              {cust.className ? (
                                <span className="text-[10px] font-bold text-neutral-900 bg-[#B8F23D]/40 border border-[#B8F23D]/60 px-2 py-0.5 rounded-lg">
                                  {cust.className}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-lg italic">
                                  Chưa rõ lớp
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-neutral-900 mt-1.5 group-hover:text-neutral-700 transition-colors">
                                {cust.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md">
                                {cust.studentCount || 35} bạn
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-1.5 truncate">
                            <School className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">{cust.schoolName}</span>
                          </p>

                          {/* Concept & Package */}
                          <div className="mt-2.5 text-[10px] bg-neutral-50 p-2 rounded-xl border border-black/[0.04]">
                            <p className="text-neutral-700 truncate">
                              ✨ <strong className="text-neutral-900">Concept:</strong> {cust.concept || 'Tùy chọn'}
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
                              {canReassignSales ? (
                                <select
                                  value={cust.assignedSalesName || 'Chưa gán'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const matched = assignableSales.find(s => s.name === val);
                                    const newSalesId = val === 'Chưa gán'
                                      ? ''
                                      : (matched?.id || (val === currentUser.name ? currentUser.id : ''));
                                    updateCustomer({
                                      ...cust,
                                      assignedSalesName: val,
                                      assignedSalesId: newSalesId,
                                      updatedAt: new Date().toISOString()
                                    });
                                  }}
                                  className="bg-transparent text-[11px] font-bold text-neutral-900 focus:outline-none cursor-pointer truncate w-full"
                                  title="Đổi nhân viên Sales tư vấn phụ trách"
                                >
                                  <option value="Chưa gán">Chưa gán Sales</option>
                                  {assignableSales.map((staff) => (
                                    <option key={staff.id} value={staff.name}>
                                      {staff.name} {staff.roleTitle ? `(${staff.roleTitle})` : ''}
                                    </option>
                                  ))}
                                  {currentUser.role === 'sales' && !assignableSales.some(s => s.name === currentUser.name) && (
                                    <option value={currentUser.name}>{currentUser.name}</option>
                                  )}
                                </select>
                              ) : (
                                <span 
                                  className="text-[11px] font-bold text-neutral-900 truncate w-full"
                                  title="Sales phụ trách khách hàng này"
                                >
                                  {cust.assignedSalesName || 'Chưa gán Sales'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Footer: Phone & Budget */}
                          <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              {cust.phone ? cust.phone : <span className="text-neutral-400 italic">Chưa có SĐT</span>}
                            </span>
                            <span className="font-bold text-neutral-900">
                              {displayAmount > 0 ? `${(displayAmount / 1000000).toFixed(1)}M đ` : '0 đ'}
                            </span>
                          </div>

                          {/* 1. NÚT TẠO / SỬA BÁO GIÁ (Đang tư vấn, Đã gửi báo giá) */}
                          {(cust.pipelineStage === 'Đang tư vấn' || cust.pipelineStage === 'Đã gửi báo giá') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuoteCustomer(cust);
                              }}
                              className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 text-neutral-900 border border-amber-200/90"
                              title="Lập bảng báo giá PDF chi tiết cho lớp"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{cust.pipelineStage === 'Đang tư vấn' ? '📄 Tạo Báo Giá PDF' : '✏️ Chỉnh Sửa Báo Giá'}</span>
                            </button>
                          )}

                          {/* 2. NÚT XÁC NHẬN CỌC (Đã gửi báo giá -> chuyển Đã cọc) */}
                          {cust.pipelineStage === 'Đã gửi báo giá' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentConfig({ customer: cust, mode: 'deposit' });
                              }}
                              className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 border border-black/[0.08]"
                              title="Setup giá cọc & xác nhận chuyển sang Đã cọc"
                            >
                              <QrCode className="w-3.5 h-3.5 text-neutral-950" />
                              <span>💰 Setup & Chốt Cọc (VietQR)</span>
                            </button>
                          )}

                          {/* 3. BADGE ĐÃ CỌC & NÚT CHỐT NGÀY CHỤP (Đã cọc) */}
                          {isCustomerInStage(cust.pipelineStage, 'Đã cọc') && (
                            <>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentConfig({ customer: cust, mode: 'deposit' });
                                }}
                                className="mt-2 p-2 bg-gradient-to-r from-emerald-50 to-lime-50 hover:from-emerald-100 hover:to-lime-100 border border-emerald-200/90 rounded-xl flex items-center justify-between text-[11px] shadow-2xs cursor-pointer transition-all group"
                                title="Nhấp để xem/sửa mức cọc & tạo QR chuyển khoản"
                              >
                                <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  Đã cọc:
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="font-extrabold text-emerald-950 text-xs">
                                    {((cust.depositAmount !== undefined ? cust.depositAmount : cust.paidAmount) || 0).toLocaleString('vi-VN')} đ
                                  </span>
                                  <span className="text-[10px] text-emerald-800 bg-emerald-200/70 px-1.5 py-0.5 rounded font-bold group-hover:bg-emerald-300">
                                    Sửa
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setScheduleBookingCustomer(cust);
                                }}
                                className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-purple-600 hover:bg-purple-700 text-white border border-purple-700"
                                title="Bắt buộc chốt ngày chụp để chuyển sang Book ngày"
                              >
                                <Calendar className="w-3.5 h-3.5 text-white" />
                                <span>📅 Chốt Ngày Chụp (Lên Booking)</span>
                              </button>
                            </>
                          )}

                          {/* 4. BADGE LỊCH CHỤP, THỢ CHỤP / EKIP & NÚT NỘP DRIVE (Book ngày) */}
                          {isCustomerInStage(cust.pipelineStage, 'Book ngày') && (() => {
                            const crewInfo = getCustomerBookingInfo(cust);
                            return (
                              <>
                                {/* Khối Lịch chụp */}
                                <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/90 rounded-xl flex items-center justify-between text-[11px] shadow-2xs">
                                  <span className="text-purple-900 font-semibold flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    Lịch chụp:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScheduleBookingCustomer(cust);
                                    }}
                                    className="font-extrabold text-purple-950 text-xs bg-white px-2 py-0.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Bấm để đổi ngày chụp"
                                  >
                                    <span>
                                      {cust.expectedShootDate
                                        ? new Date(cust.expectedShootDate).toLocaleDateString('vi-VN')
                                        : 'Chưa có ngày'}
                                    </span>
                                    <span className="text-[10px] text-purple-700 font-bold">✎</span>
                                  </button>
                                </div>

                                {/* Khối Chọn & Sửa Thợ Chụp (Ekip) */}
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1.5 p-2 bg-gradient-to-br from-purple-50/70 to-indigo-50/70 border border-purple-200/90 rounded-xl text-[11px] shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-purple-900 flex items-center gap-1">
                                      <Camera className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                      Trưởng nháy:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignCrewCustomer(cust);
                                      }}
                                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold px-1.5 py-0.5 rounded-md bg-white border border-purple-300 hover:border-purple-400 flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                                      title="Mở phân công ekip chi tiết: Trưởng nháy, thợ phụ, quay phim, ca chụp..."
                                    >
                                      <Settings2 className="w-3 h-3 text-purple-600" />
                                      <span>+ Ekip</span>
                                    </button>
                                  </div>

                                  {/* Dropdown chọn nhanh Thợ chụp chính */}
                                  {currentRole !== 'photographer' ? (
                                    <div className="relative">
                                      <select
                                        value={crewInfo.leadPhotographerId || ''}
                                        onChange={(e) => handleQuickChangePhotographer(cust, e.target.value)}
                                        className="w-full bg-white text-[11px] font-bold text-purple-950 border border-purple-300 rounded-lg px-2 py-1 pr-6 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none truncate shadow-2xs"
                                        title="Chọn hoặc đổi thợ chụp chính (Trưởng nháy) cho buổi chụp này"
                                      >
                                        <option value="">-- Chọn thợ chụp --</option>
                                        {photographers.map((p) => (
                                          <option key={p.id} value={p.id}>
                                            📸 {p.fullName} {p.photographerType ? `(${p.photographerType})` : ''}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-purple-600">
                                        <ChevronDown className="w-3 h-3" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full bg-white text-[11px] font-bold text-purple-950 border border-purple-200 rounded-lg px-2 py-1 truncate">
                                      {crewInfo.leadPhotographerName ? `📸 ${crewInfo.leadPhotographerName}` : 'Chưa phân công'}
                                    </div>
                                  )}

                                  {/* Danh sách Thợ phụ & Quay phim nếu có */}
                                  {(crewInfo.assistantNames.length > 0 || crewInfo.videographerName) && (
                                    <div className="mt-1.5 pt-1.5 border-t border-purple-200/60 flex flex-wrap gap-1 text-[10px]">
                                      {crewInfo.assistantNames.length > 0 && (
                                        <span className="inline-flex items-center gap-1 bg-white/90 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200 font-medium">
                                          <Users className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                                          +{crewInfo.assistantNames.length} thợ phụ ({crewInfo.assistantNames.join(', ')})
                                        </span>
                                      )}
                                      {crewInfo.videographerName && (
                                        <span className="inline-flex items-center gap-1 bg-white/90 text-indigo-800 px-1.5 py-0.5 rounded border border-indigo-200 font-medium">
                                          <Video className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                                          Quay: {crewInfo.videographerName}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUploadDriveCustomer(cust);
                                  }}
                                  className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700"
                                  title="Nộp Link Google Drive ảnh gốc khi đã chụp xong"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-white" />
                                  <span>📸 Nộp Link Drive (Đã Chụp)</span>
                                </button>
                              </>
                            );
                          })()}

                          {/* 5. BADGE DRIVE ẢNH GỐC & THỢ CHỤP (Đã chụp, Đang hậu kỳ) */}
                          {(cust.pipelineStage === 'Đã chụp' || cust.pipelineStage === 'Đang hậu kỳ') && (() => {
                            const crewInfo = getCustomerBookingInfo(cust);
                            return (
                              <>
                                {crewInfo.leadPhotographerName && (
                                  <div className="mt-1.5 px-2 py-1 bg-neutral-100/90 border border-neutral-200 rounded-xl flex items-center justify-between text-[10px]">
                                    <span className="text-neutral-700 font-medium flex items-center gap-1 truncate">
                                      <Camera className="w-3 h-3 text-purple-600 shrink-0" />
                                      Thợ: <strong className="text-neutral-900 truncate">{crewInfo.leadPhotographerName}</strong>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignCrewCustomer(cust);
                                      }}
                                      className="text-purple-700 hover:text-purple-900 font-bold hover:underline shrink-0 ml-1"
                                      title="Xem / Chỉnh sửa ekip"
                                    >
                                      Ekip
                                    </button>
                                  </div>
                                )}
                                {(cust.rawDriveUrl || cust.driveUrl) ? (
                                  <div className="mt-1.5 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-xl flex items-center justify-between text-[11px] shadow-2xs">
                                    <a
                                      href={cust.rawDriveUrl || cust.driveUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 truncate hover:underline"
                                      title={cust.rawDriveUrl || cust.driveUrl}
                                    >
                                      <FolderOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span className="truncate">Drive Ảnh Gốc</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadDriveCustomer(cust);
                                      }}
                                      className="text-[10px] text-blue-700 hover:text-blue-900 font-bold px-2 py-0.5 rounded-lg bg-white border border-blue-200 shrink-0 cursor-pointer shadow-2xs ml-1"
                                    >
                                      Đổi link
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUploadDriveCustomer(cust);
                                    }}
                                    className="w-full mt-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 animate-pulse"
                                  >
                                    <FolderOpen className="w-3.5 h-3.5 text-rose-600" />
                                    <span>⚠️ Thiếu Link Drive! Nộp Ngay</span>
                                  </button>
                                )}
                              </>
                            );
                          })()}

                          {/* 6. GIAO ẢNH: NÚT QUYẾT TOÁN & BÀN GIAO */}
                          {(cust.pipelineStage === 'Giao ảnh' || cust.pipelineStage === 'Đã bàn giao') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentConfig({ customer: cust, mode: 'final' });
                              }}
                              className="w-full mt-2 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 bg-teal-600 hover:bg-teal-700 text-white border border-teal-700"
                              title="Bắt buộc quyết toán toàn bộ số tiền để chuyển sang Hoàn thành"
                            >
                              <QrCode className="w-3.5 h-3.5 text-white" />
                              <span>💰 Giao Ảnh & Quyết Toán Tiền</span>
                            </button>
                          )}

                          {/* 7. HOÀN THÀNH: BADGE ĐÃ THU ĐỦ 100% */}
                          {cust.pipelineStage === 'Hoàn thành' && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl flex items-center justify-between text-[11px] shadow-2xs">
                              <span className="text-emerald-900 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Đã thu đủ:
                              </span>
                              <span className="font-extrabold text-emerald-950 text-xs">
                                {(cust.totalAmount || cust.totalRevenue || cust.paidAmount || 0).toLocaleString('vi-VN')} đ
                              </span>
                            </div>
                          )}

                          {/* Card Sub-actions: Xóa vào thùng rác & Xem chi tiết */}
                          <div className="mt-2 pt-1.5 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-neutral-400">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteToTrash(cust);
                              }}
                              className="text-neutral-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                              title="Chuyển lead vào thùng rác"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomerId(cust.id);
                              }}
                              className="text-[#79ba07] hover:text-neutral-900 font-bold cursor-pointer"
                            >
                              Hồ sơ 360° →
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {/* Modal Chốt Ngày Chụp Bắt Buộc Khi Sang Book Ngày */}
      <ScheduleBookingModal
        customer={scheduleBookingCustomer}
        isOpen={Boolean(scheduleBookingCustomer)}
        onClose={() => setScheduleBookingCustomer(null)}
      />

      {/* Modal Phân Công & Điều Phối Ekip Thợ Chụp */}
      <AssignCrewModal
        customer={assignCrewCustomer}
        isOpen={Boolean(assignCrewCustomer)}
        onClose={() => setAssignCrewCustomer(null)}
      />

      {/* Modal Bắt Buộc Nộp Link Google Drive Khi Sang Đã Chụp */}
      <UploadPhotoDriveModal
        customer={uploadDriveCustomer}
        isOpen={Boolean(uploadDriveCustomer)}
        onClose={() => setUploadDriveCustomer(null)}
      />

      {/* Modal Quản Lý Thùng Rác / Leads Đã Xóa */}
      <TrashBinModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
      />
    </div>
  );
};
