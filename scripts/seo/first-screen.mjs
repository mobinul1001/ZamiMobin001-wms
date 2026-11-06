// For each page: visible buttons in <main> (not inside closed accordions), and whether a main CTA button or a form is
// inside the first screen at 1440x900 and 390x844. Usage: node scripts/seo/first-screen.mjs <path> ...
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer((q, r) => { let p = join('dist', decodeURIComponent(q.url.split('?')[0])); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html'); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }).listen(0);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const pg = await b.newPage();
for (const path of process.argv.slice(2)) {
  const out = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await pg.setViewport({ width: w, height: h });
    await pg.goto(`http://localhost:${server.address().port}${path}`, { waitUntil: 'load' });
    out.push(await pg.evaluate((vh) => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const btns = [...document.querySelectorAll('main .btn')].filter(vis);
      const first = btns.filter((e) => e.getBoundingClientRect().top < vh).map((e) => e.textContent.trim().slice(0, 24));
      const form = [...document.querySelectorAll('main form')].some((f) => vis(f) && f.getBoundingClientRect().top < vh);
      return `${btns.length} buttons; first screen: ${first.length ? first.join(' / ') : 'none'}${form ? ' + form' : ''}`;
    }, h));
  }
  console.log(`${path}\n  1440: ${out[0]}\n  390:  ${out[1]}`);
}
await b.close(); server.close();
