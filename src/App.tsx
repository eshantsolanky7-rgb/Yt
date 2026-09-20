import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { VideoResultCard } from './components/VideoResultCard';
import { RecentHistory } from './components/RecentHistory';
import { HowToGuide } from './components/HowToGuide';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { VideoInfo, HistoryItem, Language } from './types';
import { translations } from './translations';

const HISTORY_KEY = 'yt_downloader_history_v1';
const LANG_KEY = 'yt_downloader_lang_v1';

export default function App() {
  // Default to Hindi since user requested in Hindi, or load from saved preference
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Clean and normalize history items so all properties are guaranteed valid strings
      return parsed
        .filter((item: any) => item && typeof item === 'object')
        .map((item: any) => {
          const vid = item.videoId || '';
          const fallbackUrl = vid
            ? (vid.length > 15 || item.isInstagram
                ? `https://www.instagram.com/reel/${vid}/`
                : `https://www.youtube.com/watch?v=${vid}`)
            : '';
          const resolvedUrl = item.videoUrl || item.url || fallbackUrl || '';
          return {
            id: String(item.id || `hist-${vid || Math.random()}-${Date.now()}`),
            videoId: String(vid),
            videoUrl: String(resolvedUrl),
            title: String(item.title || 'Video'),
            author: String(item.author || ''),
            thumbnail: String(item.thumbnail || (vid ? (item.isInstagram ? `/api/ig-thumbnail/${vid}` : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`) : '')),
            timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
            isInstagram: Boolean(item.isInstagram || (item.videoUrl && (item.videoUrl.includes('instagram.com') || item.videoUrl.includes('instagr.am')))),
          };
        })
        .filter((item: HistoryItem) => Boolean(item.videoUrl && item.videoUrl.trim()));
    } catch {
      return [];
    }
  });

  const resultRef = useRef<HTMLDivElement>(null);

  // Sync language setting to localStorage
  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  };

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  const fetchVideoInfo = async (customUrl?: string) => {
    const rawTarget = typeof customUrl === 'string' ? customUrl : (urlInput || '');
    const targetUrl = (rawTarget || '').trim();
    if (!targetUrl) {
      setErrorMessage(translations[lang]?.errorInvalidUrl || 'Please enter a valid URL.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || translations[lang]?.errorGeneric || 'Failed to fetch video details.');
        setIsLoading(false);
        return;
      }

      setVideoInfo(data);
      setUrlInput(String(data.videoUrl || targetUrl));

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `${data.videoId || Date.now()}-${Date.now()}`,
        videoId: String(data.videoId || ''),
        videoUrl: String(data.videoUrl || targetUrl),
        title: String(data.title || 'Video'),
        author: String(data.author || ''),
        thumbnail: String(data.thumbnail || ''),
        timestamp: Date.now(),
        isInstagram: Boolean(data.isInstagram),
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.videoId !== data.videoId && item.videoUrl !== newHistoryItem.videoUrl);
        return [newHistoryItem, ...filtered].slice(0, 8);
      });

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(translations[lang]?.errorGeneric || 'Failed to fetch video details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (selected: HistoryItem | string) => {
    let resolvedUrl = '';
    if (typeof selected === 'string') {
      resolvedUrl = selected;
    } else if (selected && typeof selected === 'object') {
      resolvedUrl = selected.videoUrl || (selected as any).url || '';
      if (!resolvedUrl && selected.videoId) {
        resolvedUrl = selected.isInstagram || (selected.videoId && (selected.videoId.length > 15 || selected.videoId.includes('_')))
          ? `https://www.instagram.com/reel/${selected.videoId}/`
          : `https://www.youtube.com/watch?v=${selected.videoId}`;
      }
    }
    const safeUrl = (resolvedUrl || '').trim();
    if (!safeUrl) return;
    setUrlInput(safeUrl);
    fetchVideoInfo(safeUrl);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navigation Header */}
      <Header lang={lang} onToggleLang={handleToggleLang} />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Search & Hero Section */}
        <SearchHero
          lang={lang}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onFetch={fetchVideoInfo}
        />

        {/* Video Result Card */}
        <div ref={resultRef}>
          {videoInfo && <VideoResultCard videoInfo={videoInfo} lang={lang} />}
        </div>

        {/* Recent Search History */}
        <RecentHistory
          history={history}
          lang={lang}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
          onRemoveItem={handleRemoveHistoryItem}
        />

        {/* How to Guide and Features */}
        <HowToGuide lang={lang} />

        {/* FAQs */}
        <FAQSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}
