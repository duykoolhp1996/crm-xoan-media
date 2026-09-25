import React, { useState, useEffect } from 'react';
import logoXoan from '../../assets/logo-xoan.png';
import { Customer, QuoteItem } from '../../types';
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
  Plus,
  Trash2,
  Edit3,
  Percent,
  Eye,
  Settings2
} from 'lucide-react';

interface PriceQuoteModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

// Các mẫu dịch vụ kỷ yếu phổ biến để Sales thêm nhanh
const QUICK_SERVICE_TEMPLATES = [
  { name: 'Quay Flycam 4K toàn cảnh trường', unit: 'Buổi', unitPrice: 800000, discount: 0, note: 'Bao gồm flycam góc rộng toàn trường' },
  { name: 'Video Highlight Kỷ Yếu 4K nghệ thuật', unit: 'Clip', unitPrice: 1500000, discount: 0, note: 'Quay dựng MV kỷ yếu âm nhạc chất lượng cao' },
  { name: 'Xe 29 chỗ đưa đón ngoại cảnh trọn gói', unit: 'Chuyến', unitPrice: 1800000, discount: 0, note: 'Đưa đón 2 chiều an toàn' },
  { name: 'Bộ Trang Phục Concept Thứ 2 (Retro / Cổ phục)', unit: 'Bộ', unitPrice: 70000, isPerStudent: true, discount: 0, note: 'Thuê thêm concept chụp ngoại cảnh' },
  { name: 'Thêm 01 Thợ Chụp Bổ Sung Bấm Máy', unit: 'Thợ', unitPrice: 500000, discount: 0, note: 'Chăm chút góc máy cá nhân từng thành viên' },
  { name: 'In Photobook Kỷ Yếu Bìa Cứng Cao Cấp', unit: 'Cuốn', unitPrice: 150000, isPerStudent: true, discount: 0, note: 'Mỗi học sinh 01 cuốn lưu bút kỷ niệm' },
];

export const PriceQuoteModal: React.FC<PriceQuoteModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const { updateCustomer, addActivityLog, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [quoteNote, setQuoteNote] = useState<string>('');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedZalo, setCopiedZalo] = useState<boolean>(false);

  // Tạo danh sách sản phẩm mặc định khi mở cho khách hàng
  useEffect(() => {
    if (customer) {
      const count = customer.studentCount || 35;
      const pkgName = customer.servicePackageName || 'Gói Kỷ Yếu Standard';
      
      const defaultItems: QuoteItem[] = [
        {
          id: 'item-1',
          name: `Gói Chụp Kỷ Yếu Trọn Gói (${pkgName})`,
          category: 'package',
          unit: 'Gói',
          quantity: 1,
          unitPrice: customer.expectedBudget ? Math.round(customer.expectedBudget * 0.7) : 6800000,
          discount: 0,
          discountType: 'fixed',
          note: 'Ekip 2 thợ chính + 1 thợ phụ bấm máy trường & ngoại cảnh'
        },
        {
          id: 'item-2',
          name: 'Trang phục Cử nhân Tốt nghiệp + Bằng + Cà vạt/Nơ + Vòng hoa',
          category: 'costume',
          unit: 'Bộ',
          quantity: count,
          unitPrice: 40000,
          discount: 40000 * count, // Tài trợ 100%
          discountType: 'fixed',
          note: 'Tài trợ miễn phí 100% cho tất cả học sinh trong lớp'
        },
        {
          id: 'item-3',
          name: `Trang phục Concept độc quyền (${customer.concept || 'Thanh xuân vườn trường'})`,
          category: 'costume',
          unit: 'Bộ',
          quantity: count,
          unitPrice: 80000,
          discount: 0,
          discountType: 'fixed',
          note: 'Đầy đủ phụ kiện theo concept đã chọn'
        },
        {
          id: 'item-4',
          name: 'Đạo cụ Party Night (Loa kéo lớn, bột màu, pháo bông sáng)',
          category: 'party',
          unit: 'Gói',
          quantity: 1,
          unitPrice: 1000000,
          discount: 500000,
          discountType: 'fixed',
          note: 'Ưu đãi giảm 50% khi chốt lịch sớm'
        },
        {
          id: 'item-5',
          name: 'Hậu kỳ Photoshop chuyên sâu + Trả toàn bộ ảnh gốc sau 24h',
          category: 'media',
          unit: 'Gói',
          quantity: 1,
          unitPrice: 1500000,
          discount: 1500000, // Tặng kèm
          discountType: 'fixed',
          note: 'Chỉnh sửa 100 - 150 ảnh tập thể và cá nhân'
        },
        {
          id: 'item-6',
          name: 'Quà tặng: 01 Ảnh tập thể khung gỗ tráng gương (50x75cm) cho GVCN',
          category: 'print',
          unit: 'Chiếc',
          quantity: 1,
          unitPrice: 600000,
          discount: 600000, // Tặng kèm
          discountType: 'fixed',
          note: 'Đặc quyền tri ân Giáo Viên Chủ Nhiệm'
        }
      ];

      setItems(defaultItems);
      setQuoteNote(customer.notes || '');
      setOverallDiscount(0);
      setSavedSuccess(false);
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const quoteCode = `BG-${customer.className.replace(/\s+/g, '').toUpperCase()}-${customer.id.slice(-4).toUpperCase()}`;
  const todayStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const studentCount = customer.studentCount || 1;

  // Tính toán dòng sản phẩm
  const getItemLineTotal = (item: QuoteItem) => {
    const rawTotal = item.quantity * item.unitPrice;
    const discountVal = item.discountType === 'percentage'
      ? Math.round((rawTotal * item.discount) / 100)
      : item.discount;
    return Math.max(0, rawTotal - discountVal);
  };

  const totalBeforeDiscount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalItemDiscounts = items.reduce((sum, item) => {
    const rawTotal = item.quantity * item.unitPrice;
    const discountVal = item.discountType === 'percentage'
      ? Math.round((rawTotal * item.discount) / 100)
      : item.discount;
    return sum + discountVal;
  }, 0);

  const subtotalAfterItemDiscounts = items.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  const finalBudget = Math.max(0, subtotalAfterItemDiscounts - overallDiscount);
  const grandTotalDiscount = totalItemDiscounts + overallDiscount;

  const perStudentCost = Math.round(finalBudget / studentCount);
  const deposit30 = Math.round(finalBudget * 0.3);
  const shootDay50 = Math.round(finalBudget * 0.5);
  const final20 = finalBudget - deposit30 - shootDay50;

  // Cập nhật từng thuộc tính của dòng sản phẩm
  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return { ...item, [field]: value };
    }));
    setSavedSuccess(false);
  };

  // Thêm dòng mới tùy chỉnh
  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: 'Dịch vụ / Hạng mục phát sinh',
      unit: 'Gói',
      quantity: 1,
      unitPrice: 500000,
      discount: 0,
      discountType: 'fixed',
      note: 'Theo yêu cầu của lớp'
    };
    setItems(prev => [...prev, newItem]);
    setSavedSuccess(false);
  };

  // Thêm từ mẫu dịch vụ nhanh
  const handleAddTemplate = (tpl: typeof QUICK_SERVICE_TEMPLATES[0]) => {
    const qty = tpl.isPerStudent ? studentCount : 1;
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      name: tpl.name,
      unit: tpl.unit,
      quantity: qty,
      unitPrice: tpl.unitPrice,
      discount: tpl.discount,
      discountType: 'fixed',
      note: tpl.note
    };
    setItems(prev => [...prev, newItem]);
    setSavedSuccess(false);
  };

  // Xóa dòng sản phẩm
  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSavedSuccess(false);
  };

  // Lưu báo giá vào CRM
  const handleSaveToCrm = () => {
    if (!customer) return;
    const updatedCust: Customer = {
      ...customer,
      expectedBudget: finalBudget,
      notes: quoteNote ? `${customer.notes ? customer.notes + '\n' : ''}[Báo giá mới]: ${finalBudget.toLocaleString('vi-VN')} đ (Ghi chú: ${quoteNote})`.trim() : customer.notes,
      updatedAt: new Date().toISOString()
    };
    updateCustomer(updatedCust);

    addActivityLog({
      type: 'quote_sent',
      title: 'Tạo & Điều chỉnh Bảng Báo Giá chi tiết',
      description: `Sales ${currentUser.name} đã cập nhật Bảng Báo Giá chi tiết cho lớp ${customer.className}: Tổng ${finalBudget.toLocaleString('vi-VN')} đ (${items.length} hạng mục) - Mức phí: ~${perStudentCost.toLocaleString('vi-VN')} đ/bạn.`,
      customerId: customer.id,
      performedByName: currentUser.name
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Xử lý IN & XUẤT PDF qua IFRAME ĐỘC LẬP (Tuyệt đối không dính Sidebar hay giao diện web)
  const handlePrintPdf = () => {
    const printEl = document.getElementById('printable-quote-paper');
    if (!printEl) return;

    // Xóa iframe in cũ nếu có
    const oldIframe = document.getElementById('quote-print-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    // Tạo iframe ẩn độc lập hoàn toàn với trang web
    const iframe = document.createElement('iframe');
    iframe.id = 'quote-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Lấy toàn bộ styles từ tài liệu hiện tại
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(s => s.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="utf-8" />
          <title>Bao_Gia_${customer.className}_${quoteCode}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #111827 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
            #print-container {
              width: 195mm;
              max-width: 195mm;
              margin: 0 auto;
              padding: 4mm 6mm;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          <div id="print-container">
            ${printEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Kích hoạt in sau khi render tài liệu trong iframe
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  };

  // Sao chép tin nhắn Zalo
  const handleCopyZalo = () => {
    const itemsText = items.map((it, idx) => {
      const lineTotal = getItemLineTotal(it);
      return `${idx + 1}. ${it.name} (${it.quantity} ${it.unit}): ${lineTotal.toLocaleString('vi-VN')} đ${it.discount > 0 ? ` (Đã giảm ${it.discount.toLocaleString('vi-VN')}đ)` : ''}`;
    }).join('\n');

    const text = `📸 BẢNG BÁO GIÁ KỶ YẾU 2026 - XOẮN MEDIA STUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 Kính gửi: Tập thể lớp ${customer.className} - ${customer.schoolName}
👤 Đại diện: ${customer.name} (${customer.representativeRole || 'Lớp trưởng'}) - SĐT: ${customer.phone}
👥 Sỉ số lớp: ${customer.studentCount} bạn
📦 Gói: ${customer.servicePackageName || 'Gói Kỷ Yếu Standard'}
✨ Concept: ${customer.concept || 'Thanh xuân vườn trường'}
📍 Địa điểm: ${customer.shootingLocations?.join(', ') || 'Trường học & Ngoại cảnh'}

📋 CHI TIẾT SẢN PHẨM & DỊCH VỤ:
${itemsText}

💰 TỔNG HỢP KINH PHÍ:
• Tổng kinh phí trước chiết khấu: ${totalBeforeDiscount.toLocaleString('vi-VN')} đ
• Tổng chiết khấu & ưu đãi: -${grandTotalDiscount.toLocaleString('vi-VN')} đ
👉 TỔNG THANH TOÁN TRỌN GÓI: ${finalBudget.toLocaleString('vi-VN')} đ
👉 MỨC PHÍ BÌNH QUÂN: ~ ${perStudentCost.toLocaleString('vi-VN')} đ / bạn

💳 LỘ TRÌNH THANH TOÁN (3 ĐỢT):
1. Đợt 1 (Cọc giữ lịch 30%): ${deposit30.toLocaleString('vi-VN')} đ
2. Đợt 2 (Ngày bấm máy 50%): ${shootDay50.toLocaleString('vi-VN')} đ
3. Đợt 3 (Bàn giao ảnh 20%): ${final20.toLocaleString('vi-VN')} đ

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="p-3 sm:px-6 bg-neutral-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <img
              src={logoXoan}
              alt="Xoắn Media"
              className="w-9 h-9 rounded-xl object-cover shadow-sm border border-neutral-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Quy Trình Tạo Báo Giá Kỷ Yếu
                </h2>
                <span className="text-[11px] font-mono text-[#B8F23D] bg-[#B8F23D]/20 px-2 py-0.5 rounded-full font-bold">
                  {quoteCode}
                </span>
                <span className="text-xs font-bold text-neutral-300">
                  • Lớp {customer.className} ({studentCount} bạn)
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Tạo bảng giá chi tiết sản phẩm, số lượng, chiết khấu • Xuất file PDF chuẩn A4 không dính thanh menu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chuyển đổi tab Soạn Thảo vs Xem trước A4 */}
            <div className="flex bg-neutral-800 p-1 rounded-xl border border-neutral-700">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-[#B8F23D] text-neutral-950 shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>1. Tạo Bảng Giá & Chiết Khấu</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[#B8F23D] text-neutral-950 shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2. Xem & Xuất PDF A4</span>
              </button>
            </div>

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
                  <span className="hidden md:inline">Gửi Zalo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Xuất file PDF qua giao diện in sạch sẽ (không dính Sidebar)"
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

        {/* TAB 1: BẢNG SOẠN THẢO SẢN PHẨM, SỐ LƯỢNG & CHIẾT KHẤU */}
        {activeTab === 'editor' && (
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-neutral-50 custom-scrollbar space-y-4">
            
            {/* Thanh tác vụ trên cùng */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/[0.06] shadow-2xs">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#79ba07]" />
                  Danh Sách Sản Phẩm / Dịch Vụ Trong Báo Giá ({items.length} mục)
                </h3>
                <p className="text-xs text-neutral-500">
                  Sales có thể tùy chỉnh tên, số lượng, đơn giá và mức chiết khấu cho từng sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-2">
                {savedSuccess && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Đã lưu vào CRM!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveToCrm}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title="Lưu bảng báo giá và ngân sách mới vào hồ sơ CRM"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Vào CRM</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#B8F23D]" />
                  <span>Thêm Hạng Mục</span>
                </button>
              </div>
            </div>

            {/* Bảng Danh Sách Sản Phẩm & Chiết Khấu */}
            <div className="bg-white rounded-2xl border border-black/[0.08] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">STT</th>
                      <th className="py-3 px-3 min-w-[240px]">Tên Sản Phẩm / Dịch Vụ</th>
                      <th className="py-3 px-3 w-20 text-center">ĐVT</th>
                      <th className="py-3 px-3 w-20 text-center">Số Lượng</th>
                      <th className="py-3 px-3 w-32 text-right">Đơn Giá (đ)</th>
                      <th className="py-3 px-3 w-32 text-right">Chiết Khấu (đ)</th>
                      <th className="py-3 px-3 w-32 text-right">Thành Tiền (đ)</th>
                      <th className="py-3 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {items.map((item, index) => {
                      const lineTotal = getItemLineTotal(item);
                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-neutral-400">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="w-full font-semibold text-neutral-900 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:outline-none px-1 py-1 rounded transition-colors text-xs"
                              placeholder="Nhập tên sản phẩm..."
                            />
                            <input
                              type="text"
                              value={item.note || ''}
                              onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                              className="w-full text-[11px] text-neutral-400 bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-neutral-400 focus:outline-none px-1 py-0.5 mt-0.5 rounded"
                              placeholder="Ghi chú thêm (VD: Tặng kèm, Độc quyền)..."
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                              className="w-16 text-center text-neutral-700 bg-neutral-100 hover:bg-white border border-neutral-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-neutral-900 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-16 text-center font-bold text-neutral-900 bg-neutral-100 hover:bg-white border border-neutral-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-neutral-900 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              step="10000"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-28 text-right font-mono text-neutral-900 bg-neutral-100 hover:bg-white border border-neutral-200 rounded-lg px-2 py-1 focus:outline-none focus:border-neutral-900 text-xs"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              step="10000"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, 'discount', Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-28 text-right font-mono text-rose-600 bg-rose-50/70 hover:bg-white border border-rose-200 rounded-lg px-2 py-1 focus:outline-none focus:border-rose-600 text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 text-xs">
                            {lineTotal.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-7 h-7 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="Xóa hạng mục này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Hàng chọn nhanh dịch vụ thêm */}
              <div className="p-3 bg-neutral-50/80 border-t border-neutral-200 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Thêm nhanh dịch vụ:
                </span>
                {QUICK_SERVICE_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddTemplate(tpl)}
                    className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 text-neutral-700 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-neutral-500" />
                    <span>{tpl.name}</span>
                    <span className="font-mono text-neutral-400">({(tpl.unitPrice / 1000).toFixed(0)}k)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Khối Tổng Hợp Tài Chính & Chiết Khấu Toàn Đơn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Ghi chú báo giá & Chiết khấu thêm */}
              <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" /> Ghi Chú Ưu Đãi & Chiết Khấu Toàn Đơn
                </h4>
                
                <div>
                  <label className="text-[11px] text-neutral-500 font-medium block mb-1">
                    Chiết khấu thêm toàn bộ hợp đồng (VNĐ):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="50000"
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full font-mono font-bold text-rose-600 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-rose-500"
                      placeholder="VD: 500000..."
                    />
                    <button
                      type="button"
                      onClick={() => setOverallDiscount(500000)}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl"
                    >
                      500k
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverallDiscount(1000000)}
                      className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl"
                    >
                      1M
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-500 font-medium block mb-1">
                    Ghi chú hiển thị trên Báo Giá:
                  </label>
                  <textarea
                    rows={2}
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    className="w-full text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:border-neutral-900"
                    placeholder="VD: Đã bao gồm chiết khấu đăng ký sớm trong tuần + Miễn phí flycam góc rộng..."
                  />
                </div>
              </div>

              {/* Bảng Chiết Tính Tài Chính */}
              <div className="bg-neutral-950 text-white p-5 rounded-2xl shadow-md space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Tổng tiền sản phẩm/dịch vụ:</span>
                    <span className="font-mono text-white">{totalBeforeDiscount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-400">
                    <span>Tổng chiết khấu & ưu đãi:</span>
                    <span className="font-mono font-bold">-{grandTotalDiscount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="border-t border-neutral-800 pt-2 flex justify-between items-baseline">
                    <span className="text-xs uppercase font-bold text-[#B8F23D]">
                      TỔNG KINH PHÍ THANH TOÁN:
                    </span>
                    <span className="text-2xl font-black text-white font-mono">
                      {finalBudget.toLocaleString('vi-VN')} <span className="text-xs text-neutral-400 font-normal">VNĐ</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                    <span>Mức đóng bình quân / bạn ({studentCount} bạn):</span>
                    <span className="font-bold text-[#B8F23D] font-mono">
                      ~ {perStudentCost.toLocaleString('vi-VN')} đ / bạn
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="w-full py-2.5 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem Tờ Báo Giá PDF (A4) Hoàn Chỉnh</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: XEM & XUẤT TỜ BÁO GIÁ PDF A4 (CHUẨN CHỈNH TỪNG MILIMET, IN QUA IFRAME) */}
        {activeTab === 'preview' && (
          <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-neutral-100/70 custom-scrollbar">
            
            {/* TỜ GIẤY IN A4 CHUẨN */}
            <div
              id="printable-quote-paper"
              className="w-full max-w-[210mm] mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-black/[0.06] text-neutral-800 font-sans space-y-4"
            >
              {/* Header Thương Hiệu Studio */}
              <div className="flex flex-row items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logoXoan}
                    alt="Xoắn Media Studio"
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-neutral-200 shrink-0"
                  />
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

              {/* Khối Thông Tin Lớp Học & Đại Diện */}
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

              {/* BẢNG CHI TIẾT SẢN PHẨM / DỊCH VỤ, SỐ LƯỢNG & CHIẾT KHẤU */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" /> Danh Mục Sản Phẩm & Chi Phí Chi Tiết
                </h3>

                <table className="w-full text-left text-[11px] border border-neutral-200 rounded-lg overflow-hidden">
                  <thead className="bg-neutral-950 text-white font-bold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-2.5 w-8 text-center">STT</th>
                      <th className="py-2 px-2.5">Sản Phẩm / Dịch Vụ</th>
                      <th className="py-2 px-2 w-14 text-center">ĐVT</th>
                      <th className="py-2 px-2 w-12 text-center">SL</th>
                      <th className="py-2 px-2.5 w-24 text-right">Đơn Giá</th>
                      <th className="py-2 px-2.5 w-24 text-right">Chiết Khấu</th>
                      <th className="py-2 px-2.5 w-28 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-700">
                    {items.map((item, idx) => {
                      const lineTotal = getItemLineTotal(item);
                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/50">
                          <td className="py-1.5 px-2.5 text-center font-bold text-neutral-500">{idx + 1}</td>
                          <td className="py-1.5 px-2.5">
                            <span className="font-semibold text-neutral-900">{item.name}</span>
                            {item.note && (
                              <p className="text-[10px] text-neutral-500 italic">{item.note}</p>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-center">{item.unit}</td>
                          <td className="py-1.5 px-2 text-center font-bold text-neutral-900">{item.quantity}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono">{item.unitPrice.toLocaleString('vi-VN')} đ</td>
                          <td className="py-1.5 px-2.5 text-right font-mono text-rose-600">
                            {item.discount > 0 ? `-${item.discount.toLocaleString('vi-VN')} đ` : '-'}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-bold text-neutral-900">
                            {lineTotal.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* BẢNG TỔNG KẾT TÀI CHÍNH */}
              <div className="p-3.5 bg-neutral-950 text-white rounded-xl shadow-sm flex flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8F23D] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#B8F23D]" /> Tổng Kinh Phí Thanh Toán
                    </span>
                    {grandTotalDiscount > 0 && (
                      <span className="text-[9px] font-mono text-neutral-400 line-through">
                        {totalBeforeDiscount.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {finalBudget.toLocaleString('vi-VN')} <span className="text-xs font-normal text-neutral-300">VNĐ</span>
                  </p>
                  {quoteNote ? (
                    <p className="text-[10px] text-[#B8F23D] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {quoteNote}
                    </p>
                  ) : (
                    <p className="text-[10px] text-neutral-400">
                      (Đã bao gồm toàn bộ trang phục, vé di tích, thợ chụp & hậu kỳ Photoshop)
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
                    (Chia đều cho <strong>{customer.studentCount} học sinh</strong>)
                  </p>
                </div>
              </div>

              {/* Tiến Độ Thanh Toán & Số Tài Khoản Cọc */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.06] space-y-1.5">
                  <h4 className="font-bold text-neutral-900 text-[11px] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tiến Độ Thanh Toán (3 Đợt):
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
                      <span>• Đợt 3 (Bàn giao hoàn thiện 20%):</span>
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
        )}

      </div>
    </div>
  );
};
