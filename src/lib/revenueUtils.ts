import { Customer, Booking, PipelineStage } from '../types';

/**
 * Danh sách các stage được ghi nhận DOANH THU CHÍNH THỨC
 * (Chỉ các lớp đã cọc, lên lịch chụp hoặc các bước hậu kỳ/hoàn thành)
 */
export const CLOSED_BOOKED_STAGES: readonly PipelineStage[] = [
  'Đã cọc',
  'Book ngày',
  'Đã chụp',
  'Đang hậu kỳ',
  'Giao ảnh',
  'Hoàn thành',
  // Backward compatibility với các stage cũ
  'Đã đặt cọc',
  'Đã Booking',
  'Đã bàn giao'
] as const;

/**
 * Kiểm tra xem khách hàng có khớp với một giai đoạn Pipeline hay không
 * (Hỗ trợ tương thích ngược đầy đủ giữa các alias: Đã cọc <-> Đã đặt cọc, Book ngày <-> Đã Booking...)
 */
export const isCustomerInStage = (custStage?: string, targetStage?: PipelineStage | string): boolean => {
  if (!custStage || !targetStage) return false;
  if (targetStage === 'all') return true;
  if (custStage === targetStage) return true;

  // 1. Nhóm Đã cọc
  if (targetStage === 'Đã cọc' || targetStage === 'Đã đặt cọc') {
    return custStage === 'Đã cọc' || custStage === 'Đã đặt cọc';
  }

  // 2. Nhóm Book ngày / Đã Booking
  if (targetStage === 'Book ngày' || targetStage === 'Đã Booking') {
    return custStage === 'Book ngày' || custStage === 'Đã Booking';
  }

  // 3. Nhóm Giao ảnh / Bàn giao
  if (targetStage === 'Giao ảnh' || targetStage === 'Đã bàn giao') {
    return ['Giao ảnh', 'Đã bàn giao', 'Đã gửi link ảnh', 'Đã giao ảnh'].includes(custStage);
  }

  // 4. Nhóm Báo giá
  if (targetStage === 'Đã gửi báo giá') {
    return custStage === 'Đã gửi báo giá' || custStage === 'Đang thương lượng';
  }

  // 5. Nhóm Tư vấn
  if (targetStage === 'Đang tư vấn') {
    return custStage === 'Đang tư vấn' || custStage === 'Đã liên hệ' || custStage === 'Mới tiếp nhận';
  }

  // 6. Nhóm Hoàn thành
  if (targetStage === 'Hoàn thành') {
    return custStage === 'Hoàn thành' || custStage === 'Đã hoàn thành';
  }

  return false;
};

/**
 * Kiểm tra xem khách hàng/lớp học đã được tính là ĐÃ BOOK VÀ CỌC hay chưa
 * Điều kiện:
 * 1. Nằm trong các giai đoạn từ Đã cọc trở đi
 * 2. HOẶC đã có tiền cọc/thanh toán thực tế (> 0)
 * 3. HOẶC đã có bản ghi booking xếp lịch trong hệ thống
 */
export const isCustomerBookedOrDeposited = (
  customer: Customer,
  bookings: Booking[] = []
): boolean => {
  if (!customer) return false;

  // Thuộc stage chốt cọc trở đi
  if (CLOSED_BOOKED_STAGES.includes(customer.pipelineStage)) {
    return true;
  }

  // Đã có tiền cọc hoặc thanh toán thực tế phát sinh
  const paid = Number(customer.paidAmount ?? 0);
  const deposit = Number(customer.depositAmount ?? 0);
  if (paid > 0 || deposit > 0) {
    return true;
  }

  // Đã có booking xếp lịch thực tế
  if (bookings.length > 0 && bookings.some(b => b.customerId === customer.id)) {
    return true;
  }

  return false;
};

/**
 * Lấy DOANH THU TOÀN BỘ ĐƠN của một khách hàng / lớp học
 * (Tính trọn gói theo hợp đồng: Sĩ số * đơn giá + phụ phí - giảm giá, hoặc totalAmount)
 */
export const getCustomerTotalOrderValue = (customer: Customer): number => {
  if (!customer) return 0;
  
  if (customer.totalAmount !== undefined && customer.totalAmount !== null) {
    return Number(customer.totalAmount);
  }
  if (customer.totalRevenue !== undefined && customer.totalRevenue !== null) {
    return Number(customer.totalRevenue);
  }
  if (customer.contractValue !== undefined && customer.contractValue !== null) {
    return Number(customer.contractValue);
  }
  if (customer.expectedBudget !== undefined && customer.expectedBudget !== null) {
    return Number(customer.expectedBudget);
  }

  return 0;
};

/**
 * Lấy SỐ TIỀN THỰC THU (Cọc & các đợt thanh toán đã nhận vào tài khoản)
 */
export const getCustomerPaidDeposit = (customer: Customer): number => {
  if (!customer) return 0;
  return Number(customer.paidAmount ?? customer.depositAmount ?? 0);
};

/**
 * Lấy CÔNG NỢ CÒN LẠI CẦN THU (Doanh thu toàn bộ đơn - Tiền cọc đã nhận)
 */
export const getCustomerRemainingDebt = (customer: Customer): number => {
  if (!customer) return 0;
  const total = getCustomerTotalOrderValue(customer);
  const paid = getCustomerPaidDeposit(customer);
  return Math.max(0, total - paid);
};

export interface CrmFinancialSummary {
  bookedCustomers: Customer[];
  totalRevenue: number;         // Tổng doanh thu toàn bộ đơn của các lớp đã book & cọc
  totalCollected: number;       // Tổng thực thu (tiền cọc & thanh toán đã nhận)
  totalRemainingDebt: number;   // Tổng công nợ còn lại phải thu
  pipelinePotential: number;    // Tiềm năng toàn bộ pipeline (kể cả lead chưa cọc)
  bookedCount: number;          // Số lớp đã book & cọc
  totalCount: number;           // Tổng số lớp/lead
  unbookedPotential: number;    // Dự toán chào giá của các lớp chưa cọc
}

/**
 * Tính toán nhanh bức tranh tài chính toàn vẹn cho CRM
 */
export const calculateCrmFinancials = (
  customers: Customer[],
  bookings: Booking[] = []
): CrmFinancialSummary => {
  const bookedCustomers = customers.filter(c => isCustomerBookedOrDeposited(c, bookings));
  const unbookedCustomers = customers.filter(c => !isCustomerBookedOrDeposited(c, bookings));

  const totalRevenue = bookedCustomers.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
  const totalCollected = bookedCustomers.reduce((sum, c) => sum + getCustomerPaidDeposit(c), 0);
  const totalRemainingDebt = Math.max(0, totalRevenue - totalCollected);

  const unbookedPotential = unbookedCustomers.reduce((sum, c) => sum + getCustomerTotalOrderValue(c), 0);
  const pipelinePotential = totalRevenue + unbookedPotential;

  return {
    bookedCustomers,
    totalRevenue,
    totalCollected,
    totalRemainingDebt,
    pipelinePotential,
    bookedCount: bookedCustomers.length,
    totalCount: customers.length,
    unbookedPotential
  };
};
