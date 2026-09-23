import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, PaymentStatus } from '../../types';
import { VIETNAM_LOCATIONS, getDistrictsByCity } from '../../data/vietnamLocations';
import { X, Calendar, Camera, AlertTriangle, MapPin } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const { customers, servicePackages, photographers, addBooking, getPhotographerAvailability } = useApp();

  const initialCustomer = customers[0];
  const initialCity = initialCustomer?.city || 'Hà Nội';
  const initialDistricts = getDistrictsByCity(initialCity);
  const initialDistrict = initialCustomer?.district || initialDistricts[0] || 'Cầu Giấy';

  const [formData, setFormData] = useState({
    customerId: initialCustomer?.id || '',
    shootDate: '2024-11-20',
    startTime: '08:00',
    endTime: '17:00',
    city: initialCity,
    district: initialDistrict,
    location: 'Trường học & Văn Miếu',
    studentCount: 38,
    packageId: servicePackages[1]?.id || '',
    depositAmount: 3000000,
    leadPhotographerId: photographers[0]?.id || '',
    videographerId: '',
    makeupStaffId: '',
    notes: ''
  });

  const availableDistricts = getDistrictsByCity(formData.city);

  const handleCustomerChange = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      const city = cust.city || formData.city;
      const districts = getDistrictsByCity(city);
      const district = cust.district || districts[0] || '';
      setFormData(prev => ({
        ...prev,
        customerId,
        city,
        district
      }));
    } else {
      setFormData(prev => ({ ...prev, customerId }));
    }
  };

  const handleCityChange = (cityName: string) => {
    const districts = getDistrictsByCity(cityName);
    const firstDistrict = districts[0] || '';
    setFormData(prev => ({
      ...prev,
      city: cityName,
      district: firstDistrict
    }));
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData(prev => ({
      ...prev,
      district: districtName
    }));
  };

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === formData.customerId) || customers[0];
  const selectedPackage = servicePackages.find(p => p.id === formData.packageId) || servicePackages[0];
  const totalAmount = selectedPackage ? selectedPackage.price : 6800000;
  const remainingAmount = Math.max(0, totalAmount - formData.depositAmount);

  // Kiểm tra tình trạng sẵn sàng của thợ chính được chọn
  const photoAvailability = formData.leadPhotographerId
    ? getPhotographerAvailability(formData.leadPhotographerId, formData.shootDate)
    : { available: true, totalShootsOnDay: 0 };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const leadPhoto = photographers.find(p => p.id === formData.leadPhotographerId);
    const videoPhoto = photographers.find(p => p.id === formData.videographerId);
    const makeupStaff = photographers.find(p => p.id === formData.makeupStaffId);

    const paymentStatus: PaymentStatus =
      formData.depositAmount >= totalAmount
        ? 'Đã thanh toán đủ'
        : formData.depositAmount > 0
        ? 'Đã cọc'
        : 'Chưa cọc';

    const bookingStatus: BookingStatus =
      formData.depositAmount > 0 ? 'Đã đặt cọc' : 'Chờ xác nhận';

    addBooking({
      code: `BK-2024-00${Math.floor(Math.random() * 900) + 100}`,
      customerId: selectedCustomer.id,
      customerName: `${selectedCustomer.name} (${selectedCustomer.className} - ${selectedCustomer.schoolName})`,
      schoolName: selectedCustomer.schoolName,
      className: selectedCustomer.className,
      shootDate: formData.shootDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      city: formData.city,
      district: formData.district,
      location: formData.location ? `${formData.location} (${formData.district}, ${formData.city})` : `${formData.district}, ${formData.city}`,
      studentCount: Number(formData.studentCount),
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      totalAmount,
      depositAmount: Number(formData.depositAmount),
      remainingAmount,
      paymentStatus,
      bookingStatus,
      assignments: {
        leadPhotographerId: leadPhoto?.id,
        leadPhotographerName: leadPhoto?.fullName,
        videographerId: videoPhoto?.id,
        videographerName: videoPhoto?.fullName,
        makeupStaffId: makeupStaff?.id,
        makeupStaffName: makeupStaff?.fullName
      },
      notes: formData.notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xl" />

      <div className="relative w-full max-w-2xl bg-neutral-900/90 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.18)] overflow-hidden my-8 z-10 text-xs text-white">
        {/* Header */}
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight">Tạo Booking Lịch Chụp Kỷ Yếu Mới</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* 1. Chọn khách hàng / lớp */}
          <div>
            <label className="font-bold text-white/80">Chọn Lớp / Khách Hàng *</label>
            <select
              value={formData.customerId}
              onChange={e => handleCustomerChange(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-medium cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.className} - {c.schoolName} ({c.name} - {c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Ngày giờ & Địa điểm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-white/80">Ngày Chụp *</label>
              <input
                type="date"
                required
                value={formData.shootDate}
                onChange={e => setFormData({ ...formData, shootDate: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-semibold cursor-pointer"
              />
            </div>
            <div>
              <label className="font-bold text-white/80">Giờ Bắt Đầu</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl cursor-pointer"
              />
            </div>
            <div>
              <label className="font-bold text-white/80">Giờ Kết Thúc</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl cursor-pointer"
              />
            </div>
          </div>

          {/* Khu vực chụp: Thành phố và Quận/Huyện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-white/80 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Tỉnh / Thành Phố Chụp</span>
              </label>
              <select
                value={formData.city}
                onChange={e => handleCityChange(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-medium text-orange-300 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                {VIETNAM_LOCATIONS.map(loc => (
                  <option key={loc.city} value={loc.city}>
                    {loc.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-white/80 flex items-center gap-1.5">
                <span>Quận / Huyện</span>
                <span className="text-[10px] text-white/40">({formData.city})</span>
              </label>
              <select
                value={formData.district}
                onChange={e => handleDistrictChange(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-medium text-sky-300 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                {availableDistricts.map(dist => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-white/80">Địa Điểm Chụp Cụ Thể</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="VD: Trường Amsterdam, Văn Miếu, Phim trường Santorini..."
              className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
            />
          </div>

          {/* 3. Gói Dịch Vụ & Tiền Cọc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08]">
            <div>
              <label className="font-bold text-white/80">Gói Dịch Vụ Kỷ Yếu</label>
              <select
                value={formData.packageId}
                onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-medium cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                {servicePackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.price.toLocaleString('vi-VN')}đ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-white/80">Tiền Cọc Thu Trước (đ)</label>
              <input
                type="number"
                step={500000}
                value={formData.depositAmount}
                onChange={e => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-bold text-emerald-400"
              />
            </div>

            <div className="sm:col-span-2 pt-2.5 border-t border-white/[0.08] flex justify-between text-xs">
              <span className="text-white/60">Tổng giá trị đơn: <strong className="text-white">{totalAmount.toLocaleString('vi-VN')}đ</strong></span>
              <span className="text-white/60">Công nợ còn lại: <strong className="text-rose-400">{remainingAmount.toLocaleString('vi-VN')}đ</strong></span>
            </div>
          </div>

          {/* 4. Điều Phối Ekip Photographer & Cảnh Báo Trùng Lịch */}
          <div className="space-y-3 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-orange-400" />
              Điều Phối Ekip & Tự Động Kiểm Tra Lịch Thợ
            </h3>

            <div>
              <label className="font-bold text-white/80">Photographer Chính (Lead)</label>
              <select
                value={formData.leadPhotographerId}
                onChange={e => setFormData({ ...formData, leadPhotographerId: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-semibold text-white cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                <option value="">-- Chưa gán thợ (Sẽ nhận cảnh báo) --</option>
                {photographers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} - {p.skills.join(', ')} ({p.ratePerShoot.toLocaleString('vi-VN')}đ)
                  </option>
                ))}
              </select>

              {/* Alert nếu thợ bị trùng lịch trong ngày */}
              {!photoAvailability.available && (
                <div className="mt-2.5 p-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-[11px] flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    ⚠️ CẢNH BÁO: Thợ này đã có lịch chụp đơn <strong>{photoAvailability.conflictBookingCode}</strong> trong ngày {formData.shootDate}!
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-white/70">Videographer / Flycam</label>
                <select
                  value={formData.videographerId}
                  onChange={e => setFormData({ ...formData, videographerId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                  <option value="">-- Không cần --</option>
                  {photographers.filter(p => p.skills.includes('Flycam') || p.skills.includes('Quay phim')).map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} (Flycam / Video)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-white/70">Nhân Viên Makeup</label>
                <select
                  value={formData.makeupStaffId}
                  onChange={e => setFormData({ ...formData, makeupStaffId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                  <option value="">-- Tự trang điểm --</option>
                  {photographers.filter(p => p.skills.includes('Makeup')).map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} (Makeup Artist)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="font-medium text-white/70">Ghi chú cho ekip</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Yêu cầu chuẩn bị trang phục dạ tiệc, bột màu, xe đưa đón..."
              className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 glass-btn-secondary rounded-xl font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 glass-btn-primary rounded-xl font-semibold"
            >
              Xác Nhận Tạo Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
