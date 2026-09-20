import React from 'react';
import { History, Trash2, ArrowRight, Video, X } from 'lucide-react';
import { HistoryItem, Language } from '../types';
import { translations } from '../translations';

interface RecentHistoryProps {
  history: HistoryItem[];
  lang: Language;
  onSelect: (item: HistoryItem | string) => void;
  onClear: () => void;
  onRemoveItem?: (id: string) => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({
  history,
  lang,
  onSelect,
  onClear,
  onRemoveItem,
}) => {
  const t = translations[lang];

  if (!Array.isArray(history) || history.length === 0) {
    return null;
  }

  return (
    <section id="history-section" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-red-400" />
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
          {history.map((item) => {
            const isIg = Boolean(item.isInstagram || (item.videoUrl && (item.videoUrl.includes('instagram.com') || item.videoUrl.includes('instagr.am'))));
            const fallbackVid = item.videoId || '';
            const fallbackUrl = fallbackVid
              ? (isIg
                  ? `https://www.instagram.com/reel/${fallbackVid}/`
                  : `https://www.youtube.com/watch?v=${fallbackVid}`)
              : '';
            const targetUrl = item.videoUrl || (item as any).url || fallbackUrl || '';
            const fallbackThumb = isIg
              ? `/api/ig-thumbnail/${fallbackVid || 'reel'}`
              : (fallbackVid ? `https://i.ytimg.com/vi/${fallbackVid}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&q=80');

            return (
              <div
                key={item.id || fallbackVid || Math.random()}
                className="relative group rounded-xl bg-neutral-900 border border-neutral-800/80 hover:border-red-500/50 transition-all flex items-center overflow-hidden"
              >
                <button
                  id={`history-item-${fallbackVid || 'btn'}`}
                  type="button"
                  onClick={() => onSelect(targetUrl || item)}
                  className="p-2.5 w-full flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-neutral-950 shrink-0">
                    <img
                      src={item.thumbnail || fallbackThumb}
                      alt={item.title || 'Video'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackThumb;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <Video className="w-3.5 h-3.5 text-white/80" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 pr-6">
                    <div className="flex items-center gap-1.5">
                      {isIg && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white leading-tight">
                          IG
                        </span>
                      )}
                      <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover:text-red-400 transition-colors">
                        {item.title || 'Untitled Video'}
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {item.author || (lang === 'hi' ? 'वीडियो' : 'Video')}
                    </p>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-400 shrink-0 group-hover:translate-x-0.5 transition-all mr-1" />
                </button>

                {onRemoveItem && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    title={lang === 'hi' ? 'हटाएं' : 'Remove'}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-neutral-800/80 hover:bg-red-950 text-neutral-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
