async function test() {
  const url = "https://www.instagram.com/reel/C-H5tlhOMNC/embed/";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    
    // Check for display_url or video_url or poster or caption
    const displayMatch = html.match(/"display_url":"([^"]+)"/);
    console.log("display_url:", displayMatch ? displayMatch[1].replace(/\\u0026/g, "&") : "none");
    
    const videoUrlMatch = html.match(/"video_url":"([^"]+)"/);
    console.log("video_url:", videoUrlMatch ? videoUrlMatch[1].replace(/\\u0026/g, "&") : "none");

    const captionMatch = html.match(/"caption":\{"text":"([^"]+)"/);
    console.log("caption:", captionMatch ? captionMatch[1] : "none");

    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    console.log("title:", titleMatch ? titleMatch[1] : "none");

    const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+property="og:image"/);
    console.log("og:image:", ogImage ? ogImage[1] : "none");
  } catch (err) {
    console.error("Error:", err);
  }
}
test();

