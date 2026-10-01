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

const DEFAULT_PAGE_TOKEN = 'EAAUclwiuILMBSnEqBXJuUSZBxPbZAz5nURKtlRJvHp8WGioMFgUiPZCVvZBxay0qJQjwt4MV9wDoiy25luvZC0oKUKWLz1qHPf4QFuM8ITXLOr4zBZAA6ZCw8kL1luV0qSx8wfTecxGd56AQkp2Ob6IMWYwKkOjXIadVWMqkKqtT4fGwRJm4rnMymQGhUwzuwIRuZBETwTLZAnAUJlv0J3t5fuwZDZD';
const DEFAULT_PAGE_ID = '411200738737677';

export class FacebookApiService {
  private static tokenKey = 'crm_xoan_fb_page_token';
  private static pageIdKey = 'crm_xoan_fb_page_id';

  public static getPageToken(): string {
    return localStorage.getItem(this.tokenKey) || DEFAULT_PAGE_TOKEN;
  }

  public static setPageToken(token: string): void {
    localStorage.setItem(this.tokenKey, token.trim());
  }

  public static getPageId(): string {
    return localStorage.getItem(this.pageIdKey) || DEFAULT_PAGE_ID;
  }

  public static setPageId(pageId: string): void {
    localStorage.setItem(this.pageIdKey, pageId.trim());
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
      if (data.error?.code === 10 || data.error?.error_subcode === 2018278) {
        throw new Error('Đã quá cửa sổ 24 giờ của Facebook (Khách chưa nhắn lại quá 24h). Khách chỉ cần nhắn 1 tin mới vào Page là chat lại được ngay.');
      }
      throw new Error(data.error?.message || 'Lỗi gửi tin nhắn qua Facebook Graph API');
    }

    return data;
  }
}
