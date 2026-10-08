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
    id: 'fb-xoan-hn',
    name: 'Xoăn Media - Kỷ Yếu & Sự Kiện',
    platform: 'facebook',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    color: '#1877F2',
    badge: 'Fanpage'
  },
  {
    id: 'fb-xoan-sg',
    name: 'Kỷ Yếu Hà Nội - Xoăn Studio',
    platform: 'facebook',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
    color: '#00A3FF',
    badge: 'Fanpage'
  },
  {
    id: 'zalo-oa',
    name: 'Zalo OA - Xoăn Media Official',
    platform: 'zalo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    color: '#0068FF',
    badge: 'Zalo OA'
  },
  {
    id: 'tiktok',
    name: 'TikTok @xoanmedia_official',
    platform: 'tiktok',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    color: '#FE2C55',
    badge: 'TikTok'
  },
  {
    id: 'instagram',
    name: 'Instagram @xoanmedia',
    platform: 'instagram',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    color: '#E1306C',
    badge: 'Instagram'
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

export const INITIAL_PANCAKE_CONVERSATIONS: FacebookChatConversation[] = [
  {
    id: 'pan-1',
    customerId: 'cust-1',
    customerName: 'Nguyễn Thảo My (Lớp trưởng)',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    customerClass: '12A1',
    customerSchool: 'THPT Chu Văn An (Hà Nội)',
    customerPhone: '0988776655',
    facebookUrl: 'https://facebook.com/thaomy.cva12a1',
    channel: 'facebook',
    channelId: 'fb-xoan-hn',
    pageName: 'Xoăn Media - Kỷ Yếu & Sự Kiện',
    unreadCount: 2,
    isReplied: false,
    lastMessage: 'Dạ anh ơi lớp em 42 bạn chốt gói VIP Concept Retro Hongkong ngày 25/10 rồi ạ! Gửi giúp em STK cọc với nhé.',
    lastMessageTime: '10:35',
    assignedSalesName: 'Duy Kool (Admin)',
    assignedSalesId: 'user-admin',
    pipelineStage: 'Đang thương lượng',
    tags: ['🔥 VIP', '📞 Cần gọi lại', '💰 Đã cọc VietQR'],
    notes: 'Lớp 12A1 CVA có 42 bạn. Muốn quay flycam 4K và tặng photobook cao cấp. Hẹn cọc 2 triệu.',
    messages: [
      {
        id: 'msg-1-1',
        sender: 'customer',
        senderName: 'Nguyễn Thảo My',
        text: 'Alo Xoăn Media ơi, em muốn hỏi gói chụp kỷ yếu cho lớp 12A1 Chu Văn An ạ!',
        timestamp: '09:15'
      },
      {
        id: 'msg-1-2',
        sender: 'sales',
        senderName: 'Duy Kool (Sales)',
        text: 'Chào Thảo My và lớp 12A1 Chu Văn An nhé! ✨ Xoăn Media hiện có gói VIP Concept cực kỳ hot cho khối 12 với đầy đủ trang phục, makeup và Flycam 4K nha.',
        timestamp: '09:20'
      },
      {
        id: 'msg-1-3',
        sender: 'sales',
        senderName: 'Duy Kool (Sales)',
        text: '📸 Xoăn gửi bạn bảng báo giá chi tiết gói Concept VIP nhé:',
        timestamp: '09:22',
        cardType: 'quote',
        cardData: {
          packageName: 'Gói VIP Concept Điện Ảnh',
          packagePrice: 499000,
          studentCount: 42,
          totalAmount: 20958000,
          depositAmount: 2000000,
          shootDate: '2026-10-25',
          location: 'Trường Chu Văn An + Phim trường Santorini'
        }
      },
      {
        id: 'msg-1-4',
        sender: 'customer',
        senderName: 'Nguyễn Thảo My',
        text: 'Dạ anh ơi lớp em 42 bạn chốt gói VIP Concept Retro Hongkong ngày 25/10 rồi ạ! Gửi giúp em STK cọc với nhé.',
        timestamp: '10:35'
      }
    ]
  },
  {
    id: 'pan-2',
    customerId: 'cust-2',
    customerName: 'Trần Hải Nam (Bí thư)',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    customerClass: '12 Chuyên Toán',
    customerSchool: 'THPT Chuyên Hà Nội - Amsterdam',
    customerPhone: '0912345678',
    facebookUrl: 'https://facebook.com/nam.ams12toan',
    channel: 'zalo',
    channelId: 'zalo-oa',
    pageName: 'Zalo OA - Xoăn Media Official',
    unreadCount: 0,
    isReplied: true,
    lastMessage: 'Xoăn Media đã nhận cọc 2.000.000 VNĐ cho lớp 12 Chuyên Toán qua VietQR MB Bank. Cảm ơn lớp mình!',
    lastMessageTime: '08:45',
    assignedSalesName: 'Lan Anh (Sales)',
    assignedSalesId: 'sales-lananh',
    pipelineStage: 'Đã đặt cọc',
    tags: ['💰 Đã cọc VietQR', '🔥 VIP'],
    notes: 'Đã chuyển cọc MB Bank lúc 08:30 sáng. Xếp 2 thợ chính + 1 thợ phụ flycam.',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'customer',
        senderName: 'Trần Hải Nam',
        text: 'Bên mình có nhận chụp concept Prom Dạ Hội ban đêm không anh?',
        timestamp: 'Hôm qua'
      },
      {
        id: 'msg-2-2',
        sender: 'sales',
        senderName: 'Lan Anh (Sales)',
        text: 'Dạ có em ơi, Xoăn Media chuyên trị tiệc Prom Night pháo sáng và dạ hội lung linh nha!',
        timestamp: 'Hôm qua'
      },
      {
        id: 'msg-2-3',
        sender: 'sales',
        senderName: 'Lan Anh (Sales)',
        text: 'Xoăn Media đã nhận cọc 2.000.000 VNĐ cho lớp 12 Chuyên Toán qua VietQR MB Bank. Cảm ơn lớp mình!',
        timestamp: '08:45',
        cardType: 'vietqr',
        cardData: {
          bankName: 'MB Bank (Quân Đội)',
          accountNo: '09876543210',
          accountHolder: 'TA VAN DUY',
          depositAmount: 2000000,
          transferSyntax: '12 TOAN AMS - COC KY YEU'
        }
      }
    ]
  },
  {
    id: 'pan-3',
    customerId: 'cust-3',
    customerName: 'Lê Bảo Châu',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    customerClass: '12D2',
    customerSchool: 'THPT Kim Liên',
    customerPhone: '',
    facebookUrl: 'https://facebook.com/chaukimbim12d2',
    channel: 'tiktok',
    channelId: 'tiktok',
    pageName: 'TikTok @xoanmedia_official',
    unreadCount: 1,
    isReplied: false,
    lastMessage: 'Shop ơi clip retro hôm qua trên TikTok chụp ở đâu thế ạ? Cho em xin giá trọn gói với!',
    lastMessageTime: '10:10',
    assignedSalesName: 'Chưa phân công',
    pipelineStage: 'New Lead',
    tags: ['🎒 Concept Hot', '💬 Đang tư vấn'],
    notes: 'Khách hỏi từ video viral TikTok. Chưa có số điện thoại.',
    messages: [
      {
        id: 'msg-3-1',
        sender: 'customer',
        senderName: 'Lê Bảo Châu',
        text: 'Shop ơi clip retro hôm qua trên TikTok chụp ở đâu thế ạ? Cho em xin giá trọn gói với!',
        timestamp: '10:10'
      }
    ]
  },
  {
    id: 'pan-4',
    customerId: 'cust-4',
    customerName: 'Hoàng Minh Tuấn',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    customerClass: 'K65 Kinh Tế Quốc Dân',
    customerSchool: 'Đại Học Kinh Tế Quốc Dân (NEU)',
    customerPhone: '0977112233',
    facebookUrl: 'https://facebook.com/tuanneu65',
    channel: 'facebook',
    channelId: 'fb-xoan-hn',
    pageName: 'Xoăn Media - Kỷ Yếu & Sự Kiện',
    unreadCount: 0,
    isReplied: true,
    lastMessage: 'Dạ vâng anh gửi em thêm mẫu ảnh cử nhân bằng đại học với nhé.',
    lastMessageTime: '07:20',
    assignedSalesName: 'Duy Kool (Admin)',
    assignedSalesId: 'user-admin',
    pipelineStage: 'Đã gửi báo giá',
    tags: ['📞 Cần gọi lại', '📅 Chờ duyệt ngày'],
    notes: 'Khối Đại học K65 NEU, chụp cử nhân trường + concept du thuyền Hồ Tây.',
    messages: [
      {
        id: 'msg-4-1',
        sender: 'customer',
        senderName: 'Hoàng Minh Tuấn',
        text: 'Anh ơi bên mình có chụp kỷ yếu đại học không ạ, lớp em khoảng 55 bạn.',
        timestamp: 'Hôm qua'
      },
      {
        id: 'msg-4-2',
        sender: 'sales',
        senderName: 'Duy Kool (Sales)',
        text: 'Chào Tuấn nhé! Bên anh chụp rất nhiều cho các khóa NEU, Ngoại Thương, Bách Khoa rồi nè. Gửi em bảng giá ưu đãi lớp đông nha!',
        timestamp: 'Hôm qua'
      },
      {
        id: 'msg-4-3',
        sender: 'customer',
        senderName: 'Hoàng Minh Tuấn',
        text: 'Dạ vâng anh gửi em thêm mẫu ảnh cử nhân bằng đại học với nhé.',
        timestamp: '07:20'
      }
    ]
  },
  {
    id: 'pan-5',
    customerId: 'cust-5',
    customerName: 'Vũ Thùy Linh',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    customerClass: '12A3',
    customerSchool: 'THPT Việt Đức',
    customerPhone: '0933445566',
    facebookUrl: 'https://instagram.com/linh_vietduc',
    channel: 'instagram',
    channelId: 'instagram',
    pageName: 'Instagram @xoanmedia',
    unreadCount: 0,
    isReplied: true,
    lastMessage: 'Dạ lớp em đang gom tiền cọc, tối nay lớp trưởng ck nha anh.',
    lastMessageTime: '06:50',
    assignedSalesName: 'Lan Anh (Sales)',
    assignedSalesId: 'sales-lananh',
    pipelineStage: 'Đang thương lượng',
    tags: ['🔥 VIP', '📅 Chờ duyệt ngày'],
    notes: 'THPT Việt Đức, concept Hàn Quốc nhẹ nhàng.',
    messages: [
      {
        id: 'msg-5-1',
        sender: 'customer',
        senderName: 'Vũ Thùy Linh',
        text: 'Anh ơi concept học đường Hàn Quốc bên mình có bao gồm đồng phục luôn không ạ?',
        timestamp: 'Hôm qua'
      },
      {
        id: 'msg-5-2',
        sender: 'sales',
        senderName: 'Lan Anh (Sales)',
        text: 'Đầy đủ trọn gói em nha: Áo sơ mi, cà vạt, vest hoặc blazer Hàn Quốc, váy xếp ly và nơ nha!',
        timestamp: 'Hôm qua'
      },
      {
        id: 'msg-5-3',
        sender: 'customer',
        senderName: 'Vũ Thùy Linh',
        text: 'Dạ lớp em đang gom tiền cọc, tối nay lớp trưởng ck nha anh.',
        timestamp: '06:50'
      }
    ]
  }
];

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
    text: `Để giữ ngày chụp đẹp nhất và chốt ekip thợ xịn cho lớp, lớp mình chuyển khoản cọc giúp anh vào tài khoản chính thức của Xoăn Media nhé:\n🏦 Ngân hàng: MB Bank (Ngân Hàng Quân Đội)\n💳 STK: 09876543210\n👤 Chủ TK: TA VAN DUY\n💵 Số tiền cọc: 2.000.000 VNĐ\n📝 Nội dung CK: [Tên Lớp] - [Trường] - Coc ky yeu\n👉 Sau khi chuyển bạn gửi ảnh bill tại đây, CRM sẽ tự động kích hoạt hợp đồng và khóa lịch cho Ekip nhé!`
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
