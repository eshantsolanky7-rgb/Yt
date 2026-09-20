import React, { useState } from 'react';
import {
  Play,
  Share2,
  Check,
  Video,
  Music,
  Image as ImageIcon,
  Server,
  Sparkles,
  ExternalLink,
  X,
  Clock,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { VideoInfo, Language } from '../types';
import { translations } from '../translations';
import { safeCopyText } from '../utils';
import { FormatTable } from './FormatTable';
import { ThumbnailDownloader } from './ThumbnailDownloader';
import { EngineSelector } from './EngineSelector';
import { DownloadActionModal } from './DownloadActionModal';

interface VideoResultCardProps {
  videoInfo: VideoInfo;
  lang: Language;
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ videoInfo, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'thumbnails' | 'engines'>('video');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadModalType, setDownloadModalType] = useState<'video' | 'audio'>('video');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    await safeCopyText(videoInfo.videoUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openDownloadModal = (type: 'video' | 'audio') => {
    setDownloadModalType(type);
    setShowDownloadModal(true);
  };

  const quickMp4Url = videoInfo.isInstagram
    ? `https://fastdl.app/en?url=${encodeURIComponent(videoInfo.videoUrl)}`
    : `https://www.y2mate.com/youtube/${videoInfo.videoId}`;
  const quickMp3Url = videoInfo.isInstagram
    ? `https://www.save-insta.com/reels-downloader/`
    : `https://yt1s.com/en/youtube-to-mp3?q=https://www.youtube.com/watch?v=${videoInfo.videoId}`;

  return (
    <section id="result-section" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Video Header Info Bar */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* Thumbnail with Play Overlay */}
            <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-neutral-950 shrink-0 group border border-neutral-800">
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = videoInfo.thumbnails.hq;
                }}
              />
              <button
                id="play-preview-overlay-btn"
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
                title={t.watchPreview}
              >
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </button>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-bold bg-black/80 text-white flex items-center gap-1 backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                <span>HD Video</span>
              </div>
            </div>

            {/* Video Details */}
            <div className="flex-1 w-full min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  videoInfo.isInstagram 
                    ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {videoInfo.isInstagram ? 'Instagram Video' : 'YouTube Video'}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  ID: {videoInfo.videoId}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-heading font-bold text-neutral-100 leading-snug line-clamp-2 mb-2">
                {videoInfo.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mb-4">
                <span>
                  {t.channel}:{' '}
                  {videoInfo.authorUrl ? (
                    <a
                      href={videoInfo.authorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-200 hover:text-red-400 font-semibold transition-colors underline-offset-2 hover:underline"
                    >
                      {videoInfo.author}
                    </a>
                  ) : (
                    <span className="text-neutral-200 font-semibold">{videoInfo.author}</span>
                  )}
                </span>
              </div>

              {/* Action Buttons: Quick Downloads & Share */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Quick MP4 Direct In-App Download */}
                <button
                  id="quick-mp4-download-btn"
                  type="button"
                  onClick={() => openDownloadModal('video')}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md shadow-red-950/40 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'तुरंत MP4 डाउनलोड' : 'Direct MP4 Download'}</span>
                  <Sparkles className="w-3 h-3 text-amber-300 ml-0.5" />
                </button>

                {/* Quick MP3 Direct In-App Download */}
                <button
                  id="quick-mp3-download-btn"
                  type="button"
                  onClick={() => openDownloadModal('audio')}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-neutral-800 hover:bg-neutral-750 text-neutral-100 hover:text-white border border-neutral-700 shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5 text-red-400" />
                  <span>{lang === 'hi' ? 'तुरंत MP3 ऑडियो' : 'Direct MP3 Audio'}</span>
                  <Sparkles className="w-3 h-3 text-amber-300 ml-0.5" />
                </button>

                {/* Quick Jump to Thumbnail Download */}
                {!videoInfo.isInstagram && (
                  <button
                    id="quick-thumb-download-btn"
                    type="button"
                    onClick={() => setActiveTab('thumbnails')}
                    className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-neutral-800/90 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'hi' ? 'HD थंबनेल' : 'HD Thumbnail'}</span>
                  </button>
                )}

                {/* Open all servers modal */}
                <button
                  id="open-all-servers-btn"
                  type="button"
                  onClick={() => openDownloadModal('video')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'सभी 4 सर्वर' : 'All 4 Servers'}</span>
                </button>

                <button
                  id="copy-video-link-btn"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 flex items-center gap-1.5 transition-colors ml-auto"
                  title="Copy video link"
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

        {/* Format & Engine Tabs */}
        <div className="bg-neutral-950/50 border-b border-neutral-800 px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
            <button
              id="tab-btn-video"
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'video'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{t.tabVideo}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {videoInfo.isInstagram ? 'HD' : '1080p'}
              </span>
            </button>

            <button
              id="tab-btn-audio"
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'audio'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>{t.tabAudio}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                320k
              </span>
            </button>

            {!videoInfo.isInstagram && (
              <button
                id="tab-btn-thumbnails"
                type="button"
                onClick={() => setActiveTab('thumbnails')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'thumbnails'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{t.tabThumbnails}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                  1080p
                </span>
              </button>
            )}

            <button
              id="tab-btn-engines"
              type="button"
              onClick={() => setActiveTab('engines')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-heading font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'engines'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>{t.tabEngines}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">
                {videoInfo.isInstagram ? '4 Servers' : 'Fast'}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 bg-neutral-900">
          {activeTab === 'video' && (
            <div>
              <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
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
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
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
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>{t.thumbnailTabDesc}</span>
              </p>
              <ThumbnailDownloader videoInfo={videoInfo} lang={lang} />
            </div>
          )}

          {activeTab === 'engines' && (
            <div>
              <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>{t.enginesTabDesc}</span>
              </p>
              <EngineSelector engines={videoInfo.engines} lang={lang} />
            </div>
          )}
        </div>
      </div>

      {/* Embedded Video Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-neutral-200 line-clamp-1">
                {videoInfo.title}
              </h3>
              <button
                id="close-preview-modal-btn"
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={videoInfo.isInstagram ? "w-full max-w-sm mx-auto h-[550px] max-h-[75vh] bg-black flex items-center justify-center" : "aspect-video w-full bg-black"}>
              <iframe
                src={videoInfo.isInstagram ? videoInfo.embedUrl : `${videoInfo.embedUrl}?autoplay=1`}
                title={videoInfo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Download Action Modal for Verified High-Speed Servers */}
      <DownloadActionModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        videoInfo={videoInfo}
        selectedFormat={null}
        type={downloadModalType}
        lang={lang}
      />
    </section>
  );
};
