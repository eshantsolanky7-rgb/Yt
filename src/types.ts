export interface FormatOption {
  id: string;
  quality: string;
  label: string;
  ext: 'mp4' | 'mp3' | 'm4a' | 'webm';
  resolution?: string;
  qualityLabel?: string;
  bitrate?: string;
  approxSize: string;
  exactSize?: string;
  sizeBytes?: number;
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
  platform: 'youtube' | 'instagram';
  videoId: string;
  videoUrl: string;
  title: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  thumbnails: ThumbnailsMap;
  embedUrl?: string;
  duration?: string;
  durationSeconds?: number;
  filesizeFormatted?: string;
  videoFormats: FormatOption[];
  audioFormats: FormatOption[];
  engines?: EngineOption[];
}

export interface HistoryItem {
  id: string;
  platform?: 'youtube' | 'instagram';
  videoId: string;
  videoUrl?: string;
  title: string;
  author: string;
  thumbnail: string;
  duration?: string;
  timestamp: number;
}

export type Language = 'en' | 'hi';
