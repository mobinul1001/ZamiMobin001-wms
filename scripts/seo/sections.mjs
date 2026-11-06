// Section heights of a page built on the batch-2 templates: node scripts/seo/sections.mjs <path> <width>
import { createServer } from 'node:http'; import { existsSync, readFileSync, statSync } from 'node:fs'; import { join, extname } from 'node:path';
import { createRequire } from 'node:module'; const req = createRequire('C:/Users/user/wms-rebuild/package.json'); const puppeteer = req('puppeteer-core');
const T = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const s = createServer((q, r) => { let p = join('C:/Users/user/wms-rebuild/dist', q.url.split('?')[0]); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html'); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }).listen(0);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }); const pg = await b.newPage();
const [path, w] = [process.argv[2], +process.argv[3]];
await pg.setViewport({ width: w, height: 900 }); await pg.goto(`http://localhost:${s.address().port}${path}`);
console.log((await pg.evaluate(() => [...document.querySelectorAll('.sv-pg > *')].map((e) => Math.round(e.getBoundingClientRect().height) + ' ' + (e.querySelector('h2')?.textContent ?? e.className).trim().slice(0, 50)))).join('\n'));
await b.close(); s.close();
