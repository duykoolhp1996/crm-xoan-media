import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, PipelineStage, LeadSource } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  School,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { CustomerDetail360 } from './CustomerDetail360';
import { CustomerModal } from './CustomerModal';

export const CustomerList: React.FC = () => {
  const {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    updateCustomerStage
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lọc dữ liệu
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.region && c.region.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSource = selectedSource === 'all' || c.source === selectedSource;
      const matchStage = selectedStage === 'all' || c.pipelineStage === selectedStage;

      return matchSearch && matchSource && matchStage;
    });
  }, [customers, searchTerm, selectedSource, selectedStage]);

  // Stage badges colors on dark glass
  const stageBadges: Record<string, string> = {
    'New Lead': 'bg-white/[0.08] text-white/70 border-white/[0.15]',
    'Đang tư vấn': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'Đã gửi báo giá': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Đã đặt cọc': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'Đã Booking': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Hoàn thành': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Lost': 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Hồ Sơ Khách Hàng & Leads Kỷ Yếu
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Quản lý tập trung thông tin lớp, ban đại diện, nhu cầu concept và nguồn tiếp cận
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Khách Hàng Mới
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel-subtle p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, SĐT, trường (Ams, Chu Văn An...), lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/50 shrink-0">Nguồn:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-medium text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="all">Tất cả nguồn ({customers.length})</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Khách hàng cũ">Khách hàng cũ</option>
          </select>
        </div>

        {/* Stage Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/50 shrink-0">Trạng thái:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-medium text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="all">Tất cả giai đoạn</option>
            <option value="New Lead">New Lead</option>
            <option value="Đang tư vấn">Đang tư vấn</option>
            <option value="Đã gửi báo giá">Đã gửi báo giá</option>
            <option value="Đã đặt cọc">Đã đặt cọc</option>
            <option value="Đã Booking">Đã Booking</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-white/45 font-bold border-b border-white/[0.08] uppercase tracking-wider">
                <th className="py-3.5 px-4">Lớp & Trường Học</th>
                <th className="py-3.5 px-4">Người Đại Diện</th>
                <th className="py-3.5 px-4">Gói & Concept</th>
                <th className="py-3.5 px-4">Nguồn Tiếp Cận</th>
                <th className="py-3.5 px-4">Giai Đoạn</th>
                <th className="py-3.5 px-4">Tài Chính</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-medium text-white/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-white/40">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-white/[0.06] transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomerId(cust.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {cust.className.slice(0, 3)}
                        </span>
                        <div>
                          <p className="font-bold text-white group-hover:text-orange-300 transition-colors">
                            {cust.className}
                          </p>
                          <p className="text-[11px] text-white/45 flex items-center gap-1">
                            <School className="w-3 h-3 text-white/30" /> {cust.schoolName}
                          </p>
                          {(cust.district || cust.city || cust.region) && (
                            <p className="text-[10px] text-orange-400/80 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-orange-400/70" />
                              <span>{cust.district ? `${cust.district}, ` : ''}{cust.city || cust.region}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white/90">{cust.name}</p>
                      <p className="text-[11px] text-white/45 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-white/30" /> {cust.phone} ({cust.representativeRole})
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white/90">{cust.servicePackageName || 'Chưa chọn'}</p>
                      <p className="text-[11px] text-orange-400 font-medium">Concept: {cust.concept}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium bg-white/[0.08] border border-white/[0.1] text-white/80 px-2 py-0.5 rounded-full text-[11px]">
                        {cust.source}
                      </span>
                      {cust.campaignName && (
                        <p className="text-[10px] text-white/40 mt-1 truncate max-w-[120px]">
                          {cust.campaignName}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          stageBadges[cust.pipelineStage] || 'bg-white/[0.08] text-white/70 border-white/[0.1]'
                        }`}
                      >
                        {cust.pipelineStage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">
                        {cust.expectedBudget.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        Đã cọc: {cust.paidAmount.toLocaleString('vi-VN')}đ
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(cust.id);
                        }}
                        className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-white/40 hover:text-white inline-flex items-center justify-center transition-colors"
                        title="Xem Customer 360"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-xs text-white/45">
          <span>Hiển thị <strong className="text-white/80">{filteredCustomers.length}</strong> / {customers.length} khách hàng</span>
          <span>Click vào dòng để mở chi tiết <strong className="text-white/80">Customer 360</strong></span>
        </div>
      </div>

      {/* Customer 360 Drawer */}
      {selectedCustomerId && (
        <CustomerDetail360
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Create Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
