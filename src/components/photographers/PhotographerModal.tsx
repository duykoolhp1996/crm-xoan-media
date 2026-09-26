import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Photographer, PhotographerSkill, PhotographerStatus } from '../../types';
import { VIETNAM_LOCATIONS } from '../../data/vietnamLocations';
import {
  X,
  Camera,
  Phone,
  Mail,
  User,
  MapPin,
  DollarSign,
  Award,
  Layers,
  FileText,
  Check,
  Trash2,
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface PhotographerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographerToEdit?: Photographer | null;
}

const AVAILABLE_SKILLS: PhotographerSkill[] = [
  'Chụp chính',
  'Chụp phụ',
  'Flycam',
  'Quay phim',
  'Makeup',
  'Chỉnh màu (Colorist)'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
];

export const PhotographerModal: React.FC<PhotographerModalProps> = ({
  isOpen,
  onClose,
  photographerToEdit
}) => {
  const { addPhotographer, updatePhotographer, deletePhotographer } = useApp();

  const isEditMode = Boolean(photographerToEdit);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatar: PRESET_AVATARS[0],
    photographerType: 'Freelancer' as 'Full-time' | 'Freelancer' | 'Đối tác Studio',
    experienceYears: 3,
    status: 'available' as PhotographerStatus,
    salaryType: 'per_shoot' as 'per_shoot' | 'monthly',
    monthlySalary: 10000000,
    ratePerShoot: 1000000,
    skills: ['Chụp chính'] as PhotographerSkill[],
    activeRegions: ['Hải Phòng'] as string[],
    equipmentListText: 'Sony A7IV, Lens 24-70 f2.8 GM',
    notes: '',
    username: '',
    password: '',
    canLogin: true
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let result = 'Photo@';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: result }));
  };

  // Format số tiền thành chữ tóm tắt dễ đọc (VD: 10 triệu VNĐ)
  const toVnMoneyText = (amount: number) => {
    if (!amount || amount <= 0) return '0 VNĐ';
    if (amount >= 1000000) {
      const m = amount / 1000000;
      return `≈ ${m % 1 === 0 ? m : m.toFixed(1)} triệu đồng`;
    }
    if (amount >= 1000) {
      const k = amount / 1000;
      return `≈ ${k % 1 === 0 ? k : k.toFixed(0)} nghìn đồng`;
    }
    return `≈ ${amount.toLocaleString('vi-VN')} VNĐ`;
  };

  // Xử lý nhập tiền tệ có format dấu chấm phân cách hàng nghìn
  const handleMoneyChange = (field: 'monthlySalary' | 'ratePerShoot', rawVal: string) => {
    const digitsOnly = rawVal.replace(/\D/g, '');
    const num = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    setFormData(prev => ({ ...prev, [field]: num }));
  };

  useEffect(() => {
    if (photographerToEdit) {
      setFormData({
        fullName: photographerToEdit.fullName,
        phone: photographerToEdit.phone,
        email: photographerToEdit.email,
        avatar: photographerToEdit.avatar || PRESET_AVATARS[0],
        photographerType: photographerToEdit.photographerType,
        experienceYears: photographerToEdit.experienceYears,
        status: photographerToEdit.status,
        salaryType: photographerToEdit.salaryType || (photographerToEdit.photographerType === 'Full-time' ? 'monthly' : 'per_shoot'),
        monthlySalary: photographerToEdit.monthlySalary || 10000000,
        ratePerShoot: photographerToEdit.ratePerShoot,
        skills: photographerToEdit.skills || [],
        activeRegions: photographerToEdit.activeRegions || ['Hải Phòng'],
        equipmentListText: photographerToEdit.equipmentList?.join(', ') || '',
        notes: photographerToEdit.notes || '',
        username: photographerToEdit.username || photographerToEdit.email || '',
        password: photographerToEdit.password || 'PhotoXoan@2024',
        canLogin: photographerToEdit.canLogin ?? true
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        avatar: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
        photographerType: 'Freelancer',
        experienceYears: 3,
        status: 'available',
        salaryType: 'per_shoot',
        monthlySalary: 10000000,
        ratePerShoot: 1000000,
        skills: ['Chụp chính'],
        activeRegions: ['Hải Phòng'],
        equipmentListText: '',
        notes: '',
        username: '',
        password: 'PhotoXoan@2024',
        canLogin: true
      });
    }
  }, [photographerToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleSkill = (skill: PhotographerSkill) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      const newSkills = exists
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
  };

  const toggleRegion = (cityName: string) => {
    setFormData(prev => {
      const exists = prev.activeRegions.includes(cityName);
      const newRegions = exists
        ? prev.activeRegions.filter(r => r !== cityName)
        : [...prev.activeRegions, cityName];
      return { ...prev, activeRegions: newRegions.length > 0 ? newRegions : [cityName] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên nhân sự ekip!');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Vui lòng nhập số điện thoại liên hệ!');
      return;
    }

    const equipmentList = formData.equipmentListText
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const finalEmail = formData.email.trim() || `${formData.phone.trim()}@xoanmedia.vn`;
    const finalUsername = formData.username.trim() || finalEmail;
    const finalPassword = formData.password.trim() || 'PhotoXoan@2024';

    if (isEditMode && photographerToEdit) {
      updatePhotographer({
        ...photographerToEdit,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: finalEmail,
        avatar: formData.avatar,
        photographerType: formData.photographerType,
        experienceYears: Number(formData.experienceYears) || 1,
        status: formData.status,
        salaryType: formData.salaryType,
        monthlySalary: Number(formData.monthlySalary) || 0,
        ratePerShoot: Number(formData.ratePerShoot) || 0,
        skills: formData.skills,
        activeRegions: formData.activeRegions,
        equipmentList,
        notes: formData.notes.trim(),
        username: finalUsername,
        password: finalPassword,
        canLogin: formData.canLogin
      });
    } else {
      addPhotographer({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: finalEmail,
        avatar: formData.avatar,
        photographerType: formData.photographerType,
        experienceYears: Number(formData.experienceYears) || 1,
        status: formData.status,
        salaryType: formData.salaryType,
        monthlySalary: Number(formData.monthlySalary) || 0,
        ratePerShoot: Number(formData.ratePerShoot) || 0,
        skills: formData.skills,
        activeRegions: formData.activeRegions,
        equipmentList,
        notes: formData.notes.trim(),
        username: finalUsername,
        password: finalPassword,
        canLogin: formData.canLogin
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white border border-black/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-neutral-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                {isEditMode ? 'Chỉnh Sửa Hồ Sơ Thợ / Nhân Sự Ekip' : 'Thêm Nhân Sự Ekip Chụp Mới'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEditMode
                  ? `Cập nhật thông tin chuyên môn, trang thiết bị và đơn giá cho ${photographerToEdit?.fullName}`
                  : 'Khai báo thợ chụp, quay phim, flycam hoặc chuyên viên makeup vào hệ thống Xoăn Media'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
          {/* Row 1: Họ tên & SĐT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                Họ và Tên Nhân Sự <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn Nam (Kenji)"
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Số Điện Thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="VD: 0988123456"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>
          </div>

          {/* Row 2: Email & Hình thức hợp tác */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                Email
              </label>
              <input
                type="email"
                placeholder="VD: nam.photo@xoanmedia.vn"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                Hình Thức Hợp Tác
              </label>
              <select
                value={formData.photographerType}
                onChange={e => setFormData(prev => ({ ...prev, photographerType: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              >
                <option value="Full-time">Full-time (Nhân sự chính thức Xoăn Media)</option>
                <option value="Freelancer">Freelancer (Thợ tự do nhận ca linh hoạt)</option>
                <option value="Đối tác Studio">Đối tác Studio (Studio / Team liên kết ngoài)</option>
              </select>
            </div>
          </div>

          {/* Khối Cấu Hình Lương (Admin Setup) — 2 loại: Lương Tháng hoặc Theo Buổi Chụp */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                Cơ Chế & Chính Sách Lương (Admin Cấu Hình)
              </label>
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {formData.salaryType === 'monthly' ? '📅 Lương Tháng' : '📸 Theo Buổi Chụp'}
              </span>
            </div>

            {/* Chọn Loại Lương: 2 Loại */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, salaryType: 'monthly' }))}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  formData.salaryType === 'monthly'
                    ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-700 border-black/[0.08] hover:bg-neutral-100'
                }`}
              >
                📅 1. Lương Tháng Cố Định
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, salaryType: 'per_shoot' }))}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                  formData.salaryType === 'per_shoot'
                    ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-700 border-black/[0.08] hover:bg-neutral-100'
                }`}
              >
                📸 2. Theo Buổi Chụp (Ca)
              </button>
            </div>

            {/* Input số tiền tương ứng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {formData.salaryType === 'monthly' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-800">
                      Mức Lương Tháng Cố Định
                    </label>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {toVnMoneyText(formData.monthlySalary)}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={(formData.monthlySalary || 0).toLocaleString('vi-VN')}
                      onChange={e => handleMoneyChange('monthlySalary', e.target.value)}
                      className="w-full pl-3.5 pr-14 py-2.5 bg-white border-2 border-emerald-300 rounded-xl text-neutral-900 font-black text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-tight"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg pointer-events-none">
                      VNĐ/tháng
                    </span>
                  </div>

                  {/* Nút chọn nhanh mức lương tháng */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-neutral-400 font-medium">Chọn nhanh:</span>
                    {[8000000, 10000000, 12000000, 15000000, 18000000, 20000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, monthlySalary: val }))}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                          formData.monthlySalary === val
                            ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-2xs'
                            : 'bg-white text-neutral-700 border-black/[0.08] hover:bg-neutral-100'
                        }`}
                      >
                        {val / 1000000} Triệu
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Chi trả cố định hàng tháng cho thợ Full-time / Quản lý ekip
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-800">
                      Thù Lao / Buổi Chụp
                    </label>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {toVnMoneyText(formData.ratePerShoot)}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={(formData.ratePerShoot || 0).toLocaleString('vi-VN')}
                      onChange={e => handleMoneyChange('ratePerShoot', e.target.value)}
                      className="w-full pl-3.5 pr-14 py-2.5 bg-white border-2 border-emerald-300 rounded-xl text-neutral-900 font-black text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-tight"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg pointer-events-none">
                      VNĐ/buổi
                    </span>
                  </div>

                  {/* Nút chọn nhanh thù lao ca */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-neutral-400 font-medium">Chọn nhanh:</span>
                    {[500000, 800000, 1000000, 1200000, 1500000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ratePerShoot: val }))}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                          formData.ratePerShoot === val
                            ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-2xs'
                            : 'bg-white text-neutral-700 border-black/[0.08] hover:bg-neutral-100'
                        }`}
                      >
                        {val >= 1000000 ? `${val / 1000000} Tr` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Tự động tính: Số lớp đi chụp thực tế × Đơn giá/buổi
                  </p>
                </div>
              )}

              {/* Định mức ca thêm nếu là Lương tháng */}
              {formData.salaryType === 'monthly' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-800">
                      Định mức / Phụ cấp ca thêm (vượt KPI)
                    </label>
                    <span className="text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {toVnMoneyText(formData.ratePerShoot)}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={(formData.ratePerShoot || 0).toLocaleString('vi-VN')}
                      onChange={e => handleMoneyChange('ratePerShoot', e.target.value)}
                      className="w-full pl-3.5 pr-14 py-2.5 bg-white border border-black/[0.12] rounded-xl text-neutral-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#B8F23D] font-mono tracking-tight"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg pointer-events-none">
                      VNĐ/ca
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-neutral-400 font-medium">Chọn nhanh:</span>
                    {[300000, 500000, 700000, 1000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ratePerShoot: val }))}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                          formData.ratePerShoot === val
                            ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900'
                            : 'bg-white text-neutral-700 border-black/[0.08] hover:bg-neutral-100'
                        }`}
                      >
                        {val >= 1000000 ? `${val / 1000000} Tr` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Thưởng thêm mỗi ca khi chụp vượt chỉ tiêu tháng
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-center text-xs text-neutral-700 bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-1">
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                    ✓ Cơ Chế Trả Thù Lao Linh Hoạt
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Freelancer & Đối tác sẽ được hệ thống CRM tự động tổng hợp số ca chụp thực tế trong tháng và nghiệm thu theo mức: <strong className="text-neutral-900 font-bold">{formData.ratePerShoot.toLocaleString('vi-VN')} đ / lớp</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Row: Kinh nghiệm & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Số Năm Kinh Nghiệm
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.experienceYears}
                onChange={e => setFormData(prev => ({ ...prev, experienceYears: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Trạng Thái Hiện Tại
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as PhotographerStatus }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              >
                <option value="available">🟢 Sẵn sàng nhận ca (Available)</option>
                <option value="busy">🟡 Đang bận / Có lịch (Busy)</option>
                <option value="offline">⚪ Tạm nghỉ ngắn hạn (Offline)</option>
                <option value="inactive">🔴 Ngừng hợp tác (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-2">
              <Camera className="w-3.5 h-3.5 text-orange-500" />
              Ảnh Đại Diện (Avatar)
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <img
                src={formData.avatar}
                alt="Selected Avatar"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-neutral-900 shadow-sm shrink-0"
              />
              <div className="flex items-center gap-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar: url }))}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      formData.avatar === url
                        ? 'border-[#B8F23D] ring-2 ring-neutral-900 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <input
              type="url"
              placeholder="Hoặc nhập link URL ảnh tùy chỉnh..."
              value={formData.avatar}
              onChange={e => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 font-mono text-[11px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>

          {/* Kỹ Năng Chuyên Môn */}
          <div>
            <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-2">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              Kỹ Năng & Vai Trò Trong Buổi Chụp (Chọn nhiều)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map(skill => {
                const isSelected = formData.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-600 border-black/[0.08] hover:bg-neutral-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khu Vực Hoạt Động (Ưu tiên Hải Phòng) */}
          <div>
            <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Khu Vực Phụ Trách / Nhận Lịch (Ưu tiên Hải Phòng)
            </label>
            <div className="flex flex-wrap gap-2">
              {VIETNAM_LOCATIONS.slice(0, 8).map(loc => {
                const isSelected = formData.activeRegions.includes(loc.city);
                const isHaiPhong = loc.city === 'Hải Phòng';
                return (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() => toggleRegion(loc.city)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? isHaiPhong
                          ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                          : 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-600 border-black/[0.08] hover:bg-neutral-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {loc.city} {isHaiPhong && '⭐'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh Sách Thiết Bị Máy Ảnh & Phụ Kiện */}
          <div>
            <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
              <Camera className="w-3.5 h-3.5 text-neutral-700" />
              Trang Thiết Bị Mang Theo (Cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              placeholder="VD: Sony A7IV, Lens 24-70 GM II, 85 f1.4, DJI Mavic Air 3, Đèn Godox V860III"
              value={formData.equipmentListText}
              onChange={e => setFormData(prev => ({ ...prev, equipmentListText: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>

          {/* Ghi chú phong cách chụp */}
          <div>
            <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              Ghi Chú Phong Cách & Điểm Mạnh
            </label>
            <textarea
              rows={2}
              placeholder="VD: Kỹ năng khuấy động không khí kỷ yếu tốt, ảnh màu trong trẻo, chuyên concept thanh xuân..."
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3.5 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>

          {/* Cấp Tài Khoản Đăng Nhập CRM Cho Thợ (Admin Cấp) */}
          <div className="space-y-3 pt-2 bg-neutral-50/80 p-4 rounded-2xl border border-black/[0.06]">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Key className="w-3.5 h-3.5 text-neutral-800" /> Cấp Tài Khoản Đăng Nhập Hệ Thống
              </h3>
              <span className="text-[10px] font-bold text-neutral-600 bg-neutral-200/70 px-2 py-0.5 rounded-md">
                Admin Cấp Cho Thợ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                  <User className="w-3 h-3 text-neutral-400" /> Tên đăng nhập (Username / Email)
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder={formData.email || 'ten.photo@xoanmedia.vn'}
                  className="w-full mt-1 px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-neutral-400" /> Mật khẩu đăng nhập
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[10px] font-bold text-neutral-800 hover:text-black flex items-center gap-1 transition-colors"
                    title="Tạo mật khẩu ngẫu nhiên"
                  >
                    <RefreshCw className="w-3 h-3" /> Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Nhập mật khẩu cấp cho Thợ"
                    className="w-full px-3 py-2 pr-10 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Cho phép đăng nhập */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-neutral-600">
                Cho phép thợ đăng nhập vào ứng dụng để nhận ca và xem lịch chụp
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canLogin}
                  onChange={e => setFormData(prev => ({ ...prev, canLogin: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
            {isEditMode && photographerToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${photographerToEdit.fullName}" khỏi đội ngũ ekip?`)) {
                    deletePhotographer(photographerToEdit.id);
                    onClose();
                  }
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Xóa Thợ Này
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Nhân Sự Ekip'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
