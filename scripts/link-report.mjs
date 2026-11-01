// Reads dist/ and reports click depth from the homepage and pages with no links from page bodies.
// Writes reports/link-report.md. Header and footer links are counted apart from <main> links.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const pages = new Map();
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const f = join(dir, name);
    if (statSync(f).isDirectory()) walk(f);
    else if (name === 'index.html') pages.set(`/${dir.replace(/\\/g, '/').replace(/^dist\/?/, '')}/`.replace(/^\/\/$/, '/'), f);
  }
};
walk('dist');
const skip = new Set(['/thank-you/', '/admin/']);
const links = new Map();
const noindex = new Set();
for (const [path, f] of pages) {
  const $ = cheerio.load(readFileSync(f, 'utf8'));
  if (/noindex/.test($('meta[name="robots"]').attr('content') ?? '')) noindex.add(path);
  const grab = (sel) => new Set($(sel).toArray().map((a) => $(a).attr('href') ?? '').filter((h) => h.startsWith('/') && !h.startsWith('/wp-content')).map((h) => h.split('#')[0]).filter((h) => pages.has(h) && h !== path));
  links.set(path, { main: grab('main a[href]'), all: grab('a[href]') });
}
const depth = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const p = queue.shift();
  for (const n of links.get(p).all) if (!depth.has(n)) { depth.set(n, depth.get(p) + 1); queue.push(n); }
}
const inMain = new Map([...pages.keys()].map((p) => [p, 0]));
for (const [p, l] of links) for (const n of l.main) if (p !== n) inMain.set(n, inMain.get(n) + 1);
const real = [...pages.keys()].filter((p) => !skip.has(p));
const buckets = {};
for (const p of real) { const d = depth.get(p) ?? 'unreachable'; buckets[d] = (buckets[d] ?? 0) + 1; }
const unreachable = real.filter((p) => !depth.has(p));
const deep = real.filter((p) => depth.get(p) > 3);
const noBody = real.filter((p) => p !== '/' && inMain.get(p) === 0);
const low = real.filter((p) => p !== '/' && inMain.get(p) > 0 && inMain.get(p) < 3).map((p) => `${p} (${inMain.get(p)})`);
const md = `# Internal link report\n\nPages: ${real.length}\n\nClick depth from the homepage: ${JSON.stringify(buckets)}\n\n## Not reachable by any link (${unreachable.length})\n${unreachable.map((p) => `- ${p}`).join('\n') || 'None'}\n\n## Deeper than 3 clicks (${deep.length})\n${deep.map((p) => `- ${p} (${depth.get(p)})`).join('\n') || 'None'}\n\n## No link from any page body, only header or footer if any (${noBody.length})\n${noBody.map((p) => `- ${p}${noindex.has(p) ? ' (noindex)' : ''}`).join('\n') || 'None'}\n\n## Fewer than 3 body links in (${low.length})\n${low.map((p) => `- ${p}`).join('\n') || 'None'}\n`;
writeFileSync('reports/link-report.md', md);
console.log(JSON.stringify({ pages: real.length, depth: buckets, unreachable, deep: deep.length, noBodyLinks: noBody, under3: low.length }));
