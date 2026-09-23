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
  Layers,
  CheckCircle2,
  X,
  UserCheck
} from 'lucide-react';
import { BookingModal } from '../booking/BookingModal';

export const PhotoCalendar: React.FC = () => {
  const { bookings } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1)); // Tháng 11/2024 (Mùa kỷ yếu)
  const [selectedDay, setSelectedDay] = useState<number>(20); // Mặc định ngày 20
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>('2024-11-20');
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOffset = new Date(year, month, 1).getDay(); // 0: CN, 1: T2...

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11 (Mùa Kỷ Yếu)', 'Tháng 12'
  ];

  const getDateStr = (day: number) => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getBookingsForDate = (day: number) => {
    const dateStr = getDateStr(day);
    return bookings.filter(b => b.shootDate === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const dateStr = getDateStr(day);
    setModalDate(dateStr);
    setIsDayDetailsOpen(true);
  };

  const handleCreateBookingForSelectedDay = (dateStr?: string) => {
    setModalDate(dateStr || getDateStr(selectedDay));
    setIsDayDetailsOpen(false);
    setIsModalOpen(true);
  };

  const selectedDateBookings = getBookingsForDate(selectedDay);
  const selectedDateStr = getDateStr(selectedDay);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-black/[0.08] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-extrabold text-sm shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
              Calendar Lịch Chụp Kỷ Yếu & Điều Phối Thợ
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Chọn ngày bất kỳ để xem ca chụp, đặt lịch mới hoặc phát hiện cảnh báo trùng lịch thợ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Switcher */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-black/[0.06] text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'month' ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'week' ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'day' ? 'bg-neutral-900 text-[#B8F23D] shadow-sm font-bold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Ngày ({selectedDay})
            </button>
          </div>

          <button
            onClick={() => handleCreateBookingForSelectedDay()}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Lịch
          </button>
        </div>
      </div>

      {/* Month Navigation & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-black/[0.06] shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] text-neutral-700 hover:text-neutral-900 transition-colors font-bold"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-neutral-900 tracking-wide min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] text-neutral-700 hover:text-neutral-900 transition-colors font-bold"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-[11px] text-neutral-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Đã cọc / Lịch chuẩn
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> ⚠️ Trùng Thợ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ⚠️ Chưa Gán Thợ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8F23D] border border-neutral-400"></span> Ngày Hôm Nay
          </span>
        </div>
      </div>

      {/* Calendar Grid (Chế độ Month) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-black/[0.08] overflow-hidden shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-black/[0.06] bg-neutral-50/80 text-center text-xs font-bold text-neutral-600 py-3">
            <div>Chủ Nhật</div>
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div>Thứ Sáu</div>
            <div>Thứ Bảy</div>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-black/[0.06] min-h-[550px]">
            {/* Empty slots trước ngày 1 */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-2 bg-neutral-50/40 min-h-[115px]" />
            ))}

            {/* Các ngày trong tháng */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayBookings = getBookingsForDate(day);
              const isToday = day === 20 && month === 10 && year === 2024;
              const isSelected = day === selectedDay;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleSelectDay(day)}
                  className={`p-2.5 min-h-[115px] transition-all relative flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'ring-2 ring-neutral-900 bg-neutral-50 z-10 shadow-sm'
                      : isToday
                      ? 'bg-[#B8F23D]/20 hover:bg-[#B8F23D]/30'
                      : 'hover:bg-neutral-50/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isSelected
                          ? 'bg-neutral-900 text-[#B8F23D]'
                          : isToday
                          ? 'bg-neutral-900 text-white font-extrabold'
                          : 'text-neutral-700'
                      }`}
                    >
                      {day}
                    </span>

                    {dayBookings.length > 0 ? (
                      <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-black/[0.08] px-2 py-0.5 rounded-full">
                        {dayBookings.length} ca
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-neutral-400 transition-opacity">
                        + Chọn
                      </span>
                    )}
                  </div>

                  {/* Booking Badges trong ô ngày */}
                  <div className="space-y-1.5 mt-1.5 flex-1">
                    {dayBookings.slice(0, 2).map((bk) => {
                      const hasConflict = bk.assignments.leadPhotographerName?.includes('Trùng Lịch');
                      const isUnassigned = !bk.assignments.leadPhotographerId;

                      return (
                        <div
                          key={bk.id}
                          className={`p-1.5 rounded-xl text-[10px] leading-tight font-medium border shadow-2xs transition-all ${
                            hasConflict
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : isUnassigned
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-neutral-100/90 border-neutral-200 text-neutral-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate text-neutral-900">{bk.className}</span>
                            <span className="shrink-0 text-[9px] text-neutral-500">{bk.startTime}</span>
                          </div>

                          <div className="truncate text-neutral-600 text-[9px] mt-0.5">
                            📷 {bk.assignments.leadPhotographerName || '⚠️ Chưa gán thợ'}
                          </div>

                          {hasConflict && (
                            <div className="text-rose-600 font-extrabold text-[9px] flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-500" /> Trùng Thợ!
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {dayBookings.length > 2 && (
                      <p className="text-[9px] font-bold text-neutral-500 text-center">
                        +{dayBookings.length - 2} ca khác
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chế độ Day View (Xem chi tiết ngày được chọn) */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-sm space-y-5">
          {/* Day Selector Strip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-700">Chọn nhanh ngày trong tháng:</span>
              <span className="text-xs text-neutral-500 font-medium">Đang chọn ngày: <strong>{selectedDay}/{month + 1}/{year}</strong></span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const bks = getBookingsForDate(d);
                const isSel = d === selectedDay;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`flex flex-col items-center justify-center min-w-[42px] py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isSel
                        ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                        : bks.length > 0
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <span>{d}</span>
                    {bks.length > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSel ? 'bg-[#B8F23D]' : 'bg-neutral-900'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline chi tiết các ca chụp trong ngày */}
          <div className="pt-3 border-t border-black/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Lịch Chụp Ngày {selectedDay}/{month + 1}/{year} ({selectedDateBookings.length} ca chụp)
                </h3>
                <p className="text-xs text-neutral-500">
                  Bấm "+ Thêm Lịch" để xếp lịch chụp kỷ yếu mới vào ngày này
                </p>
              </div>
              <button
                onClick={() => handleCreateBookingForSelectedDay()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Đặt Lịch Ngày Này
              </button>
            </div>

            {selectedDateBookings.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-black/[0.04]">
                <CalendarIcon className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p className="font-semibold text-neutral-600">Ngày {selectedDay}/{month + 1}/{year} chưa có ca chụp nào.</p>
                <p className="text-[11px] text-neutral-400 mt-1">Ekip thợ đang trống lịch 100%, sẵn sàng nhận booking!</p>
                <button
                  onClick={() => handleCreateBookingForSelectedDay()}
                  className="mt-3 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  + Tạo Booking Ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDateBookings.map((bk) => (
                  <div key={bk.id} className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-neutral-900 font-bold bg-white border border-black/[0.08] px-2 py-0.5 rounded text-[10px] shadow-2xs">
                          {bk.code}
                        </span>
                        <h4 className="font-bold text-neutral-900 text-sm mt-1">{bk.className} - {bk.schoolName}</h4>
                      </div>
                      <span className="text-xs font-bold text-neutral-900 bg-white px-2.5 py-1 rounded-full border border-black/[0.06]">
                        {bk.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-600">
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        Thời gian: <strong className="text-neutral-900">{bk.startTime} - {bk.endTime}</strong>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        Địa điểm: {bk.location}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-neutral-600" />
                        Photographer: <strong className="text-neutral-900">{bk.assignments.leadPhotographerName || '⚠️ Chưa gán thợ'}</strong>
                      </p>
                    </div>

                    {bk.assignments.leadPhotographerName?.includes('Trùng Lịch') && (
                      <div className="p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        Cảnh báo: Thợ chụp này bị trùng giờ chụp với đơn khác!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chế độ Week View (Tuần) */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              Tổng Quan Tuần (Các Ngày 18 - 24 / Tháng {month + 1})
            </h3>
            <span className="text-xs text-neutral-500">Bấm vào bất kỳ ngày nào để xem hoặc đặt lịch</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[18, 19, 20, 21, 22, 23, 24].map((dayNum) => {
              const bks = getBookingsForDate(dayNum);
              const isSel = dayNum === selectedDay;
              return (
                <div
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                    isSel
                      ? 'bg-neutral-100 border-neutral-900 ring-2 ring-neutral-900 shadow-sm'
                      : 'bg-neutral-50 border-black/[0.06] hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${isSel ? 'bg-neutral-900 text-[#B8F23D]' : 'text-neutral-800'}`}>
                      {dayNum}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500">
                      {bks.length} ca
                    </span>
                  </div>

                  <div className="space-y-1 my-2 flex-1">
                    {bks.slice(0, 2).map(b => (
                      <div key={b.id} className="text-[10px] bg-white border border-black/[0.06] p-1.5 rounded-lg truncate font-semibold text-neutral-800">
                        {b.className} ({b.startTime})
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateBookingForSelectedDay(getDateStr(dayNum));
                    }}
                    className="text-[10px] font-bold text-neutral-700 bg-white hover:bg-neutral-900 hover:text-[#B8F23D] py-1 px-2 rounded-lg border border-black/[0.08] transition-colors text-center"
                  >
                    + Đặt lịch
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal / Dialog xem chi tiết ngày được click (Khi click vào bất kỳ ngày nào) */}
      {isDayDetailsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setIsDayDetailsOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-xl bg-white border border-black/[0.08] rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-xs text-neutral-900">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-bold text-xs">
                  {selectedDay}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Lịch Chụp Ngày {selectedDay}/{month + 1}/{year}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {selectedDateBookings.length > 0 ? `${selectedDateBookings.length} ca chụp kỷ yếu đã lên lịch` : 'Chưa có ca chụp nào trong ngày này'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDayDetailsOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto custom-scrollbar">
              {selectedDateBookings.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-60" />
                  <p className="text-neutral-700 font-bold text-sm">Ngày này chưa có ca chụp nào!</p>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Ekip thợ đang sẵn sàng. Bạn có thể tạo lịch chụp kỷ yếu mới ngay lập tức cho lớp này.
                  </p>
                </div>
              ) : (
                selectedDateBookings.map(bk => (
                  <div key={bk.id} className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-neutral-900 font-bold bg-white border border-black/[0.08] px-2 py-0.5 rounded-md shadow-2xs">
                          {bk.code}
                        </span>
                        <h4 className="font-bold text-neutral-900 text-sm mt-1.5">{bk.className} - {bk.schoolName}</h4>
                      </div>
                      <span className="font-bold text-neutral-900 bg-white px-2.5 py-1 rounded-full border border-black/[0.06]">
                        {bk.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
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
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsDayDetailsOpen(false);
                  setViewMode('day');
                }}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
              >
                Xem Timeline Ngày
              </button>
              <button
                type="button"
                onClick={() => handleCreateBookingForSelectedDay()}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Đặt Lịch Chụp Ngày Này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={modalDate}
      />
    </div>
  );
};
