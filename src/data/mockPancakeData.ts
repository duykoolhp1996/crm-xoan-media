import { FacebookChatConversation } from '../types';

export interface PancakeChannel {
  id: string;
  name: string;
  platform: 'facebook' | 'zalo' | 'tiktok' | 'instagram';
  avatar: string;
  color: string;
  badge?: string;
  unreadCount?: number;
}

export const PANCAKE_CHANNELS: PancakeChannel[] = [
  {
    id: 'all',
    name: 'Tất cả các kênh',
    platform: 'facebook',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    color: '#0084FF',
    badge: 'ALL'
  },
  {
    id: '111065964964204',
    name: 'Xoăn Media - Chụp Ảnh Kỷ Yếu',
    platform: 'facebook',
    avatar: 'https://ui-avatars.com/api/?name=Xoan+Media&background=1877F2&color=fff&bold=true',
    color: '#1877F2',
    badge: 'Fanpage Live'
  }
];

export interface PancakeTagDef {
  id: string;
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const PANCAKE_AVAILABLE_TAGS: PancakeTagDef[] = [
  { id: 'vip', name: '🔥 VIP', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'call_now', name: '📞 Cần gọi lại', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'consulting', name: '💬 Đang tư vấn', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'deposited', name: '💰 Đã cọc VietQR', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'schedule_pending', name: '📅 Chờ duyệt ngày', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'concept_hot', name: '🎒 Concept Hot', color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200' },
  { id: 'not_closed', name: '❌ Chưa chốt', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'prom_night', name: '🎆 Dạ hội Prom', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' }
];

import realConvs from './realConversations.json';

export const INITIAL_PANCAKE_CONVERSATIONS: FacebookChatConversation[] = realConvs as unknown as FacebookChatConversation[];

export const PANCAKE_QUICK_SCRIPTS = [
  {
    id: 'script-quote',
    category: 'Báo Giá',
    code: '/baogia',
    title: '📸 Gửi Báo Giá Kỷ Yếu 2026',
    text: `Dạ Xoăn Media gửi bạn bảng giá các gói Kỷ Yếu 2026 trọn gói cho lớp mình nhé:\n✨ Gói BASIC (299k/bạn): Chụp không giới hạn, Blend màu toàn bộ file, Tặng ảnh in 13x18.\n🌟 Gói CONCEPT VIP (499k/bạn): Miễn phí 2 concept (Retro Hongkong/Cổ phục/Party), Trang phục + Makeup làm tóc trọn gói, Flycam 4K, Tặng photobook cao cấp!\n👉 Sĩ số lớp mình khoảng bao nhiêu bạn để anh/chị áp dụng ưu đãi giảm thêm 10% nhé?`
  },
  {
    id: 'script-concept',
    category: 'Concept',
    code: '/concept',
    title: '🎨 Tư Vấn Concept Hot Trend',
    text: `Hiện tại Xoăn Media đang có các concept cực cháy cho mùa kỷ yếu năm nay nè:\n1. 🎬 Retro Hongkong 90s (Tone màu điện ảnh hoài niệm)\n2. 👘 Cổ phục Việt Nam / Áo Dài hoa sen truyền thống\n3. 🎒 Thanh xuân học đường Hàn Quốc\n4. 🎆 Dạ hội Prom Night & Party Pháo sáng ban đêm\n👉 Lớp mình thích vibe cá tính hay thanh xuân nhẹ nhàng để bên anh gửi ảnh mẫu lớp khác đã chụp nhé!`
  },
  {
    id: 'script-deposit',
    category: 'Đặt Cọc',
    code: '/coc',
    title: '💰 STK Chuyển Khoản Cọc (VietQR)',
    text: `Để giữ ngày chụp đẹp nhất và chốt ekip thợ xịn cho lớp, lớp mình chuyển khoản cọc giúp anh vào tài khoản chính thức của Xoăn Media nhé:\n🏦 Ngân hàng: VietinBank (Công Thương Việt Nam)\n📍 Chi nhánh: CN Hải Phòng - PGD Kiến Thụy\n💳 STK: 106879341760\n👤 Chủ TK: DUONG HAI MINH\n💵 Số tiền cọc: 2.000.000 VNĐ\n📝 Nội dung CK: [Tên Lớp] - [Trường] - Coc ky yeu\n👉 Sau khi chuyển bạn gửi ảnh bill tại đây, CRM sẽ tự động kích hoạt hợp đồng và khóa lịch cho Ekip nhé!`
  },
  {
    id: 'script-phone',
    category: 'Xin Số',
    code: '/xinsdt',
    title: '📍 Xin SĐT & Ngày Dự Kiến Chụp',
    text: `Dạ để bên anh kiểm tra lịch trống và giữ ngày chụp đẹp nhất (tránh bị trùng lịch với lớp khác trong trường), bạn cho anh xin:\n1. Số điện thoại / Zalo của bạn (hoặc lớp trưởng / ban cán sự):\n2. Ngày dự kiến chụp:\n3. Địa điểm lớp mình mong muốn chụp:\nBên anh sẽ lưu vào hệ thống CRM để tư vấn chi tiết nhất nhé!`
  },
  {
    id: 'script-flow',
    category: 'Quy Trình',
    code: '/quytrinh',
    title: '📋 Quy Trình Chụp Kỷ Yếu Xoăn Media',
    text: `Quy trình dịch vụ chuyên nghiệp tại Xoăn Media gồm 4 bước:\n1. Tư vấn concept & chọn ngày chụp phù hợp.\n2. Chốt cọc VietQR & ký hợp đồng bảo đảm quyền lợi lớp.\n3. Ngày chụp: Ekip thợ chuyên nghiệp chụp nhiệt tình từ sáng tới chiều, có flycam & hỗ trợ tạo dáng 1-1.\n4. Trả toàn bộ file gốc trong 24h & Photoshop màu cao cấp trả trong 5-7 ngày!`
  }
];
