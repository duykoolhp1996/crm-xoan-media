import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRM ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('crm_xoan_active_app');
      localStorage.removeItem('xoan_crm_seen_update_v127');
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(name => caches.delete(name)));
      }
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0C0E12] text-white p-6 font-sans">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-white">Đã Xảy Ra Sự Cố Hiển Thị</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hệ thống CRM Xoăn Media gặp sự cố khi tải trang hoặc dữ liệu phiên làm việc cũ bị xung đột. Vui lòng bấm làm mới để tải lại.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-rose-400 truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-[#B8F23D] hover:bg-[#a8e22d] text-neutral-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#B8F23D]/10"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải Lại Trang (Reload)</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Xóa Cache & Đăng Nhập Lại</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
