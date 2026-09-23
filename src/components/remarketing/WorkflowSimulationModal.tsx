import React, { useState, useEffect } from 'react';
import { RemarketingWorkflow, WorkflowNode, Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Bell,
  X,
  User,
  ArrowRight,
  Terminal
} from 'lucide-react';

interface WorkflowSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: RemarketingWorkflow;
  onActiveNodeChange?: (nodeId: string | null) => void;
}

interface SimLog {
  timestamp: string;
  nodeId: string;
  nodeTitle: string;
  type: string;
  status: 'running' | 'success' | 'branch_yes' | 'branch_no' | 'finished';
  message: string;
}

export const WorkflowSimulationModal: React.FC<WorkflowSimulationModalProps> = ({
  isOpen,
  onClose,
  workflow,
  onActiveNodeChange
}) => {
  const { customers } = useApp();

  // Chọn khách hàng mẫu
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'demo');
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SimLog[]>([]);

  // Lấy khách hàng mô phỏng
  const foundCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerName = foundCustomer?.name || 'Nguyễn Thu Trang (Bí Thư 12 Anh 1)';
  const customerPhone = foundCustomer?.phone || '0981108601';
  const customerClass = foundCustomer?.className || '12 Anh 1';
  const customerSchool = foundCustomer?.schoolName || 'THPT Chuyên Trần Phú';

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setCurrentNodeId(null);
    setLogs([]);
    if (onActiveNodeChange) onActiveNodeChange(null);
  };

  const runSimulation = async () => {
    if (workflow.nodes.length === 0) return;
    setIsRunning(true);
    setIsCompleted(false);
    setLogs([]);

    const now = () => new Date().toLocaleTimeString('vi-VN');
    const startNode = workflow.nodes.find(n => n.type === 'trigger') || workflow.nodes[0];

    let curr: WorkflowNode | undefined = startNode;
    let stepCount = 0;

    while (curr && stepCount < 10) {
      stepCount++;
      const activeId = curr.id;
      setCurrentNodeId(activeId);
      if (onActiveNodeChange) onActiveNodeChange(activeId);

      // Thêm log bắt đầu xử lý node
      setLogs(prev => [
        ...prev,
        {
          timestamp: now(),
          nodeId: curr!.id,
          nodeTitle: curr!.title,
          type: curr!.type,
          status: 'running',
          message: `Đang kích hoạt bước: [${curr!.title}]...`
        }
      ]);

      // Giả lập thời gian xử lý (800ms)
      await new Promise(r => setTimeout(r, 900));

      // Quyết định hướng đi tiếp theo
      if (curr.type === 'condition') {
        // Giả lập rẽ nhánh (70% ra YES cho demo hấp dẫn)
        const isBranchYes = Math.random() > 0.35;
        const targetNextId: string | undefined = isBranchYes ? curr.yesNext : curr.noNext;

        setLogs(prev => [
          ...prev,
          {
            timestamp: now(),
            nodeId: curr!.id,
            nodeTitle: curr!.title,
            type: curr!.type,
            status: isBranchYes ? 'branch_yes' : 'branch_no',
            message: isBranchYes
              ? `✓ Điều kiện thoả mãn (YES) -> Chuyển luồng sang nhánh tích cực.`
              : `✕ Điều kiện không thoả mãn (NO) -> Chuyển luồng sang xử lý dự phòng.`
          }
        ]);

        await new Promise(r => setTimeout(r, 600));
        curr = workflow.nodes.find(n => n.id === targetNextId);
      } else if (curr.type === 'end') {
        setLogs(prev => [
          ...prev,
          {
            timestamp: now(),
            nodeId: curr!.id,
            nodeTitle: curr!.title,
            type: curr!.type,
            status: 'finished',
            message: `★ Luồng tự động hóa hoàn tất thành công cho khách hàng ${customerName}.`
          }
        ]);
        break;
      } else {
        const nextId: string | undefined = curr.next;
        setLogs(prev => [
          ...prev,
          {
            timestamp: now(),
            nodeId: curr!.id,
            nodeTitle: curr!.title,
            type: curr!.type,
            status: 'success',
            message: `✓ Hoàn thành: ${curr!.description.slice(0, 65)}...`
          }
        ]);
        curr = workflow.nodes.find(n => n.id === nextId);
      }
    }

    setIsRunning(false);
    setIsCompleted(true);
    setCurrentNodeId(null);
    if (onActiveNodeChange) onActiveNodeChange(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl bg-white border border-black/[0.08] rounded-3xl shadow-2xl overflow-hidden z-10 text-xs">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] flex items-center justify-between bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B8F23D]/50 text-neutral-900 border border-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                Workflow Simulation Lab
              </span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-500 font-semibold">{workflow.name}</span>
            </div>
            <h3 className="text-base font-extrabold text-neutral-900">
              Mô Phỏng Chạy Thử Kịch Bản Tự Động Hóa
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 border border-black/[0.06] flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Target Customer Picker */}
          <div className="p-4 bg-neutral-50 border border-black/[0.06] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">{customerName}</p>
                <p className="text-[11px] text-neutral-500">
                  {customerClass} ({customerSchool}) • {customerPhone}
                </p>
              </div>
            </div>

            <button
              disabled={isRunning}
              onClick={runSimulation}
              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xs shrink-0 ${
                isRunning
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-neutral-500" /> Đang Chạy Luồng...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Bắt Đầu Chạy Thử
                </>
              )}
            </button>
          </div>

          {/* Interactive Console Terminal */}
          <div className="bg-neutral-950 text-neutral-200 rounded-2xl p-4 font-mono text-[11px] space-y-2 border border-neutral-800">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#B8F23D]" />
                Nhật Ký Thực Thi Thời Gian Thực (Execution Log)
              </span>
              {logs.length > 0 && (
                <button
                  onClick={handleReset}
                  className="hover:text-white flex items-center gap-1 transition-colors text-[10px]"
                >
                  <RotateCcw className="w-3 h-3" /> Làm mới
                </button>
              )}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 custom-scrollbar pr-1 pt-1">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 font-sans">
                  Nhấn "Bắt Đầu Chạy Thử" để xem các bước tự động gửi tin, tính toán thời gian chờ và rẽ nhánh điều kiện.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 leading-relaxed animate-in fade-in">
                    <span className="text-neutral-500 select-none">[{log.timestamp}]</span>
                    {log.status === 'running' ? (
                      <span className="text-sky-400 font-bold">⚡ {log.message}</span>
                    ) : log.status === 'branch_yes' ? (
                      <span className="text-emerald-400 font-bold">{log.message}</span>
                    ) : log.status === 'branch_no' ? (
                      <span className="text-rose-400 font-bold">{log.message}</span>
                    ) : log.status === 'finished' ? (
                      <span className="text-[#B8F23D] font-bold">{log.message}</span>
                    ) : (
                      <span className="text-neutral-300">{log.message}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {isCompleted && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Mô phỏng thành công! Kịch bản sẵn sàng chạy tự động 24/7.</span>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
