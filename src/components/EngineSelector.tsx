import React from 'react';
import { Zap, ExternalLink, Shield, Server, CheckCircle2 } from 'lucide-react';
import { EngineOption, Language } from '../types';

interface EngineSelectorProps {
  engines: EngineOption[];
  lang: Language;
}

export const EngineSelector: React.FC<EngineSelectorProps> = ({ engines, lang }) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-neutral-700/60 text-xs text-neutral-300 flex items-center gap-2">
        <Server className="w-4 h-4 text-red-400 shrink-0" />
        <span>
          {lang === 'hi'
            ? 'यदि कोई एक सर्वर व्यस्त हो, तो आप तुरंत वैकल्पिक हाई-स्पीड सर्वर से वीडियो या ऑडियो डाउनलोड कर सकते हैं।'
            : 'If one server is busy or rate-limited, switch to an alternative high-speed engine instantly.'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {engines.map((engine) => (
          <div
            key={engine.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              engine.recommended
                ? 'bg-neutral-900/90 border-red-500/50 shadow-lg shadow-red-950/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-semibold text-sm text-neutral-100 flex items-center gap-1.5">
                  <Zap className={`w-3.5 h-3.5 ${engine.recommended ? 'text-red-400' : 'text-neutral-400'}`} />
                  {engine.name}
                </span>
                {engine.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      engine.recommended
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {engine.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                {engine.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-4">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> MP4 Video
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> MP3 Audio
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <Shield className="w-3 h-3" /> Safe
                </span>
              </div>
            </div>

            <a
              id={`engine-btn-${engine.id}`}
              href={engine.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-2.5 px-4 rounded-lg font-heading font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                engine.recommended
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:text-white'
              }`}
            >
              <span>{lang === 'hi' ? 'सर्वर खोलें और डाउनलोड करें' : 'Open Engine & Download'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
