import { cardHeadsFor, localPaths } from './country-prices.mjs';

// Text the owner approved removing from old pages. Used by the migration and the parity test,
// so parity does not report it as lost.
// Owner, 2026-11-01: country plan cards list the master features, so each old list goes.
const removeCardList = ($, path) => {
  for (const head of cardHeadsFor(path)) {
    const h = $('h3, h4, h5').filter((_, e) => $(e).text().trim() === head).first();
    if (!h.length) throw new Error(`${path}: plan card "${head}" not found`);
    // Some cards have no list. Stop climbing at the grid that holds the other plans.
    let card = h.parent();
    while (!card.find('ul').length && card.parent().find('h3, h4, h5').length === 1) card = card.parent();
    card.find('ul').remove();
  }
};
// Owner, 2026-11-01: WordPress, article and store cards also get new lists. Everything after the button goes, and any list.
const removeCardFeatures = ($, path, heads) => {
  const isBuy = (_i, l) => /quote|contact/.test($(l).attr('href') ?? '');
  for (const head of heads) {
    // The card: the smallest box around the name that also holds a button, and no other plan.
    let card = null;
    $('body *').filter((_, x) => $(x).children().length === 0 && $(x).text().trim() === head).each((_, x) => {
      if (card) return;
      let box = $(x).parent();
      for (let i = 0; i < 4 && box.length && !box.is('body'); i++, box = box.parent()) {
        if (box.find('a').filter(isBuy).length) {
          if (box.text().trim().split(/\s+/).length < 130) card = box;
          return;
        }
      }
    });
    if (!card) throw new Error(`${path}: plan card "${head}" not found`);
    let link = card.find('a').filter(isBuy).last();
    while (!link.parent().is(card)) link = link.parent();
    card.find('ul').remove();
    link.nextAll().remove();
  }
};
const removeLeaf = ($, text) => {
  const leaf = $('body *').filter((_, x) => $(x).children().length === 0 && $(x).text().trim() === text);
  if (!leaf.length) throw new Error(`"${text}" not found`);
  leaf.parent().remove();
};
// Owner, 2026-11-01: comparison tables are rebuilt from the price file, so the old rows go.
const removeCompareRows = ($) => {
  $('table').filter((_, t) => /^\s*Feature/.test($(t).find('tr').first().text()) && /Essential|WP Starter|Ecommerce Starter|Shopify Starter/.test($(t).find('tr').first().text())).find('tr').slice(1).remove();
};
// Owner, 2026-11-01: "every plan" lists name only what really is in all plans.
const removeFromList = ($, headRe, items) => {
  const head = $('h2, h3, h4').filter((_, e) => headRe.test($(e).text().trim())).first();
  if (!head.length) throw new Error(`list heading ${headRe} not found`);
  for (const item of items) {
    let scope = head.parent();
    const find = () => scope.find('*').filter((_, x) => $(x).text().trim() === item && !$(x).children().toArray().some((c) => $(c).text().trim() === item));
    while (!find().length && !scope.is('body')) scope = scope.parent();
    const leaf = find().first();
    if (!leaf.length) throw new Error(`"${item}" not found`);
    const box = leaf.parent().text().trim() === item && !leaf.parent().is(scope) ? leaf.parent() : leaf;
    box.remove();
  }
};
// The grid holding all tiers: the smallest box with both the first and the last label.
const removeTierCards = ($, firstLabel, lastLabel) => {
  let box = $('body *').filter((_, x) => $(x).children().length === 0 && $(x).text().trim() === firstLabel).first();
  if (!box.length) throw new Error(`"${firstLabel}" not found`);
  while (!box.text().includes(lastLabel) && !box.is('body')) box = box.parent();
  if (box.is('body')) throw new Error(`"${lastLabel}" not found`);
  box.remove();
};
// A heading with its text: the card when it holds only this heading, otherwise the text up to the next heading.
// Owner, 2026-11-01: the only promises left are the hacked-site line, the malware re-clean and the migration fix.
const removeMatching = ($, patterns, optional = false) => {
  for (const re of patterns) {
    const found = $('body *').filter((_, x) => re.test($(x).text().trim()) && !$(x).children().toArray().some((c) => re.test($(c).text().trim())));
    if (!found.length && !optional) throw new Error(`${re} not found`);
    found.remove();
  }
};
const removeBlock = ($, text) => {
  const heads = $('h2, h3, h4, h5').filter((_, e) => $(e).text().trim() === text);
  if (!heads.length) throw new Error(`block "${text}" not found`);
  heads.each((_, e) => {
    const h = $(e);
    let box = h.parent();
    while (box.text().trim() === text) box = box.parent();
    if (box.find('h1, h2, h3, h4, h5').length === 1 && box.text().trim().split(/\s+/).length < 80) box.remove();
    else { h.nextUntil('h1, h2, h3, h4, h5').remove(); h.remove(); }
  });
};
const removeLeaves = ($, texts) => {
  for (const text of texts) {
    const found = $('body *').filter((_, x) => $(x).text().trim() === text && !$(x).children().toArray().some((c) => $(c).text().trim() === text));
    if (!found.length) throw new Error(`"${text}" not found`);
    found.remove();
  }
};
const ARTICLE_HEADS = ['Essential', 'Advanced', 'Elevate'];
const STORE_REMOVALS = {
  '/wordpress-website-maintenance-packages/': ($) => {
    removeCardFeatures($, '/wordpress-website-maintenance-packages/', ['WP Starter', 'WP Growth', 'WP Premium']);
    removeLeaf($, 'Hosting Management ($20/mo)');
    removeCompareRows($);
    removeFromList($, /^What's Included in Every Plan\?$/, ['Broken Link Monitoring', 'Monthly Health Report']);
  },
  // Owner, 2026-11-01: no ad tags on this site, so the policy does not describe any.
  '/cookie-policy/': ($) => {
    removeBlock($, 'd) Marketing & Third-Party');
    removeMatching($, [/^Provide relevant content and targeted advertising$/]);
  },
  '/wordpress-backup-services/': ($) => {
    removeTierCards($, 'Starter Tier', 'Agency Tier');
    // The whole "Our Restore Guarantee" panel.
    const panel = $('body *').filter((_, x) => $(x).text().trim() === 'Zero Risk Commitment' && $(x).children().length === 0).first().parent();
    if (!/Restore SLA/.test(panel.text()) || panel.text().trim().split(/\s+/).length > 150) throw new Error('backup guarantee panel not found');
    panel.remove();
  },
  '/website-redesign-services/': ($) => removeBlock($, 'What if something breaks after launch?'),
  '/website-repair-services/': ($) => removeMatching($, [/^Zero Risk Protection$/, /^If anything related to the original issue resurfaces within 30 days/, /^What if the problem comes back after you fix it\?$/]),
  '/website-update-services/': ($) => removeTierCards($, 'Starter Plan', 'Agency / eCommerce'),
  '/white-label-wordpress-maintenance-support/': ($) => removeCardFeatures($, 'white-label post', ['Essential', 'Advanced', 'Elevate']),
  '/white-label-website-maintenance-services-for-agencies/': ($) => {
    removeCardFeatures($, 'white-label', ['Starter Plan', 'Growth Plan', 'Agency+ Custom']);
    removeTierCards($, 'agency-portal.v3', 'Your Brand');
    removeTierCards($, 'agency-ticketing-v2', 'PDF Ready');
    for (const block of ['Central Agency Dashboard', 'Dedicated Slack Channel', '24/7 Emergency Line', 'Need Custom SLA Options for an Enterprise Client?', 'How does your agency dashboard work?', 'Web Application Firewall']) removeBlock($, block);
    removeMatching($, [/^24\/7 Agency SLA Included$/, /^WAF Firewall & SSL Active$/, /^24\/7 SLA$/, /^Average SLA Response Time/, /^Senior Account Lead$/, /^PageSpeed & Demo Funnel SLAs$/, /^Checkout & Cart SLA Supported$/, /^API & Custom Codebase SLA$/, /^99\.99% Uptime SLA$/, /^Outcome: White Label SLA$/, /^Request Agency Dashboard Demo$/], true);
    $('tr').filter((_, r) => /^(24\/7 Emergency Hack Recovery|Self-Serve Agency Portal Dashboard)/.test($(r).text().trim())).remove();
    for (const block of ['Unlimited Small Edits', 'Dedicated Account Manager', 'Performance Optimization', 'Emergency Support', 'Will we have a dedicated account manager?', 'Can you handle unlimited small fixes and edits?']) removeBlock($, block);
    $('p, div').filter((_, x) => /^(Yes! Agencies on our Growth and Agency\+|Yes\. We execute unlimited content edits)/.test($(x).text().trim()) && $(x).children('p, div').length === 0).remove();
    removeLeaves($, ['• Unlimited Small Edits & Fixes', 'Dedicated Account Manager', 'Staging Environment Tested', 'Visual Regression Tested']);
    $('tr').filter((_, r) => /^(Dedicated Senior Account Manager|Unlimited Small Edits & Fixes)/.test($(r).text().trim())).remove();
  },
  '/wordpress-malware-removal-service/': ($) => removeCardFeatures($, 'malware', ['Standard Cleanup', 'Complete Recovery', 'Priority Emergency']),
  '/website-speed-optimization-services/': ($) => {
    removeCardFeatures($, 'speed', ['Starter Audit']);
    removeBlock($, 'Enterprise Ongoing');
  },
  '/website-migration-services/': ($) => removeCardFeatures($, 'migration', ['Basic Migration', 'Standard Migration', 'Enterprise / Custom']),
  '/website-design-services/': ($) => removeCardFeatures($, 'design', ['Premium / Enterprise']),
  '/website-seo-services/': ($) => {
    removeCardFeatures($, 'SEO', ['Starter SEO', 'Growth SEO', 'Enterprise SEO']);
    removeBlock($, 'Dedicated Strategist');
  },
  '/best-website-maintenance-for-small-business/': ($) => { removeCardFeatures($, 'small business', ARTICLE_HEADS); removeCompareRows($); removeMatching($, [/^(✅\s*)?Not happy in the first two weeks\?/]); },
  '/how-much-does-website-maintenance-cost/': ($) => removeCardFeatures($, 'cost', ARTICLE_HEADS),
  '/how-much-does-wordpress-website-maintenance-cost/': ($) => { removeCardFeatures($, 'WordPress cost', ARTICLE_HEADS); removeCompareRows($); },
  '/ecommerce-website-maintenance-packages/': ($) => { removeCardFeatures($, 'ecommerce', ['Ecommerce Starter', 'Ecommerce Growth', 'Ecommerce Premium']); removeCompareRows($); },
  '/shopify-website-maintenance-packages/': ($) => { removeCardFeatures($, 'Shopify', ['Shopify Starter', 'Shopify Growth', 'Shopify Premium']); removeCompareRows($); removeFromList($, /^What's Included in Every Shopify Plan$/, ['24/7 security review', 'Secure backups', 'Uptime & SSL monitoring', 'Product page QA checks']); },
};
const countryRemovals = Object.fromEntries(localPaths().map((path) => [path, ($) => removeCardList($, path)]));

const REMOVALS = {
  ...countryRemovals,
  ...STORE_REMOVALS,
  // Owner, 2026-11-01: the master price list replaces the old plan cards.
  '/': ($) => {
    removeFromList($, /^What.s Included in Every Plan$/, ['Performance Optimization', 'Broken Link Fixing', 'Malware Scan & Removal']);
    const section = $('a').filter((_, e) => /Choose Essential/.test($(e).text())).first().closest('section.pricing-container');
    if (!/Choose Advanced/.test(section.text()) || !/Choose Elevate/.test(section.text())) throw new Error('/: old plan section not found');
    section.remove();
  },
  '/monthly-website-maintenance-packages/': ($) => {
    removeFromList($, /^Complete Website Care/, ['Performance optimization', 'Broken link monitoring', 'Technical error fixing']);
    const head = $('h3').filter((_, e) => /^Our Monthly Website Maintenance Packages$/.test($(e).text().trim())).first().parent();
    const cards = head.next();
    if (!/Essential Website Maintenance Package/.test(cards.text()) || /What You Get With Our Monthly/.test(cards.text())) throw new Error('/monthly-website-maintenance-packages/: old plan section not found');
    head.remove();
    cards.remove();
  },
  // The old JavaScript post list: a filter row and hidden placeholders ("Loading Title..."). Never visible as content.
  // BlogIndex.astro lists every article in plain links instead.
  '/blogs/': ($) => {
    const list = $('#localReadModal').closest('.grid-local-wrapper');
    if (!list.find('#noPostsFoundBox').length) throw new Error('/blogs/: old post list not found');
    list.remove();
  },
  // Owner's form spec: name, email, website URL, platform, message, plan pre-selected. The coupon box needed the old JavaScript.
  '/get-a-free-quote/': ($) => {
    const wrapper = (control) => {
      let box = control;
      while (!box.parent().find('label').length) box = box.parent();
      return box.parent();
    };
    const coupon = $('input[name="coupon_code"]');
    const site = $('input[name="website_url"]');
    if (!coupon.length || !site.length) throw new Error('/get-a-free-quote/: form fields not found');
    const currencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'CHF', 'BRL'];
    wrapper($('select[name="plan"]')).after(`<div><label for="currency">Currency</label> <select name="currency">${currencies.map((c) => `<option>${c}</option>`).join('')}</select></div>`);
    wrapper(coupon).remove();
    $('form button[type="button"]').filter((_, b) => /^Apply$/.test($(b).text().trim())).remove();
    wrapper(site).after('<div><label for="platform">Platform</label> <select name="platform" required><option value="">(Select one)</option><option>WordPress</option><option>WooCommerce</option><option>Shopify</option><option>Other or not sure</option></select></div>');
    const plans = [['essential', 'Essential'], ['growth', 'Growth'], ['business', 'Business'], ['one-time-fix', 'One-time fix'], ['hacked-cleanup', 'Hacked site cleanup'], ['store-starter', 'Store Starter (WooCommerce)'], ['store-growth', 'Store Growth (WooCommerce)'], ['store-pro', 'Store Pro (WooCommerce)'], ['shopify-starter', 'Shopify Starter'], ['shopify-growth', 'Shopify Growth'], ['shopify-pro', 'Shopify Pro'], ['other', 'Other or not sure']];
    $('select[name="plan"]').html(`<option value="">(Select one)</option>${plans.map(([v, n]) => `<option value="${v}">${n}</option>`).join('')}`);
    $('form button[type="submit"]').filter((_, b) => /Discounted Quote/.test($(b).text())).text('Get My Quote');
  },
  // Owner, 2026-11-01: placeholder "John Doe" testimonial and the unconfirmed "500+" claim.
  '/contact/': ($) => {
    const heading = $('h4').filter((_, e) => /Trusted by 500\+ Businesses/.test($(e).text())).first();
    const block = heading.parent();
    if (!/John Doe/.test(block.text())) throw new Error('/contact/: approved removal block not found');
    block.remove();
  },
};

export const hasApprovedRemoval = (path) => path in REMOVALS;

// A removal may only take the block the owner approved. Anything bigger stops the run.
const MAX_WORDS = { '/white-label-website-maintenance-services-for-agencies/': 1000, ...Object.fromEntries(Object.keys(STORE_REMOVALS).map((path) => [path, 620])), ...Object.fromEntries(localPaths().map((path) => [path, 150])), '/white-label-website-maintenance-services-for-agencies/': 1000, '/get-a-free-quote/': 60, '/blogs/': 40, '/': 185, '/monthly-website-maintenance-packages/': 255, '/contact/': 150 };
const countWords = ($) => $('body').text().trim().split(/\s+/).length;

export function applyApprovedRemovals($, path) {
  if (!REMOVALS[path]) return;
  const before = countWords($);
  REMOVALS[path]($);
  const removed = before - countWords($);
  if (removed > MAX_WORDS[path]) throw new Error(`${path}: approved removal took ${removed} words, limit ${MAX_WORDS[path]}`);
}
