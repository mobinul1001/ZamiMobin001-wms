# Batch 2, Stage 3: services A (branch b2-services-a)

Pages: /website-redesign-services/, /website-design-services/, /website-seo-services/, /website-speed-optimization-services/.

## What changed
One shared template for batch-2 service pages: `src/components/templates/ServicePage.astro`, parser `src/lib/service-page.ts`, styles `src/styles/service-page.css` (on top of the plans, repair, hacked and malware styles), original hero art `src/components/art/ServiceArt.astro` (inline SVG, brand gradient, aria-hidden, no numbers). No new JavaScript.
- Hero: breadcrumb, H1 (unchanged), the page's first paragraph, "Fixed quote after a free check · No contract", one main button "Get a free quote" (to the quick form on the page), "See packages" as a text link, quick form with the right service preselected.
- "In short" quick answer (40 to 60 words, through text-edits.mjs `quickAnswer`), with the art. The rest of the old intro (and the old "Client result" panel, labelled Example) is under "Read more".
- Every H2 section keeps its eyebrow, H2 and text. Phones: sections are accordions (first one open). Desktop: always open; long parts and later sections show the opening text, the rest under "Read more"; card grids show 4 and "Show N more"; tables scroll in their own box with a sticky first column.
- Proof strip right above pricing; risk band under pricing; FAQ 6 + "Show all N questions"; the page's closing section; Related services (with guides); countries; sticky phone "Get a free quote".
- Redesign only: "What we protect" panel and the "Redesign or repair" table. The redesign page keeps the free hosting and 2 free email line.

## Prices
Design, SEO, speed and redesign prices are not in prices.json as confirmed values. Added as `pendingServicePrices` (the page values). The plan cards show "Fixed quote after a free check"; the old price text stays in the HTML under "Price note" with `<!-- OWNER CHECK -->`. Prices inside FAQ answers were left as they are (FAQ schema must match): owner question.
The hardcoded hero lines in the old Service template ("Website design from $799", "Monthly SEO from $299 · One-time SEO audit $199", "One-time speed work from $149") are no longer used on these pages.

## Checks (production build)
Build 0 failures; URL parity 815/815, fails []; page check (scripts/seo/page-parity.mjs): text 100% on all 4, every heading at the same level, every link, every FAQ question visible, one H1, no duplicate ids; build tests 31/31; browser tests 29/29; titles and metas equal snippets.csv (92/92); 2 visible CTA buttons per page.

## Heights (scripts/seo/layout-check.mjs, as shipped)
| Page | 1440 | 390 | 360 |
|---|---|---|---|
| redesign | 9,054 | 7,522 | 7,859 |
| design | 8,693 | 6,773 | 6,993 |
| SEO | 9,051 | 7,418 | 7,706 |
| speed | 8,859 | 7,526 | 7,713 |
No sideways scroll at 1440, 390 or 360; the main button is on the first phone screen. Phones are under 12,000. Desktop is over the 7,000 target by about 1,700 to 2,000 px (header, final CTA band and footer are about 1,450 px of it). The full design QA and Lighthouse are on the owner's later list (reports/TODO.md).
