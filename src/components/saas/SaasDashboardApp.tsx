import React, { useState } from 'react';
import { SaasSidebar, SaasTab } from './SaasSidebar';
import { SaasHeader } from './SaasHeader';
import { SaasHeroSection } from './SaasHeroSection';
import { SaasKpiCards } from './SaasKpiCards';
import { SaasRevenueChart } from './SaasRevenueChart';
import { SaasSalesPerformance } from './SaasSalesPerformance';
import { SaasPhotographerTable } from './SaasPhotographerTable';
import { SaasCtvSalesTable } from './SaasCtvSalesTable';
import { SaasSalesAnalytics } from './SaasSalesAnalytics';
import { SaasCustomerOverview } from './SaasCustomerOverview';
import { SaasActivityList } from './SaasActivityList';
import { SaasAddWidgetModal } from './SaasAddWidgetModal';
import { SaasCompareModal } from './SaasCompareModal';
import { SaasProModal } from './SaasProModal';
import { CRM_KPI_METRICS, PhotographerMember, CtvSaleMember } from '../../data/crmBusinessData';
import {
  Sparkles,
  Download,
  Calendar,
  Camera,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  School,
  FileText,
  DollarSign,
  TrendingUp,
  Plus
} from 'lucide-react';

interface SaasDashboardAppProps {
  onSwitchToCrm?: () => void;
}

export const SaasDashboardApp: React.FC<SaasDashboardAppProps> = ({ onSwitchToCrm }) => {
  const [activeTab, setActiveTab] = useState<SaasTab>('dashboard');
  const [dateFilter, setDateFilter] = useState('Toàn bộ mùa kỷ yếu (2024)');
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [customWidgets, setCustomWidgets] = useState<string[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notification Toast state
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleAddWidget = (title: string) => {
    if (!customWidgets.includes(title)) {
      setCustomWidgets(prev => [...prev, title]);
      showNotification(`Đã thêm chỉ số "${title}" vào Dashboard!`);
    }
  };

  const handleAssignCrew = (p: PhotographerMember) => {
    showNotification(`Đang mở điều phối gán lịch cho thợ: ${p.fullName} (${p.role})`);
  };

  const handlePayCommission = (c: CtvSaleMember) => {
    showNotification(`Đã tạo lệnh đối soát hoa hồng ${c.commissionEarned} cho CTV ${c.fullName}`);
  };

  // Sample contract data for "Hợp đồng & Lớp" tab
  const sampleContracts = [
    { id: 'HD-101', class: '12A1 Chuyên Toán', school: 'THPT Chuyên Hà Nội - Amsterdam', package: 'Gói Premium & Dạ Tiệc', members: 42, date: '26/10/2024', deposit: '5.000.000đ', total: '24.500.000đ', status: 'Đã cọc 50%', ctv: 'Đặng Mai Linh' },
    { id: 'HD-102', class: 'K62 Kinh Tế Quốc Tế', school: 'ĐH Ngoại Thương Hà Nội', package: 'Gói Standard Bán Chạy', members: 58, date: '27/10/2024', deposit: '6.000.000đ', total: '22.000.000đ', status: 'Đã cọc 50%', ctv: 'Lê Quốc Huy' },
    { id: 'HD-103', class: '12 Sinh', school: 'THPT Chu Văn An', package: 'Gói Premium & Dạ Tiệc', members: 36, date: '02/11/2024', deposit: '4.500.000đ', total: '20.500.000đ', status: 'Đã chốt lịch', ctv: 'Nguyễn Thu Hương' },
    { id: 'HD-104', class: '12 D1', school: 'THPT Kim Liên', package: 'Gói Basic Tiết Kiệm', members: 45, date: '03/11/2024', deposit: '3.000.000đ', total: '14.500.000đ', status: 'Đã thanh toán 100%', ctv: 'Phạm Quỳnh Nga' },
    { id: 'HD-105', class: 'K64 Tự Động Hóa 02', school: 'ĐH Bách Khoa Hà Nội', package: 'Gói Flycam & Clip TikTok', members: 52, date: '09/11/2024', deposit: '5.000.000đ', total: '19.800.000đ', status: 'Đã cọc 50%', ctv: 'Hoàng Nam Khánh' },
  ];

  return (
    <div className="relative flex h-screen saas-canvas overflow-hidden font-sans selection:bg-[#B8F23D]/60 selection:text-neutral-900">
      {/* Decorative Subtle Abstract Background Shapes */}
      <div className="saas-abstract-shape-1" aria-hidden="true" />
      <div className="saas-abstract-shape-2" aria-hidden="true" />

      {/* Floating Left Icon-Only Sidebar */}
      <SaasSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <SaasHeader
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenProModal={() => setIsProModalOpen(true)}
          onSwitchWorkspace={onSwitchToCrm}
        />

        {/* Action Toast Notification */}
        {actionNotice && (
          <div className="absolute top-20 right-8 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#B8F23D]/40 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-[#B8F23D]" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 pb-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* TAB 1: TỔNG QUAN (DASHBOARD) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Hero / Page Title */}
                <SaasHeroSection
                  activeFilter={dateFilter}
                  onFilterChange={setDateFilter}
                  onOpenCompare={() => setIsCompareOpen(true)}
                  onOpenAddWidget={() => setIsAddWidgetOpen(true)}
                />

                {/* 2. 4 Horizontal CRM KPI Cards */}
                <SaasKpiCards metrics={CRM_KPI_METRICS} />

                {/* 3. Main Analytics Area (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                  {/* Left Column: Biểu đồ doanh thu tháng (8 cols) */}
                  <div className="lg:col-span-8">
                    <SaasRevenueChart />
                  </div>

                  {/* Right Column: Cơ cấu gói kỷ yếu (4 cols) */}
                  <div className="lg:col-span-4">
                    <SaasSalesPerformance />
                  </div>
                </div>

                {/* 4. Quản lý Thợ Chụp & Ekip Studio */}
                <SaasPhotographerTable onAssignCrew={handleAssignCrew} />

                {/* 5. Bảng Xếp Hạng & Quản lý Đội Ngũ CTV Sale */}
                <SaasCtvSalesTable onPayCommission={handlePayCommission} />

                {/* 6. Bottom 3-Card Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                  {/* Card 1: Tốc độ chốt hợp đồng */}
                  <div>
                    <SaasSalesAnalytics />
                  </div>

                  {/* Card 2: Nguồn khách tiếp cận */}
                  <div>
                    <SaasCustomerOverview />
                  </div>

                  {/* Card 3: Nhật ký vận hành gần đây */}
                  <div>
                    <SaasActivityList />
                  </div>
                </div>

                {/* 7. Dynamic Custom Added Widgets */}
                {customWidgets.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#83c906]" />
                        Khối Tiện Ích Đang Kích Hoạt ({customWidgets.length})
                      </h3>
                      <button
                        onClick={() => setCustomWidgets([])}
                        className="text-xs text-neutral-400 hover:text-neutral-700"
                      >
                        Đặt lại giao diện
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {customWidgets.map((title) => (
                        <div key={title} className="saas-card p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-neutral-900">{title}</span>
                            <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Đang kết nối
                            </span>
                          </div>
                          <div className="h-32 flex items-center justify-center text-xs text-neutral-500 border border-dashed border-black/[0.08] rounded-2xl my-4 bg-neutral-50/50">
                            Đang truyền dữ liệu thời gian thực cho: {title}
                          </div>
                          <div className="text-[11px] text-neutral-500 flex justify-between">
                            <span>Trạng thái: Hoạt động tốt</span>
                            <span>Độ trễ: 18ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DOANH THU CRM */}
            {activeTab === 'doanh-thu' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Chi Tiết Doanh Thu CRM Kỷ Yếu</h1>
                    <p className="text-xs text-neutral-500 mt-1">Tổng hợp tiền cọc, doanh số hợp đồng và đối soát tài chính mùa kỷ yếu</p>
                  </div>
                  <button
                    onClick={() => showNotification('Đã xuất báo cáo doanh thu CRM ra file Excel!')}
                    className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Xuất Báo Cáo Doanh Thu (.xlsx)
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <SaasRevenueChart />
                  </div>
                  <div className="lg:col-span-4">
                    <SaasSalesPerformance />
                  </div>
                </div>

                <SaasSalesAnalytics />
              </div>
            )}

            {/* TAB 3: QUẢN LÝ THỢ & EKIP */}
            {activeTab === 'tho-chup' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Điều Phối & Quản Lý Đội Ngũ Thợ Chụp</h1>
                    <p className="text-xs text-neutral-500 mt-1">Quản lý 38 thợ chính, thợ phụ, flycam, makeup và bảng thù lao buổi chụp</p>
                  </div>
                  <button
                    onClick={() => showNotification('Mở biểu mẫu thêm thợ/ekip mới vào danh bạ')}
                    className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Thợ Mới
                  </button>
                </div>

                <SaasPhotographerTable onAssignCrew={handleAssignCrew} />
              </div>
            )}

            {/* TAB 4: CTV SALE & HOA HỒNG */}
            {activeTab === 'ctv-sale' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Đội Ngũ CTV Sale & Hoa Hồng</h1>
                    <p className="text-xs text-neutral-500 mt-1">Theo dõi doanh số do CTV mang về từ các trường và lịch đối soát hoa hồng</p>
                  </div>
                  <button
                    onClick={() => showNotification('Đã tạo lệnh đối soát hoa hồng cho toàn bộ CTV đang chờ!')}
                    className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Quyết Toán Hoa Hồng Loạt
                  </button>
                </div>

                <SaasCtvSalesTable onPayCommission={handlePayCommission} />
              </div>
            )}

            {/* TAB 5: HỢP ĐỒNG & LỚP */}
            {activeTab === 'hop-dong' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Hợp Đồng Lớp & Tiến Độ Đặt Cọc</h1>
                    <p className="text-xs text-neutral-500 mt-1">148 hợp đồng lớp đã ký kết — Theo dõi sĩ số, ngày chụp và công nợ</p>
                  </div>
                  <button
                    onClick={() => showNotification('Mở màn hình soạn hợp đồng lớp mới')}
                    className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tạo Hợp Đồng Lớp Mới
                  </button>
                </div>

                <div className="saas-card p-6">
                  <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
                    <table className="w-full text-left border-collapse min-w-[760px]">
                      <thead>
                        <tr className="border-b border-black/[0.05] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                          <th className="pb-3 pr-4">Mã HĐ</th>
                          <th className="pb-3 px-4">Lớp & Trường</th>
                          <th className="pb-3 px-4">Gói chụp</th>
                          <th className="pb-3 px-4 text-center">Sĩ số</th>
                          <th className="pb-3 px-4 text-center">Ngày chụp</th>
                          <th className="pb-3 px-4 text-right">Tiền cọc</th>
                          <th className="pb-3 px-4 text-right">Tổng giá trị</th>
                          <th className="pb-3 px-4 text-center">CTV phụ trách</th>
                          <th className="pb-3 pl-4 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/[0.04] text-xs">
                        {sampleContracts.map((c) => (
                          <tr key={c.id} className="hover:bg-black/[0.02] transition-colors">
                            <td className="py-3.5 pr-4 font-bold text-neutral-900">{c.id}</td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-neutral-900">{c.class}</p>
                              <p className="text-[11px] text-neutral-400">{c.school}</p>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-neutral-700">{c.package}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-neutral-800">{c.members} bạn</td>
                            <td className="py-3.5 px-4 text-center font-semibold text-neutral-800">{c.date}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-[#79ba07]">{c.deposit}</td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-neutral-900">{c.total}</td>
                            <td className="py-3.5 px-4 text-center text-neutral-600 font-medium">{c.ctv}</td>
                            <td className="py-3.5 pl-4 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: LỊCH CHỤP */}
            {activeTab === 'lich-chup' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Lịch Trình Ekip Studio Mùa Cao Điểm</h1>
                    <p className="text-xs text-neutral-500 mt-1">Phân bổ thợ theo ca chụp, địa điểm và tránh cảnh báo trùng lịch</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { date: 'Thứ 7, 26/10/2024', slots: '6 Lớp chụp', crewCount: '14 Thợ chính + 4 Flycam', location: 'Hoàng Thành Thăng Long & Văn Miếu', status: 'Đã kín lịch' },
                    { date: 'Chủ Nhật, 27/10/2024', slots: '8 Lớp chụp', crewCount: '18 Thợ chính + 6 Flycam', location: 'Phim trường Santorini & Yên Sở', status: 'Đã kín lịch' },
                    { date: 'Thứ 7, 02/11/2024', slots: '5 Lớp chụp', crewCount: '12 Thợ chính + 3 Flycam', location: 'Trường THPT Chu Văn An & Bờ Hồ', status: 'Còn 2 slot' }
                  ].map((s) => (
                    <div key={s.date} className="saas-card p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-900">{s.date}</span>
                        <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {s.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-neutral-600">
                        <p><strong>Khối lượng:</strong> {s.slots}</p>
                        <p><strong>Ekip điều phối:</strong> {s.crewCount}</p>
                        <p><strong>Địa điểm:</strong> {s.location}</p>
                      </div>
                      <button
                        onClick={() => showNotification(`Xem chi tiết lịch chụp ngày ${s.date}`)}
                        className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition-colors"
                      >
                        Xem chi tiết ca chụp
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: BÁO CÁO MÙA */}
            {activeTab === 'bao-cao' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Báo Cáo Hoạt Động & Lợi Nhuận Mùa Kỷ Yếu</h1>
                    <p className="text-xs text-neutral-500 mt-1">Doanh thu gộp, chi phí thợ, chi phí CTV sale và biên lợi nhuận thực tế</p>
                  </div>
                  <button
                    onClick={() => showNotification('Tải xuống toàn bộ tài liệu báo cáo P&L!')}
                    className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải Toàn Bộ Báo Cáo
                  </button>
                </div>

                <div className="saas-card p-6 space-y-4">
                  {[
                    { title: 'Báo cáo tổng kết Doanh thu Tháng 8/2024 (Đỉnh điểm mùa cao điểm)', size: '2.4 MB', date: '31/08/2024' },
                    { title: 'Bảng đối soát thù lao Ekip Thợ Chụp & Flycam Quý 3/2024', size: '3.1 MB', date: '15/08/2024' },
                    { title: 'Bảng quyết toán hoa hồng Đội Ngũ CTV Sale các trường', size: '1.8 MB', date: '10/08/2024' }
                  ].map((rep) => (
                    <div key={rep.title} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50 border border-black/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center text-xs font-bold">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{rep.title}</p>
                          <span className="text-[11px] text-neutral-400">{rep.date} • {rep.size}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => showNotification(`Đang tải tệp: ${rep.title}`)}
                        className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: CÀI ĐẶT HỆ THỐNG */}
            {activeTab === 'cai-dat' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-extrabold text-neutral-900">Cài Đặt Hệ Thống CRM Xoắn Media</h1>
                  <p className="text-xs text-neutral-500 mt-1">Cấu hình thông báo Zalo ZNS, webhook và định mức chi trả thợ & CTV</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="saas-card p-6 space-y-4">
                    <h2 className="text-sm font-bold text-neutral-900">Thông Tin Studio & Mùa Chụp</h2>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-neutral-500 font-medium">Tên thương hiệu</label>
                        <input
                          type="text"
                          defaultValue="Xoắn Media - Kỷ Yếu Số 1 Miền Bắc"
                          className="w-full mt-1 px-3.5 py-2 bg-neutral-100/80 rounded-xl border border-black/[0.06] text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-500 font-medium">Hotline CSKH & Khiếu Nại</label>
                        <input
                          type="text"
                          defaultValue="0988.888.999"
                          className="w-full mt-1 px-3.5 py-2 bg-neutral-100/80 rounded-xl border border-black/[0.06] text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                        />
                      </div>
                      <button
                        onClick={() => showNotification('Đã lưu thông tin Studio thành công!')}
                        className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-xl font-bold text-xs"
                      >
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </div>

                  <div className="saas-card p-6 space-y-4">
                    <h2 className="text-sm font-bold text-neutral-900">Tự Động Hóa & Thông Báo</h2>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.04]">
                        <span className="text-[10px] text-neutral-400 font-mono">ZALO_ZNS_KEY: zns_xoan_live_891</span>
                        <p className="text-xs font-bold text-neutral-800 mt-0.5">Tự động gửi Zalo thông báo lịch chụp cho lớp</p>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.04]">
                        <span className="text-[10px] text-neutral-400 font-mono">TELEGRAM_BOT: @XoanCrmAlertBot</span>
                        <p className="text-xs font-bold text-neutral-800 mt-0.5">Bắn tin nhắn khi có cọc mới & thợ trùng lịch</p>
                      </div>
                      <button
                        onClick={() => showNotification('Đã kiểm tra kết nối API: Tất cả cổng đều sẵn sàng!')}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs"
                      >
                        Kiểm Tra Kết Nối Tự Động
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <SaasAddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAddWidget={handleAddWidget}
      />

      <SaasCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <SaasProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Quick Search Spotlight Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] p-4 flex items-start justify-center pt-24 animate-in fade-in duration-200">
          <div onClick={() => setIsSearchOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-black/[0.08] shadow-2xl p-4 z-10">
            <input
              type="text"
              autoFocus
              placeholder="Tìm theo tên lớp, trường học, thợ chụp, CTV sale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-100 rounded-2xl text-sm font-semibold focus:outline-none"
            />
            <div className="mt-3 py-2 text-xs text-neutral-400 text-center">
              Gõ từ khóa để tìm kiếm nhanh theo thời gian thực hoặc nhấn phím ESC để đóng
            </div>
          </div>
        </div>
      )}

      {/* Quick Notification Drawer */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
          <div onClick={() => setIsNotificationOpen(false)} className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <h3 className="font-extrabold text-sm text-neutral-900">Thông Báo Vận Hành</h3>
                <button onClick={() => setIsNotificationOpen(false)} className="text-xs text-neutral-400 hover:text-neutral-700">
                  Đóng
                </button>
              </div>
              <div className="space-y-3 mt-4 text-xs">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.04]">
                  <p className="font-bold text-neutral-900">Hoàn thành chỉ tiêu Tháng 8</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Doanh thu tháng 8 đạt 721 triệu đ, vượt +18.6% so với kế hoạch ban đầu.</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.04]">
                  <p className="font-bold text-neutral-900">Lớp mới đã chuyển khoản cọc</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Lớp 12A1 THPT Chu Văn An đã chuyển cọc 5.000.000đ cho gói Premium.</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60">
                  <p className="font-bold text-amber-900">Cảnh báo xếp lịch thợ</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">Thợ Lê Đức Anh có 2 lịch trùng vào chiều thứ Bảy (28/10). Vui lòng phân bổ lại.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsNotificationOpen(false);
                showNotification('Đã đánh dấu đã đọc tất cả thông báo!');
              }}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl transition-colors"
            >
              Đánh dấu đã đọc tất cả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
