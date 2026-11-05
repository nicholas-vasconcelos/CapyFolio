// Renders the animated title cards frame by frame (deterministic, 30 fps).
// Usage: node render-cards.js <outDir>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const FPS = 30;
const CARDS = { intro: 4.5, problem: 5.5, outro: 6.5 };

(async () => {
  const out = process.argv[2];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const stage = 'file://' + path.resolve(__dirname, 'stage.html');
  for (const [scene, secs] of Object.entries(CARDS)) {
    const dir = path.join(out, scene);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir);
    await page.goto(`${stage}?scene=${scene}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const n = Math.round(secs * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate((ms) => window.seek(ms), (i * 1000) / FPS);
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', path.join(out, `${scene}.mp4`)]);
    console.log('rendered', scene, n, 'frames');
  }
  // Static frame backgrounds are rendered by record-demo.js.
  await browser.close();
})();
