// Text the owner approved removing from old pages. Used by the migration and the parity test,
// so parity does not report it as lost.
const REMOVALS = {
  // Owner, 2026-11-01: placeholder "John Doe" testimonial and the unconfirmed "500+" claim.
  '/contact/': ($) => {
    const heading = $('h4').filter((_, e) => /Trusted by 500\+ Businesses/.test($(e).text())).first();
    const block = heading.parent();
    if (!/John Doe/.test(block.text())) throw new Error('/contact/: approved removal block not found');
    block.remove();
  },
};

export const hasApprovedRemoval = (path) => path in REMOVALS;

export function applyApprovedRemovals($, path) {
  REMOVALS[path]?.($);
}
