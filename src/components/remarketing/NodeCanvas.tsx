import React, { useState } from 'react';
import { WorkflowNode, WorkflowNodeType } from '../../types';
import {
  Sparkles,
  Clock,
  GitFork,
  Send,
  Bell,
  CheckCircle2,
  Plus,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface NodeCanvasProps {
  nodes: WorkflowNode[];
  activeNodeId?: string | null;
  onSelectNode: (node: WorkflowNode) => void;
  onAddNodeAfter?: (sourceNodeId: string, branch?: 'next' | 'yes' | 'no') => void;
}

const NODE_WIDTH = 250;
const NODE_HEIGHT = 150;

export const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  activeNodeId,
  onSelectNode,
  onAddNodeAfter
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Helper tính toán tọa độ cổng vào/ra (Ports)
  const getNodePos = (node: WorkflowNode) => {
    return node.position || { x: 50, y: 180 };
  };

  const getNodeHeaderTheme = (type: WorkflowNodeType) => {
    switch (type) {
      case 'trigger':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
          label: 'TRIGGER',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
          borderHover: 'hover:border-purple-400',
          activeRing: 'ring-4 ring-purple-400/50 border-purple-600'
        };
      case 'delay':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
          label: 'DELAY',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          borderHover: 'hover:border-sky-400',
          activeRing: 'ring-4 ring-sky-400/50 border-sky-600'
        };
      case 'condition':
        return {
          icon: <GitFork className="w-3.5 h-3.5 text-amber-600" />,
          label: 'CONDITION',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          borderHover: 'hover:border-amber-400',
          activeRing: 'ring-4 ring-amber-400/50 border-amber-600'
        };
      case 'action':
        return {
          icon: <Send className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'ACTION',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          borderHover: 'hover:border-emerald-400',
          activeRing: 'ring-4 ring-emerald-400/50 border-emerald-600'
        };
      case 'notification':
        return {
          icon: <Bell className="w-3.5 h-3.5 text-rose-600" />,
          label: 'TASK / NOTIFY',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          borderHover: 'hover:border-rose-400',
          activeRing: 'ring-4 ring-rose-400/50 border-rose-600'
        };
      case 'end':
      default:
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />,
          label: 'GOAL / END',
          badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          borderHover: 'hover:border-neutral-400',
          activeRing: 'ring-4 ring-neutral-400/50 border-neutral-600'
        };
    }
  };

  // Tính toán kích thước canvas dựa trên vị trí các node
  const maxX = Math.max(...nodes.map(n => getNodePos(n).x + NODE_WIDTH + 150), 1200);
  const maxY = Math.max(...nodes.map(n => getNodePos(n).y + NODE_HEIGHT + 150), 550);

  // Tạo danh sách đường nối (edges)
  interface Edge {
    id: string;
    fromNode: WorkflowNode;
    toNode: WorkflowNode;
    type: 'standard' | 'yes' | 'no';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  const edges: Edge[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  nodes.forEach(node => {
    const pos = getNodePos(node);

    if (node.next) {
      const target = nodeMap.get(node.next);
      if (target) {
        const targetPos = getNodePos(target);
        edges.push({
          id: `${node.id}->${target.id}`,
          fromNode: node,
          toNode: target,
          type: 'standard',
          x1: pos.x + NODE_WIDTH,
          y1: pos.y + NODE_HEIGHT / 2,
          x2: targetPos.x,
          y2: targetPos.y + NODE_HEIGHT / 2
        });
      }
    }

    if (node.yesNext) {
      const target = nodeMap.get(node.yesNext);
      if (target) {
        const targetPos = getNodePos(target);
        edges.push({
          id: `${node.id}->yes->${target.id}`,
          fromNode: node,
          toNode: target,
          type: 'yes',
          x1: pos.x + NODE_WIDTH,
          y1: pos.y + NODE_HEIGHT / 2 - 20,
          x2: targetPos.x,
          y2: targetPos.y + NODE_HEIGHT / 2
        });
      }
    }

    if (node.noNext) {
      const target = nodeMap.get(node.noNext);
      if (target) {
        const targetPos = getNodePos(target);
        edges.push({
          id: `${node.id}->no->${target.id}`,
          fromNode: node,
          toNode: target,
          type: 'no',
          x1: pos.x + NODE_WIDTH,
          y1: pos.y + NODE_HEIGHT / 2 + 20,
          x2: targetPos.x,
          y2: targetPos.y + NODE_HEIGHT / 2
        });
      }
    }
  });

  return (
    <div className="relative w-full rounded-3xl border border-black/[0.08] bg-[#F9FAFB] overflow-hidden shadow-xs">
      {/* Canvas Toolbars */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-black/[0.08] shadow-xs text-xs font-semibold text-neutral-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Quy Trình Hoạt Động (Flow Canvas)</span>
        <span className="text-neutral-300">|</span>
        <span className="text-neutral-500">{nodes.length} Nodes</span>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-black/[0.08] shadow-xs text-xs">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.4))}
          className="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono font-bold text-neutral-500 px-1">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.7))}
          className="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors"
          title="Đặt lại tỉ lệ (100%)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="overflow-auto custom-scrollbar p-6 min-h-[580px] max-h-[720px] select-none">
        <div
          className="relative transition-transform duration-150 origin-top-left"
          style={{
            width: `${maxX}px`,
            height: `${maxY}px`,
            transform: `scale(${zoomLevel})`,
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* SVG Connecting Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <marker
                id="arrow-standard"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#9CA3AF" />
              </marker>
              <marker
                id="arrow-yes"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
              </marker>
              <marker
                id="arrow-no"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EF4444" />
              </marker>
            </defs>

            {edges.map(edge => {
              const dx = (edge.x2 - edge.x1) / 2;
              const pathD = `M ${edge.x1} ${edge.y1} C ${edge.x1 + dx} ${edge.y1}, ${edge.x2 - dx} ${edge.y2}, ${edge.x2} ${edge.y2}`;

              const isYes = edge.type === 'yes';
              const isNo = edge.type === 'no';
              const strokeColor = isYes ? '#10B981' : isNo ? '#EF4444' : '#CBD5E1';
              const markerId = isYes ? 'url(#arrow-yes)' : isNo ? 'url(#arrow-no)' : 'url(#arrow-standard)';

              return (
                <g key={edge.id}>
                  {/* Đường kết nối cong */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isYes || isNo ? 2.5 : 2}
                    strokeDasharray={isNo ? '4 3' : 'none'}
                    markerEnd={markerId}
                  />

                  {/* Nhãn trên đường rẽ nhánh */}
                  {isYes && (
                    <g transform={`translate(${edge.x1 + 35}, ${edge.y1 - 16})`}>
                      <rect
                        width="46"
                        height="18"
                        rx="9"
                        fill="#ECFDF5"
                        stroke="#A7F3D0"
                        strokeWidth="1"
                      />
                      <text
                        x="23"
                        y="12"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#065F46"
                      >
                        ĐÚNG
                      </text>
                    </g>
                  )}

                  {isNo && (
                    <g transform={`translate(${edge.x1 + 35}, ${edge.y1 + 10})`}>
                      <rect
                        width="38"
                        height="18"
                        rx="9"
                        fill="#FEF2F2"
                        stroke="#FECACA"
                        strokeWidth="1"
                      />
                      <text
                        x="19"
                        y="12"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#991B1B"
                      >
                        SAI
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Node Cards Rendering */}
          {nodes.map(node => {
            const pos = getNodePos(node);
            const theme = getNodeHeaderTheme(node.type);
            const isActive = activeNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${NODE_WIDTH}px`
                }}
                className={`absolute bg-white rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm group ${
                  isActive
                    ? theme.activeRing + ' shadow-xl scale-105 z-30'
                    : 'border-black/[0.1] hover:shadow-md ' + theme.borderHover + ' z-10'
                }`}
              >
                {/* Node Header */}
                <div className="p-3 border-b border-black/[0.04] flex items-center justify-between bg-neutral-50/70 rounded-t-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${theme.badgeBg}`}>
                      {theme.icon}
                      {theme.label}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node);
                    }}
                    className="w-5 h-5 rounded-md hover:bg-neutral-200 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors"
                    title="Cấu hình bước này"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>

                {/* Node Body */}
                <div className="p-3.5 space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-neutral-900 text-xs leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {node.title}
                  </h4>
                  {node.subtitle && (
                    <p className="text-[10px] font-semibold text-neutral-500">
                      {node.subtitle}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                    {node.description}
                  </p>
                </div>

                {/* Node Footer / Stats */}
                <div className="px-3.5 py-2 border-t border-black/[0.04] bg-neutral-50/40 rounded-b-2xl flex items-center justify-between text-[10px] text-neutral-400">
                  {node.stats ? (
                    <>
                      <span>Đã chạy: <strong className="text-neutral-700">{node.stats.processedCount}</strong></span>
                      <span className="font-bold text-emerald-600">{node.stats.successRate}% hiệu quả</span>
                    </>
                  ) : (
                    <span>Tự động kích hoạt 24/7</span>
                  )}
                </div>

                {/* Input Connection Port (Trái) */}
                {node.type !== 'trigger' && (
                  <div
                    className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-neutral-400 shadow-xs flex items-center justify-center group-hover:border-blue-500 transition-colors"
                    title="Cổng nhận tín hiệu"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 group-hover:bg-blue-500" />
                  </div>
                )}

                {/* Output Connection Port (Phải) */}
                {node.type !== 'end' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddNodeAfter) onAddNodeAfter(node.id, 'next');
                    }}
                    className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-neutral-400 shadow-xs flex items-center justify-center hover:scale-125 hover:border-emerald-500 transition-all"
                    title="Cổng chuyển luồng - Bấm để thêm bước tiếp theo"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 hover:bg-emerald-500" />
                  </div>
                )}

                {/* Condition specific Yes/No Ports */}
                {node.type === 'condition' && (
                  <>
                    <div
                      className="absolute -right-2.5 top-1/2 -translate-y-[26px] w-4 h-4 rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-xs flex items-center justify-center text-[8px] font-bold text-emerald-700"
                      title="Cổng nhánh Đúng (YES)"
                    >
                      ✓
                    </div>
                    <div
                      className="absolute -right-2.5 top-1/2 translate-y-[10px] w-4 h-4 rounded-full bg-rose-50 border-2 border-rose-500 shadow-xs flex items-center justify-center text-[8px] font-bold text-rose-700"
                      title="Cổng nhánh Sai (NO)"
                    >
                      ✕
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
