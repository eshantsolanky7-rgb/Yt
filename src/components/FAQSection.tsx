import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface FAQSectionProps {
  lang: Language;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ lang }) => {
  const t = translations[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  return (
    <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-semibold mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-red-400" />
          <span>FAQ</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-100 tracking-tight">
          {t.faqTitle}
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                id={`faq-toggle-${idx}`}
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-850 transition-colors"
              >
                <span className="font-heading font-semibold text-sm text-neutral-200">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-red-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
