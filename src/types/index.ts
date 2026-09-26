export type UserRole = 'admin' | 'manager' | 'sales' | 'marketing' | 'photographer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
}

// 1. CRM & Customers / Leads
export type LeadSource = 
  | 'Facebook Ads'
  | 'Facebook Organic'
  | 'TikTok'
  | 'TikTok Ads'
  | 'Website'
  | 'Google'
  | 'Zalo'
  | 'Referral'
  | 'Khách hàng cũ'
  | 'Khác';

export type PipelineStage = 
  | 'New Lead'
  | 'Đã liên hệ'
  | 'Đang tư vấn'
  | 'Đã gửi báo giá'
  | 'Đang thương lượng'
  | 'Đã đặt cọc'
  | 'Đã Booking'
  | 'Đã chụp'
  | 'Đang hậu kỳ'
  | 'Đã bàn giao'
  | 'Hoàn thành'
  | 'Lost'
  | 'Chăm sóc lại';

export interface UtmDetails {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  adSet?: string;
  adId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  facebook?: string;
  tiktok?: string;
  zalo?: string;
  
  // Trường học & lớp học
  schoolId?: string;
  schoolName: string;
  grade: string; // Khối 9, 12, Đại học năm cuối
  className: string; // 12A1, 9B, K62 Marketing...
  academicYear: string; // 2023-2024, 2024-2025
  region: string; // Hà Nội, Bắc Ninh, Hưng Yên, Hải Phòng...
  city?: string; // Thành phố / Tỉnh (VD: Hà Nội)
  district?: string; // Quận / Huyện (VD: Cầu Giấy)
  representativeRole: string; // Lớp trưởng, Bí thư, Trưởng ban phụ huynh
  studentCount: number;
  
  // Nhu cầu & Concept
  serviceType: string; // Kỷ yếu truyền thống, Kỷ yếu Concept, Ngoại cảnh + Dạ tiệc...
  servicePackageId?: string;
  servicePackageName?: string;
  concept: string; // Cổ phục, Thanh xuân vườn trường, Party Night, Harry Potter, Retro 90s...
  expectedShootDate?: string;
  shootingLocations: string[]; // Trường học, Hoàng Thành Thăng Long, Văn Miếu, Phim trường Santorini...
  expectedBudget: number;
  specialRequests?: string;
  notes?: string;

  // Nguồn Marketing
  source: LeadSource;
  campaignName?: string;
  utm?: UtmDetails;

  // Trạng thái CRM & Phân bổ
  pipelineStage: PipelineStage;
  assignedSalesId: string;
  assignedSalesName: string;
  assignedCareStaffId?: string;
  assignedCareStaffName?: string;
  
  // Tài chính tổng hợp
  totalRevenue: number;
  paidAmount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

// 2. Trường & Lớp
export interface School {
  id: string;
  name: string;
  city: string;
  district: string;
  type: 'THCS' | 'THPT' | 'Đại học' | 'Cao đẳng';
  totalClassesBooked: number;
  status: 'active' | 'potential' | 'inactive';
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  schoolName: string;
  grade: string;
  name: string; // 12 Chuyên Văn
  academicYear: string;
  studentCount: number;
  representativeName: string;
  phone: string;
  facebook?: string;
  zalo?: string;
  status: 'lead' | 'contacted' | 'booked' | 'completed';
}

// 3. Quản lý Thợ / Photographer
export type PhotographerStatus = 'available' | 'busy' | 'offline' | 'inactive';
export type PhotographerSkill = 'Chụp chính' | 'Chụp phụ' | 'Flycam' | 'Quay phim' | 'Makeup' | 'Chỉnh màu (Colorist)';
export type PhotographerSalaryType = 'per_shoot' | 'monthly';

export interface Photographer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatar: string;
  activeRegions: string[]; // Hà Nội, Bắc Ninh, Hưng Yên...
  photographerType: 'Full-time' | 'Freelancer' | 'Đối tác Studio';
  experienceYears: number;
  skills: PhotographerSkill[];
  equipmentList: string[]; // Sony A7IV + 24-70 GM, Canon R6 + 50 1.2, DJI Mini 4 Pro, Đèn Godox AD600...
  status: PhotographerStatus;
  // Cơ chế lương setup bởi Admin: lương tháng hoặc theo buổi chụp
  salaryType?: PhotographerSalaryType; // 'monthly' (Lương tháng) | 'per_shoot' (Theo buổi chụp)
  monthlySalary?: number; // Mức lương tháng cố định (VD: 12,000,000đ)
  ratePerShoot: number; // Đơn giá trả thợ / buổi (VD: 1,000,000đ)
  rating: number; // 4.9/5
  completedShootsCount: number;
  notes?: string;
  // Thông tin tài khoản đăng nhập do Admin cấp
  username?: string;
  password?: string;
  canLogin?: boolean;
  lastLoginAt?: string;
}

// 4. Booking & Lịch Chụp
export type BookingStatus = 
  | 'Chờ xác nhận'
  | 'Đã xác nhận'
  | 'Đã đặt cọc'
  | 'Sắp chụp'
  | 'Đang chụp'
  | 'Đã chụp'
  | 'Hậu kỳ'
  | 'Đã bàn giao'
  | 'Hoàn thành'
  | 'Hủy';

export type PaymentStatus = 'Chưa cọc' | 'Đã cọc' | 'Đã thanh toán đủ' | 'Còn công nợ';

export interface BookingAssignment {
  leadPhotographerId?: string;
  leadPhotographerName?: string;
  assistantPhotographerIds?: string[];
  assistantNames?: string[];
  videographerId?: string;
  videographerName?: string;
  makeupStaffId?: string;
  makeupStaffName?: string;
}

export interface Booking {
  id: string;
  code: string; // BK-2024-001
  customerId: string;
  customerName: string;
  schoolName: string;
  className: string;
  shootDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (07:30)
  endTime: string; // HH:mm (17:00)
  location: string;
  city?: string; // Thành phố / Tỉnh chụp (VD: Hà Nội)
  district?: string; // Quận / Huyện chụp (VD: Cầu Giấy, Hoàn Kiếm)
  studentCount: number;
  packageId: string;
  packageName: string;
  
  // Tài chính
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  
  // Trạng thái vận hành
  bookingStatus: BookingStatus;
  assignments: BookingAssignment;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 5. Gói Dịch Vụ
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  minStudents: number;
  durationHours: number;
  leadPhotographersNeeded: number;
  assistantsNeeded: number;
  makeupIncluded: boolean;
  photoCountTotal: number;
  photoCountEdited: number;
  videoIncluded: boolean;
  albumIncluded: boolean;
  extraFeesNote?: string;
  status: 'active' | 'inactive';
}

// 6. Remarketing & Segments & Workflows
export type RemarketingChannel = 'Facebook' | 'TikTok' | 'Zalo' | 'Email' | 'SMS' | 'Phone' | 'Website';
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Running' | 'Paused' | 'Completed';

export interface RemarketingSegment {
  id: string;
  name: string;
  description: string;
  targetCriteria: string; // e.g., 'Lead > 3 ngày chưa cọc', 'Niên khóa 2024', 'Lost > 30 ngày'
  customerCount: number;
  createdAt: string;
}

export interface RemarketingCampaign {
  id: string;
  name: string;
  campaignType: 'Chăm sóc Lead nguội' | 'Khuyến mãi mùa kỷ yếu' | 'Tri ân khách hàng cũ' | 'Up-sell Quay phóng sự';
  segmentId: string;
  segmentName: string;
  channel: RemarketingChannel;
  startDate: string;
  endDate: string;
  content: string;
  offer: string; // Giảm 15% gói Flycam, Tặng Photobook 40 trang...
  budget: number;
  spent: number;
  reach: number;
  leadsGenerated: number;
  status: CampaignStatus;
}

export type WorkflowNodeType = 'trigger' | 'delay' | 'condition' | 'action' | 'notification' | 'end';

export interface WorkflowNodeConfig {
  channel?: 'Zalo' | 'SMS' | 'Facebook' | 'Email' | 'Phone';
  templateContent?: string;
  delayHours?: number;
  delayDays?: number;
  conditionField?: string;
  conditionOperator?: 'equals' | 'greater_than' | 'contains' | 'is_true';
  conditionValue?: string | number | boolean;
  actionType?: 'send_message' | 'create_task' | 'assign_sales' | 'update_stage' | 'apply_offer';
  targetStage?: string;
  assignedRole?: string;
  offerText?: string;
  taskTitle?: string;
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  subtitle?: string;
  description: string;
  iconName?: string;
  config?: WorkflowNodeConfig;
  position?: { x: number; y: number };
  next?: string; // id của node tiếp theo (luồng tuần tự)
  yesNext?: string; // id của node khi condition = TRUE
  noNext?: string; // id của node khi condition = FALSE
  stats?: {
    processedCount: number;
    successRate: number;
  };
}

export interface WorkflowStep {
  id: string;
  title: string;
  type: 'trigger' | 'delay' | 'condition' | 'action';
  description: string;
  config?: Record<string, any>;
}

export interface RemarketingWorkflow {
  id: string;
  name: string;
  description: string;
  category?: 'Lead Nurturing' | 'Quote Follow-up' | 'Lost Recovery' | 'Upsell / Loyalty' | 'Pipeline Auto';
  triggerEvent: string;
  isActive: boolean;
  steps: WorkflowStep[];
  nodes: WorkflowNode[];
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    totalTriggered: number;
    convertedCount: number;
    revenueSaved: number;
  };
}

// 7. Tasks & Follow-up
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 
  | 'Gọi điện'
  | 'Nhắn tin'
  | 'Gửi báo giá'
  | 'Follow-up'
  | 'Xác nhận Booking'
  | 'Thu tiền'
  | 'Chăm sóc khách hàng'
  | 'Remarketing';

export interface Task {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  schoolClass: string;
  assignedToId: string;
  assignedToName: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  priority: TaskPriority;
  taskType: TaskType;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
}

// 8. Timeline & Activity Log cho Customer 360
export interface ActivityLog {
  id: string;
  customerId: string;
  type: 'lead_created' | 'call' | 'message' | 'quote_sent' | 'deposit_paid' | 'booking_scheduled' | 'photographer_assigned' | 'shooting_done' | 'delivered' | 'remarketing_sent' | 'note';
  title: string;
  description: string;
  performedByName: string;
  createdAt: string;
}

// 9. Alert & Notification System
export interface SystemNotification {
  id: string;
  type: 'conflict' | 'overload' | 'unassigned' | 'new_lead' | 'upcoming_booking' | 'due_task' | 'unpaid';
  title: string;
  message: string;
  bookingId?: string;
  customerId?: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string;
  read: boolean;
}

// 10. Khoảnh Khắc & Feedback Từ Các Lớp
export interface FeedbackAspects {
  photographerCrew: number; // 1-5 sao đánh giá thợ chụp/quay
  photoQuality: number; // 1-5 sao chất lượng ảnh photoshop & màu sắc
  attitude: number; // 1-5 sao độ nhiệt tình khuấy động
  deliverySpeed: number; // 1-5 sao thời gian trả ảnh/album
}

export interface ClassFeedback {
  id: string;
  customerId: string;
  customerName: string;
  schoolName: string;
  className: string;
  bookingId?: string;
  rating: number; // Điểm tổng quan (1-5)
  aspects?: FeedbackAspects;
  comment: string;
  reviewerRole: string; // Lớp trưởng, Bí thư, Phụ huynh...
  photographerMentioned?: string[]; // Tên thợ được khen (Trần Minh Tuấn, Lê Đức Anh...)
  screenshotUrl?: string; // Ảnh chụp màn hình tin nhắn Zalo/FB khen ngợi
  channel: 'Zalo' | 'Facebook' | 'Google Review' | 'Form Khảo Sát' | 'Tin Nhắn';
  status: 'approved' | 'pending' | 'featured'; // approved: đã duyệt, featured: ghim trang chủ
  createdAt: string;
}

export interface ClassMoment {
  id: string;
  customerId: string;
  schoolName: string;
  className: string;
  concept: string; // Retro 90s, Cổ phục, Dạ tiệc Prom, Harry Potter...
  title: string; // "Thanh Xuân Rực Rỡ 12 Anh 1 Ams"
  coverImage: string;
  samplePhotos: string[];
  totalPhotosCount: number;
  albumDriveLink?: string;
  tiktokVideoUrl?: string;
  photographerName: string;
  shootingDate: string;
  likesCount: number;
  featured: boolean;
}

// 11. Đội ngũ Sales tư vấn & Cơ chế Hoa hồng
export type SalesCommissionType = 'percentage' | 'fixed';

export interface SalesStaff {
  id: string;
  name: string;
  phone: string;
  email: string;
  roleTitle: string; // 'Sales Lead' | 'Chuyên viên Sales' | 'CTV Sales'
  avatar?: string;
  activeRegions: string[];
  status: 'active' | 'inactive';
  createdAt?: string;
  // Chính sách hoa hồng: theo % doanh thu hoặc số tiền cố định/hợp đồng
  commissionType?: SalesCommissionType; // 'percentage' | 'fixed'
  commissionRate?: number; // % hoa hồng (VD: 8 = 8% doanh thu)
  commissionFixedAmount?: number; // Số tiền cố định/hợp đồng (VD: 500,000đ)
  // Thông tin tài khoản đăng nhập do Admin cấp
  username?: string;
  password?: string;
  canLogin?: boolean;
  lastLoginAt?: string;
}

// 12. Bảng Báo Giá Chi Tiết (Sản phẩm / Dịch vụ, Số lượng, Đơn giá, Chiết khấu)
export interface QuoteItem {
  id: string;
  name: string; // Tên sản phẩm / dịch vụ
  category?: 'package' | 'costume' | 'media' | 'party' | 'logistics' | 'print' | 'other';
  unit: string; // Học sinh, Gói, Bộ, Buổi, Clip, Chiếc, Chuyến...
  quantity: number; // Số lượng
  unitPrice: number; // Đơn giá VNĐ
  discount: number; // Chiết khấu (VNĐ hoặc %)
  discountType: 'fixed' | 'percentage';
  note?: string; // Ghi chú (VD: Tặng kèm, Độc quyền...)
}

export interface QuoteData {
  quoteCode: string;
  createdAt: string;
  validDays: number;
  items: QuoteItem[];
  subtotal: number; // Tổng trước chiết khấu
  totalDiscount: number; // Tổng tiền chiết khấu
  finalTotal: number; // Tổng thanh toán sau chiết khấu
  perStudentCost: number; // Chi phí / học sinh
  note?: string; // Ghi chú ưu đãi toàn đơn
}

