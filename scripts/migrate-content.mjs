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
import { applyApprovedRemovals } from './lib/approved-removals.mjs';
import { fixContactText } from './lib/company-facts.mjs';
import { readCsv } from './lib/csv.mjs';
import { applyClaims, cleanString, OWN_CLAIM_PAGES, bannedIn } from './lib/claims.mjs';
import { applyFaqChanges, masterPriceMeta } from './lib/faq-approved.mjs';
import { articleMeta, fixSchemaOffers } from './lib/article-prices.mjs';

const O = 'https://websitemaintenanceservices.org';
// Titles and H1s from the keyword map the owner approved on 2026-11-01.
const keywordMap = new Map(readCsv('reports/phase-3-keyword-map.csv').map((r) => [r.path, r]));
// Existing wording only: links an unlinked phrase already in the text to the service page.
const SERVICE_LINKS = [
  { path: '/wordpress-malware-removal/', phrase: /our WordPress malware removal service/ },
  { path: '/wordpress-security-checklist/', phrase: /malware removal/i },
  { path: '/website-repair-services/', phrase: /malware removal/i },
  { path: '/website-hacked-recovery-services/', phrase: /malware removal/i },
  { path: '/monthly-website-maintenance-packages/', phrase: /malware removal/i },
];
const SERVICE_URL = '/wordpress-malware-removal-service/';
// Owner: a page whose body is mostly another language uses it for lang and the meta description.
// Spain was checked too: its body is about half English and half Spanish, so it stays en-US.
const PAGE_LANGUAGE = {
  '/website-maintenance-services-for-brazil/': {
    lang: 'pt-BR',
    ogLocale: 'pt_BR',
    description: 'Manutenção de sites confiável para empresas no Brasil. Mantemos seu site rápido, seguro e atualizado, com cuidado e monitoramento especializado.',
  },
};
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
const log = { unknownLinks: new Map(), unlinked: new Map(), hashLinks: 0, rewritten: 0, offerBlocks: [], schemaRemoved: [], promotedH1: [], demotedH1: [], missingImages: new Set(), faqMissing: [], forms: 0, serviceLinks: [], faqChanges: [], claims: [] };

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
service.addRule('eyebrow', {
  filter: (n) => n.getAttribute('data-eyebrow') !== null,
  replacement: (content) => `\n\n<p class="eyebrow">${content.trim()}</p>\n\n`,
});
const PANEL_PAGES = ['/website-repair-services/', '/website-design-services/', '/website-migration-services/', '/website-seo-services/', '/website-update-services/', '/wordpress-backup-services/', '/wordpress-malware-removal-service/'];
const safe = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pairHtml = (n) => {
  const [a, b] = JSON.parse(n.getAttribute('data-pair'));
  return `<p class="pair"><strong>${safe(a)}</strong> <span>${safe(b)}</span></p>`;
};
service.addRule('pair', {
  filter: (n) => n.getAttribute('data-pair') !== null,
  replacement: (_, n) => `\n\n${pairHtml(n)}\n\n`,
});
service.addRule('statusPanel', {
  filter: (n) => n.getAttribute('data-status-panel') !== null,
  replacement: (_, n) => {
    const { head, rows, notes, label } = JSON.parse(n.getAttribute('data-status-panel'));
    return `\n\n<div class="status-panel"><p class="status-head"><span>${safe(head)}</span><span class="tag">${label}</span></p>${rows.map(([t, d, s]) => `<p class="status-row"><strong>${safe(t)}</strong> ${d ? `<span>${safe(d)}</span> ` : ''}<em>${safe(s)}</em></p>`).join('')}${notes.map((x) => `<p class="status-note">${safe(x)}</p>`).join('')}</div>\n\n`;
  },
});
service.addRule('cardGrid', {
  filter: (n) => n.nodeName === 'DIV' && n.getAttribute('data-cards') !== null,
  replacement: (content) => (content.trim() ? `\n\n<div class="cards">\n\n${content.trim()}\n\n</div>\n\n` : ''),
});
service.addRule('card', {
  filter: (n) => n.getAttribute('data-card') !== null,
  replacement: (content, n) => (content.trim() ? `\n\n<div class="card">\n\n${n.getAttribute('data-pair') ? pairHtml(n) : content.trim()}\n\n</div>\n\n` : ''),
});
service.addRule('oneLineCell', {
  filter: ['th', 'td'],
  replacement: (content, n) => {
    const cells = Array.prototype.indexOf.call(n.parentNode.childNodes, n);
    const text = content.replace(/\s*\n+\s*/g, ' ').replace(/\|/g, '\\|').trim();
    return `${cells === 0 ? '| ' : ' '}${text} |`;
  },
});
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
    // A whole card wrapped in a link: keep its heading as a real heading.
    const heading = /^\s*(#{1,6}) +(.+?)\s*(?:\n+([\s\S]*))?$/.exec(content);
    if (heading) {
      const href = n.getAttribute('href').replace(/ /g, '%20').replace(/\)/g, '%29').replace(/\(/g, '%28');
      const rest = (heading[3] ?? '').replace(/\s*\n\s*/g, ' ').trim();
      return `\n\n${heading[1]} [${heading[2]}](${href})\n\n${rest ? `[${rest}](${href})\n\n` : ''}`;
    }
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

  applyApprovedRemovals($, path);
  applyClaims($, path, log.claims);

  // The approved H1 goes in the frontmatter and the layout prints it once. On pages with no H1
  // today, the first heading stays in the body as it was.
  const h1 = keywordMap.get(path).newH1;
  const h1s = $('h1');
  if (h1s.length > 1) log.demotedH1.push(path);
  if (path === '/website-maintenance-services-for-brazil/') {
    // The new H1 is a line already on the page, and the old H1 stays as a subheading.
    $('body *').filter((_, e) => $(e).children().length === 0 && $(e).text().trim() === h1).first().remove();
    h1s.each((_, e) => {
      e.tagName = 'h2';
    });
  } else {
    h1s.first().remove();
    $('h1').each((_, e) => {
      e.tagName = 'h2';
    });
  }
  if (!h1s.length) log.promotedH1.push({ path, h1 });

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

  // Small labels above article headings were inside the heading tag and ran into its text.
  $('h1 > .eb, h2 > .eb, h3 > .eb, h4 > .eb').each((_, e) => {
    const label = $(e);
    label.parent().before(`<p data-eyebrow="">${label.html()}</p>`);
    label.remove();
  });
  // Text pieces inside a link ran together ("PackagesPlans & pricing").
  $('a').each((_, a) => {
    const kids = $(a).children('span, b, strong, small, em, div, p');
    if (kids.length > 1) kids.each((_, k) => { $(k).after(' '); });
  });
  // The old fake panels on service pages: rows of title, detail and status, now shown as an example.
  if (PANEL_PAGES.includes(path)) {
    const panelHead = $('span').filter((_, s) => /^(●|Issue Fixed ✔)/.test($(s).text().trim()) && !$(s).find('span').toArray().some((k) => $(k).text().trim())).first();
    if (!panelHead.length) throw new Error(`${path}: panel head not found`);
    const head = panelHead.text().replace(/\s+/g, ' ').trim();
    let panel = panelHead.parent();
    while (panel.text().trim().length < head.length + 40) panel = panel.parent();
    panelHead.remove();
    const clean = (n) => $(n).text().replace(/\s+/g, ' ').trim();
    const filled = (n) => $(n).children().toArray().filter((k) => clean(k));
    const leaves = (n) => (filled(n).length ? filled(n).flatMap(leaves) : [clean(n)]);
    const rows = [];
    const notes = [];
    const walk = (n) => {
      const kids = filled(n);
      if (!kids.length) { if (clean(n)) notes.push(clean(n)); return; }
      if (kids.length === 2) {
        const [a, b] = [leaves(kids[0]), leaves(kids[1])];
        if (a.length <= 2 && b.length === 1 && b[0].split(' ').length <= 4) { rows.push([a[0], a[1] ?? '', b[0]]); return; }
      }
      kids.forEach(walk);
    };
    walk(panel[0]);
    if (rows.length + notes.length < 2 || notes.join(' ').split(' ').length > 40) throw new Error(`${path}: panel rows changed`);
    panel.replaceWith($('<div>x</div>').attr('data-status-panel', JSON.stringify({ head, rows, notes, label: ['/website-seo-services/', '/website-design-services/'].includes(path) ? 'Client result' : 'Example' })));
  }
  // Two short text pieces with no space between them ran together ("10Countries served"): number or title, then its label.
  $('div, span').each((_, e) => {
    const box = $(e);
    if (e.name === 'span' && box.parent()[0]?.name !== 'div') return;
    if (box.closest('a, table, form, details, h1, h2, h3, h4, h5, h6, button, nav, label, p, li, pre').length) return;
    if (box.contents().toArray().some((c) => c.type === 'text' && c.data.trim())) return;
    const all = box.children().toArray();
    if (!all.every((k) => ['span', 'small', 'b', 'strong', 'em'].includes(k.name))) return;
    const kids = all.filter((k) => $(k).text().trim());
    if (kids.length !== 2 || $(kids[0]).find('a, img').length || $(kids[1]).find('a, img').length) return;
    // A price and its unit ("$79" "/mo") stay on one line.
    if (box.text().trim().split(/\s+/).length > 30 || /^\//.test($(kids[1]).text().trim())) return;
    box.attr('data-pair', JSON.stringify([$(kids[0]).text().replace(/\s+/g, ' ').trim(), $(kids[1]).text().replace(/\s+/g, ' ').trim()]));
    // A row of these stays a row of cards.
    let holder = box;
    while (holder.parent().length && holder.parent().children().toArray().filter((c) => $(c).text().trim()).length === 1 && holder.parent()[0].name !== 'body') holder = holder.parent();
    holder.attr('data-pair-holder', '');
  });
  $('[data-pair-holder]').parent().each((_, g) => {
    const kids = $(g).children().toArray().filter((c) => $(c).text().trim());
    if (kids.length >= 2 && g.name !== 'body' && kids.every((c) => $(c).is('[data-pair-holder]'))) {
      $(g).attr('data-cards', '');
      kids.forEach((c) => { $(c).attr('data-card', ''); });
    }
  });
  $('li').each((_, e) => {
    const kids = $(e).children('span, b, strong, small, em');
    if (kids.length > 1 && !$(e).contents().toArray().some((c) => c.type === 'text' && c.data.trim())) kids.each((_, k) => { $(k).after(' '); });
  });
  // Mobile-only copies of table labels would print twice.
  $('td [class*="md:hidden"], td [class*="sm:hidden"], td [class*="lg:hidden"]').remove();
  // Card grids stay as cards.
  $('[class*="grid-cols"]').each((_, e) => {
    const grid = $(e);
    if (grid.closest('table, form, details').length) return;
    const kids = grid.children().toArray().filter((c) => c.name !== 'a' || $(c).text().trim());
    if (kids.length < 2) return;
    // Page layout grids hold whole sections; those stay as normal page flow.
    if (grid.find('h1, h2').length) return;
    if (kids.some((c) => $(c).text().trim().split(/\s+/).length > 120)) return;
    grid.attr('data-cards', '');
    kids.forEach((c) => {
      if (c.name === 'div' || c.name === 'article' || c.name === 'li') $(c).attr('data-card', '');
      else if (c.name === 'a') $(c).wrap('<div data-card=""></div>');
    });
  });

  const keepAttr = new Set(['data-eyebrow', 'data-cards', 'data-card', 'data-pair', 'data-status-panel','href', 'src', 'alt', 'width', 'height', 'loading', 'id', 'rel', 'target', 'colspan', 'rowspan', 'type', 'name', 'placeholder', 'value', 'for', 'disabled', 'open', 'data-placeholder-form', 'title', 'allowfullscreen', 'selected', 'required', 'rows']);
  $('body *').each((_, e) => {
    for (const attr of Object.keys(e.attribs ?? {})) {
      if (!keepAttr.has(attr)) delete e.attribs[attr];
    }
    if (e.attribs?.id && !(e.tagName === 'a' && !e.attribs.href)) delete e.attribs.id;
  });

  let body = service.turndown($('body').html() ?? '').replace(/\n{3,}/g, '\n\n').trim();
  for (const link of SERVICE_LINKS.filter((l) => l.path === path)) {
    const lines = body.split('\n');
    const i = lines.findIndex((l) => l.length > 40 && link.phrase.test(l) && !/^#|^\||\[[^\]]*malware removal|<summary|<details|<form/i.test(l));
    if (i === -1) {
      log.serviceLinks.push({ path, phrase: String(link.phrase), added: false });
      continue;
    }
    lines[i] = lines[i].replace(link.phrase, (m) => `[${m}](${SERVICE_URL})`);
    log.serviceLinks.push({ path, phrase: String(link.phrase), added: true, line: lines[i].slice(0, 160) });
    body = lines.join('\n');
  }
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
  const converted = await convert(path, record);
  const { h1 } = converted;
  const removed = [];
  const schema = (record.jsonLd ?? []).map((d) => stripSchema(d, removed)).filter(Boolean);
  fixSchemaOffers(path, schema);
  const body = applyFaqChanges(path, converted.body, schema, log.faqChanges);
  // Claims rules also cover meta descriptions, social tags and every schema text.
  const own = OWN_CLAIM_PAGES.has(path);
  const cleanValue = (raw, where) => {
    const v = articleMeta(path, masterPriceMeta(path, raw));
    if (!bannedIn(v, own)) return v;
    const cleaned = cleanString(v, own);
    log.claims.push({ path, rule: bannedIn(v, own), before: `${where}: ${v}`.slice(0, 300), after: cleaned });
    return cleaned;
  };
  const cleanSchema = (n, key = '') => {
    if (Array.isArray(n)) return n.map((x) => cleanSchema(x, key));
    if (n && typeof n === 'object') return Object.fromEntries(Object.entries(n).map(([k, v]) => [k, cleanSchema(v, k)]).filter(([, v]) => v !== ''));
    return typeof n === 'string' && !/^https?:|^@/.test(n) && !['@type', '@id', 'url'].includes(key) ? cleanValue(n, `schema ${key}`) : n;
  };
  schema.splice(0, schema.length, ...schema.map((d) => cleanSchema(d)));
  record.metaDescription = cleanValue(record.metaDescription ?? '', 'meta description');
  for (const [k, v] of Object.entries(record.socialTags ?? {})) if (typeof v === 'string' && !/^https?:/.test(v)) record.socialTags[k] = cleanValue(v, k);
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
  const language = PAGE_LANGUAGE[path];
  if (language) {
    Object.assign(record.socialTags, { 'og:locale': language.ogLocale, 'og:title': keywordMap.get(path).newTitle, 'og:description': language.description });
    for (const node of schema.flatMap((d) => d['@graph'] ?? [d])) {
      if ([].concat(node['@type'] ?? []).includes('WebPage')) Object.assign(node, { name: keywordMap.get(path).newTitle, description: language.description, inLanguage: language.lang });
    }
  }
  const front = {
    path,
    ...(language ? { lang: language.lang } : {}),
    title: keywordMap.get(path).newTitle,
    description: language?.description ?? record.metaDescription ?? '',
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
  writeFileSync(join(m.type === 'post' ? 'src/content/blog' : 'src/content/pages', `${name}.md`), `---\n${fixContactText(fm)}\n---\n\n${body}\n`);
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
// Owner, 2026-11-04: no WhatsApp links (the +880 number must not appear anywhere).
const footerLinks = dedupe(footerEl.find('a').toArray().map((a) => chromeLink($home(a)))).filter((l) => !/wa\.me\//.test(l.href));
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
  serviceLinks: log.serviceLinks,
  faqChanges: log.faqChanges,
};
writeFileSync('reports/migration-report.json', JSON.stringify(report, null, 2));
const claimCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
writeFileSync('reports/claims-applied.csv', '﻿' + ['page,rule,before,after', ...log.claims.map((c) => [c.path, c.rule, c.before, c.after].map(claimCell).join(','))].join('\n') + '\n');
const byRule = log.claims.reduce((m, c) => ((m[c.rule] = (m[c.rule] ?? 0) + 1), m), {});
console.log('claims applied', JSON.stringify(byRule));
console.log(JSON.stringify({ ...report, countdownBlocksRemoved: report.countdownBlocksRemoved.length, countdownSample: report.countdownBlocksRemoved[0], schemaRemoved: report.schemaRemoved.length, faqQuestionsNotFoundInBody: report.faqQuestionsNotFoundInBody.length, faqSample: report.faqQuestionsNotFoundInBody.slice(0, 6) }, null, 1));
void copyFileSync;
