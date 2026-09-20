import React from 'react';
import { Youtube, Heart, Award, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <footer id="site-footer" className="bg-neutral-950 border-t border-neutral-800/80 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
            <Youtube className="w-4 h-4 fill-current" />
          </div>
          <span className="font-heading font-extrabold text-lg text-neutral-100">
            {t.brand}
          </span>
        </div>

        {/* Official S_series India & Founder Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 max-w-xl mx-auto shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Award className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="font-heading font-bold text-sm text-neutral-100">
                    S_series India
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-xs text-amber-300 font-medium">
                  {lang === 'hi' ? 'संस्थापक: ईशांत सोलंकी' : 'Founder: Eshant Solanky'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="mailto:eshantsolanky7@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
                title="Contact Founder Eshant Solanky"
              >
                <Mail className="w-3 h-3 text-red-400" />
                <span>eshantsolanky7@gmail.com</span>
              </a>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 text-center">
            {lang === 'hi'
              ? 'यह प्लेटफॉर्म S_series India द्वारा संचालित है। संस्थापक ईशांत सोलंकी के मार्गदर्शन में उच्च गति और सुरक्षित मीडिया डाउनलोडिंग।'
              : 'Presented by S_series India under the vision of Founder Eshant Solanky. Fast, free, and secure YouTube media tools.'}
          </div>
        </div>

        <p className="text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
          {t.footerDisclaimer}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400 pt-2">
          <span>Presented by <strong className="text-neutral-200">S_series India</strong></span>
          <span>•</span>
          <span>Founder: <strong className="text-amber-300">Eshant Solanky</strong></span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-current" />
          </div>
        </div>

        <p className="text-[11px] text-neutral-600">
          © {new Date().getFullYear()} S_series India. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
