export interface CrmKpiMetric {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  accentColor?: string;
  subLabel?: string;
  iconName: 'dollar' | 'school-class' | 'camera' | 'users-handshake';
}

export interface CrmMonthlyRevenue {
  month: string;
  revenue: number; // Triệu VNĐ
  previousPeriod: number; // Triệu VNĐ
  target: number; // Triệu VNĐ
}

export interface CrmPackageRevenue {
  name: string;
  value: number; // Phần trăm %
  amount: string;
  color: string;
}

export interface PhotographerMember {
  id: string;
  fullName: string;
  role: 'Thợ chính' | 'Quay phim' | 'Flycam' | 'Makeup' | 'Thợ phụ';
  avatar: string;
  phone: string;
  completedShoots: number;
  rating: number; // 4.9/5
  payoutPerShoot: string; // Thù lao / buổi (VD: 850.000đ)
  totalPaid: string; // Đã thanh toán
  pendingPayout: string; // Chờ thanh toán
  status: 'Sẵn sàng' | 'Đang chụp' | 'Trùng lịch' | 'Tạm nghỉ';
  activeRegions: string; // Cầu Giấy, Hoàn Kiếm, Đống Đa...
}

export interface CtvSaleMember {
  id: string;
  code: string; // CTV-01
  fullName: string;
  schoolInCharge: string; // Phụ trách trường Ams, Chu Văn An, NEU...
  avatar: string;
  phone: string;
  leadsBrought: number; // Số Lead mang về
  classesClosed: number; // Số lớp chốt thành công
  conversionRate: string; // Tỷ lệ chốt (VD: 42.5%)
  revenueGenerated: string; // Doanh số tạo ra (VD: 480.000.000đ)
  revenueValue: number;
  commissionEarned: string; // Hoa hồng tích lũy (VD: 38.400.000đ)
  commissionRate: string; // 8% - 10%
  payoutStatus: 'Đã quyết toán' | 'Chờ đối soát' | 'Đang xử lý';
  ranking: number; // Top 1, 2, 3...
}

export interface CrmSalesPeriodData {
  timeLabel: string;
  sales: number; // Triệu VNĐ
  classesClosed: number; // Số lớp chốt
  avgContractValue: number; // Triệu VNĐ / lớp
}

export interface CrmLeadSourceData {
  name: string;
  value: number; // %
  classCount: number;
  revenue: string;
  color: string;
}

export interface CrmActivityLogItem {
  id: string;
  type: 'deposit' | 'booking' | 'ctv' | 'delivery' | 'photographer';
  title: string;
  subtitle: string;
  avatarText: string;
  avatarBg: string;
  timestamp: string;
  badge?: string;
  amount?: string;
}

// 1. 4 Thẻ KPI Mùa Kỷ Yếu Xoăn Media
export const CRM_KPI_METRICS: CrmKpiMetric[] = [
  {
    id: 'kpi-revenue',
    label: 'Doanh Thu Kỷ Yếu',
    value: '2.780.000.000đ',
    rawValue: 2780000000,
    change: '+18.6%',
    isPositive: true,
    subLabel: 'so với mùa trước',
    sparkline: [38, 42, 40, 52, 48, 62, 58, 74, 82],
    accentColor: '#B8F23D',
    iconName: 'dollar'
  },
  {
    id: 'kpi-classes',
    label: 'Hợp Đồng Lớp Đã Chốt',
    value: '148 Lớp',
    rawValue: 148,
    change: '+12.4%',
    isPositive: true,
    subLabel: 'đã chuyển cọc',
    sparkline: [22, 28, 25, 34, 39, 44, 52, 60, 68],
    iconName: 'school-class'
  },
  {
    id: 'kpi-crew',
    label: 'Đội Ngũ Thợ & Ekip',
    value: '38 Thợ',
    rawValue: 38,
    change: '94.5%',
    isPositive: true,
    subLabel: 'sẵn sàng nhận lịch',
    sparkline: [45, 48, 52, 50, 58, 63, 70, 78, 85],
    iconName: 'camera'
  },
  {
    id: 'kpi-ctv',
    label: 'Hoa Hồng CTV Đã Chi',
    value: '186.500.000đ',
    rawValue: 186500000,
    change: '+22.8%',
    isPositive: true,
    subLabel: 'doanh số từ CTV',
    sparkline: [18, 19, 21, 20, 23, 22, 24, 25, 28],
    accentColor: '#B8F23D',
    iconName: 'users-handshake'
  }
];

// 2. Doanh thu theo tháng mùa kỷ yếu (đơn vị: Triệu VNĐ)
export const CRM_MONTHLY_REVENUE_DATA: CrmMonthlyRevenue[] = [
  { month: 'Thg 1', revenue: 145, previousPeriod: 118, target: 150 },
  { month: 'Thg 2', revenue: 168, previousPeriod: 132, target: 160 },
  { month: 'Thg 3', revenue: 195, previousPeriod: 154, target: 180 },
  { month: 'Thg 4', revenue: 215, previousPeriod: 178, target: 200 },
  { month: 'Thg 5', revenue: 342, previousPeriod: 286, target: 320 },
  { month: 'Thg 6', revenue: 428, previousPeriod: 360, target: 400 },
  { month: 'Thg 7', revenue: 565, previousPeriod: 480, target: 520 },
  { month: 'Thg 8', revenue: 721, previousPeriod: 590, target: 680 }
];

// 3. Cơ cấu doanh thu theo gói kỷ yếu Xoăn Media
export const CRM_PACKAGE_REVENUE_DATA = {
  totalFormatted: '2.780.000.000đ',
  growth: '+18.2%',
  categories: [
    { name: 'Gói Premium & Dạ Tiệc', value: 42, amount: '1.168.000.000đ', color: '#111827' },
    { name: 'Gói Standard Bán Chạy', value: 28, amount: '778.000.000đ', color: '#B8F23D' },
    { name: 'Gói Basic Tiết Kiệm', value: 18, amount: '500.000.000đ', color: '#94a3b8' },
    { name: 'Flycam & Clip TikTok', value: 12, amount: '334.000.000đ', color: '#cbd5e1' }
  ]
};

// 4. Danh sách đội ngũ Thợ Chụp & Ekip Xoăn Media
export const CRM_PHOTOGRAPHERS: PhotographerMember[] = [
  {
    id: 'photo-1',
    fullName: 'Trần Minh Tuấn',
    role: 'Thợ chính',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '0988.112.233',
    completedShoots: 46,
    rating: 4.95,
    payoutPerShoot: '850.000đ',
    totalPaid: '39.100.000đ',
    pendingPayout: '2.550.000đ',
    status: 'Sẵn sàng',
    activeRegions: 'Cầu Giấy, Hoàn Kiếm, Tây Hồ'
  },
  {
    id: 'photo-2',
    fullName: 'Lê Đức Anh',
    role: 'Thợ chính',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    phone: '0977.445.566',
    completedShoots: 38,
    rating: 4.90,
    payoutPerShoot: '800.000đ',
    totalPaid: '30.400.000đ',
    pendingPayout: '1.600.000đ',
    status: 'Đang chụp',
    activeRegions: 'Đống Đa, Hai Bà Trưng'
  },
  {
    id: 'photo-3',
    fullName: 'Vũ Thành Đạt',
    role: 'Flycam',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    phone: '0912.998.877',
    completedShoots: 42,
    rating: 4.98,
    payoutPerShoot: '1.000.000đ',
    totalPaid: '42.000.000đ',
    pendingPayout: '3.000.000đ',
    status: 'Sẵn sàng',
    activeRegions: 'Toàn thành phố Hà Nội & Tỉnh lân cận'
  },
  {
    id: 'photo-4',
    fullName: 'Hoàng Thu Thảo',
    role: 'Makeup',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    phone: '0966.332.211',
    completedShoots: 50,
    rating: 4.92,
    payoutPerShoot: '650.000đ',
    totalPaid: '32.500.000đ',
    pendingPayout: '1.950.000đ',
    status: 'Sẵn sàng',
    activeRegions: 'Cầu Giấy, Nam Từ Liêm'
  },
  {
    id: 'photo-5',
    fullName: 'Nguyễn Hải Đăng',
    role: 'Thợ phụ',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    phone: '0934.778.899',
    completedShoots: 28,
    rating: 4.85,
    payoutPerShoot: '500.000đ',
    totalPaid: '14.000.000đ',
    pendingPayout: '1.500.000đ',
    status: 'Trùng lịch',
    activeRegions: 'Thanh Xuân, Hà Đông'
  }
];

// 5. Danh sách Đội ngũ CTV Sale / Cộng Tác Viên Bán Hàng Xoăn Media
export const CRM_CTV_SALES: CtvSaleMember[] = [
  {
    id: 'ctv-1',
    code: 'CTV-01',
    fullName: 'Đặng Mai Linh',
    schoolInCharge: 'Đại học Kinh tế Quốc dân (NEU) & Bách Khoa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    phone: '0981.234.567',
    leadsBrought: 0,
    classesClosed: 0,
    conversionRate: '0%',
    revenueGenerated: '0đ',
    revenueValue: 0,
    commissionEarned: '0đ',
    commissionRate: '8%',
    payoutStatus: 'Đang xử lý',
    ranking: 1
  },
  {
    id: 'ctv-2',
    code: 'CTV-02',
    fullName: 'Nguyễn Thu Hương',
    schoolInCharge: 'THPT Chuyên Hà Nội - Amsterdam & Chu Văn An',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    phone: '0975.334.455',
    leadsBrought: 0,
    classesClosed: 0,
    conversionRate: '0%',
    revenueGenerated: '0đ',
    revenueValue: 0,
    commissionEarned: '0đ',
    commissionRate: '8%',
    payoutStatus: 'Đang xử lý',
    ranking: 2
  },
  {
    id: 'ctv-3',
    code: 'CTV-03',
    fullName: 'Lê Quốc Huy',
    schoolInCharge: 'Đại học Ngoại Thương (FTU) & HV Ngoại Giao',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    phone: '0903.667.889',
    leadsBrought: 0,
    classesClosed: 0,
    conversionRate: '0%',
    revenueGenerated: '0đ',
    revenueValue: 0,
    commissionEarned: '0đ',
    commissionRate: '8%',
    payoutStatus: 'Đang xử lý',
    ranking: 3
  },
  {
    id: 'ctv-4',
    code: 'CTV-04',
    fullName: 'Phạm Quỳnh Nga',
    schoolInCharge: 'THPT Kim Liên & THPT Yên Hòa',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    phone: '0942.113.355',
    leadsBrought: 0,
    classesClosed: 0,
    conversionRate: '0%',
    revenueGenerated: '0đ',
    revenueValue: 0,
    commissionEarned: '0đ',
    commissionRate: '8%',
    payoutStatus: 'Đang xử lý',
    ranking: 4
  },
  {
    id: 'ctv-5',
    code: 'CTV-05',
    fullName: 'Hoàng Nam Khánh',
    schoolInCharge: 'Khối THPT Quận Cầu Giấy & Nam Từ Liêm',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    phone: '0918.556.778',
    leadsBrought: 0,
    classesClosed: 0,
    conversionRate: '0%',
    revenueGenerated: '0đ',
    revenueValue: 0,
    commissionEarned: '0đ',
    commissionRate: '8%',
    payoutStatus: 'Đang xử lý',
    ranking: 5
  }
];

// 6. Doanh số theo chu kỳ (Ngày / Tuần / Tháng)
export const CRM_SALES_PERIODS: Record<'day' | 'week' | 'month', CrmSalesPeriodData[]> = {
  day: [
    { timeLabel: '08:00', sales: 18, classesClosed: 2, avgContractValue: 9.0 },
    { timeLabel: '11:00', sales: 34, classesClosed: 3, avgContractValue: 11.3 },
    { timeLabel: '14:00', sales: 52, classesClosed: 4, avgContractValue: 13.0 },
    { timeLabel: '17:00', sales: 68, classesClosed: 5, avgContractValue: 13.6 },
    { timeLabel: '20:00', sales: 45, classesClosed: 3, avgContractValue: 15.0 },
    { timeLabel: '22:00', sales: 26, classesClosed: 2, avgContractValue: 13.0 }
  ],
  week: [
    { timeLabel: 'Thứ 2', sales: 78, classesClosed: 6, avgContractValue: 13.0 },
    { timeLabel: 'Thứ 3', sales: 95, classesClosed: 7, avgContractValue: 13.5 },
    { timeLabel: 'Thứ 4', sales: 110, classesClosed: 8, avgContractValue: 13.7 },
    { timeLabel: 'Thứ 5', sales: 124, classesClosed: 9, avgContractValue: 13.7 },
    { timeLabel: 'Thứ 6', sales: 165, classesClosed: 12, avgContractValue: 13.8 },
    { timeLabel: 'Thứ 7', sales: 210, classesClosed: 15, avgContractValue: 14.0 },
    { timeLabel: 'Chủ Nhật', sales: 240, classesClosed: 17, avgContractValue: 14.1 }
  ],
  month: [
    { timeLabel: 'Tuần 1', sales: 480, classesClosed: 35, avgContractValue: 13.7 },
    { timeLabel: 'Tuần 2', sales: 620, classesClosed: 44, avgContractValue: 14.0 },
    { timeLabel: 'Tuần 3', sales: 780, classesClosed: 55, avgContractValue: 14.1 },
    { timeLabel: 'Tuần 4', sales: 900, classesClosed: 64, avgContractValue: 14.0 }
  ]
};

// 7. Nguồn tiếp cận khách hàng kỷ yếu
export const CRM_LEAD_SOURCES: CrmLeadSourceData[] = [
  { name: 'Đội Ngũ CTV Sale', value: 42, classCount: 62, revenue: '1.168.000.000đ', color: '#B8F23D' },
  { name: 'Facebook Ads', value: 30, classCount: 44, revenue: '834.000.000đ', color: '#111827' },
  { name: 'TikTok Organic & Ads', value: 18, classCount: 27, revenue: '500.000.000đ', color: '#94a3b8' },
  { name: 'Lớp Cũ Giới Thiệu', value: 10, classCount: 15, revenue: '278.000.000đ', color: '#cbd5e1' }
];

// 8. Nhật ký vận hành Studio & Chốt đơn thời gian thực
export const CRM_ACTIVITY_LOGS: CrmActivityLogItem[] = [
  {
    id: 'act-1',
    type: 'deposit',
    title: 'Đặt cọc thành công: 12 Anh 1 Ams',
    subtitle: 'Lớp trưởng Vũ Thùy Linh chuyển cọc gói Premium & Dạ tiệc',
    avatarText: '12A',
    avatarBg: 'bg-neutral-900 text-[#B8F23D]',
    timestamp: '2 phút trước',
    amount: '+5.000.000đ'
  },
  {
    id: 'act-2',
    type: 'photographer',
    title: 'Phân công thợ chính Trần Minh Tuấn',
    subtitle: 'Gán lịch chụp ngày 20/11 cho lớp 12 Toán 1 THPT Chu Văn An',
    avatarText: '📷',
    avatarBg: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
    timestamp: '15 phút trước',
    badge: 'Đã nhận lịch'
  },
  {
    id: 'act-3',
    type: 'ctv',
    title: 'CTV Đặng Mai Linh chốt hợp đồng mới',
    subtitle: 'Chốt thành công hợp đồng VIP K62 Marketing NEU (52 học sinh)',
    avatarText: 'ML',
    avatarBg: 'bg-[#B8F23D]/30 text-neutral-900 border border-[#B8F23D]',
    timestamp: '35 phút trước',
    amount: '+18.900.000đ'
  },
  {
    id: 'act-4',
    type: 'delivery',
    title: 'Hoàn tất bàn giao Album Photobook',
    subtitle: 'Đã gửi toàn bộ 40 photobook + video 4K cho lớp 12D2 Yên Hòa',
    avatarText: '📦',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    timestamp: '1 giờ trước',
    badge: 'Đã bàn giao'
  },
  {
    id: 'act-5',
    type: 'deposit',
    title: 'Thu đủ 100% hợp đồng: 12A6 Kim Liên',
    subtitle: 'Hoàn tất thanh toán phần còn lại 3.800.000đ sau buổi chụp',
    avatarText: '12K',
    avatarBg: 'bg-neutral-900 text-white',
    timestamp: '2 giờ trước',
    amount: '+3.800.000đ'
  }
];
