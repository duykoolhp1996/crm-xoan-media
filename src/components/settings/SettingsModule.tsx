import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Photographer, PhotographerStatus, SalesStaff } from '../../types';
import { PhotographerModal } from '../photographers/PhotographerModal';
import { SalesStaffModal } from '../sales/SalesStaffModal';
import {
  Settings,
  Database,
  Zap,
  Webhook,
  Download,
  Server,
  Camera,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Award,
  Layers,
  CheckCircle2,
  UserCheck,
  Users,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogIn,
  ShieldCheck,
  ExternalLink,
  Coins
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    photographers,
    deletePhotographer,
    updatePhotographerStatus,
    salesStaff,
    deleteSalesStaff,
    customers,
    loginAsStaff
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'crew' | 'sales' | 'automation' | 'database'>('crew');

  // Quản lý hiển thị mật khẩu & sao chép tài khoản
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyAccount = (staff: { id: string; name: string; username?: string; email: string; password?: string; roleTitle?: string; photographerType?: string }, type: 'sales' | 'photographer') => {
    const userStr = staff.username || staff.email;
    const passStr = staff.password || (type === 'sales' ? 'XoanSales@2024' : 'PhotoXoan@2024');
    const roleName = type === 'sales' ? (staff.roleTitle || 'Chuyên viên Sales') : `Photographer (${staff.photographerType || 'Ekip Chụp'})`;
    const text = `🎉 TÀI KHOẢN ĐĂNG NHẬP CRM XOẮN MEDIA\n👤 Họ tên: ${staff.name}\n🛡️ Phân quyền: ${roleName}\n🔑 Tên đăng nhập: ${userStr}\n🔒 Mật khẩu: ${passStr}\n🌐 Đăng nhập tại: https://duykoolhp1996.github.io/crm-xoan-media/`;
    navigator.clipboard.writeText(text);
    setCopiedId(staff.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Supabase & Webhooks
  const [supabaseUrl, setSupabaseUrl] = useState('https://crm-xoanmedia.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xoanmedia_demo_key');

  // Crew Filter & Search
  const [searchCrew, setSearchCrew] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sales Staff Filter & Search
  const [searchSales, setSearchSales] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);

  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [editingSalesStaff, setEditingSalesStaff] = useState<SalesStaff | null>(null);

  // Automation triggers rules
  const [automationRules, setAutomationRules] = useState([
    { id: 'r1', title: 'Tự động phân bổ Sales khi có Lead mới', desc: 'Chia đều Lead từ Facebook Ads & TikTok theo vòng tròn (Round-Robin) cho team Sales.', active: true },
    { id: 'r2', title: 'Cảnh báo khi Lead chưa liên hệ sau 30 phút', desc: 'Bắn thông báo khẩn cấp lên Header và gửi tin nhắn cảnh báo tới quản lý.', active: true },
    { id: 'r3', title: 'Tự động phát hiện trùng lịch Photographer', desc: 'Quét toàn bộ đơn chụp cùng ngày, cảnh báo nếu thợ chính bị gán trên 1 ca trùng giờ.', active: true },
    { id: 'r4', title: 'Nhắc Sales chuẩn bị trước ngày chụp 48 giờ', desc: 'Tạo Task tự động cho Sales gọi chốt lại sỉ số, concept và địa điểm với lớp trưởng.', active: true },
    { id: 'r5', title: 'Tự động đưa khách hoàn thành vào Remarketing', desc: 'Sau 90 ngày hoàn thành buổi chụp, tự động thêm vào phân khúc chăm sóc khách cũ.', active: true }
  ]);

  const toggleRule = (id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleOpenAddModal = () => {
    setEditingPhotographer(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Photographer) => {
    setEditingPhotographer(p);
    setIsModalOpen(true);
  };

  const handleDelete = (p: Photographer) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${p.fullName}" khỏi đội ngũ ekip?`)) {
      deletePhotographer(p.id);
    }
  };

  // Filtered Crew
  const filteredPhotographers = photographers.filter(p => {
    const matchSearch =
      p.fullName.toLowerCase().includes(searchCrew.toLowerCase()) ||
      p.phone.includes(searchCrew) ||
      p.email.toLowerCase().includes(searchCrew.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchCrew.toLowerCase())) ||
      p.activeRegions.some(r => r.toLowerCase().includes(searchCrew.toLowerCase()));

    const matchRole = roleFilter === 'all' || p.photographerType === roleFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  // Filtered Sales Staff
  const filteredSalesStaff = salesStaff.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(searchSales.toLowerCase()) ||
      s.phone.includes(searchSales) ||
      s.email.toLowerCase().includes(searchSales.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(searchSales.toLowerCase()) ||
      s.activeRegions.some(r => r.toLowerCase().includes(searchSales.toLowerCase()));

    const matchStatus = salesStatusFilter === 'all' || s.status === salesStatusFilter;

    return matchSearch && matchStatus;
  });

  const statusColors: Record<PhotographerStatus, { label: string; badge: string }> = {
    available: { label: 'Sẵn sàng nhận ca', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    busy: { label: 'Đang có lịch chụp', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    offline: { label: 'Tạm nghỉ', badge: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
    inactive: { label: 'Ngừng hợp tác', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-neutral-900" />
            Quản Lý Tài Khoản & Cấp Quyền Đăng Nhập
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Admin tạo & cấp tài khoản/mật khẩu riêng biệt cho nhân sự <strong>Sales Tư Vấn</strong> và <strong>Thợ Chụp (Ekip)</strong> đăng nhập CRM
          </p>
        </div>

        {activeSubTab === 'crew' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Cấp Tài Khoản Thợ Mới
          </button>
        )}

        {activeSubTab === 'sales' && (
          <button
            onClick={() => {
              setEditingSalesStaff(null);
              setIsSalesModalOpen(true);
            }}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Cấp Tài Khoản Sales Mới
          </button>
        )}
      </div>

      {/* Sub Tabs Selector */}
      <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-black/[0.06] text-xs font-bold w-fit flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab('crew')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'crew'
              ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          Tài Khoản Thợ Chụp ({photographers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('sales')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'sales'
              ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Tài Khoản Sales ({salesStaff.length})
        </button>

        <button
          onClick={() => setActiveSubTab('automation')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'automation'
              ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          Tự Động Hóa Vận Hành
        </button>

        <button
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'database'
              ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Cơ Sở Dữ Liệu & Webhook
        </button>
      </div>

      {/* SUBTAB 1: ĐỘI NGŨ EKIP & THỢ CHỤP */}
      {activeSubTab === 'crew' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tổng nhân sự ekip</span>
              <p className="text-xl font-black text-neutral-900 mt-1">{photographers.length} người</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Đang sẵn sàng nhận ca</span>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {photographers.filter(p => p.status === 'available').length} thợ
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Đang bận / Có lịch</span>
              <p className="text-xl font-black text-amber-600 mt-1">
                {photographers.filter(p => p.status === 'busy').length} thợ
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-black/[0.08] shadow-xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tạm nghỉ / Offline</span>
              <p className="text-xl font-black text-neutral-500 mt-1">
                {photographers.filter(p => ['offline', 'inactive'].includes(p.status)).length} thợ
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3 bg-white border border-black/[0.08] p-3.5 sm:p-4 rounded-2xl shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thợ theo tên, SĐT, kỹ năng (Flycam, Quay phim, Makeup), khu vực (Hải Phòng)..."
                value={searchCrew}
                onChange={e => setSearchCrew(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="Full-time">Full-time</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Đối tác Studio">Đối tác Studio</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">🟢 Sẵn sàng</option>
                <option value="busy">🟡 Đang bận</option>
                <option value="offline">⚪ Tạm nghỉ</option>
                <option value="inactive">🔴 Ngừng hợp tác</option>
              </select>
            </div>
          </div>

          {/* Photographers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhotographers.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-black/[0.08] p-8 space-y-3">
                <Camera className="w-10 h-10 mx-auto text-neutral-300" />
                <p className="font-bold text-neutral-800 text-sm">Không tìm thấy nhân sự ekip nào phù hợp</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Bạn có thể bấm nút "+ Thêm Nhân Sự Ekip Mới" ở góc trên để tạo hồ sơ thợ chụp mới vào hệ thống.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="mt-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Thợ Ngay
                </button>
              </div>
            ) : (
              filteredPhotographers.map(p => (
                <div
                  key={p.id}
                  className="bg-white border border-black/[0.08] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Card: Avatar & Name */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border border-black/[0.08] shadow-xs shrink-0"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-neutral-900 group-hover:text-neutral-700 transition-colors">
                            {p.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                              {p.photographerType}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">
                              {p.experienceYears} năm KN
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[p.status].badge} shrink-0`}>
                        {statusColors[p.status].label}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-black/[0.05]">
                      <p className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-neutral-900">{p.phone}</span>
                      </p>
                      {p.email && (
                        <p className="flex items-center gap-2 truncate text-[11px] text-neutral-500">
                          <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="truncate">{p.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Skills Tags */}
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Kỹ năng:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.skills.map((skill, idx) => (
                          <span key={idx} className="bg-orange-50 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-orange-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Equipment & Regions */}
                    <div className="space-y-1 text-[11px] text-neutral-600">
                      <p className="truncate">
                        <strong>📷 Thiết bị:</strong> {p.equipmentList.length > 0 ? p.equipmentList.join(', ') : 'Chưa cập nhật'}
                      </p>
                      <p className="flex items-center gap-1 truncate text-rose-700 font-medium">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>Khu vực: <strong>{p.activeRegions.join(', ')}</strong></span>
                      </p>
                    </div>

                    {/* Khối Cấp Tài Khoản Đăng Nhập CRM */}
                    <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                          <Key className="w-3 h-3 text-neutral-700" /> Tài Khoản CRM
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                          {p.canLogin !== false ? '✓ Được đăng nhập' : 'Tạm khóa'}
                        </span>
                      </div>

                      <div className="text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-neutral-700">
                          <span className="text-neutral-500 text-[10px]">Tài khoản:</span>
                          <span className="font-semibold text-neutral-900 truncate max-w-[150px]">{p.username || p.email}</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-700">
                          <span className="text-neutral-500 text-[10px]">Mật khẩu:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-neutral-900">
                              {visiblePasswords[p.id] ? (p.password || 'PhotoXoan@2024') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(p.id)}
                              className="text-neutral-400 hover:text-neutral-700 p-0.5"
                              title={visiblePasswords[p.id] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                              {visiblePasswords[p.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyAccount({ id: p.id, name: p.fullName, email: p.email, username: p.username, password: p.password, photographerType: p.photographerType }, 'photographer')}
                        className="w-full py-1.5 px-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-black/[0.08] rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        {copiedId === p.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Đã sao chép gửi thợ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-neutral-500" />
                            <span>Sao chép tài khoản & mật khẩu</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Footer Card: Pricing & Action Buttons */}
                  <div className="pt-3 border-t border-black/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">Thù lao / buổi:</span>
                      <strong className="text-neutral-900 font-extrabold text-sm">
                        {p.ratePerShoot.toLocaleString('vi-VN')}đ
                      </strong>
                    </div>

                    {/* Nút Đăng nhập thử với quyền thợ này */}
                    <button
                      type="button"
                      onClick={() => loginAsStaff({ id: p.id, name: p.fullName, role: 'photographer', avatar: p.avatar, email: p.email, phone: p.phone })}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group-hover:border-emerald-300"
                      title="Đăng nhập thử bằng tài khoản thợ này để xem giao diện"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                      Đăng Nhập Thử (Quyền Thợ)
                    </button>

                    {/* Action Buttons: Edit, Delete, Call */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Chỉnh Sửa & Cấp MK
                      </button>

                      <a
                        href={`tel:${p.phone}`}
                        className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-black/[0.06] rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
                        title="Gọi điện trực tiếp"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-600" />
                      </a>

                      <button
                        onClick={() => handleDelete(p)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
                        title="Xóa nhân sự khỏi ekip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB: ĐỘI NGŨ SALES TƯ VẤN */}
      {activeSubTab === 'sales' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Controls: Search & Status Filter */}
          <div className="bg-white border border-black/[0.08] p-4 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm sales theo tên, SĐT, khu vực..."
                value={searchSales}
                onChange={e => setSearchSales(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-neutral-500 shrink-0">Trạng thái:</span>
              <select
                value={salesStatusFilter}
                onChange={e => setSalesStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-semibold focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả ({salesStaff.length})</option>
                <option value="active">Đang hoạt động ({salesStaff.filter(s => s.status === 'active').length})</option>
                <option value="inactive">Tạm nghỉ ({salesStaff.filter(s => s.status === 'inactive').length})</option>
              </select>

              <button
                onClick={() => {
                  setEditingSalesStaff(null);
                  setIsSalesModalOpen(true);
                }}
                className="sm:hidden px-3 py-2 bg-neutral-900 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>

          {/* Sales Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSalesStaff.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white border border-black/[0.08] rounded-3xl p-6">
                <UserCheck className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-600">Không tìm thấy nhân viên Sales phù hợp</p>
                <button
                  onClick={() => {
                    setEditingSalesStaff(null);
                    setIsSalesModalOpen(true);
                  }}
                  className="mt-3 px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Nhân Viên Sales
                </button>
              </div>
            ) : (
              filteredSalesStaff.map(s => {
                const assignedCount = customers.filter(
                  c => c.assignedSalesName === s.name || c.assignedSalesId === s.id
                ).length;

                const closedCustomers = customers.filter(
                  c => (c.assignedSalesName === s.name || c.assignedSalesId === s.id) &&
                       ['Đã đặt cọc', 'Đã Booking', 'Đã chụp', 'Đang hậu kỳ', 'Đã bàn giao', 'Hoàn thành'].includes(c.pipelineStage)
                );
                const closedRevenue = closedCustomers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
                const commissionEarned = s.commissionType === 'fixed'
                  ? closedCustomers.length * (s.commissionFixedAmount ?? 500000)
                  : (closedRevenue * (s.commissionRate ?? 8)) / 100;

                return (
                  <div
                    key={s.id}
                    className="bg-white border border-black/[0.08] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header: Avatar, Name & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                            alt={s.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-black/[0.08] shadow-xs shrink-0"
                          />
                          <div>
                            <h3 className="font-bold text-sm text-neutral-900 group-hover:text-neutral-700 transition-colors">
                              {s.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 inline-block mt-0.5">
                              {s.roleTitle}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}>
                          {s.status === 'active' ? 'Đang hoạt động' : 'Tạm nghỉ'}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl border border-black/[0.05]">
                        <p className="flex items-center gap-2 truncate">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-neutral-900">{s.phone}</span>
                        </p>
                        {s.email && (
                          <p className="flex items-center gap-2 truncate text-[11px] text-neutral-500">
                            <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="truncate">{s.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Active Regions & Leads count */}
                      <div className="space-y-1 text-[11px]">
                        <p className="flex items-center gap-1 truncate text-neutral-700 font-medium">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>Khu vực: <strong>{s.activeRegions.join(', ')}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5 text-neutral-600 font-medium pt-1">
                          <Users className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>Đang phụ trách: <strong className="text-blue-700 font-bold">{assignedCount} khách hàng/lớp</strong></span>
                        </p>
                      </div>

                      {/* Chính sách Hoa hồng Sales */}
                      <div className="p-2.5 bg-gradient-to-r from-amber-50/80 to-orange-50/50 rounded-2xl border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-amber-600" /> Chính Sách Hoa Hồng
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            {s.commissionType === 'fixed' ? 'Cố định / HĐ' : '% Doanh thu'}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs pt-0.5">
                          <span className="text-neutral-600">Định mức hưởng:</span>
                          <span className="font-bold text-neutral-900">
                            {s.commissionType === 'fixed'
                              ? `${(s.commissionFixedAmount ?? 500000).toLocaleString('vi-VN')} đ/hợp đồng`
                              : `${s.commissionRate ?? 8}% doanh thu`}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Ước tính đã tích lũy ({closedCustomers.length} chốt):</span>
                          <span className="font-bold text-emerald-700">
                            {commissionEarned.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>

                      {/* Khối Cấp Tài Khoản Đăng Nhập CRM */}
                      <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                            <Key className="w-3 h-3 text-neutral-700" /> Tài Khoản CRM
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                            {s.canLogin !== false ? '✓ Được đăng nhập' : 'Tạm khóa'}
                          </span>
                        </div>

                        <div className="text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-neutral-700">
                            <span className="text-neutral-500 text-[10px]">Tài khoản:</span>
                            <span className="font-semibold text-neutral-900 truncate max-w-[150px]">{s.username || s.email}</span>
                          </div>
                          <div className="flex items-center justify-between text-neutral-700">
                            <span className="text-neutral-500 text-[10px]">Mật khẩu:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-neutral-900">
                                {visiblePasswords[s.id] ? (s.password || 'XoanSales@2024') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(s.id)}
                                className="text-neutral-400 hover:text-neutral-700 p-0.5"
                                title={visiblePasswords[s.id] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              >
                                {visiblePasswords[s.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyAccount({ id: s.id, name: s.name, email: s.email, username: s.username, password: s.password, roleTitle: s.roleTitle }, 'sales')}
                          className="w-full py-1.5 px-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-black/[0.08] rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          {copiedId === s.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Đã sao chép gửi Sales!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-neutral-500" />
                              <span>Sao chép tài khoản & mật khẩu</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-black/[0.06] space-y-2.5">
                      {/* Nút Đăng nhập thử với quyền Sales này */}
                      <button
                        type="button"
                        onClick={() => loginAsStaff({ id: s.id, name: s.name, role: 'sales', avatar: s.avatar, email: s.email, phone: s.phone })}
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group-hover:border-blue-300"
                        title="Đăng nhập thử bằng tài khoản Sales này để vào Pipeline nhận lead"
                      >
                        <LogIn className="w-3.5 h-3.5 text-blue-700" />
                        Đăng Nhập Thử (Quyền Sales)
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSalesStaff(s);
                            setIsSalesModalOpen(true);
                          }}
                          className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Chỉnh Sửa & Cấp MK
                        </button>

                        <a
                          href={`tel:${s.phone}`}
                          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-black/[0.06] rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
                          title="Gọi điện trực tiếp"
                        >
                          <Phone className="w-3.5 h-3.5 text-neutral-600" />
                        </a>

                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${s.name}" khỏi danh sách Sales?`)) {
                              deleteSalesStaff(s.id);
                            }
                          }}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
                          title="Xóa nhân sự khỏi danh sách Sales"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: AUTOMATION ENGINE RULES */}
      {activeSubTab === 'automation' && (
        <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Động Cơ Tự Động Hóa Vận Hành (Automation Engine)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Các quy tắc kích hoạt tự động theo logic nghiệp vụ kỷ yếu Xoắn Media
              </p>
            </div>
          </div>

          <div className="divide-y divide-black/[0.05]">
            {automationRules.map((rule) => (
              <div key={rule.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-neutral-900 text-xs">{rule.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{rule.desc}</p>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${
                    rule.active
                      ? 'bg-emerald-500 border-emerald-600'
                      : 'bg-neutral-200 border-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                      rule.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DATABASE SUPABASE & WEBHOOKS */}
      {activeSubTab === 'database' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Section: Supabase Ready */}
          <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Cơ Sở Dữ Liệu PostgreSQL / Supabase</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Hệ thống đã chuẩn bị sẵn Schema SQL 22+ bảng quan hệ (Customers, Bookings, Photographers, Workflows, RLS)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-mono text-[11px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
              <div>
                <label className="font-semibold text-neutral-700">Supabase Anon Public API Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-mono text-[11px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-black/[0.06] rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-neutral-900 font-bold flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  File SQL Migration: <code>src/database/schema.sql</code>
                </p>
                <p className="text-neutral-500 text-[11px]">
                  Bao gồm đầy đủ bảng Users, Roles, Customers, Bookings, Photographers, Assignments, Segments, Tasks...
                </p>
              </div>

              <a
                href="/src/database/schema.sql"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Xem File Schema SQL
              </a>
            </div>
          </div>

          {/* Section: Webhooks */}
          <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Tích Hợp Kênh Lead & Webhooks Ngoài</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Kết nối trực tiếp Facebook Lead Ads, TikTok Leads, Zalo ZNS và n8n Workflow
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">Facebook Lead Ads Webhook</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Đã kết nối</span>
                </div>
                <p className="text-[11px] text-neutral-500">Tự động bắt form đăng ký từ các bài quảng cáo kỷ yếu Hà Nội & Hải Phòng.</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">TikTok Instant Form Webhook</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Đã kết nối</span>
                </div>
                <p className="text-[11px] text-neutral-500">Tự động đồng bộ lead từ các clip concept viral trên TikTok.</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">Zalo ZNS Template API</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Sẵn sàng</span>
                </div>
                <p className="text-[11px] text-neutral-500">Gửi tự động tin nhắn xác nhận lịch chụp và link hợp đồng cọc.</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">n8n Workflow Engine</span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Đang lắng nghe</span>
                </div>
                <p className="text-[11px] text-neutral-500">Endpoint bắn dữ liệu sự kiện khi có khách hàng hoàn thành.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm & Chỉnh Sửa Nhân Sự Ekip */}
      <PhotographerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        photographerToEdit={editingPhotographer}
      />

      {/* Modal Thêm & Chỉnh Sửa Nhân Sự Sales */}
      <SalesStaffModal
        isOpen={isSalesModalOpen}
        onClose={() => setIsSalesModalOpen(false)}
        staffToEdit={editingSalesStaff}
      />
    </div>
  );
};
