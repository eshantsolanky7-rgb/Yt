import React, { useState } from 'react';
import { Search, Clipboard, X, ArrowRight, Loader2, Music, Video, Zap, Film } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface SearchHeroProps {
  lang: Language;
  urlInput: string;
  setUrlInput: (val: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onFetch: (customUrl?: string) => void;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  lang,
  urlInput,
  setUrlInput,
  isLoading,
  errorMessage,
  onFetch,
}) => {
  const t = translations[lang];
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const cleanInput = typeof urlInput === 'string' ? urlInput : '';
  const isValidInput = cleanInput.trim().length > 0;

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && typeof text === 'string') {
          const trimmed = text.trim();
          setUrlInput(trimmed);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch {
      // Clipboard access denied or unsupported, user can paste manually
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValidInput && !isLoading) {
        onFetch(cleanInput);
      }
    }
  };

  const sampleVideos = [
    {
      id: 'zoo',
      title: 'First YT Video (Me at the zoo)',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      icon: Film,
    },
    {
      id: 'nature',
      title: 'Nature 4K HD',
      url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      icon: Video,
    },
    {
      id: 'instagram',
      title: 'Instagram Reel',
      url: 'https://www.instagram.com/reel/C8q72N_vL-i/',
      icon: Film,
    },
    {
      id: 'shorts',
      title: 'YouTube Shorts',
      url: 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
      icon: Zap,
    },
  ];

  return (
    <section id="search-section" className="pt-8 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto">
      {/* Official S_series India & Founder Eshant Solanky Banner */}
      <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-950/60 via-neutral-900 to-amber-950/60 border border-amber-500/30 text-xs shadow-lg mb-4 backdrop-blur-sm">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="font-bold text-amber-300 tracking-wide">
          {t.presentedBy}
        </span>
        <span className="text-neutral-500">•</span>
        <span className="text-neutral-200 font-medium">
          {t.founder}
        </span>
      </div>

      {/* Main Titles */}
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
        {t.heroTitle}
      </h1>
      <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
        {t.heroSubtitle}
      </p>

      {/* Search Input Box */}
      <div className="mt-8 relative max-w-3xl mx-auto">
        <div className="relative flex flex-col sm:flex-row items-center bg-neutral-900 border-2 border-neutral-700/80 focus-within:border-red-500 rounded-2xl p-2 shadow-2xl transition-all gap-2">
          {/* Input container */}
          <div className="flex items-center w-full px-3 py-1">
            <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
            <input
              id="youtube-url-input"
              type="text"
              value={cleanInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.inputPlaceholder}
              className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-none text-sm sm:text-base font-normal py-2"
              disabled={isLoading}
              autoComplete="off"
            />
            {cleanInput && (
              <button
                id="clear-url-btn"
                type="button"
                onClick={() => setUrlInput('')}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors mr-1 cursor-pointer"
                title={t.clearBtn}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              id="paste-url-btn"
              type="button"
              onClick={handlePaste}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700/60 transition-colors shrink-0 cursor-pointer"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>{pasteSuccess ? (lang === 'hi' ? 'पेस्ट हुआ!' : 'Pasted!') : t.pasteBtn}</span>
            </button>
          </div>

          {/* Action button */}
          <button
            id="fetch-video-btn"
            type="button"
            onClick={() => onFetch(cleanInput)}
            disabled={isLoading || !isValidInput}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shrink-0 transition-all shadow-md cursor-pointer ${
              isLoading || !isValidInput
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-900/40 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.fetching}</span>
              </>
            ) : (
              <>
                <span>{t.fetchBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="error-banner"
            className="mt-4 p-3.5 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-center justify-between text-left shadow-lg animate-fadeIn"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => onFetch()}
              className="text-xs font-semibold text-red-300 hover:text-white underline ml-3 shrink-0"
            >
              {lang === 'hi' ? 'दोबारा कोशिश करें' : 'Retry'}
            </button>
          </div>
        )}

        {/* Quick Sample Links */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium">{t.quickSamples}</span>
          {sampleVideos.map((sample) => {
            const Icon = sample.icon;
            return (
              <button
                key={sample.id}
                id={`sample-btn-${sample.id}`}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                  onFetch(sample.url);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-red-500/50 text-neutral-300 hover:text-white transition-all active:scale-95"
              >
                <Icon className="w-3 h-3 text-red-400" />
                <span>{sample.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
