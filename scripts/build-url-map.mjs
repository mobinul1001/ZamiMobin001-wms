// Phase 2: writes url-map.csv from the crawl (export/pages), REST data, Search Console and the plan.
// Rows the rules cannot settle get status "NEEDS OWNER DECISION" with a proposal in new_url.
// Usage: node scripts/build-url-map.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const O = 'https://websitemaintenanceservices.org';
const UNSURE = 'NEEDS OWNER DECISION';
const PROBE = '/this-page-should-not-exist-404-check';
const pathOf = (u) => u.replace(O, '');
const base = (p) => (p.length > 1 ? p.replace(/\/$/, '') : p);

const csvCells = (line) => {
  const out = [];
  let cur = '';
  let q = false;
  for (const c of line) {
    if (c === '"') q = !q;
    else if (c === ',' && !q) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
};
const readRows = (file) => readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map(csvCells);

const recs = readdirSync('export/pages').map((f) => JSON.parse(readFileSync(join('export/pages', f), 'utf8')));
const rest = Object.fromEntries(['pages', 'posts', 'media'].map((t) => [t, JSON.parse(readFileSync(`export/wp-json/${t}.json`, 'utf8'))]));
const byId = new Map();
for (const t of ['pages', 'posts']) for (const x of rest[t]) byId.set(x.id, x.link);
for (const m of rest.media) byId.set(m.id, m.source_url);
const realType = new Map();
for (const x of rest.pages) realType.set(x.link, 'page');
for (const x of rest.posts) realType.set(x.link, 'post');

// Approved merges from the cannibalization plan.
const MERGES = {
  '/plan-packages-and-costs': ['/monthly-website-maintenance-packages/', 'Move plans and prices first'],
  '/website-management-packages': ['/monthly-website-maintenance-packages/', 'Move management-package content first'],
  '/website-maintenance-services-for-small-business': ['/best-website-maintenance-for-small-business/', 'Move unique content first'],
  '/website-support': ['/website-support-services/', 'Move unique content first'],
  '/home': ['/', 'Duplicate homepage'],
};

// URLs the live site sends to the homepage through its catch-all, by closest real page.
const CATCHALL = {
  '/about': '/about-us/',
  '/best-website-website-maintenance-for-small-business': '/best-website-maintenance-for-small-business/',
  '/blog': '/blogs/',
  '/blog/wordpress-speed-optimization': '/wordpress-speed-optimization/',
  '/cancellation-policy': '/refund-cancellation-policy/',
  '/case-studies': '/website-maintenance-case-study/',
  '/contact-us': '/contact/',
  '/elementor-1102': '/importance-of-website-maintenance/',
  '/emergency-website-recovery': '/website-repair-services/',
  '/emergency-website-repair': '/website-repair-services/',
  '/emergency-website-support': '/website-repair-services/',
  '/gdpr-compliance': '/privacy-policy/',
  '/how-long-does-website-update-go-live': '/how-long-does-website-maintenance-take/',
  '/legal': '/terms-conditions/',
  '/refund-policy': '/refund-cancellation-policy/',
  '/services': '/',
  '/Site': '/',
  '/terms-and-conditions': '/terms-conditions/',
  '/website-backup': '/wordpress-backup-services/',
  '/website-backup-services': '/wordpress-backup-services/',
  '/website-hack-recovery': '/website-hacked-recovery-services/',
  '/website-maintenance-blogs': '/blogs/',
  '/website-maintenance-services': '/',
  '/website-migration-service': '/website-migration-services/',
  '/website-speed-optimization': '/website-speed-optimization-services/',
  '/white-label-website-maintenance-services': '/white-label-website-maintenance-services-for-agencies/',
  '/wordpress-speed-optimization-services': '/website-speed-optimization-services/',
};

// No exact page exists. Target chosen by the owner on 2026-11-01 (empty = 404).
const DECISIONS = {
  '/website-monitoring': ['/monthly-website-maintenance-packages/', 'No monitoring page exists. Uptime monitoring is a plan feature. Linked from 4 pages.'],
  '/website-monitoring-services': ['/monthly-website-maintenance-packages/', 'No monitoring page exists. Uptime monitoring is a plan feature. Linked from 5 pages.'],
  '/website-security': ['/wordpress-malware-removal-service/', 'No general security page exists; malware service is the closest. Linked from 10 pages.'],
  '/website-security-services': ['/wordpress-malware-removal-service/', 'No general security page exists; malware service is the closest. Linked from 3 pages.'],
  '/affiliate-disclosure': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/copyright-notice': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/agency-resources': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/reporting-guides': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/local-seo-white-label-pricing': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/white-label-local-ranking-reports': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/white-label-local-seo-for-agencies': ['', 'No such page. Linked only from /salon-seo/. Proposed 404.'],
  '/category/industry': ['/blogs/', 'Category archive. Guardrail: 301 to closest or noindex, follow. Proposed 301 to blog index.'],
  '/category/industry/page/2': ['/blogs/', 'Category pagination. Follows the /category/industry/ decision.'],
  '/category/industry/page/3': ['/blogs/', 'Category pagination. Follows the /category/industry/ decision.'],
  '/category/industry/page/4': ['/blogs/', 'Category pagination. Follows the /category/industry/ decision.'],
  '/category/industry/page/5': ['/blogs/', 'Category pagination. Follows the /category/industry/ decision.'],
  '/category/news': ['/blogs/', 'Category archive with 45 words. Proposed 301 to blog index.'],
  '/author/websitemaintenanceservices': ['/about-us/', 'Author is the company, not a person. Proposed 301 until real authors exist.'],
};

const OFF_TOPIC = new Set(readRows('plan-files/off-topic-pages.csv').map((r) => r[0]));

const NOINDEX = new Set(['/get-a-free-quote', '/free-website-maintenance-audit']);
const finalOf = (p) => {
  const m = MERGES[base(p.split('?')[0])];
  return m ? m[0] : p;
};

const backlinks = new Map(readRows('gsc/links-2026-11-01/external-top-target-pages.csv').map((r) => [r[0], +r[1]]));
const gsc = new Map(readRows('gsc/performance-2-2026-11-01/Pages.csv').map((r) => [r[0], [+r[1], +r[2]]]));
const clean = recs.filter((r) => r.status === 200 && !r.redirectChain?.length && r.contentType?.includes('html'));
const inbound = new Map();
const byUrl = new Map(recs.map((r) => [r.url, r]));
for (const r of clean) {
  for (const l of r.internalLinks ?? []) {
    if (!inbound.has(l.url)) inbound.set(l.url, new Set());
    inbound.get(l.url).add(r.url);
  }
}

function classify(r) {
  const u = new URL(r.url);
  const p = u.pathname;
  const key = base(p);
  const hasRedirect = !!r.redirectChain?.length;

  if (u.search) {
    const id = /^\?(?:p|attachment_id|page_id)=(\d+)$/.exec(u.search)?.[1];
    if (id) {
      const target = byId.get(+id) ?? r.finalUrl;
      return { status: 301, to: finalOf(pathOf(target)), type: 'wp-id', action: 'redirect', notes: byId.has(+id) ? 'Mapped by WordPress ID' : 'ID not in REST; live redirect target used' };
    }
    if (/^\/(get-a-free-quote|contact)\/?$/.test(p)) {
      const clean = `${key}/`;
      if (hasRedirect) return { status: 301, to: `${clean}`, type: 'no-slash-query', action: 'redirect', notes: 'Query string is kept by Netlify; page ignores it' };
      return { status: 200, to: `${p}${u.search}`, type: 'query-variant', action: 'keep', notes: 'No redirect by owner decision. Same page, canonical to the clean URL. Never link to it internally.' };
    }
    return { status: UNSURE, to: finalOf(pathOf(r.finalUrl)), type: 'query-variant', action: 'decide', notes: 'Unrecognised query string' };
  }

  if (key in DECISIONS) {
    const [to, notes] = DECISIONS[key];
    return { status: to ? 301 : 404, to, type: key.startsWith('/category') || key.startsWith('/author') ? 'archive' : 'dead-link-target', action: to ? 'redirect' : 'remove', notes: `Owner approved 2026-11-01. ${p.endsWith('/') ? notes : `No-slash copy. ${notes}`}` };
  }
  if (key in MERGES) {
    const [to, notes] = MERGES[key];
    return { status: 301, to, type: p.endsWith('/') ? 'page' : 'no-slash', action: key === '/home' ? 'redirect' : 'merge', notes };
  }
  if (key in CATCHALL) return { status: 301, to: CATCHALL[key], type: 'dead-link-target', action: 'redirect', notes: 'Live site sends this to the homepage; mapped to the closest page' };

  if (/\/feed$/.test(key)) {
    if (key === '/feed') return p.endsWith('/') ? { status: 200, to: '/feed/', type: 'feed', action: 'rebuild', notes: 'Generate an RSS feed at this path' } : { status: 301, to: '/feed/', type: 'no-slash', action: 'redirect', notes: '' };
    const parent = key.replace(/\/feed$/, '/');
    if (/^\/(category|author)\//.test(parent)) return { status: 301, to: '/blogs/', type: 'feed', action: 'redirect', notes: 'Archive feed' };
    return { status: 301, to: finalOf(parent), type: 'feed', action: 'redirect', notes: 'Post feed goes to its post' };
  }
  if (key === '/page/2') return { status: 301, to: '/', type: 'pagination', action: 'redirect', notes: 'Homepage pagination copy; live canonical already points to /' };

  if (hasRedirect) {
    const final = pathOf(r.finalUrl);
    if (final.startsWith('/wp-content/uploads/')) return { status: 301, to: final, type: 'attachment', action: 'redirect', notes: 'Attachment page goes straight to the file' };
    if (r.finalUrl === `${r.url}/`) return { status: 301, to: finalOf(final), type: 'no-slash', action: 'redirect', notes: '' };
    return { status: UNSURE, to: final, type: 'other', action: 'decide', notes: `Live redirect goes to ${final}; no closer page found` };
  }
  if (r.status === 200) {
    const notes = [];
    if (NOINDEX.has(key)) notes.push('noindex, follow; not in sitemap (owner decision)');
    if (OFF_TOPIC.has(p)) notes.push('Off-topic: migrate unchanged; owner decides later');
    const h1 = r.headings?.h1.length ?? 0;
    if (h1 !== 1) notes.push(`Live page has ${h1} H1 tags; fix to 1`);
    return { status: 200, to: p, type: realType.get(r.url) ?? 'page', action: 'keep', notes: notes.join('; ') };
  }
  return { status: UNSURE, to: '', type: 'other', action: 'decide', notes: `Live status ${r.status}` };
}

const original = new Map(readRows(existsSync('reports/url-map-original.csv') ? 'reports/url-map-original.csv' : 'url-map.csv').map((r) => [r[0], r]));
const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const out = [];
for (const r of recs.sort((a, b) => a.url.localeCompare(b.url))) {
  if (base(new URL(r.url).pathname) === PROBE) continue;
  const c = classify(r);
  const orig = original.get(r.url);
  const notes = orig?.[5] && !c.notes.includes(orig[5]) ? [orig[5], c.notes].filter(Boolean).join('; ') : c.notes;
  const newUrl = c.to === '' ? '' : `${O}${c.to}`;
  out.push({ old: r.url, newUrl, status: c.status, type: c.type, action: orig?.[4] && c.status === 200 ? orig[4] : c.action, notes, first: r.firstStatus, back: backlinks.get(r.url) ?? 0, clicks: gsc.get(r.url)?.[0] ?? 0, impr: gsc.get(r.url)?.[1] ?? 0, inb: inbound.get(r.url)?.size ?? 0 });
}
const header = 'old_url,new_url,status,type,action,notes,live_first_status,backlinks,gsc_clicks_16m,gsc_impressions_16m,internal_pages_linking';
writeFileSync('url-map.csv', [header, ...out.map((o) => [o.old, o.newUrl, o.status, o.type, o.action, o.notes, o.first, o.back, o.clicks, o.impr, o.inb].map(cell).join(','))].join('\n') + '\n');

// ---------- Validation ----------
const rows = new Map(out.map((o) => [o.old, o]));
const assetExists = (url) => existsSync(join('export/assets', decodeURI(new URL(url).pathname).slice(1)));
const problems = { chains: [], selfRedirect: [], targetMissing: [], missingFile: [], lostOriginal: [], backlink404: [], gsc404: [] };
for (const o of out) {
  if (o.status === 301 || (o.status === UNSURE && o.newUrl)) {
    if (o.newUrl === o.old) problems.selfRedirect.push(o.old);
    if (o.newUrl.includes('/wp-content/uploads/')) {
      if (!assetExists(o.newUrl)) problems.missingFile.push(o.newUrl);
      continue;
    }
    const t = rows.get(o.newUrl);
    if (!t) problems.targetMissing.push(`${o.old} -> ${o.newUrl}`);
    else if (t.status !== 200) problems.chains.push(`${o.old} -> ${o.newUrl} (${t.status})`);
  }
  if (o.status === 404 && (o.back > 0 || o.clicks > 0 || o.impr > 0)) problems.gsc404.push(o.old);
}
for (const [oldUrl, r] of original) {
  const n = rows.get(oldUrl);
  if (!n) problems.lostOriginal.push(`${oldUrl}: not crawled`);
  else if (n.newUrl !== r[1] || String(n.status) !== r[2]) problems.lostOriginal.push(`${oldUrl}: was ${r[2]} ${r[1]}, now ${n.status} ${n.newUrl}`);
}
for (const [u] of backlinks) {
  const n = rows.get(u);
  if (!n || (n.status !== 200 && n.status !== 301)) problems.backlink404.push(u);
}

const countBy = (fn) => out.reduce((m, o) => ((m[fn(o)] = (m[fn(o)] ?? 0) + 1), m), {});
const toHome = out.filter((o) => o.newUrl === `${O}/` && o.status === 301).map((o) => pathOf(o.old));
const unsure = out.filter((o) => o.status === UNSURE);
const summary = { total: out.length, byStatus: countBy((o) => o.status), byType: countBy((o) => `${o.status} ${o.type}`), problems: Object.fromEntries(Object.entries(problems).map(([k, v]) => [k, { count: v.length, sample: v.slice(0, 15) }])), redirectsToHomepage: toHome, unsure: unsure.map((o) => ({ url: pathOf(o.old), proposal: o.newUrl ? pathOf(o.newUrl) : '404', back: o.back, clicks: o.clicks, impr: o.impr, linkedFrom: o.inb, notes: o.notes })) };
writeFileSync('reports/phase-2-url-map-summary.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 1));
