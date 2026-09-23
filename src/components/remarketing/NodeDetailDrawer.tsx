import React, { useState, useEffect } from 'react';
import { WorkflowNode, WorkflowNodeType } from '../../types';
import {
  X,
  Sparkles,
  Clock,
  GitFork,
  Send,
  Bell,
  CheckCircle2,
  Trash2,
  Save,
  MessageSquare,
  Tag,
  Users
} from 'lucide-react';

interface NodeDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  node: WorkflowNode | null;
  onSaveNode: (updatedNode: WorkflowNode) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  isOpen,
  onClose,
  node,
  onSaveNode,
  onDeleteNode
}) => {
  const [formData, setFormData] = useState<WorkflowNode | null>(null);

  useEffect(() => {
    if (node) {
      setFormData(JSON.parse(JSON.stringify(node)));
    }
  }, [node]);

  if (!isOpen || !formData) return null;

  const handleInsertVariable = (variable: string) => {
    const current = formData.config?.templateContent || '';
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        templateContent: current + ' ' + variable
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSaveNode(formData);
      onClose();
    }
  };

  const getNodeBadge = (type: WorkflowNodeType) => {
    switch (type) {
      case 'trigger':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-600" />,
          label: 'Trigger (Điểm Kích Hoạt)',
          color: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'delay':
        return {
          icon: <Clock className="w-4 h-4 text-sky-600" />,
          label: 'Delay (Thời Gian Chờ)',
          color: 'bg-sky-50 text-sky-700 border-sky-200'
        };
      case 'condition':
        return {
          icon: <GitFork className="w-4 h-4 text-amber-600" />,
          label: 'Condition (Rẽ Nhánh Điều Kiện)',
          color: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'action':
        return {
          icon: <Send className="w-4 h-4 text-emerald-600" />,
          label: 'Action (Hành Động Tự Động)',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'notification':
        return {
          icon: <Bell className="w-4 h-4 text-rose-600" />,
          label: 'Notification / Task (Giao Việc)',
          color: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'end':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-neutral-600" />,
          label: 'End (Kết Thúc Luồng)',
          color: 'bg-neutral-100 text-neutral-700 border-neutral-200'
        };
    }
  };

  const badge = getNodeBadge(formData.type);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-black/[0.08] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-black/[0.06] flex items-center justify-between bg-neutral-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                  {badge.icon}
                  {badge.label}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">ID: {formData.id}</span>
              </div>
              <h2 className="text-base font-extrabold text-neutral-900">Cấu Hình Bước Tự Động Hóa</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 border border-black/[0.06] flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
            {/* Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Tiêu Đề Node
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl font-bold text-neutral-900 focus:outline-none focus:bg-white focus:border-black/[0.2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Mô Tả Phụ (Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="VD: Zalo ZNS / Đếm ngược 24h..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800 focus:outline-none focus:bg-white focus:border-black/[0.2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Mô Tả Chi Tiết Mục Đích
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-700 leading-relaxed focus:outline-none focus:bg-white focus:border-black/[0.2]"
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            {formData.type === 'action' && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                  <MessageSquare className="w-4 h-4" /> Thiết Lập Hành Động Gửi Tin
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Kênh Phân Phối</label>
                  <select
                    value={formData.config?.channel || 'Zalo'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, channel: e.target.value as any }
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl font-semibold text-neutral-800 focus:outline-none"
                  >
                    <option value="Zalo">Zalo OA / ZNS</option>
                    <option value="SMS">SMS Brandname XoanMedia</option>
                    <option value="Facebook">Facebook Messenger Bot</option>
                    <option value="Email">Email Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    Nội Dung Mẫu Tin Nhắn
                  </label>
                  <textarea
                    rows={4}
                    value={formData.config?.templateContent || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, templateContent: e.target.value }
                      })
                    }
                    placeholder="Nhập nội dung tin nhắn gửi tự động..."
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-neutral-800 leading-relaxed focus:outline-none"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-neutral-400 font-medium mr-1">Chèn biến:</span>
                    {['{ten_khach}', '{lop}', '{truong}', '{link_portfolio}', '{han_chot}'].map(v => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => handleInsertVariable(v)}
                        className="px-2 py-0.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-lg transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    Gói Quà Tặng / Ưu Đãi Đính Kèm (Offer)
                  </label>
                  <input
                    type="text"
                    value={formData.config?.offerText || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, offerText: e.target.value }
                      })
                    }
                    placeholder="VD: Tặng Voucher 10% Flycam / Photobook 40 trang..."
                    className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-neutral-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {formData.type === 'delay' && (
              <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-sky-800 font-bold text-xs mb-1">
                  <Clock className="w-4 h-4" /> Thiết Lập Thời Gian Chờ
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Chờ Số Giờ (Hours)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.config?.delayHours || 0}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, delayHours: Number(e.target.value) }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-neutral-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Chờ Số Ngày (Days)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.config?.delayDays || 0}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          config: { ...formData.config, delayDays: Number(e.target.value) }
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-neutral-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'condition' && (
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1">
                  <GitFork className="w-4 h-4" /> Thiết Lập Điều Kiện Rẽ Nhánh
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Trường Điều Kiện</label>
                  <select
                    value={formData.config?.conditionField || 'customer_replied'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, conditionField: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl font-semibold text-neutral-800 focus:outline-none"
                  >
                    <option value="customer_replied">Khách đã đọc tin / Nhắn tin lại</option>
                    <option value="deposit_amount">Khách đã đặt cọc tiền (deposit &gt; 0)</option>
                    <option value="opened_survey_link">Khách đã mở link khảo sát / portfolio</option>
                    <option value="package_amount">Giá trị hợp đồng dự kiến</option>
                  </select>
                </div>

                <div className="p-3 bg-white border border-amber-200 rounded-xl text-[11px] space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Nhánh Đúng (YES): Chuyển đến Node {formData.yesNext || 'kế tiếp'}
                  </div>
                  <div className="flex items-center gap-2 text-rose-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Nhánh Sai (NO): Chuyển đến Node {formData.noNext || 'kế tiếp'}
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'notification' && (
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs mb-1">
                  <Bell className="w-4 h-4" /> Tạo Việc Nhắc Nhở Nhân Sự
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Vai Trò Phụ Trách</label>
                  <select
                    value={formData.config?.assignedRole || 'Sales Tư Vấn'}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, assignedRole: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl font-semibold text-neutral-800 focus:outline-none"
                  >
                    <option value="Sales Tư Vấn">Sales Tư Vấn phụ trách Lead</option>
                    <option value="Quản lý Kinh Doanh">Quản Lý Kinh Doanh / Vận Hành</option>
                    <option value="Admin">Admin Toàn Quyền</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Nội Dung Tiêu Đề Task</label>
                  <input
                    type="text"
                    value={formData.config?.taskTitle || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, taskTitle: e.target.value }
                      })
                    }
                    placeholder="VD: Gọi điện chốt cọc cho lớp {lop}..."
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-neutral-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Performance Stats */}
            {formData.stats && (
              <div className="p-4 bg-neutral-50 border border-black/[0.06] rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Hiệu Suất Thực Thi Node
                </span>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Số Lead đã xử lý qua bước này:</span>
                  <strong className="text-neutral-900 font-bold">{formData.stats.processedCount} lead</strong>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Tỷ lệ phản hồi / hoàn thành:</span>
                  <strong className="text-emerald-700 font-bold">{formData.stats.successRate}%</strong>
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="p-5 border-t border-black/[0.06] bg-neutral-50/50 flex items-center justify-between gap-3">
            {onDeleteNode && formData.type !== 'trigger' && formData.type !== 'end' ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn xóa bước "${formData.title}"?`)) {
                    onDeleteNode(formData.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa Node
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-neutral-100 border border-black/[0.08] text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Lưu Cấu Hình
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
