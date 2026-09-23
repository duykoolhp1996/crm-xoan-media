import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Star,
  Clock,
  Download
} from 'lucide-react';

export const PhotographerReports: React.FC = () => {
  const { photographers, bookings } = useApp();

  // Thống kê hiệu suất theo thợ
  const performanceData = photographers.map(p => {
    const pBookings = bookings.filter(
      b => b.assignments.leadPhotographerId === p.id || b.assignments.videographerId === p.id
    );

    const completed = pBookings.filter(b => b.bookingStatus === 'Hoàn thành').length;
    const totalEarnings = (completed + pBookings.length) * p.ratePerShoot;
    const totalRevenueGenerated = pBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      ...p,
      currentBookingsCount: pBookings.length,
      completedCount: completed,
      totalEarnings,
      totalRevenueGenerated,
      hoursWorked: (completed + pBookings.length) * 8
    };
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Báo Cáo Hiệu Suất & Thù Lao Đội Ngũ Thợ Chụp
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Đo lường số ca chụp, doanh thu mang lại, thù lao chi trả và đánh giá chất lượng (Rating)
          </p>
        </div>

        <button
          onClick={() => alert('Đã xuất bảng lương & thù lao thợ ảnh kỷ yếu!')}
          className="px-4 py-2 bg-white hover:bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-neutral-600" /> Xuất Bảng Thù Lao
        </button>
      </div>

      {/* Performance Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/[0.02] text-neutral-500 font-bold border-b border-black/[0.06] uppercase tracking-wider">
                <th className="py-3.5 px-4">Photographer</th>
                <th className="py-3.5 px-4">Loại Hợp Tác</th>
                <th className="py-3.5 px-4">Số Ca Mùa Này</th>
                <th className="py-3.5 px-4">Giờ Làm Việc</th>
                <th className="py-3.5 px-4">Đánh Giá (Rating)</th>
                <th className="py-3.5 px-4">Doanh Thu Mang Về</th>
                <th className="py-3.5 px-4 text-right">Tổng Thù Lao Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium text-neutral-700">
              {performanceData.map((item) => (
                <tr key={item.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-black/[0.06]"
                      />
                      <div>
                        <p className="font-bold text-neutral-900">{item.fullName}</p>
                        <p className="text-[11px] text-neutral-400">{item.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-black/[0.04] border border-black/[0.06] text-neutral-700 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                      {item.photographerType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-neutral-900">{item.completedShootsCount} ca lịch sử</p>
                    <p className="text-[11px] text-orange-600 font-semibold">{item.currentBookingsCount} ca mùa này</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 text-neutral-600">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {item.hoursWorked} giờ
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {item.rating} / 5.0
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-neutral-900">
                      {(item.totalRevenueGenerated || item.ratePerShoot * 10).toLocaleString('vi-VN')}đ
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <p className="font-extrabold text-emerald-700 text-sm">
                      {item.totalEarnings.toLocaleString('vi-VN')}đ
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      Đơn giá: {item.ratePerShoot.toLocaleString('vi-VN')}đ/buổi
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
