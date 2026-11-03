// Homepage: the owner's design file (wms-homepage-design.html, 2026-11-03) on top, the old page text below it.
// Every old line stays in the HTML. Short labels are in LABELS for owner review.
import * as cheerio from 'cheerio';
import prices from '../data/prices.json';
import site from '../data/site.json';
import design from '../data/home-design.json';
import { badge, icon, nope, tick } from './icons';
import { plansHtml } from './plans';
import { describeLinks, formOpen } from './html-sections';
import { sectionsOf } from './polish';

const LABELS = { included: "What's included", report: 'Monthly report', compare: 'Compare', ours: 'Our services', us: 'Why us', where: 'Where we work', faq: 'FAQ', compareIntro: 'What you get from each option, side by side.', faqIntro: 'Answers to the questions we hear most.' };
const EXPERT_DRAFT = 'A team of WordPress developers who work US & UK business hours and explain every change in plain words.';
const money = (v: number) => `$${v.toLocaleString('en-US')}`;
const [low, , high] = prices.plans.map((p) => p.monthly);
const NEEDS = ['Monthly maintenance plan', 'Fix something on my site', 'Speed optimization', 'Hacked site / malware', 'Migration or redesign', 'Something else'];

// The owner's quick-quote form, used in the hero and in the final call to action.
function quickForm(id: string, title: string, text: string) {
  const f = (name: string) => `${id}-${name}`;
  return `${formOpen(`home-${id}`, 'qf')}
    <div class="qf-head"><p class="qf-title">${title}</p><p>${text}</p></div>
    <div class="qf-two"><div><label for="${f('name')}">Full name</label><input id="${f('name')}" type="text" name="name" placeholder="Your name" autocomplete="name"></div>
    <div><label for="${f('phone')}">Phone / WhatsApp <em>*</em></label><input id="${f('phone')}" type="tel" name="phone" placeholder="+1 555 000 0000" autocomplete="tel" required></div></div>
    <div class="qf-two"><div><label for="${f('email')}">Email <em>*</em></label><input id="${f('email')}" type="email" name="email" placeholder="you@company.com" autocomplete="email" required></div>
    <div><label for="${f('website')}">Website URL</label><input id="${f('website')}" type="url" name="website" placeholder="https://yourwebsite.com" autocomplete="url"></div></div>
    <div><label for="${f('need')}">What do you need? <em>*</em></label><select id="${f('need')}" name="need" required><option value="">Select one</option>${NEEDS.map((n) => `<option>${n}</option>`).join('')}</select></div>
    <div><label for="${f('message')}">Tell us a little about it <em>*</em></label><textarea id="${f('message')}" name="message" rows="3" placeholder="What’s happening with your site, and what would you like us to do?" required></textarea></div>
    <button class="btn primary" type="submit">Get my free quote${icon('arrow')}</button>
    <p class="qf-foot">${icon('clock')}Reply within 24 hours · No spam · No contract</p>
  </form>`;
}

// Final call to action with the form; Base.astro shows it on the homepage only. The old closing heading, text and links stay.
type Cta = { id?: string; title: string; text: string; links: { href: string; label: string }[] };
export const homeFinalHtml = (cta?: Cta) => `<section class="hp-final-sec" data-sec="final"><div class="wrap"><div class="hp-final">
  <div><h2${cta?.id ? ` id="${cta.id}"` : ''}>${cta?.title ?? 'Let’s keep your website secure &amp; online'}</h2><p>Send your site. You’ll get a free check and a clear price within 24 hours.</p>${cta ? `<p>${cta.text}</p>` : ''}
    <ul class="hp-ticks">${['Free hosting for the first year', 'No contract, cancel anytime', 'If we can’t clean your hacked site, you don’t pay'].map((t) => `<li>${tick}${t}</li>`).join('')}</ul>
    ${cta?.links.length ? `<div class="btn-row hp-final-links">${cta.links.map((l) => `<a class="btn ghost" href="${l.href}">${l.label}</a>`).join('')}</div>` : ''}</div>
  ${quickForm('final', 'Get your free website check', 'Takes 30 seconds.')}
</div></div></section>`;

// A row that scrolls on its own. The copy is hidden from screen readers and keyboards.
const marquee = (items: string[], cls = '') => `<div class="hp-mq${cls}"><ul>${items.join('')}${items.map((i) => i.replace('<li', '<li aria-hidden="true"').replace(/<a /g, '<a tabindex="-1" ')).join('')}</ul></div>`;

export function renderHome(html: string, faqs: { q: string; a: string }[]) {
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
  const sec = (id: string, body: string, extra = '') => `<section class="sec${n++ % 2 ? ' alt' : ''}" data-sec="${id}"${extra}><div class="wrap">${body}</div></section>`;

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

  // 1. Hero: the owner's design.
  const clutch = site.badges.find(([href]) => String(href).includes('clutch.co'));
  const heroHtml = `<section class="hp-hero" data-sec="hero"><div class="wrap hp-hero-g">
    <div>
      <p class="eyebrow">${icon('globe')}${inner(introP[0])}</p>
      <h1>Website Maintenance Services <span class="hl">&amp; Support</span></h1>
      <p class="hp-lead">We keep your website secure, fast and up to date every month, so you never lose a customer to a broken or hacked site.</p>
      <ul class="hp-ticks">${['Weekly updates, backups and security scans', 'Real engineers make your edits: 1–6 hours a month, by plan', `Plans from ${money(low)}/mo · Free hosting for 1 year · No contract`].map((t) => `<li>${tick}${t}</li>`).join('')}</ul>
      <div class="btn-row cta-row hp-cta"><a class="btn primary" href="#pricing">See plans &amp; pricing${icon('arrow')}</a><a class="btn ghost" href="#quote">Get a free quote</a></div>
      <div class="hp-proof">
        <span class="hp-rate" data-claim-ok="owner 2026-11-03"><span class="hp-g3" role="img" aria-label="Google, Google Maps and Google Business Profile">${design.googleIcons.map((s) => `<i>${s.replace('<svg ', '<svg aria-hidden="true" ')}</i>`).join('')}</span><span><span class="hp-stars" aria-hidden="true">★★★★★</span><a href="${clutch?.[0]}" rel="noopener">5.0 on Clutch</a></span></span>
        <span class="hp-gp">${design.partnerIcon}<span><b>Google Partner</b><small>Certified</small></span></span>
        <span class="hp-hstats">${[['650+', 'websites maintained'], ['12+', 'years experience'], ['120+', 'websites built']].map(([v, l]) => `<span><b>${v}</b><small>${l}</small></span>`).join('')}</span>
      </div>
    </div>
    <div class="hp-hero-r" id="quote">
      <div class="hp-float f1" aria-hidden="true"><span class="fi">${icon('pulse')}</span><span>Uptime 99.9%<small>Last 30 days</small></span></div>
      ${quickForm('hero', 'Get a free website check', 'Tell us about your site. We reply within 24 hours with a free check and your exact price.')}
      <div class="hp-float f2" aria-hidden="true"><span class="fi">${icon('db')}</span><span>Backup complete<small>Today, 03:00</small></span></div>
    </div>
  </div></section>`;

  // 2. Find us on: the real badge images, scrolling.
  const badgeItems = site.badges.map(([href, src, alt, w, h]) => `<li><a href="${href}" rel="noopener"><img src="${src}" alt="${alt}" width="${w}" height="${h}" loading="lazy"></a></li>`);
  const trustHtml = `<section class="hp-trust" data-sec="find-us" aria-label="Find us on"><div class="wrap hp-trust-g"><p class="hp-trust-t"><b>Find us on</b>Verified agency profiles</p>${marquee(badgeItems)}</div></section>`;

  // 3. Platforms and stats.
  const plat = (p: (typeof design.platforms)[number]) => `<li class="hp-plat"><span class="hp-plat-ic${p.dark ? ' dk' : ''}" style="--bc:${p.color}"><svg viewBox="${p.box}" aria-hidden="true">${p.svg}</svg></span>${p.name}</li>`;
  const STAT_LABEL: Record<string, string> = { built: 'websites built' };
  const platsHtml = `<div class="head fade center"><p class="eyebrow">Every platform</p><h2>We maintain the platform <span class="hl">you already use</span></h2><p class="intro">WordPress, Shopify, Magento, Wix, Drupal and 25+ more. If it runs a website, we can look after it.</p></div>
    </div>${marquee(design.platforms.filter((p) => p.row === 0).map(plat))}${marquee(design.platforms.filter((p) => p.row === 1).map(plat), ' rev')}<div class="wrap">
    <div class="hp-stats fade">${site.stats.map(([v, l]) => `<div class="hp-stat"><b>${v}</b><span>${STAT_LABEL[l] ?? l}</span></div>`).join('')}</div>
    <div class="hp-story">
      <div class="card fade"><p class="big">${inner(introP[1])}</p><ul class="chips"><li>${alwaysOn}</li><li>Security &amp; Backups</li><li>Updates &amp; Fixes</li><li>24/7 Support</li></ul><div class="btn-row">${linkBtns(introP[3])}</div></div>
      <div class="card fade"><p>${site.domainLine}</p><p><strong>${site.statsLine}</strong></p><div class="btn-row"><a class="btn primary" href="/works/">See our work${icon('arrow')}</a><a class="btn ghost" href="/website-maintenance-case-study/">Read case studies</a></div></div>
    </div>`;

  // 4. What's included: one bento. The old "take care of", "every plan" and "one place" lists sit inside the cards they belong to.
  const proCards = pro.find('.card').toArray().map((c) => ({ h: inner($(c).find('h3')), p: inner($(c).find('p')) }));
  if (proCards.length !== 6) throw new Error('home included cards changed');
  const careItems = care.find('.card').toArray().map((c) => ({ s: inner($(c).find('strong')), span: inner($(c).find('.pair span')) }));
  const careLines = care.children('p').toArray().map((p) => txt(p));
  const careStats = careLines.slice(1, 9).reduce<string[][]>((all, line, i, list) => (i % 2 ? all : [...all, [line, list[i + 1]]]), []);
  if (careStats.length !== 4 || !/^12\+$/.test(careLines[1]) || careItems.length !== 6) throw new Error('home care block changed');
  const everyItems = faqBlock.children('.card').toArray().map((c) => txt(c));
  const placeItems = [...new Set(oneplace.find('li').toArray().map((l) => txt(l)))];
  if (everyItems.length !== 5 || placeItems.length !== 6) throw new Error(`home lists changed: ${everyItems.length} ${placeItems.length}`);
  const used = new Set<string>();
  const pick = (list: string[], re: RegExp) => list.filter((t) => re.test(t) && !used.has(t) && used.add(t));
  const careLi = (re: RegExp) => careItems.filter((c) => re.test(c.s) && !used.has(c.s) && used.add(c.s)).map((c) => `<li>${tick}<span><b>${c.s}</b> ${c.span}</span></li>`);
  const plain = (items: string[]) => items.map((t) => `<li>${tick}<span>${t}</span></li>`);
  const list = (items: string[]) => (items.length ? `<ul class="hp-list">${items.join('')}</ul>` : '');
  const MINI: Record<string, string> = {
    scan: '<div class="hp-mini scan"><i></i></div>',
    bars: `<div class="hp-mini bars">${[40, 55, 48, 62, 58, 70, 92].map((h, i) => `<i style="height:${h}%"${i === 6 ? ' class="now"' : ''}></i>`).join('')}</div>`,
    spark: '<svg class="hp-mini spark" viewBox="0 0 200 36" preserveAspectRatio="none"><path d="M0 26 L20 22 L40 24 L60 14 L80 18 L100 10 L120 14 L140 8 L160 12 L180 6 L200 9" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>',
  };
  const cell = (ic: string, h: string, p: string, items: string[], mini = '') => `<article class="hp-bc fade"><span class="hp-bc-ic">${icon(ic)}</span><h3>${h}</h3><p>${p}</p>${list(items)}${mini ? `<div aria-hidden="true">${MINI[mini]}</div>` : ''}</article>`;
  const [sec1, upd, bak, spd, upt, cnt] = proCards;
  const cells = [
    cell('refresh', upd.h, upd.p, [...careLi(/Updates/), ...plain(pick(everyItems, /CMS/)), ...plain(pick(placeItems, /^(Website Updates|WordPress)$/))]),
    cell('shield', sec1.h, sec1.p, [...careLi(/Security/), ...plain(pick(everyItems, /Security/))], 'scan'),
    cell('db', bak.h, bak.p, [...careLi(/Backup/), ...plain(pick(everyItems, /Backup/)), ...plain(pick(placeItems, /Backup/))], 'bars'),
    cell('pulse', upt.h, upt.p, [...careLi(/Monitoring/), ...plain(pick(everyItems, /Uptime/))], 'spark'),
    cell('gauge', spd.h, spd.p, careLi(/Speed/)),
    cell('chat', cnt.h, cnt.p, [...plain(pick(everyItems, /Content/)), ...plain(pick(placeItems, /Content/)), `<li>${tick}<span>${careLines[0].replace(/\s*See full checklist.*/, '')}</span></li>`]),
    cell('search', careItems[4].s, careItems[4].span, plain(pick(placeItems, /^SEO$/))),
    cell('server', pick(placeItems, /Hosting/)[0], 'Every plan includes free hosting for the first year.', plain(['2 free webmail accounts'])),
  ];
  used.add(careItems[4].s);
  const left = [...careItems.map((c) => c.s), ...everyItems, ...placeItems].filter((t) => !used.has(t));
  if (left.length) throw new Error(`home included items not placed: ${left.join(', ')}`);
  const big = `<article class="hp-bc big fade"><span class="hp-bc-ic">${icon('check')}</span><h3>${inner(oneplace.find('h2'))}</h3><p>${inner(oneplace.children('p').first())}</p>
    <div class="hp-big-art" aria-hidden="true">${['server', 'pen', 'search', 'refresh', 'db', 'layout'].map((n) => `<i>${icon(n)}</i>`).join('')}</div><p class="hp-big-label">${txt(care.find('h2').first())}</p><div class="hp-big-stats">${careStats.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div></article>`;
  const proPs = pro.children('p').toArray();
  const proLink = proPs.find((p) => $(p).find('a').length && txt($(p).find('a')) === txt(p));
  const includedHtml = head(inner(faqBlock.find('h3').first()), txt(pro.find('h2').first()), inner(proPs[0]), 'Professional')
    + `<div class="hp-bento">${big}${cells.join('')}</div>
    <div class="callout fade"><div><p>${inner(proPs[1])}</p><p>${txt(proPs[3])}</p></div><div class="act"><a class="btn primary" href="${hrefOf(proLink!)}">${txt(proLink!)}${icon('arrow')}</a><a class="btn ghost" href="/website-maintenance-checklist/">See full checklist →</a></div></div>`;

  // 5. Pricing.
  const pricingHtml = `<div class="head fade center"><p class="eyebrow">Simple pricing</p><h2>Plans &amp; pricing, <span class="hl">no surprises</span></h2><p class="intro">Every plan includes free hosting for the first year and 2 webmail accounts. Pay yearly and get ${prices.annualNote.en}.</p></div>`
    + plansHtml(' fade')
    + `<div class="callout fade"><div><p><strong>No contract. Cancel anytime.</strong></p></div><div class="act"><a class="btn ghost" href="/monthly-website-maintenance-packages/">Compare all features</a><a class="btn ghost" href="/ecommerce-website-maintenance-packages/">Running an online store? Store plans from $199</a></div></div>`;

  // 6. Process: the owner's 5-step design with the old step text.
  const STEP = ['tag', 'chat', 'file', 'key', 'search'];
  const CHIP = ['2 minutes', '15-minute call', 'Same day', '5 minutes', 'Day 1–2'];
  const stepCards = started.find('.card').toArray().filter((c) => $(c).find('h3').length);
  if (stepCards.length !== 5) throw new Error('home steps changed');
  const processHtml = head('How it works', txt(started.find('h2').first()), inner(started.children('p').first()), 'Get Started')
    + `<ol class="hp-steps">${stepCards.map((c, i) => `<li class="hp-step fade"><div class="hp-step-top"><span class="hp-step-n">${txt($(c).find('p').first())}</span><span class="hp-step-ic">${icon(STEP[i])}</span></div><div><h3>${inner($(c).find('h3'))}</h3><p>${inner($(c).find('p').last())}</p><span class="hp-chip">${icon('clock')}${CHIP[i]}</span></div></li>`).join('')}</ol>
    <div class="btn-row center">${linkBtns(started.children('p').last())}</div>`;

  // 7. Monthly report.
  const reportHtml = head(LABELS.report, 'What a monthly report looks like', 'An example of the numbers you would see. It is not real client data.', 'monthly report')
    + `<div class="card report fade">
      <div class="report-top"><span>Monthly report, yourwebsite.com</span><span class="tag">Example</span></div>
      <div class="grid g4 metrics"><div class="metric"><span>Updates applied</span><b>14</b></div><div class="metric"><span>Backups completed</span><b>30</b></div><div class="metric"><span>Malware found</span><b>0</b></div><div class="metric"><span>Edit time used</span><b>1h 40m</b></div></div>
    </div>`;

  // 8. Case study: the old 4 numbers with the owner's speed bars, then the owner's review cards (placeholders).
  const caseTags = ['Healthcare', 'WordPress', 'USA', 'Monthly Maintenance'];
  if (txt(pOf(results, /^Healthcare WordPress USA/)) !== caseTags.join(' ')) throw new Error('home case study tags changed');
  const metrics = results.find('.card').toArray().map((c) => ({ label: inner($(c).find('p').first()), before: inner($(c).find('.pair strong')), after: inner($(c).find('.pair span')) }));
  const speed = metrics.find((m) => /Speed/.test(m.label));
  const seconds = (v?: string) => parseFloat(v ?? '');
  if (!speed || !(seconds(speed.before) > seconds(speed.after))) throw new Error('home case study speed changed');
  const pct = Math.round((seconds(speed.after) / seconds(speed.before)) * 100);
  const reviews = [1, 2, 3].map((i) => `<figure class="hp-tq fade"><div class="hp-stars" aria-hidden="true">★★★★★</div><blockquote>“[Real client quote ${i} goes here — 2 or 3 sentences about the problem we solved and the result.]”</blockquote><figcaption><span class="hp-av">${['AB', 'CD', 'EF'][i - 1]}</span><span><b>[Client name]</b><small>[Role, Company · Country]</small></span><span class="hp-src">via Clutch</span></figcaption></figure>`).join('');
  const resultsHtml = head(txt(pOf(oneplace, /^Real Results$/)), inner(results.find('h2')), inner(results.children('p').first()), 'Results')
    + `<article class="hp-case fade">
      <div class="hp-case-l"><p class="eyebrow">${txt(pOf(results, /^Case Study$/))} · Healthcare</p><h3>${inner(results.find('h3').first())}</h3><ul class="chips">${caseTags.map((t) => `<li>${t}</li>`).join('')}</ul><p>${inner(pOf(results, /^This mental-health/))}</p><div class="btn-row">${linkBtns(pOf(results, /^Read the Full Case Study/))}</div></div>
      <div class="hp-case-r"><div class="hp-big-num">${speed.before} → ${speed.after}<small>page load time</small></div>
        <div class="hp-bar-row"><div class="hp-bar-label"><span>Before</span><span>${speed.before}</span></div><div class="hp-bar" aria-hidden="true"><i class="b1"></i></div></div>
        <div class="hp-bar-row"><div class="hp-bar-label"><span>After</span><span>${speed.after}</span></div><div class="hp-bar" aria-hidden="true"><i class="b2" style="width:${pct}%"></i></div></div>
        <div class="hp-metrics">${metrics.map((m) => `<div><strong>${m.label}</strong><div class="hp-metric-v"><s>${m.before}</s>${icon('arrow')}<span>${m.after}</span></div></div>`).join('')}</div>
      </div>
    </article>
    <div class="hp-tqs" data-claim-ok="owner 2026-11-03, placeholders">${reviews}</div>
    <p class="hp-ph-note">Design placeholder: replace with 3 real client reviews (name, company, country, written OK) before launch.</p>`;

  // 9. Why it matters, explore, our services.
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

  const SVC: Record<string, string> = { 'Website Design': 'layout', 'Website Migration': 'move', 'Website Redesign': 'pen', 'Website Repair': 'wrench', 'Website SEO': 'search', 'Speed Optimization': 'gauge', 'Website Updates': 'refresh', 'White-Label Maintenance': 'tag', 'WordPress Backups': 'db', 'Malware Removal': 'shield' };
  const exploreHtml = head(txt(pOf(care, /^Complete Website Support$/)), inner(explore.find('h2')), inner(explore.children('p').first()), 'Website Services')
    + `<div class="grid g2">${explore.find('.card').toArray().map((c, i) => {
      const title = txt($(c).find('h3'));
      const body = txt($(c).find('p')).replace(/\s*Explore service$/, '');
      return `<a class="card svc fade" href="${$(c).find('a').attr('href')}">${badge(SVC[title] ?? 'wrench', (i % 6) + 1)}<div><h3>${title}</h3><p>${body}</p><span class="go">Explore service ${icon('arrow')}</span></div></a>`;
    }).join('')}</div>
    <div class="callout fade"><div><p>${inner(pOf(explore, /^Not sure/))}</p></div></div>`;

  const imageCards = ours.find('.card').toArray().filter((c) => $(c).find('img').length);
  const oursHtml = head(LABELS.ours, inner(ours.find('h2')), inner(ours.children('p').first()), 'Services')
    + `<div class="grid g4">${imageCards.map((c) => {
      const img = $(c).find('img');
      const ps = $(c).find('p').toArray();
      return `<article class="card svc-img fade"><img src="${img.attr('src')}" alt="${img.attr('alt')}" width="${img.attr('width')}" height="${img.attr('height')}" loading="lazy"><div><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[0])}</p><div class="btn-wrap"><a class="btn ghost" href="${hrefOf(ps[1])}">${inner($(ps[1]).find('a'))}${icon('arrow')}</a></div></div></article>`;
    }).join('')}</div>`;

  // 10. Compare: the owner's table. Response and report rows follow the approved plan facts.
  const compareRows = [
    ['Monthly cost', `${money(low)}–${money(high)}, fixed`, '$50–$150, varies', '$150–$500+'],
    ['Contract', 'None, cancel anytime', 'Usually none', 'Often 3–12 months'],
    ['Response', '4 hours to 2 business days, by plan', 'When available', '1–3 days'],
    ['Backups &amp; security', 'Included', 'Extra', 'Included'],
    ['Free hosting &amp; email', 'First year', 'No', 'No'],
    ['Monthly report', 'Growth and Business', 'Rarely', 'Yes'],
  ];
  const compareHtml = head(LABELS.compare, 'How we compare', LABELS.compareIntro, 'compare')
    + `<div class="fade hp-cmp-wrap"><table class="hp-cmp"><thead><tr><td></td><th scope="col" class="us">WMS</th><th scope="col">Freelancer</th><th scope="col">Typical agency</th></tr></thead><tbody>${compareRows.map(([h, us, fr, ag]) => `<tr><th scope="row">${h}</th><td class="us" data-label="WMS">${us}</td><td data-label="Freelancer">${fr}</td><td data-label="Typical agency">${ag}</td></tr>`).join('')}</tbody></table></div>
    <div class="btn-row center"><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${icon('arrow')}</a></div>`;

  // 11. Guides, partner, why choose us, countries.
  const guidesHtml = head(txt(pOf(results, /^Guides & Resources$/)), inner(guides.find('h2')), inner(guides.children('p').first()), 'Guides')
    + `<div class="grid g3">${guides.find('.card').toArray().map((c) => {
      const ps = $(c).find('p').toArray();
      return `<article class="card guide fade"><p class="tag">${inner(ps[0])}</p><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[1])}</p><a class="btn ghost" href="${hrefOf(ps[2])}">${inner($(ps[2]).find('a'))}</a></article>`;
    }).join('')}</div>
    <div class="btn-row row-end">${linkBtns(guides.children('p').last(), ['primary'])}</div>`;

  const partnerHtml = head(txt(pOf(why, /^Who We Are$/)), inner(partner.find('h2')), inner(partner.children('p').first()), 'Partner')
    + `<div class="grid g2">${partner.find('li').toArray().map((l, i) => `<div class="card tile fade">${badge(['shield', 'db', 'gauge', 'file'][i], i + 1)}<strong>${inner(l)}</strong></div>`).join('')}</div>
    <div class="callout fade"><div><p><strong>${txt(pOf(why, /^24\/7 Support$/))}</strong></p><p>${txt(pOf(why, /^Always Available$/))}</p></div><div class="act">${linkBtns(partner.children('p').last())}</div></div>`;

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

  // 12. FAQ: all 12, two columns, all closed.
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const faqHtml = head(LABELS.faq, txt(faqBlock.find('h2').first()), LABELS.faqIntro, 'FAQs')
    + `<div class="faq fade">${faqs.map((f) => `<details><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`;

  return `${heroHtml}
  ${trustHtml}
  ${sec('platforms', platsHtml, ' aria-label="Platforms we support"')}
  ${sec('included', includedHtml)}
  ${sec('pricing', pricingHtml, ' id="pricing"')}
  ${sec('process', processHtml)}
  ${sec('report', reportHtml)}
  ${sec('results', resultsHtml)}
  ${sec('why', whyHtml)}
  ${sec('explore', exploreHtml)}
  ${sec('services', oursHtml)}
  ${sec('compare', compareHtml)}
  ${sec('guides', guidesHtml)}
  ${sec('partner', partnerHtml)}
  ${sec('choose', chooseHtml)}
  ${sec('countries', countriesHtml)}
  ${sec('faq', faqHtml)}`;
}
