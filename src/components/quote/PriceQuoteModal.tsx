import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  Check,
  X,
  Camera,
  School,
  DollarSign,
  Phone,
  User,
  Sparkles,
  FileText,
  CheckCircle2,
  Award,
  Layers,
  Send,
  Sliders,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Save,
  Tag,
  ChevronDown,
  ChevronUp,
  Calculator
} from 'lucide-react';

interface PriceQuoteModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceQuoteModal: React.FC<PriceQuoteModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const { updateCustomer, addActivityLog, currentUser } = useApp();

  // State quản lý giá do Sales điều chỉnh (Tăng / Giảm giá)
  const [budget, setBudget] = useState<number>(customer?.expectedBudget || 0);
  const [perStudentInput, setPerStudentInput] = useState<string>('');
  const [priceNote, setPriceNote] = useState<string>('');
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedZalo, setCopiedZalo] = useState<boolean>(false);

  // Đồng bộ giá khi customer thay đổi
  useEffect(() => {
    if (customer) {
      setBudget(customer.expectedBudget || 0);
      const perStd = customer.studentCount > 0 ? Math.round(customer.expectedBudget / customer.studentCount) : 0;
      setPerStudentInput(perStd.toString());
      setPriceNote('');
      setSavedSuccess(false);
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const originalBudget = customer.expectedBudget || 0;
  const priceDifference = budget - originalBudget;
  const quoteCode = `BG-${customer.className.replace(/\s+/g, '').toUpperCase()}-${customer.id.slice(-4).toUpperCase()}`;
  const todayStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const studentCount = customer.studentCount || 1;
  const perStudentCost = Math.round(budget / studentCount);

  // Tiến độ thanh toán 30% - 50% - 20%
  const deposit30 = Math.round(budget * 0.3);
  const shootDay50 = Math.round(budget * 0.5);
  const final20 = budget - deposit30 - shootDay50;

  // Xử lý tăng / giảm số tiền nhanh
  const handleQuickAdjustAmount = (delta: number) => {
    const newPrice = Math.max(0, budget + delta);
    setBudget(newPrice);
    setPerStudentInput(Math.round(newPrice / studentCount).toString());
    setSavedSuccess(false);
  };

  // Xử lý giảm theo phần trăm (%)
  const handleQuickDiscountPercent = (percent: number) => {
    const discountAmount = Math.round((originalBudget * percent) / 100);
    const newPrice = Math.max(0, originalBudget - discountAmount);
    setBudget(newPrice);
    setPerStudentInput(Math.round(newPrice / studentCount).toString());
    setPriceNote(`Ưu đãi chiết khấu ${percent}% cho tập thể lớp`);
    setSavedSuccess(false);
  };

  // Áp dụng khi nhập đơn giá theo từng học sinh
  const handleApplyPerStudentPrice = () => {
    const val = parseInt(perStudentInput.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      const calculatedTotal = val * studentCount;
      setBudget(calculatedTotal);
      setSavedSuccess(false);
    }
  };

  // Đặt lại giá gốc ban đầu của khách hàng
  const handleResetPrice = () => {
    setBudget(originalBudget);
    const perStd = Math.round(originalBudget / studentCount);
    setPerStudentInput(perStd.toString());
    setPriceNote('');
    setSavedSuccess(false);
  };

  // Lưu giá mới vào hồ sơ CRM của khách hàng
  const handleSaveToCrm = () => {
    if (!customer) return;
    const updatedCust: Customer = {
      ...customer,
      expectedBudget: budget,
      notes: priceNote ? `${customer.notes || ''}\n[Báo giá mới]: ${priceNote} (${budget.toLocaleString('vi-VN')} đ)`.trim() : customer.notes,
      updatedAt: new Date().toISOString()
    };
    updateCustomer(updatedCust);

    // Ghi nhật ký hoạt động
    addActivityLog({
      type: 'quote_sent',
      title: 'Điều chỉnh báo giá kỷ yếu',
      description: `Sales ${currentUser.name} điều chỉnh giá báo giá cho lớp ${customer.className} thành ${budget.toLocaleString('vi-VN')} đ ${priceDifference !== 0 ? `(${priceDifference > 0 ? '+' : ''}${priceDifference.toLocaleString('vi-VN')} đ)` : ''}${priceNote ? ` - Ghi chú: ${priceNote}` : ''}`,
      customerId: customer.id,
      performedByName: currentUser.name
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Xử lý in / xuất file PDF chuẩn A4 (không bị tràn toàn màn hình)
  const handlePrintPdf = () => {
    window.print();
  };

  // Sao chép nội dung tóm tắt để gửi Zalo cho Ban cán sự lớp
  const handleCopyZalo = () => {
    const text = `📸 BẢNG BÁO GIÁ KỶ YẾU 2026 - XOẮN MEDIA STUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 Kính gửi: Tập thể lớp ${customer.className} - ${customer.schoolName}
👤 Đại diện: ${customer.name} (${customer.representativeRole || 'Lớp trưởng'}) - SĐT: ${customer.phone}
👥 Sỉ số lớp: ${customer.studentCount} bạn
📦 Gói dịch vụ: ${customer.servicePackageName || 'Gói Kỷ Yếu Standard Concept'}
✨ Concept: ${customer.concept || 'Thanh xuân vườn trường'}
📍 Địa điểm: ${customer.shootingLocations?.join(', ') || 'Trường học & Ngoại cảnh'}

💰 BẢNG TÍNH CHI PHÍ:${priceDifference !== 0 ? `\n• Giá gói gốc: ${originalBudget.toLocaleString('vi-VN')} đ` : ''}
• Tổng kinh phí trọn gói: ${budget.toLocaleString('vi-VN')} đ
👉 Chỉ khoảng: ${perStudentCost.toLocaleString('vi-VN')} đ / bạn${priceNote ? `\n🎁 Ghi chú ưu đãi: ${priceNote}` : ''}

🎁 ĐẶC QUYỀN TẶNG KÈM:
✓ Áo cử nhân + bằng tốt nghiệp cho 100% học sinh
✓ Trang phục chụp concept độc quyền của Xoắn Media
✓ Chụp không giới hạn ảnh, trả toàn bộ file gốc trong 24h
✓ Chỉnh sửa Photoshop chuyên sâu từng thành viên
✓ Tặng 01 ảnh tập thể ép gỗ cao cấp cho Giáo Viên Chủ Nhiệm
✓ Đạo cụ: Loa kéo, pháo khói, bột màu party night

💳 LỘ TRÌNH THANH TOÁN:
1. Đợt 1 (Cọc giữ lịch 30%): ${deposit30.toLocaleString('vi-VN')} đ
2. Đợt 2 (Ngày bấm máy 50%): ${shootDay50.toLocaleString('vi-VN')} đ
3. Đợt 3 (Bàn giao hoàn thiện 20%): ${final20.toLocaleString('vi-VN')} đ

🏦 TÀI KHOẢN NHẬN CỌC:
• Ngân hàng: MB BANK • STK: 0981108601 • Chủ TK: CHU DUC DUY
• Cú pháp CK: COC KYYEU ${customer.className.toUpperCase()} ${customer.phone}

📞 Chuyên viên tư vấn: ${customer.assignedSalesName || 'Xoắn Media'}
🌐 Hotline: 0981 108 601 • Website: xoanmedia.vn`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 quote-modal-root">
      {/* Định nghĩa CSS in ấn chuyên biệt khổ A4 - Không bị kéo dãn toàn màn hình */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ẩn mọi thứ của giao diện web */
          body * {
            visibility: hidden !important;
          }
          /* Chỉ hiển thị duy nhất tờ in báo giá khổ chuẩn */
          #printable-quote-paper,
          #printable-quote-paper * {
            visibility: visible !important;
          }
          #printable-quote-paper {
            position: absolute !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            width: 190mm !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
            padding: 6mm 8mm !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
          }
          /* Ẩn các nút điều khiển khi in */
          .no-print,
          .print-hidden,
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden my-auto max-h-[94vh] flex flex-col quote-modal-container">
        
        {/* Header Thanh Công Cụ (Ẩn khi in ấn) */}
        <div className="p-3.5 sm:px-6 bg-neutral-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B8F23D]/20 text-[#B8F23D] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Báo Giá Kỷ Yếu PDF
                </h2>
                <span className="text-[11px] font-mono text-[#B8F23D] bg-[#B8F23D]/20 px-2 py-0.5 rounded-full font-bold">
                  {quoteCode}
                </span>
                {priceDifference !== 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    priceDifference < 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {priceDifference < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        Giảm {Math.abs(priceDifference).toLocaleString('vi-VN')} đ
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        Tăng +{priceDifference.toLocaleString('vi-VN')} đ
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Tự động chia tiền/bạn • Điều chỉnh tăng/giảm giá • Xuất PDF A4 chuẩn in ấn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPricingOpen(!isPricingOpen)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isPricingOpen
                  ? 'bg-[#B8F23D]/20 text-[#B8F23D] border-[#B8F23D]/40'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              }`}
              title="Mở bảng điều chỉnh tăng/giảm giá"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chỉnh Giá</span>
              {isPricingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleCopyZalo}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
              title="Sao chép tóm tắt gửi Zalo cho lớp"
            >
              {copiedZalo ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Đã Copy Zalo!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Gửi Zalo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Mở giao diện In / Lưu file PDF khổ A4 chuẩn"
            >
              <Printer className="w-4 h-4" />
              <span>In / Lưu PDF (A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thanh Điều Chỉnh Báo Giá Của Sales (Tăng / Giảm Giá & Chiết Khấu / Phụ Thu) */}
        {isPricingOpen && (
          <div className="p-3.5 sm:px-6 bg-neutral-950 text-white border-b border-neutral-800 space-y-3 shrink-0 print:hidden no-print">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#B8F23D] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Công Cụ Điều Chỉnh Giá Của Sales:
                </span>
                <span className="text-[11px] text-neutral-400">
                  (Giá gốc: <strong className="text-white">{originalBudget.toLocaleString('vi-VN')} đ</strong>)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã cập nhật vào CRM!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveToCrm}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Lưu mức giá và ghi chú này vào hồ sơ khách hàng trên CRM"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Vào CRM</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetPrice}
                  className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title="Đặt lại mức giá gốc ban đầu"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Giá Gốc</span>
                </button>
              </div>
            </div>

            {/* Khối Nhập Giá & Nút Tăng Giảm Nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Nhập Tổng Tiền */}
              <div className="md:col-span-4 bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Tổng Kinh Phí Trọn Gói (VNĐ):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="50000"
                    value={budget}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBudget(val);
                      setPerStudentInput(Math.round(val / studentCount).toString());
                      setSavedSuccess(false);
                    }}
                    className="w-full bg-neutral-950 text-white font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-[#B8F23D]"
                    placeholder="Nhập tổng giá..."
                  />
                  <span className="absolute right-2.5 top-2 text-[11px] font-bold text-neutral-400 pointer-events-none">
                    VNĐ
                  </span>
                </div>
              </div>

              {/* Nhập Đơn Giá / Học Sinh */}
              <div className="md:col-span-3 bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Đơn Giá / Bạn ({studentCount} bạn):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    step="10000"
                    value={perStudentInput}
                    onChange={(e) => setPerStudentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyPerStudentPrice();
                    }}
                    className="w-full bg-neutral-950 text-white font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-neutral-700 focus:outline-none focus:border-[#B8F23D]"
                    placeholder="VD: 350000"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPerStudentPrice}
                    className="px-2 py-1.5 bg-neutral-800 hover:bg-[#B8F23D] hover:text-neutral-950 text-neutral-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                    title="Tính lại tổng kinh phí theo đơn giá này"
                  >
                    Tính
                  </button>
                </div>
              </div>

              {/* Các Nút Giảm Giá / Phụ Thu Nhanh */}
              <div className="md:col-span-5 bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Tăng / Giảm Nhanh 1 Chạm:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjustAmount(-500000)}
                    className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[11px] font-bold active:scale-95"
                    title="Giảm 500.000 VNĐ"
                  >
                    -500k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjustAmount(-1000000)}
                    className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[11px] font-bold active:scale-95"
                    title="Giảm 1.000.000 VNĐ"
                  >
                    -1.000k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDiscountPercent(5)}
                    className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-lg text-[11px] font-bold active:scale-95"
                    title="Chiết khấu 5% trên giá gốc"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDiscountPercent(10)}
                    className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-lg text-[11px] font-bold active:scale-95"
                    title="Chiết khấu 10% trên giá gốc"
                  >
                    -10%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjustAmount(500000)}
                    className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded-lg text-[11px] font-bold active:scale-95"
                    title="Phụ thu thêm 500.000 VNĐ"
                  >
                    +500k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjustAmount(1500000)}
                    className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 rounded-lg text-[11px] font-bold active:scale-95"
                    title="Phụ thu xe di chuyển 1.500.000 VNĐ"
                  >
                    +1.5M (Xe)
                  </button>
                </div>
              </div>

            </div>

            {/* Ô Nhập Ghi Chú Ưu Đãi / Phụ Thu */}
            <div className="flex items-center gap-2 pt-0.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="text"
                value={priceNote}
                onChange={(e) => {
                  setPriceNote(e.target.value);
                  setSavedSuccess(false);
                }}
                className="w-full bg-neutral-900 text-neutral-200 text-xs px-3 py-1.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-[#B8F23D]"
                placeholder="Ghi chú ưu đãi / phụ thu hiển thị trên báo giá (VD: Ưu đãi đăng ký sớm -1.000.000đ hoặc Đã bao gồm phụ thu xe Đồ Sơn)..."
              />
            </div>
          </div>
        )}

        {/* Khung Nội Dung Báo Giá Khổ A4 Chuẩn (Không Bị Tràn Màn Hình Khi In) */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-neutral-100/70 custom-scrollbar print:p-0 print:bg-white print:overflow-visible quote-print-wrapper">
          
          {/* Tờ giấy in A4 có kích thước cố định, căn giữa trang chuẩn in ấn */}
          <div
            id="printable-quote-paper"
            className="w-full max-w-[210mm] mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-black/[0.06] text-neutral-800 font-sans space-y-4 print:border-none print:shadow-none print:p-0 print:max-w-none print:m-0 quote-print-paper"
          >
            {/* Header Thương Hiệu Studio */}
            <div className="flex flex-row items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-[#B8F23D] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  <Camera className="w-7 h-7 text-[#B8F23D]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-neutral-950 uppercase leading-none">
                    XOẮN MEDIA STUDIO
                  </h1>
                  <p className="text-[11px] text-neutral-600 font-semibold tracking-wide mt-1">
                    HỆ THỐNG KỶ YẾU & NGHỆ THUẬT HỌC ĐƯỜNG HÀNG ĐẦU
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Hải Phòng: Lê Chân • Hà Nội: Cầu Giấy • Hotline: <strong>0981 108 601</strong>
                  </p>
                </div>
              </div>

              <div className="text-right border-l border-neutral-200 pl-3.5 text-xs space-y-0.5 shrink-0">
                <p className="font-mono text-[11px] text-neutral-500">Mã Báo Giá:</p>
                <p className="font-mono font-bold text-neutral-950 text-xs sm:text-sm">{quoteCode}</p>
                <p className="text-[10px] text-neutral-500">Ngày lập: <strong>{todayStr}</strong></p>
                <p className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block font-semibold">
                  Hiệu lực 15 ngày
                </p>
              </div>
            </div>

            {/* Tiêu Đề Báo Giá */}
            <div className="text-center space-y-0.5 pt-0.5">
              <h2 className="text-base sm:text-lg font-black text-neutral-950 uppercase tracking-tight">
                BẢNG BÁO GIÁ DỊCH VỤ CHỤP ẢNH KỶ YẾU 2026
              </h2>
              <p className="text-[11px] text-neutral-500 italic">
                (Áp dụng cho mùa kỷ yếu THPT & Đại Học niên khóa 2025 - 2026)
              </p>
            </div>

            {/* Khối Thông Tin Lớp Học & Người Đại Diện */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.06] grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-neutral-500 font-medium text-[11px]">Kính gửi ban cán sự & tập thể lớp:</p>
                <p className="text-xs sm:text-sm font-bold text-neutral-950 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Lớp {customer.className} — {customer.schoolName}
                </p>
                <p className="text-neutral-600 flex items-center gap-1 text-[11px]">
                  <User className="w-3 h-3 text-neutral-400 shrink-0" />
                  Đại diện: <strong>{customer.name}</strong> ({customer.representativeRole || 'Lớp trưởng'})
                </p>
                <p className="text-neutral-600 flex items-center gap-1 text-[11px]">
                  <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                  Số điện thoại: <strong>{customer.phone}</strong>
                </p>
              </div>

              <div className="space-y-1 border-l border-neutral-200 pl-3">
                <p className="text-neutral-500 font-medium text-[11px]">Chi tiết thông tin chụp:</p>
                <p className="text-neutral-700 text-[11px]">
                  • Sỉ số tham gia: <strong className="text-neutral-950">{customer.studentCount} bạn</strong>
                </p>
                <p className="text-neutral-700 text-[11px]">
                  • Concept: <strong className="text-purple-700 font-bold">{customer.concept || 'Thanh xuân vườn trường'}</strong>
                </p>
                <p className="text-neutral-700 text-[11px] truncate">
                  • Địa điểm: <strong className="text-neutral-900">{customer.shootingLocations?.join(', ') || 'Trường học & Ngoại cảnh'}</strong>
                </p>
                <p className="text-neutral-700 text-[11px]">
                  • Sales tư vấn: <strong className="text-blue-700">{customer.assignedSalesName || 'Xoắn Media Sales Lead'}</strong>
                </p>
              </div>
            </div>

            {/* Bảng Chi Tiết Gói Dịch Vụ */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Chi Tiết Quyền Lợi Gói: {customer.servicePackageName || 'Gói Kỷ Yếu Standard'}
              </h3>

              <table className="w-full text-left text-[11px] border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-neutral-950 text-white font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center">STT</th>
                    <th className="py-2 px-2.5 w-44">Hạng Mục</th>
                    <th className="py-2 px-2.5">Chi Tiết Cung Cấp</th>
                    <th className="py-2 px-2.5 text-center w-24">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-1.5 px-2.5 text-center font-bold">1</td>
                    <td className="py-1.5 px-2.5 font-semibold text-neutral-900">Ekip Bấm Máy</td>
                    <td className="py-1.5 px-2.5">2 Thợ chụp chính + 1 Thợ phụ chuyên nghiệp, nhiệt tình tạo dáng</td>
                    <td className="py-1.5 px-2.5 text-center text-emerald-700 font-bold">Đầy đủ</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-1.5 px-2.5 text-center font-bold">2</td>
                    <td className="py-1.5 px-2.5 font-semibold text-neutral-900">Trang Phục Tốt Nghiệp</td>
                    <td className="py-1.5 px-2.5">Áo cử nhân + Bằng tốt nghiệp + Cà vạt / Nơ + Vòng hoa đội đầu</td>
                    <td className="py-1.5 px-2.5 text-center text-emerald-700 font-bold">100% Học sinh</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-1.5 px-2.5 text-center font-bold">3</td>
                    <td className="py-1.5 px-2.5 font-semibold text-neutral-900">Trang Phục Concept</td>
                    <td className="py-1.5 px-2.5">01 Bộ trang phục Concept theo yêu cầu (Cổ phục / Retro 90s / Học đường)</td>
                    <td className="py-1.5 px-2.5 text-center text-emerald-700 font-bold">Trọn gói</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-1.5 px-2.5 text-center font-bold">4</td>
                    <td className="py-1.5 px-2.5 font-semibold text-neutral-900">Số Lượng Hình Ảnh</td>
                    <td className="py-1.5 px-2.5">Chụp không giới hạn (từ 1.000 - 2.500 ảnh). Trả toàn bộ ảnh gốc sau 24h</td>
                    <td className="py-1.5 px-2.5 text-center text-emerald-700 font-bold">Không giới hạn</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-1.5 px-2.5 text-center font-bold">5</td>
                    <td className="py-1.5 px-2.5 font-semibold text-neutral-900">Hậu Kỳ Photoshop</td>
                    <td className="py-1.5 px-2.5">Chỉnh sửa Photoshop chuyên sâu 100 - 150 ảnh tập thể và ảnh đơn</td>
                    <td className="py-1.5 px-2.5 text-center text-emerald-700 font-bold">Chuyên sâu</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-1.5 px-2.5 text-center font-bold">6</td>
                    <td className="py-1.5 px-2.5 font-semibold text-neutral-900">Đạo Cụ & Party Night</td>
                    <td className="py-1.5 px-2.5">Loa kéo công suất lớn, bột màu nhiều màu sắc, pháo bông sáng nghệ thuật</td>
                    <td className="py-1.5 px-2.5 text-center text-emerald-700 font-bold">Miễn phí</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bảng Chiết Tính Tài Chính (Tự Động Cập Nhật Theo Giá Mới) */}
            <div className="p-3.5 bg-neutral-950 text-white rounded-xl shadow-sm flex flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8F23D] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#B8F23D]" /> Tổng Kinh Phí Trọn Gói Lớp
                  </span>
                  {priceDifference !== 0 && (
                    <span className="text-[9px] font-mono text-neutral-400 line-through">
                      {originalBudget.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {budget.toLocaleString('vi-VN')} <span className="text-xs font-normal text-neutral-300">VNĐ</span>
                </p>
                {priceNote ? (
                  <p className="text-[10px] text-[#B8F23D] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {priceNote}
                  </p>
                ) : (
                  <p className="text-[10px] text-neutral-400">
                    (Đã bao gồm trọn gói trang phục, vé vào cổng di tích, thợ chụp & hậu kỳ)
                  </p>
                )}
              </div>

              <div className="border-l border-neutral-700 pl-4 text-right space-y-0.5 shrink-0">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Mức Phí / Bạn:
                </span>
                <p className="text-base sm:text-xl font-black text-[#B8F23D] leading-tight">
                  ~ {perStudentCost.toLocaleString('vi-VN')} <span className="text-[10px] font-normal text-white">đ / bạn</span>
                </p>
                <p className="text-[10px] text-neutral-400">
                  (Chia đều trên <strong>{customer.studentCount} học sinh</strong>)
                </p>
              </div>
            </div>

            {/* Tiến Độ Thanh Toán & Số Tài Khoản Cọc */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.06] space-y-1.5">
                <h4 className="font-bold text-neutral-900 text-[11px] flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tiến Độ Thanh Toán:
                </h4>
                <ul className="space-y-0.5 text-neutral-600 text-[10px]">
                  <li className="flex justify-between">
                    <span>• Đợt 1 (Cọc giữ lịch 30%):</span>
                    <strong className="text-neutral-900">{deposit30.toLocaleString('vi-VN')} đ</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>• Đợt 2 (Ngày bấm máy 50%):</span>
                    <strong className="text-neutral-900">{shootDay50.toLocaleString('vi-VN')} đ</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>• Đợt 3 (Bàn giao ảnh 20%):</span>
                    <strong className="text-neutral-900">{final20.toLocaleString('vi-VN')} đ</strong>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.06] space-y-1.5">
                <h4 className="font-bold text-neutral-900 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Tài Khoản Nhận Cọc Studio:
                </h4>
                <div className="text-neutral-700 space-y-0.5 font-mono text-[10px]">
                  <p>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></p>
                  <p>Số tài khoản: <strong className="text-neutral-950 font-bold text-xs">0981108601</strong></p>
                  <p>Chủ TK: <strong>CHU DUC DUY</strong></p>
                  <p className="text-[9px] text-neutral-500 font-sans mt-0.5">
                    Nội dung CK: <code className="bg-neutral-200 px-1 rounded font-bold">COC KYYEU {customer.className.toUpperCase()} {customer.phone}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Quà Tặng Đính Kèm Đặc Biệt */}
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-amber-950 leading-tight">
                <strong>ĐẶC QUYỀN ĐẶT CỌC SỚM TRONG 48 GIỜ:</strong> Tặng 01 ảnh tập thể khung gỗ tráng gương cao cấp khổ lớn (50x75cm) tri ân Giáo Viên Chủ Nhiệm + Miễn phí flycam góc rộng toàn trường!
              </p>
            </div>

            {/* Chữ Ký Xác Nhận 2 Bên */}
            <div className="pt-3 grid grid-cols-2 text-center text-xs">
              <div className="space-y-8">
                <div>
                  <p className="font-bold text-neutral-900 uppercase text-[11px]">ĐẠI DIỆN BAN CÁN SỰ LỚP</p>
                  <p className="text-neutral-500 text-[10px]">(Ký & ghi rõ họ tên)</p>
                </div>
                <p className="font-semibold text-neutral-900 text-xs">{customer.name}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="font-bold text-neutral-900 uppercase text-[11px]">ĐẠI DIỆN XOẮN MEDIA STUDIO</p>
                  <p className="text-neutral-500 text-[10px]">(Ký tên & Đóng dấu xác nhận)</p>
                </div>
                <p className="font-bold text-neutral-900 text-xs uppercase">{customer.assignedSalesName || 'LÊ HOÀNG SƠN'}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
