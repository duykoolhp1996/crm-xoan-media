import React, { useState, useRef } from 'react';
import { Upload, Camera, Link as LinkIcon, Loader2, Check, RefreshCw } from 'lucide-react';
import { uploadAvatarFile } from '../../services/uploadService';

interface AvatarUploaderProps {
  currentAvatar: string;
  onAvatarChange: (newUrl: string) => void;
  presetAvatars?: string[];
  userId?: string;
  label?: string;
  className?: string;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatar,
  onAvatarChange,
  presetAvatars = [],
  userId,
  label = 'Ảnh Đại Diện (Avatar)',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const isImageByMime = file.type && file.type.startsWith('image/');
    const isImageByName = /\.(jpe?g|png|webp|gif|avif|svg|heic|heif)$/i.test(file.name);
    if (!isImageByMime && !isImageByName) {
      setUploadMessage({ type: 'error', text: 'Vui lòng chọn đúng file hình ảnh (JPG, PNG, WebP)!' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    const result = await uploadAvatarFile(file, userId);
    setIsUploading(false);

    if (result.success && result.url) {
      onAvatarChange(result.url);
      setUploadMessage({ type: 'success', text: result.message });
      setTimeout(() => setUploadMessage(null), 3000);
    } else {
      setUploadMessage({ type: 'error', text: result.message || 'Tải ảnh thất bại!' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset value để có thể chọn lại cùng 1 file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onAvatarChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
      setUploadMessage({ type: 'success', text: 'Đã áp dụng link ảnh thành công!' });
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label tiêu đề */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-orange-500" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Ẩn ô link' : 'Dán link URL'}</span>
        </button>
      </div>

      {/* Main Uploader Box */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3 bg-neutral-50/80 hover:bg-neutral-50 border border-black/[0.08] rounded-2xl transition-all">
        {/* Preview Avatar Image */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-neutral-900 shadow-sm bg-neutral-200">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <Camera className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Quick upload trigger overlay */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            title="Nhấp để đổi ảnh đại diện"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls & Dropzone */}
        <div className="flex-1 w-full space-y-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-2.5 flex items-center justify-between gap-2 transition-all ${
              isDragging
                ? 'border-[#B8F23D] bg-[#B8F23D]/10'
                : 'border-neutral-300 hover:border-neutral-400 bg-white'
            }`}
          >
            <div className="text-[11px] text-neutral-600 truncate">
              <span className="font-semibold text-neutral-900">Kéo thả ảnh</span> hoặc chọn từ máy tính/điện thoại
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-[#B8F23D] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8F23D]" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#B8F23D]" />
                  <span>Tải Ảnh Lên</span>
                </>
              )}
            </button>

            {/* Hidden Input File */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {/* Thông báo kết quả tải ảnh */}
          {uploadMessage && (
            <div
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in ${
                uploadMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {uploadMessage.type === 'success' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* URL Input Box (Nếu bấm dán link) */}
      {showUrlInput && (
        <div className="flex items-center gap-1.5 p-1 bg-white border border-black/[0.08] rounded-xl animate-in fade-in">
          <input
            type="url"
            placeholder="Dán link URL ảnh (https://...)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyUrl();
              }
            }}
            className="flex-1 px-2.5 py-1 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1 bg-neutral-900 text-[#B8F23D] rounded-lg text-xs font-bold cursor-pointer hover:bg-neutral-800"
          >
            Áp Dụng
          </button>
        </div>
      )}

      {/* Preset Avatars Selection (Ảnh mẫu) */}
      {presetAvatars.length > 0 && (
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-semibold text-neutral-400">Hoặc chọn ảnh mẫu nhanh:</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {presetAvatars.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAvatarChange(url)}
                className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentAvatar === url
                    ? 'border-[#B8F23D] ring-2 ring-neutral-900 scale-105 shadow-xs'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                }`}
                title={`Ảnh mẫu ${i + 1}`}
              >
                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
