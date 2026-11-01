// Builds static mockups for owner approval (CLAIMS-AND-DESIGN.md B6). They stay outside the site
// build. Prices come from src/data/prices.json; blog text comes from the built page.
// Usage: node scripts/build-mockups.mjs (needs dist/ from npm run build)
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const prices = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));
mkdirSync('mockups/fonts', { recursive: true });
copyFileSync('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'mockups/fonts/inter-latin-wght-normal.woff2');
const LOGO = '../public/wp-content/uploads/2025/11/Colorful-Website-Maintenance-services-Logo.png';
const NUMBERS_LINE = '30+ websites built and maintained for businesses in Canada, the UK, the Caribbean and Bangladesh.';
const LOCATION_LINE = 'Dhaka-based team, working US & UK business hours.';
const money = (n) => `$${n.toLocaleString('en-US')}`;

// One-line feature explanations: new draft text for owner review.
const EXPLAIN = {
  'Weekly updates': 'We update WordPress, plugins and themes every week.',
  'Weekly backups': 'A full copy of your site is saved every week.',
  'Security scan': 'We check your site for malware and known weak spots.',
  'Uptime monitoring': 'We are alerted when your site goes down.',
  '1 hour edits/month': 'One hour of small text, image or layout changes each month.',
  'Daily backups': 'A full copy of your site is saved every day.',
  '3 hours edits/month': 'Three hours of small changes each month.',
  'Malware removal': 'If your site is infected, we clean it as part of the plan.',
  'Speed optimization': 'We tune images, caching and code so pages load faster.',
  'Monthly report': 'A plain summary of what we did on your site that month.',
  'WooCommerce support': 'Updates and fixes that cover your online store.',
  '6 hours edits/month': 'Six hours of small changes each month.',
  'Staging-tested updates': 'Updates are tried on a private copy before your live site.',
  '24/7 emergency fixes': 'If your site breaks, you can reach us at any hour.',
  'Priority support': 'Your requests go to the front of the queue.',
};
const planRank = { Essential: 0, Growth: 1, Business: 2 };
// Every feature with the first plan that includes it.
const ROWS = [
  ['Care', [['Weekly updates', 0], ['Staging-tested updates', 2], ['Security scan', 0], ['Malware removal', 1], ['Uptime monitoring', 0], ['Speed optimization', 1], ['WooCommerce support', 1]]],
  ['Backups', [['Weekly backups', 0], ['Daily backups', 1]]],
  ['Edits and support', [['1 hour edits/month', 0], ['3 hours edits/month', 1], ['6 hours edits/month', 2], ['Monthly report', 1], ['24/7 emergency fixes', 2], ['Priority support', 2]]],
];
const ADDONS = ['Hosting management', 'Custom development hours', 'Monthly SEO optimization', 'Speed boost package', 'Website redesign', 'Cloudflare security setup'];

const head = (title) => `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title}</title>
<link rel="preload" href="fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="mock-note">Mockup for owner approval. Not live.</div>`;

const header = (on) => `<header class="site-head"><div class="wrap">
<a class="logo" href="home.html"><img src="${LOGO}" alt="WMS logo" width="325" height="108"></a>
<nav class="nav" aria-label="Main">
<a href="#">Services</a><a href="pricing.html"${on === 'pricing' ? ' class="on"' : ''}>Pricing</a><a href="blog.html"${on === 'blog' ? ' class="on"' : ''}>Blog</a><a href="#">About</a><a href="#">Contact</a>
<a class="btn" href="pricing.html">See plans</a>
</nav>
<details class="menu"><summary>Menu</summary><div>
<a href="#">Services</a><a href="pricing.html">Pricing</a><a href="blog.html">Blog</a><a href="#">About</a><a href="#">Contact</a><a class="btn" href="pricing.html">See plans</a>
</div></details>
</div></header>`;

const footer = `<footer class="foot"><div class="wrap">
<div class="foot-grid">
<div><img src="${LOGO}" alt="" width="325" height="108" style="height:38px;width:auto"><p class="muted small" style="margin-top:10px">${LOCATION_LINE}<br>No contract. Cancel anytime.</p></div>
<div><h3>Services</h3><ul><li><a href="#">WordPress maintenance</a></li><li><a href="#">Shopify maintenance</a></li><li><a href="#">Ecommerce maintenance</a></li><li><a href="#">Website support</a></li><li><a href="#">Malware removal</a></li></ul></div>
<div><h3>Company</h3><ul><li><a href="#">About us</a></li><li><a href="#">Our work</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="blog.html">Blog</a></li></ul></div>
<div><h3>Contact and trust</h3><ul><li>contact@websitemaintenanceservices.org</li><li>+880 1815 840813</li><li><a href="#">Privacy policy</a></li><li><a href="#">Terms</a></li><li><a href="#">Refund policy</a></li></ul></div>
</div>
<p class="legal">© 2026 WMS. websitemaintenanceservices.org</p>
</div></footer>
</body></html>`;

const featureItem = (name) => `<li><details><summary><span>${name}</span><span class="inc">Included</span></summary><p>${EXPLAIN[name] ?? ''}</p></details></li>`;
const planCard = (p, withToggle) => {
  const own = p.includes.filter((f) => !f.startsWith('Everything'));
  const inherit = p.includes.find((f) => f.startsWith('Everything'));
  const priceHtml = withToggle
    ? `<div class="price"><span class="m">${money(p.monthly)}<small>/mo</small></span><span class="y">${money(p.annual)}<small>/yr</small></span></div>
       <p class="annual"><span class="m">or ${money(p.annual)}/yr, <b>${prices.annualNote.en}</b></span><span class="y"><b>${prices.annualNote.en}</b></span></p>`
    : `<div class="price">${money(p.monthly)}<small>/mo</small></div><p class="annual">or ${money(p.annual)}/yr, <b>${prices.annualNote.en}</b></p>`;
  return `<article class="plan${p.popular ? ' pop' : ''}">
${p.popular ? '<span class="pop-tag">Most popular</span>' : ''}<h3>${p.name}</h3>
${priceHtml}
<a class="btn${p.popular ? '' : ' ghost'}" href="#">Start ${p.name}</a>
${inherit ? `<p class="small muted" style="margin-top:14px">${inherit}, plus:</p>` : ''}
<ul class="feat"${inherit ? ' style="margin-top:8px"' : ''}>${own.map(featureItem).join('')}</ul>
</article>`;
};

// ---------- Homepage ----------
const homeFaqs = JSON.parse(readFileSync('src/content/pages/home.md', 'utf8').split('\n').find((l) => l.startsWith('faqs: ')).slice(6));
const tiles = [
  ['Updates', 'WordPress, plugins and themes kept current.'],
  ['Backups', 'Regular copies of your site, stored safely.'],
  ['Security', 'Scans for malware and known weak spots.'],
  ['Uptime monitoring', 'We are alerted when your site goes down.'],
  ['Speed', 'Images, caching and code tuned for faster pages.'],
  ['Edits and support', 'Small changes each month, from a real person.'],
];
const home = `${head('Website Maintenance Services & Support | WMS')}
${header('home')}
<main>
<section class="hero"><div class="wrap">
<div>
<h1>Website Maintenance Services &amp; Support</h1>
<p class="sub">Your site kept fast, secure and up to date, by engineers who show you what they did.</p>
<p class="price-line">Plans from ${money(prices.plans[0].monthly)}/mo · No contract</p>
<div class="cta-row"><a class="btn" href="pricing.html">See plans &amp; pricing</a><a href="#">Get a free website check</a></div>
</div>
<aside class="panel" aria-label="Example status panel">
<div class="panel-head"><span>yourwebsite.com</span><span class="tag">Example</span></div>
<div class="status"><span>Plugins and theme updated</span><span class="ok">Updated</span></div>
<div class="status"><span>Backup finished</span><span class="ok">Backed up</span></div>
<div class="status"><span>Malware scan</span><span class="ok">Clean</span></div>
<div class="status"><span>Site status</span><span class="ok">Up</span></div>
</aside>
</div></section>
<div class="facts"><div class="wrap"><span>Dhaka-based team</span><span>US &amp; UK hours</span><span>30+ websites maintained</span></div></div>

<section class="band"><div class="wrap">
<div class="head"><h2>What's included</h2><p>The routine work a website needs, done for you each month.</p></div>
<div class="grid g3">${tiles.map(([t, d]) => `<div class="tile"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</div></section>

<section class="band tint"><div class="wrap">
<div class="head"><h2>Plans and pricing</h2><p>Every price is on this page. Select any feature to see what it means.</p></div>
<div class="plans">${prices.plans.map((p) => planCard(p, false)).join('')}</div>
<p class="promise">No contract. Cancel anytime. <a href="pricing.html">Compare all features</a></p>
</div></section>

<section class="band"><div class="wrap">
<div class="head"><h2>How it works</h2></div>
<div class="grid g3">
<div class="tile"><div class="step-n">Step 1</div><h3>Free check</h3><p>Send your URL. We look at your site and tell you what needs attention.</p></div>
<div class="tile"><div class="step-n">Step 2</div><h3>Pick a plan</h3><p>Choose a plan. We talk through it on a short call and set you up.</p></div>
<div class="tile"><div class="step-n">Step 3</div><h3>We take care of it</h3><p>We do the work every month and send you a plain report.</p></div>
</div>
</div></section>

<section class="band tint"><div class="wrap">
<div class="head"><h2>What a monthly report looks like</h2><p>An example of the numbers you would see. It is not real client data.</p></div>
<div class="panel" style="padding:16px">
<div class="panel-head" style="padding:0 0 12px;border:0"><span>Monthly report, yourwebsite.com</span><span class="tag">Example</span></div>
<div class="cards">
<div class="metric"><span>Updates applied</span><b>14</b></div>
<div class="metric"><span>Backups completed</span><b>30</b></div>
<div class="metric"><span>Malware found</span><b>0</b></div>
<div class="metric"><span>Edit time used</span><b>1h 40m</b></div>
</div>
</div>
</div></section>

<section class="band"><div class="wrap">
<div class="head"><h2>Websites we look after</h2><p>${NUMBERS_LINE}</p></div>
<div class="hold"><span class="tag">Waiting for your confirmation</span><p class="small muted" style="margin-top:10px">This block shows real sites once you tick the portfolio table. Each row links to the live site.</p>
<div class="rows"><div class="row"><b>Site name</b><span>Industry</span><span>Country</span><span>Visit site</span></div><div class="row"><b>Site name</b><span>Industry</span><span>Country</span><span>Visit site</span></div><div class="row"><b>Site name</b><span>Industry</span><span>Country</span><span>Visit site</span></div></div></div>
</div></section>

<section class="band tint"><div class="wrap">
<div class="head"><h2>How we compare</h2></div>
<div class="table-box"><table>
<thead><tr><th></th><th class="us">WMS</th><th>Freelancer</th><th>Typical agency</th></tr></thead>
<tbody>
<tr><td>Price per month</td><td class="us">${money(prices.plans[0].monthly)}–${money(prices.plans[2].monthly)}</td><td>$50–$150</td><td>$95–$500+</td></tr>
<tr><td>Contract</td><td class="us">None. Cancel anytime.</td><td>Varies</td><td>Varies</td></tr>
<tr><td>Response time</td><td class="us">[Owner to set]</td><td>Varies</td><td>Varies</td></tr>
<tr><td>Monthly report</td><td class="us">Growth and Business</td><td>Varies</td><td>Varies</td></tr>
</tbody></table></div>
</div></section>

<section class="band"><div class="wrap" style="max-width:820px">
<div class="head"><h2>Common questions</h2></div>
<div class="faq">${homeFaqs.slice(0, 6).map((f) => `<details><summary>${f.q}</summary><p>${f.a}</p></details>`).join('')}</div>
</div></section>

<section class="band tint cta-final"><div class="wrap">
<h2>Let's look after your website</h2>
<p>Pick a plan, or send your URL for a free check first.</p>
<a class="btn" href="pricing.html">See plans &amp; pricing</a>
</div></section>
</main>
${footer}`;
writeFileSync('mockups/home.html', home);

// ---------- Pricing ----------
const has = (rank, planName) => planRank[planName] >= rank;
const compareRows = ROWS.map(([group, list]) => `<tr class="group"><td colspan="4">${group}</td></tr>${list.map(([name, rank]) => `<tr><td><details><summary>${name}</summary><p>${EXPLAIN[name]}</p></details></td>${prices.plans.map((p) => `<td>${has(rank, p.name) ? '<span class="inc">Included</span>' : '<span class="dash">—</span>'}</td>`).join('')}</tr>`).join('')}`).join('');
const addonRows = `<tr class="group"><td colspan="4">Add-ons, on any plan</td></tr>${ADDONS.map((a) => `<tr><td>${a}</td><td colspan="3"><span class="muted">[Price: owner to set]</span></td></tr>`).join('')}`;
const pricing = `${head('Website Maintenance Packages, Plans & Pricing | WMS')}
${header('pricing')}
<main>
<section class="hero" style="padding-bottom:24px"><div class="wrap" style="display:block">
<h1 style="max-width:18em">Website Maintenance Packages, Plans &amp; Pricing</h1>
<p class="sub">Three plans. Every price is here. No contract, and you can cancel anytime.</p>
</div></section>
<section style="padding-bottom:56px"><div class="wrap">
<input class="bill" type="radio" name="bill" id="bm" checked><input class="bill" type="radio" name="bill" id="by">
<div class="toggle" role="group" aria-label="Billing period"><label for="bm">Monthly</label><label for="by">Annual <span class="free-pill">${prices.annualNote.en}</span></label></div>
<div class="plans">${prices.plans.map((p) => planCard(p, true)).join('')}</div>
<p class="promise">No contract. Cancel anytime. We take payment after a short call.</p>
</div></section>
<section class="band tint"><div class="wrap">
<div class="head"><h2>Compare every feature</h2><p>Select a feature to see what it means.</p></div>
<div class="compare desktop"><table>
<thead><tr><th>Feature</th>${prices.plans.map((p) => `<th>${p.name}<br><span class="small muted">${money(p.monthly)}/mo</span></th>`).join('')}</tr></thead>
<tbody>${compareRows}${addonRows}
<tr><td></td>${prices.plans.map((p) => `<td><a class="btn${p.popular ? '' : ' ghost'}" href="#" style="width:100%;padding-inline:8px">Start ${p.name}</a></td>`).join('')}</tr>
</tbody></table></div>
<div class="compare-cards">
${prices.plans.map((p) => `<div class="tile"><h3>${p.name} · ${money(p.monthly)}/mo</h3><ul>${ROWS.flatMap(([, list]) => list).map(([name, rank]) => `<li><span>${name}</span>${has(rank, p.name) ? '<span class="inc">Included</span>' : '<span class="dash">—</span>'}</li>`).join('')}</ul><a class="btn" href="#" style="margin-top:12px">Start ${p.name}</a></div>`).join('')}
<div class="tile"><h3>Add-ons, on any plan</h3><ul>${ADDONS.map((a) => `<li><span>${a}</span><span class="muted small">[Owner to set]</span></li>`).join('')}</ul></div>
</div>
</div></section>
<section class="band"><div class="wrap" style="max-width:820px">
<div class="head"><h2>Billing and contract questions</h2></div>
<div class="faq">
<details open><summary>How does billing work?</summary><p>Pay monthly, or pay yearly and get ${prices.annualNote.en}. There is no checkout on the site: pick a plan, we talk on a short call, and then we take payment.</p></details>
<details><summary>Is there a contract?</summary><p>No contract. Cancel anytime.</p></details>
<details><summary>What counts as an edit hour?</summary><p>[Owner to define what counts, and whether unused time carries over.]</p></details>
<details><summary>What happens if I cancel?</summary><p>[Owner to define: when service ends and whether you keep your backups.] See the refund policy.</p></details>
</div>
</div></section>
<section class="band tint cta-final"><div class="wrap">
<h2>Not sure which plan fits?</h2><p>Send your URL for a free check and we will suggest one.</p><a class="btn" href="#">Get a free website check</a>
</div></section>
</main>
${footer}`;
writeFileSync('mockups/pricing.html', pricing);

// ---------- Blog post, using the real page text ----------
const POST = 'how-long-does-website-maintenance-take';
const $ = cheerio.load(readFileSync(`dist/${POST}/index.html`, 'utf8'));
const $main = $('main');
const h1 = $main.find('h1').first().text();
$main.find('h1').first().remove();
$main.find('ul').first().remove();
const quick = $main.find('p').filter((_, p) => /^Quick answer:/.test($(p).text())).first();
const quickText = quick.html()?.replace(/<strong>Quick answer:<\/strong>\s*/, '') ?? '';
quick.remove();
$main.find('p').filter((_, p) => /Let Us Handle It|Get a Free Website Audit/.test($(p).text()) && $(p).text().length < 80).remove();
$main.find('p').filter((_, p) => /^Get a Free Quote$/.test($(p).text().trim())).remove();
// The old hero stat lines become simple cards.
const statPs = $main.find('p').toArray();
const start = statPs.findIndex((p) => /^1.3 hrs$/.test($(p).text().trim()));
if (start >= 0) {
  const pairs = [];
  for (let i = start; i < start + 8; i += 2) pairs.push(`<div><b>${$(statPs[i]).text()}</b>${$(statPs[i + 1]).text()}</div>`);
  statPs.slice(start + 1, start + 8).forEach((p) => $(p).remove());
  $(statPs[start]).replaceWith(`<div class="stats">${pairs.join('')}</div>`);
}
$main.find('img').each((_, i) => {
  const src = $(i).attr('src');
  if (src?.startsWith('/wp-content/')) $(i).attr('src', `../public${src}`);
});
$main.find('h2').filter((_, h) => /^How Long Does Website Maintenance Take\?$/.test($(h).text())).first().remove();
const toc = [];
$main.find('h2').each((i, h) => {
  const t = $(h).text().trim();
  if (/On this page|Related Guides|Get Your Time Back|Want to skip|See the Websites/.test(t)) return;
  const id = `s${i}`;
  $(h).attr('id', id);
  toc.push([id, t]);
});
const tocHtml = toc.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('');
const blog = `${head('How Long Does Website Maintenance Take? (2026 Guide) | WMS')}
${header('blog')}
<main class="wrap">
<nav class="crumbs" aria-label="Breadcrumb"><a href="home.html">Home</a> / <a href="#">Blog</a> / How long does website maintenance take</nav>
<div class="post-grid">
<article>
<h1 style="font-size:clamp(1.9rem,4.4vw,2.7rem)">${h1}</h1>
<p class="post-meta">Updated October 26, 2026 · By [author name]</p>
<div class="answer"><b>Quick answer</b>${quickText}</div>
<details class="toc-m"><summary>On this page</summary>${tocHtml}</details>
<div class="prose">${$main.html()}</div>
<div class="author-box"><div class="avatar" role="img" aria-label="Author photo to come"></div><div><b>[Author name]</b><p class="small muted">[Role and short bio. The owner supplies a real person.]</p></div></div>
</article>
<aside class="toc-wrap"><div class="toc"><h2>On this page</h2><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol>
<div class="side-cta"><b>Not sure where your site stands?</b><p class="small muted" style="margin-top:6px">Send your URL and we will take a look.</p><a class="btn" href="#">Get a free website check</a></div></div></aside>
</div>
</main>
${footer}`;
writeFileSync('mockups/blog.html', blog);
console.log(`mockups written; blog sections ${toc.length}, words ${$main.text().split(/\s+/).length}, quick answer ${quickText.length} chars`);
