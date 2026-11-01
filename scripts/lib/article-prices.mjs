// Owner's instructions, 2026-11-01. Lines about our plans use the master names and prices. Market ranges in articles:
// $49–$99 entry, $149–$299 mid, $300–$600+ premium; small businesses typically $75–$200/month.
const OFFERS = ['Free hosting for the first year', '2 free webmail accounts'];
const HASH = { $79: 'essential', $149: 'growth', $299: 'business' };

// Plan cards in articles and on the WordPress page: first-month note, the two offers, and the plan hash on the button.
function addOffersToCards(md) {
  const out = [];
  let plan = '';
  let offersDue = false;
  for (const line of md.split('\n')) {
    const price = /^(\$(?:79|149|299))\/mo$/.exec(line);
    if (price) {
      plan = price[1];
      offersDue = true;
      out.push(line, '', 'First month free');
      continue;
    }
    if (plan && /^\[[^\]]+\]\(\/get-a-free-quote\/\)$/.test(line)) {
      out.push(line.replace('/get-a-free-quote/)', `/get-a-free-quote/#${HASH[plan]})`));
      plan = '';
      continue;
    }
    if (offersDue && /^-   /.test(line)) {
      out.push(...OFFERS.map((o) => `-   ${o}`));
      offersDue = false;
    } else if (offersDue && line === "What's Included:") {
      out.push(line, '', ...OFFERS.flatMap((o) => [o, '']));
      offersDue = false;
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
const ADD_OFFERS = [/[\s\S]+/, (md) => addOffersToCards(md)];
const OVERALL = [['$20 to $500+', '$20 to $600+'], ['$20–$500+', '$20–$600+']];

export const ARTICLE_CHANGES = {
  '/wordpress-website-maintenance-packages/': [
    ...[['WP Starter', 'Essential'], ['WP Growth', 'Growth'], ['WP Premium', 'Business']],
    ADD_OFFERS,
  ],
  '/best-fixrunner-alternatives/': [
    ['$95/mo, hosting included (1yr free)', '$79/mo, hosting included (1yr free)'],
    ['$95 (hosting free)', '$79 (hosting free)'],
    ['the "premium" $95 becomes', 'the "premium" $79 becomes'],
    [/^\$95$/m, '$79'],
  ],
  '/best-wp-buffs-alternatives/': [
    ['$95/mo, hosting included (1yr free)', '$79/mo, hosting included (1yr free)'],
    ['$95 (hosting free)', '$79 (hosting free)'],
    [/^\$95$/m, '$79'],
  ],
  '/sitecare-alternative/': [
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
    ['Save 20% on all plans when you choose annual billing.', 'Get 2 months free on all plans when you choose annual billing.'],
    ['Annually Save 20%', 'Annually: 2 months free'],
  ],
  '/best-website-maintenance-for-small-business/': [
    ['costs $20-$500+/month in 2026; most pay $95-$195', 'costs $20-$600+/month in 2026; most pay $75-$200'],
    ...OVERALL,
    ['costs $95-$195/mo', 'costs $75-$200/mo'],
    ['$95+Typical plan / month', '$75–$200Typical plan / month'],
    ['20%saved billed annually', '2 months free on annual billing'],
    ['| Basic / brochure site | $20 – $95 | Essential | DIY or Essential |', '| Basic / brochure site | $49 – $99 | Essential | DIY or Essential |'],
    ['| Small business WordPress site | $95 – $195 | Full-service | Essential / Advanced |', '| Small business WordPress site | $75 – $200 | Full-service | Essential / Growth |'],
    ['| Lead-gen / service business | $195 | Growth | Advanced |', '| Lead-gen / service business | $149 – $299 | Growth | Growth |'],
    ['| Small WooCommerce store | $395+ | Premium | Elevate |', '| Small WooCommerce store | $300 – $600+ | Premium | Business |'],
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
    ADD_OFFERS,
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
    ADD_OFFERS,
  ],
  '/how-much-does-wordpress-website-maintenance-cost/': [
    ['($95–$395/mo)', '($79–$299/mo)'],
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
    ['| WooCommerce store | $395+ | Elevate |', '| WooCommerce store | $300–$600+ | Business |'],
    ['| Membership / booking | $395+ | Elevate + custom |', '| Membership / booking | $300–$600+ | Business + custom |'],
    ['$195–$600+/month', '$149–$600+/month'],
    ['**past $195/month** for piecemeal services — which is exactly why a bundled plan like Advanced', '**past $149/month** for piecemeal services — which is exactly why a bundled plan like Growth'],
    ['| Agency plan | $95–$500+ |', '| Agency plan | $149–$600+ |'],
    ['built into our Advanced and Elevate plans', 'built into our Growth and Business plans'],
    ['an instant 20% off, the single easiest saving', '2 months free, the single easiest saving'],
    ['At $195/month, the Advanced plan', 'At $149/month, the Growth plan'],
    ['professional managed care plans run $95–$395/month', 'professional managed care plans run $149–$299/month'],
    ['managed plans run $95–$395/month', 'managed plans run $149–$299/month'],
    ['Our transparent plans: Essential $95, Advanced $195 (most popular), Elevate $395 — 20% off annually', 'Our transparent plans: Essential $79, Growth $149 (most popular), Business $299 — 2 months free annually'],
    ['best served by the Advanced plan', 'best served by the Growth plan'],
    ['need Elevate-tier care ($395+/month)', 'need Business-tier care ($299+/month)'],
    ['once you pass ~$195/month', 'once you pass ~$149/month'],
    ...CARD_LINES,
    ADD_OFFERS,
  ],
  '/white-label-wordpress-maintenance-support/': [
    ['$49/site/mo\n\nor $39/site/mo billed annually', '$59/site/mo'],
    ['Advanced\n\n$99/site/mo\n\nor $79/site/mo billed annually', 'Growth\n\nAsk for your rate'],
    ['Elevate\n\n$179/site/mo\n\nor $143/site/mo billed annually', 'Business\n\nAsk for your rate'],
    ['Everything in Advanced', 'Everything in Growth'],
    ['Annual billing saves roughly 20% (about 2.4 months free) on every tier.', 'Annual billing gives 2 months free.'],
    ['| Client Sites | Your Discount | Essential | Advanced | Elevate |', '| Client Sites | Your Discount | Essential | Growth | Business |'],
    ['| 1 – 4 sites | Standard rate | $49 | $99 | $179 |', "| 1 – 4 sites | Standard rate | $59 | Let's talk | Let's talk |"],
    ['| 5 – 9 sites | 10% off | $44 | $89 | $161 |', "| 5 – 9 sites | Let's talk | Let's talk | Let's talk | Let's talk |"],
    ['| 10 – 24 sites | 20% off | $39 | $79 | $143 |', "| 10 – 24 sites | Let's talk | Let's talk | Let's talk | Let's talk |"],
    ['Annual billing applies an additional discount on top.', 'Annual billing gives 2 months free.'],
    ['Here is a realistic example using our most popular Advanced tier:', 'Here is a realistic example:'],
    ['### Example: 15 client sites on Advanced', '### Example: 15 client sites'],
    ['You pay us **$79/site/mo** (10+ sites rate) and resell to your clients at a typical **$195/site/mo**. That\'s a margin of **$116/site/mo**.', 'You pay us **$59/site/mo** and resell to your clients at **$149/site/mo**. That\'s a margin of **$90/site/mo**.'],
    ['$1,740 / month profit', '$1,350 / month profit'],
    ['**$20,880/year**', '**$16,200/year**'],
    ['| Entry price /site/mo | From $39 |', '| Entry price /site/mo | From $59 |'],
    ['| Speed optimization | Advanced+ |', '| Speed optimization | Growth+ |'],
    ['| WooCommerce care | Elevate |', '| WooCommerce care | Growth+ |'],
    ['| Content edits included | Advanced+ |', '| Content edits included | Essential+ |'],
    ['| Annual discount | ~20% |', '| Annual discount | 2 months free |'],
    ['| Volume discounts | 5 / 10 / 25+ sites |', "| Volume discounts | Let's talk |"],
    ['| Dedicated account manager | Elevate |', '| Dedicated account manager | Business |'],
    ['Wholesale per-site pricing starts at $49/month for Essential, $99/month for Advanced, and $179/month for Elevate. Volume discounts bring this down to $39, $79, and $143 per site at 10+ sites, with extra savings on annual billing. You set', 'Wholesale pricing is $59 per site per month. Ask us for a rate on more client sites. You set'],
    ['Pricing drops as you add sites: standard rate for 1-4 sites, 10% off for 5-9 sites, 20% off for 10-24 sites, and custom volume pricing for 25+ sites. Annual billing applies a further discount on top.', 'Wholesale pricing is $59 per site per month. Ask us for a rate on more client sites. Annual billing gives 2 months free.'],
    ['For example, buying Advanced at $79/site and reselling at $195/site earns $116/site/month. Across 15 client sites that\'s $1,740/month, or about $20,880/year', 'For example, buying at $59/site and reselling at $149/site earns $90/site/month. Across 15 client sites that\'s $1,350/month, or about $16,200/year'],
    ['annual and volume discounts, and a dedicated account manager on Elevate', 'annual billing with 2 months free, and a dedicated account manager on Business'],
    ['Volume discounts: 10% off at 5+ sites, 20% off at 10+ sites, custom at 25+', 'Wholesale price: $59/site/month; ask for a rate on more client sites'],
    ['Annual billing saves a further ~20% on every tier', 'Annual billing gives 2 months free'],
  ],
};

export const articlePairs = (path) => ARTICLE_CHANGES[path] ?? [];

// These pages' lines with a price, percentage or old plan name may change; other old lines must still be on the page.
export const isChangedArticleLine = (line, path) => Boolean(ARTICLE_CHANGES[path]) && /\$|%|Advanced|Elevate|WP (Starter|Growth|Premium)|Essential|Let's talk|discount/.test(line);

// Schema offers on these pages follow the same prices. White-label tiers without a confirmed price lose their offer.
const OFFER_PATHS = new Set(['/', '/agreement/', '/how-much-does-website-maintenance-cost/', '/how-much-does-wordpress-website-maintenance-cost/', '/white-label-wordpress-maintenance-support/']);
const PRICE_MAP = { 95: 79, 195: 149, 395: 299 };
const planName = (s) => s.replace(/^Advanced\b/, 'Growth').replace(/^Elevate\b/, 'Business');
function fixOfferNode(node, path) {
  if (Array.isArray(node)) return node.map((n) => fixOfferNode(n, path)).filter((n) => n !== null);
  if (!node || typeof node !== 'object') return node;
  const out = {};
  for (const [k, v] of Object.entries(node)) out[k] = k === 'name' && typeof v === 'string' ? planName(v) : fixOfferNode(v, path);
  if ([].concat(out['@type'] ?? []).includes('Offer') && out.price !== undefined) {
    if (path === '/white-label-wordpress-maintenance-support/') {
      if (!/^Essential/.test(out.name ?? '')) return null;
      out.price = '59.00';
    } else {
      const decimals = String(out.price).includes('.');
      const mapped = PRICE_MAP[parseFloat(out.price)];
      if (mapped) out.price = decimals ? `${mapped}.00` : String(mapped);
    }
  }
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
