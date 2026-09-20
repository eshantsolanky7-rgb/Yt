import React from 'react';
import { Youtube, Globe, Sparkles, ShieldCheck, Award } from 'lucide-react';
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30 text-white shrink-0">
            <Youtube className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-neutral-100 tracking-tight">
                {t.brand}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <Sparkles className="w-3 h-3" /> v2.4
              </span>
            </div>
            {/* Branding subtitle */}
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-medium">
              <span className="text-neutral-300 font-semibold">{t.presentedBy}</span>
              <span className="text-neutral-600">•</span>
              <span className="text-red-400 font-medium">{t.founder}</span>
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* S_series India Official Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 px-3 py-1 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">S_series India</span>
            <span className="text-amber-500/60">•</span>
            <span className="text-amber-200">Eshant Solanky</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fast & Secure</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-800 border border-neutral-700 p-1 rounded-xl shadow-inner">
            <button
              id="lang-btn-en"
              type="button"
              onClick={() => onToggleLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-red-600 text-white shadow-sm'
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
                  ? 'bg-red-600 text-white shadow-sm'
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
