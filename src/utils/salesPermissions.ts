import { Customer, Booking, SalesStaff, User, UserRole } from '../types';

/**
 * Tiện ích Phân Quyền Dữ Liệu Sales & Sales Lead
 * Quy tắc nghiệp vụ CRM Xoăn Media:
 * 1. Admin / Manager: Toàn quyền xem 100% dữ liệu.
 * 2. Sales Lead (Trưởng Nhóm Sales):
 *    - Xem data được Admin phân quyền cho chính mình (gán cho Lead).
 *    - Xem data do chính Sales Lead thu thập / tạo mới.
 *    - CỘNG VỚI data do các nhân sự dưới quyền mình thu thập được.
 *    - CỘNG VỚI data được phân quyền / gán cho các nhân sự dưới quyền mình.
 *    - KHÔNG xem data của nhóm Sales khác hay data chưa gán ngoài nhóm.
 * 3. Sales Nhân Viên / CTV (dưới quyền):
 *    - Chỉ xem data được phân quyền cho chính mình hoặc do chính mình thu thập được.
 *    - KHÔNG xem data của Sales khác hay của Lead.
 */

export interface SalesHierarchyInfo {
  isSalesUser: boolean;
  isLead: boolean;
  myStaff: SalesStaff | null;
  subordinateStaff: SalesStaff[];
  subordinateIds: Set<string>;
  subordinateNames: Set<string>;
  teamMemberIds: Set<string>; // Lead + subordinates
  teamMemberNames: Set<string>;
}

/**
 * Tìm hồ sơ SalesStaff tương ứng với user đang đăng nhập
 */
export function getSalesStaffProfile(
  currentUser: User | null | undefined,
  salesStaffList: SalesStaff[]
): SalesStaff | null {
  if (!currentUser) return null;
  const staff = salesStaffList.find(s => {
    if (s.id && s.id === currentUser.id) return true;
    if (currentUser.email && s.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (currentUser.name && s.name && s.name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    if (currentUser.phone && s.phone && s.phone === currentUser.phone) return true;
    return false;
  });
  return staff || null;
}

/**
 * Kiểm tra một nhân sự Sales có phải là Sales Lead (Trưởng Nhóm) hay không
 */
export function checkIsSalesLead(staff: SalesStaff | null, salesStaffList: SalesStaff[]): boolean {
  if (!staff) return false;
  const title = (staff.roleTitle || '').toLowerCase();
  if (title.includes('lead') || title.includes('trưởng nhóm') || title.includes('truong nhom')) {
    return true;
  }
  // Nếu có nhân sự khác chỉ định nhân sự này làm leaderId
  return salesStaffList.some(s => s.leaderId === staff.id);
}

/**
 * Phân tích cấu trúc phân cấp (Hierarchy) của Sales hiện tại
 */
export function getSalesHierarchyInfo(
  currentUser: User | null | undefined,
  currentRole: UserRole,
  salesStaffList: SalesStaff[]
): SalesHierarchyInfo {
  const isSalesUser = currentRole === 'sales' || currentUser?.role === 'sales';

  if (!isSalesUser || !currentUser) {
    return {
      isSalesUser: false,
      isLead: false,
      myStaff: null,
      subordinateStaff: [],
      subordinateIds: new Set(),
      subordinateNames: new Set(),
      teamMemberIds: new Set(),
      teamMemberNames: new Set()
    };
  }

  const myStaff = getSalesStaffProfile(currentUser, salesStaffList);
  const myId = myStaff?.id || currentUser.id;
  const myName = myStaff?.name || currentUser.name;

  const isLead = checkIsSalesLead(myStaff, salesStaffList);

  // Tìm danh sách cấp dưới
  let subordinateStaff: SalesStaff[] = [];
  if (isLead) {
    // 1. Tìm các nhân sự có leaderId hoặc leaderName trùng với Lead
    subordinateStaff = salesStaffList.filter(s => {
      if (s.id === myId) return false; // Không tính chính mình
      const matchesLeaderId = s.leaderId && s.leaderId === myId;
      const matchesLeaderName = s.leaderName && s.leaderName.toLowerCase() === myName.toLowerCase();
      return matchesLeaderId || matchesLeaderName;
    });

    // 2. Fallback: Nếu không có ai có leaderId rõ ràng (dữ liệu cũ), mà Lead là Lê Hoàng Sơn (hoặc Lead duy nhất)
    if (subordinateStaff.length === 0) {
      subordinateStaff = salesStaffList.filter(s => {
        if (s.id === myId) return false;
        const sTitle = (s.roleTitle || '').toLowerCase();
        // Cấp dưới là những người không phải Lead
        return !sTitle.includes('lead') && !sTitle.includes('trưởng nhóm');
      });
    }
  }

  const subordinateIds = new Set<string>(subordinateStaff.map(s => s.id));
  const subordinateNames = new Set<string>(subordinateStaff.map(s => s.name.toLowerCase()));

  const teamMemberIds = new Set<string>([myId, ...subordinateIds]);
  const teamMemberNames = new Set<string>([myName.toLowerCase(), ...subordinateNames]);

  return {
    isSalesUser: true,
    isLead,
    myStaff,
    subordinateStaff,
    subordinateIds,
    subordinateNames,
    teamMemberIds,
    teamMemberNames
  };
}

/**
 * Kiểm tra quyền truy cập vào một Khách hàng (Customer / Lead)
 */
export function canSalesAccessCustomer(
  customer: Customer,
  currentUser: User | null | undefined,
  currentRole: UserRole,
  salesStaffList: SalesStaff[]
): boolean {
  // Admin và Manager xem được tất cả
  if (currentRole === 'admin' || currentRole === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    return true;
  }

  // Photographer không trực tiếp quản lý CRM (sẽ có màn hình riêng theo Lịch chụp)
  if (currentRole === 'photographer') {
    return true;
  }

  const hierarchy = getSalesHierarchyInfo(currentUser, currentRole, salesStaffList);
  if (!hierarchy.isSalesUser || !currentUser) {
    return true;
  }

  const myId = hierarchy.myStaff?.id || currentUser.id;
  const myName = (hierarchy.myStaff?.name || currentUser.name || '').toLowerCase();

  const cAssignedId = customer.assignedSalesId || '';
  const cAssignedName = (customer.assignedSalesName || '').toLowerCase();
  const cCreatedId = customer.createdById || '';
  const cCreatedName = (customer.createdByName || '').toLowerCase();

  // Kiểm tra gán cho chính mình hoặc do chính mình tạo ra
  const isAssignedToMe = cAssignedId === myId || (cAssignedName && cAssignedName === myName);
  const isCreatedByMe = cCreatedId === myId || (cCreatedName && cCreatedName === myName);

  if (isAssignedToMe || isCreatedByMe) {
    return true;
  }

  // Nếu là Sales Lead (Trưởng Nhóm): Xem thêm data của cấp dưới
  if (hierarchy.isLead) {
    // 1. Data do cấp dưới thu thập được
    const isCreatedBySubordinate =
      (cCreatedId && hierarchy.subordinateIds.has(cCreatedId)) ||
      (cCreatedName && hierarchy.subordinateNames.has(cCreatedName));

    // 2. Data được Admin hoặc Lead phân quyền cho cấp dưới chăm sóc
    const isAssignedToSubordinate =
      (cAssignedId && hierarchy.subordinateIds.has(cAssignedId)) ||
      (cAssignedName && hierarchy.subordinateNames.has(cAssignedName));

    if (isCreatedBySubordinate || isAssignedToSubordinate) {
      return true;
    }
  }

  // Sales thường hoặc Lead không có quyền với các data ngoài phạm vi
  return false;
}

/**
 * Lọc danh sách khách hàng có thể truy cập
 */
export function filterAccessibleCustomers(
  customers: Customer[],
  currentUser: User | null | undefined,
  currentRole: UserRole,
  salesStaffList: SalesStaff[]
): Customer[] {
  // Admin & Manager xem được tất cả
  if (currentRole === 'admin' || currentRole === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    return customers;
  }

  if (currentRole === 'photographer') {
    return customers;
  }

  return customers.filter(c => canSalesAccessCustomer(c, currentUser, currentRole, salesStaffList));
}

/**
 * Lọc danh sách Booking có thể truy cập (theo khách hàng mà Sales có quyền)
 */
export function filterAccessibleBookingsForSales(
  bookings: Booking[],
  accessibleCustomers: Customer[],
  isSalesUser: boolean
): Booking[] {
  if (!isSalesUser) return bookings;
  
  const accessibleCustomerIds = new Set(accessibleCustomers.map(c => c.id));
  const accessibleCustomerNames = new Set(accessibleCustomers.map(c => c.name.toLowerCase()));

  return bookings.filter(b => {
    if (b.customerId && accessibleCustomerIds.has(b.customerId)) return true;
    if (b.customerName && accessibleCustomerNames.has(b.customerName.toLowerCase())) return true;
    return false;
  });
}

/**
 * Lấy danh sách nhân sự Sales mà người dùng hiện tại có quyền phân bổ / gán khách hàng
 * - Admin: Toàn bộ danh sách + "Chưa gán"
 * - Sales Lead: Chính mình + Nhân sự cấp dưới
 * - Sales thường: Chỉ chính mình
 */
export function getAssignableSalesList(
  currentUser: User | null | undefined,
  currentRole: UserRole,
  salesStaffList: SalesStaff[]
): SalesStaff[] {
  if (currentRole === 'admin' || currentRole === 'manager' || currentUser?.role === 'admin') {
    return salesStaffList;
  }

  const hierarchy = getSalesHierarchyInfo(currentUser, currentRole, salesStaffList);
  if (!hierarchy.isSalesUser || !currentUser) {
    return salesStaffList;
  }

  const myStaff = hierarchy.myStaff || {
    id: currentUser.id,
    name: currentUser.name,
    phone: currentUser.phone || '',
    email: currentUser.email || '',
    roleTitle: 'Chuyên viên Sales',
    commissionType: 'percentage',
    commissionRate: 8,
    status: 'active'
  } as SalesStaff;

  if (hierarchy.isLead) {
    // Lead có thể gán cho chính mình hoặc nhân sự cấp dưới
    return [myStaff, ...hierarchy.subordinateStaff];
  }

  // Sales thường chỉ gán cho chính mình
  return [myStaff];
}
