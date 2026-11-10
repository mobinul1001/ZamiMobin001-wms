# Mobile redesign: final report (batch 4, Part 4)

Branch `mobile-redesign`, cut from `b2-content`. Nothing is merged or pushed.

**No screenshots, tests or design checks were run, as ordered.** The only check was one plain `npm run build`, which ended with 0 failures and 45 warnings (the same warning count as before). The first build stopped once, because the unnamed step checkbox sat inside the hero form; it was moved to just before the form and the build passed.

Every phone rule uses `max-width: 760px`, the site's existing phone breakpoint, so the new rules and the old ones switch at the same width. The prompt said 759px. The menu rules apply wherever the burger menu shows (below 1081px). Desktop is not changed: no desktop selector was edited.

## Files
- **New:**
  - `src/styles/mobile.css`: global phone rules, Z3 tables, G1 sticky bar, the strips, and the H2 menu.
  - `src/styles/mobile-home.css`: homepage phone layouts.
  - `src/styles/mobile-pages.css`: service-type, plans, article, blog index and leftover pages.
  - `src/middleware.ts`: adds a `data-label` attribute to each table cell at build time.
  - `reports/mobile-redesign/AUDIT.md`, `PROGRESS.md` and this file.
- **Changed:**
  - `src/layouts/Base.astro`: imports, the mobile menu markup and script, the sticky bar on every page, and the 2-step form script.
  - `src/lib/home.ts`: controls for the 2-step form, pricing rows, comparison toggles, steps and services accordion; strip attributes; the country strip copy; an OWNER CHECK comment.
  - `src/lib/plans.ts`: the pricing-row option, homepage only.
  - `src/components/templates/Article.astro`: a `p1` class on non-Tier-A articles.

## SEO guard rules, followed as design rules
- **No text, heading or link order changed in any page's HTML.**
  - Step labels, Next / Back, "Step N of 5", ‹ ›, +/– and the toggle labels are drawn by CSS (`content:`). Their `aria-label` values reuse existing words: the step titles, plan names, table headers and WHO names.
  - The country strip's loop copy has `aria-hidden="true"` and `tabindex="-1"` on its links. It shows only on phones.
- **Added to the HTML (attributes and controls only, no words):**
  - radio inputs for pricing rows, steps, services and comparisons;
  - empty labels and buttons;
  - `role`, `tabindex` and `aria-label` on the moving strips;
  - `data-label` on table cells;
  - the 10-chip country copy;
  - the sticky bar on every page. This adds one "Get a free quote" link to /get-a-free-quote/ per page, so internal links went from 9143 to 9245. The country copy adds 10 links and 10 images, so images went from 572 to 582.
- **What changed in the mobile menu:** its markup was rebuilt for the drill-in design. All 16 service links, the 4 main links, the theme switch and "Get a free quote" are still in the HTML. Desktop header markup is unchanged.
- **No change to:** JSON-LD, canonical, meta, FAQ text, alt text or `lang`.
- **The parity tool needs updating:** it does not yet know to skip the country copy (`.country.dup`). Do this before the owner runs parity.

## Per section
| Section | Status | Notes |
|---|---|---|
| Global: no sideways swipe | done | `.hp-swipe`, `.rp-stories`, `.rp-cmp-nav`, `.pp-tscroll`, `.rp-tscroll`, `.sv-tscroll`, `.tbl-wrap` and `main .card table` no longer scroll sideways. Still moving: the `.hp-mq` strips, `.mg-marquee` (migration) and `pre`. |
| Global: font floor | done | Every selector under 15px in AUDIT.md is now 15px; uppercase labels are 13px. Footer sizes are listed but not changed (footer not touched). `pre` stays 14px. |
| Global: tap targets and clipping | done | Buttons are 52px; summaries, tabs, links in rows and chips are 44px. Buttons fill the width in cards and button rows. The listed `nowrap` rules are removed (except the footer). `min-width:0` and `minmax(0,1fr)` are set on grid and flex children. |
| G1 sticky bar | done | On every template, phones only. Pages get bottom padding plus `env(safe-area-inset-bottom)`. The bar hides while the menu is open. |
| Z3 phone tables | done | Every `<table>` in `main` on every template. The purple band shows the row name, with labelled cells under it: 2 or 3 cells side by side, a 2-column grid for 4 or more. The thead is hidden visually only. Tinted columns (`.w`, `.td-good`, `.us`) keep their tint. Min-width removed. |
| H2 header menu | done | Top list: Services ›, Pricing, Blog, About, Contact. The Services panel has ‹ Back, 4 group tabs in a 2×2 grid (`role="tablist"`, arrow keys), 56px rows with ›, and a sticky footer with the theme row and "Get a free quote". Esc, the focus trap and `aria-expanded` are kept. |
| Home 1. Hero form H3 | done | Same single form, field names, action, honeypot and redirect. Step 1: Email* and "What do you need?"*. Step 2: every remaining field of the desktop form (full name, Phone* still required, website URL, description), Back and Submit. Next calls `reportValidity()` on step 1; Enter in step 1 also goes through Next. Without script, and on tablet and desktop, it is the normal one-step form. Fields are 16px and 52px high; labels are 15px. |
| Home 2. Trust bar K2 | partly | Built from the hero proof row: a big dark 650+ card, then 12+ years and 5.0 rated, then full-width Google Partner and "120+ websites built". "No contract" is in the hero ticks, not in this row, and could not be moved without changing the HTML order. |
| Home 3. Find us on B2 | done | The existing strip of the real directory logos now also has region, focus, drag and pause on touch. No new profiles. |
| Home 4. Platforms P2 | done | The existing two opposite rows, with the same strip behaviour. |
| Home 5. Bento C1 | done | The dark card with its 2×2 stats first, then one-column rows (icon left, title, line, Read more). No carousel and no equal heights. |
| Home 6. Pricing Q3 | done | Monthly / Annual switch with "2 months free", then 3 rows that open on tap, Growth open first. Prices come from `prices.json`; the monthly and yearly numbers are both in the HTML. |
| Home 7. Comparison C2 | done | A Without / With toggle over the same table (labels from the table headers), and a 3-option toggle (WMS / Freelancer / Typical agency) on the second comparison. The old `.hp-acc` copies stay in the HTML but are not shown on phones. |
| Home 8. How it works D2 | done | One step at a time with a progress bar, "Step N of 5", big number, title, text and ‹ ›. All 5 steps stay in the HTML (CSS radios, arrow keys). |
| Home 9. Results M1 | not done | `src/data/reviews.json` is empty and there is one case study, so the old layout stays. `<!-- OWNER CHECK -->` is in the HTML. |
| Home 10. Services D | done | Accordion with WordPress Maintenance open. Each row shows the card image as a 56px icon and the title, with "+" / "–". |
| Home 11. More services M2 | done | Full-width cards: icon, title with →, one line. |
| Home 12. Guides F | done | Numbered list with the category under each title. The existing "Show more guides" stays. |
| Home 13. FAQ E2 | done | Accent-edge cards with + / –. 6 shown; the rest behind the existing "Show all questions" (the text does not give the number, to avoid a text change). FAQ text is unchanged. |
| Home 14. Countries F2 | partly | Moving chip strip with the real flags; all 10 links in the HTML. The "See all 10 country pages" button was not added: it would be a new link and new text. |
| Home 15. Report I1 | done | Ring on top, rows under it, the Example tag inside. The `nowrap` that clipped text is removed. |
| Home 16. G1 | done | See above. |
| Service-type templates | done | Picker tabs in a 2-column grid. Included grid as one-line rows. The L1 comparison has 5 tiles in a 2-column grid, the 5th full width. The tiles have no icons, because there are none in the markup. Stories in one column. "Swipe sideways" hints hidden on phones (they stay in the HTML; see the owner decisions). FAQ accent edge. Country chips in 2 columns. Tables use Z3; the sticky bar is G1. The 20 ServicePage pages, the country pages and the plans pages get the same global rules. No rebuild. |
| Blog article P1 | partly | The existing "On this page" list is now a floating dark pill bottom-left that opens the H2 anchor list (real ids). Article text is 17.5px with line height 1.7. Only on non-Tier-A articles. The existing "Quick answer" box stays where it is in the text. Not built: the date and reading-time row above the H1 (it would move content and add text), and new quick answers (never invented). |
| Blog index | done | One column, 44px rows. |
| Country, about, contact | done | Global rules, one-column grids, and 44px links in the side panel. |
| Other Tier A pages | done (global rules only) | No new section layouts and no quick-answer box. |

## Owner decisions
1. **Case stories M1:** there are no real client stories in `src/data/reviews.json`. Send real stories (client name or "Client (name withheld)", industry, one-line quote, result) to build the moving cards.
2. **Directory logos B2:** the strip uses only the profiles already on the site (`site.badges`). Is that list complete?
3. **Article quick answers not built.** These non-Tier-A articles have no existing summary, so no box was added:
   - /best-fixrunner-alternatives/, /caribbean-taxi-transport-website-guide/, /caribbean-web-design/, /common-website-maintenance-mistakes/, /ecommerce-website-redesign/, /error-establishing-a-database-connection-wordpress/, /from-google-removal-request-to-page-1/, /how-often-should-you-redesign-your-website/
   - /how-to-redesign-a-website-without-losing-seo/, /nonprofit-website-maintenance/, /salon-seo/, /seo-for-barbershops/, /there-has-been-a-critical-error-on-this-website-wordpress/, /web-design-bahamas/, /web-design-barbados/, /web-design-dominican-republic/
   - /web-design-jamaica/, /web-design-saint-lucia/, /website-design-trinidad/, /website-hosting-and-maintenance/, /website-rebuild-guide/, /website-redesign-checklist/, /website-redesign-seo/, /what-does-website-maintenance-include/
   - /what-is-a-dns-server/, /what-is-a-domain-name/, /what-is-an-ssl-certificate/, /what-is-dns/, /wordpress-malware-removal/, /wordpress-security-checklist/, /wordpress-site-hacked-what-to-do/, /wordpress-speed-optimization/
4. **Tier A mobile layouts:** the new section layouts are left for phase 2 on these pages:
   - /best-website-maintenance-companies/
   - /best-website-maintenance-for-small-business/
   - /how-long-does-website-maintenance-take/
   - /best-wp-buffs-alternatives/
   - the php pages
5. **Small text additions that would complete the designs:**
   - "See all 10 country pages" (F2);
   - "Show all N questions" with the number (E2);
   - the date and reading-time row (P1);
   - "No contract" in K2.

   Approve the wording, or leave them out.
6. **"Swipe sideways" hint sentences:** they come from the live repair and hacked pages and are hidden on phones, where nothing scrolls sideways now. Remove them from the text?
7. **Analytics and EU/UK consent:** this decision is still open.
8. **Brazil page:** the Portuguese labels still need a native review.

No screenshots, tests or design checks were run, as ordered. Run the checks (design QA at 320 to 1440, parity, heading/link/JSON-LD diff, Lighthouse) before merging.
