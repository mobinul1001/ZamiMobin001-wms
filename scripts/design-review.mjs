// One page of each template, desktop and mobile: full page (first 9000px) and first screen, in reports/design-review/.
// Needs a finished build in dist/. Usage: node scripts/design-review.mjs
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const OUT = 'reports/design-review';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGES = [
  ['01-home', '/'],
  ['02-pricing', '/monthly-website-maintenance-packages/'],
  ['03-package-wordpress', '/wordpress-website-maintenance-packages/'],
  ['04-service-repair', '/website-repair-services/'],
  ['05-country-uk', '/website-maintenance-services-for-uk/'],
  ['06-blog-post', '/how-long-does-website-maintenance-take/'],
  ['07-blog-index', '/blogs/'],
  ['08-form-quote', '/get-a-free-quote/'],
  ['09-about', '/about-us/'],
  ['10-404', '/404.html'],
  ['11-thank-you', '/thank-you/'],
];
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const full = spawnSync('node', ['scripts/screenshot-pages.mjs', OUT, ...PAGES.map(([, p]) => p)], { encoding: 'utf8' });
console.log(full.stdout);
const shotName = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
for (const [name, p] of PAGES) for (const size of ['desktop', 'mobile']) renameSync(join(OUT, `${shotName(p)}-${size}.png`), join(OUT, `${name}-${size}-full.png`));

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/_w') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end(`<!doctype html><body style="margin:0"><iframe src="${u.searchParams.get('p')}" style="border:0;width:${u.searchParams.get('w')}px;height:${u.searchParams.get('h')}px"></iframe>`);
  }
  let f = join('dist', decodeURIComponent(u.pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4395, r));
const shot = (file, p, w, h) => new Promise((done) => {
  const profile = mkdtempSync(join(tmpdir(), 'dr-'));
  const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, `--window-size=${Math.max(w, 500)},${h}`, '--force-device-scale-factor=1', '--virtual-time-budget=5000', `--screenshot=${resolve(file)}`, `http://localhost:4395/_w?p=${encodeURIComponent(p)}&w=${w}&h=${h}`];
  spawn(CHROME, args).on('exit', () => { setTimeout(() => { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); done(); }, 200); });
});
const SIZES = { desktop: [1440, 900], mobile: [390, 844] };
for (const [name, p] of PAGES) for (const [size, [w, h]] of Object.entries(SIZES)) {
  const file = join(OUT, `${name}-${size}-first-screen.png`);
  const raw = `${file}.raw.png`;
  await shot(raw, p, w, h);
  await sharp(raw).extract({ left: 0, top: 0, width: w, height: h }).png({ compressionLevel: 9 }).toFile(file);
  rmSync(raw);
}
server.close();

// Contact sheets, for a quick look at all templates side by side.
for (const [size, [w, h]] of Object.entries(SIZES)) {
  const tw = size === 'desktop' ? 480 : 200;
  const th = Math.round((tw * h) / w);
  const cols = size === 'desktop' ? 4 : 6;
  const rows = Math.ceil(PAGES.length / cols);
  const gap = 12;
  const tiles = await Promise.all(PAGES.map(async ([name], i) => ({ input: await sharp(join(OUT, `${name}-${size}-first-screen.png`)).resize(tw, th).extend({ top: 1, bottom: 1, left: 1, right: 1, background: '#999' }).toBuffer(), left: gap + (i % cols) * (tw + gap + 2), top: gap + Math.floor(i / cols) * (th + gap + 2) })));
  await sharp({ create: { width: gap + cols * (tw + gap + 2), height: gap + rows * (th + gap + 2), channels: 3, background: '#fff' } }).composite(tiles).png({ compressionLevel: 9 }).toFile(join(OUT, `00-overview-${size}.png`));
}
console.log('done');
process.exit(0);
