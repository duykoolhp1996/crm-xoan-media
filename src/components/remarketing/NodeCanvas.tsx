import React, { useState, useEffect, useRef } from 'react';
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
  Move,
  Info,
  Maximize,
  Layers,
  X,
  Link2,
  Unlink
} from 'lucide-react';

interface NodeCanvasProps {
  nodes: WorkflowNode[];
  activeNodeId?: string | null;
  onSelectNode: (node: WorkflowNode) => void;
  onAddNodeAfter?: (sourceNodeId: string, branch?: 'next' | 'yes' | 'no') => void;
  onUpdateNodePosition?: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onAddSpecificNode?: (type: WorkflowNodeType) => void;
  onConnectNodes?: (sourceId: string, targetId: string, branch: 'next' | 'yes' | 'no') => void;
  onDisconnectNodes?: (sourceId: string, branch: 'next' | 'yes' | 'no') => void;
}

const NODE_WIDTH = 250;
const NODE_HEIGHT = 150;

interface WireDragState {
  sourceNodeId: string;
  branch: 'next' | 'yes' | 'no';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  activeNodeId,
  onSelectNode,
  onAddNodeAfter,
  onUpdateNodePosition,
  onAddSpecificNode,
  onConnectNodes,
  onDisconnectNodes
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Quản lý vị trí kéo thả cục bộ của từng Node
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Trạng thái kéo dây nối giữa 2 điểm (Port-to-Port dragging)
  const [wireDrag, setWireDrag] = useState<WireDragState | null>(null);
  const [hoveredTargetNodeId, setHoveredTargetNodeId] = useState<string | null>(null);

  // Đồng bộ vị trí từ props nodes
  useEffect(() => {
    setPositions(prev => {
      const nextPos = { ...prev };
      nodes.forEach(n => {
        if (!nextPos[n.id] || (n.position && !draggingNodeId)) {
          nextPos[n.id] = n.position || { x: 50, y: 180 };
        }
      });
      return nextPos;
    });
  }, [nodes, draggingNodeId]);

  // Ref lưu trạng thái bắt đầu kéo di chuyển node
  const dragRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    nodeStartX: number;
    nodeStartY: number;
    hasMoved: boolean;
  } | null>(null);

  // Lắng nghe sự kiện di chuyển và thả chuột toàn màn hình cho KÉO NODE & KÉO DÂY NỐI
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Xử lý kéo di chuyển node
      if (dragRef.current) {
        const { nodeId, startX, startY, nodeStartX, nodeStartY } = dragRef.current;
        const dx = (e.clientX - startX) / zoomLevel;
        const dy = (e.clientY - startY) / zoomLevel;

        if (Math.hypot(dx, dy) > 4) {
          dragRef.current.hasMoved = true;
        }

        const newX = Math.max(20, Math.round(nodeStartX + dx));
        const newY = Math.max(20, Math.round(nodeStartY + dy));

        setPositions(prev => ({
          ...prev,
          [nodeId]: { x: newX, y: newY }
        }));
      }

      // 2. Xử lý kéo dây nối điểm (Port dragging)
      if (wireDrag && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - canvasRect.left) / zoomLevel;
        const mouseY = (e.clientY - canvasRect.top) / zoomLevel;

        setWireDrag(prev =>
          prev ? { ...prev, currentX: Math.round(mouseX), currentY: Math.round(mouseY) } : null
        );

        // Kiểm tra xem chuột đang hover trên node nào khác node nguồn
        let foundTarget: string | null = null;
        for (const n of nodes) {
          if (n.id === wireDrag.sourceNodeId) continue;
          const nPos = getNodePos(n);
          if (
            mouseX >= nPos.x - 20 &&
            mouseX <= nPos.x + NODE_WIDTH + 20 &&
            mouseY >= nPos.y - 15 &&
            mouseY <= nPos.y + NODE_HEIGHT + 15
          ) {
            foundTarget = n.id;
            break;
          }
        }
        setHoveredTargetNodeId(foundTarget);
      }
    };

    const handleMouseUp = () => {
      // 1. Hoàn tất kéo di chuyển node
      if (dragRef.current) {
        const { nodeId, hasMoved } = dragRef.current;
        const finalPos = positions[nodeId];

        if (hasMoved && finalPos && onUpdateNodePosition) {
          onUpdateNodePosition(nodeId, finalPos);
        }

        dragRef.current = null;
        setDraggingNodeId(null);
      }

      // 2. Hoàn tất kéo dây nối 2 điểm
      if (wireDrag) {
        if (hoveredTargetNodeId && hoveredTargetNodeId !== wireDrag.sourceNodeId) {
          onConnectNodes?.(wireDrag.sourceNodeId, hoveredTargetNodeId, wireDrag.branch);
        }
        setWireDrag(null);
        setHoveredTargetNodeId(null);
      }
    };

    if (draggingNodeId || wireDrag) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingNodeId, wireDrag, hoveredTargetNodeId, zoomLevel, positions, nodes, onUpdateNodePosition, onConnectNodes]);

  // Helper tính toán tọa độ node
  const getNodePos = (node: WorkflowNode) => {
    return positions[node.id] || node.position || { x: 50, y: 180 };
  };

  // Tự động thu phóng để thấy trọn vẹn tất cả các Node (Fit to view)
  const handleFitToView = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 60;
    const maxNodeX = Math.max(...nodes.map(n => getNodePos(n).x + NODE_WIDTH + 80), 1200);
    const fitZoom = Math.min(1, Math.max(0.5, containerWidth / maxNodeX));
    setZoomLevel(Number(fitZoom.toFixed(2)));
  };

  // Tự động căn chỉnh khi danh sách nodes thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToView();
    }, 60);
    return () => clearTimeout(timer);
  }, [nodes.length]);

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
  const allX = nodes.map(n => getNodePos(n).x + NODE_WIDTH + 200);
  const allY = nodes.map(n => getNodePos(n).y + NODE_HEIGHT + 200);
  const maxX = Math.max(...allX, 1600);
  const maxY = Math.max(...allY, 650);

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
    <div className="relative w-full rounded-3xl border border-black/[0.08] bg-[#F9FAFB] overflow-hidden shadow-xs flex flex-col">
      {/* Top Action & Palette Bar */}
      <div className="z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Info & Nodes Count */}
        <div className="flex items-center gap-2 font-semibold text-neutral-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold text-neutral-900">Sơ Đồ Workflow:</span>
          <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-lg border border-black/[0.06] font-bold">
            {nodes.length} Nodes
          </span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-600 text-[11px] font-medium hidden sm:inline flex items-center gap-1">
            <Link2 className="w-3.5 h-3.5 text-blue-600 inline" />
            <strong>Kéo 2 điểm với nhau để nối</strong> • Bấm <strong>✕</strong> trên dây để hủy nối • <strong>Double-click</strong> để sửa
          </span>
        </div>

        {/* Center: Add Specific Node Type Palette */}
        {onAddSpecificNode && (
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-50 p-1 rounded-xl border border-black/[0.06]">
            <span className="text-[10px] font-bold text-neutral-400 px-1 uppercase tracking-wider">
              Thêm Node:
            </span>
            <button
              onClick={() => onAddSpecificNode('trigger')}
              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors"
              title="Thêm điểm kích hoạt Pipeline"
            >
              <Sparkles className="w-3 h-3 text-purple-600" /> + Trigger
            </button>
            <button
              onClick={() => onAddSpecificNode('delay')}
              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors"
              title="Thêm bước chờ thời gian"
            >
              <Clock className="w-3 h-3 text-sky-600" /> + Delay
            </button>
            <button
              onClick={() => onAddSpecificNode('action')}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors"
              title="Thêm hành động gửi tin Zalo/SMS"
            >
              <Send className="w-3 h-3 text-emerald-600" /> + Action
            </button>
            <button
              onClick={() => onAddSpecificNode('condition')}
              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors"
              title="Thêm rẽ nhánh điều kiện If/Else"
            >
              <GitFork className="w-3 h-3 text-amber-600" /> + Condition
            </button>
            <button
              onClick={() => onAddSpecificNode('notification')}
              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors"
              title="Thêm task giao việc cho Sales"
            >
              <Bell className="w-3 h-3 text-rose-600" /> + Task
            </button>
            <button
              onClick={() => onAddSpecificNode('end')}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded-lg font-bold flex items-center gap-1 text-[10px] transition-colors"
              title="Thêm kết thúc luồng"
            >
              <CheckCircle2 className="w-3 h-3 text-neutral-600" /> + End
            </button>
          </div>
        )}

        {/* Right: Zoom & Fit to Screen Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleFitToView}
            className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-black/[0.08] text-neutral-700 rounded-xl font-bold flex items-center gap-1 text-[11px] shadow-xs transition-colors"
            title="Tự động thu phóng để nhìn thấy toàn bộ tất cả các Node"
          >
            <Maximize className="w-3.5 h-3.5 text-blue-600" />
            Xem Toàn Bộ ({nodes.length} Nodes)
          </button>

          <div className="flex items-center bg-white border border-black/[0.08] rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.4))}
              className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-neutral-600 px-1.5">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.4))}
              className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="overflow-auto custom-scrollbar p-6 min-h-[580px] max-h-[720px] select-none flex-1"
      >
        <div
          ref={canvasRef}
          className="relative transition-transform duration-75 origin-top-left"
          style={{
            width: `${maxX}px`,
            height: `${maxY}px`,
            transform: `scale(${zoomLevel})`,
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* SVG Connecting Paths & Dynamic Dragging Wire */}
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
              <marker
                id="arrow-wire-drag"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B82F6" />
              </marker>
            </defs>

            {/* Render các đường nối hiện có */}
            {edges.map(edge => {
              const dx = (edge.x2 - edge.x1) / 2;
              const pathD = `M ${edge.x1} ${edge.y1} C ${edge.x1 + dx} ${edge.y1}, ${edge.x2 - dx} ${edge.y2}, ${edge.x2} ${edge.y2}`;

              const isYes = edge.type === 'yes';
              const isNo = edge.type === 'no';
              const strokeColor = isYes ? '#10B981' : isNo ? '#EF4444' : '#94A3B8';
              const markerId = isYes ? 'url(#arrow-yes)' : isNo ? 'url(#arrow-no)' : 'url(#arrow-standard)';

              const midX = (edge.x1 + edge.x2) / 2;
              const midY = (edge.y1 + edge.y2) / 2;

              return (
                <g key={edge.id} className="pointer-events-auto group/edge">
                  {/* Đường kết nối cong */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isYes || isNo ? 2.5 : 2}
                    strokeDasharray={isNo ? '4 3' : 'none'}
                    markerEnd={markerId}
                    className="group-hover/edge:stroke-blue-500 transition-colors"
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

                  {/* Nút bấm hủy nối dây (Disconnect) */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    onClick={e => {
                      e.stopPropagation();
                      const branch = edge.type === 'yes' ? 'yes' : edge.type === 'no' ? 'no' : 'next';
                      onDisconnectNodes?.(edge.fromNode.id, branch);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      r="10"
                      fill="#FFFFFF"
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      className="opacity-70 group-hover/edge:opacity-100 hover:scale-125 hover:fill-rose-500 transition-all shadow-sm"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fill="#EF4444"
                      fontSize="9"
                      fontWeight="black"
                      className="select-none pointer-events-none group-hover/edge:fill-white font-sans"
                    >
                      ✕
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Dây nối sống động đang được người dùng kéo chuột (Live Wire Dragging) */}
            {wireDrag && (
              <g className="pointer-events-none">
                {(() => {
                  const dx = (wireDrag.currentX - wireDrag.startX) / 2;
                  const pathD = `M ${wireDrag.startX} ${wireDrag.startY} C ${wireDrag.startX + dx} ${wireDrag.startY}, ${wireDrag.currentX - dx} ${wireDrag.currentY}, ${wireDrag.currentX} ${wireDrag.currentY}`;
                  const color =
                    wireDrag.branch === 'yes' ? '#10B981' : wireDrag.branch === 'no' ? '#EF4444' : '#2563EB';

                  return (
                    <>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={3}
                        strokeDasharray="6 4"
                        markerEnd="url(#arrow-wire-drag)"
                      />
                      <circle
                        cx={wireDrag.currentX}
                        cy={wireDrag.currentY}
                        r={6}
                        fill={color}
                        className="animate-pulse"
                      />
                    </>
                  );
                })()}
              </g>
            )}
          </svg>

          {/* Node Cards Rendering (Kéo thả thoải mái - Double-click mới mở Popup) */}
          {nodes.map(node => {
            const pos = getNodePos(node);
            const theme = getNodeHeaderTheme(node.type);
            const isActive = activeNodeId === node.id;
            const isDragging = draggingNodeId === node.id;
            const isTargetCandidate = hoveredTargetNodeId === node.id && wireDrag?.sourceNodeId !== node.id;

            return (
              <div
                key={node.id}
                onMouseDown={e => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button, .port-action, .port-wire')) return;

                  const currentPos = getNodePos(node);
                  dragRef.current = {
                    nodeId: node.id,
                    startX: e.clientX,
                    startY: e.clientY,
                    nodeStartX: currentPos.x,
                    nodeStartY: currentPos.y,
                    hasMoved: false
                  };
                  setDraggingNodeId(node.id);
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${NODE_WIDTH}px`
                }}
                className={`absolute bg-white rounded-2xl border transition-all duration-150 cursor-grab active:cursor-grabbing shadow-sm group select-none ${
                  isTargetCandidate
                    ? 'ring-4 ring-emerald-500 scale-[1.04] shadow-2xl z-40 border-emerald-500'
                    : isDragging
                    ? 'ring-4 ring-[#B8F23D]/80 shadow-2xl scale-[1.03] z-40 border-neutral-900'
                    : isActive
                    ? theme.activeRing + ' shadow-xl scale-105 z-30'
                    : 'border-black/[0.1] hover:shadow-lg ' + theme.borderHover + ' z-10'
                }`}
                title="Double-click (nhấp đúp) để chỉnh sửa • Kéo cổng bên phải đến node khác để nối dây"
              >
                {/* Node Header */}
                <div className="p-3 border-b border-black/[0.04] flex items-center justify-between bg-neutral-50/70 rounded-t-2xl">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${theme.badgeBg}`}
                    >
                      {theme.icon}
                      {theme.label}
                    </span>
                    {isDragging && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-md animate-pulse">
                        Đang kéo...
                      </span>
                    )}
                    {isTargetCandidate && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-bold rounded-md animate-pulse">
                        Thả để nối!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectNode(node);
                    }}
                    className="w-6 h-6 rounded-lg hover:bg-neutral-200 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors"
                    title="Cấu hình bước này (Click hoặc Double click)"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Node Body */}
                <div className="p-3.5 space-y-1.5 text-xs">
                  <h4 className="font-extrabold text-neutral-900 text-xs leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {node.title}
                  </h4>
                  {node.subtitle && (
                    <p className="text-[10px] font-semibold text-neutral-500">{node.subtitle}</p>
                  )}
                  <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                    {node.description}
                  </p>
                </div>

                {/* Node Footer / Stats */}
                <div className="px-3.5 py-2 border-t border-black/[0.04] bg-neutral-50/40 rounded-b-2xl flex items-center justify-between text-[10px] text-neutral-400">
                  {node.stats ? (
                    <>
                      <span>
                        Đã chạy: <strong className="text-neutral-700">{node.stats.processedCount}</strong>
                      </span>
                      <span className="font-bold text-emerald-600">{node.stats.successRate}% hiệu quả</span>
                    </>
                  ) : (
                    <span>Tự do kết nối</span>
                  )}
                </div>

                {/* Input Connection Port (Trái) - Nhận kết nối */}
                {node.type !== 'trigger' && (
                  <div
                    className={`absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 shadow-xs flex items-center justify-center transition-all ${
                      isTargetCandidate
                        ? 'border-emerald-500 bg-emerald-50 scale-125 ring-2 ring-emerald-400/50'
                        : 'border-neutral-400 group-hover:border-blue-500'
                    }`}
                    title="Cổng nhận tín hiệu đầu vào"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isTargetCandidate ? 'bg-emerald-600' : 'bg-neutral-400 group-hover:bg-blue-500'
                      }`}
                    />
                  </div>
                )}

                {/* Output Connection Port (Phải) - BẤM GIỮ VÀ KÉO ĐỂ NỐI DÂY */}
                {node.type !== 'end' && node.type !== 'condition' && (
                  <div
                    onMouseDown={e => {
                      const portX = pos.x + NODE_WIDTH;
                      const portY = pos.y + NODE_HEIGHT / 2;
                      e.stopPropagation();
                      e.preventDefault();
                      setWireDrag({
                        sourceNodeId: node.id,
                        branch: 'next',
                        startX: portX,
                        startY: portY,
                        currentX: portX,
                        currentY: portY
                      });
                    }}
                    className="port-wire absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-blue-500 shadow-md flex items-center justify-center hover:scale-125 hover:bg-blue-50 cursor-crosshair transition-all z-20"
                    title="🖱️ Bấm giữ và kéo điểm này sang Node khác để nối dây!"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 hover:scale-110" />
                  </div>
                )}

                {/* Condition specific Yes/No Ports - KÉO ĐIỂM ĐÚNG/SAI */}
                {node.type === 'condition' && (
                  <>
                    <div
                      onMouseDown={e => {
                        const portX = pos.x + NODE_WIDTH;
                        const portY = pos.y + NODE_HEIGHT / 2 - 20;
                        e.stopPropagation();
                        e.preventDefault();
                        setWireDrag({
                          sourceNodeId: node.id,
                          branch: 'yes',
                          startX: portX,
                          startY: portY,
                          currentX: portX,
                          currentY: portY
                        });
                      }}
                      className="port-wire absolute -right-3 top-1/2 -translate-y-[28px] w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-md flex items-center justify-center text-[9px] font-extrabold text-emerald-700 hover:scale-125 cursor-crosshair transition-all z-20"
                      title="Kéo cổng Đúng (YES) đến Node tiếp theo"
                    >
                      ✓
                    </div>
                    <div
                      onMouseDown={e => {
                        const portX = pos.x + NODE_WIDTH;
                        const portY = pos.y + NODE_HEIGHT / 2 + 20;
                        e.stopPropagation();
                        e.preventDefault();
                        setWireDrag({
                          sourceNodeId: node.id,
                          branch: 'no',
                          startX: portX,
                          startY: portY,
                          currentX: portX,
                          currentY: portY
                        });
                      }}
                      className="port-wire absolute -right-3 top-1/2 translate-y-[12px] w-6 h-6 rounded-full bg-rose-50 border-2 border-rose-500 shadow-md flex items-center justify-center text-[9px] font-extrabold text-rose-700 hover:scale-125 cursor-crosshair transition-all z-20"
                      title="Kéo cổng Sai (NO) đến Node tiếp theo"
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
