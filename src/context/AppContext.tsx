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
  ClassMoment
} from '../types';
import {
  mockUsers,
  mockCustomers,
  mockBookings,
  mockPhotographers,
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

  // Chuyển đổi role đồng bộ user mẫu tương ứng
  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    const matchedUser = mockUsers.find(u => u.role === role) || mockUsers[0];
    setCurrentUser(matchedUser);
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
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            pipelineStage: newStage,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );

    const targetCustomer = customers.find(c => c.id === customerId);
    if (targetCustomer) {
      addActivityLog({
        customerId,
        type: 'quote_sent',
        title: `Chuyển giai đoạn: ${newStage}`,
        description: `Khách hàng ${targetCustomer.name} được chuyển từ "${targetCustomer.pipelineStage}" sang "${newStage}".`,
        performedByName: currentUser.name
      });
    }
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
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
