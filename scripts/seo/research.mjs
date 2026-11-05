// Batch 2, Stage 1: SEO research from data that exists (no page changes).
// Inputs: data/gsc/wms-gsc-query-page-last-3-months.csv, seo-cannibalization/csv/*.csv (keyword map, from
// scripts/seo/xlsx-to-csv.mjs), export/inventory.csv (live crawl), url-map.csv, dist/ (rebuild).
// Outputs: reports/seo-research/{tiers.csv, page-briefs.csv, ctr-findings.md, content-gaps.csv}.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import * as cheerio from 'cheerio';

const OUT = 'reports/seo-research';
mkdirSync(OUT, { recursive: true });
const ORIGIN = 'https://websitemaintenanceservices.org';

export function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; } else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...rest] = rows;
  return rest.filter((r) => r.length > 1 || r[0]).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ''])));
}
const csvOut = (rows) => { const keys = Object.keys(rows[0]); return [keys, ...rows.map((r) => keys.map((k) => r[k]))].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n'; };
const ent = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const num = (s) => Number(String(s).replace(/[,%]/g, '')) || 0;
const pathOf = (u) => u.replace(ORIGIN, '').replace(/[?#].*$/, '') || '/';
const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Real pages: status 200 rows that are kept.
const map = parseCsv(readFileSync('url-map.csv', 'utf8'));
const pages = [...new Set(map.filter((r) => r.status === '200').map((r) => pathOf(r.new_url)))].filter((p) => existsSync(`dist${p}index.html`));

// Keyword map.
const K = (n) => parseCsv(readFileSync(`seo-cannibalization/csv/${n}.csv`, 'utf8'));
const targets = Object.fromEntries(K('Page-Targets').map((r) => [r.Page, { primary: ent(r['PRIMARY keyword (title + H1)']), secondary: ent(r['SECONDARY keywords (H2/H3, body, FAQ)']).split('\n').map((s) => s.trim()).filter(Boolean) }]));
const ignore = new Set(K('Not-a-target').map((r) => norm(ent(r.Query))));
const fullMap = K('Full-Keyword-Map');
const ownerOf = new Map(fullMap.map((r) => [norm(r.Keyword), r['Owner page (target)']]));

// GSC.
const gsc = parseCsv(readFileSync('data/gsc/wms-gsc-query-page-last-3-months.csv', 'utf8')).map((r) => ({ q: r.Query, p: pathOf(r.Page), c: num(r.Clicks), i: num(r.Impressions), pos: num(r.Position) })).filter((r) => !ignore.has(norm(r.q)));
const byPage = {};
for (const r of gsc) (byPage[r.p] ??= []).push(r);

// Live crawl.
const live = Object.fromEntries(parseCsv(readFileSync("export/inventory.csv", "utf8")).filter((r) => !/[?#]/.test(r.url) && r.first_status === "200").map((r) => [pathOf(r.url), { title: r.title, meta: r.meta_description }]));

// Rebuild.
const site = {};
for (const p of pages) {
  const $ = cheerio.load(readFileSync(`dist${p}index.html`, 'utf8'));
  const heads = $('main h1, main h2, main h3').toArray().map((h) => ({ tag: h.tagName, text: $(h).text().replace(/\s+/g, ' ').trim() }));
  const types = $('script[type="application/ld+json"]').toArray().flatMap((s) => { try { const j = JSON.parse($(s).text()); return [j, ...(j['@graph'] ?? [])].flatMap((n) => [].concat(n['@type'] ?? [])); } catch { return []; } });
  site[p] = { title: $('title').text(), meta: $('meta[name="description"]').attr('content') ?? '', h1: $('h1').first().text().replace(/\s+/g, ' ').trim(), heads, text: norm($('main').text()), types: [...new Set(types)], lang: $('html').attr('lang') };
}

const OWNER_A = ['/', '/best-website-maintenance-for-small-business/', '/best-website-maintenance-companies/', '/how-long-does-website-maintenance-take/', '/best-wp-buffs-alternatives/', '/website-maintenance-services-for-uk/', '/php-vulnerability-php2shell/', '/wordpress-php-vulnerability/'];
const QUESTION = /^(how|what|why|can|does|do|is|are|which|when|should|who|will)\b/;
const tiers = [], briefs = [], gaps = [];
const primaryOf = {};
for (const p of pages) {
  const rows = (byPage[p] ?? []).sort((a, b) => b.i - a.i);
  const t = targets[p];
  primaryOf[p] = t?.primary || rows.find((r) => ownerOf.get(norm(r.q)) === p)?.q || site[p].h1.toLowerCase();
}
for (const p of pages) {
  const rows = (byPage[p] ?? []).sort((a, b) => b.i - a.i);
  const imp = rows.reduce((a, r) => a + r.i, 0), clk = rows.reduce((a, r) => a + r.c, 0);
  const wpos = imp ? rows.reduce((a, r) => a + r.pos * r.i, 0) / imp : 0;
  const best = rows.length ? Math.min(...rows.map((r) => r.pos)) : 0;
  const primary = primaryOf[p];
  const prim = rows.find((r) => norm(r.q) === norm(primary));
  let tier = 'C', why = '';
  const topQ = rows.find((r) => r.pos <= 10 && r.i >= 50);
  if (topQ) { tier = 'A'; why = `"${topQ.q}" #${topQ.pos} with ${topQ.i} impressions`; }
  else if (prim && prim.pos > 10 && prim.pos <= 13 && prim.i >= 10) { tier = 'A'; why = `primary at #${prim.pos}`; }
  else { const b = rows.find((r) => r.pos > 10 && r.pos <= 30 && r.i >= 50); if (b) { tier = 'B'; why = `"${b.q}" #${b.pos} with ${b.i} impressions`; } }
  // The owner's expected Tier A list (BATCH-2-FINAL-PROMPT section 3): kept protected even where the 3-month data is thin (safest).
  if (tier !== 'A' && OWNER_A.includes(p)) { why = `owner's expected Tier A list (data: ${why || 'below the thresholds'})`; tier = 'A'; }
  tiers.push({ url: p, primary_keyword: primary, impressions: imp, clicks: clk, ctr: imp ? (100 * clk / imp).toFixed(2) + '%' : '', weighted_position: wpos ? wpos.toFixed(1) : '', best_position: best || '', top_5_queries: rows.slice(0, 5).map((r) => `${r.q} (${r.i} impr, #${r.pos})`).join('; '), tier, tier_reason: why });

  // Brief.
  const secondary = targets[p]?.secondary ?? fullMap.filter((r) => r['Owner page (target)'] === p).sort((a, b) => num(b['Impressions (90d)']) - num(a['Impressions (90d)'])).slice(1, 9).map((r) => r.Keyword);
  const questions = rows.filter((r) => QUESTION.test(norm(r.q)) && ownerOf.get(norm(r.q)) !== undefined ? ownerOf.get(norm(r.q)) === p : QUESTION.test(norm(r.q)));
  const intent = /^\/(best-|.*-alternative)/.test(p) ? 'commercial (comparison)' : /packages|services|recovery|removal|repair|migration|support|hosting|partner|agencies|for-(usa|uk|canada|australia|ireland|france|netherlands|spain|switzerland|brazil)/.test(p) ? 'transactional' : /cost|how-much/.test(p) ? 'commercial (cost research)' : 'informational';
  const linkPlan = [['/monthly-website-maintenance-packages/', 'website maintenance plans and pricing'], ['/how-much-does-website-maintenance-cost/', 'website maintenance cost'], ['/', 'website maintenance services']].filter(([u]) => u !== p).map(([u, a]) => `${u} ("${a}")`).join('; ');
  const s = site[p];
  const schemaPlan = [...s.types.filter((x) => !['WebSite', 'Organization', 'WebPage', 'ImageObject', 'ListItem', 'Question', 'Answer', 'SearchAction', 'EntryPoint', 'PropertyValueSpecification'].includes(x)), !s.types.includes('BreadcrumbList') && 'add BreadcrumbList', intent === 'transactional' && !s.types.includes('Service') && 'add Service'].filter(Boolean).join('; ');
  briefs.push({ url: p, tier, primary_keyword: primary, secondary_keywords: secondary.join('; '), intent, question_queries: questions.slice(0, 12).map((r) => `${r.q} (${r.i})`).join('; '), competitor_titles: 'not read (no web search in this run)', internal_link_plan: linkPlan, schema_plan: schemaPlan, live_title: live[p]?.title ?? '', rebuild_title: s.title });

  // Gaps: question queries with no heading answering them; secondary keywords absent from the page.
  const headText = s.heads.map((h) => norm(h.text));
  const words = (x) => norm(x).split(' ').filter((w) => w.length > 3 && !['website', 'websites', 'with', 'your', 'does', 'what', 'that', 'this', 'from', 'much', 'should'].includes(w));
  for (const r of questions.filter((r) => r.i >= 10)) {
    const w = words(r.q);
    const hit = headText.some((h) => w.length && w.filter((x) => h.includes(x)).length / w.length >= 0.75);
    if (!hit) gaps.push({ url: p, tier, kind: 'question query with no matching heading or FAQ', item: r.q, impressions: r.i, position: r.pos, suggestion: 'add as FAQ', note: tier === 'A' ? 'Tier A: proposal only' : '' });
  }
  for (const k of secondary) if (!s.text.includes(norm(k))) gaps.push({ url: p, tier, kind: 'secondary keyword not on the page', item: k, impressions: '', position: '', suggestion: 'add in an H2/H3 label, intro or FAQ answer (once, naturally)', note: tier === 'A' ? 'Tier A: proposal only' : '' });
}
// Overlap: headings on one page that contain another page's primary keyword (cannibalization input).
const owners = Object.entries(targets).map(([pg, t]) => [pg, norm(t.primary)]).filter(([, k]) => k.split(' ').length >= 2);
const overlaps = [];
for (const p of pages) for (const h of [{ tag: 'title', text: site[p].title }, ...site[p].heads]) for (const [pg, k] of owners) {
  if (pg === p) continue;
  if (` ${norm(h.text)} `.includes(` ${k} `)) overlaps.push({ url: p, tier: tiers.find((t) => t.url === p).tier, kind: `${h.tag} uses another page's primary keyword`, item: `${h.text} [${k} → ${pg}]`, impressions: '', position: '', suggestion: 'later (phase 2 de-optimization) unless the page is built in batch 2', note: '' });
}
writeFileSync(`${OUT}/tiers.csv`, csvOut(tiers));
writeFileSync(`${OUT}/page-briefs.csv`, csvOut(briefs));
writeFileSync(`${OUT}/content-gaps.csv`, csvOut([...gaps, ...overlaps]));
writeFileSync(`${OUT}/_site.json`, JSON.stringify({ primaryOf, live, rebuild: Object.fromEntries(Object.entries(site).map(([p, s]) => [p, { title: s.title, meta: s.meta, h1: s.h1, lang: s.lang }])) }, null, 1));

// CTR findings.
const low = tiers.filter((t) => t.impressions >= 1000).map((t) => ({ ...t, c: t.impressions ? t.clicks / t.impressions : 0 })).sort((a, b) => b.impressions - a.impressions);
const lines = low.map((t) => `| ${t.url} | ${t.tier} | ${t.impressions} | ${t.clicks} | ${t.ctr} | ${t.weighted_position} | ${t.best_position} |`);
const sitelinks = gsc.filter((r) => /#/.test(r.p)).length;
writeFileSync(`${OUT}/ctr-findings.md`, `# CTR findings (GSC, last 3 months; bot and unrelated queries from "Not a target" removed)

| Page | Tier | Impressions | Clicks | CTR | Weighted position | Best position |
|---|---|---|---|---|---|---|
${lines.join('\n')}

Likely causes (5 lines):
1. Titles and metas read like a list of keywords, not an answer: nothing in the snippet says why to click (no price, no "compare N companies", no time answer).
2. The "best / small business" pages rank on long commercial queries (e.g. "website maintenance package pricing small business") where Google shows ads, a list and AI answers above position 4 to 6, so clicks go elsewhere.
3. Weighted positions are much lower than best positions: many impressions come from positions 20 to 60 where clicks are near zero.
4. The homepage's main query sits around #12, page 2, which explains its very low CTR more than the snippet does.
5. Sitelink and fragment rows (#list, #plans): ${sitelinks} GSC rows point at URLs with a fragment, so part of the impressions are sitelinks that rarely get clicked.

Plan: Tier A pages keep their live title and get a new meta description (answer + proof + action); Tier B keeps the primary keyword first and every ranking word, adds one modifier; Tier C gets full title and meta optimization (snippets.csv). Track CTR per page in Search Console 4 to 6 weeks after launch.
`);
const count = (t) => tiers.filter((x) => x.tier === t).length;
console.log(`pages ${pages.length}; tiers A ${count('A')} B ${count('B')} C ${count('C')}; gaps ${gaps.length}; overlaps ${overlaps.length}`);
console.log('Tier A:', tiers.filter((x) => x.tier === 'A').map((x) => x.url).join(' '));
