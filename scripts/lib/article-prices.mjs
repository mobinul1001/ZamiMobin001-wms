import { SERVICE_CHANGES } from './service-prices.mjs';
import { compareTable } from './compare-table.mjs';
import { SUPPORT_SECTIONS, SUPPORT_FAQS } from './merged-support.mjs';
import { readFileSync } from 'node:fs';
import { STORE_CHANGES } from './store-prices.mjs';

// Owner's instructions, 2026-11-01. Lines about our plans use the master names and prices. Market ranges in articles:
// $49–$99 entry, $149–$299 mid, $300–$600+ premium; small businesses typically $75–$200/month.
const prices = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));
const PLAN_OF = { $79: 0, $149: 1, $299: 2 };
const HASH = ['essential', 'growth', 'business'];

// Plan cards in articles and on the WordPress page: first-month note, plan hash on the button, master features under it.
function addFeaturesToCards(md) {
  const out = [];
  let plan = -1;
  for (const line of md.split('\n')) {
    const price = /^(\$(?:79|149|299))\/mo$/.exec(line);
    if (price) {
      plan = PLAN_OF[price[1]];
      out.push(line, '', prices.firstMonthNote.en);
      continue;
    }
    if (plan >= 0 && /^\[[^\]]+\]\(\/get-a-free-quote\/(?:#[\w-]+)?\)$/.test(line)) {
      out.push(line.replace(/\/get-a-free-quote\/(?:#[\w-]+)?\)/, `/get-a-free-quote/#${HASH[plan]})`), '', ...prices.plans[plan].includes.map((f) => `-   ${f}`));
      plan = -1;
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

const CARD_LINES = [
  ['Choose Advanced', 'Choose Growth'], ['Choose Elevate', 'Choose Business'],
  ['$95/mo', '$79/mo'], ['$195/mo', '$149/mo'], ['$395/mo', '$299/mo'],
  ['or $76/mo billed annually', 'or $790/yr, 2 months free'],
  ['or $156/mo billed annually', 'or $1,490/yr, 2 months free'],
  ['or $316/mo billed annually', 'or $2,990/yr, 2 months free'],
  [/^(### )?Advanced$/m, (m) => m.replace('Advanced', 'Growth')],
  [/^(### )?Elevate$/m, (m) => m.replace('Elevate', 'Business')],
];
const ADD_FEATURES = [/[\s\S]+/, (md) => addFeaturesToCards(md)];
const MASTER_TABLE = [/^\| Feature \| Essential[^\n]*\n(?:\|[^\n]*\n?)*/m, () => compareTable(prices.plans, prices.annualNote.en)];
const STORE_LINE = 'Running an online store? See [Store plans from $199](/ecommerce-website-maintenance-packages/).';
const OVERALL = [['$20 to $500+', '$20 to $600+'], ['$20–$500+', '$20–$600+']];

const REPAIR_PRICES = 'Small fixes are $49, most repairs are $99–$299, complex work is quoted, and hacked site cleanup is $149.';
export const ARTICLE_CHANGES = {
  ...Object.fromEntries(Object.entries(STORE_CHANGES).map(([path, pairs]) => [path, [...pairs, [/^\| Feature \| (?:Store|Shopify) Starter[^\n]*\n(?:\|[^\n]*\n?)*/m, () => compareTable(Object.values(prices.storePlans).find((s) => s.path === path).plans, prices.annualNote.en)]]])),
  '/website-repair-services/': [
    ['$99 – $249', '$49'],
    ['$149 – $499', '$99 – $299'],
    ['$250 – $699', '$99 – $299'],
    ['$299 – $899', 'Hacked site cleanup $149; other emergencies quoted'],
    ['Most repairs range from $99–$899 depending on complexity, with a free diagnostic before any charge is confirmed.', `${REPAIR_PRICES} We give a free diagnostic before any charge is confirmed.`],
    ['Transparent website repair pricing ranges for small sites ($99-$249), WordPress sites ($149-$499), business sites ($250-$699), and emergency site-down repairs ($299-$899).', REPAIR_PRICES],
  ],
  '/wordpress-backup-services/': [
    [/Whether you run a brochure website, an active e-commerce store, or manage client portfolios, we have a managed \*\*wordpress backup service cost\*\* plan that fits your budget\.?[^\n]*/, 'Backups are included in every plan: weekly on Essential, daily on Growth and Business. Backups are kept 30 days on Essential, 60 on Growth and 90 on Business. Plans start at $79/month. Need a site back without a plan? Emergency restore starts at $99.\n\n[See our plans](/monthly-website-maintenance-packages/) [Request an emergency restore](/get-a-free-quote/#emergency-restore)'],
    ['### White-Label Client Reporting (Agency Plans)', '### White-Label Client Reporting'],
    ['Plans typically range from $29–$199+/month depending on site count, retention length, and support level — see pricing above.', 'Backups are included in every plan, from $79/month. Emergency restore without a plan starts at $99.'],
    ['Yes — agency plans include white-label reporting', 'Yes — our white-label program includes white-label reporting'],
  ],
  '/website-update-services/': [
    ["Choose a plan that fits your site's complexity and your business needs. All plans include backup before every update and a monthly status report.", 'Website updates are included in every plan, from $79/month. Has your site gone a long time without updates? A one-time catch-up update starts at $99.\n\n[See our plans](/monthly-website-maintenance-packages/) [Request a catch-up update](/get-a-free-quote/#catch-up-update)'],
    ['Plans from $49/month', 'Included in every plan from $79/month'],
    ['Content updates are included in our mid and premium maintenance plans.', 'Content updates are included in every plan as edit hours.'],
    ['✓ Included on Mid/Pro Plans', '✓ Included as edit hours'],
    [/^Pro & Agency Plans$/m, 'Business plan'],
    ['| Staging environment | Typically not available | Included on Pro & Agency plans |', '| Staging environment | Typically not available | Included on Business |'],
    ['| Content update requests | ✗ No | ✓ Yes on Mid/Pro plans |', '| Content update requests | ✗ No | ✓ Yes, as edit hours |'],
    ['Staging testing is included in our **Professional and Agency plans**.', 'Staging testing is included in our **Business plan**.'],
    ['our Starter plan gives you', 'our Essential plan gives you'],
    ['Plan: Professional', 'Plan: Growth'],
    ['Plan: Agency', 'Plan: Business'],
    ['After switching to our Agency plan with staging', 'After switching to our Business plan with staging'],
    ['Professional website update services typically range from $49 to $299 per month depending on site complexity and the level of testing required. Our plans start at $49/month for simple sites and go up to $299/month for eCommerce and high-traffic sites. One-time update services are also available for sites that only need occasional attention.', 'Website updates are included in every plan, from $79/month to $299/month. A one-time catch-up update for long-outdated sites starts at $99.'],
    ['You can cancel anytime with 30 days notice.', 'You can cancel anytime.'],
    ['Our Agency plan is specifically designed for WooCommerce stores and includes checkout testing after every update.', 'Our [Store plans](/ecommerce-website-maintenance-packages/) are designed for WooCommerce stores and include a weekly checkout test.'],
    ['Staging testing is included in our Professional and Agency plans.', 'Staging testing is included in our Business plan.'],
    ['Our agency plan supports white-label delivery', 'Our white-label program supports white-label delivery'],
    ['we offer a one-time update audit service.', 'we offer a one-time catch-up update, from $99.'],
  ],
  '/white-label-website-maintenance-services-for-agencies/': [
    ['## White Label Website Maintenance Pricing', '## White Label Website Maintenance Pricing\n\n**Wholesale for agencies.** These per-site rates are for agencies and studios managing client websites under their own brand. Running your own site? See our [Essential, Growth and Business plans](/monthly-website-maintenance-packages/).'],
    ['### Starter Plan', '### Agency Starter'], ['### Growth Plan', '### Agency Growth'], ['### Agency+ Custom', '### Agency Scale'],
    ['Our wholesale agency retainers start at $59/site/month for 1-5 sites, dropping to $39/site/month for 6-20 sites. Custom volume pricing is available for agencies managing 20+ client sites.', 'Wholesale for agencies, per site per month: $59 for 1–5 sites, $49 for 6–20 sites, and $39 for 21+ sites.'],
    ['1 – 5 Client Sites (Starter Tier)', '1 – 5 Client Sites (Agency Starter)'],
    ['6 – 20 Client Sites (Growth Tier)', '6 – 20 Client Sites (Agency Growth)'],
    ['20 – 50 Client Sites (Agency+ Tier)', '21 – 50 Client Sites (Agency Scale)'],
    ['50+ Client Sites (Enterprise Fleet)', '50+ Client Sites (Agency Scale)'],
  ],

  '/wordpress-website-maintenance-packages/': [
    ...[['WP Starter', 'Essential'], ['WP Growth', 'Growth'], ['WP Premium', 'Business']],
    ['Pay annually and get roughly two-and-a-half months free on every WordPress maintenance plan.', 'Pay annually and get 2 months free on every WordPress maintenance plan.'],
    ['delivers daily, mission-critical care for ecommerce and high-traffic websites', 'delivers mission-critical care for high-traffic websites'],
    ['you want weekly updates, daily backups, SEO checks, and content edits.', 'you want weekly updates, daily backups, malware removal, and 3 hours of edits a month.'],
    ['You run a WooCommerce store or high-traffic site needing daily care, malware removal, emergency response, and a dedicated manager.', 'You run a high-traffic site needing 24/7 emergency fixes, staging-tested updates, and priority support. For online stores, see our [WooCommerce store plans](/ecommerce-website-maintenance-packages/).'],
    ['## Monthly vs Annual Pricing: How Much You Save', `${STORE_LINE}\n\n## Monthly vs Annual Pricing: How Much You Save`],
    ADD_FEATURES,
    MASTER_TABLE,
  ],
  '/best-fixrunner-alternatives/': [
    ['| Support model | Metered (~90 min entry) | ✓ Included fixes + 24/7 care |', '| Support model | Metered (~90 min entry) | ✓ Included edit hours; 24/7 emergency fixes on Business |'],
    ['| Staging-tested updates | ✓ Yes | ✓ Yes |', '| Staging-tested updates | ✓ Yes | ✓ On Business |'],
    ['| 24/7 emergency support | ✓ Yes | ✓ Yes, incl. WhatsApp |', '| 24/7 emergency support | ✓ Yes | ✓ 24/7 emergency fixes on Business, WhatsApp support |'],
    ['24/7Monitoring & emergency support', '24/7Emergency fixes on Business'],
    ['You get the same core protection as FixRunner — staging-safe updates, backups, security, and 24/7 emergency support — plus', 'You get core protection — updates, backups and security, with staging-tested updates and 24/7 emergency fixes on Business — plus'],
    ['real 24/7 support including WhatsApp emergencies', 'real support including WhatsApp emergencies, with 24/7 emergency fixes on Business'],
    ['$95/mo, hosting included (1yr free)', '$79/mo, hosting included (1yr free)'],
    ['$95 (hosting free)', '$79 (hosting free)'],
    ['the "premium" $95 becomes', 'the "premium" $79 becomes'],
    [/^\$95$/m, '$79'],
  ],
  '/best-wp-buffs-alternatives/': [
    ['full access, 24/7 WhatsApp emergency support, and no lock-in', 'full access, WhatsApp emergency support (24/7 emergency fixes on Business), and no lock-in'],
    ['| Staging-tested updates | Higher tiers only | ✓ Included |', '| Staging-tested updates | Higher tiers only | ✓ On Business |'],
    ['| 24/7 emergency support | ✓ Yes | ✓ Yes, incl. WhatsApp |', '| 24/7 emergency support | ✓ Yes | ✓ 24/7 emergency fixes on Business, WhatsApp support |'],
    ['24/7Monitoring & emergency support', '24/7Emergency fixes on Business'],
    ['You get the same core protection as WP Buffs — staging-safe updates, backups, security, and 24/7 emergency support — plus', 'You get core protection — updates, backups and security, with staging-tested updates and 24/7 emergency fixes on Business — plus'],
    ['Staging-safe updates, hosting handled, honest pricing with no hidden charges, real 24/7 support including WhatsApp emergencies', 'Hosting handled, honest pricing with no hidden charges, real support including WhatsApp emergencies, staging-tested updates and 24/7 emergency fixes on Business'],
    ['$95/mo, hosting included (1yr free)', '$79/mo, hosting included (1yr free)'],
    ['$95 (hosting free)', '$79 (hosting free)'],
    [/^\$95$/m, '$79'],
  ],
  '/sitecare-alternative/': [
    ['| Staging-tested updates | ✓ Yes | ✓ Yes |', '| Staging-tested updates | ✓ Yes | ✓ On Business |'],
    ['| WhatsApp emergency support | ✗ Ticket / standard | ✓ Direct WhatsApp, 24/7 |', '| WhatsApp emergency support | ✗ Ticket / standard | ✓ Direct WhatsApp; 24/7 emergency fixes on Business |'],
    ['adds direct **WhatsApp emergency support, 24/7 including weekends**', 'adds direct **WhatsApp emergency support**, with 24/7 emergency fixes on Business'],
    [/^WhatsApp 24\/7$/m, 'WhatsApp; 24/7 on Business'],
    ['$95/mo ($195 / $395 tiers)', '$79/mo ($149 / $299 tiers)'],
    ['starts at $95/month and tops out at $395 for premium eCommerce care', 'starts at $79/month and tops out at $299 for premium eCommerce care'],
    ['$95 + 1yr free hosting', '$79 + 1yr free hosting'],
    ['$395 (eCommerce)', '$299 (eCommerce)'],
    [/^\$95$/m, '$79'],
    [/^\$195$/m, '$149'],
  ],
  '/wordpress-site-hacked-what-to-do/': [['$95/moPrevention via maintenance', '$79/moPrevention via maintenance']],
  '/best-website-maintenance-companies/': [
    [/(^-   In: .*$)/m, (m) => `${m}\n\n*We are Website Maintenance Services and include ourselves in this list.*`],
    [/^\$15–\$500$/m, '$15–$600'],
    ['Plans scale from a $95/mo Essential tier to a $395/mo Elevate tier, with 20% off annual billing', 'Plans scale from a $79/mo Essential tier to a $299/mo Business tier, with 2 months free on annual billing'],
    ['from just $95/month', 'from just $79/month'],
    ['$95/mo', '$79/mo'],
    ['A mid-tier plan around $95–$195/month', 'A plan around $75–$200/month'],
    ['$95–$500+/mo', '$149–$600+/mo'],
    ['$95–$500+ per month', '$149–$600+ per month'],
    ['$95–$500+/month', '$149–$600+/month'],
    ['typically $95–$195/month', 'typically $75–$200/month'],
  ],
  '/website-support-services/': [
    ['## Frequently Asked Questions', `${SUPPORT_SECTIONS}## Frequently Asked Questions`],
    ['## Ready to Stop Worrying About Your Website?', `${SUPPORT_FAQS}## Ready to Stop Worrying About Your Website?`],
    ['Save 20% on all plans when you choose annual billing.', 'Get 2 months free on all plans when you choose annual billing.'],
    ['Annually Save 20%', 'Annually: 2 months free'],
  ],
  '/best-website-maintenance-for-small-business/': [
    ['costs $20-$500+/month in 2026; most pay $95-$195', 'costs $20-$600+/month in 2026; most pay $75-$200'],
    ['get roughly two-and-a-half months free on every plan', 'get 2 months free on every plan'],
    ...OVERALL,
    ['costs $95-$195/mo', 'costs $75-$200/mo'],
    ['$95+Typical plan / month', '$75–$200Typical plan / month'],
    ['20%saved billed annually', '2 months free on annual billing'],
    ['| Basic / brochure site | $20 – $95 | Essential | DIY or Essential |', '| Basic / brochure site | $49 – $99 | Essential | DIY or Essential |'],
    ['| Small business WordPress site | $95 – $195 | Full-service | Essential / Advanced |', '| Small business WordPress site | $75 – $200 | Full-service | Essential / Growth |'],
    ['| Lead-gen / service business | $195 | Growth | Advanced |', '| Lead-gen / service business | $149 – $299 | Growth | Growth |'],
    ['| Small WooCommerce store | $395+ | Premium | Elevate |', '| Small WooCommerce store | $199 – $349 | Store | Store Starter or Store Growth |'],
    ['while WooCommerce stores need Business at $299/month', 'while WooCommerce stores need a Store plan from $199/month'],
    ['$95–$195', '$75–$200'],
    ['Save 20% when you pay annually.', 'Get 2 months free when you pay annually.'],
    ['**Advanced ($195/mo)**', '**Growth ($149/mo)**'],
    ['| Essential | $1,140 | $912 | $228 |', '| Essential | $948 | $790, 2 months free | $158 |'],
    ['| Advanced | $2,340 | $1,872 | $468 |', '| Growth | $1,788 | $1,490, 2 months free | $298 |'],
    ['| Elevate | $4,740 | $3,792 | $948 |', '| Business | $3,588 | $2,990, 2 months free | $598 |'],
    ['| Feature | Essential ($95) | Advanced ($195) | Elevate ($395) |', '| Feature | Essential ($79) | Growth ($149) | Business ($299) |'],
    ['| Professional company | $95 – $395 |', '| Professional company | $49 – $600+ |'],
    ['**$95/month (or $76/month billed annually)**', '**$79/month (or $790/year, 2 months free)**'],
    ['upgrade to Advanced or Elevate anytime', 'upgrade to Growth or Business anytime'],
    ['Published plans from $95/mo', 'Published plans from $79/mo'],
    ['can run $395+/month', 'can run $300–$600+/month'],
    ['Our plans: Essential $95, Advanced $195 (most popular), Elevate $395', 'Our plans: Essential $79, Growth $149 (most popular), Business $299'],
    ['Save 20% with annual billing', 'Get 2 months free with annual billing'],
    ['Plans from $95/month', 'Plans from $79/month'],
    ...CARD_LINES,
    [/^Advanced$/m, 'Growth'],
    ADD_FEATURES,
    MASTER_TABLE,
  ],
  '/how-much-does-website-maintenance-cost/': [
    ...OVERALL,
    ['costs $20-$500+/mo', 'costs $20-$600+/mo'],
    ['professional managed plans cost **$95–$395/month** for most businesses', 'professional managed plans cost **$149–$299/month** for most businesses'],
    ['pays around **$100–$200/month**', 'pays around **$75–$200/month**'],
    [/^20%$/m, '2 months free'],
    ['saved billed annually', 'on annual billing'],
    ['| Basic / brochure site | $20 – $95 | $240 – $1,140 |', '| Basic / brochure site | $49 – $99 | $588 – $1,188 |'],
    ['| Small business website | $95 – $195 | $1,140 – $2,340 |', '| Small business website | $75 – $200 | $900 – $2,400 |'],
    ['| WordPress business site | $95 – $395 | $1,140 – $4,740 |', '| WordPress business site | $149 – $299 | $1,788 – $3,588 |'],
    ['| Ecommerce / online store | $195 – $595 | $2,340 – $7,140 |', '| Ecommerce / online store | $300 – $600+ | $3,600 – $7,200+ |'],
    ['| Custom / enterprise | $395 – $1,000+ | $4,740 – $12,000+ |', '| Custom / enterprise | $600 – $1,000+ | $7,200 – $12,000+ |'],
    ['| Agency / managed plan | $95 – $500+/mo |', '| Agency / managed plan | $149 – $600+/mo |'],
    ['| WordPress | $95 – $395 |', '| WordPress | $149 – $299 |'],
    ['| Shopify | $125 – $495 |', '| Shopify | $149 – $499 |'],
    ['| WooCommerce / ecommerce | $145 – $595 |', '| WooCommerce / ecommerce | $199 – $599 |'],
    ['| Magento | $395+ |', '| Magento | $300 – $600+ |'],
    ['with most businesses paying $95–$195/month', 'with most small businesses paying $75–$200/month'],
    ['$1,140–$4,740 for a typical plan. Annual billing usually saves ~20% vs monthly.', '$948–$3,588 for a typical plan. Annual billing usually gives 2 months free.'],
    ['with annual plans typically saving around 20% compared to paying month to month', 'with annual plans typically giving 2 months free compared to paying month to month'],
    ['**$95 to $195 per month**', '**$75 to $200 per month**'],
    ['Pay annually to save around 20% vs monthly billing', 'Pay annually to get 2 months free'],
    ['Save 20% with annual billing.', 'Get 2 months free with annual billing.'],
    ['professional managed plans $95–$395/month', 'professional managed plans $149–$299/month'],
    ['Most businesses pay $95–$195 per month', 'Most small businesses pay $75–$200 per month'],
    ['run $200–$600+ per month', 'run $300–$600+ per month'],
    ['around $100–$300 per month', 'around $75–$299 per month'],
    ['$95–$195', '$75–$200'],
    ['reliable website care from $95/month', 'reliable website care from $79/month'],
    ...CARD_LINES,
    ADD_FEATURES,
  ],
  '/how-much-does-wordpress-website-maintenance-cost/': [
    ['($95–$395/mo)', '($79–$299/mo)'],
    ['you get roughly **two-and-a-half months free**', 'you get **2 months free**'],
    ['costs $20-$500+/month', 'costs $20-$600+/month'],
    ['Essential $95, Advanced $195, Elevate $395 per month (20% off annually)', 'Essential $79, Growth $149, Business $299 per month (2 months free annually)'],
    ['a proper Elevate-tier plan', 'a proper Business-tier plan'],
    ...OVERALL,
    ['plans from $95–$395/mo', 'plans from $79–$299/mo'],
    ['typically run **$95–$395/month**. Our transparent plans are **$95 (Essential)**, **$195 (Advanced)**, and **$395 (Elevate)** per month — with 20% off when billed annually.', 'typically run **$149–$299/month**. Our transparent plans are **$79 (Essential)**, **$149 (Growth)**, and **$299 (Business)** per month — with 2 months free when billed annually.'],
    ['$95–$395Typical managed plan / month', '$149–$299Typical managed plan / month'],
    ['20%saved by paying annually', '2 months free by paying annually'],
    ['the middle and upper range — $95–$395/month —', 'the middle and upper range — $149–$299/month —'],
    ['to roughly $95/month for small business sites, with premium plans reaching $395+', 'to roughly $49–$99/month for small business sites, with premium plans reaching $300–$600+'],
    ['expect **$195/month** on a managed Advanced plan', 'expect **$149/month** on a managed Growth plan'],
    ['Save 20% when billed annually.', 'Get 2 months free when billed annually.'],
    ['**Advanced ($195/mo)**', '**Growth ($149/mo)**'],
    ['Choose **Elevate** only', 'Choose **Business** only'],
    ['| Feature | Essential $95 | Advanced $195 | Elevate $395 |', '| Feature | Essential $79 | Growth $149 | Business $299 |'],
    ['Paying annually cuts 20% off every plan.', 'Paying annually gives you 2 months free on every plan.'],
    ['| Essential | $1,140 | $912 | $228/yr |', '| Essential | $948 | $790, 2 months free | $158/yr |'],
    ['| Advanced | $2,340 | $1,872 | $468/yr |', '| Growth | $1,788 | $1,490, 2 months free | $298/yr |'],
    ['| Elevate | $4,740 | $3,792 | $948/yr |', '| Business | $3,588 | $2,990, 2 months free | $598/yr |'],
    ['**Basic care plan:** $20–$95/month', '**Basic care plan:** $49–$99/month'],
    ['**Standard care plan:** ~$195/month', '**Standard care plan:** $149–$299/month'],
    ['**Premium care plan:** $395–$500+/month', '**Premium care plan:** $300–$600+/month'],
    ['(like our Elevate plan)', '(like our Business plan)'],
    ['| Personal blog / portfolio | $20–$95 | Essential |', '| Personal blog / portfolio | $49–$99 | Essential |'],
    ['| Small business / brochure | $95–$195 | Essential → Advanced |', '| Small business / brochure | $75–$200 | Essential → Growth |'],
    ['| Lead-gen / service business | $195 | Advanced |', '| Lead-gen / service business | $149–$299 | Growth |'],
    ['| Content / news (high traffic) | $195–$395 | Advanced → Elevate |', '| Content / news (high traffic) | $149–$299 | Growth → Business |'],
    ['| WooCommerce store | $395+ | Elevate |', '| WooCommerce store | $199–$599 | Store plans |'],
    ['| Membership / booking | $395+ | Elevate + custom |', '| Membership / booking | $300–$600+ | Business + custom |'],
    ['$195–$600+/month', '$199–$600+/month'],
    ['**past $195/month** for piecemeal services — which is exactly why a bundled plan like Advanced', '**past $149/month** for piecemeal services — which is exactly why a bundled plan like Growth'],
    ['| Agency plan | $95–$500+ |', '| Agency plan | $149–$600+ |'],
    ["A solid maintenance package should cover at least emergency response and malware cleanup — both are built into our Advanced and Elevate plans, so you're never hit with surprise per-incident invoices.", 'A solid maintenance package should cover at least malware cleanup and emergency response. Malware removal is built into our Growth and Business plans, and 24/7 emergency fixes are on Business only.'],
    ['an instant 20% off, the single easiest saving', '2 months free, the single easiest saving'],
    ['At $195/month, the Advanced plan', 'At $149/month, the Growth plan'],
    ['professional managed care plans run $95–$395/month', 'professional managed care plans run $149–$299/month'],
    ['managed plans run $95–$395/month', 'managed plans run $149–$299/month'],
    ['Our transparent plans: Essential $95, Advanced $195 (most popular), Elevate $395 — 20% off annually', 'Our transparent plans: Essential $79, Growth $149 (most popular), Business $299 — 2 months free annually'],
    ['best served by the Advanced plan', 'best served by the Growth plan'],
    ['need Elevate-tier care ($395+/month)', 'need a Store plan (from $199/month)'],
    ['once you pass ~$195/month', 'once you pass ~$149/month'],
    ...CARD_LINES,
    ADD_FEATURES,
    MASTER_TABLE,
  ],
  '/white-label-wordpress-maintenance-support/': [
    ['Essential\n\n$49/site/mo\n\nor $39/site/mo billed annually', '1–5 sites\n\n$59/site/mo'],
    ['Most Popular\n\nAdvanced\n\n$99/site/mo\n\nor $79/site/mo billed annually', '6–20 sites\n\n$49/site/mo'],
    ['Elevate\n\n$179/site/mo\n\nor $143/site/mo billed annually', '21+ sites\n\n$39/site/mo'],
    ['Starter care for client blogs, brochure & small sites.', 'Wholesale for agencies managing client sites.\n\n-   Weekly updates\n-   Weekly backups\n-   Security scan\n-   Uptime monitoring\n-   1 hour edits/month per site\n-   Unbranded client reports'],
    ['Active care for client business & lead-gen sites.', 'The same features at a lower per-site rate.\n\n-   Weekly updates\n-   Weekly backups\n-   Security scan\n-   Uptime monitoring\n-   1 hour edits/month per site\n-   Unbranded client reports'],
    ['Premium care for client stores & high-traffic sites.', 'The same features at our lowest per-site rate.\n\n-   Weekly updates\n-   Weekly backups\n-   Security scan\n-   Uptime monitoring\n-   1 hour edits/month per site\n-   Unbranded client reports'],
    ['Annual billing saves roughly 20% (about 2.4 months free) on every tier.', 'Annual billing gives 2 months free.'],
    ["| Client Sites | Your Discount | Essential | Advanced | Elevate |\n| --- | --- | --- | --- | --- |\n| 1 – 4 sites | Standard rate | $49 | $99 | $179 |\n| 5 – 9 sites | 10% off | $44 | $89 | $161 |\n| 10 – 24 sites | 20% off | $39 | $79 | $143 |\n| 25+ sites | Custom volume | Let's talk | Let's talk | Let's talk |", '| Client Sites | Wholesale price per site/month |\n| --- | --- |\n| 1 – 5 sites | $59 |\n| 6 – 20 sites | $49 |\n| 21+ sites | $39 |'],
    ['Prices are per site per month. Annual billing applies an additional discount on top.', 'Wholesale for agencies. Prices are per site per month. Annual billing gives 2 months free.'],
    ['Here is a realistic example using our most popular Advanced tier:', 'Here is a realistic example:'],
    ['### Example: 15 client sites on Advanced', '### Example: 5 client sites'],
    ["You pay us **$79/site/mo** (10+ sites rate) and resell to your clients at a typical **$195/site/mo**. That's a margin of **$116/site/mo**.", "You pay us **$59/site/mo** (1–5 sites rate) and resell to your clients at **$149/site/mo**. That's a margin of **$90/site/mo**."],
    ['$1,740 / month profit', '$450 / month profit'],
    ["Across 15 sites that's **$20,880/year**", "Across 5 sites that's **$5,400/year**"],
    ['| Speed optimization | Advanced+ |', '| Speed optimization | Not included |'],
    ['| WooCommerce care | Elevate |', '| WooCommerce care | Not included |'],
    ['| Content edits included | Advanced+ |', '| Content edits included | 1 hour/month per site |'],
    ['| Annual discount | ~20% |', '| Annual discount | 2 months free |'],
    ['| Volume discounts | 5 / 10 / 25+ sites |', '| Volume discounts | 6+ and 21+ sites |'],
    ['| Dedicated account manager | Elevate |', '| Dedicated account manager | No |'],
    ['Wholesale per-site pricing starts at $49/month for Essential, $99/month for Advanced, and $179/month for Elevate. Volume discounts bring this down to $39, $79, and $143 per site at 10+ sites, with extra savings on annual billing. You set', 'Wholesale for agencies: $59 per site per month for 1–5 sites, $49 for 6–20 sites, and $39 for 21+ sites. You set'],
    ['Pricing drops as you add sites: standard rate for 1-4 sites, 10% off for 5-9 sites, 20% off for 10-24 sites, and custom volume pricing for 25+ sites. Annual billing applies a further discount on top.', 'Pricing drops as you add sites: $59 per site for 1–5 sites, $49 for 6–20 sites, and $39 for 21+ sites. Annual billing gives 2 months free.'],
    ["For example, buying Advanced at $79/site and reselling at $195/site earns $116/site/month. Across 15 client sites that's $1,740/month, or about $20,880/year", "For example, buying at $59/site and reselling at $149/site earns $90/site/month. Across 5 client sites that's $450/month, or about $5,400/year"],
    ['annual and volume discounts, and a dedicated account manager on Elevate', 'annual billing with 2 months free, and lower rates at 6+ and 21+ sites'],
    ['Volume discounts: 10% off at 5+ sites, 20% off at 10+ sites, custom at 25+', 'Wholesale for agencies: $59/site at 1–5 sites, $49 at 6–20, $39 at 21+'],
    ['Annual billing saves a further ~20% on every tier', 'Annual billing gives 2 months free'],
    ['more included at each tier than bare-bones plans, with healthy margins and volume discounts', 'the same features at every volume, with healthy margins and volume discounts'],
    ['Resell at 2-3x: 15 sites on Advanced can mean $20,880/year recurring profit', 'Resell at $149 and keep up to $110 per site'],
    ['with malware removal and emergency recovery on higher tiers — all delivered under your brand', 'all delivered under your brand'],
  ],
};

for (const [path, pairs] of Object.entries(SERVICE_CHANGES)) ARTICLE_CHANGES[path] = [...pairs, ...(ARTICLE_CHANGES[path] ?? [])];

export const articlePairs = (path) => ARTICLE_CHANGES[path] ?? [];

// These pages' lines with a price, percentage or old plan name may change; other old lines must still be on the page.
const squeeze = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
// An old line is expected to change when one of the page's text pairs covers it, in either direction.
const coveredByPair = (line, path) => {
  const s = squeeze(line);
  return s.length >= 3 && ARTICLE_CHANGES[path].some(([from]) => {
    const f = squeeze(typeof from === 'string' ? from : from.source);
    return f.includes(s) || (f.length >= 20 && s.includes(f));
  });
};
export const isChangedArticleLine = (line, path) => Boolean(ARTICLE_CHANGES[path]) && (coveredByPair(line, path) || /\$|%|Advanced|Elevate|WP (Starter|Growth|Premium)|Essential|Let's talk|discount|Volume Discounts|^Most Popular$|Advanced|Agency\+|Starter Plan|Growth Plan|Pro & Agency|Mid\/Pro|mid and premium|Plan: |Agency plan|agency plans|Agency Plans|30 days notice|Starter plan|Professional and Agency|Support model|Staging|24\/7|update audit|Client Sites|Custom Quote|Brochure|Whether you run|fits your site|client|Ecommerce (Starter|Growth|Premium)|Premium|two-and-a-half|WooCommerce store|mission-critical|SEO checks|Higher (plans|tiers) add|Emergency same-day|Our service includes a full/.test(line));

// Schema offers on these pages follow the same prices. White-label tiers without a confirmed price lose their offer.
const OFFER_NAMES = {
  '/website-speed-optimization-services/': { 'Starter Speed Audit': ['Speed Boost', '149.00'], 'Standard Speed Optimization': ['Core Web Vitals', '299.00'], 'Advanced WooCommerce Speed': ['WooCommerce / Large Site', '499.00'], 'Enterprise Ongoing Speed Retainer': null },
  '/website-design-services/': { 'Starter Website Design Package': ['Starter Website Design', '799.00'], 'Growth Website Design Package': ['Business Website Design', '1499.00'], 'Premium / Enterprise Website Design Package': ['Store Website Design', '2499.00'] },
  '/website-seo-services/': { 'Starter SEO Plan': ['Local SEO Starter', '299.00'], 'Growth SEO Plan': ['SEO Growth', '599.00'], 'Enterprise SEO Plan': ['SEO Pro', '999.00'] },
};
const OFFER_PATHS = new Set([...Object.keys(OFFER_NAMES), '/website-repair-services/', '/wordpress-backup-services/', '/website-update-services/', '/white-label-website-maintenance-services-for-agencies/', '/ecommerce-website-maintenance-packages/', '/', '/agreement/', '/how-much-does-website-maintenance-cost/', '/how-much-does-wordpress-website-maintenance-cost/', '/white-label-wordpress-maintenance-support/']);
const PRICE_MAP = { 95: 79, 195: 149, 395: 299, 145: 199, 295: 349, 595: 599 };
const planName = (s) => s.replace(/^Advanced\b/, 'Growth').replace(/^Elevate\b/, 'Business').replace(/^Ecommerce Starter\b/, 'Store Starter').replace(/^Ecommerce Growth\b/, 'Store Growth').replace(/^Ecommerce Premium\b/, 'Store Pro');
function fixOfferNode(node, path) {
  if (Array.isArray(node)) return node.map((n) => fixOfferNode(n, path)).filter((n) => n !== null);
  if (!node || typeof node !== 'object') return node;
  const named = OFFER_NAMES[path]?.[node.name];
  if (named === null) return null;
  if (named) return { ...node, name: named[0], price: named[1] };
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = k === 'name' && typeof v === 'string' ? planName(v) : fixOfferNode(v, path);
  if (path === '/website-repair-services/' && out.priceSpecification) {
    const spec = { 'Small Website Repair': ['49.00', '49.00'], 'WordPress Repair': ['99.00', '299.00'], 'Business Website Repair': ['99.00', '299.00'] }[out.name];
    if (spec) Object.assign(out.priceSpecification, { minPrice: spec[0], maxPrice: spec[1] });
    else if (out.name === 'Emergency Website Repair') { out.name = 'Hacked Site Cleanup'; Object.assign(out.priceSpecification, { minPrice: '149.00', maxPrice: '149.00' }); }
  }
  if ([].concat(out['@type'] ?? []).includes('Offer') && out.price !== undefined) {
    if (path === '/wordpress-backup-services/') {
      if (!/^Starter/.test(out.name ?? '')) return null;
      Object.assign(out, { name: 'Emergency restore without a plan', price: '99.00' });
      delete out.priceValidUntil;
    } else if (path === '/website-update-services/') {
      if (parseFloat(out.price) === 0) return out;
      if (out.name !== 'Starter Plan') return null;
      Object.assign(out, { name: 'One-time catch-up update', price: '99.00' });
      delete out.priceValidUntil;
    } else if (path === '/white-label-website-maintenance-services-for-agencies/') {
      if (out.name === 'Starter Plan') Object.assign(out, { name: 'Agency Starter', price: '59.00' });
      else if (out.name === 'Growth Plan') Object.assign(out, { name: 'Agency Growth', price: '49.00' });
    } else if (path === '/website-repair-services/') {
      // handled above
    } else if (path === '/white-label-wordpress-maintenance-support/') {
      if (!/^Essential/.test(out.name ?? '')) return null;
      out.price = '59.00';
    } else {
      const decimals = String(out.price).includes('.');
      const mapped = PRICE_MAP[parseFloat(out.price)];
      if (mapped) out.price = decimals ? `${mapped}.00` : String(mapped);
    }
  }
  if (path === '/white-label-website-maintenance-services-for-agencies/' && out.name === 'Agency+ Custom Plan') Object.assign(out, { name: 'Agency Scale', price: '39.00', priceCurrency: 'USD' });
  if (out.lowPrice !== undefined && parseFloat(out.lowPrice) === 95) Object.assign(out, { lowPrice: '79', highPrice: '299' });
  return out;
}
export function fixSchemaOffers(path, schema) {
  if (!OFFER_PATHS.has(path)) return;
  const fixed = fixOfferNode(schema, path);
  schema.splice(0, schema.length, ...fixed);
}

// Same text in meta descriptions, social tags and schema.
export function articleMeta(path, value) {
  if (!ARTICLE_CHANGES[path] || typeof value !== 'string') return value;
  let out = value;
  for (const [from, to] of ARTICLE_CHANGES[path]) if (typeof from === 'string' && typeof to === 'string' && !from.includes('\n')) out = out.replaceAll(from, () => to);
  return out;
}
