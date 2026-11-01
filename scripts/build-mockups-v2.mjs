// Builds homepage mockups A and B (CLAIMS-AND-DESIGN.md section B). Prices come from prices.json, and the
// old homepage text from the current build in dist/, so nothing here is retyped.
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
  arrow: ic('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  plus: ic('<path d="M5 12h14"/><path d="M12 5v14"/>'),
};

// Old homepage text, from the build.
const $ = cheerio.load(readFileSync('dist/index.html', 'utf8'));
// Call-to-action lines (a paragraph of links only) become real buttons.
const ctaLinks = (html) => html.replace(/<p>((?:\s*<a href="[^"]*">[^<]*<\/a>\s*){2,})<\/p>/g, (_, links) => {
  let n = 0;
  return `<div class="btn-row" style="margin-top:18px">${links.replace(/<a href="([^"]*)">/g, (_m, h) => `<a class="btn ${n++ ? 'ghost' : 'primary'}" href="${h}">`)}</div>`;
});
const fixImg = (html) => ctaLinks(html.replace(/(src|href)="\/(wp-content|fonts)\//g, '$1="/public/$2/').replace(/srcset="[^"]*"/g, ''));
const home = $('.home-section').first();
const blocks = [];
home.children('.prose').each((i, e) => blocks.push(`<section class="block fade${i === 0 ? ' intro' : ''}">${fixImg($(e).html()).replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>')}</section>`));
if (blocks.length < 2) throw new Error('home text not found in dist/');
const moreBoxes = $('details.more').toArray().map((d) => {
  const title = $(d).find('summary').first().text().trim();
  return `<details class="more"><summary><span>${title}</span>${I.plus}</summary><div class="more-in">${fixImg($(d).children('.prose').html() ?? '')}</div></details>`;
});
const faqs = $('.faq details').toArray().map((d) => `<details><summary><span>${$(d).find('summary').text()}</span>${I.plus}</summary><p>${$(d).find('p').html()}</p></details>`);
if (faqs.length < 10) throw new Error('FAQ not found in dist/');
const faqExtra = fixImg($('.faq').nextAll('.prose').first().html() ?? '');
const finalProse = cheerio.load($('.cta-final .prose').html() ?? '', null, false);
const finalLinks = finalProse('a').toArray().map((a, i) => `<a class="btn ${i === 0 ? 'white' : 'ghost'}" href="${finalProse(a).attr('href')}">${finalProse(a).text()}</a>`);
finalProse('a').each((_, a) => { const p = finalProse(a).closest('p'); finalProse(a).remove(); if (p.length && !p.text().trim()) p.remove(); });
const footer = $('footer').first();
const footerHtml = fixImg(footer.find('.wrap').first().html() ?? '');

// Example visuals. Not real client data; each one carries the Example label.
const uptimeBars = Array.from({ length: 30 }, (_, i) => `<rect x="${i * 14}" y="0" width="10" height="44" rx="3" fill="${i === 17 ? 'var(--line-strong)' : 'var(--ok)'}"/>`).join('');
const dashboard = `<div class="dash-wrap">
  <div class="dash" role="img" aria-label="Example maintenance dashboard. Not real client data.">
    <div class="dash-top"><span class="dots"><i></i><i></i><i></i></span><span>yourwebsite.com</span><span class="tag">Example</span></div>
    <div class="dash-body">
      <div class="panel">
        <div class="panel-head"><b><i class="pulse"></i>Site is up</b></div>
        <svg class="uptime" viewBox="0 0 416 44" aria-hidden="true">${uptimeBars}</svg>
        <div class="uptime-scale"><span>Uptime, last 30 days</span><span>Today</span></div>
      </div>
      <div class="tiles">
        <div class="tile-s">${I.refresh}<span>Updates</span><b>14 applied</b></div>
        <div class="tile-s">${I.db}<span>Last backup</span><b>Finished</b></div>
        <div class="tile-s">${I.shield}<span>Security scan</span><b>Clean</b></div>
      </div>
      <div class="panel">
        <ul class="log">
          <li>${I.check}<span>Plugins and theme updated</span><time>Today</time></li>
          <li>${I.check}<span>Backup finished</span><time>Today</time></li>
          <li>${I.check}<span>Malware scan: clean</span><time>Yesterday</time></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="float f1" aria-hidden="true">${I.check}Backup finished</div>
  <div class="float f2" aria-hidden="true">${I.shield}Malware scan: clean</div>
  <div class="float f3" aria-hidden="true">${I.refresh}Plugins updated</div>
</div>`;

const bento = `<div class="bento">
  <article class="cell w3 c1 fade"><div class="badge">${I.refresh}</div><h3>Updates</h3><p>WordPress, plugins and themes kept current.</p>
    <div class="mini" aria-hidden="true"><ul class="rows"><li>WordPress core<em>Updated</em></li><li>Contact form plugin<em>Updated</em></li><li>Theme<em>Updated</em></li></ul></div></article>
  <article class="cell w3 c2 fade"><div class="badge">${I.db}</div><h3>Backups</h3><p>Regular copies of your site, stored safely.</p>
    <div class="mini" aria-hidden="true"><div class="cal">${Array.from({ length: 30 }, () => '<i></i>').join('')}</div></div></article>
  <article class="cell w2 c3 fade"><div class="badge">${I.shield}</div><h3>Security</h3><p>Scans for malware and known weak spots.</p>
    <div class="mini" aria-hidden="true"><div class="scan">${I.shield}<div><b>Clean</b><span>Malware scan</span></div></div></div></article>
  <article class="cell w2 c4 fade"><div class="badge">${I.pulse}</div><h3>Uptime monitoring</h3><p>We are alerted when your site goes down.</p>
    <div class="mini" aria-hidden="true"><div class="bars">${[62, 74, 58, 80, 68, 88, 72, 92, 66, 84, 76, 95].map((h) => `<i style="height:${h}%"></i>`).join('')}</div></div></article>
  <article class="cell w2 c5 fade"><div class="badge">${I.gauge}</div><h3>Speed</h3><p>Images, caching and code tuned for faster pages.</p>
    <div class="mini" aria-hidden="true"><svg class="gauge" viewBox="0 0 120 68"><path d="M10 60a50 50 0 0 1 100 0" fill="none" stroke="var(--mini)" stroke-width="12" stroke-linecap="round"/><path d="M10 60a50 50 0 0 1 84-36" fill="none" stroke="var(--c, var(--accent))" stroke-width="12" stroke-linecap="round"/><path d="m60 60 22-24" stroke="var(--head)" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--head)"/></svg></div></article>
  <article class="cell wide c6 fade"><div><div class="badge">${I.chat}</div><h3>Edits and support</h3><p>Small changes each month, from a real person.</p></div>
    <div class="mini" aria-hidden="true"><div class="bubble">Can you change the opening hours on the contact page?</div><div class="bubble me">Done. Please take a look.</div></div></article>
</div>`;

const planCard = (p) => {
  const slug = p.name.toLowerCase();
  return `<article class="plan fade${p.popular ? ' pop' : ''}">
    ${p.popular ? '<span class="pop-tag">Most popular</span>' : ''}
    <h3>${p.name}</h3>
    <div class="price"><b data-m="${money(p.monthly)}" data-y="${money(p.annual)}">${money(p.monthly)}</b><span data-m="/month" data-y="/year">/month</span></div>
    <p class="note" data-m="${prices.firstMonthNote.en}" data-y="${prices.annualNote.en}">${prices.firstMonthNote.en}</p>
    <a class="btn ${p.popular ? 'primary' : 'ghost'}" href="/get-a-free-quote/#${slug}">Choose ${p.name}${I.arrow}</a>
    <ul class="feat">${p.includes.map((f) => `<li>${I.check}<span${explain[f] ? ` title="${explain[f]}"` : ''}>${f}</span></li>`).join('')}</ul>
  </article>`;
};

const [low, , high] = prices.plans.map((p) => p.monthly);
const page = (id, name) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mockup ${id}: ${name}</title>
<meta name="description" content="Design mockup for owner review. Not the live site.">
<meta name="robots" content="noindex, nofollow">
<link rel="preload" href="/public/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<style>${readFileSync(`${dir}base.css`, 'utf8')}${readFileSync(`${dir}${id.toLowerCase()}.css`, 'utf8')}</style>
</head><body>
<header class="top"><div class="wrap">
  <a class="logo" href="/" aria-label="Home"><img src="/public/wp-content/uploads/2025/11/Colorful-Website-Maintenance-services-Logo.png" alt="Website Maintenance Services" width="325" height="108"></a>
  <nav class="nav" aria-label="Main"><a href="/#services">Services</a><a href="/monthly-website-maintenance-packages/">Pricing</a><a href="/blogs/">Blog</a><a href="/about-us/">About</a><a href="/contact/">Contact</a><a class="btn primary small" href="/monthly-website-maintenance-packages/">See plans</a></nav>
</div></header>

<main>
<section class="hero"><div class="wrap hero-grid">
  <div>
    <h1>Website <em>Maintenance</em> Services &amp; Support</h1>
    <p class="sub">Your site kept fast, secure and up to date, by engineers who show you what they did.</p>
    <ul class="offer"><li>Plans from ${money(low)}/mo</li><li>First month free</li><li>Free hosting for 1 year</li><li>No contract</li></ul>
    <div class="btn-row"><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${I.arrow}</a><a class="btn ghost" href="/free-website-maintenance-audit/">Get a free website check</a></div>
    <ul class="facts"><li>${I.check}Dhaka-based team</li><li>${I.check}US &amp; UK hours</li><li>${I.check}30+ websites maintained</li></ul>
  </div>
  <div>${dashboard}<p class="dash-note">Example dashboard. It is not real client data.</p></div>
</div></section>

<section class="platforms" aria-label="Platforms we support"><div class="wrap">
  <p>Platforms we support</p>
  <ul>${Object.entries(logos).map(([n, svg]) => `<li>${svg}${n}</li>`).join('')}</ul>
</div></section>

<section class="band"><div class="wrap">
  <div class="head center fade"><h2>What's included</h2><p>The routine work a website needs, done for you each month.</p></div>
  ${bento}
  <div class="more-box">${moreBoxes.join('')}</div>
</div></section>

<section class="band glow"><div class="wrap">
  <div class="head center fade"><h2>Plans and pricing</h2><p>Every price is on this page.</p></div>
  <div class="toggle-row"><div class="toggle" role="group" aria-label="Billing period"><button type="button" data-period="m" aria-pressed="true">Monthly</button><button type="button" data-period="y" aria-pressed="false">Annual</button></div><span class="save">${prices.annualNote.en}</span></div>
  <div class="plans">${prices.plans.map(planCard).join('')}</div>
  <div class="plan-foot"><span>No contract. Cancel anytime.</span><a class="btn ghost small" href="/monthly-website-maintenance-packages/">Compare all features</a><a class="btn ghost small" href="/ecommerce-website-maintenance-packages/">Running an online store? Store plans from $199</a></div>
</div></section>

<section class="band alt"><div class="wrap">
  <div class="head center fade"><h2>How it works</h2></div>
  <ol class="steps">
    <li class="fade"><div class="num">1</div><h3>Free check</h3><p>Send your URL. We look at your site and tell you what needs attention.</p></li>
    <li class="fade"><div class="num">2</div><h3>Pick a plan</h3><p>Choose a plan. We talk through it on a short call.</p></li>
    <li class="fade"><div class="num">3</div><h3>We set you up</h3><p>We get access to your site and set up your plan.</p></li>
    <li class="fade"><div class="num">4</div><h3>We take care of it</h3><p>We do the work every month and send you a plain report.</p></li>
  </ol>
</div></section>

<section class="band"><div class="wrap">
  <div class="head fade"><h2>What a monthly report looks like</h2><p>An example of the numbers you would see. It is not real client data.</p></div>
  <div class="report fade">
    <div class="report-top"><span>Monthly report, yourwebsite.com</span><span class="tag">Example</span></div>
    <div class="metrics"><div class="metric"><span>Updates applied</span><b>14</b></div><div class="metric"><span>Backups completed</span><b>30</b></div><div class="metric"><span>Malware found</span><b>0</b></div><div class="metric"><span>Edit time used</span><b>1h 40m</b></div></div>
  </div>
  <div style="margin-top:72px" class="fade">
    <p class="line-a1">30+ websites built and maintained for businesses in Canada, the UK, the Caribbean and Bangladesh.</p>
    <div class="todo">Mockup note: the portfolio block goes here once the owner confirms the table.</div>
  </div>
</div></section>

<section class="band alt"><div class="wrap">
  <div class="head center fade"><h2>How we compare</h2></div>
  <div class="compare">
    <article class="vs us fade"><h3>WMS</h3><dl><div><dt>Price per month</dt><dd>${money(low)}–${money(high)}</dd></div><div><dt>Contract</dt><dd>None. Cancel anytime.</dd></div><div><dt>Monthly report</dt><dd>Growth and Business</dd></div></dl><a class="btn primary" href="/monthly-website-maintenance-packages/">See plans &amp; pricing${I.arrow}</a></article>
    <article class="vs fade"><h3>Freelancer</h3><dl><div><dt>Price per month</dt><dd>$50–$150</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
    <article class="vs fade"><h3>Typical agency</h3><dl><div><dt>Price per month</dt><dd>$149–$600+</dd></div><div><dt>Contract</dt><dd>Varies</dd></div><div><dt>Monthly report</dt><dd>Varies</dd></div></dl></article>
  </div>
</div></section>

<section class="band"><div class="wrap story">${blocks.join('\n')}</div></section>

<section class="band alt"><div class="wrap">
  <div class="head center fade"><h2>FAQs About Website Maintenance</h2></div>
  <div class="faq">${faqs.join('')}</div>
  ${faqExtra ? `<div class="faq-extra block">${faqExtra}</div>` : ''}
</div></section>

<div class="wrap final-wrap"><section class="final fade">${finalProse.html()}<div class="btn-row">${finalLinks.join('')}</div></section></div>
</main>

<footer class="foot"><div class="wrap">${footerHtml}</div></footer>
<div class="cookie" id="cookie"><span>We use cookies for analytics. <a href="/privacy-policy/">Privacy policy</a></span><button type="button">Accept</button><button type="button">Reject</button></div>
<script>
document.querySelectorAll('#cookie button').forEach(function(b){b.addEventListener('click',function(){document.getElementById('cookie').hidden=true})});
var t=document.querySelectorAll('.toggle button');
t.forEach(function(b){b.addEventListener('click',function(){t.forEach(function(x){x.setAttribute('aria-pressed',x===b)});var k=b.dataset.period;document.querySelectorAll('[data-m]').forEach(function(e){e.textContent=e.dataset[k]})})});
if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});document.querySelectorAll('.fade').forEach(function(e){o.observe(e)})}else{document.querySelectorAll('.fade').forEach(function(e){e.classList.add('in')})}
</script>
</body></html>`;

writeFileSync(`${dir}a-dark.html`, page('A', 'Dark premium'));
writeFileSync(`${dir}b-light.html`, page('B', 'Light vibrant'));
console.log('built a-dark.html, b-light.html');
