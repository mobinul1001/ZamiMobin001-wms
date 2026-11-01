// Read-only crawl of the live WordPress site for the rebuild (PROMPTS.md Phase 1).
// Sends GET requests only, at most one per second, and stops if the site starts blocking.
// Usage: node scripts/crawl.mjs [--limit=N] [--no-assets]
// Safe to re-run: finished URLs and downloaded files are skipped.
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import * as cheerio from 'cheerio';

const ORIGIN = 'https://websitemaintenanceservices.org';
const USER_AGENT = 'WMS-rebuild-crawler/1.0 (owner-approved read-only site migration)';
const INTERVAL_MS = 1000;
const MAX_REDIRECTS = 10;
const MAX_CONSECUTIVE_BLOCKS = 5;

const args = process.argv.slice(2);
const limit = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? Infinity);
const skipAssets = args.includes('--no-assets');

const EXPORT = 'export';
const PAGES_DIR = join(EXPORT, 'pages');
const RAW_DIR = join(EXPORT, 'raw');
const API_DIR = join(EXPORT, 'wp-json');
for (const d of [PAGES_DIR, RAW_DIR, API_DIR]) mkdirSync(d, { recursive: true });

const log = (msg) => {
  const line = `${new Date().toISOString()} ${msg}`;
  console.log(line);
  appendFileSync(join(EXPORT, 'crawl.log'), line + '\n');
};

let lastRequest = 0;
let consecutiveBlocks = 0;
let requestCount = 0;

async function get(url) {
  const wait = lastRequest + INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  requestCount++;
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(60000),
  });
  if ([403, 429, 503].includes(res.status)) {
    consecutiveBlocks++;
    if (consecutiveBlocks >= MAX_CONSECUTIVE_BLOCKS) {
      log(`STOP: ${consecutiveBlocks} blocked responses in a row, last ${res.status} on ${url}`);
      finish('stopped: site is blocking the crawler');
      process.exit(2);
    }
  } else {
    consecutiveBlocks = 0;
  }
  return res;
}

// Follows redirects by hand so that the whole chain is recorded.
async function fetchChain(url) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const res = await get(current);
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), current).href;
      chain.push({ url: current, status: res.status, location: next });
      await res.body?.cancel();
      if (new URL(next).origin !== ORIGIN) return { chain, final: next, status: res.status, offsite: true };
      current = next;
      continue;
    }
    return { chain, final: current, status: res.status, res };
  }
  return { chain, final: current, status: 0, error: 'too many redirects' };
}

function normalize(href, base = ORIGIN) {
  try {
    const u = new URL(href, base);
    if (u.origin !== ORIGIN && u.origin !== ORIGIN.replace('https://', 'https://www.')) return null;
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    u.hash = '';
    return `${ORIGIN}${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

const isAsset = (url) => /\.(jpe?g|png|gif|webp|avif|svg|ico|pdf|zip|mp4|webm|mp3|css|js|woff2?|ttf|eot|docx?|xlsx?|csv|xml)$/i.test(new URL(url).pathname);
const isUpload = (url) => new URL(url).pathname.startsWith('/wp-content/uploads/');
// Skip action and tracking links that do not represent real pages.
const isCrawlable = (url) => {
  const u = new URL(url);
  if (isAsset(url)) return false;
  if (/^\/(wp-admin|wp-login\.php|wp-json|wp-content|wp-includes|xmlrpc\.php|cdn-cgi)/.test(u.pathname)) return false;
  if (/(^|&)(replytocom|add-to-cart|elementor-preview|preview|s)=/.test(u.search)) return false;
  return true;
};

const safeName = (url) => {
  const u = new URL(url);
  const slug = (u.pathname + u.search).replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 100) || 'home';
  return `${slug}-${createHash('md5').update(url).digest('hex').slice(0, 8)}`;
};

// ---------- URL sources ----------
const sources = new Map(); // url -> Set of source names
const queue = [];
const addUrl = (url, source) => {
  if (!url) return;
  if (!sources.has(url)) {
    sources.set(url, new Set());
    if (isCrawlable(url)) queue.push(url);
  }
  sources.get(url).add(source);
};

async function readSitemap(url, depth = 0) {
  const { status, res, chain, final } = await fetchChain(url);
  if (chain.length) log(`sitemap ${url}: redirects to ${final}`);
  if (status !== 200 || !res || depth > 3) {
    log(`sitemap ${url}: status ${status}`);
    await res?.body?.cancel();
    return;
  }
  const xml = await res.text();
  writeFileSync(join(API_DIR, `sitemap-${safeName(url)}.xml`), xml);
  const $ = cheerio.load(xml, { xmlMode: true });
  const children = $('sitemap > loc').map((_, e) => $(e).text().trim()).get();
  const urls = $('url > loc').map((_, e) => $(e).text().trim()).get();
  log(`sitemap ${url}: ${children.length} child sitemaps, ${urls.length} urls`);
  for (const c of children) await readSitemap(c, depth + 1);
  for (const u of urls) addUrl(normalize(u), 'sitemap');
}

const rest = {};
async function readRest(type) {
  const items = [];
  for (let page = 1; page < 200; page++) {
    const url = `${ORIGIN}/wp-json/wp/v2/${type}?per_page=100&page=${page}`;
    const res = await get(url);
    if (res.status !== 200) {
      if (page === 1) log(`REST ${type}: status ${res.status}`);
      await res.body?.cancel();
      break;
    }
    let batch;
    try {
      batch = await res.json();
    } catch {
      log(`REST ${type} page ${page}: response is not JSON`);
      break;
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (page >= Number(res.headers.get('x-wp-totalpages') ?? 1)) break;
  }
  writeFileSync(join(API_DIR, `${type}.json`), JSON.stringify(items, null, 1));
  log(`REST ${type}: ${items.length} items`);
  rest[type] = items;
  return items;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (const c of line) {
    if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function readGsc() {
  const inputs = [
    [join('gsc', 'performance-2026-11-01', 'Pages.csv'), 'gsc'],
    [join('gsc', 'performance-2-2026-11-01', 'Pages.csv'), 'gsc'],
    [join('gsc', 'links-2026-11-01', 'external-top-target-pages.csv'), 'gsc-backlink'],
    [join('gsc', 'links-2026-11-01', 'internal-top-target-pages.csv'), 'gsc-internal-link'],
  ];
  for (const name of readdirSync('gsc')) {
    if (name.startsWith('coverage-drilldown-')) inputs.push([join('gsc', name, 'Table.csv'), 'gsc-indexing']);
  }
  for (const [file, source] of inputs) {
    if (!existsSync(file)) {
      log(`GSC file missing: ${file}`);
      continue;
    }
    const rows = readFileSync(file, 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
    for (const r of rows) addUrl(normalize(parseCsvLine(r)[0]), source);
    log(`${file}: ${rows.length} rows`);
  }
  // The Query+Page export has the URL in its second column.
  const queryPage = join('gsc', 'query-page', 'query-page-last-3-months.csv');
  if (existsSync(queryPage)) {
    const rows = readFileSync(queryPage, 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
    for (const r of rows) addUrl(normalize(parseCsvLine(r)[1]), 'gsc');
    log(`${queryPage}: ${rows.length} rows`);
  }
}

function readUrlMap() {
  const rows = readFileSync('url-map.csv', 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
  for (const r of rows) {
    const [oldUrl, newUrl] = parseCsvLine(r);
    addUrl(normalize(oldUrl), 'url-map');
    addUrl(normalize(newUrl), 'url-map');
  }
}

// ---------- Page extraction ----------
function extract(html, pageUrl) {
  const $ = cheerio.load(html);
  const meta = (sel) => $(sel).first().attr('content')?.trim() ?? '';
  const socialTags = {};
  $('meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"]').each((_, e) => {
    const key = $(e).attr('property') ?? $(e).attr('name');
    socialTags[key] = socialTags[key] ? [].concat(socialTags[key], $(e).attr('content')) : $(e).attr('content');
  });
  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, e) => {
    const raw = $(e).html() ?? '';
    try {
      jsonLd.push(JSON.parse(raw));
    } catch {
      jsonLd.push({ _unparsed: raw });
    }
  });
  const headings = { h1: [], h2: [], h3: [] };
  for (const h of Object.keys(headings)) {
    $(h).each((_, e) => {
      const t = $(e).text().replace(/\s+/g, ' ').trim();
      if (t) headings[h].push(t);
    });
  }

  const internalLinks = new Map();
  const externalLinks = new Set();
  $('a[href]').each((_, e) => {
    const href = $(e).attr('href');
    const n = normalize(href, pageUrl);
    if (n) internalLinks.set(n, $(e).text().replace(/\s+/g, ' ').trim());
    else if (/^https?:/i.test(href)) externalLinks.add(href);
  });

  const images = new Map();
  const addImage = (src, alt, from) => {
    if (!src || src.startsWith('data:')) return;
    try {
      const abs = new URL(src, pageUrl).href;
      if (!images.has(abs)) images.set(abs, { src: abs, alt: alt ?? '', from });
    } catch {}
  };
  $('img, source').each((_, e) => {
    const el = $(e);
    const alt = el.attr('alt');
    for (const attr of ['src', 'data-src', 'data-lazy-src', 'data-original']) addImage(el.attr(attr), alt, attr);
    for (const attr of ['srcset', 'data-srcset', 'data-lazy-srcset']) {
      for (const part of (el.attr(attr) ?? '').split(',')) addImage(part.trim().split(/\s+/)[0], alt, attr);
    }
  });
  addImage($('meta[property="og:image"]').attr('content'), '', 'og:image');
  addImage($('meta[name="twitter:image"]').attr('content'), '', 'twitter:image');
  const uploadRe = /https?:\\?\/\\?\/(?:www\.)?websitemaintenanceservices\.org\\?\/wp-content\\?\/uploads\\?\/[^"'()\s<>\\]+(?:\\?\/[^"'()\s<>\\]+)*/g;
  for (const m of html.match(uploadRe) ?? []) addImage(m.replace(/\\\//g, '/'), '', 'html-reference');

  // Body text: drop chrome and scripts, keep hidden accordion content. <main> is not used
  // as the root because on the homepage it wraps only a small part of the content.
  const body = cheerio.load(html);
  body('script, style, noscript, template, svg, iframe').remove();
  body('header, footer, nav, [data-elementor-type="header"], [data-elementor-type="footer"]').remove();
  const text = body('body').text().replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  const wordCount = text ? text.split(/\s+/).length : 0;

  return {
    title: $('title').first().text().trim(),
    metaDescription: meta('meta[name="description"]'),
    canonical: $('link[rel="canonical"]').first().attr('href') ?? '',
    robots: meta('meta[name="robots"]'),
    socialTags,
    jsonLd,
    jsonLdTypes: [...new Set(jsonLd.flatMap((d) => [d, ...(d['@graph'] ?? [])]).flatMap((d) => d['@type'] ?? []))],
    headings,
    text,
    wordCount,
    internalLinks: [...internalLinks].map(([url, anchor]) => ({ url, anchor })),
    externalLinks: [...externalLinks],
    images: [...images.values()],
  };
}

// ---------- Crawl ----------
const results = new Map();
const assets = new Set();

async function crawlUrl(url) {
  const file = join(PAGES_DIR, `${safeName(url)}.json`);
  if (existsSync(file)) {
    const saved = JSON.parse(readFileSync(file, 'utf8'));
    results.set(url, saved);
    registerLinks(saved, url);
    return;
  }
  let record;
  try {
    const { chain, final, status, res, offsite, error } = await fetchChain(url);
    record = { url, status, finalUrl: final, redirectChain: chain, firstStatus: chain[0]?.status ?? status, offsite: !!offsite, error };
    if (res) {
      record.contentType = res.headers.get('content-type') ?? '';
      record.xRobotsTag = res.headers.get('x-robots-tag') ?? '';
      if (record.contentType.includes('html') && chain.length === 0) {
        const html = await res.text();
        writeFileSync(join(RAW_DIR, `${safeName(url)}.html`), html);
        Object.assign(record, extract(html, url));
      } else if (chain.length === 0 && record.contentType.includes('xml')) {
        writeFileSync(join(RAW_DIR, `${safeName(url)}.xml`), await res.text());
      } else {
        await res.body?.cancel();
      }
    }
  } catch (e) {
    record = { url, status: 0, finalUrl: url, redirectChain: [], error: String(e) };
  }
  writeFileSync(file, JSON.stringify(record, null, 1));
  results.set(url, record);
  registerLinks(record, url);
}

function registerLinks(record, url) {
  for (const l of record.internalLinks ?? []) addUrl(l.url, 'internal-link');
  for (const hop of record.redirectChain ?? []) addUrl(normalize(hop.location), 'redirect-target');
  if (record.canonical) addUrl(normalize(record.canonical, url), 'canonical');
  for (const img of record.images ?? []) {
    try {
      const u = new URL(img.src);
      if (u.hostname.endsWith('websitemaintenanceservices.org') && isUpload(img.src)) assets.add(`${ORIGIN}${u.pathname}`);
    } catch {}
  }
  for (const l of record.internalLinks ?? []) if (isUpload(l.url)) assets.add(l.url.split('?')[0]);
}

async function downloadAsset(url) {
  const path = decodeURI(new URL(url).pathname).slice(1);
  const target = join(EXPORT, 'assets', path);
  if (existsSync(target)) return { url, status: 'exists' };
  try {
    const { status, res, chain } = await fetchChain(url);
    if (!res || status !== 200 || chain.length) {
      await res?.body?.cancel();
      return { url, status };
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    return { url, status: 200 };
  } catch (e) {
    return { url, status: 0, error: String(e) };
  }
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

function writeInventory() {
  const cols = ['url', 'first_status', 'final_status', 'redirect_target', 'redirect_hops', 'content_type', 'sources', 'title', 'meta_description', 'canonical', 'robots', 'x_robots_tag', 'h1_count', 'h1', 'h2_count', 'word_count', 'jsonld_types', 'internal_links', 'images'];
  const rows = [cols.join(',')];
  for (const [url, r] of [...results].sort()) {
    rows.push([
      url, r.firstStatus, r.status, r.redirectChain?.length ? r.finalUrl : '', r.redirectChain?.length ?? 0, r.contentType,
      [...(sources.get(url) ?? [])].join('|'), r.title, r.metaDescription, r.canonical, r.robots, r.xRobotsTag,
      r.headings?.h1.length ?? '', r.headings?.h1.join(' / ') ?? '', r.headings?.h2.length ?? '', r.wordCount ?? '',
      (r.jsonLdTypes ?? []).join('|'), r.internalLinks?.length ?? '', r.images?.length ?? '',
    ].map(csvCell).join(','));
  }
  writeFileSync(join(EXPORT, 'inventory.csv'), '﻿' + rows.join('\n') + '\n');
}

let assetReport = [];
function finish(state) {
  writeInventory();
  const all = [...results.values()];
  const count = (fn) => all.filter(fn).length;
  const inSource = (url, s) => sources.get(url)?.has(s);
  const urls = [...results.keys()];
  const firstStatus = {};
  for (const r of all) firstStatus[r.firstStatus] = (firstStatus[r.firstStatus] ?? 0) + 1;
  const summary = {
    state,
    requestsSent: requestCount,
    urlsCrawled: all.length,
    urlsQueuedNotCrawled: queue.length,
    byFirstStatus: firstStatus,
    html200Pages: count((r) => r.status === 200 && r.redirectChain?.length === 0 && r.contentType?.includes('html')),
    restCounts: Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v.length])),
    urlsWithoutTrailingSlash: urls.filter((u) => {
      const p = new URL(u).pathname;
      return !p.endsWith('/') && !isAsset(u);
    }),
    redirectChains: all.filter((r) => (r.redirectChain?.length ?? 0) > 1).map((r) => ({ url: r.url, hops: r.redirectChain.map((h) => h.location) })),
    errors404: all.filter((r) => r.status === 404).map((r) => ({ url: r.url, sources: [...(sources.get(r.url) ?? [])] })),
    noindexPages: all.filter((r) => /noindex/i.test(`${r.robots ?? ''} ${r.xRobotsTag ?? ''}`)).map((r) => r.url),
    missingH1: all.filter((r) => r.headings && r.headings.h1.length === 0).map((r) => r.url),
    multipleH1: all.filter((r) => r.headings && r.headings.h1.length > 1).map((r) => ({ url: r.url, count: r.headings.h1.length })),
    gscNotInSitemap: urls.filter((u) => inSource(u, 'gsc') && !inSource(u, 'sitemap')),
    sitemapNotInGsc: urls.filter((u) => inSource(u, 'sitemap') && !inSource(u, 'gsc')),
    assetsReferenced: assets.size,
    assetsSaved: assetReport.filter((a) => a.status === 200 || a.status === 'exists').length,
    assetsFailed: assetReport.filter((a) => a.status !== 200 && a.status !== 'exists'),
  };
  writeFileSync(join(EXPORT, 'summary.json'), JSON.stringify(summary, null, 2));
  log(`summary: ${JSON.stringify({ state, requestsSent: requestCount, urlsCrawled: all.length, byFirstStatus: firstStatus, assetsSaved: summary.assetsSaved, assetsFailed: summary.assetsFailed.length })}`);
}

// ---------- Main ----------
log(`start limit=${limit} skipAssets=${skipAssets}`);
readGsc();
readUrlMap();
addUrl(`${ORIGIN}/`, 'seed');
for (const p of ['/home/', '/feed/', '/page/2/', '/services', '/elementor-1102/', '/this-page-should-not-exist-404-check/']) addUrl(`${ORIGIN}${p}`, 'system-probe');

// robots.txt names sitemap_index.xml; /sitemap.xml only redirects to the homepage.
await readSitemap(`${ORIGIN}/sitemap_index.xml`);
for (const type of ['pages', 'posts', 'media', 'categories', 'tags', 'users']) {
  if (limit !== Infinity && type === 'media') continue;
  const items = await readRest(type);
  for (const item of items) {
    addUrl(normalize(item.link), `rest-${type}`);
    if (['pages', 'posts'].includes(type)) addUrl(`${ORIGIN}/?p=${item.id}`, 'system-probe');
    if (['categories', 'tags'].includes(type) && item.link) addUrl(normalize(item.link + 'feed/'), 'system-probe');
  }
}

let processed = 0;
while (queue.length && processed < limit) {
  const url = queue.shift();
  await crawlUrl(url);
  processed++;
  if (processed % 25 === 0) {
    log(`progress: ${processed} crawled, ${queue.length} queued`);
    writeInventory();
  }
}

// Status check for the no-slash version of every page, as Phase 2 must map them all.
if (limit === Infinity) {
  for (const url of [...results.keys()]) {
    const u = new URL(url);
    if (u.search || !u.pathname.endsWith('/') || u.pathname === '/') continue;
    const noSlash = `${ORIGIN}${u.pathname.slice(0, -1)}`;
    if (!results.has(noSlash) && results.get(url).status === 200) {
      sources.set(noSlash, new Set(['no-slash-probe']));
      await crawlUrl(noSlash);
    }
  }
}

if (!skipAssets) {
  const list = [...assets].filter((a) => limit === Infinity || assetReport.length < 5);
  log(`assets to fetch: ${list.length}`);
  for (const [i, a] of list.entries()) {
    assetReport.push(await downloadAsset(a));
    if ((i + 1) % 100 === 0) log(`assets: ${i + 1}/${list.length}`);
    if (limit !== Infinity && i >= 4) break;
  }
}

finish(queue.length ? 'partial' : 'complete');
