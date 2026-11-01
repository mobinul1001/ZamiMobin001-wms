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
  for (const head of heads) {
    const leaf = $('body *').filter((_, x) => $(x).children().length === 0 && $(x).text().trim() === head && $(x).parent().find('a').filter((_i, l) => /quote/.test($(l).attr('href') ?? '')).length > 0).first();
    if (!leaf.length) throw new Error(`${path}: plan card "${head}" not found`);
    const card = leaf.parent();
    let link = card.find('a').filter((_i, l) => /quote/.test($(l).attr('href') ?? '')).last();
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
const ARTICLE_HEADS = ['Essential', 'Advanced', 'Elevate'];
const STORE_REMOVALS = {
  '/wordpress-website-maintenance-packages/': ($) => {
    removeCardFeatures($, '/wordpress-website-maintenance-packages/', ['WP Starter', 'WP Growth', 'WP Premium']);
    removeLeaf($, 'Hosting Management ($20/mo)');
  },
  '/best-website-maintenance-for-small-business/': ($) => removeCardFeatures($, 'small business', ARTICLE_HEADS),
  '/how-much-does-website-maintenance-cost/': ($) => removeCardFeatures($, 'cost', ARTICLE_HEADS),
  '/how-much-does-wordpress-website-maintenance-cost/': ($) => removeCardFeatures($, 'WordPress cost', ARTICLE_HEADS),
  '/ecommerce-website-maintenance-packages/': ($) => removeCardFeatures($, 'ecommerce', ['Ecommerce Starter', 'Ecommerce Growth', 'Ecommerce Premium']),
  '/shopify-website-maintenance-packages/': ($) => removeCardFeatures($, 'Shopify', ['Shopify Starter', 'Shopify Growth', 'Shopify Premium']),
};
const countryRemovals = Object.fromEntries(localPaths().map((path) => [path, ($) => removeCardList($, path)]));

const REMOVALS = {
  ...countryRemovals,
  ...STORE_REMOVALS,
  // Owner, 2026-11-01: the master price list replaces the old plan cards.
  '/': ($) => {
    const section = $('a').filter((_, e) => /Choose Essential/.test($(e).text())).first().closest('section.pricing-container');
    if (!/Choose Advanced/.test(section.text()) || !/Choose Elevate/.test(section.text())) throw new Error('/: old plan section not found');
    section.remove();
  },
  '/monthly-website-maintenance-packages/': ($) => {
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
const MAX_WORDS = { ...Object.fromEntries(Object.keys(STORE_REMOVALS).map((path) => [path, 220])), ...Object.fromEntries(localPaths().map((path) => [path, 150])), '/get-a-free-quote/': 60, '/blogs/': 40, '/': 170, '/monthly-website-maintenance-packages/': 240, '/contact/': 150 };
const countWords = ($) => $('body').text().trim().split(/\s+/).length;

export function applyApprovedRemovals($, path) {
  if (!REMOVALS[path]) return;
  const before = countWords($);
  REMOVALS[path]($);
  const removed = before - countWords($);
  if (removed > MAX_WORDS[path]) throw new Error(`${path}: approved removal took ${removed} words, limit ${MAX_WORDS[path]}`);
}
