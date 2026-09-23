import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';

interface CustomerDetail360Props {
  customerId: string;
  onClose: () => void;
}

export const CustomerDetail360: React.FC<CustomerDetail360Props> = ({ customerId, onClose }) => {
  const {
    customers,
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

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl transition-opacity"
      />

      {/* Center Popup Modal */}
      <div className="relative w-full max-w-3xl sm:max-w-4xl max-h-[90vh] bg-neutral-900/95 backdrop-blur-3xl rounded-3xl border border-white/20 text-white shadow-[0_32px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.18)] flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="p-6 bg-white/[0.03] border-b border-white/[0.08] flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-xl shadow-[0_0_25px_rgba(249,115,22,0.4)] border border-white/20">
              {customer.className.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{customer.name}</h2>
                <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  {customer.representativeRole}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-orange-400" />
                  <span>{customer.className} - {customer.schoolName}</span>
                </span>
                <span>•</span>
                <span>{customer.academicYear}</span>
                {(customer.district || customer.city || customer.region) && (
                  <>
                    <span>•</span>
                    <span className="text-orange-400 font-medium flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      <MapPin className="w-3 h-3" />
                      <span>{customer.district ? `${customer.district}, ` : ''}{customer.city || customer.region}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-3 bg-white/[0.02] px-6 py-3 border-b border-white/[0.08] text-xs">
          <div>
            <p className="text-[11px] text-white/40">Giai đoạn Pipeline</p>
            <p className="font-bold text-orange-400 mt-0.5">{customer.pipelineStage}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/40">Sỉ số lớp</p>
            <p className="font-bold text-white mt-0.5">{customer.studentCount} học sinh</p>
          </div>
          <div>
            <p className="text-[11px] text-white/40">Ngân sách dự kiến</p>
            <p className="font-bold text-emerald-400 mt-0.5">{customer.expectedBudget.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] bg-white/[0.015] px-6 gap-4 text-xs font-medium overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTabLocal('timeline')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline ({logs.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('bookings')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Booking ({customerBookings.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('marketing')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'marketing'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Marketing & UTM
          </button>
          <button
            onClick={() => setActiveTabLocal('feedbacks')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'feedbacks'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Feedback ({feedbacks.filter(fb => fb.customerId === customer.id).length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-white">
          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Form Thêm Ghi Chú Nhanh */}
              <form onSubmit={handleAddNote} className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08]">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                  Thêm ghi chú tương tác với lớp:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="VD: Đã gọi lớp trưởng, hẹn chiều nay chốt mẫu concept..."
                    className="flex-1 px-3 py-2 text-xs glass-input rounded-xl"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Gửi
                  </button>
                </div>
              </form>

              {/* Danh sách Timeline */}
              <div className="relative pl-6 border-l-2 border-orange-500/30 space-y-6">
                {logs.length === 0 ? (
                  <p className="text-xs text-white/40">Chưa có hoạt động nào được ghi nhận.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-orange-500 ring-4 ring-neutral-900 shadow-[0_0_8px_#f97316]" />
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{log.title}</p>
                          <span className="text-[10px] text-white/40">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 mt-1.5 leading-relaxed bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                          {log.description}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1">
                          Thực hiện bởi: <strong className="text-white/70">{log.performedByName}</strong>
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
                <div className="text-center py-12 text-white/40 text-xs">
                  <Calendar className="w-8 h-8 mx-auto text-white/20 mb-2" />
                  <p>Khách hàng này chưa có đơn Booking chính thức nào.</p>
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('bookings');
                    }}
                    className="mt-3 px-4 py-2 glass-btn-primary rounded-xl font-semibold text-xs"
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
                    className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.18] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-300 bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded-md">
                        {bk.code}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {bk.bookingStatus}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white mt-2.5">{bk.packageName}</p>
                    <p className="text-xs text-white/50 mt-1">
                      📅 Ngày chụp: <strong className="text-white/80">{bk.shootDate}</strong> ({bk.startTime} - {bk.endTime})
                    </p>
                    <p className="text-xs text-white/50">📍 Địa điểm: {bk.location}</p>

                    <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      <span className="text-white/50">Đã cọc: <strong className="text-white">{bk.depositAmount.toLocaleString('vi-VN')}đ</strong></span>
                      <span className="text-white/50">Tổng đơn: <strong className="text-orange-400">{bk.totalAmount.toLocaleString('vi-VN')}đ</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Marketing & UTM */}
          {activeTab === 'marketing' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-2.5">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-orange-400" />
                  Nguồn Khách Hàng (Source & Campaign)
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-white/40">Nguồn Lead:</span>
                    <p className="font-bold text-white mt-0.5">{customer.source}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Chiến dịch (Campaign):</span>
                    <p className="font-bold text-white mt-0.5">{customer.campaignName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* UTM Parameters */}
              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Chi Tiết Tracking UTM
                </h3>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                    <span className="text-white/45">utm_source:</span>
                    <span className="font-bold text-white">{customer.utm?.source || 'direct'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                    <span className="text-white/45">utm_medium:</span>
                    <span className="font-bold text-white">{customer.utm?.medium || 'organic'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                    <span className="text-white/45">utm_campaign:</span>
                    <span className="font-bold text-white">{customer.utm?.campaign || 'none'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-white/45">Ad Set:</span>
                    <span className="font-bold text-white">{customer.utm?.adSet || 'none'}</span>
                  </div>
                </div>
              </div>

              {/* Nhu cầu & Concept chi tiết */}
              <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 space-y-2">
                <h3 className="font-bold text-orange-300 text-xs">Concept & Yêu Cầu Riêng Của Lớp</h3>
                <p className="text-white/80"><strong>Concept:</strong> {customer.concept}</p>
                <p className="text-white/80"><strong>Địa điểm dự kiến:</strong> {customer.shootingLocations.join(', ')}</p>
                {customer.specialRequests && (
                  <p className="text-white/80"><strong>Yêu cầu đặc biệt:</strong> {customer.specialRequests}</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Feedback Từ Lớp */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-4 text-xs">
              {feedbacks.filter(fb => fb.customerId === customer.id).length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Heart className="w-10 h-10 mx-auto text-white/20 mb-2" />
                  <p>Lớp này chưa để lại phản hồi nào trên hệ thống.</p>
                  <p className="text-[11px] text-white/40 mt-1">Sau khi bàn giao album, hãy gửi link khảo sát để nhận đánh giá nhé!</p>
                </div>
              ) : (
                feedbacks
                  .filter(fb => fb.customerId === customer.id)
                  .map(fb => (
                    <div key={fb.id} className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                          <span className="text-white/70 ml-1">({fb.rating}/5 sao)</span>
                        </div>
                        <span className="text-[10px] font-bold bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/[0.1] text-white/70">
                          {fb.channel}
                        </span>
                      </div>

                      <p className="text-white/80 italic bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                        "{fb.comment}"
                      </p>

                      {fb.photographerMentioned && fb.photographerMentioned.length > 0 && (
                        <p className="text-white/60">
                          📷 Thợ được khen: <strong className="text-white">{fb.photographerMentioned.join(', ')}</strong>
                        </p>
                      )}

                      <div className="pt-2 border-t border-white/[0.06] flex justify-between text-[11px] text-white/40">
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
        <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex-1 py-2.5 glass-btn-secondary rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            Gọi {customer.phone}
          </a>

          <a
            href={`https://zalo.me/${customer.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-blue-600/80 hover:bg-blue-600 border border-blue-400/30 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Nhắn Zalo
          </a>
        </div>
      </div>
    </div>
  );
};
