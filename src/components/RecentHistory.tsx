import React from 'react';
import { History, Trash2, ArrowRight, Video, Instagram, Youtube } from 'lucide-react';
import { HistoryItem, Language } from '../types';
import { translations } from '../translations';

interface RecentHistoryProps {
  history: HistoryItem[];
  lang: Language;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
  history,
  lang,
  onSelect,
  onClear,
}) => {
  const t = translations[lang];

  if (history.length === 0) {
    return null;
  }

  return (
    <section id="history-section" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-pink-400" />
            <h3 className="font-heading font-bold text-sm text-neutral-200">
              {t.recentDownloads}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              {history.length}
            </span>
          </div>

          <button
            id="clear-history-btn"
            type="button"
            onClick={onClear}
            className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {history.map((item) => (
            <button
              key={item.id}
              id={`history-item-${item.videoId}`}
              type="button"
              onClick={() => onSelect(item)}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 hover:border-pink-500/50 flex items-center gap-3 text-left transition-all group cursor-pointer"
            >
              <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-neutral-950 shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                  {item.platform === 'instagram' ? (
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  ) : (
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
                {item.duration && (
                  <span className="absolute bottom-0.5 right-0.5 bg-black/85 px-1 py-0.2 rounded text-[9px] font-mono text-white font-semibold">
                    {item.duration}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover:text-pink-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                  {item.author}
                </p>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-pink-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
