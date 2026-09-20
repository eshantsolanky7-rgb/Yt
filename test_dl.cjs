const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

function downloadReel(shortcode) {
  return new Promise((resolve, reject) => {
    const outDir = "/tmp/reels";
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${shortcode}.mp4`);

    if (fs.existsSync(outPath)) {
      console.log("Already cached at:", outPath);
      return resolve(outPath);
    }

    const url = `https://www.instagram.com/reel/${shortcode}/`;
    console.log("Starting yt-dlp for:", url);
    const startTime = Date.now();

    execFile("/usr/local/bin/yt-dlp", [
      "-f", "b/bv*+ba/b",
      "--merge-output-format", "mp4",
      "-o", outPath,
      "--no-playlist",
      url
    ], (err, stdout, stderr) => {
      if (err) {
        console.error("Error downloading:", err);
        return reject(err);
      }
      console.log(`Downloaded in ${Date.now() - startTime}ms. File size:`, fs.statSync(outPath).size);
      resolve(outPath);
    });
  });
}

async function run() {
  const filePath = await downloadReel("C-ZdGoxv_cb");
  console.log("Success! File available at:", filePath);
}

run();
