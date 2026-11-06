// FAQ prices vs pricing-card prices on the rebuilt pages. Nothing is changed: writes reports/price-mismatches.md.
// Card prices = the prices shown in the page's pricing cards / hero price line (dist). FAQ prices = amounts in the FAQ
// answers (front matter "faqs", which equal the FAQ schema). Live value = whether the amount is in the crawled live page.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const PAGES = ['/website-repair-services/', '/website-hacked-recovery-services/', '/wordpress-malware-removal-service/', '/website-migration-services/', '/wordpress-website-maintenance-packages/', '/monthly-website-maintenance-packages/', '/website-redesign-services/', '/website-design-services/', '/website-seo-services/', '/website-speed-optimization-services/', '/website-support-services/', '/website-update-services/', '/wordpress-backup-services/', '/white-label-website-maintenance-services-for-agencies/', '/wms-partner-program/', '/ecommerce-website-maintenance-packages/', '/shopify-website-maintenance-packages/'];
const amounts = (t) => [...new Set([...t.matchAll(/\$\s?(\d[\d,]*)/g)].map((m) => Number(m[1].replace(/,/g, ''))))];
const liveText = {};
for (const f of readdirSync('export/pages')) {
  // The full live HTML is in export/raw (same file name); the JSON text field is shortened.
  try { const j = JSON.parse(readFileSync(`export/pages/${f}`, 'utf8')); const raw = `export/raw/${f.replace(/\.json$/, '.html')}`; if (j.url) { const $r = cheerio.load(readFileSync(raw, 'utf8')); $r('script, style').remove(); liveText[new URL(j.url).pathname] = $r('body').text().replace(/\s+/g, ' '); } } catch { /* skip */ }
}
const rows = [];
for (const p of PAGES) {
  const md = readFileSync(`src/content/pages/${p.replace(/^\/|\/$/g, '')}.md`, 'utf8');
  const faqs = JSON.parse(/^faqs: (.*)$/m.exec(md)?.[1] ?? '[]');
  const $ = cheerio.load(readFileSync(`dist${p}index.html`, 'utf8'));
  // Card prices: the pricing section (#pricing, #packages or #plans) and the hero price line.
  const sec = $('#pricing, #packages, #plans').first().closest('section');
  const cardText = [sec.find('.card, .rp-plan, .pp-plan, table').text(), $('.rp-priceline').first().text()].join(' ');
  const cards = amounts(cardText);
  const live = liveText[p] ?? '';
  for (const f of faqs) {
    const fa = amounts(f.a);
    const off = fa.filter((n) => !cards.includes(n));
    if (!off.length) continue;
    const onLive = (n) => new RegExp(`\\$\\s?${n.toLocaleString('en-US').replace(/,/g, ',?')}(?![\\d])`).test(live);
    rows.push({ page: p, q: f.q, faq: f.a.length > 220 ? f.a.slice(0, 220) + '…' : f.a, faqPrices: off.map((n) => `$${n.toLocaleString('en-US')}${onLive(n) ? ' (on live page)' : ' (not on live page)'}`).join(', '), cards: cards.map((n) => `$${n.toLocaleString('en-US')}${onLive(n) ? '' : '*'}`).join(', ') || '(no card prices)' });
  }
}
const esc = (s) => String(s).replace(/\|/g, '\\|');
writeFileSync('reports/price-mismatches.md', `# Price mismatches: FAQ answers vs pricing cards (rebuilt pages)

Nothing was changed (owner decision, 2026-11-06). For each FAQ answer that names a price that is not one of the page's card prices:
- "on live page" / "not on live page": whether that amount appears in the crawled live page text (export/pages, the live site before the rebuild).
- Card prices marked * do not appear in the live page text: they come from a decision made in this rebuild (for example the migration $1,199, confirmed by the owner, or a master plan price added to a card).
Many FAQ amounts are market ranges ("$50 to $500 a month") rather than our prices; they are listed so the owner can judge.

${rows.length} FAQ answers on ${new Set(rows.map((r) => r.page)).size} pages.

| Page | FAQ question | FAQ answer (start) | FAQ price(s) not on a card | Card prices on the page |
|---|---|---|---|---|
${rows.map((r) => `| ${r.page} | ${esc(r.q)} | ${esc(r.faq)} | ${r.faqPrices} | ${r.cards} |`).join('\n')}
`);
console.log(`${rows.length} mismatching FAQ answers on ${new Set(rows.map((r) => r.page)).size} pages`);
for (const r of rows.slice(0, 40)) console.log(`${r.page} | ${r.q.slice(0, 50)} | ${r.faqPrices} | cards ${r.cards}`);
