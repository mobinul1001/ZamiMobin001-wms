// Quick layout check for batch-2 pages (not the full design QA): page height with sections collapsed as shipped,
// sideways overflow, elements wider than the screen, and the main CTA on the first phone screen.
// Usage: node scripts/seo/layout-check.mjs <path> [<path> ...]   (serves dist/ on a local port)
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer((req, res) => {
  let p = join('dist', decodeURIComponent(req.url.split('?')[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
let bad = 0;
for (const path of process.argv.slice(2)) {
  const row = [];
  for (const [w, h] of [[1440, 900], [390, 844], [360, 640]]) {
    await page.setViewport({ width: w, height: h });
    await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'load' });
    const r = await page.evaluate((vw, vh) => {
      const d = document.documentElement;
      const wide = [...document.querySelectorAll('main *')].filter((e) => { const b = e.getBoundingClientRect(); if (!b.width) return false; let x = e.parentElement; while (x) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false; x = x.parentElement; } return b.right > vw + 1 || b.left < -1; }).map((e) => e.tagName + '.' + e.className).slice(0, 3);
      const cta = document.querySelector('.cta-row .btn');
      return { height: d.scrollHeight, overflow: d.scrollWidth - d.clientWidth, wide, ctaBottom: cta ? Math.round(cta.getBoundingClientRect().bottom) : -1 };
    }, w, h);
    const probs = [];
    if (r.overflow > 0) probs.push(`page scrolls sideways ${r.overflow}px`);
    if (r.wide.length) probs.push(`wider than screen: ${r.wide.join(', ')}`);
    if (w <= 390 && (r.ctaBottom < 0 || r.ctaBottom > h)) probs.push(`main CTA below first screen (${r.ctaBottom})`);
    bad += probs.length;
    row.push(`${w}: ${r.height}px${probs.length ? ' ' + probs.join('; ') : ''}`);
  }
  console.log(`${path}  ${row.join(' | ')}`);
}
await browser.close(); server.close();
process.exit(bad ? 1 : 0);
