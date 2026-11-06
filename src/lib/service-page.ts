// Batch 2 service pages (owner's batch-2 brief, 2026-11-06): splits a service page's own HTML into the hero, its H2
// sections and the FAQ, and shapes long sections so the first part shows and the rest sits in native <details>.
// Nothing is written or removed here: every word of the page stays in the HTML.
import * as cheerio from 'cheerio';
import { splitBy } from './html-sections';

export interface SvSection { eyebrow: string; h2: string; id?: string; html: string; kind: 'default' | 'pricing' | 'faq' | 'closing' }
type $T = cheerio.CheerioAPI;
const sq = (s: string) => s.replace(/\s+/g, ' ').trim();
const load = (s: string) => cheerio.load(s, null, false);
const DOWN = '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
export const more = (label: string, body: string, cls = '') => `<details class="pp-rm ${cls}"><summary>${label}${DOWN}</summary><div class="pp-prose">${body}</div></details>`;
const OWNER = (what: string) => `<!-- OWNER CHECK: ${what} -->`;
const PRICE = /(?:\$|£|€)\s?\d/;

// Card grids with more than 4 cards show 4; the rest open from "Show N more".
function splitCards($: $T) {
  $('.cards').each((_, el) => {
    const cards = $(el).children('.card').toArray();
    if (cards.length <= 4) return;
    const rest = cards.slice(4).map((c) => $.html(c)).join('');
    cards.slice(4).forEach((c) => $(c).remove());
    $(el).after(more(`Show ${cards.length - 4} more`, `<div class="cards">${rest}</div>`, 'sv-more'));
  });
}
// Tables scroll inside their own box with a sticky first column (plans-page.css).
function wrapTables($: $T, label: string) {
  $('table').each((_, t) => {
    if ($(t).parent().hasClass('pp-tscroll')) return;
    $(t).addClass('pp-t sv-t');
    $(t).wrap(`<div class="pp-tscroll sv-tscroll" tabindex="0" role="region" aria-label="${label.replace(/"/g, '')}, scrolls sideways"></div>`);
  });
}
// Pricing cards: a price that is not confirmed in prices.json is not shown. The card says "Fixed quote after a free
// check" and the old price text stays in the HTML under "Price note" (OWNER CHECK).
function holdPrices($: $T, keep: number[] = [], quote = 'Fixed quote after a free check') {
  // Prices confirmed in prices.json for this page (keep) stay as they are.
  const confirmed = (t: string) => { const n = [...t.matchAll(/[$£€]\s?([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, ''))); return n.length > 0 && n.every((x) => keep.includes(x)); };
  // Each plan's feature list opens from "What's included" (every feature name stays in the HTML).
  $('.card').each((_, c) => { $(c).children('ul').each((__, ul) => { $(ul).replaceWith(more("What's included", $.html(ul), 'sv-inc')); }); });
  $('.card p, .card li').each((_, p) => {
    const t = sq($(p).text());
    if (!PRICE.test(t) || t.length > 90 || confirmed(t)) return;
    $(p).replaceWith(`<p class="rp-price mw-quote">${quote}</p>${OWNER('price not confirmed in prices.json (pendingServicePrices)')}${more('Price note', $.html(p), 'sv-pnote')}`);
  });
  $.root().children('p').each((_, p) => {
    const t = sq($(p).text());
    if (PRICE.test(t) && t.length <= 160 && !confirmed(t)) $(p).replaceWith(`${OWNER('price not confirmed in prices.json (pendingServicePrices)')}${more('Price note', $.html(p), 'sv-pnote')}`);
  });
}
// The first part of a long section stays open: up to the first card grid or table, or about 450 characters of text.
// Everything after it goes into "Read more".
// strict (later sections): only the opening text shows; a card grid, table or list goes into "Read more" too.
// Otherwise a big block shows only when it holds little text (a tall nested grid would make the page very long).
function foldLong($: $T, strict = false) {
  const kids = $.root().children().toArray();
  let shown = 0, cut = kids.length;
  for (let i = 0; i < kids.length; i++) {
    const k = $(kids[i]);
    const big = k.is('.cards, .pp-tscroll, ul, ol, details') || k.find('.cards, table').length > 0;
    const len = sq(k.text()).length;
    if (big) { cut = strict || len > 900 || k.find('.cards .cards').length ? i : i + 1; break; }
    shown += len;
    if (shown >= (strict ? 300 : 450) && i > 0) { cut = i + 1; break; }
  }
  if (cut === 0) cut = 1;
  const rest = kids.slice(cut);
  const restText = rest.map((e) => sq($(e).text())).join(' ');
  if (restText.length < 220) return;
  const html = rest.map((e) => $.html(e)).join('');
  rest.forEach((e) => $(e).remove());
  $.root().append(more('Read more', html, 'sv-fold'));
}

// Country pages: the big section holds H3 parts. The part with the local plan cards stays open with the #plans anchor
// and the local one-time prices under the cards; every other H3 part opens from its own heading (H3 kept).
function countryParts($: $T, extras: string) {
  const kids = $.root().children().toArray();
  const firstH3 = kids.findIndex((k) => $(k).is('h3'));
  if (firstH3 < 0) return false;
  const blocks: any[][] = [];
  for (const k of kids.slice(firstH3)) { if ($(k).is('h3')) blocks.push([k]); else blocks.at(-1)!.push(k); }
  let plans = false;
  for (const b of blocks) {
    const html = b.slice(1).map((e) => $.html(e)).join('');
    const isPlans = !plans && /<h[34][^>]*>(?:Plano )?Essential<\/h[34]>/.test(html);
    const h3 = $.html(b[0]);
    const out = isPlans ? `<div id="plans"></div>${h3}${html}<p class="plan-extras">${extras}</p>` : `<details class="pp-rm sv-h3"><summary>${h3}${DOWN}</summary><div class="pp-prose">${html}</div></details>`;
    if (isPlans) plans = true;
    $(b[0]).before(out);
    b.forEach((e) => $(e).remove());
  }
  return plans;
}

export function parseService(html: string, keep: number[] = [], quote?: string, country?: { extras: string }) {
  const { intro, sections } = splitBy(html, 2);
  // The old in-page anchor #pricing moves to the pricing section itself (the template sets the id), so the empty
  // anchor goes; otherwise the id would appear twice.
  const chunks = [intro, ...sections.map((s) => s.html)].map((c) => c.replace(/(?:<p>)?<a id="pricing"><\/a>(?:<\/p>)?\s*/g, ''));
  // A short paragraph right before an H2 is that section's eyebrow label.
  const eyebrows: string[] = [];
  for (let i = 0; i < chunks.length - 1; i++) {
    const m = /<p>([^<]{2,60})<\/p>\s*$/.exec(chunks[i]);
    eyebrows.push(m ? m[1] : '');
    if (m) chunks[i] = chunks[i].slice(0, m.index);
  }

  // Hero: the quick answer (added through text-edits.mjs), the first real paragraph as the lead, the page's own
  // buttons, the example panel; everything else in the intro stays in a closed "Read more" under the hero.
  const $h = load(chunks[0]);
  const qa = $h('p.quick-answer').first();
  const quickAnswer = qa.length ? ($h(qa).html() ?? '').trim() : '';
  qa.remove();
  const panel = $h('.status-panel').first();
  const panelHtml = panel.length ? $h.html(panel) : '';
  if (panel.length) { const card = panel.parent('.card'); (card.length && sq(card.text()) === sq(panel.text()) ? card : panel).remove(); }
  const ps = $h.root().find('p').toArray();
  const leadEl = ps.find((p) => { const t = sq($h(p).text()); return t.length >= 50 && t.length <= 320 && !$h(p).children('a').length; });
  const lead = leadEl ? ($h(leadEl).html() ?? '').trim() : '';
  if (leadEl) $h(leadEl).remove();
  const linkP = $h.root().find('p').toArray().find((p) => $h(p).children('a').length >= 1 && sq($h(p).text()) === sq($h(p).children('a').text()));
  const links = linkP ? $h(linkP).children('a').toArray().map((a) => ({ href: $h(a).attr('href') ?? '', label: sq($h(a).text()) })) : [];
  if (linkP) $h(linkP).remove();
  const eyebrowEl = $h.root().children('p').toArray().find((p) => { const t = sq($h(p).text()); return t.length >= 2 && t.length <= 60 && !$h(p).find('a').length; });
  const eyebrow = eyebrowEl ? sq($h(eyebrowEl).text()) : '';
  if (eyebrowEl) $h(eyebrowEl).remove();
  const introRest = $h.html().trim();

  const out: SvSection[] = [];
  let faq: { sec: SvSection; lead: string; items: { q: string; id?: string; a: string[] }[] } | undefined;
  sections.forEach((s, i) => {
    const $ = load(chunks[i + 1]);
    const h = $('h2').first();
    const sec: SvSection = { eyebrow: eyebrows[i] ?? '', h2: ($.html(h.contents()) ?? '').trim(), id: h.attr('id'), html: '', kind: 'default' };
    h.remove();
    const title = s.title;
    // FAQ: questions are H3s, or (older pages) plain paragraphs ending with "?", each followed by its answer.
    const qp = $.root().children('p').toArray().filter((p) => /\?$/.test(sq($(p).text())) && sq($(p).text()).length < 160);
    if (/frequently asked|^faq/i.test(title) && ($('h3').length || qp.length >= 3)) {
      sec.kind = 'faq';
      const qs = $('h3').length ? $('h3').toArray() : qp;
      const isQ = (e: cheerio.Cheerio<any>) => (qs as any[]).includes(e[0]);
      const items = qs.map((q) => {
        const a: string[] = [];
        for (let e = $(q).next(); e.length && !e.is('h3, h2') && !isQ(e); e = e.next()) a.push($.html(e));
        return { q: ($(q).html() ?? '').trim(), id: $(q).attr('id'), a };
      });
      const first = $(qs[0]);
      const leadHtml = first.length ? first.prevAll().toArray().reverse().map((e) => $.html(e)).join('') : '';
      faq = { sec, lead: leadHtml, items };
      out.push(sec);
      return;
    }
    if (i === sections.length - 1 && /^(get|ready|accelerate|start|book)/i.test(title)) sec.kind = 'closing';
    else if (/pricing|packages|plans/i.test(title) && PRICE.test($.text())) sec.kind = 'pricing';
    splitCards($);
    // Country pages: a plans section with the Essential card is the pricing section (any currency), never folded.
    if (country && sec.kind !== 'closing' && /pricing|packages|plans/i.test(title) && $('h3, h4').toArray().some((h) => /^(Plano )?Essential$/.test(sq($(h).text())))) sec.kind = 'pricing';
    if (country && sec.kind === 'default' && countryParts($, country.extras)) {
      sec.kind = 'pricing';
      sec.html = $.html().trim();
      out.push(sec);
      return;
    }
    // Country pages whose plans have their own H2: the local prices are all confirmed (prices.json local), so they show.
    if (country && sec.kind === 'pricing') {
      if (!$('#plans').length) $.root().prepend('<div id="plans"></div>');
      $.root().append(`<p class="plan-extras">${country.extras}</p>`);
      sec.html = $.html().trim();
      out.push(sec);
      return;
    }
    wrapTables($, sq(title));
    if (sec.kind === 'pricing') {
      holdPrices($, keep, quote);
      // A long feature comparison under the plan cards opens from "Compare all features".
      $('.pp-tscroll').each((_, t) => { $(t).replaceWith(more('Compare all features', $.html(t), 'sv-cmp')); });
    }
    // A section with a form (an application or contact form) stays open.
    // A FAQ written as <details> items is already collapsed: it stays as it is.
    const detailsFaq = /frequently asked|faq/i.test(title) && $('details').length >= 3;
    if (sec.kind === 'default' && !$('form').length && !detailsFaq) foldLong($, i >= 2);
    if (sec.kind === 'closing') foldLong($, true);
    sec.html = $.html().trim();
    out.push(sec);
  });
  return { hero: { eyebrow, lead, links, quickAnswer, panel: panelHtml, introRest }, sections: out, faq };
}
export type ServiceData = ReturnType<typeof parseService>;
