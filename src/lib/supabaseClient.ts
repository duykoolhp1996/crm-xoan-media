import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://etvbrbdysphrfzvnwvbk.supabase.co';

export const getStoredSupabaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('xoan_supabase_url');
    if (saved && saved.trim()) return saved.trim();
  }
  return (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_URL;
};

export const getStoredSupabaseKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('xoan_supabase_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
};

let clientInstance: SupabaseClient | null = null;

export const initSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const targetUrl = url || getStoredSupabaseUrl();
  const targetKey = key || getStoredSupabaseKey();

  if (targetUrl && targetKey && targetKey !== 'YOUR_SUPABASE_ANON_KEY') {
    try {
      clientInstance = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return clientInstance;
    } catch (e) {
      console.error('Lỗi khởi tạo Supabase Client:', e);
      clientInstance = null;
      return null;
    }
  }
  clientInstance = null;
  return null;
};

// Khởi tạo ban đầu
initSupabaseClient();

export const getSupabase = (): SupabaseClient | null => {
  if (!clientInstance) {
    return initSupabaseClient();
  }
  return clientInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const key = getStoredSupabaseKey();
  const url = getStoredSupabaseUrl();
  return Boolean(url && key && key !== 'YOUR_SUPABASE_ANON_KEY');
};

export const supabase = getSupabase();

export const updateSupabaseCredentials = (url: string, key: string): SupabaseClient | null => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('xoan_supabase_url', url.trim());
    localStorage.setItem('xoan_supabase_key', key.trim());
  }
  return initSupabaseClient(url.trim(), key.trim());
};

export const getSupabaseConfig = () => ({
  projectUrl: getStoredSupabaseUrl(),
  isConfigured: isSupabaseConfigured(),
  hasKey: Boolean(getStoredSupabaseKey()),
});
