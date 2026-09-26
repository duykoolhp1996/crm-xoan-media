import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Photographer, PhotographerStatus } from '../../types';
import { PhotographerModal } from './PhotographerModal';
import {
  Camera,
  Star,
  Phone,
  MapPin,
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';

export const PhotographerList: React.FC = () => {
  const { photographers, updatePhotographerStatus, bookings, feedbacks, deletePhotographer, currentUser, currentRole } = useApp();

  const isPhotographerUser = currentRole === 'photographer' || currentUser?.role === 'photographer';
  const currentPhotographer = useMemo(() => {
    if (!isPhotographerUser) return null;
    return (
      photographers.find(
        p =>
          p.id === currentUser.id ||
          p.fullName.toLowerCase() === currentUser.name.toLowerCase() ||
          (currentUser.phone && p.phone === currentUser.phone)
      ) || photographers[0]
    );
  }, [photographers, currentUser, isPhotographerUser]);

  const isPhotoLead = useMemo(() => {
    if (!isPhotographerUser || !currentPhotographer) return false;
    return Boolean(
      currentPhotographer.notes?.toUpperCase().includes('LEAD') ||
      currentPhotographer.fullName.toLowerCase().includes('lead')
    );
  }, [isPhotographerUser, currentPhotographer]);

  const myTeam = useMemo(() => {
    if (!currentPhotographer) return 'Toàn Studio';
    if (
      currentPhotographer.activeRegions?.includes('Hà Nội') ||
      currentPhotographer.notes?.toUpperCase().includes('HÀ NỘI')
    ) {
      return 'Hà Nội';
    }
    return 'Hải Phòng';
  }, [currentPhotographer]);

  // Lead xem được thành viên trong Team mình; Thành viên thường chỉ xem mình
  const accessiblePhotographers = useMemo(() => {
    if (!isPhotographerUser) return photographers;
    if (isPhotoLead) {
      return photographers.filter(
        p =>
          p.activeRegions?.includes(myTeam) ||
          p.notes?.toUpperCase().includes(myTeam.toUpperCase())
      );
    }
    return currentPhotographer ? [currentPhotographer] : [];
  }, [photographers, isPhotographerUser, isPhotoLead, myTeam, currentPhotographer]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photographer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);

  const filteredPhotographers = accessiblePhotographers.filter(p => {
    const matchSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<PhotographerStatus, { label: string; badge: string }> = {
    available: { label: 'Sẵn sàng nhận ca', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    busy: { label: 'Đang có lịch chụp', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    offline: { label: 'Tạm nghỉ', badge: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
    inactive: { label: 'Ngừng hợp tác', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const handleOpenAdd = () => {
    setEditingPhotographer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Photographer) => {
    setEditingPhotographer(p);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            Đội Ngũ Thợ Chụp Kỷ Yếu (Photographer Management)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Quản lý profile, trang thiết bị máy ảnh, kỹ năng (Flycam/Video/Colorist), đơn giá và lịch trình cá nhân
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full">
            {photographers.filter(p => p.status === 'available').length} Thợ đang sẵn sàng
          </span>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Nhân Sự Mới
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-black/[0.08] p-3.5 sm:p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên thợ, SĐT, kỹ năng (Flycam, Quay phim, Makeup)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-neutral-500 shrink-0">Trạng thái:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
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
              b.assignments.videographerId === photo.id ||
              b.assignments.leadPhotographerName === photo.fullName
          );

          const completedCount = assignedBookings.filter(b =>
            ['Hoàn thành', 'Đã chụp', 'Đã bàn giao'].includes(b.bookingStatus)
          ).length;

          // Tính điểm đánh giá thực tế từ phản hồi
          const relatedFeedbacks = feedbacks.filter(
            f =>
              (f.bookingId && assignedBookings.some(b => b.id === f.bookingId)) ||
              f.photographerMentioned?.some(m => m.toLowerCase().includes(photo.fullName.toLowerCase()))
          );

          let displayRating: number | null = null;
          if (relatedFeedbacks.length > 0) {
            const sum = relatedFeedbacks.reduce(
              (s, f) => s + (f.aspects?.photographerCrew || f.rating || 5),
              0
            );
            displayRating = Number((sum / relatedFeedbacks.length).toFixed(1));
          } else if (photo.rating && photo.rating > 0) {
            displayRating = photo.rating;
          }

          return (
            <div
              key={photo.id}
              className="bg-white border border-black/[0.08] rounded-3xl p-5 space-y-4 flex flex-col justify-between shadow-xs hover:border-black/[0.16] transition-all"
            >
              <div>
                {/* Header Profile Card */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={photo.avatar}
                    alt={photo.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-black/[0.06] shadow-sm shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-neutral-900 text-sm truncate">{photo.fullName}</h3>
                      {displayRating ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {displayRating}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                          Thợ mới
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-neutral-400" />
                      <span>{photo.photographerType}</span>
                      <span>•</span>
                      <span>{photo.experienceYears} năm KN</span>
                    </p>

                    <div className="mt-2">
                      <select
                        value={photo.status}
                        onChange={(e) => updatePhotographerStatus(photo.id, e.target.value as PhotographerStatus)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${statusColors[photo.status].badge}`}
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
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Kỹ Năng:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.skills.map((skill, idx) => (
                        <span key={idx} className="bg-orange-50 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-orange-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Thiết Bị:</span>
                    <p className="text-neutral-700 text-[11px] mt-0.5 truncate font-medium">
                      📷 {photo.equipmentList.join(', ')}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Khu Vực:</span>
                    <p className="text-neutral-700 text-[11px] mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {photo.activeRegions.join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-black/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Cơ chế lương:</span>
                  <div className="text-right">
                    <strong className="text-neutral-900 font-bold font-mono">
                      {photo.salaryType === 'monthly'
                        ? `${(photo.monthlySalary || 15000000).toLocaleString('vi-VN')}đ`
                        : `${photo.ratePerShoot.toLocaleString('vi-VN')}đ`}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block font-medium">
                      {photo.salaryType === 'monthly' ? '📅 Lương tháng' : '📸 Theo buổi'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-neutral-500">
                  <span>Đã hoàn thành:</span>
                  <span className="font-bold text-emerald-700">
                    {completedCount} ca
                  </span>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(photo)}
                    className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold text-center flex items-center justify-center gap-1 transition-colors shadow-2xs"
                  >
                    <Edit2 className="w-3 h-3" /> Sửa
                  </button>

                  <a
                    href={`tel:${photo.phone}`}
                    className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold flex items-center justify-center transition-colors"
                    title="Gọi điện thoại"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="flex-1 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 rounded-xl font-semibold text-center transition-colors"
                  >
                    Lịch Chụp ({assignedBookings.length})
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${photo.fullName}" khỏi đội ngũ ekip?`)) {
                        deletePhotographer(photo.id);
                      }
                    }}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center justify-center transition-colors"
                    title="Xóa thợ này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
          <div onClick={() => setSelectedPhoto(null)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-xs text-neutral-900">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Lịch Chụp: {selectedPhoto.fullName}
                </h3>
                <p className="text-neutral-500 text-[11px] mt-0.5">SĐT: {selectedPhoto.phone} • {selectedPhoto.photographerType}</p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {bookings.filter(
                b =>
                  b.assignments.leadPhotographerId === selectedPhoto.id ||
                  b.assignments.assistantPhotographerIds?.includes(selectedPhoto.id) ||
                  b.assignments.videographerId === selectedPhoto.id ||
                  b.assignments.leadPhotographerName === selectedPhoto.fullName
              ).length === 0 ? (
                <p className="py-8 text-center text-neutral-400">Thợ này hiện chưa có lịch chụp nào sắp tới.</p>
              ) : (
                bookings
                  .filter(
                    b =>
                      b.assignments.leadPhotographerId === selectedPhoto.id ||
                      b.assignments.assistantPhotographerIds?.includes(selectedPhoto.id) ||
                      b.assignments.videographerId === selectedPhoto.id ||
                      b.assignments.leadPhotographerName === selectedPhoto.fullName
                  )
                  .map(bk => (
                    <div key={bk.id} className="p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-neutral-900">{bk.className} ({bk.schoolName})</span>
                        <span className="font-mono text-neutral-900 font-bold bg-white border border-black/[0.08] px-2 py-0.5 rounded text-[10px]">
                          {bk.code}
                        </span>
                      </div>
                      <p className="text-neutral-600">📅 Ngày: <strong className="text-neutral-900">{bk.shootDate}</strong> ({bk.startTime} - {bk.endTime})</p>
                      <p className="text-neutral-500 truncate">📍 Địa điểm: {bk.location}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                          Trạng thái: {bk.bookingStatus}
                        </span>
                        <p className="text-neutral-900 font-bold">Thù lao: {selectedPhoto.ratePerShoot.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm & Sửa Thợ */}
      <PhotographerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        photographerToEdit={editingPhotographer}
      />
    </div>
  );
};
