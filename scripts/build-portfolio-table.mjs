// Builds the portfolio table for the owner to tick (CLAIMS-AND-DESIGN.md A6). Reads each site's
// home page once, so the owner sees whether it is up and what it calls itself. Nothing is published.
// Usage: node scripts/build-portfolio-table.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';

const SITES = [
  ['moarmortgages.ca', 'Mortgage', 'Canada', ''],
  ['mipropertyportal.com', 'Real estate portal', '?', ''],
  ['dhakakitchen.ca', 'Restaurant', 'Canada', ''],
  ['dhakabazar.ca', 'Grocery / retail', 'Canada', ''],
  ['seocourseinbangladesh.com', 'Education', 'Bangladesh', 'own brand?'],
  ['softwaredevelopmentontario.ca', 'Software agency', 'Canada', 'own brand?'],
  ['whitelabelseolocal.com', 'Agency', '?', 'own brand?'],
  ['whitelabelwebsitedevelopment.com', 'Agency', '?', 'own brand?'],
  ['cybershieldbd.com', 'Cyber security', 'Bangladesh', 'own brand?'],
  ['unitscaledigital.com', 'Digital agency', '?', 'own brand?'],
  ['zaagsys.com', 'Software', '?', ''],
  ['glamhairstudio.uk', 'Hair salon', 'UK', ''],
  ['woodwardbarbers.com', 'Barber', '?', ''],
  ['southamptonseo.agency', 'SEO agency', 'UK', 'own brand?'],
  ['stluciantaxiandtours.com', 'Taxi & tours', 'St Lucia', ''],
  ['premiumshawarma.com', 'Restaurant', '?', ''],
  ['galavizbarbershop.com', 'Barber', '?', ''],
  ['marcstaxiservicetours.com', 'Taxi & tours', 'St Lucia?', ''],
  ['mariustaxiandtours.com', 'Taxi & tours', 'St Lucia?', ''],
  ['commerdo.com', 'B2B eCommerce', '?', 'own brand?'],
  ['nextjsdevelopment.agency', 'Dev agency', '?', 'own brand?'],
  ['thatsaas.com', 'SaaS', '?', 'own brand?'],
  ['estatyc.com', 'Real estate', '?', ''],
  ['aqsaalmadena.com', 'Business (Amco)', '?', ''],
  ['dermatologywebsitedesign.com', 'Agency', '?', 'own brand?'],
  ['islamarc.com', 'Islamic content', '?', ''],
  ['launchcraftar.com', '?', '?', ''],
  ['leerenbeautysalon.com', 'Beauty salon', '?', ''],
  ['riadalashekin.com', 'Hotel / riad', 'Morocco?', ''],
  ['whatgenerationami.fun', 'Web app', '—', 'own project?'],
  ['nannugroup.com', 'Business group', 'Bangladesh?', ''],
  ['altitudecare.net', 'Healthcare / care', '?', ''],
  ['socanalyst.pro', 'Security / SOC', '?', 'own brand?'],
  ['thanavimadani.org', 'Nonprofit / education', '?', ''],
];

// Sites the old /works/ page already links to, as a hint for "client".
const works = readdirSync('export/pages').map((f) => JSON.parse(readFileSync(join('export/pages', f), 'utf8'))).find((r) => r.url.endsWith('/works/'));
const worksHosts = new Set((works.externalLinks ?? []).map((u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } }));

const out = [];
for (const [site, industry, country, note] of SITES) {
  let status = '';
  let title = '';
  try {
    const res = await fetch(`https://${site}/`, { redirect: 'follow', headers: { 'User-Agent': 'WMS-rebuild-crawler/1.0 (owner-approved portfolio check)' }, signal: AbortSignal.timeout(20000) });
    status = String(res.status);
    title = cheerio.load(await res.text())('title').first().text().replace(/\s+/g, ' ').trim().slice(0, 70);
  } catch (e) {
    status = 'no response';
  }
  out.push({ site, industry, country, note, status, title, onWorks: worksHosts.has(site) ? 'yes' : '' });
  await new Promise((r) => setTimeout(r, 500));
}
const esc = (s) => String(s).replace(/\|/g, '\\|');
const md = [
  '# Portfolio table for owner to tick',
  '',
  'Fill in the last three columns. Nothing is published until this comes back. `websitemaintenanceservices.org` is left out, as the file says. Industry and country are guesses from the name, so correct them. "Live check" is one read of the home page on 2026-11-01. "On /works/" means the old site already links to it.',
  '',
  '| # | Site | Industry (guess) | Country (guess) | Note | Live check | Page title | On /works/ | Client or Our project? | May show? (yes/no) | Correct industry and country |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...out.map((o, i) => `| ${i + 1} | ${o.site} | ${esc(o.industry)} | ${o.country} | ${o.note} | ${o.status} | ${esc(o.title)} | ${o.onWorks} | | | |`),
  '',
].join('\n');
writeFileSync('reports/portfolio-table.md', md);
const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
writeFileSync('reports/portfolio-table.csv', '﻿' + ['site,industry_guess,country_guess,note,live_check,page_title,on_works_page,client_or_our_project,may_show,correct_industry_country', ...out.map((o) => [o.site, o.industry, o.country, o.note, o.status, o.title, o.onWorks, '', '', ''].map(cell).join(','))].join('\n') + '\n');
console.log(out.map((o) => `${o.site} | ${o.status} | ${o.title} | works:${o.onWorks}`).join('\n'));
console.log(`sites ${out.length}, on /works/ ${out.filter((o) => o.onWorks).length}, not 200: ${out.filter((o) => o.status !== '200').map((o) => o.site).join(', ')}`);
