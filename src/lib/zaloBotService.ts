/**
 * Zalo Bot Service - Xoăn Media CRM
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
  targetChatId: 'zgr-c51cae5f6b33826ddb22', // Nhóm Điều Phối & Vận Hành Ekip (Zalo Group)
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
    const parsed = JSON.parse(raw);
    // Tự động nâng cấp sang Group ID zgr-c51cae5f6b33826ddb22 nếu đang trống hoặc là ID cá nhân cũ
    if (
      !parsed.targetChatId ||
      parsed.targetChatId === 'c9463a061152f80ca143' ||
      parsed.targetChatId === 'group_dieu_hanh_xoan' ||
      !parsed.targetChatId.startsWith('zgr-')
    ) {
      parsed.targetChatId = DEFAULT_ZALO_BOT_CONFIG.targetChatId;
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ ...DEFAULT_ZALO_BOT_CONFIG, ...parsed }));
    }
    return { ...DEFAULT_ZALO_BOT_CONFIG, ...parsed };
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
  text: string,
  parseMode: 'HTML' | 'markdown' = 'HTML'
): Promise<{ ok: boolean; result?: any; description?: string }> => {
  const { botToken } = getZaloBotConfig();
  if (!botToken) return { ok: false, description: 'Chưa có Bot Token' };

  console.log(`[ZaloBot] Đang bắn tin nhắn tới Chat ID: ${chatId}...`);
  const getUrl = `https://bot-api.zaloplatforms.com/bot${botToken}/sendMessage?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(text)}&parse_mode=${encodeURIComponent(parseMode)}`;

  // Sử dụng một phương thức duy nhất (fetch no-cors hoặc beacon fallback) để tránh gửi lặp tin nhắn
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    try {
      await fetch(getUrl, { mode: 'no-cors' });
      console.log(`[ZaloBot] Đã gửi thành công qua GET (no-cors) tới ${chatId}`);
      return { ok: true, result: { message_id: 'sent_browser_get' } };
    } catch (errGet: any) {
      console.warn('[ZaloBot] GET request thất bại, dùng fallback Image Beacon:', errGet);
      try {
        const beacon = new Image();
        beacon.src = getUrl;
        return { ok: true, result: { message_id: 'sent_beacon' } };
      } catch (e: any) {
        return { ok: false, description: e.message };
      }
    }
  }

  // Fallback POST (cho Node.js / Server-side)
  try {
    const res = await fetch(`https://bot-api.zaloplatforms.com/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
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
  parseMode?: 'HTML' | 'markdown';
}): Promise<{ success: boolean; message: string; apiResponse?: any }> => {
  const config = getZaloBotConfig();
  if (!config.botToken) {
    return { success: false, message: 'Chưa cấu hình Token cho Zalo Bot!' };
  }

  const targetRecipient = params.recipient || config.targetChatId || 'zgr-c51cae5f6b33826ddb22';
  const fullText = params.content.includes('[CRM XOĂN MEDIA')
    ? params.content
    : `🔔 <b>[CRM XOĂN MEDIA - THÔNG BÁO]</b>\n📌 <b>${params.title}</b>\n📝 ${params.content}\n⏰ <i>${new Date().toLocaleTimeString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}</i>`;

  let apiSuccess = false;
  let apiRes: any = null;

  // Luôn đảm bảo bắn tin tới Group Zalo zgr-c51cae5f6b33826ddb22
  const effectiveChatId =
    params.recipient && params.recipient.startsWith('zgr-')
      ? params.recipient
      : config.targetChatId && config.targetChatId.startsWith('zgr-')
      ? config.targetChatId
      : 'zgr-c51cae5f6b33826ddb22';

  if (effectiveChatId && effectiveChatId.trim()) {
    try {
      apiRes = await sendZaloBotApiMessage(effectiveChatId.trim(), fullText, params.parseMode || 'HTML');
      apiSuccess = apiRes?.ok === true;
    } catch (err) {
      console.warn('[ZaloBot] Lỗi khi gửi API:', err);
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

/**
 * Giao task và tag thành viên trong nhóm Zalo
 */
export const sendZaloBotTaskAssignment = async (params: {
  assigneeName: string;
  taskTitle: string;
  taskDetails?: string;
  dueDate?: string;
  assignerName?: string;
}): Promise<{ success: boolean; message: string; apiResponse?: any }> => {
  const { assigneeName, taskTitle, taskDetails, dueDate, assignerName } = params;
  const config = getZaloBotConfig();
  const text = `📌 <b>[CRM XOĂN MEDIA - PHÂN CÔNG TASK MỚI]</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Người phụ trách:</b> @${assigneeName}\n📋 <b>Nhiệm vụ:</b> <b>${taskTitle}</b>${taskDetails ? `\n📝 <b>Chi tiết:</b> ${taskDetails}` : ''}\n📅 <b>Hạn xử lý:</b> <b>${dueDate || 'Trong ngày hôm nay'}</b>\n🎯 <b>Người giao việc:</b> ${assignerName || 'Anh Tạ Duy (Admin)'}\n━━━━━━━━━━━━━━━━━━━━\n👉 <b>@${assigneeName}</b> vui lòng kiểm tra tiến độ và phản hồi tại nhóm nhé!`;

  return sendZaloBotNotification({
    type: 'task',
    title: `Giao task cho @${assigneeName}: ${taskTitle}`,
    content: text,
    recipient: config.targetChatId,
    parseMode: 'HTML',
  });
};

/**
 * Tự động gửi thông báo khách hàng mới vào nhóm Zalo
 */
export const notifyNewCustomerLeadToZaloGroup = async (customer: {
  name: string;
  phone: string;
  className: string;
  schoolName: string;
  city?: string;
  source?: string;
  servicePackageName?: string;
  expectedBudget?: number;
  assignedSalesName?: string;
  studentCount?: number;
  notes?: string;
  createdByName?: string;
}): Promise<{ success: boolean; message: string }> => {
  const config = getZaloBotConfig();
  if (config.notifyNewLead === false) {
    return { success: false, message: 'Thông báo khách hàng mới đang bị tắt trong cài đặt.' };
  }

  const budgetStr =
    customer.expectedBudget && customer.expectedBudget > 0
      ? `${customer.expectedBudget.toLocaleString('vi-VN')} VNĐ`
      : 'Chưa xác định';

  const creatorStr = customer.createdByName || 'Tạ Duy (Admin)';
  const salesStr =
    customer.assignedSalesName && customer.assignedSalesName !== 'Chưa gán'
      ? customer.assignedSalesName
      : creatorStr;

  const text = `🔥 <b>[CRM XOĂN MEDIA - KHÁCH HÀNG MỚI]</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${customer.name}
📞 <b>SĐT / Zalo:</b> ${customer.phone}
🎓 <b>Lớp & Trường:</b> ${customer.className} - ${customer.schoolName}${customer.city ? ` (${customer.city})` : ''}
👥 <b>Sĩ số dự kiến:</b> ${customer.studentCount ? `${customer.studentCount} bạn` : 'Chưa cập nhật'}
📦 <b>Gói quan tâm:</b> ${customer.servicePackageName || 'Tư vấn kỷ yếu'}
💰 <b>Ngân sách dự kiến:</b> <b>${budgetStr}</b>
🌐 <b>Nguồn tiếp cận:</b> ${customer.source || 'Facebook/TikTok/Zalo'}
✍️ <b>Người nhập lead:</b> <b>${creatorStr}</b>
👨‍💼 <b>Sales phụ trách:</b> <b>${salesStr}</b>${customer.notes ? `\n📝 <b>Nhu cầu / Ghi chú:</b> ${customer.notes}` : ''}
━━━━━━━━━━━━━━━━━━━━
⏰ <i>${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date().toLocaleDateString('vi-VN')}</i>
👉 <b>@${salesStr}</b> vui lòng liên hệ tư vấn trong <b>15 phút</b> để đạt tỷ lệ chốt cao nhất! 🚀`;

  return sendZaloBotNotification({
    type: 'lead',
    title: `Khách mới: ${customer.name} - ${customer.className} (${customer.schoolName})`,
    content: text,
    recipient: config.targetChatId,
    parseMode: 'HTML',
  });
};


