import React, { useState } from 'react';
import { Download, ExternalLink, Image as ImageIcon, Sparkles, Check, Loader2 } from 'lucide-react';
import { Language, VideoInfo } from '../types';

interface ThumbnailDownloaderProps {
  videoInfo: VideoInfo;
  lang: Language;
}

export const ThumbnailDownloader: React.FC<ThumbnailDownloaderProps> = ({ videoInfo, lang }) => {
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);

  const isInstagram = videoInfo.platform === 'instagram';

  const thumbnailOptions = isInstagram
    ? [
        {
          id: 'original',
          label: 'Original HD Cover Image',
          resolution: 'Full HD / Original',
          badge: 'Original High-Res',
          url: videoInfo.thumbnail,
        },
      ]
    : [
        {
          id: 'maxresdefault',
          label: 'Ultra HD (1080p)',
          resolution: '1920 x 1080',
          badge: 'Best Quality',
          url: videoInfo.thumbnails?.maxres || videoInfo.thumbnail,
        },
        {
          id: 'hqdefault',
          label: 'High Quality (720p)',
          resolution: '1280 x 720',
          badge: 'Recommended',
          url: videoInfo.thumbnails?.hq || videoInfo.thumbnail,
        },
        {
          id: 'mqdefault',
          label: 'Medium Quality (480p)',
          resolution: '640 x 480',
          badge: 'Compact',
          url: videoInfo.thumbnails?.mq || videoInfo.thumbnail,
        },
        {
          id: 'sddefault',
          label: 'Standard Quality',
          resolution: '480 x 360',
          badge: 'Standard',
          url: videoInfo.thumbnails?.standard || videoInfo.thumbnail,
        },
      ];

  const handleDownload = (qualityId: string, imgUrl: string) => {
    setDownloadingQuality(qualityId);

    const downloadEndpoint = isInstagram
      ? `/api/download-thumbnail?url=${encodeURIComponent(imgUrl)}&videoId=${videoInfo.videoId}&platform=instagram`
      : `/api/download-thumbnail?videoId=${videoInfo.videoId}&quality=${qualityId}`;

    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = isInstagram
      ? `Instagram_Cover_${videoInfo.videoId}.jpg`
      : `YouTube_Thumbnail_${videoInfo.videoId}_${qualityId}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadingQuality(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-neutral-800/40 rounded-xl border border-neutral-700/60 flex items-center justify-between text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <ImageIcon className={`w-4 h-4 ${isInstagram ? 'text-pink-400' : 'text-red-400'}`} />
          <span>
            {isInstagram
              ? lang === 'hi'
                ? 'इंस्टाग्राम रील्स और पोस्ट की ओरिजिनल HD कवर/थंबनेल इमेज सीधे डाउनलोड करें।'
                : 'Save official Instagram Reel and Post cover images in original HD resolution.'
              : lang === 'hi'
              ? 'यूट्यूब थंबनेल को फुल HD रेजोल्यूशन में सीधे अपने डिवाइस में सेव करें।'
              : 'Save official YouTube thumbnails directly to your device in full HD resolution.'}
          </span>
        </div>
      </div>

      <div className={`grid gap-4 ${isInstagram ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {thumbnailOptions.map((opt) => {
          const isDownloading = downloadingQuality === opt.id;
          return (
            <div
              key={opt.id}
              className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all group flex flex-col"
            >
              {/* Thumbnail Image Preview */}
              <div className={`relative ${isInstagram ? 'aspect-[4/5] sm:aspect-square' : 'aspect-video'} bg-neutral-950 overflow-hidden`}>
                <img
                  src={opt.url}
                  alt={opt.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    if (!isInstagram && videoInfo.thumbnails?.hq) {
                      (e.currentTarget as HTMLImageElement).src = videoInfo.thumbnails.hq;
                    }
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900/80 backdrop-blur-md text-white border border-neutral-700">
                    {opt.resolution}
                  </span>
                </div>
                {opt.badge && (
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${
                        isInstagram
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                          : 'bg-red-600/90'
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {opt.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Action area */}
              <div className="p-3.5 flex items-center justify-between mt-auto bg-neutral-900/90 border-t border-neutral-800/80">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">{opt.label}</h4>
                  <span className="text-xs text-neutral-400">JPG Image • Direct Save</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={opt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title="View full image in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    id={`download-thumb-${opt.id}`}
                    type="button"
                    onClick={() => handleDownload(opt.id, opt.url)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold text-white shadow-md active:scale-95 transition-all cursor-pointer ${
                      isInstagram
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-900/40'
                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{lang === 'hi' ? 'सेव हुआ!' : 'Saved!'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'डाउनलोड' : 'Download'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
