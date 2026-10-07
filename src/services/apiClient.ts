import { Customer, Booking, Photographer, SalesStaff, SystemNotification } from '../types';
import { getApiBaseUrl } from './multiZoneSyncService';

/**
 * REST API Client kết nối trực tiếp đến Backend & SQL Database Server
 * Đây là Single Source of Truth của toàn bộ hệ thống CRM Xoăn Media
 */

// Lấy thông tin user hiện tại từ session client để gửi kèm Audit Log
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  try {
    const raw = localStorage.getItem('xoan_crm_auth_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user) {
        headers['X-User-Id'] = parsed.user.id || 'anonymous';
        headers['X-User-Name'] = encodeURIComponent(parsed.user.name || 'Người dùng');
      }
    }
  } catch {}
  return headers;
};

export const apiClient = {
  // -----------------------------------------------------------------
  // 1. HEALTH CHECKS
  // -----------------------------------------------------------------
  async checkHealth(): Promise<{ status: string; database?: string; version?: string } | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async checkDatabaseHealth(): Promise<any | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health/database`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // -----------------------------------------------------------------
  // 2. CUSTOMERS API (CRUD)
  // -----------------------------------------------------------------
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
    salesId?: string;
  }): Promise<{ customers: Customer[]; total: number } | null> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);
      if (params?.stage) query.set('stage', params.stage);
      if (params?.salesId) query.set('sales_id', params.salesId);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${getApiBaseUrl()}/customers${qs}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return {
        customers: json.data || [],
        total: json.pagination?.total || 0
      };
    } catch (err) {
      console.warn('[ApiClient] Không thể kết nối lấy danh sách khách hàng từ server:', err);
      return null;
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async createCustomer(customer: Partial<Customer>): Promise<Customer | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi tạo khách hàng trên server:', err);
      return null;
    }
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi cập nhật khách hàng trên server:', err);
      return null;
    }
  },

  async deleteCustomer(id: string, reason?: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getDeletedCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/deleted`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[ApiClient] Lỗi tải danh sách thùng rác:', err);
      return [];
    }
  },

  async restoreCustomer(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}/restore`, {
        method: 'POST',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async permanentDeleteCustomer(id: string, reason?: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}/permanent`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async changeCustomerStage(id: string, newStage: string, note?: string): Promise<Customer | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}/change-stage`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newStage, note }),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async getStageHistory(id: string): Promise<any[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/customers/${encodeURIComponent(id)}/stage-history`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // -----------------------------------------------------------------
  // 3. BOOKINGS API (CRUD)
  // -----------------------------------------------------------------
  async getBookings(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ bookings: Booking[]; total: number } | null> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', params.page.toString());
      if (params?.limit) query.set('limit', params.limit.toString());
      if (params?.search) query.set('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${getApiBaseUrl()}/bookings${qs}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return {
        bookings: json.data || [],
        total: json.pagination?.total || 0
      };
    } catch (err) {
      console.warn('[ApiClient] Không thể kết nối lấy lịch booking từ server:', err);
      return null;
    }
  },

  async createBooking(booking: Partial<Booking>): Promise<Booking | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(booking),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi tạo lịch booking trên server:', err);
      return null;
    }
  },

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bookings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(booking),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi cập nhật booking trên server:', err);
      return null;
    }
  },

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/bookings/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // -----------------------------------------------------------------
  // 4. AUDIT LOGS & BACKUPS
  // -----------------------------------------------------------------
  async getAuditLogs(limit = 50): Promise<any[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/audit-logs?limit=${limit}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createDatabaseBackup(label = 'manual'): Promise<any> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/backups/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ label }),
        signal: AbortSignal.timeout(15000)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async listDatabaseBackups(): Promise<any[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/backups`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  // -----------------------------------------------------------------
  // 5. PHOTOGRAPHERS (CRUD & THÙY LAO / LƯƠNG THƯỞNG)
  // -----------------------------------------------------------------
  async getPhotographers(): Promise<Photographer[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/photographers`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[ApiClient] Lỗi tải danh sách thợ từ server:', err);
      return [];
    }
  },

  async createPhotographer(photographer: Partial<Photographer>): Promise<Photographer | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/photographers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(photographer),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi tạo thợ trên server:', err);
      return null;
    }
  },

  async updatePhotographer(id: string, photographer: Partial<Photographer>): Promise<Photographer | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/photographers/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(photographer),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi cập nhật thợ trên server:', err);
      return null;
    }
  },

  async deletePhotographer(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/photographers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // -----------------------------------------------------------------
  // 6. SALES STAFF (CRUD & HOA HỒNG SALES)
  // -----------------------------------------------------------------
  async getSalesStaff(): Promise<SalesStaff[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/sales-staff`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn('[ApiClient] Lỗi tải danh sách Sales từ server:', err);
      return [];
    }
  },

  async createSalesStaff(staff: Partial<SalesStaff>): Promise<SalesStaff | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/sales-staff`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(staff),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi tạo Sales trên server:', err);
      return null;
    }
  },

  async updateSalesStaff(id: string, staff: Partial<SalesStaff>): Promise<SalesStaff | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/sales-staff/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(staff),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('[ApiClient] Lỗi cập nhật Sales trên server:', err);
      return null;
    }
  },

  async deleteSalesStaff(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/sales-staff/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // -----------------------------------------------------------------
  // 7. FILE & AVATAR UPLOADS
  // -----------------------------------------------------------------
  async uploadAvatar(payload: { base64Data: string; fileName?: string; fileType?: string; userId?: string }): Promise<{ success: boolean; url: string; fullUrl: string } | null> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/upload/avatar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.warn('[ApiClient] Lỗi tải lên avatar lên server:', err);
      return null;
    }
  },

  // -----------------------------------------------------------------
  // 8. NOTIFICATIONS API (Đồng bộ thông báo đa thiết bị & iOS)
  // -----------------------------------------------------------------
  async getNotifications(userId?: string, role?: string): Promise<SystemNotification[]> {
    try {
      const query = new URLSearchParams();
      if (userId) query.set('userId', userId);
      if (role) query.set('role', role);

      const res = await fetch(`${getApiBaseUrl()}/notifications?${query.toString()}`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createNotification(notif: SystemNotification): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notif),
        signal: AbortSignal.timeout(6000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async markAllNotificationsAsRead(userId?: string, role?: string): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/notifications/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, role }),
        signal: AbortSignal.timeout(5000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
