// src/services/facebookApiService.ts
// Service tích hợp trực tiếp Facebook Graph API (Messenger Platform) cho CRM Xoăn Media

export interface FacebookApiResponse<T> {
  data: T[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface FbParticipant {
  name: string;
  email: string;
  id: string;
}

export interface FbRawMessage {
  id: string;
  message?: string;
  created_time: string;
  from: FbParticipant;
  attachments?: {
    data: Array<{
      id: string;
      mime_type?: string;
      name?: string;
      file_url?: string;
      image_data?: {
        url: string;
        preview_url?: string;
      };
    }>;
  };
}

export interface FbRawConversation {
  id: string;
  updated_time: string;
  unread_count: number;
  participants: {
    data: FbParticipant[];
  };
  messages?: {
    data: FbRawMessage[];
  };
}

const DEFAULT_PAGE_TOKEN = 'EAAPYDkXqBPoBSn5CYIfZAkhaB3wnzKRyrfr4p2vfW3PdQF2SgceOtFuwfc6GT2aQE9r8dnZBZADYVE9nR1qFZCVYWXRMTwLZAX5MZBSrJISquZCZBA30jULSUMUMeDzeCRbCKex2E1a42AXrdrHNn3RHzaDRbuVSdgXHHRvwtGo0giN0Ts1JmDIULryzeNtZB0ysWK60aNGSjOaI9XHfC06ZAuuJ4QIgPc3w2r0XZC3QPSTkwBf2fqK2sgDetkZD';
const DEFAULT_PAGE_ID = '111065964964204';
const DEFAULT_APP_ID = '1438809894822067';
const DEFAULT_APP_SECRET = 'aea735928835d4cb8ffebd651a5e83be';

export class FacebookApiService {
  private static tokenKey = 'crm_xoan_fb_page_token';
  private static pageIdKey = 'crm_xoan_fb_page_id';
  private static appIdKey = 'crm_xoan_fb_app_id';
  private static appSecretKey = 'crm_xoan_fb_app_secret';

  public static getAppId(): string {
    return localStorage.getItem(this.appIdKey) || DEFAULT_APP_ID;
  }

  public static setAppId(appId: string): void {
    localStorage.setItem(this.appIdKey, appId.trim());
  }

  public static getAppSecret(): string {
    return localStorage.getItem(this.appSecretKey) || DEFAULT_APP_SECRET;
  }

  public static setAppSecret(appSecret: string): void {
    localStorage.setItem(this.appSecretKey, appSecret.trim());
  }

  public static getAppToken(): string {
    return `${this.getAppId()}|${this.getAppSecret()}`;
  }

  public static getPageToken(): string {
    const saved = localStorage.getItem(this.tokenKey);
    if (!saved || saved.startsWith('EAAUclwiuILM')) {
      return DEFAULT_PAGE_TOKEN;
    }
    return saved;
  }

  public static setPageToken(token: string): void {
    localStorage.setItem(this.tokenKey, token.trim());
  }

  public static getPageId(): string {
    const saved = localStorage.getItem(this.pageIdKey);
    if (!saved || saved === '411200738737677' || saved === '100083303952726') {
      return DEFAULT_PAGE_ID;
    }
    return saved;
  }

  public static setPageId(pageId: string): void {
    localStorage.setItem(this.pageIdKey, pageId.trim());
  }

  /**
   * Kiểm tra và phân tích thông tin chi tiết của Token qua Meta Debugger
   */
  public static async debugToken(inputToken?: string) {
    const token = inputToken || this.getPageToken();
    const appToken = this.getAppToken();
    const res = await fetch(`https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(appToken)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể kiểm tra token với Meta API');
    }
    return data.data;
  }

  /**
   * Lấy thông tin Fanpage hiện tại
   */
  public static async getPageInfo() {
    const token = this.getPageToken();
    const res = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture{url}&access_token=${token}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể lấy thông tin Fanpage');
    }
    return data;
  }

  /**
   * Lấy danh sách hội thoại từ Fanpage
   */
  public static async getConversations(): Promise<FbRawConversation[]> {
    const token = this.getPageToken();
    const pageId = this.getPageId();

    const fields = 'id,updated_time,unread_count,participants,messages.limit(25){id,message,created_time,from,attachments}';
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=${fields}&access_token=${token}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể tải danh sách hội thoại Facebook');
    }

    return data.data || [];
  }

  /**
   * Lấy danh sách tin nhắn chi tiết trong 1 cuộc hội thoại
   */
  public static async getMessages(conversationId: string): Promise<FbRawMessage[]> {
    const token = this.getPageToken();
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,attachments&limit=40&access_token=${token}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Không thể tải tin nhắn cuộc hội thoại');
    }

    return data.data || [];
  }

  /**
   * Gửi tin nhắn từ Fanpage đến khách hàng (PSID)
   */
  public static async sendMessage(recipientPsid: string, text: string) {
    const token = this.getPageToken();

    // Cố gắng gửi với tin nhắn thông thường
    let payload: Record<string, any> = {
      recipient: { id: recipientPsid },
      messaging_type: 'RESPONSE',
      message: { text }
    };

    let res = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data = await res.json();

    if (!res.ok) {
      if (data.error?.error_subcode === 2018278 || (data.error?.code === 10 && data.error?.message?.includes('khoảng thời gian'))) {
        throw new Error('Đã quá cửa sổ 24 giờ của Facebook (Khách chưa nhắn lại quá 24h). Khách chỉ cần nhắn 1 tin mới vào Page là chat lại được ngay.');
      }
      if (data.error?.error_subcode === 2018300 || (data.error?.code === 10 && data.error?.message?.includes('kiểm soát thread'))) {
        throw new Error('Fanpage đang bật "Tác nhân AI" (Meta AI Agent) kiểm soát hội thoại này. Bạn vào Hộp thư Meta Business Suite bấm "Tiếp quản cuộc trò chuyện" (Take over) là CRM gửi được ngay.');
      }
      throw new Error(data.error?.message || 'Lỗi gửi tin nhắn qua Facebook Graph API');
    }

    return data;
  }
}
