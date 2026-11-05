// Hacked website recovery page (owner's design, batch 1, 2026-11-05): splits the page's own text into the blocks
// the components show. Nothing is written here; every heading, paragraph and link comes from the .md, and prices
// come from prices.json. A missing block stops the build instead of dropping text.
import * as cheerio from 'cheerio';
import { splitBy } from './html-sections';

// Claims the owner has not approved yet (hacked page brief, rule 6). They stay in the HTML, collapsed and marked
// <!-- OWNER CHECK -->, never in the hero, trust strip, headings, cards or meta. The build fails if one is not found.
export const HELD_LINES = ['Avg. Response: 30 Mins', 'Instant Diagnosis 30-Min SLA Response Confidential', '24/7 Security Triage Active'];
export const HELD_SENTENCE = 'The average malware dwell time is over 45 days—during which the damage compounds exponentially.';

export interface Sec { eyebrow: string; h2: string; id?: string }
type $T = cheerio.CheerioAPI;
type El = Parameters<$T>[0];

export function parseHacked(html: string) {
  const sq = (s: string) => s.replace(/\s+/g, ' ').trim();
  const { intro, sections } = splitBy(html, 2);
  const chunks = [intro, ...sections.map((s) => s.html)];
  // The short label right before each H2 is that section's eyebrow; it sits at the end of the previous chunk.
  const eyebrows: string[] = [];
  for (let i = 0; i < chunks.length - 1; i++) {
    const m = /<p>([^<]{2,40})<\/p>\s*$/.exec(chunks[i]);
    eyebrows.push(m ? m[1] : '');
    if (m) chunks[i] = chunks[i].slice(0, m.index);
  }
  const load = (s: string) => cheerio.load(s, null, false);
  const inner = ($: $T, e: El) => ($(e).html() ?? '').trim();
  const txt = ($: $T, e: El) => sq($(e).text());
  const need = <T>(v: T | undefined | null, what: string): T => {
    if (v === undefined || v === null || (Array.isArray(v) && !v.length) || v === '') throw new Error(`hacked page: ${what} not found`);
    return v;
  };
  const find = (re: RegExp) => {
    const i = sections.findIndex((s) => re.test(s.title));
    if (i < 0) throw new Error(`hacked page: section not found: ${re}`);
    const $ = load(chunks[i + 1]);
    const h = $('h2').first();
    const sec: Sec = { eyebrow: eyebrows[i] ?? '', h2: inner($, h), id: h.attr('id') };
    h.remove();
    return { $, sec };
  };
  const ps = ($: $T, root?: El) => (root ? $(root).children('p') : $.root().children('p')).toArray();
  const held: string[] = [];
  const holdLine = ($: $T, text: string) => { const p = $('p').toArray().find((x) => txt($, x) === text); if (p) { held.push(text); $(p).remove(); } return p ? text : ''; };

  // Hero card, the "Security Status" card, the trust line and the platform names.
  const $h = load(chunks[0]);
  const [heroCard, statusCard] = $h('.cards > .card').toArray();
  const avg = holdLine($h, HELD_LINES[0]);
  const hp = ps($h, need(heroCard, 'hero card'));
  const links = need(hp.find((p) => $h(p).children('a').length === 2), 'hero links');
  const statusHtml = need($h(statusCard).html()?.trim(), 'security status card');
  const after = ps($h).filter((p) => !$h(p).closest('.cards').length).map((p) => txt($h, p));
  const hero = {
    eyebrow: txt($h, hp[0]),
    lead: inner($h, hp[1]),
    links: $h(links).children('a').toArray().map((a) => ({ href: $h(a).attr('href') ?? '', label: txt($h, a) })),
    extra: hp.slice(3).map((p) => inner($h, p)),
    statusHtml,
    trustLine: need(after.find((t) => /^650\+/.test(t)), 'trust line'),
    platforms: after.filter((t) => !/^650\+/.test(t)),
  };

  // Held: "Independently Verified" section (whole), the response-time lines and the 45-day sentence.
  const { $: $v, sec: verified } = find(/^Independently Verified/);
  // The last platform name sits right before this H2, so it was read as its eyebrow; it belongs to the platform list.
  if (verified.eyebrow) { hero.platforms.push(verified.eyebrow); verified.eyebrow = ''; }
  const promise = holdOrKeep($v, "If we can’t clean your hacked site, you don’t pay.");
  const verifiedHtml = $v.html().trim();

  // Signs: 8 cards, the strip with its link.
  const { $: $s, sec: signs } = find(/^Is Your Website Actually Hacked/);
  const signCards = $s('.card').toArray().map((c) => ({ h: inner($s, $s(c).find('h3')), p: ps($s, c).map((p) => inner($s, p)).join(' ') }));
  need(signCards.length === 8 ? signCards : undefined, '8 signs');
  const sp = ps($s).filter((p) => !$s(p).closest('.card').length);
  const signsStrip = { h4: inner($s, need($s('h4').first()[0], 'signs strip heading')), paras: sp.slice(1).filter((p) => !$s(p).children('a').length || txt($s, p) !== txt($s, $s(p).children('a'))).map((p) => inner($s, p)), link: (() => { const a = $s(sp.at(-1)).children('a').first(); return { href: a.attr('href') ?? '', label: txt($s, a) }; })() };
  const signsLead = inner($s, sp[0]);

  // Why every hour matters: paragraphs (the 45-day sentence held), the table, the swipe hint.
  const { $: $w, sec: why } = find(/^Why Every Hour Matters/);
  const wp = ps($w);
  const firstWhy = inner($w, wp[0]);
  if (!firstWhy.includes(HELD_SENTENCE)) throw new Error('hacked page: 45-day sentence not found (update HELD_SENTENCE)');
  held.push(HELD_SENTENCE);
  // The first paragraph holds the 45-day sentence: the whole paragraph is shown collapsed (OWNER CHECK), the rest open.
  const whyHeld = firstWhy;
  const whyParas = [...wp.slice(1).filter((p) => !/^Swipe/.test(txt($w, p))).map((p) => inner($w, p))];
  const costTable = {
    h3: inner($w, $w('h3').first()),
    head: $w('thead th').toArray().map((x) => inner($w, x)),
    rows: $w('tbody tr').toArray().map((r) => $w(r).children('td').toArray().map((x) => inner($w, x))),
    swipe: txt($w, need(wp.find((p) => /^Swipe/.test(txt($w, p))), 'swipe hint')),
  };

  // Process: 6 numbered steps and the note after them.
  const { $: $p, sec: process } = find(/^Our Website Hack Recovery Process/);
  const pp = ps($p);
  const steps = $p('h3').toArray().map((h) => ({ n: txt($p, $p(h).prev('p')), h: inner($p, h), p: inner($p, $p(h).next('p')) }));
  need(steps.length === 6 ? steps : undefined, '6 process steps');
  const stepPs = new Set(steps.flatMap((s) => [s.n]));
  const processLead = inner($p, pp[0]);
  const processAfter = inner($p, pp.at(-1)!);
  if (stepPs.has(txt($p, pp.at(-1)!))) throw new Error('hacked page: process note not found');

  // Included: 6 items and the "Transparent Diagnosis & Pricing" strip.
  const { $: $i, sec: included } = find(/^What.s Included in Every Recovery/);
  const items = $i('h3').toArray().map((h) => ({ h: inner($i, h), p: inner($i, $i(h).next('p')) }));
  need(items.length === 6 ? items : undefined, '6 included items');
  const iStrip = { h4: inner($i, $i('h4').first()), p: inner($i, $i('h4').first().next('p')), link: (() => { const a = $i('h4').first().nextAll('p').find('a').first(); return { href: a.attr('href') ?? '', label: txt($i, a) }; })() };
  const includedLead = inner($i, ps($i)[0]);

  // Platforms and industries: kept whole for the accordion (the platforms note and the contact strip with them).
  const platforms = (() => { const { $, sec } = find(/^Platforms We Recover/); return { sec, html: $.html().trim() }; })();
  const industries = (() => { const { $, sec } = find(/^Recovery Services for Every Industry/); return { sec, html: $.html().trim() }; })();

  // Outcomes: no case studies on the page; the brand list is held.
  const { $: $o, sec: outcomes } = find(/^Real Recovery Outcomes/);
  const op = ps($o);
  const outcomesLead = inner($o, op[0]);
  const brandsHtml = op.slice(1).map((p) => `<p>${inner($o, p)}</p>`).join('');
  held.push('Also Trusted By Brands Like (list)');

  // Pricing factors and the free diagnosis strip.
  const { $: $f, sec: pricing } = find(/^How Pricing Works/);
  const factors = $f('.card').toArray().map((c) => ({ h: inner($f, $f(c).find('h3')), p: ps($f, c).map((p) => inner($f, p)).join(' ') }));
  need(factors.length === 4 ? factors : undefined, '4 pricing factors');
  const fStrip = { h4: inner($f, $f('h4').first()), p: inner($f, $f('h4').first().next('p')), link: (() => { const a = $f('h4').first().nextAll('p').find('a').first(); return { href: a.attr('href') ?? '', label: txt($f, a) }; })() };
  const pricingLead = inner($f, ps($f)[0]);

  // Compare: the 6 capabilities (H3) with their values per method, the table header, and the plugins note.
  const { $: $c, sec: compare } = find(/^DIY, Plugin, or Professional Recovery/);
  const head = $c('thead th').toArray().map((x) => inner($c, x));
  const methods = ['DIY Cleanup', 'Security Plugin', 'Professional'];
  const capabilities = $c('h3').toArray().map((h) => {
    const vals: Record<string, string> = {};
    $c(h).nextAll('.cards').first().find('p.pair').each((_, p) => { vals[txt($c, $c(p).find('strong'))] = inner($c, $c(p).find('span')); });
    return { h: inner($c, h), id: $c(h).attr('id'), vals: methods.map((m) => vals[m] ?? '') };
  });
  need(capabilities.length === 6 ? capabilities : undefined, '6 comparison rows');
  // The page's own table has the same values for 5 rows; check they agree so the two never drift apart.
  for (const r of $c('tbody tr').toArray()) {
    const cells = $c(r).children('td').toArray().map((x) => txt($c, x));
    const cap = capabilities.find((c) => sq(cheerio.load(c.h).text()) === cells[0]);
    if (!cap || cap.vals.map((v) => sq(cheerio.load(v).text())).join('|') !== cells.slice(1).join('|')) throw new Error(`hacked page: comparison row "${cells[0]}" differs between the cards and the table`);
  }
  const compareLead = inner($c, ps($c)[0]);
  const plugins = { h4: inner($c, $c('h4').first()), p: inner($c, $c('h4').first().next('p')) };

  // FAQ: 20 questions (H3) and answers, and the eyebrow before the H2.
  const { $: $q, sec: faq } = find(/^Frequently Asked Questions/);
  const qa = $q('h3').toArray().map((h) => ({ q: inner($q, h), id: $q(h).attr('id'), a: inner($q, $q(h).next('p')) }));
  need(qa.length === 20 ? qa : undefined, '20 FAQs');
  const faqLead = inner($q, ps($q)[0]);
  // The closing section's eyebrow stays at the end of the FAQ chunk (the closing section itself is the final CTA).
  const tail = ps($q).map((p) => txt($q, p)).filter((t) => HELD_LINES.includes(t));
  held.push(...tail);

  for (const h of [HELD_LINES[0]]) if (!held.includes(h)) throw new Error(`hacked page: held claim not found: ${h}`);

  return {
    hero, held, heldAvg: avg, promise, verified: { sec: verified, html: verifiedHtml },
    signs: { sec: signs, lead: signsLead, cards: signCards, strip: signsStrip },
    why: { sec: why, held: whyHeld, paras: whyParas, table: costTable },
    process: { sec: process, lead: processLead, steps, after: processAfter },
    included: { sec: included, lead: includedLead, items, strip: iStrip },
    platforms, industries,
    outcomes: { sec: outcomes, lead: outcomesLead, brandsHtml },
    pricing: { sec: pricing, lead: pricingLead, factors, strip: fStrip },
    compare: { sec: compare, lead: compareLead, head, capabilities, plugins },
    faq: { sec: faq, lead: faqLead, items: qa, tail },
  };

  // The approved hacked-site promise sits at the end of the "Independently Verified" chunk; it is shown in the hero.
  function holdOrKeep($: $T, text: string) {
    const p = ps($).find((x) => txt($, x).replace(/'/g, '’') === text);
    if (!p) throw new Error(`hacked page: "${text}" not found`);
    const out = inner($, p);
    $(p).remove();
    return out;
  }
}
export type Hacked = ReturnType<typeof parseHacked>;
