// Converts the master USD plan prices into each country's currency and writes them to src/data/prices.json.
// To update: change RATES and DATE, run this, then run migrate-content.mjs and build. Rates do not update by themselves.
// Rule: monthly price rounds to a whole number; annual is 10 times the local monthly, so "2 months free" stays exact.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/data/prices.json';
const DATE = '2026-10-30'; // ECB reference rates, from api.frankfurter.dev, per 1 USD
const RATES = { USD: 1, GBP: 0.74633, EUR: 0.89509, CAD: 1.3969, AUD: 1.4236, CHF: 0.82295, BRL: 5.4325 };
const COUNTRIES = { usa: ['USD', '$'], uk: ['GBP', '£'], canada: ['CAD', 'CA$'], australia: ['AUD', 'A$'], france: ['EUR', '€'], ireland: ['EUR', '€'], netherlands: ['EUR', '€'], spain: ['EUR', '€'], switzerland: ['CHF', 'CHF '], brazil: ['BRL', 'R$ '] };

const prices = JSON.parse(readFileSync(FILE, 'utf8'));
const usd = prices.plans.map((p) => p.monthly);
const local = {};
for (const [country, [currency, sign]] of Object.entries(COUNTRIES)) {
  const tag = currency === 'BRL' ? 'pt-BR' : 'en-US';
  const show = (n) => `${sign}${n.toLocaleString(tag)}`;
  const monthly = usd.map((n) => Math.round(n * RATES[currency]));
  local[`/website-maintenance-services-for-${country}/`] = { currency, rate: RATES[currency], monthly: monthly.map(show), annual: monthly.map((n) => show(n * 10)) };
}
prices.annualNote.pt = '2 meses grátis';
prices.localRatesDate = DATE;
prices.local = local;
const json = JSON.stringify(prices, null, 2);
writeFileSync(FILE, `${json}\n`);
const rows = Object.entries(local).map(([path, l]) => `| ${path.replace('/website-maintenance-services-for-', '').replace('/', '')} | ${l.currency} | ${l.rate} | ${l.monthly.join(' / ')} | ${l.annual.join(' / ')} |`);
writeFileSync('reports/country-prices.md', `# Country plan prices\n\nMaster USD prices converted at ECB reference rates dated ${DATE}. Monthly rounds to a whole number; annual is 10 times the local monthly (2 months free). Rates do not update by themselves: see scripts/build-country-prices.mjs.\n\n| Country | Currency | Rate per 1 USD | Monthly: Essential / Growth / Business | Annual: Essential / Growth / Business |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(rows.join('\n'));
