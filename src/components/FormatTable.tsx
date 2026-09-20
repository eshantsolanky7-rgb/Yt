import React, { useState } from 'react';
import { Download, Sparkles, ExternalLink, Layers, Zap } from 'lucide-react';
import { FormatOption, Language, VideoInfo } from '../types';
import { translations } from '../translations';
import { DownloadActionModal } from './DownloadActionModal';

interface FormatTableProps {
  formats: FormatOption[];
  videoInfo: VideoInfo;
  lang: Language;
  type: 'video' | 'audio';
}

export const FormatTable: React.FC<FormatTableProps> = ({
  formats,
  videoInfo,
  lang,
  type,
}) => {
  const t = translations[lang];
  const [modalFormat, setModalFormat] = useState<FormatOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openServerModal = (fmt: FormatOption) => {
    setModalFormat(fmt);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">{t.columnResolution}</th>
              <th className="py-3 px-4">{t.columnFormat}</th>
              <th className="py-3 px-4">{t.columnSize}</th>
              <th className="py-3 px-4 text-right">{t.columnAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-sm">
            {formats.map((fmt) => {
              // Direct URLs for primary converter
              const directConverterUrl = videoInfo.isInstagram
                ? `https://fastdl.app/en?url=${encodeURIComponent(videoInfo.videoUrl)}`
                : type === 'audio'
                  ? `https://yt1s.com/en/youtube-to-mp3?q=https://www.youtube.com/watch?v=${videoInfo.videoId}`
                  : `https://www.y2mate.com/youtube/${videoInfo.videoId}`;

              return (
                <tr
                  key={fmt.id}
                  className="hover:bg-neutral-800/40 transition-colors group"
                >
                  {/* Resolution / Quality */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-100">
                        {fmt.label}
                      </span>
                      {fmt.badge && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <Sparkles className="w-2.5 h-2.5" />
                          {fmt.badge}
                        </span>
                      )}
                    </div>
                    {fmt.resolution && (
                      <span className="text-xs text-neutral-400 block mt-0.5">
                        {fmt.resolution} • {type === 'video' ? 'H.264 / AAC' : 'Stereo'}
                      </span>
                    )}
                  </td>

                  {/* Format extension */}
                  <td className="py-3.5 px-4">
                    <span className="uppercase font-mono text-xs font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      .{fmt.ext}
                    </span>
                  </td>

                  {/* Estimated file size */}
                  <td className="py-3.5 px-4 text-neutral-400 text-xs font-mono">
                    {fmt.approxSize}
                  </td>

                  {/* Download Actions: Direct In-App Conversion Modal */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {/* Primary: Direct Download & In-App Converter */}
                      <button
                        id={`download-fmt-${type}-${fmt.id}`}
                        type="button"
                        onClick={() => openServerModal(fmt)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/30 active:scale-95 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.downloadBtn}</span>
                        <Zap className="w-3 h-3 text-amber-300 ml-0.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal with all verified download servers & browser tricks */}
      <DownloadActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoInfo={videoInfo}
        selectedFormat={modalFormat}
        type={type}
        lang={lang}
      />
    </>
  );
};
