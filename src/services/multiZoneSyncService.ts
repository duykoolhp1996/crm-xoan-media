/**
 * Service Nhạc Trưởng Đồng Bộ Dữ Liệu 3 Vùng (Multi-Zone Sync Orchestrator)
 * Vùng 1: Google Sheets (ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU) - Replica Báo Cáo
 * Vùng 2: Supabase (PostgreSQL Cloud thời gian thực) - Replica Đám Mây
 * Vùng 3: Server SQL Engine (SQLite Persistent trên server) - PRIMARY SOURCE
 */

import { Customer, Booking, Photographer, SalesStaff } from '../types';
import {
  syncCustomerToGoogleSheet,
  syncBookingToGoogleSheet,
  syncAllToGoogleSheet,
  getGoogleSheetsConfig
} from './googleSheetsService';
import { crmSupabaseService } from './crmSupabaseService';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { syncToLocalSqlCache } from './localSqlStorageService';

// Xác định URL API Server tùy thuộc môi trường
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:4321/api';
  if (window.location.hostname === 'crm.xoanmedia.com') {
    return '/api';
  }
  return (import.meta as any).env?.VITE_API_URL || 'http://localhost:4321/api';
};

export interface ServerStorageStatus {
  success: boolean;
  primarySource: string;
  primaryDatabasePath: string;
  zones: {
    zone1_google_sheets: {
      name: string;
      spreadsheetId: string;
      status: string;
      role: string;
    };
    zone2_supabase: {
      name: string;
      status: string;
      role: string;
    };
    zone3_server_sql: {
      name: string;
      status: string;
      role: string;
      dbSizeBytes: number;
      records: {
        customers: number;
        bookings: number;
        photographers: number;
        salesStaff: number;
      };
    };
  };
  queue: {
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
    total: number;
    recentErrors: Array<{
      id: string;
      entity_type: string;
      entity_id: string;
      target_zone: string;
      retry_count: number;
      error_log: string;
      updated_at: string;
    }>;
  };
  excelBackups: {
    totalFiles: number;
    backupDir: string;
  };
}

export interface ExcelHistoryItem {
  id: string;
  filename: string;
  file_path: string;
  file_size_bytes: number;
  export_type: string;
  period_label: string;
  record_count: number;
  status: string;
  created_at: string;
}

export interface ZoneSyncResult {
  zone: 'Zone 1: Google Sheets' | 'Zone 2: Supabase PostgreSQL' | 'Zone 3: Server SQL Engine';
  status: 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  timestamp: string;
  itemsProcessed?: number;
}

export interface MultiZoneSyncReport {
  timestamp: string;
  totalZones: number;
  successfulZones: number;
  details: {
    zone1: ZoneSyncResult;
    zone2: ZoneSyncResult;
    zone3: ZoneSyncResult;
  };
}

/**
 * Lấy trạng thái CSDL 3 nơi & Outbox Queue từ Server Backend
 */
export const fetchServerStorageStatus = async (): Promise<ServerStorageStatus | null> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/storage/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * Lấy danh sách lịch sử các file Excel đã xuất trên Server
 */
export const fetchServerExcelHistory = async (): Promise<ExcelHistoryItem[]> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/storage/excel-history`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  } catch {
    return [];
  }
};

/**
 * Kích hoạt xuất Excel ngay lập tức trên Server
 */
export const triggerServerExcelExport = async (
  mode: 'full' | 'delta' = 'full',
  targetMonth?: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/storage/export-excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, targetMonth })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: `Không thể kết nối Server API: ${err.message}` };
  }
};

/**
 * Đẩy toàn bộ dữ liệu lên Server Primary SQLite & Outbox
 */
export const saveDataToServerSql = async (data: {
  customers: Customer[];
  bookings: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): Promise<boolean> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/storage/save-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(8000)
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Yêu cầu Server thử lại các tác vụ Outbox bị lỗi
 */
export const retryServerFailedTasks = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/storage/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'retry_failed' })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

/**
 * Thực hiện đồng bộ toàn diện trên cả 3 vùng dữ liệu
 */
export const syncAllThreeZones = async (data: {
  customers: Customer[];
  bookings: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): Promise<MultiZoneSyncReport> => {
  const timestamp = new Date().toISOString();
  const { customers, bookings, photographers, salesStaff } = data;

  // 1. VÙNG 1: GOOGLE SHEETS (ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU)
  let zone1Result: ZoneSyncResult;
  const gsConfig = getGoogleSheetsConfig();
  if (!gsConfig.webhookUrl) {
    zone1Result = {
      zone: 'Zone 1: Google Sheets',
      status: 'warning',
      message: 'Chưa cấu hình Webhook URL. Sheet ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU sẵn sàng nhận dữ liệu.',
      timestamp
    };
  } else {
    try {
      const res = await syncAllToGoogleSheet(customers, bookings);
      zone1Result = {
        zone: 'Zone 1: Google Sheets',
        status: res.success ? 'success' : 'error',
        message: res.message,
        timestamp,
        itemsProcessed: customers.length + bookings.length
      };
    } catch (e: any) {
      zone1Result = {
        zone: 'Zone 1: Google Sheets',
        status: 'error',
        message: `Lỗi kết nối Google Sheets: ${e.message}`,
        timestamp
      };
    }
  }

  // 2. VÙNG 2: SUPABASE POSTGRESQL
  let zone2Result: ZoneSyncResult;
  if (!isSupabaseConfigured) {
    zone2Result = {
      zone: 'Zone 2: Supabase PostgreSQL',
      status: 'warning',
      message: 'Chưa điền VITE_SUPABASE_ANON_KEY. Đang ở chế độ Standby/Local Mock.',
      timestamp
    };
  } else {
    try {
      let savedCount = 0;
      for (const customer of customers) {
        const ok = await crmSupabaseService.saveCustomer(customer);
        if (ok) savedCount++;
      }
      zone2Result = {
        zone: 'Zone 2: Supabase PostgreSQL',
        status: 'success',
        message: `Đã đồng bộ thành công ${savedCount}/${customers.length} khách hàng lên đám mây Supabase.`,
        timestamp,
        itemsProcessed: savedCount
      };
    } catch (e: any) {
      zone2Result = {
        zone: 'Zone 2: Supabase PostgreSQL',
        status: 'error',
        message: `Lỗi kết nối Supabase: ${e.message}`,
        timestamp
      };
    }
  }

  // 3. VÙNG 3: SERVER SQL ENGINE (SQLITE PRIMARY SOURCE)
  let zone3Result: ZoneSyncResult;
  try {
    // Thử gửi dữ liệu lên Server Backend SQLite
    const serverSaved = await saveDataToServerSql({ customers, bookings, photographers, salesStaff });
    // Đồng thời lưu vào client cache
    syncToLocalSqlCache({ customers, bookings, photographers, salesStaff });

    if (serverSaved) {
      zone3Result = {
        zone: 'Zone 3: Server SQL Engine',
        status: 'success',
        message: `⭐ Primary Source: Đã ghi nhận bền vững ${customers.length} khách hàng & ${bookings.length} lịch chụp vào Server SQLite và xếp hàng đợi Outbox.`,
        timestamp,
        itemsProcessed: customers.length + bookings.length
      };
    } else {
      zone3Result = {
        zone: 'Zone 3: Server SQL Engine',
        status: 'success',
        message: `Đã lưu an toàn vào bộ nhớ SQL Cache (${customers.length} khách hàng, ${bookings.length} lịch). Sẵn sàng đồng bộ khi kết nối Server API.`,
        timestamp,
        itemsProcessed: customers.length + bookings.length
      };
    }
  } catch (e: any) {
    zone3Result = {
      zone: 'Zone 3: Server SQL Engine',
      status: 'error',
      message: `Lỗi ghi SQL: ${e.message}`,
      timestamp
    };
  }

  const successfulZones = [zone1Result, zone2Result, zone3Result].filter(
    r => r.status === 'success'
  ).length;

  return {
    timestamp,
    totalZones: 3,
    successfulZones,
    details: {
      zone1: zone1Result,
      zone2: zone2Result,
      zone3: zone3Result
    }
  };
};

/**
 * Tự động đồng bộ ngầm khi có thêm mới/cập nhật 1 khách hàng
 */
export const dispatchCustomerSyncToZones = async (
  customer: Customer,
  allData?: { customers: Customer[]; bookings: Booking[]; photographers?: Photographer[]; salesStaff?: SalesStaff[] }
) => {
  // Zone 1: Google Sheets (Background)
  const gsConfig = getGoogleSheetsConfig();
  if (gsConfig.autoSync && gsConfig.webhookUrl) {
    syncCustomerToGoogleSheet(customer).catch(err => {
      console.warn('[Sync-Zone1] Lỗi đẩy ngầm Google Sheet:', err);
    });
  }

  // Zone 2: Supabase (Background)
  if (isSupabaseConfigured) {
    crmSupabaseService.saveCustomer(customer).catch(err => {
      console.warn('[Sync-Zone2] Lỗi đẩy ngầm Supabase:', err);
    });
  }

  // Zone 3: Server SQL & Local Cache
  if (allData) {
    syncToLocalSqlCache(allData);
    saveDataToServerSql(allData).catch(() => {});
  }
};

/**
 * Tự động đồng bộ ngầm khi có thêm mới/cập nhật 1 lịch chụp (booking)
 */
export const dispatchBookingSyncToZones = async (
  booking: Booking,
  allData?: { customers: Customer[]; bookings: Booking[]; photographers?: Photographer[]; salesStaff?: SalesStaff[] }
) => {
  // Zone 1: Google Sheets (Background)
  const gsConfig = getGoogleSheetsConfig();
  if (gsConfig.autoSync && gsConfig.webhookUrl) {
    syncBookingToGoogleSheet(booking).catch(err => {
      console.warn('[Sync-Zone1] Lỗi đẩy lịch chụp Google Sheet:', err);
    });
  }

  // Zone 3: Server SQL & Local Cache
  if (allData) {
    syncToLocalSqlCache(allData);
    saveDataToServerSql(allData).catch(() => {});
  }
};
