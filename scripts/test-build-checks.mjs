// Proves each build check really fails: breaks dist/ one way at a time, runs check-build, restores.
// Needs a finished production build in dist/. Usage: node scripts/test-build-checks.mjs
import { spawnSync } from 'node:child_process';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';

const env = { ...process.env, CONTEXT: 'production', URL: 'https://websitemaintenanceservices.org' };
const run = () => spawnSync('node', ['scripts/check-build.mjs'], { env, encoding: 'utf8' });
const HOME = 'dist/index.html';
const REDIRECTS = 'dist/_redirects';
const COUNTRY = 'dist/website-maintenance-services-for-uk/index.html';
const PAGE = 'dist/about-us/index.html';
const append = (file, text) => writeFileSync(file, readFileSync(file, 'utf8') + text);
const replaceIn = (file, from, to) => writeFileSync(file, readFileSync(file, 'utf8').replace(from, to));

const cases = [
  ['Redirect chain', () => append(REDIRECTS, '/test-a/  /test-b/  301\n/test-b/  /contact/  301\n'), /Chain or loop/],
  ['Redirect loop', () => append(REDIRECTS, '/test-a/  /test-b/  301\n/test-b/  /test-a/  301\n'), /Chain or loop/],
  ['Redirect target missing', () => append(REDIRECTS, '/test-a/  /no-such-page/  301\n'), /does not exist/],
  ['Redirect from a live page', () => append(REDIRECTS, '/about-us/  /contact/  301\n'), /is a live page/],
  ['Same "from" twice', () => append(REDIRECTS, '/test-a/  /contact/  301\n/test-a/  /works/  301\n'), /appears twice/],
  ['Live URL disappears', () => renameSync('dist/works', 'dist/works-moved'), /was live and now has no page/, () => renameSync('dist/works-moved', 'dist/works')],
  ['Image without alt', () => replaceIn(PAGE, /<main[^>]*>/, '<main><img src="/wp-content/none.jpg">'), /has no alt text/],
  ['Empty SEO title', () => replaceIn(PAGE, /<title>.*?<\/title>/, '<title></title>'), /SEO title is empty/],
  ['Empty meta description', () => replaceIn(PAGE, /<meta name="?description"?[^>]*>/, ''), /meta description is empty/],
  ['Two H1 tags', () => replaceIn(PAGE, /<main[^>]*>/, '<main><h1>Extra</h1>'), /needs exactly 1/],
  ['Link to a redirect', () => replaceIn(PAGE, /<main[^>]*>/, '<main><a href="/plan-packages-and-costs/">x</a>'), /which redirects/],
  ['Link to ?plan=', () => replaceIn(PAGE, /<main[^>]*>/, '<main><a href="/get-a-free-quote/?plan=growth">x</a>'), /query URL/],
  ['Broken internal link', () => replaceIn(PAGE, /<main[^>]*>/, '<main><a href="/no-such-page/">x</a>'), /Broken link/],
  ['Noindex on a sitemap URL', () => replaceIn(HOME, /<meta name="?robots"?[^>]*>/, '<meta name="robots" content="noindex">'), /is in the sitemap but has noindex/],
  ['Dollar price on a country page', () => replaceIn(COUNTRY, /<main[^>]*>/, '<main><p>From $79 a month.</p>'), /shows a dollar price/],
  ['Local price missing on a country page', () => replaceIn(COUNTRY, /£590/g, '£599'), /£590 is missing/],
  ['Form not posting to Formspree', () => replaceIn('dist/contact/index.html', /action="https:\/\/formspree\.io[^"]*"/, 'action="/somewhere/"'), /does not post to Formspree/],
  ['Disabled submit button', () => replaceIn('dist/contact/index.html', /<button type="submit"/, '<button disabled type="submit"'), /submit button is disabled/],
  ['Analytics before consent', () => replaceIn(PAGE, '</head>', '<script src="https://www.clarity.ms/tag/x"></script></head>'), /loads before consent/],
  ['Cookie bar missing', () => replaceIn(PAGE, 'id="cookie-bar"', 'id="other"'), /cookie bar is missing/],
  ['Annual price without the note', () => replaceIn(PAGE, /<main[^>]*>/, '<main><p>Essential is $790 per year.</p>'), /annual price without/],
  ['FAQ schema not on the page', () => replaceIn(PAGE, '</head>', '<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"name":"Not on page?","acceptedAnswer":{"text":"Nope"}}]}</script></head>'), /schema question not on the page/],
  ['Banned claim on a page', () => replaceIn(PAGE, /<main[^>]*>/, '<main><p>Trusted by 500+ businesses.</p>'), /banned claim/],
  ['robots.txt blocks a search bot', () => append('dist/robots.txt', '\nUser-agent: Googlebot\nDisallow: /\n'), /blocks a search bot/],
];

const files = [REDIRECTS, HOME, PAGE, 'dist/robots.txt', 'dist/contact/index.html', COUNTRY];
const saved = new Map(files.map((f) => [f, readFileSync(f)]));

const baseline = run();
console.log(`Unbroken build: exit ${baseline.status}`);
let failed = baseline.status === 0 ? 0 : 1;
for (const [name, breakIt, expect, undo] of cases) {
  breakIt();
  const r = run();
  const output = r.stdout + r.stderr;
  const ok = r.status === 1 && expect.test(output);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: exit ${r.status}${ok ? '' : ` | expected ${expect}`}`);
  if (!ok) failed++;
  undo?.();
  for (const [f, data] of saved) writeFileSync(f, data);
}
const final = run();
console.log(`Restored build: exit ${final.status}`);
process.exit(failed || final.status ? 1 : 0);
