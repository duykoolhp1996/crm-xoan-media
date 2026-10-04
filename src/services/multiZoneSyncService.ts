/**
 * Service Nhạc Trưởng Đồng Bộ Dữ Liệu 3 Vùng (Multi-Zone Sync Orchestrator)
 * Vùng 1: Google Sheets (Bảng tính Google tự động qua Webhook / CSV)
 * Vùng 2: Supabase (PostgreSQL Cloud thời gian thực)
 * Vùng 3: Local SQL (Cơ sở dữ liệu nội bộ CRM App, SQL Dump & JSON Backup)
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

export interface ZoneSyncResult {
  zone: 'Zone 1: Google Sheets' | 'Zone 2: Supabase PostgreSQL' | 'Zone 3: SQL CRM App';
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

  // 1. VÙNG 1: GOOGLE SHEETS
  let zone1Result: ZoneSyncResult;
  const gsConfig = getGoogleSheetsConfig();
  if (!gsConfig.webhookUrl) {
    zone1Result = {
      zone: 'Zone 1: Google Sheets',
      status: 'warning',
      message: 'Chưa cấu hình URL Webhook Google Sheets. Có thể tải file CSV hoặc cấu hình trong Cài Đặt.',
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
      message: 'Chưa thiết lập biến môi trường VITE_SUPABASE_URL & ANON_KEY. Dữ liệu đang chạy ở chế độ Local Mock.',
      timestamp
    };
  } else {
    try {
      let savedCount = 0;
      // Đồng bộ danh sách khách hàng lên Supabase
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

  // 3. VÙNG 3: LOCAL SQL APP STORAGE
  let zone3Result: ZoneSyncResult;
  try {
    const ok = syncToLocalSqlCache({ customers, bookings, photographers, salesStaff });
    zone3Result = {
      zone: 'Zone 3: SQL CRM App',
      status: ok ? 'success' : 'error',
      message: ok
        ? `Đã cập nhật bộ nhớ cache SQL và cấu trúc bảng (${customers.length} khách hàng, ${bookings.length} lịch chụp). Sẵn sàng xuất tệp .sql dump.`
        : 'Không thể ghi vào bộ nhớ cục bộ.',
      timestamp,
      itemsProcessed: customers.length + bookings.length
    };
  } catch (e: any) {
    zone3Result = {
      zone: 'Zone 3: SQL CRM App',
      status: 'error',
      message: `Lỗi ghi SQL cục bộ: ${e.message}`,
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

  // Zone 3: Local SQL Cache
  if (allData) {
    syncToLocalSqlCache(allData);
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

  // Zone 3: Local SQL Cache
  if (allData) {
    syncToLocalSqlCache(allData);
  }
};
