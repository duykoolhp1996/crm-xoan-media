import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Camera,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User,
  Upload,
  Link
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentRole, updateProfile } = useApp();

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser.avatar || '');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'avatar' | 'password'>('avatar');

  if (!isOpen) return null;

  const isSalesOrPhoto = currentRole === 'sales' || currentRole === 'photographer';
  if (!isSalesOrPhoto) return null;

  const roleLabel = currentRole === 'photographer' ? '📸 Photographer' : '💼 Sales Tư Vấn';
  const roleBadgeClass = currentRole === 'photographer'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-blue-100 text-blue-800';

  // Xử lý upload file ảnh -> base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setResult({ success: false, message: 'Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    if (!avatarUrl.trim()) return;
    setAvatarPreview(avatarUrl.trim());
    setResult(null);
  };

  // Đổi Avatar
  const handleSaveAvatar = async () => {
    if (avatarPreview === currentUser.avatar) {
      setResult({ success: false, message: 'Ảnh đại diện chưa thay đổi.' });
      return;
    }
    setIsSubmitting(true);
    const res = updateProfile({ avatar: avatarPreview });
    setResult(res);
    setIsSubmitting(false);
  };

  // Đổi Mật Khẩu
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setResult({ success: false, message: 'Vui lòng điền đầy đủ tất cả các ô mật khẩu.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResult({ success: false, message: 'Mật khẩu mới và xác nhận không khớp.' });
      return;
    }
    if (newPassword.length < 6) {
      setResult({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword === currentPassword) {
      setResult({ success: false, message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.' });
      return;
    }
    setIsSubmitting(true);
    const res = updateProfile({ currentPassword, newPassword });
    setResult(res);
    setIsSubmitting(false);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { level: 'weak', label: 'Quá ngắn', color: 'bg-red-400' };
    if (pwd.length < 8) return { level: 'fair', label: 'Trung bình', color: 'bg-amber-400' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) {
      return { level: 'strong', label: 'Mạnh', color: 'bg-emerald-500' };
    }
    return { level: 'good', label: 'Khá tốt', color: 'bg-blue-400' };
  };
  const strength = passwordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 flex items-center justify-center">
              <User className="w-4 h-4 text-[#B8F23D]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Hồ Sơ Cá Nhân</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeClass}`}>
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info Strip */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-black/[0.04]">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-black/[0.08] shrink-0">
            <img src={avatarPreview || currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-neutral-900 text-sm truncate">{currentUser.name}</p>
            <p className="text-xs text-neutral-500 truncate">{currentUser.email || currentUser.phone}</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100/80 mx-6 mt-4 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => { setActiveSection('avatar'); setResult(null); }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'avatar' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Ảnh Đại Diện
          </button>
          <button
            onClick={() => { setActiveSection('password'); setResult(null); }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeSection === 'password' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Mật Khẩu
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">

          {/* === AVATAR SECTION === */}
          {activeSection === 'avatar' && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-black/[0.08] shadow-sm">
                    <img
                      src={avatarPreview || currentUser.avatar}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarPreview(currentUser.avatar)}
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-neutral-900 hover:bg-neutral-700 rounded-2xl flex items-center justify-center shadow-sm transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#B8F23D]" />
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Ảnh xem trước</p>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAvatarMode('upload')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    avatarMode === 'upload' ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900' : 'bg-white text-neutral-600 border-black/[0.08] hover:bg-neutral-50'
                  }`}
                >
                  <Upload className="w-3 h-3" /> Tải Lên
                </button>
                <button
                  onClick={() => setAvatarMode('url')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    avatarMode === 'url' ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900' : 'bg-white text-neutral-600 border-black/[0.08] hover:bg-neutral-50'
                  }`}
                >
                  <Link className="w-3 h-3" /> Dùng Link
                </button>
              </div>

              {avatarMode === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-black/[0.10] hover:border-neutral-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100"
                >
                  <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">Bấm để chọn ảnh</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">JPG, PNG, WEBP — Tối đa 2MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://... (link ảnh)"
                    className="flex-1 px-3 py-2 text-xs border border-black/[0.10] rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
                  />
                  <button
                    onClick={handleUrlApply}
                    className="px-3 py-2 bg-neutral-900 text-[#B8F23D] text-xs font-bold rounded-xl hover:bg-neutral-700 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              )}

              <button
                onClick={handleSaveAvatar}
                disabled={isSubmitting || avatarPreview === currentUser.avatar}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-[#B8F23D] disabled:text-neutral-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Đang lưu...' : '💾 Lưu Ảnh Đại Diện'}
              </button>
            </div>
          )}

          {/* === PASSWORD SECTION === */}
          {activeSection === 'password' && (
            <div className="space-y-3">
              {/* Current Password */}
              <div>
                <label className="text-xs font-bold text-neutral-700 mb-1.5 block">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu đang dùng..."
                    className="w-full px-3 py-2.5 text-xs border border-black/[0.10] rounded-xl pr-9 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-neutral-700 mb-1.5 block">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3 py-2.5 text-xs border border-black/[0.10] rounded-xl pr-9 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {strength && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-0.5 flex-1">
                      {['weak', 'fair', 'good', 'strong'].map((lvl, i) => (
                        <div
                          key={lvl}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            ['weak', 'fair', 'good', 'strong'].indexOf(strength.level) >= i
                              ? strength.color
                              : 'bg-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500">{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-neutral-700 mb-1.5 block">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className={`w-full px-3 py-2.5 text-xs border rounded-xl pr-9 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50 ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-300 focus:ring-red-300'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-300'
                        : 'border-black/[0.10]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">⚠ Mật khẩu không khớp</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p className="text-[11px] text-emerald-600 mt-1">✓ Mật khẩu khớp</p>
                )}
              </div>

              <button
                onClick={handleSavePassword}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-[#B8F23D] disabled:text-neutral-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Đang lưu...' : '🔑 Đổi Mật Khẩu'}
              </button>
            </div>
          )}

          {/* Result Toast */}
          {result && (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              result.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result.success
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              }
              {result.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/[0.06] bg-neutral-50/60 text-[11px] text-neutral-400 text-center">
          Thay đổi sẽ có hiệu lực ngay khi bạn đăng nhập lại lần sau
        </div>
      </div>
    </div>
  );
};
