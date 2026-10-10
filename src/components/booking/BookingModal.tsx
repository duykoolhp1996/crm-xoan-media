import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, PaymentStatus, PipelineStage } from '../../types';
import { VIETNAM_LOCATIONS, getDistrictsByCity } from '../../data/vietnamLocations';
import { isCustomerInStage, getCustomerTotalOrderValue } from '../../lib/revenueUtils';
import {
  X,
  Calendar,
  Camera,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  School,
  UserCheck
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialCustomerId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialCustomerId
}) => {
  const {
    customers,
    servicePackages,
    photographers,
    addBooking,
    updateCustomer,
    addActivityLog,
    setActiveTab,
    getPhotographerAvailability
  } = useApp();

  // 1. Lọc Single Source of Truth: CHỈ các khách hàng đã cọc hoặc đã book ngày trong CRM
  const eligibleCustomers = useMemo(() => {
    return customers.filter(c => {
      if (c.pipelineStage === 'Lost' || c.isDeleted) return false;
      const isDepositedStage = isCustomerInStage(c.pipelineStage, 'Đã cọc');
      const isBookedStage = isCustomerInStage(c.pipelineStage, 'Book ngày');
      const hasRealDeposit = Number(c.depositAmount ?? 0) > 0 || Number(c.paidAmount ?? 0) > 0;
      return isDepositedStage || isBookedStage || hasRealDeposit;
    });
  }, [customers]);

  // Chọn khách hàng mặc định ban đầu
  const defaultSelectedCust = useMemo(() => {
    if (initialCustomerId) {
      const match = eligibleCustomers.find(c => c.id === initialCustomerId);
      if (match) return match;
    }
    return eligibleCustomers[0] || null;
  }, [eligibleCustomers, initialCustomerId]);

  const initialCity = defaultSelectedCust?.city || 'Hải Phòng';
  const initialDistricts = getDistrictsByCity(initialCity);
  const initialDistrict = defaultSelectedCust?.district || initialDistricts[0] || 'Lê Chân';

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerId: defaultSelectedCust?.id || '',
    shootDate: defaultSelectedCust?.expectedShootDate || initialDate || todayStr,
    startTime: defaultSelectedCust?.shootTime || '07:30',
    endTime: '17:00',
    city: initialCity,
    district: initialDistrict,
    location: '',
    studentCount: defaultSelectedCust?.studentCount || 35,
    packageId: defaultSelectedCust?.servicePackageId || servicePackages[0]?.id || '',
    depositAmount: Number(defaultSelectedCust?.depositAmount || defaultSelectedCust?.paidAmount || 0),
    leadPhotographerId: '',
    videographerId: '',
    makeupStaffId: '',
    notes: ''
  });

  // Đồng bộ lại formData khi mở modal hoặc danh sách khách hàng thay đổi
  useEffect(() => {
    if (isOpen) {
      const activeCust =
        (initialCustomerId && eligibleCustomers.find(c => c.id === initialCustomerId)) ||
        (formData.customerId && eligibleCustomers.find(c => c.id === formData.customerId)) ||
        eligibleCustomers[0];

      if (activeCust) {
        const city = activeCust.city || 'Hải Phòng';
        const districts = getDistrictsByCity(city);
        const district = activeCust.district || districts[0] || '';
        const loc = Array.isArray(activeCust.shootingLocations) && activeCust.shootingLocations.length > 0
          ? activeCust.shootingLocations.join(', ')
          : activeCust.shootAddress || activeCust.schoolName || '';

        setFormData(prev => ({
          ...prev,
          customerId: activeCust.id,
          shootDate: initialDate || activeCust.expectedShootDate || prev.shootDate || todayStr,
          city,
          district,
          location: loc,
          studentCount: activeCust.studentCount || prev.studentCount,
          packageId: activeCust.servicePackageId || servicePackages[0]?.id || '',
          depositAmount: Number(activeCust.depositAmount ?? activeCust.paidAmount ?? 0),
          notes: activeCust.specialRequests || activeCust.notes || ''
        }));
      }
    }
  }, [isOpen, initialCustomerId, eligibleCustomers]);

  if (!isOpen) return null;

  const availableDistricts = getDistrictsByCity(formData.city);

  const handleCustomerChange = (customerId: string) => {
    const cust = eligibleCustomers.find(c => c.id === customerId);
    if (cust) {
      const city = cust.city || formData.city || 'Hải Phòng';
      const districts = getDistrictsByCity(city);
      const district = cust.district || districts[0] || '';
      const loc = Array.isArray(cust.shootingLocations) && cust.shootingLocations.length > 0
        ? cust.shootingLocations.join(', ')
        : cust.shootAddress || cust.schoolName || '';

      const pkgMatch = servicePackages.find(
        p => p.id === cust.servicePackageId || (cust.servicePackageName && p.name.toLowerCase() === cust.servicePackageName.toLowerCase())
      );

      setFormData(prev => ({
        ...prev,
        customerId,
        city,
        district,
        studentCount: cust.studentCount || prev.studentCount,
        location: loc,
        packageId: pkgMatch?.id || prev.packageId,
        depositAmount: Number(cust.depositAmount ?? cust.paidAmount ?? prev.depositAmount),
        shootDate: cust.expectedShootDate || prev.shootDate,
        notes: cust.specialRequests || cust.notes || prev.notes
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

  const selectedCustomer = eligibleCustomers.find(c => c.id === formData.customerId) || eligibleCustomers[0];
  const selectedPackage = servicePackages.find(p => p.id === formData.packageId) || servicePackages[0];

  // Tính tổng giá trị dựa trên số học sinh và đơn giá gói
  const totalAmount = selectedCustomer
    ? getCustomerTotalOrderValue(selectedCustomer)
    : selectedPackage ? selectedPackage.price : 0;

  const remainingAmount = Math.max(0, totalAmount - formData.depositAmount);

  // Kiểm tra tình trạng sẵn sàng của thợ chính được chọn (Loại trừ chính đơn/lớp này)
  const photoAvailability = formData.leadPhotographerId
    ? getPhotographerAvailability(formData.leadPhotographerId, formData.shootDate, {
        excludeCustomerId: formData.customerId,
        excludeClassName: selectedCustomer?.className,
        excludeSchoolName: selectedCustomer?.schoolName
      })
    : { available: true, totalShootsOnDay: 0 };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Chưa có khách hàng hợp lệ ở trạng thái Đã cọc để tạo booking!');
      return;
    }

    if (!formData.shootDate) {
      alert('Vui lòng chọn ngày chụp cụ thể!');
      return;
    }

    const leadPhoto = photographers.find(p => p.id === formData.leadPhotographerId);
    const videoPhoto = photographers.find(p => p.id === formData.videographerId);
    const makeupStaff = photographers.find(p => p.id === formData.makeupStaffId);

    const paymentStatus: PaymentStatus =
      formData.depositAmount >= totalAmount
        ? 'Đã thanh toán đủ'
        : formData.depositAmount > 0
        ? 'Đã cọc'
        : 'Chưa cọc';

    const bookingStatus: BookingStatus = 'Đã đặt cọc';

    const currentYear = new Date().getFullYear();
    const bookingCode = `BK-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Tạo Booking liên kết chặt chẽ với khách hàng CRM
    addBooking({
      code: bookingCode,
      customerId: selectedCustomer.id,
      customerName: `${selectedCustomer.name} (${selectedCustomer.className ? `Lớp ${selectedCustomer.className}` : ''} - ${selectedCustomer.schoolName})`,
      schoolName: selectedCustomer.schoolName,
      className: selectedCustomer.className,
      shootDate: formData.shootDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      city: formData.city,
      district: formData.district,
      location: formData.location ? `${formData.location} (${formData.district}, ${formData.city})` : `${formData.district}, ${formData.city}`,
      studentCount: Number(formData.studentCount) || selectedCustomer.studentCount || 0,
      packageId: selectedPackage?.id || selectedCustomer.servicePackageId || '',
      packageName: selectedPackage?.name || selectedCustomer.servicePackageName || 'Gói Kỷ Yếu Chuẩn',
      concept: selectedCustomer.concept || '',
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

    // 2. BẮT BUỘC ĐỒNG BỘ 2 CHIỀU: Cập nhật khách hàng trong CRM sang trạng thái "Book ngày"
    updateCustomer({
      ...selectedCustomer,
      pipelineStage: 'Book ngày' as PipelineStage,
      expectedShootDate: formData.shootDate,
      shootingLocations: formData.location ? [formData.location] : selectedCustomer.shootingLocations,
      shootTime: formData.startTime,
      shootAddress: formData.location,
      depositAmount: Number(formData.depositAmount) || Number(selectedCustomer.depositAmount) || 0,
      paidAmount: Number(formData.depositAmount) || Number(selectedCustomer.paidAmount) || 0,
      remainingAmount,
      notes: `${selectedCustomer.notes ? selectedCustomer.notes + '\n' : ''}[${new Date().toLocaleDateString('vi-VN')}] Đã chốt đơn Booking ${bookingCode} chụp ngày ${formData.shootDate} (${formData.startTime} - ${formData.endTime}). Ekip: ${leadPhoto?.fullName || 'Chưa gán thợ chính'}.`.trim(),
      updatedAt: new Date().toISOString()
    });

    // 3. Ghi nhận Activity Log đầy đủ
    addActivityLog({
      customerId: selectedCustomer.id,
      type: 'booking_scheduled',
      title: 'Đã lên lịch chụp kỷ yếu',
      description: `Tạo thành công đơn Booking ${bookingCode} cho ${selectedCustomer.className ? `Lớp ${selectedCustomer.className}` : ''} - ${selectedCustomer.schoolName}. Lịch chụp: ${formData.shootDate} (${formData.startTime} - ${formData.endTime}). Pipeline CRM tự động chuyển sang "Book ngày". Thợ chính: ${leadPhoto?.fullName || 'Chưa gán'}.`,
      performedByName: 'Tạ Duy (Admin)'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-8 z-10 text-xs text-neutral-900">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Tạo Booking Lịch Chụp Kỷ Yếu Mới</h2>
              <p className="text-[11px] text-neutral-500">Liên kết trực tiếp 100% với dữ liệu CRM khách hàng đã đặt cọc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NẾU CHƯA CÓ LỚP NÀO ĐÃ CỌC: HIỂN THỊ CẢNH BÁO CHẶN DỮ LIỆU ẢO */}
        {eligibleCustomers.length === 0 ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-neutral-900">
                Chưa Có Lớp Nào Ở Trạng Thái ĐÃ CỌC Trên CRM!
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Theo quy chuẩn vận hành <strong>Xoăn Media</strong>: Đơn booking và lịch chụp chỉ được tạo cho các lớp đã chốt hợp đồng và <strong>đã đóng tiền cọc</strong> trong CRM để tránh dữ liệu ảo và sai lệch doanh thu.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-black/[0.06] rounded-2xl text-left text-xs space-y-2 max-w-lg mx-auto">
              <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Quy trình thực hiện chuẩn:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 pl-1">
                <li>Bước 1: Vào mục <strong>Lead Pipeline</strong> hoặc <strong>Khách hàng</strong>.</li>
                <li>Bước 2: Mở hồ sơ lớp hoặc kéo thẻ sang cột <strong>"Đã cọc"</strong> và xác nhận số tiền cọc.</li>
                <li>Bước 3: Quay lại đây để chọn lớp và lên lịch chụp chính thức cùng Ekip.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('pipeline');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
              >
                <span>Mở Lead Pipeline Để Chốt Cọc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* FORM TẠO BOOKING CHO KHÁCH HÀNG ĐỦ ĐIỀU KIỆN */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* 1. Chọn khách hàng đã cọc từ CRM */}
            <div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Chọn Lớp Đã Cọc Từ CRM *
                </label>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {eligibleCustomers.length} lớp đủ điều kiện lên lịch
                </span>
              </div>

              <select
                value={formData.customerId}
                onChange={e => handleCustomerChange(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 bg-neutral-50 border border-black/[0.08] text-neutral-900 font-semibold rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              >
                {eligibleCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.className ? `Lớp ${c.className}` : ''} - {c.schoolName} ({c.name} - {c.phone || 'SĐT: Chưa có'}) [Đã cọc: {(Number(c.depositAmount ?? c.paidAmount ?? 0)).toLocaleString('vi-VN')}đ]
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Card: Dữ liệu tự động kế thừa từ CRM */}
            {selectedCustomer && (
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lớp: <strong>{selectedCustomer.className || 'Chưa rõ'}</strong> - {selectedCustomer.schoolName}</span>
                  </p>
                  <p className="text-emerald-800 text-[11px]">
                    Đại diện: <strong>{selectedCustomer.name}</strong> • SĐT: <strong>{selectedCustomer.phone || 'Chưa cập nhật'}</strong> • Sĩ số: <strong>{selectedCustomer.studentCount || 0} học sinh</strong>
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] text-emerald-700 block">Số tiền cọc ghi nhận trên CRM:</span>
                  <span className="text-sm font-extrabold text-emerald-900">
                    {(Number(selectedCustomer.depositAmount ?? selectedCustomer.paidAmount ?? 0)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            )}

            {/* 2. Ngày giờ & Địa điểm */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Ngày Chụp *</label>
                <input
                  type="date"
                  required
                  value={formData.shootDate}
                  onChange={e => setFormData({ ...formData, shootDate: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-bold cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
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
                <label className="font-semibold text-neutral-700">Tiền Cọc Đã Nhận (đ)</label>
                <input
                  type="number"
                  step={100000}
                  value={formData.depositAmount}
                  onChange={e => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                  className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-emerald-600 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div className="sm:col-span-2 pt-2.5 border-t border-black/[0.06] flex justify-between text-xs">
                <span className="text-neutral-500">
                  Tổng giá trị hợp đồng: <strong className="text-neutral-900">{totalAmount.toLocaleString('vi-VN')}đ</strong>
                </span>
                <span className="text-neutral-500">
                  Công nợ còn lại: <strong className="text-rose-600">{remainingAmount.toLocaleString('vi-VN')}đ</strong>
                </span>
              </div>
            </div>

            {/* 4. Điều Phối Ekip Photographer & Cảnh Báo Trùng Lịch */}
            <div className="space-y-3 p-4 bg-[#B8F23D]/15 rounded-2xl border border-[#B8F23D]/30">
              <h3 className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-neutral-800" />
                Điều Phối Ekip & Tự Động Kiểm Tra Trùng Lịch Thợ
              </h3>

              <div>
                <label className="font-semibold text-neutral-700">Photographer Chính (Lead)</label>
                <select
                  value={formData.leadPhotographerId}
                  onChange={e => setFormData({ ...formData, leadPhotographerId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                >
                  <option value="">-- Chưa gán thợ (Hệ thống sẽ gửi cảnh báo) --</option>
                  {photographers.map(p => {
                    const isBusy = formData.shootDate
                      ? !getPhotographerAvailability(p.id, formData.shootDate, {
                          excludeCustomerId: formData.customerId,
                          excludeClassName: selectedCustomer?.className,
                          excludeSchoolName: selectedCustomer?.schoolName
                        }).available
                      : false;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.fullName} - {p.skills.join(', ')} ({p.ratePerShoot.toLocaleString('vi-VN')}đ) {isBusy ? '⚠️ [Trùng lịch đơn khác]' : ''}
                      </option>
                    );
                  })}
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
                className="px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] active:scale-95"
              >
                Xác Nhận Tạo Booking & Đồng Bộ CRM
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
