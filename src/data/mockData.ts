import {
  User,
  Customer,
  School,
  SchoolClass,
  Photographer,
  Booking,
  ServicePackage,
  RemarketingSegment,
  RemarketingCampaign,
  RemarketingWorkflow,
  Task,
  ActivityLog,
  SystemNotification,
  ClassFeedback,
  ClassMoment,
  SalesStaff
} from '../types';
import photographersJson from './photographersData.json';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn Quản Trị',
    email: 'admin@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    phone: '0981112233'
  },
  {
    id: 'user-2',
    name: 'Lê Hoàng Sơn (Sales Lead)',
    email: 'son.lh@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'sales',
    phone: '0984556677'
  },
  {
    id: 'user-sales-1',
    name: 'Nguyễn Thu Hương (Sales)',
    email: 'huong.nt@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'sales',
    phone: '0987654321'
  },
  {
    id: 'user-sales-2',
    name: 'Trần Hải Đăng (Sales)',
    email: 'dang.th@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'sales',
    phone: '0966554433'
  },
  {
    id: 'user-3',
    name: 'Phạm Thị Thảo (Marketing)',
    email: 'thao.pt@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'marketing',
    phone: '0978990011'
  },
  {
    id: 'user-4',
    name: 'Trần Minh Tuấn (Photographer)',
    email: 'tuan.tm@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'photographer',
    phone: '0912345678'
  },
  {
    id: 'user-5',
    name: 'Đặng Mai Linh (Operation Manager)',
    email: 'linh.dm@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'manager',
    phone: '0933221100'
  }
];

export const mockSalesStaff: SalesStaff[] = [
  {
    id: 'user-2',
    name: 'Lê Hoàng Sơn (Sales Lead)',
    phone: '0984556677',
    email: 'son.lh@xoanmedia.vn',
    roleTitle: 'Sales Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hải Dương', 'Quảng Ninh'],
    status: 'active',
    commissionType: 'percentage',
    commissionRate: 10,
    username: 'son.lh@xoanmedia.vn',
    password: 'SonLead@2024',
    canLogin: true,
    lastLoginAt: '2024-09-23 08:30'
  },
  {
    id: 'user-sales-1',
    name: 'Nguyễn Thu Hương (Sales)',
    phone: '0987654321',
    email: 'huong.nt@xoanmedia.vn',
    roleTitle: 'Chuyên viên Sales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hà Nội'],
    status: 'active',
    commissionType: 'percentage',
    commissionRate: 8,
    username: 'huong.nt@xoanmedia.vn',
    password: 'HuongSales@2024',
    canLogin: true,
    lastLoginAt: '2024-09-23 09:15'
  },
  {
    id: 'user-sales-2',
    name: 'Trần Hải Đăng (Sales)',
    phone: '0966554433',
    email: 'dang.th@xoanmedia.vn',
    roleTitle: 'Chuyên viên Sales',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Thái Bình', 'Nam Định'],
    status: 'active',
    commissionType: 'fixed',
    commissionFixedAmount: 600000,
    username: 'dang.th@xoanmedia.vn',
    password: 'DangSales@2024',
    canLogin: true,
    lastLoginAt: '2024-09-22 16:40'
  },
  {
    id: 'user-sales-3',
    name: 'Vũ Mai Phương (CTV Sales)',
    phone: '0911223344',
    email: 'phuong.vm@xoanmedia.vn',
    roleTitle: 'CTV Sales',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng'],
    status: 'active',
    commissionType: 'fixed',
    commissionFixedAmount: 500000,
    username: 'phuong.vm@xoanmedia.vn',
    password: 'PhuongCTV@2024',
    canLogin: true,
    lastLoginAt: '2024-09-21 14:20'
  }
];

export const SALES_STAFF_LIST = mockSalesStaff.map(s => ({ id: s.id, name: s.name }));

export const mockServicePackages: ServicePackage[] = [
  {
    id: 'pkg-1',
    name: 'Gói Kỷ Yếu BASIC (Tiết Kiệm)',
    description: 'Chụp tại trường 1 buổi, bao gồm cử nhân, áo dài, chụp tập thể và chụp đơn cho từng thành viên.',
    price: 3500000,
    minStudents: 30,
    durationHours: 4,
    leadPhotographersNeeded: 1,
    assistantsNeeded: 1,
    makeupIncluded: false,
    photoCountTotal: 400,
    photoCountEdited: 50,
    videoIncluded: false,
    albumIncluded: false,
    extraFeesNote: 'Thêm thợ phụ: 500k/buổi. Thuê flycam: 800k.',
    status: 'active'
  },
  {
    id: 'pkg-2',
    name: 'Gói Kỷ Yếu STANDARD (Bán Chạy Nhất)',
    description: 'Chụp cả ngày (Sáng tại trường + Chiều tại Hoàng Thành / Văn Miếu). Tặng trang phục cử nhân + áo cử nhân + vòng hoa đội đầu.',
    price: 6800000,
    minStudents: 35,
    durationHours: 8,
    leadPhotographersNeeded: 2,
    assistantsNeeded: 1,
    makeupIncluded: true,
    photoCountTotal: 1000,
    photoCountEdited: 100,
    videoIncluded: false,
    albumIncluded: false,
    extraFeesNote: 'Đã bao gồm chi phí vé vào cổng di tích cho ekip.',
    status: 'active'
  },
  {
    id: 'pkg-3',
    name: 'Gói Kỷ Yếu PREMIUM CONCEPT & DẠ TIỆC',
    description: 'Chụp trường + Phim trường ngoại cảnh + Party Night (bột màu, pháo sáng, lửa trại). Bao gồm quay Video Highlight 4K + Flycam.',
    price: 12500000,
    minStudents: 40,
    durationHours: 12,
    leadPhotographersNeeded: 2,
    assistantsNeeded: 2,
    makeupIncluded: true,
    photoCountTotal: 2500,
    photoCountEdited: 200,
    videoIncluded: true,
    albumIncluded: true,
    extraFeesNote: 'Trọn gói trang phục concept Retro, Cổ phục hoặc Harry Potter theo lựa chọn của lớp.',
    status: 'active'
  },
  {
    id: 'pkg-4',
    name: 'Gói Kỷ Yếu VIP - CINEMATIC MEMORY',
    description: 'Gói cao cấp nhất dành cho khối đại học và lớp chọn: 3 thợ chụp, 2 thợ quay flycam + gimbal, toàn bộ trang phục dạ tiệc & make up cao cấp.',
    price: 18900000,
    minStudents: 40,
    durationHours: 14,
    leadPhotographersNeeded: 3,
    assistantsNeeded: 2,
    makeupIncluded: true,
    photoCountTotal: 4000,
    photoCountEdited: 350,
    videoIncluded: true,
    albumIncluded: true,
    extraFeesNote: 'Tặng 01 Photobook cao cấp ép lụa 50 trang cho lớp & 01 bản tin phỏng vấn lưu bút.',
    status: 'active'
  }
];

export const mockSchools: School[] = [
  {
    id: 'sch-hp-1',
    name: 'THPT Chuyên Trần Phú',
    city: 'Hải Phòng',
    district: 'Lê Chân',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-hp-2',
    name: 'THPT Ngô Quyền',
    city: 'Hải Phòng',
    district: 'Lê Chân',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-hp-3',
    name: 'THPT Thái Phiên',
    city: 'Hải Phòng',
    district: 'Ngô Quyền',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-hp-4',
    name: 'THPT Lê Quý Đôn',
    city: 'Hải Phòng',
    district: 'Hải An',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-hp-5',
    name: 'Đại học Hàng hải Việt Nam (VMU)',
    city: 'Hải Phòng',
    district: 'Lê Chân',
    type: 'Đại học',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-hp-6',
    name: 'Đại học Hải Phòng',
    city: 'Hải Phòng',
    district: 'Kiến An',
    type: 'Đại học',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-hp-7',
    name: 'Đại học Y Dược Hải Phòng',
    city: 'Hải Phòng',
    district: 'Ngô Quyền',
    type: 'Đại học',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-1',
    name: 'THPT Chuyên Hà Nội - Amsterdam',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-2',
    name: 'THPT Chu Văn An',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-3',
    name: 'THPT Kim Liên',
    city: 'Hà Nội',
    district: 'Đống Đa',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-4',
    name: 'THPT Yên Hòa',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    type: 'THPT',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-5',
    name: 'Đại học Kinh tế Quốc Dân (NEU)',
    city: 'Hà Nội',
    district: 'Hai Bà Trưng',
    type: 'Đại học',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-6',
    name: 'Đại học Bách Khoa Hà Nội (HUST)',
    city: 'Hà Nội',
    district: 'Hai Bà Trưng',
    type: 'Đại học',
    totalClassesBooked: 0,
    status: 'active'
  },
  {
    id: 'sch-7',
    name: 'Đại học Ngoại Thương (FTU)',
    city: 'Hà Nội',
    district: 'Đống Đa',
    type: 'Đại học',
    totalClassesBooked: 0,
    status: 'active'
  }
];

export const mockSchoolClasses: SchoolClass[] = [];

// Danh sách 38 thợ chụp chính thức năm 2026 từ Google Sheets của Xoắn Media
export const mockPhotographers: Photographer[] = photographersJson as Photographer[];

export const mockCustomers: Customer[] = [];

export const mockBookings: Booking[] = [];

export const mockRemarketingSegments: RemarketingSegment[] = [
  {
    id: 'seg-1',
    name: 'Lead > 3 ngày chưa Booking',
    description: 'Khách hàng mới tiếp cận nhưng sau 72h chưa chốt gói hoặc chưa chuyển cọc.',
    targetCriteria: 'created_at <= NOW() - INTERVAL 3 DAYS AND status NOT IN (Đã cọc, Đã Booking)',
    customerCount: 18,
    createdAt: '2024-10-01'
  },
  {
    id: 'seg-2',
    name: 'Đã báo giá nhưng chưa cọc',
    description: 'Các lớp đã nhận bảng báo giá chi tiết, cần kích thích ra quyết định bằng quà tặng/ưu đãi.',
    targetCriteria: 'pipeline_stage = Đã gửi báo giá AND deposit = 0',
    customerCount: 12,
    createdAt: '2024-10-05'
  },
  {
    id: 'seg-3',
    name: 'Khách hàng cũ (Đã hoàn thành)',
    description: 'Các lớp đã chụp xong, chăm sóc để bán thêm dịch vụ ảnh tốt nghiệp gia đình hoặc giới thiệu khóa dưới.',
    targetCriteria: 'pipeline_stage = Hoàn thành',
    customerCount: 45,
    createdAt: '2024-09-15'
  },
  {
    id: 'seg-4',
    name: 'Khách hàng Lost > 30 ngày',
    description: 'Những lead từng từ chối, gửi khảo sát và coupon giảm giá mùa kỷ yếu sau.',
    targetCriteria: 'pipeline_stage = Lost AND updated_at <= NOW() - 30 DAYS',
    customerCount: 8,
    createdAt: '2024-10-10'
  },
  {
    id: 'seg-5',
    name: 'Khách VIP Giá trị cao (>15 Triệu)',
    description: 'Các khối đại học & trường quốc tế chi tiêu lớn, gửi quà tri ân photobook mini.',
    targetCriteria: 'total_revenue >= 15000000',
    customerCount: 14,
    createdAt: '2024-10-12'
  }
];

export const mockRemarketingCampaigns: RemarketingCampaign[] = [];

export const mockWorkflows: RemarketingWorkflow[] = [
  {
    id: 'wf-1',
    name: 'Chăm Sóc Lead Chưa Booking Sau 3 Ngày',
    description: 'Tự động gửi tin nhắn Zalo kèm portfolio sau 72h, kiểm tra phản hồi để gửi ưu đãi hoặc tạo task cho Sales gọi điện.',
    category: 'Lead Nurturing',
    triggerEvent: 'Lead mới không chuyển đổi sau 72h',
    isActive: true,
    steps: [],
    createdAt: '2024-10-15',
    updatedAt: '2026-09-23',
    stats: {
      totalTriggered: 142,
      convertedCount: 48,
      revenueSaved: 288000000
    },
    nodes: [
      {
        id: 'wf1-n1',
        type: 'trigger',
        title: 'Lead Mới > 72h Chưa Chốt',
        subtitle: 'Sự kiện kích hoạt tự động',
        description: 'Khách hàng ở giai đoạn New Lead hoặc Đang tư vấn quá 3 ngày chưa đặt lịch',
        config: {
          conditionField: 'lead_age_hours',
          conditionOperator: 'greater_than',
          conditionValue: 72
        },
        position: { x: 50, y: 180 },
        next: 'wf1-n2',
        stats: { processedCount: 142, successRate: 100 }
      },
      {
        id: 'wf1-n2',
        type: 'delay',
        title: 'Chờ Đến Khung Giờ Vàng',
        subtitle: 'Đếm ngược 2 giờ',
        description: 'Tạm dừng gửi để chờ khung giờ học sinh rảnh rỗi (11h30 trưa hoặc 19h30 tối)',
        config: {
          delayHours: 2
        },
        position: { x: 340, y: 180 },
        next: 'wf1-n3',
        stats: { processedCount: 142, successRate: 100 }
      },
      {
        id: 'wf1-n3',
        type: 'action',
        title: 'Gửi Zalo Portfolio Concept Hot',
        subtitle: 'Zalo ZNS / OA',
        description: 'Tự động gửi bộ ảnh mẫu kỷ yếu Concept HOT (Retro, Prom, Thanh xuân) kèm link xem ảnh',
        config: {
          channel: 'Zalo',
          templateContent: 'Chào {ten_khach}! Xoắn Media gửi bạn bộ sưu tập Concept Kỷ Yếu 2026 đang được các lớp chọn nhiều nhất: {link_portfolio}. Lớp mình thích phong cách nào bên em tư vấn chi tiết nhé!'
        },
        position: { x: 630, y: 180 },
        next: 'wf1-n4',
        stats: { processedCount: 142, successRate: 98 }
      },
      {
        id: 'wf1-n4',
        type: 'delay',
        title: 'Chờ Phản Hồi 24h',
        subtitle: 'Thời gian theo dõi tương tác',
        description: 'Chờ phản hồi từ đại diện lớp hoặc xem khách có bấm vào link xem ảnh không',
        config: {
          delayHours: 24
        },
        position: { x: 920, y: 180 },
        next: 'wf1-n5',
        stats: { processedCount: 139, successRate: 100 }
      },
      {
        id: 'wf1-n5',
        type: 'condition',
        title: 'Khách Có Đọc / Trả Lời Tin?',
        subtitle: 'Rẽ nhánh điều kiện If/Else',
        description: 'Kiểm tra trạng thái tin nhắn Zalo đã xem hoặc khách có để lại tin nhắn',
        config: {
          conditionField: 'customer_replied',
          conditionOperator: 'is_true'
        },
        position: { x: 1210, y: 180 },
        yesNext: 'wf1-n6',
        noNext: 'wf1-n7',
        stats: { processedCount: 139, successRate: 46 }
      },
      {
        id: 'wf1-n6',
        type: 'notification',
        title: 'Tạo Task Khẩn: Sales Gọi Chốt Lịch',
        subtitle: 'Nhánh Đúng (YES)',
        description: 'Tự động giao việc trên CRM cho Sales phụ trách: Khách đã xem mẫu, gọi tư vấn chốt ngày chụp',
        config: {
          actionType: 'create_task',
          assignedRole: 'Sales Tư Vấn',
          taskTitle: 'Gọi điện chốt lịch chụp cho lớp {lop} {truong} (Đã phản hồi portfolio)'
        },
        position: { x: 1530, y: 80 },
        next: 'wf1-n8',
        stats: { processedCount: 64, successRate: 75 }
      },
      {
        id: 'wf1-n7',
        type: 'action',
        title: 'Gửi Voucher Giảm 10% Flycam (SMS)',
        subtitle: 'Nhánh Sai (NO)',
        description: 'Gửi ưu đãi đặc quyền kích hoạt lại sự quan tâm nếu khách chưa xem tin Zalo',
        config: {
          channel: 'SMS',
          templateContent: 'Xoan Media tang lop {lop} Voucher giam 10% goi Flycam 4K khi dang ky lich chup truoc ngay {han_chot}. LH: 0981108601'
        },
        position: { x: 1530, y: 300 },
        next: 'wf1-n9',
        stats: { processedCount: 75, successRate: 28 }
      },
      {
        id: 'wf1-n8',
        type: 'end',
        title: 'Chốt Booking Thành Công',
        subtitle: 'Mục tiêu hoàn thành',
        description: 'Khách hàng chuyển cọc thành công và chuyển sang giai đoạn Đã cọc trên Pipeline',
        position: { x: 1840, y: 80 },
        stats: { processedCount: 48, successRate: 100 }
      },
      {
        id: 'wf1-n9',
        type: 'notification',
        title: 'Task Follow-up Cuối Trước Khi Đóng Lead',
        subtitle: 'Theo dõi lần cuối',
        description: 'Nhắc Sales kiểm tra lần cuối sau 48h gửi voucher, nếu không phản hồi thì chuyển Lost',
        position: { x: 1840, y: 300 },
        stats: { processedCount: 75, successRate: 60 }
      }
    ]
  },
  {
    id: 'wf-2',
    name: 'Bám Đuổi Báo Giá Chưa Cọc (Chốt Sales Trong 48h)',
    description: 'Tự động follow-up sau khi gửi báo giá, kiểm tra tình trạng cọc và kích hoạt gói quà tặng nâng cấp Photobook.',
    category: 'Quote Follow-up',
    triggerEvent: 'Khách chuyển sang "Đã gửi báo giá"',
    isActive: true,
    steps: [],
    createdAt: '2024-10-20',
    updatedAt: '2026-09-23',
    stats: {
      totalTriggered: 98,
      convertedCount: 41,
      revenueSaved: 246000000
    },
    nodes: [
      {
        id: 'wf2-n1',
        type: 'trigger',
        title: 'Giai Đoạn "Đã Gửi Báo Giá"',
        subtitle: 'Sự kiện kích hoạt',
        description: 'Khi Sales gửi bảng báo giá chi tiết cho đại diện ban cán sự lớp',
        position: { x: 50, y: 180 },
        next: 'wf2-n2',
        stats: { processedCount: 98, successRate: 100 }
      },
      {
        id: 'wf2-n2',
        type: 'delay',
        title: 'Chờ 24 Giờ Họp Lớp',
        subtitle: 'Thời gian thảo luận',
        description: 'Để ban cán sự lớp lấy ý kiến biểu quyết của các thành viên về gói chụp',
        config: { delayHours: 24 },
        position: { x: 340, y: 180 },
        next: 'wf2-n3',
        stats: { processedCount: 98, successRate: 100 }
      },
      {
        id: 'wf2-n3',
        type: 'action',
        title: 'Gửi Tin Nhắn Hỗ Trợ Giữ Lịch',
        subtitle: 'Zalo Tư Vấn',
        description: 'Nhắc nhở nhẹ nhàng lịch cuối tuần đang kín dần để lớp sớm giữ ngày',
        config: {
          channel: 'Zalo',
          templateContent: 'Chào bạn! Lịch chụp cuối tuần tháng 11 của Xoắn Media đang gần kín, lớp mình đã chốt được ngày chưa để bên em ưu tiên giữ thợ chụp chính cho lớp nhé!'
        },
        position: { x: 630, y: 180 },
        next: 'wf2-n4',
        stats: { processedCount: 98, successRate: 95 }
      },
      {
        id: 'wf2-n4',
        type: 'condition',
        title: 'Lớp Đã Đặt Cọc Chưa?',
        subtitle: 'Kiểm tra trạng thái cọc',
        description: 'Kiểm tra trường depositAmount > 0 hoặc trạng thái pipeline = Đã cọc',
        config: {
          conditionField: 'deposit_amount',
          conditionOperator: 'greater_than',
          conditionValue: 0
        },
        position: { x: 920, y: 180 },
        yesNext: 'wf2-n5',
        noNext: 'wf2-n6',
        stats: { processedCount: 93, successRate: 44 }
      },
      {
        id: 'wf2-n5',
        type: 'action',
        title: 'Tự Động Chuyển Stage "Đã Cọc"',
        subtitle: 'Nhánh Đúng (YES)',
        description: 'Tự động tạo mã Booking, thông báo Admin và gửi email xác nhận cho khách',
        position: { x: 1220, y: 80 },
        next: 'wf2-n7',
        stats: { processedCount: 41, successRate: 100 }
      },
      {
        id: 'wf2-n6',
        type: 'action',
        title: 'Tặng Quà: Nâng Cấp Photobook 40 Trang',
        subtitle: 'Nhánh Sai (NO) - Kích hoạt Deal',
        description: 'Gửi Offer độc quyền: Tặng thêm 01 cuốn photobook cao cấp nếu chuyển cọc trong 48h',
        config: {
          offerText: 'Tặng Photobook 40 trang trị giá 1.200.000đ khi cọc trước ngày mai'
        },
        position: { x: 1220, y: 300 },
        next: 'wf2-n8',
        stats: { processedCount: 52, successRate: 35 }
      },
      {
        id: 'wf2-n7',
        type: 'end',
        title: 'Hoàn Thành Chốt Cọc Hợp Đồng',
        subtitle: 'Doanh thu ghi nhận',
        description: 'Hợp đồng chính thức được kích hoạt, chuyển sang phân hệ Điều phối thợ chụp',
        position: { x: 1530, y: 80 },
        stats: { processedCount: 41, successRate: 100 }
      },
      {
        id: 'wf2-n8',
        type: 'notification',
        title: 'Tạo Task Sales Gọi Chốt Deal Quà Tặng',
        subtitle: 'Đẩy mạnh chốt hợp đồng',
        description: 'Sales trực tiếp gọi thông báo phần quà đặc biệt từ ban giám đốc dành riêng cho lớp',
        position: { x: 1530, y: 300 },
        stats: { processedCount: 52, successRate: 65 }
      }
    ]
  },
  {
    id: 'wf-3',
    name: 'Cứu Vãn Khách Từ Chối (Lost Lead Recovery)',
    description: 'Tự động kích hoạt khi khách bấm Khách từ chối (Lost), chờ 7 ngày rồi gửi khảo sát và voucher tri ân khóa sau.',
    category: 'Lost Recovery',
    triggerEvent: 'Khách chuyển sang "Khách từ chối (Lost)"',
    isActive: true,
    steps: [],
    createdAt: '2024-11-01',
    updatedAt: '2026-09-23',
    stats: {
      totalTriggered: 67,
      convertedCount: 16,
      revenueSaved: 96000000
    },
    nodes: [
      {
        id: 'wf3-n1',
        type: 'trigger',
        title: 'Khách Hàng Rơi Vào "Lost"',
        subtitle: 'Sự kiện kích hoạt',
        description: 'Khi Sales bấm nút Khách từ chối (Lost) trên Hồ sơ 360° kèm lý do từ chối',
        position: { x: 50, y: 180 },
        next: 'wf3-n2',
        stats: { processedCount: 67, successRate: 100 }
      },
      {
        id: 'wf3-n2',
        type: 'delay',
        title: 'Chờ Lắng Xuống 7 Ngày',
        subtitle: 'Khoảng nghỉ tâm lý',
        description: 'Tránh làm phiền khách ngay lập tức sau khi từ chối, chờ thời điểm thích hợp',
        config: { delayDays: 7 },
        position: { x: 340, y: 180 },
        next: 'wf3-n3',
        stats: { processedCount: 67, successRate: 100 }
      },
      {
        id: 'wf3-n3',
        type: 'action',
        title: 'Gửi Khảo Sát Đóng Góp & Tặng Voucher',
        subtitle: 'Zalo / Email',
        description: 'Gửi form khảo sát ngắn xin ý kiến cải thiện dịch vụ, tặng kèm Voucher 1.000.000đ',
        position: { x: 630, y: 180 },
        next: 'wf3-n4',
        stats: { processedCount: 67, successRate: 85 }
      },
      {
        id: 'wf3-n4',
        type: 'condition',
        title: 'Khách Có Bấm Mở Link Khảo Sát?',
        subtitle: 'Phát hiện tín hiệu quan tâm lại',
        description: 'Nếu khách mở link hoặc phản hồi lý do vì giá cao / chưa đủ sĩ số',
        position: { x: 920, y: 180 },
        yesNext: 'wf3-n5',
        noNext: 'wf3-n6',
        stats: { processedCount: 57, successRate: 28 }
      },
      {
        id: 'wf3-n5',
        type: 'action',
        title: 'Tái Kích Hoạt Lead Sang "Lead Ấm"',
        subtitle: 'Nhánh Đúng (YES)',
        description: 'Tự động mở lại thẻ khách hàng trên Pipeline, gắn nhãn Cứu vãn thành công',
        position: { x: 1220, y: 80 },
        next: 'wf3-n7',
        stats: { processedCount: 16, successRate: 100 }
      },
      {
        id: 'wf3-n6',
        type: 'end',
        title: 'Lưu Trữ Khách Hàng Nguội',
        subtitle: 'Nhánh Sai (NO)',
        description: 'Đưa vào danh sách lưu trữ hàng năm, không làm phiền khách thêm',
        position: { x: 1220, y: 300 },
        stats: { processedCount: 41, successRate: 100 }
      },
      {
        id: 'wf3-n7',
        type: 'notification',
        title: 'Gán Quản Lý Trực Tiếp Thương Thuyết',
        subtitle: 'Cứu vãn đơn hàng',
        description: 'Quản lý kinh doanh trực tiếp gọi hỗ trợ phương án gói phù hợp với ngân sách lớp',
        position: { x: 1530, y: 80 },
        stats: { processedCount: 16, successRate: 100 }
      }
    ]
  },
  {
    id: 'wf-4',
    name: 'Tri Ân Khách Hàng Cũ & Bán Chéo (Upsell Khóa Sau)',
    description: 'Tự động chăm sóc lớp sau 6 tháng tốt nghiệp, chúc mừng và gửi voucher giảm giá dành cho khóa dưới.',
    category: 'Upsell / Loyalty',
    triggerEvent: 'Booking hoàn thành đạt 180 ngày',
    isActive: true,
    steps: [],
    createdAt: '2024-11-10',
    updatedAt: '2026-09-23',
    stats: {
      totalTriggered: 85,
      convertedCount: 29,
      revenueSaved: 174000000
    },
    nodes: [
      {
        id: 'wf4-n1',
        type: 'trigger',
        title: 'Booking Hoàn Thành Đạt 180 Ngày',
        subtitle: 'Sự kiện kỷ niệm',
        description: 'Khi lớp đã nhận đủ album ảnh và kỷ niệm 6 tháng ngày chụp tốt nghiệp',
        position: { x: 50, y: 180 },
        next: 'wf4-n2',
        stats: { processedCount: 85, successRate: 100 }
      },
      {
        id: 'wf4-n2',
        type: 'action',
        title: 'Gửi Clip Kỷ Niệm & Thư Tri Ân',
        subtitle: 'Zalo Media / Email',
        description: 'Gửi video recap kỷ yếu và lời chúc mừng bước vào cánh cửa đại học / công việc',
        position: { x: 340, y: 180 },
        next: 'wf4-n3',
        stats: { processedCount: 85, successRate: 98 }
      },
      {
        id: 'wf4-n3',
        type: 'action',
        title: 'Tặng Mã Voucher 15% Dành Cho Khóa Sau',
        subtitle: 'Chương trình đại sứ kỷ yếu',
        description: 'Tặng mã giới thiệu: Khóa dưới áp mã sẽ được giảm 15%, người giới thiệu nhận hoa hồng 500.000đ',
        position: { x: 630, y: 180 },
        next: 'wf4-n4',
        stats: { processedCount: 85, successRate: 34 }
      },
      {
        id: 'wf4-n4',
        type: 'end',
        title: 'Ghi Nhận Khách Hàng Thân Thiết',
        subtitle: 'Vòng đời khách hàng hoàn tất',
        description: 'Lưu trữ thông tin đại sứ thương hiệu để liên hệ kết nối các mùa kỷ yếu tiếp theo',
        position: { x: 920, y: 180 },
        stats: { processedCount: 29, successRate: 100 }
      }
    ]
  }
];

export const mockTasks: Task[] = [];

export const mockActivityLogs: ActivityLog[] = [];

export const mockNotifications: SystemNotification[] = [];

export const mockFeedbacks: ClassFeedback[] = [];

export const mockMoments: ClassMoment[] = [];

