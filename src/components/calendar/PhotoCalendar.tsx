import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Camera,
  AlertTriangle,
  Plus,
  Layers
} from 'lucide-react';
import { BookingModal } from '../booking/BookingModal';

export const PhotoCalendar: React.FC = () => {
  const { bookings } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate] = useState(new Date(2024, 10, 1)); // Tháng 11/2024 (Mùa kỷ yếu)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayShoots, setSelectedDayShoots] = useState<Booking[] | null>(null);

  // Tạo mảng ngày cho chế độ Month View (Tháng 11 năm 2024 có 30 ngày)
  const daysInMonth = 30;
  const startDayOffset = 5; // Thứ 6 là ngày 1/11/2024

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11 (Mùa Kỷ Yếu)', 'Tháng 12'
  ];

  const getBookingsForDate = (day: number) => {
    const dateStr = `2024-11-${day < 10 ? `0${day}` : day}`;
    return bookings.filter(b => b.shootDate === dateStr);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              Calendar Lịch Chụp Kỷ Yếu & Điều Phối Thợ
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              Phát hiện cảnh báo trùng lịch thợ, quá tải ca chụp và đơn chưa gán ekip
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Switcher */}
          <div className="flex bg-white/[0.06] p-1 rounded-2xl border border-white/[0.1] text-xs font-semibold backdrop-blur-md">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'month' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'week' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'day' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Ngày
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm Lịch
          </button>
        </div>
      </div>

      {/* Month Navigation & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-panel-subtle px-5 py-3 rounded-2xl text-xs">
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm text-white tracking-wide">
            {monthNames[currentDate.getMonth()]} 2024
          </span>
          <button className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/70 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-[11px] text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]"></span> Đã cọc / Lịch chuẩn
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]"></span> ⚠️ Trùng Thợ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span> ⚠️ Chưa Gán Thợ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span> Hoàn thành
          </span>
        </div>
      </div>

      {/* Calendar Grid (Chế độ Month) */}
      {viewMode === 'month' && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.08] bg-white/[0.02] text-center text-xs font-bold text-white/50 py-3">
            <div>Chủ Nhật</div>
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div>Thứ Sáu</div>
            <div>Thứ Bảy</div>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.06] min-h-[550px]">
            {/* Empty slots trước ngày 1 */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-2 bg-black/20 min-h-[110px]" />
            ))}

            {/* Các ngày trong tháng */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayBookings = getBookingsForDate(day);
              const isToday = day === 20;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => dayBookings.length > 0 && setSelectedDayShoots(dayBookings)}
                  className={`p-2 min-h-[115px] transition-all relative flex flex-col justify-between ${
                    isToday ? 'bg-orange-500/10 font-bold' : 'hover:bg-white/[0.04]'
                  } ${dayBookings.length > 0 ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'text-white/70'
                      }`}
                    >
                      {day}
                    </span>

                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-bold bg-white/[0.1] text-white/80 border border-white/[0.12] px-1.5 py-0.2 rounded-full">
                        {dayBookings.length} ca
                      </span>
                    )}
                  </div>

                  {/* Booking Badges trong ô ngày */}
                  <div className="space-y-1.5 mt-1.5 flex-1">
                    {dayBookings.map((bk) => {
                      const hasConflict = bk.assignments.leadPhotographerName?.includes('Trùng Lịch');
                      const isUnassigned = !bk.assignments.leadPhotographerId;

                      return (
                        <div
                          key={bk.id}
                          className={`p-1.5 rounded-xl text-[10px] leading-tight font-medium border shadow-sm transition-all ${
                            hasConflict
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                              : isUnassigned
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                              : 'bg-sky-500/20 border-sky-500/30 text-sky-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate text-white">{bk.className}</span>
                            <span className="shrink-0 text-[9px] opacity-75">{bk.startTime}</span>
                          </div>

                          <div className="truncate text-white/60 text-[9px] mt-0.5">
                            📷 {bk.assignments.leadPhotographerName || '⚠️ Chưa gán thợ'}
                          </div>

                          {hasConflict && (
                            <div className="text-rose-300 font-extrabold text-[9px] flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> Trùng Thợ!
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chế độ Week / Day giản lược trực quan */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-4">
          <Layers className="w-12 h-12 text-orange-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">Chi Tiết Lịch Chụp Tuần & Giờ Trong Ngày</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
              Hiển thị phân bổ theo timeline 24 giờ cho từng Photographer để giám sát hành trình di chuyển giữa các địa điểm chụp (Trường học → Hoàng Thành → Phim trường).
            </p>
          </div>
          <button
            onClick={() => setViewMode('month')}
            className="px-4 py-2 glass-btn-secondary rounded-xl text-xs font-semibold"
          >
            ← Trở Lại Xem Toàn Cảnh Tháng
          </button>
        </div>
      )}

      {/* Modal / Dialog xem chi tiết các ca chụp trong ngày được click */}
      {selectedDayShoots && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setSelectedDayShoots(null)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-xl bg-white border border-black/[0.08] rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-xs text-neutral-900">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <h3 className="text-sm font-bold text-neutral-900">
                Chi Tiết Lịch Chụp Ngày {selectedDayShoots[0]?.shootDate} ({selectedDayShoots.length} Buổi Chụp)
              </h3>
              <button
                onClick={() => setSelectedDayShoots(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedDayShoots.map(bk => (
                <div key={bk.id} className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-neutral-900 font-bold bg-white border border-black/[0.08] px-2 py-0.5 rounded-md shadow-2xs">
                        {bk.code}
                      </span>
                      <h4 className="font-bold text-neutral-900 text-sm mt-1.5">{bk.className} - {bk.schoolName}</h4>
                    </div>
                    <span className="font-bold text-neutral-900">{bk.totalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <p className="text-neutral-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    Thời gian: <strong className="text-neutral-900">{bk.startTime} - {bk.endTime}</strong>
                  </p>
                  <p className="text-neutral-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Địa điểm: {bk.location}
                  </p>
                  <p className="text-neutral-800 font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-neutral-700" />
                    Photographer: {bk.assignments.leadPhotographerName || '⚠️ Chưa gán thợ!'}
                  </p>

                  {bk.assignments.leadPhotographerName?.includes('Trùng Lịch') && (
                    <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Cảnh báo: Thợ chụp này đã được gán cho 2 lớp chụp cùng thời điểm! Cần điều phối lại gấp.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
