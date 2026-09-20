async function inspect(shortcode) {
  const res = await fetch(`https://www.instagram.com/reel/${shortcode}/embed/`);
  const html = await res.text();
  console.log(`--- ${shortcode} ---`);
  console.log("Length:", html.length);
  const title = html.match(/<title>([^<]+)<\/title>/);
  console.log("Title:", title ? title[1] : "none");
  const hasMp4 = html.includes(".mp4");
  console.log("Has .mp4:", hasMp4);
  const hasVideoUrl = html.includes("video_url");
  console.log("Has video_url:", hasVideoUrl);
  const hasEmbeddedMedia = html.includes("EmbeddedMedia");
  console.log("Has EmbeddedMedia:", hasEmbeddedMedia);
  const imgs = html.match(/<img[^>]+>/g) || [];
  console.log("Img count:", imgs.length);
  if (imgs.length > 0) {
    console.log("First img:", imgs[0].substring(0, 150));
  }
}

async function run() {
  await inspect("C-ZdGoxv_cb");
  await inspect("C-p5SL3SHVw");
}
run();
