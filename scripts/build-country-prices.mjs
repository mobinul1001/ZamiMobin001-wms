// Writes the owner's country price table and the plan offers to src/data/prices.json, plus reports/country-prices.md.
// Prices are the owner's rounded table (2026-11-01), not live conversions. Annual is always 10 times the monthly.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/data/prices.json';
// Owner, 2026-11-05: free hosting and the 2 free email accounts come only with a website redesign, not with plans.
const OFFERS = [];
const EUR = { currency: 'EUR', sign: '€', monthly: [69, 129, 269], fix: 39, cleanup: 129 };
const TABLE = {
  usa: { currency: 'USD', sign: '$', monthly: [79, 149, 299], fix: 49, cleanup: 149 },
  uk: { currency: 'GBP', sign: '£', monthly: [59, 109, 219], fix: 39, cleanup: 109 },
  canada: { currency: 'CAD', sign: 'CA$', monthly: [109, 209, 419], fix: 69, cleanup: 209 },
  australia: { currency: 'AUD', sign: 'A$', monthly: [109, 209, 429], fix: 69, cleanup: 209 },
  france: EUR,
  ireland: EUR,
  netherlands: EUR,
  spain: EUR,
  switzerland: { currency: 'CHF', sign: 'CHF ', monthly: [69, 119, 249], fix: 39, cleanup: 119 },
  brazil: { currency: 'BRL', sign: 'R$', monthly: [429, 809, 1629], fix: 269, cleanup: 809 },
};

const prices = JSON.parse(readFileSync(FILE, 'utf8'));
for (const plan of prices.plans) {
  const own = plan.includes.filter((f) => !OFFERS.includes(f) && f !== 'WooCommerce support');
  const at = own[0].startsWith('Everything') ? 1 : 0;
  plan.includes = [...own.slice(0, at), ...OFFERS, ...own.slice(at)];
}
const local = {};
for (const [country, t] of Object.entries(TABLE)) {
  const show = (n) => `${t.sign}${n.toLocaleString(t.currency === 'BRL' ? 'pt-BR' : 'en-US')}`;
  local[`/website-maintenance-services-for-${country}/`] = { currency: t.currency, monthly: t.monthly.map(show), annual: t.monthly.map((n) => show(n * 10)), fix: show(t.fix), cleanup: show(t.cleanup) };
}
const OFFER_ROWS = OFFERS;
const store = (name, hash, monthly, popular, includes) => ({ name, hash, monthly, annual: monthly * 10, ...(popular ? { popular: true } : {}), includes });
prices.storePlans = {
  woocommerce: {
    path: '/ecommerce-website-maintenance-packages/',
    plans: [
      store('Store Starter', 'store-starter', 199, false, ['Everything in Growth', ...OFFER_ROWS, 'Staging-tested WooCommerce and payment plugin updates', 'Daily backups including orders', 'Weekly checkout test', '3 hours edits/month']),
      store('Store Growth', 'store-growth', 349, true, ['Everything in Store Starter', ...OFFER_ROWS, '6 hours edits/month', 'Backups twice daily', 'Speed and Core Web Vitals work', 'Checkout and conversion fixes', '8-hour response']),
      store('Store Pro', 'store-pro', 599, false, ['Everything in Store Growth', ...OFFER_ROWS, '12 hours edits/month', '24/7 emergency fixes', '4-hour response', 'Monthly strategy call']),
    ],
  },
  shopify: {
    path: '/shopify-website-maintenance-packages/',
    plans: [
      store('Shopify Starter', 'shopify-starter', 149, false, ['Theme and app checks', 'Monthly store health check (speed, broken links, app conflicts)', 'Backup app setup', '3 hours edits/month']),
      store('Shopify Growth', 'shopify-growth', 299, true, ['Everything in Shopify Starter', '6 hours edits/month', 'Speed and SEO maintenance', 'Priority support']),
      store('Shopify Pro', 'shopify-pro', 499, false, ['Everything in Shopify Growth', '12 hours edits/month', '24/7 emergency fixes', '4-hour response']),
    ],
  },
};
prices.annualNote.pt = '2 meses grátis';
// Owner, 2026-11-03: no first month free anywhere; yearly billing stays 2 months free.
delete prices.firstMonthNote;
delete prices.localRatesDate;
prices.local = local;
writeFileSync(FILE, `${JSON.stringify(prices, null, 2)}\n`);
const rows = Object.entries(local).map(([path, l]) => `| ${path.replace('/website-maintenance-services-for-', '').replace('/', '')} | ${l.currency} | ${l.monthly.join(' / ')} | ${l.annual.join(' / ')} | ${l.fix} | ${l.cleanup} |`);
writeFileSync('reports/country-prices.md', `# Country plan prices\n\nThe owner's rounded table (2026-11-01). Annual is 10 times the monthly (2 months free). To change a price, edit TABLE in scripts/build-country-prices.mjs, run it, then run migrate-content.mjs and build.\n\n| Country | Currency | Monthly: Essential / Growth / Business | Annual | One-time fix from | Hacked site cleanup |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(rows.join('\n'));
