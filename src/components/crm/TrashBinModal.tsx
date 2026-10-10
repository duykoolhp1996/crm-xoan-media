import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import {
  Trash2,
  RefreshCw,
  Search,
  RotateCcw,
  AlertTriangle,
  X,
  Phone,
  School,
  Calendar,
  User,
  ShieldAlert,
  Info
} from 'lucide-react';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const safeDecode = (val?: string, fallback = '') => {
  if (!val) return fallback;
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
};

export const TrashBinModal: React.FC<TrashBinModalProps> = ({ isOpen, onClose }) => {
  const {
    deletedCustomers,
    isLoadingDeleted,
    loadDeletedCustomers,
    restoreCustomer,
    permanentDeleteCustomer,
    currentUser,
    currentRole
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State cho Modal xác nhận xóa vĩnh viễn lần 2
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState<Customer | null>(null);
  const [permanentDeleteReason, setPermanentDeleteReason] = useState('');
  const [isSubmittingPermanent, setIsSubmittingPermanent] = useState(false);

  const isAdmin = currentUser.role === 'admin' || currentRole === 'admin';

  if (!isOpen || typeof document === 'undefined') return null;

  // Lọc theo tìm kiếm
  const filteredList = deletedCustomers.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const deletedByDecoded = safeDecode(c.deletedBy).toLowerCase();
    const reasonDecoded = safeDecode(c.deleteReason).toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.className && c.className.toLowerCase().includes(term)) ||
      (c.schoolName && c.schoolName.toLowerCase().includes(term)) ||
      deletedByDecoded.includes(term) ||
      reasonDecoded.includes(term)
    );
  });

  const handleRestore = async (cust: Customer) => {
    if (restoringId) return;
    setRestoringId(cust.id);
    try {
      await restoreCustomer(cust.id);
    } finally {
      setRestoringId(null);
    }
  };

  const handleOpenPermanentConfirm = (cust: Customer) => {
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền xóa vĩnh viễn Lead khỏi hệ thống!');
      return;
    }
    setConfirmDeleteCustomer(cust);
    setPermanentDeleteReason('Dữ liệu rác/thử nghiệm - Xóa vĩnh viễn bởi Admin');
  };

  const handleConfirmPermanentDelete = async () => {
    if (!confirmDeleteCustomer || isSubmittingPermanent) return;
    setIsSubmittingPermanent(true);
    try {
      await permanentDeleteCustomer(confirmDeleteCustomer.id, permanentDeleteReason);
      setConfirmDeleteCustomer(null);
      setPermanentDeleteReason('');
    } finally {
      setIsSubmittingPermanent(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-black/[0.08] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-black/[0.06] flex items-center justify-between bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                  Thùng Rác & Leads Đã Xóa
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {deletedCustomers.length} Lead
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Các Lead bị xóa mềm sẽ lưu tại đây. Sales có thể khôi phục, chỉ Admin mới có quyền xóa vĩnh viễn.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDeletedCustomers()}
              disabled={isLoadingDeleted}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all"
              title="Tải lại danh sách thùng rác"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDeleted ? 'animate-spin text-neutral-900' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Tìm kiếm */}
        <div className="p-3 sm:p-4 border-b border-black/[0.04] bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, lớp, trường, người xóa..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Info className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="hidden sm:inline">Phân quyền: Sales xóa mềm → Admin xóa vĩnh viễn</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-4 custom-scrollbar">
          {isLoadingDeleted ? (
            <div className="py-20 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-500" />
              <p className="text-xs font-medium">Đang nạp dữ liệu thùng rác từ SQL Server...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-neutral-600">Thùng rác hiện đang trống</p>
              <p className="text-[11px] text-neutral-400 max-w-sm">
                Chưa có Lead nào bị xóa, hoặc không tìm thấy kết quả phù hợp với từ khóa tìm kiếm.
              </p>
            </div>
          ) : (
            <div className="border border-black/[0.06] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-black/[0.06] text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                      <th className="py-3 px-3.5 min-w-[200px]">Khách hàng & Lớp</th>
                      <th className="py-3 px-3.5 min-w-[140px]">Giá trị đơn / Budget</th>
                      <th className="py-3 px-3.5 min-w-[200px] max-w-[240px]">Người xóa & Lý do</th>
                      <th className="py-3 px-3.5 min-w-[130px]">Thời gian xóa</th>
                      <th className="py-3 px-3.5 min-w-[140px] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {filteredList.map((cust) => {
                      const deleteTimeFormatted = cust.deletedAt
                        ? new Date(cust.deletedAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Không rõ';

                      const amountDisplay = (cust.totalAmount || cust.totalRevenue || cust.expectedBudget || 0).toLocaleString('vi-VN');
                      const deletedByName = safeDecode(cust.deletedBy, 'Nhân sự CRM');
                      const deleteReasonText = safeDecode(cust.deleteReason, 'Xóa thủ công');

                      return (
                        <tr key={cust.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* Cột 1: Thông tin khách */}
                          <td className="py-3 px-3.5 align-top min-w-[200px]">
                            <div className="font-bold text-neutral-900">{cust.name}</div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              <School className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{cust.className ? `${cust.className} • ` : ''}{cust.schoolName}</span>
                            </div>
                            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{cust.phone || cust.facebook || 'Chưa có SĐT'}</span>
                            </div>
                          </td>

                          {/* Cột 2: Giá trị */}
                          <td className="py-3 px-3.5 align-top min-w-[140px]">
                            <div className="font-extrabold text-neutral-900">{amountDisplay} đ</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              Giai đoạn cũ: <span className="font-semibold text-neutral-600">{cust.pipelineStage}</span>
                            </div>
                          </td>

                          {/* Cột 3: Người xóa & Lý do */}
                          <td className="py-3 px-3.5 align-top min-w-[200px] max-w-[240px] break-words">
                            <div className="flex items-center gap-1.5 font-bold text-neutral-800 break-words">
                              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="break-words">{deletedByName}</span>
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-1 italic break-words line-clamp-2" title={deleteReasonText}>
                              "{deleteReasonText}"
                            </div>
                          </td>

                          {/* Cột 4: Thời gian xóa */}
                          <td className="py-3 px-3.5 align-top text-neutral-500 text-[11px] min-w-[130px] whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{deleteTimeFormatted}</span>
                            </div>
                          </td>

                          {/* Cột 5: Nút thao tác */}
                          <td className="py-3 px-3.5 align-top text-right min-w-[140px] whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Nút Khôi phục */}
                              <button
                                onClick={() => handleRestore(cust)}
                                disabled={restoringId === cust.id}
                                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                                title="Khôi phục Lead này về Pipeline"
                              >
                                <RotateCcw className={`w-3.5 h-3.5 ${restoringId === cust.id ? 'animate-spin' : ''}`} />
                                <span>{restoringId === cust.id ? 'Đang khôi phục...' : 'Khôi phục'}</span>
                              </button>

                              {/* Nút Xóa vĩnh viễn (Admin only) */}
                              {isAdmin ? (
                                <button
                                  onClick={() => handleOpenPermanentConfirm(cust)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                                  title="Xóa vĩnh viễn khỏi Database (Không thể hoàn tác)"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Xóa hẳn</span>
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="px-2 py-1.5 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-medium cursor-not-allowed opacity-60"
                                  title="Chỉ Admin mới có quyền xóa vĩnh viễn"
                                >
                                  Admin only
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-black/[0.06] bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>Tổng số {filteredList.length} lead trong thùng rác</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA VĨNH VIỄN LẦN 2 (ADMIN ONLY) */}
      {confirmDeleteCustomer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border-2 border-rose-500/50 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  XÁC NHẬN XÓA VĨNH VIỄN
                </h3>
                <p className="text-xs text-rose-600 font-bold">
                  Hành động này KHÔNG THỂ HOÀN TÁC!
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-900 space-y-1">
              <p>
                Lead: <strong>{confirmDeleteCustomer.name}</strong> ({confirmDeleteCustomer.className || 'Chưa rõ lớp'} - {confirmDeleteCustomer.schoolName})
              </p>
              <p className="text-[11px] text-rose-700">
                Toàn bộ dữ liệu hồ sơ và lịch sử chuyển đổi của khách hàng này sẽ bị xóa sạch khỏi SQL Server Database.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">
                Lý do xóa vĩnh viễn (Lưu Audit Log):
              </label>
              <textarea
                value={permanentDeleteReason}
                onChange={(e) => setPermanentDeleteReason(e.target.value)}
                placeholder="Nhập lý do xóa vĩnh viễn (bắt buộc)..."
                rows={2}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-black/[0.1] rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCustomer(null)}
                disabled={isSubmittingPermanent}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={isSubmittingPermanent || !permanentDeleteReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmittingPermanent ? 'Đang xóa...' : 'Tôi Hiểu, Xóa Vĩnh Viễn!'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
