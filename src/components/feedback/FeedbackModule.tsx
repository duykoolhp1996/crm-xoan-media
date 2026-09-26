import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassFeedback, ClassMoment } from '../../types';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  Maximize2,
  X,
  Star,
  Camera,
  Plus,
  Sparkles,
  Share2,
  Edit3,
  ThumbsUp,
  Filter,
  CheckCircle2,
  ChevronRight,
  School,
  ExternalLink,
  SquarePen,
  Upload,
  UserCheck,
  Search,
  Folder,
  Grid,
  Trash2
} from 'lucide-react';
import { GlassActionMenu } from '../common/GlassActionMenu';

interface ThreadsPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  date: string;
  content: string;
  images: string[];
  layout: 'double' | 'single-wide';
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  isLiked?: boolean;
  subHandle: string;
  subDescription: string;
  classTag: string;
}

export const FeedbackModule: React.FC = () => {
  const { feedbacks, addFeedback, updateFeedbackStatus, customers, photographers } = useApp();

  const [activeTab, setActiveTab] = useState<'threads_feed' | 'crm_reviews'>('threads_feed');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isXuXuChatOpen, setIsXuXuChatOpen] = useState(false);
  const [isXuXuBubbleVisible, setIsXuXuBubbleVisible] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Danh sách các bài viết Khoảnh khắc & Feedback chuẩn phong cách Threads
  const [posts, setPosts] = useState<ThreadsPost[]>([]);

  // Form thêm feedback mới
  const [newFeedbackForm, setNewFeedbackForm] = useState({
    customerId: customers[0]?.id || '',
    rating: 5,
    comment: '',
    reviewerRole: 'Lớp trưởng',
    photographerMentioned: photographers[0]?.fullName || '',
    channel: 'Zalo' as const
  });

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  const handleCreateFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === newFeedbackForm.customerId);
    if (!cust || !newFeedbackForm.comment) return;

    addFeedback({
      customerId: cust.id,
      customerName: cust.name,
      schoolName: cust.schoolName,
      className: cust.className,
      rating: Number(newFeedbackForm.rating),
      comment: newFeedbackForm.comment,
      reviewerRole: newFeedbackForm.reviewerRole,
      photographerMentioned: newFeedbackForm.photographerMentioned ? [newFeedbackForm.photographerMentioned] : [],
      channel: newFeedbackForm.channel,
      status: 'featured'
    });

    setIsFeedbackModalOpen(false);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 lg:p-8 rounded-3xl space-y-8 relative text-neutral-900 font-sans selection:bg-[#B8F23D] selection:text-neutral-950">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Khoảnh khắc & Feedback từ các lớp
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-normal max-w-2xl leading-relaxed">
            Những chia sẻ, khoảnh khắc xúc động và phản hồi chân thực từ các lớp trưởng sau buổi chụp cùng Xoăn Media.
          </p>
        </div>

        {/* View Switcher & Action & Apple Pill Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Apple Toolbar Icons Pill Bar */}
          <div className="flex items-center gap-1.5 bg-neutral-100 border border-black/[0.06] p-1.5 rounded-full shadow-xs">
            {/* 1. Collaborator Icon */}
            <button
              onClick={() => alert('Thành viên cộng tác: Team Xoăn Media & Đại diện các lớp')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all shadow-xs"
              title="Người cộng tác"
            >
              <UserCheck className="w-4 h-4" />
            </button>

            {/* 2. Share Icon */}
            <button
              onClick={() => alert('Đã sao chép liên kết chia sẻ Khoảnh khắc & Feedback!')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all shadow-xs"
              title="Chia sẻ bộ ảnh"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* 3. Three Dots Action Menu (Apple Glassmorphism Popover Menu) */}
            <GlassActionMenu
              align="right"
              triggerButtonClass="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all shadow-xs"
              onScan={() => {
                if (posts[0]?.images[0]) setSelectedImage(posts[0].images[0]);
              }}
              onPin={() => alert('Đã ghim khoảnh khắc kỷ yếu lên đầu bảng tin!')}
              onLock={() => alert('Đã khóa bảo mật album kỷ yếu!')}
              items={[
                {
                  id: 'find',
                  label: 'Tìm trong lớp (Find in Note)',
                  icon: Search,
                  onClick: () => {
                    const q = prompt('Nhập tên lớp hoặc trường để tìm kiếm:');
                    if (q) setSearchQuery(q);
                  }
                },
                {
                  id: 'move',
                  label: 'Chuyển Album (Move Note)',
                  icon: Folder,
                  onClick: () => alert('Đã chuyển vào thư mục Kỷ Yếu 2024-2025.')
                },
                {
                  id: 'grid',
                  label: 'Bố cục & Lưới (Lines & Grids)',
                  icon: Grid,
                  onClick: () => setActiveTab(activeTab === 'threads_feed' ? 'crm_reviews' : 'threads_feed')
                },
                {
                  id: 'delete',
                  label: 'Xóa bài viết (Delete)',
                  icon: Trash2,
                  danger: true,
                  onClick: () => alert('Xác nhận xóa bài viết khỏi bảng tin.')
                }
              ]}
            />

            {/* 4. Edit / Write New Icon */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all shadow-xs"
              title="Tạo chia sẻ mới"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>

          <div className="flex bg-neutral-100 p-1 rounded-2xl text-xs font-semibold border border-black/[0.06]">
            <button
              onClick={() => setActiveTab('threads_feed')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'threads_feed'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Threads Social View
            </button>
            <button
              onClick={() => setActiveTab('crm_reviews')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'crm_reviews'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Quản Lý Review CRM ({feedbacks.length})
            </button>
          </div>

          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm Phản Hồi
          </button>
        </div>
      </div>

      {/* CHẾ ĐỘ 1: THREADS SOCIAL FEED (CHUẨN 100% GIAO DIỆN BẠN YÊU CẦU) */}
      {activeTab === 'threads_feed' && (
        posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.08] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500 mb-3 font-bold text-lg">
              @
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Chưa có bài viết khoảnh khắc nào</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Giao diện Threads feed sẽ hiển thị các câu chuyện hậu trường và khoảnh khắc kỷ yếu khi bạn chia sẻ bài viết đầu tiên.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {posts.map((post) => (
            <div key={post.id} className="flex flex-col space-y-3 group">
              {/* Card Nền Trắng Kiểu Threads */}
              <div className="bg-white text-neutral-900 rounded-2xl p-5 shadow-2xl border border-neutral-200/80 flex flex-col justify-between space-y-4 hover:shadow-orange-500/5 transition-all">
                {/* Card Header: Avatar, Name, Handle, Date, Logo Threads & Apple Glass Action Menu */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200"
                      />
                      <div className="leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-neutral-900">{post.authorHandle}</span>
                          <span className="text-[11px] text-neutral-400 font-normal">@ {post.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Logo Threads @ và Nút GlassActionMenu Chuẩn Apple */}
                    <div className="flex items-center gap-2 text-neutral-400">
                      <div className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center text-[10px] font-bold text-neutral-800">
                        @
                      </div>

                      {/* Glass Action Menu Trên Từng Card */}
                      <GlassActionMenu
                        align="right"
                        triggerButtonClass="w-7 h-7 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                        onScan={() => setSelectedImage(post.images[0])}
                        onPin={() => alert(`Đã ghim bài viết của ${post.classTag}!`)}
                        onLock={() => alert(`Đã khóa duyệt bài viết ${post.classTag}!`)}
                        items={[
                          {
                            id: 'search',
                            label: 'Find in Note (Tìm kiếm)',
                            icon: Search,
                            onClick: () => alert(`Tìm chi tiết thông tin lớp: ${post.classTag}`)
                          },
                          {
                            id: 'move',
                            label: 'Move Note (Chuyển Album)',
                            icon: Folder,
                            onClick: () => alert(`Chuyển ${post.classTag} vào Album Kỷ Yếu Hà Nội`)
                          },
                          {
                            id: 'grid',
                            label: 'Lines & Grids (Đổi Bố Cục)',
                            icon: Grid,
                            onClick: () => alert('Đã chuyển đổi tỉ lệ khung hình 16:9 / 4:3')
                          },
                          {
                            id: 'delete',
                            label: 'Delete (Ẩn Bài Viết)',
                            icon: Trash2,
                            danger: true,
                            onClick: () => {
                              if (confirm(`Bạn có chắc muốn ẩn bài viết của ${post.classTag}?`)) {
                                setPosts(posts.filter(p => p.id !== post.id));
                              }
                            }
                          }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Caption Lời Nhận Xét */}
                  <p className="mt-3 text-xs text-neutral-900 font-normal leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Media Container: Ảnh Đôi Hoặc Ảnh Rộng */}
                <div className="relative">
                  {post.layout === 'double' ? (
                    <div className="grid grid-cols-2 gap-2 h-72 rounded-xl overflow-hidden">
                      {post.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedImage(img)}
                          className="relative h-full overflow-hidden cursor-pointer group/img bg-neutral-100"
                        >
                          <img
                            src={img}
                            alt={`Preview ${idx}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => setSelectedImage(post.images[0])}
                      className="relative h-72 rounded-xl overflow-hidden cursor-pointer group/img bg-neutral-100"
                    >
                      <img
                        src={post.images[0]}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>

                {/* Engagement Bar: Thả Tim, Comment, Repost, Share, Nút Phóng To */}
                <div className="pt-2 flex items-center justify-between text-neutral-700 text-xs">
                  <div className="flex items-center gap-4">
                    {/* Thả tim */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          post.isLiked ? 'text-rose-600 fill-rose-600' : 'text-rose-500 fill-rose-500'
                        }`}
                      />
                      <span className="text-[11px] font-bold text-neutral-800">
                        {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(post.likes % 1000 === 0 ? 0 : 1)}K` : post.likes}
                      </span>
                    </button>

                    {/* Comment */}
                    <div className="flex items-center gap-1.5 hover:text-neutral-900 cursor-pointer">
                      <MessageCircle className="w-4 h-4 text-neutral-500" />
                      <span className="text-[11px] text-neutral-600">{post.comments}</span>
                    </div>

                    {/* Repost */}
                    <div className="flex items-center gap-1.5 hover:text-neutral-900 cursor-pointer">
                      <Repeat2 className="w-4 h-4 text-neutral-500" />
                      <span className="text-[11px] text-neutral-600">{post.reposts}</span>
                    </div>

                    {/* Share */}
                    <div className="flex items-center gap-1.5 hover:text-neutral-900 cursor-pointer">
                      <Send className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-[11px] text-neutral-600">{post.shares}</span>
                    </div>
                  </div>

                  {/* Nút Phóng To */}
                  <button
                    onClick={() => setSelectedImage(post.images[0])}
                    className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    Phóng to ↗
                  </button>
                </div>
              </div>

              {/* Dòng Chú Thích Bên Dưới Card (Subtext) */}
              <div className="px-1 text-[11px] text-neutral-400 space-y-0.5">
                <p className="font-semibold text-neutral-300">{post.subHandle}</p>
                <p className="text-neutral-500 leading-snug">{post.subDescription}</p>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* CHẾ ĐỘ 2: QUẢN LÝ REVIEW TRONG HỆ THỐNG CRM */}
      {activeTab === 'crm_reviews' && (
        feedbacks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.08] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-500 mb-3">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Chưa có đánh giá nào từ các lớp</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Bấm nút "Thêm Phản Hồi" ở góc trên bên phải để ghi nhận review và lời khen của lớp dành cho ekip chụp!
            </p>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="mt-4 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Thêm Đánh Giá Mới
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white border border-black/[0.08] rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-neutral-900">{fb.className}</span>
                          <span className="text-[10px] bg-neutral-100 text-neutral-700 border border-black/[0.06] px-2.5 py-0.5 rounded-full font-semibold">
                            {fb.channel}
                          </span>
                          {fb.status === 'featured' && (
                            <span className="text-[10px] font-bold bg-[#B8F23D]/30 text-neutral-950 border border-[#B8F23D]/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              ★ Ghim Website
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 font-medium">{fb.schoolName}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {fb.rating}.0
                      </div>
                    </div>

                    <p className="mt-3.5 text-xs text-neutral-700 bg-neutral-50 p-4 rounded-2xl border border-black/[0.05] italic leading-relaxed">
                      "{fb.comment}"
                    </p>

                    {fb.photographerMentioned && fb.photographerMentioned.length > 0 && (
                      <p className="text-[11px] text-neutral-500 mt-2.5 font-medium">
                        📷 Thợ được khen: <span className="text-neutral-900 font-bold">{fb.photographerMentioned.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-500">
                    <span>Gửi bởi: <strong className="text-neutral-900">{fb.customerName}</strong> ({fb.reviewerRole})</span>
                    <button
                      onClick={() => updateFeedbackStatus(fb.id, fb.status === 'featured' ? 'approved' : 'featured')}
                      className={`font-bold transition-colors ${
                        fb.status === 'featured'
                          ? 'text-rose-600 hover:text-rose-700'
                          : 'text-neutral-900 hover:text-emerald-700'
                      }`}
                    >
                      {fb.status === 'featured' ? 'Bỏ Ghim' : 'Ghim Lên Showcase'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* LIGHTBOX MODAL PHÓNG TO ẢNH */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 p-2 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Enlarged moment"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150"
          />
        </div>
      )}

      {/* WIDGET TRỢ LÝ ẢO 🐱 XU XU (GÓC PHẢI BÊN DƯỚI CHUẨN NHƯ TRONG HÌNH) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none">
        {/* Bong bóng chat gợi ý tư vấn */}
        {isXuXuBubbleVisible && (
          <div className="bg-[#1f1f1f] text-neutral-100 border border-neutral-700/80 px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="font-medium">
              👋 Cần <strong className="text-amber-400">Xu Xu</strong> tư vấn gói chụp cho lớp không?
            </span>
            <button
              onClick={() => setIsXuXuBubbleVisible(false)}
              className="text-neutral-400 hover:text-white ml-1 p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Nút Tròn Avatar Mèo Xu Xu Có Đèn Xanh */}
        <div className="relative">
          <button
            onClick={() => setIsXuXuChatOpen(!isXuXuChatOpen)}
            className="w-13 h-13 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center text-2xl shadow-xl shadow-amber-500/25 hover:scale-110 active:scale-95 transition-transform"
            title="Trợ lý ảo 🐱 Xu Xu"
          >
            🐱
          </button>
          {/* Chấm xanh Online */}
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-neutral-900 rounded-full animate-pulse"></span>
        </div>
      </div>

      {/* Cửa sổ tương tác nhanh với 🐱 Xu Xu khi click vào avatar */}
      {isXuXuChatOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-80 bg-white border border-black/[0.08] rounded-2xl shadow-2xl p-4 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150 text-neutral-900">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-neutral-900 text-[#B8F23D] flex items-center justify-center text-sm font-bold">
                🐱
              </div>
              <div>
                <p className="font-bold text-neutral-900 text-xs">Trợ Lý Ảo Xu Xu</p>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">● Sẵn sàng hỗ trợ tư vấn</p>
              </div>
            </div>
            <button
              onClick={() => setIsXuXuChatOpen(false)}
              className="text-neutral-400 hover:text-neutral-900 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-black/[0.06] text-neutral-700 text-[11px] leading-relaxed">
            Dạ em chào anh/chị! 🐱 <strong>Xu Xu</strong> có thể giúp gửi bảng báo giá kỷ yếu Standard/Premium, kiểm tra lịch trống của thợ hoặc trích xuất feedback đẹp nhất từ các trường để gửi lớp tham khảo ngay ạ!
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                alert('🐱 Xu Xu: Đã sao chép kịch bản tư vấn và link bộ ảnh concept để gửi Zalo cho lớp!');
                setIsXuXuChatOpen(false);
              }}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-semibold text-[11px] text-left px-3 transition-colors"
            >
              👉 Lấy link bộ ảnh mẫu 12A1 Chu Văn An
            </button>
            <button
              onClick={() => {
                alert('🐱 Xu Xu: Đang kiểm tra lịch thợ ảnh Trần Minh Tuấn và Alex Đức Anh trong tuần này.');
                setIsXuXuChatOpen(false);
              }}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-semibold text-[11px] text-left px-3 transition-colors"
            >
              👉 Kiểm tra thợ chụp rảnh cuối tuần
            </button>
          </div>
        </div>
      )}

      {/* MODAL THÊM FEEDBACK MỚI */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-black/[0.08] text-neutral-900 rounded-3xl p-6 w-full max-w-md space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-black/[0.06] pb-3">
              <h3 className="font-bold text-sm text-neutral-900">Thêm Feedback & Cảm Xúc Từ Lớp</h3>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFeedbackSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-neutral-700">Chọn Khách Hàng / Lớp</label>
                {customers.length === 0 ? (
                  <p className="mt-1 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                    ⚠️ Chưa có lớp nào trong hệ thống. Vui lòng tạo lớp mới trước khi thêm phản hồi!
                  </p>
                ) : (
                  <select
                    value={newFeedbackForm.customerId}
                    onChange={e => setNewFeedbackForm({ ...newFeedbackForm, customerId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.className} - {c.schoolName} ({c.name})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700">Đánh Giá Sao</label>
                  <select
                    value={newFeedbackForm.rating}
                    onChange={e => setNewFeedbackForm({ ...newFeedbackForm, rating: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-amber-500 font-bold focus:bg-white focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Sao)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Sao)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700">Kênh Gửi</label>
                  <select
                    value={newFeedbackForm.channel}
                    onChange={e => setNewFeedbackForm({ ...newFeedbackForm, channel: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Zalo">Zalo</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google Review">Google Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Thợ Ảnh Được Lớp Khen</label>
                <select
                  value={newFeedbackForm.photographerMentioned}
                  onChange={e => setNewFeedbackForm({ ...newFeedbackForm, photographerMentioned: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 focus:bg-white focus:outline-none"
                >
                  {photographers.map(p => (
                    <option key={p.id} value={p.fullName}>{p.fullName} ({p.photographerType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700">Nội Dung Chia Sẻ Của Lớp *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập cảm nhận của lớp trưởng/học sinh..."
                  value={newFeedbackForm.comment}
                  onChange={e => setNewFeedbackForm({ ...newFeedbackForm, comment: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 border border-black/[0.08] rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                />
              </div>

              <div className="pt-3 border-t border-black/[0.06] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={customers.length === 0}
                  className={`px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all ${
                    customers.length === 0
                      ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-[#B8F23D] active:scale-95'
                  }`}
                >
                  Lưu Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
