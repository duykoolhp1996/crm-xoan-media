import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  DollarSign, 
  Car, 
  Utensils, 
  Ticket, 
  Sparkles, 
  Shirt, 
  Camera, 
  Receipt,
  FileText,
  AlertCircle,
  Save,
  CheckCircle2,
  Calendar,
  School
} from 'lucide-react';
import { Customer, ShootExpenseItem, ShootExpenseCategory } from '../../types';

interface ShootExpensesModalProps {
  customer: Customer;
  onClose: () => void;
  onSave: (updatedCustomer: Customer) => Promise<void> | void;
}

const CATEGORY_CONFIG: Record<ShootExpenseCategory, { label: string; icon: any; color: string }> = {
  xe_co: { label: 'Xe cộ / Đi lại', icon: Car, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  an_uong: { label: 'Ăn uống ekip', icon: Utensils, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ve_cong: { label: 'Vé vào cổng', icon: Ticket, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  dao_cu: { label: 'Đạo cụ / Pháo khói', icon: Sparkles, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  trang_phuc: { label: 'Trang phục phát sinh', icon: Shirt, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  phu_phi_tho: { label: 'Phụ cấp thợ chụp', icon: Camera, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  khac: { label: 'Chi phí khác', icon: FileText, color: 'text-neutral-600 bg-neutral-100 border-neutral-200' }
};

const QUICK_PRESETS = [
  { category: 'xe_co' as ShootExpenseCategory, title: 'Xe 16 chỗ đưa đón lớp & ekip', defaultAmount: 1200000 },
  { category: 'an_uong' as ShootExpenseCategory, title: 'Ăn trưa & nước uống ekip', defaultAmount: 400000 },
  { category: 've_cong' as ShootExpenseCategory, title: 'Vé vào cổng địa điểm chụp', defaultAmount: 800000 },
  { category: 'dao_cu' as ShootExpenseCategory, title: 'Pháo khói màu & phụ kiện concept', defaultAmount: 350000 },
  { category: 'phu_phi_tho' as ShootExpenseCategory, title: 'Phụ cấp thêm thợ hỗ trợ tăng ca', defaultAmount: 500000 }
];

export const ShootExpensesModal: React.FC<ShootExpensesModalProps> = ({
  customer,
  onClose,
  onSave
}) => {
  const [expenses, setExpenses] = useState<ShootExpenseItem[]>(() => {
    if (customer.shootExpenses && Array.isArray(customer.shootExpenses) && customer.shootExpenses.length > 0) {
      return [...customer.shootExpenses];
    }
    return [];
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Thêm một khoản chi mới trống
  const handleAddExpense = (preset?: { category: ShootExpenseCategory; title: string; defaultAmount: number }) => {
    const newItem: ShootExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: preset ? preset.category : 'khac',
      title: preset ? preset.title : '',
      amount: preset ? preset.defaultAmount : 0,
      payer: 'Trưởng nháy / Admin',
      note: '',
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [...prev, newItem]);
  };

  // Cập nhật từng dòng
  const handleUpdateItem = (id: string, field: keyof ShootExpenseItem, val: any) => {
    setExpenses(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Xóa khoản chi
  const handleDeleteItem = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  // Tính tổng chi phí
  const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalRevenue = customer.totalAmount ?? customer.totalRevenue ?? customer.expectedBudget ?? 0;
  const expenseRatio = totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0';
  const grossProfit = Math.max(0, totalRevenue - totalExpenses);

  // Lưu chi phí
  const handleSave = async () => {
    setSaving(true);
    try {
      const validExpenses = expenses.filter(e => e.title.trim() || e.amount > 0);
      const updatedCustomer: Customer = {
        ...customer,
        shootExpenses: validExpenses,
        totalShootExpenses: totalExpenses,
        updatedAt: new Date().toISOString()
      };
      await onSave(updatedCustomer);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error('Lỗi lưu chi phí buổi chụp:', err);
      alert('⚠️ Có lỗi xảy ra khi lưu chi phí. Vui lòng thử lại!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-neutral-50 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Receipt className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                  Kê Khai Chi Phí Buổi Chụp Kỷ Yếu
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neutral-800">
                    {customer.className ? `Lớp ${customer.className}` : ''} {customer.schoolName ? `• ${customer.schoolName}` : ''}
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1 text-purple-700 font-bold">
                    <Calendar className="w-3 h-3" />
                    {customer.expectedShootDate ? new Date(customer.expectedShootDate).toLocaleDateString('vi-VN') : 'Lịch hôm nay'}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Chips (Thêm nhanh) */}
        <div className="px-4 sm:px-5 py-2.5 bg-neutral-50/80 border-b border-black/[0.05] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] font-bold text-neutral-500 shrink-0 mr-1">
            ⚡ Thêm nhanh:
          </span>
          {QUICK_PRESETS.map((preset, idx) => {
            const Icon = CATEGORY_CONFIG[preset.category].icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddExpense(preset)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white hover:bg-amber-50 text-neutral-700 hover:text-amber-900 border border-black/[0.08] hover:border-amber-300 shadow-2xs transition-all shrink-0 cursor-pointer active:scale-95"
              >
                <Icon className="w-3 h-3 text-amber-600" />
                <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
                <span className="text-neutral-400 text-[10px]">({(preset.defaultAmount / 1000).toLocaleString('vi-VN')}k)</span>
              </button>
            );
          })}
        </div>

        {/* Body / Expenses List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {expenses.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 border border-dashed border-neutral-300 rounded-2xl bg-neutral-50/50">
              <Receipt className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-600">Chưa có khoản chi nào được kê khai</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Điền toàn bộ chi phí thực tế phát sinh trong buổi chụp (xe đưa đón, ăn uống, vé vào cổng di tích, đạo cụ...) để theo dõi chi phí và lợi nhuận chính xác.
              </p>
              <button
                type="button"
                onClick={() => handleAddExpense()}
                className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Khoản Chi Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-bold text-neutral-400 px-2 uppercase tracking-wider">
                <span className="col-span-3">Hạng Mục</span>
                <span className="col-span-4">Nội Dung Chi</span>
                <span className="col-span-3">Số Tiền (VNĐ)</span>
                <span className="col-span-2 text-right">Thao Tác</span>
              </div>

              {expenses.map((item, index) => {
                const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.khac;
                const CatIcon = catCfg.icon;

                return (
                  <div 
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-black/[0.07] hover:border-black/[0.14] shadow-2xs space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 items-center transition-all"
                  >
                    {/* Hạng mục */}
                    <div className="sm:col-span-3">
                      <div className="relative">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value as ShootExpenseCategory)}
                          className="w-full pl-2.5 pr-6 py-1.5 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer truncate"
                        >
                          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>
                              {cfg.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                        placeholder="Nội dung chi (VD: Vé Văn Miếu 40 bạn)..."
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Số tiền */}
                    <div className="sm:col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={item.amount || ''}
                          onChange={(e) => handleUpdateItem(item.id, 'amount', Number(e.target.value) || 0)}
                          placeholder="Số tiền chi (đ)..."
                          className="w-full pl-2.5 pr-8 py-1.5 text-xs font-black text-rose-700 bg-rose-50/40 border border-rose-200 rounded-xl focus:bg-white focus:outline-none"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[11px] font-bold text-neutral-400 pointer-events-none">
                          đ
                        </span>
                      </div>
                    </div>

                    {/* Người chi & Xóa */}
                    <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa khoản chi này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Ghi chú phụ nếu có */}
                    <div className="sm:col-span-12 flex items-center gap-2 pt-1 border-t border-black/[0.03]">
                      <span className="text-[10px] font-semibold text-neutral-400 shrink-0">Người chi:</span>
                      <input
                        type="text"
                        value={item.payer || ''}
                        onChange={(e) => handleUpdateItem(item.id, 'payer', e.target.value)}
                        placeholder="Admin / Trưởng nháy..."
                        className="text-[11px] px-2 py-0.5 bg-neutral-100 rounded-md border border-neutral-200 focus:bg-white focus:outline-none max-w-[150px]"
                      />
                      <span className="text-[10px] font-semibold text-neutral-400 shrink-0 ml-2">Ghi chú:</span>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => handleUpdateItem(item.id, 'note', e.target.value)}
                        placeholder="Ghi chú thêm về khoản chi..."
                        className="text-[11px] px-2 py-0.5 bg-neutral-100 rounded-md border border-neutral-200 focus:bg-white focus:outline-none flex-1"
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => handleAddExpense()}
                className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 text-neutral-500" />
                <span>+ Thêm khoản chi khác</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Thống Kê & Hành Động */}
        <div className="p-4 sm:p-5 border-t border-black/[0.08] bg-neutral-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Box Thống kê tổng */}
          <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-black/[0.06] shadow-2xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Tổng Chi Phí ({expenses.length} khoản)
              </span>
              <span className="text-base font-black text-rose-600">
                {totalExpenses.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="bg-white px-3 py-1.5 rounded-xl border border-black/[0.06] shadow-2xs">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Tỷ Lệ / Doanh Thu ({totalRevenue > 0 ? `${(totalRevenue / 1000000).toFixed(1)}M` : '0đ'})
              </span>
              <span className="text-base font-extrabold text-neutral-900">
                {expenseRatio}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                saveSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã Lưu Xong!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Đang lưu...' : 'Lưu Chi Phí Buổi Chụp'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
