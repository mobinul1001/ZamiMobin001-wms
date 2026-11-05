// WordPress plans page (owner's design, 2026-11-04): splits the page's own text into the blocks the
// components show. Nothing is written here; every heading, paragraph and link comes from the .md.
// Prices come from prices.json. A missing block stops the build instead of dropping text.
import * as cheerio from 'cheerio';
import prices from '../data/prices.json';
import { splitBy } from './html-sections';

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const MONTHS = 12;

export interface Card { h: string; p: string }
export interface Faq { q: string; a: string }

export function parseWpPlans(html: string) {
  const { sections } = splitBy(html, 2);
  const find = (re: RegExp) => {
    const s = sections.find((x) => re.test(x.title));
    if (!s) throw new Error(`wp plans: section not found: ${re}`);
    return cheerio.load(s.html, null, false);
  };
  const inner = ($: cheerio.CheerioAPI, e: Parameters<cheerio.CheerioAPI>[0]) => ($(e).html() ?? '').trim();
  const txt = ($: cheerio.CheerioAPI, e: Parameters<cheerio.CheerioAPI>[0]) => $(e).text().replace(/\s+/g, ' ').trim();
  const h2 = ($: cheerio.CheerioAPI) => inner($, $('h2').first());
  const paras = ($: cheerio.CheerioAPI) => $.root().children('p').toArray();
  const cards = ($: cheerio.CheerioAPI): Card[] => $('.card').toArray().map((c) => ({ h: inner($, $(c).find('h3').first()), p: $(c).children('p').toArray().map((p) => inner($, p)).join(' ') }));
  const need = <T>(v: T | undefined | null, what: string): T => {
    if (v === undefined || v === null || (Array.isArray(v) && !v.length) || v === '') throw new Error(`wp plans: ${what} not found`);
    return v;
  };

  // Hero: "Care & Protection" with its two paragraphs, the two links, and the 4 stat cards.
  const $c = find(/^Care & Protection/);
  const cp = paras($c);
  const heroLinks = need(cp.find((p) => $c(p).find('a').length >= 2), 'hero links');
  const hero = {
    eyebrow: h2($c),
    lead: inner($c, need(cp[0], 'hero lead')),
    more: inner($c, need(cp[1], 'hero second paragraph')),
    links: $c(heroLinks).find('a').toArray().map((a) => ({ href: $c(a).attr('href') ?? '', label: txt($c, a) })),
    stats: $c('.card').toArray().map((c) => $c(c).children('p').toArray().map((p) => txt($c, p))).map(([v, l]) => ({ v, l })),
  };
  need(hero.stats.length === 4 ? hero.stats : undefined, '4 stat cards');

  // Why you need ongoing care: intro and 6 cards.
  const $w = find(/^Why You Need Our/);
  const why = { h2: h2($w), lead: inner($w, paras($w)[0]), cards: need(cards($w), 'why cards') };

  // Packages explained: three paragraphs, shown behind "Read more".
  const $e = find(/Plans & Pricing Explained$/);
  const explained = { h2: h2($e), paras: paras($e).map((p) => inner($e, p)) };

  // What's included in every plan: intro and 6 items.
  const $i = find(/^What.s Included in Every Plan/);
  const included = { h2: h2($i), lead: inner($i, paras($i).find((p) => txt($i, p)) ?? null), items: $i('.card').toArray().map((c) => txt($i, c)) };
  need(included.items.length === 6 ? included.items : undefined, '6 included items');

  // Plans: heading, two intro lines, the "Best for" line per plan, buttons and the store line.
  const $p = find(/^Our WordPress Website Maintenance Packages$/);
  const pp = paras($p);
  const planCards = $p('.card').toArray().map((c) => {
    const ps = $p(c).children('p').toArray();
    const name = txt($p, $p(c).find('h3'));
    const button = $p(c).find('a').first();
    return { name, tag: ps.map((p) => txt($p, p)).find((t) => /^Most Popular$/i.test(t)) ?? '', forLine: txt($p, ps.find((p) => /^(Best for|For )/.test(txt($p, p))) ?? null), button: { href: button.attr('href') ?? '', label: txt($p, button) } };
  });
  const store = need(pp.find((p) => /online store/i.test(txt($p, p))), 'store line');
  const plans = prices.plans.map((plan) => {
    const card = need(planCards.find((c) => c.name === plan.name), `${plan.name} card`);
    return { ...plan, popular: 'popular' in plan && plan.popular, tag: card.tag, forLine: need(card.forLine, `${plan.name} "Best for" line`), button: card.button, saving: plan.monthly * MONTHS - plan.annual };
  });
  const plansBlock = { h2: h2($p), lead: inner($p, pp[0]), note: txt($p, pp[1]), store: inner($p, store) };

  // Monthly vs annual: heading, intro and the column labels; the numbers come from prices.json.
  const $s = find(/^Monthly vs Annual Pricing/);
  const savings = { h2: h2($s), lead: inner($s, paras($s)[0]), cols: $s('thead th').toArray().map((th) => txt($s, th)) };

  // Add-ons.
  const $a = find(/^Optional Add-On Services/);
  const addons = { h2: h2($a), items: $a('.card').toArray().map((c) => txt($a, c)) };

  // Full comparison: every row of the page's table.
  const $t = find(/^Full WordPress Maintenance Packages Comparison/);
  const compare = {
    h2: h2($t),
    lead: inner($t, paras($t)[0]),
    head: $t('thead th').toArray().map((th) => txt($t, th)),
    rows: $t('tbody tr').toArray().map((tr) => $t(tr).children().toArray().map((td) => txt($t, td))),
  };
  need(compare.rows.length >= 17 ? compare.rows : undefined, 'all 17 comparison rows');

  // How to choose: 3 cards and the "Still unsure?" line.
  const $h = find(/^How to Choose the Right/);
  const choose = { h2: h2($h), cards: need(cards($h), 'choose cards'), after: paras($h).map((p) => inner($h, p)) };

  // How it works: 4 steps, the process link, and the eyebrow of the next section.
  const $k = find(/^How Our WordPress Maintenance Works/);
  const steps = $k('.card').toArray().map((c) => ({ n: txt($k, $k(c).children('p').first()), h: inner($k, $k(c).find('h3')), p: inner($k, $k(c).children('p').last()) }));
  const kp = paras($k).map((p) => txt($k, p));
  const process = { h2: h2($k), steps: need(steps, 'steps'), after: paras($k).filter((p) => $k(p).find('a').length).map((p) => inner($k, p)) };
  const nextEyebrow = kp.find((t) => /^WordPress Needs Consistent Care$/.test(t)) ?? '';

  // Why WordPress needs continuous maintenance: intro, 4 points, 5 chips, a line and 3 cards.
  const $m = find(/^Why WordPress Needs Continuous Maintenance/);
  const mp = paras($m);
  const continuous = {
    eyebrow: nextEyebrow,
    h2: h2($m),
    lead: inner($m, mp[0]),
    points: $m('li').toArray().map((li) => ({ h: inner($m, $m(li).find('h3')), p: inner($m, $m(li).find('p')) })),
    chips: mp.map((p) => txt($m, p)).filter((t) => /^(Core|Plugins|Security|Themes|Updates)$/.test(t)),
    line: inner($m, need(mp.find((p) => /handles all your WordPress updates/.test(txt($m, p))), 'continuous line')),
    cards: cards($m),
  };

  // FAQ: the page's own questions and answers (links included).
  const $f = find(/^WordPress Maintenance Packages FAQ/);
  const faq = { h2: h2($f), lead: inner($f, paras($f)[0]), items: $f('details').toArray().map((d) => ({ q: inner($f, $f(d).find('summary')), a: inner($f, $f(d).children(':not(summary)')) })) };
  need(faq.items, 'FAQ entries');

  return { hero, why, explained, included, plans, plansBlock, savings, addons, compare, choose, process, continuous, faq, annualNote: prices.annualNote.en, low: prices.plans[0].monthly };
}

export type WpPlans = ReturnType<typeof parseWpPlans>;
