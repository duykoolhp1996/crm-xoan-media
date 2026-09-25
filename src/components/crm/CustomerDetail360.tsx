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
  FileText
} from 'lucide-react';
import { PriceQuoteModal } from '../quote/PriceQuoteModal';

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
  const [activeTab, setActiveTabLocal] = useState<'timeline' | 'bookings' | 'marketing' | 'feedbacks'>('timeline');
  const [noteContent, setNoteContent] = useState('');
  const [showLostModal, setShowLostModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [lostReason, setLostReason] = useState('Giá cao hơn ngân sách dự kiến của lớp');
  const [customLostNote, setCustomLostNote] = useState('');

  if (!customer) return null;

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
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
      />

      {/* Center Popup Modal */}
      <div className="relative w-full max-w-3xl sm:max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-black/[0.08] text-neutral-900 shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-6 bg-neutral-50/70 border-b border-black/[0.06] flex items-start justify-between shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-black text-xl shadow-sm shrink-0">
              {customer.className.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">{customer.name}</h2>
                <span className="text-xs bg-neutral-100 text-neutral-800 border border-black/[0.06] px-2.5 py-0.5 rounded-full font-semibold">
                  {customer.representativeRole}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
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
              </p>
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

            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="px-3.5 py-1.5 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 border border-black/[0.08] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Lập và xuất bảng báo giá PDF chi tiết cho lớp"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-950" />
              <span>Tạo Báo Giá PDF</span>
            </button>

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
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-neutral-900">
          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Banner Giai Đoạn Tư Vấn & Lập Báo Giá Nhanh */}
              {(customer.pipelineStage === 'Đang tư vấn' || customer.pipelineStage === 'Đã gửi báo giá') && (
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
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lập Báo Giá PDF</span>
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
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 bg-neutral-50/70 border-t border-black/[0.06] flex items-center justify-between gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 border border-black/[0.08] text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-neutral-700" />
            Gọi {customer.phone}
          </a>

          <a
            href={`https://zalo.me/${customer.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Nhắn Zalo
          </a>

          <button
            type="button"
            onClick={() => setShowQuoteModal(true)}
            className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
            title="Lập và xuất bảng báo giá PDF chi tiết cho lớp"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tạo Báo Giá PDF</span>
          </button>
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
    </div>,
    document.body
  );
};

