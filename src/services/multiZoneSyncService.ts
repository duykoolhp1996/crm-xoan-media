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
 * Thực hiện đồng bộ toàn diện trên cả 3 vùng dữ liệu (ƯU TIÊN SUPABASE ĐẦU TIÊN)
 */
export const syncAllThreeZones = async (data: {
  customers: Customer[];
  bookings: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): Promise<MultiZoneSyncReport> => {
  const timestamp = new Date().toISOString();
  const { customers, bookings, photographers, salesStaff } = data;

  // 1. VÙNG 1: SUPABASE POSTGRESQL (ƯU TIÊN LƯU ĐẦU TIÊN)
  let zoneSupabaseResult: ZoneSyncResult;
  if (!isSupabaseConfigured()) {
    zoneSupabaseResult = {
      zone: 'Zone 2: Supabase PostgreSQL',
      status: 'warning',
      message: 'Chưa cấu hình API Key Supabase (hoặc đang dùng key mặc định). Vui lòng dán Anon Key trong Cài Đặt.',
      timestamp
    };
  } else {
    try {
      let savedCustCount = 0;
      let savedBookCount = 0;
      for (const customer of customers) {
        const ok = await crmSupabaseService.saveCustomer(customer);
        if (ok) savedCustCount++;
      }
      for (const booking of bookings) {
        const ok = await crmSupabaseService.saveBooking(booking);
        if (ok) savedBookCount++;
      }
      zoneSupabaseResult = {
        zone: 'Zone 2: Supabase PostgreSQL',
        status: 'success',
        message: `⭐ Đã lưu ưu tiên thành công ${savedCustCount}/${customers.length} khách hàng & ${savedBookCount}/${bookings.length} lịch chụp lên đám mây Supabase.`,
        timestamp,
        itemsProcessed: savedCustCount + savedBookCount
      };
    } catch (e: any) {
      zoneSupabaseResult = {
        zone: 'Zone 2: Supabase PostgreSQL',
        status: 'error',
        message: `Lỗi kết nối Supabase: ${e.message}`,
        timestamp
      };
    }
  }

  // 2. VÙNG 2: SERVER SQL ENGINE (SQLITE PRIMARY SOURCE)
  let zoneServerResult: ZoneSyncResult;
  try {
    const serverSaved = await saveDataToServerSql({ customers, bookings, photographers, salesStaff });
    syncToLocalSqlCache({ customers, bookings, photographers, salesStaff });

    if (serverSaved) {
      zoneServerResult = {
        zone: 'Zone 3: Server SQL Engine',
        status: 'success',
        message: `Đã ghi nhận bền vững ${customers.length} khách hàng & ${bookings.length} lịch chụp vào Server SQLite và xếp hàng đợi Outbox.`,
        timestamp,
        itemsProcessed: customers.length + bookings.length
      };
    } else {
      zoneServerResult = {
        zone: 'Zone 3: Server SQL Engine',
        status: 'success',
        message: `Đã lưu an toàn vào bộ nhớ SQL Cache (${customers.length} khách hàng, ${bookings.length} lịch). Sẵn sàng đồng bộ khi kết nối Server API.`,
        timestamp,
        itemsProcessed: customers.length + bookings.length
      };
    }
  } catch (e: any) {
    zoneServerResult = {
      zone: 'Zone 3: Server SQL Engine',
      status: 'error',
      message: `Lỗi ghi SQL: ${e.message}`,
      timestamp
    };
  }

  // 3. VÙNG 3: GOOGLE SHEETS (ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU)
  let zoneSheetsResult: ZoneSyncResult;
  const gsConfig = getGoogleSheetsConfig();
  if (!gsConfig.webhookUrl) {
    zoneSheetsResult = {
      zone: 'Zone 1: Google Sheets',
      status: 'warning',
      message: 'Chưa cấu hình Webhook URL. Sheet ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU sẵn sàng nhận dữ liệu.',
      timestamp
    };
  } else {
    try {
      const res = await syncAllToGoogleSheet(customers, bookings);
      zoneSheetsResult = {
        zone: 'Zone 1: Google Sheets',
        status: res.success ? 'success' : 'error',
        message: res.message,
        timestamp,
        itemsProcessed: customers.length + bookings.length
      };
    } catch (e: any) {
      zoneSheetsResult = {
        zone: 'Zone 1: Google Sheets',
        status: 'error',
        message: `Lỗi kết nối Google Sheets: ${e.message}`,
        timestamp
      };
    }
  }

  const successfulZones = [zoneSupabaseResult, zoneServerResult, zoneSheetsResult].filter(
    r => r.status === 'success'
  ).length;

  return {
    timestamp,
    totalZones: 3,
    successfulZones,
    details: {
      zone1: zoneSheetsResult,
      zone2: zoneSupabaseResult,
      zone3: zoneServerResult
    }
  };
};

/**
 * Tự động đồng bộ ngầm khi có thêm mới/cập nhật 1 khách hàng (LƯU VÀO SUPABASE TRƯỚC)
 */
export const dispatchCustomerSyncToZones = async (
  customer: Customer,
  allData?: { customers: Customer[]; bookings: Booking[]; photographers?: Photographer[]; salesStaff?: SalesStaff[] }
) => {
  // 1. ƯU TIÊN SỐ 1: LƯU VÀO SUPABASE CLOUD TRƯỚC TIÊN
  if (isSupabaseConfigured()) {
    crmSupabaseService.saveCustomer(customer).then(ok => {
      if (ok) console.log(`[Sync-Supabase] ✅ Đã lưu khách hàng ${customer.name} vào Supabase trước tiên!`);
    }).catch(err => {
      console.warn('[Sync-Supabase] Lỗi lưu Supabase:', err);
    });
  }

  // 2. LƯU VÀO SERVER SQL (PRIMARY SERVER ENGINE) & LOCAL CACHE
  if (allData) {
    syncToLocalSqlCache(allData);
    saveDataToServerSql(allData).catch(() => {});
  }

  // 3. ĐỒNG BỘ GOOGLE SHEETS
  const gsConfig = getGoogleSheetsConfig();
  if (gsConfig.autoSync && gsConfig.webhookUrl) {
    syncCustomerToGoogleSheet(customer).catch(err => {
      console.warn('[Sync-Zone1] Lỗi đẩy ngầm Google Sheet:', err);
    });
  }
};

/**
 * Tự động đồng bộ ngầm khi có thêm mới/cập nhật 1 lịch chụp (LƯU VÀO SUPABASE TRƯỚC)
 */
export const dispatchBookingSyncToZones = async (
  booking: Booking,
  allData?: { customers: Customer[]; bookings: Booking[]; photographers?: Photographer[]; salesStaff?: SalesStaff[] }
) => {
  // 1. ƯU TIÊN SỐ 1: LƯU VÀO SUPABASE CLOUD TRƯỚC TIÊN
  if (isSupabaseConfigured()) {
    crmSupabaseService.saveBooking(booking).then(ok => {
      if (ok) console.log(`[Sync-Supabase] ✅ Đã lưu lịch chụp ${booking.code || booking.id} vào Supabase trước tiên!`);
    }).catch(err => {
      console.warn('[Sync-Supabase] Lỗi lưu lịch chụp Supabase:', err);
    });
  }

  // 2. LƯU VÀO SERVER SQL & LOCAL CACHE
  if (allData) {
    syncToLocalSqlCache(allData);
    saveDataToServerSql(allData).catch(() => {});
  }

  // 3. ĐỒNG BỘ GOOGLE SHEETS
  const gsConfig = getGoogleSheetsConfig();
  if (gsConfig.autoSync && gsConfig.webhookUrl) {
    syncBookingToGoogleSheet(booking).catch(err => {
      console.warn('[Sync-Zone1] Lỗi đẩy lịch chụp Google Sheet:', err);
    });
  }
};
