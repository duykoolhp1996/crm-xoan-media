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
    id: 'user-admin',
    name: 'Dương Hải Minh (Admin)',
    email: 'admin@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    phone: '0981108601'
  }
];

// Danh sách Sales mặc định được cấp quyền đăng nhập hệ thống
export const mockSalesStaff: SalesStaff[] = [
  {
    id: 'user-2',
    name: 'Lê Hoàng Sơn',
    roleTitle: 'Trưởng Nhóm Sales Lead',
    phone: '0912345678',
    email: 'son.lh@xoanmedia.vn',
    username: 'son.lh@xoanmedia.vn',
    password: 'SonLead@2024',
    activeRegions: ['Hải Phòng', 'Hà Nội'],
    status: 'active',
    canLogin: true,
    commissionType: 'percentage',
    commissionRate: 10,
    commissionFixedAmount: 500000,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-sales-1',
    name: 'Nguyễn Thu Hương',
    roleTitle: 'Chuyên viên Sales Tư Vấn',
    phone: '0987654321',
    email: 'huong.nt@xoanmedia.vn',
    username: 'huong.nt@xoanmedia.vn',
    password: 'HuongSales@2024',
    activeRegions: ['Hải Phòng', 'Hà Nội'],
    status: 'active',
    canLogin: true,
    commissionType: 'percentage',
    commissionRate: 8,
    commissionFixedAmount: 400000,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-sales-2',
    name: 'Trần Hải Đăng',
    roleTitle: 'Chuyên viên Sales Tư Vấn',
    phone: '0966554433',
    email: 'dang.th@xoanmedia.vn',
    username: 'dang.th@xoanmedia.vn',
    password: 'DangSales@2024',
    activeRegions: ['Hải Phòng', 'Thái Bình', 'Nam Định'],
    status: 'active',
    canLogin: true,
    commissionType: 'percentage',
    commissionRate: 8,
    commissionFixedAmount: 400000,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-sales-3',
    name: 'Vũ Mai Phương',
    roleTitle: 'Cộng Tác Viên (CTV) Sales',
    phone: '0911223344',
    email: 'phuong.vm@xoanmedia.vn',
    username: 'phuong.vm@xoanmedia.vn',
    password: 'PhuongCTV@2024',
    activeRegions: ['Hải Phòng'],
    status: 'active',
    canLogin: true,
    commissionType: 'fixed',
    commissionRate: 5,
    commissionFixedAmount: 300000,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
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
  }
];

export const mockSchoolClasses: SchoolClass[] = [];

// Danh sách 38 thợ chụp chính thức năm 2026 từ Google Sheets của Xoăn Media
export const mockPhotographers: Photographer[] = photographersJson as Photographer[];

import { importedCustomers, importedBookings } from './importedScheduleData';

// Danh sách khách hàng thực tế (12 lớp chụp & quay kỷ yếu đã cọc)
export const mockCustomers: Customer[] = [...importedCustomers];

// Danh sách booking lịch chụp & quay thực tế (12 ca chụp của Xoăn Media)
export const mockBookings: Booking[] = [...importedBookings];

// Đã xóa toàn bộ dữ liệu demo - Khởi tạo danh sách phân khúc remarketing rỗng
export const mockRemarketingSegments: RemarketingSegment[] = [];

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
    stats: { totalTriggered: 0, convertedCount: 0, revenueSaved: 0 },
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
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf1-n3',
        type: 'action',
        title: 'Gửi Zalo Portfolio Concept Hot',
        subtitle: 'Zalo ZNS / OA',
        description: 'Tự động gửi bộ ảnh mẫu kỷ yếu Concept HOT (Retro, Prom, Thanh xuân) kèm link xem ảnh',
        config: {
          channel: 'Zalo',
          templateContent: 'Chào {ten_khach}! Xoăn Media gửi bạn bộ sưu tập Concept Kỷ Yếu 2026 đang được các lớp chọn nhiều nhất: {link_portfolio}. Lớp mình thích phong cách nào bên em tư vấn chi tiết nhé!'
        },
        position: { x: 630, y: 180 },
        next: 'wf1-n4',
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf1-n8',
        type: 'end',
        title: 'Chốt Booking Thành Công',
        subtitle: 'Mục tiêu hoàn thành',
        description: 'Khách hàng chuyển cọc thành công và chuyển sang giai đoạn Đã cọc trên Pipeline',
        position: { x: 1840, y: 80 },
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf1-n9',
        type: 'notification',
        title: 'Task Follow-up Cuối Trước Khi Đóng Lead',
        subtitle: 'Theo dõi lần cuối',
        description: 'Nhắc Sales kiểm tra lần cuối sau 48h gửi voucher, nếu không phản hồi thì chuyển Lost',
        position: { x: 1840, y: 300 },
        stats: { processedCount: 0, successRate: 0 }
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
    stats: { totalTriggered: 0, convertedCount: 0, revenueSaved: 0 },
    nodes: [
      {
        id: 'wf2-n1',
        type: 'trigger',
        title: 'Giai Đoạn "Đã Gửi Báo Giá"',
        subtitle: 'Sự kiện kích hoạt',
        description: 'Khi Sales gửi bảng báo giá chi tiết cho đại diện ban cán sự lớp',
        position: { x: 50, y: 180 },
        next: 'wf2-n2',
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf2-n3',
        type: 'action',
        title: 'Gửi Tin Nhắn Hỗ Trợ Giữ Lịch',
        subtitle: 'Zalo Tư Vấn',
        description: 'Nhắc nhở nhẹ nhàng lịch cuối tuần đang kín dần để lớp sớm giữ ngày',
        config: {
          channel: 'Zalo',
          templateContent: 'Chào bạn! Lịch chụp cuối tuần tháng 11 của Xoăn Media đang gần kín, lớp mình đã chốt được ngày chưa để bên em ưu tiên giữ thợ chụp chính cho lớp nhé!'
        },
        position: { x: 630, y: 180 },
        next: 'wf2-n4',
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf2-n5',
        type: 'action',
        title: 'Tự Động Chuyển Stage "Đã Cọc"',
        subtitle: 'Nhánh Đúng (YES)',
        description: 'Tự động tạo mã Booking, thông báo Admin và gửi email xác nhận cho khách',
        position: { x: 1220, y: 80 },
        next: 'wf2-n7',
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf2-n7',
        type: 'end',
        title: 'Hoàn Thành Chốt Cọc Hợp Đồng',
        subtitle: 'Doanh thu ghi nhận',
        description: 'Hợp đồng chính thức được kích hoạt, chuyển sang phân hệ Điều phối thợ chụp',
        position: { x: 1530, y: 80 },
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf2-n8',
        type: 'notification',
        title: 'Tạo Task Sales Gọi Chốt Deal Quà Tặng',
        subtitle: 'Đẩy mạnh chốt hợp đồng',
        description: 'Sales trực tiếp gọi thông báo phần quà đặc biệt từ ban giám đốc dành riêng cho lớp',
        position: { x: 1530, y: 300 },
        stats: { processedCount: 0, successRate: 0 }
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
    stats: { totalTriggered: 0, convertedCount: 0, revenueSaved: 0 },
    nodes: [
      {
        id: 'wf3-n1',
        type: 'trigger',
        title: 'Khách Hàng Rơi Vào "Lost"',
        subtitle: 'Sự kiện kích hoạt',
        description: 'Khi Sales bấm nút Khách từ chối (Lost) trên Hồ sơ 360° kèm lý do từ chối',
        position: { x: 50, y: 180 },
        next: 'wf3-n2',
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf3-n3',
        type: 'action',
        title: 'Gửi Khảo Sát Đóng Góp & Tặng Voucher',
        subtitle: 'Zalo / Email',
        description: 'Gửi form khảo sát ngắn xin ý kiến cải thiện dịch vụ, tặng kèm Voucher 1.000.000đ',
        position: { x: 630, y: 180 },
        next: 'wf3-n4',
        stats: { processedCount: 0, successRate: 0 }
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
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf3-n5',
        type: 'action',
        title: 'Tái Kích Hoạt Lead Sang "Lead Ấm"',
        subtitle: 'Nhánh Đúng (YES)',
        description: 'Tự động mở lại thẻ khách hàng trên Pipeline, gắn nhãn Cứu vãn thành công',
        position: { x: 1220, y: 80 },
        next: 'wf3-n7',
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf3-n6',
        type: 'end',
        title: 'Lưu Trữ Khách Hàng Nguội',
        subtitle: 'Nhánh Sai (NO)',
        description: 'Đưa vào danh sách lưu trữ hàng năm, không làm phiền khách thêm',
        position: { x: 1220, y: 300 },
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf3-n7',
        type: 'notification',
        title: 'Gán Quản Lý Trực Tiếp Thương Thuyết',
        subtitle: 'Cứu vãn đơn hàng',
        description: 'Quản lý kinh doanh trực tiếp gọi hỗ trợ phương án gói phù hợp với ngân sách lớp',
        position: { x: 1530, y: 80 },
        stats: { processedCount: 0, successRate: 0 }
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
    stats: { totalTriggered: 0, convertedCount: 0, revenueSaved: 0 },
    nodes: [
      {
        id: 'wf4-n1',
        type: 'trigger',
        title: 'Booking Hoàn Thành Đạt 180 Ngày',
        subtitle: 'Sự kiện kỷ niệm',
        description: 'Khi lớp đã nhận đủ album ảnh và kỷ niệm 6 tháng ngày chụp tốt nghiệp',
        position: { x: 50, y: 180 },
        next: 'wf4-n2',
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf4-n2',
        type: 'action',
        title: 'Gửi Clip Kỷ Niệm & Thư Tri Ân',
        subtitle: 'Zalo Media / Email',
        description: 'Gửi video recap kỷ yếu và lời chúc mừng bước vào cánh cửa đại học / công việc',
        position: { x: 340, y: 180 },
        next: 'wf4-n3',
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf4-n3',
        type: 'action',
        title: 'Tặng Mã Voucher 15% Dành Cho Khóa Sau',
        subtitle: 'Chương trình đại sứ kỷ yếu',
        description: 'Tặng mã giới thiệu: Khóa dưới áp mã sẽ được giảm 15%, người giới thiệu nhận hoa hồng 500.000đ',
        position: { x: 630, y: 180 },
        next: 'wf4-n4',
        stats: { processedCount: 0, successRate: 0 }
      },
      {
        id: 'wf4-n4',
        type: 'end',
        title: 'Ghi Nhận Khách Hàng Thân Thiết',
        subtitle: 'Vòng đời khách hàng hoàn tất',
        description: 'Lưu trữ thông tin đại sứ thương hiệu để liên hệ kết nối các mùa kỷ yếu tiếp theo',
        position: { x: 920, y: 180 },
        stats: { processedCount: 0, successRate: 0 }
      }
    ]
  }
];

export const mockTasks: Task[] = [];

export const mockActivityLogs: ActivityLog[] = [];

export const mockNotifications: SystemNotification[] = [
  // 0. Thông báo toàn hệ thống: Cập nhật phiên bản v1.2.7 (Mọi tài khoản & thiết bị đều nhận được)
  {
    id: 'notif-system-v127',
    type: 'system',
    title: '🚀 CRM XOĂN MEDIA CẬP NHẬT PHIÊN BẢN V1.2.7',
    message: 'Hệ thống đã nâng cấp phiên bản v1.2.7 thành công: Tối ưu hiển thị cho thiết bị di động, cá nhân hóa thông báo trúng đích theo từng tài khoản (Lead mới cho Sales & Admin, Lịch chụp cho Photographer).',
    targetRole: 'all',
    severity: 'info',
    timestamp: new Date().toISOString(),
    read: false
  },

  // 1. Thông báo dành cho Admin
  {
    id: 'notif-admin-1',
    type: 'new_lead',
    title: '🌟 LEAD MỚI TIẾP NHẬN',
    message: 'Khách hàng Cô Giá (12A3 - THPT Marie Curie Hải Phòng) từ kênh Facebook Ads đã được tiếp nhận vào Pipeline.',
    customerId: 'cust-1',
    targetRole: 'admin',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 phút trước
    read: false
  },
  {
    id: 'notif-admin-2',
    type: 'shoot_scheduled',
    title: '📅 LỊCH CHỤP MỚI ĐÃ CHỐT',
    message: 'Lớp 12A3 (THPT Marie Curie) đã chốt lịch chụp ngày 28/10/2026. Trưởng nháy: Đỗ Hoàng Long.',
    customerId: 'cust-1',
    targetRole: 'admin',
    severity: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    read: false
  },
  {
    id: 'notif-admin-3',
    type: 'deposit',
    title: '🎉 CHỐT CỌC THÀNH CÔNG: 5.000.000đ',
    message: 'Sales Lê Hoàng Sơn đã chốt cọc thành công 5.000.000đ từ khách hàng Cô Giá (12A3 THPT Marie Curie).',
    customerId: 'cust-1',
    targetRole: 'admin',
    severity: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 giờ trước
    read: true
  },

  // 2. Thông báo dành cho Sales Lê Hoàng Sơn (user-2)
  {
    id: 'notif-sales-son-1',
    type: 'new_lead',
    title: '🎯 BẠN CÓ LEAD MỚI PHỤ TRÁCH',
    message: 'Bạn được phân công chăm sóc Lead: Cô Giá (12A3 - THPT Marie Curie Hải Phòng). Hãy liên hệ tư vấn sớm!',
    customerId: 'cust-1',
    targetUserId: 'user-2',
    targetRole: 'sales',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    read: false
  },
  {
    id: 'notif-sales-son-2',
    type: 'shoot_scheduled',
    title: '📅 LỊCH CHỤP KHÁCH HÀNG ĐÃ CHỐT',
    message: 'Khách hàng Cô Giá của bạn đã được xếp lịch chụp ngày 28/10/2026. Ekip: Đỗ Hoàng Long phụ trách.',
    customerId: 'cust-1',
    targetUserId: 'user-2',
    targetRole: 'sales',
    severity: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read: false
  },

  // 3. Thông báo dành cho Photographer Đỗ Hoàng Long (photo-1)
  {
    id: 'notif-photo-long-1',
    type: 'shoot_assigned',
    title: '📸 CA CHỤP MỚI ĐƯỢC PHÂN CÔNG (Trưởng nháy)',
    message: 'Bạn được phân công làm Trưởng nháy cho ca chụp: Lớp 12A3 THPT Marie Curie vào ngày 28/10/2026 tại Hải Phòng. Vui lòng kiểm tra thiết bị!',
    customerId: 'cust-1',
    targetUserId: 'photo-1',
    targetRole: 'photographer',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false
  },

  // 4. Thông báo dành cho Sales Nguyễn Thu Hương (user-sales-1)
  {
    id: 'notif-sales-huong-1',
    type: 'new_lead',
    title: '🎯 BẠN CÓ LEAD MỚI PHỤ TRÁCH',
    message: 'Bạn được phân công phụ trách Lead mới từ chiến dịch TikTok Ads. Vui lòng vào CRM kiểm tra thông tin khách!',
    targetUserId: 'user-sales-1',
    targetRole: 'sales',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false
  }
];

export const mockFeedbacks: ClassFeedback[] = [];

export const mockMoments: ClassMoment[] = [];

