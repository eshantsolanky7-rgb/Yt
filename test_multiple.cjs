async function testReel(shortcode) {
  try {
    const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
    console.log(`Reel ${shortcode} Embed Status:`, res.status);
    const html = await res.text();

    const videoMatch = html.match(/\\"video_url\\":\\"([^"]+)\\"/);
    if (!videoMatch) {
      console.log(`Reel ${shortcode}: No video_url match`);
      return;
    }

    let cleanUrl = videoMatch[1]
      .replaceAll('\\\\\\/', '/')
      .replaceAll('\\\\/', '/')
      .replaceAll('\\/', '/')
      .replaceAll('\\\\u00253D', '%3D')
      .replaceAll('\\u00253D', '%3D')
      .replaceAll('\\\\u0026', '&')
      .replaceAll('\\u0026', '&')
      .replaceAll('\\\\', '');

    console.log(`Reel ${shortcode} Video URL:`, cleanUrl.substring(0, 80));

    const vidRes = await fetch(cleanUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.instagram.com/"
      }
    });
    console.log(`Reel ${shortcode} MP4 Status:`, vidRes.status, "Length:", vidRes.headers.get("content-length"));

    // Extract thumbnail
    const imgMatch = html.match(/\\"display_url\\":\\"([^"]+)\\"/) || html.match(/<img[^>]*class="[^"]*EmbeddedMediaImage[^"]*"[^>]*src="([^"]+)"/);
    if (imgMatch) {
      const cleanImg = imgMatch[1].replaceAll('\\/', '/').replaceAll('\\u0026', '&').replaceAll('&amp;', '&');
      console.log(`Reel ${shortcode} Thumbnail:`, cleanImg.substring(0, 80));
    }
  } catch(e) {
    console.error(`Reel ${shortcode} Error:`, e.message);
  }
}

async function run() {
  await testReel("C-ZdGoxv_cb");
  await testReel("C-p5SL3SHVw");
}

run();
