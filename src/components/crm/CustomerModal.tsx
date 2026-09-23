import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeadSource, PipelineStage } from '../../types';
import { VIETNAM_LOCATIONS, getDistrictsByCity } from '../../data/vietnamLocations';
import { X, Sparkles, User, School, Calendar, DollarSign, Tag, MapPin, Headphones } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer, schools, servicePackages, currentUser } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    facebook: '',
    zalo: '',
    schoolName: schools[0]?.name || 'THPT Chuyên Hà Nội - Amsterdam',
    grade: 'Khối 12',
    className: '',
    academicYear: '2024-2025',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    region: 'Cầu Giấy, Hà Nội',
    representativeRole: 'Lớp trưởng',
    studentCount: 35,
    serviceType: 'Kỷ yếu Concept',
    servicePackageId: servicePackages[1]?.id || '',
    concept: 'Thanh xuân vườn trường',
    expectedShootDate: '',
    shootingLocations: 'Trường học, Văn Miếu',
    expectedBudget: 7000000,
    specialRequests: '',
    notes: '',
    source: 'Facebook Ads' as LeadSource,
    campaignName: 'Mùa_Kỷ_Yếu_2024',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'lead_form_kyyeu',
    pipelineStage: 'New Lead' as PipelineStage,
    assignedCareStaffName: 'Phạm Quỳnh Nga (CSKH)'
  });

  const availableDistricts = getDistrictsByCity(formData.city);

  const handleCityChange = (cityName: string) => {
    const districts = getDistrictsByCity(cityName);
    const firstDistrict = districts[0] || '';
    setFormData(prev => ({
      ...prev,
      city: cityName,
      district: firstDistrict,
      region: firstDistrict ? `${firstDistrict}, ${cityName}` : cityName
    }));
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData(prev => ({
      ...prev,
      district: districtName,
      region: districtName ? `${districtName}, ${prev.city}` : prev.city
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.className) {
      alert('Vui lòng điền đầy đủ Tên, Số điện thoại và Tên lớp!');
      return;
    }

    const selectedPkg = servicePackages.find(p => p.id === formData.servicePackageId);

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      facebook: formData.facebook,
      zalo: formData.zalo || formData.phone,
      schoolName: formData.schoolName,
      grade: formData.grade,
      className: formData.className,
      academicYear: formData.academicYear,
      city: formData.city,
      district: formData.district,
      region: formData.region || (formData.district ? `${formData.district}, ${formData.city}` : formData.city),
      representativeRole: formData.representativeRole,
      studentCount: Number(formData.studentCount),
      serviceType: formData.serviceType,
      servicePackageId: formData.servicePackageId,
      servicePackageName: selectedPkg?.name || 'Gói Tùy Chọn',
      concept: formData.concept,
      expectedShootDate: formData.expectedShootDate,
      shootingLocations: formData.shootingLocations.split(',').map(s => s.trim()),
      expectedBudget: Number(formData.expectedBudget),
      specialRequests: formData.specialRequests,
      notes: formData.notes,
      source: formData.source,
      campaignName: formData.campaignName,
      utm: {
        source: formData.utmSource,
        medium: formData.utmMedium,
        campaign: formData.utmCampaign
      },
      pipelineStage: formData.pipelineStage,
      assignedSalesId: currentUser.id,
      assignedSalesName: currentUser.name,
      assignedCareStaffName: formData.assignedCareStaffName
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-8 text-neutral-900">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-neutral-900">
              Thêm Mới Lead / Khách Hàng Kỷ Yếu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs custom-scrollbar">
          {/* Section 1: Người Đại Diện & Liên Hệ */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <User className="w-4 h-4 text-neutral-700" /> 1. Thông Tin Người Đại Diện
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Họ & Tên khách *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Vũ Thùy Linh"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="0912..."
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Vai trò trong lớp</label>
                <select
                  value={formData.representativeRole}
                  onChange={e => setFormData({ ...formData, representativeRole: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Lớp trưởng">Lớp trưởng</option>
                  <option value="Bí thư">Bí thư</option>
                  <option value="Lớp phó phong trào">Lớp phó phong trào</option>
                  <option value="Trưởng ban phụ huynh">Trưởng ban phụ huynh</option>
                  <option value="Thành viên ban kỷ yếu">Thành viên ban kỷ yếu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Link Facebook</label>
                <input
                  type="text"
                  placeholder="fb.com/..."
                  value={formData.facebook}
                  onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Số Zalo</label>
                <input
                  type="text"
                  placeholder="Nếu khác SĐT"
                  value={formData.zalo}
                  onChange={e => setFormData({ ...formData, zalo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Email</label>
                <input
                  type="email"
                  placeholder="email@..."
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trường & Lớp */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <School className="w-4 h-4 text-neutral-700" /> 2. Thông Tin Trường & Lớp Học
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-neutral-700">Trường học</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Tên trường..."
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Tên Lớp *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 12A1, 9B..."
                  value={formData.className}
                  onChange={e => setFormData({ ...formData, className: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Sĩ số (Học sinh)</label>
                <input
                  type="number"
                  min={10}
                  value={formData.studentCount}
                  onChange={e => setFormData({ ...formData, studentCount: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Khối lớp</label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Khối 12">Khối 12 (THPT ra trường)</option>
                  <option value="Khối 9">Khối 9 (THCS lên cấp 3)</option>
                  <option value="Khối 5">Khối 5 (Tiểu học)</option>
                  <option value="Đại học">Đại học năm cuối</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Niên khóa</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  Tỉnh / Thành phố
                </label>
                <select
                  value={formData.city}
                  onChange={e => handleCityChange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  {VIETNAM_LOCATIONS.map(loc => (
                    <option key={loc.city} value={loc.city}>
                      {loc.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700 flex items-center gap-1">
                  <span>Quận / Huyện</span>
                  <span className="text-[10px] text-neutral-400">({formData.city})</span>
                </label>
                <select
                  value={formData.district}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Nhu Cầu Gói Chụp & Concept */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <Calendar className="w-4 h-4 text-neutral-700" /> 3. Nhu Cầu Kỷ Yếu & Concept
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Gói Kỷ Yếu Quan Tâm</label>
                <select
                  value={formData.servicePackageId}
                  onChange={e => setFormData({ ...formData, servicePackageId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  {servicePackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.price.toLocaleString('vi-VN')}đ)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Concept yêu thích</label>
                <input
                  type="text"
                  placeholder="Retro 90s, Cổ phục, Dạ tiệc..."
                  value={formData.concept}
                  onChange={e => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Ngân sách dự kiến (đ)</label>
                <input
                  type="number"
                  step={500000}
                  value={formData.expectedBudget}
                  onChange={e => setFormData({ ...formData, expectedBudget: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Ngày dự kiến chụp</label>
                <input
                  type="date"
                  value={formData.expectedShootDate}
                  onChange={e => setFormData({ ...formData, expectedShootDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Địa điểm dự kiến</label>
                <input
                  type="text"
                  placeholder="Trường học, Hoàng Thành, Văn Miếu..."
                  value={formData.shootingLocations}
                  onChange={e => setFormData({ ...formData, shootingLocations: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Nguồn Tiếp Cận & Nhân Sự CSKH */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-2 text-[11px]">
              <Tag className="w-4 h-4 text-neutral-700" /> 4. Nguồn Tiếp Cận & Phân Bổ CSKH
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-neutral-700">Kênh nguồn *</label>
                <select
                  value={formData.source}
                  onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-semibold cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Facebook Organic">Facebook Organic</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="TikTok">TikTok Tự Nhiên</option>
                  <option value="Website">Website Form</option>
                  <option value="Google">Google Search</option>
                  <option value="Referral">Học sinh / Thợ giới thiệu</option>
                  <option value="Khách hàng cũ">Khách hàng cũ quay lại</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Tên chiến dịch</label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={e => setFormData({ ...formData, campaignName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Trạng thái ban đầu</label>
                <select
                  value={formData.pipelineStage}
                  onChange={e => setFormData({ ...formData, pipelineStage: e.target.value as PipelineStage })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="New Lead">1. New Lead (Mới)</option>
                  <option value="Đang tư vấn">3. Đang tư vấn</option>
                  <option value="Đã gửi báo giá">4. Đã gửi báo giá</option>
                  <option value="Đã đặt cọc">6. Đã đặt cọc</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-neutral-700 flex items-center gap-1">
                  <Headphones className="w-3.5 h-3.5 text-neutral-600" />
                  Ô CSKH Phụ Trách
                </label>
                <select
                  value={formData.assignedCareStaffName}
                  onChange={e => setFormData({ ...formData, assignedCareStaffName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-semibold cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Phạm Quỳnh Nga (CSKH)">Phạm Quỳnh Nga (CSKH)</option>
                  <option value="Nguyễn Thu Hương (CSKH)">Nguyễn Thu Hương (CSKH)</option>
                  <option value="Đặng Mai Linh (Tư vấn & CSKH)">Đặng Mai Linh (Tư vấn & CSKH)</option>
                  <option value="Admin Xoắn Media">Admin Xoắn Media</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
              Lưu Khách Hàng Vào Hệ Thống
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
