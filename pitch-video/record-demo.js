// Records the live CapyFolio walkthrough with a visible cursor, via the Chrome
// screencast (lossless PNG frames + timestamps), then cuts it into captioned steps.
// Usage: node record-demo.js <baseUrl> <outDir>
//   e.g. node record-demo.js https://capyfolioprototype.vercel.app out
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const BASE = (process.argv[2] || 'https://capyfolioprototype.vercel.app').replace(/\/$/, '');
const OUT = path.resolve(process.argv[3] || 'out');
const FPS = 30;
const W = 1440, H = 810;

// Step captions (pt-BR, matching the slides). `path` is shown in the fake URL bar.
const STEPS = [
  { id: 'login',     path: '/login',     cap: 'Entre com sua <span>conta institucional</span>' },
  { id: 'feed',      path: '/feed',      cap: 'Acompanhe o <span>feed acadêmico</span>' },
  { id: 'projetos',  path: '/projetos',  cap: 'Explore <span>projetos reais</span> de estudantes' },
  { id: 'eventos',   path: '/eventos',   cap: 'Inscreva-se em <span>eventos e hackathons</span>' },
  { id: 'portfolio', path: '/perfil',    cap: 'Seu <span>portfólio</span>, num só lugar' },
];

const CURSOR = `
(() => {
  const install = () => {
    if (document.getElementById('__cur')) return;
    const c = document.createElement('div');
    c.id = '__cur';
    c.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.6z" fill="#182536" stroke="#FAF7F2" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: 2147483647, pointerEvents: 'none',
      transform: 'translate(' + (window.__cx ?? 720) + 'px,' + (window.__cy ?? 600) + 'px)', filter: 'drop-shadow(2px 3px 0 rgba(0,0,0,.25))' });
    document.documentElement.appendChild(c);
    addEventListener('mousemove', (e) => { window.__cx = e.clientX; window.__cy = e.clientY;
      c.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)'; }, true);
    addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      Object.assign(r.style, { position: 'fixed', left: e.clientX - 26 + 'px', top: e.clientY - 26 + 'px', width: '52px', height: '52px',
        borderRadius: '50%', border: '4px solid #FEA402', zIndex: 2147483646, pointerEvents: 'none' });
      document.documentElement.appendChild(r);
      r.animate([{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.4)', opacity: 0 }], { duration: 550, easing: 'ease-out' }).onfinish = () => r.remove();
    }, true);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', install); else install();
})();`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const framesDir = path.join(OUT, 'frames');
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'pt-BR' });
  await ctx.addInitScript(CURSOR);
  // Hide broken <img> glyphs if an external photo host is unreachable.
  await ctx.addInitScript(() => addEventListener('error', (e) => { if (e.target.tagName === 'IMG') e.target.style.visibility = 'hidden'; }, true));
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  let mx = 720, my = 600;
  const sleep = (ms) => page.waitForTimeout(ms);
  const glide = async (x, y, ms = 650) => {
    const n = Math.max(8, Math.round(ms / 16));
    const sx = mx, sy = my;
    for (let i = 1; i <= n; i++) {
      const t = i / n, e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      await page.mouse.move(sx + (x - sx) * e, sy + (y - sy) * e);
      await sleep(ms / n);
    }
    mx = x; my = y;
  };
  const point = async (loc, ms) => {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    await glide(b.x + b.width / 2, b.y + b.height / 2, ms);
  };
  const click = async (loc, ms) => { await point(loc, ms); await sleep(140); await page.mouse.down(); await sleep(70); await page.mouse.up(); };
  const scrollBy = async (dy, ms = 900) => {
    await page.evaluate(([dy, ms]) => new Promise((res) => {
      const y0 = scrollY, t0 = performance.now();
      const f = (now) => { const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3);
        scrollTo(0, y0 + dy * e); t < 1 ? requestAnimationFrame(f) : res(); };
      requestAnimationFrame(f);
    }), [dy, ms]);
  };

  // Clean session, preload the login page before recording starts.
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(mx, my);

  // ---- start capture ----
  const frames = [];
  cdp.on('Page.screencastFrame', async (f) => {
    frames.push({ t: f.metadata.timestamp, data: f.data });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
  });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await sleep(300);
  const marks = {};
  const mark = async (id) => { marks[id] = Date.now() / 1000; };

  // 1. Login
  await mark('login');
  await sleep(500);
  const email = page.locator('input[type=email]');
  await click(email, 700);
  await page.keyboard.type('arthur@ibmec.br', { delay: 55 });
  await click(page.locator('input[type=password]'), 450);
  await page.keyboard.type('123456', { delay: 80 });
  await sleep(250);
  await click(page.getByRole('button', { name: 'Entrar', exact: true }), 550);
  await page.waitForURL('**/feed');
  await sleep(1300);

  // 2. Feed
  await mark('feed');
  await sleep(500);
  await glide(520, 450, 600);
  await scrollBy(300, 1000);
  await sleep(300);
  const like = page.locator('button.cf-counter').first();
  await click(like, 700);
  await sleep(700);
  await scrollBy(420, 1100);
  await sleep(900);

  // 3. Projetos
  await mark('projetos');
  await click(page.getByRole('link', { name: 'Projetos', exact: true }).first(), 650);
  await page.waitForURL('**/projetos');
  await page.evaluate(() => scrollTo(0, 0));
  await sleep(900);
  await scrollBy(260, 900);
  await sleep(300);
  const card = page.locator('a[href^="/projeto/"]').nth(1);
  await click(card, 700);
  await page.waitForURL('**/projeto/**');
  await sleep(1100);
  await scrollBy(380, 1100);
  await sleep(1000);

  // 4. Eventos
  await mark('eventos');
  await click(page.getByRole('link', { name: 'Eventos', exact: true }).first(), 700);
  await page.waitForURL('**/eventos');
  await page.evaluate(() => scrollTo(0, 0));
  await sleep(700);
  await scrollBy(330, 900);
  await sleep(300);
  await click(page.getByRole('button', { name: 'Inscrever-se' }).first(), 700);
  await sleep(1600);

  // 5. Meu Portfólio
  await mark('portfolio');
  await click(page.getByRole('link', { name: 'Meu Portfólio' }).first(), 700);
  await page.waitForURL('**/perfil');
  await page.evaluate(() => scrollTo(0, 0));
  await sleep(1500);
  await glide(1000, 520, 700);
  await sleep(400);
  await scrollBy(560, 1400);
  await sleep(2200);
  await mark('end');

  await cdp.send('Page.stopScreencast');
  await sleep(200);
  await browser.close();

  // ---- frames -> per-step CFR clips ----
  frames.sort((a, b) => a.t - b.t);
  const lines = [];
  frames.forEach((f, i) => {
    const file = path.join(framesDir, `s${String(i).padStart(5, '0')}.png`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    f.file = file;
  });
  const ids = STEPS.map((s) => s.id);
  const bounds = ids.map((id, i) => [marks[id], marks[ids[i + 1]] ?? marks.end]);
  bounds.forEach(([a, b], i) => {
    const list = [];
    // frame visible at time a = last frame with t <= a
    let k = frames.findIndex((f) => f.t > a) - 1; if (k < 0) k = 0;
    for (let t = a; k < frames.length && t < b;) {
      const next = Math.min(b, frames[k + 1]?.t ?? b);
      list.push(`file '${frames[k].file}'\nduration ${Math.max(0.001, next - t).toFixed(4)}`);
      t = next; k++;
    }
    list.push(`file '${frames[Math.min(k, frames.length) - 1].file}'`);
    const lf = path.join(OUT, `${ids[i]}.txt`);
    fs.writeFileSync(lf, list.join('\n') + '\n');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lf, '-vf', `fps=${FPS},format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', path.join(OUT, `raw_${ids[i]}.mp4`)]);
    console.log('step', ids[i], (b - a).toFixed(2) + 's');
  });

  // ---- static frame backgrounds (browser chrome + caption) ----
  const b2 = await chromium.launch();
  const p2 = await b2.newPage({ viewport: { width: 1920, height: 1080 } });
  const stage = 'file://' + path.resolve(__dirname, 'stage.html');
  for (const [i, s] of STEPS.entries()) {
    const q = new URLSearchParams({ scene: 'frame', path: s.path, step: String(i + 1), cap: s.cap });
    await p2.goto(`${stage}?${q}`);
    await p2.evaluate(() => document.fonts.ready);
    await p2.screenshot({ path: path.join(OUT, `bg_${s.id}.png`) });
  }
  await b2.close();
  fs.writeFileSync(path.join(OUT, 'steps.json'), JSON.stringify(STEPS.map((s, i) => ({ ...s, dur: bounds[i][1] - bounds[i][0] })), null, 2));
})();
