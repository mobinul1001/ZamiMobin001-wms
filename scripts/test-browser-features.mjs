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
  const plan = async (hash) => { const d = (await load('/get-a-free-quote/' + hash)).contentDocument; return [d.querySelector('select[name="plan"]').value, d.getElementById('requested-package').value]; };
  out.none = await plan('');
  out.growth = await plan('#growth');
  out.essential = await plan('#essential');
  out.business = await plan('#business');
  out.starterDesign = await plan('#starter-design');
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
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, '--virtual-time-budget=15000', '--dump-dom', 'http://localhost:4398/_test']);
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
  'no hash leaves the plan empty': eq(r.none, ['', '']),
  'growth hash selects Growth': eq(r.growth, ['growth', 'growth']),
  'essential hash selects Essential': eq(r.essential, ['essential', 'essential']),
  'business hash selects Business': eq(r.business, ['business', 'business']),
  'service package hash is kept': eq(r.starterDesign, ['other', 'starter-design']),
  'scanner gives 3 links': r.scanGood.deep.length === 3 && r.scanGood.deep.every((u) => u.includes('example.com')),
  'scanner reads HTTPS': r.scanGood.quick[1] === 'Address uses HTTPS.',
  'scanner reads HTTP': r.scanHttp[1] === 'Address uses HTTP, not HTTPS.',
  'scanner rejects a bad domain': r.scanBad.deep.length === 0,
};
let failed = 0;
for (const [name, ok] of Object.entries(checks)) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failed++; }
process.exit(failed ? 1 : 0);
