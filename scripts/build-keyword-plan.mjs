// Writes the keyword map proposal for owner approval: one row per indexable page.
// Nothing here changes a page. Usage: node scripts/build-keyword-plan.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const O = 'https://websitemaintenanceservices.org';
const SUFFIX = ' | WMS';
const cells = (line) => {
  const o = [];
  let c = '';
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) {
      o.push(c);
      c = '';
    } else c += ch;
  }
  o.push(c);
  return o;
};
const rows = (f) => readFileSync(f, 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map(cells);
const num = (s) => +String(s).replace(/,/g, '');

const recs = new Map(readdirSync('export/pages').map((f) => JSON.parse(readFileSync(join('export/pages', f), 'utf8'))).map((r) => [r.url, r]));
const pages = rows('url-map.csv').filter((m) => m[2] === '200' && ['page', 'post'].includes(m[3]));
const offTopic = new Set(rows('plan-files/off-topic-pages.csv').map((r) => r[0]));
const queries = {};
for (const r of rows('gsc/query-page/query-page-last-3-months.csv')) (queries[r[1].replace(O, '')] ??= []).push({ q: r[0], clicks: num(r[2]), impr: num(r[3]), pos: num(r[5]) });

// Secondary keywords from the approved keyword map (plan-files/keyword-targets.txt).
const targets = {};
let current = null;
for (const line of readFileSync('plan-files/keyword-targets.txt', 'utf8').split(/\r?\n/)) {
  const p = line.split(' | ');
  if (line.startsWith('/')) {
    current = p[0];
    targets[current] = { primary: p[1], secondary: [p[4]] };
  } else if (current && p[0]) targets[current].secondary.push(p[0]);
}
const NOISE = /^(yes|other similar\?|no more than 5|contents services|wibuku maintenance|intram managed sitecare|hosting for wordpress cdn included|website maintenance for contractors|最近増えている)$|[Ѐ-ӿ]|\[|"|\d{4}-\d{2}-\d{2}|my location is|,\d/;

// [title without suffix, H1, primary, secondary overrides or null, reason]
const PLAN = {
  '/': ['Website Maintenance Services & Support Plans', 'Website Maintenance Services', 'website maintenance services', null, 'Plan list 4 and 5. Semrush: 4,400/mo, KD 23.'],
  '/best-website-maintenance-companies/': ['10 Best Website Maintenance Companies in 2026 (Ranked)', '10 Best Website Maintenance Companies in 2026', 'best website maintenance companies', null, 'Keeps its #6. Service, company and agency phrases leave headings.'],
  '/best-website-maintenance-for-small-business/': ['Small Business Website Maintenance: Best Options', 'Small Business Website Maintenance: Best Options', 'small business website maintenance', ['website maintenance package pricing small business', 'website maintenance for small business', 'website maintenance plans for small business', 'website maintenance company for small businesses', 'best website maintenance services for small businesses'], 'Ranks #4. "Packages" leaves the title and H1.'],
  '/monthly-website-maintenance-packages/': ['Website Maintenance Packages, Plans & Pricing', 'Website Maintenance Packages, Plans & Pricing', 'website maintenance packages', ['website maintenance plans', 'website maintenance plan', 'monthly website maintenance packages', 'monthly website maintenance', 'monthly website maintenance plans', 'website maintenance pricing', 'website management services'], 'Semrush: "plans" 1,300/mo vs "pricing" 140/mo. Absorbs two merged pages.'],
  '/how-much-does-website-maintenance-cost/': ['How Much Does Website Maintenance Cost? (2026)', 'How Much Does Website Maintenance Cost? (2026 Guide)', 'website maintenance cost', null, 'Cost only. Packages and monthly phrases go to the packages page.'],
  '/wordpress-website-maintenance-packages/': ['WordPress Website Maintenance Services & Plans', 'WordPress Website Maintenance Services & Plans', 'wordpress website maintenance services', ['wordpress website maintenance', 'wordpress maintenance plans', 'wordpress maintenance plan', 'wordpress website maintenance plans', 'wordpress maintenance packages', 'wordpress website maintenance packages', 'wordpress monthly maintenance', 'wordpress maintenance company'], 'Semrush: 1,300/mo, CPC $21. No seed export for "wordpress maintenance" yet.'],
  '/how-much-does-wordpress-website-maintenance-cost/': ['How Much Does WordPress Maintenance Cost? (2026)', 'How Much Does WordPress Maintenance Cost in 2026?', 'wordpress maintenance cost', null, 'Old price leaves the title. "Monthly" and "packages" go to the WordPress page.'],
  '/ecommerce-website-maintenance-packages/': ['Ecommerce Website Maintenance Services & Packages', 'Ecommerce Website Maintenance Services & Packages', 'ecommerce website maintenance services', null, '"From $59" leaves the title.'],
  '/shopify-website-maintenance-packages/': ['Shopify Website Maintenance Services & Packages', 'Shopify Website Maintenance Services & Packages', 'shopify website maintenance', null, 'Live page has no H1.'],
  '/how-long-does-website-maintenance-take/': ['How Long Does Website Maintenance Take? (2026 Guide)', 'How Long Does Website Maintenance Take in 2026', 'how long does website maintenance take', null, 'Ranks #6; no title change except the suffix.'],
  '/website-maintenance-checklist/': ['Website Maintenance Checklist (2026): Free Template', 'Website Maintenance Checklist', 'website maintenance checklist', null, 'Semrush: 320/mo, KD 27; pdf 50/mo, KD 0. "PDF" returns if a real PDF exists.'],
  '/what-does-website-maintenance-include/': ['What Does Website Maintenance Include? (2026 Guide)', 'What Does Website Maintenance Include? (2026 Guide)', 'what does website maintenance include', ['what is website maintenance', 'what is included in website maintenance', 'website maintenance includes', 'website maintenance services includes', 'what is included in wordpress maintenance'], '"What is website maintenance" moves here from the homepage (Semrush 320/mo).'],
  '/importance-of-website-maintenance/': ['The Importance of Website Maintenance: 9 Reasons', 'The Importance of Website Maintenance: 9 Reasons It Matters (2026)', 'importance of website maintenance', null, 'Fixes "why Matters" wording in the title.'],
  '/common-website-maintenance-mistakes/': ['Common Website Maintenance Mistakes to Avoid', 'Common Website Maintenance Mistakes Businesses Should Avoid', 'common website maintenance mistakes', null, ''],
  '/website-hosting-and-maintenance/': ['Website Hosting and Maintenance: Services & Cost', 'Website Hosting and Maintenance: Services, Packages & Cost (2026)', 'website hosting and maintenance', ['website hosting and maintenance services', 'website hosting and maintenance packages', 'hosting website maintenance', 'web hosting maintenance services', 'website maintenance and hosting'], 'Semrush: 720/mo, KD 31; was "…services".'],
  '/website-support-services/': ['Website Support Services: Help & Updates 24/7', 'Website Support Services That Keep Your Business Online', 'website support services', null, ''],
  '/agreement/': ['Website Maintenance Agreement & Contract Template', 'Website Maintenance Agreement & Contract Guide', 'website maintenance agreement', ['website maintenance contract', 'wordpress maintenance contract', 'website maintenance proposal', 'website maintenance contract template', 'website maintenance agreement template'], 'Live page has no H1. Article, not a plan-button target.'],
  '/white-label-website-maintenance-services-for-agencies/': ['White Label Website Maintenance Services for Agencies', 'White Label Website Maintenance Services for Digital Agencies', 'white label website maintenance', ['white label website maintenance for agencies', 'white label website maintenance services', 'white label website maintenance retainer', 'web maintenance services for agencies'], '"White label WordPress" moves to the WordPress post below.'],
  '/white-label-wordpress-maintenance-support/': ['White Label WordPress Maintenance & Support for Agencies', 'White Label WordPress Maintenance & Support for Agencies', 'white label wordpress maintenance', ['white label wordpress maintenance service', 'white-label wordpress support and maintenance'], 'Split: agencies page ranks #58 for this; this post is the exact topic.'],
  '/website-maintenance-services-for-usa/': ['Website Maintenance Services in the USA', 'Website Maintenance Services in the USA', 'website maintenance services in usa', null, 'Country always in title and H1.'],
  '/website-maintenance-services-for-uk/': ['Website Maintenance Services in the UK', 'Website Maintenance Services in the UK', 'website maintenance services uk', ['website maintenance uk', 'website maintenance packages uk', 'website maintenance cost uk'], 'H1 lacks the country today.'],
  '/website-maintenance-services-for-canada/': ['Website Maintenance Services in Canada', 'Website Maintenance Services in Canada', 'website maintenance services canada', ['website maintenance canada'], 'H1 lacks the country today.'],
  '/website-maintenance-services-for-australia/': ['Website Maintenance Services in Australia', 'Website Maintenance Services in Australia', 'website maintenance services australia', null, ''],
  '/website-maintenance-services-for-france/': ['Website Maintenance Services in France', 'Website Maintenance Services in France', 'website maintenance services france', ['website maintenance france'], 'H1 lacks the country today.'],
  '/website-maintenance-services-for-spain/': ['Website Maintenance Services in Spain', 'Website Maintenance Services in Spain', 'website maintenance services spain', ['mantenimiento web'], ''],
  '/website-maintenance-services-for-netherlands/': ['Website Maintenance Services in the Netherlands', 'Website Maintenance Services in the Netherlands', 'website maintenance services netherlands', ['website onderhoud nederland', 'website onderhoud amsterdam', 'webshop maintenance'], ''],
  '/website-maintenance-services-for-switzerland/': ['Website Maintenance Services in Switzerland', 'Website Maintenance Services in Switzerland', 'website maintenance services switzerland', ['website wartung schweiz', 'website wartung'], 'Live page has no H1.'],
  '/website-maintenance-services-for-ireland/': ['Website Maintenance Services in Ireland', 'Website Maintenance Services in Ireland', 'website maintenance services ireland', ['website maintenance ireland'], 'H1 lacks the country today. Semrush: 50/mo, KD 0.'],
  '/website-maintenance-services-for-brazil/': ['Website Maintenance Services in Brazil', 'Website Maintenance Services in Brazil', 'website maintenance services brazil', ['manutenção de sites'], 'H1 is in Portuguese today and lacks the country. Check which language this page should use.'],
  '/best-wp-buffs-alternatives/': ['Best WP Buffs Alternatives (Compared & Reviewed)', 'Best WP Buffs Alternatives in 2026 (Compared & Reviewed)', 'wp buffs alternative', null, 'Link to SiteCare page: "WP Buffs vs SiteCare".'],
  '/sitecare-alternative/': ['Best SiteCare Alternatives', 'Best SiteCare Alternatives', 'sitecare alternative', null, 'Homepage phrase leaves the title and H1.'],
  '/best-fixrunner-alternatives/': ['Best FixRunner Alternatives (Compared & Reviewed)', 'Best FixRunner Alternatives in 2026 (Compared & Reviewed)', 'fixrunner alternatives', ['fixrunner reviews', 'fixrunner'], ''],
  '/wordpress-malware-removal-service/': ['WordPress Malware Removal Service', 'WordPress Malware Removal Service: Professional Cleanup in 24 Hours', 'wordpress malware removal service', ['wordpress malware removal', 'wordpress malware removal services', 'wordpress malware removal company', 'wordpress malware removal help', 'website malware removal', 'website security malware removal service', 'best wordpress malware removal', 'wp malware removal'], 'SPLIT: service owns buyer phrases. Strengthen first; 0 impressions today.'],
  '/wordpress-malware-removal/': ['How to Remove Malware From WordPress (2026 Guide)', 'How to Remove Malware From WordPress: Scan, Clean & Protect (2026)', 'how to remove malware from wordpress', ['how to clean wordpress site of malware', 'clean wordpress malware', 'removing malware from wordpress', 'remove malware from wordpress', 'wordpress malware scan', 'wordpress malware cleanup', 'how to clean website from malware'], 'SPLIT: article owns how-to phrases. Change only after the service page is live and linked.'],
  '/website-hacked-recovery-services/': ['Hacked Website Recovery Services', 'Website Hacked? Get Expert Recovery Now', 'hacked website recovery', ['website hacked recovery services', 'fix a hacked website', 'emergency website recovery'], 'Any platform; malware service is WordPress only.'],
  '/wordpress-site-hacked-what-to-do/': ['WordPress Site Hacked? Here\'s What to Do (2026 Guide)', 'WordPress Site Hacked? Here\'s Exactly What to Do (2026 Guide)', 'wordpress site hacked', ['wordpress is hacked', 'wordpress hacked site', 'wordpress post-hack security'], '"WordPress is hacked" moves here (ranks #35) from the malware article (#39 area).'],
  '/website-repair-services/': ['Website Repair and Maintenance Services', 'Website Repair Services That Fix What\'s Broken - Fast, Safely, Guaranteed', 'website repair and maintenance', ['website repair services', 'website repair', 'website repair service', 'fix my broken website', 'emergency website repair'], 'Semrush: 140/mo, KD 20. "Guaranteed" goes on the claims list.'],
  '/website-update-services/': ['Website Update Services', 'Professional Website Update Services', 'website update services', ['website updates', 'website updating service', 'website updating services'], '"WordPress Maintenance Plans" leaves the title.'],
  '/website-design-services/': ['Website Design Services That Build Trust', 'Website Design Services That Build Trust and Drive Measurable Growth', 'website design services', ['website design and maintenance services', 'website design and maintenance', 'website design and maintenance companies'], 'Takes design + maintenance phrases from the homepage (Semrush about 600/mo).'],
  '/nonprofit-website-maintenance/': ['Nonprofit Website Maintenance (2026)', 'Nonprofit Website Maintenance: Keep Your Site Donation-Ready (2026)', 'nonprofit website maintenance', ['website maintenance for nonprofits', 'website maintenance for nonprofit organizations', 'nonprofit website maintenance company', 'charity website maintenance'], 'Keep and fix. Semrush about 450/mo, KD 6–13.'],
  '/website-maintenance-case-study/': ['Healthcare Website Maintenance Case Study', 'Healthcare Website Maintenance Case Study: Altitude Care & Integrative Health', 'healthcare website maintenance', null, 'H1 today is only the client name.'],
  '/website-maintenance-process/': ['Website Maintenance Process: Our 9-Step Workflow', 'Our Website Maintenance Process', 'website maintenance process', ['what is website maintenance process'], 'Live page has no H1.'],
  '/website-malware-scanner/': ['Free Website Malware Scanner', 'Free Website Malware Scanner', 'free website malware scanner', ['website malware scanner'], 'Live page has no H1. Audit: it only checks domain format, so "Instant Scan" leaves the title.'],
  '/about-us/': ['About Us', 'About Us', 'about wms', [], 'No service keywords.'],
  '/contact/': ['Contact Us', 'Contact Us', 'contact wms', [], 'No service keywords. Live page has no H1.'],
  '/works/': ['Our Work', 'Our Work', 'wms work', [], 'No service keywords. Live page has no H1.'],
  '/get-a-free-quote/': ['Get a Free Quote', 'Get a Free Quote', '(noindex)', [], 'noindex, follow by owner decision.'],
  '/free-website-maintenance-audit/': ['Free Website Audit', 'Free Website Audit', '(noindex)', [], 'noindex, follow by owner decision. Live page has no H1.'],
  '/privacy-policy/': ['Privacy Policy', 'Privacy Policy', '(none)', [], ''],
  '/terms-conditions/': ['Terms & Conditions', 'Terms & Conditions', '(none)', [], ''],
  '/refund-cancellation-policy/': ['Refund & Cancellation Policy', 'Refund & Cancellation Policy', '(none)', [], ''],
  '/cookie-policy/': ['Cookie Policy', 'Cookie Policy', '(none)', [], ''],
  '/blogs/': ['Blog: Website Care Tips & Guides', 'Blog: Website Care Tips & Guides', '(none)', [], '"Website maintenance" leaves the blog index headings.'],
  '/write-for-us/': ['Write for Us: Submit a Guest Post', 'Share Your Expertise With Our Web & Technology Community', 'write for us', [], 'Old brand suffix replaced.'],
  '/wms-partner-program/': ['Website Partner Program: Reseller & White Label', 'Turn Your Client Relationships Into a New Revenue Stream', 'website reseller program', [], 'Old "Website Maintenance" phrase leaves the title.'],
};

const shorten = (t) => {
  let s = t.replace(/\s*\|\s*Website Maintenance Services$/, '').replace(/ of Website Maintenance Company$/, '');
  if ((s + SUFFIX).length > 60) s = s.replace(' (2026 Guide)', ' (2026)');
  return s;
};

const out = [];
for (const m of pages) {
  const path = m[0].replace(O, '');
  const r = recs.get(m[0]);
  const qs = (queries[path] ?? []).sort((a, b) => b.impr - a.impr);
  const plan = PLAN[path];
  const target = targets[path];
  const topClean = qs.filter((q) => !NOISE.test(q.q)).map((q) => q.q);
  const title = plan ? plan[0] : shorten(r.title);
  const h1 = plan ? plan[1] : r.headings.h1[0] ?? title;
  const primary = plan ? plan[2] : topClean[0] ?? path.replace(/\//g, '').replace(/-/g, ' ');
  const secondary = (plan?.[3] ?? (target ? target.secondary : topClean.slice(1, 7))).filter((k) => k && !NOISE.test(k) && k !== primary);
  out.push({
    path,
    type: m[3],
    topic: offTopic.has(path) ? 'off-topic (migrate unchanged)' : 'core',
    oldTitle: r.title,
    newTitle: title + SUFFIX,
    titleLen: (title + SUFFIX).length,
    oldH1: r.headings.h1.join(' // '),
    newH1: h1,
    primary,
    secondary: secondary.join('; '),
    impr: qs.reduce((a, b) => a + b.impr, 0),
    clicks: qs.reduce((a, b) => a + b.clicks, 0),
    topQueries: qs.slice(0, 5).map((q) => `${q.q} (${q.impr} impr, #${q.pos.toFixed(0)})`).join('; '),
    reason: plan?.[4] ?? 'Title unchanged except brand suffix',
    source: plan ? 'hand' : 'auto',
  });
}

// Cross-checks: no page may use another page's primary keyword in its title or H1.
const conflicts = [];
const owners = out.filter((o) => !o.primary.startsWith('(') && o.topic === 'core');
for (const o of out) {
  const text = `${o.newTitle} ${o.newH1}`.toLowerCase();
  for (const owner of owners) {
    if (owner.path === o.path) continue;
    if (text.includes(owner.primary.toLowerCase())) conflicts.push(`${o.path} uses "${owner.primary}" (owner ${owner.path}) in: ${o.newTitle} / ${o.newH1}`);
  }
}
const cols = ['path', 'type', 'topic', 'oldTitle', 'newTitle', 'titleLen', 'oldH1', 'newH1', 'primary', 'secondary', 'impr', 'clicks', 'topQueries', 'reason', 'source'];
const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
writeFileSync('reports/phase-3-keyword-map.csv', '﻿' + [cols.join(','), ...out.map((o) => cols.map((c) => cell(o[c])).join(','))].join('\n') + '\n');

const esc = (s) => String(s).replace(/\|/g, '\\|');
const table = (list) => ['| Page | New title | New H1 | Primary | Secondary | Why |', '|---|---|---|---|---|---|', ...list.map((o) => `| \`${o.path}\` | ${esc(o.newTitle)} | ${esc(o.newH1)} | ${esc(o.primary)} | ${esc(o.secondary) || '—'} | ${esc(o.reason)} |`)].join('\n');
const md = ['# Keyword map plan: full table', '', `${out.length} indexable pages. Old titles, old H1s and top queries are in \`phase-3-keyword-map.csv\`.`, '', '## Hand-reviewed pages', '', table(out.filter((o) => o.source === 'hand')), '', '## Title suffix only', '', table(out.filter((o) => o.source === 'auto')), ''].join('\n');
writeFileSync('reports/phase-3-keyword-map.md', md);

const over = out.filter((o) => o.titleLen > 60);
console.log(JSON.stringify({ pages: out.length, hand: out.filter((o) => o.source === 'hand').length, auto: out.filter((o) => o.source === 'auto').length, conflicts, titlesOver60: over.map((o) => `${o.path} ${o.titleLen}`), noH1Today: out.filter((o) => !o.oldH1).map((o) => o.path) }, null, 1));
