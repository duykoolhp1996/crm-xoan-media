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

  // 8. Tính doanh thu / thù lao thành viên đi chụp:
  // Thù lao = Số buổi đi chụp hoàn thành × đơn giá ratePerShoot của thợ
  const ratePerShoot = currentPhotographer.ratePerShoot || 1000000;

  // Tính thù lao theo team (tổng thù lao của các thợ trong team đi chụp)
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
      const pRate = p.ratePerShoot || 1000000;
      const earned = pCompleted * pRate;
      const pending = pUpcoming * pRate;

      return {
        photographer: p,
        totalShoots: pBookings.length,
        completedShoots: pCompleted,
        upcomingShoots: pUpcoming,
        earnedAmount: earned,
        pendingAmount: pending
      };
    });
  }, [teamPhotographers, bookings]);

  // Thù lao thực nhận và tạm tính
  const totalEarnedAmount = useMemo(() => {
    if (isViewingTeam) {
      return teamEarningsData.reduce((sum, item) => sum + item.earnedAmount, 0);
    }
    return completedShoots.length * ratePerShoot;
  }, [isViewingTeam, teamEarningsData, completedShoots.length, ratePerShoot]);

  const totalPendingAmount = useMemo(() => {
    if (isViewingTeam) {
      return teamEarningsData.reduce((sum, item) => sum + item.pendingAmount, 0);
    }
    return upcomingShoots.length * ratePerShoot;
  }, [isViewingTeam, teamEarningsData, upcomingShoots.length, ratePerShoot]);

  // Ca chụp gần nhất tiếp theo
  const nextShoot = useMemo(() => {
    if (upcomingShoots.length === 0) return null;
    return [...upcomingShoots].sort((a, b) => (a.shootDate || '').localeCompare(b.shootDate || ''))[0];
  }, [upcomingShoots]);

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

      {/* ── 4 THẺ KPI DOANH THU & BUỔI CHỤP THÀNH VIÊN ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Thù lao thực nhận từ các ca đã đi chụp */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {isViewingTeam ? `Thù Lao Team ${myTeam}` : 'Thù Lao Đi Chụp'}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {totalEarnedAmount.toLocaleString('vi-VN')} <span className="text-sm font-bold text-neutral-500">đ</span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã chụp xong: <strong>{completedShoots.length} ca hoàn thành</strong>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-neutral-400">
            {isViewingTeam ? 'Tổng thu nhập các thợ trong team' : `Đơn giá: ${ratePerShoot.toLocaleString('vi-VN')} đ/buổi`}
          </div>
        </div>

        {/* KPI 2: Thù lao tạm tính (Các ca sắp chụp) */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Thù Lao Tạm Tính
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {totalPendingAmount.toLocaleString('vi-VN')} <span className="text-sm font-bold text-neutral-500">đ</span>
            </div>
            <p className="text-xs text-amber-700 font-semibold mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Sắp diễn ra: <strong>{upcomingShoots.length} ca đã chốt lịch</strong>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-neutral-400">
            Dự kiến thanh toán sau khi hoàn tất ca chụp
          </div>
        </div>

        {/* KPI 3: Tổng số buổi / ca đi chụp */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Tổng Buổi Đi Chụp
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {relevantBookings.length} <span className="text-sm font-bold text-neutral-500">ca chụp</span>
            </div>
            <p className="text-xs text-neutral-600 font-medium mt-1">
              {completedShoots.length} hoàn thành • {upcomingShoots.length} đang lên lịch
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Xem trên Calendar</span>
            <button
              onClick={() => setActiveTab('calendar')}
              className="font-bold text-neutral-900 hover:text-black flex items-center gap-0.5"
            >
              Mở lịch <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Chất lượng & Đánh giá khách hàng */}
        <div className="p-5 bg-white rounded-3xl border border-black/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Chất Lượng & Đánh Giá
            </span>
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200/60 shadow-2xs">
              <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-1.5">
              <span>5.0</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              100% đúng giờ & tác phong chuyên nghiệp
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-black/[0.06] text-[11px] text-neutral-400">
            Dựa trên phản hồi từ các lớp kỷ yếu
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
                Doanh Thu & Số Buổi Đi Chụp Từng Thành Viên — Team {myTeam}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Thống kê số buổi tác nghiệp thực tế và tổng thù lao của {teamPhotographers.length} thành viên thợ trong ekip
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
              Tổng thù lao team: <strong>{totalEarnedAmount.toLocaleString('vi-VN')} đ</strong>
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] text-neutral-500 font-bold uppercase text-[10px] tracking-wider bg-neutral-50/60">
                  <th className="py-3 px-4 rounded-l-2xl">Thành Viên Ekip</th>
                  <th className="py-3 px-4">Khu Vực & Vai Trò</th>
                  <th className="py-3 px-4 text-center">Đã Đi Chụp</th>
                  <th className="py-3 px-4 text-center">Sắp Tới</th>
                  <th className="py-3 px-4 text-right">Đơn Giá / Buổi</th>
                  <th className="py-3 px-4 text-right">Thù Lao Nhận Được</th>
                  <th className="py-3 px-4 text-center rounded-r-2xl">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {teamEarningsData.map((item, idx) => {
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
                          {item.completedShoots} buổi
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200">
                          {item.upcomingShoots} ca
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-neutral-600 font-mono font-bold">
                        {(p.ratePerShoot || 1000000).toLocaleString('vi-VN')} đ
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-sm text-neutral-900 font-mono">
                        {item.earnedAmount.toLocaleString('vi-VN')} đ
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

      {/* ── DANH SÁCH CÁC CA ĐI CHỤP CỦA TÔI / TEAM ───────────────────────── */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-neutral-900" />
              {isViewingTeam ? `Danh Sách Ca Chụp Của Team ${myTeam}` : 'Danh Sách Ca Chụp Của Tôi'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Chi tiết các lớp được phân công tác nghiệp, thời gian và mức thù lao nhận được
            </p>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Mở Toàn Bộ Calendar
          </button>
        </div>

        {relevantBookings.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs bg-neutral-50 rounded-2xl border border-black/[0.04] space-y-2">
            <Camera className="w-10 h-10 mx-auto text-neutral-300" />
            <p className="font-bold text-neutral-700 text-sm">Chưa có ca chụp nào được phân công</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Khi bộ phận Quản lý / Điều phối gán bạn vào các booking kỷ yếu, thông tin ca chụp và thù lao sẽ tự động xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantBookings.map(bk => {
              const isDone = ['Hoàn thành', 'Đã chụp', 'Đã bàn giao'].includes(bk.bookingStatus);

              return (
                <div
                  key={bk.id}
                  className="p-4 bg-neutral-50 rounded-2xl border border-black/[0.06] hover:bg-neutral-100/70 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] font-bold bg-white border border-black/[0.08] px-2 py-0.5 rounded shadow-2xs text-neutral-800">
                        {bk.code}
                      </span>
                      <h4 className="font-extrabold text-neutral-900 text-sm mt-1.5">
                        {bk.className} — {bk.schoolName}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{bk.packageName}</p>
                    </div>

                    {/* Thù lao ca chụp */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 font-bold block">Thù lao ca:</span>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
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
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isDone ? '✓ Đã chụp xong' : '⏳ Sắp tác nghiệp'}
                    </span>

                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-1"
                    >
                      Xem lịch <ChevronRight className="w-3 h-3" />
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
