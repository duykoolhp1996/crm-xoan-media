import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { School, SchoolClass } from '../../types';
import {
  School as SchoolIcon,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  X
} from 'lucide-react';
import { CustomerDetail360 } from '../crm/CustomerDetail360';

export const SchoolClassModule: React.FC = () => {
  const { schools, classes, addClass, customers, bookings, setSelectedCustomerId, selectedCustomerId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);

  const [newClassData, setNewClassData] = useState({
    schoolId: schools[0]?.id || '',
    name: '',
    grade: 'Khối 12',
    academicYear: '2023-2024',
    studentCount: 40,
    representativeName: '',
    phone: '',
    status: 'lead' as const
  });

  const filteredSchools = schools.filter(school => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || school.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.name) return;

    const selectedSchool = schools.find(s => s.id === newClassData.schoolId);

    addClass({
      id: `cls-${Date.now()}`,
      schoolId: newClassData.schoolId,
      schoolName: selectedSchool ? selectedSchool.name : '',
      name: newClassData.name,
      grade: newClassData.grade,
      academicYear: newClassData.academicYear,
      studentCount: newClassData.studentCount,
      representativeName: newClassData.representativeName,
      phone: newClassData.phone,
      status: 'lead'
    });

    setNewClassData({
      schoolId: schools[0]?.id || '',
      name: '',
      grade: 'Khối 12',
      academicYear: '2023-2024',
      studentCount: 40,
      representativeName: '',
      phone: '',
      status: 'lead'
    });
    setIsAddClassModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-neutral-900" />
            Cây Phân Cấp Trường & Lớp Kỷ Yếu (School Tree)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Quản trị 18 trường trọng điểm, mạng lưới lớp và đầu mối liên hệ kỷ yếu
          </p>
        </div>

        <button
          onClick={() => setIsAddClassModalOpen(true)}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Thêm Lớp Mới Vào Trường
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 glass-panel-subtle p-3.5 sm:p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên trường (Ams, Chu Văn An, Bách Khoa, NEU...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-black/[0.08] text-neutral-900 placeholder-neutral-400 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-neutral-500 shrink-0">Cấp bậc:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-black/[0.08] rounded-xl text-xs font-semibold text-neutral-800 cursor-pointer focus:outline-none"
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
          const bookedClassesCount = bookings.filter(b => b.schoolName === school.name).length;
          const isExpanded = expandedSchoolId === school.id;

          return (
            <div
              key={school.id}
              className="glass-card rounded-3xl overflow-hidden transition-all shadow-xs"
            >
              {/* School Header Row */}
              <div
                onClick={() => setExpandedSchoolId(isExpanded ? null : school.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#B8F23D]/30 border border-[#B8F23D]/50 text-neutral-900 flex items-center justify-center font-extrabold text-sm shrink-0">
                    <SchoolIcon className="w-5 h-5 text-neutral-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 text-sm sm:text-base">{school.name}</h3>
                      <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-full">
                        {school.type}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Khu vực: {school.district}, {school.city} • Đã chụp thành công: <strong className="text-neutral-800 font-bold">{bookedClassesCount} lớp</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                    {schoolClasses.length} Lớp đang theo dõi
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Expanded Classes Sub-table */}
              {isExpanded && (
                <div className="border-t border-black/[0.05] bg-neutral-50/50 p-5">
                  {schoolClasses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      Chưa có lớp nào thuộc trường này được ghi nhận.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {schoolClasses.map((cls) => {
                        const matchedCustomer = customers.find(c => c.className === cls.name && c.schoolName === school.name);

                        return (
                          <div
                            key={cls.id}
                            className="bg-white p-4 rounded-2xl border border-black/[0.06] hover:border-black/[0.14] transition-all space-y-2.5 shadow-xs"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-bold text-neutral-900">{cls.name}</span>
                                <p className="text-[11px] text-neutral-500 mt-0.5">{cls.grade} • {cls.academicYear}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cls.status === 'booked' || cls.status === 'completed'
                                  ? 'bg-[#B8F23D] text-neutral-950'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}>
                                {cls.status === 'booked' ? 'Đã Booking' : cls.status === 'completed' ? 'Hoàn thành' : 'Đang tư vấn'}
                              </span>
                            </div>

                            <div className="text-[11px] text-neutral-600 space-y-1 pt-1 border-t border-black/[0.04]">
                              <p>Đại diện: <strong className="text-neutral-900 font-semibold">{cls.representativeName || 'Chưa cập nhật'}</strong></p>
                              <p>Số ĐT: <span className="font-mono text-neutral-700">{cls.phone || 'Chưa có'}</span></p>
                              <p>Sĩ số: <strong className="text-neutral-900">{cls.studentCount} bạn</strong></p>
                            </div>

                            {matchedCustomer && (
                              <button
                                onClick={() => setSelectedCustomerId(matchedCustomer.id)}
                                className="w-full mt-2 py-1.5 bg-neutral-50 hover:bg-neutral-900 hover:text-[#B8F23D] text-neutral-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-colors"
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
          <div onClick={() => setIsAddClassModalOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.08] shadow-2xl p-6 space-y-4 z-10 text-xs text-neutral-900">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <h3 className="text-sm font-bold text-neutral-900">Thêm Lớp Mới Vào Trường</h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-neutral-400 hover:text-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-700">Chọn Trường Học</label>
                <select
                  value={newClassData.schoolId}
                  onChange={e => setNewClassData({ ...newClassData, schoolId: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800 cursor-pointer"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700">Khối</label>
                  <input
                    type="text"
                    value={newClassData.grade}
                    onChange={e => setNewClassData({ ...newClassData, grade: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Tên Lớp (VD: 12A2)</label>
                  <input
                    type="text"
                    required
                    value={newClassData.name}
                    onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Người Đại Diện</label>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên đại diện..."
                  value={newClassData.representativeName}
                  onChange={e => setNewClassData({ ...newClassData, representativeName: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700">Số Điện Thoại</label>
                  <input
                    type="tel"
                    required
                    value={newClassData.phone}
                    onChange={e => setNewClassData({ ...newClassData, phone: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700">Sĩ Số</label>
                  <input
                    type="number"
                    value={newClassData.studentCount}
                    onChange={e => setNewClassData({ ...newClassData, studentCount: Number(e.target.value) })}
                    className="w-full mt-1.5 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] font-bold rounded-xl shadow-xs"
                >
                  Lưu Lớp Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer 360 Drawer */}
      {selectedCustomerId && (
        <CustomerDetail360
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </div>
  );
};
