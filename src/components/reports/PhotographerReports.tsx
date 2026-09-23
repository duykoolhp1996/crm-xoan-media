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
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-400" />
            Báo Cáo Hiệu Suất & Thù Lao Đội Ngũ Thợ Chụp
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Đo lường số ca chụp, doanh thu mang lại, thù lao chi trả và đánh giá chất lượng (Rating)
          </p>
        </div>

        <button
          onClick={() => alert('Đã xuất bảng lương & thù lao thợ ảnh kỷ yếu!')}
          className="px-4 py-2 glass-btn-secondary rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Xuất Bảng Thù Lao
        </button>
      </div>

      {/* Performance Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-white/45 font-bold border-b border-white/[0.08] uppercase tracking-wider">
                <th className="py-3.5 px-4">Photographer</th>
                <th className="py-3.5 px-4">Loại Hợp Tác</th>
                <th className="py-3.5 px-4">Số Ca Mùa Này</th>
                <th className="py-3.5 px-4">Giờ Làm Việc</th>
                <th className="py-3.5 px-4">Đánh Giá (Rating)</th>
                <th className="py-3.5 px-4">Doanh Thu Mang Về</th>
                <th className="py-3.5 px-4 text-right">Tổng Thù Lao Nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-medium text-white/80">
              {performanceData.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.06] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/10"
                      />
                      <div>
                        <p className="font-bold text-white">{item.fullName}</p>
                        <p className="text-[11px] text-white/45">{item.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-white/[0.08] border border-white/[0.1] text-white/80 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                      {item.photographerType}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{item.completedShootsCount} ca lịch sử</p>
                    <p className="text-[11px] text-orange-400 font-semibold">{item.currentBookingsCount} ca mùa này</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1 text-white/70">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      {item.hoursWorked} giờ
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating} / 5.0
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">
                      {(item.totalRevenueGenerated || item.ratePerShoot * 10).toLocaleString('vi-VN')}đ
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <p className="font-extrabold text-emerald-400 text-sm">
                      {item.totalEarnings.toLocaleString('vi-VN')}đ
                    </p>
                    <span className="text-[10px] text-white/40">
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
