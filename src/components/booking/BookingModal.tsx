import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, PaymentStatus } from '../../types';
import { VIETNAM_LOCATIONS, getDistrictsByCity } from '../../data/vietnamLocations';
import { X, Calendar, Camera, AlertTriangle, MapPin } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialDate }) => {
  const { customers, servicePackages, photographers, addBooking, getPhotographerAvailability } = useApp();

  const initialCustomer = customers[0];
  const initialCity = initialCustomer?.city || 'Hải Phòng';
  const initialDistricts = getDistrictsByCity(initialCity);
  const initialDistrict = initialCustomer?.district || initialDistricts[0] || 'Lê Chân';

  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    customerId: initialCustomer?.id || '',
    shootDate: initialDate || todayStr,
    startTime: '08:00',
    endTime: '17:00',
    city: initialCity,
    district: initialDistrict,
    location: '',
    studentCount: 0,
    packageId: servicePackages[0]?.id || '',
    depositAmount: 0,
    leadPhotographerId: '',
    videographerId: '',
    makeupStaffId: '',
    notes: ''
  });

  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({ ...prev, shootDate: initialDate }));
    }
  }, [initialDate, isOpen]);

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
        district,
        studentCount: cust.studentCount || prev.studentCount,
        location: Array.isArray(cust.shootingLocations) ? cust.shootingLocations.join(', ') : (cust.shootingLocations || prev.location)
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
  const totalAmount = selectedPackage ? selectedPackage.price : 0;
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

    const currentYear = new Date().getFullYear();
    addBooking({
      code: `BK-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
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
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-8 z-10 text-xs text-neutral-900">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50/70 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Tạo Booking Lịch Chụp Kỷ Yếu Mới</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* 1. Chọn khách hàng / lớp */}
          <div>
            <label className="font-semibold text-neutral-700">Chọn Lớp / Khách Hàng *</label>
            {customers.length === 0 ? (
              <div className="mt-1.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                ⚠️ <strong>Chưa có lớp nào trong hệ thống!</strong> Vui lòng vào mục <strong>Khách hàng / Leads</strong> hoặc <strong>Pipeline</strong> để thêm lớp mới trước khi tạo booking.
              </div>
            ) : (
              <select
                value={formData.customerId}
                onChange={e => handleCustomerChange(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.className} - {c.schoolName} ({c.name} - {c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Ngày giờ & Địa điểm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-700">Ngày Chụp *</label>
              <input
                type="date"
                required
                value={formData.shootDate}
                onChange={e => setFormData({ ...formData, shootDate: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-semibold cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700">Giờ Bắt Đầu</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700">Giờ Kết Thúc</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>
          </div>

          {/* Khu vực chụp: Thành phố và Quận/Huyện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>Tỉnh / Thành Phố Chụp</span>
              </label>
              <select
                value={formData.city}
                onChange={e => handleCityChange(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              >
                {VIETNAM_LOCATIONS.map(loc => (
                  <option key={loc.city} value={loc.city}>
                    {loc.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                <span>Quận / Huyện</span>
                <span className="text-[10px] text-neutral-400">({formData.city})</span>
              </label>
              <select
                value={formData.district}
                onChange={e => handleDistrictChange(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
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
            <label className="font-semibold text-neutral-700">Địa Điểm Chụp Cụ Thể</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              placeholder="VD: Trường Amsterdam, Văn Miếu, Phim trường Santorini..."
              className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>

          {/* 3. Gói Dịch Vụ & Tiền Cọc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-2xl border border-black/[0.06]">
            <div>
              <label className="font-semibold text-neutral-700">Gói Dịch Vụ Kỷ Yếu</label>
              <select
                value={formData.packageId}
                onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              >
                {servicePackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.price.toLocaleString('vi-VN')}đ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700">Tiền Cọc Thu Trước (đ)</label>
              <input
                type="number"
                step={500000}
                value={formData.depositAmount}
                onChange={e => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-emerald-600 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

            <div className="sm:col-span-2 pt-2.5 border-t border-black/[0.06] flex justify-between text-xs">
              <span className="text-neutral-500">Tổng giá trị đơn: <strong className="text-neutral-900">{totalAmount.toLocaleString('vi-VN')}đ</strong></span>
              <span className="text-neutral-500">Công nợ còn lại: <strong className="text-rose-600">{remainingAmount.toLocaleString('vi-VN')}đ</strong></span>
            </div>
          </div>

          {/* 4. Điều Phối Ekip Photographer & Cảnh Báo Trùng Lịch */}
          <div className="space-y-3 p-4 bg-[#B8F23D]/15 rounded-2xl border border-[#B8F23D]/30">
            <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-neutral-800" />
              Điều Phối Ekip & Tự Động Kiểm Tra Lịch Thợ
            </h3>

            <div>
              <label className="font-semibold text-neutral-700">Photographer Chính (Lead)</label>
              <select
                value={formData.leadPhotographerId}
                onChange={e => setFormData({ ...formData, leadPhotographerId: e.target.value })}
                className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
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
                <div className="mt-2.5 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-[11px] flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    ⚠️ CẢNH BÁO: Thợ này đã có lịch chụp đơn <strong>{photoAvailability.conflictBookingCode}</strong> trong ngày {formData.shootDate}!
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Videographer / Flycam</label>
                <select
                  value={formData.videographerId}
                  onChange={e => setFormData({ ...formData, videographerId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                >
                  <option value="">-- Không cần --</option>
                  {photographers.filter(p => p.skills.includes('Flycam') || p.skills.includes('Quay phim')).map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} (Flycam / Video)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Nhân Viên Makeup</label>
                <select
                  value={formData.makeupStaffId}
                  onChange={e => setFormData({ ...formData, makeupStaffId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
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
            <label className="font-semibold text-neutral-700">Ghi chú cho ekip</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Yêu cầu chuẩn bị trang phục dạ tiệc, bột màu, xe đưa đón..."
              className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-black/[0.06] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={customers.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all ${
                customers.length === 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] active:scale-95'
              }`}
            >
              Xác Nhận Tạo Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
