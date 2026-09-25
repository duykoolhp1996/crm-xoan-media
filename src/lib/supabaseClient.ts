import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://etvbrbdysphrfzvnwvbk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kiểm tra xem Supabase đã được cung cấp API Key hợp lệ chưa
export const isSupabaseConfigured = Boolean(
  SUPABASE_PROJECT_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
);

// Tạo instance client Supabase
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const getSupabaseConfig = () => ({
  projectUrl: SUPABASE_PROJECT_URL,
  isConfigured: isSupabaseConfigured,
  hasKey: Boolean(SUPABASE_ANON_KEY),
});
