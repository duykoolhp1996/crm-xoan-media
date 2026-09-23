import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskType } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const TaskModule: React.FC = () => {
  const { tasks, addTask, toggleTaskStatus, customers, currentUser, setSelectedCustomerId, setActiveTab } = useApp();

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form task mới
  const [newTask, setNewTask] = useState({
    title: '',
    customerId: customers[0]?.id || '',
    taskType: 'Gọi điện' as TaskType,
    priority: 'high' as TaskPriority,
    dueDate: '2024-10-28',
    dueTime: '14:00',
    note: ''
  });

  const filteredTasks = tasks.filter(t => {
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchType = filterType === 'all' || t.taskType === filterType;
    return matchPriority && matchType;
  });

  const priorityBadges: Record<TaskPriority, { label: string; badge: string }> = {
    urgent: { label: 'Khẩn cấp', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
    high: { label: 'Ưu tiên cao', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium: { label: 'Trung bình', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
    low: { label: 'Thấp', badge: 'bg-slate-100 text-slate-600 border-slate-200' }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === newTask.customerId);
    if (!cust || !newTask.title) return;

    addTask({
      title: newTask.title,
      customerId: cust.id,
      customerName: cust.name,
      schoolClass: `${cust.className} - ${cust.schoolName}`,
      assignedToId: currentUser.id,
      assignedToName: currentUser.name,
      dueDate: newTask.dueDate,
      dueTime: newTask.dueTime,
      priority: newTask.priority,
      taskType: newTask.taskType,
      status: 'pending',
      note: newTask.note
    });

    setIsModalOpen(false);
  };

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-orange-500" />
            Việc Cần Làm Hôm Nay & Theo Dõi Tương Tác (Tasks & Follow-up)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Không bỏ sót bất kỳ cuộc gọi, tin nhắn báo giá hay lịch chốt cọc kỷ yếu của các lớp
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Tạo Task Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <span className="font-bold text-slate-700">Lọc theo:</span>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="all">Tất cả độ ưu tiên</option>
          <option value="urgent">Khẩn cấp</option>
          <option value="high">Ưu tiên cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
        >
          <option value="all">Tất cả loại việc</option>
          <option value="Gọi điện">Gọi điện</option>
          <option value="Nhắn tin">Nhắn tin</option>
          <option value="Gửi báo giá">Gửi báo giá</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Xác nhận Booking">Xác nhận Booking</option>
          <option value="Thu tiền">Thu tiền</option>
        </select>
      </div>

      {/* Tasks List Container */}
      <div className="space-y-4">
        {/* Pending Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            Cần Hoàn Thành ({pendingTasks.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {pendingTasks.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">Bạn đã hoàn thành hết mọi công việc! Tuyệt vời 🎉</p>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="py-3.5 flex items-start justify-between gap-3 group hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-0.5 w-5 h-5 rounded-lg border-2 border-slate-300 hover:border-orange-500 flex items-center justify-center text-transparent hover:text-orange-500 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs">{task.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${priorityBadges[task.priority].badge}`}>
                          {priorityBadges[task.priority].label}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {task.taskType}
                        </span>
                      </div>

                      <p
                        onClick={() => {
                          setSelectedCustomerId(task.customerId);
                          setActiveTab('customers');
                        }}
                        className="text-[11px] text-orange-600 hover:underline cursor-pointer font-medium mt-0.5"
                      >
                        Khách: {task.customerName} ({task.schoolClass})
                      </p>

                      {task.note && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          "{task.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.dueDate} {task.dueTime || ''}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Giao cho: <strong>{task.assignedToName}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 opacity-70">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Đã Hoàn Thành ({completedTasks.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {completedTasks.map((task) => (
                <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="w-4 h-4 rounded text-emerald-600"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <span className="line-through text-slate-400 font-medium">{task.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{task.schoolClass}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 z-10 text-xs">
            <h3 className="text-base font-bold text-slate-900">Tạo Task Công Việc Mới</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="font-bold text-slate-800">Tên công việc / Hành động *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Gọi điện chốt cọc 12A1 Ams..."
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800">Khách Hàng / Lớp Liên Quan</label>
                <select
                  value={newTask.customerId}
                  onChange={e => setNewTask({ ...newTask, customerId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.className} - {c.schoolName} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800">Loại Việc</label>
                  <select
                    value={newTask.taskType}
                    onChange={e => setNewTask({ ...newTask, taskType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Gọi điện">Gọi điện</option>
                    <option value="Nhắn tin">Nhắn tin</option>
                    <option value="Gửi báo giá">Gửi báo giá</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Xác nhận Booking">Xác nhận Booking</option>
                    <option value="Thu tiền">Thu tiền</option>
                    <option value="Chăm sóc khách hàng">Chăm sóc khách hàng</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800">Mức Ưu Tiên</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="urgent">Khẩn cấp</option>
                    <option value="high">Ưu tiên cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800">Hạn Chót (Due Date)</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800">Giờ</label>
                  <input
                    type="time"
                    value={newTask.dueTime}
                    onChange={e => setNewTask({ ...newTask, dueTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  value={newTask.note}
                  onChange={e => setNewTask({ ...newTask, note: e.target.value })}
                  placeholder="Lưu ý khi gọi điện..."
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold"
                >
                  Tạo Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
