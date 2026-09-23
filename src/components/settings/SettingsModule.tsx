import React, { useState } from 'react';
import {
  Settings,
  Database,
  Zap,
  Webhook,
  Download,
  Server
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const [supabaseUrl, setSupabaseUrl] = useState('https://crm-xoanmedia.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xoanmedia_demo_key');

  // Automation triggers rules
  const [automationRules, setAutomationRules] = useState([
    { id: 'r1', title: 'Tự động phân bổ Sales khi có Lead mới', desc: 'Chia đều Lead từ Facebook Ads & TikTok theo vòng tròn (Round-Robin) cho team Sales.', active: true },
    { id: 'r2', title: 'Cảnh báo khi Lead chưa liên hệ sau 30 phút', desc: 'Bắn thông báo khẩn cấp lên Header và gửi tin nhắn cảnh báo tới quản lý.', active: true },
    { id: 'r3', title: 'Tự động phát hiện trùng lịch Photographer', desc: 'Quét toàn bộ đơn chụp cùng ngày, cảnh báo nếu thợ chính bị gán trên 1 ca trùng giờ.', active: true },
    { id: 'r4', title: 'Nhắc Sales chuẩn bị trước ngày chụp 48 giờ', desc: 'Tạo Task tự động cho Sales gọi chốt lại sỉ số, concept và địa điểm với lớp trưởng.', active: true },
    { id: 'r5', title: 'Tự động đưa khách hoàn thành vào Remarketing', desc: 'Sau 90 ngày hoàn thành buổi chụp, tự động thêm vào phân khúc chăm sóc khách cũ.', active: true }
  ]);

  const toggleRule = (id: string) => {
    setAutomationRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            Cài Đặt Hệ Thống & Tích Hợp Supabase / Webhook
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cấu hình cơ sở dữ liệu PostgreSQL 22+ bảng, động cơ tự động hóa (Automation Engine) và API bên thứ ba
          </p>
        </div>
      </div>

      {/* Section 1: Database Supabase Ready */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Cơ Sở Dữ Liệu PostgreSQL / Supabase</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Hệ thống đã chuẩn bị sẵn Schema SQL 22+ bảng quan hệ (Customers, Bookings, Photographers, Workflows, RLS)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-neutral-700">Supabase Project URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-mono text-[11px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>
          <div>
            <label className="font-semibold text-neutral-700">Supabase Anon Public API Key</label>
            <input
              type="password"
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-mono text-[11px] text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
            />
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border border-black/[0.06] rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-neutral-900 font-bold flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              File SQL Migration: <code>src/database/schema.sql</code>
            </p>
            <p className="text-neutral-500 text-[11px]">
              Bao gồm đầy đủ bảng Users, Roles, Customers, Bookings, Photographers, Assignments, Segments, Tasks...
            </p>
          </div>

          <a
            href="/src/database/schema.sql"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xem File Schema SQL
          </a>
        </div>
      </div>

      {/* Section 2: Automation Engine Rules */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Động Cơ Tự Động Hóa Vận Hành (Automation Engine)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Các quy tắc kích hoạt tự động theo logic nghiệp vụ kỷ yếu Xoắn Media
            </p>
          </div>
        </div>

        <div className="divide-y divide-black/[0.05]">
          {automationRules.map((rule) => (
            <div key={rule.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-neutral-900 text-xs">{rule.title}</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">{rule.desc}</p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${
                  rule.active
                    ? 'bg-emerald-500 border-emerald-600'
                    : 'bg-neutral-200 border-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    rule.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Webhook & Integration */}
      <div className="bg-white border border-black/[0.08] p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Tích Hợp Kênh Lead & Webhooks Ngoài</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kết nối trực tiếp Facebook Lead Ads, TikTok Leads, Zalo ZNS và n8n Workflow
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-neutral-900">Facebook Lead Ads Webhook</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Đã kết nối</span>
            </div>
            <p className="text-[11px] text-neutral-500">Tự động bắt form đăng ký từ các bài quảng cáo kỷ yếu Hà Nội.</p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-neutral-900">TikTok Instant Form Webhook</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Đã kết nối</span>
            </div>
            <p className="text-[11px] text-neutral-500">Tự động đồng bộ lead từ các clip concept viral trên TikTok.</p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-neutral-900">Zalo ZNS Template API</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Sẵn sàng</span>
            </div>
            <p className="text-[11px] text-neutral-500">Gửi tự động tin nhắn xác nhận lịch chụp và link hợp đồng cọc.</p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-neutral-900">n8n Workflow Engine</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Đang lắng nghe</span>
            </div>
            <p className="text-[11px] text-neutral-500">Endpoint bắn dữ liệu sự kiện khi có khách hàng hoàn thành.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
