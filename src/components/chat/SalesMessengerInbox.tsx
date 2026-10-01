import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessengerIcon } from './MessengerIcon';
import { quickReplyTemplates } from '../../data/mockMessengerData';
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
  School,
  Tag,
  DollarSign,
  Calendar,
  Sparkles,
  MessageSquare,
  Bot,
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
  X
} from 'lucide-react';

const STAGE_COLORS: Record<PipelineStage, { bg: string; text: string; border: string }> = {
  'New Lead': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Đã liên hệ': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Đang tư vấn': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Đã gửi báo giá': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Đang thương lượng': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Đã đặt cọc': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Đã Booking': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Đã chụp': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Đang hậu kỳ': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Đã bàn giao': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Hoàn thành': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'Lost': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Chăm sóc lại': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
};

export const SalesMessengerInbox: React.FC = () => {
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
    customers
  } = useApp();

  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'consulting' | 'deposited'>('all');
  const [inputText, setInputText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);
  const [showCrmPanel, setShowCrmPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = messengerConversations.find(c => c.id === activeConversationId) || messengerConversations[0];

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  // Đánh dấu đã đọc khi chọn conversation
  useEffect(() => {
    if (activeConv && activeConv.unreadCount > 0) {
      markMessengerAsRead(activeConv.id);
    }
    if (activeConv) {
      setNoteText(activeConv.notes || '');
    }
  }, [activeConv?.id]);

  // Bộ lọc danh sách chat
  const filteredConversations = messengerConversations.filter(c => {
    const matchSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerClass && c.customerClass.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.customerSchool && c.customerSchool.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.customerPhone && c.customerPhone.includes(searchQuery));

    if (!matchSearch) return false;

    if (filterTab === 'unread') return c.unreadCount > 0;
    if (filterTab === 'consulting') return c.pipelineStage === 'Đang tư vấn' || c.pipelineStage === 'New Lead';
    if (filterTab === 'deposited') return c.pipelineStage === 'Đã đặt cọc' || c.pipelineStage === 'Đã Booking';
    return true;
  });

  // Gửi tin nhắn từ Sales
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessengerMessage(activeConv.id, inputText.trim(), 'sales');
    setInputText('');
  };

  // Gửi icon Like nhanh
  const handleSendThumbsUp = () => {
    if (!activeConv) return;
    sendMessengerMessage(activeConv.id, '👍', 'sales');
  };

  // Gửi câu trả lời mẫu (Quick reply)
  const handleSendQuickReply = (text: string) => {
    if (!activeConv) return;
    sendMessengerMessage(activeConv.id, text, 'sales');
  };

  // Mô phỏng tin nhắn từ phía khách hàng (để test/demo)
  const handleSimulateCustomerReply = (customText?: string) => {
    if (!activeConv) return;
    const replies = [
      'Dạ em cảm ơn anh/chị ạ! Em gửi link bill chuyển khoản cọc 2 triệu rồi nhé!',
      'Dạ lớp em đang biểu quyết thêm concept Cổ Phục, tầm chiều nay em báo anh số lượng chính xác nha.',
      'Cho em xin số Zalo của anh để em add vào nhóm ban cán sự lớp trao đổi cho tiện ạ!',
      'Gói BASIC này có cho mượn flycam quay toàn trường không anh?',
      'Dạ ok anh, em chốt lịch chụp ngày 20/10 này luôn nhé ạ!'
    ];
    const textToSend = customText || replies[Math.floor(Math.random() * replies.length)];
    sendMessengerMessage(activeConv.id, textToSend, 'customer');
    setShowSimulateMenu(false);
  };

  // Lưu ghi chú nội bộ
  const handleSaveNotes = () => {
    if (!activeConv) return;
    updateMessengerNotes(activeConv.id, noteText);
  };

  // Tìm khách hàng CRM tương ứng
  const linkedCustomer = customers.find(c => c.id === activeConv?.customerId || c.phone === activeConv?.customerPhone);

  return (
    <div className="h-[calc(100vh-135px)] min-h-[580px] bg-white rounded-3xl border border-black/[0.08] shadow-sm flex overflow-hidden">
      {/* ========================================================
          CỘT TRÁI: DANH SÁCH CUỘC HỘI THOẠI MESSENGER (INBOX LIST)
          ======================================================== */}
      <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 border-r border-black/[0.06] flex-col bg-neutral-50/50 shrink-0 h-full`}>
        {/* Header danh sách */}
        <div className="p-4 border-b border-black/[0.06] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0078FF] via-[#00C6FF] to-[#A824FB] flex items-center justify-center text-white shadow-xs">
                <MessengerIcon size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-neutral-900 leading-tight">Facebook Messenger</h2>
                <p className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Xoăn Media Fanpage Live
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {messengerConversations.filter(c => c.unreadCount > 0).length} mới
            </span>
          </div>

          {/* Ô tìm kiếm khách hàng */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, lớp, trường..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none transition-all"
            />
          </div>

          {/* Tabs bộ lọc nhanh */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                filterTab === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-200/70 border border-black/[0.06]'
              }`}
            >
              Tất cả ({messengerConversations.length})
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                filterTab === 'unread'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-200/70 border border-black/[0.06]'
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setFilterTab('consulting')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                filterTab === 'consulting'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-200/70 border border-black/[0.06]'
              }`}
            >
              Đang tư vấn
            </button>
            <button
              onClick={() => setFilterTab('deposited')}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                filterTab === 'deposited'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:bg-neutral-200/70 border border-black/[0.06]'
              }`}
            >
              Đã cọc
            </button>
          </div>
        </div>

        {/* Danh sách hội thoại cuộn */}
        <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">Không tìm thấy hội thoại phù hợp</p>
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
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'hover:bg-neutral-100/60'
                  }`}
                >
                  {/* Avatar with Facebook Messenger Badge */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.customerAvatar}
                      alt={conv.customerName}
                      className="w-11 h-11 rounded-full object-cover border border-black/[0.08]"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center">
                      <MessengerIcon size={12} />
                    </div>
                  </div>

                  {/* Thông tin preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-xs truncate ${
                          conv.unreadCount > 0 ? 'font-black text-neutral-900' : 'font-bold text-neutral-800'
                        }`}
                      >
                        {conv.customerName}
                      </h4>
                      <span className="text-[10px] text-neutral-400 shrink-0">{conv.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-blue-600 font-semibold truncate mb-1">
                      {conv.customerClass} • {conv.customerSchool}
                    </p>

                    <p
                      className={`text-xs truncate leading-snug ${
                        conv.unreadCount > 0 ? 'font-bold text-neutral-900' : 'text-neutral-500'
                      }`}
                    >
                      {conv.lastMessage}
                    </p>

                    {/* Tag & Stage */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}
                      >
                        {conv.pipelineStage}
                      </span>
                      {conv.tags[0] && (
                        <span className="text-[9px] text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                          {conv.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Huy hiệu tin chưa đọc */}
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================
          CỘT GIỮA: KHUNG CHAT MESSENGER CHÍNH (CHAT CONVERSATION)
          ======================================================== */}
      {activeConv ? (
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-[#F0F2F5]/40 h-full`}>
          {/* Header khung chat */}
          <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-white border-b border-black/[0.06] flex items-center justify-between gap-2 sm:gap-3 shadow-2xs">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Nút quay lại danh sách trên Mobile */}
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden p-2 -ml-1 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition-colors shrink-0"
                title="Quay lại danh sách chat"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeConv.customerAvatar}
                  alt={activeConv.customerName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-black/[0.08]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-neutral-900 truncate">{activeConv.customerName}</h3>
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${
                      STAGE_COLORS[activeConv.pipelineStage]?.bg
                    } ${STAGE_COLORS[activeConv.pipelineStage]?.text} ${
                      STAGE_COLORS[activeConv.pipelineStage]?.border
                    }`}
                  >
                    {activeConv.pipelineStage}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate flex items-center gap-1 sm:gap-1.5">
                  <span className="font-semibold text-neutral-700">{activeConv.customerClass}</span>
                  <span>•</span>
                  <span>{activeConv.customerSchool}</span>
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* Nút mô phỏng khách trả lời (để test/demo) */}
              <div className="relative">
                <button
                  onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Mô phỏng tin nhắn phản hồi từ khách"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden sm:inline">Mô Phỏng Trả Lời</span>
                </button>

                {showSimulateMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-black/[0.08] p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                    <p className="px-2 py-1 font-bold text-neutral-500 text-[10px] uppercase">Chọn kịch bản khách nhắn:</p>
                    <button
                      onClick={() => handleSimulateCustomerReply('Dạ lớp em đã biểu quyết chốt gói BASIC rồi anh nhé!')}
                      className="w-full text-left p-2 hover:bg-blue-50 rounded-xl text-neutral-800 transition-colors"
                    >
                      🎉 "Dạ lớp em chốt gói BASIC rồi anh nhé!"
                    </button>
                    <button
                      onClick={() => handleSimulateCustomerReply('Em vừa chuyển khoản cọc 2 triệu rồi, anh kiểm tra bill giúp em nha!')}
                      className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl text-neutral-800 transition-colors"
                    >
                      💰 "Em vừa ck cọc 2 triệu rồi, anh check bill nha!"
                    </button>
                    <button
                      onClick={() => handleSimulateCustomerReply('Lớp em 40 bạn muốn hỏi thêm trang phục concept Cổ Phục ạ.')}
                      className="w-full text-left p-2 hover:bg-purple-50 rounded-xl text-neutral-800 transition-colors"
                    >
                      👘 "Lớp 40 bạn hỏi thêm concept Cổ Phục."
                    </button>
                  </div>
                )}
              </div>

              {/* Mở link Facebook profile */}
              {activeConv.facebookUrl && (
                <a
                  href={activeConv.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-neutral-100 hover:bg-blue-50 hover:text-blue-600 text-neutral-600 rounded-xl transition-colors"
                  title="Mở Facebook cá nhân của khách"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Gọi điện thoại */}
              {activeConv.customerPhone && (
                <a
                  href={`tel:${activeConv.customerPhone}`}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                  title={`Gọi ${activeConv.customerPhone}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}

              {/* Nút Xem/Ẩn Hồ Sơ CRM (Tách riêng biệt Chat Khách) */}
              <button
                onClick={() => setShowCrmPanel(!showCrmPanel)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                  showCrmPanel
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-black/[0.04]'
                }`}
                title={showCrmPanel ? 'Thu gọn hồ sơ CRM để mở rộng khung chat' : 'Mở xem hồ sơ khách trên CRM'}
              >
                {showCrmPanel ? <PanelRightClose className="w-3.5 h-3.5 text-[#B8F23D]" /> : <PanelRightOpen className="w-3.5 h-3.5 text-neutral-600" />}
                <span className="hidden md:inline">{showCrmPanel ? 'Đóng Hồ Sơ' : 'Hồ Sơ CRM'}</span>
              </button>
            </div>
          </div>

          {/* Vùng tin nhắn (Chat Messages) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Hộp thông báo bắt đầu cuộc trò chuyện Fanpage */}
            <div className="text-center my-3">
              <span className="text-[11px] font-semibold text-neutral-400 bg-white/80 px-3 py-1 rounded-full border border-black/[0.04]">
                💬 Cuộc trò chuyện được đồng bộ từ Fanpage Xoăn Media
              </span>
            </div>

            {activeConv.messages.map(msg => {
              const isSales = msg.sender === 'sales';

              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isSales ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar khách */}
                  {!isSales && (
                    <img
                      src={msg.senderAvatar || activeConv.customerAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-black/[0.08] mb-0.5"
                    />
                  )}

                  {/* Bong bóng tin nhắn */}
                  <div className={`max-w-[75%] sm:max-w-[65%] space-y-1 ${isSales ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isSales
                          ? 'bg-gradient-to-r from-[#0084FF] to-[#0066FF] text-white rounded-br-xs'
                          : 'bg-white text-neutral-900 border border-black/[0.06] rounded-bl-xs'
                      }`}
                    >
                      {/* Đính kèm ảnh nếu có */}
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

                    {/* Timestamp & Trạng thái gửi */}
                    <div
                      className={`flex items-center gap-1 text-[10px] text-neutral-400 px-1 ${
                        isSales ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isSales && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                  </div>

                  {/* Avatar Sales */}
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

          {/* Thanh kịch bản mẫu phản hồi nhanh (Quick Replies) */}
          <div className="px-4 py-2 bg-white border-t border-black/[0.06] overflow-x-auto scrollbar-none flex items-center gap-2">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Kịch bản nhanh:
            </span>
            {quickReplyTemplates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleSendQuickReply(tpl.text)}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-blue-50 hover:text-blue-700 text-neutral-700 rounded-lg text-[11px] font-bold shrink-0 transition-colors border border-black/[0.04]"
                title={tpl.title}
              >
                {tpl.short}
              </button>
            ))}
          </div>

          {/* Thanh nhập tin nhắn (Input Bar) */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-black/[0.06] flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const sampleImages = [
                  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=80'
                ];
                const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                sendMessengerMessage(activeConv.id, '📸 Gửi bạn album mẫu concept kỷ yếu lớp khác đã chụp nhé!', 'sales', [
                  { type: 'image', url: randomImg, name: 'concept_mau_kyyeu.jpg' }
                ]);
              }}
              className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 rounded-xl transition-colors"
              title="Đính kèm ảnh mẫu concept"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder={`Nhắn tin với ${activeConv.customerName} (Nhấn Enter để gửi)...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-neutral-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-2xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
            />

            {inputText.trim() ? (
              <button
                type="submit"
                className="p-2.5 bg-[#0084FF] hover:bg-blue-700 text-white rounded-2xl transition-transform active:scale-95 shadow-xs"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendThumbsUp}
                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-2xl transition-transform active:scale-95"
                title="Gửi nút Like 👍"
              >
                <ThumbsUp className="w-5 h-5 fill-current" />
              </button>
            )}
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-neutral-50 text-neutral-400 text-xs">
          Vui lòng chọn một cuộc trò chuyện để bắt đầu
        </div>
      )}

      {/* ========================================================
          CỘT PHẢI: THÔNG TIN KHÁCH HÀNG CRM 360° (CRM CONTEXT SIDEBAR)
          ======================================================== */}
      {showCrmPanel && activeConv && (
        <>
          {/* Desktop Sidebar Panel */}
          <div className="hidden md:flex w-72 lg:w-80 border-l border-black/[0.06] bg-white flex-col shrink-0 overflow-y-auto p-4 space-y-5 animate-in slide-in-from-right-4 duration-200">
            {/* Card Hồ sơ khách hàng */}
            <div className="text-center space-y-2 pb-4 border-b border-black/[0.06]">
              <img
                src={activeConv.customerAvatar}
                alt={activeConv.customerName}
                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-blue-500 shadow-sm"
              />
              <div>
                <h3 className="text-sm font-black text-neutral-900">{activeConv.customerName}</h3>
                <p className="text-xs text-blue-600 font-bold">
                  {activeConv.customerClass} • {activeConv.customerSchool}
                </p>
              </div>

              {/* Trạng thái Pipeline Dropdown */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Giai đoạn Pipeline
                </label>
                <select
                  value={activeConv.pipelineStage}
                  onChange={e => updateMessengerStage(activeConv.id, e.target.value as PipelineStage)}
                  className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="New Lead">1. New Lead (Mới)</option>
                  <option value="Đã liên hệ">2. Đã liên hệ</option>
                  <option value="Đang tư vấn">3. Đang tư vấn</option>
                  <option value="Đã gửi báo giá">4. Đã gửi báo giá</option>
                  <option value="Đang thương lượng">5. Đang thương lượng</option>
                  <option value="Đã đặt cọc">6. Đã đặt cọc</option>
                  <option value="Đã Booking">7. Đã Booking</option>
                  <option value="Lost">Khách từ chối (Lost)</option>
                </select>
              </div>
            </div>

            {/* Chi tiết liên hệ */}
            <div className="space-y-2.5 text-xs">
              <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Thông Tin Chi Tiết
              </h4>

              <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.04] space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-500">Số điện thoại:</span>
                  <span className="font-bold text-neutral-900">{activeConv.customerPhone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-500">Lớp:</span>
                  <span className="font-bold text-neutral-900">{activeConv.customerClass || 'Chưa rõ'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-500">Trường:</span>
                  <span className="font-bold text-neutral-900 truncate max-w-[150px]">{activeConv.customerSchool}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-500">Sales phụ trách:</span>
                  <span className="font-bold text-emerald-700">{activeConv.assignedSalesName || currentUser.name}</span>
                </div>
              </div>
            </div>

            {/* Thao tác CRM nhanh (Action buttons) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Thao Tác Nhanh
              </h4>

              <button
                onClick={() => {
                  setActiveTab('pipeline');
                }}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border border-blue-200"
              >
                <span>Xem trên Customer Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('bookings');
                }}
                className="w-full px-3 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-900 rounded-xl text-xs font-black flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>Tạo Booking / Khóa Lịch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {linkedCustomer && (
                <button
                  onClick={() => {
                    setSelectedCustomerId(linkedCustomer.id);
                    setActiveTab('customers');
                  }}
                  className="w-full px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>Mở Hồ Sơ 360° Đầy Đủ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ghi chú nội bộ Sales */}
            <div className="space-y-2 pt-2 border-t border-black/[0.06]">
              <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-600" /> Ghi Chú Sales
              </h4>
              <textarea
                rows={3}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Ghi chú yêu cầu concept, lưu ý về lớp..."
                className="w-full p-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-400 resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Lưu Ghi Chú
              </button>
            </div>
          </div>

          {/* Mobile Off-canvas Slide Drawer */}
          <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-[85vw] max-w-sm bg-white h-full overflow-y-auto p-4 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <h3 className="font-black text-sm text-neutral-900">Hồ Sơ Khách Hàng CRM</h3>
                <button
                  onClick={() => setShowCrmPanel(false)}
                  className="p-1.5 rounded-xl hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                  title="Đóng hồ sơ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Card Hồ sơ khách hàng */}
              <div className="text-center space-y-2 pb-4 border-b border-black/[0.06]">
                <img
                  src={activeConv.customerAvatar}
                  alt={activeConv.customerName}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-blue-500 shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-black text-neutral-900">{activeConv.customerName}</h3>
                  <p className="text-xs text-blue-600 font-bold">
                    {activeConv.customerClass} • {activeConv.customerSchool}
                  </p>
                </div>

                {/* Trạng thái Pipeline Dropdown */}
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    Giai đoạn Pipeline
                  </label>
                  <select
                    value={activeConv.pipelineStage}
                    onChange={e => updateMessengerStage(activeConv.id, e.target.value as PipelineStage)}
                    className="w-full px-3 py-1.5 bg-neutral-50 border border-black/[0.1] rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="New Lead">1. New Lead (Mới)</option>
                    <option value="Đã liên hệ">2. Đã liên hệ</option>
                    <option value="Đang tư vấn">3. Đang tư vấn</option>
                    <option value="Đã gửi báo giá">4. Đã gửi báo giá</option>
                    <option value="Đang thương lượng">5. Đang thương lượng</option>
                    <option value="Đã đặt cọc">6. Đã đặt cọc</option>
                    <option value="Đã Booking">7. Đã Booking</option>
                    <option value="Lost">Khách từ chối (Lost)</option>
                  </select>
                </div>
              </div>

              {/* Chi tiết liên hệ */}
              <div className="space-y-2.5 text-xs">
                <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Thông Tin Chi Tiết
                </h4>

                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.04] space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-neutral-500">Số điện thoại:</span>
                    <span className="font-bold text-neutral-900">{activeConv.customerPhone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-neutral-500">Lớp:</span>
                    <span className="font-bold text-neutral-900">{activeConv.customerClass || 'Chưa rõ'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-neutral-500">Trường:</span>
                    <span className="font-bold text-neutral-900 truncate max-w-[150px]">{activeConv.customerSchool}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-neutral-500">Sales phụ trách:</span>
                    <span className="font-bold text-emerald-700">{activeConv.assignedSalesName || currentUser.name}</span>
                  </div>
                </div>
              </div>

              {/* Thao tác CRM nhanh (Action buttons) */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Thao Tác Nhanh
                </h4>

                <button
                  onClick={() => {
                    setShowCrmPanel(false);
                    setActiveTab('pipeline');
                  }}
                  className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border border-blue-200"
                >
                  <span>Xem trên Customer Pipeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setShowCrmPanel(false);
                    setActiveTab('bookings');
                  }}
                  className="w-full px-3 py-2 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-900 rounded-xl text-xs font-black flex items-center justify-between transition-colors shadow-2xs"
                >
                  <span>Tạo Booking / Khóa Lịch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {linkedCustomer && (
                  <button
                    onClick={() => {
                      setShowCrmPanel(false);
                      setSelectedCustomerId(linkedCustomer.id);
                      setActiveTab('customers');
                    }}
                    className="w-full px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span>Mở Hồ Sơ 360° Đầy Đủ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Ghi chú nội bộ Sales */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <h4 className="text-[11px] font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-600" /> Ghi Chú Sales
                </h4>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Ghi chú yêu cầu concept, lưu ý về lớp..."
                  className="w-full p-2.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-blue-400 resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Lưu Ghi Chú
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
