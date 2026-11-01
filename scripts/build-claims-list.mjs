// Lists claims on the old site for the owner to verify, and the FAQ schema questions not visible
// on the page. A text-pattern scan: it can miss claims and catch general statements, so "likely"
// marks lines that speak about the company itself. Usage: node scripts/build-claims-list.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readCsv } from './lib/csv.mjs';

const O = 'https://websitemaintenanceservices.org';
const recs = readdirSync('export/pages').map((f) => JSON.parse(readFileSync(join('export/pages', f), 'utf8')));
const map = readCsv('url-map.csv');
// Pages that stay, plus the 4 merged pages whose content moves to a target.
const merged = ['/plan-packages-and-costs/', '/website-management-packages/', '/website-maintenance-services-for-small-business/', '/website-support/'];
const urls = new Set([...map.filter((m) => m.status === '200' && ['page', 'post'].includes(m.type)).map((m) => m.old_url), ...merged.map((p) => O + p)]);
const pages = recs.filter((r) => urls.has(r.url));

const GROUPS = [
  ['Clients, sites, projects', /\b\d[\d,]*\+?\s*(?:[a-z-]+\s){0,2}?(?:websites?|sites|businesses|clients|customers|companies|agencies|projects|brands|repaired)\b/i],
  ['Years of experience', /\b\d+\+?\s*(?:years?|yrs?)\b(?:\s+(?:of\s+)?(?:experience|in business|expertise))?|\bsince\s+20\d\d\b|\bfounded in\b/i],
  ['Ratings and reviews', /\b[1-5](?:\.\d)?\s*(?:\/\s*5(?:\.0)?|out of 5|stars?)\b|\b[1-5]\.\d\s*·|\b5[- ]star\b|\brated\b.*\b\d/i],
  ['Guarantees and warranties', /\bguarantee[sd]?\b|\bmoney[- ]back\b|\bwarrant(?:y|ies)\b|\bzero downtime\b|\bno data loss\b/i],
  ['Response and delivery times', /\b(?:under|within|in|less than|average|avg\.?)\s+\d+\s*(?:mins?|minutes?|hours?|hrs?)\b|\b\d+\s*[-–]\s*\d+\s*(?:hours?|hrs?|mins?|minutes?)\b|\b\d+[- ](?:minute|hour|hr|min)\b/i],
  ['Results and percentages', /\b\d+(?:\.\d+)?%\s*(?:[a-z-]+\s){0,3}?(?:uptime|faster|increase|growth|improve|reduction|more|fewer|success|satisfaction|margin|retention)|\buptime\b.*\d|\bfrom\s+\d+(?:\.\d+)?s\b|\+\$?\d/i],
  ['Awards, badges, platforms', /\baward|\bcertified\b|\baccredit|\bverified\b|\bBBB\b|\bClutch\b|\bGoodFirms\b|\bTrustpilot\b|\btop[- ]rated\b|\brecogni[sz]ed\b|\bfeatured (?:on|in)\b/i],
  ['Location and team', /\bUSA[- ]based\b|\bUS[- ]based\b|\bbased in\b|\bDhaka\b|\bBangladesh\b|\blocal team\b|\bengineers?\b.*\b\d|\b\d+\+?\s*(?:engineers|developers|experts)\b/i],
  ['Testimonials and named people', /^["“”].{25,}["”]?$|^[-–—]\s*[A-Z][a-z]+ [A-Z]|\bJohn Doe\b|\bParaphrased\b|\bCEO\b|\bFounder\b|\bOwner,\s/],
  ['Offers and discounts', /\b\d+%\s*off\b|\bCARE50\b|\bfree (?:migration|month)\b|\bdiscount\b/i],
];
const OWN = /\b(we|we're|we've|our|us|wms|website maintenance services)\b/i;

const rows = [];
for (const r of pages) {
  const path = r.url.replace(O, '');
  const isService = !/\/(what-is|how-|best-|web-design|caribbean|salon|seo-for|php-|wordpress-php|error-|there-has|cost-to)/.test(path);
  for (const raw of (r.text ?? '').split('\n')) {
    const line = raw.trim();
    if (line.length < 4 || line.length > 400) continue;
    for (const [group, re] of GROUPS) {
      const m = line.match(re);
      if (m) rows.push({ group, claim: m[0].replace(/\s+/g, ' ').trim(), page: path, likely: OWN.test(line) || isService ? 'likely ours' : 'check', text: line });
    }
  }
  const removed = JSON.stringify(r.jsonLd ?? []);
  for (const m of removed.matchAll(/"aggregateRating":\{[^}]*?"ratingValue":"?([\d.]+)"?[^}]*?\}/g)) rows.push({ group: 'Ratings and reviews', claim: `Schema rating ${m[1]}`, page: path, likely: 'likely ours', text: m[0].slice(0, 200) });
}

rows.unshift({ group: 'TODO', claim: 'founding year: owner to confirm', page: '(sitewide)', likely: 'ours', text: 'All years-of-experience claims are removed until the owner confirms the founding year (CLAIMS-AND-DESIGN.md A2).' });
const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
writeFileSync('reports/claims-list.csv', '﻿' + ['group,claim,page,likely,text,confirmed_or_change', ...rows.map((r) => [r.group, r.claim, r.page, r.likely, r.text, ''].map(cell).join(','))].join('\n') + '\n');

const md = ['# Claims list for owner verification', '', `Pattern scan of ${pages.length} pages (old site text), ${rows.length} matches. Every line with its page is in \`claims-list.csv\`, with a column for your answer. It can miss claims and also catches general statements; "likely ours" is a best guess.`, '',
  '## Conflicts to settle first',
  '',
  '| Topic | What the site says | Where |',
  '|---|---|---|',
  '| Clients or sites | 100+ websites; 500+ businesses; 500+ websites; 500+ sites; 4,800+ repaired | `/about-us/`; 3 pages after `/contact/`; 8 pages; 5 pages; `/website-repair-services/` |',
  '| Experience | 10+ years; 11+ and 12+ years; since 2016 | 12 pages; `/best-fixrunner-alternatives/`, `/website-seo-services/`; `/website-repair-services/` |',
  '| Ratings (removed from schema) | 4.9 from 213, 165, 120, 4,800, 150, 180 reviews | 9 pages; not visible on the site as verifiable reviews |',
  '| Testimonials | About 70 quote lines, several naming old plans ("Essential at $95", "Advanced", "Elevate") | See the Testimonials group |',
  '| Location | "USA-Based" | `/website-maintenance-services-for-usa/`; only phone number is +880 |',
  '| Case study quote | "Paraphrased" | `/website-maintenance-case-study/` |',
  '| Removed on owner decision | "John Doe" testimonial and "Trusted by 500+ Businesses" | `/contact/` |',
  ''];
const summary = {};
for (const [group] of GROUPS) {
  const list = rows.filter((r) => r.group === group);
  const byClaim = new Map();
  for (const r of list) {
    const k = r.claim.toLowerCase();
    if (!byClaim.has(k)) byClaim.set(k, { claim: r.claim, pages: new Set(), ours: 0 });
    const e = byClaim.get(k);
    e.pages.add(r.page);
    if (r.likely === 'likely ours') e.ours++;
  }
  const sorted = [...byClaim.values()].sort((a, b) => b.pages.size - a.pages.size);
  summary[group] = { matches: list.length, distinct: sorted.length, top: sorted.slice(0, 14).map((e) => `${e.claim} (${e.pages.size})`) };
  md.push(`## ${group} (${list.length} matches, ${sorted.length} distinct)`, '', '| Claim | Pages | Example pages |', '|---|---|---|', ...sorted.map((e) => `| ${e.claim.replace(/\|/g, '\\|')} | ${e.pages.size} | ${[...e.pages].slice(0, 3).map((p) => `\`${p}\``).join(', ')} |`), '');
}
writeFileSync('reports/claims-list.md', md.join('\n'));

// FAQ schema questions not visible on the old page.
const squeeze = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const report = JSON.parse(readFileSync('reports/migration-report.json', 'utf8'));
const answers = new Map();
for (const f of readdirSync('src/content/pages').map((x) => join('src/content/pages', x)).concat(readdirSync('src/content/blog').map((x) => join('src/content/blog', x)))) {
  const line = readFileSync(f, 'utf8').split('\n').find((l) => l.startsWith('faqs: '));
  const path = readFileSync(f, 'utf8').split('\n').find((l) => l.startsWith('path: '));
  if (!line) continue;
  for (const q of JSON.parse(line.slice(6))) answers.set(`${JSON.parse(path.slice(6))}|${q.q}`, q.a);
}
const hidden = report.faqQuestionsNotFoundInBody.filter((f) => !squeeze(recs.find((r) => r.url === O + f.path).text ?? '').includes(squeeze(f.q)));
const faqMd = ['# FAQ schema questions not visible on the page', '', `${hidden.length} questions. They are in the page schema but not in the visible text. The owner approves them before they are added to the page.`, ''];
let current = '';
for (const f of hidden) {
  if (f.path !== current) {
    current = f.path;
    faqMd.push(`## \`${f.path}\``, '');
  }
  faqMd.push(`**${f.q}**`, '', answers.get(`${f.path}|${f.q}`) ?? '(no answer in schema)', '');
}
writeFileSync('reports/faq-not-visible.md', faqMd.join('\n'));
console.log(JSON.stringify({ pages: pages.length, rows: rows.length, summary, faqHidden: hidden.map((f) => `${f.path} | ${f.q}`) }, null, 1));
