// Checks dist against snippets-data.mjs: every page's <title> and meta description equal the approved snippet; metas and titles unique.
import fs from 'fs'; import * as cheerio from 'cheerio'; import { SNIPPETS } from './snippets-data.mjs';
let bad = 0; const metas = new Map(), titles = new Map();
for (const [p, [, title, meta]] of Object.entries(SNIPPETS)) {
  const $ = cheerio.load(fs.readFileSync(`dist${p}index.html`, 'utf8'));
  const t = $('title').text(), m = $('meta[name="description"]').attr('content');
  if (t !== title) { bad++; console.log('title', p, JSON.stringify(t)); }
  if (m !== meta) { bad++; console.log('meta', p, JSON.stringify(m)); }
  if (metas.has(m)) { bad++; console.log('dup meta', p, metas.get(m)); } metas.set(m, p);
  if (titles.has(t)) { bad++; console.log('dup title', p, titles.get(t)); } titles.set(t, p);
}
console.log(`${Object.keys(SNIPPETS).length} pages checked, ${bad} differences`);
