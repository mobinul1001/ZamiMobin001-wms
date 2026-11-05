import { readFileSync } from 'node:fs';
import { countryPairs, countryMeta, COUNTRY_OLD_LINES } from './country-prices.mjs';
import { articlePairs, isChangedArticleLine } from './article-prices.mjs';
// FAQ changes the owner approved on 2026-11-01. Questions that were in the schema but not on the
// page are shown; where the page already asks the same question, nothing is duplicated and the
// schema is aligned to the visible wording.
const SERVICE = '/wordpress-malware-removal-service/';
const WL_POST = '/white-label-wordpress-maintenance-support/';

// Schema question -> the visible question that already says the same thing.
export const ALIGN = {
  '/agreement/': { 'What is the difference between a maintenance agreement and a support contract?': "What's the difference between a maintenance agreement and a support contract?" },
  '/best-website-maintenance-for-small-business/': { 'Can you recommend a reliable WordPress website maintenance company for a small business?': 'Can you recommend a reliable WordPress website maintenance company?' },
  '/how-much-does-wordpress-website-maintenance-cost/': { 'What is the difference between a maintenance plan and managed hosting?': "What's the difference between a maintenance plan and managed hosting?" },
  '/website-maintenance-services-for-spain/': { 'Ofrecen servicios de mantenimiento web en Espana?': '¿Ofrecen servicios de mantenimiento web en España?', 'Cuanto cuesta el mantenimiento web en Espana?': '¿Cuánto cuesta el mantenimiento web en España?' },
  '/website-redesign-services/': { "What's the difference between a website redesign and a website refresh?": "What's the difference between a redesign and a refresh?", 'What ongoing support is available after the redesign launches?': 'What ongoing support is available after launch?' },
  '/website-repair-services/': {
    'What is website repair?': 'What Is Website Repair, Exactly?',
    'What is the difference between website repair and website maintenance?': "What's the difference between repair and maintenance?",
    'What is the difference between website repair and website redesign?': "What's the difference between repair and redesign?",
    'Why is my website showing a White Screen of Death (WSOD)?': 'What causes a white screen of death?',
  },
  '/website-speed-optimization-services/': {
    'Does page speed affect Google SEO rankings?': 'Does website speed affect SEO rankings?',
    'How does website speed affect conversion rates?': 'Does page speed impact conversion rates?',
    'How does speed optimization work with your maintenance and security plans?': 'How does speed optimization work with your maintenance & security plans?',
  },
  '/white-label-website-maintenance-services-for-agencies/': { 'Do you offer white label WordPress maintenance services specifically?': 'Do you offer white label WordPress maintenance specifically?' },
};

// Questions shown on the page. "format" follows how that page's FAQ is written.
export const ADD = {
  '/website-repair-services/': {
    format: 'plain',
    section: /^## Frequently Asked Questions/,
    end: /^#{2,3} /,
    questions: [
      'How to fix a broken website?',
      'How to fix a 500 Internal Server Error on WordPress?',
      'How do I fix broken 404 links on my website?',
      'How to resolve WordPress plugin conflicts?',
      'Why is my website contact form not sending emails?',
      'Why is my WooCommerce checkout not working?',
      'How to repair a hacked website or malware infection?',
      'How fast is emergency website repair vs scheduled repair?',
    ],
  },
  '/website-speed-optimization-services/': { format: 'h3', section: /^## Frequently Asked Questions About Website Speed/, end: /^## /, questions: ['Why is my WordPress website slow on mobile?'] },
  '/website-update-services/': { format: 'numbered', section: /^## Frequently Asked Questions/, end: /^#{2,3} /, questions: ['What happens when a WordPress update breaks your site?'] },
};

// Links the owner asked for, using words already in the text.
const ANSWER_LINKS = {
  'How to repair a hacked website or malware infection?': ['clearing malicious files and database injections', SERVICE],
};
const BODY_LINKS = {
  '/white-label-website-maintenance-services-for-agencies/': [['### Do you offer white label WordPress maintenance specifically?', `### Do you offer [white label WordPress maintenance](${WL_POST}) specifically?`]],
};

// Master price list replaces our own old prices and plan names in FAQ answers. Annual prices always
// carry "2 months free" (Spanish: "2 meses gratis"). Market ranges and other price sets are not here;
// they are listed in reports/faq-schema-sync.md for the owner.
const PLANS_EN = 'Our plans start at $79/month (Essential), $149/month (Growth), and $299/month (Business), or $790, $1,490 and $2,990 per year (2 months free).';
const PLANS_OLD = 'Our plans start at $95/month (Essential), $195/month (Advanced), and $395/month (Elevate), with 20% off annual billing.';
const LOCAL_PATHS = JSON.parse(readFileSync('src/data/prices.json', 'utf8')).local;

const CARD_PRICES = {
  // Master price list on pages whose plan cards still showed the old $95/$195/$395 plans.
  '/wordpress-website-maintenance-packages/': [
    ['starting at $95/month, with 20% off when you pay annually', 'starting at $79/month, with 2 months free when you pay annually'],
    ['Pay annually and save 20% on every plan.', 'Pay annually and get 2 months free on every plan.'],
    ['Save 20% with annual billing', '2 months free with annual billing'],
    ['Off Annual Billing', 'Free With Annual Billing'],
    [/^20%$/m, '2 months'],
    ['| WP Starter | $1,140 | $912 | $228 |', '| WP Starter | $948 | $790, 2 months free | $158 |'],
    ['| WP Growth | $2,340 | $1,872 | $468 |', '| WP Growth | $1,788 | $1,490, 2 months free | $298 |'],
    ['| WP Premium | $4,740 | $3,792 | $948 |', '| WP Premium | $3,588 | $2,990, 2 months free | $598 |'],
    ['| Annual Billing (per month) | $76 | $156 | $316 |', '| Annual billing (per year) | $790, 2 months free | $1,490, 2 months free | $2,990, 2 months free |'],
    ...[["$95/mo","$79/mo"],["$195/mo","$149/mo"],["$395/mo","$299/mo"],["or $76/mo billed annually","or $790/yr, 2 months free"],["or $156/mo billed annually","or $1,490/yr, 2 months free"],["or $316/mo billed annually","or $2,990/yr, 2 months free"]],
  ],
};

const PRICE_CHANGES = {
  '/monthly-website-maintenance-packages/': [
    ['Our plans start at $95 per month for basic maintenance and go up to $395 per month for advanced, mission-critical website care.', 'Our plans start at $79 per month for basic maintenance and go up to $299 per month for advanced, mission-critical website care.'],
    ['benefit from advanced or elevate plans', 'benefit from Growth or Business plans'],
  ],
  '/best-website-maintenance-companies/': [['from $95/month. WP Buffs', 'from $79/month. WP Buffs']],
  '/best-website-maintenance-for-small-business/': [
    ['from $95/month, no lock-in', 'from $79/month, no lock-in'],
    ['the best value plan is Advanced at $195/month', 'the best value plan is Growth at $149/month'],
    ['do well on Essential at $95/month, while WooCommerce stores need Elevate at $395/month', 'do well on Essential at $79/month, while WooCommerce stores need Business at $299/month'],
    ['at $95/month (or $76/month billed annually)', 'at $79/month (or $790/year, 2 months free)'],
  ],
  '/how-much-does-website-maintenance-cost/': [['A typical plan costs $1,140–$4,740 per year. Paying annually usually saves around 20% compared to monthly billing, so a $195/month plan can drop to roughly $156/month when paid yearly.', 'A typical plan costs $948–$3,588 per year. Paying annually gives you 2 months free, so a $149/month plan costs $1,490 when paid yearly.']],
  '/how-much-does-wordpress-website-maintenance-cost/': [
    ['costs around $95/month for basic managed coverage, ~$195/month for standard business sites, and $395+/month for premium plans', 'costs around $79/month for basic managed coverage, ~$149/month for standard business sites, and $299+/month for premium plans'],
    ['Billing annually typically saves 20%.', 'Billing annually gives you 2 months free.'],
    ['An Essential-tier plan around $95/month', 'An Essential-tier plan around $79/month'],
    ['Pay annually (20% off)', 'Pay annually (2 months free)'],
    ['annual billing saves 20%: $228/year on Essential, $468/year on Advanced, and $948/year on Elevate, effectively giving you about two-and-a-half months free.', 'annual billing gives you 2 months free: $790/year on Essential, $1,490/year on Growth, and $2,990/year on Business.'],
    ['upgrade from Essential to Advanced or Elevate', 'upgrade from Essential to Growth or Business'],
    ['a $195/month plan costs less', 'a $149/month plan costs less'],
  ],
  '/shopify-website-maintenance-packages/': [['and save 20% if you choose annual billing', 'and get 2 months free if you choose annual billing']],
  '/sitecare-alternative/': [['starts at $95/month with a year', 'starts at $79/month with a year']],
  '/website-maintenance-services-for-netherlands/': [[PLANS_OLD, PLANS_EN]],
  '/website-maintenance-services-for-switzerland/': [[PLANS_OLD, PLANS_EN]],
  '/website-maintenance-services-for-spain/': [[/95(?:&nbsp;|\s)USD\/mes \(Essential\), 195(?:&nbsp;|\s)USD\/mes \(Advanced\) y 395(?:&nbsp;|\s)USD\/mes \(Elevate\), con un 20% de descuento en el pago anual/g, '79 USD/mes (Essential), 149 USD/mes (Growth) y 299 USD/mes (Business), o 790, 1.490 y 2.990 USD al año (2 meses gratis)']],
  '/wordpress-malware-removal/': [['starting around $95/month', 'starting around $79/month']],
  '/wordpress-site-hacked-what-to-do/': [['costs from $95/month', 'costs from $79/month']],
  '/wordpress-website-maintenance-packages/': [
    ['is $95/month for WP Starter, $195/month for the most popular WP Growth plan, and $395/month for WP Premium. Pay annually to save 20% ($76, $156, and $316/month respectively).', 'is $79/month for Essential, $149/month for the most popular Growth plan, and $299/month for Business. Pay annually for $790, $1,490, and $2,990 per year (2 months free).'],
    ["Annual billing saves 20% — that's $228/year on WP Starter, $468/year on WP Growth, and $948/year on WP Premium.", 'Annual billing gives you 2 months free: $790/year on Essential, $1,490/year on Growth, and $2,990/year on Business.'],
    ['Choose WP Starter for blogs and small sites, WP Growth for lead-generating business websites (our most popular package), and WP Premium for', 'Choose Essential for blogs and small sites, Growth for lead-generating business websites (our most popular package), and Business for'],
    ['The WP Premium plan includes full WooCommerce', 'The Business plan includes full WooCommerce'],
  ],
};
// Old text the owner approved replacing, so the parity test does not report it as lost.
const allFrom = [...Object.values(PRICE_CHANGES), ...Object.values(CARD_PRICES)].flat().map(([from]) => from).filter((f) => typeof f === 'string');
const CHANGED_TABLE_ROWS = ['Basic', 'Standard', 'Premium', '$49/mo', '$99/mo', '$199/mo', 'WP Starter$1,140$912$228', 'WP Growth$2,340$1,872$468', 'WP Premium$4,740$3,792$948', 'Annual Billing (per month)$76$156$316'];
const countryFrom = Object.keys(LOCAL_PATHS).flatMap((p) => countryPairs(p)).map(([from]) => from).filter((s) => typeof s === 'string' && !s.includes('\n'));
// Owner, repair page brief 2026-11-05, rule 5: these claims stay off the page until the owner approves them.
// They are still in the .md and are listed in src/lib/repair.ts (HELD) and reports/repair-parity.md.
const REPAIR_HELD_LINES = ['98.4%', 'First-time fix rate — no repeat visits needed', '45 min', 'Average emergency response time', 'Sites where we caused data loss'];
export const isApprovedOldLine = (line, path) => (path === '/website-repair-services/' && REPAIR_HELD_LINES.includes(line)) || isChangedArticleLine(line, path) || COUNTRY_OLD_LINES.includes(line) || countryFrom.some((s) => line.includes(s)) || ['20%', 'Advanced', 'Elevate'].includes(line) || CHANGED_TABLE_ROWS.includes(line) || /95[\s\u00a0]USD\/mes \(Essential\)/.test(line) || allFrom.some((f) => line.includes(f));

// Schema question whose visible text is a section rather than an FAQ entry.
const SECTION_ANSWERS = {
  'What Is Website Repair, Exactly?': /^\*\*Website repair\*\* is .*$/m,
};

const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/[*_`\\]/g, '').replace(/\s+/g, ' ').trim();

function faqNodes(node, found = []) {
  if (Array.isArray(node)) node.forEach((n) => faqNodes(n, found));
  else if (node && typeof node === 'object') {
    if ([].concat(node['@type'] ?? []).includes('FAQPage')) found.push(...[].concat(node.mainEntity ?? []));
    Object.values(node).forEach((v) => faqNodes(v, found));
  }
  return found;
}

const squeeze = (s) => plain(String(s)).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

// Every question and answer the page shows, whatever format that page uses for its FAQ.
export function visibleFaqs(body, schemaQuestions) {
  const found = new Map();
  for (const m of body.matchAll(/<details[^>]*><summary[^>]*>(.*?)<\/summary>(.*?)<\/details>/gs)) found.set(squeeze(m[1]), { q: plain(m[1]), a: plain(m[2]) });
  const wanted = new Set(schemaQuestions.map(squeeze));
  const stripPrefix = (l) => l.replace(/^#{1,6}\s+/, '').replace(/^\d+\\?\.\s+/, '').replace(/^FAQ\s*/, '').trim();
  const lines = body.replace(/<details[^>]*>.*?<\/details>/gs, '').split('\n');
  const isStop = (l) => /^#{1,3} /.test(l) || wanted.has(squeeze(stripPrefix(l))) || /^\*\*.+\?\*\*/.test(l);
  lines.forEach((line, i) => {
    const bold = /^\*\*(.+?\?)\*\*\s*(.*)$/.exec(line);
    if (bold && wanted.has(squeeze(bold[1]))) {
      found.set(squeeze(bold[1]), { q: plain(bold[1]), a: plain(bold[2]) });
      return;
    }
    const key = squeeze(stripPrefix(line));
    if (!key || !wanted.has(key) || found.get(key)?.a) return;
    const paragraphs = [];
    let j = i + 1;
    for (; j < lines.length && !isStop(lines[j]); j++) if (lines[j].trim()) paragraphs.push(lines[j]);
    // Only the last question in a section can run into unrelated text, so it keeps one paragraph.
    const nextIsQuestion = j < lines.length && wanted.has(squeeze(stripPrefix(lines[j])));
    found.set(key, { q: plain(stripPrefix(line)), a: plain((nextIsQuestion ? paragraphs : paragraphs.slice(0, 1)).join(' ')) });
  });
  return found;
}

export function applyFaqChanges(path, body, schema, log) {
  let out = body;
  for (const [from, to] of [...(PRICE_CHANGES[path] ?? []), ...(CARD_PRICES[path] ?? []), ...countryPairs(path), ...articlePairs(path)]) {
    const before = out;
    const swap = typeof to === 'function' ? to : () => to;
    out = typeof from === 'string' ? out.replaceAll(from, swap) : out.replace(from, swap);
    log.push({ path, change: before === out ? 'price text gone' : 'price', from: String(from), to });
  }
  const nodes = faqNodes(schema);
  const add = ADD[path];
  if (add) {
    const lines = out.split('\n');
    const start = lines.findIndex((l) => add.section.test(l));
    if (start < 0) throw new Error(`${path}: FAQ section not found`);
    let end = lines.findIndex((l, i) => i > start && add.end.test(l));
    if (end < 0) end = lines.length;
    let n = 0;
    if (add.format === 'numbered') for (const l of lines.slice(start, end)) n = Math.max(n, +(/^(\d+)\\\./.exec(l)?.[1] ?? 0));
    const blocks = [];
    for (const q of add.questions) {
      const node = nodes.find((x) => x.name === q);
      if (!node) throw new Error(`${path}: schema question not found: ${q}`);
      let answer = node.acceptedAnswer.text;
      const link = ANSWER_LINKS[q];
      if (link) {
        if (!answer.includes(link[0])) throw new Error(`Link phrase not in answer: ${link[0]}`);
        answer = answer.replace(link[0], `[${link[0]}](${link[1]})`);
      }
      const heading = add.format === 'h3' ? `### ${q}` : add.format === 'numbered' ? `${++n}\\. ${q}` : q;
      blocks.push(heading, '', answer, '');
      log.push({ path, change: 'shown', question: q });
    }
    lines.splice(end, 0, ...blocks);
    out = lines.join('\n');
  }
  for (const [from, to] of BODY_LINKS[path] ?? []) {
    if (!out.includes(from)) throw new Error(`${path}: text for link not found: ${from}`);
    out = out.replace(from, to);
    log.push({ path, change: 'link', to });
  }
  for (const [schemaQ, visibleQ] of Object.entries(ALIGN[path] ?? {})) {
    const node = nodes.find((x) => x.name === schemaQ);
    if (!node) throw new Error(`${path}: schema question not found: ${schemaQ}`);
    node.name = visibleQ;
    log.push({ path, change: 'schema aligned', question: visibleQ });
  }
  // Every FAQ schema entry on the site uses the exact visible question and answer.
  const visible = visibleFaqs(out, nodes.map((n) => n.name));
  for (const node of nodes) {
    const v = visible.get(squeeze(node.name));
    const section = SECTION_ANSWERS[node.name]?.exec(out);
    const answer = section ? plain(section[0]) : v?.a;
    if (!v || !answer) {
      // Claims rules removed this entry from the page, so it leaves the schema too.
      node.__remove = true;
      log.push({ path, change: 'schema removed', question: node.name });
      continue;
    }
    const before = squeeze(node.acceptedAnswer?.text ?? '');
    node.name = v.q;
    node.acceptedAnswer = { ...node.acceptedAnswer, text: answer };
    log.push({ path, change: before === squeeze(answer) ? 'schema same' : 'schema synced', question: v.q });
  }
  const prune = (n) => {
    if (Array.isArray(n)) n.forEach(prune);
    else if (n && typeof n === 'object') {
      if (Array.isArray(n.mainEntity)) n.mainEntity = n.mainEntity.filter((q) => !q.__remove);
      Object.values(n).forEach(prune);
    }
  };
  prune(schema);
  return out;
}

// Same pages: old plan prices in meta descriptions, social tags and schema.
export function masterPriceMeta(path, value) {
  if (LOCAL_PATHS[path]) return countryMeta(path, value);
  if (!CARD_PRICES[path] || typeof value !== 'string') return value;
  return value
    .replace(/\$95\b/g, '$79')
    .replace(/\$195\b/g, '$149')
    .replace(/\$395\b/g, '$299')
    .replace(/20% off annual( billing)?/g, '2 months free on annual$1')
    .replace(/^95\.00$/, '79.00')
    .replace(/^195\.00$/, '149.00')
    .replace(/^395\.00$/, '299.00');
}
