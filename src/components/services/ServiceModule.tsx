import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServicePackage } from '../../types';
import {
  Layers,
  CheckCircle2,
  Clock,
  Users,
  Camera,
  Film,
  BookOpen,
  Plus
} from 'lucide-react';

export const ServiceModule: React.FC = () => {
  const { servicePackages } = useApp();
  const [packages] = useState<ServicePackage[]>(servicePackages);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" />
            Gói Dịch Vụ Chụp Ảnh Kỷ Yếu Xoắn Media
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Bảng cấu hình gói chụp chuẩn hóa cho Sales báo giá, tư vấn và hợp đồng với các lớp
          </p>
        </div>

        <button
          onClick={() => alert('Chức năng thêm gói chụp mới đã sẵn sàng tích hợp!')}
          className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Gói Mới
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => {
          const isBestSeller = pkg.name.includes('STANDARD');

          return (
            <div
              key={pkg.id}
              className={`rounded-3xl p-5 border flex flex-col justify-between transition-all relative ${
                isBestSeller
                  ? 'bg-gradient-to-b from-orange-500/15 via-white/[0.05] to-white/[0.03] backdrop-blur-2xl border-orange-500/40 shadow-[0_16px_40px_rgba(249,115,22,0.2)]'
                  : 'glass-card'
              }`}
            >
              {isBestSeller && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-lg border border-white/20">
                  🔥 BÁN CHẠY NHẤT MÙA
                </div>
              )}

              <div>
                <h3 className="font-extrabold text-white text-sm sm:text-base">{pkg.name}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{pkg.description}</p>

                <div className="mt-4 pb-4 border-b border-white/[0.08] flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    {pkg.price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-xs font-medium text-white/50">đ / gói</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mt-4 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Thời lượng: <strong className="text-white">{pkg.durationHours} giờ</strong> chụp</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Tối thiểu: <strong className="text-white">{pkg.minStudents} học sinh</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Ekip: <strong className="text-white">{pkg.leadPhotographersNeeded} thợ chính + {pkg.assistantsNeeded} phụ</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Số file: <strong className="text-white">{pkg.photoCountTotal}+ file gốc, {pkg.photoCountEdited} photoshop</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Film className={`w-4 h-4 shrink-0 ${pkg.videoIncluded ? 'text-rose-400' : 'text-white/25'}`} />
                    <span className={pkg.videoIncluded ? 'font-bold text-white' : 'text-white/35 line-through'}>
                      Video Highlight & Flycam 4K
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 shrink-0 ${pkg.albumIncluded ? 'text-indigo-400' : 'text-white/25'}`} />
                    <span className={pkg.albumIncluded ? 'font-bold text-white' : 'text-white/35 line-through'}>
                      Photobook Album cao cấp ép lụa
                    </span>
                  </div>
                </div>

                {pkg.extraFeesNote && (
                  <div className="mt-4 p-2.5 bg-white/[0.04] rounded-xl text-[11px] text-white/50 leading-tight border border-white/[0.06]">
                    💡 <strong>Lưu ý:</strong> {pkg.extraFeesNote}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => alert(`Đã sao chép liên kết báo giá ${pkg.name} để gửi Zalo cho lớp!`)}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isBestSeller
                      ? 'glass-btn-primary'
                      : 'glass-btn-secondary'
                  }`}
                >
                  Sao Chép Báo Giá Gửi Khách
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
