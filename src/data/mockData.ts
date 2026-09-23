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
    status: 'active'
  },
  {
    id: 'user-sales-1',
    name: 'Nguyễn Thu Hương (Sales)',
    phone: '0987654321',
    email: 'huong.nt@xoanmedia.vn',
    roleTitle: 'Chuyên viên Sales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hà Nội'],
    status: 'active'
  },
  {
    id: 'user-sales-2',
    name: 'Trần Hải Đăng (Sales)',
    phone: '0966554433',
    email: 'dang.th@xoanmedia.vn',
    roleTitle: 'Chuyên viên Sales',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Thái Bình', 'Nam Định'],
    status: 'active'
  },
  {
    id: 'user-sales-3',
    name: 'Vũ Mai Phương (CTV Sales)',
    phone: '0911223344',
    email: 'phuong.vm@xoanmedia.vn',
    roleTitle: 'CTV Sales',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng'],
    status: 'active'
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

export const mockPhotographers: Photographer[] = [
  {
    id: 'photo-1',
    fullName: 'Trần Minh Tuấn',
    phone: '0912345678',
    email: 'tuan.tm@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hà Nội', 'Quảng Ninh'],
    photographerType: 'Full-time',
    experienceYears: 5,
    skills: ['Chụp chính', 'Flycam', 'Chỉnh màu (Colorist)'],
    equipmentList: ['Sony A7IV', 'Lens 24-70 GM II', 'Lens 85 f1.4 GM', 'DJI Mavic Air 3', 'Flash Godox V860III'],
    status: 'available',
    ratePerShoot: 1200000,
    rating: 4.95,
    completedShootsCount: 142,
    notes: 'Kỹ năng khuấy động không khí kỷ yếu cực tốt, ảnh màu trong trẻo.'
  },
  {
    id: 'photo-2',
    fullName: 'Lê Đức Anh (Alex)',
    phone: '0945678901',
    email: 'ducanh.photo@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Quảng Ninh', 'Hải Dương'],
    photographerType: 'Freelancer',
    experienceYears: 4,
    skills: ['Chụp chính', 'Quay phim'],
    equipmentList: ['Canon R6 Mark II', 'RF 28-70 f2', 'Canon 50 1.2', 'Gimbal Ronin RS3'],
    status: 'available',
    ratePerShoot: 1000000,
    rating: 4.88,
    completedShootsCount: 98,
    notes: 'Phong cách chụp cảm xúc cinematic, chuyên concept hoàng hôn & dạ tiệc.'
  },
  {
    id: 'photo-3',
    fullName: 'Nguyễn Hải Đăng',
    phone: '0977889900',
    email: 'dang.nh@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hà Nội', 'Thái Nguyên'],
    photographerType: 'Full-time',
    experienceYears: 3,
    skills: ['Chụp chính', 'Chụp phụ'],
    equipmentList: ['Sony A7III', 'Tamron 28-75 G2', 'Sony 85 f1.8', 'Godox AD200 Pro'],
    status: 'available',
    ratePerShoot: 800000,
    rating: 4.82,
    completedShootsCount: 76,
    notes: 'Nhiệt huyết, chiều học sinh sinh viên, hỗ trợ tạo dáng nhiệt tình.'
  },
  {
    id: 'photo-4',
    fullName: 'Hoàng Thu Thảo',
    phone: '0983112244',
    email: 'thao.makeup@xoanmedia.vn',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hà Nội'],
    photographerType: 'Đối tác Studio',
    experienceYears: 4,
    skills: ['Makeup'],
    equipmentList: ['Cốp đồ trang điểm chuyên nghiệp Hàn Quốc & Thái Lan'],
    status: 'available',
    ratePerShoot: 600000,
    rating: 4.92,
    completedShootsCount: 110,
    notes: 'Trang điểm phong cách tone trong trẻo Hàn Quốc phù hợp áo dài & kỷ yếu học sinh.'
  },
  {
    id: 'photo-5',
    fullName: 'Vũ Thành Đạt',
    phone: '0966554433',
    email: 'dat.flycam@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    activeRegions: ['Hải Phòng', 'Hưng Yên', 'Hải Dương'],
    photographerType: 'Freelancer',
    experienceYears: 3,
    skills: ['Flycam', 'Quay phim'],
    equipmentList: ['DJI Inspire 2', 'DJI Mavic 3 Pro', 'Sony FX3 Cinema'],
    status: 'available',
    ratePerShoot: 1500000,
    rating: 4.98,
    completedShootsCount: 85,
    notes: 'Chuyên gia góc máy flycam xếp chữ đại tập thể kỷ yếu 100+ bạn.'
  }
];

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
    name: 'Workflow 1: Chăm sóc Lead chưa Booking sau 3 ngày',
    description: 'Tự động gửi tin nhắn Zalo kèm portfolio sau 3 ngày, nếu không phản hồi thì tạo Task cho Sales gọi điện.',
    triggerEvent: 'Lead mới không chuyển đổi sau 72h',
    isActive: true,
    steps: [
      {
        id: 's1',
        title: 'Kích hoạt',
        type: 'trigger',
        description: 'Lead ở trạng thái "New Lead" hoặc "Đang tư vấn" > 3 ngày'
      },
      {
        id: 's2',
        title: 'Chờ 2 giờ',
        type: 'delay',
        description: 'Chờ đến khung giờ vàng (11:30 hoặc 19:30)'
      },
      {
        id: 's3',
        title: 'Gửi Tin nhắn Zalo Portfolio',
        type: 'action',
        description: 'Tự động gửi bộ ảnh mẫu theo Concept khách quan tâm qua Zalo ZNS'
      },
      {
        id: 's4',
        title: 'Kiểm tra phản hồi sau 48h',
        type: 'condition',
        description: 'Khách hàng có đọc tin hoặc trả lời không?'
      },
      {
        id: 's5',
        title: 'Tạo Task cho Sales gọi lại',
        type: 'action',
        description: 'Giao việc trực tiếp cho Sales phụ trách: Gọi tư vấn hỗ trợ giải đáp thắc mắc của lớp'
      }
    ]
  },
  {
    id: 'wf-2',
    name: 'Workflow 2: Bám đuổi Báo giá chưa Cọc (Chốt Sales)',
    description: 'Gửi bảng so sánh quyền lợi sau 24h, sau 3 ngày gửi Offer Flycam/Photobook.',
    triggerEvent: 'Khách nhận báo giá nhưng chưa cọc',
    isActive: true,
    steps: [
      {
        id: 's2-1',
        title: 'Kích hoạt',
        type: 'trigger',
        description: 'Khách chuyển sang "Đã gửi báo giá"'
      },
      {
        id: 's2-2',
        title: 'Chờ 24 Giờ',
        type: 'delay',
        description: 'Để khách có thời gian họp bàn cùng tập thể lớp'
      },
      {
        id: 's2-3',
        title: 'Follow-up nhẹ nhàng',
        type: 'action',
        description: 'Gửi tin nhắn: "Lớp mình đã chốt được ngày và concept chưa, bên em hỗ trợ giữ lịch cho lớp nhé"'
      },
      {
        id: 's2-4',
        title: 'Gửi Offer Đặc Biệt sau 3 ngày',
        type: 'action',
        description: 'Tặng thêm 01 thợ chụp phụ hoặc nâng cấp photobook nếu chốt trong 48h'
      }
    ]
  },
  {
    id: 'wf-3',
    name: 'Workflow 3: Chăm sóc Khách hàng cũ & Bán chéo (Upsell)',
    description: 'Sau khi hoàn thành 6 tháng, gửi tin chúc mừng tốt nghiệp và ưu đãi cho khóa sau.',
    triggerEvent: 'Booking hoàn thành đạt 180 ngày',
    isActive: false,
    steps: [
      {
        id: 's3-1',
        title: 'Kích hoạt',
        type: 'trigger',
        description: 'Khách hàng đã hoàn thành buổi chụp 6 tháng'
      },
      {
        id: 's3-2',
        title: 'Gửi email / Zalo chúc mừng & Tri ân',
        type: 'action',
        description: 'Kèm mã Voucher 10% cho dịch vụ chụp ảnh gia đình / họp lớp'
      }
    ]
  }
];

export const mockTasks: Task[] = [];

export const mockActivityLogs: ActivityLog[] = [];

export const mockNotifications: SystemNotification[] = [];

export const mockFeedbacks: ClassFeedback[] = [];

export const mockMoments: ClassMoment[] = [];

