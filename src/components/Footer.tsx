import React from 'react';
import { Youtube, Heart } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer id="site-footer" className="bg-neutral-950 border-t border-neutral-850 border-neutral-800/80 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Youtube className="w-4 h-4 fill-current" />
          </div>
          <span className="font-heading font-extrabold text-base text-neutral-200">
            {t.brand}
          </span>
        </div>

        {/* Presentation & Founder Branding */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 mb-4 shadow-sm">
          <span className="text-pink-400 font-bold">Presented by S_Series India</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">Founder: <strong className="text-neutral-100 font-semibold">Eshant Solanky</strong></span>
        </div>

        <p className="text-xs text-neutral-500 max-w-lg mx-auto mb-4 leading-relaxed">
          {t.footerDisclaimer}
        </p>

        <div className="flex items-center justify-center gap-1 text-xs text-neutral-400">
          <span>Created with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
          <span>for high-speed video & audio downloading</span>
        </div>
      </div>
    </footer>
  );
};
