import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RemarketingWorkflow, WorkflowNode } from '../../types';
import { NodeCanvas } from './NodeCanvas';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { WorkflowSimulationModal } from './WorkflowSimulationModal';
import {
  Sparkles,
  Users,
  Megaphone,
  GitBranch,
  Play,
  Pause,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  RotateCw,
  FolderGit2
} from 'lucide-react';

export const RemarketingModule: React.FC = () => {
  const { segments, campaigns, workflows, toggleWorkflow, addCampaign } = useApp();

  const [activeTab, setActiveTab] = useState<'workflows' | 'campaigns' | 'segments'>('workflows');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || 'wf-1');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [activeSimNodeId, setActiveSimNodeId] = useState<string | null>(null);
  const [isCreateCampModalOpen, setIsCreateCampModalOpen] = useState(false);
  const [isCreateWfModalOpen, setIsCreateWfModalOpen] = useState(false);

  // Workflow cục bộ để hỗ trợ chỉnh sửa real-time
  const [localWorkflows, setLocalWorkflows] = useState<RemarketingWorkflow[]>(workflows);

  const currentWorkflow = localWorkflows.find(w => w.id === selectedWorkflowId) || localWorkflows[0];

  // Form tạo chiến dịch remarketing
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

  // Form tạo workflow mới
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState('Lead mới không chuyển đổi sau 48h');
  const [newWfCategory, setNewWfCategory] = useState<'Lead Nurturing' | 'Quote Follow-up' | 'Lost Recovery' | 'Upsell / Loyalty'>('Lead Nurturing');

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

  const handleSaveNode = (updatedNode: WorkflowNode) => {
    if (!currentWorkflow) return;
    const updatedNodes = currentWorkflow.nodes.map(n =>
      n.id === updatedNode.id ? updatedNode : n
    );
    const updatedWf = { ...currentWorkflow, nodes: updatedNodes };
    setLocalWorkflows(prev =>
      prev.map(w => (w.id === updatedWf.id ? updatedWf : w))
    );
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return;
    const updatedNodes = currentWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedWf = { ...currentWorkflow, nodes: updatedNodes };
    setLocalWorkflows(prev =>
      prev.map(w => (w.id === updatedWf.id ? updatedWf : w))
    );
  };

  const handleAddNodeAfter = (sourceNodeId: string) => {
    if (!currentWorkflow) return;
    const sourceNode = currentWorkflow.nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    const newId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newId,
      type: 'action',
      title: 'Bước Hành Động Mới',
      subtitle: 'Tự động kích hoạt',
      description: 'Gửi tin nhắn chăm sóc bổ sung hoặc tạo task giao việc',
      position: {
        x: (sourceNode.position?.x || 50) + 290,
        y: (sourceNode.position?.y || 180)
      },
      next: sourceNode.next,
      stats: { processedCount: 0, successRate: 100 }
    };

    // Nối sourceNode -> newNode
    const updatedNodes = currentWorkflow.nodes.map(n =>
      n.id === sourceNodeId ? { ...n, next: newId } : n
    );

    const updatedWf = {
      ...currentWorkflow,
      nodes: [...updatedNodes, newNode]
    };

    setLocalWorkflows(prev =>
      prev.map(w => (w.id === updatedWf.id ? updatedWf : w))
    );

    setSelectedNode(newNode);
    setIsDrawerOpen(true);
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName) return;

    const newWf: RemarketingWorkflow = {
      id: `wf-${Date.now()}`,
      name: newWfName,
      description: newWfDesc || 'Kịch bản tự động hóa mới xây dựng',
      category: newWfCategory,
      triggerEvent: newWfTrigger,
      isActive: true,
      steps: [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      stats: {
        totalTriggered: 0,
        convertedCount: 0,
        revenueSaved: 0
      },
      nodes: [
        {
          id: `n1-${Date.now()}`,
          type: 'trigger',
          title: newWfTrigger,
          subtitle: 'Sự kiện kích hoạt',
          description: 'Hệ thống tự động lắng nghe sự kiện từ Pipeline',
          position: { x: 50, y: 180 },
          next: `n2-${Date.now()}`
        },
        {
          id: `n2-${Date.now()}`,
          type: 'delay',
          title: 'Chờ 2 Giờ',
          subtitle: 'Thời gian chờ tối ưu',
          description: 'Chờ đến khung giờ vàng học sinh hoạt động',
          config: { delayHours: 2 },
          position: { x: 340, y: 180 },
          next: `n3-${Date.now()}`
        },
        {
          id: `n3-${Date.now()}`,
          type: 'action',
          title: 'Gửi Tin Nhắn Zalo Chăm Sóc',
          subtitle: 'Zalo OA',
          description: 'Gửi nội dung tư vấn ưu đãi cho ban cán sự lớp',
          config: {
            channel: 'Zalo',
            templateContent: 'Chào {ten_khach}! Xoắn Media gửi ưu đãi kỷ yếu đặc biệt cho lớp mình.'
          },
          position: { x: 630, y: 180 },
          next: `n4-${Date.now()}`
        },
        {
          id: `n4-${Date.now()}`,
          type: 'end',
          title: 'Hoàn Tất Kịch Bản',
          subtitle: 'Kết thúc luồng',
          description: 'Chờ phản hồi từ khách hàng',
          position: { x: 920, y: 180 }
        }
      ]
    };

    setLocalWorkflows(prev => [newWf, ...prev]);
    setSelectedWorkflowId(newWf.id);
    setIsCreateWfModalOpen(false);
    setNewWfName('');
    setNewWfDesc('');
  };

  // Tính tổng KPI Automation
  const totalAutomationStats = localWorkflows.reduce(
    (acc, wf) => {
      acc.totalTriggered += wf.stats?.totalTriggered || 0;
      acc.convertedCount += wf.stats?.convertedCount || 0;
      acc.revenueSaved += wf.stats?.revenueSaved || 0;
      return acc;
    },
    { totalTriggered: 0, convertedCount: 0, revenueSaved: 0 }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Hệ Thống Node Workflow Tự Động Hóa & Remarketing (Automation)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Xây dựng kịch bản nuôi dưỡng Lead, bám đuổi báo giá chưa cọc và cứu vãn khách Lost theo dạng sơ đồ Node trực quan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateWfModalOpen(true)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tạo Workflow Mới
          </button>
          <button
            onClick={() => setIsCreateCampModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-black/[0.08] text-neutral-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
          >
            <Megaphone className="w-4 h-4 text-orange-600" />
            Chiến Dịch Ads
          </button>
        </div>
      </div>

      {/* KPI Automation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-xs font-semibold">Quy Trình Hoạt Động</span>
            <FolderGit2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {localWorkflows.filter(w => w.isActive).length}{' '}
            <span className="text-sm font-semibold text-neutral-500">
              / {localWorkflows.length} workflows
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Đang kích hoạt tự động 24/7</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-xs font-semibold">Số Lớp Đã Kích Hoạt</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {totalAutomationStats.totalTriggered.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-neutral-500">lượt</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Tự động gửi tin & tạo task</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-xs font-semibold">Chốt Cọc Từ Automation</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {totalAutomationStats.convertedCount}{' '}
            <span className="text-sm font-semibold text-neutral-500">
              ({totalAutomationStats.totalTriggered > 0 ? Math.round((totalAutomationStats.convertedCount / totalAutomationStats.totalTriggered) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Lớp chuyển đổi sau nuôi dưỡng</p>
        </div>

        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-xs font-semibold">Doanh Thu Bảo Toàn</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {(totalAutomationStats.revenueSaved / 1000000).toLocaleString('vi-VN')} Triệu
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Cứu vãn từ Lead nguội & Lost</p>
        </div>
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
          Kịch Bản Tự Động (Node Workflows - {localWorkflows.length})
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
          Chiến Dịch Tiếp Cận ({campaigns.length})
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

      {/* TAB 1: VISUAL NODE WORKFLOW BUILDER */}
      {activeTab === 'workflows' && currentWorkflow && (
        <div className="space-y-4">
          {/* Workflow Selector Bar */}
          <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-1">
                  Chọn Kịch Bản:
                </span>
                {localWorkflows.map(wf => (
                  <button
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedWorkflowId === wf.id
                        ? 'bg-neutral-900 text-[#B8F23D] shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {wf.name}
                  </button>
                ))}
              </div>

              {/* Action Buttons for current workflow */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={() => setIsSimModalOpen(true)}
                  className="px-4 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mô Phỏng Chạy Thử (Run Simulation)
                </button>

                <button
                  onClick={() => {
                    toggleWorkflow(currentWorkflow.id);
                    setLocalWorkflows(prev =>
                      prev.map(w =>
                        w.id === currentWorkflow.id ? { ...w, isActive: !w.isActive } : w
                      )
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                    currentWorkflow.isActive
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {currentWorkflow.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {currentWorkflow.isActive ? 'Tạm Dừng Luồng' : 'Kích Hoạt Tự Động'}
                </button>
              </div>
            </div>

            {/* Workflow Info Sub-bar */}
            <div className="pt-3 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900">{currentWorkflow.name}</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500">{currentWorkflow.description}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500 shrink-0">
                <span>Trigger: <strong className="text-purple-700">{currentWorkflow.triggerEvent}</strong></span>
                <span>•</span>
                <span>Số bước: <strong className="text-neutral-900">{currentWorkflow.nodes.length} nodes</strong></span>
              </div>
            </div>
          </div>

          {/* Core Interactive Node Canvas */}
          <NodeCanvas
            nodes={currentWorkflow.nodes}
            activeNodeId={activeSimNodeId}
            onSelectNode={node => {
              setSelectedNode(node);
              setIsDrawerOpen(true);
            }}
            onAddNodeAfter={handleAddNodeAfter}
          />

          {/* Quick Guidance Box */}
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Mẹo thao tác với sơ đồ Node Workflow:</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                • Bấm trực tiếp vào bất kỳ <strong>Node</strong> nào để mở bảng cấu hình thời gian chờ, nội dung tin nhắn Zalo/SMS hoặc điều kiện If/Else.
                <br />• Bấm nút <strong>"Mô Phỏng Chạy Thử"</strong> để xem luồng tín hiệu kích hoạt phát sáng qua từng node với khách hàng mẫu thực tế.
                <br />• Khối <strong>Condition</strong> tự động phân nhánh ra 2 đường: <span className="font-bold text-emerald-700">Đúng (YES)</span> và <span className="font-bold text-rose-700">Sai (NO)</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGNS */}
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

      {/* TAB 3: SEGMENTS */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="bg-white border border-black/[0.08] rounded-3xl p-5 space-y-3 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-neutral-900 text-sm">{seg.name}</h3>
                <span className="text-[11px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                  {seg.customerCount} Leads
                </span>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">{seg.description}</p>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] text-xs font-mono text-neutral-600">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1 font-sans">
                  Tiêu chí lọc dữ liệu:
                </p>
                {seg.targetCriteria}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Node Detail Drawer */}
      <NodeDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        node={selectedNode}
        onSaveNode={handleSaveNode}
        onDeleteNode={handleDeleteNode}
      />

      {/* Simulation Modal */}
      <WorkflowSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        workflow={currentWorkflow}
        onActiveNodeChange={nodeId => setActiveSimNodeId(nodeId)}
      />

      {/* Create Workflow Modal */}
      {isCreateWfModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setIsCreateWfModalOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white border border-black/[0.08] rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-xs">
            <h3 className="text-base font-extrabold text-neutral-900">Tạo Workflow Tự Động Hóa Mới</h3>

            <form onSubmit={handleCreateWorkflow} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Tên Kịch Bản</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nuôi dưỡng Lead sinh viên ĐH Ngoại Thương..."
                  value={newWfName}
                  onChange={e => setNewWfName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-bold text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nhóm Mục Tiêu</label>
                <select
                  value={newWfCategory}
                  onChange={e => setNewWfCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-semibold text-neutral-800 focus:outline-none"
                >
                  <option value="Lead Nurturing">Nuôi dưỡng Lead mới (Lead Nurturing)</option>
                  <option value="Quote Follow-up">Bám đuổi báo giá (Quote Follow-up)</option>
                  <option value="Lost Recovery">Cứu vãn khách Lost (Lost Recovery)</option>
                  <option value="Upsell / Loyalty">Tri ân & Bán chéo (Upsell / Loyalty)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Sự Kiện Kích Hoạt (Trigger Event)</label>
                <input
                  type="text"
                  required
                  value={newWfTrigger}
                  onChange={e => setNewWfTrigger(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Mô Tả Kịch Bản</label>
                <textarea
                  rows={2}
                  value={newWfDesc}
                  onChange={e => setNewWfDesc(e.target.value)}
                  placeholder="Mục đích và luồng xử lý..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateWfModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold shadow-xs transition-colors"
                >
                  Tạo Kịch Bản Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tạo Chiến Dịch */}
      {isCreateCampModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setIsCreateCampModalOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-3xl shadow-2xl p-6 space-y-4 z-10 text-xs">
            <h3 className="text-base font-extrabold text-neutral-900">Tạo Chiến Dịch Tiếp Cận & Quảng Cáo</h3>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Tên Chiến Dịch</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Flash Sale Mùa Kỷ Yếu Tháng 11..."
                  value={newCamp.name}
                  onChange={e => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-bold text-neutral-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Kênh Triển Khai</label>
                  <select
                    value={newCamp.channel}
                    onChange={e => setNewCamp({ ...newCamp, channel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-semibold text-neutral-800 focus:outline-none"
                  >
                    <option value="Zalo">Zalo OA / ZNS</option>
                    <option value="SMS">SMS Brandname</option>
                    <option value="Facebook">Facebook Ads</option>
                    <option value="TikTok">TikTok Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">Phân Khúc Tiếp Cận</label>
                  <select
                    value={newCamp.segmentId}
                    onChange={e => setNewCamp({ ...newCamp, segmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-semibold text-neutral-800 focus:outline-none"
                  >
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.customerCount} leads)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">Gói Quà Tặng / Ưu Đãi (Offer)</label>
                <input
                  type="text"
                  value={newCamp.offer}
                  onChange={e => setNewCamp({ ...newCamp, offer: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCampModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl font-bold shadow-xs transition-colors"
                >
                  Kích Hoạt Chiến Dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
