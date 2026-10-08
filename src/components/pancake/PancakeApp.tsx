import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FacebookApiService } from '../../services/facebookApiService';
import { MessengerIcon } from '../chat/MessengerIcon';
import {
  PANCAKE_CHANNELS,
  PANCAKE_AVAILABLE_TAGS,
  PANCAKE_QUICK_SCRIPTS,
  PancakeChannel,
  PancakeTagDef
} from '../../data/mockPancakeData';
import { PipelineStage } from '../../types';
import {
  Search,
  Send,
  Phone,
  ExternalLink,
  ThumbsUp,
  Image as ImageIcon,
  CheckCheck,
  User,
  Tag,
  DollarSign,
  Calendar,
  Sparkles,
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  PlusCircle,
  FileText,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
  ArrowLeft,
  RefreshCw,
  Settings,
  Check,
  X,
  Maximize2,
  Minimize2,
  Share2,
  ShoppingBag,
  CreditCard,
  QrCode,
  Layers,
  ChevronDown,
  UserCheck,
  MessageCircle,
  Hash,
  Eye,
  Camera
} from 'lucide-react';

const STAGE_COLORS: Partial<Record<PipelineStage, { bg: string; text: string; border: string }>> = {
  'New Lead': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Đã liên hệ': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Đang tư vấn': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Đã gửi báo giá': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Đang thương lượng': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Đã cọc': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Đã đặt cọc': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Book ngày': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Đã Booking': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Đã chụp': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Đang hậu kỳ': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Giao ảnh': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Đã bàn giao': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Hoàn thành': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'Lost': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Chăm sóc lại': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Mới tiếp nhận': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
};

export const PancakeApp: React.FC = () => {
  const {
    messengerConversations,
    activeConversationId,
    setActiveConversationId,
    sendMessengerMessage,
    markMessengerAsRead,
    updateMessengerStage,
    updateMessengerNotes,
    currentUser,
    setActiveTab,
    setSelectedCustomerId,
    customers,
    updateCustomer,
    bookings,
    servicePackages,
    salesStaff,
    isSyncingFacebook,
    syncFacebookLiveConversations,
    facebookPageName,
    addPancakeTag,
    removePancakeTag,
    assignPancakeStaff,
    sendPancakeCardMessage,
    createPancakeQuickBooking,
    loadPancakeSampleData
  } = useApp();

  // Fullscreen standalone app state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Omnichannel Channel selection
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');

  // Filter tabs
  const [filterTab, setFilterTab] = useState<'all' | 'unreplied' | 'unread' | 'has_phone' | 'no_phone' | 'deposited'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile layout
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Right POS Panel
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'customer' | 'pos' | 'templates' | 'tags'>('customer');

  // Quick Reply dropdown / Slash shortcut popup
  const [inputText, setInputText] = useState('');
  const [showQuickReplyPopup, setShowQuickReplyPopup] = useState(false);
  const [quickReplyFilter, setQuickReplyFilter] = useState('');

  // Custom Tag Modal
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showAssignStaffMenu, setShowAssignStaffMenu] = useState(false);

  // Editable Customer Info State
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustClass, setEditCustClass] = useState('');
  const [editCustSchool, setEditCustSchool] = useState('');
  const [noteText, setNoteText] = useState('');

  // Pancake POS Quick Order State
  const [posSelectedPackage, setPosSelectedPackage] = useState(
    servicePackages[1]?.name || 'Gói CONCEPT VIP (499k/bạn)'
  );
  const [posPackagePrice, setPosPackagePrice] = useState(
    servicePackages[1]?.price || 499000
  );
  const [posStudentCount, setPosStudentCount] = useState(40);
  const [posDepositAmount, setPosDepositAmount] = useState(2000000);
  const [posShootDate, setPosShootDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [posLocation, setPosLocation] = useState('Trường học + Phim trường');
  const [posNotes, setPosNotes] = useState('');
  const [posSuccessMsg, setPosSuccessMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active Conversation
  const activeConv = messengerConversations.find(c => c.id === activeConversationId) || messengerConversations[0];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  // Sync active conversation details to local state
  useEffect(() => {
    if (activeConv) {
      if (activeConv.unreadCount > 0) {
        markMessengerAsRead(activeConv.id);
      }
      setEditCustName(activeConv.customerName || '');
      setEditCustPhone(activeConv.customerPhone || '');
      setEditCustClass(activeConv.customerClass || '');
      setEditCustSchool(activeConv.customerSchool || '');
      setNoteText(activeConv.notes || '');
    }
  }, [activeConv?.id]);

  // Filtered Conversations
  const filteredConversations = useMemo(() => {
    return messengerConversations.filter(c => {
      // 1. Channel filter
      if (selectedChannelId !== 'all') {
        if (c.channelId && c.channelId !== selectedChannelId) return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.customerName.toLowerCase().includes(q);
        const matchPhone = c.customerPhone?.includes(q);
        const matchClass = c.customerClass?.toLowerCase().includes(q);
        const matchSchool = c.customerSchool?.toLowerCase().includes(q);
        const matchMsg = c.lastMessage?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchClass && !matchSchool && !matchMsg) return false;
      }

      // 3. Tab filter
      if (filterTab === 'unread' && c.unreadCount === 0) return false;
      if (filterTab === 'unreplied' && c.isReplied !== false && c.messages[c.messages.length - 1]?.sender === 'sales') return false;
      if (filterTab === 'has_phone' && !c.customerPhone) return false;
      if (filterTab === 'no_phone' && Boolean(c.customerPhone)) return false;
      if (filterTab === 'deposited' && c.pipelineStage !== 'Đã đặt cọc' && c.pipelineStage !== 'Đã Booking' && !c.tags.includes('💰 Đã cọc VietQR')) return false;

      // 4. Tag filter
      if (selectedTagFilter && !c.tags.includes(selectedTagFilter)) return false;

      // 5. Staff filter
      if (staffFilter === 'me' && c.assignedSalesName !== currentUser.name) return false;
      if (staffFilter === 'unassigned' && c.assignedSalesName && c.assignedSalesName !== 'Chưa phân công') return false;

      return true;
    });
  }, [messengerConversations, selectedChannelId, searchQuery, filterTab, selectedTagFilter, staffFilter, currentUser.name]);

  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessengerMessage(activeConv.id, inputText.trim(), 'sales');
    setInputText('');
    setShowQuickReplyPopup(false);
  };

  // Handle Quick Reply insertion or immediate send
  const handleSelectQuickReply = (text: string, sendImmediately = false) => {
    if (sendImmediately && activeConv) {
      sendMessengerMessage(activeConv.id, text, 'sales');
      setShowQuickReplyPopup(false);
      setInputText('');
    } else {
      setInputText(text);
      setShowQuickReplyPopup(false);
      inputRef.current?.focus();
    }
  };

  // Quick Action: Send Quote Card
  const handleSendQuickQuote = () => {
    if (!activeConv) return;
    const pkg = servicePackages.find(p => p.name === posSelectedPackage) || servicePackages[1];
    const totalAmount = posStudentCount * (pkg?.price || posPackagePrice);

    sendPancakeCardMessage(
      activeConv.id,
      `📸 BẢNG BÁO GIÁ KỶ YẾU TRỌN GÓI 2026\n✨ ${pkg?.name || posSelectedPackage}\n👥 Sĩ số: ${posStudentCount} bạn | Đơn giá: ${(pkg?.price || posPackagePrice).toLocaleString('vi-VN')}đ/bạn\n💵 Tổng thanh toán dự kiến: ${totalAmount.toLocaleString('vi-VN')}đ\n📅 Dự kiến chụp: ${posShootDate}\n📍 Địa điểm: ${posLocation}`,
      'quote',
      {
        packageName: pkg?.name || posSelectedPackage,
        packagePrice: pkg?.price || posPackagePrice,
        studentCount: posStudentCount,
        totalAmount,
        depositAmount: 2000000,
        shootDate: posShootDate,
        location: posLocation
      }
    );
  };

  // Quick Action: Send VietQR Deposit Card
  const handleSendVietQr = () => {
    if (!activeConv) return;
    const classNameClean = (activeConv.customerClass || 'LOP').toUpperCase().replace(/\s+/g, '');
    const transferSyntax = `${classNameClean} - COC KY YEU`;

    sendPancakeCardMessage(
      activeConv.id,
      `💰 THÔNG TIN CHUYỂN KHOẢN CỌC VIETQR\n🏦 Ngân hàng: MB Bank (Quân Đội)\n💳 STK: 09876543210\n👤 Chủ TK: TA VAN DUY\n💵 Số tiền cọc: ${posDepositAmount.toLocaleString('vi-VN')} VNĐ\n📝 Cú pháp chuyển khoản: ${transferSyntax}\n👉 Sau khi chuyển khoản, bạn gửi ảnh bill tại đây, CRM sẽ tự động khóa lịch cho Ekip nhé!`,
      'vietqr',
      {
        bankName: 'MB Bank (Quân Đội)',
        accountNo: '09876543210',
        accountHolder: 'TA VAN DUY',
        depositAmount: posDepositAmount,
        transferSyntax
      }
    );
  };

  // Quick Action: Send Sample Concept Photos
  const handleSendConceptPhotos = () => {
    if (!activeConv) return;
    const sampleConcepts = [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80'
    ];
    const chosen = sampleConcepts[Math.floor(Math.random() * sampleConcepts.length)];

    sendMessengerMessage(
      activeConv.id,
      '🎬 Xoăn Media gửi bạn một số hình ảnh mẫu concept Retro Hongkong & Học đường Hàn Quốc cực hot năm nay nhé!',
      'sales',
      [{ type: 'image', url: chosen, name: 'concept_xoan_media.jpg' }]
    );
  };

  // Save Customer Info
  const handleSaveCustomerInfo = () => {
    if (!activeConv) return;

    // Cập nhật conversation
    updateMessengerNotes(activeConv.id, noteText);

    // Cập nhật customer nếu có
    const linkedCust = customers.find(c => c.id === activeConv.customerId || c.phone === activeConv.customerPhone);
    if (linkedCust) {
      updateCustomer({
        ...linkedCust,
        name: editCustName || linkedCust.name,
        phone: editCustPhone || linkedCust.phone,
        className: editCustClass || linkedCust.className,
        schoolName: editCustSchool || linkedCust.schoolName,
        notes: noteText || linkedCust.notes
      });
    }

    setPosSuccessMsg('Đã lưu thông tin khách hàng vào CRM!');
    setTimeout(() => setPosSuccessMsg(null), 3000);
  };

  // Pancake POS: Create Quick Booking
  const handleCreatePosBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv) return;

    createPancakeQuickBooking(activeConv.id, {
      packageName: posSelectedPackage,
      packagePrice: posPackagePrice,
      studentCount: Number(posStudentCount) || 40,
      depositAmount: Number(posDepositAmount) || 2000000,
      shootDate: posShootDate,
      location: posLocation,
      notes: posNotes
    });

    setPosSuccessMsg('🎉 Đã tạo Booking & chốt lịch thành công vào CRM!');
    setTimeout(() => setPosSuccessMsg(null), 4000);
  };

  // Find linked customer
  const linkedCustomer = customers.find(
    c => c.id === activeConv?.customerId || (activeConv?.customerPhone && c.phone === activeConv.customerPhone)
  );

  // Past Bookings of this customer
  const customerBookings = bookings.filter(
    b => b.customerId === activeConv?.customerId || (linkedCustomer && b.customerId === linkedCustomer.id)
  );

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#F0F2F5] flex flex-col w-screen h-screen'
          : 'h-[calc(100vh-120px)] min-h-[640px] bg-white rounded-3xl border border-black/[0.08] shadow-sm flex flex-col overflow-hidden'
      }`}
    >
      {/* ========================================================
          PANCAKE TOP BAR: STATUS, MULTI-CHANNEL & TOOLS
          ======================================================== */}
      <div className="h-13 bg-neutral-900 text-white px-3 sm:px-5 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10 select-none">
        {/* Left: Brand & Page Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xs font-black text-sm">
              🥞
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs tracking-tight text-white">PANCAKE XOĂN</span>
                <span className="bg-amber-400/20 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-amber-400/30">
                  PRO POS
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Hộp Thư Đa Kênh & Chốt Đơn Trực Tiếp</p>
            </div>
          </div>

          <div className="h-4 w-px bg-white/20 hidden sm:block" />

          {/* Sync indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync 5s
            </span>
            <span className="text-neutral-400 text-[11px] truncate hidden md:inline">
              Kênh: <strong className="text-white">{facebookPageName}</strong>
            </span>
          </div>
        </div>

        {/* Right: Quick Controls & Fullscreen toggle */}
        <div className="flex items-center gap-2">
          {/* Nạp lại dữ liệu mẫu */}
          <button
            onClick={() => loadPancakeSampleData()}
            className="hidden lg:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-white/10 hover:bg-white/20 text-neutral-200 rounded-lg transition-colors border border-white/10"
            title="Khôi phục lại các kênh và tin nhắn mẫu đa kênh để trải nghiệm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Nạp data mẫu</span>
          </button>

          {/* Đồng bộ Facebook Graph API */}
          <button
            onClick={() => syncFacebookLiveConversations()}
            disabled={isSyncingFacebook}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
            title="Đồng bộ tin nhắn mới từ Fanpage Facebook thật"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingFacebook ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncingFacebook ? 'Đang tải...' : 'Sync Fanpage'}</span>
          </button>

          {/* Fullscreen Standalone App Switcher */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
            title={isFullscreen ? 'Thu nhỏ về giao diện CRM' : 'Mở toàn màn hình độc lập (Chế độ App Pancake)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-300" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Trở lại CRM nếu đang fullscreen */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-xs font-bold px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition-colors"
            >
              Trở lại CRM
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          PANCAKE WORKSPACE: 4 COLUMNS LAYOUT
          ======================================================== */}
      <div className="flex-1 flex min-h-0 overflow-hidden bg-[#F0F2F5]">
        {/* ----------------------------------------------------
            CỘT 1: DẢI KÊNH ĐA NỀN TẢNG (OMNICHANNEL RAIL)
            ---------------------------------------------------- */}
        <div className="w-14 sm:w-16 bg-[#18191A] flex flex-col items-center py-3 space-y-3 shrink-0 border-r border-black/20 select-none z-10">
          <span className="text-[8px] font-black tracking-widest text-neutral-500 uppercase">KÊNH</span>

          <div className="flex-1 w-full overflow-y-auto space-y-2.5 px-2 scrollbar-none flex flex-col items-center">
            {PANCAKE_CHANNELS.map(ch => {
              const isActive = selectedChannelId === ch.id;
              const chUnread =
                ch.id === 'all'
                  ? messengerConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
                  : messengerConversations
                      .filter(c => c.channelId === ch.id || (ch.id === 'fb-xoan-hn' && c.channel === 'facebook'))
                      .reduce((sum, c) => sum + (c.unreadCount || 0), 0);

              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`relative group w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'ring-2 ring-amber-400 bg-white/20 shadow-md scale-105'
                      : 'hover:bg-white/10 opacity-75 hover:opacity-100'
                  }`}
                  title={`${ch.name} (${ch.badge})`}
                >
                  {ch.id === 'all' ? (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      ALL
                    </div>
                  ) : ch.platform === 'facebook' ? (
                    <div className="w-full h-full rounded-2xl bg-[#0084FF] flex items-center justify-center text-white shadow-xs">
                      <MessengerIcon size={20} />
                    </div>
                  ) : ch.platform === 'zalo' ? (
                    <div className="w-full h-full rounded-2xl bg-[#0068FF] flex items-center justify-center text-white font-black text-xs shadow-xs">
                      Zalo
                    </div>
                  ) : ch.platform === 'tiktok' ? (
                    <div className="w-full h-full rounded-2xl bg-[#000000] border border-white/20 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      🎵
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                      📷
                    </div>
                  )}

                  {/* Unread badge */}
                  {chUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#18191A] shadow-xs">
                      {chUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Rail Help/Settings */}
          <div className="pt-2 border-t border-white/10 w-full flex flex-col items-center">
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 text-neutral-400 hover:text-white rounded-xl transition-colors"
              title="Cài đặt kết nối Fanpage"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            CỘT 2: DANH SÁCH HỘI THOẠI & BỘ LỌC PANCAKE
            ---------------------------------------------------- */}
        <div
          className={`${
            mobileView === 'list' ? 'flex' : 'hidden'
          } md:flex w-full md:w-80 lg:w-88 xl:w-96 bg-white border-r border-black/[0.08] flex-col shrink-0 h-full select-none`}
        >
          {/* Header & Filter Controls */}
          <div className="p-3 border-b border-black/[0.06] space-y-2.5 bg-neutral-50/70">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, lớp, trường..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-black/[0.08] focus:border-amber-400 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Tabs (Pancake Signature) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] font-bold scrollbar-none">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-black/[0.06]'
                }`}
              >
                Tất cả ({messengerConversations.length})
              </button>
              <button
                onClick={() => setFilterTab('unreplied')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'unreplied'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
                }`}
                title="Khách đã nhắn nhưng chưa được phản hồi"
              >
                Chưa trả lời
              </button>
              <button
                onClick={() => setFilterTab('has_phone')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'has_phone'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
                title="Đã có số điện thoại"
              >
                Có SĐT
              </button>
              <button
                onClick={() => setFilterTab('no_phone')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'no_phone'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
                title="Chưa có số điện thoại"
              >
                Chưa có SĐT
              </button>
              <button
                onClick={() => setFilterTab('deposited')}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  filterTab === 'deposited'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                Đã cọc
              </button>
            </div>

            {/* Tags & Staff Filter Row */}
            <div className="flex items-center gap-1.5 pt-1 text-[10px]">
              {/* Tag selector */}
              <select
                value={selectedTagFilter || ''}
                onChange={e => setSelectedTagFilter(e.target.value || null)}
                className="flex-1 px-2 py-1 bg-white border border-black/[0.08] rounded-lg text-neutral-700 font-semibold focus:outline-none"
              >
                <option value="">🏷️ Tất cả thẻ tag</option>
                {PANCAKE_AVAILABLE_TAGS.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Staff selector */}
              <select
                value={staffFilter}
                onChange={e => setStaffFilter(e.target.value)}
                className="flex-1 px-2 py-1 bg-white border border-black/[0.08] rounded-lg text-neutral-700 font-semibold focus:outline-none"
              >
                <option value="all">👤 Tất cả Sales</option>
                <option value="me">Chỉ tôi phụ trách</option>
                <option value="unassigned">Chưa phân công</option>
              </select>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 space-y-3">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
                <p className="text-xs font-semibold text-neutral-600">
                  {searchQuery ? 'Không tìm thấy cuộc trò chuyện phù hợp' : 'Không có hội thoại trong bộ lọc này'}
                </p>
                <button
                  onClick={() => {
                    setFilterTab('all');
                    setSelectedTagFilter(null);
                    setStaffFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-amber-600 hover:underline"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = conv.id === activeConv?.id;
                const stageStyle = STAGE_COLORS[conv.pipelineStage] || {
                  bg: 'bg-neutral-50',
                  text: 'text-neutral-700',
                  border: 'border-neutral-200'
                };

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setMobileView('chat');
                    }}
                    className={`p-3 flex items-start gap-2.5 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    {/* Customer Avatar & Platform badge */}
                    <div className="relative shrink-0">
                      <img
                        src={conv.customerAvatar}
                        alt={conv.customerName}
                        className="w-10 h-10 rounded-full object-cover border border-black/[0.08]"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center">
                        {conv.channel === 'zalo' ? (
                          <span className="text-[9px] font-black text-blue-600">Z</span>
                        ) : conv.channel === 'tiktok' ? (
                          <span className="text-[9px]">🎵</span>
                        ) : conv.channel === 'instagram' ? (
                          <span className="text-[9px]">📷</span>
                        ) : (
                          <MessengerIcon size={12} />
                        )}
                      </div>
                    </div>

                    {/* Chat Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs truncate ${
                            conv.unreadCount > 0 ? 'font-black text-neutral-900' : 'font-bold text-neutral-800'
                          }`}
                        >
                          {conv.customerName}
                        </h4>
                        <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Class and School */}
                      <p className="text-[10px] text-amber-700 font-semibold truncate mb-0.5">
                        {conv.customerClass || 'Lớp Kỷ Yếu'} • {conv.customerSchool || 'Chưa rõ trường'}
                      </p>

                      {/* Last message snippet */}
                      <p
                        className={`text-xs truncate leading-snug mb-1.5 ${
                          conv.unreadCount > 0 ? 'font-bold text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        {conv.lastMessage}
                      </p>

                      {/* Tags & Phone Pill */}
                      <div className="flex flex-wrap items-center gap-1">
                        {/* Stage */}
                        <span
                          className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}
                        >
                          {conv.pipelineStage}
                        </span>

                        {/* Phone detected pill */}
                        {conv.customerPhone && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            {conv.customerPhone}
                          </span>
                        )}

                        {/* Pancake Tags */}
                        {conv.tags.slice(0, 2).map((tg, idx) => (
                          <span
                            key={idx}
                            className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 truncate max-w-[90px]"
                          >
                            {tg}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ----------------------------------------------------
            CỘT 3: KHUNG CHAT CHUẨN PANCAKE (CHAT ENGINE)
            ---------------------------------------------------- */}
        {activeConv ? (
          <div
            className={`${
              mobileView === 'chat' ? 'flex' : 'hidden'
            } md:flex flex-1 flex-col min-w-0 bg-[#F0F2F5] h-full relative`}
          >
            {/* Chat Header */}
            <div className="px-3 sm:px-4 py-2.5 bg-white border-b border-black/[0.08] flex items-center justify-between gap-2 shadow-2xs select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={activeConv.customerAvatar}
                    alt={activeConv.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-black/[0.1]"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-neutral-900 truncate">
                      {activeConv.customerName}
                    </h3>
                    {activeConv.facebookUrl && (
                      <a
                        href={activeConv.facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-blue-600 p-0.5"
                        title="Mở Facebook cá nhân"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 truncate">
                    <span className="font-semibold text-neutral-700">{activeConv.customerClass || 'Lớp Kỷ Yếu'}</span>
                    <span>•</span>
                    <span className="truncate">{activeConv.customerSchool || 'Chưa rõ trường'}</span>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5">
                {/* Call button */}
                {activeConv.customerPhone && (
                  <a
                    href={`tel:${activeConv.customerPhone}`}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                    title={`Gọi ${activeConv.customerPhone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Stage dropdown */}
                <select
                  value={activeConv.pipelineStage}
                  onChange={e => updateMessengerStage(activeConv.id, e.target.value as PipelineStage)}
                  className="hidden lg:block text-xs font-bold px-2 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-black/[0.08] rounded-xl text-neutral-800 focus:outline-none"
                >
                  <option value="New Lead">1. New Lead</option>
                  <option value="Đang tư vấn">2. Đang tư vấn</option>
                  <option value="Đã gửi báo giá">3. Đã gửi báo giá</option>
                  <option value="Đang thương lượng">4. Đang thương lượng</option>
                  <option value="Đã đặt cọc">5. Đã đặt cọc</option>
                  <option value="Đã Booking">6. Đã Booking</option>
                  <option value="Lost">Lost (Từ chối)</option>
                </select>

                {/* Assign Sales Button */}
                <div className="relative hidden xl:block">
                  <button
                    onClick={() => setShowAssignStaffMenu(!showAssignStaffMenu)}
                    className="text-xs font-semibold px-2 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl flex items-center gap-1 border border-black/[0.08]"
                    title="Phân công Sales phụ trách"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate max-w-[90px]">{activeConv.assignedSalesName || 'Chưa gán'}</span>
                  </button>

                  {showAssignStaffMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-black/[0.1] py-1 z-30 animate-in fade-in">
                      <div className="px-3 py-1.5 text-[10px] font-black text-neutral-400 uppercase">
                        Chọn Sales phụ trách
                      </div>
                      <button
                        onClick={() => {
                          assignPancakeStaff(activeConv.id, currentUser.name, currentUser.id);
                          setShowAssignStaffMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-neutral-100 text-neutral-900 flex items-center justify-between"
                      >
                        <span>{currentUser.name} (Tôi)</span>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                      {salesStaff.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            assignPancakeStaff(activeConv.id, s.name, s.id);
                            setShowAssignStaffMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-semibold hover:bg-neutral-100 text-neutral-800"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag button */}
                <button
                  onClick={() => setShowTagMenu(!showTagMenu)}
                  className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors"
                  title="Gắn thẻ tag màu Pancake"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                </button>

                {/* Right POS Panel Toggle */}
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className={`p-2 rounded-xl transition-colors border ${
                    showRightPanel
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-black/[0.08]'
                  }`}
                  title={showRightPanel ? 'Đóng cột Pancake POS' : 'Mở cột Pancake POS & Hồ sơ khách'}
                >
                  {showRightPanel ? (
                    <PanelRightClose className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <PanelRightOpen className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Tag selector dropdown modal */}
            {showTagMenu && (
              <div className="absolute top-14 right-4 w-64 bg-white rounded-2xl shadow-xl border border-black/[0.1] p-3 z-30 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.06]">
                  <span className="text-xs font-black text-neutral-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" /> Gắn Thẻ Tag Màu
                  </span>
                  <button onClick={() => setShowTagMenu(false)} className="text-neutral-400 hover:text-neutral-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {PANCAKE_AVAILABLE_TAGS.map(t => {
                    const isTagged = activeConv.tags.includes(t.name);
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (isTagged) {
                            removePancakeTag(activeConv.id, t.name);
                          } else {
                            addPancakeTag(activeConv.id, t.name);
                          }
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                          isTagged
                            ? `${t.bg} ${t.color} ${t.border} shadow-2xs`
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-transparent'
                        }`}
                      >
                        <span>{t.name}</span>
                        {isTagged && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* Channel banner */}
              <div className="text-center my-2">
                <span className="text-[11px] font-semibold text-neutral-600 bg-white px-3 py-1 rounded-full border border-black/[0.08] shadow-2xs inline-flex items-center gap-1.5">
                  <span>Hội thoại từ kênh:</span>
                  <strong className="text-neutral-900">{activeConv.pageName}</strong>
                  {activeConv.channel && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 uppercase">
                      {activeConv.channel}
                    </span>
                  )}
                </span>
              </div>

              {activeConv.messages.map(msg => {
                const isSales = msg.sender === 'sales';

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isSales ? 'justify-end' : 'justify-start'}`}>
                    {!isSales && (
                      <img
                        src={msg.senderAvatar || activeConv.customerAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-black/[0.08] mb-0.5"
                      />
                    )}

                    <div className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${isSales ? 'items-end' : 'items-start'}`}>
                      {/* Interactive Card: Báo Giá */}
                      {msg.cardType === 'quote' && msg.cardData && (
                        <div className="bg-white rounded-2xl border-2 border-purple-300 shadow-md overflow-hidden text-neutral-900 mb-1">
                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                                📸 Báo Giá Kỷ Yếu 2026
                              </span>
                              <span className="text-[10px] font-bold text-purple-200">Xoăn Media</span>
                            </div>
                            <h4 className="text-sm font-black mt-1">{msg.cardData.packageName}</h4>
                          </div>
                          <div className="p-3 text-xs space-y-1.5 bg-purple-50/30">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Sĩ số học sinh:</span>
                              <span className="font-bold">{msg.cardData.studentCount} bạn</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Đơn giá / bạn:</span>
                              <span className="font-bold text-purple-700">
                                {msg.cardData.packagePrice?.toLocaleString('vi-VN')} VNĐ
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-purple-200 pt-1.5">
                              <span className="font-bold text-neutral-700">Tổng thanh toán dự kiến:</span>
                              <span className="font-black text-rose-600 text-sm">
                                {msg.cardData.totalAmount?.toLocaleString('vi-VN')} VNĐ
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 pt-1">
                              📍 Địa điểm: <strong>{msg.cardData.location}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Card: VietQR */}
                      {msg.cardType === 'vietqr' && msg.cardData && (
                        <div className="bg-white rounded-2xl border-2 border-emerald-400 shadow-md overflow-hidden text-neutral-900 mb-1">
                          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <QrCode className="w-3 h-3" /> VietQR Khóa Lịch
                              </span>
                              <span className="text-[10px] font-bold text-emerald-200">MB Bank</span>
                            </div>
                            <h4 className="text-sm font-black mt-1">
                              Số Tiền Cọc: {msg.cardData.depositAmount?.toLocaleString('vi-VN')} VNĐ
                            </h4>
                          </div>
                          <div className="p-3 text-xs space-y-2 bg-emerald-50/40">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-20 bg-white border border-emerald-300 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
                                <img
                                  src={`https://api.vietqr.io/image/970422-09876543210-vietqr_net.jpg?amount=${msg.cardData.depositAmount}&addInfo=${encodeURIComponent(
                                    msg.cardData.transferSyntax || 'COC KY YEU'
                                  )}&accountName=TA%20VAN%20DUY`}
                                  alt="VietQR MB Bank"
                                  className="w-full h-full object-contain"
                                  onError={(e: any) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <p className="text-[11px] text-neutral-600">
                                  STK: <strong className="text-neutral-900 font-mono">{msg.cardData.accountNo}</strong>
                                </p>
                                <p className="text-[11px] text-neutral-600">
                                  Chủ TK: <strong className="text-neutral-900">{msg.cardData.accountHolder}</strong>
                                </p>
                                <p className="text-[11px] text-emerald-700 font-bold break-all">
                                  Cú pháp: {msg.cardData.transferSyntax}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Card: Booking Confirmation */}
                      {msg.cardType === 'booking' && msg.cardData && (
                        <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-md overflow-hidden text-neutral-900 mb-1">
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 p-3">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-full">
                              ⚡ XÁC NHẬN CHỐT BOOKING
                            </span>
                            <h4 className="text-sm font-black mt-1">Đơn #{msg.cardData.bookingCode}</h4>
                          </div>
                          <div className="p-3 text-xs space-y-1.5 bg-amber-50/50">
                            <p>
                              ✨ Gói: <strong>{msg.cardData.packageName}</strong> ({msg.cardData.studentCount} bạn)
                            </p>
                            <p>
                              📅 Ngày chụp: <strong>{msg.cardData.shootDate}</strong>
                            </p>
                            <p>
                              📍 Địa điểm: <strong>{msg.cardData.location}</strong>
                            </p>
                            <p className="text-emerald-700 font-bold">
                              💰 Đã cọc: {msg.cardData.depositAmount?.toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Regular text bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isSales
                            ? 'bg-neutral-900 text-white rounded-br-xs'
                            : 'bg-white text-neutral-900 border border-black/[0.08] rounded-bl-xs'
                        }`}
                      >
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 space-y-1">
                            {msg.attachments.map((att, i) => (
                              <img
                                key={i}
                                src={att.url}
                                alt={att.name || 'Ảnh đính kèm'}
                                className="rounded-xl max-h-48 w-full object-cover border border-black/[0.06]"
                              />
                            ))}
                          </div>
                        )}
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Timestamp & read receipts */}
                      <div
                        className={`flex items-center gap-1 text-[10px] text-neutral-400 px-1 ${
                          isSales ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isSales && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>

                    {isSales && (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-black/[0.08] mb-0.5"
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Pancake Quick Action Bar (1-Click Tools) */}
            <div className="px-3 py-1.5 bg-white border-t border-black/[0.06] flex items-center gap-1.5 overflow-x-auto scrollbar-none select-none">
              {/* Shortcut '/' button */}
              <button
                onClick={() => setShowQuickReplyPopup(!showQuickReplyPopup)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-200 shrink-0"
                title="Gõ phím tắt / hoặc bấm xem kịch bản mẫu"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Kịch bản ( / )</span>
              </button>

              {/* Quick Quote Card Button */}
              <button
                onClick={handleSendQuickQuote}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-200 shrink-0"
                title="Gửi card Báo giá gói kỷ yếu trực tiếp vào chat"
              >
                <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                <span>Báo giá nhanh</span>
              </button>

              {/* Quick VietQR Deposit Button */}
              <button
                onClick={handleSendVietQr}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-200 shrink-0"
                title="Gửi card VietQR tài khoản cọc kèm mã QR MB Bank"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>VietQR cọc</span>
              </button>

              {/* Sample Concept photos */}
              <button
                onClick={handleSendConceptPhotos}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200 shrink-0"
                title="Gửi ảnh mẫu concept kỷ yếu hot trend"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Ảnh concept</span>
              </button>
            </div>

            {/* Quick Reply Popup (when triggered or typed /) */}
            {showQuickReplyPopup && (
              <div className="absolute bottom-16 left-3 right-3 sm:right-auto sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-black/[0.12] p-3 z-30 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.06]">
                  <span className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chọn Kịch Bản Mẫu (Pancake Scripts)
                  </span>
                  <button onClick={() => setShowQuickReplyPopup(false)} className="text-neutral-400 hover:text-neutral-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {PANCAKE_QUICK_SCRIPTS.map(sc => (
                    <div
                      key={sc.id}
                      onClick={() => handleSelectQuickReply(sc.text, true)}
                      className="p-2 rounded-xl bg-neutral-50 hover:bg-amber-50/70 border border-black/[0.05] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-800 group-hover:text-amber-800">
                          {sc.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-200/60 px-1.5 py-0.2 rounded">
                          {sc.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{sc.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-black/[0.08] flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Nhắn tin với ${activeConv.customerName} (Gõ '/' để mở kịch bản mẫu)...`}
                value={inputText}
                onChange={e => {
                  const val = e.target.value;
                  setInputText(val);
                  if (val.startsWith('/')) {
                    setShowQuickReplyPopup(true);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-neutral-100 focus:bg-white border border-transparent focus:border-amber-400 rounded-2xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl transition-transform active:scale-95 shadow-xs"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sendMessengerMessage(activeConv.id, '👍', 'sales');
                  }}
                  className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-2xl transition-transform active:scale-95"
                  title="Gửi nút Like 👍"
                >
                  <ThumbsUp className="w-5 h-5 fill-current" />
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-white text-neutral-400">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
              🥞
            </div>
            <h3 className="text-sm font-black text-neutral-800 mb-1">Pancake Xoăn - Chat & Bán Hàng Đa Kênh</h3>
            <p className="text-xs text-neutral-500 max-w-sm mb-4 leading-relaxed">
              Chọn một cuộc hội thoại ở danh sách bên trái hoặc bấm nạp dữ liệu mẫu để trải nghiệm đầy đủ các tính năng Pancake.
            </p>
          </div>
        )}

        {/* ----------------------------------------------------
            CỘT 4: PANCAKE POS & HỒ SƠ KHÁCH HÀNG (RIGHT PANEL)
            ---------------------------------------------------- */}
        {showRightPanel && activeConv && (
          <div className="hidden lg:flex w-80 xl:w-92 bg-white border-l border-black/[0.08] flex-col shrink-0 h-full overflow-hidden select-none animate-in slide-in-from-right-4 duration-200">
            {/* Right Panel Tabs */}
            <div className="h-11 bg-neutral-50 border-b border-black/[0.06] px-2 flex items-center justify-between text-xs font-bold text-neutral-600">
              <button
                onClick={() => setRightPanelTab('customer')}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  rightPanelTab === 'customer'
                    ? 'bg-white text-neutral-900 shadow-2xs font-black'
                    : 'hover:text-neutral-900'
                }`}
              >
                👤 Khách
              </button>
              <button
                onClick={() => setRightPanelTab('pos')}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  rightPanelTab === 'pos'
                    ? 'bg-amber-500 text-neutral-950 shadow-2xs font-black'
                    : 'hover:text-neutral-900'
                }`}
              >
                🛒 Tạo Đơn (POS)
              </button>
              <button
                onClick={() => setRightPanelTab('templates')}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  rightPanelTab === 'templates'
                    ? 'bg-white text-neutral-900 shadow-2xs font-black'
                    : 'hover:text-neutral-900'
                }`}
              >
                ⚡ Kịch Bản
              </button>
              <button
                onClick={() => setRightPanelTab('tags')}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  rightPanelTab === 'tags'
                    ? 'bg-white text-neutral-900 shadow-2xs font-black'
                    : 'hover:text-neutral-900'
                }`}
              >
                🏷️ Tags
              </button>
            </div>

            {/* Notification alert banner */}
            {posSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{posSuccessMsg}</span>
              </div>
            )}

            {/* Right Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: KHÁCH HÀNG CRM */}
              {rightPanelTab === 'customer' && (
                <div className="space-y-4">
                  {/* Avatar & Name */}
                  <div className="text-center pb-3 border-b border-black/[0.06]">
                    <img
                      src={activeConv.customerAvatar}
                      alt={activeConv.customerName}
                      className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-amber-400 shadow-xs mb-2"
                    />
                    <h3 className="text-sm font-black text-neutral-900">{activeConv.customerName}</h3>
                    <p className="text-xs text-amber-700 font-bold">
                      {activeConv.customerClass} • {activeConv.customerSchool}
                    </p>
                  </div>

                  {/* Editable Fields */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Họ và tên khách
                      </label>
                      <input
                        type="text"
                        value={editCustName}
                        onChange={e => setEditCustName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Số điện thoại / Zalo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editCustPhone}
                          onChange={e => setEditCustPhone(e.target.value)}
                          placeholder="Nhập số điện thoại..."
                          className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-bold focus:outline-none focus:border-amber-500"
                        />
                        {editCustPhone && (
                          <a
                            href={`tel:${editCustPhone}`}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 font-bold text-[11px]"
                          >
                            Gọi
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                          Lớp
                        </label>
                        <input
                          type="text"
                          value={editCustClass}
                          onChange={e => setEditCustClass(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                          Trường học
                        </label>
                        <input
                          type="text"
                          value={editCustSchool}
                          onChange={e => setEditCustSchool(e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Ghi chú nội bộ Sales
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Yêu cầu concept, lưu ý về lớp..."
                        className="w-full p-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber-400 resize-none text-xs"
                      />
                    </div>

                    <button
                      onClick={handleSaveCustomerInfo}
                      className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-black transition-colors shadow-2xs"
                    >
                      Lưu Thông Tin Vào CRM
                    </button>
                  </div>

                  {/* Linked Customer Action */}
                  {linkedCustomer && (
                    <div className="pt-2 border-t border-black/[0.06]">
                      <button
                        onClick={() => {
                          setSelectedCustomerId(linkedCustomer.id);
                          setActiveTab('customers');
                        }}
                        className="w-full py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
                      >
                        Mở Hồ Sơ Khách 360° Đầy Đủ
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TẠO ĐƠN / BOOKING NHANH (PANCAKE POS) */}
              {rightPanelTab === 'pos' && (
                <form onSubmit={handleCreatePosBooking} className="space-y-3 text-xs">
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5 mb-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-700" /> Tạo Đơn & Chốt Lịch Kỷ Yếu
                    </h4>
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      Tự động tính tiền, tạo Booking trên CRM và gửi thông báo xác nhận vào luồng chat!
                    </p>
                  </div>

                  {/* Chọn Gói Chụp */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Gói Dịch Vụ Kỷ Yếu
                    </label>
                    <select
                      value={posSelectedPackage}
                      onChange={e => {
                        const name = e.target.value;
                        setPosSelectedPackage(name);
                        const found = servicePackages.find(p => p.name === name);
                        if (found) setPosPackagePrice(found.price);
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 border border-black/[0.1] rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-amber-500"
                    >
                      {servicePackages.map(pkg => (
                        <option key={pkg.id} value={pkg.name}>
                          {pkg.name} — {pkg.price.toLocaleString('vi-VN')}đ/bạn
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sĩ số & Đơn giá */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Sĩ số (Học sinh)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={posStudentCount}
                        onChange={e => setPosStudentCount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl font-black text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Đơn giá / bạn (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={posPackagePrice}
                        onChange={e => setPosPackagePrice(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl font-bold text-neutral-900"
                      />
                    </div>
                  </div>

                  {/* Tổng tiền tự động */}
                  <div className="p-3 bg-neutral-100 rounded-xl flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-600">Tổng doanh thu dự kiến:</span>
                    <span className="text-sm font-black text-rose-600">
                      {(posStudentCount * posPackagePrice).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  {/* Tiền cọc */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Số tiền cọc khóa lịch (VietQR)
                    </label>
                    <input
                      type="number"
                      step="500000"
                      value={posDepositAmount}
                      onChange={e => setPosDepositAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl font-black text-emerald-700"
                    />
                  </div>

                  {/* Ngày chụp & Địa điểm */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Ngày chụp dự kiến
                    </label>
                    <input
                      type="date"
                      value={posShootDate}
                      onChange={e => setPosShootDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl font-bold text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Địa điểm chụp
                    </label>
                    <input
                      type="text"
                      value={posLocation}
                      onChange={e => setPosLocation(e.target.value)}
                      placeholder="VD: Trường Chu Văn An, Santorini..."
                      className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl font-semibold text-neutral-900"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:opacity-95 text-neutral-950 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 mt-2"
                  >
                    ⚡ TẠO BOOKING & CHỐT LỊCH TRÊN CRM
                  </button>

                  {/* Past bookings list */}
                  {customerBookings.length > 0 && (
                    <div className="pt-3 border-t border-black/[0.08] space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Đơn đã đặt của khách này ({customerBookings.length}):
                      </span>
                      {customerBookings.map(b => (
                        <div key={b.id} className="p-2.5 bg-neutral-50 rounded-xl border border-black/[0.05] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">#{b.code}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              {b.bookingStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-600">{b.packageName}</p>
                          <p className="text-[10px] text-neutral-500">
                            Ngày chụp: {b.shootDate} • {b.totalAmount.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              )}

              {/* TAB 3: KỊCH BẢN & MẪU TIN NHẮN */}
              {rightPanelTab === 'templates' && (
                <div className="space-y-3 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Tìm kịch bản..."
                      value={quickReplyFilter}
                      onChange={e => setQuickReplyFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    {PANCAKE_QUICK_SCRIPTS.filter(
                      s =>
                        !quickReplyFilter ||
                        s.title.toLowerCase().includes(quickReplyFilter.toLowerCase()) ||
                        s.text.toLowerCase().includes(quickReplyFilter.toLowerCase())
                    ).map(sc => (
                      <div
                        key={sc.id}
                        className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.06] space-y-2 hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-neutral-900">{sc.title}</span>
                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            {sc.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 whitespace-pre-line leading-relaxed">{sc.text}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => handleSelectQuickReply(sc.text, false)}
                            className="flex-1 py-1 bg-white hover:bg-neutral-100 text-neutral-800 font-bold rounded-lg border border-black/[0.08] text-[11px]"
                          >
                            Chèn vào ô chat
                          </button>
                          <button
                            onClick={() => handleSelectQuickReply(sc.text, true)}
                            className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black rounded-lg text-[11px]"
                          >
                            Gửi ngay
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: QUẢN LÝ TAGS */}
              {rightPanelTab === 'tags' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Thẻ hiện tại của khách
                    </span>
                    <span className="text-[10px] text-neutral-500">{activeConv.tags.length} thẻ</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeConv.tags.map((tg, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-100/70 text-amber-900 border border-amber-300 font-bold rounded-xl flex items-center gap-1.5 text-xs"
                      >
                        <span>{tg}</span>
                        <button
                          onClick={() => removePancakeTag(activeConv.id, tg)}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-black/[0.06] space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Thêm thẻ nhanh
                    </span>
                    <div className="space-y-1">
                      {PANCAKE_AVAILABLE_TAGS.map(t => {
                        const isTagged = activeConv.tags.includes(t.name);
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              if (isTagged) {
                                removePancakeTag(activeConv.id, t.name);
                              } else {
                                addPancakeTag(activeConv.id, t.name);
                              }
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                              isTagged
                                ? `${t.bg} ${t.color} ${t.border}`
                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-transparent'
                            }`}
                          >
                            <span>{t.name}</span>
                            {isTagged ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5 text-neutral-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PancakeApp;
