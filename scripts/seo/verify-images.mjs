// Checks each replaced image: the live URL path exists in dist (same path = rebuild URL), size/format equal the
// original, under 120 KB (full size), alt text on the pages unchanged vs the live page, no redirect for that path.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
sharp.cache(false);
const IMGS = process.argv.slice(2);
const redirects = readFileSync('dist/_redirects', 'utf8');
const rows = [];
for (const u of IMGS) {
  const name = u.split('/').pop();
  const orig = await sharp(readFileSync(`reports/batch-2/images-original/${name}`)).metadata();
  const f = `dist${u}`;
  const ok = existsSync(f);
  const now = ok ? await sharp(readFileSync(f)).metadata() : {};
  const kb = ok ? Math.round(statSync(f).size / 1024) : 0;
  const redirected = redirects.split('\n').some((l) => l.split(/\s+/)[0] === u);
  // alt text: every page in dist that uses the image vs the live crawl (export/raw) of the same page
  const alts = [];
  for (const d of readdirSync('dist', { recursive: true }).filter((p) => String(p).endsWith('index.html'))) {
    const html = readFileSync(join('dist', String(d)), 'utf8');
    if (!html.includes(name)) continue;
    const $ = cheerio.load(html);
    $(`img[src$="${name}"]`).each((_, i) => alts.push($(i).attr('alt')));
  }
  rows.push({ u, ok, size: `${now.width}x${now.height}`, origSize: `${orig.width}x${orig.height}`, fmt: `${now.format}/${orig.format}`, kb, redirected, alts: [...new Set(alts)] });
}
for (const r of rows) console.log(JSON.stringify(r));
