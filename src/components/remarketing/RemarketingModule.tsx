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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            Hệ Thống Remarketing & Tự Động Hóa Nuôi Dưỡng (Automation)
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Phân khúc Lead chưa chuyển đổi, bám đuổi báo giá chưa cọc và remarketing tri ân khách hàng cũ
          </p>
        </div>

        <button
          onClick={() => setIsCreateCampModalOpen(true)}
          className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo Chiến Dịch Remarketing
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/[0.08] glass-panel-subtle px-5 rounded-2xl gap-6 text-xs font-bold overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'workflows'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Kịch Bản Tự Động (Workflows - {workflows.length})
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'campaigns'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Chiến Dịch Đang Chạy ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'segments'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-white/50 hover:text-white'
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
              className="glass-card rounded-3xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-sm sm:text-base">{wf.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        wf.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/[0.08] text-white/50 border-white/[0.1]'
                      }`}
                    >
                      {wf.isActive ? '● Đang kích hoạt' : '○ Tạm dừng'}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{wf.description}</p>
                </div>

                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    wf.isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
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
                    <div className="flex-1 min-w-[210px] p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1 relative group hover:border-orange-500/40 hover:bg-white/[0.07] transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                          Bước {idx + 1}: {step.type}
                        </span>
                        {step.type === 'trigger' ? (
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                        ) : step.type === 'delay' ? (
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                        ) : step.type === 'condition' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs">{step.title}</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed">{step.description}</p>
                    </div>

                    {idx < wf.steps.length - 1 && (
                      <div className="hidden lg:flex items-center text-white/30">
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
              className="glass-card rounded-3xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-md">
                    {camp.channel}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {camp.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mt-2.5">{camp.name}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Mục tiêu: <strong className="text-white/80">{camp.segmentName}</strong>
                </p>

                <div className="mt-3 p-3 bg-white/[0.04] rounded-2xl text-xs space-y-1 border border-white/[0.06]">
                  <p className="text-white/80">🎁 <strong>Ưu đãi:</strong> {camp.offer}</p>
                  <p className="text-white/50 italic truncate mt-1">"{camp.content}"</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] text-xs space-y-1.5">
                <div className="flex justify-between text-white/60">
                  <span>Ngân sách:</span>
                  <strong className="text-white">{camp.budget.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tiếp cận:</span>
                  <strong className="text-sky-300">{camp.reach.toLocaleString('vi-VN')} khách</strong>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Leads chuyển đổi:</span>
                  <strong className="text-emerald-400 font-bold">{camp.leadsGenerated} lớp</strong>
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
              className="glass-card rounded-3xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">{seg.name}</h3>
                <span className="font-mono text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  {seg.customerCount} Khách
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{seg.description}</p>
              <div className="p-3 bg-black/40 text-emerald-400 font-mono text-[10px] rounded-xl border border-white/[0.08] overflow-x-auto">
                <code>{seg.targetCriteria}</code>
              </div>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-white/40">Tạo: {seg.createdAt}</span>
                <button
                  onClick={() => alert(`Đã trích xuất ${seg.customerCount} liên hệ để gửi Zalo ZNS / SMS!`)}
                  className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
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
          <div onClick={() => setIsCreateCampModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xl" />
          <div className="relative w-full max-w-lg bg-neutral-900/90 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] p-6 space-y-4 z-10 text-xs text-white">
            <h3 className="text-sm font-bold text-white">Tạo Chiến Dịch Remarketing Mới</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="font-bold text-white/80">Tên Chiến Dịch *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tặng Flycam cho Lead chưa cọc..."
                  value={newCamp.name}
                  onChange={e => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-white/80">Phân Khúc Mục Tiêu</label>
                  <select
                    value={newCamp.segmentId}
                    onChange={e => setNewCamp({ ...newCamp, segmentId: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                  >
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.customerCount})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-white/80">Kênh Gửi (Channel)</label>
                  <select
                    value={newCamp.channel}
                    onChange={e => setNewCamp({ ...newCamp, channel: e.target.value as any })}
                    className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl font-semibold cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
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
                <label className="font-bold text-white/80">Ưu Đãi / Quà Tặng (Offer)</label>
                <input
                  type="text"
                  value={newCamp.offer}
                  onChange={e => setNewCamp({ ...newCamp, offer: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-white/80">Nội Dung Thông Điệp</label>
                <textarea
                  rows={3}
                  value={newCamp.content}
                  onChange={e => setNewCamp({ ...newCamp, content: e.target.value })}
                  placeholder="Chào bạn, Xoắn Media đang có ưu đãi đặc quyền..."
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCampModalOpen(false)}
                  className="px-4 py-2 glass-btn-secondary rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 glass-btn-primary rounded-xl font-semibold"
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
