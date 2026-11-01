// Lists exactly what each approved removal takes from the old page, so an over-broad removal is visible.
// Parity cannot see this, because it applies the same removals. Writes reports/removal-audit.md.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { applyApprovedRemovals, hasApprovedRemoval } from './lib/approved-removals.mjs';

const raws = readdirSync('export/raw');
const textBlocks = ($) => {
  $('script, style, noscript, template, svg, header, footer, nav, .wms-offer').remove();
  return $('body').text().split(/\s*\n\s*/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
};
const paths = [...new Set(readFileSync('url-map.csv', 'utf8').split(/\r?\n/).slice(1).map((l) => /^"https:\/\/websitemaintenanceservices\.org([^"?]*\/)"/.exec(l)?.[1]).filter(Boolean))];
const out = ['# Approved removal audit', ''];
const rows = [];
for (const path of paths.filter(hasApprovedRemoval)) {
  const stem = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/-/g, '_');
  const file = raws.find((n) => n.startsWith(`${stem}-`) && n.endsWith('.html'));
  if (!file) { rows.push(`${path}: raw file not found`); continue; }
  const html = readFileSync(`export/raw/${file}`, 'utf8');
  const before = textBlocks(cheerio.load(html));
  const $after = cheerio.load(html);
  applyApprovedRemovals($after, path);
  const after = new Set(textBlocks($after));
  const gone = before.filter((l) => !after.has(l));
  rows.push(`${path}: ${gone.length} lines, ${gone.join(' ').split(/\s+/).length} words`);
  out.push(`## ${path}`, '', ...gone.map((l) => `- ${l.slice(0, 200)}`), '');
}
writeFileSync('reports/removal-audit.md', out.join('\n'));
console.log(rows.join('\n'));
