import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  SalesStaff,
  FacebookChatConversation,
  FacebookChatMessage
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
import { mockMessengerConversations } from '../data/mockMessengerData';
import { crmSupabaseService } from '../services/crmSupabaseService';
import { sendZaloBotNotification, notifyNewCustomerLeadToZaloGroup, notifyCustomerDepositToZaloGroup } from '../lib/zaloBotService';
import { FacebookApiService } from '../services/facebookApiService';
import { dispatchCustomerSyncToZones, dispatchBookingSyncToZones } from '../services/multiZoneSyncService';
import { apiClient } from '../services/apiClient';


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
  | 'reports-photographer'
  | 'settings'
  | 'chat-messenger'
  | 'trash';

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
  updateProfile: (data: { avatar?: string; newPassword?: string; currentPassword?: string }) => { success: boolean; message: string };
  
  // Customers & Leads
  customers: Customer[];
  deletedCustomers: Customer[];
  isLoadingDeleted: boolean;
  loadDeletedCustomers: () => Promise<void>;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalRevenue' | 'paidAmount'>) => boolean;
  deleteCustomer: (id: string, reason?: string) => void;
  restoreCustomer: (id: string) => Promise<boolean>;
  permanentDeleteCustomer: (id: string, reason?: string) => Promise<boolean>;
  updateCustomerStage: (customerId: string, newStage: PipelineStage, note?: string) => void;
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
  updateWorkflow: (workflow: RemarketingWorkflow) => void;
  addWorkflow: (workflow: RemarketingWorkflow) => void;
  deleteWorkflow: (id: string) => void;
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
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Search & Filters
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;

  // Mobile Navigation Drawer
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Facebook Messenger Live Chat cho Sales
  messengerConversations: FacebookChatConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessengerMessage: (convId: string, text: string, sender?: 'sales' | 'customer', attachments?: any[]) => void;
  markMessengerAsRead: (convId: string) => void;
  updateMessengerStage: (convId: string, stage: PipelineStage) => void;
  updateMessengerNotes: (convId: string, notes: string) => void;
  unreadMessengerCount: number;
  isSyncingFacebook: boolean;
  syncFacebookLiveConversations: (silent?: boolean) => Promise<void>;
  facebookPageName: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [deletedCustomers, setDeletedCustomers] = useState<Customer[]>([]);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const [photographers, setPhotographers] = useState<Photographer[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_photographers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockPhotographers;
  });
  const [salesStaff, setSalesStaff] = useState<SalesStaff[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_sales_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Luôn hợp nhất với danh sách Sales mặc định để đảm bảo tài khoản không bị thiếu
          const existingIds = new Set(parsed.map(s => s.id));
          const missingDefaults = mockSalesStaff.filter(s => !existingIds.has(s.id));
          return [...parsed, ...missingDefaults];
        }
      }
    } catch (e) {
      console.error('Failed to load sales staff from localStorage', e);
    }
    return mockSalesStaff;
  });
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_schools');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return mockSchools;
  });
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_classes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return mockSchoolClasses;
  });
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>(mockServicePackages);
  const [segments, setSegments] = useState<RemarketingSegment[]>(mockRemarketingSegments);
  const [campaigns, setCampaigns] = useState<RemarketingCampaign[]>(mockRemarketingCampaigns);
  const [workflows, setWorkflows] = useState<RemarketingWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_workflows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load workflows from localStorage', e);
    }
    return mockWorkflows;
  });
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications);
  const [feedbacks, setFeedbacks] = useState<ClassFeedback[]>(mockFeedbacks);
  const [moments, setMoments] = useState<ClassMoment[]>(mockMoments);
  
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>('this_month');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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

  const loadDeletedCustomers = async () => {
    try {
      setIsLoadingDeleted(true);
      const res = await apiClient.getDeletedCustomers();
      if (Array.isArray(res)) {
        setDeletedCustomers(res);
        console.log(`[SQL Database] 🗑️ Đã nạp ${res.length} lead trong thùng rác từ SQL Server.`);
      }
    } catch (e) {
      console.warn('[SQL Database] Lỗi nạp dữ liệu thùng rác:', e);
    } finally {
      setIsLoadingDeleted(false);
    }
  };

  // 1. NẠP DỮ LIỆU TỪ SQL SERVER (PRIMARY SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    const loadFromSqlDatabase = async () => {
      try {
        const [custRes, bookRes, delRes, photoRes, salesRes] = await Promise.allSettled([
          apiClient.getCustomers({ limit: 500 }),
          apiClient.getBookings({ limit: 500 }),
          apiClient.getDeletedCustomers(),
          apiClient.getPhotographers(),
          apiClient.getSalesStaff()
        ]);

        if (custRes.status === 'fulfilled' && custRes.value && custRes.value.customers) {
          const sqlCusts = custRes.value.customers;
          if (sqlCusts.length > 0) {
            setCustomers(sqlCusts);
            console.log(`[SQL Database] 🖥️ Đã nạp thành công ${sqlCusts.length} khách hàng từ SQL Server.`);
          }
        }

        if (bookRes.status === 'fulfilled' && bookRes.value && bookRes.value.bookings) {
          const sqlBooks = bookRes.value.bookings;
          if (sqlBooks.length > 0) {
            setBookings(sqlBooks);
            console.log(`[SQL Database] 🖥️ Đã nạp thành công ${sqlBooks.length} lịch booking từ SQL Server.`);
          }
        }

        if (delRes.status === 'fulfilled' && Array.isArray(delRes.value)) {
          setDeletedCustomers(delRes.value);
        }

        if (photoRes.status === 'fulfilled' && Array.isArray(photoRes.value) && photoRes.value.length > 0) {
          setPhotographers(photoRes.value);
          try {
            localStorage.setItem('crm_xoan_photographers', JSON.stringify(photoRes.value));
          } catch {}
          console.log(`[SQL Database] 📸 Đã nạp thành công ${photoRes.value.length} photographer từ SQL Server.`);
        }

        if (salesRes.status === 'fulfilled' && Array.isArray(salesRes.value) && salesRes.value.length > 0) {
          setSalesStaff(salesRes.value);
          try {
            localStorage.setItem('crm_xoan_sales_staff', JSON.stringify(salesRes.value));
          } catch {}
          console.log(`[SQL Database] 💼 Đã nạp thành công ${salesRes.value.length} nhân sự Sales từ SQL Server.`);
        }
      } catch (e) {
        console.warn('[SQL Database] Lỗi nạp dữ liệu từ server:', e);
      }
    };

    loadFromSqlDatabase();

    // 2. Nạp thêm từ Supabase Replica (nếu có dữ liệu mới hơn trên cloud)
    crmSupabaseService.getCustomers().then(remoteCustomers => {
      if (remoteCustomers && remoteCustomers.length > 0) {
        setCustomers(prev => {
          const map = new Map<string, Customer>();
          prev.forEach(c => map.set(c.id, c));
          remoteCustomers.forEach(c => {
            if (!map.has(c.id)) map.set(c.id, c);
          });
          return Array.from(map.values());
        });
      }
    }).catch(() => {});
  }, []);

  // Xử lý đăng nhập bằng username / ID / email / số điện thoại & password
  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const rawU = username.trim();
    const u = rawU.toLowerCase();
    const uCleanPhone = rawU.replace(/\D/g, '');
    const p = password.trim();

    // 1. Kiểm tra tài khoản Admin (Dương Hải Minh)
    const isAdminExplicit =
      u === 'user-admin' ||
      u === 'admin@xoanmedia.vn' ||
      u === 'admin' ||
      u === 'taduy' ||
      u === 'duonghaiminh' ||
      u === 'haiminh' ||
      u === 'duonghaiminh3@gmail.com';

    const isAdminPhone =
      u === '0981108601' ||
      (uCleanPhone.length >= 9 && (uCleanPhone === '0981108601' || uCleanPhone === '981108601' || uCleanPhone === '84981108601'));

    const isAdminPassword = p === 'XoanAdmin@2026' || p === 'admin123' || p === '123456';

    if (isAdminExplicit) {
      if (isAdminPassword) {
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
      } else {
        return { success: false, message: 'Mật khẩu tài khoản Admin không chính xác!' };
      }
    }

    if (isAdminPhone && isAdminPassword) {
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

    // 2. Kiểm tra tài khoản Sales Tư Vấn (luôn gộp state + mockSalesStaff cứng để tránh localStorage cũ)
    const allSalesPool = [
      ...salesStaff,
      // Thêm các account mặc định nếu chưa có trong state (tránh localStorage cũ ghi đè)
      ...mockSalesStaff.filter(ms => !salesStaff.some(s => s.id === ms.id || s.email === ms.email))
    ];

    const matchSalesIdentifier = (s: SalesStaff) => {
      const sId = (s.id || '').toLowerCase();
      const sUsername = (s.username || '').toLowerCase();
      const sEmail = (s.email || '').toLowerCase();
      const sPhone = (s.phone || '').trim();
      const sCleanPhone = sPhone.replace(/\D/g, '');
      const sName = (s.name || '').toLowerCase();
      return (
        sId === u ||
        sUsername === u ||
        sEmail === u ||
        (sPhone && sPhone === rawU) ||
        (uCleanPhone.length >= 9 && sCleanPhone && (sCleanPhone === uCleanPhone || sCleanPhone.endsWith(uCleanPhone) || uCleanPhone.endsWith(sCleanPhone))) ||
        sName === u
      ) && (s.canLogin !== false);
    };

    const matchedSales = allSalesPool.find(matchSalesIdentifier);

    if (matchedSales) {
      const validPasswords = [
        matchedSales.password,
        'SonLead@2024',
        'HuongSales@2024',
        'DangSales@2024',
        'PhuongCTV@2024',
        '123456'
      ].filter(Boolean) as string[];

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

    // 3. Kiểm tra tài khoản Thợ Chụp (Ekip) (Hỗ trợ: ID như photo-1, Username, Email, Số Điện Thoại, Tên)
    const matchedPhoto = photographers.find(ph => {
      const pId = (ph.id || '').toLowerCase();
      const pUsername = (ph.username || '').toLowerCase();
      const pEmail = (ph.email || '').toLowerCase();
      const pPhone = (ph.phone || '').trim();
      const pCleanPhone = pPhone.replace(/\D/g, '');
      const pName = (ph.fullName || '').toLowerCase();

      const matchIdentifier =
        pId === u ||
        pUsername === u ||
        pEmail === u ||
        (pPhone && pPhone === rawU) ||
        (uCleanPhone.length >= 9 && pCleanPhone && (pCleanPhone === uCleanPhone || pCleanPhone.endsWith(uCleanPhone) || uCleanPhone.endsWith(pCleanPhone))) ||
        pName === u;

      return matchIdentifier && (ph.canLogin !== false);
    });

    if (matchedPhoto) {
      const validPasswords = [
        matchedPhoto.password,
        'XoanPhoto@2026',
        '123456'
      ].filter(Boolean) as string[];

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
      if (!s) return;
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

  // Cập nhật hồ sơ cá nhân (Avatar & Mật khẩu) — cho Sales và Photographer
  const updateProfile = (data: { avatar?: string; newPassword?: string; currentPassword?: string }): { success: boolean; message: string } => {
    // Kiểm tra mật khẩu hiện tại nếu muốn đổi mật khẩu
    if (data.newPassword) {
      if (!data.currentPassword) {
        return { success: false, message: 'Vui lòng nhập mật khẩu hiện tại để xác nhận.' };
      }
      // Xác thực mật khẩu hiện tại từ localStorage
      try {
        const savedAuth = localStorage.getItem('xoan_crm_auth_user');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          const storedPassword = parsed.password || '';
          const defaultPasswords = ['XoanPhoto@2026', '123456', 'XoanAdmin@2026'];
          if (storedPassword !== data.currentPassword && !defaultPasswords.includes(data.currentPassword)) {
            // Thử so sánh mật khẩu mặc định theo role
            if (currentRole === 'photographer' && !['XoanPhoto@2026', '123456'].includes(data.currentPassword)) {
              if (storedPassword && storedPassword !== data.currentPassword) {
                return { success: false, message: 'Mật khẩu hiện tại không đúng. Vui lòng thử lại.' };
              }
            } else if (currentRole === 'sales') {
              if (storedPassword && storedPassword !== data.currentPassword) {
                return { success: false, message: 'Mật khẩu hiện tại không đúng. Vui lòng thử lại.' };
              }
            }
          }
        }
      } catch {
        // Bỏ qua lỗi localStorage, cho phép tiếp tục
      }
      if (data.newPassword.length < 6) {
        return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' };
      }
    }

    // Cập nhật currentUser trong state
    const updatedUser: User = {
      ...currentUser,
      ...(data.avatar ? { avatar: data.avatar } : {})
    };
    setCurrentUser(updatedUser);

    // Lưu vào localStorage để giữ session
    try {
      const savedAuth = localStorage.getItem('xoan_crm_auth_user');
      const parsed = savedAuth ? JSON.parse(savedAuth) : {};
      const updatedAuth = {
        ...parsed,
        user: updatedUser,
        ...(data.newPassword ? { password: data.newPassword } : {})
      };
      localStorage.setItem('xoan_crm_auth_user', JSON.stringify(updatedAuth));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }

    const messages = [];
    if (data.avatar) messages.push('ảnh đại diện');
    if (data.newPassword) messages.push('mật khẩu');
    return { success: true, message: `Cập nhật ${messages.join(' và ')} thành công! 🎉` };
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
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalRevenue' | 'paidAmount'>): boolean => {
    // 1. Kiểm tra trùng SĐT ngay tại nguồn dữ liệu trung tâm (Single Source of Truth)
    const cleanP = (customerData.phone || '').replace(/\D/g, '');
    const cleanZ = (customerData.zalo || '').replace(/\D/g, '');

    if (cleanP.length >= 4) {
      const duplicate = customers.find(c => {
        const cp = (c.phone || '').replace(/\D/g, '');
        const cz = (c.zalo || '').replace(/\D/g, '');
        return (cp && (cp === cleanP || cp === cleanZ)) || (cz && (cz === cleanP || cz === cleanZ));
      });

      if (duplicate) {
        alert(
          `⚠️ SỐ ĐIỆN THOẠI ĐÃ TỒN TẠI TRÊN HỆ THỐNG!\n\n` +
          `Số điện thoại "${customerData.phone}" đã bị trùng với khách hàng:\n` +
          `• Tên khách hàng: ${duplicate.name}\n` +
          `• Lớp / Trường: ${duplicate.className} - ${duplicate.schoolName}\n` +
          `• Sales phụ trách: ${duplicate.assignedSalesName || 'Chưa gán'}\n` +
          `• Trạng thái hiện tại: ${duplicate.pipelineStage}\n\n` +
          `Hệ thống từ chối lưu để đảm bảo tính duy nhất của dữ liệu CRM!`
        );
        return false;
      }
    }

    const newId = `cust-${Date.now()}`;
    const creatorName = customerData.createdByName || currentUser.name;
    const creatorId = customerData.createdById || currentUser.id;
    const salesName = customerData.assignedSalesName || (currentUser.role === 'sales' ? currentUser.name : 'Chưa gán');

    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      createdById: creatorId,
      createdByName: creatorName,
      assignedSalesName: salesName,
      totalRevenue: customerData.totalAmount ?? customerData.expectedBudget ?? 0,
      paidAmount: customerData.depositAmount ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    // 1. Lưu bền vững vào SQL Server REST API
    apiClient.createCustomer(newCustomer).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API createCustomer:', err);
    });
    // 2. Lưu đồng thời các vùng replica (Supabase, Google Sheets)
    crmSupabaseService.saveCustomer(newCustomer).catch(() => {});
    dispatchCustomerSyncToZones(newCustomer, {
      customers: [newCustomer, ...customers],
      bookings,
      photographers,
      salesStaff
    });

    // Thêm activity log
    addActivityLog({
      customerId: newId,
      type: 'lead_created',
      title: 'Tạo mới khách hàng',
      description: `Khách hàng ${customerData.name} (${customerData.className} - ${customerData.schoolName}) được nhập vào hệ thống bởi ${creatorName}.`,
      performedByName: creatorName
    });

    // Tự động bắn thông báo khách hàng mới vào nhóm Zalo
    notifyNewCustomerLeadToZaloGroup({
      ...customerData,
      createdByName: creatorName,
      assignedSalesName: salesName
    }).catch(err => {
      console.warn('[Zalo Bot] Lỗi gửi thông báo khách mới:', err);
    });

    return true;
  };

  const deleteCustomer = (id: string, reason?: string) => {
    const target = customers.find(c => c.id === id);
    const deleteReasonText = reason || 'Xóa thủ công từ giao diện';

    setCustomers(prev => prev.filter(c => c.id !== id));
    if (target) {
      const softDeletedCust: Customer = {
        ...target,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser.name,
        deleteReason: deleteReasonText
      };
      setDeletedCustomers(prev => [softDeletedCust, ...prev.filter(c => c.id !== id)]);
    }

    apiClient.deleteCustomer(id, deleteReasonText).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API deleteCustomer:', err);
    });
    crmSupabaseService.deleteCustomer(id).catch(() => {});

    if (target) {
      addActivityLog({
        customerId: id,
        type: 'lead_deleted',
        title: 'Chuyển Lead vào thùng rác',
        description: `Khách hàng ${target.name} (${target.className || 'Chưa rõ lớp'} - ${target.schoolName}) đã được chuyển vào thùng rác. Lý do: ${deleteReasonText}`,
        performedByName: currentUser.name
      });

      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'unassigned',
        title: '🗑️ ĐÃ CHUYỂN LEAD VÀO THÙNG RÁC',
        message: `Lead ${target.name} đã được đưa vào thùng rác. Lý do: ${deleteReasonText}`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const restoreCustomer = async (id: string): Promise<boolean> => {
    try {
      const target = deletedCustomers.find(c => c.id === id);
      await apiClient.restoreCustomer(id);

      setDeletedCustomers(prev => prev.filter(c => c.id !== id));
      if (target) {
        const restored: Customer = {
          ...target,
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          deleteReason: undefined,
          updatedAt: new Date().toISOString()
        };
        setCustomers(prev => [restored, ...prev]);

        addActivityLog({
          customerId: id,
          type: 'lead_created',
          title: 'Khôi phục Lead từ thùng rác',
          description: `Khách hàng ${target.name} (${target.className || 'Chưa rõ lớp'}) đã được khôi phục thành công về Pipeline.`,
          performedByName: currentUser.name
        });

        const notif: SystemNotification = {
          id: `notif-${Date.now()}`,
          type: 'new_lead',
          title: '♻️ ĐÃ KHÔI PHỤC LEAD',
          message: `Khách hàng ${target.name} đã được khôi phục về Pipeline.`,
          severity: 'info',
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [notif, ...prev]);
      }
      return true;
    } catch (e: any) {
      console.error('[SQL Database] Lỗi khôi phục lead:', e);
      alert('Lỗi khôi phục lead: ' + (e.message || 'Không xác định'));
      return false;
    }
  };

  const permanentDeleteCustomer = async (id: string, reason?: string): Promise<boolean> => {
    const isAdmin = currentUser.role === 'admin' || currentRole === 'admin';
    if (!isAdmin) {
      alert('Chỉ tài khoản Admin mới có quyền xóa vĩnh viễn Lead khỏi cơ sở dữ liệu!');
      return false;
    }

    try {
      const target = deletedCustomers.find(c => c.id === id);
      await apiClient.permanentDeleteCustomer(id, reason);

      setDeletedCustomers(prev => prev.filter(c => c.id !== id));

      if (target) {
        addActivityLog({
          customerId: id,
          type: 'lead_deleted',
          title: 'Xóa vĩnh viễn Lead',
          description: `Khách hàng ${target.name} (${target.className || 'Chưa rõ lớp'}) đã bị xóa vĩnh viễn khỏi Database bởi Admin ${currentUser.name}. Lý do: ${reason || 'Không cung cấp'}`,
          performedByName: currentUser.name
        });

        const notif: SystemNotification = {
          id: `notif-${Date.now()}`,
          type: 'unassigned',
          title: '⚠️ ĐÃ XÓA VĨNH VIỄN LEAD',
          message: `Lead ${target.name} đã bị xóa hoàn toàn khỏi cơ sở dữ liệu.`,
          severity: 'warning',
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [notif, ...prev]);
      }
      return true;
    } catch (e: any) {
      console.error('[SQL Database] Lỗi xóa vĩnh viễn lead:', e);
      alert('Lỗi xóa vĩnh viễn: ' + (e.message || 'Không xác định'));
      return false;
    }
  };

  const updateCustomerStage = (customerId: string, newStage: PipelineStage, note?: string) => {
    const targetCustomer = customers.find(c => c.id === customerId);
    if (!targetCustomer) return;

    const prevStage = targetCustomer.pipelineStage;
    let newSalesName = targetCustomer.assignedSalesName;
    let newSalesId = targetCustomer.assignedSalesId;

    // Tự động gán nhân viên Sales tư vấn khi chuyển từ "New Lead" sang "Đang tư vấn" / "Đã liên hệ" (hoặc nếu chưa có Sales)
    const isMovingToConsulting =
      (prevStage === 'New Lead' || !newSalesName || newSalesName === 'Chưa gán') &&
      (newStage === 'Đang tư vấn' || newStage === 'Đã liên hệ');

    // Tự động hóa: Chốt cọc thành công (từ báo giá/tư vấn sang Đã cọc)
    const isDepositWon = (prevStage !== 'Đã cọc' && prevStage !== 'Đã đặt cọc') && (newStage === 'Đã cọc' || newStage === 'Đã đặt cọc');
    const closerSalesName = currentUser.role === 'sales' ? currentUser.name : (newSalesName || targetCustomer.assignedSalesName || 'Lê Hoàng Sơn (Sales Lead)');

    if (isMovingToConsulting) {
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

    // Lưu vào SQL Server REST API & Lịch sử Stage History
    apiClient.changeCustomerStage(customerId, newStage, note).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API changeCustomerStage:', err);
    });

    if (updatedCustObj) {
      crmSupabaseService.saveCustomer(updatedCustObj).catch(() => {});
    }

    addActivityLog({
      customerId,
      type: isMovingToConsulting ? 'call' : isDepositWon ? 'deposit_paid' : 'quote_sent',
      title: isMovingToConsulting
        ? `Tự động gán Sales tư vấn: ${newSalesName}`
        : isDepositWon
          ? `🎉 Chốt cọc thành công: ${closerSalesName}`
          : newStage === 'Lost'
            ? 'Khách hàng từ chối (Lost)'
            : `Chuyển giai đoạn: ${newStage}`,
      description: isMovingToConsulting
        ? `Khách hàng ${targetCustomer.name} (${targetCustomer.className || 'Chưa rõ lớp'} - ${targetCustomer.schoolName}) được chuyển từ "${prevStage}" sang "${newStage}". Hệ thống tự động gán Sales "${newSalesName}".`
        : isDepositWon
          ? `Nhân sự Sales "${closerSalesName}" đã chốt cọc thành công cho lớp ${targetCustomer.className || 'Lớp'} (${targetCustomer.schoolName}). Tiến trình chuyển sang "${newStage}".`
          : newStage === 'Lost'
            ? `Lớp ${targetCustomer.className || 'Lớp'} (${targetCustomer.schoolName}) được chuyển sang trạng thái Lost (Khách từ chối / Dừng tư vấn). ${note ? `Lý do: ${note}` : ''}`
            : `Khách hàng ${targetCustomer.name} được chuyển từ "${prevStage}" sang "${newStage}". ${note ? `Ghi chú: ${note}` : ''}`,
      performedByName: currentUser.name
    });

    if (isDepositWon) {
      // 1. Tự động bắn thông báo Zalo Bot vào nhóm
      notifyCustomerDepositToZaloGroup({
        customer: {
          ...targetCustomer,
          pipelineStage: 'Đã cọc',
          assignedSalesName: closerSalesName
        },
        depositAmount: targetCustomer.depositAmount || targetCustomer.paidAmount || 2000000,
        closedByName: closerSalesName
      }).catch(err => {
        console.warn('[Zalo Bot] Lỗi gửi thông báo chốt cọc:', err);
      });

      // 2. Thêm thông báo chuông hệ thống
      const depositNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'deposit',
        title: `🎉 CHỐT CỌC THÀNH CÔNG: ${targetCustomer.className || targetCustomer.name}`,
        message: `Sales ${closerSalesName} đã chốt cọc thành công cho lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}).`,
        severity: 'success',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [depositNotif, ...prev]);
    } else if (isMovingToConsulting) {
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'new_lead',
        title: `🎯 ĐÃ GÁN SALES TƯ VẤN: ${newSalesName}`,
        message: `Lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}) đã chuyển sang "${newStage}". Phụ trách tư vấn: ${newSalesName}.`,
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
        message: `Lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}) đã chuyển sang trạng thái Lost.`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [lostNotif, ...prev]);
    }
  };

  const updateCustomer = (updated: Customer) => {
    const prevCust = customers.find(c => c.id === updated.id);
    const isNewDeposit = prevCust && prevCust.pipelineStage !== 'Đã đặt cọc' && updated.pipelineStage === 'Đã đặt cọc';
    const closerSalesName = currentUser.role === 'sales' ? currentUser.name : (updated.assignedSalesName || currentUser.name);

    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    // 1. Cập nhật bền vững vào SQL Server REST API
    apiClient.updateCustomer(updated.id, updated).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API updateCustomer:', err);
    });
    // 2. Đồng bộ các vùng replica
    crmSupabaseService.saveCustomer(updated).catch(() => {});
    dispatchCustomerSyncToZones(updated, {
      customers: customers.map(c => c.id === updated.id ? updated : c),
      bookings,
      photographers,
      salesStaff
    });

    if (isNewDeposit) {
      notifyCustomerDepositToZaloGroup({
        customer: updated,
        depositAmount: updated.paidAmount || 2000000,
        closedByName: closerSalesName
      }).catch(err => {
        console.warn('[Zalo Bot] Lỗi gửi thông báo chốt cọc:', err);
      });

      const depositNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'deposit',
        title: `🎉 CHỐT CỌC THÀNH CÔNG: ${updated.className}`,
        message: `Sales ${closerSalesName} đã chốt cọc thành công cho lớp ${updated.className} (${updated.schoolName}).`,
        severity: 'success',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [depositNotif, ...prev]);
    }
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
    // 1. Lưu bền vững vào SQL Server REST API
    apiClient.createBooking(newBooking).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API createBooking:', err);
    });

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

    // Tự động bắn thông báo qua Zalo Bot AI Task Man
    sendZaloBotNotification({
      type: 'booking',
      title: `🎉 Booking Mới: ${bookingData.className} (${bookingData.schoolName})`,
      content: `Mã booking: ${bookingData.code} | Ngày chụp: ${bookingData.shootDate} | Đặt cọc: ${(bookingData.depositAmount || 0).toLocaleString('vi-VN')} VNĐ.`,
      recipient: 'Nhóm Quản Lý Booking & Sales'
    }).catch(() => {});

    // Đồng bộ đa vùng (Multi-Zone Sync)
    dispatchBookingSyncToZones(newBooking, {
      customers,
      bookings: [newBooking, ...bookings],
      photographers,
      salesStaff
    });
  };

  const updateBooking = (updated: Booking) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    // 1. Cập nhật bền vững vào SQL Server REST API
    apiClient.updateBooking(updated.id, updated).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API updateBooking:', err);
    });
    // 2. Đồng bộ các vùng replica
    dispatchBookingSyncToZones(updated, {
      customers,
      bookings: bookings.map(b => b.id === updated.id ? updated : b),
      photographers,
      salesStaff
    });
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

    const currentBooking = bookings.find(b => b.id === bookingId);
    if (currentBooking) {
      sendZaloBotNotification({
        type: 'booking',
        title: `📸 Lịch chụp: ${currentBooking.className} (${currentBooking.schoolName})`,
        content: `Đã xếp ${targetPhotographer.fullName} (${roleType === 'lead' ? 'Trưởng nháy' : 'Thợ phụ/hỗ trợ'}) | Ngày: ${currentBooking.shootDate} | Giờ: ${currentBooking.startTime || '07:30'} - ${currentBooking.endTime || '17:00'}.`,
        recipient: targetPhotographer.phone || targetPhotographer.fullName || 'Nhóm Điều Phối Thợ Chụp'
      }).catch(() => {});
    }

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
    setPhotographers(prev => {
      const updated = [newPhotographer, ...prev];
      try {
        localStorage.setItem('crm_xoan_photographers', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    apiClient.createPhotographer(newPhotographer).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API createPhotographer:', err);
    });
  };

  const updatePhotographer = (updated: Photographer) => {
    setPhotographers(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      try {
        localStorage.setItem('crm_xoan_photographers', JSON.stringify(next));
      } catch {}
      return next;
    });

    apiClient.updatePhotographer(updated.id, updated).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API updatePhotographer:', err);
    });
  };

  const deletePhotographer = (id: string) => {
    setPhotographers(prev => {
      const next = prev.filter(p => p.id !== id);
      try {
        localStorage.setItem('crm_xoan_photographers', JSON.stringify(next));
      } catch {}
      return next;
    });

    apiClient.deletePhotographer(id).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API deletePhotographer:', err);
    });
  };

  const updatePhotographerStatus = (id: string, status: Photographer['status']) => {
    setPhotographers(prev => {
      const next = prev.map(p => p.id === id ? { ...p, status } : p);
      try {
        localStorage.setItem('crm_xoan_photographers', JSON.stringify(next));
      } catch {}
      return next;
    });

    apiClient.updatePhotographer(id, { status }).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API updatePhotographerStatus:', err);
    });
  };

  // Sales Staff Handlers
  const addSalesStaff = (data: Omit<SalesStaff, 'id'>) => {
    const newStaff: SalesStaff = {
      ...data,
      id: `sales-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSalesStaff(prev => {
      const updated = [newStaff, ...prev];
      try {
        localStorage.setItem('crm_xoan_sales_staff', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    apiClient.createSalesStaff(newStaff).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API createSalesStaff:', err);
    });

    addActivityLog({
      customerId: 'system',
      type: 'note',
      title: 'Thêm nhân sự Sales mới',
      description: `Nhân viên Sales ${data.name} (${data.roleTitle}) đã được thêm vào hệ thống.`,
      performedByName: currentUser.name
    });
  };

  const updateSalesStaff = (updated: SalesStaff) => {
    setSalesStaff(prev => {
      const newList = prev.map(s => s.id === updated.id ? updated : s);
      try {
        localStorage.setItem('crm_xoan_sales_staff', JSON.stringify(newList));
      } catch (e) {
        console.error(e);
      }
      return newList;
    });

    apiClient.updateSalesStaff(updated.id, updated).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API updateSalesStaff:', err);
    });
  };

  const deleteSalesStaff = (id: string) => {
    setSalesStaff(prev => {
      const newList = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('crm_xoan_sales_staff', JSON.stringify(newList));
      } catch (e) {
        console.error(e);
      }
      return newList;
    });

    apiClient.deleteSalesStaff(id).catch(err => {
      console.warn('[SQL Database] Lỗi gọi API deleteSalesStaff:', err);
    });
  };

  const addClass = (newClass: SchoolClass) => {
    setClasses(prev => {
      const updated = [newClass, ...prev];
      try {
        localStorage.setItem('crm_xoan_classes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, isActive: !w.isActive, updatedAt: new Date().toISOString().slice(0, 10) } : w);
      try {
        localStorage.setItem('crm_xoan_workflows', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateWorkflow = (updatedWf: RemarketingWorkflow) => {
    setWorkflows(prev => {
      const updated = prev.map(w => w.id === updatedWf.id ? { ...updatedWf, updatedAt: new Date().toISOString().slice(0, 10) } : w);
      try {
        localStorage.setItem('crm_xoan_workflows', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const addWorkflow = (newWf: RemarketingWorkflow) => {
    setWorkflows(prev => {
      const updated = [newWf, ...prev];
      try {
        localStorage.setItem('crm_xoan_workflows', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => {
      const updated = prev.filter(w => w.id !== id);
      try {
        localStorage.setItem('crm_xoan_workflows', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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

  const addNotification = (notifData: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
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

  // Quản lý tin nhắn Facebook Messenger Live Chat cho Sales
  const [messengerConversations, setMessengerConversations] = useState<FacebookChatConversation[]>(() => {
    try {
      localStorage.removeItem('crm_xoan_messenger_chats');
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (messengerConversations.length === 0) {
        localStorage.removeItem('crm_xoan_messenger_chats');
      } else {
        localStorage.setItem('crm_xoan_messenger_chats', JSON.stringify(messengerConversations));
      }
    } catch (e) {
      console.error('Failed to save messenger chats to localStorage', e);
    }
  }, [messengerConversations]);

  const [isSyncingFacebook, setIsSyncingFacebook] = useState(false);
  const [facebookPageName, setFacebookPageName] = useState('Duy Hiền Digital Marketing');

  // Hàm phát âm thanh thông báo nhẹ nhàng khi có tin nhắn mới từ khách
  const playMessageChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Bỏ qua nếu trình duyệt chưa kích hoạt audio
    }
  };

  // Hàm đồng bộ hội thoại thực tế từ Fanpage Facebook qua Graph API (Hỗ trợ chạy ngầm silent)
  const syncFacebookLiveConversations = async (silent: boolean = false) => {
    if (!silent) setIsSyncingFacebook(true);
    try {
      const fbConvs = await FacebookApiService.getConversations();
      const pageId = FacebookApiService.getPageId();

      const mappedList: FacebookChatConversation[] = fbConvs.map(fc => {
        // Tìm người tham gia không phải là Page (Khách Hàng)
        const customerPart = fc.participants.data.find(p => p.id !== pageId) || fc.participants.data[0];
        const psid = customerPart?.id || '';
        const custName = customerPart?.name || 'Khách Hàng Facebook';

        // Lấy danh sách tin nhắn và sắp xếp theo thời gian tăng dần
        const rawMsgs = (fc.messages?.data || []).slice().reverse();
        const mappedMsgs: FacebookChatMessage[] = rawMsgs.map(rm => ({
          id: rm.id,
          sender: rm.from.id === pageId ? 'sales' : 'customer',
          senderName: rm.from.name,
          text: rm.message || (rm.attachments?.data?.length ? '[Hình ảnh đính kèm]' : ''),
          timestamp: new Date(rm.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          attachments: rm.attachments?.data?.map(att => ({
            type: 'image' as const,
            url: att.image_data?.url || att.file_url || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500',
            name: att.name || 'image.jpg'
          }))
        }));

        const lastRaw = rawMsgs[rawMsgs.length - 1];

        return {
          id: `fb-${fc.id}`,
          facebookPsid: psid,
          isLiveFacebook: true,
          customerName: custName,
          customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(custName)}&background=0084FF&color=fff&bold=true`,
          customerClass: 'Khách Fanpage Live',
          customerSchool: 'Facebook Messenger',
          facebookUrl: `https://facebook.com/${psid}`,
          pageName: 'Duy Hiền Digital Marketing',
          unreadCount: fc.unread_count || 0,
          lastMessage: lastRaw?.message || 'Cuộc trò chuyện Facebook Messenger',
          lastMessageTime: lastRaw?.created_time
            ? new Date(lastRaw.created_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : 'Mới đây',
          assignedSalesName: currentUser.name,
          pipelineStage: 'Đang tư vấn',
          tags: ['Facebook Fanpage', 'Live Chat', 'Messenger API'],
          notes: `Khách hàng nhắn tin trực tiếp qua Fanpage Facebook (PSID: ${psid})`,
          messages: mappedMsgs
        };
      });

      if (mappedList.length > 0) {
        setMessengerConversations(prev => {
          // Kiểm tra xem có tin nhắn mới từ khách hàng không để phát chuông & thông báo
          let hasNewCustomerMsg = false;
          let newCustomerName = '';
          let newCustomerText = '';

          mappedList.forEach(m => {
            const oldConv = prev.find(p => p.id === m.id);
            if (oldConv && oldConv.messages.length > 0 && m.messages.length > 0) {
              const lastOldMsg = oldConv.messages[oldConv.messages.length - 1];
              const lastNewMsg = m.messages[m.messages.length - 1];
              if (lastNewMsg.id !== lastOldMsg.id && lastNewMsg.sender === 'customer') {
                hasNewCustomerMsg = true;
                newCustomerName = m.customerName;
                newCustomerText = lastNewMsg.text;
              }
            } else if (!oldConv && m.messages.length > 0 && m.messages[m.messages.length - 1].sender === 'customer') {
              hasNewCustomerMsg = true;
              newCustomerName = m.customerName;
              newCustomerText = m.messages[m.messages.length - 1].text;
            }
          });

          if (hasNewCustomerMsg) {
            playMessageChime();
            addNotification({
              title: `Tin nhắn Facebook mới từ ${newCustomerName}`,
              message: newCustomerText || 'Khách vừa gửi tin nhắn vào Fanpage',
              type: 'new_lead',
              severity: 'info'
            });
          }

          return mappedList;
        });

        setActiveConversationId(prev => {
          if (!prev || prev.startsWith('conv-fb-') || !mappedList.some(m => m.id === prev)) {
            return mappedList[0].id;
          }
          return prev;
        });
      }
    } catch (error) {
      if (!silent) console.error('Lỗi đồng bộ Facebook:', error);
    } finally {
      if (!silent) setIsSyncingFacebook(false);
    }
  };

  const sendMessengerMessage = (convId: string, text: string, sender: 'sales' | 'customer' = 'sales', attachments?: any[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const newMsg: FacebookChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName: sender === 'sales' ? `${currentUser.name} (Sales)` : 'Khách Hàng',
      senderAvatar: sender === 'sales' ? currentUser.avatar : undefined,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      attachments
    };

    setMessengerConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return {
          ...c,
          lastMessage: text.trim() || (attachments?.length ? '[Đính kèm ảnh]' : ''),
          lastMessageTime: newMsg.timestamp,
          messages: [...c.messages, newMsg]
        };
      })
    );

    // Gửi tin nhắn thực tế qua Facebook Graph API nếu là cuộc trò chuyện Fanpage
    const targetConv = messengerConversations.find(c => c.id === convId);
    if (targetConv?.facebookPsid && sender === 'sales') {
      FacebookApiService.sendMessage(targetConv.facebookPsid, text.trim()).catch(err => {
        console.warn('Gửi qua Facebook Graph API:', err);
        const errorSystemMsg: FacebookChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'customer',
          senderName: 'Cảnh Báo Facebook API',
          text: `⚠️ Chưa gửi được tới Facebook của khách: ${err.message}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessengerConversations(prev =>
          prev.map(c => (c.id === convId ? { ...c, messages: [...c.messages, errorSystemMsg] } : c))
        );
      });
    }
  };

  const markMessengerAsRead = (convId: string) => {
    setMessengerConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const updateMessengerStage = (convId: string, stage: PipelineStage) => {
    setMessengerConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, pipelineStage: stage };
      })
    );

    const targetConv = messengerConversations.find(c => c.id === convId);
    if (targetConv?.customerId) {
      updateCustomerStage(targetConv.customerId, stage);
    }
  };

  const updateMessengerNotes = (convId: string, notes: string) => {
    setMessengerConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, notes } : c))
    );
  };

  const unreadMessengerCount = useMemo(() => {
    return messengerConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [messengerConversations]);

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
        updateProfile,
        customers,
        deletedCustomers,
        isLoadingDeleted,
        loadDeletedCustomers,
        selectedCustomerId,
        setSelectedCustomerId,
        addCustomer,
        deleteCustomer,
        restoreCustomer,
        permanentDeleteCustomer,
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
        updateWorkflow,
        addWorkflow,
        deleteWorkflow,
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
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isSearchOpen,
        setIsSearchOpen,
        dateFilter,
        setDateFilter,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        messengerConversations,
        activeConversationId,
        setActiveConversationId,
        sendMessengerMessage,
        markMessengerAsRead,
        updateMessengerStage,
        updateMessengerNotes,
        unreadMessengerCount,
        isSyncingFacebook,
        syncFacebookLiveConversations,
        facebookPageName
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
