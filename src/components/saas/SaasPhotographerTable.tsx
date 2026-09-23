import React, { useState } from 'react';
import { CRM_PHOTOGRAPHERS, PhotographerMember } from '../../data/crmBusinessData';
import { Camera, Star, Phone, AlertTriangle, CheckCircle2, Clock, Plus, Search, Filter } from 'lucide-react';

interface SaasPhotographerTableProps {
  onAssignCrew?: (photographer: PhotographerMember) => void;
}

export const SaasPhotographerTable: React.FC<SaasPhotographerTableProps> = ({ onAssignCrew }) => {
  const [photographers] = useState<PhotographerMember[]>(CRM_PHOTOGRAPHERS);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredPhotographers = photographers.filter((p) => {
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.activeRegions.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const getStatusBadge = (status: PhotographerMember['status']) => {
    switch (status) {
      case 'Sẵn sàng':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Sẵn sàng
          </span>
        );
      case 'Đang chụp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            Đang chụp
          </span>
        );
      case 'Trùng lịch':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Trùng lịch (Cần xử lý)
          </span>
        );
      case 'Tạm nghỉ':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
            Tạm nghỉ
          </span>
        );
    }
  };

  return (
    <div className="saas-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#B8F23D]/30 flex items-center justify-center text-neutral-900 font-bold">
              <Camera className="w-4 h-4 text-neutral-900" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              Quản Lý Đội Ngũ Thợ & Ekip Chụp
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Tổng cộng 38 thợ/ekip — Điều phối lịch chụp, theo dõi rating và kiểm soát thù lao buổi chụp
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 text-xs font-semibold">
          {['all', 'Thợ chính', 'Flycam', 'Quay phim', 'Makeup', 'Thợ phụ'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'bg-black/[0.04] text-neutral-600 hover:text-neutral-900 hover:bg-black/[0.07]'
              }`}
            >
              {role === 'all' ? 'Tất cả vai trò' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thợ, số điện thoại hoặc khu vực (Cầu Giấy, Hoàn Kiếm...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 border border-black/[0.06] text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#B8F23D] focus:bg-white transition-all"
          />
        </div>
        <span className="text-xs text-neutral-500 font-medium shrink-0">
          Hiển thị: <strong>{filteredPhotographers.length}</strong> thợ
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Thợ / Ekip</th>
              <th className="pb-3 px-4">Vai trò</th>
              <th className="pb-3 px-4 text-center">Số buổi chụp</th>
              <th className="pb-3 px-4 text-center">Đánh giá</th>
              <th className="pb-3 px-4 text-right">Thù lao / buổi</th>
              <th className="pb-3 px-4 text-right">Chờ quyết toán</th>
              <th className="pb-3 px-4 text-center">Trạng thái</th>
              <th className="pb-3 pl-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {filteredPhotographers.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-black/[0.02] transition-colors group"
              >
                {/* Avatar & Name */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar}
                      alt={p.fullName}
                      className="w-9 h-9 rounded-2xl object-cover border border-black/[0.08] shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <p className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                        {p.fullName}
                      </p>
                      <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        {p.phone} • {p.activeRegions}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full text-[11px]">
                    {p.role}
                  </span>
                </td>

                {/* Completed Shoots */}
                <td className="py-3.5 px-4 text-center font-bold text-neutral-800">
                  {p.completedShoots} <span className="text-[10px] font-normal text-neutral-400">lớp</span>
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1 font-bold text-neutral-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60 text-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{p.rating.toFixed(2)}</span>
                  </div>
                </td>

                {/* Payout per shoot */}
                <td className="py-3.5 px-4 text-right font-semibold text-neutral-900">
                  {p.payoutPerShoot}
                </td>

                {/* Pending Payout */}
                <td className="py-3.5 px-4 text-right font-extrabold text-neutral-900">
                  {p.pendingPayout}
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 text-center">
                  {getStatusBadge(p.status)}
                </td>

                {/* Action */}
                <td className="py-3.5 pl-4 text-right">
                  <button
                    onClick={() => onAssignCrew?.(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] text-[11px] font-bold shadow-sm transition-all active:scale-95"
                  >
                    Gán lịch
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
