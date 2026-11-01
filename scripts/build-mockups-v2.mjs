// Builds the homepage mockup to DESIGN-QA.md: one design, a light and a dark theme. Prices come from prices.json, and the
// old homepage text from the current build in dist/, so nothing here is retyped. New short labels are listed in DRAFT_LABELS.
// Usage: build the site first, then node scripts/build-mockups-v2.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const prices = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));
const explain = JSON.parse(readFileSync('src/data/features.json', 'utf8')).explain;
const dir = 'mockups/v2/';
const logos = JSON.parse(readFileSync(`${dir}platform-logos.json`, 'utf8'));
const money = (n) => `$${n.toLocaleString('en-US')}`;
const ic = (d, cls = '') => `<svg class="ic${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
// Lucide icons
const P = {
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  pulse: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  move: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  tag: '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z"/><path d="M7 7h.01"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
};
const I = Object.fromEntries(Object.entries(P).map(([k, d]) => [k, ic(d)]));
const badge = (name, c) => `<span class="badge${c ? ` c${c}` : ''}">${I[name]}</span>`;
const tick = `<span class="tick">${I.check}</span>`;
const nope = `<span class="tick no">${I.x}</span>`;

// Short labels added for the design rules. The owner reviews these.
const DRAFT_LABELS = { included: "What's included", pricing: 'Pricing', how: 'How it works', report: 'Monthly report', compare: 'Compare', ours: 'Our services', us: 'Why us', where: 'Where we work', faq: 'FAQ', compareIntro: 'What you get from each option, side by side.', faqIntro: 'Answers to the questions we hear most.' };
const EXPERT_DRAFT = 'A Dhaka-based team of WordPress developers who work your business hours and explain every change in plain words.';

// Old homepage text, from the build.
const $ = cheerio.load(readFileSync('dist/index.html', 'utf8'));
const pub = (s) => s.replace(/\/wp-content\//g, '/public/wp-content/');
const inner = (e) => $(e).html().trim();
const txt = (e) => $(e).text().replace(/\s+/g, ' ').trim();
const blocks = $('.home-section').children('.prose').toArray();
const block = (re) => {
  const b = blocks.find((x) => re.test($(x).find('h2').first().text()));
  if (!b) throw new Error(`section not found: ${re}`);
  return $(b);
};
const more = (re) => {
  const d = $('details.more').toArray().find((x) => re.test($(x).find('summary').text()));
  if (!d) throw new Error(`details not found: ${re}`);
  return $(d);
};
const pOf = (b, re) => {
  const p = b.children('p').toArray().find((x) => re.test(txt(x)));
  if (!p) throw new Error(`paragraph not found: ${re}`);
  return p;
};
const hrefOf = (p) => $(p).find('a').attr('href');
const linkBtns = (p, cls = ['primary', 'ghost']) => $(p).find('a').toArray().map((a, i) => `<a class="btn ${cls[i] ?? 'ghost'}" href="${$(a).attr('href')}">${inner(a)}${i === 0 ? I.arrow : ''}</a>`).join('');
// Gradient on the key word of a heading.
const hl = (text, word) => (word && text.includes(word) ? text.replace(word, `<span class="hl">${word}</span>`) : text);
const head = (eyebrow, h2, intro = [], word = '') => `<div class="head fade"><p class="eyebrow">${eyebrow}</p><h2>${hl(h2, word)}</h2>${[intro].flat().filter(Boolean).map((p) => `<p class="intro">${p}</p>`).join('')}</div>`;
// Sections alternate backgrounds on their own.
let secCount = 0;
const sec = (id, html) => `<section class="sec${secCount++ % 2 ? ' alt' : ''}" data-sec="${id}"><div class="wrap">${html}</div></section>`;

const intro = $(blocks[0]);
const introP = intro.children('p').toArray().filter((p) => txt(p));
if (!/^Trusted by/.test(txt(introP[0])) || !/^Security & Backups/.test(txt(introP[2]))) throw new Error('intro changed');

const care = more(/^Everything We Take Care Of/);
const pro = more(/^What.s Included in Professional/);
const started = more(/^How Do I Get Started/);
const proDiv = pro.children('.prose');
const startedDiv = started.children('.prose');
const careDiv = care.children('.prose');
const explore = block(/^Explore Our/);
const why = block(/^Why Website Maintenance Matters/);
const partner = block(/^Your Dedicated/);
const ours = block(/^Our Website Maintenance Services/);
const oneplace = block(/^Everything Your Website Needs/);
const results = block(/^Real Maintenance Results/);
const guides = block(/^Website Maintenance Guides/);
const choose = block(/^Why Choose Us/);
const countries = block(/^Countries We Serve/);
const trusted = block(/^Trusted & Rated/);

// Example visuals. Not real client data; each one carries the Example label.
const uptimeBars = Array.from({ length: 30 }, (_, i) => `<rect x="${i * 14}" y="0" width="10" height="48" rx="3" fill="${i === 17 ? 'var(--line-strong)' : 'var(--ok)'}"/>`).join('');
const dashboard = `<div class="dash-wrap">
  <div class="dash" role="img" aria-label="Example maintenance dashboard. Not real client data.">
    <div class="dash-top"><span class="dots"><i></i><i></i><i></i></span><span>yourwebsite.com</span><span class="tag">Example</span></div>
    <div class="dash-body">
      <div class="panel"><b><i class="pulse"></i>Site is up</b><svg class="uptime" viewBox="0 0 416 48" aria-hidden="true">${uptimeBars}</svg><div class="uptime-scale"><span>Uptime, last 30 days</span><span>Today</span></div></div>
      <div class="tiles"><div class="tile-s">${I.refresh}<span>Updates</span><b>14 applied</b></div><div class="tile-s">${I.db}<span>Last backup</span><b>Finished</b></div><div class="tile-s">${I.shield}<span>Security scan</span><b>Clean</b></div></div>
      <div class="panel"><ul class="log"><li>${tick}<span>Plugins and theme updated</span><span>Today</span></li><li>${tick}<span>Backup finished</span><span>Today</span></li><li>${tick}<span>Malware scan: clean</span><span>Yesterday</span></li></ul></div>
    </div>
  </div>
  <div class="float f1" aria-hidden="true">${I.check}Backup finished</div>
  <div class="float f2" aria-hidden="true">${I.shield}Malware scan: clean</div>
  <div class="float f3" aria-hidden="true">${I.refresh}Plugins updated</div>
</div>`;

// What's included: the old 6 cards with a mini visual each, then the short list. One section instead of three.
const proCards = proDiv.find('.card').toArray().map((c) => ({ h: inner($(c).find('h3')), p: inner($(c).find('p')) }));
if (proCards.length !== 6) throw new Error('included cards changed');
const MINI = [
  `<div class="scan">${I.shield}<div><b>Clean</b>Malware scan</div></div>`,
  '<ul class="rows"><li>WordPress core<em>Updated</em></li><li>Contact form plugin<em>Updated</em></li><li>Theme<em>Updated</em></li></ul>',
  `<div class="cal">${'<i></i>'.repeat(30)}</div>`,
  '<svg class="gauge" viewBox="0 0 120 68"><path d="M10 60a50 50 0 0 1 100 0" fill="none" stroke="var(--line)" stroke-width="12" stroke-linecap="round"/><path d="M10 60a50 50 0 0 1 84-36" fill="none" stroke="var(--c)" stroke-width="12" stroke-linecap="round"/><path d="m60 60 22-24" stroke="var(--head)" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--head)"/></svg>',
  `<div class="bars">${[62, 74, 58, 80, 68, 88, 72, 92, 66, 84, 76, 95].map((h) => `<i style="height:${h}%"></i>`).join('')}</div>`,
  '<div class="bubble">Can you change the opening hours on the contact page?</div><div class="bubble me">Done. Please take a look.</div>',
];
const BENTO_ICONS = ['shield', 'refresh', 'db', 'gauge', 'pulse', 'chat'];
const SIZES = ['w6', 'w6', 'w4', 'w4', 'w4', 'w12'];
const bento = `<div class="bento">${proCards.map((c, i) => {
  const text = `<div class="badge">${I[BENTO_ICONS[i]]}</div><h3>${c.h}</h3><p class="card-text">${c.p}</p>`;
  return `<article class="card cell ${SIZES[i]} c${i + 1} fade">${SIZES[i] === 'w12' ? `<div>${text}</div>` : text}<div class="mini" aria-hidden="true">${MINI[i]}</div></article>`;
}).join('')}</div>`;

const proPs = proDiv.children('p').toArray();
const proLink = proPs.find((p) => $(p).find('a').length && txt($(p).find('a')) === txt(p));
const careLines = careDiv.children('p').toArray().map(txt);
const CARE_ICONS = ['shield', 'refresh', 'db', 'gauge', 'search', 'pulse'];
const includedHtml = head(DRAFT_LABELS.included, txt(pro.find('summary')), inner(proPs[0]), 'Professional')
  + bento
  + `<div class="callout fade"><div><p>${inner(proPs[1])}</p><p>${txt(proPs[3])}</p></div><div class="act"><a class="btn primary" href="${hrefOf(proLink)}">${txt(proLink)}${I.arrow}</a></div></div>`
  + `<div class="sub-head fade"><h3>${txt(care.find('summary'))}</h3></div>
  <div class="grid g3">${careDiv.find('.card').toArray().map((c, i) => `<div class="card tile fade">${badge(CARE_ICONS[i], i + 1)}<div><strong>${inner($(c).find('strong'))}</strong><span>${inner($(c).find('.pair span'))}</span></div></div>`).join('')}</div>
  <div class="callout fade"><div><p><strong>${careLines[0].replace(/\s*See full checklist.*/, '')}</strong></p></div><div class="act"><a class="btn ghost" href="/website-maintenance-checklist/">See full checklist →</a></div></div>`;

// Pricing
const planCard = (p) => `<article class="card plan fade${p.popular ? ' pop' : ''}">
    ${p.popular ? '<span class="pop-tag">Most popular</span>' : ''}
    <h3>${p.name}</h3>
    <div class="price"><b data-m="${money(p.monthly)}" data-y="${money(p.annual)}">${money(p.monthly)}</b><span data-m="/month" data-y="/year">/month</span></div>
    <p class="note" data-m="${prices.firstMonthNote.en}" data-y="${prices.annualNote.en}">${prices.firstMonthNote.en}</p>
    <a class="btn ${p.popular ? 'primary' : 'ghost'}" href="/get-a-free-quote/#${p.name.toLowerCase()}">Choose ${p.name}${I.arrow}</a>
    <ul class="feat">${p.includes.map((f) => `<li>${tick}<span${explain[f] ? ` title="${explain[f]}"` : ''}>${f}</span></li>`).join('')}</ul>
  </article>`;
const [low, , high] = prices.plans.map((p) => p.monthly);
const extra = $('.faq').nextAll('.prose').first();
const everyItems = extra.children('.card').toArray().map(txt);
const EVERY_ICONS = ['shield', 'refresh', 'db', 'pulse', 'pen'];
const pricingHtml = head(DRAFT_LABELS.pricing, 'Plans and pricing', 'Every price is on this page.', 'pricing')
  + `<div class="toggle-row"><div class="toggle" role="group" aria-label="Billing period"><button type="button" data-period="m" aria-pressed="true">Monthly</button><button type="button" data-period="y" aria-pressed="false">Annual</button></div><span class="save">${prices.annualNote.en}</span></div>
  <div class="grid g3">${prices.plans.map(planCard).join('')}</div>
  <div class="sub-head fade"><h3>${inner(extra.find('h3').first())}</h3></div>
  <div class="every">${everyItems.map((t, i) => `<div class="card tile fade">${badge(EVERY_ICONS[i], i + 1)}<strong>${t}</strong></div>`).join('')}</div>
  <div class="callout fade"><div><p><strong>No contract. Cancel anytime.</strong></p></div><div class="act"><a class="btn ghost" href="/monthly-website-maintenance-packages/">Compare all features</a><a class="btn ghost" href="/ecommerce-website-maintenance-packages/">Running an online store? Store plans from $199</a></div></div>`;

// Process: the old 5 steps, numbers and connecting line like the live site, each step a card with an icon.
const STEP_ICONS = ['tag', 'chat', 'file', 'key', 'search'];
const stepCards = startedDiv.find('.card').toArray();
if (stepCards.length !== 5) throw new Error('steps changed');
const processHtml = head(DRAFT_LABELS.how, txt(started.find('summary')), inner(startedDiv.children('p').first()), 'Get Started')
  + `<ol class="steps">${stepCards.map((c, i) => `<li class="fade"><div class="num" aria-hidden="true">${txt($(c).find('p').first())}</div><article class="card">${badge(STEP_ICONS[i], i + 1)}<h3 style="margin-top:var(--s2)">${inner($(c).find('h3'))}</h3><p class="card-text">${inner($(c).find('p').last())}</p></article></li>`).join('')}</ol>
  <div class="btn-row row-end">${linkBtns(startedDiv.children('p').last())}</div>`;

const reportHtml = head(DRAFT_LABELS.report, 'What a monthly report looks like', 'An example of the numbers you would see. It is not real client data.', 'monthly report')
  + `<div class="card report fade">
    <div class="report-top"><span>Monthly report, yourwebsite.com</span><span class="tag">Example</span></div>
    <div class="grid g4 metrics"><div class="metric"><span>Updates applied</span><b>14</b></div><div class="metric"><span>Backups completed</span><b>30</b></div><div class="metric"><span>Malware found</span><b>0</b></div><div class="metric"><span>Edit time used</span><b>1h 40m</b></div></div>
  </div>
  <p class="line-a1 fade">30+ websites built and maintained for businesses in Canada, the UK, the Caribbean and Bangladesh.</p>
  <div class="todo fade">Mockup note: the portfolio block goes here once the owner confirms the table.</div>`;

const compareHtml = head(DRAFT_LABELS.compare, 'How we compare', DRAFT_LABELS.compareIntro, 'compare')
  + `<div class="grid g3">
    <article class="card vs us fade"><h3>WMS</h3><dl><div><dt>Price per month</dt><dd>${money(low)}–${money(high)}</dd></div><div><dt>Contract</dt><dd>None. Cancel anytime.</dd></div><div><dt>Monthly report</dt><dd>Growth and Business</dd></div></dl><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${I.arrow}</a></article>
    <article class="card vs fade"><h3>Freelancer</h3><dl><div><dt>Price per month</dt><dd>$50–$150</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
    <article class="card vs fade"><h3>Typical agency</h3><dl><div><dt>Price per month</dt><dd>$149–$600+</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
  </div>`;

const SVC_ICONS = { 'Website Design': 'layout', 'Website Migration': 'move', 'Website Redesign': 'pen', 'Website Repair': 'wrench', 'Website SEO': 'search', 'Speed Optimization': 'gauge', 'Website Updates': 'refresh', 'White-Label Maintenance': 'tag', 'WordPress Backups': 'db', 'Malware Removal': 'shield' };
const exploreHtml = head(careLines[1], inner(explore.find('h2')), inner(explore.children('p').first()), 'Website Services')
  + `<div class="grid g2">${explore.find('.card').toArray().map((c, i) => {
    const title = txt($(c).find('h3'));
    const body = txt($(c).find('p')).replace(/\s*Explore service$/, '');
    return `<a class="card svc fade" href="${$(c).find('a').attr('href')}">${badge(SVC_ICONS[title] ?? 'wrench', (i % 6) + 1)}<div><h3>${title}</h3><p>${body}</p><span class="go">Explore service ${I.arrow}</span></div></a>`;
  }).join('')}</div>
  <div class="callout fade"><div><p>${inner(pOf(explore, /^Not sure/))}</p></div></div>`;

const whyHead = why.find('thead th').toArray().map(inner);
const whyRows = why.find('tbody tr').toArray().map((r) => {
  const c = $(r).find('td').toArray().map(inner);
  return `<tr><td>${c[0]}</td><td><div class="cell-in"><span class="lbl">${whyHead[1]}</span>${nope}<span>${c[1]}</span></div></td><td><div class="cell-in"><span class="lbl">${whyHead[2]}</span>${tick}<span>${c[2]}</span></div></td></tr>`;
}).join('');
const [before, after] = extra.find('.cards .card').toArray();
const listOf = (c, icon) => $(c).find('li').toArray().map((l) => `<li>${icon}<span>${inner(l)}</span></li>`).join('');
const whyHtml = head(txt(pOf(explore, /^Website Maintenance Explained/)), inner(why.find('h2')), inner(why.children('p').first()), 'Matters')
  + `<div class="sub-head fade" style="margin-top:0"><h3>${inner(why.find('h3').first())}</h3></div>
  <div class="fade"><table class="tbl"><thead><tr>${why.find('thead th').toArray().map((h) => `<th scope="col">${inner(h)}</th>`).join('')}</tr></thead><tbody>${whyRows}</tbody></table></div>
  <div class="callout fade"><div><p>${inner(pOf(why, /^Bottom line/))}</p><p>${txt(pOf(why, /^See exactly/))}</p></div><div class="act"><a class="btn primary" href="${hrefOf(pOf(why, /^Get the Free/))}">${txt(pOf(why, /^Get the Free/))}${I.arrow}</a></div></div>
  <div class="grid g2" style="margin-top:var(--s3)"><div class="card fade"><h3>${inner($(before).find('h3'))}</h3><ul class="ba-list">${listOf(before, nope)}</ul></div><div class="card fade"><h3>${inner($(after).find('h3'))}</h3><ul class="ba-list">${listOf(after, tick)}</ul></div></div>`;

const partnerHtml = head(txt(pOf(why, /^Who We Are$/)), inner(partner.find('h2')), inner(partner.children('p').first()), 'Partner')
  + `<div class="grid g2">${partner.find('li').toArray().map((l, i) => `<div class="card tile fade">${badge(['shield', 'db', 'gauge', 'file'][i], i + 1)}<strong>${inner(l)}</strong></div>`).join('')}</div>
  <div class="btn-row row-end">${linkBtns(partner.children('p').last())}</div>`;

const placeItems = [...new Set(oneplace.find('li').toArray().map(txt))];
const PLACE_ICONS = { 'Hosting Services': 'server', 'Content Creation': 'pen', SEO: 'search', 'Website Updates': 'refresh', 'Backup Services': 'db', WordPress: 'layout' };
const oursHtml = head(DRAFT_LABELS.ours, inner(ours.find('h2')), inner(ours.children('p').first()), 'Services')
  + `<div class="grid g4">${ours.find('.card').toArray().map((c) => {
    const img = $(c).find('img');
    const ps = $(c).find('p').toArray();
    return `<article class="card svc-img fade"><img src="${pub(img.attr('src'))}" alt="${img.attr('alt')}" width="${img.attr('width')}" height="${img.attr('height')}" loading="lazy"><div><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[0])}</p><div class="btn-wrap"><a class="btn ghost" href="${hrefOf(ps[1])}">${inner($(ps[1]).find('a'))}${I.arrow}</a></div></div></article>`;
  }).join('')}</div>
  <div class="sub-head fade"><h3>${inner(oneplace.find('h2'))}</h3><p>${inner(oneplace.children('p').first())}</p></div>
  <div class="grid g3 two-m">${placeItems.map((t, i) => `<div class="card tile fade">${badge(PLACE_ICONS[t] ?? 'check', i + 1)}<strong>${t}</strong></div>`).join('')}</div>`;

// Case study: problem and work done, no numbers (DESIGN-QA.md section 5).
const caseTags = ['Healthcare', 'WordPress', 'USA', 'Monthly Maintenance'];
if (txt(pOf(results, /^Healthcare WordPress USA/)) !== caseTags.join(' ')) throw new Error('case study tags changed');
const caseRows = results.find('.card').toArray().map((c) => `<div class="case-row"><strong>${inner($(c).find('p').first())}</strong><div><s>${inner($(c).find('.pair strong'))}</s>${I.arrow}<span>${inner($(c).find('.pair span'))}</span></div></div>`).join('');
const resultsHtml = head(txt(pOf(oneplace, /^Real Results$/)), inner(results.find('h2')), inner(results.children('p').first()), 'Results')
  + `<article class="card case fade"><div><span class="tag" style="display:inline-block;margin:0 0 var(--s2)">${txt(pOf(results, /^Case Study$/))}</span><h3>${inner(results.find('h3').first())}</h3><ul class="chips">${caseTags.map((t) => `<li>${t}</li>`).join('')}</ul><p class="body">${inner(pOf(results, /^This mental-health/))}</p><div class="btn-row">${linkBtns(pOf(results, /^Read the Full Case Study/))}</div></div><div class="case-panel">${caseRows}</div></article>`;

const guidesHtml = head(txt(pOf(results, /^Guides & Resources$/)), inner(guides.find('h2')), inner(guides.children('p').first()), 'Guides')
  + `<div class="grid g3">${guides.find('.card').toArray().map((c) => {
    const ps = $(c).find('p').toArray();
    return `<article class="card guide fade"><p class="tag">${inner(ps[0])}</p><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[1])}</p><a class="btn ghost" href="${hrefOf(ps[2])}">${inner($(ps[2]).find('a'))}</a></article>`;
  }).join('')}</div>
  <div class="btn-row row-end">${linkBtns(guides.children('p').last(), ['primary'])}</div>`;

const chooseH3 = choose.find('h3').toArray();
const CHOOSE_ICONS = ['users', 'shield', 'file'];
const VALUE_ICONS = ['file', 'pulse', 'tag', 'users'];
const values = trusted.find('strong').toArray().map((b, i) => `<div class="card tile fade">${badge(VALUE_ICONS[i] ?? 'check', i + 1)}<div><strong>${inner(b)}</strong><span>${txt($(b).parent()).slice(txt(b).length).trim()}</span></div></div>`).join('');
const chooseHtml = head(DRAFT_LABELS.us, inner(choose.find('h2')), inner(choose.children('p').first()), 'Choose Us')
  + `<div class="grid g3">${chooseH3.map((h, i) => {
    const next = $(h).next('p');
    return `<article class="card c${i + 1} fade"><div class="badge">${I[CHOOSE_ICONS[i]]}</div><h3>${inner(h)}</h3><p>${next.length ? inner(next) : EXPERT_DRAFT}</p></article>`;
  }).join('')}</div>
  <div class="grid g4" style="margin-top:var(--s3)">${values}</div>
  <div class="btn-row row-end">${linkBtns(choose.children('p').last(), ['primary'])}</div>`;

const countriesHtml = head(DRAFT_LABELS.where, inner(countries.find('h2')), inner(countries.children('p').first()), 'Serve')
  + `<div class="grid g5">${countries.find('a').toArray().map((a, i) => `<a class="card country fade" href="${$(a).attr('href')}"><span class="badge c${(i % 6) + 1}">${I.pin}</span>${inner(a)}</a>`).join('')}</div>`;

const faqs = $('.faq details').toArray().map((d) => `<details><summary><span>${$(d).find('summary').text()}</span>${I.plus}</summary><p>${$(d).find('p').html()}</p></details>`);
if (faqs.length < 10) throw new Error('FAQ not found in dist/');
const faqHtml = head(DRAFT_LABELS.faq, txt($('.faq').parent().find('.head h2')), DRAFT_LABELS.faqIntro, 'FAQs') + `<div class="faq fade">${faqs.join('')}</div>`;

const finalProse = cheerio.load($('.cta-final .prose').html() ?? '', null, false);
const finalLinks = finalProse('a').toArray().map((a, i) => `<a class="btn ${i === 0 ? 'white' : 'ghost'}" href="${finalProse(a).attr('href')}">${finalProse(a).text()}</a>`);
finalProse('a').each((_, a) => { const p = finalProse(a).closest('p'); finalProse(a).remove(); if (p.length && !p.text().trim()) p.remove(); });

// Header and footer links come from the build.
const f$ = $('footer').first();
const footCols = f$.find('.foot-grid > div').slice(1).toArray().map((c) => ({ h: txt($(c).find('h3').first()), links: $(c).find('li').toArray().map((l) => inner(l)) }));
// Owner's badges, images and links as on the live site. ITFirms is out.
const BADGE_KEEP = /clutch|goodfirms|sortlist|techreviewer|c2creview|trustpilot|agencyspotter/;
const seenBadge = new Set();
const badgeLinks = trusted.find('a').toArray().filter((a) => BADGE_KEEP.test($(a).attr('href')) && !seenBadge.has($(a).attr('href')) && seenBadge.add($(a).attr('href')));
if (badgeLinks.length !== 7) throw new Error(`expected 7 badges, found ${badgeLinks.length}`);
const badgeRow = badgeLinks.map((a) => { const img = $(a).find('img'); return `<li><a href="${$(a).attr('href')}" rel="noopener"><img src="${pub(img.attr('src'))}" alt="${img.attr('alt')}" width="${img.attr('width')}" height="${img.attr('height')}" loading="lazy"></a></li>`; }).join('');
const help = footCols.find((c) => /Help/.test(c.h));
const legal = help.links.filter((l) => /agreement|privacy|terms|refund|cookie/i.test(l));
const helpOnly = help.links.filter((l) => !legal.includes(l));
const cols = [footCols[0], footCols[1], { h: 'Help', links: helpOnly }, { h: 'Trust', links: legal }];
const footer = `<footer class="foot" data-sec="footer"><div class="wrap">
  <div class="foot-top">
    <div class="foot-brand"><img src="/public/wp-content/uploads/2025/11/Colorful-Website-Maintenance-services-Logo.png" alt="WMS logo" width="325" height="108" loading="lazy"><p>Dhaka-based team, working US &amp; UK business hours.<br>No contract. Cancel anytime.</p><p><a href="mailto:contact@websitemaintenanceservices.org">contact@websitemaintenanceservices.org</a><br><a href="https://wa.me/8801815840813">+8801815840813</a></p></div>
    <div class="foot-cols">${cols.map((c) => `<div><h2>${c.h}</h2><ul>${c.links.map((l) => `<li>${l}</li>`).join('')}</ul></div>`).join('')}</div>
  </div>
  <div class="foot-find"><h2>Find us on</h2><ul>${badgeRow}</ul></div>
  <div class="foot-bottom"><span>© 2026 WMS. websitemaintenanceservices.org</span><button type="button" id="cookie-settings">Cookie settings</button></div>
</div></footer>`;

const serviceLinks = $('header details.nav-drop li').toArray().map((l) => inner(l));
const NAV = [['/monthly-website-maintenance-packages/', 'Pricing'], ['/blogs/', 'Blog'], ['/about-us/', 'About'], ['/contact/', 'Contact']];
const QUOTE = '/get-a-free-quote/';
const themeBtn = (id) => `<button class="theme" id="${id}" type="button" aria-label="Switch between light and dark theme">${ic(P.sun, 'sun')}${ic(P.moon, 'moon')}</button>`;
const header = `<header class="top"><div class="wrap">
  <a class="logo" href="/" aria-label="Home"><img src="/public/wp-content/uploads/2025/11/Colorful-Website-Maintenance-services-Logo.png" alt="Website Maintenance Services" width="325" height="108"></a>
  <nav class="nav" aria-label="Main">
    <details class="drop"><summary>Services${I.down}</summary><ul>${serviceLinks.map((l) => `<li>${l}</li>`).join('')}</ul></details>
    ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
    ${themeBtn('theme')}
    <a class="btn primary" href="${QUOTE}">Get a free quote</a>
  </nav>
  <a class="btn primary cta-m" href="${QUOTE}">Get a free quote</a>
  <button class="burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mnav">${ic(P.menu, 'open')}${ic(P.x, 'close')}</button>
</div></header>
<nav class="mnav" id="mnav" aria-label="Mobile">
  <details open><summary>Services${I.down}</summary>${serviceLinks.join('')}</details>
  ${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}
  <div class="theme-row"><span>Theme</span>${themeBtn('theme-m')}</div>
  <a class="btn primary" href="${QUOTE}">Get a free quote</a>
</nav>`;

const css = readFileSync(`${dir}design.css`, 'utf8');
const dark = /\/\*dark\*\/([\s\S]*?)\/\*end\*\//.exec(css)[1];
const noJsDark = `@media (prefers-color-scheme: dark) { ${dark.replace(':root[data-theme="dark"]', ':root:not([data-theme])')} }`;

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Homepage mockup</title>
<meta name="description" content="Design mockup for owner review. Not the live site.">
<meta name="robots" content="noindex, nofollow">
<script>(function(){var t;try{t=localStorage.getItem('wms-theme')}catch(e){}if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=document.documentElement;r.setAttribute('data-theme',t);r.classList.add('js')})()</script>
<link rel="preload" href="/public/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>${css}${noJsDark}</style>
</head><body>
${header}
<main>
<section class="hero" data-sec="hero"><div class="wrap">
  <h1>Website <span class="hl">Maintenance</span> Services &amp; Support</h1>
  <div class="hero-grid">
    <div>
      <p class="sub">Your site kept fast, secure and up to date, by engineers who show you what they did.</p>
      <ul class="chips offer"><li>Plans from ${money(low)}/mo</li><li>First month free</li><li>Free hosting for 1 year</li><li>No contract</li></ul>
      <div class="btn-row"><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${I.arrow}</a><a class="btn ghost" href="/free-website-maintenance-audit/">Get a free website check</a></div>
      <ul class="facts"><li>${tick}Dhaka-based team</li><li>${tick}US &amp; UK hours</li><li>${tick}30+ websites maintained</li></ul>
    </div>
    <div>${dashboard}<p class="dash-note">Example dashboard. It is not real client data.</p></div>
  </div>
</div></section>

<section class="strip platforms" data-sec="platforms" aria-label="Platforms we support"><div class="wrap">
  <p>Platforms we support</p>
  <ul>${Object.entries(logos).map(([n, svg]) => `<li>${svg}${n === 'WooCommerce' ? `<span class="sr-only">${n}</span>` : n}</li>`).join('')}</ul>
</div></section>

<section class="strip lead" data-sec="lead"><div class="wrap">
  <div class="fade"><p class="eyebrow">${inner(introP[0])}</p><p class="big">${inner(introP[1])}</p></div>
  <div class="fade"><ul class="chips"><li>Security &amp; Backups</li><li>Updates &amp; Fixes</li><li>24/7 Support</li></ul><div class="btn-row">${linkBtns(introP[3])}</div></div>
</div></section>

${sec('included', includedHtml)}
${sec('pricing', pricingHtml)}
${sec('process', processHtml)}
${sec('report', reportHtml)}
${sec('compare', compareHtml)}
${sec('explore', exploreHtml)}
${sec('why', whyHtml)}
${sec('partner', partnerHtml)}
${sec('services', oursHtml)}
${sec('results', resultsHtml)}
${sec('guides', guidesHtml)}
${sec('choose', chooseHtml)}
${sec('countries', countriesHtml)}
${sec('faq', faqHtml)}
<section class="sec${secCount % 2 ? ' alt' : ''}" data-sec="final"><div class="wrap"><div class="final fade"><div>${finalProse.html()}</div><div class="act">${finalLinks.join('')}<p class="offer-line">Plans from ${money(low)}/mo · First month free · No contract</p></div></div></div></section>
</main>
${footer}
<div class="cookie" id="cookie"><span>We use cookies for analytics. <a href="/privacy-policy/">Privacy policy</a></span><button type="button">Accept</button><button type="button">Reject</button></div>
<script>
(function(){
var d=document,r=d.documentElement;
function flip(){var t=r.getAttribute('data-theme')==='dark'?'light':'dark';r.setAttribute('data-theme',t);try{localStorage.setItem('wms-theme',t)}catch(e){}}
d.getElementById('theme').addEventListener('click',flip);d.getElementById('theme-m').addEventListener('click',flip);
var b=d.getElementById('burger'),m=d.getElementById('mnav');
function menu(on){m.classList.toggle('on',on);b.setAttribute('aria-expanded',on);d.body.classList.toggle('menu-open',on);if(on){var f=m.querySelector('summary');if(f)f.focus()}}
b.addEventListener('click',function(){menu(b.getAttribute('aria-expanded')!=='true')});
d.addEventListener('keydown',function(e){
  if(e.key==='Escape'){if(m.classList.contains('on')){menu(false);b.focus()}d.querySelectorAll('.drop[open]').forEach(function(x){x.open=false})}
  if(e.key==='Tab'&&m.classList.contains('on')){var a=[b].concat([].slice.call(m.querySelectorAll('a,summary,button'))).filter(function(x){return x.offsetParent!==null}),l=a[a.length-1];if(e.shiftKey&&d.activeElement===b){e.preventDefault();l.focus()}else if(!e.shiftKey&&d.activeElement===l){e.preventDefault();b.focus()}}
});
d.addEventListener('click',function(e){d.querySelectorAll('.drop[open]').forEach(function(x){if(!x.contains(e.target))x.open=false})});
matchMedia('(min-width: 1081px)').addEventListener('change',function(e){if(e.matches)menu(false)});
d.querySelectorAll('#cookie button').forEach(function(x){x.addEventListener('click',function(){d.getElementById('cookie').hidden=true})});
var t=d.querySelectorAll('.toggle button');
t.forEach(function(x){x.addEventListener('click',function(){t.forEach(function(y){y.setAttribute('aria-pressed',y===x)});var k=x.dataset.period;d.querySelectorAll('[data-m]').forEach(function(e){e.textContent=e.dataset[k]})})});
if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});d.querySelectorAll('.fade').forEach(function(e){o.observe(e)})}else{d.querySelectorAll('.fade').forEach(function(e){e.classList.add('in')})}
})();
</script>
</body></html>`;
writeFileSync(`${dir}home.html`, page);

// Every old homepage line must still be on the page.
const squeeze = (s) => s.replace(/’/g, "'").replace(/[\s ]+/g, '').toLowerCase();
const m$ = cheerio.load(page);
const have = squeeze(`${m$('main').text()} ${m$('footer').text()}`);
const old = cheerio.load(readFileSync('dist/index.html', 'utf8'));
old('[class*="badges"] h2').remove();
const lines = [];
old('.home-section h2, .home-section h3, .home-section p, .home-section li, .home-section td, .home-section th, .faq summary, .faq p, details.more summary, details.more p, details.more li').each((_, e) => { const l = old(e).text().replace(/\s+/g, ' ').trim(); if (l) lines.push(l); });
const missing = [...new Set(lines)].filter((l) => !have.includes(squeeze(l)));
console.log(`built home.html; old lines checked ${new Set(lines).size}, missing ${missing.length}`);
for (const l of missing) console.log(`  MISSING: ${l.slice(0, 110)}`);
