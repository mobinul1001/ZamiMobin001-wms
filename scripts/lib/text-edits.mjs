// Owner-approved content changes, applied by migrate-content.mjs to the page body and to every meta, social and
// schema string. Rules are page-scoped; '*' applies to every page except the ones in GLOBAL_EXCEPT.
//   exact:   [from, to]  an element whose whole text is `from` gets the text `to`
//   drop:    text        a list item, paragraph or cell whose whole text is `text` is removed
//   dropRow: text        a table row whose first cell is `text` is removed
//   quickAnswer: text  a <p class="quick-answer"> goes first in the body (batch 2: 40 to 60 words, facts from the page)
//   insertBefore: [text, newText]  a new paragraph `newText` goes right before the element whose whole text is `text`
//   sub:     [from, to, htmlFrom?, mdFrom?]  part of a sentence: `from` becomes `to` (htmlFrom / mdFrom when the
//            body HTML or the Markdown spells it differently)
// Every page-scoped rule must be used at least once, or the migration stops (checkTextEditsUsed).
const FREE_OFFER = 'Owner, 2026-11-05: free hosting and the 2 free email accounts come only with a website redesign.';
export const GLOBAL_EXCEPT = ['/website-redesign-services/'];

import { readFileSync as readPrices, readdirSync } from 'node:fs';
// Batch 2 quick answers for the English-language country pages, built from the local prices in prices.json.
const LOCAL = JSON.parse(readPrices(new URL('../../src/data/prices.json', import.meta.url), 'utf8')).local;
const COUNTRY_NAME = { usa: 'US', canada: 'Canadian', australia: 'Australian', ireland: 'Irish', france: 'French', netherlands: 'Dutch', spain: 'Spanish', switzerland: 'Swiss' };
const COUNTRY_QA = Object.fromEntries(Object.entries(COUNTRY_NAME).map(([k, name]) => {
  const p = `/website-maintenance-services-for-${k}/`; const l = LOCAL[p];
  return [p, { quickAnswer: `Our website maintenance service for ${name} businesses covers updates, backups, security monitoring, speed and fixes, done by our team every month. Plans start at ${l.monthly[0]} a month (Essential), with Growth at ${l.monthly[1]} and Business at ${l.monthly[2]}; one-time fixes start at ${l.fix}. Start with a free website check.` }];
}));

// Owner, 2026-11-06: the article byline says "WMS" instead of the homepage's main keyword (the link to /about-us/
// stays). Only articles that are not Tier A (src/data/tier-a.json); Tier A bylines are a phase 2 proposal.
const TIER_A = JSON.parse(readPrices(new URL('../../src/data/tier-a.json', import.meta.url), 'utf8')).pages;
const BYLINE_FROM = 'By: Website Maintenance Services';
const BYLINE = Object.fromEntries(['blog', 'pages'].flatMap((dir) => readdirSync(new URL(`../../src/content/${dir}/`, import.meta.url))
  .filter((f) => f.endsWith('.md'))
  .map((f) => [`/${f.replace(/\.md$/, '')}/`, readPrices(new URL(`../../src/content/${dir}/${f}`, import.meta.url), 'utf8')])
  // The generated Markdown already has either the old or the new byline, so both count (stable on every re-run).
  .filter(([p, md]) => !TIER_A.includes(p) && (md.includes(`[${BYLINE_FROM}](/about-us/)`) || md.includes('[By: WMS](/about-us/)')))
  .map(([p]) => [p, { exact: [[BYLINE_FROM, 'By: WMS']] }])));

export const TEXT_EDITS = {
  ...COUNTRY_QA,
  // Brazil (pt-BR; our wording: needs native review), prices from prices.json local.
  '/website-maintenance-services-for-brazil/': {
    quickAnswer: 'Nosso serviço de manutenção de sites para empresas no Brasil cobre atualizações, backups, monitoramento de segurança, velocidade e correções, feitos pela nossa equipe todo mês. Os planos começam em R$429 por mês (Essential), com Growth a R$809 e Business a R$1.629; correções avulsas a partir de R$269. Comece com uma verificação gratuita do site.',
  },
  // Owner, 2026-11-06: free hosting and 2 free email accounts stay only with a redesign, stated once in its pricing
  // section. No duration is stated until the owner confirms it (question in reports/batch-1/FINAL.md).
  '/website-redesign-services/': {
    quickAnswer: 'Our website redesign service rebuilds your site’s design, structure and CMS while keeping your rankings: we map every URL with 301 redirects, keep titles, content and schema, and test everything on staging before launch. It suits businesses whose site looks dated or converts poorly. Every project starts with a free audit and a fixed quote.',
    insertBefore: [['What drives the average website redesign cost?', 'Free hosting and 2 free email accounts are included with a redesign.']],
  },
  // Batch 2 quick answers (BATCH-2-FINAL-PROMPT section 6.3), built only from facts on each page.
  '/website-design-services/': {
    quickAnswer: 'Our website design service builds custom, mobile-first websites for small businesses, designed for speed, search and leads. We plan the pages, design them, build them on your CMS and test before launch. We have built 120+ websites. Every project starts with a free design consultation and a fixed quote for your scope.',
  },
  '/website-seo-services/': {
    addFaq: [['What is link building, and does a small business need it?', 'Link building means earning links to your website from other relevant websites. Search engines treat good links as a sign of trust, so they help a newer site compete. Most small businesses need some, but a few relevant local or industry links are worth more than many low-quality ones.']],
    quickAnswer: 'Our website SEO service improves how your site is found in search: a technical audit, on-page and content fixes, local SEO and clear monthly reports. It suits small businesses that want more qualified visitors from Google. Start with a free website SEO audit; you get a fixed quote for the work before anything begins.',
  },
  '/website-speed-optimization-services/': {
    quickAnswer: 'Our website speed optimization service makes slow sites load fast and pass Core Web Vitals (LCP, INP and CLS). We audit your pages, then compress images, tune caching, remove heavy plugins and scripts, and test before and after. It works for WordPress, WooCommerce and other sites. Start with a free speed check and a fixed quote.',
  },
  '/wordpress-website-maintenance-packages/': {
    addFaq: [['Do I need a WordPress maintenance plan if my host already does backups?', 'Usually yes. Hosting keeps the server running, and many hosts take backups, but most do not update your plugins and theme, test that an update did not break anything, or fix problems inside WordPress itself. A maintenance plan covers that work on top of hosting.']],
  },
  '/website-support-services/': {
    quickAnswer: 'Our website support service gives small businesses on-demand help with their site: content changes, small tasks, fixes, updates and security checks, handled by a real team when you ask. It suits owners who want help without managing a developer. Start with a free website check and a fixed quote; annual billing gets 2 months free.',
  },
  '/website-update-services/': {
    quickAnswer: 'Our website update service keeps your site current every month: core, plugin and theme updates with a backup before each one, testing after, and content changes on request. Updates are included in every plan, from $79 a month. Start with a free website health check to see what is out of date on your site.',
  },
  '/wordpress-backup-services/': {
    quickAnswer: 'Our WordPress backup service copies your files, database and media off-site on a schedule, and a real person checks the backups and tests restores. Backups come with every plan: weekly on Essential, daily on Growth and Business, kept 30, 60 or 90 days. Plans start at $79 a month.',
  },
  '/white-label-website-maintenance-services-for-agencies/': {
    addFaq: [['Who should hold the admin logins for client websites in a white label partnership?', 'Ask your partner who will actually log in to your clients’ sites. Each person who does the work should have a named account with only the access they need, and the agency should keep the main admin login. Avoid partners who pass the work on to another subcontractor without telling you.']],
    // Batch 2 cannibalization lint: this H2 used the primary keyword of /website-maintenance-process/.
    exact: [['Our Rigorous Website Maintenance Process', 'Our Rigorous White Label Maintenance Process']],
    quickAnswer: 'Our white label website maintenance service lets agencies offer website care under their own brand: we handle updates, backups, security scans, uptime monitoring and edits for your clients’ sites, with unbranded reports and an agency NDA. You keep the client relationship and set your own prices. Per-site pricing is on request.',
  },
  '/wms-partner-program/': {
    quickAnswer: 'The WMS partner program is for people who already work with businesses that need website maintenance. You bring the client and set your price; our team does the maintenance, WordPress support, security and updates behind the scenes, and you keep the margin. You do not need to be a developer. Apply with the partner form on this page.',
  },
  '/ecommerce-website-maintenance-packages/': {
    quickAnswer: 'Our ecommerce website maintenance packages keep WooCommerce and other online stores secure, fast and selling: tested plugin and payment updates, checkout checks, backups, security scans and fixes. Store plans start at $199 a month (Store Starter), with Store Growth at $349 and Store Pro at $599. Start with a free store audit.',
  },
  '/shopify-website-maintenance-packages/': {
    quickAnswer: 'Our Shopify website maintenance packages look after your store every month: theme and app updates, speed checks, store fixes and monthly reports. Plans start at $149 a month (Shopify Starter), with Shopify Growth at $299 and Shopify Pro at $499. It suits Shopify stores of any size. Start with a free store audit.',
  },
  // Owner, 2026-11-06: migration prices are final ($149 / from $399 / from $1,199), so the old platform-change prices follow.
  '/website-migration-services/': {
    addFaq: [['Should I back up my website before a migration?', 'Yes. Take a full backup of the files and the database before anything is moved, and keep it until the new site has been checked. If something goes wrong during the move, the backup lets you put the old site back exactly as it was.']],
    sub: [
      ['Starting from $1499', 'Starting from $1,199'],
      ['a platform change starts at $999', 'a platform change starts at $1,199'],
    ],
  },
  // Owner, 2026-11-05: the process shows 4 steps, so the heading and its label say 4.
  '/website-repair-services/': {
    exact: [
      ['Our 5-Step Website Repair Process', 'Our 4-Step Website Repair Process'],
      ['Documented 5-Step System', 'Documented 4-Step System'],
    ],
  },
  // FREE_OFFER: plan lists and comparison tables on every page.
  '*': {
    drop: ['Free hosting for the first year', '2 free webmail accounts', 'Hospedagem grátis no primeiro ano', '2 contas de webmail grátis'],
    dropRow: ['Free hosting for the first year', '2 free webmail accounts'],
  },
  // FREE_OFFER on the pricing page FAQ: the paid hosting price stays.
  '/monthly-website-maintenance-packages/': {
    sub: [['Yes. Every plan includes free hosting for the first year. After that, hosting is $19/month or $190/year.', 'Yes. Hosting is $19/month or $190/year.']],
  },
  // FREE_OFFER in the comparison posts. Only the offer is taken out; "hosting included" claims stay for the owner to decide.
  '/best-fixrunner-alternatives/': {
    dropRow: ['Business email (webmail)'],
    sub: [
      ['plus 1 year free hosting, 2 free webmails, WhatsApp emergency support', 'plus WhatsApp emergency support'],
      ['plus 1 year of free hosting, 2 free business webmails, cancel-anytime terms', 'plus cancel-anytime terms'],
      [' Because FixRunner charges separately for hosting, the real first-year value difference is significant.', ''],
      [' Website Maintenance Services includes 1 year of hosting free.', ''],
      ['$79 (hosting free)', '$79'],
      ['$79/mo, hosting included (1yr free)', '$79/mo, hosting included'],
      ['before counting the 2 free webmails, the cancel-anytime', 'before counting the cancel-anytime'],
      [', with a year of free hosting on top.', '.'],
    ],
  },
  '/best-wp-buffs-alternatives/': {
    dropRow: ['Business email (webmail)'],
    sub: [
      ['plus 1 year free hosting, 2 free business webmails, full access', 'plus full access'],
      ['plus 1 year of free hosting, 2 free business webmails, full access', 'plus full access'],
      [' Because WP Buffs charges separately for hosting, the real first-year value difference is significant.', ''],
      [' Website Maintenance Services includes 1 year of hosting free.', ''],
      ['$79 (hosting free)', '$79'],
      ['$79/mo, hosting included (1yr free)', '$79/mo, hosting included'],
      ['before counting the 2 free business webmails, and the fact that', 'before counting the fact that'],
      [', with a year of free hosting on top.', '.'],
    ],
  },
  '/sitecare-alternative/': {
    dropRow: ['Free business webmail'],
    drop: ['Beyond hosting, Website Maintenance Services throws in 2 free business webmails. These aren’t standard with SiteCare, and they add real value on day one.'],
    sub: [
      ['wins on price, free hosting, flexibility', 'wins on price, flexibility'],
      ['✓ Yes — 1 year free', '✓ Yes'],
      ['$79 + 1yr free hosting', '$79'],
      [' Website Maintenance Services goes further by including a full year of hosting free.', ''],
      [' while offering a year of hosting free on top:', ':'],
      ['starts at $79/month with a year of hosting included free, while', 'starts at $79/month, while'],
      [', plus free hosting for a year, free webmails, and cancel-anytime flexibility', ', plus cancel-anytime flexibility'],
      ['at a more accessible price, with a year of free hosting, free webmails, WhatsApp emergency support', 'at a more accessible price, with WhatsApp emergency support'],
      [' The tiebreaker: Website Maintenance Services includes a full year of hosting free, a concrete first-year saving SiteCare doesn’t match.', '', ' The tiebreaker: Website Maintenance Services includes a full <strong>year of hosting free</strong>, a concrete first-year saving SiteCare doesn’t match.', ' The tiebreaker: Website Maintenance Services includes a full **year of hosting free**, a concrete first-year saving SiteCare doesn\'t match.'],
    ],
  },
  // Batch 3 (gap audit, handoff phase 4): an old plan price; the master Essential plan is $79/mo (prices.json).
  '/wordpress-site-hacked-what-to-do/': {
    sub: [['$95/mo', '$79/mo']],
  },
  '/caribbean-taxi-transport-website-guide/': {
    sub: [
      ['We include a full year of free hosting, two free business webmail addresses on your own domain, full hosting and site access', 'We include full hosting and site access'],
      ['free hosting, free webmail, full access in your hands', 'full access in your hands'],
      ['comes with 1 year free hosting, 2 free webmails, full access, and 24/7 support', 'comes with full access and 24/7 support'],
    ],
  },
};

// Batch 3 (owner, 2026-11-10): the 3 replaced comparison images get an alt that describes the new neutral image.
const ALT = {
  '/best-fixrunner-alternatives/': ['Comparison of the best FixRunner alternatives highlighting Website Maintenance Services for WordPress maintenance, hosting, security, backups, and support.', 'Best FixRunner Alternatives: WordPress support services compared (WMS guide banner)'],
  '/best-wp-buffs-alternatives/': ['Comparison of the best WP Buffs alternatives, highlighting Website Maintenance Services for WordPress maintenance, hosting, security, backups, and support.', 'Best WP Buffs Alternatives: WordPress care services compared (WMS guide banner)'],
  '/sitecare-alternative/': ['SiteCare alternative comparison showing Website Maintenance Services vs SiteCare for WordPress maintenance, hosting, support, and pricing', 'SiteCare Alternative: WordPress care plans compared (WMS guide banner)'],
};
for (const [p, pair] of Object.entries(ALT)) TEXT_EDITS[p] = { ...(TEXT_EDITS[p] ?? {}), sub: [...(TEXT_EDITS[p]?.sub ?? []), pair] };

// The byline rule is merged into each article's own rules (some articles already have rules).
for (const [p, r] of Object.entries(BYLINE)) TEXT_EDITS[p] = { ...(TEXT_EDITS[p] ?? {}), exact: [...(TEXT_EDITS[p]?.exact ?? []), ...r.exact] };

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;');
const used = new Map();
const rulesFor = (path) => [...(GLOBAL_EXCEPT.includes(path) ? [] : [['*', TEXT_EDITS['*']]]), [path, TEXT_EDITS[path]]].filter(([, r]) => r);
const mark = (scope, kind, i) => used.set(`${scope}|${kind}|${i}`, true);

// Body: whole-text replacements, removals, then part-of-sentence changes on the HTML.
export function applyTextEdits($, path) {
  for (const [scope, r] of rulesFor(path)) {
    (r.exact ?? []).forEach(([from, to], i) => {
      const hits = $('body *').toArray().filter((e) => norm($(e).text()) === from && !$(e).children().toArray().some((c) => norm($(c).text()) === from));
      for (const e of hits) $(e).text(to);
      if (hits.length) mark(scope, 'exact', i);
    });
    (r.drop ?? []).forEach((text, i) => {
      const hits = $('li, p, td, dd').toArray().filter((e) => [text, text.replace(/’/g, "'")].includes(norm($(e).text())));
      hits.forEach((e) => $(e).remove());
      if (hits.length) mark(scope, 'drop', i);
    });
    (r.dropRow ?? []).forEach((text, i) => {
      const hits = $('tr').toArray().filter((tr) => norm($(tr).children('th, td').first().text()) === text);
      hits.forEach((e) => $(e).remove());
      if (hits.length) mark(scope, 'dropRow', i);
    });
    if (r.quickAnswer && !$('p.quick-answer').length) { $('body').prepend(`<p class="quick-answer">${esc(r.quickAnswer)}</p>`); mark(scope, 'quickAnswer', 0); }
    (r.insertBefore ?? []).forEach(([text, add], i) => {
      const hits = $('body *').toArray().filter((e) => norm($(e).text()) === text && !$(e).children().toArray().some((c) => norm($(c).text()) === text));
      hits.forEach((e) => $(e).before(`<p>${esc(add)}</p>`));
      if (hits.length) mark(scope, 'insertBefore', i);
    });
    const body = $('body');
    let html = body.html() ?? '';
    (r.sub ?? []).forEach(([from, to, htmlFrom], i) => {
      for (const f of [htmlFrom ?? esc(from), from.replace(/’/g, "'")].filter(Boolean)) {
        if (html.includes(f)) { html = html.split(f).join(esc(to)); mark(scope, 'sub', i); }
      }
    });
    body.html(html);
  }
}

// Meta, social and schema strings.
export function editString(path, s) {
  let out = s;
  for (const [scope, r] of rulesFor(path)) {
    (r.exact ?? []).forEach(([from, to], i) => { if (norm(out) === from) { out = to; mark(scope, 'exact', i); } });
    (r.sub ?? []).forEach(([from, to], i) => { for (const f of [from, from.replace(/’/g, "'")]) if (out.includes(f)) { out = out.split(f).join(to); mark(scope, 'sub', i); } });
  }
  return out;
}

// Every page-scoped rule was used somewhere.
export function checkTextEditsUsed() {
  // The '*' rules are a safety net (their sources were removed too), so they may find nothing.
  const unused = Object.entries(TEXT_EDITS).filter(([scope]) => scope !== '*').flatMap(([scope, r]) => Object.entries(r).flatMap(([kind, list]) => [].concat(kind === 'quickAnswer' ? [list] : list).map((x, i) => (used.has(`${scope}|${kind}|${i}`) ? null : `${scope} ${kind}: ${[].concat(x)[0]}`)))).filter(Boolean);
  if (unused.length) throw new Error(`text-edits: rules not used (text changed?):\n${unused.join('\n')}`);
}

// Parity: an old line that an approved rule removed or changed is not "missing".
export function isEditedOldLine(line, path) {
  // The live crawl split the byline: its old line is just the name. Approved only on articles with the byline rule.
  if (BYLINE[path] && norm(line) === 'Website Maintenance Services') return true;
  // Apostrophes are compared in one form: the old site mixes ’ and '.
  const q = (s) => norm(s).replace(/’/g, "'");
  const l = q(line);
  return rulesFor(path).some(([, r]) => (r.exact ?? []).some(([from]) => q(from) === l) || (r.drop ?? []).some((t) => l.includes(q(t))) || (r.dropRow ?? []).some((t) => l.startsWith(q(t))) || (r.sub ?? []).some(([from]) => l.includes(q(from))));
}

// HowTo schema that must match the page's visible steps. Owner, 2026-11-05: the repair page shows 4 steps,
// so the empty fifth step (left over from the removed "30-Day Warranty" step) goes, and the steps that remain
// must have the same names in the same order as the "### Step N: Name" headings in the body.
const HOWTO_MATCH_STEPS = ['/website-repair-services/'];
// Batch 2b: new FAQs (addFaq: [[question, answer]]) go into the page's FAQPage schema here and into the visible FAQ
// section in applyTextEditsMd, so the schema and the visible FAQ stay equal.
export function addFaqSchema(path, schema) {
  const r = TEXT_EDITS[path];
  if (!r?.addFaq) return;
  const node = schema.flatMap((d) => d['@graph'] ?? [d]).find((n) => [].concat(n['@type'] ?? []).includes('FAQPage'));
  if (!node) throw new Error(`text-edits: addFaq on ${path}, but the page has no FAQPage schema`);
  node.mainEntity = [].concat(node.mainEntity ?? []);
  r.addFaq.forEach(([q, a], i) => {
    if (!node.mainEntity.some((m) => norm(m.name ?? '') === norm(q))) node.mainEntity.push({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } });
    mark(path, 'addFaq', i);
  });
}

export function fixHowTo(path, schema, body) {
  if (!HOWTO_MATCH_STEPS.includes(path)) return;
  const visible = [...body.matchAll(/^#{2,4} Step (\d+): (.+)$/gm)].map((m) => [Number(m[1]), norm(m[2])]);
  const nodes = schema.flatMap((d) => d['@graph'] ?? [d]).filter((n) => [].concat(n['@type'] ?? []).includes('HowTo'));
  if (!nodes.length) throw new Error(`text-edits: no HowTo schema on ${path}`);
  for (const n of nodes) {
    n.step = (n.step ?? []).filter((s) => norm(String(s.name ?? '')));
    const got = n.step.map((s) => [s.position, norm(s.name)]);
    if (JSON.stringify(got) !== JSON.stringify(visible)) throw new Error(`text-edits: HowTo steps on ${path} ${JSON.stringify(got)} do not match the page ${JSON.stringify(visible)}`);
  }
}

// The same rules on the finished Markdown, so they also win over text that earlier migration steps write
// (price rules, merged pages, country plan cards). Run last.
export function applyTextEditsMd(path, md) {
  let out = md;
  // A line (list item, numbered item or paragraph) whose whole text is the dropped text, with one blank line after it.
  const lineOf = (text) => (line) => norm(line.replace(/^\s*(?:[-*]|\d+\.)\s+/, '')) === text;
  for (const [scope, r] of rulesFor(path)) {
    (r.drop ?? []).forEach((text, i) => {
      const lines = out.split('\n');
      const keep = [];
      let hit = false;
      for (let k = 0; k < lines.length; k++) {
        if ([text, text.replace(/’/g, "'")].some((t) => lineOf(t)(lines[k]))) { hit = true; if (lines[k + 1] === '' && keep.at(-1) === '') k++; continue; }
        keep.push(lines[k]);
      }
      if (hit) { out = keep.join('\n'); mark(scope, 'drop', i); }
    });
    (r.dropRow ?? []).forEach((text, i) => {
      const lines = out.split('\n');
      const keep = lines.filter((l) => !(l.startsWith('|') && norm(l.split('|')[1] ?? '') === text));
      if (keep.length !== lines.length) { out = keep.join('\n'); mark(scope, 'dropRow', i); }
    });
    (r.sub ?? []).forEach(([from, to, , mdFrom], i) => {
      for (const f of [mdFrom, from, from.replace(/’/g, "'")].filter(Boolean)) if (out.includes(f)) { out = out.split(f).join(to); mark(scope, 'sub', i); }
    });
    // New FAQs: appended to the end of the page's FAQ section, in the format that section already uses.
    if (scope === path && r.addFaq) {
      const lines = out.split('\n');
      const h = lines.findIndex((l) => /^## .*(Frequently Asked|FAQ)/i.test(l));
      if (h < 0) throw new Error(`text-edits: addFaq on ${path}, but no FAQ section`);
      let end = lines.findIndex((l, k) => k > h && /^## /.test(l));
      if (end < 0) end = lines.length;
      const details = lines.slice(h, end).some((l) => l.startsWith('<details><summary>'));
      const add = r.addFaq.filter(([q]) => !lines.slice(h, end).some((l) => norm(l.replace(/<[^>]+>|^#+\s*/g, ' ')).includes(norm(q))))
        .map(([q, a]) => (details ? `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>\n` : `### ${q}\n\n${a}\n`));
      lines.splice(end, 0, ...add);
      out = lines.join('\n');
    }
    // The migration drops class attributes, so the quick answer comes back as a plain paragraph line: wrap it again.
    if (r.quickAnswer) {
      const lines = out.split('\n');
      const k = lines.findIndex((l) => norm(l.replace(/\\/g, '')) === norm(r.quickAnswer) || norm(l.replace(/\\/g, '')).replace(/[’']/g, "'") === norm(r.quickAnswer).replace(/[’']/g, "'"));
      if (k < 0) throw new Error(`text-edits: quick answer not found in the Markdown of ${path}`);
      lines[k] = `<p class="quick-answer">${esc(r.quickAnswer)}</p>`;
      out = lines.join('\n');
    }
  }
  return out;
}
