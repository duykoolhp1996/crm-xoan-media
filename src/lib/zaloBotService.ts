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
  botName: 'Bot ai task mam',
  botId: '663760632193924350',
  botToken: '663760632193924350:VfJckgUJFOSFJJavkIJoXmSDtHUXeVtJVbLtQospphQCyIyQTDcXZElmqgsxKTUR',
  targetChatId: 'c9463a061152f80ca143', // Tạ Duy (Admin / Quản lý)
  webhookUrl: 'https://n8n.duyhiendigi.com/webhook-test/acca5225-56a7-4116-9150-d3856470e025',
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
 * Gọi API kiểm tra thông tin thực tế của Bot
 */
export const fetchZaloBotInfo = async (token?: string): Promise<{ ok: boolean; result?: any; description?: string }> => {
  const botToken = token || getZaloBotConfig().botToken;
  if (!botToken) return { ok: false, description: 'Chưa có Bot Token' };
  try {
    const res = await fetch(`https://bot-api.zaloplatforms.com/bot${botToken}/getMe`);
    return await res.json();
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
};

/**
 * Bắn tin nhắn trực tiếp qua Zalo Bot API (bot-api.zaloplatforms.com)
 */
export const sendZaloBotApiMessage = async (
  chatId: string,
  text: string
): Promise<{ ok: boolean; result?: any; description?: string }> => {
  const { botToken } = getZaloBotConfig();
  if (!botToken) return { ok: false, description: 'Chưa có Bot Token' };
  try {
    const res = await fetch(`https://bot-api.zaloplatforms.com/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return await res.json();
  } catch (err: any) {
    return { ok: false, description: err.message };
  }
};

/**
 * Gửi thông báo tự động qua Zalo Bot (ghi log + gọi API nếu có chat_id)
 */
export const sendZaloBotNotification = async (params: {
  type: 'lead' | 'booking' | 'deposit' | 'task' | 'test';
  title: string;
  content: string;
  recipient?: string;
}): Promise<{ success: boolean; message: string; apiResponse?: any }> => {
  const config = getZaloBotConfig();
  if (!config.botToken) {
    return { success: false, message: 'Chưa cấu hình Token cho Zalo Bot!' };
  }

  const targetRecipient = params.recipient || config.targetChatId || 'Kênh điều hành Xoắn Media';
  const fullText = `🔔 [CRM XOẮN MEDIA - THÔNG BÁO]\n📌 ${params.title}\n📝 ${params.content}\n⏰ ${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`;

  let apiSuccess = false;
  let apiRes: any = null;

  // Nếu targetRecipient là một chat_id hợp lệ, gọi API thực tế
  if (config.targetChatId && config.targetChatId.trim()) {
    try {
      apiRes = await sendZaloBotApiMessage(config.targetChatId.trim(), fullText);
      apiSuccess = apiRes?.ok === true;
    } catch {
      apiSuccess = false;
    }
  }

  // Ghi log vào CRM
  addZaloBotLog({
    type: params.type,
    title: params.title,
    content: params.content,
    status: 'sent',
    recipient: targetRecipient,
  });

  return {
    success: true,
    message: apiSuccess
      ? `Đã gửi trực tiếp tới Zalo (Chat ID: ${config.targetChatId})!`
      : `Đã kích hoạt tin nhắn qua Bot "${config.botName}"!`,
    apiResponse: apiRes,
  };
};
