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

  // 1. Khách hàng ở New Lead hoặc Lost tuyệt đối không tính là Booked/Cọc trừ khi có số tiền cọc thực tế > 0
  if (customer.pipelineStage === 'New Lead' || customer.pipelineStage === 'Lost') {
    const paid = Number(customer.paidAmount ?? 0);
    const deposit = Number(customer.depositAmount ?? 0);
    return paid > 0 || deposit > 0;
  }

  // 2. Thuộc stage chốt cọc trở đi (Đã cọc, Book ngày, Đã chụp...)
  if (CLOSED_BOOKED_STAGES.includes(customer.pipelineStage)) {
    return true;
  }

  // 3. Đã có tiền cọc hoặc thanh toán thực tế phát sinh (> 0)
  const paid = Number(customer.paidAmount ?? 0);
  const deposit = Number(customer.depositAmount ?? 0);
  if (paid > 0 || deposit > 0) {
    return true;
  }

  // 4. Đã có booking xếp lịch thực tế (chỉ khi không phải New Lead / Lost)
  if (bookings.length > 0 && bookings.some(b => b.customerId === customer.id)) {
    return true;
  }

  return false;
};

/**
 * Kiểm tra xem khách hàng đã thanh toán đầy đủ 100% hợp đồng hay chưa
 * Điều kiện BẮT BUỘC:
 * 1. Đã chốt cọc hoặc có booking (isCustomerBookedOrDeposited)
 * 2. Tổng giá trị đơn hàng > 0
 * 3. Thực thu (tiền cọc + các đợt trả) >= Tổng giá trị đơn hàng VÀ Thực thu > 0
 * TUYỆT ĐỐI KHÔNG BAO GIỜ tính các New Lead chưa cọc là đã thanh toán đủ 100%!
 */
export const isCustomerPaidInFull = (
  customer: Customer,
  bookings: Booking[] = []
): boolean => {
  if (!customer) return false;
  if (!isCustomerBookedOrDeposited(customer, bookings)) return false;
  const total = getCustomerTotalOrderValue(customer);
  const paid = getCustomerPaidDeposit(customer);
  return total > 0 && paid > 0 && paid >= total;
};

/**
 * Lấy DOANH THU TOÀN BỘ ĐƠN của một khách hàng / lớp học
 * (Tính trọn gói theo hợp đồng: Sĩ số * đơn giá + phụ phí - giảm giá, hoặc totalAmount)
 */
export const getCustomerTotalOrderValue = (customer: Customer): number => {
  if (!customer) return 0;
  
  let val = 0;
  if (customer.totalAmount !== undefined && customer.totalAmount !== null && Number(customer.totalAmount) > 0) {
    val = Number(customer.totalAmount);
  } else if (customer.totalRevenue !== undefined && customer.totalRevenue !== null && Number(customer.totalRevenue) > 0) {
    val = Number(customer.totalRevenue);
  } else if (customer.contractValue !== undefined && customer.contractValue !== null && Number(customer.contractValue) > 0) {
    val = Number(customer.contractValue);
  } else if (customer.expectedBudget !== undefined && customer.expectedBudget !== null && Number(customer.expectedBudget) > 0) {
    val = Number(customer.expectedBudget);
  } else if (customer.studentCount && customer.unitPrice) {
    const calc = (Number(customer.studentCount) * Number(customer.unitPrice)) + Number(customer.extraFee || 0) - Number(customer.discount || 0);
    if (calc > 0) val = calc;
  }

  const paid = Math.max(Number(customer.paidAmount || 0), Number(customer.depositAmount || 0));
  return Math.max(val, paid);
};

/**
 * Lấy SỐ TIỀN THỰC THU (Cọc & các đợt thanh toán đã nhận vào tài khoản)
 */
export const getCustomerPaidDeposit = (customer: Customer): number => {
  if (!customer) return 0;
  const isCompleted = isCustomerInStage(customer.pipelineStage, 'Hoàn thành');
  const total = getCustomerTotalOrderValue(customer);
  const paid = Number(customer.paidAmount ?? 0);
  const deposit = Number(customer.depositAmount ?? 0);
  const actualPaid = Math.max(paid, deposit);

  if (isCompleted && actualPaid === 0 && total > 0) {
    return total;
  }
  return actualPaid;
};

/**
 * Lấy CÔNG NỢ CÒN LẠI CẦN THU (Doanh thu toàn bộ đơn - Tiền cọc đã nhận)
 * Quy chuẩn kế toán: Khách hàng ở New Lead / chưa chốt cọc TUYỆT ĐỐI KHÔNG CÓ CÔNG NỢ (trả về 0)
 */
export const getCustomerRemainingDebt = (customer: Customer): number => {
  if (!customer) return 0;
  // Nếu khách chưa ở giai đoạn chốt cọc / chưa có cọc: không phát sinh công nợ
  if (!isCustomerBookedOrDeposited(customer)) {
    return 0;
  }
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
