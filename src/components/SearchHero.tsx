import React, { useState } from 'react';
import { Search, Clipboard, X, ArrowRight, Loader2, Music, Video, Zap, Film, Instagram, Youtube } from 'lucide-react';
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

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrlInput(text.trim());
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
      onFetch();
    }
  };

  const sampleVideos = [
    {
      id: 'ig-reel',
      title: lang === 'hi' ? 'इंस्टाग्राम रील्स' : 'Instagram Reel',
      url: 'https://www.instagram.com/reel/CigMSGeD4Hd/',
      icon: Instagram,
      badgeColor: 'text-pink-400 border-pink-500/30 hover:border-pink-500',
    },
    {
      id: 'zoo',
      title: lang === 'hi' ? 'यूट्यूब वीडियो' : 'YouTube Video',
      url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      icon: Youtube,
      badgeColor: 'text-red-400 border-red-500/30 hover:border-red-500',
    },
    {
      id: 'shorts',
      title: lang === 'hi' ? 'यूट्यूब शॉर्ट्स' : 'YouTube Shorts',
      url: 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
      icon: Zap,
      badgeColor: 'text-amber-400 border-amber-500/30 hover:border-amber-500',
    },
    {
      id: 'music',
      title: lang === 'hi' ? 'लो-फाई म्यूजिक' : 'Lofi Chill Beat',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      icon: Music,
      badgeColor: 'text-purple-400 border-purple-500/30 hover:border-purple-500',
    },
  ];

  return (
    <section id="search-section" className="pt-10 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto">
      {/* Hero Badge & Presentation branding */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-neutral-900 to-neutral-850 border border-neutral-700/80 text-xs shadow-md">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
          <span className="text-pink-400 font-bold tracking-wide">Presented by S_Series India</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300">Founder: <strong className="text-white font-semibold">Eshant Solanky</strong></span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{lang === 'hi' ? 'यूट्यूब व इंस्टाग्राम मीडिया डाउनलोडर' : 'Direct Media Downloader'}</span>
        </div>
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
        <div className="relative flex flex-col sm:flex-row items-center bg-neutral-900 border-2 border-neutral-700/80 focus-within:border-pink-500 rounded-2xl p-2 shadow-2xl transition-all gap-2">
          {/* Input container */}
          <div className="flex items-center w-full px-3 py-1">
            <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
            <input
              id="media-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.inputPlaceholder}
              className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-none text-sm sm:text-base font-normal py-2"
              disabled={isLoading}
              autoComplete="off"
            />
            {urlInput && (
              <button
                id="clear-url-btn"
                type="button"
                onClick={() => setUrlInput('')}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors mr-1"
                title={t.clearBtn}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              id="paste-url-btn"
              type="button"
              onClick={handlePaste}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700/60 transition-colors shrink-0"
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
            onClick={() => onFetch()}
            disabled={isLoading || !urlInput.trim()}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shrink-0 transition-all shadow-md ${
              isLoading || !urlInput.trim()
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-pink-900/40 active:scale-[0.98]'
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-800 border text-neutral-300 hover:text-white transition-all active:scale-95 ${sample.badgeColor}`}
              >
                <Icon className="w-3 h-3" />
                <span>{sample.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
