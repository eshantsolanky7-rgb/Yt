import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper functions to extract IDs from various formats
function extractVideoId(input: unknown): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Pure 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // standard watch URL: https://www.youtube.com/watch?v=...
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // short URL: https://youtu.be/...
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // shorts URL: https://www.youtube.com/shorts/...
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // embed URL: https://www.youtube.com/embed/...
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // live URL: https://www.youtube.com/live/...
  const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  return null;
}

function extractInstagramShortcode(input: unknown): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // 1. Direct match with standard Instagram domains and paths
  // Matches: /reel/ID, /reels/ID, /p/ID, /tv/ID, /share/reel/ID, /share/p/ID, /share/ID, /username/reel/ID
  const domainPattern = /(?:instagram\.com|instagr\.am)\/(?:[^\/?#\s]+\/)?(?:share\/(?:reel|p)?\/|p\/|reel\/|reels\/|tv\/)?([A-Za-z0-9_-]{9,15})/i;
  const domainMatch = trimmed.match(domainPattern);
  if (domainMatch && domainMatch[1]) return domainMatch[1];

  // 2. Relative paths or /reel/ID anywhere in the string
  const pathPattern = /(?:^|[\/\s])(?:share\/(?:reel|p)\/|p\/|reel\/|reels\/|tv\/)([A-Za-z0-9_-]{9,15})/i;
  const pathMatch = trimmed.match(pathPattern);
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  // 3. Raw shortcode (typically 11 characters like C8q72N_vL-i)
  const rawMatch = trimmed.match(/^[A-Za-z0-9_-]{9,15}$/);
  if (rawMatch) return rawMatch[0];

  return null;
}

// Generate a high-resolution, branded Instagram Reel poster SVG that never fails to render
function generateInstagramSvg(shortcode: string): string {
  const code = (shortcode || "").toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#405de6"/>
      <stop offset="20%" stop-color="#5851db"/>
      <stop offset="40%" stop-color="#833ab4"/>
      <stop offset="60%" stop-color="#c13584"/>
      <stop offset="80%" stop-color="#e1306c"/>
      <stop offset="100%" stop-color="#fd1d1d"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
  </defs>

  <rect width="800" height="450" fill="url(#ig-gradient)"/>
  <rect width="800" height="450" fill="url(#overlay)"/>

  <circle cx="700" cy="80" r="140" fill="rgba(255,255,255,0.06)"/>
  <circle cx="100" cy="380" r="180" fill="rgba(0,0,0,0.15)"/>

  <g transform="translate(400, 160)" filter="url(#shadow)">
    <rect x="-50" y="-50" width="100" height="100" rx="26" fill="none" stroke="#ffffff" stroke-width="8"/>
    <circle cx="0" cy="0" r="24" fill="none" stroke="#ffffff" stroke-width="8"/>
    <circle cx="28" cy="-28" r="5" fill="#ffffff"/>
  </g>

  <g text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
    <rect x="330" y="235" width="140" height="26" rx="13" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="400" y="252" fill="#ffffff" font-size="12" font-weight="700" letter-spacing="1.5">INSTAGRAM</text>
    <text x="400" y="295" fill="#ffffff" font-size="26" font-weight="800" letter-spacing="0.5">REEL VIDEO PREVIEW</text>
    <text x="400" y="332" fill="#fbbf24" font-size="16" font-weight="700" font-family="monospace" letter-spacing="1">ID: ${code}</text>
    <text x="400" y="390" fill="#e2e8f0" font-size="13" font-weight="600" opacity="0.85">S_series India • HD Video Downloader</text>
  </g>
</svg>`;
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), app: "Media Saver" });
});

// API: Dynamic Instagram SVG Thumbnail
app.get("/api/ig-thumbnail/:shortcode", (req, res) => {
  const shortcode = req.params.shortcode || "";
  const svg = generateInstagramSvg(shortcode);
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(svg);
});

// API: Get video metadata & format choices
app.get("/api/info", async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ error: "Please provide a valid URL." });
    }

    const isInstagram = /(?:instagram\.com|instagr\.am)/i.test(rawUrl) || Boolean(extractInstagramShortcode(rawUrl));

    if (isInstagram) {
      const shortcode = extractInstagramShortcode(rawUrl);
      if (!shortcode) {
        return res.status(400).json({ error: "Invalid Instagram URL. Please enter a valid Reel, Post or Share link." });
      }

      try {
        // High-resolution reliable SVG thumbnail
        const thumbnail = `/api/ig-thumbnail/${shortcode}`;
        const fallbackThumbnail = "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1000&auto=format&fit=crop";

        // Try extracting author username if present in URL
        let author = "Instagram Creator";
        const userMatch = rawUrl.match(/(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.]+)\/(?:reel|reels|p|tv)\//i);
        if (userMatch && userMatch[1] && !['reel', 'reels', 'p', 'tv', 'share'].includes(userMatch[1].toLowerCase())) {
          author = userMatch[1];
        }

        const title = author && author !== "Instagram Creator" 
          ? `Instagram Reel by @${author} (${shortcode})` 
          : `Instagram Reel (${shortcode})`;

        const igReelUrl = `https://www.instagram.com/reel/${shortcode}/`;
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/`;

        // Return comprehensive Instagram payload with formats, embedUrl and dedicated engines
        return res.json({
          videoId: shortcode,
          videoUrl: igReelUrl,
          title,
          author,
          authorUrl: author !== "Instagram Creator" ? `https://www.instagram.com/${author}/` : igReelUrl,
          thumbnail,
          thumbnails: {
            maxres: thumbnail,
            hq: thumbnail,
            mq: thumbnail,
            standard: fallbackThumbnail
          },
          isInstagram: true,
          embedUrl,
          videoFormats: [
            {
              id: "1080p",
              quality: "1080p",
              label: "Full HD (1080p)",
              ext: "mp4",
              resolution: "Original HD",
              qualityLabel: "1080p Original",
              approxSize: "~ 15 - 40 MB",
              badge: "Original HD"
            },
            {
              id: "720p",
              quality: "720p",
              label: "HD (720p)",
              ext: "mp4",
              resolution: "720p",
              qualityLabel: "720p HD",
              approxSize: "~ 8 - 20 MB",
              badge: "Popular"
            },
            {
              id: "480p",
              quality: "480p",
              label: "Fast SD (480p)",
              ext: "mp4",
              resolution: "480p",
              qualityLabel: "480p Mobile",
              approxSize: "~ 4 - 10 MB",
              badge: "Fast"
            }
          ],
          audioFormats: [
            {
              id: "320k",
              quality: "320 kbps",
              label: "MP3 Reel Audio (320 kbps)",
              ext: "mp3",
              bitrate: "320 kbps",
              approxSize: "~ 3 - 6 MB",
              badge: "HQ Audio"
            },
            {
              id: "128k",
              quality: "128 kbps",
              label: "MP3 Standard (128 kbps)",
              ext: "mp3",
              bitrate: "128 kbps",
              approxSize: "~ 1 - 3 MB",
              badge: "Original Sound"
            }
          ],
          engines: [
            {
              id: "fastdl",
              name: "Server 1: FastDL Pro (HD MP4)",
              description: "Fastest 1-click downloader for Instagram Reels & Videos in original HD quality",
              url: `https://fastdl.app/en?url=${encodeURIComponent(igReelUrl)}`,
              recommended: true,
              badge: "Fastest"
            },
            {
              id: "snapsave",
              name: "Server 2: SnapSave / SnapInsta HD",
              description: "High-speed clean server for Instagram reels, videos and carousel posts",
              url: `https://snapsave.app/`,
              recommended: false,
              badge: "Full HD"
            },
            {
              id: "saveinsta",
              name: "Server 3: Save-Insta (Reels & Audio)",
              description: "Direct Instagram reel and MP3 audio extractor with instant high-quality output",
              url: `https://www.save-insta.com/reels-downloader/`,
              recommended: false,
              badge: "Direct Audio/Video"
            },
            {
              id: "indown",
              name: "Server 4: InDown Direct Saver",
              description: "Direct Instagram reel saver with high quality video output without popups",
              url: `https://indown.io/`,
              recommended: false,
              badge: "Reliable"
            }
          ]
        });
      } catch (igErr) {
        console.error("Instagram info error:", igErr);
        return res.status(500).json({ error: "Failed to fetch Instagram details. Please try again." });
      }
    }

    // YouTube logic
    const videoId = extractVideoId(rawUrl);
    if (!videoId) {
      return res.status(400).json({
        error: "Invalid YouTube URL. Please enter a valid link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)"
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

    let title = `YouTube Video (${videoId})`;
    let author = "YouTube Creator";
    let authorUrl = "";
    let embedHtml = "";

    try {
      const oembedRes = await fetch(oembedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) title = data.title;
        if (data.author_name) author = data.author_name;
        if (data.author_url) authorUrl = data.author_url;
        if (data.html) embedHtml = data.html;
      }
    } catch {
      // Fallback silently if oembed has network issue
    }

    // Check high-res thumbnail availability
    let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    try {
      const maxresUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      const headCheck = await fetch(maxresUrl, { method: "HEAD" });
      if (headCheck.ok && headCheck.headers.get("content-type")?.includes("image")) {
        thumbnail = maxresUrl;
      }
    } catch {
      // Default to hqdefault
    }

    const responsePayload = {
      videoId,
      videoUrl,
      title: title + " - Media Saver",
      author,
      authorUrl,
      thumbnail,
      thumbnails: {
        maxres: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        hq: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        mq: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        standard: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`
      },
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      videoFormats: [
        {
          id: "1080p",
          quality: "1080p",
          label: "Full HD 1080p",
          ext: "mp4",
          resolution: "1920x1080",
          qualityLabel: "1080p60 / 1080p",
          approxSize: "~ 45 - 120 MB",
          badge: "Full HD"
        },
        {
          id: "720p",
          quality: "720p",
          label: "HD 720p",
          ext: "mp4",
          resolution: "1280x720",
          qualityLabel: "720p60 / 720p",
          approxSize: "~ 25 - 60 MB",
          badge: "Popular"
        },
        {
          id: "480p",
          quality: "480p",
          label: "SD 480p",
          ext: "mp4",
          resolution: "854x480",
          qualityLabel: "480p Standard",
          approxSize: "~ 15 - 35 MB",
          badge: "Standard"
        },
        {
          id: "360p",
          quality: "360p",
          label: "Normal 360p",
          ext: "mp4",
          resolution: "640x360",
          qualityLabel: "360p Normal",
          approxSize: "~ 8 - 18 MB",
          badge: "Compact"
        },
        {
          id: "240p",
          quality: "240p",
          label: "Mobile 240p",
          ext: "mp4",
          resolution: "426x240",
          qualityLabel: "240p Low",
          approxSize: "~ 4 - 9 MB",
          badge: "Data Saver"
        }
      ],
      audioFormats: [
        {
          id: "320k",
          quality: "320 kbps",
          label: "MP3 Studio HD (320 kbps)",
          ext: "mp3",
          bitrate: "320 kbps",
          approxSize: "~ 9 - 14 MB",
          badge: "Highest Quality"
        },
        {
          id: "256k",
          quality: "256 kbps",
          label: "MP3 High (256 kbps)",
          ext: "mp3",
          bitrate: "256 kbps",
          approxSize: "~ 7 - 11 MB",
          badge: "Crystal Clear"
        },
        {
          id: "192k",
          quality: "192 kbps",
          label: "MP3 Standard (192 kbps)",
          ext: "mp3",
          bitrate: "192 kbps",
          approxSize: "~ 5 - 8 MB",
          badge: "Recommended"
        },
        {
          id: "128k",
          quality: "128 kbps",
          label: "MP3 Light (128 kbps)",
          ext: "mp3",
          bitrate: "128 kbps",
          approxSize: "~ 3 - 6 MB",
          badge: "Fastest"
        },
        {
          id: "m4a",
          quality: "M4A",
          label: "M4A Audio (AAC)",
          ext: "m4a",
          bitrate: "128-256 kbps",
          approxSize: "~ 4 - 8 MB",
          badge: "Original Codec"
        }
      ],
      engines: [
        {
          id: "y2mate",
          name: "Server 1: Y2Mate (Instant Converter)",
          description: "One-click 1080p MP4 and 320kbps MP3 conversion with instant download button",
          url: `https://www.y2mate.com/youtube/${videoId}`,
          recommended: true,
          badge: "Fastest"
        },
        {
          id: "yt1s",
          name: "Server 2: YT1S High-Speed Engine",
          description: "Clean multi-format conversion directly prefilled for your video",
          url: `https://yt1s.com/en/youtube-to-mp4?q=https://www.youtube.com/watch?v=${videoId}`,
          recommended: false,
          badge: "High Speed"
        },
        {
          id: "yt5s",
          name: "Server 3: YT5S Full HD Engine",
          description: "High quality server supporting 1080p, 720p, 480p and high-bitrate MP3",
          url: `https://yt5s.biz/en/youtube-to-mp4/?q=https://www.youtube.com/watch?v=${videoId}`,
          recommended: false,
          badge: "Full HD"
        },
        {
          id: "ss",
          name: "Server 4: SaveFrom / SS Engine",
          description: "Classic YouTube downloader with multiple format and quality streams",
          url: `https://ssyoutube.com/watch?v=${videoId}`,
          recommended: false,
          badge: "Direct"
        }
      ]
    };

    return res.json(responsePayload);
  } catch (error: any) {
    console.error("Error fetching video info:", error);
    return res.status(500).json({
      error: "Unable to process YouTube video. Please check the URL and try again."
    });
  }
});

// Helper to map formats
function mapDownloadFormat(format?: unknown): string {
  if (!format || typeof format !== "string") return "mp3";
  const f = format.toLowerCase().trim();
  if (
    f === "mp3" ||
    f.includes("audio") ||
    (f.includes("k") && (f.startsWith("320") || f.startsWith("256") || f.startsWith("192") || f.startsWith("128") || f.startsWith("64")))
  ) {
    return "mp3";
  }
  if (f === "m4a") return "m4a";
  if (f === "1080" || f === "1080p") return "1080";
  if (f === "720" || f === "720p") return "720";
  if (f === "480" || f === "480p") return "480";
  if (f === "360" || f === "360p") return "360";
  if (f === "4k" || f === "2160" || f === "1440") return "4k";
  if (f === "mp4") return "720";
  if (f === "hd") return "720";
  return "720";
}

// 1. API: Start video/audio conversion
app.post("/api/convert/start", async (req, res) => {
  try {
    const { videoId, format, isInstagram, url } = req.body || {};
    let targetId = typeof videoId === "string" ? videoId : "";
    let isIg = Boolean(isInstagram);

    if (!targetId && typeof url === "string") {
      const igCode = extractInstagramShortcode(url);
      if (igCode) {
        targetId = igCode;
        isIg = true;
      } else {
        targetId = extractVideoId(url) || "";
      }
    }

    if (!targetId) {
      return res.status(400).json({ error: "videoId or url is required" });
    }
    
    // For Instagram, avoid third-party timeouts and immediately provide direct resolution with FastDL & top engines
    if (isIg || targetId.length > 15 || targetId.includes("_")) {
      const cleanId = targetId.replace(/[^a-zA-Z0-9_-]/g, "");
      const igUrl = `https://www.instagram.com/reel/${cleanId}/`;
      const fastdlUrl = `https://fastdl.app/en?url=${encodeURIComponent(igUrl)}`;
      const snapsaveUrl = `https://snapsave.app/`;
      const saveinstaUrl = `https://www.save-insta.com/reels-downloader/`;
      const indownUrl = `https://indown.io/`;

      return res.json({
        success: true,
        isInstagram: true,
        id: `ig_${cleanId}`,
        title: `Instagram Reel (${cleanId})`,
        format: format || "mp4",
        full_format: "mp4 [HD Original]",
        direct_url: fastdlUrl,
        engines: [
          { name: "FastDL Pro (HD)", url: fastdlUrl },
          { name: "SnapSave HD", url: snapsaveUrl },
          { name: "Save-Insta", url: saveinstaUrl },
          { name: "InDown Saver", url: indownUrl }
        ]
      });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${targetId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const targetFormat = mapDownloadFormat(format);
    const apiUrl = `https://p.savenow.to/api/v2/download?url=${encodeURIComponent(videoUrl)}&format=${targetFormat}&button=1`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Conversion server unavailable. Try again in a moment." });
    }

    const data = await response.json();
    return res.json({
      success: true,
      id: data.id,
      title: data.title || "",
      format: targetFormat,
      full_format: data.full_format || targetFormat,
      progress_url: data.progress_url
    });
  } catch (err: any) {
    console.error("Conversion start error:", err);
    return res.status(500).json({ error: "Failed to initialize conversion" });
  }
});

// 2. API: Check conversion progress
app.get("/api/convert/status", async (req, res) => {
  try {
    const id = req.query.id as string;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Conversion id is required" });
    }

    // Immediate resolution for Instagram conversions
    if (id.startsWith("ig_")) {
      const shortcode = id.replace("ig_", "");
      const igUrl = `https://www.instagram.com/reel/${shortcode}/`;
      const fastdlUrl = `https://fastdl.app/en?url=${encodeURIComponent(igUrl)}`;

      return res.json({
        success: 1,
        progress: 100,
        download_url: fastdlUrl,
        text: "Instagram Reel Ready!",
        title: `Instagram Reel (${shortcode})`,
        format: "mp4 [HD]"
      });
    }

    const progressUrl = `https://p.savenow.to/api/progress?id=${encodeURIComponent(id)}`;
    const response = await fetch(progressUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to check progress" });
    }

    const data = await response.json();
    const progressPercent = typeof data.progress === 'number'
      ? Math.min(100, Math.round(data.progress / 10))
      : (data.success === 1 ? 100 : 0);

    return res.json({
      success: data.success,
      progress: progressPercent,
      download_url: data.download_url || null,
      text: data.text || "",
      title: data.title || "",
      format: data.format || ""
    });
  } catch (err: any) {
    console.error("Conversion check error:", err);
    return res.status(500).json({ error: "Failed to query conversion status" });
  }
});

// 3. Fast direct download redirect (polls until finished and redirects to raw file)
app.get("/api/direct-download", async (req, res) => {
  try {
    const videoId = req.query.videoId as string;
    const format = (req.query.format as string) || "mp4";
    const isInstagram = req.query.isInstagram === 'true' || req.query.isInstagram === '1';

    if (!videoId || typeof videoId !== "string") {
      return res.status(400).send("Video ID required");
    }

    const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");

    // Direct Instagram download redirect using FastDL
    if (isInstagram) {
      const igUrl = `https://www.instagram.com/reel/${cleanId}/`;
      return res.redirect(302, `https://fastdl.app/en?url=${encodeURIComponent(igUrl)}`);
    }

    const targetFormat = mapDownloadFormat(format);
    const videoUrl = `https://www.youtube.com/watch?v=${cleanId}`;

    const startRes = await fetch(`https://p.savenow.to/api/v2/download?url=${encodeURIComponent(videoUrl)}&format=${targetFormat}&button=1`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept": "application/json" }
    });

    const startData = await startRes.json();
    if (!startData || !startData.id) {
      return res.redirect(302, `https://www.y2mate.com/youtube/${cleanId}`);
    }

    const convId = startData.id;
    let downloadUrl = "";
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(`https://p.savenow.to/api/progress?id=${encodeURIComponent(convId)}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      const pollData = await pollRes.json();
      if (pollData && pollData.success === 1 && pollData.download_url) {
        downloadUrl = pollData.download_url;
        break;
      }
    }

    if (downloadUrl) {
      return res.redirect(302, downloadUrl);
    } else {
      return res.redirect(302, `https://www.y2mate.com/youtube/${cleanId}`);
    }
  } catch (err) {
    return res.redirect(302, `https://www.y2mate.com/youtube/${req.query.videoId}`);
  }
});

// Direct Download Redirect Endpoint
app.get("/api/download-redirect", (req, res) => {
  const { videoId, engine, format } = req.query;
  if (!videoId || typeof videoId !== "string") {
    return res.status(400).send("Video ID required");
  }

  const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
  let target = `https://www.y2mate.com/youtube/${cleanId}`;

  if (engine === "yt1s") {
    target = format === "mp3"
      ? `https://yt1s.com/en/youtube-to-mp3?q=https://www.youtube.com/watch?v=${cleanId}`
      : `https://yt1s.com/en/youtube-to-mp4?q=https://www.youtube.com/watch?v=${cleanId}`;
  } else if (engine === "yt5s") {
    target = `https://yt5s.biz/en/youtube-to-${format === "mp3" ? "mp3" : "mp4"}/?q=https://www.youtube.com/watch?v=${cleanId}`;
  } else if (engine === "ss") {
    target = `https://ssyoutube.com/watch?v=${cleanId}`;
  }

  return res.redirect(302, target);
});

// API: Download thumbnail with forced attachment download & CORS headers
app.get("/api/download-thumbnail", async (req, res) => {
  try {
    // Enable CORS for universal download and iframe blob access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Length");

    const videoId = req.query.videoId as string;
    const quality = (req.query.quality as string) || "maxresdefault";

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).send("Invalid Video ID");
    }

    const cleanQuality = ["maxresdefault", "hqdefault", "mqdefault", "sddefault"].includes(quality)
      ? quality
      : "hqdefault";

    const fetchImageWithHeaders = async (url: string) => {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
          }
        });
        if (!response.ok) return null;
        const arrayBuf = await response.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        // YouTube sometimes returns a 1097 byte gray placeholder for missing maxresdefault
        if (buf.length < 1500 && cleanQuality === "maxresdefault") {
          return null;
        }
        return buf;
      } catch {
        return null;
      }
    };

    let buffer = await fetchImageWithHeaders(`https://i.ytimg.com/vi/${videoId}/${cleanQuality}.jpg`);

    // Fallback cascade if quality is not available
    if (!buffer && cleanQuality === "maxresdefault") {
      buffer = await fetchImageWithHeaders(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
    }
    if (!buffer) {
      buffer = await fetchImageWithHeaders(`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`);
    }
    if (!buffer) {
      buffer = await fetchImageWithHeaders(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
    }
    if (!buffer) {
      buffer = await fetchImageWithHeaders(`https://i.ytimg.com/vi/${videoId}/default.jpg`);
    }

    if (!buffer) {
      return res.status(404).send("Thumbnail not found");
    }

    const filename = `YouTube_Thumbnail_${videoId}_${cleanQuality}.jpg`;
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length.toString());
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.end(buffer);
  } catch (err: any) {
    console.error("Thumbnail download error:", err);
    return res.status(500).send("Error downloading thumbnail");
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
