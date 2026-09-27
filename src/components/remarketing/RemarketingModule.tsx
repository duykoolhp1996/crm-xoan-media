import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  FolderGit2,
  ArrowLeft,
  Search,
  Filter,
  Copy,
  Trash2,
  Settings,
  ChevronRight,
  Activity,
  Layers,
  Tag,
  Check,
  Zap,
  Info,
  X,
  Maximize2
} from 'lucide-react';

export const RemarketingModule: React.FC = () => {
  const {
    segments,
    campaigns,
    workflows,
    toggleWorkflow,
    updateWorkflow,
    addWorkflow,
    deleteWorkflow,
    addCampaign
  } = useApp();

  // Chuyển tab chính: workflows | campaigns | segments
  const [activeTab, setActiveTab] = useState<'workflows' | 'campaigns' | 'segments'>('workflows');

  // Chế độ xem của tab Workflows: 'list' (Danh sách kịch bản) | 'editor' (Trang sơ đồ Node kịch bản)
  const [workflowView, setWorkflowView] = useState<'list' | 'editor'>('list');

  // Popup Modal mở sơ đồ Workflow dạng floating popup
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || 'wf-1');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [activeSimNodeId, setActiveSimNodeId] = useState<string | null>(null);

  // Bộ lọc danh sách kịch bản
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'paused'>('ALL');

  // Thông báo toast nhanh
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal tạo mới
  const [isCreateCampModalOpen, setIsCreateCampModalOpen] = useState(false);
  const [isCreateWfModalOpen, setIsCreateWfModalOpen] = useState(false);

  // Workflow hiện tại đang xem trong Editor hoặc Popup
  const currentWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

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

  // Lọc workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(wf => {
      const matchSearch =
        wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || wf.category === categoryFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'active' && wf.isActive) ||
        (statusFilter === 'paused' && !wf.isActive);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [workflows, searchQuery, categoryFilter, statusFilter]);

  // Cập nhật vị trí kéo thả của node trên canvas
  const handleUpdateNodePosition = (nodeId: string, newPosition: { x: number; y: number }) => {
    if (!currentWorkflow) return;
    const updatedNodes = currentWorkflow.nodes.map(n =>
      n.id === nodeId ? { ...n, position: newPosition } : n
    );
    const updatedWf: RemarketingWorkflow = {
      ...currentWorkflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    updateWorkflow(updatedWf);
  };

  // Lưu node sau khi chỉnh sửa
  const handleSaveNode = (updatedNode: WorkflowNode) => {
    if (!currentWorkflow) return;
    const updatedNodes = currentWorkflow.nodes.map(n =>
      n.id === updatedNode.id ? updatedNode : n
    );
    const updatedWf: RemarketingWorkflow = {
      ...currentWorkflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    updateWorkflow(updatedWf);
    showToast(`Đã lưu cấu hình bước "${updatedNode.title}" thành công!`);
  };

  // Xóa node
  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return;
    const updatedNodes = currentWorkflow.nodes.filter(n => n.id !== nodeId);
    const updatedWf: RemarketingWorkflow = {
      ...currentWorkflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    updateWorkflow(updatedWf);
    showToast('Đã xóa bước khỏi kịch bản.');
  };

  // Thêm node mới sau một node
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

    const updatedWf: RemarketingWorkflow = {
      ...currentWorkflow,
      nodes: [...updatedNodes, newNode],
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    updateWorkflow(updatedWf);
    setSelectedNode(newNode);
    setIsDrawerOpen(true);
    showToast('Đã thêm bước mới. Vui lòng thiết lập thông số trong popup cấu hình.');
  };

  // Tạo workflow mới
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
          description: 'Hệ thống tự động lắng nghe sự kiện từ Pipeline CRM',
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
            templateContent: 'Chào {ten_khach}! Xoăn Media gửi ưu đãi kỷ yếu đặc biệt cho lớp mình.'
          },
          position: { x: 630, y: 180 },
          next: `n4-${Date.now()}`
        },
        {
          id: `n4-${Date.now()}`,
          type: 'end',
          title: 'Hoàn Tất Kịch Bản',
          subtitle: 'Kết thúc luồng',
          description: 'Chờ phản hồi từ khách hàng hoặc tự động chuyển tiếp',
          position: { x: 920, y: 180 }
        }
      ]
    };

    addWorkflow(newWf);
    setSelectedWorkflowId(newWf.id);
    setIsCreateWfModalOpen(false);
    setIsWorkflowModalOpen(true); // Mở ngay popup sơ đồ node của kịch bản mới
    setNewWfName('');
    setNewWfDesc('');
    showToast(`Đã tạo kịch bản "${newWf.name}". Đang mở Popup sơ đồ Node để chỉnh sửa.`);
  };

  // Nhân bản workflow
  const handleDuplicateWorkflow = (sourceWf: RemarketingWorkflow) => {
    const newWf: RemarketingWorkflow = {
      ...sourceWf,
      id: `wf-${Date.now()}`,
      name: `${sourceWf.name} (Bản sao)`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      stats: {
        totalTriggered: 0,
        convertedCount: 0,
        revenueSaved: 0
      }
    };
    addWorkflow(newWf);
    showToast(`Đã nhân bản kịch bản "${newWf.name}".`);
  };

  // Xóa workflow
  const handleDeleteWorkflow = (wfId: string, wfName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa kịch bản "${wfName}"? Hành động này không thể hoàn tác.`)) {
      deleteWorkflow(wfId);
      if (selectedWorkflowId === wfId) {
        const remaining = workflows.filter(w => w.id !== wfId);
        if (remaining.length > 0) setSelectedWorkflowId(remaining[0].id);
      }
      showToast(`Đã xóa kịch bản "${wfName}".`);
    }
  };

  // Tạo chiến dịch quảng cáo
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
    showToast(`Đã kích hoạt chiến dịch "${newCamp.name}".`);
  };

  // Helper hiển thị badge phân loại Category
  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'Lead Nurturing':
        return {
          label: 'Nuôi Dưỡng Lead',
          color: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'Quote Follow-up':
        return {
          label: 'Bám Đuổi Báo Giá',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'Lost Recovery':
        return {
          label: 'Cứu Vãn Khách Lost',
          color: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'Upsell / Loyalty':
        return {
          label: 'Tri Ân & Bán Chéo',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      default:
        return {
          label: category || 'Quy Trình Tự Động',
          color: 'bg-neutral-100 text-neutral-700 border-neutral-200'
        };
    }
  };

  // Tính tổng KPI Automation
  const totalAutomationStats = workflows.reduce(
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#B8F23D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border border-black/[0.08] bg-white px-5 rounded-2xl gap-6 text-xs font-bold overflow-x-auto custom-scrollbar shadow-xs">
        <button
          onClick={() => {
            setActiveTab('workflows');
          }}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'workflows'
              ? 'border-neutral-900 text-neutral-900 font-extrabold'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Kịch Bản Tự Động Hóa (Automation Workflows - {workflows.length})
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
          Chiến Dịch Tiếp Cận & Ads ({campaigns.length})
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

      {/* ========================================================
          TAB 1: WORKFLOWS (HỆ THỐNG KỊCH BẢN TỰ ĐỘNG HÓA)
          ======================================================== */}
      {activeTab === 'workflows' && (
        <>
          {/* ========================================================
              VIEW 1: DANH SÁCH WORKFLOW VÀ TRẠNG THÁI (workflowView === 'list')
              ======================================================== */}
          {workflowView === 'list' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Danh Sách Kịch Bản Tự Động Hóa & Remarketing (Workflows)
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Quản lý toàn bộ kịch bản tự động gửi tin Zalo/SMS, nhắc việc Sales và theo dõi trạng thái hoạt động 24/7.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsCreateWfModalOpen(true)}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo Kịch Bản Mới
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                    <span className="text-xs font-semibold">Quy Trình Hoạt Động</span>
                    <FolderGit2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {workflows.filter(w => w.isActive).length}{' '}
                    <span className="text-sm font-semibold text-neutral-500">
                      / {workflows.length} workflows
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    ● {workflows.filter(w => w.isActive).length} kịch bản đang chạy tự động 24/7
                  </p>
                </div>

                <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                    <span className="text-xs font-semibold">Số Lớp Đã Kích Hoạt</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-neutral-900 tracking-tight">
                    {totalAutomationStats.totalTriggered.toLocaleString('vi-VN')}{' '}
                    <span className="text-sm font-semibold text-neutral-500">lớp</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">Đã xử lý tự động qua các node</p>
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
                  <p className="text-[11px] text-neutral-400 mt-1">Lớp chuyển đổi cọc thành công</p>
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

              {/* Filter & Search Bar */}
              <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kịch bản theo tên, nội dung hoặc sự kiện kích hoạt..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-900"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        statusFilter === 'ALL'
                          ? 'bg-white text-neutral-900 shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Tất Cả ({workflows.length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        statusFilter === 'active'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-emerald-700'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Đang Hoạt Động ({workflows.filter(w => w.isActive).length})
                    </button>
                    <button
                      onClick={() => setStatusFilter('paused')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        statusFilter === 'paused'
                          ? 'bg-neutral-800 text-white shadow-xs font-bold'
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      Tạm Dừng ({workflows.filter(w => !w.isActive).length})
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1 text-xs">
                  <span className="text-neutral-400 font-bold shrink-0 text-[11px] uppercase tracking-wider">
                    Phân loại:
                  </span>
                  {[
                    { id: 'ALL', label: 'Tất Cả' },
                    { id: 'Lead Nurturing', label: 'Nuôi Dưỡng Lead' },
                    { id: 'Quote Follow-up', label: 'Bám Đuổi Báo Giá' },
                    { id: 'Lost Recovery', label: 'Cứu Vãn Khách Lost' },
                    { id: 'Upsell / Loyalty', label: 'Tri Ân & Bán Chéo' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                        categoryFilter === cat.id
                          ? 'bg-neutral-900 text-[#B8F23D] border-neutral-900 shadow-xs'
                          : 'bg-white text-neutral-600 border-black/[0.08] hover:bg-neutral-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workflows List Cards */}
              <div className="space-y-4">
                {filteredWorkflows.length === 0 ? (
                  <div className="bg-white border border-black/[0.08] rounded-3xl p-12 text-center space-y-3">
                    <FolderGit2 className="w-10 h-10 text-neutral-300 mx-auto" />
                    <h3 className="font-extrabold text-neutral-800 text-sm">Không tìm thấy kịch bản nào phù hợp</h3>
                    <p className="text-xs text-neutral-400">
                      Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc phân loại.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('ALL');
                        setStatusFilter('ALL');
                      }}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Đặt Lại Bộ Lọc
                    </button>
                  </div>
                ) : (
                  filteredWorkflows.map(wf => {
                    const catBadge = getCategoryBadge(wf.category);
                    const conversionRate =
                      wf.stats && wf.stats.totalTriggered > 0
                        ? Math.round((wf.stats.convertedCount / wf.stats.totalTriggered) * 100)
                        : 0;

                    return (
                      <div
                        key={wf.id}
                        className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md ${
                          wf.isActive ? 'border-black/[0.08]' : 'border-neutral-200 bg-neutral-50/40 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          {/* Left Column: Info & Details */}
                          <div className="space-y-2.5 flex-1 min-w-0">
                            {/* Badges & Meta */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.color}`}
                              >
                                <Tag className="w-3 h-3" />
                                {catBadge.label}
                              </span>

                              <span className="text-[11px] font-medium text-neutral-400">
                                Cập nhật: <strong>{wf.updatedAt}</strong>
                              </span>

                              <span className="text-neutral-300">•</span>

                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-lg border border-black/[0.06]">
                                <Layers className="w-3 h-3 text-neutral-500" />
                                {wf.nodes?.length || 0} bước (Nodes)
                              </span>
                            </div>

                            {/* Workflow Title & Description */}
                            <div>
                              <h3
                                onClick={() => {
                                  setSelectedWorkflowId(wf.id);
                                  setIsWorkflowModalOpen(true);
                                }}
                                className="text-base font-extrabold text-neutral-900 hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-2"
                              >
                                {wf.name}
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              </h3>
                              <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                                {wf.description}
                              </p>
                            </div>

                            {/* Trigger Event Tag */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span className="text-neutral-500 text-[11px]">Sự kiện kích hoạt:</span>
                              <strong className="text-purple-900 font-bold">{wf.triggerEvent}</strong>
                            </div>
                          </div>

                          {/* Middle Column: Stats */}
                          <div className="flex items-center gap-4 sm:gap-6 bg-neutral-50/80 border border-black/[0.04] p-3.5 rounded-2xl shrink-0">
                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Đã Kích Hoạt
                              </span>
                              <div className="text-sm font-extrabold text-neutral-900 mt-0.5">
                                {wf.stats?.totalTriggered || 0}{' '}
                                <span className="text-[11px] font-normal text-neutral-500">lượt</span>
                              </div>
                            </div>

                            <div className="w-px h-8 bg-neutral-200" />

                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Chuyển Đổi Cọc
                              </span>
                              <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                                {wf.stats?.convertedCount || 0}{' '}
                                <span className="text-[11px] font-bold text-emerald-600">({conversionRate}%)</span>
                              </div>
                            </div>

                            <div className="w-px h-8 bg-neutral-200" />

                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                                Doanh Thu
                              </span>
                              <div className="text-sm font-extrabold text-neutral-900 mt-0.5">
                                {((wf.stats?.revenueSaved || 0) / 1000000).toLocaleString('vi-VN')} Tr
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Status Toggle & Actions */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
                            {/* Status Switch Toggle */}
                            <button
                              onClick={() => {
                                toggleWorkflow(wf.id);
                                showToast(
                                  wf.isActive
                                    ? `Đã tạm dừng kịch bản "${wf.name}".`
                                    : `Đã kích hoạt kịch bản "${wf.name}" chạy tự động 24/7.`
                                );
                              }}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                                wf.isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                              }`}
                              title={wf.isActive ? 'Bấm để tạm dừng kịch bản' : 'Bấm để kích hoạt kịch bản'}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  wf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                                }`}
                              />
                              {wf.isActive ? 'Đang Chạy Tự Động' : 'Đang Tạm Dừng'}
                            </button>

                            {/* Main CTA: Mở Sơ Đồ Node Dạng POPUP */}
                            <button
                              onClick={() => {
                                setSelectedWorkflowId(wf.id);
                                setIsWorkflowModalOpen(true);
                              }}
                              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                            >
                              <GitBranch className="w-4 h-4" />
                              Mở Sơ Đồ Node (Popup)
                            </button>

                            {/* Secondary Buttons: Chạy Thử / Duplicate / Xóa */}
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedWorkflowId(wf.id);
                                  setIsSimModalOpen(true);
                                }}
                                className="p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-600 hover:text-neutral-900 transition-colors border border-black/[0.06]"
                                title="Mô phỏng chạy thử kịch bản"
                              >
                                <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
                              </button>

                              <button
                                onClick={() => handleDuplicateWorkflow(wf)}
                                className="p-2.5 hover:bg-neutral-100 rounded-xl text-neutral-600 hover:text-neutral-900 transition-colors border border-black/[0.06]"
                                title="Nhân bản kịch bản này"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {workflows.length > 1 && (
                                <button
                                  onClick={() => handleDeleteWorkflow(wf.id, wf.name)}
                                  className="p-2.5 hover:bg-rose-50 rounded-xl text-neutral-400 hover:text-rose-600 transition-colors border border-black/[0.06]"
                                  title="Xóa kịch bản"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: TRANG SƠ ĐỒ WORKFLOW TOÀN TRANG (NẾU CẦN XEM TOÀN MÀN HÌNH)
              ======================================================== */}
          {workflowView === 'editor' && currentWorkflow && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top Navigation & Workflow Bar */}
              <div className="bg-white border border-black/[0.08] p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Back Button & Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setWorkflowView('list')}
                      className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 border border-black/[0.08] rounded-xl text-xs font-bold text-neutral-800 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-xs"
                      title="Quay lại danh sách kịch bản"
                    >
                      <ArrowLeft className="w-4 h-4 text-neutral-700" />
                      Quay Lại Danh Sách
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight truncate">
                          {currentWorkflow.name}
                        </h2>
                        <span
                          className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            getCategoryBadge(currentWorkflow.category).color
                          }`}
                        >
                          {getCategoryBadge(currentWorkflow.category).label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {currentWorkflow.description}
                      </p>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                    {/* Fast Switcher between Workflows */}
                    <select
                      value={selectedWorkflowId}
                      onChange={e => setSelectedWorkflowId(e.target.value)}
                      className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:bg-white"
                      title="Đổi sang kịch bản khác"
                    >
                      {workflows.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>

                    {/* Simulation Run Button */}
                    <button
                      onClick={() => setIsSimModalOpen(true)}
                      className="px-4 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Mô Phỏng Chạy Thử
                    </button>

                    {/* Toggle Status Switch */}
                    <button
                      onClick={() => {
                        toggleWorkflow(currentWorkflow.id);
                        showToast(
                          currentWorkflow.isActive
                            ? 'Đã tạm dừng kịch bản.'
                            : 'Đã kích hoạt kịch bản chạy tự động 24/7.'
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

                {/* Sub-bar: Trigger Event & Nodes Count */}
                <div className="pt-3 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Sự kiện kích hoạt: {currentWorkflow.triggerEvent}
                    </span>
                    <span className="text-neutral-400 hidden sm:inline">•</span>
                    <span className="text-neutral-500 font-medium">
                      Quy trình gồm <strong className="text-neutral-900">{currentWorkflow.nodes.length} bước (Nodes)</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mọi thay đổi trên sơ đồ đều được tự động lưu</span>
                  </div>
                </div>
              </div>

              {/* Core Interactive Node Canvas with Draggable Nodes */}
              <NodeCanvas
                nodes={currentWorkflow.nodes}
                activeNodeId={activeSimNodeId}
                onSelectNode={node => {
                  setSelectedNode(node);
                  setIsDrawerOpen(true);
                }}
                onAddNodeAfter={handleAddNodeAfter}
                onUpdateNodePosition={handleUpdateNodePosition}
              />

              {/* Quick Guidance Box */}
              <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Hướng dẫn tùy chỉnh sơ đồ Node Workflow:</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    • <strong>Kéo thả node:</strong> Bấm giữ chuột trên bất kỳ Node nào để kéo & thả di chuyển tự do trên canvas, các đường dây nối sẽ tự động uốn theo.
                    <br />• <strong>Chỉnh sửa nội dung:</strong> Bấm vào Node để mở Popup cấu hình thời gian chờ, tin nhắn Zalo/SMS hoặc rẽ nhánh điều kiện If/Else.
                    <br />• <strong>Thêm bước tiếp theo:</strong> Bấm vào vòng tròn cổng kết nối màu xanh ở cạnh phải của mỗi Node.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          POPUP MODAL TOÀN DIỆN MỞ SƠ ĐỒ WORKFLOW (FLOATING POPUP CANVAS)
          ======================================================== */}
      {isWorkflowModalOpen &&
        currentWorkflow &&
        createPortal(
          <div className="fixed inset-0 z-[150] p-2 sm:p-5 flex items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              onClick={() => setIsWorkflowModalOpen(false)}
              className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Dialog Window */}
            <div className="relative w-full max-w-[96vw] h-[92vh] bg-white border border-black/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-black/[0.06] bg-neutral-50/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center shrink-0 shadow-xs">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight truncate">
                        {currentWorkflow.name}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          getCategoryBadge(currentWorkflow.category).color
                        }`}
                      >
                        {getCategoryBadge(currentWorkflow.category).label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      Sự kiện kích hoạt: <strong className="text-purple-700">{currentWorkflow.triggerEvent}</strong> •{' '}
                      {currentWorkflow.nodes.length} bước (Nodes)
                    </p>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  {/* Workflow Switcher Dropdown */}
                  <select
                    value={selectedWorkflowId}
                    onChange={e => setSelectedWorkflowId(e.target.value)}
                    className="px-3 py-2 bg-white border border-black/[0.1] rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
                    title="Đổi sang kịch bản khác"
                  >
                    {workflows.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>

                  {/* Toggle Active Button */}
                  <button
                    onClick={() => {
                      toggleWorkflow(currentWorkflow.id);
                      showToast(
                        currentWorkflow.isActive
                          ? 'Đã tạm dừng kịch bản.'
                          : 'Đã kích hoạt kịch bản chạy tự động 24/7.'
                      );
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      currentWorkflow.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentWorkflow.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                      }`}
                    />
                    {currentWorkflow.isActive ? 'Đang Hoạt Động' : 'Tạm Dừng'}
                  </button>

                  {/* Run Simulation */}
                  <button
                    onClick={() => setIsSimModalOpen(true)}
                    className="px-3.5 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Chạy Thử
                  </button>

                  {/* Close Popup Button */}
                  <button
                    onClick={() => setIsWorkflowModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors shadow-xs"
                    title="Đóng popup sơ đồ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Interactive Node Canvas with Drag & Drop */}
              <div className="flex-1 overflow-hidden p-4 bg-[#F9FAFB]">
                <NodeCanvas
                  nodes={currentWorkflow.nodes}
                  activeNodeId={activeSimNodeId}
                  onSelectNode={node => {
                    setSelectedNode(node);
                    setIsDrawerOpen(true);
                  }}
                  onAddNodeAfter={handleAddNodeAfter}
                  onUpdateNodePosition={handleUpdateNodePosition}
                />
              </div>

              {/* Modal Footer Guidance */}
              <div className="px-5 py-3 border-t border-black/[0.06] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-500 shrink-0">
                <div className="flex items-center gap-2 text-[11px]">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    💡 <strong>Mẹo:</strong> Bấm giữ chuột trên bất kỳ Node nào để <strong>kéo & thả di chuyển tự do</strong>. Bấm vào Node để <strong>mở Popup cấu hình</strong>.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tự động lưu tọa độ
                  </span>
                  <button
                    onClick={() => setIsWorkflowModalOpen(false)}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Hoàn Tất & Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================================
          TAB 2: CAMPAIGNS (CHIẾN DỊCH ADS & QUẢNG CÁO)
          ======================================================== */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                Chiến Dịch Tiếp Cận & Quảng Cáo (Ads Campaigns)
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Chạy các chiến dịch gửi tin hàng loạt qua Zalo OA, SMS Brandname hoặc đồng bộ tệp Custom Audience lên Facebook / TikTok Ads.
              </p>
            </div>

            <button
              onClick={() => setIsCreateCampModalOpen(true)}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Tạo Chiến Dịch Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(camp => (
              <div
                key={camp.id}
                className="bg-white border border-black/[0.08] rounded-3xl p-5 space-y-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-0.5 rounded-md">
                      {camp.channel}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {camp.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-neutral-900 text-sm mt-2.5">{camp.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Phân khúc: <strong className="text-neutral-800">{camp.segmentName}</strong>
                  </p>

                  <div className="mt-3 p-3 bg-neutral-50 rounded-2xl text-xs space-y-1 border border-black/[0.06]">
                    <p className="text-neutral-800">
                      🎁 <strong>Ưu đãi:</strong> {camp.offer}
                    </p>
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
        </div>
      )}

      {/* ========================================================
          TAB 3: SEGMENTS (PHÂN KHÚC KHÁCH HÀNG)
          ======================================================== */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-black/[0.08] p-5 sm:p-6 rounded-3xl shadow-xs">
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Phân Khúc Khách Hàng (Customer Segments)
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Các tệp khách hàng tự động được phân loại theo hành vi, giai đoạn Pipeline và ngân sách để đưa vào kịch bản chăm sóc.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map(seg => (
              <div
                key={seg.id}
                className="bg-white border border-black/[0.08] rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-neutral-900 text-sm">{seg.name}</h3>
                  <span className="text-[11px] font-bold bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full border border-black/[0.06]">
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
        </div>
      )}

      {/* Centered Popup Modal Cấu Hình Bước (Node Config Modal) */}
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

      {/* Modal Tạo Workflow Mới (Rendered via createPortal to body) */}
      {isCreateWfModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[160] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
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
                    placeholder="VD: Lead mới không chuyển đổi sau 48h"
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
                    Tạo & Chỉnh Sửa Sơ Đồ Node
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Tạo Chiến Dịch Ads (Rendered via createPortal to body) */}
      {isCreateCampModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[160] overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
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
          </div>,
          document.body
        )}
    </div>
  );
};
