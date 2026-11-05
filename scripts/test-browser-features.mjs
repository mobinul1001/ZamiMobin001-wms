// Runs the two page scripts in headless Chrome against dist/: quote form hash and malware scanner.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TESTER = `<!doctype html><body><pre id="out"></pre><script>
const load = (src) => new Promise((done) => { const f = document.createElement('iframe'); f.onload = () => done(f); f.src = src; document.body.appendChild(f); });
(async () => {
  const out = {};
  const plan = async (hash) => { const d = (await load('/get-a-free-quote/' + hash)).contentDocument; return [d.querySelector('select[name="plan"]').value, d.getElementById('requested-package').value, d.querySelector('select[name="currency"]').value]; };
  out.none = await plan('');
  out.growth = await plan('#growth');
  out.essential = await plan('#essential');
  out.business = await plan('#business');
  out.starterDesign = await plan('#starter-design');
  const quote = (await load('/get-a-free-quote/')).contentDocument.querySelector('main form');
  out.quoteForm = { action: quote.getAttribute('action'), disabled: quote.querySelectorAll('button[disabled]').length, honeypotHidden: quote.querySelector('input[name="_gotcha"]').style.display };
  // Owner, 2026-11-05: no cookie bar, no top bar, and no analytics tag loads (nothing sets an analytics cookie).
  const plain = await load('/about-us/');
  await new Promise((r) => setTimeout(r, 300));
  const pd = plain.contentDocument;
  out.noBars = { cookieBar: !!pd.getElementById('cookie-bar'), topbar: !!pd.querySelector('.topbar'), consentScript: !!pd.querySelector('script[src="/consent.js"]'), tags: pd.querySelectorAll('script[src*="googletag"], script[src*="clarity.ms"]').length, cookies: pd.cookie, headerTop: Math.round(pd.querySelector('header').getBoundingClientRect().top), defaultDenied: Array.from(plain.contentWindow.dataLayer || []).some((a) => a[0] === 'consent' && a[1] === 'default' && a[2].analytics_storage === 'denied') };
  // Services menu: every group and link, aria-expanded follows the menu.
  const mdrop = pd.querySelector('.drop');
  const msum = mdrop.querySelector('summary');
  const before = msum.getAttribute('aria-expanded');
  mdrop.open = true;
  await new Promise((r) => setTimeout(r, 50));
  out.menu = { groups: [...pd.querySelectorAll('.drop-h')].map((h) => h.textContent), links: pd.querySelectorAll('.drop-menu a').length, mobileLinks: pd.querySelectorAll('.m-svc a').length, before, after: msum.getAttribute('aria-expanded') };
  mdrop.open = false;
  localStorage.clear();
  // The first-screen button is on the first phone screen, and the header sits at the top.
  const sized = (src, w, h) => new Promise((done) => { const f = document.createElement('iframe'); f.style.cssText = 'width:' + w + 'px;height:' + h + 'px;border:0;position:fixed;left:0;top:0'; f.onload = () => done(f); f.src = src; document.body.appendChild(f); });
  out.mobile = [];
  for (const [w, h] of [[390, 844], [360, 640]]) for (const p of ["/","/wordpress-website-maintenance-packages/","/ecommerce-website-maintenance-packages/","/shopify-website-maintenance-packages/","/website-repair-services/","/website-hacked-recovery-services/","/wordpress-malware-removal-service/","/website-migration-services/","/website-redesign-services/","/website-design-services/","/website-seo-services/","/website-speed-optimization-services/","/website-support-services/","/website-update-services/","/wordpress-backup-services/","/white-label-website-maintenance-services-for-agencies/","/wms-partner-program/","/website-maintenance-services-for-usa/","/website-maintenance-services-for-uk/","/website-maintenance-services-for-canada/","/website-maintenance-services-for-australia/","/website-maintenance-services-for-france/","/website-maintenance-services-for-spain/","/website-maintenance-services-for-netherlands/","/website-maintenance-services-for-switzerland/","/website-maintenance-services-for-ireland/","/website-maintenance-services-for-brazil/"]) {
    const f = await sized(p, w, h);
    await new Promise((r) => setTimeout(r, 120));
    const d = f.contentDocument;
    const cta = d.querySelector('.cta-row .btn, .pp-cta .btn').getBoundingClientRect();
    out.mobile.push({ w, h, p, headerTop: Math.round(d.querySelector('header').getBoundingClientRect().top), ctaTop: Math.round(cta.top), ctaBottom: Math.round(cta.bottom), covered: cta.bottom > h });
    f.remove();
  }
  const sendTest = async (status, body) => {
    const f = await load('/contact/');
    const win = f.contentWindow;
    await new Promise((r) => setTimeout(r, 200));
    let sent = null;
    win.fetch = (url, init) => { sent = { url, accept: init.headers.Accept, formName: init.body.get('form_name') }; return Promise.resolve(new win.Response(body, { status })); };
    const form = f.contentDocument.querySelector('main form');
    let nativePost = false;
    form.submit = () => { nativePost = true; };
    const moved = new Promise((r) => { f.addEventListener('load', () => r(true), { once: true }); setTimeout(() => r(false), 1500); });
    form.dispatchEvent(new win.Event('submit', { cancelable: true, bubbles: true }));
    const left = await moved;
    return { sent, left, path: left ? f.contentWindow.location.pathname : '', nativePost, message: left ? '' : f.contentDocument.querySelector('.form-error')?.textContent ?? '' };
  };
  out.sendOk = await sendTest(200, '{"ok":true}');
  out.sendInvalid = await sendTest(422, '{"errors":[{"message":"email is invalid"}]}');
  out.sendLimited = await sendTest(429, '{}');
  out.sendBroken = await sendTest(500, '{}');
  out.growthGbp = await plan('#growth-gbp');
  out.businessBrl = await plan('#business-brl');
  out.storeGrowth = await plan('#store-growth');
  out.shopifyPro = await plan('#shopify-pro');
  const d = (await load('/website-malware-scanner/')).contentDocument;
  const run = (v) => { d.getElementById('scan-url').value = v; d.getElementById('scan-form').requestSubmit(); return { quick: [...d.querySelectorAll('#scan-quick li')].map((l) => l.textContent), deep: [...d.querySelectorAll('#scan-deep a')].map((a) => a.href) }; };
  out.scanGood = run('https://example.com/page');
  out.scanHttp = run('http://example.com').quick;
  out.scanBad = run('not a domain');
  document.getElementById('out').textContent = JSON.stringify(out);
})();
</script></body>`;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/_test') { res.writeHead(200, { 'content-type': TYPES['.html'] }); return res.end(TESTER); }
  let f = join('dist', p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4398, r));
const profile = mkdtempSync(join(tmpdir(), 'wms-test-'));
const dom = await new Promise((done) => {
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, '--virtual-time-budget=90000', '--dump-dom', 'http://localhost:4398/_test']);
  let s = '';
  c.stdout.on('data', (d) => (s += d));
  c.on('exit', () => done(s));
});
server.close();
rmSync(profile, { recursive: true, force: true });
const json = /<pre id="out">(.*?)<\/pre>/s.exec(dom)?.[1];
if (!json) { console.log('FAIL: no result from the page'); process.exit(1); }
const r = JSON.parse(json.replace(/&amp;/g, '&'));
console.log(JSON.stringify(r, null, 1));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const checks = {
  'no hash leaves the plan empty': eq(r.none, ['', '', 'USD']),
  'growth hash selects Growth': eq(r.growth, ['growth', 'growth', 'USD']),
  'essential hash selects Essential': eq(r.essential, ['essential', 'essential', 'USD']),
  'business hash selects Business': eq(r.business, ['business', 'business', 'USD']),
  'service package hash is kept': eq(r.starterDesign, ['other', 'starter-design', 'USD']),
  'no cookie bar and no consent script': !r.noBars.cookieBar && !r.noBars.consentScript,
  'no top bar; header at the top of the page': !r.noBars.topbar && r.noBars.headerTop === 0,
  'no analytics tag loads and no cookie is set': r.noBars.tags === 0 && r.noBars.cookies === '',
  'consent default is denied': r.noBars.defaultDenied,
  'Services menu: 4 groups, 16 links, mobile too': eq(r.menu.groups, ['Maintenance', 'Fix and security', 'Partners', 'Build and grow']) && r.menu.links === 16 && r.menu.mobileLinks === 16,
  'Services menu sets aria-expanded': r.menu.before === 'false' && r.menu.after === 'true',
  'first-screen button on the first phone screen': r.mobile.every((m) => !m.covered && m.headerTop === 0),
  'success opens /thank-you/': r.sendOk.path === '/thank-you/',
  'fetch asks for JSON and sends form_name': r.sendOk.sent.accept === 'application/json' && r.sendOk.sent.formName === 'contact',
  'validation error shows on the form': r.sendInvalid.message === 'email is invalid' && !r.sendInvalid.nativePost,
  'rate limit shows a message': /Too many/.test(r.sendLimited.message) && !r.sendLimited.nativePost,
  'server error falls back to a normal post': r.sendBroken.nativePost,
  'quote form posts to Formspree': r.quoteForm.action.startsWith('https://formspree.io/f/'),
  'quote form can be submitted': r.quoteForm.disabled === 0,
  'honeypot is hidden': r.quoteForm.honeypotHidden === 'none',
  'growth-gbp picks plan and currency': eq(r.growthGbp, ['growth', 'growth-gbp', 'GBP']),
  'business-brl picks plan and currency': eq(r.businessBrl, ['business', 'business-brl', 'BRL']),
  'store-growth selects the store plan': eq(r.storeGrowth, ['store-growth', 'store-growth', 'USD']),
  'shopify-pro selects the Shopify plan': eq(r.shopifyPro, ['shopify-pro', 'shopify-pro', 'USD']),
  'scanner gives 3 links': r.scanGood.deep.length === 3 && r.scanGood.deep.every((u) => u.includes('example.com')),
  'scanner reads HTTPS': r.scanGood.quick[1] === 'Address uses HTTPS.',
  'scanner reads HTTP': r.scanHttp[1] === 'Address uses HTTP, not HTTPS.',
  'scanner rejects a bad domain': r.scanBad.deep.length === 0,
};
let failed = 0;
for (const [name, ok] of Object.entries(checks)) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failed++; }
process.exit(failed ? 1 : 0);
