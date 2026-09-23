import React, { useState } from 'react';
import { CRM_CTV_SALES, CtvSaleMember } from '../../data/crmBusinessData';
import { Award, TrendingUp, Phone, School, DollarSign, CheckCircle2, Clock, Search, ArrowUpRight } from 'lucide-react';

interface SaasCtvSalesTableProps {
  onPayCommission?: (ctv: CtvSaleMember) => void;
}

export const SaasCtvSalesTable: React.FC<SaasCtvSalesTableProps> = ({ onPayCommission }) => {
  const [ctvList] = useState<CtvSaleMember[]>(CRM_CTV_SALES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCtv = ctvList.filter((ctv) => {
    const matchesSearch =
      ctv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctv.schoolInCharge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ctv.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ctv.payoutStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-[#B8F23D] text-neutral-950 font-black text-xs flex items-center justify-center shadow-sm">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-800 font-bold text-xs flex items-center justify-center">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 font-semibold text-xs flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  return (
    <div className="saas-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold">
              <Award className="w-4 h-4 text-[#B8F23D]" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Bảng Xếp Hạng & Quản Lý Đội Ngũ CTV Sale
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Đội ngũ cộng tác viên học sinh/sinh viên các trường THPT & Đại học — Tỷ lệ chốt và hoa hồng
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {['all', 'Chờ đối soát', 'Đã quyết toán'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              {status === 'all' ? 'Tất cả trạng thái' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên CTV, mã (CTV-01) hoặc trường phụ trách (Ams, NEU, Chu Văn An...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 border border-black/[0.06] text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#B8F23D] focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-neutral-500 font-medium shrink-0">
          Tổng cộng: <strong>{filteredCtv.length}</strong> CTV
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <th className="pb-3 pr-2 text-center w-12">Hạng</th>
              <th className="pb-3 px-4">Cộng tác viên</th>
              <th className="pb-3 px-4">Trường phụ trách</th>
              <th className="pb-3 px-4 text-center">Lead / Chốt</th>
              <th className="pb-3 px-4 text-center">Tỷ lệ chốt</th>
              <th className="pb-3 px-4 text-right">Doanh số tạo ra</th>
              <th className="pb-3 px-4 text-right">Hoa hồng tích lũy</th>
              <th className="pb-3 px-4 text-center">Trạng thái chi</th>
              <th className="pb-3 pl-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {filteredCtv.map((ctv) => (
              <tr
                key={ctv.id}
                className="hover:bg-neutral-50 transition-colors group"
              >
                {/* Rank */}
                <td className="py-3.5 pr-2 text-center">
                  <div className="flex justify-center">
                    {getRankBadge(ctv.ranking)}
                  </div>
                </td>

                {/* Avatar & Name */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={ctv.avatar}
                      alt={ctv.fullName}
                      className="w-9 h-9 rounded-2xl object-cover border border-black/[0.08] shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                          {ctv.fullName}
                        </p>
                        <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {ctv.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {ctv.phone}
                      </p>
                    </div>
                  </div>
                </td>

                {/* School */}
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                    <School className="w-3 h-3 text-neutral-500" />
                    {ctv.schoolInCharge}
                  </span>
                </td>

                {/* Leads / Closed */}
                <td className="py-3.5 px-4 text-center">
                  <span className="font-bold text-neutral-900">{ctv.classesClosed}</span>
                  <span className="text-neutral-400"> / {ctv.leadsBrought}</span>
                  <span className="text-[10px] text-neutral-400 block">lớp đã chốt</span>
                </td>

                {/* Conversion Rate */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/50">
                    {ctv.conversionRate}
                  </span>
                </td>

                {/* Revenue Generated */}
                <td className="py-3.5 px-4 text-right">
                  <p className="font-extrabold text-neutral-900">{ctv.revenueGenerated}</p>
                  <p className="text-[10px] text-neutral-400">doanh số mang lại</p>
                </td>

                {/* Commission */}
                <td className="py-3.5 px-4 text-right">
                  <p className="font-extrabold text-[#79ba07] text-sm">{ctv.commissionEarned}</p>
                  <p className="text-[10px] text-neutral-400">mức {ctv.commissionRate}</p>
                </td>

                {/* Payout Status */}
                <td className="py-3.5 px-4 text-center">
                  {ctv.payoutStatus === 'Đã quyết toán' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Đã quyết toán
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Chờ đối soát
                    </span>
                  )}
                </td>

                {/* Action */}
                <td className="py-3.5 pl-4 text-right">
                  <button
                    onClick={() => onPayCommission?.(ctv)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] text-[11px] font-bold shadow-sm transition-all active:scale-95"
                  >
                    Chi trả
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
