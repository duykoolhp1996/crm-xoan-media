import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import logoXoan from '../../assets/logo-xoan.png';
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Send,
  Sparkles,
  Calendar,
  School,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DepositQrModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DepositQrModal: React.FC<DepositQrModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const { updateCustomer, addActivityLog, currentUser } = useApp();

  // Khởi tạo số tiền cọc (mặc định 30% tổng ngân sách, làm tròn tới hàng chục nghìn)
  const defaultDeposit = useMemo(() => {
    if (!customer) return 3000000;
    const total = customer.totalRevenue || customer.expectedBudget || 10000000;
    return Math.round((total * 0.3) / 10000) * 10000;
  }, [customer]);

  const [depositAmount, setDepositAmount] = useState<number>(defaultDeposit);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Cập nhật lại số tiền cọc khi customer thay đổi
  React.useEffect(() => {
    if (customer) {
      const total = customer.totalRevenue || customer.expectedBudget || 10000000;
      setDepositAmount(Math.round((total * 0.3) / 10000) * 10000);
      setIsSuccess(false);
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  // Cấu hình ngân hàng chính thức Xoắn Media
  const bankConfig = {
    bankId: 'MB',
    bankName: 'MB BANK (Ngân hàng Quân Đội)',
    accountNumber: '0981108601',
    accountName: 'CHU DUC DUY',
    hotline: '0981 108 601'
  };

  // Làm sạch tên lớp để làm cú pháp chuyển khoản
  const cleanClassName = customer.className
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  // Cú pháp chuyển khoản chuẩn tự động
  const transferSyntax = `COC KYYEU ${cleanClassName} ${customer.phone.replace(/\s+/g, '')}`;

  // Link ảnh VietQR chuẩn Napas 247
  const vietQrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNumber}-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

  // Tổng kinh phí hợp đồng
  const totalBudget = customer.totalRevenue || customer.expectedBudget || 0;
  const depositPercent = totalBudget > 0 ? Math.round((depositAmount / totalBudget) * 100) : 30;

  // Sao chép nội dung vào Clipboard
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Sao chép tin nhắn Zalo hướng dẫn chuyển khoản cọc
  const handleCopyZaloMessage = () => {
    const msg = `📸 XOẮN MEDIA STUDIO - THÔNG TIN CHUYỂN KHOẢN ĐẶT CỌC KỶ YẾU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 Kính gửi: Tập thể lớp ${customer.className} - ${customer.schoolName}
👤 Người đại diện: ${customer.name} (${customer.representativeRole || 'Lớp trưởng'}) - ${customer.phone}
💰 Tổng kinh phí hợp đồng: ${totalBudget.toLocaleString('vi-VN')} đ
👉 SỐ TIỀN CỌC ĐỢT 1: ${depositAmount.toLocaleString('vi-VN')} đ (${depositPercent}% giữ lịch chụp)

🏦 THÔNG TIN TÀI KHOẢN NHẬN CỌC CHÍNH THỨC:
• Ngân hàng: ${bankConfig.bankName}
• Số tài khoản (STK): ${bankConfig.accountNumber}
• Chủ tài khoản: ${bankConfig.accountName}
• Số tiền: ${depositAmount.toLocaleString('vi-VN')} đ
• Nội dung chuyển khoản: ${transferSyntax}

📲 HOẶC QUÉT MÃ QR NHANH:
Bạn mở App Ngân Hàng quét mã QR đính kèm để tự động điền đúng STK, Số tiền và Nội dung chuyển khoản!

📞 Hotline/Zalo hỗ trợ: ${bankConfig.hotline}
🌐 Website: xoanmedia.vn
Trân trọng cảm ơn tập thể lớp đã tin tưởng đồng hành cùng Xoắn Media Studio! ❤️`;

    navigator.clipboard.writeText(msg);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  // Tải ảnh QR về máy
  const handleDownloadQr = async () => {
    try {
      const response = await fetch(vietQrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_DatCoc_${cleanClassName}_${depositAmount}d.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(vietQrUrl, '_blank');
    }
  };

  // Xác nhận đã nhận cọc & chuyển sang giai đoạn 'Đã đặt cọc'
  const handleConfirmDeposit = () => {
    const newPaidAmount = (customer.paidAmount || 0) + depositAmount;

    updateCustomer({
      ...customer,
      paidAmount: newPaidAmount,
      pipelineStage: 'Đã đặt cọc',
      notes: `${customer.notes ? customer.notes + '\n' : ''}[${new Date().toLocaleDateString('vi-VN')}] Đã cọc ${depositAmount.toLocaleString('vi-VN')}đ qua QR MB Bank. ${customNote ? 'Ghi chú: ' + customNote : ''}`,
      updatedAt: new Date().toISOString()
    });

    addActivityLog({
      customerId: customer.id,
      type: 'deposit_paid',
      title: 'Xác nhận đặt cọc thành công',
      description: `Khách đã thanh toán cọc ${depositAmount.toLocaleString('vi-VN')}đ qua VietQR MB Bank (${bankConfig.accountNumber}). Tiến trình chuyển sang 'Đã đặt cọc'.`,
      performedByName: currentUser.name
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="p-4 sm:px-6 bg-neutral-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B8F23D] text-neutral-950 flex items-center justify-center font-black shrink-0 shadow-sm">
              <QrCode className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Tạo Cọc Giữ Lịch & Mã QR Chuyển Khoản
                </h2>
                <span className="text-[11px] font-bold bg-[#B8F23D]/20 text-[#B8F23D] px-2 py-0.5 rounded-full font-mono">
                  {customer.className}
                </span>
                <span className="text-xs text-neutral-400 hidden sm:inline">
                  • {customer.schoolName}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Sinh mã VietQR chuyển khoản tự động và chốt cọc giữ slot ekip thợ chụp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* THÔNG BÁO XÁC NHẬN THÀNH CÔNG */}
        {isSuccess && (
          <div className="p-4 bg-emerald-500 text-white text-center font-bold text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-5 h-5" />
            <span>Đã xác nhận nhận cọc thành công! Khách hàng đã được chuyển sang "Đã đặt cọc".</span>
          </div>
        )}

        {/* BODY 2 CỘT: CẤU HÌNH CỌC & MÃ VIETQR */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fafafa]">
          
          {/* CỘT TRÁI: THIẾT LẬP KHOẢN CỌC (7 CỘT) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Thông tin lớp học */}
            <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-900">{customer.className} - {customer.schoolName}</span>
                </div>
                <span className="text-[11px] font-semibold text-neutral-500">{customer.studentCount} bạn</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div>
                  <span className="text-[11px] text-neutral-400">Người đại diện:</span>
                  <p className="font-semibold text-neutral-800">{customer.name} ({customer.representativeRole || 'Lớp trưởng'})</p>
                  <p className="text-[11px] text-neutral-500">{customer.phone}</p>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400">Tổng kinh phí dự kiến:</span>
                  <p className="font-extrabold text-neutral-900 text-sm">
                    {totalBudget > 0 ? `${totalBudget.toLocaleString('vi-VN')} đ` : 'Chưa nhập'}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    {customer.servicePackageName || 'Gói Kỷ Yếu Concept'}
                  </p>
                </div>
              </div>
            </div>

            {/* Thiết lập số tiền cọc */}
            <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Số Tiền Cọc Đợt 1 (VNĐ)</span>
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {depositPercent}% tổng kinh phí
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="100000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xl sm:text-2xl font-black text-neutral-900 px-4 py-2.5 rounded-xl border border-black/[0.1] focus:outline-none focus:border-[#84cc16] bg-neutral-50/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400 text-sm">
                  VNĐ
                </span>
              </div>

              {/* Phím chọn nhanh tỷ lệ cọc */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-neutral-400 font-medium">Chọn nhanh:</span>
                {[
                  { label: '30%', value: Math.round((totalBudget * 0.3) / 10000) * 10000 || 3000000 },
                  { label: '40%', value: Math.round((totalBudget * 0.4) / 10000) * 10000 || 4000000 },
                  { label: '50%', value: Math.round((totalBudget * 0.5) / 10000) * 10000 || 5000000 },
                  { label: '3.000.000đ', value: 3000000 },
                  { label: '5.000.000đ', value: 5000000 }
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDepositAmount(chip.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      depositAmount === chip.value
                        ? 'bg-neutral-900 text-[#B8F23D] shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chi tiết tài khoản ngân hàng & Cú pháp */}
            <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-neutral-500" />
                Thông Tin Tài Khoản Nhận Cọc (Studio)
              </h3>

              <div className="space-y-2 text-xs">
                {/* Số tài khoản MB */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-black/[0.04]">
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium">{bankConfig.bankName}</p>
                    <p className="font-mono text-sm font-black text-neutral-900 tracking-wider">
                      {bankConfig.accountNumber}
                    </p>
                    <p className="text-[11px] text-neutral-600 font-bold uppercase">{bankConfig.accountName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.accountNumber, 'stk')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copiedField === 'stk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'stk' ? 'Đã sao chép' : 'Copy STK'}</span>
                  </button>
                </div>

                {/* Cú pháp chuyển khoản */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-black/[0.04]">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] text-neutral-400 font-medium">Nội Dung Chuyển Khoản (Tự động):</p>
                    <p className="font-mono text-xs font-bold text-indigo-700 truncate">{transferSyntax}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferSyntax, 'syntax')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                  >
                    {copiedField === 'syntax' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'syntax' ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Ghi chú thêm */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Ghi chú thỏa thuận cọc (nếu có):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ví dụ: Giữ slot ekip chụp ngày 28/11/2026..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-black/[0.08] focus:outline-none focus:border-[#84cc16] bg-neutral-50"
                />
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: MÃ VIETQR QUÉT TỰ ĐỘNG & HÀNH ĐỘNG (5 CỘT) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* THẺ VIETQR CARD HIỆN ĐẠI */}
            <div className="p-5 bg-white rounded-3xl border-2 border-[#B8F23D] shadow-md flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#B8F23D] text-neutral-950 px-3 py-0.5 text-[10px] font-black rounded-bl-xl uppercase tracking-wider">
                VietQR Napas 247
              </div>

              {/* Logo Xoắn & Ngân hàng */}
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={logoXoan}
                  alt="Xoắn Media"
                  className="w-8 h-8 rounded-xl object-cover shadow-xs border border-neutral-200"
                />
                <span className="font-extrabold text-neutral-900 text-xs">XOẮN MEDIA STUDIO</span>
              </div>

              {/* Khung Ảnh Mã QR */}
              <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-inner w-56 h-56 flex items-center justify-center">
                <img
                  src={vietQrUrl}
                  alt="Mã QR Chuyển Khoản Cọc"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thông tin tóm tắt bên dưới QR */}
              <div className="mt-3 space-y-1 w-full text-center">
                <p className="text-lg font-black text-neutral-900 tracking-tight">
                  {depositAmount.toLocaleString('vi-VN')} đ
                </p>
                <p className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-lg inline-block truncate max-w-full">
                  {transferSyntax}
                </p>
                <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quét bằng mọi app Ngân Hàng & Momo</span>
                </div>
              </div>

              {/* Nút thao tác nhanh với mã QR */}
              <div className="grid grid-cols-2 gap-2 w-full mt-4">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="px-2.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Tải ảnh QR về máy để gửi qua Zalo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Ảnh QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyZaloMessage}
                  className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Sao chép toàn bộ lời nhắn gửi cho lớp"
                >
                  {copiedZalo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5 text-[#B8F23D]" />}
                  <span>{copiedZalo ? 'Đã Copy!' : 'Gửi Zalo'}</span>
                </button>
              </div>
            </div>

            {/* NÚT CHỐT CỌC: XÁC NHẬN NHẬN TIỀN & CHUYỂN BƯỚC */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 via-lime-50 to-white rounded-2xl border border-emerald-200/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Xác Nhận Thu Cọc</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Khi ban cán sự lớp đã chuyển khoản thành công, bấm nút dưới đây để hệ thống tự động ghi nhận số tiền và chuyển sang giai đoạn <strong>"Đã đặt cọc"</strong>.
              </p>

              <button
                type="button"
                onClick={handleConfirmDeposit}
                className="w-full py-3 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                <span>Xác Nhận Đã Nhận Cọc {depositAmount.toLocaleString('vi-VN')}đ</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};
