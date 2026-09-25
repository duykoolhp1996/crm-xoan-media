import React, { useState } from 'react';
import logoXoan from '../../assets/logo-xoan.png';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập, email hoặc số điện thoại!');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0C0E12] text-neutral-100 font-sans selection:bg-[#B8F23D]/60 selection:text-neutral-900 relative overflow-hidden p-4 sm:p-6">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-gradient-to-tr from-orange-500/10 via-[#B8F23D]/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-neutral-900/95 border border-neutral-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-neutral-700/80 ring-2 ring-[#B8F23D]/20">
              <img
                src={logoXoan}
                alt="Xoắn Media Studio"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  XOẮN MEDIA
                </span>
                <span className="text-[11px] font-mono font-bold bg-[#B8F23D]/20 text-[#B8F23D] border border-[#B8F23D]/30 px-2 py-0.5 rounded-full">
                  CRM 2026
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Hệ Thống Quản Trị & Vận Hành Kỷ Yếu
              </p>
            </div>
          </div>

          <div className="h-px bg-neutral-800/80 w-full" />

          {/* Form Header */}
          <div>
            <h2 className="text-base font-bold text-white">Đăng Nhập Hệ Thống</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Nhập tài khoản và mật khẩu được Admin cấp để tiếp tục
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form Fields: ID & Password */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Tài khoản / Email / Số điện thoại
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập ID tài khoản hoặc email/SĐT..."
                  className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-[#B8F23D] transition-colors text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn..."
                  className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-xl font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-[#B8F23D] transition-colors text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-neutral-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-950 text-[#B8F23D] focus:ring-0 w-3.5 h-3.5"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Bảo mật CRM
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#B8F23D]/10 mt-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                  Đang Xác Thực...
                </span>
              ) : (
                <>
                  Đăng Nhập CRM <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Security Note */}
          <div className="pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            <span>
              Tài khoản & mật khẩu do <strong>Admin Xoắn Media</strong> cấp cho nhân sự Sales & Ekip Thợ Chụp. Quên mật khẩu vui lòng liên hệ Hotline Admin: <strong>0981 108 601</strong>.
            </span>
          </div>

        </div>

        {/* Footer Copyright */}
        <p className="text-center text-[11px] text-neutral-600 mt-6">
          © 2026 XOẮN MEDIA • Hệ Thống Nội Bộ Dành Riêng Cho Nhân Sự
        </p>
      </div>
    </div>
  );
};
