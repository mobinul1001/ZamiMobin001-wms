// Build checks from CMS-REQUIREMENTS.md and SEO-GUARDRAILS.md. Runs on dist/ after astro build.
// Any failure stops the deploy; the message says what to change. Warnings do not stop it.
// Usage: node scripts/check-build.mjs
import { healthNoteFor, PORTAL_NOTE as portalNote, HEALTH_PAGES as healthPages, REPAIR_TIME as repairTime, NO_FIX as noFix } from './lib/health-staging.mjs';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { findBanned } from './lib/claims.mjs';
const masterPrices = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));

const O = 'https://websitemaintenanceservices.org';
const fails = [];
const warns = [];
const fail = (check, msg) => fails.push(`[${check}] ${msg}`);
const warn = (check, msg) => warns.push(`[${check}] ${msg}`);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
if (!existsSync('dist')) throw new Error('dist/ not found: run astro build first');

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
const toPath = (file) => '/' + file.replace(/\\/g, '/').replace(/^dist\//, '').replace(/index\.html$/, '');
const distFiles = walk('dist');
const htmlFiles = distFiles.filter((f) => f.endsWith('index.html'));
const livePaths = new Set(htmlFiles.map(toPath));
const allPaths = new Set(distFiles.map((f) => '/' + f.replace(/\\/g, '/').replace(/^dist\//, '')));
const pathExists = (p) => livePaths.has(p) || allPaths.has(p) || allPaths.has(decodeURI(p));

// ---------- Redirects ----------
const redirects = new Map();
const querySeen = new Set();
for (const line of readFileSync('dist/_redirects', 'utf8').split(/\r?\n/)) {
  if (!line.trim() || line.startsWith('#')) continue;
  const p = line.trim().split(/\s+/);
  if (p.length === 4) {
    const key = `${p[0]}?${p[1]}`;
    if (querySeen.has(key)) fail('redirects', `"${key}" appears twice.`);
    querySeen.add(key);
    if (!pathExists(p[2].split('#')[0])) fail('redirects', `${key} points to ${p[2]}, which does not exist. Change the target in url-map.csv.`);
    continue;
  }
  const [from, to, status] = p;
  if (status === '200') continue;
  const key = from.replace(/\/$/, '') || '/';
  if (redirects.has(key)) fail('redirects', `"${from}" appears twice. Keep one entry.`);
  redirects.set(key, { from, to, status });
}
const owner = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const seen = new Set();
for (const o of owner) {
  if (seen.has(o.from)) fail('redirects', `"${o.from}" appears twice in the Redirects list. Remove one.`);
  seen.add(o.from);
}
for (const { from, to } of redirects.values()) {
  const target = to.split(/[?#]/)[0];
  if (livePaths.has(from)) fail('redirects', `"${from}" is a live page, so this redirect would never run. Remove it or unpublish the page.`);
  const next = redirects.get(target.replace(/\/$/, '') || '/');
  if (target === from) fail('redirects', `"${from}" redirects to itself.`);
  else if (next && !/^https?:/.test(to)) fail('redirects', `Chain or loop: ${from} -> ${to} -> ${next.to}. Point "${from}" straight to the final page.`);
  else if (!/^https?:/.test(to) && !pathExists(target)) fail('redirects', `"${from}" points to "${to}", which does not exist. Fix the target.`);
}

// ---------- URLs that disappeared ----------
const baseline = new Set();
for (const r of readFileSync('url-map.csv', 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map(cells)) {
  if (r[2] === '200' && (r[3] === 'page' || r[3] === 'post')) baseline.add(r[0].replace(O, ''));
}
let manifestSource = 'url-map.csv';
if (process.env.CONTEXT === 'production' && process.env.URL === O) {
  try {
    const res = await fetch(`${O}/url-manifest.json`, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      for (const p of await res.json()) baseline.add(p);
      manifestSource = 'url-map.csv + live manifest';
    }
  } catch {
    warn('missing-urls', 'Could not read the live URL list; checked against url-map.csv only.');
  }
}
for (const p of baseline) {
  const covered = livePaths.has(p) || redirects.has(p.replace(/\/$/, '') || '/');
  if (!covered) fail('missing-urls', `"${p}" was live and now has no page and no redirect. Add a redirect in the Redirects list, or restore the page.`);
}
writeFileSync('dist/url-manifest.json', JSON.stringify([...livePaths].filter((p) => !p.startsWith('/404')).sort()));

// ---------- Sitemap, robots ----------
const isLive = process.env.CONTEXT === 'production' && process.env.URL === O;
const sitemapUrls = new Set();
for (const f of distFiles.filter((x) => /sitemap-\d+\.xml$/.test(x))) for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1]);
const robotsTxt = readFileSync('dist/robots.txt', 'utf8');
for (const block of robotsTxt.split(/\n\s*\n/)) {
  if (/^Disallow:\s*\/\s*$/m.test(block) && /User-agent:\s*(Googlebot|Bingbot|OAI-SearchBot|ChatGPT-User|PerplexityBot|Perplexity-User|Claude-SearchBot|Claude-User|\*)\s*$/m.test(block)) fail('robots', 'robots.txt blocks a search bot with "Disallow: /".');
  if (/^Disallow:.*(\.css|\.js|\/wp-content|\/_astro)/m.test(block)) fail('robots', 'robots.txt blocks CSS, JS or images.');
}
if (!/^Disallow:\s*\/admin\/\s*$/m.test(robotsTxt)) fail('robots', 'robots.txt must block /admin/.');

// ---------- Page checks ----------
const stats = { pages: 0, links: 0, images: 0 };
const brokenLinks = new Map();
for (const file of htmlFiles) {
  const path = toPath(file);
  if (path.startsWith('/404')) continue;
  stats.pages++;
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  const robots = $('meta[name="robots"]').attr('content') ?? '';
  const title = $('title').first().text().trim();
  const desc = $('meta[name="description"]').attr('content')?.trim() ?? '';
  const noindex = /noindex/.test(robots);
  if (!title) fail('seo', `${path}: SEO title is empty.`);
  if (!desc && !noindex) fail('seo', `${path}: meta description is empty.`);
  if (title.length > 60) warn('seo-length', `${path}: title is ${title.length} characters (aim for 60).`);
  if (desc.length > 155) warn('seo-length', `${path}: description is ${desc.length} characters (aim for 155).`);
  if ($('h1').length !== 1) fail('h1', `${path}: has ${$('h1').length} H1 tags; needs exactly 1.`);
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical !== `${O}${path}`) fail('canonical', `${path}: canonical is ${canonical}.`);
  if (isLive && noindex && sitemapUrls.has(`${O}${path}`)) fail('noindex', `${path} is in the sitemap but has noindex.`);
  if (!isLive && !/noindex/.test(robots)) fail('noindex', `${path}: preview build must be noindex.`);

  // Owner rules from CLAIMS-AND-DESIGN.md section A: banned claims stay off the page, meta and schema.
  const claimTexts = [$('main').text().replace(/[ \t]+/g, ' '), title, desc, ...$('meta[property^="og:"], meta[name^="twitter:"]').toArray().map((m) => $(m).attr('content') ?? '').filter((v) => !/^https?:/.test(v))];
  for (const text of claimTexts) for (const line of findBanned(text, path).slice(0, 3)) fail('claims', `${path}: banned claim: ${line.slice(0, 110)}`);
  if (/\bJohn Doe\b|\bParaphrased\b/.test($('main').text())) fail('claims', `${path}: placeholder testimonial text.`);
  // A placeholder must never go live, and every form must reach Formspree.
  if (/\[Owner\b/i.test($('body').text())) fail('placeholder', `${path}: "[Owner..." placeholder text on the page.`);
  $('main form:not(#scan-form)').each((_, form) => {
    const action = $(form).attr('action') ?? '';
    if (!/^https:\/\/formspree\.io\/f\/[\w-]+$/.test(action) || $(form).attr('method') !== 'POST') fail('forms', `${path}: form does not post to Formspree.`);
    if (/\/f\/MISSING-/.test(action)) {
      if (process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production') fail('forms', `${path}: no Formspree ID in src/data/forms.json.`);
      else warn('forms', `${path}: no Formspree ID yet.`);
    }
    if ($(form).find('button[disabled], input[type="submit"][disabled]').length) fail('forms', `${path}: submit button is disabled.`);
    if (!$(form).find('input[name="_gotcha"]').length) fail('forms', `${path}: form has no honeypot field.`);
    if ($(form).find('input:not([type="button"]), select, textarea').toArray().some((c) => !$(c).attr('name'))) fail('forms', `${path}: a form field has no name, so its value would not be sent.`);
  });
  // Owner rule: country pages show the master plans in local currency, and no dollar price unless the page is the USA one.
  const localPrice = masterPrices.local[path];
  if (localPrice) {
    const mainText = $('main').text();
    if (!$('#plans').length) fail('country-price', `${path}: #plans anchor is missing.`);
    if ($('.site-head a.btn').first().attr('href') !== '#plans') fail('country-price', `${path}: header See plans does not go to #plans.`);
    for (const f of ['Free hosting for the first year', '2 free webmail accounts', 'First month free'].filter(() => localPrice.currency !== 'BRL')) if (!mainText.includes(f)) fail('country-price', `${path}: "${f}" is missing.`);
    for (const p of [...localPrice.monthly, ...localPrice.annual, localPrice.fix, localPrice.cleanup]) if (!mainText.includes(p)) fail('country-price', `${path}: ${p} is missing.`);
    if (localPrice.currency !== 'USD' && /(?<![A-Z])\$\s?\d/.test(mainText)) fail('country-price', `${path}: shows a dollar price: ${/(?<![A-Z])\$\s?\d[^ ]*/.exec(mainText)[0]}`);
    $('main p, main li').each((_, e) => {
      const line = $(e).text();
      if (localPrice.annual.some((p) => line.includes(p)) && /\/(?:yr|ano)\b/.test(line) && !/2 months free|2 meses gr[aá]tis/i.test(line)) fail('annual-note', `${path}: annual price without the note: ${line.trim().slice(0, 80)}`);
    });
  }
  // Owner rule: backup and update services are in every plan, so their old monthly tiers must not return.
  if (['/wordpress-backup-services/', '/website-update-services/'].includes(path) && /\$\d+ \/ month/.test($('main').text())) fail('service-price', `${path}: old monthly tier price on the page.`);
  if (/HIPAA[- ](?:compl|certif)|secure online appointment booking|patient online appointment booking|Large patient booking database/i.test($('main').text())) fail('promises', `${path}: HIPAA compliance claim.`);
  if (path === '/website-repair-services/' && /under 60|60[- ]min|within 60 minutes/i.test($('main').text())) fail('promises', `${path}: old 60-minute response claim.`);
  // Owner rule: no guarantees beyond the hacked-site line, the malware re-clean and the migration fix.
  const promise = (path === '/website-repair-services/' ? /full refund/i : /no fix,? no fee|full refund/i).exec($('main').text()) ?? /full redo|free month if|zero risk|refund your first|that month's service is free/i.exec($('main').text());
  if (healthPages.includes(path) && (!$('main').text().includes(healthNoteFor(path)) || !$('main').text().includes(portalNote))) fail('healthcare', `${path}: healthcare note is missing.`);
  if (/On managed plans, updates are tested|Isolated Staging Clone|goes through isolated staging|apply and test every update/i.test($('main').text())) fail('staging', `${path}: staging claim outside the Business plan.`);
  if (path === '/website-repair-services/') {
    const repairText = $('main').text().replace(/\u2019/g, "'");
    if (/Most issues are fixed within 24 hours/i.test(repairText) || !repairText.includes(repairTime) || !repairText.includes(noFix)) fail('repair', `${path}: repair time or No fix, no fee wording is wrong.`);
  }
  if (promise) fail('promises', `${path}: "${promise[0]}" is not an approved promise.`);
  if (path === '/white-label-website-maintenance-services-for-agencies/') {
    const claim = /99\.\d+%|24\/7 (agency )?sla|3\.8 hours|slack|agency dashboard|\bWAF\b/i.exec($('main').text());
    if (claim) fail('white-label', `${path}: "${claim[0]}" was removed by the owner.`);
  }
  if (path === '/website-seo-services/' && /dedicated (senior )?(seo )?strategist|weekly strategy|priority sla/i.test($('main').text())) fail('seo-tiers', `${path}: removed tier claim on the page.`);
  // Owner rules for white-label: no margin percentage, no unlimited edits, no dedicated manager.
  if (/50%\+/.test($('main').text())) fail('white-label', `${path}: "50%+" margin claim.`);
  if (path === '/white-label-website-maintenance-services-for-agencies/' && /unlimited (small )?(edits|fixes|content)|dedicated (senior )?account/i.test($('main').text())) fail('white-label', `${path}: unlimited edits or dedicated manager.`);
  // Owner rule: the annual offer is "2 months free", and store pages carry their own plans.
  if (/\bsave[sd]? (?:around |roughly )?~?20%|\b20% off\b|two-and-a-half months/i.test($('main').text())) fail('annual-note', `${path}: says 20% instead of 2 months free.`);
  const storeSet = Object.values(masterPrices.storePlans).find((s) => s.path === path);
  if (storeSet) {
    const mainText = $('main').text();
    if (!$('#plans').length) fail('store-price', `${path}: #plans anchor is missing.`);
    for (const plan of storeSet.plans) for (const item of [plan.name, `$${plan.monthly.toLocaleString('en-US')}/mo`, `$${plan.annual.toLocaleString('en-US')}/yr`, ...plan.includes]) if (!mainText.includes(item)) fail('store-price', `${path}: "${item}" is missing.`);
    if (storeSet === masterPrices.storePlans.shopify && /free hosting/i.test($('.card').text())) fail('store-price', `${path}: Shopify plans must not offer hosting.`);
  }
  // Owner rule: annual prices always say "2 months free" (Spanish: "2 meses gratis").
  $('main p, main li, main td, main div, main h2, main h3, main details').each((_, e) => {
    if ($(e).children('p, div, li, table, details').length) return;
    // On a plan card the note sits beside the price.
    const text = $(e).closest('.plan').length ? $(e).closest('.plan').text() : $(e).text();
    if (/\$790\b|\$1,490\b|\$2,990\b|\$1,990\b|\$3,490\b|\$5,990\b|\$4,990\b|\b790, 1\.490\b/.test(text) && !/2 months free|2 meses gratis/i.test(text)) fail('annual-note', `${path}: annual price without "2 months free": ${text.trim().slice(0, 90)}`);
  });
  // FAQ schema must match the visible page.
  const squeezeText = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  const mainText = squeezeText($('main').text());
  const faqEntries = (n, out = []) => {
    if (Array.isArray(n)) n.forEach((x) => faqEntries(x, out));
    else if (n && typeof n === 'object') {
      if ([].concat(n['@type'] ?? []).includes('FAQPage')) out.push(...[].concat(n.mainEntity ?? []));
      Object.values(n).forEach((v) => faqEntries(v, out));
    }
    return out;
  };
  $('script[type="application/ld+json"]').each((_, e) => {
    for (const q of faqEntries(JSON.parse($(e).html()))) {
      stats.faqs = (stats.faqs ?? 0) + 1;
      if (!mainText.includes(squeezeText(q.name))) fail('faq-schema', `${path}: schema question not on the page: ${q.name}`);
      if (!mainText.includes(squeezeText(q.acceptedAnswer?.text))) fail('faq-schema', `${path}: schema answer differs from the page: ${q.name}`);
    }
  });

  $('main img, header img, footer img').each((_, e) => {
    stats.images++;
    const src = $(e).attr('src') ?? '';
    if (!($(e).attr('alt') ?? '').trim()) fail('alt', `${path}: image ${src} has no alt text. Add it in the page editor.`);
    if (src.startsWith('/') && !pathExists(decodeURI(src))) fail('images', `${path}: image ${src} does not exist.`);
    if (!$(e).attr('width') || !$(e).attr('height')) warn('image-size', `${path}: image ${src} has no width/height.`);
  });
  $('a[href]').each((_, e) => {
    const href = $(e).attr('href');
    if (!href || /^(#|mailto:|tel:|sms:|javascript:)/i.test(href)) return;
    let u;
    try {
      u = new URL(href, `${O}${path}`);
    } catch {
      return;
    }
    if (u.origin !== O) return;
    stats.links++;
    if (u.searchParams.has('plan') || u.searchParams.has('package') || u.searchParams.has('industry')) fail('links', `${path}: link to ${href}. Use /get-a-free-quote/#plan instead of a query URL.`);
    const p = decodeURI(u.pathname);
    if (redirects.has(p.replace(/\/$/, '') || '/')) fail('links', `${path}: links to ${p}, which redirects. Link straight to the final page.`);
    else if (!pathExists(p)) {
      if (!brokenLinks.has(p)) brokenLinks.set(p, path);
    }
  });
}
for (const [p, from] of brokenLinks) fail('links', `Broken link to ${p} (first seen on ${from}).`);
// Anchor links: a #id that no longer exists does not break the page, so it is only a warning.
const idsByPath = new Map(htmlFiles.map((file) => {
  const $ = cheerio.load(readFileSync(file, 'utf8'));
  return [toPath(file), { $, ids: new Set($('[id], a[name]').toArray().map((e) => $(e).attr('id') ?? $(e).attr('name'))) }];
}));
for (const [path, { $ }] of idsByPath) {
  $('main a[href*="#"]').each((_, e) => {
    const href = $(e).attr('href');
    let u;
    try {
      u = new URL(href, `${O}${path}`);
    } catch {
      return;
    }
    if (u.origin !== O || !u.hash || u.pathname === '/get-a-free-quote/' || u.pathname === '/contact/') return;
    const target = idsByPath.get(decodeURI(u.pathname));
    if (target && !target.ids.has(decodeURIComponent(u.hash.slice(1)))) warn('anchors', `${path}: anchor ${href} has no target.`);
  });
}
for (const u of sitemapUrls) if (!livePaths.has(u.replace(O, ''))) fail('sitemap', `${u} is in the sitemap but is not a page.`);
for (const f of walk('public').filter((x) => /\.(jpe?g|png|webp|gif)$/i.test(x))) {
  if (statSync(f).size > 2 * 1024 * 1024) warn('image-weight', `${f.replace(/\\/g, '/')} is over 2 MB.`);
}

const counts = warns.reduce((m, w) => {
  const k = w.split(']')[0].slice(1);
  m[k] = (m[k] ?? 0) + 1;
  return m;
}, {});
const report = { checkedAt: new Date().toISOString(), context: process.env.CONTEXT ?? 'unset', isLive, ...stats, sitemapUrls: sitemapUrls.size, redirects: redirects.size, queryRedirects: querySeen.size, manifestSource, failures: fails, warningCounts: counts, warnings: warns };
writeFileSync('reports/build-check.json', JSON.stringify(report, null, 2));
console.log(`build-check: ${stats.pages} pages, ${stats.links} internal links, ${stats.images} images, ${redirects.size + querySeen.size} redirects, ${sitemapUrls.size} sitemap URLs`);
console.log(`build-check: ${fails.length} failures, ${warns.length} warnings ${JSON.stringify(counts)}`);
if (fails.length) {
  console.error('\nBUILD STOPPED. The live site stays on its previous version. Fix these and save again:\n');
  fails.slice(0, 60).forEach((f) => console.error(`  ${f}`));
  if (fails.length > 60) console.error(`  ...and ${fails.length - 60} more (reports/build-check.json)`);
  process.exit(1);
}
