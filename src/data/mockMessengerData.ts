import { FacebookChatConversation } from '../types';

export const mockMessengerConversations: FacebookChatConversation[] = [
  {
    id: 'conv-fb-1',
    customerId: 'cust-1',
    customerName: 'Bùi Gia Huy',
    customerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    customerClass: '12 Tin',
    customerSchool: 'THPT Chuyên Trần Phú (Hải Phòng)',
    customerPhone: '0967890123',
    facebookUrl: 'https://facebook.com/huy.bui12tin',
    pageName: 'Xoăn Media - Kỷ Yếu Hải Phòng & Miền Bắc',
    unreadCount: 0,
    lastMessage: 'Anh nhận được cọc 2.000.000đ từ Huy rồi nhé! 🎉 Đã lên lịch booking và chuẩn bị ekip thợ xịn cho lớp mình!',
    lastMessageTime: '15:56',
    assignedSalesName: 'Trần Hải Đăng',
    pipelineStage: 'Đã đặt cọc',
    tags: ['Kỷ yếu 2026', 'Retro Hongkong', 'Đã cọc 2tr', 'Chuyên Trần Phú'],
    notes: 'Lớp 35 bạn, chốt cọc 2.000.000đ giữ lịch ngày 15/10/2026. Concept Retro Hongkong.',
    messages: [
      {
        id: 'm1-1',
        sender: 'customer',
        senderName: 'Bùi Gia Huy',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        text: 'Dạ em chào anh/chị admin Xoăn Media ạ! Lớp em 12 Tin Chuyên Trần Phú đang tìm hiểu gói chụp kỷ yếu cho lớp 35 bạn ạ.',
        timestamp: '14:10'
      },
      {
        id: 'm1-2',
        sender: 'sales',
        senderName: 'Trần Hải Đăng (Sales)',
        text: 'Chào Huy và tập thể 12 Tin Chuyên Trần Phú nhé! 🎉 Rất vui được gặp các em. Lớp mình đã ưng concept nào chưa hay cần anh gửi album mẫu tham khảo trước nè?',
        timestamp: '14:12'
      },
      {
        id: 'm1-3',
        sender: 'customer',
        senderName: 'Bùi Gia Huy',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        text: 'Dạ lớp em đang mê tone Retro Hongkong 90s hoặc Vườn trường thanh xuân, không biết gói BASIC hay VIP bên mình sẽ hợp hơn anh?',
        timestamp: '14:15'
      },
      {
        id: 'm1-4',
        sender: 'sales',
        senderName: 'Trần Hải Đăng (Sales)',
        text: 'Gói BASIC bên anh đang có ưu đãi tặng kèm flycam 4K và ảnh ép gỗ cho cả lớp nè! Hoặc nếu lên VIP thì có sẵn toàn bộ trang phục concept và makeup trọn gói luôn em nhé.',
        timestamp: '14:18'
      },
      {
        id: 'm1-5',
        sender: 'customer',
        senderName: 'Bùi Gia Huy',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        text: 'Dạ lớp em vừa biểu quyết chọn gói BASIC concept Retro Hongkong rồi anh ạ! Lớp em chốt lịch ngày 15/10 này luôn, em vừa ck cọc 2 triệu giữ lịch rồi anh check giúp em nhé!',
        timestamp: '15:52',
        attachments: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
            name: 'bill_chuyen_khoan_coc_2tr.jpg'
          }
        ]
      },
      {
        id: 'm1-6',
        sender: 'sales',
        senderName: 'Trần Hải Đăng (Sales)',
        text: 'Anh nhận được cọc 2.000.000đ từ Huy rồi nhé! 🎉 Đã lên lịch booking và chuẩn bị ekip thợ xịn cho lớp mình!',
        timestamp: '15:56'
      }
    ]
  },
  {
    id: 'conv-fb-2',
    customerId: 'cust-2',
    customerName: 'Trần Thùy Linh',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    customerClass: '12 Văn',
    customerSchool: 'THPT Thái Phiên (Hải Phòng)',
    customerPhone: '0912345678',
    facebookUrl: 'https://facebook.com/thuylinh.tranphu',
    pageName: 'Xoăn Media - Kỷ Yếu Hải Phòng & Miền Bắc',
    unreadCount: 2,
    lastMessage: 'Lớp em dự kiến chụp ở Trường và Bảo tàng Hải Phòng tầm cuối tháng 10 ạ',
    lastMessageTime: '10:46',
    assignedSalesName: 'Nguyễn Thu Hương',
    pipelineStage: 'Đang tư vấn',
    tags: ['Sĩ số 38', 'Concept Nàng Thơ', 'THPT Thái Phiên', 'Cần tư vấn'],
    notes: 'Lớp 38 bạn, hỏi concept Nàng Thơ & Cổ Phục. Đang phân vân makeup.',
    messages: [
      {
        id: 'm2-1',
        sender: 'customer',
        senderName: 'Trần Thùy Linh',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Ad ơi cho em xin báo giá concept Nàng Thơ & Cổ Phục cho lớp 38 bạn với ạ ❤️',
        timestamp: '10:15'
      },
      {
        id: 'm2-2',
        sender: 'sales',
        senderName: 'Nguyễn Thu Hương (Sales)',
        text: 'Chào Thùy Linh! Anh/chị gửi Linh bảng báo giá chi tiết gói Concept Nàng Thơ & Cổ Phục bên anh nhé. Gói này được tặng kèm phụ kiện quạt lụa và hoa tươi chụp siêu thơ mộng luôn nha!',
        timestamp: '10:20'
      },
      {
        id: 'm2-3',
        sender: 'customer',
        senderName: 'Trần Thùy Linh',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Dạ gói này có bao gồm trang phục và makeup không anh?',
        timestamp: '10:45'
      },
      {
        id: 'm2-4',
        sender: 'customer',
        senderName: 'Trần Thùy Linh',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Lớp em dự kiến chụp ở Trường và Bảo tàng Hải Phòng tầm cuối tháng 10 ạ',
        timestamp: '10:46'
      }
    ]
  },
  {
    id: 'conv-fb-3',
    customerId: 'cust-3',
    customerName: 'Hoàng Mai Chi',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    customerClass: '12 Anh 1',
    customerSchool: 'THPT Ngô Quyền (Hải Phòng)',
    customerPhone: '0987654321',
    facebookUrl: 'https://facebook.com/maichi.ngoquyen',
    pageName: 'Xoăn Media - Kỷ Yếu Hải Phòng & Miền Bắc',
    unreadCount: 1,
    lastMessage: 'Lớp em tầm 40 bạn, chụp buổi tối có phụ thu thêm đèn không anh?',
    lastMessageTime: '16:12',
    assignedSalesName: 'Lê Hoàng Sơn',
    pipelineStage: 'New Lead',
    tags: ['Facebook Ads', 'Party Night', 'Khách mới'],
    notes: 'Khách đổ từ chiến dịch Facebook Ads Kỷ Yếu 2026. Quan tâm Party Night.',
    messages: [
      {
        id: 'm3-1',
        sender: 'customer',
        senderName: 'Hoàng Mai Chi',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        text: 'Em thấy bài viết trên Fanpage concept Party Night đẹp quá, tư vấn giúp em với ạ ✨',
        timestamp: '16:10'
      },
      {
        id: 'm3-2',
        sender: 'customer',
        senderName: 'Hoàng Mai Chi',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        text: 'Lớp em tầm 40 bạn, chụp buổi tối có phụ thu thêm dàn đèn không anh?',
        timestamp: '16:12'
      }
    ]
  },
  {
    id: 'conv-fb-4',
    customerId: 'cust-4',
    customerName: 'Lê Tuấn Kiệt',
    customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    customerClass: '12 Toán 1',
    customerSchool: 'THPT Chuyên Trần Phú',
    customerPhone: '0934567890',
    facebookUrl: 'https://facebook.com/kiet.toan1',
    pageName: 'Xoăn Media - Kỷ Yếu Hải Phòng & Miền Bắc',
    unreadCount: 0,
    lastMessage: 'Dạ ok để tối nay họp phụ huynh em chốt với cả lớp rồi báo lại anh sớm nhé ạ',
    lastMessageTime: '09:30',
    assignedSalesName: 'Trần Hải Đăng',
    pipelineStage: 'Đã gửi báo giá',
    tags: ['Quay TikTok Recap', 'Chờ họp lớp', 'THPT Chuyên Trần Phú'],
    notes: 'Đã gửi báo giá gói VIP + Quay TikTok Recap. Chờ biểu quyết lớp.',
    messages: [
      {
        id: 'm4-1',
        sender: 'customer',
        senderName: 'Lê Tuấn Kiệt',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        text: 'Anh Đăng ơi cho em hỏi nếu thuê thêm 1 nháy quay video TikTok recap thì chi phí thế nào ạ?',
        timestamp: '09:05'
      },
      {
        id: 'm4-2',
        sender: 'sales',
        senderName: 'Trần Hải Đăng (Sales)',
        text: 'Chào Kiệt! Gói quay TikTok recap bên anh chỉ thêm 1.200.000đ có ngay 2 clip viral bắt trend cho lớp nhé, bên anh có ekip thợ trẻ bắt trend TikTok đỉnh lắm!',
        timestamp: '09:12'
      },
      {
        id: 'm4-3',
        sender: 'customer',
        senderName: 'Lê Tuấn Kiệt',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        text: 'Dạ ok để tối nay họp phụ huynh em chốt với cả lớp rồi báo lại anh sớm nhé ạ',
        timestamp: '09:30'
      }
    ]
  },
  {
    id: 'conv-fb-5',
    customerId: 'cust-5',
    customerName: 'Vũ Hải Yến',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    customerClass: '12 D1',
    customerSchool: 'THPT Lê Quý Đôn (Hải Phòng)',
    customerPhone: '0976543210',
    pageName: 'Xoăn Media - Kỷ Yếu Hải Phòng & Miền Bắc',
    unreadCount: 0,
    lastMessage: 'Được em nhé! Xoăn Media hỗ trợ lớp cọc trước chỉ từ 1.500.000đ - 2.000.000đ để giữ ngày chụp đẹp nhất...',
    lastMessageTime: '11:25',
    assignedSalesName: 'Nguyễn Thu Hương',
    pipelineStage: 'Đang thương lượng',
    tags: ['Hỏi đợt thanh toán', 'Cọc giữ lịch'],
    notes: 'Lớp 36 bạn, đang thương lượng chia đợt thanh toán.',
    messages: [
      {
        id: 'm5-1',
        sender: 'customer',
        senderName: 'Vũ Hải Yến',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        text: 'Bên mình có hỗ trợ chia làm 2 đợt thanh toán không anh? Lớp em muốn cọc trước một phần ạ',
        timestamp: '11:20'
      },
      {
        id: 'm5-2',
        sender: 'sales',
        senderName: 'Nguyễn Thu Hương (Sales)',
        text: 'Được em nhé! Xoăn Media hỗ trợ lớp cọc trước chỉ từ 1.500.000đ - 2.000.000đ để giữ ngày chụp đẹp nhất, phần còn lại thanh toán sau khi chụp xong nhé!',
        timestamp: '11:25'
      }
    ]
  }
];

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
    text: `Để giữ ngày chụp đẹp nhất và chốt ekip thợ xịn cho lớp, lớp mình chuyển khoản cọc giúp anh vào tài khoản chính thức của Xoăn Media nhé:\n🏦 Ngân hàng: MB Bank (Ngân Hàng Quân Đội)\n💳 STK: 09876543210\n👤 Chủ TK: TA VAN DUY\n💵 Số tiền cọc: 2.000.000 VNĐ\n📝 Nội dung CK: [Tên Lớp] - [Trường] - Coc ky yeu\n👉 Sau khi chuyển bạn gửi ảnh bill tại đây, CRM sẽ tự động kích hoạt hợp đồng và khóa lịch cho Ekip nhé!`
  },
  {
    id: 'qr-info',
    title: '📍 Xin SĐT & Ngày Dự Kiến Chụp',
    short: 'Xin SĐT & Ngày',
    text: `Dạ để bên anh kiểm tra lịch trống và giữ ngày chụp đẹp nhất (tránh bị trùng lịch với lớp khác trong trường), bạn cho anh xin:\n1. Số điện thoại / Zalo của bạn (hoặc lớp trưởng / ban cán sự):\n2. Ngày dự kiến chụp:\n3. Địa điểm lớp mình mong muốn chụp:\nBên anh sẽ lưu vào hệ thống CRM để tư vấn chi tiết nhất nhé!`
  }
];
