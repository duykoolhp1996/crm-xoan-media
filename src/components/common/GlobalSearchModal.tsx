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
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden transform transition-all text-neutral-900">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-black/[0.06] gap-3 bg-neutral-50/50">
          <Search className="w-5 h-5 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, SĐT, trường (Ams, Chu Văn An...), mã booking, thợ..."
            className="flex-1 bg-transparent border-none text-neutral-900 text-sm focus:outline-none placeholder-neutral-400 font-normal tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-neutral-100 border border-neutral-200 text-neutral-500 px-2 py-0.5 rounded-lg text-[10px] font-bold">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!query ? (
            <div className="py-8 text-center text-neutral-400 text-xs">
              <Search className="w-8 h-8 mx-auto text-neutral-300 mb-2.5" />
              <p>Nhập từ khóa để tra cứu tức thì toàn bộ hệ thống Xoăn Media.</p>
              <div className="flex justify-center gap-2 mt-3 flex-wrap">
                <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded-xl text-neutral-600">Gợi ý: "Amsterdam"</span>
                <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded-xl text-neutral-600">"0912883344"</span>
                <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded-xl text-neutral-600">"Tuấn"</span>
                <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded-xl text-neutral-600">"BK-2024"</span>
              </div>
            </div>
          ) : searchResults && searchResults.total === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-xs">
              Không tìm thấy kết quả nào khớp với "<strong className="text-neutral-900">{query}</strong>".
            </div>
          ) : (
            searchResults && (
              <>
                {/* 1. Khách Hàng / Leads */}
                {searchResults.customers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <User className="w-3.5 h-3.5 text-neutral-700" />
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
                          className="p-3 rounded-2xl bg-neutral-50/60 hover:bg-neutral-100 border border-black/[0.04] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                              {cust.name} - <span className="font-medium text-neutral-600">{cust.className} ({cust.schoolName})</span>
                            </p>
                            <p className="text-[11px] text-neutral-500 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-neutral-400" /> {cust.phone}</span>
                              <span className="bg-neutral-200/60 text-neutral-700 px-2 py-0.5 rounded-full font-medium">{cust.pipelineStage}</span>
                              <span>Concept: {cust.concept}</span>
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Bookings */}
                {searchResults.bookings.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
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
                          className="p-3 rounded-2xl bg-neutral-50/60 hover:bg-neutral-100 border border-black/[0.04] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                                {bk.code}
                              </span>
                              <p className="text-xs font-bold text-neutral-900">{bk.className} - {bk.schoolName}</p>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-1">
                              Ngày chụp: <strong className="text-neutral-800">{bk.shootDate}</strong> ({bk.startTime} - {bk.endTime}) | Địa điểm: {bk.location}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Photographers */}
                {searchResults.photographers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
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
                          className="p-3 rounded-2xl bg-neutral-50/60 hover:bg-neutral-100 border border-black/[0.04] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={photo.avatar}
                              alt={photo.fullName}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-200"
                            />
                            <div>
                              <p className="text-xs font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">
                                {photo.fullName} <span className="font-normal text-neutral-500">({photo.photographerType})</span>
                              </p>
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                Kỹ năng: {photo.skills.join(', ')} | Đơn giá: {photo.ratePerShoot.toLocaleString('vi-VN')}đ/buổi
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Schools */}
                {searchResults.schools.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 px-1">
                      <School className="w-3.5 h-3.5 text-emerald-600" />
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
                          className="p-3 rounded-2xl bg-neutral-50/60 hover:bg-neutral-100 border border-black/[0.04] cursor-pointer flex items-center justify-between transition-all group"
                        >
                          <div>
                            <p className="text-xs font-bold text-neutral-900">{sch.name}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {sch.district}, {sch.city} | Khối: {sch.type} | {bookings.filter(b => b.schoolName === sch.name).length} lớp chụp
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 transform group-hover:translate-x-1 transition-all" />
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
        <div className="px-5 py-3 bg-neutral-50 border-t border-black/[0.05] flex items-center justify-between text-xs text-neutral-400">
          <span>Dùng phím <kbd className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded">↓</kbd> để điều hướng</span>
          <span>Hệ thống CRM Xoăn Media</span>
        </div>
      </div>
    </div>
  );
};
