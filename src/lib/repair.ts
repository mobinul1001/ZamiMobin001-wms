// Website repair page (owner's design, 2026-11-05): splits the page's own text into the blocks the
// components show. Nothing is written here; every heading, paragraph and link comes from the .md.
// Prices come from prices.json where it has them. A missing block stops the build instead of dropping text.
import * as cheerio from 'cheerio';
import prices from '../data/prices.json';
import { splitBy } from './html-sections';

// Claims the owner has not approved yet (repair page brief, rule 5, 2026-11-05; "No fix, no fee" was approved on
// 2026-11-01, so the owner is asked again). They stay in the .md, are left off the
// page and are listed in reports/repair-parity.md. The build fails if one of them is no longer found,
// so the list never goes stale.
export const HELD = [
  'No fix, no fee: we check your site and quote before we start. If we can’t fix the issue, you don’t pay. (Excludes problems caused by your hosting provider’s outage or by third-party services we don’t control.)',
  '98.4% First-time fix rate — no repeat visits needed',
  '45 min Average emergency response time',
  '0 Sites where we caused data loss',
];

// The old page's issue hub: each issue's title and its badge were two elements, and the 4 tabs held
// 6, 5, 5 and 6 issues in this order (export/raw/website_repair_services-7d405cc5.html, #hub-tab-1..4).
const ISSUE_TAGS = ['Critical Failure', 'Fatal PHP Error', 'Server Conflict', 'SEO Impact', 'Code Syntax', 'Database Alert', 'Silent Lead Loss', 'Revenue Risk', 'User Flow', 'UX Issue', 'Plugin Clash', 'Display Bug', 'Mobile Issue', 'Stylesheet Error', 'Script Crash', 'Media Issue', 'Theme Override', 'Uptime Alert', 'Resource Spike', 'Slow Loading', 'Security Breach', 'Search Rank Protection'];
const ISSUE_GROUPS = [6, 5, 5, 6];

export interface Sec { eyebrow: string; h2: string; id?: string }
type $T = cheerio.CheerioAPI;
type El = Parameters<$T>[0];

export function parseRepair(html: string) {
  const sq = (s: string) => s.replace(/\s+/g, ' ').trim();
  const held: string[] = [];
  const { intro, sections } = splitBy(html, 2);
  // The short label right before each H2 is that section's eyebrow; it sits at the end of the previous chunk.
  const chunks = [intro, ...sections.map((s) => s.html)];
  const eyebrows: string[] = [];
  for (let i = 0; i < chunks.length - 1; i++) {
    const m = /<p>([^<]{2,60})<\/p>\s*$/.exec(chunks[i]);
    eyebrows.push(m ? m[1] : '');
    if (m) chunks[i] = chunks[i].slice(0, m.index);
  }
  const load = (s: string) => cheerio.load(s, null, false);
  const inner = ($: $T, e: El) => ($(e).html() ?? '').trim();
  const txt = ($: $T, e: El) => sq($(e).text());
  const need = <T>(v: T | undefined | null, what: string): T => {
    if (v === undefined || v === null || (Array.isArray(v) && !v.length) || v === '') throw new Error(`repair page: ${what} not found`);
    return v;
  };
  const find = (re: RegExp) => {
    const i = sections.findIndex((s) => re.test(s.title));
    if (i < 0) throw new Error(`repair page: section not found: ${re}`);
    const $ = load(chunks[i + 1]);
    const h = $('h2').first();
    const sec: Sec = { eyebrow: eyebrows[i] ?? '', h2: inner($, h), id: h.attr('id') };
    h.remove();
    return { $, sec };
  };
  const hold = ($: $T, e: El) => { held.push(txt($, e)); $(e).remove(); };
  const ps = ($: $T, root?: El) => (root ? $(root).children('p') : $.root().children('p')).toArray();

  // Hero: the first card's eyebrow line, intro, two links and start line; the trust lines after the cards.
  const $h = load(chunks[0]);
  const [heroCard, panelCard] = $h('.cards > .card').toArray();
  const hp = ps($h, need(heroCard, 'hero card'));
  for (const p of hp) if (HELD.includes(txt($h, p))) hold($h, p);
  const hp2 = ps($h, heroCard);
  const heroLinks = need(hp2.find((p) => $h(p).children('a').length === 2), 'hero links');
  const after = ps($h).filter((p) => !$h(p).closest('.cards').length);
  for (const p of after) if (HELD.includes(txt($h, p))) hold($h, p);
  const hero = {
    eyebrow: txt($h, hp2[0]),
    lead: inner($h, hp2[1]),
    links: $h(heroLinks).children('a').toArray().map((a) => ({ href: $h(a).attr('href') ?? '', label: txt($h, a) })),
    ticks: [inner($h, need(hp2[3], 'hero start line')), ...ps($h).filter((p) => !$h(p).closest('.cards').length).map((p) => inner($h, p))],
    panel: need($h(panelCard).find('.status-panel').prop('outerHTML'), 'status panel'),
  };
  need(hero.ticks.length === 5 ? hero.ticks : undefined, '5 hero trust lines');

  // Real numbers: the cards that are approved (rule 5); the others are held.
  const { $: $n, sec: numbers } = find(/^Real Numbers/);
  const numberCards = $n('.card').toArray().flatMap((c) => {
    const lines = ps($n, c).map((p) => txt($n, p));
    if (HELD.includes(lines.join(' '))) { held.push(lines.join(' ')); return []; }
    return [lines.length === 2 ? { v: lines[0], l: lines[1] } : { v: '', l: lines[0] }];
  });

  // One team: paragraphs, the quote, the care links, and 5 small cards.
  const { $: $o, sec: oneTeam } = find(/^One Team/);
  const oneTeamParas = ps($o).map((p) => inner($o, p));
  const oneTeamCards = $o('.card').toArray().map((c) => ({ h: inner($o, $o(c).find('h4')), p: ps($o, c).map((p) => inner($o, p)).join(' ') }));

  // Long guide sections: shown whole inside "Learn more" accordions.
  const guide = (re: RegExp) => { const { $, sec } = find(re); return { sec, html: $.html().trim() }; };
  const whatIs = guide(/^What Is Website Repair/);
  const signs = guide(/^12 Warning Signs/);
  const business = guide(/^Website Repair for Every Type of Business/);
  const youGet = guide(/^What You Get From/);

  // Issue hub ("Find your fix"): intro, the two label lines, 22 issues in the old 4 tabs.
  const { $: $u, sec: hub } = find(/^Every Website Problem We Repair/);
  const up = ps($u);
  const longLine = need(up.find((p) => /\(WSOD/.test(txt($u, p))), 'issue category labels');
  const longLabels = txt($u, longLine).match(/[^()]+\([^)]*\)/g)?.map(sq) ?? [];
  need(longLabels.length === 4 ? longLabels : undefined, '4 issue categories');
  const shortLabels = longLabels.map((l) => l.replace(/\s*\(.*$/, ''));
  const shortLine = need(up.find((p) => txt($u, p) === shortLabels.join(' ')), 'short category labels');
  const labelLine = need(up.find((p) => txt($u, p) === 'Select Issue Category:'), '"Select Issue Category:"');
  const lead = inner($u, up[0]);
  const rest = up.slice(up.indexOf(shortLine) + 1);
  const issues = ISSUE_TAGS.map((tag, i) => {
    const t = txt($u, need(rest[i * 2], `issue ${i + 1}`));
    if (!t.endsWith(` ${tag}`)) throw new Error(`repair page: issue ${i + 1} "${t}" does not end with "${tag}"`);
    return { t: t.slice(0, -tag.length - 1), tag, p: inner($u, need(rest[i * 2 + 1], `issue ${i + 1} text`)) };
  });
  if (rest.length !== ISSUE_TAGS.length * 2) throw new Error(`repair page: ${rest.length / 2} issues, expected ${ISSUE_TAGS.length}`);
  let at = 0;
  const groups = ISSUE_GROUPS.map((n, g) => ({ long: longLabels[g], short: shortLabels[g], items: issues.slice(at, (at += n)) }));
  const finder = { sec: hub, lead, label: txt($u, labelLine), groups };

  // Process: 4 steps with their small label and check line.
  const { $: $s, sec: process } = find(/^Our 5-Step/);
  const steps = $s('.card').toArray().map((c) => {
    const lines = ps($s, c).map((p) => txt($s, p));
    return { n: lines[0], label: lines.length > 3 ? lines[1] : '', h: inner($s, $s(c).find('h3')), p: inner($s, ps($s, c).at(-2)!), chk: lines.at(-1)!.replace(/^✓\s*/, '') };
  });
  const processLead = inner($s, ps($s)[0]);

  // Why us: 6 cards (one has no title, one has only a title) and the line after them.
  const { $: $w, sec: why } = find(/^Why Businesses Trust Us/);
  const whyCards = $w('.card').toArray().map((c) => {
    const lines = ps($w, c);
    const last = lines.at(-1);
    const chk = last && /^✓/.test(txt($w, last)) ? txt($w, last).replace(/^✓\s*/, '') : '';
    return { h: inner($w, $w(c).find('h3')), p: lines.filter((p) => p !== last || !chk).map((p) => inner($w, p)).join(' '), chk };
  });
  const whyLead = inner($w, ps($w)[0]);
  const whyAfter = ps($w).slice(1).map((p) => inner($w, p));

  // What's included: the 8 cards (h3 list) and the longer "Feature / What it means" list.
  const { $: $i, sec: included } = find(/^What.s Included With Every/);
  const ip = ps($i);
  const incLead = inner($i, ip[0]);
  const pairHead = $i('p.pair').first();
  const pairHeads = [txt($i, pairHead.find('strong')), txt($i, pairHead.find('span'))];
  const firstH3 = $i('h3').first();
  const pairPs: El[] = [];
  for (let e = pairHead.next(); e.length && !e.is('h3'); e = e.next()) if (e.is('p')) pairPs.push(e[0]);
  const isTitle = (s: string) => s.length < 40 && !/\.$/.test(s);
  const pairs: { t: string; d: string }[] = [];
  for (const p of pairPs) {
    const s = txt($i, p);
    if (isTitle(s)) pairs.push({ t: s, d: '' });
    else if (pairs.length && !pairs.at(-1)!.d && pairs.at(-1)!.t) pairs.at(-1)!.d = inner($i, p);
    else pairs.push({ t: '', d: inner($i, p) });
  }
  const incCards: { h: string; p: string }[] = [];
  for (let e = firstH3; e.length; e = e.next()) {
    if (e.is('h3')) incCards.push({ h: inner($i, e), p: '' });
    else if (e.is('p')) {
      const last = incCards.at(-1);
      if (last && !last.p && last.h) last.p = inner($i, e);
      else incCards.push({ h: '', p: inner($i, e) });
    }
  }
  need(incCards.length === 8 ? incCards : undefined, '8 included items');

  // Compare: 5 tables, each with its small label, H3 and badge.
  const { $: $c, sec: compare } = find(/^Understanding Your Options/);
  const compareLead = inner($c, ps($c)[0]);
  const tables = $c('h3').toArray().map((h) => {
    const label = txt($c, $c(h).prev('p'));
    const badge = txt($c, $c(h).next('p'));
    const t = $c(h).nextAll('table').first();
    const head = t.find('thead th').toArray().map((x) => inner($c, x));
    const rows = t.find('tbody tr').toArray().map((r) => $c(r).children('td').toArray().map((x) => inner($c, x)));
    return { label, h: inner($c, h), badge, head, rows };
  });
  need(tables.length === 5 ? tables : undefined, '5 comparison tables');

  // Pricing: 5 cards (the fifth is the enterprise strip) and the note under them.
  const { $: $p, sec: pricing } = find(/^Website Repair Pricing/);
  const pricingLead = inner($p, ps($p)[0]);
  const priceCards = $p('.card').toArray().map((c) => {
    const h3 = $p(c).find('h3');
    const before = h3.prevAll('p').toArray().reverse().map((p) => txt($p, p));
    const afterPs = h3.nextAll('p').toArray();
    const a = $p(afterPs.at(-1)).find('a');
    return { labels: before, h: inner($p, h3), price: inner($p, afterPs[0]), forLine: inner($p, afterPs[1]), link: { href: a.attr('href') ?? '', label: txt($p, a) } };
  });
  need(priceCards.length === 5 ? priceCards : undefined, '5 price cards');
  // Prices that prices.json has must match the page; the $99 – $299 range is not in prices.json and is shown as the page has it.
  if (txt($p, $p.root()).indexOf(`$${prices.oneTimeFixFrom}`) < 0 || txt($p, $p.root()).indexOf(`$${prices.hackedSiteCleanup}`) < 0) throw new Error('repair page: prices differ from prices.json');
  const pricingNote = inner($p, need(ps($p).filter((p) => txt($p, p)).at(-1), 'pricing note'));

  // Results: 3 stories; the anchors, the swipe hint, and the labels before the FAQ.
  const { $: $r, sec: results } = find(/^Real Repairs, Real Results/);
  const rp = ps($r);
  const resultsLead = inner($r, rp[0]);
  const swipe = txt($r, need(rp.find((p) => /^Swipe/.test(txt($r, p))), 'swipe hint'));
  const stories = $r('.card').toArray().map((c) => {
    const pair = $r(c).find('p.pair');
    const lines = ps($r, c).filter((p) => !$r(p).is('.pair'));
    return { tag: txt($r, pair.find('strong')), badge: txt($r, pair.find('span')).replace(/^●\s*/, ''), h: inner($r, $r(c).find('h3')), sub: inner($r, lines[0]), p: inner($r, lines[1]), result: inner($r, lines[2]), foot: inner($r, lines[3]) };
  });
  need(stories.length === 3 ? stories : undefined, '3 repair stories');
  const tail = rp.slice(rp.indexOf(rp.find((p) => $r(p).find('a#testimonials').length)!) + 1).map((p) => txt($r, p));
  const testimonialsLabel = need(tail[0], '"Social Proof & Client Trust" label');

  // FAQ: question and answer pairs, with the "Topical Authority Silo" label where it stands.
  const { $: $f, sec: faqSec } = find(/^Frequently Asked Questions/);
  const faq: ({ q: string; a: string } | { label: string })[] = [];
  const fps = ps($f);
  for (let k = 0; k < fps.length; k++) {
    const q = txt($f, fps[k]);
    if (!q.endsWith('?')) { faq.push({ label: q }); continue; }
    faq.push({ q: inner($f, fps[k]), a: inner($f, need(fps[++k], `answer to ${q}`)) });
  }

  // Related services: 10 linked cards.
  const { $: $l, sec: related } = find(/^Related Services/);
  const relatedLead = inner($l, ps($l)[0]);
  const relatedCards = $l('.card').toArray().map((c) => ({ href: $l(c).find('h3 a').attr('href') ?? '', h: txt($l, $l(c).find('h3')), p: txt($l, $l(c).children('p')) }));

  // Closing section: kept as it is, minus the held guarantee.
  const { $: $z, sec: closing } = find(/^Your Website Doesn.t Have to Stay Broken/);
  for (const p of ps($z)) if (HELD.includes(txt($z, p))) hold($z, p);
  const zp = ps($z);
  const closingLinks = need(zp.find((p) => $z(p).children('a').length === 2), 'closing links');
  const closingData = { sec: closing, text: zp.filter((p) => p !== closingLinks).map((p) => inner($z, p)), links: $z(closingLinks).children('a').toArray().map((a) => ({ href: $z(a).attr('href') ?? '', label: txt($z, a) })) };

  // Every held claim must have been found exactly where expected.
  for (const h of HELD) if (!held.includes(h)) throw new Error(`repair page: held claim not found (update HELD): ${h}`);

  return {
    hero, numbers: { sec: numbers, cards: numberCards }, oneTeam: { sec: oneTeam, paras: oneTeamParas, cards: oneTeamCards },
    whatIs, signs, business, youGet, finder,
    process: { sec: process, lead: processLead, steps },
    why: { sec: why, lead: whyLead, cards: whyCards, after: whyAfter },
    included: { sec: included, lead: incLead, cards: incCards, pairHeads, pairs },
    compare: { sec: compare, lead: compareLead, tables },
    pricing: { sec: pricing, lead: pricingLead, cards: priceCards, note: pricingNote },
    results: { sec: results, lead: resultsLead, swipe, stories, testimonialsLabel },
    faq: { sec: faqSec, items: faq },
    related: { sec: related, lead: relatedLead, cards: relatedCards },
    closing: closingData,
    held,
  };
}
export type Repair = ReturnType<typeof parseRepair>;
