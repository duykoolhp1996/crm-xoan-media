import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginQuick } = useApp();

  const [activeTab, setActiveTab] = useState<'form' | 'quick'>('form');
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
      setErrorMessage('Vui lòng nhập tên đăng nhập hoặc email/SĐT!');
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
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0F1115] text-neutral-100 font-sans selection:bg-[#B8F23D]/60 selection:text-neutral-900 relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#B8F23D]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Container Grid */}
      <div className="w-full flex flex-col lg:flex-row max-w-7xl mx-auto my-auto p-4 sm:p-8 lg:p-12 gap-8 items-center justify-center min-h-screen">
        
        {/* Left Side: Brand Showcase & Features */}
        <div className="w-full lg:w-1/2 space-y-6 max-w-lg lg:max-w-none">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-900 to-neutral-800 border border-neutral-700 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <Camera className="w-6 h-6 text-[#B8F23D]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                XOẮN MEDIA <span className="text-xs font-mono font-bold bg-[#B8F23D]/20 text-[#B8F23D] border border-[#B8F23D]/30 px-2 py-0.5 rounded-full">CRM 2026</span>
              </span>
              <p className="text-xs text-neutral-400">Hệ Thống Quản Trị Kỷ Yếu & Điều Phối Ekip Toàn Diện</p>
            </div>
          </div>

          {/* Hero Slogan */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Quản Trị Tự Động, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-[#B8F23D]">
                Chốt Đơn Chuẩn Xác
              </span> & Điều Phối Đỉnh Cao
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Nền tảng số hóa độc quyền dành cho đội ngũ Quản Trị, Chuyên viên Sales và Đội ngũ Ekip Thợ Chụp của Xoắn Media trên toàn quốc.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Phân Quyền Bảo Mật
              </div>
              <p className="text-[11px] text-neutral-400">Admin cấp tài khoản & mật khẩu riêng biệt cho Sales và Thợ chụp.</p>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Zap className="w-4 h-4 text-amber-400" /> Node Workflow Tự Động
              </div>
              <p className="text-[11px] text-neutral-400">Nuôi dưỡng Lead & bám đuổi báo giá chưa cọc với sơ đồ If/Else.</p>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Users className="w-4 h-4 text-emerald-400" /> 38 Ekip Thợ Chụp
              </div>
              <p className="text-[11px] text-neutral-400">Điều phối thợ chính, thợ phụ, quay phim tại Hải Phòng & Hà Nội.</p>
            </div>

            <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-sky-400" /> Pipeline 13 Giai Đoạn
              </div>
              <p className="text-[11px] text-neutral-400">Kiểm soát tiến độ từ New Lead đến nghiệm thu và bàn giao album.</p>
            </div>
          </div>

          <div className="pt-2 text-xs text-neutral-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Phục vụ 500+ lớp kỷ yếu và 20.000+ học sinh mỗi mùa</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative space-y-6">
            
            {/* Top Switcher Tabs: Nhập Tài Khoản / Đăng Nhập Nhanh */}
            <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('form');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all ${
                  activeTab === 'form'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Nhập Tài Khoản
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'quick'
                    ? 'bg-[#B8F23D] text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Đăng Nhập Nhanh 1-Click
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: FORM ĐĂNG NHẬP CHÍNH THỨC */}
            {activeTab === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Tên Đăng Nhập / Email / SĐT
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="admin@xoanmedia.vn hoặc SĐT..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-[#B8F23D] transition-colors"
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
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-10 pr-10 py-3 bg-neutral-950 border border-neutral-800 rounded-xl font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-[#B8F23D] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
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

                  <button
                    type="button"
                    onClick={() => setActiveTab('quick')}
                    className="text-[#B8F23D] hover:underline"
                  >
                    Xem tài khoản mẫu?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#B8F23D]/10 mt-2"
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
            )}

            {/* TAB 2: ĐĂNG NHẬP NHANH 1-CLICK (QUICK DEMO ROLES) */}
            {activeTab === 'quick' && (
              <div className="space-y-3 text-xs animate-in fade-in">
                <p className="text-neutral-400 text-[11px] mb-2">
                  Bấm trực tiếp vào vai trò bên dưới để đăng nhập ngay mà không cần nhập mật khẩu:
                </p>

                {/* 1. Admin */}
                <button
                  onClick={() => loginQuick('admin')}
                  className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-purple-500/50 rounded-2xl text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">Admin Quản Trị Hệ Thống</h4>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.2 rounded-full border border-purple-500/30">
                          Toàn quyền
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">admin@xoanmedia.vn (Pass: XoanAdmin@2026)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 transition-colors" />
                </button>

                {/* 2. Sales Lead */}
                <button
                  onClick={() => loginQuick('sales', 'user-2')}
                  className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-orange-500/50 rounded-2xl text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                      alt="Lê Hoàng Sơn"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">Lê Hoàng Sơn (Sales Lead)</h4>
                        <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.2 rounded-full border border-orange-500/30">
                          Sales Trưởng
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">son.lh@xoanmedia.vn (Pass: SonLead@2024)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-orange-400 transition-colors" />
                </button>

                {/* 3. Sales Staff */}
                <button
                  onClick={() => loginQuick('sales', 'user-sales-1')}
                  className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-500/50 rounded-2xl text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Nguyễn Thu Hương"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">Nguyễn Thu Hương (Sales)</h4>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/30">
                          Sales Tư Vấn
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">huong.nt@xoanmedia.vn (Pass: HuongSales@2024)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                </button>

                {/* 4. Photographer Lead (Hải Phòng) */}
                <button
                  onClick={() => loginQuick('photographer', 'photo-1')}
                  className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-blue-500/50 rounded-2xl text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                      alt="Doanh"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">Doanh (Thợ Chụp Lead - Hải Phòng)</h4>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.2 rounded-full border border-blue-500/30">
                          Chụp chính
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">doanh.photo@xoanmedia.vn (Pass: XoanPhoto@2026)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                </button>

                {/* 5. Photographer Lead (Hà Nội) */}
                <button
                  onClick={() => loginQuick('photographer', 'photo-2')}
                  className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl text-left flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                      alt="Thành To"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-neutral-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">Thành To (Thợ Chụp Lead - Hà Nội)</h4>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-500/30">
                          Chụp chính
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">thanhto.photo@xoanmedia.vn (Pass: XoanPhoto@2026)</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
                </button>
              </div>
            )}

            {/* Bottom Support Note */}
            <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                Tài khoản & mật khẩu do <strong>Ban Quản Trị Xoắn Media</strong> cấp cho nhân sự. Nếu chưa có tài khoản, vui lòng liên hệ Admin hotline: <strong>0981 108 601</strong>.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
