const fs = require("fs");
const html = fs.readFileSync("/tmp/embed.html", "utf8");

const match = html.match(/\\"video_url\\":\\"([^"]+)\\"/);
if (match) {
  let raw = match[1];
  let clean = raw
    .replaceAll('\\\\\\/', '/')
    .replaceAll('\\\\/', '/')
    .replaceAll('\\/', '/')
    .replaceAll('\\\\u00253D', '%3D')
    .replaceAll('\\u00253D', '%3D')
    .replaceAll('\\\\u0026', '&')
    .replaceAll('\\u0026', '&')
    .replaceAll('\\\\', '');

  console.log("Clean URL:\n", clean);

  fetch(clean, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Referer": "https://www.instagram.com/",
      "Accept": "*/*"
    }
  }).then(async res => {
    console.log("Fetch Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Content-Length:", res.headers.get("content-length"));
    if (res.status !== 200) {
      console.log("Body:", await res.text());
    } else {
      console.log("SUCCESS! Video streamable and downloadable directly!");
    }
  });
}


