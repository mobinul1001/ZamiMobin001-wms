// Batch 2, stage 8: SEO safety pass. Compares the pre-batch-2 build (OLD, default ../wms-old/dist) with dist/, page by
// page, and lints the new build. Writes reports/batch-2/safety.md and prints a short summary.
// Usage: node scripts/seo/final-check.mjs [oldDist]
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { parseCsv } from './csv-lite.mjs';
import { SNIPPETS } from './snippets-data.mjs';

const OLD = process.argv[2] ?? '../wms-old-clone/dist';
const BUILT_B2 = ['/website-redesign-services/', '/website-design-services/', '/website-seo-services/', '/website-speed-optimization-services/', '/website-support-services/', '/website-update-services/', '/wordpress-backup-services/', '/white-label-website-maintenance-services-for-agencies/', '/wms-partner-program/', '/ecommerce-website-maintenance-packages/', '/shopify-website-maintenance-packages/', ...['usa', 'canada', 'australia', 'ireland', 'france', 'netherlands', 'spain', 'switzerland', 'brazil'].map((c) => `/website-maintenance-services-for-${c}/`)];
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : n === 'index.html' ? [p] : []; });
const pageOf = (f, root) => `/${f.replace(/\\/g, '/').slice(root.length).replace(/^\//, '').replace(/index\.html$/, '')}`;
const sq = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^\p{L}\p{N}']+/gu, ' ').replace(/\s+/g, ' ').trim();
const leaves = (o, out = []) => { if (o && typeof o === 'object') Object.values(o).forEach((v) => leaves(v, out)); else if (typeof o === 'string' || typeof o === 'number') out.push(String(o)); return out; };

function read(file) {
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  const ld = $('script[type="application/ld+json"]').toArray().map((s) => { try { return JSON.parse($(s).text()); } catch { return null; } });
  $('script, style, svg, noscript').remove();
  const body = $('main').add('.cta-sec');
  return {
    title: $('title').text(), meta: $('meta[name="description"]').attr('content') ?? '', canonical: $('link[rel="canonical"]').attr('href') ?? '', robots: $('meta[name="robots"]').attr('content') ?? '', lang: $('html').attr('lang') ?? '',
    h1: $('h1').toArray().map((h) => sq($(h).text())), heads: body.find('h1, h2, h3, h4').toArray().map((h) => [h.tagName, sq($(h).text())]),
    links: new Set(body.find('a[href^="/"]').toArray().map((a) => $(a).attr('href').split('#')[0]).filter(Boolean)),
    blocks: body.find('p, li, td, th, h2, h3, h4, summary, dt, dd').toArray().map((e) => sq($(e).text())).filter((t) => t.length > 3),
    text: sq(body.text()), ld: leaves(ld).map((v) => sq(v)).filter((v) => v.length > 2),
    ids: $('[id]').toArray().map((e) => $(e).attr('id')),
    imgs: body.find('img').toArray().map((i) => ({ src: $(i).attr('src'), alt: $(i).attr('alt'), w: $(i).attr('width'), h: $(i).attr('height') })),
  };
}

const oldPages = Object.fromEntries(walk(OLD).map((f) => [pageOf(f, OLD), f]));
const newPages = Object.fromEntries(walk('dist').map((f) => [pageOf(f, 'dist'), f]));
const rows = [], fails = [], later = [], approved = [];
// Owner decision 2026-11-06 (decision 6): the SERVICE page /wordpress-malware-removal-service/ is strengthened and the
// article /wordpress-malware-removal/ links to it; lint hits between this pair are an approved exception.
const EXCEPT = [['/wordpress-malware-removal-service/', '/wordpress-malware-removal/'], ['/wordpress-malware-removal/', '/wordpress-malware-removal-service/']];
const titles = new Map(), metas = new Map();
const targets = parseCsv(readFileSync('seo-cannibalization/csv/Page-Targets.csv', 'utf8')).map((r) => [r.Page, sq(r['PRIMARY keyword (title + H1)'])]).filter(([, k]) => k.split(' ').length >= 2);
let minText = 100;
for (const [p, nf] of Object.entries(newPages)) {
  if (p.startsWith('/admin')) continue;
  const n = read(nf);
  if (n.robots.includes('noindex') === false) { if (titles.has(n.title)) fails.push(`duplicate title: ${p} = ${titles.get(n.title)}`); titles.set(n.title, p); if (n.meta) { if (metas.has(n.meta)) fails.push(`duplicate meta: ${p} = ${metas.get(n.meta)}`); metas.set(n.meta, p); } }
  const dupIds = [...new Set(n.ids.filter((x, i) => n.ids.indexOf(x) !== i))];
  const oldIds = oldPages[p] ? read(oldPages[p]).ids : [];
  const newDup = dupIds.filter((x) => oldIds.filter((y) => y === x).length < 2);
  if (newDup.length) fails.push(`${p}: duplicate ids ${newDup.join(', ')}`);
  if (dupIds.length > newDup.length) later.push(`${p}: ${dupIds.length - newDup.length} duplicate ids already in the old build`);
  if (n.h1.length !== 1) fails.push(`${p}: ${n.h1.length} H1`);
  const badImg = n.imgs.filter((i) => i.alt === undefined || !i.w || !i.h);
  if (badImg.length) (BUILT_B2.includes(p) ? fails : later).push(`${p}: ${badImg.length} images without alt or width/height (${badImg[0].src})`);
  // Cannibalization lint: title, H1, H2, H3 must not hold another page's primary keyword.
  // A hit inside the page's own longer keyword ("website maintenance services canada", "shopify website maintenance
  // packages") is the page's own topic, not another page's.
  const own = targets.find(([pg]) => pg === p)?.[1] ?? '';
  const QUAL = (k) => [...own.split(' '), 'ecommerce', 'shopify', 'woocommerce', 'store', 'usa', 'uk', 'canada', 'australia', 'ireland', 'france', 'netherlands', 'spain', 'switzerland', 'brazil'].filter((w) => w.length > 1 && !k.split(' ').includes(w));
  for (const [tag, t] of [['title', sq(n.title)], ...n.heads.filter(([t]) => t !== 'h4')]) for (const [owner, k] of targets) if (owner !== p && ` ${t} `.includes(` ${k} `) && !QUAL(k).some((w) => ` ${t} `.includes(` ${w} `))) (EXCEPT.some(([a, b]) => a === p && b === owner) ? approved : BUILT_B2.includes(p) ? fails : later).push(`cannibalization ${p} ${tag} "${t.slice(0, 60)}" uses "${k}" (owner ${owner})`);
  const of = oldPages[p];
  if (!of) { rows.push([p, 'new page?', '', '', '']); continue; }
  const o = read(of);
  const diff = [];
  for (const k of ['canonical', 'robots', 'lang']) if (o[k] !== n[k]) diff.push(`${k} ${o[k]} -> ${n[k]}`);
  if (o.h1.join() !== n.h1.join()) diff.push('H1 changed');
  if (o.title !== n.title && SNIPPETS[p]?.[1] !== n.title) diff.push('title changed outside stage 2');
  if (o.meta !== n.meta && SNIPPETS[p]?.[2] !== n.meta) diff.push('meta changed outside stage 2');
  const newHeads = new Set(n.heads.map(([, t]) => t));
  // Headings changed on purpose (listed in the report): the batch-2 cannibalization fix on the white-label page.
  const CHANGED = ['our rigorous website maintenance process'];
  const lostHeads = o.heads.filter(([, t]) => !newHeads.has(t) && !CHANGED.includes(t));
  const levelChanged = o.heads.filter(([tag, t]) => newHeads.has(t) && !n.heads.some(([nt, x]) => x === t && nt === tag));
  const lostLinks = [...o.links].filter((l) => !n.links.has(l));
  const lostLd = [...new Set(o.ld.filter((v) => !n.ld.includes(v)))].filter((v) => !(SNIPPETS[p] && [sq(o.title), sq(o.meta)].includes(v)));
  const found = o.blocks.filter((b) => n.text.includes(b)).length;
  const pct = o.blocks.length ? (100 * found) / o.blocks.length : 100;
  minText = Math.min(minText, pct);
  if (lostHeads.length) diff.push(`${lostHeads.length} headings lost: ${lostHeads.slice(0, 2).map(([, t]) => t.slice(0, 40)).join(' | ')}`);
  if (lostLinks.length) diff.push(`${lostLinks.length} links lost: ${lostLinks.slice(0, 3).join(' ')}`);
  if (lostLd.length) diff.push(`${lostLd.length} schema values lost: ${lostLd.slice(0, 2).map((v) => v.slice(0, 50)).join(' | ')}`);
  if (pct < 95) diff.push(`text ${pct.toFixed(1)}%`);
  if (diff.length) fails.push(`${p}: ${diff.join('; ')}`);
  rows.push([p, BUILT_B2.includes(p) ? 'rebuilt' : '', `${pct.toFixed(1)}%`, levelChanged.length ? `${levelChanged.length} heading levels changed` : '', diff.length ? 'FAIL' : 'ok']);
}
for (const p of Object.keys(oldPages)) if (!newPages[p]) fails.push(`page gone: ${p}`);
// Forbidden strings in the new build.
const FORBID = [/free hosting/i, /2 free (email|webmail)/i, /\bLorem\b/, /\bTODO\b/, /\[Real client/, /on Clutch/i, /Dhaka/, /Bangladesh/, /\+880/, /No downtime/i, /guaranteed/i];
const forb = [];
for (const [p, f] of Object.entries(newPages)) {
  const $ = cheerio.load(readFileSync(f, 'utf8')); $('script, style').remove();
  const t = $('body').text();
  // Owner, 2026-11-06 (CLAIMS-AND-DESIGN.md A4b): the migration page's exact phrases "with no downtime" and "No downtime"
  // are approved there; any other "no downtime" on that page, and the phrase on every other page, is still reported.
  const tt = p === '/website-migration-services/' ? t.replace(/up to 20 pages, with no downtime/g, '').replace(/No downtime/g, '') : t;
  for (const re of FORBID) if (re.test(tt) && !(p === '/website-redesign-services/' && /free hosting|2 free/i.test(re.source))) forb.push(`${p}: ${re.source} ("${(tt.match(new RegExp(`.{0,40}${re.source}.{0,30}`, re.flags))?.[0] ?? '').replace(/\s+/g, ' ').trim()}")`);
}
// Sitemap and robots unchanged.
const norm = (f, root) => readFileSync(join(root, f), 'utf8').replace(/\r\n/g, '\n').replace(/<lastmod>[^<]*<\/lastmod>/g, '');
const same = (f) => existsSync(join(OLD, f)) && existsSync(join('dist', f)) && norm(f, OLD) === norm(f, 'dist');
const sitemapFiles = readdirSync('dist').filter((f) => /^sitemap.*\.xml$/.test(f));
const smSame = sitemapFiles.every(same), robotsSame = same('robots.txt'), redirectsSame = same('_redirects');

const out = `# Batch 2 SEO safety pass (old: ${OLD}, the build of commit 32d32cd before batch 2 in a separate clone with its own npm ci; new: dist/)

Pages compared: ${rows.length}. Pages rebuilt in batch 2: ${BUILT_B2.length}. Lowest text parity (old text blocks found on the new page): ${minText.toFixed(1)}%.
Sitemap unchanged: ${smSame} (${sitemapFiles.join(', ')}). robots.txt unchanged: ${robotsSame}. _redirects unchanged: ${redirectsSame}.

## Failures (${fails.length})
${fails.map((f) => `- ${f}`).join('\n') || '- none'}

## Forbidden strings (${forb.length})
${forb.map((f) => `- ${f}`).join('\n') || '- none'}

## Approved exceptions (owner decision 6, 2026-11-06: the malware service page is strengthened; the article links to it; the article title is not changed now) (${approved.length})
${approved.map((f) => `- ${f}`).join('\n') || '- none'}

## Later (pages not rebuilt in batch 2: cannibalization hits and image attributes; phase 2 work) (${later.length})
${later.map((f) => `- ${f}`).join('\n') || '- none'}

## Per page
| Page | Batch 2 | Text parity | Heading levels | Result |
|---|---|---|---|---|
${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}
`;
writeFileSync('reports/batch-2/safety.md', out);
console.log(`pages ${rows.length}; failures ${fails.length}; forbidden ${forb.length}; later ${later.length}; min text ${minText.toFixed(1)}%; sitemap same ${smSame}; robots same ${robotsSame}; redirects same ${redirectsSame}`);
for (const f of [...fails, ...forb].slice(0, 40)) console.log('  ' + f.slice(0, 220));
