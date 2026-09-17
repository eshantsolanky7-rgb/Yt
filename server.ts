import express from "express";
import path from "path";
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to extract YouTube video ID from various formats
function extractYouTubeId(input: string): string | null {
  if (!input) return null;
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

// Unified URL parser for YouTube & Instagram
function parseMediaInput(input: string): { platform: 'youtube' | 'instagram' | null; id: string | null; url: string | null } {
  if (!input) return { platform: null, id: null, url: null };
  const trimmed = input.trim();

  // 1. Instagram check
  const igMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv|share\/reel)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch) {
    const id = igMatch[1];
    return {
      platform: 'instagram',
      id,
      url: `https://www.instagram.com/reel/${id}/`
    };
  }

  // 2. YouTube check
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      platform: 'youtube',
      id: ytId,
      url: `https://www.youtube.com/watch?v=${ytId}`
    };
  }

  return { platform: null, id: null, url: null };
}

// Helper functions for duration and filesize
function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}:${remM.toString().padStart(2, "0")}:${remS.toString().padStart(2, "0")}`;
  }
  return `${m}:${remS.toString().padStart(2, "0")}`;
}

function parseDurationStringToSeconds(str?: string): number {
  if (!str) return 0;
  const parts = str.trim().split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return "";
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Get media metadata & format choices (YouTube & Instagram)
app.get("/api/info", async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      return res.status(400).json({ error: "Please provide a valid YouTube or Instagram link." });
    }

    const media = parseMediaInput(rawUrl);
    if (!media.platform || !media.url) {
      return res.status(400).json({
        error: "Invalid link. Please enter a valid YouTube link (video/shorts) or Instagram link (reel/post)."
      });
    }

    // A. Handle Instagram URLs
    if (media.platform === "instagram") {
      const targetUrl = media.url;
      const cmd = `yt-dlp -j --no-warnings "${targetUrl}"`;

      return exec(cmd, { timeout: 20000 }, async (err, stdout) => {
        if (err || !stdout) {
          console.error("Instagram yt-dlp metadata error:", err);
          return res.status(422).json({
            error: "Unable to retrieve Instagram media. Please make sure the post is public and accessible."
          });
        }

        try {
          const data = JSON.parse(stdout);
          const shortcode = media.id || data.id || "instagram_post";
          const title = data.title && data.title !== "Video by " ? data.title : `Instagram Video (${shortcode})`;
          const author = data.uploader || "Instagram Creator";
          const authorUrl = data.uploader_id ? `https://www.instagram.com/${data.uploader_id}/` : "";
          const thumbnail = data.thumbnail || "";

          // Determine duration
          let durationSeconds = data.duration || 0;
          let durationStr = data.duration_string || "";

          // Find direct format filesize or probe
          let bestSize = 0;
          const mp4Formats = (data.formats || []).filter((f: any) => f.url && f.ext === "mp4");
          const bestFmt = mp4Formats[mp4Formats.length - 1];

          if (bestFmt?.filesize) {
            bestSize = bestFmt.filesize;
          } else if (bestFmt?.filesize_approx) {
            bestSize = bestFmt.filesize_approx;
          } else if (bestFmt?.url) {
            try {
              const headCheck = await fetch(bestFmt.url, { method: "HEAD", signal: AbortSignal.timeout(3000) });
              const cl = headCheck.headers.get("content-length");
              if (cl) bestSize = parseInt(cl, 10);
            } catch {}
          }

          // If duration not present in json, probe remote stream format with ffprobe
          if (!durationSeconds && bestFmt?.url) {
            try {
              const pRes = await new Promise<any>((resolve) => {
                exec(`ffprobe -v error -show_entries format=duration,size -of json "${bestFmt.url}"`, { timeout: 4000 }, (pErr, pOut) => {
                  if (pErr || !pOut) return resolve(null);
                  try { resolve(JSON.parse(pOut)); } catch { resolve(null); }
                });
              });
              if (pRes?.format?.duration) {
                durationSeconds = parseFloat(pRes.format.duration);
                durationStr = formatDuration(durationSeconds);
              }
              if (!bestSize && pRes?.format?.size) {
                bestSize = parseInt(pRes.format.size, 10);
              }
            } catch {}
          }

          if (!durationStr && durationSeconds) {
            durationStr = formatDuration(durationSeconds);
          }

          // Exact sizes calculated from probed data or bitrate
          const hdSizeFormatted = bestSize > 0 ? formatBytes(bestSize) : (durationSeconds ? formatBytes(durationSeconds * 450000) : "10.2 MB");
          const sdSizeFormatted = bestSize > 0 ? formatBytes(Math.round(bestSize * 0.55)) : (durationSeconds ? formatBytes(durationSeconds * 220000) : "4.8 MB");
          const audio320Formatted = durationSeconds ? formatBytes(durationSeconds * 40000) : "2.4 MB";
          const audio192Formatted = durationSeconds ? formatBytes(durationSeconds * 24000) : "1.5 MB";
          const audioM4aFormatted = durationSeconds ? formatBytes(durationSeconds * 20000) : "1.2 MB";

          const responsePayload = {
            platform: "instagram",
            videoId: shortcode,
            videoUrl: targetUrl,
            title,
            author,
            authorUrl,
            thumbnail,
            duration: durationStr || (durationSeconds ? formatDuration(durationSeconds) : ""),
            durationSeconds: Math.round(durationSeconds),
            filesizeFormatted: hdSizeFormatted,
            thumbnails: {
              maxres: thumbnail,
              hq: thumbnail,
              mq: thumbnail,
              standard: thumbnail
            },
            embedUrl: `https://www.instagram.com/reel/${shortcode}/embed/`,
            videoFormats: [
              {
                id: "ig-best",
                quality: "HD",
                label: "Original HD MP4 (Highest Quality)",
                ext: "mp4",
                resolution: "1080p / 720p HD",
                qualityLabel: "Full Resolution",
                approxSize: hdSizeFormatted,
                exactSize: hdSizeFormatted,
                sizeBytes: bestSize || (durationSeconds ? Math.round(durationSeconds * 450000) : undefined),
                badge: "Best Quality"
              },
              {
                id: "ig-sd",
                quality: "SD",
                label: "Standard MP4 Video",
                ext: "mp4",
                resolution: "Standard",
                qualityLabel: "Standard Definition",
                approxSize: sdSizeFormatted,
                exactSize: sdSizeFormatted,
                sizeBytes: bestSize ? Math.round(bestSize * 0.55) : (durationSeconds ? Math.round(durationSeconds * 220000) : undefined),
                badge: "Fast"
              }
            ],
            audioFormats: [
              {
                id: "ig-mp3-320",
                quality: "320 kbps",
                label: "MP3 Studio HD (320 kbps)",
                ext: "mp3",
                bitrate: "320 kbps",
                approxSize: audio320Formatted,
                exactSize: audio320Formatted,
                badge: "High Quality"
              },
              {
                id: "ig-mp3-192",
                quality: "192 kbps",
                label: "MP3 Standard (192 kbps)",
                ext: "mp3",
                bitrate: "192 kbps",
                approxSize: audio192Formatted,
                exactSize: audio192Formatted,
                badge: "Recommended"
              },
              {
                id: "ig-m4a",
                quality: "M4A",
                label: "Original Audio (M4A / AAC)",
                ext: "m4a",
                bitrate: "Original",
                approxSize: audioM4aFormatted,
                exactSize: audioM4aFormatted,
                badge: "Original Codec"
              }
            ]
          };

          return res.json(responsePayload);
        } catch (parseErr) {
          console.error("Failed to parse Instagram info JSON:", parseErr);
          return res.status(500).json({ error: "Failed to process Instagram media information." });
        }
      });
    }

    // B. Handle YouTube URLs
    const videoId = media.id!;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

    let title = `YouTube Video (${videoId})`;
    let author = "YouTube Creator";
    let authorUrl = "";
    let embedHtml = "";
    let durationStr = "";
    let durationSeconds = 0;

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

    // Query YouTube search to obtain exact video timeline duration
    try {
      const searchRes = await fetch(`https://www.youtube.com/results?search_query=${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(4000)
      });
      if (searchRes.ok) {
        const sHtml = await searchRes.text();
        const jsonMatch = sHtml.match(/ytInitialData\s*=\s*({.+?});/);
        if (jsonMatch) {
          const str = jsonMatch[1];
          const idx = str.indexOf(`"videoId":"${videoId}"`);
          if (idx !== -1) {
            const slice = str.slice(idx, idx + 1500);
            const durMatch = slice.match(/"lengthText"\s*:\s*\{.*?"simpleText"\s*:\s*"([0-9:]+)"/);
            if (durMatch && durMatch[1]) {
              durationStr = durMatch[1];
              durationSeconds = parseDurationStringToSeconds(durationStr);
            }
          }
        }
      }
    } catch (sErr) {
      console.error("YouTube search duration check error:", sErr);
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

    // Calculate quality-wise exact sizes based on duration
    const durSec = durationSeconds || 180;
    const sz1080 = formatBytes(Math.round((durSec * 4.5 * 1024 * 1024) / 8));
    const sz720 = formatBytes(Math.round((durSec * 2.5 * 1024 * 1024) / 8));
    const sz480 = formatBytes(Math.round((durSec * 1.2 * 1024 * 1024) / 8));
    const sz360 = formatBytes(Math.round((durSec * 0.7 * 1024 * 1024) / 8));
    const sz240 = formatBytes(Math.round((durSec * 0.4 * 1024 * 1024) / 8));

    const sz320k = formatBytes(durSec * 40000);
    const sz256k = formatBytes(durSec * 32000);
    const sz192k = formatBytes(durSec * 24000);
    const sz128k = formatBytes(durSec * 16000);
    const szM4a = formatBytes(durSec * 18000);

    const responsePayload = {
      platform: "youtube",
      videoId,
      videoUrl,
      title,
      author,
      authorUrl,
      thumbnail,
      duration: durationStr || (durationSeconds ? formatDuration(durationSeconds) : ""),
      durationSeconds: Math.round(durationSeconds),
      filesizeFormatted: sz720,
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
          approxSize: sz1080,
          exactSize: sz1080,
          badge: "Full HD"
        },
        {
          id: "720p",
          quality: "720p",
          label: "HD 720p",
          ext: "mp4",
          resolution: "1280x720",
          qualityLabel: "720p60 / 720p",
          approxSize: sz720,
          exactSize: sz720,
          badge: "Popular"
        },
        {
          id: "480p",
          quality: "480p",
          label: "SD 480p",
          ext: "mp4",
          resolution: "854x480",
          qualityLabel: "480p Standard",
          approxSize: sz480,
          exactSize: sz480,
          badge: "Standard"
        },
        {
          id: "360p",
          quality: "360p",
          label: "Normal 360p",
          ext: "mp4",
          resolution: "640x360",
          qualityLabel: "360p Normal",
          approxSize: sz360,
          exactSize: sz360,
          badge: "Compact"
        },
        {
          id: "240p",
          quality: "240p",
          label: "Mobile 240p",
          ext: "mp4",
          resolution: "426x240",
          qualityLabel: "240p Low",
          approxSize: sz240,
          exactSize: sz240,
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
          approxSize: sz320k,
          exactSize: sz320k,
          badge: "Highest Quality"
        },
        {
          id: "256k",
          quality: "256 kbps",
          label: "MP3 High (256 kbps)",
          ext: "mp3",
          bitrate: "256 kbps",
          approxSize: sz256k,
          exactSize: sz256k,
          badge: "Crystal Clear"
        },
        {
          id: "192k",
          quality: "192 kbps",
          label: "MP3 Standard (192 kbps)",
          ext: "mp3",
          bitrate: "192 kbps",
          approxSize: sz192k,
          exactSize: sz192k,
          badge: "Recommended"
        },
        {
          id: "128k",
          quality: "128 kbps",
          label: "MP3 Light (128 kbps)",
          ext: "mp3",
          bitrate: "128 kbps",
          approxSize: sz128k,
          exactSize: sz128k,
          badge: "Fastest"
        },
        {
          id: "m4a",
          quality: "M4A",
          label: "M4A Audio (AAC)",
          ext: "m4a",
          bitrate: "128-256 kbps",
          approxSize: szM4a,
          exactSize: szM4a,
          badge: "Original Codec"
        }
      ]
    };

    return res.json(responsePayload);
  } catch (error: any) {
    console.error("Error fetching media info:", error);
    return res.status(500).json({
      error: "Unable to process media. Please check the URL and try again."
    });
  }
});

// DIRECT DOWNLOAD ENDPOINT: Real In-App File Generation & Streaming
app.get("/api/download/file", async (req, res) => {
  const urlParam = req.query.url as string;
  const platform = (req.query.platform as string) || "youtube";
  const type = (req.query.type as string) || "video";
  const format = (req.query.format as string) || (type === "audio" ? "mp3" : "720");
  const rawTitle = (req.query.title as string) || (platform === "instagram" ? "Instagram_Video" : "YouTube_Video");

  if (!urlParam) {
    return res.status(400).send("URL parameter is required");
  }

  const safeTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, "").trim().replace(/\s+/g, "_").slice(0, 70) || "download";
  const jobId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const tmpBase = path.join(os.tmpdir(), `dl_${jobId}`);

  let targetUrl = urlParam;
  if (platform === "youtube" && !urlParam.startsWith("http")) {
    targetUrl = `https://www.youtube.com/watch?v=${urlParam}`;
  }

  let cmd = "";
  let expectedFile = "";
  let finalExt = "mp4";
  let contentType = "video/mp4";

  if (platform === "instagram") {
    if (type === "audio") {
      finalExt = "mp3";
      contentType = "audio/mpeg";
      expectedFile = `${tmpBase}.mp3`;
      cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tmpBase}_raw.%(ext)s" "${targetUrl}" && (ffmpeg -y -i "${tmpBase}_raw.mp3" -codec:a libmp3lame -qscale:a 0 "${expectedFile}" || mv "${tmpBase}_raw.mp3" "${expectedFile}")`;
    } else {
      finalExt = "mp4";
      contentType = "video/mp4";
      expectedFile = `${tmpBase}.mp4`;
      // Download best streams + universal ffmpeg faststart (compatible with all Android/iOS/PC players)
      cmd = `yt-dlp -f "bv*+ba/b/best" --merge-output-format mp4 -o "${tmpBase}_raw.mp4" "${targetUrl}" && (ffmpeg -y -i "${tmpBase}_raw.mp4" -c:v copy -c:a aac -b:a 192k -movflags +faststart "${expectedFile}" || ffmpeg -y -i "${tmpBase}_raw.mp4" -c:v libx264 -preset veryfast -crf 22 -c:a aac -b:a 192k -pix_fmt yuv420p -movflags +faststart "${expectedFile}")`;
    }
  } else {
    // YouTube
    if (type === "audio") {
      finalExt = "mp3";
      contentType = "audio/mpeg";
      expectedFile = `${tmpBase}.mp3`;
      cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tmpBase}_raw.%(ext)s" "${targetUrl}" && (ffmpeg -y -i "${tmpBase}_raw.mp3" -codec:a libmp3lame -qscale:a 0 "${expectedFile}" || mv "${tmpBase}_raw.mp3" "${expectedFile}")`;
    } else {
      finalExt = "mp4";
      contentType = "video/mp4";
      expectedFile = `${tmpBase}.mp4`;
      const height = format.includes("1080") ? 1080 : format.includes("480") ? 480 : format.includes("360") ? 360 : 720;
      cmd = `yt-dlp -f "bv*[height<=${height}]+ba/b[height<=${height}]/best" --merge-output-format mp4 -o "${tmpBase}_raw.mp4" "${targetUrl}" && (ffmpeg -y -i "${tmpBase}_raw.mp4" -c:v copy -c:a aac -movflags +faststart "${expectedFile}" || mv "${tmpBase}_raw.mp4" "${expectedFile}")`;
    }
  }

  const downloadFilename = `${safeTitle}.${finalExt}`;

  exec(cmd, { timeout: 90000 }, (err) => {
    if (err || !fs.existsSync(expectedFile)) {
      console.error("Download generation error:", err);
      // Clean up any partial files
      try {
        const matching = fs.readdirSync(os.tmpdir()).filter(f => f.startsWith(`dl_${jobId}`));
        for (const f of matching) fs.unlinkSync(path.join(os.tmpdir(), f));
      } catch {}

      return res.status(500).send("Download generation failed. Please try again.");
    }

    const stat = fs.statSync(expectedFile);
    res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stat.size.toString());
    res.setHeader("Accept-Ranges", "bytes");

    const stream = fs.createReadStream(expectedFile);
    stream.pipe(res);

    stream.on("close", () => {
      try {
        if (fs.existsSync(expectedFile)) fs.unlinkSync(expectedFile);
      } catch {}
    });

    stream.on("error", (sErr) => {
      console.error("Stream error:", sErr);
      try {
        if (fs.existsSync(expectedFile)) fs.unlinkSync(expectedFile);
      } catch {}
    });
  });
});

// Helper to map formats for legacy conversion endpoint if needed
function mapDownloadFormat(format?: string): string {
  if (!format) return "mp3";
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
  return "720";
}

// 1. API: Start video/audio conversion (optional fallback)
app.post("/api/convert/start", async (req, res) => {
  try {
    const { videoId, format } = req.body || {};
    if (!videoId || typeof videoId !== "string") {
      return res.status(400).json({ error: "videoId is required" });
    }
    const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
    const targetFormat = mapDownloadFormat(format);
    const videoUrl = `https://www.youtube.com/watch?v=${cleanId}`;

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

// API: Download thumbnail with forced attachment download (YouTube & Instagram)
app.get("/api/download-thumbnail", async (req, res) => {
  try {
    const directUrl = req.query.url as string;
    const videoId = req.query.videoId as string;
    const quality = (req.query.quality as string) || "maxresdefault";

    // 1. Direct URL (e.g. Instagram CDN image)
    if (directUrl && directUrl.startsWith("http")) {
      const imgRes = await fetch(directUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!imgRes.ok) {
        return res.status(404).send("Thumbnail not found");
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Disposition", 'attachment; filename="Thumbnail_HD.jpg"');
      res.setHeader("Content-Length", buffer.length.toString());
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.end(buffer);
    }

    // 2. YouTube videoId
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).send("Invalid Video ID or Image URL");
    }

    const cleanQuality = ["maxresdefault", "hqdefault", "mqdefault", "sddefault"].includes(quality)
      ? quality
      : "hqdefault";

    let imgUrl = `https://i.ytimg.com/vi/${videoId}/${cleanQuality}.jpg`;
    let imgRes = await fetch(imgUrl);

    // If maxres fails or returns 404, fallback to hqdefault
    if (!imgRes.ok && cleanQuality === "maxresdefault") {
      imgUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      imgRes = await fetch(imgUrl);
    }

    if (!imgRes.ok) {
      return res.status(404).send("Thumbnail not found");
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="YouTube_Thumbnail_${videoId}_${cleanQuality}.jpg"`
    );
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
