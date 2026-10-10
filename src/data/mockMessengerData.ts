import { FacebookChatConversation } from '../types';

// Xoá bỏ dữ liệu demo - Khởi tạo danh sách hội thoại Messenger rỗng để đồng bộ từ Fanpage thật
export const mockMessengerConversations: FacebookChatConversation[] = [];

export const quickReplyTemplates = [
  {
    id: 'qr-quote',
    title: '📸 Gửi Báo Giá Kỷ Yếu 2026',
    short: 'Báo giá 2026',
    text: `Dạ Xoăn Media gửi bạn bảng giá các gói Kỷ Yếu 2026 trọn gói cho lớp mình nhé:\n✨ Gói BASIC (299k/bạn): Chụp không giới hạn, Blend màu toàn bộ file, Tặng ảnh in 13x18.\n🌟 Gói CONCEPT VIP (499k/bạn): Miễn phí 2 concept (Retro Hongkong/Cổ phục/Party), Trang phục + Makeup làm tóc trọn gói, Flycam 4K, Tặng photobook cao cấp!\n👉 Sĩ số lớp mình khoảng bao nhiêu bạn để anh/chị áp dụng ưu đãi giảm thêm 10% nhé?`
  },
  {
    id: 'qr-concept',
    title: '🎨 Tư Vấn Concept Hot Trend',
    short: 'Concept Hot',
    text: `Hiện tại Xoăn Media đang có các concept cực cháy cho mùa kỷ yếu năm nay nè:\n1. 🎬 Retro Hongkong 90s (Tone màu điện ảnh hoài niệm)\n2. 👘 Cổ phục Việt Nam / Áo Dài hoa sen truyền thống\n3. 🎒 Thanh xuân học đường Hàn Quốc\n4. 🎆 Dạ hội Prom Night & Party Pháo sáng ban đêm\n👉 Lớp mình thích vibe cá tính hay thanh xuân nhẹ nhàng để bên anh gửi ảnh mẫu lớp khác đã chụp nhé!`
  },
  {
    id: 'qr-deposit',
    title: '💰 Hướng Dẫn Chuyển Khoản Cọc (VietQR)',
    short: 'STK Cọc VietQR',
    text: `Để giữ ngày chụp đẹp nhất và chốt ekip thợ xịn cho lớp, lớp mình chuyển khoản cọc giúp anh vào tài khoản chính thức của Xoăn Media nhé:\n🏦 Ngân hàng: VietinBank (Công Thương Việt Nam)\n📍 Chi nhánh: CN Hải Phòng - PGD Kiến Thụy\n💳 STK: 106879341760\n👤 Chủ TK: DUONG HAI MINH\n💵 Số tiền cọc: 2.000.000 VNĐ\n📝 Nội dung CK: [Tên Lớp] - [Trường] - Coc ky yeu\n👉 Sau khi chuyển bạn gửi ảnh bill tại đây, CRM sẽ tự động kích hoạt hợp đồng và khóa lịch cho Ekip nhé!`
  },
  {
    id: 'qr-info',
    title: '📍 Xin SĐT & Ngày Dự Kiến Chụp',
    short: 'Xin SĐT & Ngày',
    text: `Dạ để bên anh kiểm tra lịch trống và giữ ngày chụp đẹp nhất (tránh bị trùng lịch với lớp khác trong trường), bạn cho anh xin:\n1. Số điện thoại / Zalo của bạn (hoặc lớp trưởng / ban cán sự):\n2. Ngày dự kiến chụp:\n3. Địa điểm lớp mình mong muốn chụp:\nBên anh sẽ lưu vào hệ thống CRM để tư vấn chi tiết nhất nhé!`
  }
];
