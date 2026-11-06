// Lists pages in dist/ with duplicate id attributes and what the duplicated elements are.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : n === 'index.html' ? [p] : []; });
let pages = 0;
for (const f of walk('dist')) {
  const $ = cheerio.load(readFileSync(f, 'utf8'));
  const seen = {};
  $('[id]').each((_, e) => { (seen[$(e).attr('id')] ??= []).push(e.tagName + (e.attribs.class ? '.' + e.attribs.class.split(' ')[0] : '') + (e.parent?.tagName ? '<' + e.parent.tagName : '')); });
  const dup = Object.entries(seen).filter(([, v]) => v.length > 1);
  if (dup.length) { pages++; console.log(f.split(/[\\/]/).slice(1, -1).join('/'), dup.length, dup.slice(0, 2).map(([k, v]) => `${k.slice(0, 30)}=[${v.join(',')}]`).join(' ')); }
}
console.log('pages with duplicate ids:', pages);
