# Build the Hacked Website Recovery page (paste this into Claude Code)

Page: `src/content/pages/website-hacked-recovery-services.md` (URL `/website-hacked-recovery-services/`). Do not create a new URL.
Goal: rebuild it to the approved design in `design-reference/` (open the .html files in a browser; static mockups at desktop 1440 light and dark, tablet 768, mobile 390 light and dark). The page must rank (keep all SEO), be 100% responsive, and make visitors send the emergency form.
If `src/components/service/`, `src/components/plans/` or the shared service stylesheet already exist from the Repair and WordPress plans pages, reuse their accordion, table-scroll, FAQ, flag and form patterns. Do not write them twice.

## Hard rules
1. Do NOT touch the header, footer, cookie bar, theme toggle or the final CTA band in `src/layouts/Base.astro`. The mockup's header/footer are placeholders.
2. Nothing is deleted. Every heading and paragraph in the current .md stays in the HTML (text parity at least 95%, measured on `dist`). Long parts may be collapsed with `<details>` ("Read more"), but the text must stay in the HTML.
3. Keep title, meta description, H1 ("Website Hacked? Get Expert Recovery Now"), URL, canonical, schema and every internal link exactly as they are.
4. Prices only from `src/data/prices.json`. Hacked site cleanup is $149 (do not raise it), larger or complex infections are quoted after a free diagnosis, ongoing protection is "From $79/mo". Do not hard-code prices.
5. Approved trust facts only: 650+ websites maintained, 12+ years of experience, "5.0 rated by our clients" (never "on Clutch"), Google Partner certified agency.
6. Owner approval is still missing for these existing page claims. Keep the page text where it exists in the .md, but do NOT use them in the hero, trust strip, headings, cards or meta, and flag each in your report: "Avg. Response: 30 Mins", "Independently Verified by Leading Tech Platforms" (the whole section, source needed), "average malware dwell time is over 45 days" (needs a source), and the "Also Trusted By Brands Like ..." list (owner must confirm each brand may be shown). Until approved, render those blocks collapsed inside "Read more" with an HTML comment `<!-- OWNER CHECK -->`, or leave them out of the visible design and list them in the parity report as "held back".
7. Text in the mockup written in [square brackets] is a placeholder. Replace it with the real text from the .md: the 6 comparison rows (DIY or plugin vs professional recovery), FAQ answers 4 to 20, the real case studies under "Real Recovery Outcomes". If the .md has no text for a block, do not render the block.
8. CSS only, no new JavaScript (the theme toggle is the only JS). Accordions use `<details>`, tabs use radio + `:has()`.
9. Anything that looks like a button must be a real `<a href>` or `<button>`.
10. Styles go in `src/styles/hacked-page.css` scoped under `.hacked-pg` (or the shared service stylesheet if it exists). Reuse site tokens (accent #6d34e0, gradient #6d34e0 > #c026d3 > #f43f5e, Inter, radius 8/16/24, 8px spacing, 1200px container, light and dark). Copy exact spacing, sizes and behavior from the `<style>` block in the reference files.

## Page order (match the mockup)
1. Hero: breadcrumb, eyebrow, H1, intro paragraph from the .md, price line ("Hacked site cleanup $149 ... Free initial diagnosis"), 2 CTAs ("Get emergency help now" to #quote, "Run a free hack scan" to the existing `#scan` section or scanner link), 3 tick lines, and the quote form with the need preselected as "Hacked site cleanup". Form visible without scrolling on desktop.
2. Trust strip (4 facts from rule 5).
3. "Is your website actually hacked?": the 8 signs as cards (Google warnings, Malicious redirects, Spam content injection, Unknown admin users, Suspended hosting, Sudden SEO drop, Site crashing or extremely slow, Outbound spam emails). Show 4, the other 4 in "Show 4 more signs". Use the real description under each sign from the .md. Then the "If even one of these matches" strip with a link to #quote.
4. Why every hour matters after a hack (real text, rule 6 applies to the 45 days sentence).
5. Our website hack recovery process: 6 numbered cards (Emergency Triage and Access, Full Malware and Backdoor Scan, Malware Removal and Backdoor Closure, Blacklist and Reputation Removal, Hardening and Patch Deployment, Verification and Monitoring Handoff). Keep the internal links inside the step text (for example Website Backup Services).
6. What's included in every recovery: 6 items. Show 3, the other 3 in "Show 3 more included items".
7. Pricing: 3 cards ($149 cleanup highlighted, Quoted for complex infections, From $79/mo ongoing protection), the "Free initial diagnosis / flat-fee quote / no contract" row, and the 4 "How pricing works" factors with their real text.
8. DIY, plugin or professional recovery: ONE real table, 6 rows (Removes hidden backdoors, Google blacklist removal, Root-cause identification, Typical time to resolution, Risk of reinfection, Expert verification report) plus the "Why plugins aren't enough" text.
9. Real recovery outcomes (rule 6 and 7).
10. Platforms we recover (5) and recovery services for every industry (8): accordion with chips, real text kept.
11. FAQ: all 20 existing FAQs. Show 6, the other 14 inside "Show all 20 questions". Keep FAQ schema unchanged.
12. Related services, guides and Countries we serve (reuse the Repair page markup: 10 country chips with inline SVG flags, no emoji, keep each country's `lang`).
13. Final CTA band (existing, from Base.astro) with the form. Heading: "Your Website Doesn't Have to Stay Compromised".
Any existing section not listed here (for example the Free malware scan `#scan` block) must still be rendered after the section it follows today, same styles, collapsed when long.

## Responsive behavior (important)
- Desktop (1080px and up): hero 2 columns (text + form), grids 3 or 4 columns, FAQ 2 columns ("Show all" row spans both). Section headings are plain, no click.
- Tablet (760 to 1079px): hero 1 column, grids 2 columns, trust strip 2x2, FAQ 1 column.
- Mobile (up to 759px):
  - Trust strip: 4 equal-height cards in a 2x2 grid.
  - The comparison table is a real table inside a horizontally scrolling box (`overflow-x:auto`, `tabindex="0"`, `role="region"`, aria-label), min-width 680px, first column sticky, with the hint "Swipe sideways to compare". Do NOT stack it into cards.
  - **Critical:** every parent of the scroll box needs `min-width:0`, and any grid wrapper must use `grid-template-columns:minmax(0,1fr)`. Otherwise the table pushes past the page edge and is cut off instead of scrolling. Test at 360 and 390.
  - Every section from "Is your website actually hacked?" down to "Related" is a collapsible `<details class="sx">` whose `<summary>` has the eyebrow, the H2 (keep it a real heading) and a chevron. The first two sections (signs, why every hour matters) and Pricing open by default, the rest closed. On tablet and desktop they are always open and not clickable (CSS only: `details.sx::details-content{content-visibility:visible;display:block}`, hide chevron, `pointer-events:none` on the summary; or render without `<details>` above 760px). Text stays in the HTML either way.
  - Sticky bottom CTA bar ("Get emergency help now").
- Test at 360, 390, 768, 1024, 1280, 1440, light and dark. No horizontal page overflow (only the table box is allowed to scroll sideways). Tap targets at least 44px.

## Length targets (collapsed state)
Desktop at most 9,100px, tablet at most 11,600px, mobile at most 7,900px at 390. H1, price and the form inside the first 1,500px on desktop and 2,400px on mobile. Report real heights.

## Steps
1. Create branch `hacked-page`.
2. Read the .md, `prices.json` and the 5 reference HTML files.
3. Build or reuse components (Hero, TrustStrip, SignsGrid, ProcessCards, IncludedGrid, PriceCards, CompareTable, Outcomes, PlatformsAccordion, Faq, Related, Countries, SectionAccordion).
4. Parity report: every heading and paragraph of the old page and where it is now, plus the "held back" list from rule 6. Run the `dist` text comparison.
5. Playwright screenshots at the 6 widths, light and dark. Check: no overflow, form early, table scrolls on mobile, accordions work.
6. SEO check: title, meta, H1 (one only), canonical, schema, internal links unchanged. No unapproved claims in visible hero, trust strip or headings.
7. Stop and show me the screenshots and the heights. Do not merge.

## Do not decide yourself (ask me)
Any wording not in the .md, any number not in `prices.json` or rule 5, anything that would change a heading, URL or link, and what to do with the held-back claims in rule 6.
