import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Customer, Booking } from '../../types';
import {
  X,
  Camera,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  UserCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { getCustomerTotalOrderValue } from '../../lib/revenueUtils';
import { notifyShootDateScheduledToZaloGroup } from '../../lib/zaloBotService';

interface AssignCrewModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignCrewModal: React.FC<AssignCrewModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    photographers,
    bookings,
    updateBooking,
    addBooking,
    updateCustomer,
    addActivityLog,
    currentUser,
    currentRole,
    getPhotographerAvailability
  } = useApp();

  // Tìm booking tương ứng
  const matchedBooking = useMemo(() => {
    if (!customer) return null;
    return bookings.find(
      b => b.customerId === customer.id ||
      (b.className && b.className === customer.className && b.schoolName === customer.schoolName)
    ) || null;
  }, [customer, bookings]);

  // Khởi tạo ngày chụp
  const defaultDate = useMemo(() => {
    if (customer?.expectedShootDate) return customer.expectedShootDate;
    if (matchedBooking?.shootDate) return matchedBooking.shootDate;
    return new Date().toISOString().split('T')[0];
  }, [customer, matchedBooking]);

  const [shootDate, setShootDate] = useState<string>(defaultDate);
  const [timeSlot, setTimeSlot] = useState<'Cả ngày' | 'Ca Sáng' | 'Ca Chiều'>('Cả ngày');
  const [location, setLocation] = useState<string>('');
  const [leadPhotoId, setLeadPhotoId] = useState<string>('');
  const [assistantIds, setAssistantIds] = useState<string[]>([]);
  const [videographerId, setVideographerId] = useState<string>('');
  const [individualPhotoId, setIndividualPhotoId] = useState<string>('');
  const [crewNotes, setCrewNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Đồng bộ form khi modal mở hoặc customer thay đổi
  useEffect(() => {
    if (customer && isOpen) {
      const bDate = matchedBooking?.shootDate || customer.expectedShootDate || defaultDate;
      setShootDate(bDate);

      if (matchedBooking?.startTime === '13:30') {
        setTimeSlot('Ca Chiều');
      } else if (matchedBooking?.endTime === '11:30') {
        setTimeSlot('Ca Sáng');
      } else {
        setTimeSlot('Cả ngày');
      }

      setLocation(
        matchedBooking?.location ||
        customer.shootAddress ||
        (Array.isArray(customer.shootingLocations) && customer.shootingLocations.length > 0 ? customer.shootingLocations.join(', ') : '') ||
        customer.schoolName || ''
      );

      // Tìm thợ chính từ booking hoặc từ ghi chú
      let initialLeadId = matchedBooking?.assignments?.leadPhotographerId || '';
      if (!initialLeadId && customer.notes) {
        const found = photographers.find(p => customer.notes?.includes(p.fullName));
        if (found) initialLeadId = found.id;
      }
      setLeadPhotoId(initialLeadId);

      setAssistantIds(matchedBooking?.assignments?.assistantPhotographerIds || []);
      setVideographerId(matchedBooking?.assignments?.videographerId || '');
      setIndividualPhotoId(matchedBooking?.assignments?.individualPhotographerId || '');
      setCrewNotes(matchedBooking?.notes || customer.notes || '');
      setIsSuccess(false);
    }
  }, [customer, matchedBooking, isOpen, defaultDate, photographers]);

  if (!isOpen || !customer) return null;

  // Lọc danh sách thợ khả dụng (loại studio đối tác)
  const availablePhotographers = photographers.filter(p => p.photographerType !== 'Đối tác Studio');

  // Kiểm tra tình trạng bận/rảnh của thợ chính đã chọn
  const leadAvailability = leadPhotoId ? getPhotographerAvailability(leadPhotoId, shootDate) : null;
  const selectedLead = photographers.find(p => p.id === leadPhotoId);

  // Toggle thợ phụ
  const toggleAssistant = (id: string) => {
    setAssistantIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'photographer') return;

    const leadPhoto = photographers.find(p => p.id === leadPhotoId);
    const videoPhoto = photographers.find(p => p.id === videographerId);
    const indivPhoto = photographers.find(p => p.id === individualPhotoId);
    const assistantNames = assistantIds
      .map(id => photographers.find(p => p.id === id)?.fullName)
      .filter((n): n is string => Boolean(n));

    const updatedAssignments = {
      leadPhotographerId: leadPhotoId || undefined,
      leadPhotographerName: leadPhoto?.fullName || 'Chưa gán',
      assistantPhotographerIds: assistantIds,
      assistantNames: assistantNames,
      videographerId: videographerId || undefined,
      videographerName: videoPhoto?.fullName || undefined,
      individualPhotographerId: individualPhotoId || undefined,
      individualPhotographerName: indivPhoto?.fullName || undefined
    };

    const startTime = timeSlot === 'Ca Chiều' ? '13:30' : '07:30';
    const endTime = timeSlot === 'Ca Sáng' ? '11:30' : '17:30';

    if (matchedBooking) {
      const updatedBk: Booking = {
        ...matchedBooking,
        shootDate,
        startTime,
        endTime,
        location: location || matchedBooking.location,
        assignments: updatedAssignments,
        notes: crewNotes,
        updatedAt: new Date().toISOString()
      };
      updateBooking(updatedBk);
    } else {
      const newBk: Booking = {
        id: `bk-${Date.now()}`,
        code: `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerId: customer.id,
        customerName: customer.className ? `${customer.className} - ${customer.schoolName}` : customer.name,
        schoolName: customer.schoolName,
        className: customer.className || '',
        shootDate,
        startTime,
        endTime,
        location: location || customer.schoolName,
        city: customer.city || 'Hải Phòng',
        district: customer.district || '',
        studentCount: customer.studentCount || 35,
        packageId: customer.servicePackageId || 'pkg-2',
        packageName: customer.servicePackageName || 'Gói Kỷ Yếu Chuẩn',
        concept: customer.concept || '',
        totalAmount: getCustomerTotalOrderValue(customer),
        depositAmount: Number(customer.depositAmount || customer.paidAmount || 0),
        remainingAmount: Math.max(0, getCustomerTotalOrderValue(customer) - Number(customer.paidAmount || customer.depositAmount || 0)),
        paymentStatus: Number(customer.paidAmount || customer.depositAmount || 0) > 0 ? 'Đã cọc' : 'Chưa cọc',
        bookingStatus: 'Đã xác nhận',
        assignments: updatedAssignments,
        notes: crewNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addBooking(newBk);
    }

    // Đồng bộ Customer
    let noteLines: string[] = [];
    if (leadPhoto?.fullName) noteLines.push(`Thợ chụp: ${leadPhoto.fullName}${assistantNames.length > 0 ? ', ' + assistantNames.join(', ') : ''}`);
    if (videoPhoto?.fullName) noteLines.push(`Thợ quay: ${videoPhoto.fullName}`);
    if (indivPhoto?.fullName) noteLines.push(`Thợ cá nhân: ${indivPhoto.fullName}`);

    let newNotes = customer.notes || '';
    if (noteLines.length > 0) {
      const crewSummary = noteLines.join('. ') + '.';
      if (newNotes.includes('Thợ chụp:')) {
        newNotes = newNotes.replace(/Thợ chụp:[^.\n]*\.?/, noteLines[0] + '.');
      } else {
        newNotes = `${newNotes ? newNotes + '\n' : ''}${crewSummary}`.trim();
      }
    }

    updateCustomer({
      ...customer,
      expectedShootDate: shootDate,
      shootTime: startTime,
      shootAddress: location,
      notes: newNotes,
      updatedAt: new Date().toISOString()
    });

    addActivityLog({
      customerId: customer.id,
      type: 'note',
      title: 'Điều phối & phân công thợ chụp',
      description: `Đã phân công Trưởng nháy: ${leadPhoto?.fullName || 'Chưa gán'}${assistantNames.length > 0 ? `, Thợ phụ: ${assistantNames.join(', ')}` : ''}${videoPhoto ? `, Thợ quay: ${videoPhoto.fullName}` : ''} cho lớp ${customer.className || customer.name}.`,
      performedByName: currentUser.name
    });

    // Bắn thông báo Zalo Bot nếu có thợ chính
    if (leadPhoto?.fullName) {
      notifyShootDateScheduledToZaloGroup({
        customer,
        shootDate,
        timeSlot,
        location: location || customer.schoolName,
        leadPhotographerName: leadPhoto.fullName
      }).catch(err => console.warn('[Zalo Bot] Lỗi gửi thông báo phân công thợ:', err));
    }

    setIsSuccess(true);
    if (onSuccess) onSuccess();

    setTimeout(() => {
      onClose();
    }, 900);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B8F23D] text-neutral-950 flex items-center justify-center font-black shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Điều Phối & Phân Công Thợ Chụp</h3>
                <span className="text-[10px] bg-[#B8F23D]/20 text-[#B8F23D] border border-[#B8F23D]/40 px-2 py-0.5 rounded-full font-bold">
                  Ekip Kỷ Yếu
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5 truncate max-w-md">
                Lớp {customer.className || customer.name} ({customer.schoolName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* THÔNG BÁO THÀNH CÔNG */}
        {isSuccess && (
          <div className="p-3.5 bg-emerald-500 text-white text-center font-bold text-xs flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã cập nhật phân công thợ chụp & ekip thành công!</span>
          </div>
        )}

        {/* BODY FORM */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs custom-scrollbar">
          
          {/* Section 1: Ngày Chụp & Ca Chụp */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>1. Lịch Chụp & Thời Gian</span>
              </label>
              <span className="text-[11px] font-semibold text-neutral-500">
                {shootDate ? `Thứ ${new Date(shootDate).getDay() === 0 ? 'Chủ Nhật' : new Date(shootDate).getDay() + 1}` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-600 font-medium block mb-1">Ngày chụp chính thức:</label>
                <input
                  type="date"
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                  className="w-full p-2 bg-white rounded-xl border border-black/[0.08] font-bold text-neutral-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 font-medium block mb-1">Ca chụp:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cả ngày', 'Ca Sáng', 'Ca Chiều'] as const).map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                        timeSlot === slot
                          ? 'bg-purple-900 text-white border-purple-900 shadow-2xs'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100 border-black/[0.06]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-600 font-medium block mb-1">Địa điểm chụp:</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Trường học, Nhà hát lớn, Bãi biển Đồ Sơn..."
                  className="w-full pl-8 pr-3 py-2 bg-white rounded-xl border border-black/[0.08] text-neutral-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trưởng Nháy / Thợ Chụp Chính (QUAN TRỌNG NHẤT) */}
          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-600" />
                <span>2. Trưởng Nháy / Thợ Chụp Chính (Lead) *</span>
              </label>
              {selectedLead && (
                <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  {selectedLead.experienceYears} năm KN • {selectedLead.photographerType}
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={leadPhotoId}
                onChange={(e) => setLeadPhotoId(e.target.value)}
                className="w-full p-2.5 bg-white rounded-xl border border-purple-300 font-extrabold text-xs text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer appearance-none pr-8"
              >
                <option value="">-- Chưa gán thợ chụp chính --</option>
                {availablePhotographers.map(p => (
                  <option key={p.id} value={p.id}>
                    📸 {p.fullName} ({p.experienceYears} năm KN - {p.photographerType})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-purple-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Trạng thái lịch của thợ chính */}
            {leadPhotoId && leadAvailability && (
              <div className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
                leadAvailability.available
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {leadAvailability.available ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Thợ <strong>{selectedLead?.fullName}</strong> đang trống lịch ngày này, sẵn sàng chụp!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Cảnh báo: <strong>{selectedLead?.fullName}</strong> đã có {leadAvailability.totalShootsOnDay} ca chụp trong ngày {shootDate}!</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Thợ Phụ / Chụp Phụ (Multi-select) */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Thợ Phụ / Trợ Lý Chụp (Đã chọn: {assistantIds.length})</span>
              </label>
              {assistantIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAssistantIds([])}
                  className="text-[10px] text-neutral-400 hover:text-rose-600"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-xl border border-black/[0.06] custom-scrollbar">
              {availablePhotographers
                .filter(p => p.id !== leadPhotoId)
                .map(p => {
                  const isChecked = assistantIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleAssistant(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                        isChecked
                          ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                          : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-black/[0.06]'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{p.fullName}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Section 4: Thợ Quay & Thợ Chụp Cá Nhân */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>4. Thợ Quay Phim (Video)</span>
              </label>
              <select
                value={videographerId}
                onChange={(e) => setVideographerId(e.target.value)}
                className="w-full p-2 bg-white rounded-xl border border-black/[0.08] text-xs font-semibold text-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="">-- Chưa gán thợ quay --</option>
                {availablePhotographers.map(p => (
                  <option key={p.id} value={p.id}>
                    🎥 {p.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>5. Thợ Chụp Cá Nhân</span>
              </label>
              <select
                value={individualPhotoId}
                onChange={(e) => setIndividualPhotoId(e.target.value)}
                className="w-full p-2 bg-white rounded-xl border border-black/[0.08] text-xs font-semibold text-neutral-900 focus:outline-none cursor-pointer"
              >
                <option value="">-- Chưa gán thợ cá nhân --</option>
                {availablePhotographers.map(p => (
                  <option key={p.id} value={p.id}>
                    ⭐ {p.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 5: Ghi Chú Ekip */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1">
            <label className="text-[11px] font-bold text-neutral-700 block">
              Ghi chú dặn dò ekip (Concept, trang phục, xe di chuyển, giờ giấc):
            </label>
            <textarea
              rows={2}
              value={crewNotes}
              onChange={(e) => setCrewNotes(e.target.value)}
              placeholder="VD: Concept NAM VEST ĐEN NỮ SƠ MI TRẮNG. Tập trung lúc 07:00 tại cổng trường..."
              className="w-full p-2 bg-white rounded-xl border border-black/[0.08] text-xs text-neutral-900 focus:outline-none focus:border-purple-500 custom-scrollbar"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-2.5 shrink-0 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#B8F23D]" />
              <span>Lưu Phân Công Ekip</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
