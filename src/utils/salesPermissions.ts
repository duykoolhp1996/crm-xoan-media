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
      if (!s || s.id === myId) return false; // Không tính chính mình
      const sLeaderId = (s.leaderId || '').trim();
      const sLeaderName = (s.leaderName || '').trim().toLowerCase();
      const matchesLeaderId = Boolean(sLeaderId && sLeaderId === myId);
      const matchesLeaderName = Boolean(sLeaderName && myName && sLeaderName === myName.toLowerCase());
      return matchesLeaderId || matchesLeaderName;
    });

    // LƯU Ý BẢO MẬT: Tuyệt đối KHÔNG fallback gom toàn bộ nhân sự khi subordinateStaff rỗng.
    // Mỗi Sales Lead chỉ quản lý đúng các nhân sự được Admin phân vào Team của mình.
  }

  const subordinateIds = new Set<string>(subordinateStaff.map(s => s.id).filter(Boolean));
  const subordinateNames = new Set<string>(subordinateStaff.map(s => s.name?.trim().toLowerCase()).filter(Boolean));

  const teamMemberIds = new Set<string>([myId, ...subordinateIds].filter(Boolean));
  const teamMemberNames = new Set<string>([myName.toLowerCase(), ...subordinateNames].filter(Boolean));

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
 * Quy tắc nghiệp vụ chuẩn CRM Xoăn Media:
 * 1. Admin / Manager: Toàn quyền xem 100% data.
 * 2. Photographer: Xem lịch chụp / ca chụp của mình.
 * 3. Sales Lead (Trưởng Nhóm Sales):
 *    - Toàn quyền xem data của TEAM MÌNH (bao gồm data của Lead + data của các nhân sự trong Team mình).
 *    - TUYỆT ĐỐI KHÔNG xem data của Team khác!
 * 4. Sales Thường (Nhân viên / CTV):
 *    - Chỉ xem được khách hàng ĐƯỢC CẤP CHĂM SÓC (Admin cấp hoặc Sales Lead cấp).
 *    - Khách do chính mình tự tạo ra mà chưa gán cho ai thì được xem.
 *    - NẾU khách đó đang do Sales Lead hoặc nhân sự khác chăm sóc ("còn sale lead chăm sóc thì thôi") -> KHÔNG ĐƯỢC XEM.
 *    - KHÔNG xem khách của Sales khác hoặc của Team khác.
 */
export function canSalesAccessCustomer(
  customer: Customer,
  currentUser: User | null | undefined,
  currentRole: UserRole,
  salesStaffList: SalesStaff[]
): boolean {
  // Admin và Manager xem được tất cả 100%
  if (currentRole === 'admin' || currentRole === 'manager' || currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    return true;
  }

  // Photographer không giới hạn xem CRM (sẽ có phân hệ Lịch chụp riêng)
  if (currentRole === 'photographer' || currentUser?.role === 'photographer') {
    return true;
  }

  const hierarchy = getSalesHierarchyInfo(currentUser, currentRole, salesStaffList);
  if (!hierarchy.isSalesUser || !currentUser) {
    return true;
  }

  const myId = hierarchy.myStaff?.id || currentUser.id;
  const myName = (hierarchy.myStaff?.name || currentUser.name || '').trim().toLowerCase();

  const cAssignedId = (customer.assignedSalesId || '').trim();
  const cAssignedName = (customer.assignedSalesName || '').trim().toLowerCase();
  const cCreatedId = (customer.createdById || '').trim();
  const cCreatedName = (customer.createdByName || '').trim().toLowerCase();

  // Khách được cấp/gán cho chính mình chăm sóc
  const isAssignedToMe = Boolean(
    (cAssignedId && cAssignedId === myId) || 
    (cAssignedName && myName && cAssignedName === myName)
  );

  // Khách do chính mình tạo ra / thu thập được
  const isCreatedByMe = Boolean(
    (cCreatedId && cCreatedId === myId) || 
    (cCreatedName && myName && cCreatedName === myName)
  );

  // --- TRƯỜNG HỢP 1: SALES THƯỜNG (Nhân viên / CTV, không phải Lead) ---
  if (!hierarchy.isLead) {
    // 1. Khách được cấp cho chính mình chăm sóc (Admin cấp hoặc Lead cấp) -> ĐƯỢC XEM
    if (isAssignedToMe) {
      return true;
    }

    // 2. Khách do chính mình thu thập/tạo ra:
    // "sale thường sẽ chỉ coi được thông tin khách hàng được cấp (Admin cấp hoặc sale Lead cấp khi không chăm sóc, còn sale lead chăm sóc thì thôi)"
    // Nếu khách đã được phân bổ cho ai đó (có assignedSalesId hoặc assignedSalesName khác rỗng/khác 'chưa gán')
    const hasAssignee = Boolean(
      (cAssignedId && cAssignedId !== '') || 
      (cAssignedName && cAssignedName !== '' && cAssignedName !== 'chưa gán')
    );

    // Nếu do mình tạo ra và CHƯA gán cho ai chăm sóc -> ĐƯỢC XEM
    if (isCreatedByMe && !hasAssignee) {
      return true;
    }

    // Nếu khách đã được gán cho Sales Lead hoặc người khác chăm sóc -> KHÔNG ĐƯỢC XEM ("còn sale lead chăm sóc thì thôi")
    return false;
  }

  // --- TRƯỜNG HỢP 2: SALES LEAD (Trưởng nhóm Sales) ---
  // "Sales Lead có quyền xem toàn bộ data của Team mình (Của team mình không phải team khác)"
  
  // a. Data của chính Sales Lead:
  // - Được cấp/gán cho Lead, HOẶC do Lead tự tạo và chưa bàn giao cho team khác
  if (isAssignedToMe || isCreatedByMe) {
    return true;
  }

  // b. Data của các thành viên trong Team mình:
  // - Do nhân sự trong Team thu thập/tạo ra:
  const isCreatedBySubordinate = Boolean(
    (cCreatedId && hierarchy.subordinateIds.has(cCreatedId)) ||
    (cCreatedName && hierarchy.subordinateNames.has(cCreatedName))
  );

  // - Được Admin hoặc Lead cấp/gán cho nhân sự trong Team chăm sóc:
  const isAssignedToSubordinate = Boolean(
    (cAssignedId && hierarchy.subordinateIds.has(cAssignedId)) ||
    (cAssignedName && hierarchy.subordinateNames.has(cAssignedName))
  );

  if (isCreatedBySubordinate || isAssignedToSubordinate) {
    return true;
  }

  // Data thuộc về Team khác hoặc data ngoài nhóm -> TUYỆT ĐỐI KHÔNG XEM
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

/**
 * Kiểm tra xem người dùng hiện tại có quyền xem Bảng Tài Chính & Cọc hay không
 * Quy tắc nghiệp vụ CRM Xoăn Media:
 * - Admin / Manager: Toàn quyền xem 100%
 * - Photographer: Tuyệt đối KHÔNG được xem
 * - Sales: Chỉ được xem khi ĐƯỢC ADMIN CẤP QUYỀN (canViewFinance === true)
 */
export function canUserAccessFinance(
  currentUser: User | null | undefined,
  currentRole: UserRole,
  salesStaffList: SalesStaff[] = []
): boolean {
  if (!currentUser) return false;

  // 1. Admin & Manager: Toàn quyền xem
  if (currentRole === 'admin' || currentRole === 'manager' || currentUser.role === 'admin' || currentUser.role === 'manager') {
    return true;
  }

  // 2. Thợ chụp (Photographer): Không được xem
  if (currentRole === 'photographer' || currentUser.role === 'photographer') {
    return false;
  }

  // 3. Sales: Chỉ được xem nếu đã được Admin cấp quyền (canViewFinance)
  if (currentRole === 'sales' || currentUser.role === 'sales') {
    if (currentUser.canViewFinance === true) return true;
    const staff = getSalesStaffProfile(currentUser, salesStaffList);
    if (staff?.canViewFinance === true) return true;
    return false;
  }

  return false;
}
