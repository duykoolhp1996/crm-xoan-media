import React, { useRef } from 'react';
import { Customer } from '../../types';
import {
  Printer,
  Copy,
  Check,
  X,
  Camera,
  School,
  Calendar,
  DollarSign,
  Phone,
  User,
  Sparkles,
  FileText,
  MapPin,
  CheckCircle2,
  Award,
  Layers,
  Send
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
  const [copiedZalo, setCopiedZalo] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !customer) return null;

  const quoteCode = `BG-${customer.className.replace(/\s+/g, '').toUpperCase()}-${customer.id.slice(-4).toUpperCase()}`;
  const todayStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const perStudentCost = customer.studentCount > 0
    ? Math.round(customer.expectedBudget / customer.studentCount)
    : 0;

  const deposit30 = Math.round(customer.expectedBudget * 0.3);
  const shootDay50 = Math.round(customer.expectedBudget * 0.5);
  const final20 = customer.expectedBudget - deposit30 - shootDay50;

  // Xử lý in / lưu file PDF (A4)
  const handlePrintPdf = () => {
    window.print();
  };

  // Sao chép nội dung tóm tắt để gửi Zalo cho Ban cán sự lớp
  const handleCopyZalo = () => {
    const text = `📸 BẢNG BÁO GIÁ KỶ YẾU 2026 - XOẮN MEDIA
━━━━━━━━━━━━━━━━━━━━━
🎓 Kính gửi: Tập thể lớp ${customer.className} - ${customer.schoolName}
👤 Đại diện: ${customer.name} (${customer.representativeRole || 'Lớp trưởng'}) - SĐT: ${customer.phone}
👥 Sỉ số lớp: ${customer.studentCount} bạn
📦 Gói dịch vụ: ${customer.servicePackageName || 'Gói Kỷ Yếu Standard Concept'}
✨ Concept: ${customer.concept || 'Thanh xuân vườn trường'}
📍 Địa điểm: ${customer.shootingLocations?.join(', ') || 'Trường học & Ngoại cảnh'}

💰 BẢNG TÍNH CHI PHÍ:
• Tổng kinh phí trọn gói: ${customer.expectedBudget.toLocaleString('vi-VN')} đ
👉 Chỉ khoảng: ${perStudentCost.toLocaleString('vi-VN')} đ / bạn

🎁 ĐẶC QUYỀN TẶNG KÈM:
✓ Áo cử nhân + bằng tốt nghiệp cho 100% học sinh
✓ Trang phục chụp concept độc quyền của Xoắn Media
✓ Chụp không giới hạn ảnh, trả toàn bộ file gốc trong 24h
✓ Chỉnh sửa Photoshop chuyên sâu từng thành viên
✓ Tặng 01 ảnh tập thể ép gỗ cao cấp cho Giáo Viên Chủ Nhiệm
✓ Đạo cụ: Loa kéo, pháo khói, bột màu party night

📞 Chuyên viên tư vấn: ${customer.assignedSalesName || 'Xoắn Media'}
🌐 Hotline: 0981 108 601 • Website: xoanmedia.vn`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Thanh Công Cụ (Ẩn khi in ấn) */}
        <div className="p-4 sm:px-6 bg-neutral-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B8F23D]/20 text-[#B8F23D] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-white">
                Báo Giá Kỷ Yếu PDF <span className="text-[11px] font-mono text-[#B8F23D] bg-[#B8F23D]/20 px-2 py-0.5 rounded-full">{quoteCode}</span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Xuất file PDF chuẩn khổ A4 hoặc sao chép gửi Zalo cho tập thể lớp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyZalo}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
              title="Sao chép tóm tắt gửi Zalo cho lớp"
            >
              {copiedZalo ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Đã Copy Zalo!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Gửi Zalo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In / Xuất PDF (A4)</span>
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

        {/* Khung Nội Dung Báo Giá A4 (Vùng in chuẩn) */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 bg-neutral-100/60 custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
          <div
            ref={printRef}
            className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-black/[0.06] text-neutral-800 font-sans space-y-6 print:border-none print:shadow-none print:p-8 print:max-w-none print:m-0"
          >
            {/* Header Thương Hiệu Studio */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-neutral-900 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-[#B8F23D] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  <Camera className="w-8 h-8 text-[#B8F23D]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 uppercase">
                    XOẮN MEDIA STUDIO
                  </h1>
                  <p className="text-xs text-neutral-600 font-semibold tracking-wide">
                    HỆ THỐNG KỶ YẾU & NGHỆ THUẬT HỌC ĐƯỜNG HÀNG ĐẦU
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Hải Phòng: Lê Chân • Hà Nội: Cầu Giấy • Hotline: <strong>0981 108 601</strong>
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-neutral-200 sm:pl-4 text-xs space-y-1">
                <p className="font-mono text-xs text-neutral-500">Mã Báo Giá:</p>
                <p className="font-mono font-bold text-neutral-950 text-sm">{quoteCode}</p>
                <p className="text-[11px] text-neutral-500">Ngày lập: <strong>{todayStr}</strong></p>
                <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block font-semibold">
                  Hiệu lực 15 ngày
                </p>
              </div>
            </div>

            {/* Tiêu Đề Báo Giá */}
            <div className="text-center space-y-1 pt-1">
              <h2 className="text-lg sm:text-xl font-black text-neutral-950 uppercase tracking-tight">
                BẢNG BÁO GIÁ DỊCH VỤ CHỤP ẢNH KỶ YẾU 2026
              </h2>
              <p className="text-xs text-neutral-500 italic">
                (Áp dụng cho mùa kỷ yếu THPT & Đại Học niên khóa 2025 - 2026)
              </p>
            </div>

            {/* Khối Thông Tin Lớp Học & Người Đại Diện */}
            <div className="p-4 bg-neutral-50/80 rounded-2xl border border-black/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <p className="text-neutral-500 font-medium">Kính gửi ban cán sự & tập thể lớp:</p>
                <p className="text-sm font-bold text-neutral-950 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-600" />
                  Lớp {customer.className} — {customer.schoolName}
                </p>
                <p className="text-neutral-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  Đại diện: <strong>{customer.name}</strong> ({customer.representativeRole || 'Lớp trưởng'})
                </p>
                <p className="text-neutral-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  Số điện thoại: <strong>{customer.phone}</strong>
                </p>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-neutral-200 sm:pl-4">
                <p className="text-neutral-500 font-medium">Chi tiết thông tin chụp:</p>
                <p className="text-neutral-700">
                  • Sỉ số thành viên tham gia: <strong className="text-neutral-950">{customer.studentCount} bạn</strong>
                </p>
                <p className="text-neutral-700">
                  • Concept lựa chọn: <strong className="text-purple-700 font-bold">{customer.concept || 'Thanh xuân vườn trường'}</strong>
                </p>
                <p className="text-neutral-700">
                  • Địa điểm chụp dự kiến: <strong className="text-neutral-900">{customer.shootingLocations?.join(', ') || 'Trường học & Phim trường ngoại cảnh'}</strong>
                </p>
                <p className="text-neutral-700">
                  • Chuyên viên Sales tư vấn: <strong className="text-blue-700">{customer.assignedSalesName || 'Xoắn Media Sales Lead'}</strong>
                </p>
              </div>
            </div>

            {/* Bảng Chi Tiết Gói Dịch Vụ */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" /> Chi Tiết Quyền Lợi Gói: {customer.servicePackageName || 'Gói Kỷ Yếu Standard'}
              </h3>

              <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
                <thead className="bg-neutral-900 text-white font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th className="py-2.5 px-3">Hạng Mục Quyền Lợi</th>
                    <th className="py-2.5 px-3">Chi Tiết Cung Cấp</th>
                    <th className="py-2.5 px-3 text-center">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 text-center font-bold">1</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Đội Ngũ Ekip Bấm Máy</td>
                    <td className="py-2.5 px-3">2 Thợ chụp chính + 1 Thợ phụ chuyên nghiệp, nhiệt tình tạo dáng</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">Đầy đủ</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 text-center font-bold">2</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Trang Phục Tốt Nghiệp</td>
                    <td className="py-2.5 px-3">Áo cử nhân + Bằng tốt nghiệp + Cà vạt / Nơ + Vòng hoa đội đầu</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">100% Học sinh</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 text-center font-bold">3</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Trang Phục Concept Hot</td>
                    <td className="py-2.5 px-3">01 Bộ trang phục Concept theo yêu cầu (Cổ phục / Retro 90s / Học đường)</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">Trọn gói</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 text-center font-bold">4</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Số Lượng Hình Ảnh</td>
                    <td className="py-2.5 px-3">Chụp không giới hạn (từ 1.000 - 2.500 ảnh). Trả toàn bộ ảnh gốc sau 24h</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">Không giới hạn</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 text-center font-bold">5</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Hậu Kỳ & Chỉnh Sửa</td>
                    <td className="py-2.5 px-3">Chỉnh sửa Photoshop chuyên sâu 100 - 150 ảnh tập thể và ảnh đơn</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">Chuyên sâu</td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50">
                    <td className="py-2.5 px-3 text-center font-bold">6</td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-900">Đạo Cụ & Party Night</td>
                    <td className="py-2.5 px-3">Loa kéo công suất lớn, bột màu nhiều màu sắc, pháo bông sáng nghệ thuật</td>
                    <td className="py-2.5 px-3 text-center text-emerald-700 font-bold">Miễn phí</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bảng Chiết Tính Tài Chính */}
            <div className="p-4 bg-gradient-to-r from-neutral-950 to-neutral-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8F23D] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#B8F23D]" /> Tổng Kinh Phí Trọn Gói Lớp
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white">
                  {customer.expectedBudget.toLocaleString('vi-VN')} <span className="text-sm font-normal text-neutral-300">VNĐ</span>
                </p>
                <p className="text-xs text-neutral-300">
                  (Đã bao gồm toàn bộ trang phục, vé vào cổng di tích, thợ chụp & hậu kỳ)
                </p>
              </div>

              <div className="sm:border-l sm:border-neutral-700 sm:pl-6 text-left sm:text-right space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Mức Học Phí / Bạn:
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#B8F23D]">
                  ~ {perStudentCost.toLocaleString('vi-VN')} <span className="text-xs font-normal text-white">đ / học sinh</span>
                </p>
                <p className="text-[11px] text-neutral-400">
                  (Tính trên quy mô <strong>{customer.studentCount} bạn</strong>)
                </p>
              </div>
            </div>

            {/* Tiến Độ Thanh Toán & Số Tài Khoản Cọc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-black/[0.06] space-y-2">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tiến Độ Thanh Toán:
                </h4>
                <ul className="space-y-1 text-neutral-600">
                  <li className="flex justify-between">
                    <span>• Đợt 1 (Cọc giữ lịch & ekip 30%):</span>
                    <strong className="text-neutral-900">{deposit30.toLocaleString('vi-VN')} đ</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>• Đợt 2 (Ngày bấm máy chụp 50%):</span>
                    <strong className="text-neutral-900">{shootDay50.toLocaleString('vi-VN')} đ</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>• Đợt 3 (Khi bàn giao ảnh hoàn thiện 20%):</span>
                    <strong className="text-neutral-900">{final20.toLocaleString('vi-VN')} đ</strong>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-xl border border-black/[0.06] space-y-2">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Thông Tin Tài Khoản Nhận Cọc:
                </h4>
                <div className="text-neutral-700 space-y-0.5 font-mono text-[11px]">
                  <p>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></p>
                  <p>Số tài khoản: <strong className="text-neutral-900 font-bold text-xs">0981108601</strong></p>
                  <p>Chủ tài khoản: <strong>CHU DUC DUY</strong></p>
                  <p className="text-[10px] text-neutral-500 font-sans mt-1">
                    Nội dung CK: <code className="bg-neutral-200 px-1 rounded font-bold">COC KYYEU {customer.className.toUpperCase()} {customer.phone}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Quà Tặng Đính Kèm Đặc Biệt */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-amber-900">
                <strong>ĐẶC QUYỀN ĐẶT CỌC SỚM TRONG 48 GIỜ:</strong> Tặng 01 ảnh tập thể khung gỗ tráng gương cao cấp khổ lớn (50x75cm) tri ân Giáo Viên Chủ Nhiệm + Miễn phí flycam góc rộng toàn trường!
              </p>
            </div>

            {/* Chữ Ký Xác Nhận 2 Bên */}
            <div className="pt-6 grid grid-cols-2 text-center text-xs">
              <div className="space-y-12">
                <div>
                  <p className="font-bold text-neutral-900 uppercase">ĐẠI DIỆN BAN CÁN SỰ LỚP</p>
                  <p className="text-neutral-500 text-[11px]">(Ký & ghi rõ họ tên)</p>
                </div>
                <p className="font-semibold text-neutral-900 text-xs">{customer.name}</p>
              </div>

              <div className="space-y-12">
                <div>
                  <p className="font-bold text-neutral-900 uppercase">ĐẠI DIỆN XOẮN MEDIA STUDIO</p>
                  <p className="text-neutral-500 text-[11px]">(Ký tên & Đóng dấu xác nhận)</p>
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
