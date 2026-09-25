import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SalesStaff } from '../../types';
import { VIETNAM_LOCATIONS } from '../../data/vietnamLocations';
import {
  X,
  Phone,
  Mail,
  User,
  MapPin,
  Award,
  Check,
  Trash2,
  UserCheck,
  ShieldCheck,
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Percent,
  DollarSign
} from 'lucide-react';

interface SalesStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: SalesStaff | null;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export const SalesStaffModal: React.FC<SalesStaffModalProps> = ({
  isOpen,
  onClose,
  staffToEdit
}) => {
  const { addSalesStaff, updateSalesStaff, deleteSalesStaff } = useApp();

  const isEditMode = Boolean(staffToEdit);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: PRESET_AVATARS[0],
    roleTitle: 'Chuyên viên Sales',
    status: 'active' as 'active' | 'inactive',
    activeRegions: ['Hải Phòng'] as string[],
    commissionType: 'percentage' as 'percentage' | 'fixed',
    commissionRate: 8,
    commissionFixedAmount: 500000,
    username: '',
    password: '',
    canLogin: true
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let result = 'Xoan@';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: result }));
  };

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        name: staffToEdit.name,
        phone: staffToEdit.phone,
        email: staffToEdit.email,
        avatar: staffToEdit.avatar || PRESET_AVATARS[0],
        roleTitle: staffToEdit.roleTitle || 'Chuyên viên Sales',
        status: staffToEdit.status,
        activeRegions: staffToEdit.activeRegions || ['Hải Phòng'],
        commissionType: staffToEdit.commissionType || 'percentage',
        commissionRate: staffToEdit.commissionRate ?? 8,
        commissionFixedAmount: staffToEdit.commissionFixedAmount ?? 500000,
        username: staffToEdit.username || staffToEdit.email || '',
        password: staffToEdit.password || 'XoanSales@2024',
        canLogin: staffToEdit.canLogin ?? true
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        avatar: PRESET_AVATARS[0],
        roleTitle: 'Chuyên viên Sales',
        status: 'active',
        activeRegions: ['Hải Phòng'],
        commissionType: 'percentage',
        commissionRate: 8,
        commissionFixedAmount: 500000,
        username: '',
        password: 'XoanSales@2024',
        canLogin: true
      });
    }
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleRegion = (city: string) => {
    setFormData(prev => {
      const exists = prev.activeRegions.includes(city);
      if (exists) {
        if (prev.activeRegions.length === 1) return prev; // giữ ít nhất 1 khu vực
        return { ...prev, activeRegions: prev.activeRegions.filter(c => c !== city) };
      } else {
        return { ...prev, activeRegions: [...prev.activeRegions, city] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại của nhân sự Sales!');
      return;
    }

    const finalEmail = formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@xoanmedia.vn`;
    const finalUsername = formData.username.trim() || finalEmail;
    const finalPassword = formData.password.trim() || 'XoanSales@2024';

    if (isEditMode && staffToEdit) {
      updateSalesStaff({
        ...staffToEdit,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: finalEmail,
        avatar: formData.avatar,
        roleTitle: formData.roleTitle,
        status: formData.status,
        activeRegions: formData.activeRegions,
        commissionType: formData.commissionType,
        commissionRate: formData.commissionType === 'percentage' ? Number(formData.commissionRate) : undefined,
        commissionFixedAmount: formData.commissionType === 'fixed' ? Number(formData.commissionFixedAmount) : undefined,
        username: finalUsername,
        password: finalPassword,
        canLogin: formData.canLogin
      });
    } else {
      addSalesStaff({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: finalEmail,
        avatar: formData.avatar,
        roleTitle: formData.roleTitle,
        status: formData.status,
        activeRegions: formData.activeRegions,
        commissionType: formData.commissionType,
        commissionRate: formData.commissionType === 'percentage' ? Number(formData.commissionRate) : undefined,
        commissionFixedAmount: formData.commissionType === 'fixed' ? Number(formData.commissionFixedAmount) : undefined,
        username: finalUsername,
        password: finalPassword,
        canLogin: formData.canLogin
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!staffToEdit) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${staffToEdit.name}" khỏi danh sách Sales?`)) {
      deleteSalesStaff(staffToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-8 text-neutral-900 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-50/80 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900">
                {isEditMode ? 'Chỉnh Sửa Thông Tin Nhân Viên Sales' : 'Thêm Nhân Viên Sales Tư Vấn Mới'}
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                {isEditMode ? `Mã nhân sự: ${staffToEdit?.id}` : 'Nhân sự phụ trách chăm sóc khách hàng và tư vấn gói kỷ yếu'}
              </p>
            </div>
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
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-1 text-[11px]">
              <User className="w-3.5 h-3.5 text-neutral-700" /> 1. Thông Tin Cá Nhân & Chức Danh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700">Họ và tên Sales *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lê Hoàng Sơn"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700">Vị trí / Chức danh</label>
                <select
                  value={formData.roleTitle}
                  onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl text-xs font-semibold cursor-pointer focus:bg-white focus:outline-none"
                >
                  <option value="Sales Lead">Sales Lead (Trưởng nhóm Sales)</option>
                  <option value="Chuyên viên Sales">Chuyên viên Sales Tư Vấn</option>
                  <option value="CTV Sales">Cộng Tác Viên (CTV) Sales</option>
                  <option value="Tư Vấn & CSKH">Tư Vấn & CSKH</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-neutral-500" /> Số điện thoại (Zalo) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0984556677"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-neutral-500" /> Email làm việc
                </label>
                <input
                  type="email"
                  placeholder="sales@xoanmedia.vn"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
            </div>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-neutral-700">Chọn ảnh đại diện</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, avatar: av })}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                    formData.avatar === av ? 'border-neutral-900 scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Trạng thái & Địa bàn phụ trách */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-neutral-700" /> 2. Trạng Thái Hoạt Động & Địa Bàn
            </h3>

            <div>
              <label className="text-xs font-semibold text-neutral-700">Trạng thái nhận Lead</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'active' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    formData.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                      : 'bg-neutral-50 text-neutral-600 border-black/[0.06]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Đang hoạt động (Nhận Lead)
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'inactive' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    formData.status === 'inactive'
                      ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                      : 'bg-neutral-50 text-neutral-600 border-black/[0.06]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  Tạm nghỉ (Không chia Lead)
                </button>
              </div>
            </div>

            <div className="mt-2">
              <label className="text-xs font-semibold text-neutral-700">Tỉnh / Thành phố phụ trách chính</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {VIETNAM_LOCATIONS.slice(0, 8).map(loc => {
                  const isSelected = formData.activeRegions.includes(loc.city);
                  return (
                    <button
                      key={loc.city}
                      type="button"
                      onClick={() => handleToggleRegion(loc.city)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 border-transparent hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {loc.city}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Chính Sách Hoa Hồng Sales (Chọn % Doanh Thu hoặc Cố Định) */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-black/[0.06] pb-1 text-[11px]">
              <Percent className="w-3.5 h-3.5 text-neutral-700" /> 3. Chính Sách Hoa Hồng Sales
            </h3>

            {/* Switch 2 Dạng: % Doanh Thu vs Cố Định */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, commissionType: 'percentage' })}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  formData.commissionType === 'percentage'
                    ? 'bg-purple-50/80 text-purple-900 border-purple-300 ring-2 ring-purple-400/30 shadow-2xs'
                    : 'bg-neutral-50 text-neutral-600 border-black/[0.06] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-purple-600" /> % Doanh Thu
                  </span>
                  {formData.commissionType === 'percentage' && (
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Tính theo % trên tổng giá trị hợp đồng lớp chốt thành công
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, commissionType: 'fixed' })}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  formData.commissionType === 'fixed'
                    ? 'bg-emerald-50/80 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/30 shadow-2xs'
                    : 'bg-neutral-50 text-neutral-600 border-black/[0.06] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Chia Cố Định
                  </span>
                  {formData.commissionType === 'fixed' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Nhận mức thù lao cố định trên mỗi hợp đồng/lớp chốt được
                </p>
              </button>
            </div>

            {/* Chi tiết theo dạng đã chọn */}
            {formData.commissionType === 'percentage' ? (
              <div className="p-3.5 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    Tỷ Lệ Hoa Hồng (% Doanh Thu Hợp Đồng)
                  </label>
                  <span className="text-xs font-extrabold text-purple-700 bg-white px-2.5 py-0.5 rounded-lg border border-purple-200">
                    {formData.commissionRate}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={0.5}
                    value={formData.commissionRate}
                    onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="flex-1 accent-purple-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={formData.commissionRate}
                      onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="w-16 px-2 py-1 bg-white border border-purple-300 rounded-lg text-xs font-bold text-neutral-900 text-center focus:outline-none"
                    />
                    <span className="font-bold text-purple-900 text-xs">%</span>
                  </div>
                </div>

                <p className="text-[11px] text-purple-700/80 italic">
                  💡 Ví dụ: Hợp đồng kỷ yếu 15.000.000đ → Hoa hồng Sales nhận: {Math.round(15000000 * (formData.commissionRate || 8) / 100).toLocaleString('vi-VN')}đ.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-emerald-900">
                  Mức Hoa Hồng Cố Định (VNĐ / Hợp Đồng Chốt)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={50000}
                    min={0}
                    value={formData.commissionFixedAmount}
                    onChange={e => setFormData({ ...formData, commissionFixedAmount: Number(e.target.value) })}
                    placeholder="VD: 500000"
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-800">
                    đ / hợp đồng
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-500 mr-1">Mức gợi ý:</span>
                  {[300000, 500000, 800000, 1000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, commissionFixedAmount: amt })}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-[10px] font-bold text-emerald-800 transition-colors"
                    >
                      {amt.toLocaleString('vi-VN')}đ
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-emerald-700/80 italic">
                  💡 Nhân sự sẽ nhận cố định {(formData.commissionFixedAmount || 500000).toLocaleString('vi-VN')}đ mỗi khi khách chuyển cọc thành công.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Cấp Tài Khoản Đăng Nhập CRM (Admin Cấp) */}
          <div className="space-y-3 pt-2 bg-neutral-50/80 p-4 rounded-2xl border border-black/[0.06]">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
              <h3 className="font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Key className="w-3.5 h-3.5 text-neutral-800" /> 4. Cấp Tài Khoản Đăng Nhập CRM
              </h3>
              <span className="text-[10px] font-bold text-neutral-600 bg-neutral-200/70 px-2 py-0.5 rounded-md">
                Admin Quản Trị
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
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder={formData.email || 'ten.sales@xoanmedia.vn'}
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
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nhập mật khẩu cấp cho Sales"
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
                Cho phép tài khoản này đăng nhập vào hệ thống CRM
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.canLogin}
                  onChange={e => setFormData({ ...formData, canLogin: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa Nhân Sự
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                {isEditMode ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên Sales'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
