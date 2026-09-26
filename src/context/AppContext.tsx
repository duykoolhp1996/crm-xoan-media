import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Customer,
  Booking,
  Photographer,
  School,
  SchoolClass,
  ServicePackage,
  RemarketingSegment,
  RemarketingCampaign,
  RemarketingWorkflow,
  Task,
  ActivityLog,
  SystemNotification,
  PipelineStage,
  ClassFeedback,
  ClassMoment,
  SalesStaff
} from '../types';
import {
  mockUsers,
  mockCustomers,
  mockBookings,
  mockPhotographers,
  mockSalesStaff,
  mockSchools,
  mockSchoolClasses,
  mockServicePackages,
  mockRemarketingSegments,
  mockRemarketingCampaigns,
  mockWorkflows,
  mockTasks,
  mockActivityLogs,
  mockNotifications,
  mockFeedbacks,
  mockMoments
} from '../data/mockData';
import { crmSupabaseService } from '../services/crmSupabaseService';

export type NavigationTab = 
  | 'dashboard'
  | 'leads'
  | 'customers'
  | 'pipeline'
  | 'schools'
  | 'bookings'
  | 'calendar'
  | 'photographers'
  | 'services'
  | 'feedbacks'
  | 'remarketing'
  | 'tasks'
  | 'reports-marketing'
  | 'reports-photographer'
  | 'settings';

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Đăng nhập & Xác thực hệ thống
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  loginQuick: (role: 'admin' | 'sales' | 'photographer', staffId?: string) => void;
  logout: () => void;
  isImpersonating: boolean;
  loginAsStaff: (staff: { id: string; name: string; role: 'sales' | 'photographer'; avatar?: string; email?: string; phone?: string }) => void;
  returnToAdmin: () => void;
  
  // Customers & Leads
  customers: Customer[];
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalRevenue' | 'paidAmount'>) => void;
  updateCustomerStage: (customerId: string, newStage: PipelineStage) => void;
  updateCustomer: (customer: Customer) => void;

  // Bookings & Calendar
  bookings: Booking[];
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (booking: Booking) => void;
  assignPhotographerToBooking: (bookingId: string, photographerId: string, roleType: 'lead' | 'assistant' | 'videographer' | 'makeup') => void;

  // Photographers
  photographers: Photographer[];
  addPhotographer: (photographer: Omit<Photographer, 'id' | 'rating' | 'completedShootsCount'>) => void;
  updatePhotographer: (photographer: Photographer) => void;
  deletePhotographer: (id: string) => void;
  updatePhotographerStatus: (id: string, status: Photographer['status']) => void;
  getPhotographerAvailability: (photographerId: string, date: string) => { available: boolean; conflictBookingCode?: string; totalShootsOnDay: number };

  // Sales Staff Team
  salesStaff: SalesStaff[];
  addSalesStaff: (staff: Omit<SalesStaff, 'id'>) => void;
  updateSalesStaff: (staff: SalesStaff) => void;
  deleteSalesStaff: (id: string) => void;

  // Schools & Classes
  schools: School[];
  classes: SchoolClass[];
  addClass: (newClass: SchoolClass) => void;

  // Services
  servicePackages: ServicePackage[];

  // Remarketing
  segments: RemarketingSegment[];
  campaigns: RemarketingCampaign[];
  workflows: RemarketingWorkflow[];
  toggleWorkflow: (id: string) => void;
  addCampaign: (campaign: Omit<RemarketingCampaign, 'id' | 'spent' | 'reach' | 'leadsGenerated'>) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTaskStatus: (id: string) => void;

  // Khoảnh khắc & Feedback từ các lớp
  feedbacks: ClassFeedback[];
  addFeedback: (feedback: Omit<ClassFeedback, 'id' | 'createdAt'>) => void;
  updateFeedbackStatus: (id: string, status: ClassFeedback['status']) => void;
  moments: ClassMoment[];
  addMoment: (moment: Omit<ClassMoment, 'id'>) => void;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => void;

  // Notifications
  notifications: SystemNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Search & Filters
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [photographers, setPhotographers] = useState<Photographer[]>(mockPhotographers);
  const [salesStaff, setSalesStaff] = useState<SalesStaff[]>(mockSalesStaff);
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [classes, setClasses] = useState<SchoolClass[]>(mockSchoolClasses);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>(mockServicePackages);
  const [segments, setSegments] = useState<RemarketingSegment[]>(mockRemarketingSegments);
  const [campaigns, setCampaigns] = useState<RemarketingCampaign[]>(mockRemarketingCampaigns);
  const [workflows, setWorkflows] = useState<RemarketingWorkflow[]>(mockWorkflows);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications);
  const [feedbacks, setFeedbacks] = useState<ClassFeedback[]>(mockFeedbacks);
  const [moments, setMoments] = useState<ClassMoment[]>(mockMoments);
  
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>('this_month');

  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);

  // Trạng thái xác thực đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('xoan_crm_auth_user');
      return !!savedAuth;
    } catch {
      return false;
    }
  });

  // Khôi phục user từ localStorage nếu đã lưu phiên
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('xoan_crm_auth_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.user) {
          setCurrentUser(parsed.user);
          setCurrentRoleState(parsed.user.role || 'admin');
        }
      }
    } catch (e) {
      console.error('Error reading auth from localStorage', e);
    }
  }, []);

  // Tự động kết nối và nạp dữ liệu từ Supabase Database khi khởi chạy
  useEffect(() => {
    crmSupabaseService.getCustomers().then(remoteCustomers => {
      if (remoteCustomers && remoteCustomers.length > 0) {
        const hasConsulting = remoteCustomers.some(c => c.pipelineStage === 'Đang tư vấn');
        if (!hasConsulting) {
          setCustomers([...remoteCustomers, ...mockCustomers]);
        } else {
          setCustomers(remoteCustomers);
        }
        console.log(`[Supabase] Đã nạp thành công ${remoteCustomers.length} khách hàng từ cơ sở dữ liệu.`);
      }
    });
  }, []);

  // Xử lý đăng nhập bằng username & password
  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. Kiểm tra tài khoản Admin
    if (
      (u === 'admin@xoanmedia.vn' || u === 'admin') &&
      (p === 'XoanAdmin@2026' || p === 'admin123' || p === '123456')
    ) {
      const adminUser = mockUsers[0];
      setCurrentUser(adminUser);
      setCurrentRoleState('admin');
      setIsAuthenticated(true);
      setIsImpersonating(false);
      setActiveTab('dashboard');
      try {
        localStorage.setItem('xoan_crm_auth_user', JSON.stringify({ user: adminUser, role: 'admin' }));
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }

    // 2. Kiểm tra tài khoản Sales Tư Vấn
    const matchedSales = salesStaff.find(
      s => (s.username?.toLowerCase() === u || s.email.toLowerCase() === u || s.phone === u) && s.canLogin
    );
    if (matchedSales) {
      const validPasswords = [
        matchedSales.password,
        'SonLead@2024',
        'HuongSales@2024',
        'DangSales@2024',
        'PhuongCTV@2024',
        '123456'
      ];
      if (validPasswords.includes(p)) {
        const salesUser: User = {
          id: matchedSales.id,
          name: matchedSales.name,
          email: matchedSales.email,
          avatar: matchedSales.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'sales',
          phone: matchedSales.phone
        };
        setCurrentUser(salesUser);
        setCurrentRoleState('sales');
        setIsAuthenticated(true);
        setIsImpersonating(false);
        setActiveTab('pipeline');
        try {
          localStorage.setItem('xoan_crm_auth_user', JSON.stringify({ user: salesUser, role: 'sales' }));
        } catch (e) {
          console.error(e);
        }
        return { success: true };
      } else {
        return { success: false, message: 'Mật khẩu tài khoản Sales không chính xác!' };
      }
    }

    // 3. Kiểm tra tài khoản Thợ Chụp (Ekip)
    const matchedPhoto = photographers.find(
      ph => (ph.username?.toLowerCase() === u || ph.email?.toLowerCase() === u || ph.phone === u) && ph.canLogin
    );
    if (matchedPhoto) {
      const validPasswords = [matchedPhoto.password, 'XoanPhoto@2026', '123456'];
      if (validPasswords.includes(p)) {
        const photoUser: User = {
          id: matchedPhoto.id,
          name: matchedPhoto.fullName,
          email: matchedPhoto.email || `${matchedPhoto.id}@xoanmedia.vn`,
          avatar: matchedPhoto.avatar,
          role: 'photographer',
          phone: matchedPhoto.phone
        };
        setCurrentUser(photoUser);
        setCurrentRoleState('photographer');
        setIsAuthenticated(true);
        setIsImpersonating(false);
        setActiveTab('calendar');
        try {
          localStorage.setItem('xoan_crm_auth_user', JSON.stringify({ user: photoUser, role: 'photographer' }));
        } catch (e) {
          console.error(e);
        }
        return { success: true };
      } else {
        return { success: false, message: 'Mật khẩu tài khoản Thợ Chụp không chính xác!' };
      }
    }

    return {
      success: false,
      message: 'Tài khoản không tồn tại trên hệ thống hoặc chưa được cấp quyền đăng nhập!'
    };
  };

  // Đăng nhập nhanh 1-Click phục vụ Demo / Testing
  const loginQuick = (role: 'admin' | 'sales' | 'photographer', staffId?: string) => {
    if (role === 'admin') {
      const adminUser = mockUsers[0];
      setCurrentUser(adminUser);
      setCurrentRoleState('admin');
      setIsAuthenticated(true);
      setIsImpersonating(false);
      setActiveTab('dashboard');
      try {
        localStorage.setItem('xoan_crm_auth_user', JSON.stringify({ user: adminUser, role: 'admin' }));
      } catch (e) {
        console.error(e);
      }
    } else if (role === 'sales') {
      const s = (staffId ? salesStaff.find(item => item.id === staffId) : null) || salesStaff[0];
      const salesUser: User = {
        id: s.id,
        name: s.name,
        email: s.email,
        avatar: s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'sales',
        phone: s.phone
      };
      setCurrentUser(salesUser);
      setCurrentRoleState('sales');
      setIsAuthenticated(true);
      setIsImpersonating(false);
      setActiveTab('pipeline');
      try {
        localStorage.setItem('xoan_crm_auth_user', JSON.stringify({ user: salesUser, role: 'sales' }));
      } catch (e) {
        console.error(e);
      }
    } else {
      const ph = (staffId ? photographers.find(item => item.id === staffId) : null) || photographers[0];
      const photoUser: User = {
        id: ph.id,
        name: ph.fullName,
        email: ph.email || `${ph.id}@xoanmedia.vn`,
        avatar: ph.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'photographer',
        phone: ph.phone
      };
      setCurrentUser(photoUser);
      setCurrentRoleState('photographer');
      setIsAuthenticated(true);
      setIsImpersonating(false);
      setActiveTab('photographers');
      try {
        localStorage.setItem('xoan_crm_auth_user', JSON.stringify({ user: photoUser, role: 'photographer' }));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Đăng xuất tài khoản
  const logout = () => {
    setIsAuthenticated(false);
    setIsImpersonating(false);
    try {
      localStorage.removeItem('xoan_crm_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Chuyển đổi role đồng bộ user mẫu tương ứng
  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    const matchedUser = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(matchedUser);
    setIsImpersonating(false);
  };

  // Đăng nhập với tư cách nhân sự (Sales hoặc Photographer)
  const loginAsStaff = (staff: { id: string; name: string; role: 'sales' | 'photographer'; avatar?: string; email?: string; phone?: string }) => {
    setCurrentRoleState(staff.role);
    setCurrentUser({
      id: staff.id,
      name: staff.name,
      email: staff.email || `${staff.id}@xoanmedia.vn`,
      avatar: staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: staff.role,
      phone: staff.phone
    });
    setIsImpersonating(true);
    if (staff.role === 'sales') {
      setActiveTab('pipeline');
    } else {
      setActiveTab('calendar');
    }
  };

  // Quay lại tài khoản quản trị Admin
  const returnToAdmin = () => {
    setCurrentRoleState('admin');
    setCurrentUser(mockUsers[0]);
    setIsImpersonating(false);
    setActiveTab('settings');
  };

  // Keyboard shortcut Cmd+K / Ctrl+K mở Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Customer handlers
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalRevenue' | 'paidAmount'>) => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      totalRevenue: customerData.expectedBudget || 0,
      paidAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    crmSupabaseService.saveCustomer(newCustomer).catch(() => {});

    // Thêm activity log
    addActivityLog({
      customerId: newId,
      type: 'lead_created',
      title: 'Tạo mới khách hàng',
      description: `Khách hàng ${customerData.name} (${customerData.className} - ${customerData.schoolName}) được thêm vào hệ thống.`,
      performedByName: currentUser.name
    });
  };

  const updateCustomerStage = (customerId: string, newStage: PipelineStage) => {
    const targetCustomer = customers.find(c => c.id === customerId);
    if (!targetCustomer) return;

    const prevStage = targetCustomer.pipelineStage;
    let newSalesName = targetCustomer.assignedSalesName;
    let newSalesId = targetCustomer.assignedSalesId;

    // Tự động gán nhân viên Sales tư vấn khi chuyển từ "New Lead" sang "Đã liên hệ" (hoặc nếu chuyển vào "Đã liên hệ" mà chưa có Sales)
    const isMovingToContacted =
      (prevStage === 'New Lead' || !newSalesName || newSalesName === 'Chưa gán') &&
      newStage === 'Đã liên hệ';

    if (isMovingToContacted) {
      if (currentUser.role === 'sales') {
        newSalesName = currentUser.name;
        newSalesId = currentUser.id;
      } else {
        const defaultSales = salesStaff.find(s => s.status === 'active') || salesStaff[0];
        newSalesName = (newSalesName && newSalesName !== 'Chưa gán') ? newSalesName : (defaultSales?.name || 'Lê Hoàng Sơn (Sales Lead)');
        newSalesId = newSalesId && newSalesId !== '' ? newSalesId : (defaultSales?.id || 'user-2');
      }
    }

    let updatedCustObj: Customer | null = null;
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          updatedCustObj = {
            ...c,
            pipelineStage: newStage,
            assignedSalesName: newSalesName || c.assignedSalesName,
            assignedSalesId: newSalesId || c.assignedSalesId,
            updatedAt: new Date().toISOString()
          };
          return updatedCustObj;
        }
        return c;
      })
    );
    if (updatedCustObj) {
      crmSupabaseService.saveCustomer(updatedCustObj).catch(() => {});
    }

    addActivityLog({
      customerId,
      type: isMovingToContacted ? 'call' : 'quote_sent',
      title: isMovingToContacted
        ? `Tự động gán Sales tư vấn: ${newSalesName}`
        : newStage === 'Lost'
          ? 'Khách hàng từ chối (Lost)'
          : `Chuyển giai đoạn: ${newStage}`,
      description: isMovingToContacted
        ? `Khách hàng ${targetCustomer.name} (${targetCustomer.className} - ${targetCustomer.schoolName}) được chuyển từ "${prevStage}" sang "Đã liên hệ". Hệ thống tự động gán nhân viên Sales "${newSalesName}" phụ trách tư vấn.`
        : newStage === 'Lost'
          ? `Lớp ${targetCustomer.className} (${targetCustomer.schoolName}) được chuyển sang trạng thái Lost (Khách từ chối / Dừng tư vấn).`
          : `Khách hàng ${targetCustomer.name} được chuyển từ "${prevStage}" sang "${newStage}".`,
      performedByName: currentUser.name
    });

    if (isMovingToContacted) {
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'new_lead',
        title: `🎯 ĐÃ GÁN SALES TƯ VẤN: ${newSalesName}`,
        message: `Lớp ${targetCustomer.className} (${targetCustomer.schoolName}) đã chuyển sang "Đã liên hệ". Phụ trách tư vấn: ${newSalesName}.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    } else if (newStage === 'Lost') {
      const lostNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'unassigned',
        title: '⚠️ KHÁCH HÀNG TỪ CHỐI (LOST)',
        message: `Lớp ${targetCustomer.className} (${targetCustomer.schoolName}) đã chuyển sang trạng thái Lost.`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [lostNotif, ...prev]);
    }
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    crmSupabaseService.saveCustomer(updated).catch(() => {});
  };

  // Booking handlers
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `bk-${Date.now()}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBookings(prev => [newBooking, ...prev]);

    // Thêm notification nếu chưa có thợ
    if (!bookingData.assignments.leadPhotographerId) {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'unassigned',
        title: '⚠️ ĐƠN BOOKING CHƯA CÓ THỢ',
        message: `Booking ${bookingData.code} (${bookingData.className} - ${bookingData.schoolName}) ngày ${bookingData.shootDate} chưa được gán Photographer.`,
        bookingId: newId,
        severity: 'warning',
        timestamp: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const updateBooking = (updated: Booking) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  // Kiểm tra tính sẵn sàng & xung đột lịch thợ
  const getPhotographerAvailability = (photographerId: string, date: string) => {
    const shootsOnDay = bookings.filter(
      b => b.shootDate === date && 
      (b.assignments.leadPhotographerId === photographerId || 
       b.assignments.assistantPhotographerIds?.includes(photographerId) ||
       b.assignments.videographerId === photographerId)
    );

    return {
      available: shootsOnDay.length === 0,
      conflictBookingCode: shootsOnDay.length > 0 ? shootsOnDay[0].code : undefined,
      totalShootsOnDay: shootsOnDay.length
    };
  };

  const assignPhotographerToBooking = (bookingId: string, photographerId: string, roleType: 'lead' | 'assistant' | 'videographer' | 'makeup') => {
    const targetPhotographer = photographers.find(p => p.id === photographerId);
    if (!targetPhotographer) return;

    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const updatedAssignments = { ...b.assignments };
          if (roleType === 'lead') {
            updatedAssignments.leadPhotographerId = photographerId;
            updatedAssignments.leadPhotographerName = targetPhotographer.fullName;
          } else if (roleType === 'videographer') {
            updatedAssignments.videographerId = photographerId;
            updatedAssignments.videographerName = targetPhotographer.fullName;
          } else if (roleType === 'makeup') {
            updatedAssignments.makeupStaffId = photographerId;
            updatedAssignments.makeupStaffName = targetPhotographer.fullName;
          } else if (roleType === 'assistant') {
            updatedAssignments.assistantPhotographerIds = [...(updatedAssignments.assistantPhotographerIds || []), photographerId];
            updatedAssignments.assistantNames = [...(updatedAssignments.assistantNames || []), targetPhotographer.fullName];
          }
          return { ...b, assignments: updatedAssignments, updatedAt: new Date().toISOString() };
        }
        return b;
      })
    );
  };

  const addPhotographer = (data: Omit<Photographer, 'id' | 'rating' | 'completedShootsCount'>) => {
    const newPhotographer: Photographer = {
      ...data,
      id: `photo-${Date.now()}`,
      rating: 5.0,
      completedShootsCount: 0
    };
    setPhotographers(prev => [newPhotographer, ...prev]);
  };

  const updatePhotographer = (updated: Photographer) => {
    setPhotographers(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deletePhotographer = (id: string) => {
    setPhotographers(prev => prev.filter(p => p.id !== id));
  };

  const updatePhotographerStatus = (id: string, status: Photographer['status']) => {
    setPhotographers(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  // Sales Staff Handlers
  const addSalesStaff = (data: Omit<SalesStaff, 'id'>) => {
    const newStaff: SalesStaff = {
      ...data,
      id: `sales-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSalesStaff(prev => [newStaff, ...prev]);

    addActivityLog({
      customerId: 'system',
      type: 'note',
      title: 'Thêm nhân sự Sales mới',
      description: `Nhân viên Sales ${data.name} (${data.roleTitle}) đã được thêm vào hệ thống.`,
      performedByName: currentUser.name
    });
  };

  const updateSalesStaff = (updated: SalesStaff) => {
    setSalesStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSalesStaff = (id: string) => {
    setSalesStaff(prev => prev.filter(s => s.id !== id));
  };

  const addClass = (newClass: SchoolClass) => {
    setClasses(prev => [newClass, ...prev]);
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
  };

  const addCampaign = (campData: Omit<RemarketingCampaign, 'id' | 'spent' | 'reach' | 'leadsGenerated'>) => {
    const newCamp: RemarketingCampaign = {
      ...campData,
      id: `camp-${Date.now()}`,
      spent: 0,
      reach: 0,
      leadsGenerated: 0
    };
    setCampaigns(prev => [newCamp, ...prev]);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const addActivityLog = (logData: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    const newLog: ActivityLog = {
      ...logData,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addFeedback = (feedbackData: Omit<ClassFeedback, 'id' | 'createdAt'>) => {
    const newFeedback: ClassFeedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setFeedbacks(prev => [newFeedback, ...prev]);

    // Thêm activity log cho khách hàng
    addActivityLog({
      customerId: feedbackData.customerId,
      type: 'note',
      title: `⭐ Nhận Feedback ${feedbackData.rating}/5 Sao Từ Lớp`,
      description: `"${feedbackData.comment}" (Kênh: ${feedbackData.channel})`,
      performedByName: feedbackData.customerName
    });
  };

  const updateFeedbackStatus = (id: string, status: ClassFeedback['status']) => {
    setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, status } : fb));
  };

  const addMoment = (momentData: Omit<ClassMoment, 'id'>) => {
    const newMoment: ClassMoment = {
      ...momentData,
      id: `moment-${Date.now()}`
    };
    setMoments(prev => [newMoment, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        isAuthenticated,
        login,
        loginQuick,
        logout,
        isImpersonating,
        loginAsStaff,
        returnToAdmin,
        customers,
        selectedCustomerId,
        setSelectedCustomerId,
        addCustomer,
        updateCustomerStage,
        updateCustomer,
        bookings,
        selectedBookingId,
        setSelectedBookingId,
        addBooking,
        updateBooking,
        assignPhotographerToBooking,
        photographers,
        addPhotographer,
        updatePhotographer,
        deletePhotographer,
        updatePhotographerStatus,
        getPhotographerAvailability,
        salesStaff,
        addSalesStaff,
        updateSalesStaff,
        deleteSalesStaff,
        schools,
        classes,
        addClass,
        servicePackages,
        segments,
        campaigns,
        workflows,
        toggleWorkflow,
        addCampaign,
        tasks,
        addTask,
        toggleTaskStatus,
        feedbacks,
        addFeedback,
        updateFeedbackStatus,
        moments,
        addMoment,
        activityLogs,
        addActivityLog,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isSearchOpen,
        setIsSearchOpen,
        dateFilter,
        setDateFilter
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
