// Converts every 200 page and post from the crawl into Markdown content files.
// Text, headings, FAQs, images and old titles stay as on the live site; only links are
// rewritten to final URLs. Keyword and price changes come later, after owner approval.
// Usage: node scripts/migrate-content.mjs
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import sharp from 'sharp';

const O = 'https://websitemaintenanceservices.org';
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
const rows = (f) => readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map(cells);

const urlMap = new Map(rows('url-map.csv').map((r) => [r[0], { to: r[1], status: r[2], type: r[3] }]));
const files = new Map(readdirSync('export/pages').map((f) => [JSON.parse(readFileSync(join('export/pages', f), 'utf8')).url, f]));
const rec = (u) => JSON.parse(readFileSync(join('export/pages', files.get(u)), 'utf8'));
const rawHtml = (u) => readFileSync(join('export/raw', files.get(u).replace('.json', '.html')), 'utf8');
const rest = Object.fromEntries(['pages', 'posts', 'categories', 'users'].map((t) => [t, JSON.parse(readFileSync(`export/wp-json/${t}.json`, 'utf8'))]));
const restByLink = new Map([...rest.pages, ...rest.posts].map((x) => [x.link, x]));
const catName = new Map(rest.categories.map((c) => [c.id, c.name]));
const userName = new Map(rest.users.map((u) => [u.id, u.name]));

const PLAN_HASH = { basic: 'basic-migration', standard: 'standard-migration', enterprise: 'enterprise-migration' };
const log = { unknownLinks: new Map(), unlinked: new Map(), hashLinks: 0, rewritten: 0, offerBlocks: [], schemaRemoved: [], promotedH1: [], demotedH1: [], missingImages: new Set(), faqMissing: [], forms: 0 };

function resolveLink(href, pagePath) {
  const raw = href.trim();
  if (!raw || /^(mailto:|tel:|sms:|javascript:|whatsapp:)/i.test(raw)) return { href: raw };
  if (raw.startsWith('#')) return { href: raw };
  let u;
  try {
    u = new URL(raw, O + pagePath);
  } catch {
    return { href: raw };
  }
  if (!/^(www\.)?websitemaintenanceservices\.org$/.test(u.hostname)) return { href: raw };
  if (u.pathname.startsWith('/wp-content/')) return { href: u.pathname + u.search + u.hash };
  const key = `${O}${u.pathname}${u.search}`;
  const plain = `${O}${u.pathname}`;
  const params = u.searchParams;
  const planValue = params.get('plan') ?? params.get('package') ?? (params.get('industry') ? `seo-${params.get('industry')}` : null);
  if (planValue) {
    const base = u.pathname.replace(/\/?$/, '/');
    log.hashLinks++;
    return { href: `${base}#${PLAN_HASH[planValue] ?? planValue}` };
  }
  const row = urlMap.get(key) ?? urlMap.get(plain) ?? urlMap.get(u.pathname.endsWith('/') ? plain : `${plain}/`);
  if (!row) {
    log.unknownLinks.set(key, pagePath);
    return { href: u.pathname + u.hash };
  }
  if (row.status === '404') {
    log.unlinked.set(u.pathname, (log.unlinked.get(u.pathname) ?? 0) + 1);
    return { unlink: true };
  }
  const to = row.to.replace(O, '');
  const samePage = u.pathname.replace(/\/?$/, '/') === pagePath;
  if (to.split('?')[0] !== u.pathname || u.search) log.rewritten++;
  if (samePage && u.hash) return { href: u.hash };
  return { href: to.split('?')[0] + u.hash };
}

// Ids used as link targets anywhere on the site are kept so anchor links still work.
const anchorTargets = new Map();
function collectAnchors(path, $) {
  $('a[href*="#"]').each((_, e) => {
    const href = $(e).attr('href');
    const hash = href.slice(href.indexOf('#') + 1);
    if (!hash) return;
    let target = path;
    if (!href.startsWith('#')) {
      try {
        const u = new URL(href, O + path);
        if (!u.hostname.endsWith('websitemaintenanceservices.org')) return;
        target = u.pathname.replace(/\/?$/, '/');
      } catch {
        return;
      }
    }
    if (!anchorTargets.has(target)) anchorTargets.set(target, new Set());
    anchorTargets.get(target).add(hash);
  });
}

const service = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
service.use(gfm);
service.keep(['form', 'details', 'iframe', 'video', 'audio', 'img']);
const baseEscape = service.escape.bind(service);
service.escape = (text) => baseEscape(text).replace(/</g, '&lt;');
service.addRule('rawImage', {
  filter: 'img',
  replacement: (_, n) => {
    const attrs = ['src', 'alt', 'width', 'height', 'loading'].filter((a) => n.getAttribute(a) !== null).map((a) => `${a}="${String(n.getAttribute(a)).replace(/"/g, '&quot;')}"`);
    return `<img ${attrs.join(' ')}>`;
  },
});
service.addRule('anchorTarget', { filter: (n) => n.nodeName === 'A' && n.getAttribute('id') && !n.getAttribute('href'), replacement: (_, n) => `<a id="${n.getAttribute('id')}"></a>` });
service.addRule('heading', {
  filter: ['h2', 'h3', 'h4', 'h5', 'h6'],
  replacement: (content, n) => {
    const text = content.replace(/\s*\n\s*/g, ' ').trim();
    return text ? `\n\n${'#'.repeat(+n.nodeName[1])} ${text}\n\n` : '';
  },
});
service.addRule('flatLink', {
  filter: (n) => n.nodeName === 'A' && n.getAttribute('href'),
  replacement: (content, n) => {
    const text = content.replace(/\s*\n\s*/g, ' ').trim();
    if (!text) return '';
    const rel = n.getAttribute('rel');
    const target = n.getAttribute('target');
    const href = n.getAttribute('href');
    if (rel && /sponsored|ugc|nofollow/.test(rel)) return `<a href="${href}" rel="${rel}"${target ? ` target="${target}"` : ''}>${text}</a>`;
    return `[${text}](${href.replace(/ /g, '%20').replace(/\)/g, '%29').replace(/\(/g, '%28')})`;
  },
});

const stripSchema = (node, removed) => {
  if (Array.isArray(node)) return node.map((n) => stripSchema(n, removed)).filter((n) => n !== undefined);
  if (node && typeof node === 'object') {
    const types = [].concat(node['@type'] ?? []);
    if (types.includes('Review') || types.includes('AggregateRating')) {
      removed.push(types.join(','));
      return undefined;
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === 'aggregateRating' || k === 'review') {
        removed.push(k);
        continue;
      }
      const s = stripSchema(v, removed);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return node;
};

async function imageSize(src) {
  if (!src.startsWith('/wp-content/uploads/')) return null;
  const file = join('export/assets', decodeURI(src).slice(1));
  if (!existsSync(file)) {
    log.missingImages.add(src);
    return null;
  }
  try {
    const m = await sharp(file).metadata();
    return m.width && m.height ? { width: m.width, height: m.height } : null;
  } catch {
    return null;
  }
}

const localSrc = (src, path) => {
  try {
    const u = new URL(src, O + path);
    return /websitemaintenanceservices\.org$/.test(u.hostname) ? u.pathname : u.href;
  } catch {
    return src;
  }
};

async function convert(path, record) {
  const $ = cheerio.load(rawHtml(record.url));
  $('script, style, noscript, template, svg, link, meta, head').remove();
  $('header, footer, nav, [data-elementor-type="header"], [data-elementor-type="footer"], .skip-link').remove();

  // Resetting 50% countdown: removed under SEO-GUARDRAILS section 4 (no fake countdowns).
  const offer = $('.wms-offer');
  if (offer.length) {
    log.offerBlocks.push({ path, count: offer.length, text: offer.first().text().replace(/\s+/g, ' ').trim().slice(0, 120) });
    offer.remove();
  }

  // H1 moves to the frontmatter; the layout prints it once.
  const h1s = $('h1');
  let h1 = h1s.first().text().replace(/\s+/g, ' ').trim();
  if (h1s.length) {
    h1s.first().remove();
    if (h1s.length > 1) log.demotedH1.push(path);
    $('h1').each((_, e) => {
      e.tagName = 'h2';
    });
  } else {
    const first = $('h2, h3').first();
    h1 = first.text().replace(/\s+/g, ' ').trim() || record.title;
    log.promotedH1.push({ path, h1 });
    first.remove();
  }

  const keepIds = anchorTargets.get(path) ?? new Set();
  $('[id]').each((_, e) => {
    const id = $(e).attr('id');
    if (keepIds.has(id) && e.tagName !== 'a') $(e).before(`<a id="${id}"></a>`);
  });
  $('a[href]').each((_, e) => {
    const el = $(e);
    const res = resolveLink(el.attr('href'), path);
    if (res.unlink) el.replaceWith(el.html() ?? '');
    else el.attr('href', res.href);
  });

  for (const e of $('img').toArray()) {
    const el = $(e);
    const src = el.attr('data-src') ?? el.attr('data-lazy-src') ?? el.attr('src');
    if (!src || src.startsWith('data:')) {
      el.remove();
      continue;
    }
    const local = localSrc(src, path);
    const alt = el.attr('alt') ?? '';
    let width = el.attr('width');
    let height = el.attr('height');
    if (!/^\d+$/.test(width ?? '') || !/^\d+$/.test(height ?? '')) {
      const size = await imageSize(local);
      width = size?.width;
      height = size?.height;
    } else await imageSize(local);
    for (const attr of Object.keys(e.attribs)) delete e.attribs[attr];
    el.attr('src', local).attr('alt', alt).attr('loading', 'lazy');
    if (width && height) el.attr('width', String(width)).attr('height', String(height));
  }

  $('form').each((_, f) => {
    log.forms++;
    const form = $(f);
    form.find('input[type="hidden"], .g-recaptcha, script').remove();
    form.find('[type="submit"], button').attr('disabled', 'disabled');
    form.attr('data-placeholder-form', 'true');
  });

  const keepAttr = new Set(['href', 'src', 'alt', 'width', 'height', 'loading', 'id', 'rel', 'target', 'colspan', 'rowspan', 'type', 'name', 'placeholder', 'value', 'for', 'disabled', 'open', 'data-placeholder-form', 'title', 'allowfullscreen', 'selected', 'required', 'rows']);
  $('body *').each((_, e) => {
    for (const attr of Object.keys(e.attribs ?? {})) {
      if (!keepAttr.has(attr)) delete e.attribs[attr];
    }
    if (e.attribs?.id && !(e.tagName === 'a' && !e.attribs.href)) delete e.attribs.id;
  });

  const body = service.turndown($('body').html() ?? '').replace(/\n{3,}/g, '\n\n').trim();
  return { h1, body };
}

const pages = [...urlMap.entries()].filter(([, m]) => m.status === '200' && (m.type === 'page' || m.type === 'post'));
for (const [u] of pages) collectAnchors(u.replace(O, ''), cheerio.load(rawHtml(u)));

for (const dir of ['src/content/pages', 'src/content/blog']) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}
if (existsSync('public/wp-content')) rmSync('public/wp-content', { recursive: true, force: true });
cpSync('export/assets/wp-content', 'public/wp-content', { recursive: true });

const yaml = (v) => JSON.stringify(v);
let done = 0;
for (const [u, m] of pages) {
  const path = u.replace(O, '');
  const record = rec(u);
  const { h1, body } = await convert(path, record);
  const removed = [];
  const schema = (record.jsonLd ?? []).map((d) => stripSchema(d, removed)).filter(Boolean);
  if (removed.length) log.schemaRemoved.push({ path, removed: [...new Set(removed)] });
  const faqs = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== 'object') return;
    if ([].concat(n['@type'] ?? []).includes('FAQPage')) {
      for (const q of [].concat(n.mainEntity ?? [])) faqs.push({ q: q.name, a: q.acceptedAnswer?.text ?? '' });
    }
    Object.values(n).forEach(walk);
  };
  walk(schema);
  const plainBody = body.replace(/[*_\\`]/g, '').replace(/\s+/g, ' ').toLowerCase();
  for (const f of faqs) {
    const q = String(f.q).replace(/[*_\\`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (q && !plainBody.includes(q)) log.faqMissing.push({ path, q: f.q });
  }
  const r = restByLink.get(u);
  const front = {
    path,
    title: record.title,
    description: record.metaDescription ?? '',
    robots: ['/get-a-free-quote/', '/free-website-maintenance-audit/'].includes(path) ? 'noindex, follow' : record.robots ?? '',
    h1,
    social: record.socialTags ?? {},
    schema,
    faqs,
    ...(m.type === 'post'
      ? {
          publishedAt: r?.date ?? null,
          updatedAt: r?.modified ?? null,
          author: userName.get(r?.author) ?? null,
          categories: (r?.categories ?? []).map((c) => catName.get(c)).filter(Boolean),
        }
      : {}),
  };
  const fm = Object.entries(front).map(([k, v]) => `${k}: ${yaml(v)}`).join('\n');
  const name = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '--');
  writeFileSync(join(m.type === 'post' ? 'src/content/blog' : 'src/content/pages', `${name}.md`), `---\n${fm}\n---\n\n${body}\n`);
  done++;
}

// Site chrome for the placeholder layout, taken from the live header and first footer.
const $home = cheerio.load(rawHtml(`${O}/`));
const chromeLink = ($a) => {
  const label = $a.text().replace(/\s+/g, ' ').trim();
  const res = resolveLink($a.attr('href') ?? '', '/');
  return label && res.href ? { label, href: res.href } : null;
};
const dedupe = (links) => [...new Map(links.filter(Boolean).map((l) => [`${l.label}|${l.href}`, l])).values()];
const nav = dedupe($home('header').last().find('a').toArray().map((a) => chromeLink($home(a))));
const footerEl = $home('footer').first();
footerEl.find('form').remove();
const footerLinks = dedupe(footerEl.find('a').toArray().map((a) => chromeLink($home(a))));
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/site-chrome.json', JSON.stringify({ nav, footer: footerLinks, tagline: 'Professional website maintenance services that keep your website secure, updated, optimized, and running at peak performance.' }, null, 2));
if (!existsSync('src/data/redirects.json')) writeFileSync('src/data/redirects.json', '[]\n');

const report = {
  migrated: done,
  posts: pages.filter(([, m]) => m.type === 'post').length,
  pages: pages.filter(([, m]) => m.type === 'page').length,
  linksRewritten: log.rewritten,
  planLinksToHash: log.hashLinks,
  unknownLinks: [...log.unknownLinks].map(([k, v]) => `${k.replace(O, '')} on ${v}`),
  unlinked404Targets: Object.fromEntries(log.unlinked),
  countdownBlocksRemoved: log.offerBlocks,
  schemaRemoved: log.schemaRemoved,
  promotedH1: log.promotedH1,
  secondH1DemotedToH2: log.demotedH1,
  missingImages: [...log.missingImages],
  faqQuestionsNotFoundInBody: log.faqMissing,
  formsKeptDisabled: log.forms,
};
writeFileSync('reports/migration-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, countdownBlocksRemoved: report.countdownBlocksRemoved.length, countdownSample: report.countdownBlocksRemoved[0], schemaRemoved: report.schemaRemoved.length, faqQuestionsNotFoundInBody: report.faqQuestionsNotFoundInBody.length, faqSample: report.faqQuestionsNotFoundInBody.slice(0, 6) }, null, 1));
void copyFileSync;
