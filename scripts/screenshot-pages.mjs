// Serves dist/ locally, takes desktop and mobile screenshots, and optionally runs Lighthouse.
// Usage: node scripts/screenshot-pages.mjs out-folder [--lighthouse] /path/ /path2/
import { spawnSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [out, ...rest] = process.argv.slice(2);
const lighthouse = rest.includes('--lighthouse');
const paths = rest.filter((a) => a.startsWith('/'));
mkdirSync(out, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.startsWith('/_shot/')) {
    const f = resolve(out, p.slice(7));
    res.writeHead(200, { 'content-type': 'text/html' });
    return res.end(readFileSync(f));
  }
  let f = join('dist', p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) {
    res.writeHead(404, { 'content-type': 'text/html' });
    return res.end(readFileSync('dist/404.html'));
  }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4399, r));
const ORIGIN = 'http://localhost:4399';
const PROFILE = resolve(out, '.chrome');
const run = (args) => new Promise((done) => {
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`, '--force-device-scale-factor=1', ...args]);
  let stdout = '';
  c.stdout.on('data', (d) => (stdout += d));
  c.on('exit', () => done(stdout));
});
const SIZES = { desktop: [1440, 900], mobile: [390, 844] };
const MAX = 9000;
const name = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
for (const p of paths) {
  for (const [label, [w, h]] of Object.entries(SIZES)) {
    const shot = `${name(p)}-${label}`;
    const wrapper = join(out, `${shot}.wrap.html`);
    writeFileSync(wrapper, `<!doctype html><html><body style="margin:0;background:#fff"><iframe id="f" src="${p}" style="border:0;display:block;width:${w}px;height:${h}px"></iframe><script>const f=document.getElementById('f');f.onload=()=>{const d=f.contentDocument.documentElement;f.style.height=d.scrollHeight+'px';document.body.dataset.h=d.scrollHeight;document.body.dataset.w=d.scrollWidth;};</script></body></html>`);
    const dom = await run(['--virtual-time-budget=5000', '--dump-dom', `${ORIGIN}/_shot/${shot}.wrap.html`]);
    const pageH = +(/data-h="(\d+)"/.exec(dom)?.[1] ?? 0);
    const pageW = +(/data-w="(\d+)"/.exec(dom)?.[1] ?? 0);
    const saveH = Math.min(pageH || h, MAX);
    const raw = resolve(out, `${shot}.raw.png`);
    await run([`--window-size=${Math.max(w, 500)},${saveH}`, '--virtual-time-budget=5000', `--screenshot=${raw}`, `${ORIGIN}/_shot/${shot}.wrap.html`]);
    await sharp(raw).extract({ left: 0, top: 0, width: w, height: saveH }).png({ compressionLevel: 9 }).toFile(join(out, `${shot}.png`));
    rmSync(raw);
    rmSync(wrapper);
    console.log(`${shot}: ${pageW}x${pageH}${pageW > w ? ' HORIZONTAL OVERFLOW' : ''}`);
  }
}
if (lighthouse) {
  const rows = [];
  for (const p of paths) {
    for (const form of ['mobile', 'desktop']) {
      const file = resolve(out, `.lh-${name(p)}-${form}.json`);
      await new Promise((done) => {
        const args = ['lighthouse', `${ORIGIN}${p}`, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new --disable-gpu', ...(form === 'desktop' ? ['--preset=desktop'] : [])];
        const c = spawn('npx', args, { shell: true, env: { ...process.env, CHROME_PATH: CHROME } });
        c.on('exit', done);
      });
      if (!existsSync(file)) {
        rows.push(`${p} ${form}: no result`);
        continue;
      }
      const r = JSON.parse(readFileSync(file, 'utf8'));
      const c = r.categories;
      const a = r.audits;
      rows.push(`${p} ${form}: perf ${Math.round(c.performance.score * 100)}, a11y ${Math.round(c.accessibility.score * 100)}, seo ${Math.round(c.seo.score * 100)}, LCP ${a['largest-contentful-paint'].displayValue}, CLS ${a['cumulative-layout-shift'].displayValue}, TBT ${a['total-blocking-time'].displayValue}`);
      const fails = Object.values(c.accessibility.auditRefs).map((x) => a[x.id]).filter((x) => x?.score === 0).map((x) => x.id);
      const seoFails = c.seo.auditRefs.map((x) => a[x.id]).filter((x) => x?.score === 0).map((x) => x.id);
      if (fails.length || seoFails.length) rows.push(`   fails: a11y ${fails.join(', ')} | seo ${seoFails.join(', ')}`);
      rmSync(file);
    }
  }
  console.log(rows.join('\n'));
}
rmSync(PROFILE, { recursive: true, force: true });
server.close();
process.exit(0);
void spawnSync;
