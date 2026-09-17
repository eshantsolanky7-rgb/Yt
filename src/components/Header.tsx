import React from 'react';
import { Video, Globe, Sparkles, ShieldCheck, Instagram, Youtube } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onToggleLang }) => {
  const t = translations[lang];

  return (
    <header id="site-header" className="sticky top-0 z-50 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-red-950/30 text-white">
            <Video className="w-5 h-5" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-pink-500 border border-neutral-900 flex items-center justify-center">
              <Instagram className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-neutral-100 tracking-tight">
                {t.brand}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <Sparkles className="w-3 h-3 text-pink-400" /> YT + Insta
              </span>
            </div>
            <p className="text-[11px] text-pink-400 font-medium flex items-center gap-1 leading-none mt-0.5">
              <span className="font-semibold">Presented by S_Series India</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">Founder: <strong className="text-neutral-200 font-medium">Eshant Solanky</strong></span>
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct In-App</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-800 border border-neutral-700 p-1 rounded-xl shadow-inner">
            <button
              id="lang-btn-en"
              type="button"
              onClick={() => onToggleLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              id="lang-btn-hi"
              type="button"
              onClick={() => onToggleLang('hi')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                lang === 'hi'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              हिंदी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
