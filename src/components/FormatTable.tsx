import React, { useState } from 'react';
import { Download, Sparkles, Loader2, Check } from 'lucide-react';
import { FormatOption, Language, VideoInfo } from '../types';
import { translations } from '../translations';

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleDownload = (fmt: FormatOption) => {
    setDownloadingId(fmt.id);
    setSuccessId(null);

    const platform = videoInfo.platform || 'youtube';
    const cleanTitle = encodeURIComponent((videoInfo.title || 'media').slice(0, 80));
    const targetUrl = encodeURIComponent(videoInfo.videoUrl);
    const downloadUrl = `/api/download/file?platform=${platform}&url=${targetUrl}&type=${type}&format=${fmt.id}&title=${cleanTitle}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${videoInfo.title || 'download'}.${fmt.ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadingId(null);
      setSuccessId(fmt.id);
      setTimeout(() => {
        setSuccessId(null);
      }, 3000);
    }, 1500);
  };

  return (
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
            const isDownloading = downloadingId === fmt.id;
            const isSuccess = successId === fmt.id;

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
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                          videoInfo.platform === 'instagram'
                            ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {fmt.badge}
                      </span>
                    )}
                  </div>
                  {fmt.resolution && (
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      {fmt.resolution} • {type === 'video' ? 'MP4 Video' : 'Stereo Audio'}
                    </span>
                  )}
                </td>

                {/* Format extension */}
                <td className="py-3.5 px-4">
                  <span className="uppercase font-mono text-xs font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    .{fmt.ext}
                  </span>
                </td>

                {/* File size */}
                <td className="py-3.5 px-4 text-xs font-mono">
                  {fmt.exactSize ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 shadow-sm">
                      <span>{fmt.exactSize}</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400">{fmt.approxSize}</span>
                  )}
                </td>

                {/* Direct Download Action */}
                <td className="py-3.5 px-4 text-right">
                  <button
                    id={`download-fmt-${type}-${fmt.id}`}
                    type="button"
                    onClick={() => handleDownload(fmt)}
                    disabled={isDownloading}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-semibold transition-all active:scale-95 cursor-pointer shadow-md ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : isDownloading
                        ? 'bg-neutral-800 text-neutral-400 cursor-wait'
                        : videoInfo.platform === 'instagram'
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-900/30'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                        <span>{t.downloading}</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{t.downloaded}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{t.downloadBtn}</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
