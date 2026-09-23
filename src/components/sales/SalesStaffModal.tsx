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
  ShieldCheck
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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: PRESET_AVATARS[0],
    roleTitle: 'Chuyên viên Sales',
    status: 'active' as 'active' | 'inactive',
    activeRegions: ['Hải Phòng'] as string[]
  });

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        name: staffToEdit.name,
        phone: staffToEdit.phone,
        email: staffToEdit.email,
        avatar: staffToEdit.avatar || PRESET_AVATARS[0],
        roleTitle: staffToEdit.roleTitle || 'Chuyên viên Sales',
        status: staffToEdit.status,
        activeRegions: staffToEdit.activeRegions || ['Hải Phòng']
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        avatar: PRESET_AVATARS[0],
        roleTitle: 'Chuyên viên Sales',
        status: 'active',
        activeRegions: ['Hải Phòng']
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

    if (isEditMode && staffToEdit) {
      updateSalesStaff({
        ...staffToEdit,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@xoanmedia.vn`,
        avatar: formData.avatar,
        roleTitle: formData.roleTitle,
        status: formData.status,
        activeRegions: formData.activeRegions
      });
    } else {
      addSalesStaff({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@xoanmedia.vn`,
        avatar: formData.avatar,
        roleTitle: formData.roleTitle,
        status: formData.status,
        activeRegions: formData.activeRegions
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
