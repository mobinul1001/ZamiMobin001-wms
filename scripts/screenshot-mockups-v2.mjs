// Serves the repo root, and shoots the homepage mockup in both themes, desktop and mobile, full page and first screen.
// Also runs Lighthouse per theme, a contrast check on the theme colours, and checks the default theme follows the system.
// Usage: node scripts/screenshot-mockups-v2.mjs [--no-lighthouse]. With --serve it only serves on port 4396.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'reports/mockups-v2';
const PAGE = '/mockups/v2/home.html';
mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/_w') {
    const grow = u.searchParams.get('grow');
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end(`<!doctype html><body style="margin:0"><script>localStorage.setItem('wms-theme','${u.searchParams.get('t')}')</script><iframe id="f" src="${PAGE}" style="border:0;display:block;width:${u.searchParams.get('w')}px;height:${u.searchParams.get('h')}px"></iframe>${grow ? "<script>const f=document.getElementById('f');f.onload=()=>{const d=f.contentDocument;d.getElementById('cookie').hidden=true;d.querySelectorAll('.fade').forEach((e)=>e.classList.add('in'));d.querySelector('.top').style.position='static';const r=d.documentElement;f.style.height=r.scrollHeight+'px';document.body.dataset.h=r.scrollHeight;document.body.dataset.w=r.scrollWidth;document.body.dataset.theme=r.getAttribute('data-theme');};</script>" : ''}`);
  }
  // Lighthouse clears storage, so this route fixes the theme for it.
  if (u.pathname.startsWith('/_forced/')) {
    const theme = u.pathname.split('/')[2];
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end(readFileSync(`.${PAGE}`, 'utf8').replace(/t=matchMedia\([^?]*\?'dark':'light'/, `t='${theme}'`));
  }
  let f = join('.', decodeURIComponent(u.pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4396, r));
if (process.argv.includes('--serve')) { console.log('serving on 4396'); await new Promise(() => {}); }
const ORIGIN = 'http://localhost:4396';
const chrome = (args) => new Promise((done) => {
  let out = '';
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'mk-'))}`, '--force-device-scale-factor=1', '--virtual-time-budget=5000', ...args]);
  c.stdout.on('data', (d) => (out += d));
  c.on('exit', () => done(out));
});
const SIZES = { desktop: [1440, 900], mobile: [390, 844] };
const q = (t, w, h, grow) => `${ORIGIN}/_w?t=${t}&w=${w}&h=${h}${grow ? '&grow=1' : ''}`;
for (const t of ['dark', 'light']) for (const [size, [w, h]] of Object.entries(SIZES)) {
  const dom = await chrome(['--dump-dom', q(t, w, h, true)]);
  const pageH = +(/data-h="(\d+)"/.exec(dom)?.[1] ?? 0);
  const pageW = +(/data-w="(\d+)"/.exec(dom)?.[1] ?? 0);
  const applied = /data-theme="(\w+)"/.exec(dom)?.[1];
  if (!pageH) throw new Error(`no height for ${t} ${size}`);
  const raw = resolve(OUT, `_${t}-${size}.png`);
  await chrome([`--window-size=${Math.max(w, 500)},${pageH}`, `--screenshot=${raw}`, q(t, w, h, true)]);
  await sharp(raw).extract({ left: 0, top: 0, width: w, height: pageH }).png({ compressionLevel: 9 }).toFile(join(OUT, `${t}-${size}-full.png`));
  await chrome([`--window-size=${Math.max(w, 500)},${h}`, `--screenshot=${raw}`, q(t, w, h)]);
  await sharp(raw).extract({ left: 0, top: 0, width: w, height: h }).png({ compressionLevel: 9 }).toFile(join(OUT, `${t}-${size}-first-screen.png`));
  rmSync(raw);
  console.log(`${t}-${size}: ${pageW}x${pageH}, theme applied: ${applied}${pageW > w ? ' HORIZONTAL OVERFLOW' : ''}`);
}

// Contrast of theme colours (WCAG, 4.5:1 for text), including both ends of each button gradient.
const lum = (hex) => { const h = hex.slice(1); const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16); const f = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const css = readFileSync('mockups/v2/design.css', 'utf8');
const darkPart = /\/\*dark\*\/([\s\S]*?)\/\*end\*\//.exec(css)[1];
const lightPart = css.slice(0, css.indexOf('/*dark*/'));
const tok = (src) => Object.fromEntries([...src.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6})\b/gi)].map((m) => [m[1], m[2]]));
const grads = (src) => [...(/--btn: linear-gradient\(([^)]*)\)/.exec(src)?.[1] ?? '').matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0]);
let bad = 0;
for (const [name, part] of [['light', lightPart], ['dark', darkPart]]) {
  const v = tok(part);
  const pairs = [['ink', 'bg'], ['ink', 'alt'], ['ink', 'card'], ['head', 'bg'], ['head', 'card'], ['muted', 'bg'], ['muted', 'alt'], ['muted', 'card'], ['muted', 'footbg'], ['link', 'bg'], ['link', 'card'], ['accent', 'bg'], ['accent', 'alt'], ['accent', 'card'], ['ok', 'bg'], ['ok', 'alt'], ['ok', 'card'], ['bad', 'card'], ['logo-grey', 'bg'], ['cookie-ink', 'cookie']];
  const rows = pairs.map(([f, b]) => [f, b, ratio(v[f], v[b])]);
  for (const c of grads(part)) rows.push(['white', `btn ${c}`, ratio('#ffffff', c)]);
  const low = rows.filter((r) => r[2] < 4.5);
  bad += low.length;
  console.log(`contrast ${name}: ${rows.length} pairs, lowest ${Math.min(...rows.map((r) => r[2])).toFixed(2)}:1, under 4.5: ${low.map((r) => `${r[0]} on ${r[1]} ${r[2].toFixed(2)}`).join(', ') || 'none'}`);
}

if (!process.argv.includes('--no-lighthouse')) {
  for (const t of ['dark', 'light']) for (const form of ['mobile', 'desktop']) {
    const file = resolve(OUT, `.lh-${t}-${form}.json`);
    await new Promise((done) => {
      const args = ['lighthouse', `${ORIGIN}/_forced/${t}/home.html`, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices', '--chrome-flags=--headless=new --disable-gpu', ...(form === 'desktop' ? ['--preset=desktop'] : [])];
      spawn('npx', args, { shell: true, env: { ...process.env, CHROME_PATH: CHROME } }).on('exit', done);
    });
    if (!existsSync(file)) { console.log(`${t} ${form}: no result`); continue; }
    const { categories: c, audits: a } = JSON.parse(readFileSync(file, 'utf8'));
    console.log(`${t} ${form}: perf ${Math.round(c.performance.score * 100)}, a11y ${Math.round(c.accessibility.score * 100)}, contrast ${a['color-contrast'].score === 1 ? 'pass' : 'FAIL'}, LCP ${a['largest-contentful-paint'].displayValue}, CLS ${a['cumulative-layout-shift'].displayValue}, TBT ${a['total-blocking-time'].displayValue}`);
    for (const x of c.accessibility.auditRefs.map((r) => a[r.id]).filter((r) => r?.score === 0)) console.log(`   a11y ${x.id}: ${(x.details?.items ?? []).slice(0, 5).map((i) => i.node?.snippet?.slice(0, 90)).join(' || ')}`);
    rmSync(file);
  }
}
server.close();
process.exit(bad ? 1 : 0);
