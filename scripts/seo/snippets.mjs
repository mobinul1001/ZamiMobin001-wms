// Batch 2, Stage 2: checks the CTR snippets (scripts/seo/snippets-data.mjs) and writes reports/seo-research/snippets.csv.
// With --apply, writes the new titles (newTitle) and metas (newMeta) into reports/phase-3-keyword-map.csv, the
// title data source migrate-content.mjs reads. Pixel widths are measured in headless Chrome (20px / 14px Arial).
import { readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { SNIPPETS } from './snippets-data.mjs';
import { parseCsv } from './csv-lite.mjs';

const site = JSON.parse(readFileSync('reports/seo-research/_site.json', 'utf8'));
const tiers = Object.fromEntries(parseCsv(readFileSync('reports/seo-research/tiers.csv', 'utf8')).map((r) => [r.url, r]));
const FORBIDDEN = /free hosting|free email|\b2 free|guarantee|no downtime|zero downtime|on clutch|dhaka|bangladesh|\+880|page 1 in|#1 ranking|24\/7/i;

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
const width = (text, px) => page.evaluate((t, p) => { const c = document.createElement('canvas').getContext('2d'); c.font = `${p}px Arial`; return Math.round(c.measureText(t).width); }, text, px);

const rows = [], problems = [];
const metas = new Map();
for (const p of Object.keys(tiers)) {
  const s = SNIPPETS[p];
  if (!s) { problems.push(`${p}: no snippet`); continue; }
  const [primary, title, meta, why, phase2 = ''] = s;
  const t = tiers[p].tier, live = site.live[p] ?? {}, reb = site.rebuild[p];
  const tw = await width(title, 20), mw = await width(meta, 14);
  const bad = [];
  if (t === 'A' && title !== live.title) bad.push('Tier A title differs from the live title');
  const lt = title.toLowerCase().replace(/["“”]/g, ''); const at = lt.indexOf(primary.toLowerCase());
  if (t !== 'A' && !(at >= 0 && at <= 25)) bad.push('primary keyword not at the start');
  if (t !== 'A' && tw > 580) bad.push(`title ${tw}px`);
  if (meta.length < 130 || meta.length > 158) bad.push(`meta ${meta.length} chars`);
  if (mw > 920) bad.push(`meta ${mw}px`);
  if (FORBIDDEN.test(title + ' ' + meta)) bad.push('forbidden wording');
  if (metas.has(meta)) bad.push(`duplicate meta of ${metas.get(meta)}`);
  metas.set(meta, p);
  // Every price or number in the new title/meta must be visible on the page (dist text).
  const $ = cheerio.load(readFileSync(`dist${p}index.html`, 'utf8'));
  $('script, style, svg').remove();
  const text = $('body').text().replace(/\s+/g, ' ');
  const nums = [...new Set([...(title + ' ' + meta).matchAll(/(?:[$£€]|CA\$|A\$|R\$|CHF )?\d[\d,.]*\+?/g)].map((m) => m[0].replace(/[.,]$/, '')))].filter((n) => !/^20(2[0-9])$/.test(n));
  for (const n of nums) if (!text.includes(n) && !(live.title ?? '').includes(n)) bad.push(`"${n}" not on the page`);
  rows.push({ url: p, tier: t, live_title: live.title ?? '', rebuild_title: reb.title, new_title: title, title_chars: title.length, title_px: tw, live_meta: live.meta ?? '', new_meta: meta, meta_chars: meta.length, meta_px: mw, why, phase2_title: phase2, check: bad.join('; ') || 'ok' });
  if (bad.length) problems.push(`${p}: ${bad.join('; ')}`);
}
await browser.close();
const keys = Object.keys(rows[0]);
writeFileSync('reports/seo-research/snippets.csv', [keys, ...rows.map((r) => keys.map((k) => r[k]))].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n');
console.log(`${rows.length} snippets; ${problems.length} with problems`);
for (const x of problems) console.log('  ' + x);

if (process.argv.includes('--apply')) {
  if (problems.length) throw new Error('fix the problems first');
  const file = 'reports/phase-3-keyword-map.csv';
  const raw = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const recs = parseCsv(raw);
  const head = Object.keys(recs[0]).filter((k) => k !== 'newMeta').concat('newMeta');
  for (const r of recs) { const s = SNIPPETS[r.path]; if (s) { r.newTitle = s[1]; r.newMeta = s[2]; r.titleLen = String(s[1].length); } else r.newMeta = r.newMeta ?? ''; }
  writeFileSync(file, '\uFEFF' + [head, ...recs.map((r) => head.map((k) => r[k] ?? ''))].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n');
  console.log(`applied to ${file}`);
}
