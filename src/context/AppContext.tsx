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
  FacebookChatMessage,
  PaymentStatus,
  BookingStatus
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
import { INITIAL_PANCAKE_CONVERSATIONS } from '../data/mockPancakeData';
import { crmSupabaseService } from '../services/crmSupabaseService';
import { sendZaloBotNotification, notifyNewCustomerLeadToZaloGroup, notifyCustomerDepositToZaloGroup } from '../lib/zaloBotService';
import { FacebookApiService } from '../services/facebookApiService';
import { dispatchCustomerSyncToZones, dispatchBookingSyncToZones } from '../services/multiZoneSyncService';
import { apiClient } from '../services/apiClient';
import {
  playNotificationTone,
  vibrateDevice,
  triggerNativePushNotification,
  unlockAudio
} from '../utils/notificationAudio';



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
  | 'pancake'
  | 'trash';

export type AppMode = 'crm' | 'pancake';

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
  userNotifications: SystemNotification[];
  unreadNotificationCount: number;
  activePushBanner: SystemNotification | null;
  triggerPushBanner: (notification: SystemNotification) => void;
  closePushBanner: () => void;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // Search & Filters
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;

  // Mobile Navigation Drawer
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Facebook Messenger & App Pancake Đa Kênh cho Sales
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

  // Tiện ích nghiệp vụ App Pancake (Pancake POS & Tags)
  addPancakeTag: (convId: string, tag: string) => void;
  removePancakeTag: (convId: string, tag: string) => void;
  assignPancakeStaff: (convId: string, staffName: string, staffId?: string) => void;
  sendPancakeCardMessage: (convId: string, text: string, cardType: 'quote' | 'vietqr' | 'booking', cardData: any) => void;
  createPancakeQuickBooking: (convId: string, bookingData: { packageName: string; studentCount: number; packagePrice: number; depositAmount: number; shootDate: string; location: string; notes?: string }) => void;
  loadPancakeSampleData: () => void;

  // Hệ sinh thái đa ứng dụng (App Suite: CRM ⟷ Pancake)
  activeApp: AppMode;
  setActiveApp: (app: AppMode) => void;
  switchApp: (app: AppMode, inNewTab?: boolean) => void;
  openPancakeForCustomer: (customer: Customer | { id?: string; name: string; phone?: string; className?: string; schoolName?: string }) => void;
  openCrmForCustomer: (customerId: string, targetTab?: NavigationTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ứng dụng luôn luôn hoạt động ở chế độ CRM Xoăn Media thuần túy
  const getInitialApp = (): AppMode => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('crm_xoan_active_app');
      }
    } catch (e) {}
    return 'crm';
  };

  const [activeApp, setActiveAppState] = useState<AppMode>('crm');

  const switchApp = (app: AppMode) => {
    setActiveAppState('crm');
  };

  const setActiveApp = (app: AppMode) => {
    setActiveAppState('crm');
  };

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
        if (Array.isArray(parsed)) return parsed;
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
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasV127 = parsed.some(n => n.id === 'notif-system-v127');
          if (!hasV127 && mockNotifications[0]?.id === 'notif-system-v127') {
            return [mockNotifications[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e);
    }
    return mockNotifications;
  });

  // Tự động lưu notifications vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crm_xoan_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // iOS Push Banner State (Dynamic Island Style)
  const [activePushBanner, setActivePushBanner] = useState<SystemNotification | null>(null);

  const triggerPushBanner = (notif: SystemNotification) => {
    setActivePushBanner(notif);
    playNotificationTone();
    vibrateDevice([150, 80, 150]);
    triggerNativePushNotification(notif.title, notif.message);
  };

  const closePushBanner = () => {
    setActivePushBanner(null);
  };

  // Mở khóa AudioContext khi người dùng chạm màn hình lần đầu (Yêu cầu Safari iOS)
  useEffect(() => {
    const handleFirstTouch = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('click', handleFirstTouch, { passive: true });
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, []);

  // Bộ lọc thông báo chuẩn xác theo tài khoản đăng nhập (Admin, Sales phụ trách, Photographer)
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    const isCurrentAdmin = currentUser.role === 'admin' || currentRole === 'admin';
    const isCurrentSales = currentUser.role === 'sales' || currentRole === 'sales';
    const isCurrentPhoto = currentUser.role === 'photographer' || currentRole === 'photographer';

    return notifications.filter(n => {
      // 1. Nếu thông báo gửi đích danh user ID (Ưu tiên số 1)
      if (n.targetUserId) {
        return n.targetUserId === currentUser.id;
      }

      // 2. Nếu thông báo gửi cho nhóm quyền (targetRole)
      if (n.targetRole) {
        if (n.targetRole === 'all') return true;
        if (n.targetRole === 'admin' && isCurrentAdmin) return true;
        if (n.targetRole === 'sales' && isCurrentSales) return true;
        if (n.targetRole === 'photographer' && isCurrentPhoto) return true;
        return false;
      }

      // 3. Thông báo chung toàn hệ thống (không có targetUserId hay targetRole)
      // Admin luôn nhận được tất cả thông báo hệ thống
      if (isCurrentAdmin) return true;
      return false;
    });
  }, [notifications, currentUser, currentRole]);

  const unreadNotificationCount = useMemo(() => {
    return userNotifications.filter(n => !n.read).length;
  }, [userNotifications]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
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
        const [custRes, bookRes, delRes, photoRes, salesRes, notifRes] = await Promise.allSettled([
          apiClient.getCustomers({ limit: 500 }),
          apiClient.getBookings({ limit: 500 }),
          apiClient.getDeletedCustomers(),
          apiClient.getPhotographers(),
          apiClient.getSalesStaff(),
          apiClient.getNotifications(currentUser?.id, currentRole)
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

        if (notifRes.status === 'fulfilled' && Array.isArray(notifRes.value) && notifRes.value.length > 0) {
          const serverNotifs = notifRes.value;
          setNotifications(prev => {
            const existingIds = new Set(serverNotifs.map(n => n.id));
            const localOnly = prev.filter(n => !existingIds.has(n.id));
            return [...serverNotifs, ...localOnly];
          });
          console.log(`[SQL Database] 🔔 Đã nạp thành công ${serverNotifs.length} thông báo từ SQL Server.`);
        }
      } catch (e) {
        console.warn('[SQL Database] Lỗi nạp dữ liệu từ server:', e);
      }
    };

    loadFromSqlDatabase();

    // Polling định kỳ mỗi 20s để tự động cập nhật thông báo mới cho thiết bị di động (iOS / Android)
    const notifPollingTimer = setInterval(async () => {
      try {
        const serverNotifs = await apiClient.getNotifications(currentUser?.id, currentRole);
        if (Array.isArray(serverNotifs) && serverNotifs.length > 0) {
          setNotifications(prev => {
            const prevIds = new Set(prev.map(n => n.id));
            const newIncoming = serverNotifs.filter(n => !prevIds.has(n.id) && !n.read);
            if (newIncoming.length > 0) {
              triggerPushBanner(newIncoming[0]);
            }
            const existingIds = new Set(serverNotifs.map(n => n.id));
            const localOnly = prev.filter(n => !existingIds.has(n.id));
            return [...serverNotifs, ...localOnly];
          });
        }
      } catch {}
    }, 20000);

    return () => clearInterval(notifPollingTimer);

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
      u === 'duonghaiminh' ||
      u === 'haiminh' ||
      u === 'duonghaiminh3@gmail.com';

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

    // 2. Kiểm tra tài khoản Sales Tư Vấn (Lấy trực tiếp từ DATA thực tế, không tự động hồi sinh tài khoản đã bị xóa)
    const allSalesPool = salesStaff.length > 0 ? salesStaff : mockSalesStaff;

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
        'PhuongCTV@2024'
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
        'XoanPhoto@2026'
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
    // Tài khoản Admin là tài khoản hệ thống cố định, không được tự ý đổi mật khẩu
    if (data.newPassword && currentRole === 'admin') {
      return { success: false, message: 'Tài khoản Admin là tài khoản quản trị cố định của hệ thống, không được tự ý đổi mật khẩu!' };
    }

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
          const defaultPasswords = ['XoanPhoto@2026', 'XoanAdmin@2026'];
          if (storedPassword !== data.currentPassword && !defaultPasswords.includes(data.currentPassword)) {
            // Thử so sánh mật khẩu mặc định theo role
            if (currentRole === 'photographer' && data.currentPassword !== 'XoanPhoto@2026') {
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

    // Đồng bộ avatar sang danh sách nhân viên / thợ chụp tương ứng
    if (data.avatar) {
      if (currentRole === 'photographer') {
        const photo = photographers.find(p => p.id === currentUser.id || (p.phone && p.phone === currentUser.phone));
        if (photo) {
          updatePhotographer({ ...photo, avatar: data.avatar });
        }
      } else if (currentRole === 'sales') {
        const staff = salesStaff.find((s: SalesStaff) => s.id === currentUser.id || (s.phone && s.phone === currentUser.phone));
        if (staff) {
          updateSalesStaff({ ...staff, avatar: data.avatar });
        }
      }
    }

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

    // In-App Notification: Báo có Lead mới cho Admin & Sales được phân công
    const assignedSalesId = customerData.assignedSalesId || (salesStaff.find(s => s.name === salesName)?.id);
    const createdNotifs: SystemNotification[] = [
      {
        id: `notif-${Date.now()}-admin`,
        type: 'new_lead',
        title: `🌟 LEAD MỚI TIẾP NHẬN: ${customerData.name}`,
        message: `Lead ${customerData.className || customerData.name} (${customerData.schoolName || 'Chưa rõ trường'}) từ nguồn ${customerData.source || 'Trực tiếp'} vừa được tiếp nhận.${salesName && salesName !== 'Chưa gán' ? ` Phụ trách: ${salesName}` : ''}`,
        customerId: newId,
        targetRole: 'admin',
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];

    if (assignedSalesId) {
      createdNotifs.push({
        id: `notif-${Date.now()}-sales`,
        type: 'new_lead',
        title: `🎯 BẠN CÓ LEAD MỚI PHỤ TRÁCH`,
        message: `Bạn được phân công chăm sóc Lead: ${customerData.name} (${customerData.className || ''} - ${customerData.schoolName || ''}). Nguồn: ${customerData.source || 'Trực tiếp'}. Hãy liên hệ sớm!`,
        customerId: newId,
        targetUserId: assignedSalesId,
        targetRole: 'sales',
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false
      });
    }
    setNotifications(prev => [...createdNotifs, ...prev]);

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
          const isLeadOrLost = newStage === 'New Lead' || newStage === 'Lost';
          updatedCustObj = {
            ...c,
            pipelineStage: newStage,
            assignedSalesName: newSalesName || c.assignedSalesName,
            assignedSalesId: newSalesId || c.assignedSalesId,
            depositAmount: isLeadOrLost ? 0 : c.depositAmount,
            paidAmount: isLeadOrLost ? 0 : c.paidAmount,
            remainingAmount: isLeadOrLost ? 0 : c.remainingAmount,
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
        depositAmount: targetCustomer.depositAmount !== undefined ? targetCustomer.depositAmount : (targetCustomer.paidAmount || 0),
        closedByName: closerSalesName
      }).catch(err => {
        console.warn('[Zalo Bot] Lỗi gửi thông báo chốt cọc:', err);
      });

      // 2. Thêm thông báo chuông hệ thống cho Admin & Sales
      const targetSalesId = newSalesId || targetCustomer.assignedSalesId;
      const depositNotifs: SystemNotification[] = [
        {
          id: `notif-${Date.now()}-admin`,
          type: 'deposit',
          title: `🎉 CHỐT CỌC THÀNH CÔNG: ${targetCustomer.className || targetCustomer.name}`,
          message: `Sales ${closerSalesName} đã chốt cọc thành công cho lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}).`,
          customerId: customerId,
          targetRole: 'admin',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];

      if (targetSalesId) {
        depositNotifs.push({
          id: `notif-${Date.now()}-sales`,
          type: 'deposit',
          title: `🎉 CHỐT CỌC THÀNH CÔNG: ${targetCustomer.className || targetCustomer.name}`,
          message: `Chúc mừng bạn đã chốt cọc thành công cho lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName})!`,
          customerId: customerId,
          targetUserId: targetSalesId,
          targetRole: 'sales',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      setNotifications(prev => [...depositNotifs, ...prev]);
    } else if (isMovingToConsulting) {
      const consultingNotifs: SystemNotification[] = [
        {
          id: `notif-${Date.now()}-admin`,
          type: 'new_lead',
          title: `🎯 ĐÃ GÁN SALES TƯ VẤN: ${newSalesName}`,
          message: `Lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}) đã chuyển sang "${newStage}". Phụ trách: ${newSalesName}.`,
          customerId: customerId,
          targetRole: 'admin',
          severity: 'info',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];

      if (newSalesId) {
        consultingNotifs.push({
          id: `notif-${Date.now()}-sales`,
          type: 'new_lead',
          title: `🎯 BẠN ĐƯỢC PHÂN BỔ LEAD: ${targetCustomer.className || targetCustomer.name}`,
          message: `Lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}) đã chuyển sang "${newStage}". Bạn được phân công phụ trách tư vấn.`,
          customerId: customerId,
          targetUserId: newSalesId,
          targetRole: 'sales',
          severity: 'info',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      setNotifications(prev => [...consultingNotifs, ...prev]);
    } else if (newStage === 'Book ngày' || newStage === 'Đã Booking') {
      const targetSalesId = newSalesId || targetCustomer.assignedSalesId;
      const bookingStageNotifs: SystemNotification[] = [
        {
          id: `notif-${Date.now()}-admin`,
          type: 'shoot_scheduled',
          title: `📅 KHÁCH ĐÃ CHỐT BOOK NGÀY: ${targetCustomer.className || targetCustomer.name}`,
          message: `Lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}) đã chốt ngày chụp: ${targetCustomer.shootDate || 'Chờ xếp ngày'}.`,
          customerId: customerId,
          targetRole: 'admin',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];

      if (targetSalesId) {
        bookingStageNotifs.push({
          id: `notif-${Date.now()}-sales`,
          type: 'shoot_scheduled',
          title: `📅 KHÁCH CỦA BẠN ĐÃ BOOK NGÀY: ${targetCustomer.className || targetCustomer.name}`,
          message: `Khách hàng ${targetCustomer.className || targetCustomer.name} đã chuyển sang trạng thái Book ngày (${targetCustomer.shootDate || 'Chờ xếp ngày'}).`,
          customerId: customerId,
          targetUserId: targetSalesId,
          targetRole: 'sales',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      setNotifications(prev => [...bookingStageNotifs, ...prev]);
    } else if (newStage === 'Lost') {
      const lostNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'unassigned',
        title: '⚠️ KHÁCH HÀNG TỪ CHỐI (LOST)',
        message: `Lớp ${targetCustomer.className || targetCustomer.name} (${targetCustomer.schoolName}) đã chuyển sang trạng thái Lost.`,
        customerId: customerId,
        targetRole: 'admin',
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [lostNotif, ...prev]);
    }
  };

  const updateCustomer = (updated: Customer) => {
    // Nếu khách hàng ở New Lead hoặc Lost và không có cọc thực tế: Đảm bảo cọc và công nợ = 0
    if ((updated.pipelineStage === 'New Lead' || updated.pipelineStage === 'Lost') && Number(updated.depositAmount || 0) === 0) {
      updated = {
        ...updated,
        depositAmount: 0,
        paidAmount: 0,
        remainingAmount: 0
      };
    }
    const prevCust = customers.find(c => c.id === updated.id);
    const isNewDeposit = prevCust && !['Đã cọc', 'Đã đặt cọc'].includes(prevCust.pipelineStage) && ['Đã cọc', 'Đã đặt cọc'].includes(updated.pipelineStage);
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
        depositAmount: updated.depositAmount !== undefined ? updated.depositAmount : (updated.paidAmount || 0),
        closedByName: closerSalesName
      }).catch(err => {
        console.warn('[Zalo Bot] Lỗi gửi thông báo chốt cọc:', err);
      });

      const targetSalesId = updated.assignedSalesId || (salesStaff.find(s => s.name === closerSalesName)?.id);
      const depositNotifs: SystemNotification[] = [
        {
          id: `notif-${Date.now()}-admin`,
          type: 'deposit',
          title: `🎉 CHỐT CỌC THÀNH CÔNG: ${updated.className || updated.name}`,
          message: `Sales ${closerSalesName} đã chốt cọc thành công cho lớp ${updated.className || updated.name} (${updated.schoolName}).`,
          customerId: updated.id,
          targetRole: 'admin',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];

      if (targetSalesId) {
        depositNotifs.push({
          id: `notif-${Date.now()}-sales`,
          type: 'deposit',
          title: `🎉 CHỐT CỌC THÀNH CÔNG: ${updated.className || updated.name}`,
          message: `Chúc mừng bạn đã chốt cọc thành công cho lớp ${updated.className || updated.name} (${updated.schoolName})!`,
          customerId: updated.id,
          targetUserId: targetSalesId,
          targetRole: 'sales',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      setNotifications(prev => [...depositNotifs, ...prev]);
    } else if (prevCust && !['Book ngày', 'Đã Booking'].includes(prevCust.pipelineStage) && ['Book ngày', 'Đã Booking'].includes(updated.pipelineStage)) {
      const targetSalesId = updated.assignedSalesId || (salesStaff.find(s => s.name === closerSalesName)?.id);
      const bookNotifs: SystemNotification[] = [
        {
          id: `notif-${Date.now()}-admin`,
          type: 'shoot_scheduled',
          title: `📅 KHÁCH ĐÃ BOOK NGÀY: ${updated.className || updated.name}`,
          message: `Lớp ${updated.className || updated.name} (${updated.schoolName}) đã chốt ngày chụp: ${updated.shootDate || 'Chờ xếp ngày'}.`,
          customerId: updated.id,
          targetRole: 'admin',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      if (targetSalesId) {
        bookNotifs.push({
          id: `notif-${Date.now()}-sales`,
          type: 'shoot_scheduled',
          title: `📅 KHÁCH CỦA BẠN ĐÃ BOOK NGÀY: ${updated.className || updated.name}`,
          message: `Khách hàng ${updated.className || updated.name} đã chuyển sang trạng thái Book ngày (${updated.shootDate || 'Chờ xếp ngày'}).`,
          customerId: updated.id,
          targetUserId: targetSalesId,
          targetRole: 'sales',
          severity: 'success',
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      setNotifications(prev => [...bookNotifs, ...prev]);
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

    // In-App Notification: Báo Lịch chụp cho Admin, Ekip Thợ Chụp & Sales phụ trách
    const bookingNotifs: SystemNotification[] = [
      {
        id: `notif-${Date.now()}-admin`,
        type: 'shoot_scheduled',
        title: `📅 ĐƠN BOOKING MỚI: ${bookingData.className} (${bookingData.schoolName})`,
        message: `Mã đơn ${bookingData.code} chụp ngày ${bookingData.shootDate} (${bookingData.startTime || '07:30'} - ${bookingData.endTime || '17:00'}) tại ${bookingData.location || 'Studio'}. Gói: ${bookingData.packageName}.`,
        bookingId: newId,
        customerId: bookingData.customerId,
        targetRole: 'admin',
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false
      }
    ];

    // Báo cho Trưởng nháy
    if (bookingData.assignments.leadPhotographerId) {
      bookingNotifs.push({
        id: `notif-${Date.now()}-photo-lead`,
        type: 'shoot_assigned',
        title: `📸 CA CHỤP MỚI ĐƯỢC PHÂN CÔNG (Trưởng nháy)`,
        message: `Bạn được phân công làm Trưởng nháy cho ca chụp: ${bookingData.className} (${bookingData.schoolName}) ngày ${bookingData.shootDate} (${bookingData.startTime || '07:30'} - ${bookingData.endTime || '17:00'}) tại ${bookingData.location || 'Studio'}. Vui lòng kiểm tra thiết bị!`,
        bookingId: newId,
        customerId: bookingData.customerId,
        targetUserId: bookingData.assignments.leadPhotographerId,
        targetRole: 'photographer',
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false
      });
    } else {
      // Cảnh báo Admin đơn chưa có thợ
      bookingNotifs.push({
        id: `notif-${Date.now()}-unassigned`,
        type: 'unassigned',
        title: '⚠️ ĐƠN BOOKING CHƯA CÓ THỢ',
        message: `Booking ${bookingData.code} (${bookingData.className} - ${bookingData.schoolName}) ngày ${bookingData.shootDate} chưa được gán Photographer.`,
        bookingId: newId,
        customerId: bookingData.customerId,
        targetRole: 'admin',
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Báo cho từng Thợ phụ
    if (bookingData.assignments.assistantPhotographerIds && bookingData.assignments.assistantPhotographerIds.length > 0) {
      bookingData.assignments.assistantPhotographerIds.forEach((asId, idx) => {
        bookingNotifs.push({
          id: `notif-${Date.now()}-photo-as-${idx}`,
          type: 'shoot_assigned',
          title: `📸 BẠN ĐƯỢC PHÂN CÔNG HỖ TRỢ CA CHỤP`,
          message: `Bạn được phân công hỗ trợ chụp lớp ${bookingData.className} (${bookingData.schoolName}) ngày ${bookingData.shootDate} tại ${bookingData.location || 'Studio'}.`,
          bookingId: newId,
          customerId: bookingData.customerId,
          targetUserId: asId,
          targetRole: 'photographer',
          severity: 'info',
          timestamp: new Date().toISOString(),
          read: false
        });
      });
    }

    // Báo cho Sales phụ trách của khách này
    const relCustomer = customers.find(c => c.id === bookingData.customerId);
    if (relCustomer?.assignedSalesId) {
      bookingNotifs.push({
        id: `notif-${Date.now()}-sales-bk`,
        type: 'shoot_scheduled',
        title: `📅 KHÁCH CỦA BẠN ĐÃ TẠO BOOKING`,
        message: `Đơn chụp cho khách hàng ${bookingData.className || relCustomer.name} ngày ${bookingData.shootDate} đã được thiết lập thành công.`,
        bookingId: newId,
        customerId: bookingData.customerId,
        targetUserId: relCustomer.assignedSalesId,
        targetRole: 'sales',
        severity: 'success',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    setNotifications(prev => [...bookingNotifs, ...prev]);

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

      // In-App Notification: Báo ca chụp được phân công đúng tài khoản Photographer
      const photoNotif: SystemNotification = {
        id: `notif-${Date.now()}-photo-assign`,
        type: 'shoot_assigned',
        title: `📸 BẠN ĐƯỢC ĐIỀU PHỐI VÀO CA CHỤP (${roleType === 'lead' ? 'Trưởng nháy' : roleType === 'assistant' ? 'Thợ phụ' : 'Quay phim'})`,
        message: `Bạn được phân công làm ${roleType === 'lead' ? 'Trưởng nháy' : roleType === 'assistant' ? 'Thợ phụ hỗ trợ' : 'Quay phim'} cho lớp ${currentBooking.className} (${currentBooking.schoolName}) ngày ${currentBooking.shootDate} (${currentBooking.startTime || '07:30'} - ${currentBooking.endTime || '17:00'}) tại ${currentBooking.location || 'Studio'}.`,
        bookingId: currentBooking.id,
        customerId: currentBooking.customerId,
        targetUserId: photographerId,
        targetRole: 'photographer',
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [photoNotif, ...prev]);
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

    // Kiểm tra xem thông báo này có gửi cho user hiện tại hay không
    const isForMe =
      currentRole === 'admin' ||
      newNotif.targetRole === 'all' ||
      newNotif.targetRole === currentRole ||
      newNotif.targetUserId === currentUser?.id;

    if (isForMe) {
      triggerPushBanner(newNotif);
    }

    // Đồng bộ lưu bền vững lên SQL Server REST API để đa thiết bị (iOS, Android, PC) cùng nhận được
    apiClient.createNotification(newNotif).catch(() => {});
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    apiClient.markNotificationAsRead(id).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    const userNotifIds = new Set(userNotifications.map(n => n.id));
    setNotifications(prev => prev.map(n => userNotifIds.has(n.id) ? { ...n, read: true } : n));
    apiClient.markAllNotificationsAsRead(currentUser?.id, currentRole).catch(() => {});
  };

  const clearAllNotifications = () => {
    const userNotifIds = new Set(userNotifications.map(n => n.id));
    setNotifications(prev => prev.filter(n => !userNotifIds.has(n.id)));
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

  // Quản lý tin nhắn Facebook Messenger Live Chat & App Pancake cho Sales
  const [messengerConversations, setMessengerConversations] = useState<FacebookChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('crm_xoan_messenger_chats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => c && c.id && !String(c.id).startsWith('pan-'));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PANCAKE_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return null;
  });

  useEffect(() => {
    try {
      if (messengerConversations.length > 0) {
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

  // Tiện ích quản lý App Pancake
  const addPancakeTag = (convId: string, tag: string) => {
    setMessengerConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        if (c.tags.includes(tag)) return c;
        return { ...c, tags: [...c.tags, tag] };
      })
    );
  };

  const removePancakeTag = (convId: string, tag: string) => {
    setMessengerConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, tags: c.tags.filter(t => t !== tag) };
      })
    );
  };

  const assignPancakeStaff = (convId: string, staffName: string, staffId?: string) => {
    setMessengerConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, assignedSalesName: staffName, assignedSalesId: staffId };
      })
    );
  };

  const sendPancakeCardMessage = (convId: string, text: string, cardType: 'quote' | 'vietqr' | 'booking', cardData: any) => {
    const newMsg: FacebookChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'sales',
      senderName: `${currentUser.name} (Sales)`,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      cardType,
      cardData
    };

    setMessengerConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        return {
          ...c,
          isReplied: true,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp,
          messages: [...c.messages, newMsg]
        };
      })
    );
  };

  const createPancakeQuickBooking = (convId: string, bookingData: { packageName: string; studentCount: number; packagePrice: number; depositAmount: number; shootDate: string; location: string; notes?: string }) => {
    const targetConv = messengerConversations.find(c => c.id === convId);
    if (!targetConv) return;

    const bookingCode = `BK-${Date.now().toString().slice(-6)}`;
    const totalAmount = bookingData.studentCount * bookingData.packagePrice;

    // 1. Tạo đơn Booking mới vào CRM
    const newBooking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      code: bookingCode,
      customerId: targetConv.customerId || `cust-${Date.now()}`,
      customerName: targetConv.customerName,
      schoolName: targetConv.customerSchool || 'Chưa cập nhật trường',
      className: targetConv.customerClass || 'Lớp Kỷ Yếu',
      packageId: 'pkg-custom',
      packageName: bookingData.packageName,
      studentCount: bookingData.studentCount,
      totalAmount,
      depositAmount: bookingData.depositAmount,
      remainingAmount: totalAmount - bookingData.depositAmount,
      paymentStatus: (bookingData.depositAmount >= totalAmount ? 'paid' : bookingData.depositAmount > 0 ? 'partial' : 'pending') as PaymentStatus,
      bookingStatus: 'confirmed' as BookingStatus,
      shootDate: bookingData.shootDate,
      startTime: '07:30',
      endTime: '17:00',
      location: bookingData.location,
      notes: bookingData.notes || `Tạo nhanh từ Pancake Chat bởi ${currentUser.name}`,
      assignments: {
        leadPhotographerId: '',
        assistantPhotographerIds: []
      }
    };

    addBooking(newBooking);

    // 2. Cập nhật trạng thái hội thoại và khách hàng
    updateMessengerStage(convId, 'Đã đặt cọc');
    addPancakeTag(convId, '💰 Đã cọc VietQR');

    // 3. Gửi tin nhắn xác nhận chốt booking vào khung chat
    sendPancakeCardMessage(
      convId,
      `🎉 XÁC NHẬN CHỐT BOOKING KỶ YẾU #${bookingCode}\n✨ Gói: ${bookingData.packageName} (${bookingData.studentCount} bạn)\n📅 Ngày chụp: ${bookingData.shootDate}\n📍 Địa điểm: ${bookingData.location}\n💵 Tổng chi phí: ${totalAmount.toLocaleString('vi-VN')}đ | Đã cọc: ${bookingData.depositAmount.toLocaleString('vi-VN')}đ\nEkip Xoăn Media đã khóa lịch thành công trên hệ thống CRM!`,
      'booking',
      {
        bookingCode,
        packageName: bookingData.packageName,
        packagePrice: bookingData.packagePrice,
        studentCount: bookingData.studentCount,
        totalAmount,
        depositAmount: bookingData.depositAmount,
        shootDate: bookingData.shootDate,
        location: bookingData.location
      }
    );

    addNotification({
      title: `⚡ PANCAKE POS: CHỐT BOOKING #${bookingCode}`,
      message: `Đã tạo đơn thành công cho ${targetConv.customerName} (${targetConv.customerClass} - ${targetConv.customerSchool})`,
      type: 'deposit',
      severity: 'success'
    });
  };

  const loadPancakeSampleData = () => {
    setMessengerConversations(INITIAL_PANCAKE_CONVERSATIONS);
    localStorage.setItem('crm_xoan_messenger_chats', JSON.stringify(INITIAL_PANCAKE_CONVERSATIONS));
  };

  // Liên kết 2 chiều giữa CRM và Pancake
  const openPancakeForCustomer = (customer: Customer | { id?: string; name: string; phone?: string; className?: string; schoolName?: string }) => {
    let matchedConv = messengerConversations.find(
      c => (customer.id && c.customerId === customer.id) || (customer.phone && c.customerPhone && c.customerPhone === customer.phone)
    );

    if (!matchedConv) {
      const newConvId = `conv-cust-${Date.now()}`;
      const newConv: FacebookChatConversation = {
        id: newConvId,
        customerId: customer.id,
        customerName: customer.name,
        customerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=0084FF&color=fff&bold=true`,
        customerClass: customer.className || 'Chưa rõ lớp',
        customerSchool: customer.schoolName || 'Chưa rõ trường',
        customerPhone: customer.phone || '',
        pageName: 'Xoăn Media - Kỷ Yếu & Sự Kiện',
        channel: 'facebook',
        channelId: 'fb-xoan-hn',
        unreadCount: 0,
        isReplied: true,
        lastMessage: 'Cuộc hội thoại được liên kết từ CRM Xoăn',
        lastMessageTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        assignedSalesName: currentUser.name,
        assignedSalesId: currentUser.id,
        pipelineStage: (customer as Customer).pipelineStage || 'Đang tư vấn',
        tags: ['CRM Lead', 'Cần tư vấn'],
        notes: (customer as Customer).notes || '',
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: 'system',
            senderName: 'Hệ thống CRM',
            text: `✨ Cuộc trò chuyện được mở từ Hồ Sơ Khách Hàng CRM bởi ${currentUser.name}`,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setMessengerConversations(prev => [newConv, ...prev]);
      matchedConv = newConv;
    }

    setActiveConversationId(matchedConv.id);
    switchApp('pancake');
  };

  const openCrmForCustomer = (customerId: string, targetTab: NavigationTab = 'customers') => {
    setSelectedCustomerId(customerId);
    setActiveTab(targetTab);
    switchApp('crm');
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
        userNotifications,
        unreadNotificationCount,
        activePushBanner,
        triggerPushBanner,
        closePushBanner,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
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
        facebookPageName,
        addPancakeTag,
        removePancakeTag,
        assignPancakeStaff,
        sendPancakeCardMessage,
        createPancakeQuickBooking,
        loadPancakeSampleData,
        activeApp,
        setActiveApp,
        switchApp,
        openPancakeForCustomer,
        openCrmForCustomer
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
