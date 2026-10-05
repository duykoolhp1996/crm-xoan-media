/**
 * Service Nhạc Trưởng Đồng Bộ Dữ Liệu 3 Vùng (Multi-Zone Sync Orchestrator)
 * Vùng 1: Google Sheets (ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU) - Replica Báo Cáo
 * Vùng 2: Supabase (PostgreSQL Cloud thời gian thực) - Replica Đám Mây
 * Vùng 3: Server SQL Engine (SQLite Persistent trên server) - PRIMARY SOURCE
 *
 * ⚡ LƯU CẢ 3 VÙNG ĐỒNG THỜI (Promise.allSettled) — không tuần tự, không ưu tiên
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
 * ⚡ LƯU CẢ 3 VÙNG CÙNG LÚC (Promise.allSettled — song song, không tuần tự)
 */
export const syncAllThreeZones = async (data: {
  customers: Customer[];
  bookings: Booking[];
  photographers?: Photographer[];
  salesStaff?: SalesStaff[];
}): Promise<MultiZoneSyncReport> => {
  const timestamp = new Date().toISOString();
  const { customers, bookings, photographers, salesStaff } = data;

  // ======= Khởi tạo 3 tác vụ ĐỒNG THỜI =======

  // Tác vụ 1: Supabase Cloud
  const supabaseTask = (async (): Promise<ZoneSyncResult> => {
    if (!isSupabaseConfigured()) {
      return {
        zone: 'Zone 2: Supabase PostgreSQL',
        status: 'warning',
        message: 'Chưa cấu hình API Key Supabase. Vui lòng dán Anon Key trong Cài Đặt → Lưu Trữ 3 Nơi.',
        timestamp
      };
    }
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
    return {
      zone: 'Zone 2: Supabase PostgreSQL',
      status: 'success',
      message: `☁️ Đã lưu ${savedCustCount}/${customers.length} khách hàng & ${savedBookCount}/${bookings.length} lịch chụp lên Supabase Cloud.`,
      timestamp,
      itemsProcessed: savedCustCount + savedBookCount
    };
  })();

  // Tác vụ 2: Server SQLite
  const serverSqlTask = (async (): Promise<ZoneSyncResult> => {
    const serverSaved = await saveDataToServerSql({ customers, bookings, photographers, salesStaff });
    syncToLocalSqlCache({ customers, bookings, photographers, salesStaff });
    return {
      zone: 'Zone 3: Server SQL Engine',
      status: 'success',
      message: serverSaved
        ? `🖥️ Đã ghi bền vững ${customers.length} khách hàng & ${bookings.length} lịch chụp vào Server SQLite.`
        : `🖥️ Đã lưu vào SQL Cache cục bộ (${customers.length} KH, ${bookings.length} lịch). Sẽ đồng bộ khi có mạng.`,
      timestamp,
      itemsProcessed: customers.length + bookings.length
    };
  })();

  // Tác vụ 3: Google Sheets
  const gsConfig = getGoogleSheetsConfig();
  const googleSheetsTask = (async (): Promise<ZoneSyncResult> => {
    if (!gsConfig.webhookUrl) {
      return {
        zone: 'Zone 1: Google Sheets',
        status: 'warning',
        message: 'Chưa cấu hình Webhook URL. Sheet ID: 1gbo1qA04CLJdaEsmxqudzPYdrtoAyLdVSk4AoDmo3nU đã sẵn sàng nhận dữ liệu.',
        timestamp
      };
    }
    const res = await syncAllToGoogleSheet(customers, bookings);
    return {
      zone: 'Zone 1: Google Sheets',
      status: res.success ? 'success' : 'error',
      message: res.success
        ? `📊 Đã đồng bộ ${customers.length} khách hàng & ${bookings.length} lịch chụp lên Google Sheets.`
        : res.message,
      timestamp,
      itemsProcessed: customers.length + bookings.length
    };
  })();

  // ======= Chạy song song — chờ tất cả 3 vùng hoàn thành =======
  const [supabaseSettled, serverSqlSettled, googleSheetsSettled] = await Promise.allSettled([
    supabaseTask,
    serverSqlTask,
    googleSheetsTask
  ]);

  const resolveResult = (settled: PromiseSettledResult<ZoneSyncResult>, fallbackZone: ZoneSyncResult['zone']): ZoneSyncResult => {
    if (settled.status === 'fulfilled') return settled.value;
    return {
      zone: fallbackZone,
      status: 'error',
      message: `Lỗi không xác định: ${settled.reason?.message || 'Unknown error'}`,
      timestamp
    };
  };

  const zoneSupabaseResult = resolveResult(supabaseSettled, 'Zone 2: Supabase PostgreSQL');
  const zoneServerResult = resolveResult(serverSqlSettled, 'Zone 3: Server SQL Engine');
  const zoneSheetsResult = resolveResult(googleSheetsSettled, 'Zone 1: Google Sheets');

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
 * ⚡ Đồng bộ ngầm khi có thêm mới/cập nhật 1 khách hàng — LƯU CẢ 3 VÙNG CÙNG LÚC
 */
export const dispatchCustomerSyncToZones = (
  customer: Customer,
  allData?: { customers: Customer[]; bookings: Booking[]; photographers?: Photographer[]; salesStaff?: SalesStaff[] }
) => {
  // Supabase Cloud — song song
  if (isSupabaseConfigured()) {
    crmSupabaseService.saveCustomer(customer)
      .then(ok => {
        if (ok) console.log(`[Sync-3Zones] ☁️ Supabase: Đã lưu khách hàng ${customer.name}`);
      })
      .catch(err => console.warn('[Sync-3Zones] ☁️ Supabase lỗi:', err));
  }

  // Server SQLite & Local Cache — song song
  if (allData) {
    syncToLocalSqlCache(allData);
    saveDataToServerSql(allData)
      .then(ok => {
        if (ok) console.log(`[Sync-3Zones] 🖥️ Server SQL: Đã lưu khách hàng ${customer.name}`);
      })
      .catch(() => {});
  }

  // Google Sheets — song song
  const gsConfig = getGoogleSheetsConfig();
  if (gsConfig.autoSync && gsConfig.webhookUrl) {
    syncCustomerToGoogleSheet(customer)
      .then(() => console.log(`[Sync-3Zones] 📊 Google Sheets: Đã lưu khách hàng ${customer.name}`))
      .catch(err => console.warn('[Sync-3Zones] 📊 Google Sheets lỗi:', err));
  }
};

/**
 * ⚡ Đồng bộ ngầm khi có thêm mới/cập nhật 1 lịch chụp — LƯU CẢ 3 VÙNG CÙNG LÚC
 */
export const dispatchBookingSyncToZones = (
  booking: Booking,
  allData?: { customers: Customer[]; bookings: Booking[]; photographers?: Photographer[]; salesStaff?: SalesStaff[] }
) => {
  // Supabase Cloud — song song
  if (isSupabaseConfigured()) {
    crmSupabaseService.saveBooking(booking)
      .then(ok => {
        if (ok) console.log(`[Sync-3Zones] ☁️ Supabase: Đã lưu lịch chụp ${booking.code || booking.id}`);
      })
      .catch(err => console.warn('[Sync-3Zones] ☁️ Supabase lỗi:', err));
  }

  // Server SQLite & Local Cache — song song
  if (allData) {
    syncToLocalSqlCache(allData);
    saveDataToServerSql(allData)
      .then(ok => {
        if (ok) console.log(`[Sync-3Zones] 🖥️ Server SQL: Đã lưu lịch chụp ${booking.code || booking.id}`);
      })
      .catch(() => {});
  }

  // Google Sheets — song song
  const gsConfig = getGoogleSheetsConfig();
  if (gsConfig.autoSync && gsConfig.webhookUrl) {
    syncBookingToGoogleSheet(booking)
      .then(() => console.log(`[Sync-3Zones] 📊 Google Sheets: Đã lưu lịch chụp ${booking.code || booking.id}`))
      .catch(err => console.warn('[Sync-3Zones] 📊 Google Sheets lỗi:', err));
  }
};
