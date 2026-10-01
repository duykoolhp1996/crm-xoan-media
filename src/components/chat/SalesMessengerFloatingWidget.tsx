import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessengerIcon } from './MessengerIcon';
import { quickReplyTemplates } from '../../data/mockMessengerData';
import {
  X,
  Minus,
  Maximize2,
  Send,
  ThumbsUp,
  Image as ImageIcon,
  CheckCheck,
  ChevronDown,
  Sparkles,
  Bot,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const SalesMessengerFloatingWidget: React.FC = () => {
  const {
    currentUser,
    currentRole,
    messengerConversations,
    activeConversationId,
    setActiveConversationId,
    sendMessengerMessage,
    markMessengerAsRead,
    unreadMessengerCount,
    activeTab,
    setActiveTab
  } = useApp();

  // Chỉ hiển thị ở các tài khoản sales hoặc admin / manager
  const isSalesAccount = currentUser?.role === 'sales' || currentRole === 'sales' || currentRole === 'admin' || currentRole === 'manager';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showConvDropdown, setShowConvDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = messengerConversations.find(c => c.id === activeConversationId) || messengerConversations[0];

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && activeConv && activeConv.unreadCount > 0) {
      markMessengerAsRead(activeConv.id);
    }
  }, [isOpen, activeConv?.id]);

  if (!isSalesAccount || activeTab === 'chat-messenger') return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessengerMessage(activeConv.id, inputText.trim(), 'sales');
    setInputText('');
  };

  const handleSendThumbsUp = () => {
    if (!activeConv) return;
    sendMessengerMessage(activeConv.id, '👍', 'sales');
  };

  const handleQuickReply = (text: string) => {
    if (!activeConv) return;
    sendMessengerMessage(activeConv.id, text, 'sales');
  };

  // Mở toàn màn hình
  const handleOpenFullScreen = () => {
    setIsOpen(false);
    setActiveTab('chat-messenger');
  };

  return (
    <div className="hidden lg:flex fixed bottom-5 right-5 z-40 flex-col items-end select-none">
      {/* ========================================================
          CỬA SỔ KHUNG CHAT NỔI (FLOATING CHAT WINDOW)
          ======================================================== */}
      {isOpen && (
        <div
          className={`w-[calc(100vw-1.5rem)] sm:w-[390px] max-w-[390px] bg-white rounded-3xl shadow-2xl border border-black/[0.1] overflow-hidden flex flex-col transition-all duration-200 mb-3 animate-in fade-in slide-in-from-bottom-5 ${
            isMinimized ? 'h-14' : 'h-[70vh] sm:h-[520px]'
          }`}
        >
          {/* Header thanh lịch với dải màu gradient Facebook Messenger */}
          <div className="p-3 bg-gradient-to-r from-[#0084FF] via-[#0099FF] to-[#A824FB] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0 relative">
              {/* Avatar khách và nút chọn hội thoại */}
              <button
                onClick={() => setShowConvDropdown(!showConvDropdown)}
                className="flex items-center gap-2 hover:bg-white/10 p-1 -ml-1 rounded-xl transition-colors text-left min-w-0"
                title="Đổi cuộc trò chuyện"
              >
                <div className="relative shrink-0">
                  <img
                    src={activeConv?.customerAvatar}
                    alt={activeConv?.customerName}
                    className="w-8 h-8 rounded-full object-cover border border-white/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black truncate">{activeConv?.customerName || 'Khách Hàng'}</span>
                    <ChevronDown className="w-3 h-3 shrink-0 opacity-80" />
                  </div>
                  <p className="text-[10px] text-white/80 truncate">
                    {activeConv?.customerClass} • {activeConv?.pipelineStage}
                  </p>
                </div>
              </button>

              {/* Dropdown danh sách hội thoại */}
              {showConvDropdown && (
                <div className="absolute top-11 left-0 w-64 bg-white text-neutral-900 rounded-2xl shadow-2xl border border-black/[0.1] p-1.5 z-50 divide-y divide-black/[0.04] max-h-60 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase">
                    Chọn học sinh / khách hàng:
                  </div>
                  {messengerConversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveConversationId(c.id);
                        setShowConvDropdown(false);
                      }}
                      className={`w-full p-2 flex items-center gap-2 rounded-xl text-left hover:bg-neutral-100 transition-colors ${
                        c.id === activeConv?.id ? 'bg-blue-50 text-blue-800' : ''
                      }`}
                    >
                      <img src={c.customerAvatar} alt={c.customerName} className="w-7 h-7 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold truncate">{c.customerName}</span>
                          {c.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-500 truncate block">{c.customerClass}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Phóng to toàn màn hình */}
              <button
                onClick={handleOpenFullScreen}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-white/90 hover:text-white"
                title="Mở toàn màn hình"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Thu nhỏ / Mở rộng */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-white/90 hover:text-white"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Đóng khung chat */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors text-white/90 hover:text-white"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body tin nhắn nếu không thu nhỏ */}
          {!isMinimized && (
            activeConv ? (
              <>
              {/* Vùng tin nhắn */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#F0F2F5]/30">
                <div className="text-center my-1">
                  <span className="text-[10px] text-neutral-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-black/[0.04]">
                    Facebook Messenger • Xoăn Media
                  </span>
                </div>

                {activeConv.messages.map(msg => {
                  const isSales = msg.sender === 'sales';
                  return (
                    <div key={msg.id} className={`flex items-end gap-1.5 ${isSales ? 'justify-end' : 'justify-start'}`}>
                      {!isSales && (
                        <img
                          src={activeConv.customerAvatar}
                          alt={msg.senderName}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5 border border-black/[0.08]"
                        />
                      )}
                      <div className={`max-w-[78%] space-y-0.5 ${isSales ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isSales
                              ? 'bg-gradient-to-r from-[#0084FF] to-[#0066FF] text-white rounded-br-xs'
                              : 'bg-white text-neutral-900 border border-black/[0.06] rounded-bl-xs'
                          }`}
                        >
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mb-1.5 space-y-1">
                              {msg.attachments.map((att, i) => (
                                <img
                                  key={i}
                                  src={att.url}
                                  alt="attachment"
                                  className="rounded-lg max-h-36 w-full object-cover"
                                />
                              ))}
                            </div>
                          )}
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-[9px] text-neutral-400 px-1 ${
                            isSales ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isSales && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies bar */}
              <div className="px-3 py-1.5 bg-white border-t border-black/[0.06] overflow-x-auto scrollbar-none flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                {quickReplyTemplates.slice(0, 3).map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleQuickReply(tpl.text)}
                    className="px-2 py-0.5 bg-neutral-100 hover:bg-blue-50 hover:text-blue-700 text-neutral-700 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                  >
                    {tpl.short}
                  </button>
                ))}
              </div>

              {/* Form gõ tin nhắn */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-black/[0.06] flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Nhắn tin Messenger..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-100 focus:bg-white border border-transparent focus:border-blue-400 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
                />

                {inputText.trim() ? (
                  <button
                    type="submit"
                    className="p-2 bg-[#0084FF] hover:bg-blue-700 text-white rounded-xl transition-transform active:scale-95 shadow-xs"
                    title="Gửi"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendThumbsUp}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-transform active:scale-95"
                    title="Gửi nút Like 👍"
                  >
                    <ThumbsUp className="w-4 h-4 fill-current" />
                  </button>
                )}
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400 bg-neutral-50/50">
              <MessageCircle className="w-10 h-10 text-neutral-300 mb-2" />
              <p className="text-xs font-bold text-neutral-700">Chưa có cuộc trò chuyện nào</p>
              <p className="text-[11px] text-neutral-400 mt-1 mb-3">Mở hộp thư để đồng bộ từ Facebook Fanpage</p>
              <button
                onClick={handleOpenFullScreen}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Mở Toàn Màn Hình
              </button>
            </div>
          )
        )}
        </div>
      )}

      {/* ========================================================
          NÚT TRÒN NỔI MESSENGER (FLOATING ACTION BUTTON)
          ======================================================== */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#0078FF] via-[#00C6FF] to-[#A824FB] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white"
        title="Chat Facebook Messenger (Tài khoản Sales)"
      >
        <MessengerIcon size={30} className="filter drop-shadow-xs group-hover:rotate-6 transition-transform" />

        {/* Badge số tin chưa đọc */}
        {unreadMessengerCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
            {unreadMessengerCount}
          </span>
        )}

        {/* Tooltip khi rê chuột */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-neutral-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
          💬 Facebook Messenger Sales
        </span>
      </button>
    </div>
  );
};
