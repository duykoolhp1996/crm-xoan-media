import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  Sparkles,
  FileText
} from 'lucide-react';

export const ServiceModule: React.FC = () => {
  const {
    servicePackages,
    deleteServicePackage,
    addServicePackage,
    resetDefaultServicePackages,
    currentUser,
    currentRole
  } = useApp();

  const isAdmin = currentUser.role === 'admin' || currentRole === 'admin' || currentRole === 'manager';

  // State xác nhận xóa gói
  const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(null);

  // State Modal Thêm Gói Mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPkgForm, setNewPkgForm] = useState({
    name: '',
    description: '',
    price: 5000000,
    durationHours: 6,
    minStudents: 30,
    leadPhotographersNeeded: 1,
    assistantsNeeded: 1,
    makeupIncluded: false,
    photoCountTotal: 500,
    photoCountEdited: 60,
    videoIncluded: false,
    albumIncluded: false,
    extraFeesNote: ''
  });

  const handleDeleteConfirm = () => {
    if (!packageToDelete) return;
    deleteServicePackage(packageToDelete.id);
    setPackageToDelete(null);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgForm.name.trim()) return;

    addServicePackage({
      name: newPkgForm.name.trim(),
      description: newPkgForm.description.trim() || 'Gói dịch vụ kỷ yếu chất lượng cao của Xoăn Media',
      price: Number(newPkgForm.price) || 0,
      durationHours: Number(newPkgForm.durationHours) || 4,
      minStudents: Number(newPkgForm.minStudents) || 30,
      leadPhotographersNeeded: Number(newPkgForm.leadPhotographersNeeded) || 1,
      assistantsNeeded: Number(newPkgForm.assistantsNeeded) || 0,
      makeupIncluded: Boolean(newPkgForm.makeupIncluded),
      photoCountTotal: Number(newPkgForm.photoCountTotal) || 400,
      photoCountEdited: Number(newPkgForm.photoCountEdited) || 50,
      videoIncluded: Boolean(newPkgForm.videoIncluded),
      albumIncluded: Boolean(newPkgForm.albumIncluded),
      extraFeesNote: newPkgForm.extraFeesNote.trim(),
      status: 'active'
    });

    setIsAddModalOpen(false);
    setNewPkgForm({
      name: '',
      description: '',
      price: 5000000,
      durationHours: 6,
      minStudents: 30,
      leadPhotographersNeeded: 1,
      assistantsNeeded: 1,
      makeupIncluded: false,
      photoCountTotal: 500,
      photoCountEdited: 60,
      videoIncluded: false,
      albumIncluded: false,
      extraFeesNote: ''
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-500" />
            Gói Dịch Vụ Chụp Ảnh Kỷ Yếu Xoăn Media
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Bảng cấu hình gói chụp chuẩn hóa cho Sales báo giá, tư vấn và lên hợp đồng với các lớp ({servicePackages.length} gói)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có muốn khôi phục lại danh sách các gói chụp mặc định ban đầu không?')) {
                    resetDefaultServicePackages();
                  }
                }}
                className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="Khôi phục lại 4 gói chụp mặc định ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm Gói Mới
              </button>
            </>
          )}
        </div>
      </div>

      {/* Packages Grid */}
      {servicePackages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">Chưa có gói dịch vụ nào trong hệ thống</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Bạn có thể thêm gói dịch vụ mới hoặc khôi phục lại các gói chụp mẫu chuẩn của Xoăn Media.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => resetDefaultServicePackages()}
              className="px-4 py-2 bg-neutral-900 text-[#B8F23D] rounded-xl text-xs font-bold shadow-xs hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Khôi Phục Gói Mặc Định
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicePackages.map((pkg) => {
            const isBestSeller = pkg.name.toUpperCase().includes('STANDARD') || pkg.name.toUpperCase().includes('BÁN CHẠY');

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all relative shadow-xs ${
                  isBestSeller
                    ? 'border-orange-400 ring-2 ring-orange-400/20 shadow-orange-500/10'
                    : 'border-black/[0.08] hover:border-black/[0.16]'
                }`}
              >
                {/* Badge Best Seller */}
                {isBestSeller && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md border border-white/40">
                    🔥 BÁN CHẠY NHẤT MÙA
                  </div>
                )}

                <div>
                  {/* Top Bar của Thẻ: Tên gói & Nút Xóa Gói */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base leading-snug">
                      {pkg.name}
                    </h3>

                    {/* NÚT XÓA GÓI DỊCH VỤ (ADMIN/MANAGER ONLY) */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setPackageToDelete(pkg)}
                        className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-rose-100 text-neutral-400 hover:text-rose-600 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
                        title={`Xóa ${pkg.name} khỏi hệ thống`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed min-h-[32px]">
                    {pkg.description}
                  </p>

                  <div className="mt-4 pb-4 border-b border-black/[0.06] flex items-baseline gap-1">
                    <span className="text-2xl font-black text-neutral-900 font-mono">
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

                <div className="mt-5 pt-3 border-t border-black/[0.06] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Đã sao chép liên kết báo giá ${pkg.name} để gửi Zalo cho lớp!`)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isBestSeller
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] shadow-sm active:scale-95'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    Sao Chép Báo Giá
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setPackageToDelete(pkg)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer active:scale-95 border border-rose-200"
                      title="Xóa gói dịch vụ này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA GÓI DỊCH VỤ (PORTAL TO BODY) */}
      {packageToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  XÁC NHẬN XÓA GÓI DỊCH VỤ
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  Hành động này sẽ xóa gói khỏi danh sách chào giá
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 space-y-1.5">
              <p>
                Gói chụp: <strong className="text-rose-900">{packageToDelete.name}</strong>
              </p>
              <p className="text-[11px] text-rose-700">
                Mức giá: <strong>{packageToDelete.price.toLocaleString('vi-VN')} đ</strong> • Thời lượng: {packageToDelete.durationHours}h
              </p>
              <p className="text-[11px] text-neutral-500 pt-1 border-t border-rose-200/60">
                Lưu ý: Các Lead và Booking cũ đã ký hợp đồng với gói này vẫn giữ nguyên lịch sử, nhưng Sales sẽ không thể chọn gói này cho các lớp mới nữa.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Gói Ngay</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL THÊM GÓI DỊCH VỤ MỚI (PORTAL TO BODY) */}
      {isAddModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-neutral-900">
                  Thêm Gói Dịch Vụ Kỷ Yếu Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Thêm Gói */}
            <form onSubmit={handleCreatePackage} className="overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Tên Gói Chụp (*):
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Gói Kỷ Yếu FLASH PARTY (Bột Màu + Pháo Sáng)"
                  value={newPkgForm.name}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Mô Tả Gói:
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả các địa điểm chụp, trang phục tặng kèm..."
                  value={newPkgForm.description}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Giá Gói (VNĐ) (*):
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100000}
                    value={newPkgForm.price}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Thời Lượng Chụp (Giờ):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={newPkgForm.durationHours}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Sĩ Số Tối Thiểu:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPkgForm.minStudents}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, minStudents: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Thợ Chính:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPkgForm.leadPhotographersNeeded}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, leadPhotographersNeeded: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Thợ Phụ:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newPkgForm.assistantsNeeded}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, assistantsNeeded: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Số File Gốc:
                  </label>
                  <input
                    type="number"
                    min={50}
                    value={newPkgForm.photoCountTotal}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, photoCountTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Số File Photoshop:
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={newPkgForm.photoCountEdited}
                    onChange={(e) => setNewPkgForm({ ...newPkgForm, photoCountEdited: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2">
                <span className="text-xs font-bold text-neutral-700 block">Dịch Vụ Đi Kèm:</span>
                <div className="flex items-center gap-4 text-xs text-neutral-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPkgForm.makeupIncluded}
                      onChange={(e) => setNewPkgForm({ ...newPkgForm, makeupIncluded: e.target.checked })}
                      className="rounded accent-neutral-900"
                    />
                    <span>Make Up</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPkgForm.videoIncluded}
                      onChange={(e) => setNewPkgForm({ ...newPkgForm, videoIncluded: e.target.checked })}
                      className="rounded accent-neutral-900"
                    />
                    <span>Video 4K / Flycam</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPkgForm.albumIncluded}
                      onChange={(e) => setNewPkgForm({ ...newPkgForm, albumIncluded: e.target.checked })}
                      className="rounded accent-neutral-900"
                    />
                    <span>Photobook Album</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Ghi Chú Phụ Phí (Nếu Có):
                </label>
                <input
                  type="text"
                  placeholder="VD: Thuê thêm bột màu: 300k, vé di tích lớp tự chi trả..."
                  value={newPkgForm.extraFeesNote}
                  onChange={(e) => setNewPkgForm({ ...newPkgForm, extraFeesNote: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Lưu Gói Chụp Mới
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
