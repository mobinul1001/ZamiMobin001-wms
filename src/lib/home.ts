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

// The old homepage, split into its old sections.
function loadHome(html: string) {
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
  return { $, inner, txt, block, pOf, hrefOf, linkBtns, hl };
}

// Owner, 2026-11-04: the old "Your Dedicated Website Maintenance Partner" and "Why Choose Us?" text moved from the homepage to /about-us/.
export function homeAboutHtml(html: string) {
  const { $, inner, txt, block, pOf, linkBtns } = loadHome(html);
  const why = block(/^Why Website Maintenance Matters/);
  const partner = block(/^Your Dedicated/);
  const choose = block(/^Why Choose Us/);
  const CHOOSE = ['users', 'shield', 'file'];
  const VALUE = ['file', 'pulse', 'tag', 'users'];
  const values = $('.pair').toArray().filter((p) => /^(No Long-Term Contracts|Fast Response Times|Transparent Pricing|Expert Developers)/.test(txt($(p).find('strong'))));
  if (values.length !== 4) throw new Error(`about: home value lines ${values.length}`);
  return `<section class="sec alt" data-sec="partner"><div class="wrap">
    <div class="head"><p class="eyebrow">${txt(pOf(why, /^Who We Are$/))}</p><h2>${inner(partner.find('h2'))}</h2><p class="intro">${inner(partner.children('p').first())}</p></div>
    <div class="grid g2">${partner.find('li').toArray().map((l, i) => `<div class="card tile">${badge(['shield', 'db', 'gauge', 'file'][i], i + 1)}<strong>${inner(l)}</strong></div>`).join('')}</div>
    <div class="callout"><div><p><strong>${txt(pOf(why, /^24\/7 Support$/))}</strong></p><p>${txt(pOf(why, /^Always Available$/))}</p></div><div class="act">${linkBtns(partner.children('p').last())}</div></div>
    <div class="sub-head"><h3>${inner(choose.find('h2'))}</h3><p>${inner(choose.children('p').first())}</p></div>
    <div class="grid g3">${choose.find('h3').toArray().map((h, i) => {
      const next = $(h).next('p');
      return `<article class="card c${i + 1}"><div class="badge">${icon(CHOOSE[i])}</div><h3>${inner(h)}</h3><p>${next.length ? inner(next) : EXPERT_DRAFT}</p></article>`;
    }).join('')}</div>
    <div class="grid g4 gap-top">${values.map((p, i) => `<div class="card tile">${badge(VALUE[i], i + 1)}<div><strong>${inner($(p).find('strong'))}</strong><span>${inner($(p).find('span'))}</span></div></div>`).join('')}</div>
    <div class="btn-row row-end">${linkBtns(choose.children('p').last(), ['primary'])}</div>
  </div></section>`;
}

export function renderHome(html: string, faqs: { q: string; a: string }[]) {
  const { $, inner, txt, block, pOf, hrefOf, linkBtns, hl } = loadHome(html);
  const head =(eyebrow: string, h2: string, intro: string | string[] = [], word = '') => `<div class="head fade"><p class="eyebrow">${eyebrow}</p><h2>${hl(h2, word)}</h2>${[intro].flat().filter(Boolean).map((p) => `<p class="intro">${p}</p>`).join('')}</div>`;
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
  const ours = block(/^Our Website Maintenance Services/);
  const oneplace = block(/^Everything Your Website Needs/);
  const results = block(/^Real Maintenance Results/);
  const guides = block(/^Website Maintenance Guides/);
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
    <div class="hp-stats fade">${site.stats.map(([v, l]) => `<div class="hp-stat"><b>${v}</b><span>${STAT_LABEL[l] ?? l}</span></div>`).join('')}</div>`;

  // A row of cards that becomes a swipe carousel on phones (CSS scroll-snap, no script).
  const swipe = (cls: string, label: string, items: string) => `<div class="${cls} hp-swipe" role="region" aria-label="${label}" tabindex="0">${items}</div>`;
  // Extra items stay in the HTML; a checkbox shows them (no script).
  const more = (id: string, show: string, hide: string) => `<input class="hp-more-in sr-only" type="checkbox" id="${id}"><label class="btn ghost hp-more-btn" for="${id}"><span class="a">${show}</span><span class="b">${hide}</span>${icon('down')}</label>`;

  // 4. What's included (owner, 2026-11-04): the big card with the 4 stats and 8 short cards, one line each.
  // The old card text and the care lists stay in the HTML behind "Read more".
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
  const detail = (parts: string[], items: string[]) => `<details class="hp-card-more"><summary>Read more${icon('down')}</summary>${parts.map((p) => `<p>${p}</p>`).join('')}${list(items)}</details>`;
  const cell = (ic: string, h: string, line: string, more: string) => `<article class="hp-bc"><span class="hp-bc-ic">${icon(ic)}</span><h3>${h}</h3><p>${line}</p>${more}</article>`;
  const [sec1, upd, bak, spd, upt, cnt] = proCards;
  const oldCard = (c: { h: string; p: string }) => `<strong>${c.h}</strong> ${c.p}`;
  // Titles are the owner's; the one-liners come from the owner's design file, adjusted to the approved plan facts.
  const cells = [
    cell('refresh', 'Updates', 'Core, theme and plugin updates, checked on your live site after every run.', detail([oldCard(upd)], [...careLi(/Updates/), ...plain(pick(everyItems, /CMS/)), ...plain(pick(placeItems, /^(Website Updates|WordPress)$/))])),
    cell('shield', 'Security', 'Malware and vulnerability scans, firewall rules and login hardening.', detail([oldCard(sec1)], [...careLi(/Security/), ...plain(pick(everyItems, /Security/))])),
    cell('db', 'Backups', 'Weekly or daily off-site backups, kept 30–90 days.', detail([oldCard(bak)], [...careLi(/Backup/), ...plain(pick(everyItems, /Backup/)), ...plain(pick(placeItems, /Backup/))])),
    cell('pulse', 'Uptime', 'We get an alert within minutes if your site goes down.', detail([oldCard(upt)], [...careLi(/Monitoring/), ...plain(pick(everyItems, /Uptime/))])),
    cell('gauge', 'Speed', 'Caching, image and database tune-ups to keep pages fast.', detail([oldCard(spd), `<strong>${careItems[4].s}</strong> ${careItems[4].span}`], [...careLi(/Speed/), ...plain(pick(placeItems, /^SEO$/))])),
    cell('chat', 'Edits by real people', '1–6 hours a month of text, image and layout changes. Just email us.', detail([oldCard(cnt)], [...plain(pick(everyItems, /Content/)), ...plain(pick(placeItems, /Content/))])),
    cell('server', 'Free hosting + 2 webmail', 'Managed hosting free for the first year, plus 2 webmail accounts on your domain.', detail([`<strong>${pick(placeItems, /Hosting/)[0]}</strong> Every plan includes free hosting for the first year and 2 free webmail accounts.`], [])),
    cell('file', 'Monthly report', 'A plain-English report of everything we did, on Growth and Business.', detail([careLines[0].replace(/\s*See full checklist.*/, '')], [])),
  ];
  used.add(careItems[4].s);
  const left = [...careItems.map((c) => c.s), ...everyItems, ...placeItems].filter((t) => !used.has(t));
  if (left.length) throw new Error(`home included items not placed: ${left.join(', ')}`);
  const big = `<article class="hp-bc big"><span class="hp-bc-ic">${icon('check')}</span><h3>${inner(oneplace.find('h2'))}</h3><p>${inner(oneplace.children('p').first())}</p>
    <p class="hp-big-label">${txt(care.find('h2').first())}</p><div class="hp-big-stats">${careStats.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div></article>`;
  const proPs = pro.children('p').toArray();
  const proLink = proPs.find((p) => $(p).find('a').length && txt($(p).find('a')) === txt(p));
  const includedHtml = `<div class="head hp-head-split fade"><div><p class="eyebrow">${inner(faqBlock.find('h3').first())}</p><h2>${hl(txt(pro.find('h2').first()), 'Professional')}</h2></div>
      <div><p class="intro">${inner(introP[1])}</p>
      <details class="hp-read"><summary>Read more${icon('down')}</summary><p>${inner(proPs[0])}</p><ul class="chips"><li>${alwaysOn}</li><li>Security &amp; Backups</li><li>Updates &amp; Fixes</li><li>24/7 Support</li></ul><p>${inner(proPs[1])}</p><p>${txt(proPs[3])}</p><div class="btn-row">${linkBtns(introP[3])}</div></details></div></div>`
    + swipe('hp-bento', "What's included", [big, ...cells].join(''))
    + `<div class="btn-row center"><a class="btn primary" href="${hrefOf(proLink!)}">${txt(proLink!)}${icon('arrow')}</a><a class="btn ghost" href="/website-maintenance-checklist/">See full checklist →</a></div>`;

  // Trust strip under the results (owner, 2026-11-04). The long "who we are" and "why choose us" text is on /about-us/.
  const trustBar = `<section class="hp-trustbar" data-sec="trust" aria-label="Why clients choose us"><div class="wrap">
    <ul>${[['file', 'No contract'], ['pulse', 'Fast response'], ['tag', 'Transparent pricing'], ['users', 'Expert developers'], ['clock', '24/7 on Business']].map(([ic, t]) => `<li><span class="hp-tb-ic">${icon(ic)}</span>${t}</li>`).join('')}</ul>
    <a class="hp-tb-link" href="/about-us/">Learn More About Us${icon('arrow')}</a>
  </div></section>`;

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

  // 7. Results: case study, the monthly report example beside it, then the review cards (placeholders).
  const caseTags = ['Healthcare', 'WordPress', 'USA', 'Monthly Maintenance'];
  if (txt(pOf(results, /^Healthcare WordPress USA/)) !== caseTags.join(' ')) throw new Error('home case study tags changed');
  const metrics = results.find('.card').toArray().map((c) => ({ label: inner($(c).find('p').first()), before: inner($(c).find('.pair strong')), after: inner($(c).find('.pair span')) }));
  const speed = metrics.find((m) => /Speed/.test(m.label));
  const seconds = (v?: string) => parseFloat(v ?? '');
  if (!speed || !(seconds(speed.before) > seconds(speed.after))) throw new Error('home case study speed changed');
  const pct = Math.round((seconds(speed.after) / seconds(speed.before)) * 100);
  const reviews = [1, 2, 3].map((i) => `<figure class="hp-tq fade"><div class="hp-stars" aria-hidden="true">★★★★★</div><blockquote>“[Real client quote ${i} goes here — 2 or 3 sentences about the problem we solved and the result.]”</blockquote><figcaption><span class="hp-av">${['AB', 'CD', 'EF'][i - 1]}</span><span><b>[Client name]</b><small>[Role, Company · Country]</small></span><span class="hp-src">via Clutch</span></figcaption></figure>`).join('');
  const report = `<aside class="hp-report fade" aria-label="Example monthly report"><div class="hp-report-top"><h3>What a monthly report looks like</h3><span class="tag">Example</span></div><p>An example of the numbers you would see. It is not real client data.</p>
    <p class="hp-report-site">Monthly report, yourwebsite.com</p>
    <div class="hp-report-g">${[['Updates applied', '14'], ['Backups completed', '30'], ['Malware found', '0'], ['Edit time used', '1h 40m']].map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join('')}</div></aside>`;
  const resultsHtml = head(txt(pOf(oneplace, /^Real Results$/)), inner(results.find('h2')), inner(results.children('p').first()), 'Results')
    + `<div class="hp-results"><article class="hp-case fade">
      <div class="hp-case-l"><p class="eyebrow">${txt(pOf(results, /^Case Study$/))} · Healthcare</p><h3>${inner(results.find('h3').first())}</h3><ul class="chips">${caseTags.map((t) => `<li>${t}</li>`).join('')}</ul><p>${inner(pOf(results, /^This mental-health/))}</p><div class="btn-row">${linkBtns(pOf(results, /^Read the Full Case Study/))}</div></div>
      <div class="hp-case-r"><div class="hp-big-num">${speed.before} → ${speed.after}<small>page load time</small></div>
        <div class="hp-bar-row"><div class="hp-bar-label"><span>Before</span><span>${speed.before}</span></div><div class="hp-bar" aria-hidden="true"><i class="b1"></i></div></div>
        <div class="hp-bar-row"><div class="hp-bar-label"><span>After</span><span>${speed.after}</span></div><div class="hp-bar" aria-hidden="true"><i class="b2" style="width:${pct}%"></i></div></div>
        <div class="hp-metrics">${metrics.map((m) => `<div><strong>${m.label}</strong><div class="hp-metric-v"><s>${m.before}</s>${icon('arrow')}<span>${m.after}</span></div></div>`).join('')}</div>
      </div>
    </article>${report}</div>
    <div class="hp-tqs hp-swipe" role="region" aria-label="Client reviews" tabindex="0" data-claim-ok="owner 2026-11-03, placeholders">${reviews}</div>
    <p class="hp-ph-note">Design placeholder: replace with 3 real client reviews (name, company, country, written OK) before launch.</p>`;

  // 8. Services: the 4 illustrated cards on top, the other 10 services as a compact link grid.
  const SVC: Record<string, string> = { 'Website Design': 'layout', 'Website Migration': 'move', 'Website Redesign': 'pen', 'Website Repair': 'wrench', 'Website SEO': 'search', 'Speed Optimization': 'gauge', 'Website Updates': 'refresh', 'White-Label Maintenance': 'tag', 'WordPress Backups': 'db', 'Malware Removal': 'shield' };
  const imageCards = ours.find('.card').toArray().filter((c) => $(c).find('img').length);
  const svcCards = imageCards.map((c) => {
    const img = $(c).find('img');
    const ps = $(c).find('p').toArray();
    return `<article class="card svc-img"><img src="${img.attr('src')}" alt="${img.attr('alt')}" width="${img.attr('width')}" height="${img.attr('height')}" loading="lazy"><div><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[0])}</p><div class="btn-wrap"><a class="btn ghost" href="${hrefOf(ps[1])}">${inner($(ps[1]).find('a'))}${icon('arrow')}</a></div></div></article>`;
  }).join('');
  const svcLinks = explore.find('.card').toArray().map((c, i) => {
    const title = txt($(c).find('h3'));
    const body = txt($(c).find('p')).replace(/\s*Explore service$/, '');
    return `<a class="hp-svc-link" href="${$(c).find('a').attr('href')}">${badge(SVC[title] ?? 'wrench', (i % 6) + 1)}<span class="t">${title}${icon('arrow')}</span><span class="d">${body}</span><span class="sr-only">Explore service</span></a>`;
  }).join('');
  const servicesHtml = head(txt(pOf(care, /^Complete Website Support$/)), inner(ours.find('h2')), inner(ours.children('p').first()), 'Services')
    + swipe('grid g4 hp-svc-cards', 'Our website maintenance services', svcCards)
    + `<div class="sub-head fade"><h3>${inner(explore.find('h2'))}</h3><p>${inner(explore.children('p').first())}</p></div>`
    + swipe('hp-svc-links', 'More website services', svcLinks)
    + `<p class="hp-not-sure">${inner(pOf(explore, /^Not sure/))}</p>`;

  // 9. Comparison: two tabs (no script). Tables on wide screens, accordions on phones.
  const whyHead = why.find('thead th').toArray().map((h) => inner(h));
  const whyData = why.find('tbody tr').toArray().map((r) => $(r).find('td').toArray().map((d) => inner(d)));
  const whyRows = whyData.map((c) => `<tr><td>${c[0]}</td><td>${nope}${c[1]}</td><td class="td-good">${tick}${c[2]}</td></tr>`).join('');
  const whyAcc = whyData.map((c) => `<details><summary>${c[0]}${icon('plus')}</summary><dl><div><dt>${whyHead[1]}</dt><dd>${nope}${c[1]}</dd></div><div><dt>${whyHead[2]}</dt><dd>${tick}${c[2]}</dd></div></dl></details>`).join('');
  const [before, after] = faqBlock.find('.cards .card').toArray();
  const listOf = (c: Parameters<typeof $>[0], mark: string) => $(c).find('li').toArray().map((l) => `<li>${mark}<span>${inner(l)}</span></li>`).join('');
  const compareRows = [
    ['Monthly cost', `${money(low)}–${money(high)}, fixed`, '$50–$150, varies', '$150–$500+'],
    ['Contract', 'None, cancel anytime', 'Usually none', 'Often 3–12 months'],
    ['Response', '4 hours to 2 business days, by plan', 'When available', '1–3 days'],
    ['Backups &amp; security', 'Included', 'Extra', 'Included'],
    ['Free hosting &amp; email', 'First year', 'No', 'No'],
    ['Monthly report', 'Growth and Business', 'Rarely', 'Yes'],
  ];
  const WHO = ['WMS', 'Freelancer', 'Typical agency'];
  const cmpAcc = compareRows.map(([h, ...v]) => `<details><summary>${h}${icon('plus')}</summary><dl>${v.map((x, i) => `<div${i === 0 ? ' class="us"' : ''}><dt>${WHO[i]}</dt><dd>${x}</dd></div>`).join('')}</dl></details>`).join('');
  const compareHtml = head(txt(pOf(explore, /^Website Maintenance Explained/)), inner(why.find('h2')), inner(why.children('p').first()), 'Matters')
    + `<div class="hp-tabs fade">
      <input class="hp-tab-in sr-only" type="radio" name="cmp-tab" id="cmp-1" checked><label class="hp-tab" for="cmp-1">With vs without maintenance</label>
      <input class="hp-tab-in sr-only" type="radio" name="cmp-tab" id="cmp-2"><label class="hp-tab" for="cmp-2">WMS vs freelancer vs agency</label>
      <div class="hp-panel p1">
        <h3>${inner(why.find('h3').first())}</h3>
        <div class="tbl-wrap hp-desk"><table class="tbl"><thead><tr><th scope="col">${whyHead[0]}</th><th scope="col">${whyHead[1]}</th><th scope="col" class="th-good">${whyHead[2]}</th></tr></thead><tbody>${whyRows}</tbody></table></div>
        <div class="hp-acc hp-mob">${whyAcc}</div>
        <div class="grid g2 hp-ba"><div class="card"><h3>${inner($(before).find('h3'))}</h3><ul class="ba-list">${listOf(before, nope)}</ul></div><div class="card"><h3>${inner($(after).find('h3'))}</h3><ul class="ba-list">${listOf(after, tick)}</ul></div></div>
        <div class="callout"><div><p>${inner(pOf(why, /^Bottom line/))}</p><p>${txt(pOf(why, /^See exactly/))}</p></div><div class="act"><a class="btn primary" href="${hrefOf(pOf(why, /^Get the Free/))}">${txt(pOf(why, /^Get the Free/))}${icon('arrow')}</a></div></div>
      </div>
      <div class="hp-panel p2">
        <h3>How we compare</h3><p class="hp-panel-intro">${LABELS.compareIntro}</p>
        <div class="hp-cmp-wrap hp-desk"><table class="hp-cmp"><thead><tr><td></td>${WHO.map((w, i) => `<th scope="col"${i === 0 ? ' class="us"' : ''}>${w}</th>`).join('')}</tr></thead><tbody>${compareRows.map(([h, us, fr, ag]) => `<tr><th scope="row">${h}</th><td class="us">${us}</td><td>${fr}</td><td>${ag}</td></tr>`).join('')}</tbody></table></div>
        <div class="hp-acc hp-mob">${cmpAcc}</div>
        <div class="btn-row center"><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${icon('arrow')}</a></div>
      </div>
    </div>`;

  // 10. FAQ: 6 shown, all 12 in the HTML.
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const faqHtml = head(LABELS.faq, txt(faqBlock.find('h2').first()), LABELS.faqIntro, 'FAQs')
    + `<div class="hp-more-wrap">${more('faq-all', 'Show all questions', 'Show fewer questions')}<div class="faq fade">${faqs.map((f, i) => `<details${i >= 6 ? ' class="x"' : ''}><summary><span>${esc(f.q)}</span>${icon('plus')}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div>`;

  // 11. Guides (3 shown, all in the HTML) and countries.
  const guideCards = guides.find('.card').toArray().map((c, i) => {
    const ps = $(c).find('p').toArray();
    return `<article class="card guide${i >= 3 ? ' x' : ''}"><p class="tag">${inner(ps[0])}</p><h3>${inner($(c).find('h3'))}</h3><p>${inner(ps[1])}</p><a class="btn ghost" href="${hrefOf(ps[2])}">${inner($(ps[2]).find('a'))}</a></article>`;
  }).join('');
  const guidesHtml = head(txt(pOf(results, /^Guides & Resources$/)), inner(guides.find('h2')), inner(guides.children('p').first()), 'Guides')
    + `<div class="hp-more-wrap">${more('guides-all', 'Show more guides', 'Show fewer guides')}<div class="grid g3 hp-guides hp-swipe" role="region" aria-label="Guides" tabindex="0">${guideCards}</div></div>
    <div class="btn-row center">${linkBtns(guides.children('p').last(), ['primary'])}</div>
    <div class="hp-countries">${head(LABELS.where, inner(countries.find('h2')), inner(countries.children('p').first()), 'Serve')}
    <div class="grid g5">${countries.find('a').toArray().map((a, i) => `<a class="card country" href="${$(a).attr('href')}"><span class="badge c${(i % 6) + 1}">${icon('pin')}</span>${inner(a)}</a>`).join('')}</div></div>`;

  return `${heroHtml}
  ${trustHtml}
  ${sec('platforms', platsHtml, ' aria-label="Platforms we support"')}
  ${sec('included', includedHtml)}
  ${sec('results', resultsHtml)}
  ${trustBar}
  ${sec('pricing', pricingHtml, ' id="pricing"')}
  ${sec('compare', compareHtml)}
  ${sec('process', processHtml)}
  ${sec('services', servicesHtml)}
  ${sec('faq', faqHtml)}
  ${sec('guides', guidesHtml)}`;
}
