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

const HISTORY_KEY = 'yt_downloader_history_v2';
const LANG_KEY = 'yt_downloader_lang_v1';

export default function App() {
  // Default to Hindi since user requested in Hindi, or load from saved preference
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
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
    const targetUrl = (customUrl || urlInput).trim();
    if (!targetUrl) {
      setErrorMessage(translations[lang].errorInvalidUrl);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || translations[lang].errorGeneric);
        setIsLoading(false);
        return;
      }

      setVideoInfo(data);
      setUrlInput(data.videoUrl || targetUrl);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `${data.videoId}-${Date.now()}`,
        platform: data.platform || 'youtube',
        videoId: data.videoId,
        videoUrl: data.videoUrl,
        title: data.title,
        author: data.author,
        thumbnail: data.thumbnail,
        duration: data.duration,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.videoId !== data.videoId);
        return [newHistoryItem, ...filtered].slice(0, 8);
      });

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(translations[lang].errorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    const fullUrl = item.videoUrl || (item.platform === 'instagram' ? `https://www.instagram.com/reel/${item.videoId}/` : `https://www.youtube.com/watch?v=${item.videoId}`);
    setUrlInput(fullUrl);
    fetchVideoInfo(fullUrl);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white">
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
