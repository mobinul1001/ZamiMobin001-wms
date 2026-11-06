# Price mismatches: FAQ answers vs pricing cards (rebuilt pages)

Nothing was changed (owner decision, 2026-11-06). For each FAQ answer that names a price that is not one of the page's card prices:
- "on live page" / "not on live page": whether that amount appears in the crawled live page text (export/pages, the live site before the rebuild).
- Card prices marked * do not appear in the live page text: they come from a decision made in this rebuild (for example the migration $1,199, confirmed by the owner, or a master plan price added to a card).
Many FAQ amounts are market ranges ("$50 to $500 a month") rather than our prices; they are listed so the owner can judge.

11 FAQ answers on 8 pages.

| Page | FAQ question | FAQ answer (start) | FAQ price(s) not on a card | Card prices on the page |
|---|---|---|---|---|
| /website-repair-services/ | How much does website repair cost? | Small fixes are $49, most repairs are $99–$299, complex work is quoted, and hacked site cleanup is $149. We give a free diagnostic before any charge is confirmed. | $99 (on live page), $299 (on live page), $149 (on live page) | $49* |
| /website-design-services/ | How much does professional website design cost? | Website design costs $799 for a Starter site (up to 5 pages), $1,499 for a Business site (up to 10 pages, blog, speed and SEO setup), and $2,499 for a WooCommerce store (up to 50 products). | $799 (not on live page), $2,499 (not on live page) | $1,499, $2,999, $5,499 |
| /website-seo-services/ | How much do SEO services cost? | Our monthly SEO plans are $299 (Local SEO Starter), $599 (SEO Growth) and $999 (SEO Pro). A one-time SEO audit is $199. We operate on month-to-month contracts. | $999 (on live page) | $299*, $599*, $1,999, $199* |
| /website-update-services/ | How much do website updates cost? | Website updates are included in every plan, from $79/month to $299/month. A one-time catch-up update for long-outdated sites starts at $99. | $299 (on live page), $99 (on live page) | $79* |
| /website-update-services/ | Do you offer one-time website updates instead of monthly plans? | Yes. If your site has not been updated in a long time and you need a comprehensive catch-up, we offer a one-time catch-up update, from $99. We will update everything, test functionality, and provide a full report. Howeve… | $99 (on live page) | $79* |
| /wordpress-backup-services/ | How much does a WordPress backup service cost? | Backups are included in every plan, from $79/month. Emergency restore without a plan starts at $99. | $99 (not on live page) | $79* |
| /white-label-website-maintenance-services-for-agencies/ | How much does a white label website maintenance retainer cost? | Wholesale for agencies, per site per month: $59 for 1–5 sites, $49 for 6–20 sites, and $39 for 21+ sites. | $39 (on live page) | $59, $49* |
| /white-label-website-maintenance-services-for-agencies/ | Do you offer white label WordPress care plans? | Yes. We offer fully white-labeled WordPress care plans that agencies can resell at $149, keeping up to $110 per site. | $149 (not on live page), $110 (not on live page) | $59, $49* |
| /ecommerce-website-maintenance-packages/ | How much does it cost to maintain an ecommerce website? | Ecommerce website maintenance costs $199 to $600+ per month in 2026. Most small and mid-size stores pay $199–$349/month for full-service care covering updates, security, daily backups, checkout monitoring, and support, w… | $600 (on live page), $349 (not on live page), $599 (not on live page) | $199* |
| /ecommerce-website-maintenance-packages/ | Do you offer affordable, low monthly ecommerce maintenance? | Yes. Our Store Starter plan starts at $199/month (or $1,990/year, 2 months free) with no lock-in contract, making professional ecommerce maintenance affordable for small and new online stores. You can upgrade anytime as … | $1,990 (not on live page) | $199* |
| /shopify-website-maintenance-packages/ | How much does Shopify website maintenance cost? | Shopify website maintenance costs $149 to $500+ per month in 2026. Most stores pay $149–$299/month for theme and app maintenance, security, backups, speed, and support, while high-volume and Shopify Plus stores run $499+… | $500 (on live page), $299 (not on live page), $499 (not on live page) | $149* |

## Card prices vs the live site today (read-only check, 2026-11-06)

The live pages were fetched today (plain GET, nothing changed on the live site) and every "$" amount on them was listed. The cards on the rebuild show the prices from the owner's list of 2026-11-06 (prices.json `liveSitePrices`, `confirmed: false`). Three pages differ from what the live site shows today:

| Page | Rebuild cards (owner's list) | Live site today (all $ amounts found) | Same? |
|---|---|---|---|
| /website-seo-services/ | $299 / $599 / custom from $1,999 per month; audit $199 | $499, $999, $1,999 | **no**: $299, $599 and $199 are not on the live page; $499 and $999 are |
| /website-speed-optimization-services/ | $149 / $299 / $499 | $99, $199, $349, $499 | **no**: only $499 matches |
| /white-label-website-maintenance-services-for-agencies/ | $59 (1–5 sites) / $49 (6–20 sites) | $59, $39 (plus the margin figures $6,500, $4,500, $22k, $17k, $75, $5k) | **no**: the live page says $39, not $49 |
| /website-design-services/ | $1,499 / $2,999 / from $5,499 | $1,499, $2,999, $5,499 (+ redesign mentions $1,200, $2,500, $5,500) | yes |
| /website-redesign-services/ | $1,200 – $2,500 / $2,500 – $5,500 / from $5,500 | $1,200, $2,500, $5,500 | yes |
| /website-support-services/ | $199 / $399 / $699 | $199, $399, $699 | yes |
| /wordpress-malware-removal-service/ | $149 / $249 / $349 | $149, $249, $349 | yes |

Where the SEO, speed and white-label card prices come from: the rebuild's page text for these three pages carries the service price sets added in an earlier phase (reports/service-package-prices.md), not the text on the live site today. Nothing was changed (owner decision 1). **Owner: for these three pages, should the cards show your list (as now) or the live-site prices?** One place to change: `src/data/prices.json` → `liveSitePrices`, plus the same numbers in the page text.
