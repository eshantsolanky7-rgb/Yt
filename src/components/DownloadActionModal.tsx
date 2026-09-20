import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Download,
  Zap,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Server,
  FileVideo,
  FileAudio,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { FormatOption, Language, VideoInfo } from '../types';
import { safeCopyText } from '../utils';

interface DownloadActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoInfo: VideoInfo;
  selectedFormat: FormatOption | null;
  type: 'video' | 'audio';
  lang: Language;
}

export const DownloadActionModal: React.FC<DownloadActionModalProps> = ({
  isOpen,
  onClose,
  videoInfo,
  selectedFormat,
  type,
  lang,
}) => {
  const [copiedTrick, setCopiedTrick] = useState<string | null>(null);
  
  // Real conversion state
  const [conversionState, setConversionState] = useState<'idle' | 'converting' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<string>('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Determine conversion format key
  const getFormatKey = () => {
    if (selectedFormat) {
      if (type === 'audio') return 'mp3';
      const label = selectedFormat.label.toLowerCase();
      if (label.includes('1080')) return '1080';
      if (label.includes('720')) return '720';
      if (label.includes('480')) return '480';
      if (label.includes('360')) return '360';
      if (label.includes('4k') || label.includes('2160') || label.includes('1440')) return '4k';
      return '720';
    }
    return type === 'audio' ? 'mp3' : '720';
  };

  const cleanTitle = (videoInfo?.title || 'Media-Saver')
    .replace(/[/\\?%*:|"<>]/g, '')
    .trim() || 'Media-Saver';

  const formatKey = getFormatKey();
  const fileExt = type === 'audio' ? 'mp3' : 'mp4';
  const targetFilename = `${cleanTitle} - Media Saver.${fileExt}`;

  // Start conversion when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setConversionState('idle');
      setProgress(0);
      setDownloadUrl(null);
      return;
    }

    startConversion();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, selectedFormat, type, videoInfo.videoId]);

  const startConversion = async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    setConversionState('converting');
    setProgress(15);
    setStatusText(lang === 'hi' ? 'कन्वर्टर शुरू हो रहा है...' : 'Initializing conversion engine...');
    setDownloadUrl(null);
    setActiveFormat(formatKey);

    try {
      const res = await fetch('/api/convert/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoInfo.videoId,
          format: formatKey,
          isInstagram: videoInfo.isInstagram,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to start conversion');
      }

      const data = await res.json();
      if (!data.success || !data.id) {
        throw new Error(data.error || 'No conversion ID received');
      }

      // Handle Instagram immediately without infinite polling
      if (data.isInstagram || videoInfo.isInstagram) {
        const directUrl = data.direct_url || `https://fastdl.app/en?url=${encodeURIComponent(videoInfo.videoUrl)}`;
        setProgress(100);
        setDownloadUrl(directUrl);
        setConversionState('ready');
        setStatusText(lang === 'hi' ? 'रील डाउनलोड तैयार है (FastDL Engine)!' : 'Instagram Reel Ready for Download!');
        return;
      }

      const conversionId = data.id;
      let currentProgress = 20;

      // Poll conversion status
      pollingRef.current = setInterval(async () => {
        try {
          currentProgress = Math.min(95, currentProgress + 10);
          setProgress(currentProgress);

          const statusRes = await fetch(`/api/convert/status?id=${encodeURIComponent(conversionId)}`);
          if (!statusRes.ok) return;

          const statusData = await statusRes.json();
          if (statusData.text) {
            setStatusText(statusData.text);
          }

          if (statusData.success === 1 && statusData.download_url) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setProgress(100);
            setDownloadUrl(statusData.download_url);
            setConversionState('ready');
            setStatusText(lang === 'hi' ? 'डाउनलोड तैयार है!' : 'Ready for download!');

            // Automatically trigger download
            triggerNativeDownload(statusData.download_url);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 1500);

      // Timeout safety after 30 seconds
      setTimeout(() => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          if (conversionState === 'converting') {
            setConversionState('error');
            setStatusText(lang === 'hi' ? 'सर्वर व्यस्त है, नीचे दिए गए डायरेक्ट सर्वर चुनें' : 'Server busy, please use direct servers below');
          }
        }
      }, 30000);

    } catch (err: any) {
      console.error('Conversion start failed:', err);
      setConversionState('error');
      setStatusText(lang === 'hi' ? 'कन्वर्जन में समय लग रहा है। कृपया नीचे दिए गए सर्वर आज़माएँ।' : 'Conversion timed out. Please try our direct mirrors below.');
    }
  };

  const triggerNativeDownload = (url: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', targetFilename);
      // Trigger native download directly without launching blank tab
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Trigger native download failed:', e);
    }
  };

  if (!isOpen) return null;

  const ytServers = [
    {
      id: 'y2mate',
      name: 'Server 1: Y2Mate (Instant)',
      nameHi: 'सर्वर 1: Y2Mate (हाई स्पीड)',
      desc: 'Instant 1080p/720p MP4 and 320kbps MP3 conversion with one click.',
      descHi: 'एक क्लिक में 1080p/720p MP4 वीडियो और 320kbps MP3 तुरंत डाउनलोड करें।',
      badge: 'Fastest',
      badgeHi: 'सबसे तेज़',
      url: `https://www.y2mate.com/youtube/${videoInfo.videoId}`,
      recommended: true,
    },
    {
      id: 'yt1s',
      name: `Server 2: YT1S (${type === 'audio' ? 'MP3 Engine' : 'MP4 HD'})`,
      nameHi: `सर्वर 2: YT1S (${type === 'audio' ? 'MP3 ऑडियो' : 'MP4 HD वीडियो'})`,
      desc: 'High speed clean converter with pre-selected format.',
      descHi: 'बिना विज्ञापन के डायरेक्ट डाउनलोड लिंक तैयार करने वाला तेज़ सर्वर।',
      badge: 'High Speed',
      badgeHi: 'हाई स्पीड',
      url: `https://yt1s.com/en/youtube-to-${type === 'audio' ? 'mp3' : 'mp4'}?q=https://www.youtube.com/watch?v=${videoInfo.videoId}`,
      recommended: false,
    },
    {
      id: 'ssyoutube',
      name: 'Server 3: SaveFrom / SS',
      nameHi: 'सर्वर 3: SaveFrom / SSYouTube',
      desc: 'Classic YouTube downloader with multiple format qualities.',
      descHi: 'क्लासिक लोकप्रिय डाउनलोडर - सभी क्वालिटी सपोर्ट करता है।',
      badge: 'Direct',
      badgeHi: 'डायरेक्ट',
      url: `https://ssyoutube.com/watch?v=${videoInfo.videoId}`,
      recommended: false,
    },
  ];

  const igServers = [
    {
      id: 'fastdl',
      name: 'Server 1: FastDL Pro (HD MP4)',
      nameHi: 'सर्वर 1: FastDL प्रो (HD MP4)',
      desc: 'Top 1-click Instagram Reel downloader with maximum speed and original HD quality.',
      descHi: 'इंस्टाग्राम रील्स और वीडियो को ओरिजिनल HD क्वालिटी में सबसे तेजी से सेव करें।',
      badge: 'Fastest',
      badgeHi: 'सबसे तेज',
      url: `https://fastdl.app/en?url=${encodeURIComponent(videoInfo.videoUrl)}`,
      recommended: true,
    },
    {
      id: 'snapsave',
      name: 'Server 2: SnapSave HD',
      nameHi: 'सर्वर 2: SnapSave HD',
      desc: 'Direct downloader for reels, stories and posts in full 1080p resolution.',
      descHi: 'रील्स और पोस्ट को फुल HD 1080p में सीधे डाउनलोड करें।',
      badge: '1080p HD',
      badgeHi: 'फुल HD',
      url: `https://snapsave.app/`,
      recommended: false,
    },
    {
      id: 'saveinsta',
      name: 'Server 3: Save-Insta (Reel & Audio)',
      nameHi: 'सर्वर 3: Save-Insta (रील व ऑडियो)',
      desc: 'Direct Instagram reel and MP3 audio extractor with instant high-quality output.',
      descHi: 'इंस्टाग्राम रील और MP3 ऑडियो को सीधे एक क्लिक में डाउनलोड करने का टूल।',
      badge: 'Direct Audio/Video',
      badgeHi: 'डायरेक्ट',
      url: `https://www.save-insta.com/reels-downloader/`,
      recommended: false,
    },
    {
      id: 'indown',
      name: 'Server 4: InDown Direct Saver',
      nameHi: 'सर्वर 4: InDown डायरेक्ट सेवर',
      desc: 'Clean direct reel saver with instant download without popups.',
      descHi: 'सीधे रील डाउनलोड करने वाला भरोसेमंद टूल।',
      badge: 'Reliable',
      badgeHi: 'विश्वसनीय',
      url: `https://indown.io/`,
      recommended: false,
    },
  ];

  const copyToClipboard = async (text: string, id: string) => {
    await safeCopyText(text);
    setCopiedTrick(id);
    setTimeout(() => setCopiedTrick(null), 2000);
  };

  const ppUrl = `https://www.youtubepp.com/watch?v=${videoInfo.videoId}`;
  const ssUrl = `https://www.ssyoutube.com/watch?v=${videoInfo.videoId}`;

  const servers = videoInfo.isInstagram ? igServers : ytServers;

  const widgetUrl = videoInfo.isInstagram 
    ? `https://p.savenow.to/api/button/?url=${encodeURIComponent(videoInfo.videoUrl || `https://www.instagram.com/reel/${videoInfo.videoId}/`)}&f=1080&color=dc2626`
    : `https://loader.to/api/button/?url=${encodeURIComponent(videoInfo.videoUrl || `https://www.youtube.com/watch?v=${videoInfo.videoId}`)}&f=${formatKey}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
              {type === 'audio' ? <FileAudio className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-neutral-100 flex items-center gap-2">
                <span>{lang === 'hi' ? 'डाउनलोड व कन्वर्जन' : 'Direct File Download'}</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-neutral-800 text-red-400 border border-neutral-700">
                  .{fileExt.toUpperCase()} {selectedFormat?.label ? `(${selectedFormat.label})` : ''}
                </span>
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-1 max-w-sm sm:max-w-md">
                {videoInfo.title}
              </p>
            </div>
          </div>

          <button
            id="close-download-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* PRIMARY: Direct File Download & Active Conversion Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-750 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h4 className="font-heading font-bold text-sm text-neutral-100">
                  {lang === 'hi' ? 'डायरेक्ट फाइल डाउनलोड' : 'Direct File Generator'}
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                {type === 'audio' ? 'Audio MP3 (320kbps)' : `Video MP4 (${selectedFormat?.label || 'HD'})`}
              </span>
            </div>

            {/* Converting State */}
            {conversionState === 'converting' && (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                    <span>{statusText || (lang === 'hi' ? 'फाइल तैयार की जा रही है...' : 'Generating download link...')}</span>
                  </div>
                  <span className="font-mono font-bold text-red-400">{progress}%</span>
                </div>

                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden border border-neutral-700/60">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  {lang === 'hi'
                    ? 'कृपया कुछ सेकंड रुकें। आपकी फाइल तैयार होते ही डाउनलोड अपने आप शुरू हो जाएगा।'
                    : 'Please wait a few seconds. The download will start automatically once ready.'}
                </p>
              </div>
            )}

            {/* Ready State */}
            {conversionState === 'ready' && downloadUrl && (
              <div className="space-y-3 py-2 animate-fadeIn">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {videoInfo.isInstagram
                      ? (lang === 'hi' ? 'रील डाउनलोड के लिए तैयार है! नीचे क्लिक करें और HD MP4 सेव करें:' : 'Instagram Reel is ready! Click below to download HD MP4:')
                      : (lang === 'hi' ? 'फाइल सफलतापूर्वक तैयार हो गई है! यदि डाउनलोड शुरू नहीं हुआ, तो नीचे बटन पर क्लिक करें:' : 'File is ready! If your download did not start automatically, click below:')
                    }
                  </span>
                </div>

                <a
                  id="direct-download-file-btn"
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={targetFilename}
                  className="w-full py-3 px-4 rounded-xl font-heading font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {videoInfo.isInstagram
                      ? (lang === 'hi' ? 'HD रील डाउनलोड करें (FastDL Engine)' : 'Download Reel (FastDL HD MP4)')
                      : (lang === 'hi' ? `${type === 'audio' ? 'MP3' : 'MP4'} फाइल सेव करें (${targetFilename})` : `Save ${type === 'audio' ? 'MP3 Audio' : 'MP4 Video'} (${targetFilename})`)
                    }
                  </span>
                </a>
              </div>
            )}

            {/* Error or Timeout State */}
            {conversionState === 'error' && (
              <div className="space-y-3 py-2">
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{lang === 'hi' ? 'कन्वर्टर धीमा चल रहा है' : 'Server is taking longer'}</p>
                    <p className="text-amber-400/80 text-[11px] mt-0.5">
                      {lang === 'hi'
                        ? 'कृपया फिर से प्रयास करें या नीचे दिए गए डायरेक्ट बैकअप सर्वर का उपयोग करें।'
                        : 'You can retry or click any of the instant backup servers below.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startConversion}
                  className="w-full py-2.5 px-4 rounded-xl font-heading font-semibold text-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry Conversion'}</span>
                </button>
              </div>
            )}

            {/* Embedded 1-Click Interactive Converter for both YouTube and Instagram */}
            <div className="pt-2 border-t border-neutral-800/80">
              <p className="text-[11px] font-semibold text-neutral-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>
                  {videoInfo.isInstagram
                    ? (lang === 'hi' ? '1-क्लिक फास्ट रील कन्वर्टर विजेट:' : '1-Click Fast Reel Converter Widget:')
                    : (lang === 'hi' ? '1-क्लिक फास्ट डाउनलोड विजेट (Loader Embed):' : '1-Click Fast Widget (Direct Stream):')}
                </span>
              </p>
              <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/80 p-2 flex justify-center">
                <iframe
                  src={widgetUrl}
                  width="100%"
                  height="65"
                  scrolling="no"
                  style={{ border: 'none' }}
                  title="Direct Download Widget"
                />
              </div>
            </div>

            {/* Instagram Quick Reel Link Copier */}
            {videoInfo.isInstagram && (
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span className="text-xs text-neutral-300">
                    {lang === 'hi' ? 'रील लिंक शेयर या कॉपी करें' : 'Instagram Reel URL'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(videoInfo.videoUrl, 'reel-link')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedTrick === 'reel-link' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTrick === 'reel-link' ? (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!') : (lang === 'hi' ? 'कॉपी लिंक' : 'Copy Link')}</span>
                </button>
              </div>
            )}
          </div>

          {/* BACKUP SERVERS: When direct stream is desired */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-red-400" />
              <span>{lang === 'hi' ? 'बैकअप हाई-स्पीड सर्वर लिंक्स' : 'Instant Backup Servers (Never Blocked)'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {servers.map((srv) => (
                <div
                  key={srv.id}
                  className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-heading font-semibold text-xs text-neutral-100 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-red-400" />
                        <span>{lang === 'hi' ? srv.nameHi.split('(')[0] : srv.name.split('(')[0]}</span>
                      </h5>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {lang === 'hi' ? srv.badgeHi : srv.badge}
                      </span>
                    </div>
                  </div>

                  <a
                    id={`modal-server-${srv.id}`}
                    href={srv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-2.5 rounded-lg font-heading font-semibold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer bg-neutral-800 hover:bg-red-600 hover:text-white text-neutral-300 border border-neutral-700 hover:border-red-500"
                  >
                    <Download className="w-3 h-3" />
                    <span>{lang === 'hi' ? 'डाउनलोड करें' : 'Open Server'}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Browser Tricks Section */}
          {!videoInfo.isInstagram && (
            <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-200">
                {lang === 'hi' ? 'सीक्रेट 1-सेकंड ब्राउज़र ट्रिक' : 'Secret 1-Second Browser Trick'}
              </h4>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {lang === 'hi'
                ? 'अपने ब्राउज़र एड्रेस बार में यूट्यूब लिंक में सिर्फ "pp" या "ss" जोड़ें और तुरंत डाउनलोड पेज खुल जाएगा:'
                : 'Simply add "pp" or "ss" to any YouTube URL in your browser address bar:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* PP Trick */}
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-neutral-300">
                    youtube<span className="text-red-400 font-bold">pp</span>.com
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {ppUrl}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ppUrl, 'pp')}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedTrick === 'pp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={ppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* SS Trick */}
              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-neutral-300">
                    <span className="text-red-400 font-bold">ss</span>youtube.com
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {ssUrl}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(ssUrl, 'ss')}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedTrick === 'ss' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={ssUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'hi' ? '100% सुरक्षित और वायरस-मुक्त' : '100% Safe & Direct Download'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-heading font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
