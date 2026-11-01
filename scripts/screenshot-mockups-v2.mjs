// Serves the repo root, and takes full-page and first-screen shots of mockups A and B, desktop and mobile. Runs Lighthouse too.
// Usage: node scripts/screenshot-mockups-v2.mjs [--no-lighthouse]
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'reports/mockups-v2';
mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/_w') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end(`<!doctype html><body style="margin:0"><iframe id="f" src="${u.searchParams.get('p')}" style="border:0;display:block;width:${u.searchParams.get('w')}px;height:${u.searchParams.get('h')}px"></iframe>${u.searchParams.get('grow') ? "<script>const f=document.getElementById('f');f.onload=()=>{const d=f.contentDocument;const k=d.getElementById('cookie');if(k)k.hidden=true;d.querySelectorAll('.fade').forEach((e)=>e.classList.add('in'));const r=d.documentElement;f.style.height=r.scrollHeight+'px';document.body.dataset.h=r.scrollHeight;document.body.dataset.w=r.scrollWidth;};</script>" : ''}`);
  }
  let f = join('.', decodeURIComponent(u.pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4396, r));
const ORIGIN = 'http://localhost:4396';
const chrome = (args) => new Promise((done) => {
  let out = '';
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'mk-'))}`, '--force-device-scale-factor=1', '--virtual-time-budget=5000', ...args]);
  c.stdout.on('data', (d) => (out += d));
  c.on('exit', () => done(out));
});
const SIZES = { desktop: [1440, 900], mobile: [390, 844] };
const PAGES = { 'a-dark': '/mockups/v2/a-dark.html', 'b-light': '/mockups/v2/b-light.html' };
const q = (p, w, h, grow) => `${ORIGIN}/_w?p=${encodeURIComponent(p)}&w=${w}&h=${h}${grow ? '&grow=1' : ''}`;
for (const [name, p] of Object.entries(PAGES)) for (const [size, [w, h]] of Object.entries(SIZES)) {
  const dom = await chrome(['--dump-dom', q(p, w, h, true)]);
  const pageH = +(/data-h="(\d+)"/.exec(dom)?.[1] ?? 0);
  const pageW = +(/data-w="(\d+)"/.exec(dom)?.[1] ?? 0);
  if (!pageH) throw new Error(`no height for ${name} ${size}`);
  const raw = resolve(OUT, `_${name}-${size}.png`);
  await chrome([`--window-size=${Math.max(w, 500)},${pageH}`, `--screenshot=${raw}`, q(p, w, h, true)]);
  await sharp(raw).extract({ left: 0, top: 0, width: w, height: pageH }).png({ compressionLevel: 9 }).toFile(join(OUT, `${name}-${size}-full.png`));
  await chrome([`--window-size=${Math.max(w, 500)},${h}`, `--screenshot=${raw}`, q(p, w, h)]);
  await sharp(raw).extract({ left: 0, top: 0, width: w, height: h }).png({ compressionLevel: 9 }).toFile(join(OUT, `${name}-${size}-first-screen.png`));
  rmSync(raw);
  console.log(`${name}-${size}: ${pageW}x${pageH}${pageW > w ? ' HORIZONTAL OVERFLOW' : ''}`);
}
if (!process.argv.includes('--no-lighthouse')) {
  for (const [name, p] of Object.entries(PAGES)) for (const form of ['mobile', 'desktop']) {
    const file = resolve(OUT, `.lh-${name}-${form}.json`);
    await new Promise((done) => {
      const args = ['lighthouse', `${ORIGIN}${p}`, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices', '--chrome-flags=--headless=new --disable-gpu', ...(form === 'desktop' ? ['--preset=desktop'] : [])];
      spawn('npx', args, { shell: true, env: { ...process.env, CHROME_PATH: CHROME } }).on('exit', done);
    });
    if (!existsSync(file)) { console.log(`${name} ${form}: no result`); continue; }
    const r = JSON.parse(readFileSync(file, 'utf8'));
    const { categories: c, audits: a } = r;
    console.log(`${name} ${form}: perf ${Math.round(c.performance.score * 100)}, a11y ${Math.round(c.accessibility.score * 100)}, LCP ${a['largest-contentful-paint'].displayValue}, CLS ${a['cumulative-layout-shift'].displayValue}, TBT ${a['total-blocking-time'].displayValue}`);
    const fails = c.accessibility.auditRefs.map((x) => a[x.id]).filter((x) => x?.score === 0);
    for (const x of fails) console.log(`   a11y ${x.id}: ${(x.details?.items ?? []).slice(0, 5).map((i) => i.node?.snippet?.slice(0, 90)).join(' || ')}`);
    rmSync(file);
  }
}
server.close();
process.exit(0);
