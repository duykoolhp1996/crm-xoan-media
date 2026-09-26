import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeadSource, PipelineStage } from '../../types';
import { VIETNAM_LOCATIONS, getDistrictsByCity } from '../../data/vietnamLocations';
import { X, Sparkles, User, School, Calendar, DollarSign, Tag, MapPin, Headphones, UserCheck, Globe, Layers, AlertTriangle, AlertCircle } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer, schools, servicePackages, salesStaff, currentUser, customers } = useApp();

  // Tự động gán Sales là chính mình nếu user đang đăng nhập có vai trò Sales
  const initialSalesName = currentUser.role === 'sales' ? currentUser.name : 'Chưa gán';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    facebook: '',
    zalo: '',
    schoolName: schools[0]?.name || 'THPT Chuyên Trần Phú (Hải Phòng)',
    grade: 'Khối 12',
    className: '',
    academicYear: '2025-2026',
    city: 'Hải Phòng',
    district: 'Lê Chân',
    region: 'Lê Chân, Hải Phòng',
    representativeRole: 'Lớp trưởng',
    studentCount: 35,
    serviceType: 'Kỷ yếu Concept',
    servicePackageId: servicePackages[1]?.id || '',
    concept: 'Thanh xuân vườn trường',
    expectedShootDate: '',
    shootingLocations: 'Trường học & Nhà Hát Lớn / Bãi biển Đồ Sơn',
    expectedBudget: 7000000,
    specialRequests: '',
    notes: '',
    source: 'Facebook Ads' as LeadSource,
    campaignName: 'Mùa_Kỷ_Yếu_2026',
    utmSource: 'facebook',
    utmMedium: 'cpc',
    utmCampaign: 'lead_form_kyyeu',
    pipelineStage: 'New Lead' as PipelineStage,
    assignedSalesName: initialSalesName,
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

  // Chuẩn hóa số điện thoại để kiểm tra trùng
  const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '');

  const cleanInputPhone = cleanPhone(formData.phone);
  const duplicateCustomer = cleanInputPhone.length >= 8
    ? (customers || []).find(c => {
        const cPhone = cleanPhone(c.phone);
        const cZalo = cleanPhone(c.zalo);
        return (cPhone && cPhone === cleanInputPhone) || (cZalo && cZalo === cleanInputPhone);
      })
    : null;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.className) {
      alert('Vui lòng điền đầy đủ Tên, Số điện thoại và Tên lớp!');
      return;
    }

    if (duplicateCustomer) {
      alert(
        `⚠️ SỐ ĐIỆN THOẠI ĐÃ BỊ TRÙNG!\n\n` +
        `Số điện thoại "${formData.phone}" đã tồn tại trên hệ thống với thông tin:\n` +
        `• Khách hàng: ${duplicateCustomer.name}\n` +
        `• Lớp / Trường: ${duplicateCustomer.className} - ${duplicateCustomer.schoolName}\n` +
        `• Sales phụ trách: ${duplicateCustomer.assignedSalesName || 'Chưa gán'}\n` +
        `• Trạng thái: ${duplicateCustomer.pipelineStage}\n\n` +
        `Vui lòng kiểm tra lại để tránh trùng lặp lead!`
      );
      return;
    }

    const selectedPkg = servicePackages.find(p => p.id === formData.servicePackageId);

    let salesName = formData.assignedSalesName;
    if ((!salesName || salesName === 'Chưa gán') && currentUser.role === 'sales') {
      salesName = currentUser.name;
    } else if (formData.pipelineStage !== 'New Lead' && salesName === 'Chưa gán') {
      salesName = currentUser.role === 'sales' ? currentUser.name : (salesStaff[0]?.name || 'Lê Hoàng Sơn (Sales Lead)');
    }
    const matchedSales = salesStaff.find(s => s.name === salesName);
    const salesId = matchedSales?.id || (salesName === currentUser.name ? currentUser.id : '');

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
      assignedSalesId: salesId,
      assignedSalesName: salesName,
      assignedCareStaffName: formData.assignedCareStaffName,
      createdById: currentUser.id,
      createdByName: currentUser.name
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
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-neutral-700">Số điện thoại *</label>
                  {duplicateCustomer && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      Đã trùng SĐT
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  placeholder="0912..."
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 bg-neutral-50 border text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    duplicateCustomer
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/40 text-rose-900 font-medium'
                      : 'border-black/[0.08] focus:ring-[#B8F23D]'
                  }`}
                />
                {duplicateCustomer && (
                  <div className="mt-1.5 p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-[11px] space-y-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1 font-bold text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Số điện thoại đã tồn tại trên CRM!</span>
                    </div>
                    <div className="pl-4 space-y-0.5 text-neutral-700 text-[10.5px]">
                      <p>• Khách hàng: <strong className="text-rose-900">{duplicateCustomer.name}</strong> ({duplicateCustomer.className} - {duplicateCustomer.schoolName})</p>
                      <p>• Sales phụ trách: <strong className="text-neutral-900">{duplicateCustomer.assignedSalesName || 'Chưa gán'}</strong></p>
                      <p>• Trạng thái: <span className="px-1.5 py-0.2 bg-white rounded border border-rose-200 text-rose-800 font-medium">{duplicateCustomer.pipelineStage}</span></p>
                    </div>
                  </div>
                )}
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

          {/* Section 4: Nguồn Tiếp Cận & Phân Bổ Nhân Sự */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2 text-xs">
                <Tag className="w-4 h-4 text-emerald-600" /> 
                4. Nguồn Tiếp Cận & Phân Bổ Nhân Sự (Sales & CSKH)
              </h3>
              <span className="text-[10px] text-neutral-500 font-medium">Mùa Kỷ Yếu 2026</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card 1: Kênh Nguồn & Chiến Dịch */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-black/[0.06] space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 pb-1.5 border-b border-black/[0.04]">
                  <Globe className="w-3.5 h-3.5 text-sky-600" /> Kênh Tiếp Cận & Marketing
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Kênh nguồn *</label>
                    <select
                      value={formData.source}
                      onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                      className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs"
                    >
                      <option value="Facebook Ads">Facebook Ads</option>
                      <option value="Facebook Organic">Facebook Organic</option>
                      <option value="TikTok Ads">TikTok Ads</option>
                      <option value="TikTok">TikTok Tự Nhiên</option>
                      <option value="Zalo">Zalo OA / Chatbot</option>
                      <option value="Website">Website Form</option>
                      <option value="Google">Google Search</option>
                      <option value="Referral">Học sinh / Thợ giới thiệu</option>
                      <option value="Khách hàng cũ">Khách hàng cũ quay lại</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Tên chiến dịch</label>
                    <input
                      type="text"
                      value={formData.campaignName}
                      onChange={e => setFormData({ ...formData, campaignName: e.target.value })}
                      placeholder="Mùa_Kỷ_Yếu_2026"
                      className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-neutral-900 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-semibold text-neutral-700 block mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" /> Trạng thái ban đầu trên Pipeline
                  </label>
                  <select
                    value={formData.pipelineStage}
                    onChange={e => setFormData({ ...formData, pipelineStage: e.target.value as PipelineStage })}
                    className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs"
                  >
                    <option value="New Lead">1. New Lead (Mới tiếp nhận)</option>
                    <option value="Đã liên hệ">2. Đã liên hệ</option>
                    <option value="Đang tư vấn">3. Đang tư vấn concept</option>
                    <option value="Đã gửi báo giá">4. Đã gửi báo giá</option>
                    <option value="Đã đặt cọc">6. Đã đặt cọc</option>
                  </select>
                </div>
              </div>

              {/* Card 2: Phân Bổ Nhân Sự Sales & CSKH */}
              <div className="p-4 bg-neutral-50/80 rounded-2xl border border-black/[0.06] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.04]">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Phân Bổ Nhân Sự Phụ Trách
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    Auto Round-Robin
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Sales Tư Vấn Phụ Trách
                  </label>
                  <select
                    value={formData.assignedSalesName}
                    onChange={e => setFormData({ ...formData, assignedSalesName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs"
                  >
                    <option value="Chưa gán">Chưa gán (Tự động chia vòng tròn khi liên hệ)</option>
                    {salesStaff.map((staff) => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name} — {staff.roleTitle}
                      </option>
                    ))}
                    {currentUser.role === 'sales' && !salesStaff.some(s => s.name === currentUser.name) && (
                      <option value={currentUser.name}>{currentUser.name}</option>
                    )}
                  </select>
                  <p className="text-[10px] text-neutral-400 pt-0.5">
                    💡 Khi chuyển sang <em>"Đã liên hệ"</em>, hệ thống sẽ tự động chỉ định Sales trực theo ca.
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <label className="font-semibold text-neutral-700 flex items-center gap-1.5 mb-1">
                    <Headphones className="w-3.5 h-3.5 text-purple-600" /> Chuyên Viên CSKH & Hợp Đồng
                  </label>
                  <select
                    value={formData.assignedCareStaffName}
                    onChange={e => setFormData({ ...formData, assignedCareStaffName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-neutral-900 rounded-xl font-medium cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D] transition-all shadow-2xs"
                  >
                    <option value="Phạm Quỳnh Nga (CSKH)">Phạm Quỳnh Nga (CSKH & Hợp đồng)</option>
                    <option value="Nguyễn Thu Hương (CSKH)">Nguyễn Thu Hương (CSKH)</option>
                    <option value="Đặng Mai Linh (Tư vấn & CSKH)">Đặng Mai Linh (Tư vấn & CSKH)</option>
                    <option value="Admin Xoăn Media">Admin Xoăn Media</option>
                  </select>
                </div>
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
