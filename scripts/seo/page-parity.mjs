// Batch 2 page check: for each page, everything in its Markdown is still in the built page.
// Headings (same level), links, FAQ schema questions (visible as headings), text blocks (>= 95%), one H1,
// no duplicate IDs. Usage: node scripts/seo/page-parity.mjs <path> [<path> ...]
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
const sq = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[^\p{L}\p{N}]+/gu, '');
let failed = 0;
for (const path of process.argv.slice(2)) {
  const slug = path.replace(/^\/|\/$/g, '');
  const file = readFileSync(`src/content/pages/${slug}.md`, 'utf8');
  const [, front, ...rest] = file.split(/^---$/m);
  const md = rest.join('---');
  const $ = cheerio.load(readFileSync(`dist${path}index.html`, 'utf8'));
  const main = $('main');
  const heads = { 2: new Set(), 3: new Set(), 4: new Set() };
  main.find('h2, h3, h4').each((_, h) => heads[h.tagName[1]].add(sq($(h).text())));
  const text = sq(main.text());
  const hrefs = new Set(main.find('a').toArray().map((a) => $(a).attr('href')));
  const bad = [];
  let blocks = 0, found = 0;
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    const h = /^(#{2,4}) (.+)$/.exec(line);
    if (h) { const t = sq(h[2].replace(/\\/g, '')); if (!heads[h[1].length].has(t)) bad.push(`H${h[1].length} missing: ${h[2].slice(0, 60)}`); continue; }
    if (!line || /^<\/?div|^\| ?-|^<a id=/.test(line)) continue;
    const t = sq(line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^[-*|]\s*|\\/g, '').split('|').join(''));
    if (t.length < 4) continue;
    blocks++;
    if (text.includes(t)) found++; else if (blocks - found <= 5) bad.push(`text: ${line.slice(0, 70)}`);
  }
  for (const m of md.matchAll(/\]\(([^)\s]+)\)|href="([^"]+)"/g)) { const u = m[1] ?? m[2]; if (u.startsWith('/') && !hrefs.has(u)) bad.push(`link missing: ${u}`); }
  const faqs = JSON.parse(/^faqs: (.*)$/m.exec(front)?.[1] ?? '[]');
  for (const f of faqs) if (!text.includes(sq(f.q))) bad.push(`FAQ question not visible: ${f.q.slice(0, 60)}`);
  if ($('h1').length !== 1) bad.push(`${$('h1').length} H1`);
  const ids = $('[id]').toArray().map((e) => $(e).attr('id')); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) bad.push(`duplicate ids: ${[...new Set(dup)].join(', ')}`);
  const pct = blocks ? (100 * found) / blocks : 100;
  if (pct < 95) bad.push(`text parity ${pct.toFixed(1)}%`);
  const fail = bad.filter((b) => !b.startsWith('text: ') || pct < 95);
  if (fail.length) failed++;
  console.log(`${path}: text ${found}/${blocks} (${pct.toFixed(1)}%), FAQ ${faqs.length}, ${fail.length ? 'FAIL' : 'ok'}`);
  for (const b of bad.slice(0, 12)) console.log('   ' + b);
}
process.exit(failed ? 1 : 0);
