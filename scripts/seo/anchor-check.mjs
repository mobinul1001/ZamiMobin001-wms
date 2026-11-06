// Internal anchors: which link texts on the built site point at the pages that have external links, and whether an
// external anchor phrase is used internally for a different page. Prints a short table.
import { readFileSync, readdirSync, statSync } from 'node:fs'; import { join } from 'node:path'; import * as cheerio from 'cheerio';
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : n === 'index.html' ? [p] : []; });
const PHRASES = { 'website maintenance services': '/', 'small business website maintenance': '/best-website-maintenance-for-small-business/', 'monthly website maintenance packages': '/monthly-website-maintenance-packages/', 'monthly website maintenance': '/monthly-website-maintenance-packages/', 'website maintenance packages': '/monthly-website-maintenance-packages/', 'website maintenance cost': '/how-much-does-website-maintenance-cost/', 'how long does website maintenance take': '/how-long-does-website-maintenance-take/', 'best website maintenance companies': '/best-website-maintenance-companies/', 'wordpress website maintenance cost': '/how-much-does-wordpress-website-maintenance-cost/' };
const sq = (s) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const hits = {};
for (const f of walk('dist')) {
  const $ = cheerio.load(readFileSync(f, 'utf8'));
  const parts = f.split(/[\\/]/).slice(1, -1); const from = parts.length ? '/' + parts.join('/') + '/' : '/';
  $('main a[href^="/"]').each((_, a) => {
    const t = sq($(a).text()); const href = $(a).attr('href').split('#')[0];
    for (const [ph, owner] of Object.entries(PHRASES)) if (t === ph || t.startsWith(ph + ' ') || t.endsWith(' ' + ph)) { const k = `${ph}|${href === owner ? 'owner' : href}`; (hits[k] ??= new Set()).add(from); }
  });
}
for (const [k, v] of Object.entries(hits).sort()) console.log(`${k} | ${v.size} pages | ${[...v].slice(0, 3).join(' ')}`);
