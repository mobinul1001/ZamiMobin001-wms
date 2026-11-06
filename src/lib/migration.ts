// Website migration page (owner's design, batch 1, 2026-11-05): splits the page's own HTML into its sections and the
// blocks the template shows. Nothing is written here. A missing block stops the build.
import * as cheerio from 'cheerio';
import prices from '../data/prices.json';
import { splitBy } from './html-sections';

export interface Sec { eyebrow: string; h2: string; id?: string }
type $T = cheerio.CheerioAPI;

export function parseMigration(html: string) {
  const sq = (s: string) => s.replace(/\s+/g, ' ').trim();
  const { intro, sections } = splitBy(html, 2);
  // The old in-page anchors (#migration-process, #pricing) move to the sections themselves (the template sets the ids),
  // so they are taken out here; otherwise the ids would appear twice and point to the wrong place.
  const chunks = [intro, ...sections.map((s) => s.html)].map((c) => c.replace(/<p><a id="[^"]*"><\/a><\/p>\s*/g, ''));
  const eyebrows: string[] = [];
  for (let i = 0; i < chunks.length - 1; i++) {
    const m = /<p>([^<]{2,60})<\/p>\s*(?:<p><a id="[^"]*"><\/a><\/p>\s*)?$/.exec(chunks[i]);
    eyebrows.push(m ? m[1] : '');
    if (m) chunks[i] = chunks[i].slice(0, m.index) + (/<a id="[^"]*">/.exec(chunks[i].slice(m.index))?.[0] ? '' : '');
  }
  const load = (s: string) => cheerio.load(s, null, false);
  const need = <T>(v: T | undefined | null, what: string): T => {
    if (v === undefined || v === null || (Array.isArray(v) && !v.length) || v === '') throw new Error(`migration page: ${what} not found`);
    return v;
  };
  const find = (re: RegExp) => {
    const i = sections.findIndex((s) => re.test(s.title));
    if (i < 0) throw new Error(`migration page: section not found: ${re}`);
    const $ = load(chunks[i + 1]);
    const h = $('h2').first();
    const sec: Sec = { eyebrow: eyebrows[i] ?? '', h2: ($.html(h.contents()) ?? '').trim(), id: h.attr('id') };
    h.remove();
    return { $, sec };
  };
  const txt = ($: $T, e: Parameters<$T>[0]) => sq($(e).text());
  const html$ = ($: $T, e: Parameters<$T>[0]) => ($(e).html() ?? '').trim();

  // Hero: intro (held in full; its second sentence is the visible lead), links, Example panel, stat cards, platforms.
  const $h = load(chunks[0]);
  const [heroCard, panelCard] = $h('.cards').first().children('.card').toArray();
  const hp = $h(heroCard).children('p').toArray();
  const introFull = html$($h, hp[0]);
  const lead = need(/without losing traffic, data, or SEO rankings\.\s*(.+)$/.exec(introFull)?.[1], 'hero intro (held clause changed?)');
  const statCards = $h('.cards').eq(1).children('.card').toArray().map((c) => html$($h, c));
  const after = $h.root().children('p').toArray().map((p) => txt($h, p));
  const hero = {
    introFull, lead,
    links: $h(hp[1]).children('a').toArray().map((a) => ({ href: $h(a).attr('href') ?? '', label: txt($h, a) })),
    panel: need($h(panelCard).find('.status-panel').prop('outerHTML'), 'Live Transfer panel'),
    trustLine: need(statCards.find((c) => /650\+/.test(c)), '650+ line').replace(/<\/?p>/g, ''),
    heldStats: statCards.filter((c) => !/650\+/.test(c)),
    platformsTitle: after[0], platformsLead: after[1], platforms: after.slice(2),
  };
  if (!/>Example</.test(hero.panel)) throw new Error('migration page: the hero panel is no longer labelled Example');

  const cardsOf = ($: $T) => $('.cards > .card').toArray().map((c) => $.html(c));
  const overview = (() => { const { $, sec } = find(/^What Is Our Website Migration Service/); const c = cardsOf($); need(c.length === 3 ? c : undefined, '3 migration types'); $('.cards').remove(); return { sec, cards: c, rest: $.html().trim() }; })();
  const why = (() => {
    const { $, sec } = find(/^Why Choose a Professional Website Migration Service/);
    const t = $('table').first();
    const head = t.find('thead th').toArray().map((x) => html$($, x));
    const rows = t.find('tbody tr').toArray().map((r) => $(r).children('td').toArray().map((x) => html$($, x)));
    const h3 = $.html(t.prevAll('h3').first());
    t.prevAll('h3').first().remove(); t.remove();
    const ps = $.root().children('p').toArray();
    const freeFix = need(ps.find((p) => /^Free fix within 30 days/.test(txt($, p))), 'free-fix paragraph');
    return { sec, lead: html$($, ps[0]), h3, head, rows, freeFix: $.html(freeFix), after: ps.filter((p) => p !== ps[0] && p !== freeFix).map((p) => $.html(p)).join('') };
  })();
  const process = (() => {
    const { $, sec } = find(/^Our 7-Step Website Migration Process/);
    const steps = $('h3').toArray().map((h) => ({ n: txt($, $(h).prev('p')), h: html$($, h), id: $(h).attr('id'), p: html$($, $(h).next('p')), badge: txt($, $(h).next('p').next('p')) }));
    need(steps.length === 7 ? steps : undefined, '7 steps');
    const ps = $.root().children('p').toArray();
    return { sec, lead: html$($, ps[0]), steps, cta: $.html(ps.at(-1)) };
  })();
  const platforms = (() => { const { $, sec } = find(/^Platforms & CMS Systems We Migrate/); const c = cardsOf($); need(c.length === 8 ? c : undefined, '8 platforms'); const names = $('.cards > .card h3').toArray().map((h) => txt($, h)); $('.cards').remove(); return { sec, cards: c, names, rest: $.html().trim() }; })();
  const pricing = (() => {
    const { $, sec } = find(/^Website Migration Service Pricing/);
    const tiers = $('.cards > .card').toArray().map((c) => {
      const h3 = $(c).find('h3');
      const before = h3.prevAll('p').toArray().reverse().map((p) => txt($, p));
      const after = h3.nextAll('p').toArray();
      const a = $(after.at(-1)).find('a').first();
      return { tag: before.length > 1 ? before[0] : '', label: before.at(-1) ?? '', h: html$($, h3), id: h3.attr('id'), forLine: html$($, after[0]), priceText: txt($, after[1]), list: $(c).find('li').toArray().map((li) => html$($, li)), link: { href: a.attr('href') ?? '', label: txt($, a) } };
    });
    need(tiers.length === 3 ? tiers : undefined, '3 migration plans');
    const P = prices.migrationPrices;
    if (!tiers[0].priceText.startsWith(`$${P.hostMove} `) || !tiers[1].priceText.startsWith(`$${P.full} `)) throw new Error('migration page: plan prices differ from prices.json');
    $('.cards').remove();
    const ps = $.root().children('p').toArray();
    const h4 = $('h4').first();
    const strip = $.html(h4) + h4.nextAll('p').toArray().map((p) => $.html(p)).join('');
    return { sec, free: html$($, ps[0]), lead: html$($, ps[1]), tiers, strip };
  })();
  const included = (() => {
    const { $, sec } = find(/^What.s Included in Every Website Migration/);
    const items = $('h3').toArray().filter((h) => $(h).next('p').length && !/Checklist/.test(txt($, h))).map((h) => ({ h: html$($, h), id: $(h).attr('id'), p: html$($, $(h).next('p')), held: /30-Day Post Support/.test(txt($, h)) }));
    need(items.length === 12 ? items : undefined, '12 included items');
    const ch = $('h3').filter((_, h) => /Checklist/.test(txt($, h))).first();
    const checklist = { label: txt($, ch.prev('p')), h3: $.html(ch), p: $.html(ch.next('p')), link: $.html(ch.next('p').next('p')) };
    return { sec, lead: html$($, $.root().children('p').first()), items, checklist };
  })();
  const cases = (() => {
    const { $, sec } = find(/^Real Migration Results/);
    const h3s = $('h3').toArray();
    const items = h3s.map((h) => {
      // Everything after the H3 up to the next case's tag line (a p.pair right before an H3) or the "More" line.
      const block: Parameters<$T>[0][] = [];
      for (let e = $(h).next(); e.length; e = e.next()) {
        if (e.is('h3') || (e.is('p.pair') && e.next().is('h3')) || /^More Successfully/.test(txt($, e))) break;
        block.push(e[0]);
      }
      // In a card, the numbers sit in a nested row: read every paragraph of the card after the H3.
      const card = $(h).closest('.card');
      const all = card.length ? card.find('p').toArray().filter((p) => $(p).index() > $(h).index() || !$(p).parent().is(card)) : block.flatMap((e) => ($(e).is('p') ? [e] : $(e).find('p').toArray()));
      const pairs = all.filter((e) => $(e).is('p.pair') && !$(e).next().is('h3')).map((p) => html$($, p));
      const ps = all.filter((e) => $(e).is('p:not(.pair)')).map((p) => ({ t: txt($, p), html: html$($, p) }));
      const tagP = $(h).prev('p.pair');
      return { tag: txt($, tagP.find('strong')), n: txt($, tagP.find('span')), h: html$($, h), id: $(h).attr('id'), domain: ps[0]?.html ?? '', body: ps.slice(1).filter((p) => !/^Result:/.test(p.t)).map((p) => p.html), result: ps.find((p) => /^Result:/.test(p.t))?.html ?? '', numbers: pairs };
    });
    need(items.length === 3 ? items : undefined, '3 case studies');
    const more = $('p').filter((_, p) => /^More Successfully Migrated/.test(txt($, p))).first();
    return { sec, items, moreTitle: txt($, more), moreLinks: $.html(more.next('p')), works: $.html(more.next('p').next('p')) };
  })();
  const faq = (() => {
    const { $, sec } = find(/^Website Migration Services — Frequently Asked Questions/);
    // Every paragraph after a question up to the next question is its answer. One answer has two paragraphs (the
    // second, about the 30-day free fix, lost its own question on the old page); the FAQ schema has both, so the page does too.
    const items = $('h3').toArray().map((h) => {
      const ps: string[] = [];
      for (let e = $(h).next(); e.length && !e.is('h3, h2'); e = e.next()) if (e.is('p')) ps.push(html$($, e));
      return { q: html$($, h), id: $(h).attr('id'), a: ps[0] ?? '', extra: ps.slice(1) };
    });
    need(items.length >= 9 ? items : undefined, 'at least 9 FAQs');
    return { sec, lead: html$($, $.root().children('p').first()), items };
  })();
  const closing = (() => { const { $, sec } = find(/^Ready to Migrate Your Website/); return { sec, html: $.html().trim() }; })();
  return { hero, overview, why, process, platforms, pricing, included, cases, faq, closing };
}
export type Migration = ReturnType<typeof parseMigration>;
