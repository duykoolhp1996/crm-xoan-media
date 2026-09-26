import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Coins,
  TrendingUp,
  Star,
  Users,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  Video,
  Award
} from 'lucide-react';

export const PhotographerDashboard: React.FC = () => {
  const {
    currentUser,
    currentRole,
    photographers,
    bookings,
    feedbacks,
    setActiveTab
  } = useApp();

  const isPhotographerUser = currentRole === 'photographer' || currentUser?.role === 'photographer';

  // 1. Nhận diện thợ chụp đang đăng nhập
  const currentPhotographer = useMemo(() => {
    return (
      photographers.find(
        p =>
          p.id === currentUser.id ||
          p.fullName.toLowerCase() === currentUser.name.toLowerCase() ||
          (currentUser.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.phone && p.phone === currentUser.phone)
      ) || photographers[0]
    );
  }, [photographers, currentUser]);

  // 2. Nhận diện có phải Lead hay không
  const isPhotoLead = useMemo(() => {
    if (!currentPhotographer) return false;
    return Boolean(
      currentPhotographer.notes?.toUpperCase().includes('LEAD') ||
      currentPhotographer.fullName.toLowerCase().includes('lead')
    );
  }, [currentPhotographer]);

  // 3. Nhận diện team của Lead (Hải Phòng / Hà Nội)
  const myTeam = useMemo(() => {
    if (!currentPhotographer) return 'Toàn Studio';
    if (
      currentPhotographer.activeRegions?.includes('Hà Nội') ||
      currentPhotographer.notes?.toUpperCase().includes('HÀ NỘI')
    ) {
      return 'Hà Nội';
    }
    return 'Hải Phòng';
  }, [currentPhotographer]);

  // 4. Danh sách các thợ trong Team của Lead
  const teamPhotographers = useMemo(() => {
    if (!isPhotoLead) return [currentPhotographer];
    return photographers.filter(
      p =>
        p.activeRegions?.includes(myTeam) ||
        p.notes?.toUpperCase().includes(myTeam.toUpperCase())
    );
  }, [photographers, isPhotoLead, myTeam, currentPhotographer]);

  const teamPhotographerIds = useMemo(() => {
    return new Set(teamPhotographers.map(p => p.id));
  }, [teamPhotographers]);

  // 5. Chế độ xem của Lead: 'team' hoặc 'personal'
  const [viewScope, setViewScope] = useState<'team' | 'personal'>('team');
  const isViewingTeam = isPhotoLead && viewScope === 'team';

  // Bộ lọc danh sách lớp chụp: Tất cả / Lớp sẽ chụp / Lớp đã chụp
  const [shootFilter, setShootFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  // 6. Lọc các booking liên quan:
  // - Nếu xem Team: tất cả ca chụp có thợ trong team tham gia hoặc thuộc khu vực team
  // - Nếu xem Cá nhân: ca chụp mà thợ chụp này trực tiếp tham gia
  const relevantBookings = useMemo(() => {
    if (isViewingTeam) {
      return bookings.filter(b => {
        const hasTeamStaff =
          (b.assignments.leadPhotographerId && teamPhotographerIds.has(b.assignments.leadPhotographerId)) ||
          (b.assignments.videographerId && teamPhotographerIds.has(b.assignments.videographerId)) ||
          b.assignments.assistantPhotographerIds?.some(id => teamPhotographerIds.has(id));
        const matchesCity =
          b.city?.toLowerCase().includes(myTeam.toLowerCase()) ||
          b.location?.toLowerCase().includes(myTeam.toLowerCase());
        return hasTeamStaff || matchesCity;
      });
    }

    // Cá nhân
    const myId = currentPhotographer.id;
    const myName = currentPhotographer.fullName;
    return bookings.filter(
      b =>
        b.assignments.leadPhotographerId === myId ||
        b.assignments.videographerId === myId ||
        b.assignments.assistantPhotographerIds?.includes(myId) ||
        b.assignments.leadPhotographerName === myName ||
        b.assignments.videographerName === myName ||
        b.assignments.assistantNames?.some(n => n.includes(myName))
    );
  }, [bookings, isViewingTeam, teamPhotographerIds, myTeam, currentPhotographer]);

  // 7. Phân loại ca chụp: Đã hoàn thành / Sắp chụp
  const completedShoots = useMemo(() => {
    return relevantBookings.filter(b =>
      ['Hoàn thành', 'Đã chụp', 'Đã bàn giao'].includes(b.bookingStatus)
    );
  }, [relevantBookings]);

  const upcomingShoots = useMemo(() => {
    return relevantBookings.filter(b =>
      ['Sắp chụp', 'Đang chụp', 'Hậu kỳ', 'Đã xác nhận'].includes(b.bookingStatus)
    );
  }, [relevantBookings]);

  // 8. Tính lương theo 2 loại: Lương Tháng (Cố định) hoặc Theo Buổi Chụp
  const isMonthlySalary = currentPhotographer.salaryType === 'monthly';
  const monthlySalary = currentPhotographer.monthlySalary || 15000000;
  const ratePerShoot = currentPhotographer.ratePerShoot || 1000000;

  // Tính lương theo team (dành cho Lead xem nhân sự team mình)
  const teamEarningsData = useMemo(() => {
    return teamPhotographers.map(p => {
      const pBookings = bookings.filter(
        b =>
          b.assignments.leadPhotographerId === p.id ||
          b.assignments.videographerId === p.id ||
          b.assignments.assistantPhotographerIds?.includes(p.id) ||
          b.assignments.leadPhotographerName === p.fullName ||
          b.assignments.videographerName === p.fullName
      );
      const pCompleted = pBookings.filter(b =>
        ['Hoàn thành', 'Đã chụp', 'Đã bàn giao'].includes(b.bookingStatus)
      ).length;
      const pUpcoming = pBookings.filter(b =>
        ['Sắp chụp', 'Đang chụp', 'Hậu kỳ', 'Đã xác nhận'].includes(b.bookingStatus)
      ).length;

      const isPMonthly = p.salaryType === 'monthly';
      const pMonthlySalary = p.monthlySalary || 15000000;
      const pRate = p.ratePerShoot || 1000000;

      // Nếu lương tháng: nhận lương tháng cố định; nếu theo buổi chụp: lớp hoàn thành * pRate
      const earned = isPMonthly ? pMonthlySalary : (pCompleted * pRate);
      const pending = isPMonthly ? (pUpcoming * (p.ratePerShoot || 0)) : (pUpcoming * pRate);

      return {
        photographer: p,
        salaryType: isPMonthly ? ('monthly' as const) : ('per_shoot' as const),
        monthlySalary: pMonthlySalary,
        ratePerShoot: pRate,
        totalShoots: pBookings.length,
        completedShoots: pCompleted,
        upcomingShoots: pUpcoming,
        earnedAmount: earned,
        pendingAmount: pending
      };
    });
  }, [teamPhotographers, bookings]);

  // Lương thực nhận và tạm tính
  const totalEarnedAmount = useMemo(() => {
    if (isViewingTeam) {
      return teamEarningsData.reduce((sum, item) => sum + item.earnedAmount, 0);
    }
    if (isMonthlySalary) {
      return monthlySalary;
    }
    return completedShoots.length * ratePerShoot;
  }, [isViewingTeam, teamEarningsData, isMonthlySalary, monthlySalary, completedShoots.length, ratePerShoot]);

  const totalPendingAmount = useMemo(() => {
    if (isViewingTeam) {
      return teamEarningsData.reduce((sum, item) => sum + item.pendingAmount, 0);
    }
    if (isMonthlySalary) {
      return upcomingShoots.length * (currentPhotographer.ratePerShoot || 0);
    }
    return upcomingShoots.length * ratePerShoot;
  }, [isViewingTeam, teamEarningsData, isMonthlySalary, upcomingShoots.length, currentPhotographer.ratePerShoot, ratePerShoot]);

  // Ca chụp gần nhất tiếp theo
  const nextShoot = useMemo(() => {
    if (upcomingShoots.length === 0) return null;
    return [...upcomingShoots].sort((a, b) => (a.shootDate || '').localeCompare(b.shootDate || ''))[0];
  }, [upcomingShoots]);

  // Danh sách các lớp theo bộ lọc (Tất cả / Lớp sẽ chụp / Lớp đã chụp)
  const displayedShoots = useMemo(() => {
    if (shootFilter === 'completed') return completedShoots;
    if (shootFilter === 'upcoming') return upcomingShoots;
    return relevantBookings;
  }, [shootFilter, completedShoots, upcomingShoots, relevantBookings]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── BANNER CHÀO MỪNG DÀNH RIÊNG CHO PHOTOGRAPHER ─────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-6 sm:p-8 shadow-xl border border-black/[0.08]">
        {/* Pattern trang trí */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#B8F23D]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
          <Camera className="w-48 h-48 text-[#B8F23D]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#B8F23D] text-xs font-bold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Ekip Thợ Chụp Kỷ Yếu 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Xin chào, {currentPhotographer.fullName}! 📸
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
              {isPhotoLead ? (
                <>
                  Bạn đang quản lý điều phối <strong className="text-[#B8F23D]">Team {myTeam}</strong> ({teamPhotographers.length} thành viên thợ chụp & quay phim). Doanh thu được tính theo số buổi đi chụp thực tế của từng thành viên.
                </>
              ) : (
                <>
                  Theo dõi lịch chụp cá nhân, ca được phân công và tổng thù lao nhận được theo từng buổi chụp thực tế.
                </>
              )}
            </p>
          </div>

          {/* Scope Toggle (Nếu là Lead) */}
          {isPhotoLead && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
              <button
                onClick={() => setViewScope('team')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  viewScope === 'team'
                    ? 'bg-[#B8F23D] text-neutral-950 shadow-md'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Team {myTeam} ({teamPhotographers.length})
              </button>
              <button
                onClick={() => setViewScope('personal')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  viewScope === 'personal'
                    ? 'bg-[#B8F23D] text-neutral-950 shadow-md'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Cá Nhân Tôi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4 THẺ KPI TRỌNG TÂM: SỐ LỚP ĐÃ CHỤP, SỐ LỚP SẼ CHỤP, LƯƠNG NHẬN ĐƯỢC ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Số lượng lớp đã chụp */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {isViewingTeam ? `Số Lớp Đã Chụp (Team ${myTeam})` : 'Số Lượng Lớp Đã Chụp'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {completedShoots.length} <span className="text-base font-bold text-neutral-500">Lớp</span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              ✓ Đã hoàn thành chụp & bàn giao file
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-neutral-500 font-medium">
            Lương tương ứng: <strong className="text-emerald-700 font-bold">{totalEarnedAmount.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        {/* KPI 2: Số lượng lớp sẽ chụp */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {isViewingTeam ? `Số Lớp Sẽ Chụp (Team ${myTeam})` : 'Số Lượng Lớp Sẽ Chụp'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {upcomingShoots.length} <span className="text-base font-bold text-neutral-500">Lớp</span>
            </div>
            <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
              ⏳ Đã chốt lịch, sẵn sàng tác nghiệp
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-neutral-500 font-medium">
            Lương dự kiến thêm: <strong className="text-amber-700 font-bold">+{totalPendingAmount.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>

        {/* KPI 3: Lương nhận được (Thực nhận từ các lớp đã chụp) */}
        <div className="p-5 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl border border-black/[0.08] shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B8F23D] uppercase tracking-wider">
              {isViewingTeam ? `Lương Team ${myTeam} Nhận Được` : 'Lương Nhận Được'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/10 text-[#B8F23D] flex items-center justify-center border border-white/10 shadow-2xs">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-[#B8F23D] tracking-tight">
              {totalEarnedAmount.toLocaleString('vi-VN')} <span className="text-base font-bold text-white/70">đ</span>
            </div>
            <p className="text-xs text-neutral-300 font-medium mt-1">
              {isViewingTeam
                ? `Tổng lương ${teamPhotographers.length} thợ trong Team ${myTeam}`
                : isMonthlySalary
                ? `Chế độ Lương Tháng Cố Định (Full-time Lead)`
                : `Thực nhận từ ${completedShoots.length} lớp đã chụp hoàn tất`}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-neutral-400">
            {isViewingTeam
              ? 'Chi trả theo quy chế lương studio'
              : isMonthlySalary
              ? `Lương cứng: ${(monthlySalary).toLocaleString('vi-VN')} đ/tháng`
              : `Mức lương: ${(ratePerShoot).toLocaleString('vi-VN')} đ / lớp`}
          </div>
        </div>

        {/* KPI 4: Tổng lương cả mùa (Thực nhận + Tạm tính) */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Tổng Lương Cả Mùa (Dự Kiến)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-neutral-900 tracking-tight">
              {(totalEarnedAmount + totalPendingAmount).toLocaleString('vi-VN')} <span className="text-base font-bold text-neutral-500">đ</span>
            </div>
            <p className="text-xs text-neutral-600 font-medium mt-1">
              Tổng cộng <strong>{relevantBookings.length} lớp</strong> phụ trách
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Xem toàn bộ lịch</span>
            <button
              onClick={() => setActiveTab('calendar')}
              className="font-bold text-neutral-900 hover:text-black flex items-center gap-0.5"
            >
              Mở Calendar <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── CA CHỤP GẦN NHẤT TIẾP THEO (HIGHLIGHT ALERT) ────────────────── */}
      {nextShoot && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 font-black text-sm shadow-sm">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wide">
                  Ca Chụp Sắp Tới Gần Nhất
                </span>
                <span className="text-xs font-mono font-bold text-neutral-700">{nextShoot.code}</span>
              </div>
              <h3 className="text-base font-extrabold text-neutral-900 mt-1">
                {nextShoot.className} — {nextShoot.schoolName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-700 mt-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  Ngày chụp: <strong>{nextShoot.shootDate}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  Thời gian: <strong>{nextShoot.startTime} - {nextShoot.endTime}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Địa điểm: {nextShoot.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              Xem Lịch Trên Calendar
            </button>
          </div>
        </div>
      )}

      {/* ── BẢNG HIỆU SUẤT & THÙ LAO TỪNG THÀNH VIÊN ĐI CHỤP (CHO LEAD) ─── */}
      {isViewingTeam && (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-900" />
                Số Lượng Lớp & Lương Nhận Được Từng Thành Viên — Team {myTeam}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Bảng theo dõi số lớp đã chụp, số lớp sẽ chụp và tổng lương nhận được của {teamPhotographers.length} nhân sự ekip
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Tổng lương team thực nhận: <strong>{totalEarnedAmount.toLocaleString('vi-VN')} đ</strong>
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] text-neutral-500 font-bold uppercase text-[10px] tracking-wider bg-neutral-50/60">
                  <th className="py-3 px-4 rounded-l-2xl">Thành Viên Ekip</th>
                  <th className="py-3 px-4">Vai Trò / Kỹ Năng</th>
                  <th className="py-3 px-4 text-center">Lớp Đã Chụp</th>
                  <th className="py-3 px-4 text-center">Lớp Sẽ Chụp</th>
                  <th className="py-3 px-4 text-right">Cơ Chế Lương</th>
                  <th className="py-3 px-4 text-right">Lương Nhận Được</th>
                  <th className="py-3 px-4 text-right">Lương Tạm Tính</th>
                  <th className="py-3 px-4 text-center rounded-r-2xl">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {teamEarningsData.map((item) => {
                  const p = item.photographer;
                  const isLeadSelf = p.id === currentPhotographer.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isLeadSelf ? 'bg-[#B8F23D]/5 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar}
                            alt={p.fullName}
                            className="w-9 h-9 rounded-2xl object-cover border border-black/[0.08]"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900 text-sm">
                                {p.fullName}
                              </span>
                              {isLeadSelf && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-900 text-[#B8F23D]">
                                  Bạn (Lead)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {p.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-700">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-800 text-[11px] font-bold">
                          {p.skills?.[0] || p.photographerType}
                        </span>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {p.activeRegions?.join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.completedShoots} lớp
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200">
                          {item.upcomingShoots} lớp
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.salaryType === 'monthly' ? (
                          <div>
                            <span className="font-black text-indigo-700 text-xs font-mono">
                              {(p.monthlySalary || 15000000).toLocaleString('vi-VN')} đ
                            </span>
                            <span className="block text-[9px] text-neutral-400 font-bold uppercase">Lương tháng</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-neutral-800 text-xs font-mono">
                              {(p.ratePerShoot || 1000000).toLocaleString('vi-VN')} đ
                            </span>
                            <span className="block text-[9px] text-neutral-400 font-bold uppercase">Theo ca</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-sm text-emerald-700 font-mono">
                        {item.earnedAmount.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-xs text-amber-700 font-mono">
                        {p.salaryType === 'monthly' ? '0 đ' : `+${item.pendingAmount.toLocaleString('vi-VN')} đ`}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            p.status === 'available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.status === 'busy'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {p.status === 'available'
                            ? '🟢 Sẵn sàng'
                            : p.status === 'busy'
                            ? '🟡 Có lịch'
                            : '⚪ Tạm nghỉ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DANH SÁCH CHI TIẾT CÁC LỚP CHỤP VÀ LƯƠNG NHẬN ĐƯỢC ───────────── */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-neutral-900" />
              {isViewingTeam ? `Danh Sách Lớp Chụp Của Team ${myTeam}` : 'Danh Sách Lớp Chụp Của Tôi'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Theo dõi chi tiết số lượng lớp đã chụp, số lượng lớp sẽ chụp và mức lương nhận được của từng lớp
            </p>
          </div>

          {/* Bộ lọc Tab: Tất cả / Lớp Sẽ Chụp / Lớp Đã Chụp */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-black/[0.06] text-xs font-bold shrink-0">
            <button
              onClick={() => setShootFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                shootFilter === 'all'
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tất Cả ({relevantBookings.length} Lớp)
            </button>
            <button
              onClick={() => setShootFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                shootFilter === 'upcoming'
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Lớp Sẽ Chụp ({upcomingShoots.length})
            </button>
            <button
              onClick={() => setShootFilter('completed')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                shootFilter === 'completed'
                  ? 'bg-neutral-900 text-[#B8F23D] shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Lớp Đã Chụp ({completedShoots.length})
            </button>
          </div>
        </div>

        {displayedShoots.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-black/[0.04] space-y-2">
            <Camera className="w-10 h-10 mx-auto text-neutral-300" />
            <p className="font-bold text-neutral-700 text-sm">
              {shootFilter === 'upcoming'
                ? 'Hiện tại không có lớp nào sắp chụp'
                : shootFilter === 'completed'
                ? 'Chưa có lớp nào hoàn thành buổi chụp'
                : 'Chưa có lớp chụp nào được phân công'}
            </p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Khi bộ phận Quản lý điều phối thêm lớp mới, thông tin lớp chụp và mức lương sẽ hiển thị ngay tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedShoots.map(bk => {
              const isDone = ['Hoàn thành', 'Đã chụp', 'Đã bàn giao'].includes(bk.bookingStatus);

              return (
                <div
                  key={bk.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDone
                      ? 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50/50'
                      : 'bg-neutral-50 border-black/[0.06] hover:bg-neutral-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-white border border-black/[0.08] px-2 py-0.5 rounded shadow-2xs text-neutral-800">
                          {bk.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          {isDone ? '✓ LỚP ĐÃ CHỤP' : '⏳ LỚP SẼ CHỤP'}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-neutral-900 text-sm mt-1.5">
                        {bk.className} — {bk.schoolName}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{bk.packageName}</p>
                    </div>

                    {/* Mức lương của lớp chụp */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 font-bold block">
                        {isDone ? 'Lương nhận được:' : 'Lương tạm tính:'}
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full border inline-block mt-0.5 font-mono ${
                          isDone
                            ? 'text-emerald-800 bg-emerald-100/80 border-emerald-300'
                            : 'text-amber-800 bg-amber-100/80 border-amber-300'
                        }`}
                      >
                        + {(currentPhotographer.ratePerShoot || 1000000).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-600 bg-white p-3 rounded-xl border border-black/[0.04]">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      Ngày chụp: <strong className="text-neutral-900">{bk.shootDate}</strong>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      Giờ chụp: <strong>{bk.startTime} - {bk.endTime}</strong>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{bk.location}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate text-neutral-700 font-semibold pt-1 border-t border-neutral-100">
                      <Camera className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      Thợ chính: <strong className="text-neutral-900">{bk.assignments.leadPhotographerName || 'Đang cập nhật'}</strong>
                      {bk.assignments.videographerName && (
                        <span className="text-neutral-500 font-normal"> • Quay: {bk.assignments.videographerName}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-neutral-500">
                      Trạng thái: <strong className={isDone ? 'text-emerald-700' : 'text-amber-700'}>{bk.bookingStatus}</strong>
                    </span>

                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-1"
                    >
                      Xem trên Calendar <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

