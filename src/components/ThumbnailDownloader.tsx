import React, { useState } from 'react';
import { Download, ExternalLink, Image as ImageIcon, Sparkles, Check, Loader2, Copy, CheckCheck, Award } from 'lucide-react';
import { Language, VideoInfo } from '../types';
import { safeCopyText } from '../utils';

interface ThumbnailDownloaderProps {
  videoInfo: VideoInfo;
  lang: Language;
}

export const ThumbnailDownloader: React.FC<ThumbnailDownloaderProps> = ({ videoInfo, lang }) => {
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'loading' | 'info'; text: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const thumbnailOptions = [
    {
      id: 'maxresdefault',
      label: lang === 'hi' ? 'अल्ट्रा HD (1080p)' : 'Ultra HD (1080p)',
      resolution: '1920 x 1080',
      badge: lang === 'hi' ? 'सर्वश्रेष्ठ क्वालिटी' : 'Best Quality',
      url: videoInfo.thumbnails.maxres,
    },
    {
      id: 'hqdefault',
      label: lang === 'hi' ? 'हाई क्वालिटी (720p HD)' : 'High Quality (720p HD)',
      resolution: '1280 x 720',
      badge: lang === 'hi' ? 'रिकमेंडेड' : 'Recommended',
      url: videoInfo.thumbnails.hq,
    },
    {
      id: 'mqdefault',
      label: lang === 'hi' ? 'मीडियम क्वालिटी (480p)' : 'Medium Quality (480p)',
      resolution: '640 x 480',
      badge: lang === 'hi' ? 'कॉम्पैक्ट' : 'Compact',
      url: videoInfo.thumbnails.mq,
    },
    {
      id: 'sddefault',
      label: lang === 'hi' ? 'स्टैंडर्ड क्वालिटी' : 'Standard Quality',
      resolution: '480 x 360',
      badge: lang === 'hi' ? 'नॉर्मल' : 'Standard',
      url: videoInfo.thumbnails.standard,
    },
  ];

  // Helper: Trigger browser file download from Blob
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 2500);
  };

  // Helper: Canvas-based fallback for image downloading if proxy fetch fails
  const downloadViaCanvas = (imageUrl: string, filename: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1280;
          canvas.height = img.naturalHeight || 720;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(false);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              triggerBlobDownload(blob, filename);
              resolve(true);
            } else {
              resolve(false);
            }
          }, 'image/jpeg', 0.95);
        } catch {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  };

  const handleDownload = async (qualityId: string, directUrl: string) => {
    setDownloadingQuality(qualityId);
    setStatusMessage({
      type: 'loading',
      text: lang === 'hi' ? 'थंबनेल तैयार हो रहा है...' : 'Preparing high-res thumbnail download...'
    });

    const filename = `Thumbnail_${videoInfo.videoId}_${qualityId} - Media Saver.jpg`;
    let downloadSuccess = false;

    try {
      // Step 1: Fetch via server endpoint (supports CORS and automatically falls back if 1080p is unavailable)
      const downloadEndpoint = `/api/download-thumbnail?videoId=${videoInfo.videoId}&quality=${qualityId}`;
      const res = await fetch(downloadEndpoint);

      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 500) {
          triggerBlobDownload(blob, filename);
          downloadSuccess = true;
        }
      }
    } catch (fetchErr) {
      console.warn('Server download endpoint fetch failed, attempting canvas/direct fallback', fetchErr);
    }

    // Step 2: Fallback to Canvas capture if server endpoint didn't succeed
    if (!downloadSuccess) {
      try {
        downloadSuccess = await downloadViaCanvas(directUrl, filename);
      } catch (canvasErr) {
        console.warn('Canvas fallback failed', canvasErr);
      }
    }

    // Step 3: Final fallback: direct link trigger or open in tab
    if (downloadSuccess) {
      setStatusMessage({
        type: 'success',
        text: lang === 'hi'
          ? 'थंबनेल सफलतापूर्वक डाउनलोड हो गया!'
          : 'Thumbnail downloaded successfully to your device!'
      });
      setTimeout(() => {
        setDownloadingQuality(null);
      }, 1500);
    } else {
      // Open in a new tab so user can directly save
      const directWindow = window.open(directUrl, '_blank');
      if (directWindow) {
        setStatusMessage({
          type: 'info',
          text: lang === 'hi'
            ? 'इमेज नए टैब में खोली गई है। आप राइट-क्लिक या लॉन्ग-प्रेस करके सेव कर सकते हैं।'
            : 'Image opened in a new tab. Long-press or right-click to save image.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: lang === 'hi'
            ? 'डाउनलोड नहीं हो सका। कृपया इमेज पर राइट क्लिक करके सेव करें।'
            : 'Download could not start. Please open image and save manually.'
        });
      }
      setDownloadingQuality(null);
    }

    // Clear status message after 5 seconds
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  };

  const handleCopyUrl = async (url: string) => {
    await safeCopyText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Informative Header with S_series India Branding */}
      <div className="p-3.5 bg-neutral-850 bg-neutral-900/90 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-neutral-100 block">
              {lang === 'hi' ? 'HD यूट्यूब थंबनेल डाउनलोडर' : 'HD YouTube Thumbnail Extractor'}
            </span>
            <span className="text-[11px] text-neutral-400">
              {lang === 'hi'
                ? 'ओरिजिनल 1080p, 720p रेजोल्यूशन में डायरेक्ट JPG सेव करें।'
                : 'Save original 1080p, 720p JPG images directly to your device.'}
            </span>
          </div>
        </div>

        {/* Branding badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 shrink-0">
          <Award className="w-3 h-3 text-amber-400" />
          <span>Presented by S_series India • Founder Eshant Solanky</span>
        </div>
      </div>

      {/* Dynamic Status Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : statusMessage.type === 'loading'
              ? 'bg-neutral-800 border border-neutral-700 text-neutral-200'
              : statusMessage.type === 'info'
              ? 'bg-blue-950/80 border border-blue-800 text-blue-200'
              : 'bg-red-950/80 border border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-red-400" />}
            {statusMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-neutral-400 hover:text-white text-xs underline ml-2"
          >
            {lang === 'hi' ? 'बंद करें' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Grid of Thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {thumbnailOptions.map((opt) => {
          const isDownloading = downloadingQuality === opt.id;
          const isCopied = copiedUrl === opt.url;

          return (
            <div
              key={opt.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all group flex flex-col shadow-lg"
            >
              {/* Thumbnail Image Preview */}
              <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                <img
                  src={opt.url}
                  alt={opt.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to hqdefault if maxres doesn't exist on YouTube CDN
                    (e.currentTarget as HTMLImageElement).src = videoInfo.thumbnails.hq;
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900/80 backdrop-blur-md text-white border border-neutral-700">
                    {opt.resolution}
                  </span>
                </div>
                {opt.badge && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/90 text-white shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      {opt.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Action area */}
              <div className="p-3.5 flex items-center justify-between mt-auto bg-neutral-900/95 border-t border-neutral-800/80 gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-200 truncate">{opt.label}</h4>
                  <span className="text-[11px] text-neutral-400 block font-mono">{opt.resolution}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Copy Image Link */}
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(opt.url)}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title={lang === 'hi' ? 'इमेज लिंक कॉपी करें' : 'Copy Image Link'}
                  >
                    {isCopied ? (
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Open in New Tab */}
                  <a
                    href={opt.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    title={lang === 'hi' ? 'नए टैब में फुल इमेज देखें' : 'View full image in new tab'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Main Download Button */}
                  <button
                    id={`download-thumb-${opt.id}`}
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownload(opt.id, opt.url)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-heading font-semibold shadow-md active:scale-95 transition-all cursor-pointer ${
                      isDownloading
                        ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-950/40'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                        <span>{lang === 'hi' ? 'सेव हो रहा है...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'डाउनलोड करें' : 'Download'}</span>
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
