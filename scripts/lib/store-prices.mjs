// Store plans on the WooCommerce (ecommerce) and Shopify pages (owner, 2026-11-01). Prices live in src/data/prices.json.
import { readFileSync } from 'node:fs';

const { storePlans, annualNote, firstMonthNote } = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));
const money = (n) => `$${n.toLocaleString('en-US')}`;

const cardPair = (plan, oldPrice, oldAnnual, oldButton, label) => [
  `${oldPrice}/mo\n\nor ${oldAnnual}/mo billed annually\n\n[${oldButton}](/get-a-free-quote/)`,
  `${money(plan.monthly)}/mo\n\n${firstMonthNote.en}\n\nor ${money(plan.annual)}/yr, ${annualNote.en}\n\n[${label}](/get-a-free-quote/#${plan.hash})\n\n${plan.includes.map((f) => `-   ${f}`).join('\n')}`,
];

const [starter, growth, pro] = storePlans.woocommerce.plans;
const [shopStarter, shopGrowth, shopPro] = storePlans.shopify.plans;

export const STORE_CHANGES = {
  [storePlans.woocommerce.path]: [
    cardPair(starter, '$145', '$116', 'Choose Starter', 'Choose Starter'),
    cardPair(growth, '$295', '$236', 'Choose Growth', 'Choose Growth'),
    cardPair(pro, '$595', '$476', 'Choose Premium', 'Choose Pro'),
    ['### Ecommerce Starter', '### Store Starter'], ['### Ecommerce Growth', '### Store Growth'], ['### Ecommerce Premium', '### Store Pro'],
    ['Save 20% with annual billing.', '2 months free with annual billing.'],
    ['| Small / new store | WooCommerce, Shopify | $145 | Ecommerce Starter |', '| Small / new store | WooCommerce, Shopify | $199 | Store Starter |'],
    ['| Growing store | WooCommerce, BigCommerce | $295 | Ecommerce Growth |', '| Growing store | WooCommerce, BigCommerce | $349 | Store Growth |'],
    ['| High-traffic store | WooCommerce, Magento | $595 | Ecommerce Premium |', '| High-traffic store | WooCommerce, Magento | $599 | Store Pro |'],
    ['| Enterprise / marketplace | Magento, custom | $595+ | Premium + custom |', '| Enterprise / marketplace | Magento, custom | $599+ | Store Pro + custom |'],
    ['| Feature | Ecommerce Starter $145 | Ecommerce Growth $295 | Ecommerce Premium $595 |', '| Feature | Store Starter $199 | Store Growth $349 | Store Pro $599 |'],
    ['| Annual billing (per month) | $116 | $236 | $476 |', '| Annual billing (per year) | $1,990, 2 months free | $3,490, 2 months free | $5,990, 2 months free |'],
    ['Our Ecommerce Starter package starts at $145/month (or $116/month billed annually)', 'Our Store Starter plan starts at $199/month (or $1,990/year, 2 months free)'],
    ['Higher tiers add malware removal and emergency recovery.', 'Higher tiers add more edit hours, faster response and 24/7 emergency fixes.'],
    [/^\$145\+$/m, '$199+'],
    ['From $59/mo', 'From $199/mo'], ['from $59/mo', 'from $199/mo'],
    ['$145 to $600+', '$199 to $600+'], ['$145–$295/month', '$199–$349/month'],
    ['$145/month', '$199/month'], ['$145/mo', '$199/mo'], ['from $145,', 'from $199,'],
    ['$595+', '$599+'],
  ],
  [storePlans.shopify.path]: [
    cardPair(shopStarter, '$125', '$100', 'Choose Starter', 'Choose Starter'),
    cardPair(shopGrowth, '$245', '$196', 'Choose Growth', 'Choose Growth'),
    cardPair(shopPro, '$495', '$396', 'Choose Premium', 'Choose Pro'),
    ['### Shopify Premium', '### Shopify Pro'],
    ['Save 20% annually', '2 months free annually'],
    ['save 20% with annual billing', 'get 2 months free with annual billing'],
    ['Save 20% with annual billing.', '2 months free with annual billing.'],
    ['| Small / new Shopify store | $125 | Shopify Starter |', '| Small / new Shopify store | $149 | Shopify Starter |'],
    ['| Growing Shopify brand | $245 | Shopify Growth |', '| Growing Shopify brand | $299 | Shopify Growth |'],
    ['| High-volume store / Shopify Plus | $495 | Shopify Premium |', '| High-volume store / Shopify Plus | $499 | Shopify Pro |'],
    ['| Custom / agency retainer | $495+ | Premium + add-ons |', '| Custom / agency retainer | $499+ | Shopify Pro + add-ons |'],
    ['| Feature | Shopify Starter $125 | Shopify Growth $245 | Shopify Premium $495 |', '| Feature | Shopify Starter $149 | Shopify Growth $299 | Shopify Pro $499 |'],
    ['| Annual billing (per month) | $100 | $196 | $396 |', '| Annual billing (per year) | $1,490, 2 months free | $2,990, 2 months free | $4,990, 2 months free |'],
    ['Higher plans add checkout testing, speed optimization, SEO and analytics review, content edits, and a dedicated account manager.', 'Higher plans add speed and SEO maintenance, priority support, more edit hours, and 24/7 emergency fixes.'],
    ['Our Shopify Premium plan is built for high-volume stores and Shopify Plus, with daily monitoring, advanced security and speed, app conflict resolution, a dedicated account manager, and same-day emergency response.', 'Our Shopify Pro plan is built for high-volume stores and Shopify Plus, with 12 hours of edits a month, 24/7 emergency fixes, and a 4-hour response.'],
    [/^\$125\+$/m, '$149+'],
    ['$125 to $500+', '$149 to $500+'], ['$125–$245/month', '$149–$299/month'],
    ['$125/month', '$149/month'], ['$495+', '$499+'],
  ],
};
