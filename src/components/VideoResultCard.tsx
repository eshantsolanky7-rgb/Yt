import React, { useState } from 'react';
import {
  Play,
  Share2,
  Check,
  Video,
  Music,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  X,
  Instagram,
  Youtube,
  Download,
  Loader2,
  Clock,
  HardDrive,
  Award,
} from 'lucide-react';
import { VideoInfo, Language } from '../types';
import { translations } from '../translations';
import { FormatTable } from './FormatTable';
import { ThumbnailDownloader } from './ThumbnailDownloader';

interface VideoResultCardProps {
  videoInfo: VideoInfo;
  lang: Language;
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ videoInfo, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'thumbnails'>('video');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [quickDownloading, setQuickDownloading] = useState<'video' | 'audio' | 'thumb' | null>(null);

  const isInstagram = videoInfo.platform === 'instagram';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoInfo.videoUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickDownload = (type: 'video' | 'audio' | 'thumb') => {
    setQuickDownloading(type);

    if (type === 'thumb') {
      const downloadEndpoint = isInstagram
        ? `/api/download-thumbnail?url=${encodeURIComponent(videoInfo.thumbnail)}&videoId=${videoInfo.videoId}&platform=instagram`
        : `/api/download-thumbnail?videoId=${videoInfo.videoId}&quality=maxresdefault`;

      const a = document.createElement('a');
      a.href = downloadEndpoint;
      a.download = isInstagram
        ? `Instagram_Cover_${videoInfo.videoId}.jpg`
        : `YouTube_Thumbnail_${videoInfo.videoId}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const format = type === 'video' ? 'mp4' : 'mp3_320';
      const cleanTitle = encodeURIComponent((videoInfo.title || 'media').slice(0, 80));
      const targetUrl = encodeURIComponent(videoInfo.videoUrl);
      const downloadUrl = `/api/download/file?platform=${videoInfo.platform || 'youtube'}&url=${targetUrl}&type=${type}&format=${format}&title=${cleanTitle}`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoInfo.title || 'download'}.${type === 'video' ? 'mp4' : 'mp3'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => {
      setQuickDownloading(null);
    }, 2000);
  };

  return (
    <section id="result-section" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Branding header banner */}
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 px-5 py-2.5 border-b border-neutral-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="font-semibold text-pink-400">Presented by S_Series India</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300 font-medium">Founder: <strong className="text-white">Eshant Solanky</strong></span>
          </div>
          {videoInfo.duration && (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
              <Clock className="w-3 h-3" />
              <span>Timeline: {videoInfo.duration}</span>
            </div>
          )}
        </div>

        {/* Top Media Header Info Bar */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* Thumbnail with Play Preview Overlay & Duration Badge */}
            <div className={`relative w-full md:w-64 ${isInstagram ? 'aspect-[4/3] md:aspect-square' : 'aspect-video'} rounded-xl overflow-hidden bg-neutral-950 shrink-0 group border border-neutral-800`}>
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  if (!isInstagram && videoInfo.thumbnails?.hq) {
                    (e.currentTarget as HTMLImageElement).src = videoInfo.thumbnails.hq;
                  }
                }}
              />
              <button
                id="play-preview-overlay-btn"
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
                title={t.watchPreview}
              >
                <div className={`w-12 h-12 rounded-full ${
                  isInstagram ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-red-600/90'
                } text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </button>

              {/* Timeline / Duration Badge directly on thumbnail */}
              {videoInfo.duration && (
                <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md text-white text-xs font-mono font-bold px-2 py-0.5 rounded-md border border-white/20 shadow-lg flex items-center gap-1 pointer-events-none">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{videoInfo.duration}</span>
                </div>
              )}
            </div>

            {/* Media Details */}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isInstagram ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 border border-pink-500/20">
                    <Instagram className="w-3 h-3" />
                    <span>Instagram Reel</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    <Youtube className="w-3 h-3" />
                    <span>YouTube Video</span>
                  </span>
                )}
                <span className="text-xs text-neutral-400 font-mono">
                  ID: {videoInfo.videoId}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-heading font-bold text-neutral-100 leading-snug line-clamp-2 mb-2">
                {videoInfo.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-400 mb-4">
                <span>
                  {t.channel}:{' '}
                  {videoInfo.authorUrl ? (
                    <a
                      href={videoInfo.authorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-200 hover:text-pink-400 font-semibold transition-colors underline-offset-2 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{videoInfo.author}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-neutral-200 font-semibold">{videoInfo.author}</span>
                  )}
                </span>

                {videoInfo.duration && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{videoInfo.duration}</span>
                    </span>
                  </>
                )}

                {videoInfo.filesizeFormatted && (
                  <>
                    <span className="text-neutral-600">•</span>
                    <span className="inline-flex items-center gap-1 text-pink-300 bg-pink-950/40 border border-pink-500/30 px-2 py-0.5 rounded font-mono font-medium">
                      <HardDrive className="w-3 h-3" />
                      <span>{videoInfo.filesizeFormatted}</span>
                    </span>
                  </>
                )}
              </div>

              {/* 3 Main Direct Download Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Direct MP4 Download */}
                <button
                  id="quick-mp4-download-btn"
                  type="button"
                  onClick={() => handleQuickDownload('video')}
                  disabled={quickDownloading === 'video'}
                  className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold text-white shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                    isInstagram
                      ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:opacity-90 shadow-pink-950/40'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-950/40'
                  }`}
                >
                  {quickDownloading === 'video' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.downloading}</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'वीडियो (MP4) डाउनलोड' : 'Download Video (MP4)'}</span>
                      <Sparkles className="w-3 h-3 text-amber-300 ml-0.5" />
                    </>
                  )}
                </button>

                {/* Direct MP3 Audio Download */}
                <button
                  id="quick-mp3-download-btn"
                  type="button"
                  onClick={() => handleQuickDownload('audio')}
                  disabled={quickDownloading === 'audio'}
                  className="px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-neutral-800 hover:bg-neutral-750 text-neutral-100 hover:text-white border border-neutral-700 shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {quickDownloading === 'audio' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>{t.downloading}</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5 text-pink-400" />
                      <span>{lang === 'hi' ? 'ऑडियो (MP3) डाउनलोड' : 'Download Audio (MP3)'}</span>
                    </>
                  )}
                </button>

                {/* Direct HD Thumbnail Download */}
                <button
                  id="quick-thumb-download-btn"
                  type="button"
                  onClick={() => handleQuickDownload('thumb')}
                  disabled={quickDownloading === 'thumb'}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {quickDownloading === 'thumb' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                      <span>{t.downloading}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'hi' ? 'थंबनेल डाउनलोड' : 'HD Thumbnail'}</span>
                    </>
                  )}
                </button>

                {/* Copy Link Button */}
                <button
                  id="copy-video-link-btn"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 rounded-xl text-xs font-medium bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center gap-1.5 transition-colors ml-auto cursor-pointer"
                  title="Copy media link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.copiedLink}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.copyLink}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Clean Tabs: Video, Audio, Thumbnail */}
        <div className="bg-neutral-950/50 border-b border-neutral-800 px-4 sm:px-6">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
            <button
              id="tab-btn-video"
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'video'
                  ? isInstagram
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-950/40'
                    : 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{t.tabVideo}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                MP4
              </span>
            </button>

            <button
              id="tab-btn-audio"
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? isInstagram
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-950/40'
                    : 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>{t.tabAudio}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                MP3
              </span>
            </button>

            <button
              id="tab-btn-thumbnails"
              type="button"
              onClick={() => setActiveTab('thumbnails')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'thumbnails'
                  ? isInstagram
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-950/40'
                    : 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{t.tabThumbnails}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                HD
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 bg-neutral-900">
          {activeTab === 'video' && (
            <div>
              <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${isInstagram ? 'text-pink-400' : 'text-red-400'}`} />
                <span>{t.videoTabDesc}</span>
              </p>
              <FormatTable
                formats={videoInfo.videoFormats}
                videoInfo={videoInfo}
                lang={lang}
                type="video"
              />
            </div>
          )}

          {activeTab === 'audio' && (
            <div>
              <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${isInstagram ? 'text-pink-400' : 'text-red-400'}`} />
                <span>{t.audioTabDesc}</span>
              </p>
              <FormatTable
                formats={videoInfo.audioFormats}
                videoInfo={videoInfo}
                lang={lang}
                type="audio"
              />
            </div>
          )}

          {activeTab === 'thumbnails' && (
            <div>
              <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${isInstagram ? 'text-pink-400' : 'text-red-400'}`} />
                <span>{t.thumbnailTabDesc}</span>
              </p>
              <ThumbnailDownloader videoInfo={videoInfo} lang={lang} />
            </div>
          )}
        </div>
      </div>

      {/* Embedded Media Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-neutral-200 line-clamp-1">
                {videoInfo.title}
              </h3>
              <button
                id="close-preview-modal-btn"
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {isInstagram ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    referrerPolicy="no-referrer"
                    className="max-h-60 rounded-xl object-cover mb-4 shadow-lg"
                  />
                  <a
                    href={videoInfo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-semibold shadow-md hover:opacity-95"
                  >
                    <span>{lang === 'hi' ? 'इंस्टाग्राम पर देखें' : 'View on Instagram'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <iframe
                  src={`${videoInfo.embedUrl}?autoplay=1`}
                  title={videoInfo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
