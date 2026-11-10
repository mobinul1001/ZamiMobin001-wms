# Build the Website Migration page (paste this into Claude Code)

Page: `src/content/pages/website-migration-services.md` (URL `/website-migration-services/`). Do not create a new URL.
Goal: rebuild it to the approved design in `design-reference/` (open the .html files in a browser; static mockups at desktop 1440 light and dark, tablet 768, mobile 390 light and dark). The page must rank (keep all SEO), be 100% responsive, and make visitors pick a plan or send the form.
If the shared service components or stylesheet already exist from the Repair, Hacked recovery, Malware and WordPress plans pages, reuse their accordion, table-scroll, FAQ, flag, form and sticky-CTA patterns. Do not write them twice.

## Hard rules
1. Do NOT touch the header, footer, cookie bar, theme toggle or the final CTA band in `src/layouts/Base.astro`. The mockup's header/footer are placeholders.
2. Nothing is deleted. Every heading and paragraph in the current .md stays in the HTML (text parity at least 95%, measured on `dist`). Long parts may be collapsed with `<details>` ("Read more"), but the text must stay in the HTML.
3. Keep title ("Professional Website Migration Service | WMS"), meta description, H1 ("Professional Website Migration Service"), URL, canonical, schema and every internal link exactly as they are.
4. Prices in the mockup: Host-to-Host Move $149 (free with any annual plan), Full Migration "From $399" (Most popular), Platform and eCommerce Change "From $1,199" (custom quote after a free scan). These are the owner's latest numbers and they do not match the current page (the pricing cards say $149 / $399 / "from $1,499", the FAQ says platform change "starts at $999"). Take prices from `src/data/prices.json`. If these values are not in `prices.json`, do not hard-code them silently: tell me, add them to `prices.json` only after I confirm, and use the same values in the pricing cards, hero price line, FAQ answer and schema. List the old conflicting values ($999, $1,499) in your report. Keep the CTA links `/get-a-free-quote/#host-migration`, `#full-migration`, `#enterprise-migration` exactly.
5. Approved trust facts only: 650+ websites maintained, 12+ years of experience, "5.0 rated by our clients" (never "on Clutch"), Google Partner certified agency.
6. Owner approval is still missing for these existing page claims. Keep the page text where it exists in the .md, but do NOT use them in the hero, trust strip, headings, cards or meta, and list each in your report as "held back": "without losing traffic, data, or SEO rankings" in the hero intro (the mockup uses a shorter intro without it), "No" as a guarantee in the SEO FAQ answer, "visitors won't notice any interruption" (owner, 2026-11-06: "No downtime" and "with no downtime" are now approved, see CLAIMS-AND-DESIGN.md A4b, and are no longer held), "50+ Point QA Testing" (it is an existing step heading, keep it as a step title but do not use it in the hero or meta), "30-Day Post Support Window" and "free fix within 30 days", the case study numbers (0 mins downtime, +45% speed, 100% database integrity, 0 errors GSC index, 100% booking integrity, <24 hrs turnaround), "Zero size limits" in the DIY table, and the "Live Transfer Example" panel in the hero (the mockup does not include it; if you keep it, label it clearly as an example and do not present it as live data). Put an `<!-- OWNER CHECK -->` comment next to each.
7. The mockup writes the AMZ Hospital BD case study challenge as a one-line summary. Use the real text from the .md for every case study (Challenge and results). If the .md has no text for a block, do not render the block. Mockup text that is not in the .md is a placeholder: replace it with the .md text.
8. CSS only, no new JavaScript (the theme toggle is the only JS). Accordions use `<details>`.
9. Anything that looks like a button must be a real `<a href>` or `<button>`. Keep the .md's CTA links (`/get-a-free-quote/`, `#migration-process`, `/works/`, internal service links) exactly.
10. Styles go in `src/styles/migration-page.css` scoped under `.migration-pg` (or the shared service stylesheet if it exists). Reuse site tokens (accent #6d34e0, gradient #6d34e0 > #c026d3 > #f43f5e, Inter, radius 8/16/24, 8px spacing, 1200px container, light and dark). Copy exact spacing, sizes and behavior from the `<style>` block in the reference files.

## Page order (match the mockup)
1. Hero: breadcrumb, eyebrow, H1, intro paragraph from the .md, price line, 2 CTAs ("Get a Free Migration Quote", "View Our Process" linking to `#migration-process`), 3 tick lines, and the quote form on the right with "Migration" preselected. Form visible without scrolling on desktop.
2. Trust strip (4 facts from rule 5).
3. "What Is Our Website Migration Service?": the 3 migration types (Host and Server Migration, Domain Name Migration, Platform and CMS Migration) with the real descriptions, and the "Not sure which type you need?" strip.
4. "Our 7-Step Website Migration Process" (keep `id="migration-process"`): 7 numbered cards with the real text, each with its short badge line (Environment and DB Check, Off-Site Snapshot Saved, Zero Live Risk, Quality Check, Seamless NameServer Update, Live and Fully Functional, Monitored After Launch). Keep the internal links inside steps 4 and 7. Desktop is a 4 + 3 grid, and the empty 8th cell holds the gradient CTA card ("Ready to move your site?"). Tablet is 2 columns with the CTA card as the 8th cell. Mobile is a vertical timeline with a gradient line, and the CTA card is hidden. The per-step gradient line on desktop ends at its own column (step 4 and step 7 end at their column edge).
5. "Platforms and CMS Systems We Migrate": the 8 platform chips plus the "Don't See Your Platform or CMS Listed Above?" strip.
6. Pricing: 3 plan cards with the feature lists in the mockup (they come from the .md and the owner's brief; match them to the .md where the .md has the same item), the "Your price depends on scope and complexity" chips (Number of pages, Domain change and redirect volume, Database size, File storage, eCommerce catalog size, Custom CMS or integrations), the "Not sure which plan fits?" strip, and the maintenance packages strip with its link. Layout: desktop (1080px and up) 3 cards in one row. Tablet (520 to 1079px) 2 cards in the first row and the third card full width in the second row (from 760px the full-width card is split in two: name, price and button on the left, the feature list on the right). Mobile (up to 519px) 1 column.
7. "What's Included in Every Website Migration": 12 items. Show 4, the other 8 in "Show 8 more included items". On mobile each item is a compact one-line row (icon left, title, small tick right), one column, never a 2-column card grid.
8. "The Difference Between DIY Plugins and Professional Service": a real table (Migration Factor, DIY Migration Plugins, Our Professional Migration) with the real rows from the .md (SEO Preservation and Redirects, Database and File Size Limits, Email and DNS Cutover, Safety and Rollback Plan, plus the free-fix row only after the owner approves it). Keep the links to the backup and emergency recovery pages.
9. "Real Migration Results and Case Studies": the 3 case studies (AMZ Hospital BD, St. Lucian Taxi and Tours, MI Property Portal) as cards in an auto-scrolling strip that moves right to left, CSS only: the card row is duplicated once (the duplicate has `aria-hidden="true"`), animated with `translateX(0 > -50%)` on a `linear infinite` loop, the wrapper is `overflow-x:auto` so people can also scroll by hand or touch, the animation pauses on hover, focus and touch (`animation-play-state:paused`), and it is turned off for `prefers-reduced-motion`. The wrapper has `tabindex="0"`, `role="region"` and an aria-label. Keep the "More successfully migrated client portals" links and the "See Our Works Portfolio" link to `/works/`.
10. FAQ: all 9 existing FAQs with their real answers. Show 6, the other 3 inside "Show all 9 questions". Desktop is 2 columns ("Show all" row spans both). Keep FAQ schema unchanged except for the price answer (rule 4).
11. Related services, guides and Countries we serve (10 country chips with inline SVG flags, no emoji, keep each country's `lang`).
12. Final CTA band (existing, from Base.astro). Heading: "Ready to Migrate Your Website? We'll Handle Everything."
Any existing section not listed here must still be rendered after the section it follows today, same styles, collapsed when long.

## Responsive behavior (important)
- Desktop (1080px and up): hero 2 columns, grids 3 or 4 columns, FAQ 2 columns. Section headings are plain, no click.
- Tablet (760 to 1079px): hero 1 column, grids 2 columns, trust strip 2x2, FAQ 1 column.
- Mobile (up to 759px):
  - Trust strip: 4 equal-height cards in a 2x2 grid.
  - Any table must be a real table in a horizontally scrolling box (`overflow-x:auto`, `tabindex="0"`, `role="region"`, aria-label), min-width 680px, first column sticky, with "Swipe sideways to compare". Do not stack tables into cards. **Critical:** every parent of the scroll box needs `min-width:0`, and any grid wrapper must use `grid-template-columns:minmax(0,1fr)`, or the table is cut off instead of scrolling. Test at 360 and 390.
  - Every section from "What Is Our Website Migration Service?" down to "Related" is a collapsible `<details class="sx">` whose `<summary>` has the eyebrow, the H2 (keep it a real heading) and a chevron. The first section and Pricing are open by default, the rest closed. On tablet and desktop they are always open and not clickable (CSS only: `details.sx::details-content{content-visibility:visible;display:block}`, hide chevron, `pointer-events:none` on the summary; or render without `<details>` above 760px). Text stays in the HTML either way.
  - Sticky bottom CTA bar ("Get a free migration quote").
- Test at 360, 390, 520, 640, 768, 1024, 1280, 1440, light and dark. No horizontal page overflow. Tap targets at least 44px.

## Length targets (collapsed state)
Desktop at most 9,760px, tablet at most 12,200px, mobile at most 9,500px at 390. H1, price and the form inside the first 1,500px on desktop and 2,400px on mobile. Report real heights.

## Steps
1. Create branch `migration-page`.
2. Read the .md, `prices.json` and the 5 reference HTML files.
3. Build or reuse components.
4. Parity report: every heading and paragraph of the old page and where it is now, plus the "held back" list from rule 6. Run the `dist` text comparison.
5. Playwright screenshots at the widths in the responsive section, light and dark. Check: no overflow, form early, accordions work, the pricing layout at 390, 560, 768 and 1280, the case study strip moves and pauses on hover, the table scrolls sideways on mobile.
6. SEO check: title, meta, H1 (one only), canonical, schema, internal links unchanged. No unapproved claims in the visible hero, trust strip or headings.
7. Stop and show me the screenshots and the heights. Do not merge.

## Do not decide yourself (ask me)
Any wording not in the .md, any number not in `prices.json` or rule 5, anything that would change a heading, URL or link, the prices in rule 4 if they are missing from `prices.json` (and which value replaces $999 and $1,499), the real case study text for AMZ Hospital BD if the .md is thin, and what to do with the held-back claims in rule 6.
