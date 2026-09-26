import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Star,
  Clock,
  Download,
  Search,
  Filter,
  Users,
  Camera,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  CalendarCheck
} from 'lucide-react';

export const PhotographerReports: React.FC = () => {
  const { photographers, bookings, feedbacks, currentUser, currentRole } = useApp();

  const isPhotographerUser = currentRole === 'photographer' || currentUser?.role === 'photographer';

  // Xác định thợ đang đăng nhập
  const currentPhotographer = useMemo(() => {
    if (!isPhotographerUser) return null;
    return (
      photographers.find(
        p =>
          p.id === currentUser.id ||
          p.fullName.toLowerCase() === currentUser.name.toLowerCase() ||
          (currentUser.email && p.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.phone && p.phone === currentUser.phone)
      ) || photographers[0]
    );
  }, [photographers, currentUser, isPhotographerUser]);

  // Kiểm tra xem thợ này có phải Lead không (LEAD - HẢI PHÒNG, LEAD - HÀ NỘI...)
  const isPhotoLead = useMemo(() => {
    if (!isPhotographerUser || !currentPhotographer) return false;
    return Boolean(
      currentPhotographer.notes?.toUpperCase().includes('LEAD') ||
      currentPhotographer.fullName.toLowerCase().includes('lead')
    );
  }, [isPhotographerUser, currentPhotographer]);

  // Xác định Team của thợ Lead (Hải Phòng hoặc Hà Nội)
  const myTeam = useMemo(() => {
    if (!currentPhotographer) return 'Toàn Studio';
    if (
      currentPhotographer.activeRegions?.includes('Hà Nội') ||
      currentPhotographer.notes?.toUpperCase().includes('HÀ NỘI')
    ) {
      return 'Hà Nội';
    }
    if (
      currentPhotographer.activeRegions?.includes('Hải Phòng') ||
      currentPhotographer.notes?.toUpperCase().includes('HẢI PHÒNG')
    ) {
      return 'Hải Phòng';
    }
    return currentPhotographer.activeRegions?.[0] || 'Studio';
  }, [currentPhotographer]);

  // Phân quyền dữ liệu theo nghiệp vụ:
  // - Admin / Manager: Xem toàn bộ studio
  // - Lead Thợ: Xem doanh thu của team và từng thành viên trong team mình
  // - Thành viên thợ thường: CHỈ xem được cá nhân của chính mình
  const accessiblePhotographers = useMemo(() => {
    if (!isPhotographerUser) return photographers;
    if (isPhotoLead) {
      return photographers.filter(
        p =>
          p.activeRegions?.includes(myTeam) ||
          p.notes?.toUpperCase().includes(myTeam.toUpperCase())
      );
    }
    // Thành viên thường: chỉ xem chính mình
    return currentPhotographer ? [currentPhotographer] : [];
  }, [photographers, isPhotographerUser, isPhotoLead, myTeam, currentPhotographer]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [hasShootsFilter, setHasShootsFilter] = useState<'all' | 'has_shoots' | 'no_shoots'>('all');

  // Thống kê hiệu suất theo thợ từ dữ liệu thực tế 100%
  const performanceData = useMemo(() => {
    return accessiblePhotographers.map(p => {
      // Tìm các booking thực tế được gán cho thợ này
      const pBookings = bookings.filter(
        b =>
          b.assignments.leadPhotographerId === p.id ||
          b.assignments.videographerId === p.id ||
          b.assignments.assistantPhotographerIds?.includes(p.id) ||
          b.assignments.leadPhotographerName === p.fullName
      );

      // Phân loại ca chụp thực tế
      const completedBookings = pBookings.filter(b =>
        ['Hoàn thành', 'Đã chụp', 'Đã bàn giao'].includes(b.bookingStatus)
      );
      const inProgressBookings = pBookings.filter(b =>
        ['Sắp chụp', 'Đang chụp', 'Hậu kỳ', 'Đã xác nhận'].includes(b.bookingStatus)
      );

      const completedCount = completedBookings.length;
      const inProgressCount = inProgressBookings.length;
      const totalBookingsCount = pBookings.length;

      // Doanh thu thực tế mang về từ các lớp thợ này phục vụ (không lấy số ảo)
      const totalRevenueGenerated = pBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      // Thù lao thực tế: ca đã hoàn thành * đơn giá ca
      const totalEarnings = completedCount * p.ratePerShoot;
      // Thù lao tạm tính đang diễn ra
      const pendingEarnings = inProgressCount * p.ratePerShoot;

      // Giờ tác nghiệp thực tế (8h / ca hoàn thành)
      const hoursWorked = completedCount * 8;

      // Tìm feedback thực tế liên quan đến thợ này
      const pBookingIds = new Set(pBookings.map(b => b.id));
      const relatedFeedbacks = feedbacks.filter(
        f =>
          (f.bookingId && pBookingIds.has(f.bookingId)) ||
          f.photographerMentioned?.some(m => m.toLowerCase().includes(p.fullName.toLowerCase()))
      );

      let actualRating: number | null = null;
      if (relatedFeedbacks.length > 0) {
        const ratingSum = relatedFeedbacks.reduce((sum, f) => {
          return sum + (f.aspects?.photographerCrew || f.rating || 5);
        }, 0);
        actualRating = Number((ratingSum / relatedFeedbacks.length).toFixed(1));
      } else if (p.rating && p.rating > 0) {
        actualRating = p.rating;
      }

      return {
        ...p,
        currentBookingsCount: totalBookingsCount,
        completedCount,
        inProgressCount,
        totalEarnings,
        pendingEarnings,
        totalRevenueGenerated,
        hoursWorked,
        actualRating,
        feedbackCount: relatedFeedbacks.length
      };
    });
  }, [accessiblePhotographers, bookings, feedbacks]);

  // Bộ lọc danh sách
  const filteredData = useMemo(() => {
    return performanceData.filter(item => {
      // Tìm kiếm tên, số điện thoại
      const matchesSearch =
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()));

      // Lọc vai trò
      const matchesRole =
        roleFilter === 'all' ||
        item.skills.some(s => s.toLowerCase().includes(roleFilter.toLowerCase())) ||
        (roleFilter === 'Chụp chính' && item.notes?.includes('LEAD')) ||
        (roleFilter === 'Chụp phụ' && item.notes?.includes('SP')) ||
        (roleFilter === 'Quay phim' && item.notes?.includes('QUAY'));

      // Lọc khu vực
      const matchesRegion =
        regionFilter === 'all' ||
        item.activeRegions.some(r => r.toLowerCase().includes(regionFilter.toLowerCase()));

      // Lọc có ca chụp hay chưa
      const matchesHasShoots =
        hasShootsFilter === 'all' ||
        (hasShootsFilter === 'has_shoots' && item.currentBookingsCount > 0) ||
        (hasShootsFilter === 'no_shoots' && item.currentBookingsCount === 0);

      return matchesSearch && matchesRole && matchesRegion && matchesHasShoots;
    });
  }, [performanceData, searchTerm, roleFilter, regionFilter, hasShootsFilter]);

  // Tổng hợp KPI thực tế theo quyền truy cập
  const totalSummary = useMemo(() => {
    const totalCrew = accessiblePhotographers.length;
    const totalCompletedShoots = performanceData.reduce((acc, p) => acc + p.completedCount, 0);
    const totalAssignedShoots = performanceData.reduce((acc, p) => acc + p.currentBookingsCount, 0);
    const totalPayout = performanceData.reduce((acc, p) => acc + p.totalEarnings, 0);
    const totalRevenue = performanceData.reduce((acc, p) => acc + p.totalRevenueGenerated, 0);
    const totalHours = performanceData.reduce((acc, p) => acc + p.hoursWorked, 0);

    return {
      totalCrew,
      totalCompletedShoots,
      totalAssignedShoots,
      totalPayout,
      totalRevenue,
      totalHours
    };
  }, [accessiblePhotographers, performanceData]);

  // Xuất file CSV dữ liệu thực tế
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Họ Và Tên',
      'SĐT',
      'Vai Trò',
      'Khu Vực',
      'Đơn Giá (đ/buổi)',
      'Tổng Ca Gán',
      'Ca Hoàn Thành',
      'Giờ Làm Việc',
      'Đánh Giá',
      'Doanh Thu Mang Về (đ)',
      'Thù Lao Đã Nghiệm Thu (đ)',
      'Thù Lao Tạm Tính (đ)'
    ];

    const rows = filteredData.map(p => [
      p.id,
      `"${p.fullName}"`,
      `"${p.phone}"`,
      `"${p.skills.join(', ')}"`,
      `"${p.activeRegions.join(', ')}"`,
      p.ratePerShoot,
      p.currentBookingsCount,
      p.completedCount,
      p.hoursWorked,
      p.actualRating ? p.actualRating : 'Chưa có',
      p.totalRevenueGenerated,
      p.totalEarnings,
      p.pendingEarnings
    ]);

    const fileNamePrefix = !isPhotographerUser
      ? 'bao_cao_toan_studio'
      : isPhotoLead
      ? `bao_cao_team_${myTeam.toLowerCase().replace(/\s+/g, '_')}`
      : `bao_cao_ca_nhan_${(currentPhotographer?.fullName || currentUser.name).toLowerCase().replace(/\s+/g, '_')}`;

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              {isPhotographerUser
                ? isPhotoLead
                  ? `Báo Cáo Hiệu Suất & Doanh Thu - Team ${myTeam}`
                  : 'Báo Cáo Hiệu Suất & Thù Lao Cá Nhân'
                : 'Báo Cáo Hiệu Suất & Thù Lao Đội Ngũ Thợ Chụp'}
            </h1>
            {isPhotographerUser && (
              <span className="text-[11px] font-bold bg-[#B8F23D] text-neutral-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                {isPhotoLead ? `🎖️ Đội Trưởng Team ${myTeam}` : `📸 Thợ Chụp: ${currentPhotographer?.fullName || currentUser.name}`}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {isPhotographerUser
              ? isPhotoLead
                ? `Quyền Đội Trưởng Ekip: Xem tổng hợp doanh thu team và chi tiết thù lao, ca chụp của từng thành viên Team ${myTeam}`
                : 'Tài khoản Thợ Chụp cá nhân: Theo dõi lịch tác nghiệp, số ca hoàn thành và tổng thù lao thực nhận của bạn'
              : 'Dữ liệu thực tế 100% được liên kết tự động từ danh sách Ekip chính thức và tiến độ Booking'}
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" /> Xuất Bảng Thù Lao (CSV)
        </button>
      </div>

      {/* KPI Cards từ Data Thực */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Tổng Ekip / Hồ sơ */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">
              {!isPhotographerUser
                ? 'Quy Mô Ekip'
                : isPhotoLead
                ? `Thành Viên Team ${myTeam}`
                : 'Hồ Sơ Của Bạn'}
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {!isPhotographerUser || isPhotoLead ? (
              <>
                {totalSummary.totalCrew} <span className="text-sm font-semibold text-neutral-500">nhân sự</span>
              </>
            ) : (
              <span className="truncate block text-lg font-bold">
                {currentPhotographer?.fullName || currentUser.name}
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {!isPhotographerUser
              ? 'Đã cấp tài khoản CRM'
              : isPhotoLead
              ? `Tất cả thợ thuộc Team ${myTeam}`
              : `Đơn giá: ${(currentPhotographer?.ratePerShoot || 1000000).toLocaleString('vi-VN')}đ / ca`}
          </p>
        </div>

        {/* Card 2: Lớp đã chụp / Lớp sẽ chụp */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">
              {!isPhotographerUser
                ? 'Lớp Đã Chụp / Gán Lịch'
                : isPhotoLead
                ? `Lớp Đã Chụp (Team ${myTeam})`
                : 'Lớp Đã Chụp Của Bạn'}
            </span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {totalSummary.totalCompletedShoots}{' '}
            <span className="text-sm font-semibold text-neutral-500">
              Lớp đã chụp
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            ⏳ Sẽ chụp tiếp: {totalSummary.totalAssignedShoots - totalSummary.totalCompletedShoots} lớp
          </p>
        </div>

        {/* Card 3: Lương Nhận Được */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">
              {!isPhotographerUser
                ? 'Tổng Lương Chi Trả Ekip'
                : isPhotoLead
                ? `Lương Team ${myTeam} Nhận Được`
                : 'Lương Nhận Được (Thực Nhận)'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {totalSummary.totalPayout.toLocaleString('vi-VN')}đ
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {!isPhotographerUser || isPhotoLead
              ? 'Chi trả cho các thợ trong team'
              : `Lương tạm tính lớp tới: ${(performanceData[0]?.pendingEarnings || 0).toLocaleString('vi-VN')}đ`}
          </p>
        </div>

        {/* Card 4: Doanh Thu Mang Về */}
        <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">
              {!isPhotographerUser
                ? 'Doanh Thu Các Ca Chụp'
                : isPhotoLead
                ? `Doanh Thu Team Mang Về`
                : 'Doanh Thu Các Ca Bạn Chụp'}
            </span>
            <Camera className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {totalSummary.totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {!isPhotographerUser || isPhotoLead
              ? `Từ hợp đồng các lớp Team ${myTeam} thực hiện`
              : 'Tổng giá trị hợp đồng các lớp bạn tác nghiệp'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-black/[0.08] p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search (Ẩn với thành viên thường vì chỉ có 1 dòng cá nhân) */}
          {(!isPhotographerUser || isPhotoLead) && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder={isPhotoLead ? `Tìm thành viên trong Team ${myTeam}...` : 'Tìm theo tên thợ, SĐT...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-black/[0.2]"
              />
            </div>
          )}

          {/* Vai trò */}
          {(!isPhotographerUser || isPhotoLead) && (
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Chụp chính">Chụp chính (LEAD)</option>
              <option value="Chụp phụ">Chụp phụ (SP)</option>
              <option value="Quay phim">Quay phim</option>
            </select>
          )}

          {/* Khu vực (Chỉ Admin mới được đổi; Lead và Member bị khóa cứng) */}
          {!isPhotographerUser ? (
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả khu vực</option>
              <option value="Hải Phòng">Hải Phòng</option>
              <option value="Hà Nội">Hà Nội</option>
            </select>
          ) : isPhotoLead ? (
            <span className="px-3 py-2 bg-[#B8F23D]/25 border border-[#B8F23D]/60 rounded-xl text-xs font-bold text-neutral-900 inline-flex items-center gap-1.5">
              📍 Khu vực: Team {myTeam}
            </span>
          ) : (
            <span className="px-3 py-2 bg-neutral-100 border border-black/[0.06] rounded-xl text-xs font-bold text-neutral-700">
              📍 {currentPhotographer?.activeRegions?.join(', ') || 'Hải Phòng'}
            </span>
          )}

          {/* Lọc tình trạng ca chụp */}
          {(!isPhotographerUser || isPhotoLead) && (
            <select
              value={hasShootsFilter}
              onChange={e => setHasShootsFilter(e.target.value as any)}
              className="px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs font-medium text-neutral-800 cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="all">Tất cả tình trạng booking</option>
              <option value="has_shoots">Đã có ca chụp gán</option>
              <option value="no_shoots">Chưa có ca chụp</option>
            </select>
          )}
        </div>

        <div className="text-xs font-semibold text-neutral-500">
          Hiển thị: <strong className="text-neutral-900">{filteredData.length}</strong> / {accessiblePhotographers.length} nhân sự
        </div>
      </div>

      {/* Performance Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-500 font-bold border-b border-black/[0.06] uppercase tracking-wider">
                <th className="py-3.5 px-4">Photographer / Nhân sự</th>
                <th className="py-3.5 px-4">Chuyên Môn & Khu Vực</th>
                <th className="py-3.5 px-4">Số Ca Thực Tế</th>
                <th className="py-3.5 px-4">Giờ Tác Nghiệp</th>
                <th className="py-3.5 px-4">Đánh Giá (Rating)</th>
                <th className="py-3.5 px-4">Doanh Thu Mang Về</th>
                <th className="py-3.5 px-4 text-right">Thù Lao Thực Tế</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-medium text-neutral-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    Không tìm thấy nhân sự phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Cột 1: Thông tin thợ */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.avatar}
                          alt={item.fullName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-black/[0.06] shrink-0"
                        />
                        <div>
                          <p className="font-bold text-neutral-900">{item.fullName}</p>
                          <p className="text-[11px] text-neutral-500">{item.phone}</p>
                          <span className="inline-block text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 font-mono">
                            {item.username || `${item.phone}@xoan`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cột 2: Chuyên môn & Khu vực */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {item.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                skill.includes('chính')
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : skill.includes('Quay')
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          {item.activeRegions.join(', ')} • {item.photographerType}
                        </p>
                      </div>
                    </td>

                    {/* Cột 3: Số ca thực tế */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-neutral-900">
                          {item.completedCount} ca hoàn thành
                        </p>
                        {item.inProgressCount > 0 && (
                          <p className="text-[11px] text-orange-600 font-semibold">
                            {item.inProgressCount} ca đang tiến hành
                          </p>
                        )}
                        <p className="text-[10px] text-neutral-400">
                          Tổng gán: {item.currentBookingsCount} ca
                        </p>
                      </div>
                    </td>

                    {/* Cột 4: Giờ tác nghiệp */}
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {item.hoursWorked} giờ
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        {item.completedCount > 0 ? '8h / ca hoàn thành' : 'Chưa có giờ bấm máy'}
                      </span>
                    </td>

                    {/* Cột 5: Đánh giá */}
                    <td className="py-3.5 px-4">
                      {item.actualRating ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {item.actualRating} / 5.0
                          </span>
                          {item.feedbackCount > 0 && (
                            <p className="text-[10px] text-neutral-400">
                              Từ {item.feedbackCount} phản hồi lớp
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                          Chưa có review
                        </span>
                      )}
                    </td>

                    {/* Cột 6: Doanh thu thực tế */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900">
                        {item.totalRevenueGenerated.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {item.currentBookingsCount > 0
                          ? `Từ ${item.currentBookingsCount} ca được gán`
                          : 'Chưa phát sinh'}
                      </p>
                    </td>

                    {/* Cột 7: Thù lao nhận */}
                    <td className="py-3.5 px-4 text-right">
                      <p className="font-extrabold text-emerald-700 text-sm">
                        {item.totalEarnings.toLocaleString('vi-VN')}đ
                      </p>
                      {item.pendingEarnings > 0 && (
                        <p className="text-[11px] text-amber-600 font-semibold">
                          +{item.pendingEarnings.toLocaleString('vi-VN')}đ chờ nghiệm thu
                        </p>
                      )}
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        Định mức: {item.ratePerShoot.toLocaleString('vi-VN')}đ/buổi
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
