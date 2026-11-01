// Homepage, per DESIGN-QA.md. Old text comes from the page content; short labels are in LABELS for owner review.
import * as cheerio from 'cheerio';
import prices from '../data/prices.json';
import site from '../data/site.json';
import { badge, icon, nope, tick } from './icons';
import { plansHtml } from './plans';
import { describeLinks } from './html-sections';
import { sectionsOf } from './polish';

const LABELS = { track: 'Track record', trackH2: '12+ years of keeping websites running', included: "What's included", pricing: 'Pricing', how: 'How it works', report: 'Monthly report', compare: 'Compare', ours: 'Our services', us: 'Why us', where: 'Where we work', faq: 'FAQ', compareIntro: 'What you get from each option, side by side.', faqIntro: 'Answers to the questions we hear most.' };
const EXPERT_DRAFT = 'A team of WordPress developers who work US & UK business hours and explain every change in plain words.';
const PLATFORM_LOGOS: [string, string, string][] = [
  ['WordPress', '0 0 24 24', 'M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0'],
  ['WooCommerce', '', ''],
  ['Shopify', '1.4 0 21.1 24', 'M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z'],
];

export function renderHome(html: string, faqs: { q: string; a: string }[], wooSvg: string) {
  const [introHtml, ...sections] = sectionsOf(describeLinks(html));
  const $ = cheerio.load(`<div class="b" id="intro-b">${introHtml}</div>${sections.map((s) => `<div class="b">${s}</div>`).join('')}`, null, false);
  const inner = (e: Parameters<typeof $>[0]) => ($(e).html() ?? '').trim();
  const txt = (e: Parameters<typeof $>[0]) => $(e).text().replace(/\s+/g, ' ').trim();
  const blocks = $('.b').toArray();
  const block = (re: RegExp) => {
    const b = blocks.find((x) => re.test(txt($(x).find('h2').first())));
    if (!b) throw new Error(`home section not found: ${re}`);
    return $(b);
  };
  const pOf = (b: ReturnType<typeof block>, re: RegExp) => {
    const p = b.children('p').toArray().find((x) => re.test(txt(x)));
    if (!p) throw new Error(`home paragraph not found: ${re}`);
    return p;
  };
  const hrefOf = (p: Parameters<typeof $>[0]) => $(p).find('a').attr('href');
  const linkBtns = (p: Parameters<typeof $>[0], cls = ['primary', 'ghost']) => $(p).find('a').toArray().map((a, i) => `<a class="btn ${cls[i] ?? 'ghost'}" href="${$(a).attr('href')}">${inner(a)}${i === 0 ? icon('arrow') : ''}</a>`).join('');
  const hl = (text: string, word: string) => (word && text.includes(word) ? text.replace(word, `<span class="hl">${word}</span>`) : text);
  const head = (eyebrow: string, h2: string, intro: string | string[] = [], word = '') => `<div class="head fade"><p class="eyebrow">${eyebrow}</p><h2>${hl(h2, word)}</h2>${[intro].flat().filter(Boolean).map((p) => `<p class="intro">${p}</p>`).join('')}</div>`;
  let n = 0;
  const sec = (id: string, body: string) => `<section class="sec${n++ % 2 ? ' alt' : ''}" data-sec="${id}"><div class="wrap">${body}</div></section>`;

  const introEl = $('#intro-b');
  const alwaysOnEl = introEl.children('.pair').first();
  const alwaysOn = alwaysOnEl.length ? `${inner(alwaysOnEl.find('strong'))}: ${inner(alwaysOnEl.find('span'))}` : '';
  alwaysOnEl.remove();
  const introP = introEl.children('p').toArray().filter((p) => txt(p));
  if (!/^Trusted by/.test(txt(introP[0])) || !/^Security & Backups/.test(txt(introP[2]))) throw new Error('home intro changed');

  const care = block(/^Everything We Take Care Of/);
  const pro = block(/^What.s Included in Professional/);
  const started = block(/^How Do I Get Started/);
  const explore = block(/^Explore Our/);
  const why = block(/^Why Website Maintenance Matters/);
  const partner = block(/^Your Dedicated/);
  const ours = block(/^Our Website Maintenance Services/);
  const oneplace = block(/^Everything Your Website Needs/);
  const results = block(/^Real Maintenance Results/);
  const guides = block(/^Website Maintenance Guides/);
  const choose = block(/^Why Choose Us/);
  const countries = block(/^Countries We Serve/);
  const faqBlock = block(/^FAQs? About Website Maintenance/);

  // Example visuals. Not real client data; each one carries the Example label.
  const uptimeBars = Array.from({ length: 30 }, (_, i) => `<rect x="${i * 14}" y="0" width="10" height="48" rx="3" fill="${i === 17 ? 'var(--line-strong)' : 'var(--ok)'}"/>`).join('');
  const dashboard = `<div class="dash-wrap">
    <div class="dash" role="img" aria-label="Example maintenance dashboard. Not real client data.">
      <div class="dash-top"><span class="dots"><i></i><i></i><i></i></span><span>yourwebsite.com</span><span class="tag">Example</span></div>
      <div class="dash-body">
        <div class="panel"><b><i class="pulse"></i>Site is up</b><svg class="uptime" viewBox="0 0 416 48" aria-hidden="true">${uptimeBars}</svg><div class="uptime-scale"><span>Uptime, last 30 days</span><span>Today</span></div></div>
        <div class="tiles"><div class="tile-s">${icon('refresh')}<span>Updates</span><b>14 applied</b></div><div class="tile-s">${icon('db')}<span>Last backup</span><b>Finished</b></div><div class="tile-s">${icon('shield')}<span>Security scan</span><b>Clean</b></div></div>
        <div class="panel"><ul class="log"><li>${tick}<span>Plugins and theme updated</span><span>Today</span></li><li>${tick}<span>Backup finished</span><span>Today</span></li><li>${tick}<span>Malware scan: clean</span><span>Yesterday</span></li></ul></div>
      </div>
    </div>
    <div class="float f1" aria-hidden="true">${icon('check')}Backup finished</div>
    <div class="float f2" aria-hidden="true">${icon('shield')}Malware scan: clean</div>
    <div class="float f3" aria-hidden="true">${icon('refresh')}Plugins updated</div>
  </div>`;

  // Track record
  const statsHtml = head(LABELS.track, LABELS.trackH2, site.domainLine, '12+ years')
    + `<div class="stats fade">${site.stats.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="callout fade"><div><p><strong>${site.statsLine}</strong></p></div><div class="act"><a class="btn primary" href="/works/">See our work${icon('arrow')}</a><a class="btn ghost" href="/website-maintenance-case-study/">Read case studies</a></div></div>`;

  // What's included: the old 6 cards with a mini visual each, then the short list.
  const proCards = pro.find('.card').toArray().map((c) => ({ h: inner($(c).find('h3')), p: inner($(c).find('p')) }));
  if (proCards.length !== 6) throw new Error('home included cards changed');
  const MINI = [
    `<div class="scan">${icon('shield')}<div><b>Clean</b>Malware scan</div></div>`,
    '<ul class="rows"><li>WordPress core<em>Updated</em></li><li>Contact form plugin<em>Updated</em></li><li>Theme<em>Updated</em></li></ul>',
    `<div class="cal">${'<i></i>'.repeat(30)}</div>`,
    '<svg class="gauge" viewBox="0 0 120 68"><path d="M10 60a50 50 0 0 1 100 0" fill="none" stroke="var(--line)" stroke-width="12" stroke-linecap="round"/><path d="M10 60a50 50 0 0 1 84-36" fill="none" stroke="var(--c)" stroke-width="12" stroke-linecap="round"/><path d="m60 60 22-24" stroke="var(--head)" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--head)"/></svg>',
    `<div class="bars">${[62, 74, 58, 80, 68, 88, 72, 92, 66, 84, 76, 95].map((h) => `<i style="height:${h}%"></i>`).join('')}</div>`,
    '<div class="bubble">Can you change the opening hours on the contact page?</div><div class="bubble me">Done. Please take a look.</div>',
  ];
  const BENTO = ['shield', 'refresh', 'db', 'gauge', 'pulse', 'chat'];
  const SIZES = ['w6', 'w6', 'w4', 'w4', 'w4', 'w12'];
  const bento = `<div class="bento">${proCards.map((c, i) => {
    const text = `<div class="badge">${icon(BENTO[i])}</div><h3>${c.h}</h3><p class="card-text">${c.p}</p>`;
    return `<article class="card cell ${SIZES[i]} c${i + 1} fade">${SIZES[i] === 'w12' ? `<div>${text}</div>` : text}<div class="mini" aria-hidden="true">${MINI[i]}</div></article>`;
  }).join('')}</div>`;
  const proPs = pro.children('p').toArray();
  const proLink = proPs.find((p) => $(p).find('a').length && txt($(p).find('a')) === txt(p));
  const careLines = care.children('p').toArray().map((p) => txt(p));
  const CARE = ['shield', 'refresh', 'db', 'gauge', 'search', 'pulse'];
  // The old stat tiles: a number, then its label.
  const careStats = careLines.slice(1, 9).reduce<string[]>((all, line, i, list) => (i % 2 ? all : [...all, `<div class="stat"><b>${line}</b><span>${list[i + 1]}</span></div>`]), []);
  if (careStats.length !== 4 || !/^12\+$/.test(careLines[1])) throw new Error('home care stats changed');
  const includedHtml = head(LABELS.included, txt(pro.find('h2').first()), inner(proPs[0]), 'Professional')
    + bento
    + `<div class="callout fade"><div><p>${inner(proPs[1])}</p><p>${txt(proPs[3])}</p></div><div class="act"><a class="btn primary" href="${hrefOf(proLink!)}">${txt(proLink!)}${icon('arrow')}</a></div></div>`
    + `<div class="sub-head fade"><h3>${txt(care.find('h2').first())}</h3></div>
    <div class="stats four fade">${careStats.join('')}</div>
    <div class="grid g3 gap-top">${care.find('.card').toArray().map((c, i) => `<div class="card tile fade">${badge(CARE[i], i + 1)}<div><strong>${inner($(c).find('strong'))}</strong><span>${inner($(c).find('.pair span'))}</span></div></div>`).join('')}</div>
    <div class="callout fade"><div><p><strong>${careLines[0].replace(/\s*See full checklist.*/, '')}</strong></p></div><div class="act"><a class="btn ghost" href="/website-maintenance-checklist/">See full checklist →</a></div></div>`;

  // Pricing
  const everyItems = faqBlock.children('.card').toArray().map((c) => txt(c));
  const EVERY = ['shield', 'refresh', 'db', 'pulse', 'pen'];
  const pricingHtml = head(LABELS.pricing, 'Plans and pricing', 'Every price is on this page.', 'pricing')
    + plansHtml(' fade')
    + `<div class="sub-head fade"><h3>${inner(faqBlock.find('h3').first())}</h3></div>
    <div class="every">${everyItems.map((t, i) => `<div class="card tile fade">${badge(EVERY[i], i + 1)}<strong>${t}</strong></div>`).join('')}</div>
    <div class="callout fade"><div><p><strong>No contract. Cancel anytime.</strong></p></div><div class="act"><a class="btn ghost" href="/monthly-website-maintenance-packages/">Compare all features</a><a class="btn ghost" href="/ecommerce-website-maintenance-packages/">Running an online store? Store plans from $199</a></div></div>`;

  // Process
  const STEP = ['tag', 'chat', 'file', 'key', 'search'];
  const stepCards = started.find('.card').toArray().filter((c) => $(c).find('h3').length);
  if (stepCards.length !== 5) throw new Error('home steps changed');
  const processHtml = head(LABELS.how, txt(started.find('h2').first()), inner(started.children('p').first()), 'Get Started')
    + `<ol class="steps">${stepCards.map((c, i) => `<li class="fade"><div class="num" aria-hidden="true">${txt($(c).find('p').first())}</div><article class="card">${badge(STEP[i], i + 1)}<h3 class="step-h">${inner($(c).find('h3'))}</h3><p class="card-text">${inner($(c).find('p').last())}</p></article></li>`).join('')}</ol>
    <div class="btn-row row-end">${linkBtns(started.children('p').last())}</div>`;

  const reportHtml = head(LABELS.report, 'What a monthly report looks like', 'An example of the numbers you would see. It is not real client data.', 'monthly report')
    + `<div class="card report fade">
      <div class="report-top"><span>Monthly report, yourwebsite.com</span><span class="tag">Example</span></div>
      <div class="grid g4 metrics"><div class="metric"><span>Updates applied</span><b>14</b></div><div class="metric"><span>Backups completed</span><b>30</b></div><div class="metric"><span>Malware found</span><b>0</b></div><div class="metric"><span>Edit time used</span><b>1h 40m</b></div></div>
    </div>`;

  const money = (v: number) => `$${v.toLocaleString('en-US')}`;
  const [low, , high] = prices.plans.map((p) => p.monthly);
  const compareHtml = head(LABELS.compare, 'How we compare', LABELS.compareIntro, 'compare')
    + `<div class="grid g3">
      <article class="card vs us fade"><h3>WMS</h3><dl><div><dt>Price per month</dt><dd>${money(low)}–${money(high)}</dd></div><div><dt>Contract</dt><dd>None. Cancel anytime.</dd></div><div><dt>Monthly report</dt><dd>Growth and Business</dd></div></dl><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${icon('arrow')}</a></article>
      <article class="card vs fade"><h3>Freelancer</h3><dl><div><dt>Price per month</dt><dd>$50–$150</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
      <article class="card vs fade"><h3>Typical agency</h3><dl><div><dt>Price per month</dt><dd>$149–$600+</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
    </div>`;

  const SVC: Record<string, string> = { 'Website Design': 'layout', 'Website Migration': 'move', 'Website Redesign': 'pen', 'Website Repair': 'wrench', 'Website SEO': 'search', 'Speed Optimization': 'gauge', 'Website Updates': 'refresh', 'White-Label Maintenance': 'tag', 'WordPress Backups': 'db', 'Malware Removal': 'shield' };
  const exploreHtml = head(txt(pOf(care, /^Complete Website Support$/)), inner(explore.find('h2')), inner(explore.children('p').first()), 'Website Services')
    + `<div class="grid g2">${explore.find('.card').toArray().map((c, i) => {
      const title = txt($(c).find('h3'));
      const body = txt($(c).find('p')).replace(/\s*Explore service$/, '');
      return `<a class="card svc fade" href="${$(c).find('a').attr('href')}">${badge(SVC[title] ?? 'wrench', (i % 6) + 1)}<div><h3>${title}</h3><p>${body}</p><span class="go">Explore service ${icon('arrow')}</span></div></a>`;
    }).join('')}</div>
    <div class="callout fade"><div><p>${inner(pOf(explore, /^Not sure/))}</p></div></div>`;

  const whyHead = why.find('thead th').toArray().map((h) => inner(h));
  const whyRows = why.find('tbody tr').toArray().map((r) => {
    const c = $(r).find('td').toArray().map((d) => inner(d));
    return `<tr><td>${c[0]}</td><td data-label="${whyHead[1]}">${nope}${c[1]}</td><td class="td-good" data-label="${whyHead[2]}">${tick}${c[2]}</td></tr>`;
  }).join('');
  const [before, after] = faqBlock.find('.cards .card').toArray();
  const listOf = (c: Parameters<typeof $>[0], mark: string) => $(c).find('li').toArray().map((l) => `<li>${mark}<span>${inner(l)}</span></li>`).join('');
  const whyHtml = head(txt(pOf(explore, /^Website Maintenance Explained/)), inner(why.find('h2')), inner(why.children('p').first()), 'Matters')
    + `<div class="sub-head fade first"><h3>${inner(why.find('h3').first())}</h3></div>
    <div class="fade tbl-wrap"><table class="tbl"><thead><tr><th scope="col">${whyHead[0]}</th><th scope="col">${whyHead[1]}</th><th scope="col" class="th-good">${whyHead[2]}</th></tr></thead><tbody>${whyRows}</tbody></table></div>
    <div class="callout fade"><div><p>${inner(pOf(why, /^Bottom line/))}</p><p>${txt(pOf(why, /^See exactly/))}</p></div><div class="act"><a class="btn primary" href="${hrefOf(pOf(why, /^Get the Free/))}">${txt(pOf(why, /^Get the Free/))}${icon('arrow')}</a></div></div>
    <div class="grid g2 gap-top"><div class="card fade"><h3>${inner($(before).find('h3'))}</h3><ul class="ba-list">${listOf(before, nope)}</ul></div><div class="card fade"><h3>${inner($(after).find('h3'))}</h3><ul class="ba-list">${listOf(after, tick)}</ul></div></div>`;

  const partnerHtml = head(txt(pOf(why, /^Who We Are$/)), inner(partner.find('h2')), inner(partner.children('p').first()), 'Partner')
    + `<div class="grid g2">${partner.find('li').toArray().map((l, i) => `<div class="card tile fade">${badge(['shield', 'db', 'gauge', 'file'][i], i + 1)}<strong>${inner(l)}</strong></div>`).join('')}</div>
    <div class="callout fade"><div><p><strong>${txt(pOf(why, /^24\/7 Support$/))}</strong></p><p>${txt(pOf(why, /^Always Available$/))}</p></div><div class="act">${linkBtns(partner.children('p').last())}</div></div>`;

  const placeItems = [...new Set(oneplace.find('li').toArray().map((l) => txt(l)))];
  const PLACE: Record<string, string> = { 'Hosting Services': 'server', 'Content Creation': 'pen', SEO: 'search', 'Website Updates': 'refresh', 'Backup Services': 'db', WordPress: 'layout' };
  const imageCards = ours.find('.card').toArray().filter((c) => $(c).find('img').length);
  const oursHtml = head(LABELS.ours, inner(ours.find('h2')), inner(ours.children('p').first()), 'Services')
    + `<div class="grid g4">${imageCards.map((c) => {
      const img = $(c).find('img');
      const ps = $(c).find('p').toArray();
      return `<article class="card svc-img fade"><img src="${img.attr('src')}" alt="${img.attr('alt')}" width="${img.attr('width')}" height="${img.attr('height')}" loading="lazy"><div><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[0])}</p><div class="btn-wrap"><a class="btn ghost" href="${hrefOf(ps[1])}">${inner($(ps[1]).find('a'))}${icon('arrow')}</a></div></div></article>`;
    }).join('')}</div>
    <div class="sub-head fade"><h3>${inner(oneplace.find('h2'))}</h3><p>${inner(oneplace.children('p').first())}</p></div>
    <div class="grid g3 two-m">${placeItems.map((t, i) => `<div class="card tile fade">${badge(PLACE[t] ?? 'check', i + 1)}<strong>${t}</strong></div>`).join('')}</div>`;

  // Case study: numbers prominent.
  const caseTags = ['Healthcare', 'WordPress', 'USA', 'Monthly Maintenance'];
  if (txt(pOf(results, /^Healthcare WordPress USA/)) !== caseTags.join(' ')) throw new Error('home case study tags changed');
  const caseRows = results.find('.card').toArray().map((c) => `<div class="case-row"><strong>${inner($(c).find('p').first())}</strong><div><s>${inner($(c).find('.pair strong'))}</s>${icon('arrow')}<span>${inner($(c).find('.pair span'))}</span></div></div>`).join('');
  const resultsHtml = head(txt(pOf(oneplace, /^Real Results$/)), inner(results.find('h2')), inner(results.children('p').first()), 'Results')
    + `<article class="card case fade"><div><span class="tag case-tag">${txt(pOf(results, /^Case Study$/))}</span><h3>${inner(results.find('h3').first())}</h3><ul class="chips">${caseTags.map((t) => `<li>${t}</li>`).join('')}</ul><p class="body">${inner(pOf(results, /^This mental-health/))}</p><div class="btn-row">${linkBtns(pOf(results, /^Read the Full Case Study/))}</div></div><div class="case-panel">${caseRows}</div></article>`;

  const guidesHtml = head(txt(pOf(results, /^Guides & Resources$/)), inner(guides.find('h2')), inner(guides.children('p').first()), 'Guides')
    + `<div class="grid g3">${guides.find('.card').toArray().map((c) => {
      const ps = $(c).find('p').toArray();
      return `<article class="card guide fade"><p class="tag">${inner(ps[0])}</p><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[1])}</p><a class="btn ghost" href="${hrefOf(ps[2])}">${inner($(ps[2]).find('a'))}</a></article>`;
    }).join('')}</div>
    <div class="btn-row row-end">${linkBtns(guides.children('p').last(), ['primary'])}</div>`;

  const VALUE = ['file', 'pulse', 'tag', 'users'];
  const valueEls = $('.pair').toArray().filter((p) => /^(No Long-Term Contracts|Fast Response Times|Transparent Pricing|Expert Developers)/.test(txt($(p).find('strong'))));
  if (valueEls.length !== 4) throw new Error(`home value lines: ${valueEls.length}`);
  const values = valueEls.map((p, i) => `<div class="card tile fade">${badge(VALUE[i], i + 1)}<div><strong>${inner($(p).find('strong'))}</strong><span>${inner($(p).find('span'))}</span></div></div>`).join('');
  const CHOOSE = ['users', 'shield', 'file'];
  const chooseHtml = head(LABELS.us, inner(choose.find('h2')), inner(choose.children('p').first()), 'Choose Us')
    + `<div class="grid g3">${choose.find('h3').toArray().map((h, i) => {
      const next = $(h).next('p');
      return `<article class="card c${i + 1} fade"><div class="badge">${icon(CHOOSE[i])}</div><h3>${inner(h)}</h3><p>${next.length ? inner(next) : EXPERT_DRAFT}</p></article>`;
    }).join('')}</div>
    <div class="grid g4 gap-top">${values}</div>
    <div class="btn-row row-end">${linkBtns(choose.children('p').last(), ['primary'])}</div>`;

  const countriesHtml = head(LABELS.where, inner(countries.find('h2')), inner(countries.children('p').first()), 'Serve')
    + `<div class="grid g5">${countries.find('a').toArray().map((a, i) => `<a class="card country fade" href="${$(a).attr('href')}"><span class="badge c${(i % 6) + 1}">${icon('pin')}</span>${inner(a)}</a>`).join('')}</div>`;

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const faqHtml = head(LABELS.faq, txt(faqBlock.find('h2').first()), LABELS.faqIntro, 'FAQs')
    + `<div class="faq fade">${faqs.map((f) => `<details><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`;

  const logos = PLATFORM_LOGOS.map(([name, box, d]) => (name === 'WooCommerce' ? `<li>${wooSvg}<span class="sr-only">${name}</span></li>` : `<li><svg viewBox="${box}" aria-hidden="true"><path d="${d}"/></svg>${name}</li>`)).join('');

  return `<section class="hero" data-sec="hero"><div class="wrap">
    <h1>Website <span class="hl">Maintenance</span> Services &amp; Support</h1>
    <div class="hero-grid">
      <div>
        <p class="sub">Your site kept fast, secure and up to date, by engineers who show you what they did.</p>
        <ul class="chips offer"><li>Plans from ${money(low)}/mo</li><li>First month free</li><li>Free hosting for 1 year</li><li>No contract</li></ul>
        <div class="btn-row cta-row"><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${icon('arrow')}</a><a class="btn ghost" href="/free-website-maintenance-audit/">Get a free website check</a></div>
        <ul class="facts"><li>${tick}99.9% uptime guarantee</li><li>${tick}650+ websites maintained</li><li>${tick}12+ years of experience</li><li>${tick}${site.hours}</li></ul>
      </div>
      <div>${dashboard}<p class="dash-note">Example dashboard. It is not real client data.</p></div>
    </div>
  </div></section>
  <section class="strip platforms" data-sec="platforms" aria-label="Platforms we support"><div class="wrap"><p>Platforms we support</p><ul>${logos}</ul></div></section>
  <section class="strip lead" data-sec="lead"><div class="wrap">
    <div class="fade"><p class="eyebrow">${inner(introP[0])}</p><p class="big">${inner(introP[1])}</p></div>
    <div class="fade"><ul class="chips"><li>${alwaysOn}</li><li>Security &amp; Backups</li><li>Updates &amp; Fixes</li><li>24/7 Support</li></ul><div class="btn-row">${linkBtns(introP[3])}</div></div>
  </div></section>
  ${sec('stats', statsHtml)}
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
  ${sec('faq', faqHtml)}`;
}
