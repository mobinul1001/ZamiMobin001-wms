// Gives converted page HTML the design system. Text and order stay; only wrappers and classes change.
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { icon, nope, tick } from './icons';

const words = (s: string) => s.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

// Tables: labels for the phone layout, a tinted column for "with us", ticks where the column is clearly good or bad.
const GOOD_HEAD = /^(with |our |wms\b|website maintenance services\b)/i;
const BAD_HEAD = /^without\b/i;
function tables($: cheerio.CheerioAPI) {
  $('table').each((_, t) => {
    const table = $(t);
    table.addClass('tbl');
    const heads = table.find('thead th').toArray().map((h) => clean($(h).text()));
    const goodCol = heads.findIndex((h) => GOOD_HEAD.test(h));
    const badCol = heads.findIndex((h) => BAD_HEAD.test(h));
    if (goodCol > 0) table.find('thead th').eq(goodCol).addClass('th-good');
    table.find('tbody tr').each((__, tr) => {
      $(tr).children('td').each((i, td) => {
        if (heads[i]) $(td).attr('data-label', heads[i]);
        if (i === goodCol) $(td).addClass('td-good').prepend(tick);
        if (i === badCol) $(td).prepend(nope);
      });
    });
    table.wrap('<div class="tbl-wrap"></div>');
  });
}

// A paragraph that is only links is a call to action, so it becomes buttons.
function buttons($: cheerio.CheerioAPI) {
  $('p').each((_, p) => {
    const el = $(p);
    if (el.closest('table, form, details, .answer, .eyebrow, .status-panel, nav').length) return;
    const links = el.children('a');
    if (!links.length || el.contents().toArray().some((c) => c.type === 'text' && c.data.trim()) || el.children().length !== links.length) return;
    const inCard = el.closest('.card').length > 0;
    // A long link in a card is a description, not a button.
    if (links.toArray().some((a) => words($(a).text()) > (inCard ? 4 : 9) || /\.\s*$/.test($(a).text()) || !$(a).text().trim())) return;
    links.each((i, a) => { $(a).addClass(`btn ${i === 0 && !inCard ? 'primary' : 'ghost'}`); });
    const row = $('<div class="btn-row"></div>').append(links);
    el.replaceWith(row);
  });
}

const isLabel = ($: cheerio.CheerioAPI, n: AnyNode) => {
  const e = $(n);
  if (!e.is('p') || e.find('a, img').length || e.hasClass('pair')) return false;
  const t = clean(e.text());
  return t.length > 0 && words(t) <= 7 && !/[.!?:,]$/.test(t);
};

// Old layout wrappers can hold whole sections; those wrappers go, so that every H2 sits at the top level.
function flatten($: cheerio.CheerioAPI) {
  let found = true;
  while (found) {
    found = false;
    $.root().children('div').each((_, d) => {
      const box = $(d);
      if (box.children('h2').length || box.find('h2').length) { box.replaceWith(box.contents()); found = true; return false; }
      return undefined;
    });
  }
}

// The page split at each H2, with the part before the first H2 first.
export function sectionsOf(html: string) {
  const $ = cheerio.load(html, null, false);
  flatten($);
  const groups: string[] = [''];
  for (const n of $.root().contents().toArray()) {
    if ($(n).is('h2')) groups.push('');
    groups[groups.length - 1] += $.html(n);
  }
  return groups;
}

export function polish(html: string, { sections = true, start = 0 } = {}) {
  const $ = cheerio.load(html, null, false);
  if (sections) flatten($);
  tables($);
  buttons($);
  $('details').each((_, d) => { if (!$(d).closest('form').length) $(d).addClass('qa').find('summary').first().append(icon('plus')); });
  if (!sections) return $.html();
  // One section per H2, alternating backgrounds. A short label left at the end of a section goes above the next heading.
  const groups: AnyNode[][] = [[]];
  for (const n of $.root().contents().toArray()) {
    if (n.type === 'text' && !n.data.trim()) continue;
    if ($(n).is('h2')) groups.push([n]);
    else groups[groups.length - 1].push(n);
  }
  let out = '';
  let count = start;
  groups.forEach((g, i) => {
    const next = groups[i + 1];
    let label = '';
    const prev = (g as AnyNode[] & { label?: string }).label;
    if (next && g.length && isLabel($, g[g.length - 1])) {
      (next as AnyNode[] & { label?: string }).label = clean($(g.pop()!).text());
    }
    if (prev) label = prev;
    if (!g.length) return;
    const h2 = $(g[0]).is('h2') ? g.shift()! : null;
    let head = '';
    if (h2) {
      const first = g[0] && $(g[0]).is('p') && !$(g[0]).find('a.btn').length && words($(g[0]).text()) <= 70 ? g.shift()! : null;
      head = `<div class="head">${label ? `<p class="eyebrow">${label}</p>` : ''}${$.html(h2)}${first ? `<p class="intro">${$(first).html()}</p>` : ''}</div>`;
    } else if (label) {
      head = `<p class="eyebrow">${label}</p>`;
    }
    const body = g.map((n) => $.html(n)).join('');
    out += `<section class="sec${count % 2 ? ' alt' : ''}"><div class="wrap"><div class="prose">${head}${body}</div></div></section>`;
    count += 1;
  });
  return out;
}

// The last section, when it is only a short call to action, becomes the page's final CTA box.
export function extractCta(html: string): { body: string; cta?: { id?: string; title: string; text: string; links: { href: string; label: string }[] } } {
  const i = html.lastIndexOf('<h2');
  if (i < 0) return { body: html };
  const tail = html.slice(i);
  const $ = cheerio.load(tail, null, false);
  const text = clean($.root().text());
  const linkP = $.root().children('p').toArray().filter((p) => $(p).children('a').length && !$(p).contents().toArray().some((c) => c.type === 'text' && c.data.trim()));
  if (words(text) > 70 || linkP.length !== 1 || $.root().children('h3, ul, ol, table, details, div').length || $.root().children().last()[0] !== linkP[0]) return { body: html };
  const links = $(linkP[0]).children('a').toArray().map((a) => ({ href: $(a).attr('href') ?? '', label: clean($(a).text()) }));
  $(linkP[0]).remove();
  const title = $.root().children('h2').first().html() ?? '';
  const para = $.root().children('p').toArray().map((p) => $(p).html()).join(' ');
  return { body: html.slice(0, i), cta: { id: $.root().children('h2').first().attr('id'), title, text: para, links } };
}

// Puts the gradient on the last word of a heading.
export const hlLast = (s: string) => s.replace(/(\S+)$/, '<span class="hl">$1</span>');
