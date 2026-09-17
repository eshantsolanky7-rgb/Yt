import React from 'react';
import { Copy, Link2, Sliders, ArrowDownToLine, Zap, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface HowToGuideProps {
  lang: Language;
}

export const HowToGuide: React.FC<HowToGuideProps> = ({ lang }) => {
  const t = translations[lang];

  const steps = [
    {
      num: '01',
      icon: Copy,
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      num: '02',
      icon: Link2,
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      num: '03',
      icon: Sliders,
      title: t.step3Title,
      desc: t.step3Desc,
    },
    {
      num: '04',
      icon: ArrowDownToLine,
      title: t.step4Title,
      desc: t.step4Desc,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: t.feat1Title,
      desc: t.feat1Desc,
    },
    {
      icon: CheckCircle2,
      title: t.feat2Title,
      desc: t.feat2Desc,
    },
    {
      icon: Smartphone,
      title: t.feat3Title,
      desc: t.feat3Desc,
    },
    {
      icon: ShieldCheck,
      title: t.feat4Title,
      desc: t.feat4Desc,
    },
  ];

  return (
    <section id="guide-section" className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
      {/* Steps Guide */}
      <div className="text-center mb-8">
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-100 tracking-tight">
          {t.howToTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 relative hover:border-neutral-700 transition-all flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-sm text-neutral-200 mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mt-auto">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Features Showcase */}
      <div className="text-center mb-8">
        <h2 className="font-heading font-extrabold text-2xl text-neutral-100 tracking-tight">
          {t.featuresTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-4 hover:border-neutral-700 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-red-400 flex items-center justify-center shrink-0 border border-neutral-700">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm text-neutral-200 mb-1">
                  {feat.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
