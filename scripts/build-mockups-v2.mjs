// Builds the homepage mockup: one design, a light and a dark theme (CLAIMS-AND-DESIGN.md section B). Prices come from
// prices.json, and the old homepage text from the current build in dist/, so nothing here is retyped.
// Usage: build the site first, then node scripts/build-mockups-v2.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const prices = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));
const explain = JSON.parse(readFileSync('src/data/features.json', 'utf8')).explain;
const dir = 'mockups/v2/';
const logos = JSON.parse(readFileSync(`${dir}platform-logos.json`, 'utf8'));
const money = (n) => `$${n.toLocaleString('en-US')}`;
const ic = (d) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
// Lucide icons
const I = {
  shield: ic('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'),
  refresh: ic('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'),
  db: ic('<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>'),
  pulse: ic('<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>'),
  gauge: ic('<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>'),
  chat: ic('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  check: ic('<path d="M20 6 9 17l-5-5"/>'),
  x: ic('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  arrow: ic('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  plus: ic('<path d="M5 12h14"/><path d="M12 5v14"/>'),
  sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>').replace('class="ic"', 'class="ic sun"'),
  moon: ic('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>').replace('class="ic"', 'class="ic moon"'),
  wrench: ic('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
  search: ic('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  layout: ic('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'),
  move: ic('<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>'),
  pen: ic('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
  tag: ic('<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z"/><path d="M7 7h.01"/>'),
  pin: ic('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  users: ic('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  file: ic('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>'),
  server: ic('<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>'),
};

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
// A label at the end of an old section belongs above the next one.
const pOf = (b, re) => b.children('p').toArray().find((p) => re.test(txt(p)));
const linkBtns = (p, cls = ['primary', 'ghost']) => $(p).find('a').toArray().map((a, i) => `<a class="btn ${cls[i] ?? 'ghost'}" href="${$(a).attr('href')}">${inner(a)}${i === 0 ? I.arrow : ''}</a>`).join('');
const head = (b, kicker = '') => `<div class="head fade">${kicker ? `<p class="kicker">${kicker}</p>` : ''}<h2>${inner(b.find('h2').first())}</h2>${b.children('p').first().length ? `<p>${inner(b.children('p').first())}</p>` : ''}</div>`;

const paraOrBtn = (p) => ($(p).find('a').length && txt($(p).find('a')) === txt(p) ? `<div class="btn-row">${linkBtns(p, ['ghost'])}</div>` : `<p>${inner(p)}</p>`);

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

const CARE_ICONS = [I.shield, I.refresh, I.db, I.gauge, I.search, I.pulse];
const SVC_ICONS = { 'Website Design': I.layout, 'Website Migration': I.move, 'Website Redesign': I.pen, 'Website Repair': I.wrench, 'Website SEO': I.search, 'Speed Optimization': I.gauge, 'Website Updates': I.refresh, 'White-Label Maintenance': I.tag, 'WordPress Backups': I.db, 'Malware Removal': I.shield };

// Example visuals. Not real client data; each one carries the Example label.
const uptimeBars = Array.from({ length: 30 }, (_, i) => `<rect x="${i * 14}" y="0" width="10" height="48" rx="3" fill="${i === 17 ? 'var(--line-strong)' : 'var(--ok)'}"/>`).join('');
const dashboard = `<div class="dash-wrap">
  <div class="dash" role="img" aria-label="Example maintenance dashboard. Not real client data.">
    <div class="dash-top"><span class="dots"><i></i><i></i><i></i></span><span>yourwebsite.com</span><span class="tag">Example</span></div>
    <div class="dash-body">
      <div class="panel"><b><i class="pulse"></i>Site is up</b><svg class="uptime" viewBox="0 0 416 48" aria-hidden="true">${uptimeBars}</svg><div class="uptime-scale"><span>Uptime, last 30 days</span><span>Today</span></div></div>
      <div class="tiles"><div class="tile-s">${I.refresh}<span>Updates</span><b>14 applied</b></div><div class="tile-s">${I.db}<span>Last backup</span><b>Finished</b></div><div class="tile-s">${I.shield}<span>Security scan</span><b>Clean</b></div></div>
      <div class="panel"><ul class="log"><li>${I.check}Plugins and theme updated<span>Today</span></li><li>${I.check}Backup finished<span>Today</span></li><li>${I.check}Malware scan: clean<span>Yesterday</span></li></ul></div>
    </div>
  </div>
  <div class="float f1" aria-hidden="true">${I.check}Backup finished</div>
  <div class="float f2" aria-hidden="true">${I.shield}Malware scan: clean</div>
  <div class="float f3" aria-hidden="true">${I.refresh}Plugins updated</div>
</div>`;

const bento = `<div class="bento">
  <article class="card cell w6 c1 fade"><div class="badge">${I.refresh}</div><h3>Updates</h3><p>WordPress, plugins and themes kept current.</p>
    <div class="mini" aria-hidden="true"><ul class="rows"><li>WordPress core<em>Updated</em></li><li>Contact form plugin<em>Updated</em></li><li>Theme<em>Updated</em></li></ul></div></article>
  <article class="card cell w6 c2 fade"><div class="badge">${I.db}</div><h3>Backups</h3><p>Regular copies of your site, stored safely.</p>
    <div class="mini" aria-hidden="true"><div class="cal">${'<i></i>'.repeat(30)}</div></div></article>
  <article class="card cell w4 c3 fade"><div class="badge">${I.shield}</div><h3>Security</h3><p>Scans for malware and known weak spots.</p>
    <div class="mini" aria-hidden="true"><div class="scan">${I.shield}<div><b>Clean</b>Malware scan</div></div></div></article>
  <article class="card cell w4 c4 fade"><div class="badge">${I.pulse}</div><h3>Uptime monitoring</h3><p>We are alerted when your site goes down.</p>
    <div class="mini" aria-hidden="true"><div class="bars">${[62, 74, 58, 80, 68, 88, 72, 92, 66, 84, 76, 95].map((h) => `<i style="height:${h}%"></i>`).join('')}</div></div></article>
  <article class="card cell w4 c5 fade"><div class="badge">${I.gauge}</div><h3>Speed</h3><p>Images, caching and code tuned for faster pages.</p>
    <div class="mini" aria-hidden="true"><svg class="gauge" viewBox="0 0 120 68"><path d="M10 60a50 50 0 0 1 100 0" fill="none" stroke="var(--line)" stroke-width="12" stroke-linecap="round"/><path d="M10 60a50 50 0 0 1 84-36" fill="none" stroke="var(--c)" stroke-width="12" stroke-linecap="round"/><path d="m60 60 22-24" stroke="var(--head)" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--head)"/></svg></div></article>
  <article class="card cell w12 c6 fade"><div><div class="badge">${I.chat}</div><h3>Edits and support</h3><p>Small changes each month, from a real person.</p></div>
    <div class="mini" aria-hidden="true"><div class="bubble">Can you change the opening hours on the contact page?</div><div class="bubble me">Done. Please take a look.</div></div></article>
</div>`;

const planCard = (p) => `<article class="card plan fade${p.popular ? ' pop' : ''}">
    ${p.popular ? '<span class="pop-tag">Most popular</span>' : ''}
    <h3>${p.name}</h3>
    <div class="price"><b data-m="${money(p.monthly)}" data-y="${money(p.annual)}">${money(p.monthly)}</b><span data-m="/month" data-y="/year">/month</span></div>
    <p class="note" data-m="${prices.firstMonthNote.en}" data-y="${prices.annualNote.en}">${prices.firstMonthNote.en}</p>
    <a class="btn ${p.popular ? 'primary' : 'ghost'}" href="/get-a-free-quote/#${p.name.toLowerCase()}">Choose ${p.name}${I.arrow}</a>
    <ul class="feat">${p.includes.map((f) => `<li>${I.check}<span${explain[f] ? ` title="${explain[f]}"` : ''}>${f}</span></li>`).join('')}</ul>
  </article>`;

const [low, , high] = prices.plans.map((p) => p.monthly);

// Sections built from old text
const proSection = `<section class="sec alt"><div class="wrap split">
  <div class="head fade"><h2>${txt(pro.find('summary'))}</h2><div class="measure">${proDiv.children('p').toArray().map(paraOrBtn).join('')}</div></div>
  <div class="grid g2">${proDiv.find('.card').toArray().map((c, i) => `<article class="card c${(i % 6) + 1} fade"><div class="badge">${CARE_ICONS[[0, 1, 2, 3, 5, 5][i] ?? 0]}</div><h3>${inner($(c).find('h3'))}</h3><p>${inner($(c).find('p'))}</p></article>`).join('')}</div>
</div></section>`;
const careLines = careDiv.children('p').toArray().map(txt);
const careSection = `<section class="sec"><div class="wrap">
  <div class="head fade"><h2>${txt(care.find('summary'))}</h2></div>
  <div class="grid g3">${careDiv.find('.card').toArray().map((c, i) => `<div class="card check-tile c${i + 1} fade">${CARE_ICONS[i]}<div><strong>${inner($(c).find('strong'))}</strong><span>${inner($(c).find('.pair span'))}</span></div></div>`).join('')}</div>
  <div class="plan-foot">${I.file.replace('class="ic"', 'class="ic" style="color:var(--accent)"')}<span>${careLines[0].replace(/\s*See full checklist.*/, '')}</span><a class="btn ghost small" href="/website-maintenance-checklist/">See full checklist →</a></div>
</div></section>`;
const startedSection = `<div class="after started"><div class="head fade"><h2>${txt(started.find('summary'))}</h2><p>${inner(startedDiv.children('p').first())}</p></div>
  <div class="grid g5">${startedDiv.find('.card').toArray().map((c) => `<article class="card fade"><div class="num" style="width:48px;height:48px">${txt($(c).find('p').first())}</div><h3>${inner($(c).find('h3'))}</h3><p>${inner($(c).find('p').last())}</p></article>`).join('')}</div>
  <div class="btn-row after">${linkBtns(startedDiv.children('p').last())}</div></div>`;

const exploreSection = `<section class="sec"><div class="wrap">
  ${head(explore, careLines[1])}
  <div class="grid g5">${explore.find('.card').toArray().map((c, i) => {
    const title = txt($(c).find('h3'));
    const body = txt($(c).find('p')).replace(/\s*Explore service$/, '');
    return `<a class="card c${(i % 6) + 1} fade" href="${$(c).find('a').attr('href')}"><div class="badge">${SVC_ICONS[title] ?? I.wrench}</div><h3>${title}</h3><p>${body}</p><span class="go">Explore service ${I.arrow}</span></a>`;
  }).join('')}</div>
  <p class="after measure">${inner(pOf(explore, /^Not sure/))}</p>
</div></section>`;

const whyRows = why.find('tbody tr').toArray().map((r) => {
  const c = $(r).find('td').toArray().map(inner);
  return `<tr><td>${c[0]}</td><td>${I.x}${c[1]}</td><td>${I.check}${c[2]}</td></tr>`;
}).join('');
const whySection = `<section class="sec alt"><div class="wrap">
  ${head(why, txt(pOf(explore, /^Website Maintenance Explained/)))}
  <h3 class="fade" style="margin-bottom:var(--s3)">${inner(why.find('h3').first())}</h3>
  <div class="fade"><table class="tbl"><thead><tr>${why.find('thead th').toArray().map((h) => `<th scope="col">${inner(h)}</th>`).join('')}</tr></thead><tbody>${whyRows}</tbody></table></div>
  <p class="callout measure fade">${inner(pOf(why, /^Bottom line/))}</p>
  <div class="plan-foot fade"><span>${txt(pOf(why, /^See exactly/))}</span><a class="btn ghost small" href="${$(pOf(why, /^Get the Free/)).find('a').attr('href')}">${txt(pOf(why, /^Get the Free/))}${I.arrow}</a></div>
</div></section>`;

const partnerSection = `<section class="sec"><div class="wrap split">
  <div class="head fade"><p class="kicker">${txt(pOf(why, /^Who We Are$/))}</p><h2>${inner(partner.find('h2'))}</h2><div class="measure"><p>${inner(partner.children('p').first())}</p></div><div class="btn-row after">${linkBtns(partner.children('p').last())}</div></div>
  <ul class="checks">${partner.find('li').toArray().map((l) => `<li class="card fade">${I.check}<span>${inner(l)}</span></li>`).join('')}</ul>
</div></section>`;

const oursSection = `<section class="sec alt"><div class="wrap">
  ${head(ours)}
  <div class="grid g4">${ours.find('.card').toArray().map((c) => {
    const img = $(c).find('img');
    const ps = $(c).find('p').toArray();
    return `<article class="card svc-img fade"><img src="${pub(img.attr('src'))}" alt="${img.attr('alt')}" width="${img.attr('width')}" height="${img.attr('height')}" loading="lazy"><div><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[0])}</p><p><a class="btn ghost small" href="${$(ps[1]).find('a').attr('href')}">${inner($(ps[1]).find('a'))}${I.arrow}</a></p></div></article>`;
  }).join('')}</div>
</div></section>`;

// Owner, 2026-11-01: one row of names, no badges, ratings or stars. The list waits for the owner's confirmation.
const PROFILES = [['Clutch', 'https://clutch.co/profile/website-maintenance-services'], ['GoodFirms', 'https://www.goodfirms.co/company/website-maintenance-services'], ['Sortlist', 'https://www.sortlist.com/agency/website-maintenance-services-usa'], ['Trustpilot', 'https://www.trustpilot.com/review/websitemaintenanceservices.org'], ['Techreviewer', 'https://techreviewer.co/companies/website-maintenance-services'], ['C2C Review', 'https://c2creview.co/company/website-maintenance-services'], ['Agency Spotter', 'https://www.agencyspotter.com/website-maintenance-services']];
const findUs = `<section class="findus"><div class="wrap"><h2>Find us on</h2><ul>${PROFILES.map(([n, u]) => `<li><a href="${u}" rel="noopener">${n}</a></li>`).join('')}</ul></div></section>`;

const badges = block(/^Trusted & Rated/);
const VALUE_ICONS = [I.file, I.pulse, I.tag, I.users];
const values = badges.find('strong').toArray().map((b, i) => { const all = txt($(b).parent()); return `<div class="card check-tile c${i + 1} fade">${VALUE_ICONS[i] ?? I.check}<div><strong>${inner(b)}</strong><span>${all.slice(txt(b).length).trim()}</span></div></div>`; }).join('');
const valuesSection = `<section class="sec"><div class="wrap"><div class="grid g4">${values}</div></div></section>`;

const placeItems = [...new Set(oneplace.find('li').toArray().map(txt))];
const PLACE_ICONS = { 'Hosting Services': I.server, 'Content Creation': I.pen, SEO: I.search, 'Website Updates': I.refresh, 'Backup Services': I.db, WordPress: I.layout };
const oneplaceSection = `<section class="sec"><div class="wrap split">
  <div class="head fade"><h2>${inner(oneplace.find('h2'))}</h2><div class="measure"><p>${inner(oneplace.children('p').first())}</p></div></div>
  <div class="grid g2">${placeItems.map((t, i) => `<div class="card check-tile c${i + 1} fade">${PLACE_ICONS[t] ?? I.check}<strong>${t}</strong></div>`).join('')}</div>
</div></section>`;

const resPs = results.children('p').toArray();
const caseTags = ['Healthcare', 'WordPress', 'USA', 'Monthly Maintenance'];
const tagLine = pOf(results, /^Healthcare WordPress USA/);
if (txt(tagLine) !== caseTags.join(' ')) throw new Error('case study tags changed');
const resultsSection = `<section class="sec alt"><div class="wrap">
  ${head(results, txt(pOf(oneplace, /^Real Results$/)))}
  <div class="grid g4">${results.find('.card').toArray().map((c) => `<div class="card fade"><strong style="color:var(--head)">${inner($(c).find('p').first())}</strong><div class="ba"><s>${inner($(c).find('.pair strong'))}</s>${I.arrow}<span>${inner($(c).find('.pair span'))}</span></div></div>`).join('')}</div>
  <article class="card case fade"><p class="kicker">${txt(pOf(results, /^Case Study$/))}</p><h3>${inner(results.find('h3').first())}</h3><ul class="chips">${caseTags.map((t) => `<li>${t}</li>`).join('')}</ul><p class="body">${inner(pOf(results, /^This mental-health/))}</p><div class="btn-row">${linkBtns(pOf(results, /^Read the Full Case Study/))}</div></article>
</div></section>`;
void resPs;

const guidesSection = `<section class="sec"><div class="wrap">
  ${head(guides, txt(pOf(results, /^Guides & Resources$/)))}
  <div class="grid g3">${guides.find('.card').toArray().map((c) => {
    const ps = $(c).find('p').toArray();
    return `<article class="card guide fade"><p class="chip">${inner(ps[0])}</p><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[1])}</p><a class="btn ghost small" href="${$(ps[2]).find('a').attr('href')}">${inner($(ps[2]).find('a'))}</a></article>`;
  }).join('')}</div>
  <div class="btn-row after">${linkBtns(guides.children('p').last(), ['ghost'])}</div>
</div></section>`;

const chooseH3 = choose.find('h3').toArray();
const CHOOSE_ICONS = [I.users, I.shield, I.file];
const chooseSection = `<section class="sec alt"><div class="wrap">
  ${head(choose)}
  <div class="grid g3">${chooseH3.map((h, i) => {
    const next = $(h).next('p');
    return `<article class="card c${i + 1} fade"><div class="badge">${CHOOSE_ICONS[i]}</div><h3>${inner(h)}</h3>${next.length ? `<p>${inner(next)}</p>` : ''}</article>`;
  }).join('')}</div>
  <div class="btn-row after">${linkBtns(choose.children('p').last(), ['ghost'])}</div>
</div></section>`;

const countriesSection = `<section class="sec"><div class="wrap">
  ${head(countries)}
  <div class="grid g5 keep">${countries.find('a').toArray().map((a) => `<a class="country fade" href="${$(a).attr('href')}">${I.pin}${inner(a)}</a>`).join('')}</div>
</div></section>`;

const faqs = $('.faq details').toArray().map((d) => `<details><summary><span>${$(d).find('summary').text()}</span>${I.plus}</summary><p>${$(d).find('p').html()}</p></details>`);
if (faqs.length < 10) throw new Error('FAQ not found in dist/');
const extra = $('.faq').nextAll('.prose').first();
const extraPlain = extra.children('.card').toArray().map(txt);
const [before, after] = extra.find('.cards .card').toArray();
const listOf = (c, icon) => $(c).find('li').toArray().map((l) => `<li>${icon}${inner(l)}</li>`).join('');
const faqSection = `<section class="sec alt"><div class="wrap">
  <div class="head fade"><h2>${txt($('.faq').parent().find('.head h2'))}</h2></div>
  <div class="faq">${faqs.join('')}</div>
  <div class="extras split"><div><h3>${inner(extra.find('h3').first())}</h3><ul class="chips">${extraPlain.map((t) => `<li>${I.check}${t}</li>`).join('')}</ul></div>
    <div class="grid g2"><div class="card before"><h3>${inner($(before).find('h3'))}</h3><ul>${listOf(before, I.x)}</ul></div><div class="card later"><h3>${inner($(after).find('h3'))}</h3><ul>${listOf(after, I.check)}</ul></div></div>
  </div>
</div></section>`;

const finalProse = cheerio.load($('.cta-final .prose').html() ?? '', null, false);
const finalLinks = finalProse('a').toArray().map((a, i) => `<a class="btn ${i === 0 ? 'white' : 'ghost'}" href="${finalProse(a).attr('href')}">${finalProse(a).text()}</a>`);
finalProse('a').each((_, a) => { const p = finalProse(a).closest('p'); finalProse(a).remove(); if (p.length && !p.text().trim()) p.remove(); });
const footerHtml = pub($('footer').first().find('.wrap').first().html() ?? '');

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
<header class="top"><div class="wrap">
  <a class="logo" href="/" aria-label="Home"><img src="/public/wp-content/uploads/2025/11/Colorful-Website-Maintenance-services-Logo.png" alt="Website Maintenance Services" width="325" height="108"></a>
  <nav class="nav" aria-label="Main"><a href="/#services">Services</a><a href="/monthly-website-maintenance-packages/">Pricing</a><a href="/blogs/">Blog</a><a href="/about-us/">About</a><a href="/contact/">Contact</a>
    <button class="theme" id="theme" type="button" aria-label="Switch between light and dark theme">${I.sun}${I.moon}</button>
    <a class="btn primary small" href="/monthly-website-maintenance-packages/">See plans</a></nav>
</div></header>

<main>
<section class="hero"><div class="wrap">
  <h1>Website <em>Maintenance</em> Services &amp; Support</h1>
  <div class="hero-grid">
    <div>
      <p class="sub">Your site kept fast, secure and up to date, by engineers who show you what they did.</p>
      <ul class="offer"><li>Plans from ${money(low)}/mo</li><li>First month free</li><li>Free hosting for 1 year</li><li>No contract</li></ul>
      <div class="btn-row"><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${I.arrow}</a><a class="btn ghost" href="/free-website-maintenance-audit/">Get a free website check</a></div>
      <ul class="facts"><li>${I.check}Dhaka-based team</li><li>${I.check}US &amp; UK hours</li><li>${I.check}30+ websites maintained</li></ul>
    </div>
    <div>${dashboard}<p class="dash-note">Example dashboard. It is not real client data.</p></div>
  </div>
</div></section>

<section class="platforms" aria-label="Platforms we support"><div class="wrap">
  <p>Platforms we support</p>
  <ul>${Object.entries(logos).map(([n, svg]) => `<li>${svg}${n === 'WooCommerce' ? `<span class="sr-only">${n}</span>` : n}</li>`).join('')}</ul>
</div></section>

<section class="sec"><div class="wrap lead-grid">
  <div class="fade"><p class="kicker">${inner(introP[0])}</p><p class="big">${inner(introP[1])}</p></div>
  <div class="lead-side fade"><ul class="chips"><li>Security &amp; Backups</li><li>Updates &amp; Fixes</li><li>24/7 Support</li></ul><div class="btn-row">${linkBtns(introP[3])}</div></div>
</div></section>

<section class="sec alt"><div class="wrap">
  <div class="head fade"><h2>What's included</h2><p>The routine work a website needs, done for you each month.</p></div>
  ${bento}
</div></section>

${proSection}
${careSection}

<section class="sec glow"><div class="wrap">
  <div class="head fade"><h2>Plans and pricing</h2><p>Every price is on this page.</p></div>
  <div class="toggle-row"><div class="toggle" role="group" aria-label="Billing period"><button type="button" data-period="m" aria-pressed="true">Monthly</button><button type="button" data-period="y" aria-pressed="false">Annual</button></div><span class="save">${prices.annualNote.en}</span></div>
  <div class="grid g3">${prices.plans.map(planCard).join('')}</div>
  <div class="plan-foot"><span>No contract. Cancel anytime.</span><a class="btn ghost small" href="/monthly-website-maintenance-packages/">Compare all features</a><a class="btn ghost small" href="/ecommerce-website-maintenance-packages/">Running an online store? Store plans from $199</a></div>
</div></section>

<section class="sec alt"><div class="wrap">
  <div class="head fade"><h2>How it works</h2></div>
  <ol class="steps">
    <li class="fade"><div class="num">1</div><h3>Free check</h3><p>Send your URL. We look at your site and tell you what needs attention.</p></li>
    <li class="fade"><div class="num">2</div><h3>Pick a plan</h3><p>Choose a plan. We talk through it on a short call.</p></li>
    <li class="fade"><div class="num">3</div><h3>We set you up</h3><p>We get access to your site and set up your plan.</p></li>
    <li class="fade"><div class="num">4</div><h3>We take care of it</h3><p>We do the work every month and send you a plain report.</p></li>
  </ol>
  ${startedSection}
</div></section>

<section class="sec"><div class="wrap">
  <div class="head fade"><h2>What a monthly report looks like</h2><p>An example of the numbers you would see. It is not real client data.</p></div>
  <div class="card report fade">
    <div class="report-top"><span>Monthly report, yourwebsite.com</span><span class="tag">Example</span></div>
    <div class="grid g4 metrics"><div class="metric"><span>Updates applied</span><b>14</b></div><div class="metric"><span>Backups completed</span><b>30</b></div><div class="metric"><span>Malware found</span><b>0</b></div><div class="metric"><span>Edit time used</span><b>1h 40m</b></div></div>
  </div>
  <p class="line-a1 fade">30+ websites built and maintained for businesses in Canada, the UK, the Caribbean and Bangladesh.</p>
  <div class="todo fade">Mockup note: the portfolio block goes here once the owner confirms the table.</div>
</div></section>

<section class="sec alt"><div class="wrap">
  <div class="head fade"><h2>How we compare</h2></div>
  <div class="grid g3">
    <article class="card vs us fade"><h3>WMS</h3><dl><div><dt>Price per month</dt><dd>${money(low)}–${money(high)}</dd></div><div><dt>Contract</dt><dd>None. Cancel anytime.</dd></div><div><dt>Monthly report</dt><dd>Growth and Business</dd></div></dl><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${I.arrow}</a></article>
    <article class="card vs fade"><h3>Freelancer</h3><dl><div><dt>Price per month</dt><dd>$50–$150</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
    <article class="card vs fade"><h3>Typical agency</h3><dl><div><dt>Price per month</dt><dd>$149–$600+</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
  </div>
</div></section>

${exploreSection}
${whySection}
${partnerSection}
${oursSection}
${findUs}
${valuesSection}
${oneplaceSection}
${resultsSection}
${guidesSection}
${chooseSection}
${countriesSection}
${faqSection}

<div class="wrap final-wrap"><section class="final fade">${finalProse.html()}<div class="btn-row">${finalLinks.join('')}</div></section></div>
</main>

<footer class="foot"><div class="wrap">${footerHtml}</div></footer>
<div class="cookie" id="cookie"><span>We use cookies for analytics. <a href="/privacy-policy/">Privacy policy</a></span><button type="button">Accept</button><button type="button">Reject</button></div>
<script>
document.getElementById('theme').addEventListener('click',function(){var r=document.documentElement,t=r.getAttribute('data-theme')==='dark'?'light':'dark';r.setAttribute('data-theme',t);try{localStorage.setItem('wms-theme',t)}catch(e){}});
document.querySelectorAll('#cookie button').forEach(function(b){b.addEventListener('click',function(){document.getElementById('cookie').hidden=true})});
var t=document.querySelectorAll('.toggle button');
t.forEach(function(b){b.addEventListener('click',function(){t.forEach(function(x){x.setAttribute('aria-pressed',x===b)});var k=b.dataset.period;document.querySelectorAll('[data-m]').forEach(function(e){e.textContent=e.dataset[k]})})});
if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});document.querySelectorAll('.fade').forEach(function(e){o.observe(e)})}else{document.querySelectorAll('.fade').forEach(function(e){e.classList.add('in')})}
</script>
</body></html>`;
writeFileSync(`${dir}home.html`, page);

// Every old homepage line must still be in the mockup, apart from the badge block the owner asked to replace.
const squeeze = (s) => s.replace(/’/g, "'").replace(/[\s ]+/g, '').toLowerCase();
const m$ = cheerio.load(page);
const have = squeeze(m$('main').text());
const old = cheerio.load(readFileSync('dist/index.html', 'utf8'));
old('[class*="badges"] h2').remove();
const lines = [];
old('.home-section h2, .home-section h3, .home-section p, .home-section li, .home-section td, .home-section th, .faq summary, .faq p, details.more summary, details.more p, details.more li').each((_, e) => { const l = old(e).text().replace(/\s+/g, ' ').trim(); if (l) lines.push(l); });
const missing = [...new Set(lines)].filter((l) => !have.includes(squeeze(l)));
console.log(`built home.html; old lines checked ${new Set(lines).size}, missing ${missing.length}`);
for (const l of missing) console.log(`  MISSING: ${l.slice(0, 110)}`);
