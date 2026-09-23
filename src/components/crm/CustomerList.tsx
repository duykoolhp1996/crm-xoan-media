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

  // Stage badges colors on light glass
  const stageBadges: Record<string, string> = {
    'New Lead': 'bg-neutral-100 text-neutral-700 border-neutral-200',
    'Đang tư vấn': 'bg-sky-50 text-sky-700 border-sky-200',
    'Đã gửi báo giá': 'bg-purple-50 text-purple-700 border-purple-200',
    'Đã đặt cọc': 'bg-amber-50 text-amber-800 border-amber-200',
    'Đã Booking': 'bg-blue-50 text-blue-700 border-blue-200',
    'Hoàn thành': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Lost': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-900" />
            Hồ Sơ Khách Hàng & Leads Kỷ Yếu
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Quản lý tập trung thông tin lớp, ban đại diện, nhu cầu concept và nguồn tiếp cận
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
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
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, SĐT, trường (Ams, Chu Văn An...), lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 shrink-0">Nguồn:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
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
          <span className="text-xs font-semibold text-neutral-500 shrink-0">Trạng thái:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
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
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-400 font-bold border-b border-black/[0.05] uppercase tracking-wider">
                <th className="py-3.5 px-4">Lớp & Trường Học</th>
                <th className="py-3.5 px-4">Người Đại Diện</th>
                <th className="py-3.5 px-4">Gói & Concept</th>
                <th className="py-3.5 px-4">Nguồn Tiếp Cận</th>
                <th className="py-3.5 px-4">Giai Đoạn</th>
                <th className="py-3.5 px-4">Tài Chính</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium text-neutral-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCustomerId(cust.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-[#B8F23D]/30 border border-[#B8F23D]/50 text-neutral-900 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {cust.className.slice(0, 3)}
                        </span>
                        <div>
                          <p className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                            {cust.className}
                          </p>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <School className="w-3 h-3 text-neutral-400" /> {cust.schoolName}
                          </p>
                          {(cust.district || cust.city || cust.region) && (
                            <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                              <span>{cust.district ? `${cust.district}, ` : ''}{cust.city || cust.region}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-neutral-900">{cust.name}</p>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-neutral-400" /> {cust.phone} ({cust.representativeRole})
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-neutral-900">{cust.servicePackageName || 'Chưa chọn'}</p>
                      <p className="text-[11px] text-[#79ba07] font-semibold">Concept: {cust.concept}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {cust.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                        stageBadges[cust.pipelineStage] || 'bg-neutral-100 text-neutral-700 border-neutral-200'
                      }`}>
                        {cust.pipelineStage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-neutral-900">
                          {(cust.totalRevenue || cust.expectedBudget).toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Đã cọc: {(cust.paidAmount || 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(cust.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-[#B8F23D] text-neutral-800 text-[11px] font-bold transition-all"
                      >
                        Chi tiết
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360 Detail Drawer / Modal */}
      {selectedCustomerId && (
        <CustomerDetail360
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Add Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
