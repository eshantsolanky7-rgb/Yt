export interface FormatOption {
  id: string;
  quality: string;
  label: string;
  ext: 'mp4' | 'mp3' | 'm4a' | 'webm';
  resolution?: string;
  qualityLabel?: string;
  bitrate?: string;
  approxSize: string;
  badge?: string;
  note?: string;
}

export interface EngineOption {
  id: string;
  name: string;
  description: string;
  url: string;
  recommended?: boolean;
  badge?: string;
}

export interface ThumbnailsMap {
  maxres: string;
  hq: string;
  mq: string;
  standard: string;
}

export interface VideoInfo {
  videoId: string;
  videoUrl: string;
  title: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  thumbnails: ThumbnailsMap;
  embedUrl: string;
  videoFormats: FormatOption[];
  audioFormats: FormatOption[];
  engines: EngineOption[];
  isInstagram?: boolean;
}

export interface HistoryItem {
  id: string;
  videoId: string;
  videoUrl: string;
  title: string;
  author: string;
  thumbnail: string;
  timestamp: number;
  isInstagram?: boolean;
}

export type Language = 'en' | 'hi';
