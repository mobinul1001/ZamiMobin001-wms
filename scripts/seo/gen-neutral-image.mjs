// Replaces a featured image with a neutral one: brand gradient, the post topic in words, "WMS", no offers, no claims.
// Same path, file name, width, height and format; under 120 KB. The original is copied to reports/batch-2/images-original/.
// Usage: node scripts/seo/gen-neutral-image.mjs <public path> "<topic line>" "<sub line>"
import { copyFileSync, mkdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';

const [path, topic, sub] = process.argv.slice(2);
const file = `public${path}`;
sharp.cache(false); // Windows: sharp would otherwise keep the file open and block the write
const meta = await sharp(readFileSync(file)).metadata();
const { width: W, height: H, format } = meta;
mkdirSync('reports/batch-2/images-original', { recursive: true });
const keep = `reports/batch-2/images-original/${basename(path)}`;
if (!existsSync(keep)) copyFileSync(file, keep);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url('file:///${process.cwd().replace(/\\/g, '/')}/public/fonts/inter-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
body { font-family: Inter, Arial, sans-serif; background: linear-gradient(120deg, #2a0f6b 0%, #6d34e0 38%, #c026d3 72%, #f43f5e 100%); color: #fff; position: relative; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px); background-size: ${Math.round(H / 8)}px ${Math.round(H / 8)}px; }
.glow { position: absolute; width: ${Math.round(H * 1.1)}px; height: ${Math.round(H * 1.1)}px; right: -${Math.round(H * .25)}px; top: -${Math.round(H * .3)}px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.22), transparent 65%); }
.wrap { position: absolute; left: ${Math.round(W * .06)}px; right: ${Math.round(W * .3)}px; top: 50%; transform: translateY(-50%); }
.k { display: inline-block; padding: ${Math.round(H * .012)}px ${Math.round(H * .03)}px; border-radius: 999px; background: rgba(255,255,255,.16); font-size: ${Math.round(H * .04)}px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { margin: ${Math.round(H * .04)}px 0 0; font-size: ${Math.round(H * .13)}px; line-height: 1.02; font-weight: 800; letter-spacing: -.02em; }
p { margin: ${Math.round(H * .035)}px 0 0; font-size: ${Math.round(H * .05)}px; opacity: .9; }
.mark { position: absolute; right: ${Math.round(W * .07)}px; top: 50%; transform: translateY(-50%); width: ${Math.round(H * .42)}px; height: ${Math.round(H * .42)}px; border-radius: 50%; border: ${Math.round(H * .012)}px solid rgba(255,255,255,.85); display: grid; place-items: center; font-size: ${Math.round(H * .12)}px; font-weight: 800; background: rgba(255,255,255,.08); }
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="wrap"><span class="k">Guide</span><h1>${topic}</h1><p>${sub}</p></div><div class="mark">WMS</div></body></html>`;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
const pg = await b.newPage();
await pg.setViewport({ width: W, height: H });
const tmp = `${process.env.TEMP ?? '.'}/neutral-${basename(path)}.html`;
writeFileSync(tmp, html);
await pg.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'load' });
await pg.evaluate(() => document.fonts.ready);
const png = await pg.screenshot({ type: 'png' });
await b.close();
let q = 82, out;
for (; q >= 40; q -= 6) { out = await sharp(png).toFormat(format, { quality: q }).toBuffer(); if (out.length < 120 * 1024) break; }
writeFileSync(file, out);
const m2 = await sharp(readFileSync(file)).metadata();
console.log(`${path}: ${m2.width}x${m2.height} ${m2.format} ${statSync(file).size} bytes (q ${q}); original kept in ${keep}`);
if (m2.width !== W || m2.height !== H || m2.format !== format) throw new Error('dimensions or format changed');
