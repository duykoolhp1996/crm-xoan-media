import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, SchoolClass } from '../../types';
import {
  GraduationCap,
  School as SchoolIcon,
  Plus,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const SchoolClassModule: React.FC = () => {
  const { schools, classes, addClass, setActiveTab, setSelectedCustomerId, customers } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(schools[0]?.id || null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  // Form state
  const [newClassData, setNewClassData] = useState({
    schoolId: schools[0]?.id || '',
    grade: 'Khối 12',
    name: '',
    academicYear: '2024-2025',
    studentCount: 38,
    representativeName: '',
    phone: '',
    facebook: '',
    zalo: ''
  });

  const filteredSchools = schools.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === 'all' || s.type === selectedType;
    return matchSearch && matchType;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSchool = schools.find(s => s.id === newClassData.schoolId);
    if (!targetSchool || !newClassData.name) return;

    addClass({
      id: `cls-${Date.now()}`,
      schoolId: targetSchool.id,
      schoolName: targetSchool.name,
      grade: newClassData.grade,
      name: newClassData.name,
      academicYear: newClassData.academicYear,
      studentCount: Number(newClassData.studentCount),
      representativeName: newClassData.representativeName,
      phone: newClassData.phone,
      facebook: newClassData.facebook,
      zalo: newClassData.zalo,
      status: 'lead'
    });

    setIsAddClassModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-orange-400" />
            Cây Phân Cấp Trường & Lớp Kỷ Yếu (School Tree)
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Cấu trúc chuẩn: <strong>Trường</strong> → <strong>Khối</strong> → <strong>Lớp</strong> → <strong>Người Đại Diện</strong> → <strong>Booking</strong>
          </p>
        </div>

        <button
          onClick={() => setIsAddClassModalOpen(true)}
          className="px-4 py-2 glass-btn-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Lớp Mới Vào Trường
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên trường (Ams, Chu Văn An, Bách Khoa, NEU...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-white/50 shrink-0">Cấp bậc:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 glass-input rounded-xl text-xs font-medium text-white/80 cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="all">Tất cả cấp ({schools.length})</option>
            <option value="THPT">Cấp 3 (THPT)</option>
            <option value="Đại học">Đại Học</option>
            <option value="THCS">Cấp 2 (THCS)</option>
          </select>
        </div>
      </div>

      {/* Schools Accordion List */}
      <div className="space-y-3">
        {filteredSchools.map((school) => {
          const schoolClasses = classes.filter(c => c.schoolId === school.id);
          const isExpanded = expandedSchoolId === school.id;

          return (
            <div
              key={school.id}
              className="glass-card rounded-3xl overflow-hidden transition-all"
            >
              {/* School Header Row */}
              <div
                onClick={() => setExpandedSchoolId(isExpanded ? null : school.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                    <SchoolIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm sm:text-base">{school.name}</h3>
                      <span className="text-[10px] font-bold bg-white/[0.08] text-white/70 border border-white/[0.1] px-2.5 py-0.5 rounded-full">
                        {school.type}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      Khu vực: {school.district}, {school.city} • Đã chụp thành công: <strong className="text-white/80">{school.totalClassesBooked} lớp</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/25 px-3 py-1 rounded-full">
                    {schoolClasses.length} Lớp đang theo dõi
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white/40" />
                  )}
                </div>
              </div>

              {/* Expanded Classes Sub-table */}
              {isExpanded && (
                <div className="border-t border-white/[0.08] bg-black/20 p-5">
                  {schoolClasses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-white/40">
                      Chưa có lớp nào thuộc trường này được ghi nhận.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {schoolClasses.map((cls) => {
                        const matchedCustomer = customers.find(c => c.className === cls.name && c.schoolName === school.name);

                        return (
                          <div
                            key={cls.id}
                            className="bg-white/[0.04] p-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-2.5"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-bold text-white">{cls.name}</span>
                                <p className="text-[11px] text-white/50 mt-0.5">{cls.grade} • {cls.academicYear}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                cls.status === 'booked'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}>
                                {cls.status === 'booked' ? 'Đã Booking' : 'Đang tư vấn'}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-white/[0.06] text-xs space-y-1.5">
                              <p className="text-white/70 flex items-center justify-between">
                                <span className="text-white/45">Đại diện:</span>
                                <strong className="text-white">{cls.representativeName}</strong>
                              </p>
                              <p className="text-white/70 flex items-center justify-between">
                                <span className="text-white/45">Số ĐT:</span>
                                <span className="font-mono text-white/80">{cls.phone}</span>
                              </p>
                              <p className="text-white/70 flex items-center justify-between">
                                <span className="text-white/45">Sỉ số:</span>
                                <span>{cls.studentCount} bạn</span>
                              </p>
                            </div>

                            {matchedCustomer && (
                              <button
                                onClick={() => {
                                  setSelectedCustomerId(matchedCustomer.id);
                                  setActiveTab('customers');
                                }}
                                className="w-full mt-2 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-xl text-xs font-semibold transition-colors"
                              >
                                Xem Hồ Sơ Customer 360 →
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Lớp Mới */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div onClick={() => setIsAddClassModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xl" />
          <div className="relative w-full max-w-md bg-neutral-900/90 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] p-6 space-y-4 z-10 text-xs text-white">
            <h3 className="text-sm font-bold text-white">Thêm Lớp Mới Vào Trường</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="font-medium text-white/70">Chọn Trường Học</label>
                <select
                  value={newClassData.schoolId}
                  onChange={e => setNewClassData({ ...newClassData, schoolId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl cursor-pointer [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-white/70">Khối</label>
                  <input
                    type="text"
                    value={newClassData.grade}
                    onChange={e => setNewClassData({ ...newClassData, grade: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-medium text-white/70">Tên Lớp (VD: 12A2)</label>
                  <input
                    type="text"
                    required
                    value={newClassData.name}
                    onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-white/70">Người Đại Diện</label>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên..."
                  value={newClassData.representativeName}
                  onChange={e => setNewClassData({ ...newClassData, representativeName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-white/70">Số Điện Thoại</label>
                  <input
                    type="tel"
                    required
                    value={newClassData.phone}
                    onChange={e => setNewClassData({ ...newClassData, phone: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-medium text-white/70">Sỉ Số</label>
                  <input
                    type="number"
                    value={newClassData.studentCount}
                    onChange={e => setNewClassData({ ...newClassData, studentCount: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 glass-input rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3.5 py-2 glass-btn-secondary rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 glass-btn-primary rounded-xl font-semibold"
                >
                  Lưu Lớp Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
