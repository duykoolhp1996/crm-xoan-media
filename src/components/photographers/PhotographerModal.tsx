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
  Trash2
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

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    avatar: PRESET_AVATARS[0],
    photographerType: 'Freelancer' as 'Full-time' | 'Freelancer' | 'Đối tác Studio',
    experienceYears: 3,
    status: 'available' as PhotographerStatus,
    ratePerShoot: 1000000,
    skills: ['Chụp chính'] as PhotographerSkill[],
    activeRegions: ['Hải Phòng'] as string[],
    equipmentListText: 'Sony A7IV, Lens 24-70 f2.8 GM',
    notes: ''
  });

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
        ratePerShoot: photographerToEdit.ratePerShoot,
        skills: photographerToEdit.skills || [],
        activeRegions: photographerToEdit.activeRegions || ['Hải Phòng'],
        equipmentListText: photographerToEdit.equipmentList?.join(', ') || '',
        notes: photographerToEdit.notes || ''
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
        ratePerShoot: 1000000,
        skills: ['Chụp chính'],
        activeRegions: ['Hải Phòng'],
        equipmentListText: '',
        notes: ''
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

    if (isEditMode && photographerToEdit) {
      updatePhotographer({
        ...photographerToEdit,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        avatar: formData.avatar,
        photographerType: formData.photographerType,
        experienceYears: Number(formData.experienceYears) || 1,
        status: formData.status,
        ratePerShoot: Number(formData.ratePerShoot) || 0,
        skills: formData.skills,
        activeRegions: formData.activeRegions,
        equipmentList,
        notes: formData.notes.trim()
      });
    } else {
      addPhotographer({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${formData.phone.trim()}@xoanmedia.vn`,
        avatar: formData.avatar,
        photographerType: formData.photographerType,
        experienceYears: Number(formData.experienceYears) || 1,
        status: formData.status,
        ratePerShoot: Number(formData.ratePerShoot) || 0,
        skills: formData.skills,
        activeRegions: formData.activeRegions,
        equipmentList,
        notes: formData.notes.trim()
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
                  : 'Khai báo thợ chụp, quay phim, flycam hoặc chuyên viên makeup vào hệ thống Xoắn Media'}
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
                <option value="Full-time">Full-time (Nhân sự chính thức Xoắn Media)</option>
                <option value="Freelancer">Freelancer (Thợ tự do nhận ca linh hoạt)</option>
                <option value="Đối tác Studio">Đối tác Studio (Studio / Team liên kết ngoài)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Thù lao / Buổi, Kinh nghiệm, Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Thù Lao / Ca Chụp (VNĐ)
              </label>
              <input
                type="number"
                step="50000"
                min="0"
                placeholder="VD: 1000000"
                value={formData.ratePerShoot}
                onChange={e => setFormData(prev => ({ ...prev, ratePerShoot: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

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
