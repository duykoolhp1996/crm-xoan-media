import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  Phone,
  School,
  Calendar,
  Tag,
  Clock,
  MessageSquare,
  Send,
  Star,
  Heart,
  MapPin,
  Headphones,
  UserCheck,
  UserX,
  RotateCcw,
  FileText,
  QrCode,
  Copy,
  Check,
  ChevronDown,
  Info,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { PriceQuoteModal } from '../quote/PriceQuoteModal';
import { DepositQrModal } from '../payment/DepositQrModal';

interface CustomerDetail360Props {
  customerId: string;
  onClose: () => void;
}

export const CustomerDetail360: React.FC<CustomerDetail360Props> = ({ customerId, onClose }) => {
  const {
    customers,
    updateCustomer,
    updateCustomerStage,
    salesStaff,
    bookings,
    activityLogs,
    addActivityLog,
    feedbacks,
    currentUser,
    setSelectedBookingId,
    setActiveTab
  } = useApp();

  const customer = customers.find(c => c.id === customerId);
  const [activeTab, setActiveTabLocal] = useState<'timeline' | 'bookings' | 'marketing' | 'feedbacks' | 'fullinfo'>('timeline');
  const [showQuickDetails, setShowQuickDetails] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [showLostModal, setShowLostModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'deposit' | 'final'>('deposit');
  const [lostReason, setLostReason] = useState('Giá cao hơn ngân sách dự kiến của lớp');
  const [customLostNote, setCustomLostNote] = useState('');

  if (!customer) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(prev => prev === key ? null : prev);
    }, 2000);
  };

  const fullAddress = [
    customer.schoolName,
    customer.district,
    customer.city || customer.region
  ].filter(Boolean).join(', ');

  const fullSummaryText = `📸 THÔNG TIN KHÁCH HÀNG - XOĂN MEDIA
━━━━━━━━━━━━━━━━━━━━
👤 Khách hàng: ${customer.name} (${customer.representativeRole})
📞 Số điện thoại: ${customer.phone}
🏫 Lớp & Trường: ${customer.className} - ${customer.schoolName}
📍 Địa chỉ / Khu vực: ${fullAddress}
👥 Sĩ số: ${customer.studentCount} bạn (${customer.academicYear})
📦 Gói dịch vụ: ${customer.servicePackageName || customer.serviceType || 'Kỷ yếu Concept'}
✨ Concept: ${customer.concept || 'Chưa chọn'}
💰 Ngân sách dự kiến: ${customer.expectedBudget?.toLocaleString('vi-VN')}đ
📍 Địa điểm chụp: ${customer.shootingLocations?.join(', ') || 'Chưa xác định'}
👨‍💼 Sales phụ trách: ${customer.assignedSalesName || 'Chưa gán'}
${customer.notes ? `📝 Ghi chú: ${customer.notes}` : ''}`;

  // Lấy các bookings của khách hàng này
  const customerBookings = bookings.filter(b => b.customerId === customer.id);
  // Lấy activity logs của khách hàng này
  const logs = activityLogs.filter(l => l.customerId === customer.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    addActivityLog({
      customerId: customer.id,
      type: 'note',
      title: 'Ghi chú nội bộ',
      description: noteContent,
      performedByName: currentUser.name
    });
    setNoteContent('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Center Popup Modal */}
      <div className="relative w-full max-w-3xl sm:max-w-4xl h-[92vh] max-h-[92vh] bg-white rounded-3xl border border-black/[0.08] text-neutral-900 shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header Modal */}
        <div className="p-6 bg-neutral-50/70 border-b border-black/[0.06] flex items-start justify-between shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-black text-xl shadow-sm shrink-0">
              {customer.className.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">{customer.name}</h2>
                <span className="text-xs bg-neutral-100 text-neutral-800 border border-black/[0.06] px-2.5 py-0.5 rounded-full font-semibold">
                  {customer.representativeRole}
                </span>

                {/* Nút Xem Thêm & Copy Thông Tin Đầy Đủ */}
                <button
                  type="button"
                  onClick={() => setShowQuickDetails(prev => !prev)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all border shadow-2xs cursor-pointer ${
                    showQuickDetails
                      ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                  title="Nhấn để xem đầy đủ Địa chỉ, Số điện thoại và sao chép 1 chạm"
                >
                  <Copy className="w-3 h-3" />
                  <span>{showQuickDetails ? 'Thu gọn' : 'Xem thêm (Địa chỉ + SĐT)'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showQuickDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-neutral-700">
                  <School className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{customer.className} - {customer.schoolName}</span>
                </span>
                <span>•</span>
                <span>{customer.academicYear}</span>
                {(customer.district || customer.city || customer.region) && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-700 font-medium flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-full border border-black/[0.06]">
                      <MapPin className="w-3 h-3 text-neutral-500" />
                      <span>{customer.district ? `${customer.district}, ` : ''}{customer.city || customer.region}</span>
                    </span>
                  </>
                )}

                {/* Nút Copy Địa Chỉ Nhanh */}
                <button
                  type="button"
                  onClick={() => handleCopy(fullAddress, 'header_addr')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-black/[0.06] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Sao chép địa chỉ đầy đủ"
                >
                  {copiedKey === 'header_addr' ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Check className="w-3 h-3 text-emerald-600" /> Đã copy Đ/C</span>
                  ) : (
                    <span className="flex items-center gap-0.5"><Copy className="w-3 h-3 text-neutral-500" /> Copy Đ/C</span>
                  )}
                </button>

                {/* Nút Copy SĐT Nhanh */}
                <button
                  type="button"
                  onClick={() => handleCopy(customer.phone, 'header_phone')}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                  title={`Sao chép SĐT: ${customer.phone}`}
                >
                  {copiedKey === 'header_phone' ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5"><Check className="w-3 h-3 text-emerald-600" /> Đã copy SĐT</span>
                  ) : (
                    <span className="flex items-center gap-0.5"><Phone className="w-3 h-3 text-blue-600" /> Copy SĐT</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {customer.pipelineStage !== 'Lost' ? (
              <button
                type="button"
                onClick={() => setShowLostModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                title="Đánh dấu khách hàng từ chối tư vấn / Hủy chụp"
              >
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>Khách từ chối (Lost)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1">
                  <UserX className="w-3.5 h-3.5 text-rose-600" />
                  Đã Lost
                </span>
                <button
                  type="button"
                  onClick={() => updateCustomerStage(customer.id, 'Đang tư vấn')}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-black/[0.08] text-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  title="Khôi phục lại giai đoạn tư vấn"
                >
                  <RotateCcw className="w-3 h-3 text-neutral-600" />
                  Khôi phục
                </button>
              </div>
            )}

            {/* Nút Tạo / Chỉnh Sửa Báo Giá: CHỈ hiển thị ở Đang tư vấn, Đã gửi báo giá, Đang thương lượng */}
            {['Đang tư vấn', 'Đã gửi báo giá', 'Đang thương lượng'].includes(customer.pipelineStage) && (
              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title={customer.pipelineStage === 'Đang tư vấn' ? 'Lập và xuất bảng báo giá PDF chi tiết cho lớp' : 'Chỉnh sửa lại bảng báo giá'}
              >
                <FileText className="w-3.5 h-3.5 text-neutral-700" />
                <span className="hidden sm:inline">
                  {customer.pipelineStage === 'Đang tư vấn' ? 'Tạo Báo Giá PDF' : 'Chỉnh Sửa Báo Giá'}
                </span>
              </button>
            )}

            {/* Nút Tạo Cọc QR: CHỈ hiển thị ở Đang thương lượng */}
            {customer.pipelineStage === 'Đang thương lượng' && (
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('deposit');
                  setShowDepositModal(true);
                }}
                className="px-3.5 py-1.5 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 border border-black/[0.08] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Tạo khoản cọc giữ lịch và mã VietQR chuyển khoản ngân hàng"
              >
                <QrCode className="w-3.5 h-3.5 text-neutral-950" />
                <span>Tạo Cọc QR</span>
              </button>
            )}

            {/* Nút Tạo QR Thanh Toán Hết: CHỈ hiển thị ở Đã bàn giao */}
            {customer.pipelineStage === 'Đã bàn giao' && (
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('final');
                  setShowDepositModal(true);
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white border border-teal-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Tất toán: Tạo mã VietQR thanh toán hết số tiền còn lại (Tổng bill - cọc)"
              >
                <QrCode className="w-3.5 h-3.5 text-white" />
                <span>Tạo QR Thanh Toán Hết</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-neutral-50/50 px-6 py-3.5 border-b border-black/[0.06] text-xs shrink-0">
          <div>
            <p className="text-[11px] text-neutral-500 font-medium">Giai đoạn Pipeline</p>
            <p className="font-bold text-neutral-900 mt-0.5">{customer.pipelineStage}</p>
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-medium">Sỉ số lớp</p>
            <p className="font-bold text-neutral-900 mt-0.5">{customer.studentCount} học sinh</p>
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-medium">Ngân sách dự kiến</p>
            <p className="font-bold text-neutral-900 mt-0.5">{customer.expectedBudget.toLocaleString('vi-VN')}đ</p>
          </div>
          <div>
            <p className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-blue-600" />
              Sales tư vấn phụ trách
            </p>
            <div className="mt-0.5">
              <select
                value={customer.assignedSalesName || 'Chưa gán'}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = salesStaff.find(s => s.name === val);
                  updateCustomer({
                    ...customer,
                    assignedSalesName: val,
                    assignedSalesId: matched?.id || (val === currentUser.name ? currentUser.id : 'user-2'),
                    updatedAt: new Date().toISOString()
                  });
                }}
                className="font-bold text-blue-700 bg-transparent focus:outline-none cursor-pointer text-xs truncate max-w-full hover:underline"
              >
                <option value="Chưa gán">Chưa gán (Tự động khi liên hệ)</option>
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
          <div>
            <p className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
              <Headphones className="w-3 h-3 text-neutral-500" />
              CSKH phụ trách
            </p>
            <p className="font-bold text-neutral-900 mt-0.5 truncate">
              {customer.assignedCareStaffName || 'Phạm Quỳnh Nga (CSKH)'}
            </p>
          </div>
        </div>

        {/* Panel Mở Rộng: Xem Thêm & Copy Đầy Đủ Thông Tin (Địa chỉ, SĐT...) */}
        {showQuickDetails && (
          <div className="bg-gradient-to-r from-emerald-50/80 via-neutral-50 to-blue-50/70 border-b border-black/[0.08] p-4 sm:p-5 shrink-0 max-h-[46vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2.5 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                    Thông Tin Chi Tiết Khách Hàng (Sẵn Sàng Sao Chép)
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Bấm "Copy" tại từng mục hoặc "Sao chép tất cả" để dán vào Zalo / Ekip / Shipper
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(fullSummaryText, 'quick_all')}
                  className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {copiedKey === 'quick_all' ? (
                    <><Check className="w-3.5 h-3.5 text-[#B8F23D]" /> ✓ Đã copy tất cả!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> 📋 Sao chép toàn bộ</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQuickDetails(false)}
                  className="w-7 h-7 rounded-lg bg-neutral-200/70 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
                  title="Đóng bảng chi tiết"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lưới các trường thông tin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {/* 1. Số điện thoại */}
              <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-2.5 hover:border-black/[0.14] transition-all">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-medium">Số điện thoại / Zalo</p>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">{customer.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(customer.phone, 'quick_phone')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] shrink-0 cursor-pointer ${
                    copiedKey === 'quick_phone'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                  }`}
                >
                  {copiedKey === 'quick_phone' ? (
                    <><Check className="w-3 h-3 text-emerald-600" /> Đã copy</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy SĐT</>
                  )}
                </button>
              </div>

              {/* 2. Địa chỉ đầy đủ */}
              <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-2.5 hover:border-black/[0.14] transition-all">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-medium">Địa chỉ & Khu vực</p>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-0.5" title={fullAddress}>
                      {fullAddress || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(fullAddress, 'quick_addr')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] shrink-0 cursor-pointer ${
                    copiedKey === 'quick_addr'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                  }`}
                >
                  {copiedKey === 'quick_addr' ? (
                    <><Check className="w-3 h-3 text-emerald-600" /> Đã copy</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy Đ/C</>
                  )}
                </button>
              </div>

              {/* 3. Lớp & Trường học */}
              <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-2.5 hover:border-black/[0.14] transition-all">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <School className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-medium">Lớp & Trường</p>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-0.5" title={`${customer.className} - ${customer.schoolName}`}>
                      {customer.className} - {customer.schoolName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`${customer.className} - ${customer.schoolName}`, 'quick_school')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] shrink-0 cursor-pointer ${
                    copiedKey === 'quick_school'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                  }`}
                >
                  {copiedKey === 'quick_school' ? (
                    <><Check className="w-3 h-3 text-emerald-600" /> Đã copy</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>

              {/* 4. Người đại diện & Chức vụ */}
              <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-2.5 hover:border-black/[0.14] transition-all">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-medium">Người đại diện</p>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                      {customer.name} ({customer.representativeRole})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`${customer.name} (${customer.representativeRole})`, 'quick_rep')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] shrink-0 cursor-pointer ${
                    copiedKey === 'quick_rep'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                  }`}
                >
                  {copiedKey === 'quick_rep' ? (
                    <><Check className="w-3 h-3 text-emerald-600" /> Đã copy</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>

              {/* 5. Gói dịch vụ & Dự toán */}
              <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-2.5 hover:border-black/[0.14] transition-all">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-medium">Gói dịch vụ & Dự toán</p>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                      {customer.servicePackageName || 'Kỷ yếu Concept'} • {customer.expectedBudget.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`${customer.servicePackageName || 'Kỷ yếu Concept'} - ${customer.expectedBudget.toLocaleString('vi-VN')}đ`, 'quick_pkg')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] shrink-0 cursor-pointer ${
                    copiedKey === 'quick_pkg'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                  }`}
                >
                  {copiedKey === 'quick_pkg' ? (
                    <><Check className="w-3 h-3 text-emerald-600" /> Đã copy</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>

              {/* 6. Concept & Địa điểm chụp */}
              <div className="p-3 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-2.5 hover:border-black/[0.14] transition-all">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-pink-50 text-pink-600 border border-pink-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-500 font-medium">Concept & Địa điểm</p>
                    <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                      {customer.concept} • {customer.shootingLocations?.join(', ') || 'Chưa chọn'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(`Concept: ${customer.concept} - Địa điểm: ${customer.shootingLocations?.join(', ') || 'Chưa chọn'}`, 'quick_concept')}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] shrink-0 cursor-pointer ${
                    copiedKey === 'quick_concept'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                  }`}
                >
                  {copiedKey === 'quick_concept' ? (
                    <><Check className="w-3 h-3 text-emerald-600" /> Đã copy</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="shrink-0 flex items-center border-b border-black/[0.06] bg-white px-6 gap-2 text-xs font-semibold overflow-x-auto custom-scrollbar py-3 z-10">
          <button
            onClick={() => setActiveTabLocal('timeline')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline ({logs.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('bookings')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Booking ({customerBookings.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('marketing')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'marketing'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Marketing & UTM
          </button>
          <button
            onClick={() => setActiveTabLocal('feedbacks')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'feedbacks'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Feedback ({feedbacks.filter(fb => fb.customerId === customer.id).length})
          </button>
          <button
            onClick={() => setActiveTabLocal('fullinfo')}
            className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'fullinfo'
                ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Thông Tin Chi Tiết (Copy)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar overscroll-contain text-neutral-900">
          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Banner Giai Đoạn Tư Vấn & Lập / Sửa Báo Giá */}
              {['Đang tư vấn', 'Đã gửi báo giá', 'Đang thương lượng'].includes(customer.pipelineStage) && (
                <div className="p-4 bg-gradient-to-r from-amber-50 via-emerald-50/60 to-indigo-50/50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        Giai Đoạn: {customer.pipelineStage} (Lớp {customer.className})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Gói: <strong>{customer.servicePackageName || 'Kỷ Yếu Standard'}</strong> ({customer.studentCount} bạn) • Dự toán: <strong>{customer.expectedBudget.toLocaleString('vi-VN')}đ</strong> (~{Math.round(customer.expectedBudget / (customer.studentCount || 1)).toLocaleString('vi-VN')}đ/bạn)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowQuoteModal(true)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{customer.pipelineStage === 'Đang tư vấn' ? 'Lập Báo Giá PDF' : 'Chỉnh Sửa Báo Giá'}</span>
                    </button>
                    {customer.pipelineStage === 'Đang thương lượng' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMode('deposit');
                          setShowDepositModal(true);
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-neutral-950" />
                        <span>Tạo Cọc QR</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Banner Giai Đoạn Đã Bàn Giao: Tất toán hợp đồng */}
              {customer.pipelineStage === 'Đã bàn giao' && (
                <div className="p-4 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
                      <span className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                        Đã Bàn Giao Sản Phẩm (Lớp {customer.className})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Tổng bill: <strong>{(customer.totalRevenue || customer.expectedBudget || 0).toLocaleString('vi-VN')}đ</strong> • Đã cọc: <strong>{(customer.paidAmount || 0).toLocaleString('vi-VN')}đ</strong> • Còn lại cần thanh toán: <strong className="text-teal-700 font-extrabold">{Math.max(0, (customer.totalRevenue || customer.expectedBudget || 0) - (customer.paidAmount || 0)).toLocaleString('vi-VN')}đ</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('final');
                      setShowDepositModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Tạo QR Thanh Toán Hết</span>
                  </button>
                </div>
              )}

              {/* Form Thêm Ghi Chú Nhanh */}
              <form onSubmit={handleAddNote} className="bg-neutral-50 p-4 rounded-2xl border border-black/[0.06]">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-700" />
                  Thêm ghi chú tương tác / CSKH với lớp:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="VD: Đã gọi lớp trưởng, hẹn chiều nay chốt mẫu concept..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
                  >
                    <Send className="w-3 h-3" /> Gửi
                  </button>
                </div>
              </form>

              {/* Danh sách Timeline */}
              <div className="relative pl-6 border-l-2 border-neutral-300 space-y-6">
                {logs.length === 0 ? (
                  <p className="text-xs text-neutral-400">Chưa có hoạt động nào được ghi nhận.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-neutral-900 ring-4 ring-neutral-100" />
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-neutral-900">{log.title}</p>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 mt-1.5 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-black/[0.06]">
                          {log.description}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Thực hiện bởi: <strong className="text-neutral-700">{log.performedByName}</strong>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {customerBookings.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  <Calendar className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                  <p>Khách hàng này chưa có đơn Booking chính thức nào.</p>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('bookings');
                    }}
                    className="mt-3 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
                  >
                    + Tạo Booking cho lớp ngay
                  </button>
                </div>
              ) : (
                customerBookings.map((bk) => (
                  <div
                    key={bk.id}
                    onClick={() => {
                      setSelectedBookingId(bk.id);
                      onClose();
                      setActiveTab('bookings');
                    }}
                    className="p-4 rounded-2xl border border-black/[0.06] bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-neutral-900 bg-white border border-black/[0.08] px-2 py-0.5 rounded-md shadow-2xs">
                        {bk.code}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {bk.bookingStatus}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-neutral-900 mt-2.5">{bk.packageName}</p>
                    <p className="text-xs text-neutral-600 mt-1">
                      📅 Ngày chụp: <strong className="text-neutral-800">{bk.shootDate}</strong> ({bk.startTime} - {bk.endTime})
                    </p>
                    <p className="text-xs text-neutral-600">📍 Địa điểm: {bk.location}</p>

                    <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Đã cọc: <strong className="text-neutral-900">{bk.depositAmount.toLocaleString('vi-VN')}đ</strong></span>
                      <span className="text-neutral-500">Tổng đơn: <strong className="text-neutral-900 font-bold">{bk.totalAmount.toLocaleString('vi-VN')}đ</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Marketing & UTM */}
          {activeTab === 'marketing' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2.5">
                <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-neutral-700" />
                  Nguồn Khách Hàng (Source & Campaign)
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-neutral-500">Nguồn Lead:</span>
                    <p className="font-bold text-neutral-900 mt-0.5">{customer.source}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Chiến dịch (Campaign):</span>
                    <p className="font-bold text-neutral-900 mt-0.5">{customer.campaignName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* UTM Parameters */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                <h3 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                  Chi Tiết Tracking UTM
                </h3>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
                    <span className="text-neutral-500">utm_source:</span>
                    <span className="font-bold text-neutral-900">{customer.utm?.source || 'direct'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
                    <span className="text-neutral-500">utm_medium:</span>
                    <span className="font-bold text-neutral-900">{customer.utm?.medium || 'organic'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-black/[0.04]">
                    <span className="text-neutral-500">utm_campaign:</span>
                    <span className="font-bold text-neutral-900">{customer.utm?.campaign || 'none'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-500">Ad Set:</span>
                    <span className="font-bold text-neutral-900">{customer.utm?.adSet || 'none'}</span>
                  </div>
                </div>
              </div>

              {/* Nhu cầu & Concept chi tiết */}
              <div className="p-4 bg-[#B8F23D]/15 rounded-2xl border border-[#B8F23D]/30 space-y-2">
                <h3 className="font-bold text-neutral-900 text-xs">Concept & Yêu Cầu Riêng Của Lớp</h3>
                <p className="text-neutral-800"><strong>Concept:</strong> {customer.concept}</p>
                <p className="text-neutral-800"><strong>Địa điểm dự kiến:</strong> {customer.shootingLocations.join(', ')}</p>
                {customer.specialRequests && (
                  <p className="text-neutral-800"><strong>Yêu cầu đặc biệt:</strong> {customer.specialRequests}</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Feedback Từ Lớp */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-4 text-xs">
              {feedbacks.filter(fb => fb.customerId === customer.id).length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <Heart className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                  <p>Lớp này chưa để lại phản hồi nào trên hệ thống.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Sau khi bàn giao album, hãy gửi link khảo sát để nhận đánh giá nhé!</p>
                </div>
              ) : (
                feedbacks
                  .filter(fb => fb.customerId === customer.id)
                  .map(fb => (
                    <div key={fb.id} className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                          <span className="text-neutral-700 ml-1">({fb.rating}/5 sao)</span>
                        </div>
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-black/[0.08] text-neutral-700">
                          {fb.channel}
                        </span>
                      </div>

                      <p className="text-neutral-800 italic bg-white p-3 rounded-xl border border-black/[0.06]">
                        "{fb.comment}"
                      </p>

                      {fb.photographerMentioned && fb.photographerMentioned.length > 0 && (
                        <p className="text-neutral-600">
                          📷 Thợ được khen: <strong className="text-neutral-900">{fb.photographerMentioned.join(', ')}</strong>
                        </p>
                      )}

                      <div className="pt-2 border-t border-black/[0.06] flex justify-between text-[11px] text-neutral-400">
                        <span>Đại diện: {fb.customerName} ({fb.reviewerRole})</span>
                        <span>{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Tab 5: Thông Tin Đầy Đủ & Copy (Xem thêm) */}
          {activeTab === 'fullinfo' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                      Hồ Sơ Chi Tiết Khách Hàng - Sao Chép Nhanh
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Toàn bộ thông tin liên hệ, địa chỉ trường, concept và tài chính đã được tổng hợp sẵn để copy tiện lợi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(fullSummaryText, 'tab_all_full')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'tab_all_full' ? (
                    <><Check className="w-4 h-4 text-[#B8F23D]" /> ✓ Đã sao chép toàn bộ!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 📋 Sao chép toàn bộ thông tin</>
                  )}
                </button>
              </div>

              {/* Lưới chi tiết lớn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Số điện thoại */}
                <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 font-medium">Số điện thoại / Zalo</p>
                      <p className="text-sm font-bold text-neutral-900 truncate mt-0.5">{customer.phone}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(customer.phone, 'tab_phone')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                      copiedKey === 'tab_phone'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                    }`}
                  >
                    {copiedKey === 'tab_phone' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy SĐT</>
                    )}
                  </button>
                </div>

                {/* 2. Địa chỉ đầy đủ */}
                <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 font-medium">Địa chỉ & Khu vực</p>
                      <p className="text-xs font-bold text-neutral-900 truncate mt-0.5" title={fullAddress}>
                        {fullAddress || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(fullAddress, 'tab_addr')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                      copiedKey === 'tab_addr'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                    }`}
                  >
                    {copiedKey === 'tab_addr' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Đ/C</>
                    )}
                  </button>
                </div>

                {/* 3. Lớp & Trường học */}
                <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <School className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 font-medium">Lớp & Trường học</p>
                      <p className="text-xs font-bold text-neutral-900 truncate mt-0.5" title={`${customer.className} - ${customer.schoolName}`}>
                        {customer.className} - {customer.schoolName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${customer.className} - ${customer.schoolName}`, 'tab_school')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                      copiedKey === 'tab_school'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                    }`}
                  >
                    {copiedKey === 'tab_school' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>

                {/* 4. Người đại diện & Chức vụ */}
                <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 font-medium">Người đại diện liên hệ</p>
                      <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                        {customer.name} ({customer.representativeRole})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${customer.name} (${customer.representativeRole})`, 'tab_rep')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                      copiedKey === 'tab_rep'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                    }`}
                  >
                    {copiedKey === 'tab_rep' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>

                {/* 5. Gói dịch vụ & Dự toán */}
                <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 font-medium">Gói dịch vụ & Dự toán</p>
                      <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                        {customer.servicePackageName || 'Kỷ yếu Concept'} • {customer.expectedBudget.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${customer.servicePackageName || 'Kỷ yếu Concept'} - ${customer.expectedBudget.toLocaleString('vi-VN')}đ`, 'tab_pkg')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                      copiedKey === 'tab_pkg'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                    }`}
                  >
                    {copiedKey === 'tab_pkg' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>

                {/* 6. Concept & Địa điểm chụp */}
                <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 border border-pink-200/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-neutral-500 font-medium">Concept & Địa điểm</p>
                      <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                        {customer.concept} • {customer.shootingLocations?.join(', ') || 'Chưa chọn'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`Concept: ${customer.concept} - Địa điểm: ${customer.shootingLocations?.join(', ') || 'Chưa chọn'}`, 'tab_concept')}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shrink-0 cursor-pointer ${
                      copiedKey === 'tab_concept'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-black/[0.08]'
                    }`}
                  >
                    {copiedKey === 'tab_concept' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 bg-neutral-50/70 border-t border-black/[0.06] flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
          <a
            href={`tel:${customer.phone}`}
            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 border border-black/[0.08] text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-neutral-700" />
            Gọi {customer.phone}
          </a>

          {/* Nút Copy SĐT ở Footer */}
          <button
            type="button"
            onClick={() => handleCopy(customer.phone, 'footer_phone')}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              copiedKey === 'footer_phone'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-black/[0.08]'
            }`}
            title={`Sao chép SĐT: ${customer.phone}`}
          >
            {copiedKey === 'footer_phone' ? (
              <><Check className="w-3.5 h-3.5 text-emerald-600" /> Đã copy SĐT</>
            ) : (
              <><Copy className="w-3.5 h-3.5 text-neutral-600" /> Copy SĐT</>
            )}
          </button>

          <a
            href={`https://zalo.me/${customer.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Nhắn Zalo
          </a>

          {/* Nút Xem Thêm & Copy Ở Footer */}
          <button
            type="button"
            onClick={() => setShowQuickDetails(prev => !prev)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
              showQuickDetails
                ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
            title="Mở bảng thông tin chi tiết đầy đủ để copy"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showQuickDetails ? 'Đóng chi tiết' : 'Xem thêm (Đ/C, SĐT)'}</span>
          </button>

          {/* Nút Tạo / Sửa Báo Giá: CHỈ hiển thị ở Đang tư vấn, Đã gửi báo giá, Đang thương lượng */}
          {['Đang tư vấn', 'Đã gửi báo giá', 'Đang thương lượng'].includes(customer.pipelineStage) && (
            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              title={customer.pipelineStage === 'Đang tư vấn' ? 'Lập bảng báo giá PDF chi tiết cho lớp' : 'Chỉnh sửa lại bảng báo giá'}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{customer.pipelineStage === 'Đang tư vấn' ? 'Tạo Báo Giá PDF' : 'Chỉnh Sửa Báo Giá'}</span>
            </button>
          )}

          {/* Nút Tạo Cọc QR: CHỈ hiển thị ở Đang thương lượng */}
          {customer.pipelineStage === 'Đang thương lượng' && (
            <button
              type="button"
              onClick={() => {
                setPaymentMode('deposit');
                setShowDepositModal(true);
              }}
              className="flex-1 py-2.5 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              title="Tạo khoản cọc giữ lịch và mã VietQR chuyển khoản ngân hàng"
            >
              <QrCode className="w-3.5 h-3.5 text-neutral-950" />
              <span>Tạo Cọc QR</span>
            </button>
          )}

          {/* Nút Tạo QR Thanh Toán Hết: CHỈ hiển thị ở Đã bàn giao */}
          {customer.pipelineStage === 'Đã bàn giao' && (
            <button
              type="button"
              onClick={() => {
                setPaymentMode('final');
                setShowDepositModal(true);
              }}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              title="Tất toán: Tạo mã VietQR thanh toán toàn bộ số tiền còn lại (Tổng bill - cọc)"
            >
              <QrCode className="w-3.5 h-3.5 text-white" />
              <span>Tạo QR Thanh Toán Hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Lost Reason Confirmation Modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-[130] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-150">
          <div onClick={() => setShowLostModal(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.08] shadow-2xl p-6 text-neutral-900 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <UserX className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900">Khách Hàng Từ Chối (Lost)</h3>
                <p className="text-xs text-neutral-500">Chuyển trạng thái sang Lost và lưu lý do</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              Bạn đang đánh dấu lớp <strong>{customer.className} ({customer.schoolName})</strong> từ chối hoặc hủy chụp. Vui lòng chọn lý do chính:
            </p>

            <div className="space-y-2 mb-4">
              {[
                'Giá cao hơn ngân sách dự kiến của lớp',
                'Lớp đã chọn studio / đơn vị khác',
                'Lớp hủy kế hoạch chụp kỷ yếu năm nay',
                'Không thể liên lạc / Khách không phản hồi',
                'Lý do khác...'
              ].map((r) => (
                <label key={r} className="flex items-center gap-2 p-2.5 rounded-xl border border-black/[0.06] hover:bg-neutral-50 cursor-pointer text-xs font-medium transition-colors">
                  <input
                    type="radio"
                    name="lostReason"
                    checked={lostReason === r}
                    onChange={() => setLostReason(r)}
                    className="accent-rose-600"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-neutral-600">Ghi chú bổ sung (tùy chọn)</label>
              <textarea
                rows={2}
                value={customLostNote}
                onChange={(e) => setCustomLostNote(e.target.value)}
                placeholder="Nhập chi tiết lý do từ chối hoặc phản hồi từ lớp trưởng..."
                className="w-full mt-1 p-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLostModal(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCustomerStage(customer.id, 'Lost');
                  addActivityLog({
                    customerId: customer.id,
                    type: 'note',
                    title: 'Khách hàng từ chối (Lost)',
                    description: `Lý do từ chối: ${lostReason}${customLostNote.trim() ? ` - Chi tiết: ${customLostNote.trim()}` : ''}`,
                    performedByName: currentUser.name
                  });
                  setShowLostModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <UserX className="w-3.5 h-3.5" />
                Xác Nhận Chuyển Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xuất Báo Giá PDF Kỷ Yếu */}
      <PriceQuoteModal
        customer={customer}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />

      {/* Modal Tạo Cọc & Tất Toán QR Chuyển Khoản */}
      <DepositQrModal
        customer={customer}
        isOpen={showDepositModal}
        mode={paymentMode}
        onClose={() => setShowDepositModal(false)}
      />
    </div>,
    document.body
  );
};

