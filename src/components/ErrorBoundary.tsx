import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.removeItem('yt_downloader_history_v1');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.pathname;
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-heading font-bold text-white mb-2">
              कुछ गलत हुआ (Something went wrong)
            </h2>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              ऐप में अस्थायी समस्या आई। आप नीचे दिए गए बटन से पेज रिफ्रेश कर सकते हैं या डेटा रीसेट कर सकते हैं।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पेज रीफ्रेश करें (Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-neutral-400" />
                <span>कैश साफ़ करें (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
