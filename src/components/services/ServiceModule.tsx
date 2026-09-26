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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            Gói Dịch Vụ Chụp Ảnh Kỷ Yếu Xoăn Media
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Bảng cấu hình gói chụp chuẩn hóa cho Sales báo giá, tư vấn và hợp đồng với các lớp
          </p>
        </div>

        <button
          onClick={() => alert('Chức năng thêm gói chụp mới đã sẵn sàng tích hợp!')}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm"
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
              className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all relative shadow-xs ${
                isBestSeller
                  ? 'border-orange-400 ring-2 ring-orange-400/20 shadow-orange-500/10'
                  : 'border-black/[0.08] hover:border-black/[0.16]'
              }`}
            >
              {isBestSeller && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md border border-white/40">
                  🔥 BÁN CHẠY NHẤT MÙA
                </div>
              )}

              <div>
                <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base">{pkg.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{pkg.description}</p>

                <div className="mt-4 pb-4 border-b border-black/[0.06] flex items-baseline gap-1">
                  <span className="text-2xl font-black text-neutral-900">
                    {pkg.price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-xs font-medium text-neutral-500">đ / gói</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mt-4 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>Thời lượng: <strong className="text-neutral-900">{pkg.durationHours} giờ</strong> chụp</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Tối thiểu: <strong className="text-neutral-900">{pkg.minStudents} học sinh</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Ekip: <strong className="text-neutral-900">{pkg.leadPhotographersNeeded} thợ chính + {pkg.assistantsNeeded} phụ</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Số file: <strong className="text-neutral-900">{pkg.photoCountTotal}+ file gốc, {pkg.photoCountEdited} photoshop</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Film className={`w-4 h-4 shrink-0 ${pkg.videoIncluded ? 'text-rose-600' : 'text-neutral-300'}`} />
                    <span className={pkg.videoIncluded ? 'font-bold text-neutral-900' : 'text-neutral-400 line-through'}>
                      Video Highlight & Flycam 4K
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 shrink-0 ${pkg.albumIncluded ? 'text-indigo-600' : 'text-neutral-300'}`} />
                    <span className={pkg.albumIncluded ? 'font-bold text-neutral-900' : 'text-neutral-400 line-through'}>
                      Photobook Album cao cấp ép lụa
                    </span>
                  </div>
                </div>

                {pkg.extraFeesNote && (
                  <div className="mt-4 p-2.5 bg-neutral-50 rounded-xl text-[11px] text-neutral-600 leading-tight border border-black/[0.06]">
                    💡 <strong>Lưu ý:</strong> {pkg.extraFeesNote}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-black/[0.06]">
                <button
                  onClick={() => alert(`Đã sao chép liên kết báo giá ${pkg.name} để gửi Zalo cho lớp!`)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isBestSeller
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] shadow-sm active:scale-95'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
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
