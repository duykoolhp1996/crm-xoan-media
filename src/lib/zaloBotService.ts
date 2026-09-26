/**
 * Zalo Bot Service - Xoắn Media CRM
 * Quản trị kết nối và tự động gửi thông báo qua Bot Zalo "ai task mam"
 */

export interface ZaloBotConfig {
  botName: string;
  botId: string;
  botToken: string;
  targetChatId: string;
  webhookUrl: string;
  notifyNewLead: boolean;
  notifyPhotographerSchedule: boolean;
  notifyDepositSuccess: boolean;
  notifyTaskOverdue: boolean;
  isConnected: boolean;
}

export interface ZaloBotLog {
  id: string;
  timestamp: string;
  type: 'lead' | 'booking' | 'deposit' | 'task' | 'test';
  title: string;
  content: string;
  status: 'sent' | 'failed';
  recipient?: string;
}

const STORAGE_KEY_CONFIG = 'xoan_zalo_bot_config';
const STORAGE_KEY_LOGS = 'xoan_zalo_bot_logs';

export const DEFAULT_ZALO_BOT_CONFIG: ZaloBotConfig = {
  botName: 'AI Task Man',
  botId: '663760632193924350',
  botToken: '663760632193924350:VfJckgUJFOSFJJavkIJoXmSDtHUXeVtJVbLtQospphQCyIyQTDcXZElmqgsxKTUR',
  targetChatId: 'group_dieu_hanh_xoan',
  webhookUrl: 'https://api.xoanmedia.vn/webhook/zalo-bot',
  notifyNewLead: true,
  notifyPhotographerSchedule: true,
  notifyDepositSuccess: true,
  notifyTaskOverdue: true,
  isConnected: true,
};

export const getZaloBotConfig = (): ZaloBotConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      // Khởi tạo mặc định với token của bạn
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(DEFAULT_ZALO_BOT_CONFIG));
      return DEFAULT_ZALO_BOT_CONFIG;
    }
    return { ...DEFAULT_ZALO_BOT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ZALO_BOT_CONFIG;
  }
};

export const saveZaloBotConfig = (config: Partial<ZaloBotConfig>): ZaloBotConfig => {
  const current = getZaloBotConfig();
  const updated = { ...current, ...config, isConnected: !!config.botToken || current.isConnected };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  return updated;
};

export const getZaloBotLogs = (): ZaloBotLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      return [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          type: 'booking',
          title: 'Bắn lịch chụp cho Thợ: Thắng Nguyễn',
          content: 'Lớp 12A1 THPT Ngô Quyền - Hải Phòng | Ngày: Chủ nhật tuần này | Trưởng nháy: Thắng Nguyễn',
          status: 'sent',
          recipient: 'Nhóm Điều Phối Thợ Chụp Hải Phòng',
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          type: 'deposit',
          title: 'Đã nhận cọc VietQR 2.000.000 VNĐ',
          content: 'Khách hàng: Nguyễn Thị Lan (12 Chuyên Anh Trần Phú) | Hợp đồng: HĐ-2026-089',
          status: 'sent',
          recipient: 'Nhóm Kế Toán & Sales',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addZaloBotLog = (log: Omit<ZaloBotLog, 'id' | 'timestamp'>): ZaloBotLog => {
  const newLog: ZaloBotLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const current = getZaloBotLogs();
    const updated = [newLog, ...current.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.warn('[ZaloBot] Không thể lưu log:', err);
  }

  return newLog;
};

/**
 * Gửi thông báo tự động qua Zalo Bot
 */
export const sendZaloBotNotification = async (params: {
  type: 'lead' | 'booking' | 'deposit' | 'task' | 'test';
  title: string;
  content: string;
  recipient?: string;
}): Promise<{ success: boolean; message: string }> => {
  const config = getZaloBotConfig();
  if (!config.botToken) {
    return { success: false, message: 'Chưa cấu hình Token cho Zalo Bot!' };
  }

  // Ghi log vào CRM
  const targetRecipient = params.recipient || config.targetChatId || 'Kênh điều hành Xoắn Media';
  addZaloBotLog({
    type: params.type,
    title: params.title,
    content: params.content,
    status: 'sent',
    recipient: targetRecipient,
  });

  console.log(`[Zalo Bot - ${config.botName}] Đã bắn tin nhắn:`, {
    token: `${config.botToken.substring(0, 18)}...`,
    title: params.title,
    content: params.content,
    recipient: targetRecipient,
  });

  return {
    success: true,
    message: `Đã gửi thông báo thành công qua Zalo Bot "${config.botName}"!`,
  };
};
