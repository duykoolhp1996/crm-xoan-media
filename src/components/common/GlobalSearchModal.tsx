import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  User,
  Calendar,
  School,
  Camera,
  Megaphone,
  ArrowRight,
  Phone
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    customers,
    bookings,
    schools,
    photographers,
    campaigns,
    setSelectedCustomerId,
    setSelectedBookingId,
    setActiveTab
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedCustomers = customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.schoolName.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q) ||
        c.concept.toLowerCase().includes(q)
    );

    const matchedBookings = bookings.filter(
      b =>
        b.code.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.schoolName.toLowerCase().includes(q) ||
        b.className.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
    );

    const matchedSchools = schools.filter(
      s => s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    );

    const matchedPhotographers = photographers.filter(
      p =>
        p.fullName.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.skills.some(sk => sk.toLowerCase().includes(q))
    );

    const matchedCampaigns = campaigns.filter(
      camp =>
        camp.name.toLowerCase().includes(q) ||
        camp.channel.toLowerCase().includes(q) ||
        camp.campaignType.toLowerCase().includes(q)
    );

    return {
      customers: matchedCustomers,
      bookings: matchedBookings,
      schools: matchedSchools,
      photographers: matchedPhotographers,
      campaigns: matchedCampaigns,
      total:
        matchedCustomers.length +
        matchedBookings.length +
        matchedSchools.length +
        matchedPhotographers.length +
        matchedCampaigns.length
    };
  }, [query, customers, bookings, schools, photographers, campaigns]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-neutral-900/85 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.18)] overflow-hidden transform transition-all text-white">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/[0.08] gap-3 bg-white/[0.02]">
          <Search className="w-5 h-5 text-orange-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, SĐT, trường (Ams, Chu Văn An...), mã booking, thợ..."
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-white/35 font-normal tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-white/[0.08] border border-white/[0.15] text-white/60 px-2 py-0.5 rounded-lg text-[10px] font-bold">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!query ? (
            <div className="py-8 text-center text-white/40 text-xs">
              <Search className="w-8 h-8 mx-auto text-white/20 mb-2.5" />
              <p>Nhập từ khóa để tra cứu tức thì toàn bộ hệ thống Xoắn Media.</p>
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                <span className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/70">Gợi ý: "Amsterdam"</span>
                <span className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/70">"0912883344"</span>
                <span className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/70">"Tuấn"</span>
                <span className="px-2.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white/70">"BK-2024"</span>
              </div>
            </div>
          ) : searchResults && searchResults.total === 0 ? (
            <div className="py-8 text-center text-white/50 text-xs">
              Không tìm thấy kết quả nào khớp với "<strong className="text-white">{query}</strong>".
            </div>
          ) : (
            searchResults && (
              <>
                {/* 1. Khách Hàng / Leads */}
                {searchResults.customers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      Khách Hàng & Leads ({searchResults.customers.length})
                    </h3>
                    <div className="space-y-1">
                      {searchResults.customers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setActiveTab('customers');
                            setIsSearchOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.18] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                              {cust.name} - <span className="font-medium text-white/70">{cust.className} ({cust.schoolName})</span>
                            </p>
                            <p className="text-[11px] text-white/45 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-white/30" /> {cust.phone}</span>
                              <span className="bg-white/[0.08] border border-white/[0.1] text-white/80 px-2 py-0.5 rounded-full font-medium">{cust.pipelineStage}</span>
                              <span>Concept: {cust.concept}</span>
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Bookings */}
                {searchResults.bookings.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Đơn Booking & Lịch Chụp ({searchResults.bookings.length})
                    </h3>
                    <div className="space-y-1">
                      {searchResults.bookings.map((bk) => (
                        <div
                          key={bk.id}
                          onClick={() => {
                            setSelectedBookingId(bk.id);
                            setActiveTab('bookings');
                            setIsSearchOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.18] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-lg">
                                {bk.code}
                              </span>
                              <p className="text-xs font-bold text-white">{bk.className} - {bk.schoolName}</p>
                            </div>
                            <p className="text-[11px] text-white/45 mt-1">
                              Ngày chụp: <strong className="text-white/80">{bk.shootDate}</strong> ({bk.startTime} - {bk.endTime}) | Địa điểm: {bk.location}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Photographers */}
                {searchResults.photographers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                      Đội Ngũ Thợ / Photographers ({searchResults.photographers.length})
                    </h3>
                    <div className="space-y-1">
                      {searchResults.photographers.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => {
                            setActiveTab('photographers');
                            setIsSearchOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.18] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={photo.avatar}
                              alt={photo.fullName}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                            />
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                {photo.fullName} <span className="font-normal text-white/40">({photo.photographerType})</span>
                              </p>
                              <p className="text-[11px] text-white/45 mt-0.5">
                                Kỹ năng: {photo.skills.join(', ')} | Đơn giá: {photo.ratePerShoot.toLocaleString('vi-VN')}đ/buổi
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Schools */}
                {searchResults.schools.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <School className="w-3.5 h-3.5 text-emerald-400" />
                      Trường Học ({searchResults.schools.length})
                    </h3>
                    <div className="space-y-1">
                      {searchResults.schools.map((sch) => (
                        <div
                          key={sch.id}
                          onClick={() => {
                            setActiveTab('schools');
                            setIsSearchOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.18] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {sch.name}
                            </p>
                            <p className="text-[11px] text-white/45 mt-0.5">
                              {sch.type} | {sch.district}, {sch.city} | Đã chụp: {sch.totalClassesBooked} lớp
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Marketing Campaigns */}
                {searchResults.campaigns.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <Megaphone className="w-3.5 h-3.5 text-rose-400" />
                      Chiến Dịch Marketing ({searchResults.campaigns.length})
                    </h3>
                    <div className="space-y-1">
                      {searchResults.campaigns.map((camp) => (
                        <div
                          key={camp.id}
                          onClick={() => {
                            setActiveTab('remarketing');
                            setIsSearchOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.18] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                              {camp.name}
                            </p>
                            <p className="text-[11px] text-white/45 mt-0.5">
                              Kênh: {camp.channel} | Loại: {camp.campaignType} | Ưu đãi: {camp.offer}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-rose-400 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between text-[11px] text-white/45">
          <span>Nhấn <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-semibold text-white/70">ESC</kbd> để đóng tìm kiếm</span>
          <span>CRM Xoắn Media • Spotlight Search</span>
        </div>
      </div>
    </div>
  );
};
