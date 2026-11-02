// Gives converted page HTML the design system. Text stays; only wrappers, classes and placement change.
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { badge, icon, nope, tick } from './icons';

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
    if (links.toArray().some((a) => words($(a).text()) > (inCard ? 5 : 9) || /\.\s*$/.test($(a).text()) || !$(a).text().trim())) return;
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

const ICONS: [RegExp, string][] = [
  [/secur|malware|hack|firewall|ssl|protect|safe|pci|hipaa|gdpr|compliance/i, 'shield'],
  [/migrat|move|transfer/i, 'move'],
  [/backup|backed|restor|data/i, 'db'],
  [/uptime|monitor|health|error-free/i, 'pulse'],
  [/speed|performance|fast|optimi[sz]/i, 'gauge'],
  [/updat|patch|plugin|core/i, 'refresh'],
  [/fix|repair|bug|technical|error|develop/i, 'wrench'],
  [/seo|audit|review|check|scan|analy/i, 'search'],
  [/support|help|human|communicat|respon|emergency/i, 'chat'],
  [/design|layout|theme|mobile/i, 'layout'],
  [/report|content|blog|document/i, 'file'],
  [/team|expert|specialist|agenc|client|partner|business|professional/i, 'users'],
  [/hosting|domain|cloud|global|local/i, 'globe'],
  [/price|pricing|plan|contract|afford|transparen|free|cost/i, 'tag'],
  [/hour|24|time|schedule|proactive/i, 'clock'],
];
export const iconFor = (text: string) => ICONS.find(([re]) => re.test(text))?.[1] ?? 'check';
const iconBadge = (text: string, i: number) => badge(iconFor(text), (i % 6) + 1);
const spans = (n: number) => {
  const per = n % 4 !== 1 ? 4 : n % 3 !== 1 ? 3 : 4;
  const rest = n % per;
  return Array.from({ length: n }, (_, i) => (rest && i >= n - rest ? 12 / rest : 12 / per));
};
const fill = ($: cheerio.CheerioAPI, box: cheerio.Cheerio<AnyNode>) => {
  const kids = box.children().toArray();
  spans(kids.length).forEach((s, i) => { $(kids[i]).addClass(`s${s}`); });
  box.addClass('fill');
};

// FAQ sections become one 2-column accordion. Question and answer text stay in the HTML.
const FAQ_TITLE = /\bfaqs?\b|frequently asked|perguntas frequentes|preguntas frecuentes/i;
const isQuestion = ($: cheerio.CheerioAPI, n: AnyNode) => $(n).is('p') && !$(n).find('img, a').length && /\?\s*$/.test(clean($(n).text())) && words($(n).text()) <= 25;
function faqs($: cheerio.CheerioAPI) {
  $.root().children('h2').each((_, h) => {
    if (!FAQ_TITLE.test(clean($(h).text()))) return;
    const nodes: AnyNode[] = [];
    for (let n = h.next as AnyNode | null; n && !$(n).is('h2'); n = n.next as AnyNode | null) if (n.type !== 'text' || n.data.trim()) nodes.push(n);
    const items: string[] = [];
    let open: { q: string; a: string } | null = null;
    const done = () => { if (open) items.push(`<details class="qa"><summary>${open.q}${icon('plus')}</summary>${open.a}</details>`); open = null; };
    const used: AnyNode[] = [];
    for (const n of nodes) {
      const e = $(n);
      if (e.is('details')) { done(); e.removeClass('qa'); e.find('summary .ic').remove(); items.push(`<details class="qa"><summary>${e.find('summary').first().html()}${icon('plus')}</summary>${e.children(':not(summary)').toArray().map((c) => $.html(c)).join('')}</details>`); used.push(n); continue; }
      if (e.is('h3, h4, h5') || isQuestion($, n)) { done(); open = { q: e.is('p') ? `<span>${e.html()}</span>` : $.html(n), a: '' }; used.push(n); continue; }
      if (open) { open.a += $.html(n); used.push(n); }
    }
    done();
    if (items.length < 2) return;
    const first = used[0];
    $(first).before(`<div class="faq">${items.join('').replace('<details class="qa">', '<details class="qa" open>')}</div>`);
    used.forEach((n) => $(n).remove());
  });
  // Other accordions that sit together share the same layout.
  $('details.qa').each((_, d) => {
    if ($(d).parent().is('.faq')) return;
    const run = [$(d)];
    let x = $(d).next();
    while (x.is('details.qa')) { run.push(x); x = x.next(); }
    if (run.length < 2) return;
    const box = $('<div class="faq"></div>');
    run[0].before(box);
    run.forEach((r) => box.append(r));
  });
}

const STAT_NUM = /^([<~≈$£€]?\s?\d[\d.,/–-]*\s?(?:\+|%|x|k|ms|s\b|mins?\b|hrs?\b|hours?\b|days?\b|years?\b)?\+?)(?:\s+(.+))?$/i;
// A card that holds only a number and a short label is a stat card.
function statOf($: cheerio.CheerioAPI, card: cheerio.Cheerio<AnyNode>) {
  if (card.find('a, h1, h2, h3, h4, h5, ul, ol, img, table').length) return null;
  const pair = card.find('p.pair');
  if (pair.length === 1) {
    const num = clean(pair.find('strong').text());
    const label = clean(pair.find('span').text());
    return STAT_NUM.test(num) && !STAT_NUM.exec(num)![2] ? { num, label } : null;
  }
  const ps = card.children('p').toArray().map((p) => clean($(p).text()));
  if (ps.length === 2 && STAT_NUM.test(ps[0]) && !STAT_NUM.exec(ps[0])![2] && words(ps[1]) <= 14) return { num: ps[0], label: ps[1] };
  if (ps.length === 1) {
    const m = STAT_NUM.exec(ps[0]);
    if (m?.[2] && words(m[2]) <= 10) return { num: clean(m[1]), label: m[2] };
  }
  return null;
}

// Old lines that ran several short items together, split into a list.
const KNOWN_LISTS = [['Small & Local Businesses', 'Service Businesses', 'E-commerce Stores', 'Agencies', 'Professionals (Doctors, Lawyers)', 'Contractors & Trades', 'Real Estate & Rentals', 'Travel & Hospitality', 'Blog & Content Websites', 'Consultants']];
const iconGrid = (items: string[]) => { const sp = spans(items.length); return `<ul class="icon-grid fill">${items.map((t, i) => `<li class="s${sp[i]}">${iconBadge(cheerio.load(t, null, false).root().text(), i)}<span>${t}</span></li>`).join('')}</ul>`; };

function cards($: cheerio.CheerioAPI) {
  $('p').each((_, p) => {
    const t = clean($(p).text());
    const known = KNOWN_LISTS.find((l) => l.join(' ') === t);
    if (!known) return;
    const grid = iconGrid(known.map((x) => x.replace(/&/g, '&amp;')));
    if ($(p).parent().is('.cards')) { $(p).parent().before(grid); $(p).remove(); } else $(p).replaceWith(grid);
  });
  // Loose text in a card row gets its card, and cards with no row get one.
  $('.cards').each((_, c) => { $(c).children('p').each((__, p) => { $(p).wrap('<div class="card"></div>'); }); });
  $('.card').each((_, c) => {
    if ($(c).parent().is('.cards, ol, ul') || $(c).prev().is('.card')) return;
    const run = [$(c)];
    let x = $(c).next();
    while (x.is('.card')) { run.push(x); x = x.next(); }
    if (run.length < 2) return;
    const box = $('<div class="cards"></div>');
    run[0].before(box);
    run.forEach((r) => box.append(r));
  });
  $('.cards').each((_, c) => {
    const row = $(c);
    const items = row.children('.card').toArray();
    if (!items.length) return;
    let stats = items.map((i) => statOf($, $(i)));
    // In a row that is mostly numbers, a short two-line card is a stat too.
    if (stats.filter(Boolean).length * 2 >= items.length && !stats.every(Boolean)) {
      stats = items.map((i, n) => {
        if (stats[n]) return stats[n];
        const ps = $(i).children('p').toArray().map((p) => clean($(p).text()));
        return ps.length === 2 && !$(i).find('a, h3, h4, ul').length && words(ps[0]) <= 3 && words(ps[1]) <= 14 ? { num: ps[0], label: ps[1] } : null;
      });
    }
    if (stats.every(Boolean)) {
      { const sp = spans(stats.length); row.replaceWith(`<div class="stats-row${row.parent().closest('.card').length ? '' : ' fill'}">${stats.map((s, n) => `<div class="stat s${sp[n]}${/\d/.test(s!.num) ? '' : ' stat-text'}"><b>${s!.num}</b><span>${s!.label}</span></div>`).join('')}</div>`); }
      return;
    }
    const plain = items.every((i) => !$(i).find('h3, h4, h5, ul, ol, img, a, form, table, .status-panel, .cards').length && $(i).children('p').length === 1 && words($(i).text()) <= 8);
    if (plain && items.length >= 2 && !row.parent().closest('.card').length) {
      row.replaceWith(iconGrid(items.map((i) => $(i).children('p').first().html() ?? $(i).html() ?? '')));
      return;
    }
    const short = items.every((i) => !$(i).find('ul, ol, img, a, form, table, .status-panel, .cards').length && $(i).children('h3, h4').length === 1 && words($(i).text()) <= 25);
    if (short && items.length >= 3 && !row.parent().closest('.card').length) {
      row.addClass('short');
      fill($, row);
      items.forEach((it, i) => { $(it).prepend(iconBadge($(it).children('h3, h4').text(), i)); });
    }
  });
}

const isDigit = ($: cheerio.CheerioAPI, n: AnyNode | null | undefined) => !!n && $(n).is('p') && /^\d{1,2}\.?$/.test(clean($(n).text()));
const skip = (n: AnyNode | null) => { let x = n; while (x && x.type === 'text' && !x.data.trim()) x = x.next as AnyNode | null; return x; };
// "1 / heading / text" lines become numbered cards.
function numbered($: cheerio.CheerioAPI) {
  $('p').toArray().forEach((p) => {
    if (!p.parent || !isDigit($, p) || $(p).closest('.num-cards, form, table').length) return;
    const groups: AnyNode[][] = [];
    let n: AnyNode | null = p;
    while (n && isDigit($, n)) {
      const g: AnyNode[] = [n];
      let x = skip(n.next as AnyNode | null);
      if (!x || !$(x).is('h3, h4, h5')) break;
      while (x && !isDigit($, x) && $(x).is('h3, h4, h5, p') && g.length < 4) {
        if (g.length > 1 && $(x).is('h3, h4, h5')) break;
        if (g.length > 2 && $(skip(x.next as AnyNode | null) as AnyNode | null ?? []).is('h2')) break;
        g.push(x);
        x = skip(x.next as AnyNode | null);
      }
      if (g.map((v) => $(v).text()).join(' ').split(/\s+/).length > 70) break;
      groups.push(g);
      n = x;
    }
    if (groups.length >= 2) {
      const items = groups.map((g) => `<li class="card"><span class="n">${clean($(g[0]).text())}</span>${g.slice(1).map((v) => $.html(v)).join('')}</li>`).join('');
      { const box = $(`<ol class="num-cards">${items}</ol>`); fill($, box); $(p).before(box); }
      groups.flat().forEach((v) => $(v).remove());
    } else {
      $(p).addClass('n');
    }
  });
}

// Runs of short plain lines become chips, icon badges or a check list.
function lines($: cheerio.CheerioAPI, sections: boolean) {
  $.root().find('*').addBack().each((_, parent) => {
    const box = $(parent);
    if (box.is('table, form, details, ul, ol, .answer, .status-panel, .card, .faq, .cards, nav') || box.closest('table, form, details, .answer, .status-panel, .card, .faq').length) return;
    const flush = (run: AnyNode[], stop: AnyNode | null) => {
      const list = [...run];
      if (stop && $(stop).is('h2') && list.length) list.pop();
      if (list.length < 2) return;
      // Name and value lines take turns: a small two-column list.
      const pairs = [...list];
      while (pairs.length && words($(pairs[0]).text()) > 4) pairs.shift();
      const vals = pairs.map((n) => clean($(n).text()));
      if (pairs.length >= 4 && pairs.length % 2 === 0 && vals.every((t, i) => (i % 2 ? /\d/.test(t) && words(t) <= 5 : words(t) <= 5))) {
        const rows = vals.reduce<string[]>((acc, _t, i) => (i % 2 ? acc : [...acc, `<li><span>${$(pairs[i]).html()}</span><b>${$(pairs[i + 1]).html()}</b></li>`]), []);
        $(pairs[0]).before(`<ul class="kv">${rows.join('')}</ul>`);
        pairs.forEach((n) => $(n).remove());
        return;
      }
      const texts = list.map((n) => clean($(n).text()));
      if (texts.some((t) => /\d/.test(t) && words(t) <= 3)) return;
      const label = stop && $(stop).is('h4') && clean($(stop).text()) === clean($(stop).text()).toUpperCase() ? stop : null;
      if (texts.every((t) => words(t) <= 3) && list.length <= 8 && !texts.some((t) => /\d/.test(t))) {
        const loud = texts.some((t) => t === t.toUpperCase());
        const row = loud
          ? `<ul class="icon-badges">${texts.map((t, i) => `<li>${iconBadge(t, i)}<span>${$(list[i]).html()}</span></li>`).join('')}</ul>`
          : `<ul class="chips line-chips">${list.map((n) => `<li>${$(n).html()}</li>`).join('')}</ul>`;
        $(list[0]).before(`<div class="badge-row">${row}${label ? `<p class="badge-label">${$(label).html()}</p>` : ''}</div>`);
        list.forEach((n) => $(n).remove());
        if (label) $(label).remove();
      } else if (sections && list.length >= 3 && list.length <= 8 && !texts.some((t) => /:$|^[^ ]+:/.test(t))) {
        $(list[0]).before(`<div class="card line-card"><ul class="check-list">${list.map((n) => `<li>${tick}<span>${$(n).html()}</span></li>`).join('')}</ul></div>`);
        list.forEach((n) => $(n).remove());
      }
    };
    let run: AnyNode[] = [];
    for (const n of box.contents().toArray()) {
      if (n.type === 'text' && !n.data.trim()) continue;
      const e = $(n);
      if (e.is('p') && !e.is('.n, .pair') && !e.find('a, img').length && words(e.text()) <= 14 && !/\?\s*$/.test(e.text())) run.push(n);
      else { flush(run, n); run = []; }
    }
    flush(run, null);
  });
}

// A single word or an all-caps line left alone is a small label; an emoji alone is an icon tile.
function labels($: cheerio.CheerioAPI) {
  $('p').each((_, p) => {
    const e = $(p);
    if (e.closest('table, form, .stat, .btn-row, .status-panel, .eyebrow').length || e.is('.n, .eyebrow, .badge-label, .pair') || e.find('a, img').length) return;
    const t = clean(e.text());
    if (!t) return;
    // A copy-button message from the old page: kept in the HTML, not shown.
    if (t === 'Copied!') { e.attr('hidden', ''); return; }
    if (/^\p{Extended_Pictographic}\uFE0F?$/u.test(t)) e.addClass('emoji-tile');
    else if (!t.includes(' ') || (t === t.toUpperCase() && /[A-Z]{3}/.test(t))) e.addClass('line-label');
  });
}

// Short lists become icon cards. Lists of titled benefits become bigger icon cards.
function lists($: cheerio.CheerioAPI) {
  $.root().find('ul').each((_, u) => {
    const list = $(u);
    if (list.closest('.card, table, form, details, .faq, nav').length || list.attr('class')) return;
    const items = list.children('li').toArray();
    if (items.length < 3) return;
    if (items.every((l) => $(l).children('h3, h4').length === 1)) {
      list.addClass('benefit-grid');
      items.forEach((l, i) => { $(l).addClass('card').prepend(iconBadge($(l).children('h3, h4').text(), i)); });
      fill($, list);
    } else if (items.every((l) => words($(l).text()) <= 8) && !list.prev().is('h5')) {
      list.replaceWith(iconGrid(items.map((l) => $(l).html() ?? '')));
    }
  });
}

// Several short titled blocks in a row become a card grid instead of a long column of text.
function blocks($: cheerio.CheerioAPI, g: AnyNode[]) {
  const out: AnyNode[] = [];
  let i = 0;
  const isTitleLine = (n?: AnyNode) => !!n && $(n).is('p') && !$(n).find('a, img').length && words($(n).text()) <= 9 && !/[.!?:,]\s*$/.test($(n).text());
  const isHead = (n?: AnyNode, m?: AnyNode) => !!n && ($(n).is('h3, h4') || (isTitleLine(n) && !!m && $(m).is('p') && words($(m).text()) >= 15));
  while (i < g.length) {
    const found: AnyNode[][] = [];
    let j = i;
    while (isHead(g[j], g[j + 1])) {
      const level = (g[j] as { tagName?: string }).tagName;
      const part = [g[j]];
      let k = j + 1;
      while (g[k] && $(g[k]).is('p') && !$(g[k]).find('img').length && part.length < 4 && !isHead(g[k], g[k + 1])) { part.push(g[k]); k += 1; }
      if (part.length < 2 || words(part.map((v) => $(v).text()).join(' ')) > 70 || (found.length && (found[0][0] as { tagName?: string }).tagName !== level)) break;
      found.push(part);
      j = k;
    }
    if (found.length >= 3) {
      const row = $(`<div class="cards">${found.map((p) => { if ($(p[0]).is('p')) $(p[0]).addClass('card-title'); return `<div class="card">${p.map((v) => $.html(v)).join('')}</div>`; }).join('')}</div>`);
      out.push(row[0] as AnyNode);
      i = j;
    } else {
      out.push(g[i]);
      i += 1;
    }
  }
  return out;
}

const WIDE = '.cards, .icon-grid, .benefit-grid, .stats-row, .faq, .tbl-wrap, .num-cards, form, details';
const SIDE = '.line-card, .badge-row, .status-panel';
const isImg = ($: cheerio.CheerioAPI, n: AnyNode) => $(n).is('img') || ($(n).is('p') && $(n).find('img').length > 0 && !clean($(n).text()));
const isText = ($: cheerio.CheerioAPI, n: AnyNode) => !$(n).is(`${WIDE}, ${SIDE}, .btn-row`) && !isImg($, n) && !$(n).find('form, table').length;

interface Layout {
  // A card used once on the page, beside the first section that is only text.
  fallback?: { html: string; used?: boolean };
  // The panel beside a form.
  formSide?: string;
}

// Decides how one section fills the container: text plus a side element, or a centred reading column, or text in two columns above a full-width block.
function arrange($: cheerio.CheerioAPI, nodes: AnyNode[], head: string, opts: Layout) {
  const html = (ns: AnyNode[]) => ns.map((n) => $.html(n)).join('');
  const g = blocks($, nodes);
  const formAt = g.findIndex((n) => $(n).is('form') || $(n).find('form').length > 0);
  if (formAt >= 0 && opts.formSide) {
    // The note under the form stays with it.
    let end = formAt + 1;
    while (g[end] && $(g[end]).is('p')) end += 1;
    return { cls: '', inner: `<div class="split form-split"><div class="split-main">${head}${html(g.slice(0, end))}</div><aside class="split-side sticky">${opts.formSide}</aside></div>${g.length > end ? arrangeRest($, g.slice(end)) : ''}` };
  }
  const wides = g.filter((n) => $(n).is(WIDE));
  const sides = g.filter((n) => $(n).is(SIDE));
  const imgs = g.filter((n) => isImg($, n));
  const btns = g.filter((n) => $(n).is('.btn-row'));
  const textWords = words(g.filter((n) => isText($, n)).map((n) => $(n).text()).join(' ')) + words(cheerio.load(head, null, false)('.intro').text());
  const fixedWide = wides.some((n) => $(n).is('.faq, .tbl-wrap, form, details'));
  const aside: string[] = [];
  const taken = new Set<AnyNode>();
  const take = (ns: AnyNode[], wrap = (s: string) => s) => { ns.forEach((n) => taken.add(n)); aside.push(wrap(html(ns))); };
  if (!fixedWide) {
    // A short titled block at the end moves to the side as a card, with any chips that follow it.
    const lastH3 = g.map((n) => $(n).is('h3')).lastIndexOf(true);
    if (!wides.length && lastH3 > 0 && textWords >= 50) {
      const tail = g.slice(lastH3);
      if (words(tail.map((n) => $(n).text()).join(' ')) <= 80 && tail.every((n) => isText($, n) || $(n).is(SIDE))) take(tail, (s) => `<div class="card side-card">${s}</div>`);
    }
    // Beside a big grid there is no room, so chips and badges stay in the text flow.
    const bigWide = wides.some((n) => $(n).children().length > 6 || words($(n).text()) > 170);
    for (const n of sides) if (!taken.has(n) && (wides.length === 0 || (!bigWide && $(n).is('.line-card, .status-panel')))) take([n]);
    if (imgs.length === 1 && textWords >= 30 && textWords <= 300 && !bigWide) take(imgs);
    if (wides.length === 1 && textWords >= 40 && !imgs.length && !aside.length) {
      const w = $(wides[0]);
      const count = w.children().length;
      if (count <= 6 && words(w.text()) <= 170) { take(wides, (s) => `<div class="side-stack">${s}</div>`); }
    }
    if (!wides.length && !aside.length && btns.length === 1 && textWords < 120) take(btns, (s) => `<div class="card side-card side-cta">${s}</div>`);
    if (!wides.length && !aside.length && !imgs.length && opts.fallback && !opts.fallback.used && textWords >= 40 && textWords <= 250) {
      opts.fallback.used = true;
      aside.push(opts.fallback.html);
    }
  }
  if (aside.length) {
    const main = g.filter((n) => !taken.has(n));
    return { cls: '', inner: `<div class="split"><div class="split-main">${head}${html(main)}</div><aside class="split-side">${aside.join('')}</aside></div>` };
  }
  if (!wides.length && !imgs.length) return { cls: ' read', inner: `${head}${html(g)}` };
  return { cls: '', inner: `${head}${arrangeRest($, g)}` };
}

// Long text beside nothing runs in two columns, so it uses the full width above the block below it.
function arrangeRest($: cheerio.CheerioAPI, g: AnyNode[]) {
  let out = '';
  let run: AnyNode[] = [];
  let pending = '';
  const settle = (act = '') => {
    if (pending) out += act ? pending.replace('</div><!--act--></div>', `</div><div class="act">${act}</div></div>`) : pending.replace('<!--act-->', '');
    pending = '';
  };
  const flush = () => {
    if (!run.length) return;
    settle();
    const body = run.map((n) => $.html(n)).join('');
    const count = words(run.map((n) => $(n).text()).join(' '));
    if (count >= 30) {
      // The heading stays above both columns.
      const lead = $(run[0]).is('h3, h4, h5') ? run.shift()! : null;
      out += `${lead ? $.html(lead) : ''}<div class="text-cols">${run.map((n) => $.html(n)).join('')}</div>`;
    }
    else if (out || run.length >= 2 || run.some((n) => $(n).is('h3, h4, h5'))) pending = `<div class="callout"><div>${body}</div><!--act--></div>`;
    else out += count >= 15 ? `<div class="text-cols">${body}</div>` : body;
    run = [];
  };
  for (const n of g) {
    if ($(n).is('h3, h4, h5') && run.length) flush();
    if ($(n).is('p, ul, ol, h3, h4, h5, h6, blockquote') && !$(n).is(WIDE) && !isImg($, n) && clean($(n).text())) run.push(n);
    else if (!clean($(n).text()) && !$(n).find('img').length && !$(n).is('form, table')) out += $.html(n);
    else { flush(); if (pending && $(n).is('.btn-row') && $(n).children().length <= 2) settle($(n).html() ?? ''); else { settle(); out += $.html(n); } }
  }
  flush();
  settle();
  return out;
}

// Forms: every label and control is a field. Fields sit side by side; one column on phones.
function forms($: cheerio.CheerioAPI) {
  $('form[data-form]').each((_, f) => {
    const form = $(f);
    const name = form.attr('data-form');
    const groups: { heading: string; fields: string[] }[] = [{ heading: '', fields: [] }];
    let platform = '';
    const fieldOf = (l: AnyNode) => {
      const label = $(l);
      let control = label.nextAll('input, select, textarea').first();
      if (!control.length) control = label.next('div').find('input, select, textarea').first();
      if (!control.length) return '';
      if (control.is('textarea')) control.attr('rows', '4');
      const wide = control.is('textarea');
      return `<div class="field${wide ? ' full' : ''}">${$.html(label)}${$.html(control)}</div>`;
    };
    form.children('div').each((__, d) => {
      const box = $(d);
      const heading = box.children('h3, h4, h5').first();
      if (heading.length) groups.push({ heading: $.html(heading), fields: [] });
      box.find('label').each((___, l) => {
        const field = fieldOf(l);
        if (!field) return;
        if (name === 'quote' && $(l).attr('for') === 'platform') platform = field;
        else groups[groups.length - 1].fields.push(field);
      });
    });
    if (platform) groups.find((x) => /service/i.test(x.heading))?.fields.unshift(platform);
    const grid = groups.filter((x) => x.heading || x.fields.length).map((x) => {
      const three = x.fields.length === 3 && !x.fields.some((v) => v.includes('full'));
      // A lone field at the end of a 2-column group takes the whole row.
      const fields = x.fields.map((v, i) => { const narrow = x.fields.filter((y) => !y.includes('field full')); return !three && !v.includes('field full') && narrow.length % 2 === 1 && v === narrow[narrow.length - 1] ? v.replace('class="field"', 'class="field full"') : (void i, v); });
      return `<div class="form-group">${x.heading}<div class="fields${three ? ' three' : ''}">${fields.join('')}</div></div>`;
    }).join('');
    // The submit button and the note under it stay last.
    const tail = form.find('button, p').toArray().filter((e) => !$(e).closest('.field').length).map((e) => $.html(e)).join('');
    form.children(':not(input)').remove();
    form.append(grid + tail);
  });
}

export function polish(html: string, { sections = true, start = 0, layout = {} as Layout } = {}) {
  const $ = cheerio.load(html, null, false);
  if (sections) flatten($);
  tables($);
  buttons($);
  forms($);
  $('details').each((_, d) => { if (!$(d).closest('form, .toc-m').length) $(d).addClass('qa').find('summary').first().append(icon('plus')); });
  faqs($);
  numbered($);
  lines($, sections);
  cards($);
  labels($);
  if (sections) lists($);
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
    const { cls, inner } = arrange($, g, head, layout);
    out += `<section class="sec${count % 2 ? ' alt' : ''}${cls}"><div class="wrap"><div class="prose">${inner}</div></div></section>`;
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

// The small card on the right of an inner-page hero: a key fact, then what comes with it.
export const factCard = (title: string, items: string[]) => `<div class="card fact-card"><p class="fact-title">${title}</p>${items.length ? `<ul class="check-list">${items.map((t) => `<li>${tick}<span>${t}</span></li>`).join('')}</ul>` : ''}</div>`;
