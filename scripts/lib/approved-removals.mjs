// Text the owner approved removing from old pages. Used by the migration and the parity test,
// so parity does not report it as lost.
const REMOVALS = {
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
const MAX_WORDS = { '/': 170, '/monthly-website-maintenance-packages/': 240, '/contact/': 150 };
const countWords = ($) => $('body').text().trim().split(/\s+/).length;

export function applyApprovedRemovals($, path) {
  if (!REMOVALS[path]) return;
  const before = countWords($);
  REMOVALS[path]($);
  const removed = before - countWords($);
  if (removed > MAX_WORDS[path]) throw new Error(`${path}: approved removal took ${removed} words, limit ${MAX_WORDS[path]}`);
}
