// Local parity test: old crawl (export/pages) against the production build in dist/.
// Build first with CONTEXT=production and URL=https://websitemaintenanceservices.org.
// Writes reports/parity-local.csv and prints a summary. Usage: node scripts/parity-local.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { applyApprovedRemovals } from './lib/approved-removals.mjs';
import { applyClaims } from './lib/claims.mjs';
import { readCsv } from './lib/csv.mjs';
import { isApprovedOldLine } from './lib/faq-approved.mjs';

const O = 'https://websitemaintenanceservices.org';
const keywordMap = new Map(readCsv('reports/phase-3-keyword-map.csv').map((r) => [r.path, r]));
const cells = (line) => {
  const o = [];
  let c = '';
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) {
      o.push(c);
      c = '';
    } else c += ch;
  }
  o.push(c);
  return o;
};
const map = readFileSync('url-map.csv', 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map(cells);
const recFile = new Map();
const recs = new Map(readdirSync('export/pages').map((f) => {
  const r = JSON.parse(readFileSync(join('export/pages', f), 'utf8'));
  recFile.set(r.url, f);
  return [r.url, r];
}));
const totalImages = { old: 0, new: 0 };
const totalLines = { old: 0, missing: 0 };
const changed = { titles: 0, h1s: 0 };
const allMissing = [];
const redirectLines = readFileSync('dist/_redirects', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#')).map((l) => l.trim().split(/\s+/));
const pathRules = new Map(redirectLines.filter((p) => p.length === 3).map((p) => [p[0].replace(/\/$/, '') || '/', p[1]]));
const queryRules = new Map(redirectLines.filter((p) => p.length === 4).map((p) => [`${p[0]}?${p[1]}`, p[2]]));
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const LOOSE = (s) => norm(s).replace(/[“”"’']/g, '').toLowerCase();

function wordsOf(html) {
  const $ = cheerio.load(html);
  $('script, style, noscript, template, svg, iframe').remove();
  $('header, footer, nav').remove();
  const text = $('body').text().replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  return { count: text ? text.split(/\s+/).length : 0, text };
}
const typesOf = (html) => {
  const $ = cheerio.load(html);
  const types = new Set();
  $('script[type="application/ld+json"]').each((_, e) => {
    const visit = (n) => {
      if (Array.isArray(n)) return n.forEach(visit);
      if (n && typeof n === 'object') {
        [].concat(n['@type'] ?? []).forEach((t) => types.add(t));
        (n['@graph'] ?? []).forEach(visit);
      }
    };
    try {
      visit(JSON.parse($(e).html()));
    } catch {}
  });
  return types;
};

const results = [];
const counts = {};
for (const row of map) {
  const [oldUrl, newUrl, status, type] = row;
  const r = recs.get(oldUrl);
  const u = new URL(oldUrl);
  const out = { url: oldUrl.replace(O, ''), status, type, result: 'PASS', notes: [] };
  const bad = (n) => {
    out.result = 'FAIL';
    out.notes.push(n);
  };
  const info = (n) => out.notes.push(n);

  if (status === '301') {
    const to = newUrl.replace(O, '');
    const key = u.pathname.replace(/\/$/, '') || '/';
    if (u.search) {
      const qr = queryRules.get(`${u.pathname}?${u.search.slice(1)}`);
      if (/^\?(p|attachment_id|page_id)=/.test(u.search)) {
        if (qr !== to) bad(`query rule target ${qr}, expected ${to}`);
      } else info('no-slash + query: handled by Netlify slash rule (to verify after push)');
    } else if (key === (to.replace(/\/$/, '') || '/')) info('slash only: Netlify handling (to verify after push)');
    else if (pathRules.get(key) !== to) bad(`rule target ${pathRules.get(key)}, expected ${to}`);
    if (to === '/feed/') {
      if (!existsSync('dist/feed.xml')) bad('dist/feed.xml missing');
    } else if (!to.includes('/wp-content/') && !existsSync(join('dist', to, 'index.html'))) bad(`target page ${to} not in build`);
    if (to.includes('/wp-content/') && !existsSync(join('dist', decodeURI(to)))) bad(`target file ${to} not in build`);
  } else if (status === '404') {
    if (pathRules.has(u.pathname.replace(/\/$/, ''))) bad('has a redirect rule but should be 404');
    if (existsSync(join('dist', u.pathname, 'index.html'))) bad('page exists but should be 404');
  } else if (type === 'feed') {
    if (!existsSync('dist/feed.xml')) bad('dist/feed.xml missing');
  } else if (type === 'query-variant') {
    if (!existsSync(join('dist', u.pathname, 'index.html'))) bad('base page missing');
  } else {
    const file = join('dist', u.pathname, 'index.html');
    if (!existsSync(file)) {
      bad('page missing');
    } else {
      const html = readFileSync(file, 'utf8');
      const $ = cheerio.load(html);
      const title = norm($('title').first().text());
      const h1 = norm($('h1').first().text());
      const canonical = $('link[rel="canonical"]').attr('href');
      const robots = norm($('meta[name="robots"]').attr('content'));
      const { count } = wordsOf(html);
      Object.assign(out, { oldTitle: r.title, newTitle: title, oldH1: (r.headings?.h1 ?? []).join(' // '), newH1: h1, oldCanonical: r.canonical, newCanonical: canonical, oldRobots: r.robots, newRobots: robots, oldWords: r.wordCount, newWords: count, wordPct: r.wordCount ? Math.round((count / r.wordCount) * 1000) / 10 : '' });
      const approved = keywordMap.get(u.pathname);
      if (title !== norm(approved.newTitle)) bad(`title "${title}" is not the approved "${approved.newTitle}"`);
      if (canonical !== r.canonical) bad(`canonical ${canonical} vs ${r.canonical}`);
      const oldH1s = (r.headings?.h1 ?? []).map(LOOSE);
      if ($('h1').length !== 1) bad(`${$('h1').length} H1 tags`);
      if (LOOSE(h1) !== LOOSE(approved.newH1)) bad(`H1 "${h1}" is not the approved "${approved.newH1}"`);
      if (title !== norm(r.title)) changed.titles++;
      if (!oldH1s.includes(LOOSE(h1))) changed.h1s++;
      const expectedNoindex = ['/get-a-free-quote/', '/free-website-maintenance-audit/'].includes(u.pathname);
      if (expectedNoindex ? robots !== 'noindex, follow' : robots !== norm(r.robots)) bad(`robots "${robots}" vs "${r.robots}"`);
      // Expected words: the old page after the owner-approved removals and claim rules.
      const $base = cheerio.load(readFileSync(join('export/raw', `${recFile.get(oldUrl).replace('.json', '')}.html`), 'utf8'));
      $base('script, style, noscript, template, svg, header, footer, nav, .wms-offer').remove();
      applyApprovedRemovals($base, u.pathname);
      applyClaims($base, u.pathname);
      const expectedWords = wordsOf($base.html()).count;
      out.expectedWords = expectedWords;
      if (count < expectedWords * 0.95) bad(`words ${count} of ${expectedWords}`);
      // Expected words shrink with the removals, so also compare against the untouched old page.
      const wordFloor = u.pathname === '/white-label-website-maintenance-services-for-agencies/' ? 0.7 : 0.75;
      if (r.wordCount && count < r.wordCount * wordFloor) bad(`words ${count} of ${r.wordCount} on the old page`);
      const newTypes = typesOf(html);
      const missing = (r.jsonLdTypes ?? []).filter((t) => !newTypes.has(t) && t !== 'Review' && t !== 'AggregateRating');
      if (missing.length) bad(`schema types missing: ${missing.join(', ')}`);
      for (const img of r.images ?? []) {
        if (!/websitemaintenanceservices\.org\/wp-content\/uploads\//.test(img.src)) continue;
        const p = decodeURI(new URL(img.src).pathname);
        if (!existsSync(join('dist', p))) bad(`image missing: ${p}`);
      }
      // Every image shown in the old page body must still be shown, with its alt text.
      const rawFile = join('export/raw', `${recFile.get(oldUrl).replace('.json', '')}.html`);
      const $old = cheerio.load(readFileSync(rawFile, 'utf8'));
      $old('script, style, noscript, template, svg, header, footer, nav, .wms-offer, .skip-link').remove();
      applyApprovedRemovals($old, u.pathname);
      applyClaims($old, u.pathname);
      // The old H1 is replaced by the approved H1, except on Brazil where it stays as a subheading.
      if (u.pathname !== '/website-maintenance-services-for-brazil/') $old('h1').first().remove();
      const newImgs = new Map($('main img').toArray().map((e) => [$(e).attr('src'), $(e).attr('alt') ?? '']));
      let oldImgCount = 0;
      $old('body img').each((_, e) => {
        const src = $old(e).attr('data-src') ?? $old(e).attr('data-lazy-src') ?? $old(e).attr('src');
        if (!src || src.startsWith('data:')) return;
        oldImgCount++;
        const parsed = new URL(src, oldUrl);
        const key = parsed.hostname.endsWith('websitemaintenanceservices.org') ? parsed.pathname : parsed.href;
        if (!newImgs.has(key)) bad(`image dropped from body: ${key}`);
        else if (newImgs.get(key) !== ($old(e).attr('alt') ?? '')) bad(`alt text changed: ${key}`);
      });
      // Full-text check: every old line must appear in the new page, ignoring spacing and case.
      const squeeze = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
      const newText = squeeze(wordsOf(html).text);
      $old('iframe').remove();
      const oldLines = $old('body').text().split(/\s*\n\s*/).map((l) => l.trim()).filter((l) => squeeze(l).length >= 3);
      const missingLines = oldLines.filter((l) => !newText.includes(squeeze(l)) && !isApprovedOldLine(l, u.pathname));
      out.oldLines = oldLines.length;
      out.missingLines = missingLines.length;
      totalLines.old += oldLines.length;
      totalLines.missing += missingLines.length;
      if (missingLines.length) {
        bad(`${missingLines.length} of ${oldLines.length} old text lines not found`);
        allMissing.push({ url: u.pathname, lines: missingLines.slice(0, 8).map((l) => l.slice(0, 110)) });
      }
      out.oldImages = oldImgCount;
      out.newImages = $('main img').length;
      totalImages.old += oldImgCount;
      totalImages.new += out.newImages;
      const ogOld = Object.keys(r.socialTags ?? {});
      const ogMissing = ogOld.filter((k) => !$(`meta[property="${k}"], meta[name="${k}"]`).length);
      if (ogMissing.length) bad(`social tags missing: ${ogMissing.join(', ')}`);
    }
  }
  counts[`${status} ${out.result}`] = (counts[`${status} ${out.result}`] ?? 0) + 1;
  results.push(out);
}
const cols = ['url', 'status', 'type', 'result', 'oldWords', 'newWords', 'wordPct', 'oldTitle', 'newTitle', 'oldH1', 'newH1', 'oldCanonical', 'newCanonical', 'oldRobots', 'newRobots', 'notes'];
const cell = (v) => `"${String(Array.isArray(v) ? v.join('; ') : v ?? '').replace(/"/g, '""')}"`;
writeFileSync('reports/parity-local.csv', '﻿' + [cols.join(','), ...results.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n') + '\n');
const fails = results.filter((r) => r.result === 'FAIL');
const pages = results.filter((r) => r.oldWords !== undefined);
const pct = pages.map((r) => r.wordPct).sort((a, b) => a - b);
const highs = pages.filter((p) => p.wordPct > 103).sort((a, b) => b.wordPct - a.wordPct).map((p) => `${p.url} ${p.oldWords}->${p.newWords} (${p.wordPct}%)`);
const lows = pages.filter((p) => p.wordPct < 99).sort((a, b) => a.wordPct - b.wordPct).map((p) => `${p.url} ${p.oldWords}->${p.newWords} (${p.wordPct}%)`);
writeFileSync('reports/parity-missing-text.json', JSON.stringify(allMissing, null, 2));
console.log(JSON.stringify({ rows: results.length, counts, changedFromOld: changed, images: totalImages, textLines: totalLines, missingSample: allMissing.slice(0, 12), wordsOver103: highs, wordsUnder99: lows, pagesCompared: pages.length, oldWords: pages.reduce((a, r) => a + r.oldWords, 0), newWords: pages.reduce((a, r) => a + r.newWords, 0), wordPctMin: pct[0], wordPctMedian: pct[Math.floor(pct.length / 2)], wordPctMax: pct[pct.length - 1], fails: fails.slice(0, 40).map((f) => `${f.url}: ${f.notes.join(' | ')}`) }, null, 1));
