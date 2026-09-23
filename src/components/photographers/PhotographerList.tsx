import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Photographer, PhotographerStatus } from '../../types';
import {
  Camera,
  Star,
  Phone,
  MapPin,
  Briefcase,
  Search
} from 'lucide-react';

export const PhotographerList: React.FC = () => {
  const { photographers, updatePhotographerStatus, bookings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photographer | null>(null);

  const filteredPhotographers = photographers.filter(p => {
    const matchSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<PhotographerStatus, { label: string; badge: string }> = {
    available: { label: 'Sẵn sàng nhận ca', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    busy: { label: 'Đang có lịch chụp', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    offline: { label: 'Tạm nghỉ', badge: 'bg-white/[0.08] text-white/60 border-white/[0.12]' },
    inactive: { label: 'Ngừng hợp tác', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-400" />
            Đội Ngũ Thợ Chụp Kỷ Yếu (Photographer Management)
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Quản lý profile, trang thiết bị máy ảnh, kỹ năng (Flycam/Video/Colorist), đơn giá và lịch trình cá nhân
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-3 py-1.5 rounded-full">
            {photographers.filter(p => p.status === 'available').length} Thợ đang sẵn sàng
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thợ, SĐT, kỹ năng (Flycam, Quay phim, Makeup)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-white/50 shrink-0">Trạng thái:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-medium text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="all">Tất cả ({photographers.length})</option>
            <option value="available">Sẵn sàng (Available)</option>
            <option value="busy">Đang bận (Busy)</option>
            <option value="offline">Tạm nghỉ (Offline)</option>
          </select>
        </div>
      </div>

      {/* Photographers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPhotographers.map((photo) => {
          const assignedBookings = bookings.filter(
            b =>
              b.assignments.leadPhotographerId === photo.id ||
              b.assignments.assistantPhotographerIds?.includes(photo.id) ||
              b.assignments.videographerId === photo.id
          );

          return (
            <div
              key={photo.id}
              className="glass-card rounded-3xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header Profile Card */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={photo.avatar}
                    alt={photo.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10 shadow-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-white text-sm truncate">{photo.fullName}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {photo.rating}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-white/40" />
                      <span>{photo.photographerType}</span>
                      <span>•</span>
                      <span>{photo.experienceYears} năm KN</span>
                    </p>

                    <div className="mt-2">
                      <select
                        value={photo.status}
                        onChange={(e) => updatePhotographerStatus(photo.id, e.target.value as PhotographerStatus)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white ${statusColors[photo.status].badge}`}
                      >
                        <option value="available">● Sẵn sàng nhận ca</option>
                        <option value="busy">● Đang có lịch chụp</option>
                        <option value="offline">● Tạm nghỉ</option>
                        <option value="inactive">● Ngừng hợp tác</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills & Devices */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Kỹ Năng:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.skills.map((skill, idx) => (
                        <span key={idx} className="bg-orange-500/15 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-orange-500/25">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Thiết Bị:</span>
                    <p className="text-white/70 text-[11px] mt-0.5 truncate font-medium">
                      📷 {photo.equipmentList.join(', ')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Khu Vực:</span>
                    <p className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white/40" />
                      {photo.activeRegions.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs">
                <div className="flex items-center justify-between text-white/60">
                  <span>Thù lao / buổi:</span>
                  <strong className="text-white font-bold">{photo.ratePerShoot.toLocaleString('vi-VN')}đ</strong>
                </div>

                <div className="flex items-center justify-between text-white/60">
                  <span>Đã hoàn thành:</span>
                  <span className="font-bold text-emerald-400">{photo.completedShootsCount} ca</span>
                </div>

                <div className="pt-1 flex gap-2">
                  <a
                    href={`tel:${photo.phone}`}
                    className="flex-1 py-2 glass-btn-secondary rounded-xl font-semibold text-center flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Gọi
                  </a>

                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="flex-1 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-xl font-semibold text-center transition-colors"
                  >
                    Lịch Chụp ({assignedBookings.length})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Xem Lịch Cá Nhân Thợ */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setSelectedPhoto(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xl" />
          <div className="relative w-full max-w-lg bg-neutral-900/90 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] p-6 space-y-4 z-10 text-xs text-white">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Lịch Chụp: {selectedPhoto.fullName}
                </h3>
                <p className="text-white/50 text-[11px] mt-0.5">SĐT: {selectedPhoto.phone} • {selectedPhoto.photographerType}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {bookings.filter(b => b.assignments.leadPhotographerId === selectedPhoto.id).length === 0 ? (
                <p className="py-8 text-center text-white/40">Thợ này hiện chưa có lịch chụp nào sắp tới.</p>
              ) : (
                bookings
                  .filter(b => b.assignments.leadPhotographerId === selectedPhoto.id)
                  .map(bk => (
                    <div key={bk.id} className="p-3.5 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{bk.className} ({bk.schoolName})</span>
                        <span className="font-mono text-sky-300 font-bold bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded text-[10px]">
                          {bk.code}
                        </span>
                      </div>
                      <p className="text-white/60">📅 Ngày: <strong className="text-white">{bk.shootDate}</strong> ({bk.startTime} - {bk.endTime})</p>
                      <p className="text-white/50 truncate">📍 Địa điểm: {bk.location}</p>
                      <p className="text-emerald-400 font-semibold">Thù lao: {selectedPhoto.ratePerShoot.toLocaleString('vi-VN')}đ</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
