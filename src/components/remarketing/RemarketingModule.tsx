import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Users,
  Megaphone,
  GitBranch,
  Play,
  Pause,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const RemarketingModule: React.FC = () => {
  const { segments, campaigns, workflows, toggleWorkflow, addCampaign } = useApp();

  const [activeTab, setActiveTab] = useState<'workflows' | 'campaigns' | 'segments'>('workflows');
  const [isCreateCampModalOpen, setIsCreateCampModalOpen] = useState(false);

  // Form campaign
  const [newCamp, setNewCamp] = useState({
    name: '',
    campaignType: 'Chăm sóc Lead nguội' as const,
    segmentId: segments[0]?.id || '',
    channel: 'Zalo' as const,
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    content: '',
    offer: 'Tặng 01 buổi quay Flycam 4K',
    budget: 3000000,
    status: 'Running' as const
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const seg = segments.find(s => s.id === newCamp.segmentId);
    if (!seg || !newCamp.name) return;

    addCampaign({
      name: newCamp.name,
      campaignType: newCamp.campaignType,
      segmentId: seg.id,
      segmentName: seg.name,
      channel: newCamp.channel,
      startDate: newCamp.startDate,
      endDate: newCamp.endDate,
      content: newCamp.content,
      offer: newCamp.offer,
      budget: Number(newCamp.budget),
      status: newCamp.status
    });

    setIsCreateCampModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Hệ Thống Remarketing & Tự Động Hóa Nuôi Dưỡng (Automation)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Phân khúc Lead chưa chuyển đổi, bám đuổi báo giá chưa cọc và remarketing tri ân khách hàng cũ
          </p>
        </div>

        <button
          onClick={() => setIsCreateCampModalOpen(true)}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo Chiến Dịch Remarketing
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border border-black/[0.08] bg-white px-5 rounded-2xl gap-6 text-xs font-bold overflow-x-auto custom-scrollbar shadow-xs">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'workflows'
              ? 'border-neutral-900 text-neutral-900 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Kịch Bản Tự Động (Workflows - {workflows.length})
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'border-neutral-900 text-neutral-900 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Chiến Dịch Đang Chạy ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'segments'
              ? 'border-neutral-900 text-neutral-900 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Phân Khúc Khách Hàng (Segments - {segments.length})
        </button>
      </div>

      {/* Tab 1: Visual Workflows */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-white border border-black/[0.08] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base">{wf.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        wf.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {wf.isActive ? '● Đang kích hoạt' : '○ Tạm dừng'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{wf.description}</p>
                </div>

                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    wf.isActive
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {wf.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {wf.isActive ? 'Tạm Dừng' : 'Kích Hoạt'}
                </button>
              </div>

              {/* Visual Flow Diagram */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 overflow-x-auto py-2 custom-scrollbar">
                {wf.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="flex-1 min-w-[210px] p-4 rounded-2xl bg-neutral-50 border border-black/[0.06] space-y-1 relative group hover:border-black/[0.14] transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                          Bước {idx + 1}: {step.type}
                        </span>
                        {step.type === 'trigger' ? (
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        ) : step.type === 'delay' ? (
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                        ) : step.type === 'condition' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-neutral-900 text-xs">{step.title}</h4>
                      <p className="text-[11px] text-neutral-500 leading-relaxed">{step.description}</p>
                    </div>

                    {idx < wf.steps.length - 1 && (
                      <div className="hidden lg:flex items-center text-neutral-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white border border-black/[0.08] rounded-3xl p-5 space-y-3 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md">
                    {camp.channel}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {camp.status}
                  </span>
                </div>

                <h3 className="font-bold text-neutral-900 text-sm mt-2.5">{camp.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Mục tiêu: <strong className="text-neutral-800">{camp.segmentName}</strong>
                </p>

                <div className="mt-3 p-3 bg-neutral-50 rounded-2xl text-xs space-y-1 border border-black/[0.06]">
                  <p className="text-neutral-800">🎁 <strong>Ưu đãi:</strong> {camp.offer}</p>
                  <p className="text-neutral-500 italic truncate mt-1">"{camp.content}"</p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06] text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-500">
                  <span>Ngân sách:</span>
                  <strong className="text-neutral-900">{camp.budget.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Tiếp cận:</span>
                  <strong className="text-sky-700">{camp.reach.toLocaleString('vi-VN')} khách</strong>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Leads chuyển đổi:</span>
                  <strong className="text-emerald-700 font-bold">{camp.leadsGenerated} lớp</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Segments */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="bg-white border border-black/[0.08] rounded-3xl p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm">{seg.name}</h3>
                <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
                  {seg.customerCount} Khách
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">{seg.description}</p>
              <div className="p-3 bg-neutral-50 text-emerald-700 font-mono text-[10px] rounded-xl border border-black/[0.06] overflow-x-auto">
                <code>{seg.targetCriteria}</code>
              </div>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Tạo: {seg.createdAt}</span>
                <button
                  onClick={() => alert(`Đã trích xuất ${seg.customerCount} liên hệ để gửi Zalo ZNS / SMS!`)}
                  className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
                >
                  Gửi Tin Loạt →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo Campaign */}
      {isCreateCampModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setIsCreateCampModalOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-xs text-neutral-900">
            <h3 className="text-sm font-bold text-neutral-900">Tạo Chiến Dịch Remarketing Mới</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-700">Tên Chiến Dịch *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tặng Flycam cho Lead chưa cọc..."
                  value={newCamp.name}
                  onChange={e => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700">Phân Khúc Mục Tiêu</label>
                  <select
                    value={newCamp.segmentId}
                    onChange={e => setNewCamp({ ...newCamp, segmentId: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                  >
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.customerCount})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700">Kênh Gửi (Channel)</label>
                  <select
                    value={newCamp.channel}
                    onChange={e => setNewCamp({ ...newCamp, channel: e.target.value as any })}
                    className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 rounded-xl font-semibold cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                  >
                    <option value="Zalo">Zalo ZNS / Tin Nhắn</option>
                    <option value="SMS">SMS Brandname</option>
                    <option value="Facebook">Facebook Custom Audience</option>
                    <option value="TikTok">TikTok Retargeting</option>
                    <option value="Phone">Cuộc gọi Telesales</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Ưu Đãi / Quà Tặng (Offer)</label>
                <input
                  type="text"
                  value={newCamp.offer}
                  onChange={e => setNewCamp({ ...newCamp, offer: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Nội Dung Thông Điệp</label>
                <textarea
                  rows={3}
                  value={newCamp.content}
                  onChange={e => setNewCamp({ ...newCamp, content: e.target.value })}
                  placeholder="Chào bạn, Xoắn Media đang có ưu đãi đặc quyền..."
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCampModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold shadow-sm transition-all active:scale-95"
                >
                  Khởi Chạy Chiến Dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
