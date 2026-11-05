# Stage 2: responsive fix (branch `responsive-fix`, on top of `global-cleanup`)

Owner brief: BATCH 1, Stage 2 (2026-11-05). CSS only for layout; the only code change is the reviews block (2A.2). Text, titles, meta, H1, URLs, schema and internal links unchanged.

## 2A. Homepage fixes
| # | Problem (before) | Fix | Where |
|---|---|---|---|
| 1 | Swipe carousels: cards could stretch to the tallest card, "Read more" pinned to the bottom with empty space | `align-items: flex-start` on `.hp-swipe`; no `margin-top: auto` on `.hp-card-more`, `.hp-bc .btn-row` inside the swipe row | `src/styles/home.css` |
| 2 | Placeholder reviews ("[Real client quote N]" cards and "Design placeholder: …" note) rendered in production | The reviews block renders only when `src/data/reviews.json` has real reviews (empty today, so no block); the placeholder cards and note render only in dev mode (`import.meta.env.DEV`) | `src/lib/home.ts`, new `src/data/reviews.json` (`[]`; fields: quote, name, role, company, country, source) |
| 3 | Monthly report card cramped at 420 px and below | Ring above the number at ≤420 px, "99.9%" kept on one line, "Example" tag kept inside the card (`.hp-report-top` wraps) | `src/styles/home.css` |
| 4 | Trust bar icons could shrink | `.hp-tb-ic { flex: none }`, items `min-width: 0`; 2 columns on phones (already), 1 column below 360 px | `src/styles/home.css` |
| 5 | Comparison tabs were two big pills | Compact segmented control: 44 px min-height, 15 px text, both tabs side by side in one box on phones | `src/styles/home.css` |
| 6 | Country chips could clip "Netherlands"/"Switzerland" | `.country { min-width: 0 }`, flag 26 px, .875rem, padding 8px 10px, 44 px min-height, 1 column below 360 px | `src/styles/home.css` |

Before and after (homepage, light): `reports/batch-1/stage-2/before/home/sheet-{360,430}.png` and `reports/batch-1/stage-2/after/home/sheet-{360,430}.png`.

## 2B. Tests that catch this kind of bug
- `scripts/design-qa.mjs`:
  - New `--sweep` mode: 320, 360, 390, 430, 600, 768, 900, 1024, 1280, 1440, 1920, light and dark.
  - New checks at every width:
    - Any element sticking out of its card.
    - An "Example" tag outside its card.
    - Tap targets under 44 px on phones (≤430 px). A link inside a sentence is exempt, as in WCAG 2.5.8.
  - Already there and kept: any element wider than the viewport ("off screen") and `scrollWidth > clientWidth` on a non-scroll element ("text overflow").
- `scripts/check-build.mjs`: fails on "Design placeholder", "[Real client", "Lorem" or "TODO" in any built page. "Free hosting" and "We use analytics cookies" already fail since Stage 1.
- `scripts/test-build-checks.mjs`: 4 new cases (Design placeholder, placeholder review, Lorem, TODO); 31 cases in total.
- `scripts/test-browser-features.mjs`: new check that the homepage at 320 px has no placeholder text, no page overflow and no element wider than the screen; 29 checks in total.

## 2C. Responsive audit: what the new tests found and the fix
First sweep: 580 problems on 12 templates × 11 widths × 2 themes. Every one fixed with CSS:

| Problem | Pages / widths | Selector | Fix |
|---|---|---|---|
| Logo link 42 px tall (tap target) | every page, 320–430 | `header .logo` | `.top .logo` 44 px min-height (logo unchanged) |
| Breadcrumb link short | inner pages, 320–430 | `.crumbs a` | 12 px vertical padding (no layout change) |
| Plan feature toggles 24 px | home, pricing, 320–430 | `.feat summary` | 44 px min-height |
| Bento "Read more" 32 px | home, 320–430 | `.hp-card-more > summary` | 44 px, centered |
| "Read more", "On this page" summaries | home, blog post, phones | `main summary`, `.toc-m summary` | 44 px min-height on phones |
| Table-of-contents links short | blog post, 320–430 | `.toc a`, `.toc-m a` | 44 px min-height |
| "5.0 rated by our clients" link | home, 360–430 | `main a[href^="https://clutch.co"]` | 44 px tap area |
| Phone link "+1 212-496-1637" | contact/form, 320–430 | `main a[href^="tel:"]` | 44 px tap area |
| "Ask for a price" links | pricing add-on cards, 360–430 | `.compare-cards li > a` | 44 px tap area |
| Link alone in a table cell | pricing table | `main td > a:only-child` | 44 px tap area |
| "Get a free website check" link | repair, 320–430 | `.rp-note a` | 44 px tap area |
| Trust bar items overflow | home, 320 | `.hp-trustbar ul` | 1 column below 360 px |
| Price line overflows | repair, 320 | `.rp-priceline` | wraps below 360 px |
| Table headers stick out of the article | blog post, 320 | `.tbl-wrap` | scrolls sideways inside its box on phones |
| Country chips under 44 px after fix 2A.6 | home, phones | `.hp-countries .country.card` | 44 px min-height |

Second sweep after the fixes: **0 problems** on all 12 templates (home, pricing, WordPress plans, service, repair, country, about, blog post, blog index, form, thank-you, 404) at all 11 widths in both themes. All 93 pages at 360 px: 0 problems; at 1440 px: 2 (the same 2 "side element too short" flags main already had, on `/website-hacked-recovery-services/` and `/wordpress-backup-services/`; the hacked page is rebuilt in Stage 3).

Not fixed: nothing open from the sweep. Generic pages and contact are covered by the all-pages runs at 360 and 1440 rather than the 11-width template sweep.

## Results
- Build: 0 failures.
- Parity: 815 of 815 URL rows PASS, 0 fails.
- Build tests: 31 of 31. Browser tests: 29 of 29.
- Design QA: templates 0 (11-width sweep, both themes); all pages phone 0; all pages desktop 2 (same as main).
