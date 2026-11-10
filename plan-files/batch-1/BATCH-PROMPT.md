# BATCH 1: global cleanup, responsive fix, and the Hacked, Malware and Migration pages

Read this whole file first. Do the 5 stages below in order, each on its own branch stacked on the one before it. Nothing is merged and nothing is pushed. After each stage, run the full checks (build, parity, tests, design QA), commit, write a short stage report in `reports/batch-1/`, and go on to the next stage. Do not stop between stages unless a rule says "stop and ask". At the very end, show me one combined report.

Branches (stacked):
1. `global-cleanup` from `main`
2. `responsive-fix` from `global-cleanup`
3. `hacked-page` from `responsive-fix`
4. `malware-page` from `hacked-page`
5. `migration-page` from `malware-page`

Files I added to the repo (the owner extracted a zip into the project root):
- `plan-files/batch-1/HACKED-PAGE-PROMPT.md`, `MALWARE-PAGE-PROMPT.md`, `MIGRATION-PAGE-PROMPT.md`
- `design-reference/hacked/`, `design-reference/malware/`, `design-reference/migration/` (5 mockups each: desktop 1440 light and dark, tablet 768, mobile 390 light and dark)
When a page prompt says `design-reference/`, use the matching folder above.

## Global rules for the whole batch
1. SEO first: keep title, meta description, H1, URL, canonical, schema and internal links of every page unchanged, except where a rule below says to remove a specific offer text. Every such removal is listed in the report (page, old text, new text).
2. Text parity: nothing is deleted from a page except the items named in Stage 1. Update the parity tool and the build checks only for those named items, through the page-scoped rules in `scripts/lib/text-edits.mjs`, so the next content migration keeps the result. List every check you changed.
3. CSS only for layout and behavior. No new JavaScript. Remove JavaScript only where a stage says so.
4. All pages 100% responsive on every device: phones (320, 360, 390, 430), tablets (600, 768, 900), laptops and desktops (1024, 1280, 1440, 1920), light and dark.
5. Approved trust facts only: 650+ websites maintained, 12+ years, "5.0 rated by our clients" (never "on Clutch"), Google Partner certified agency.
6. The rule "do not touch the header, footer, cookie bar or the final CTA band" in the three page prompts is replaced by this: the header, topbar and cookie bar are changed only in Stage 1. The footer and the final CTA band are never changed. The page stages must not touch the header again.

---

## STAGE 1: `global-cleanup`

### 1A. Remove the top bar from every page
The purple bar above the header ("Free hosting for 1 year on every plan · Free website check · No contract") is removed from every page and every template. Remove its markup, CSS and any JS. Check there is no empty gap or sticky offset left (the header must sit at the top of the page and the sticky mobile CTA bars must still work).

### 1B. Remove the cookie consent bar from every page
Remove the bar at the bottom ("We use analytics cookies to improve this site. Privacy policy. Accept / Reject"), including its CSS, JS, localStorage code and any layout padding made for it. Keep the Privacy policy page and the footer link to it.
Before you remove it, list every script, tag or cookie the site sets or loads (analytics, GA4, Clarity, embeds, forms, fonts). Write the list in the report. Do NOT change how analytics loads and do not add any other consent UI: I will decide that. The site serves visitors in the UK, EU, Canada, Australia and Brazil, so tell me clearly in the report which scripts set cookies without consent after this change.

### 1C. Free hosting and the 2 free email accounts only in the redesign package
The owner's offer is: free hosting and 2 free email accounts, given only with a website redesign. Wording like "Free hosting for the first year", "Free hosting for 1 year on every plan", "2 free emails", "2 free email accounts", "free business email" stays ONLY on the website redesign page (`/website-redesign-services/`), inside the redesign package. Remove these offers from every other page, card, list, meta description, schema, FAQ answer and the homepage. This includes the hero ticks, the final CTA band ticks ("Free hosting for the first year") and plan strips such as "Plans from $79/mo · Free hosting for 1 year · No contract" (shorten that to "Plans from $79/mo · No contract").
Do NOT touch these: "2 months free on yearly plans", "free migration with any annual plan", "free website check", "free quote", "free scan", and the paid "hosting and email $19/month" text (that one is a paid service, not the free offer). Keep them and list them in the report so I can check them. If you find another "free ..." offer and you are not sure, keep it and list it.
Search the whole `src/` folder, `src/content/`, `src/data/`, `site.json` and the layouts. The migration rule file (`scripts/lib/text-edits.mjs`) must hold every content change.

### 1D. Header "Services" submenu must list ALL services
Today the submenu shows only 6: WordPress maintenance, Ecommerce maintenance, Shopify maintenance, Website support, Website repair, Malware removal. Make it list every service page the site has (use the footer "Services" group, the homepage "Explore our website services" list and `url-map.csv`; do not invent pages). At least: WordPress maintenance, Ecommerce maintenance, Shopify maintenance, Website support, Website updates, Website backup, Website speed optimization, Website repair, Hacked site recovery, Malware removal, Website migration, Website SEO, Website design, Website redesign, White-label services (and any other service page that exists).
- Desktop: a clean dropdown (or mega-menu) in 2 or 3 columns with small group titles: Maintenance, Fix and security, Build and grow, Partners. If a group name is not clear, ask me.
- Tablet and mobile: inside the existing mobile menu, "Services" opens an accordion with the same groups. Every link at least 44px tall. The menu scrolls inside the screen if it is long, the page behind does not scroll.
- Keyboard and screen readers: works with Tab and Esc, `aria-expanded` on the button, visible focus ring. CSS-first, no new JavaScript if the current menu already works without it; if it needs JS today, keep that JS and only extend it.
- Do not change the logo, the other menu items, the theme toggle or the "Get a free quote" button.
- All new menu links must exist in the build (no 404). The build check must fail on a broken menu link.

Stage 1 checks: build 0 failures, parity 815 of 815 (except the removals in this stage), tests, design QA, and a screenshot of the header at 390, 768 and 1440 (dropdown open and closed). Commit.

---

## STAGE 2: `responsive-fix`

### 2A. Homepage fixes (`src/styles/home.css`, `src/lib/home.ts`)
1. Mobile swipe carousels (`.hp-swipe`, bento and service cards): cards must not stretch to the tallest card. Use `align-items:flex-start` and no `margin-top:auto` on "Read more". No big empty space inside any card. Check at 360, 390, 430.
2. Placeholder reviews: the line "Design placeholder: replace with 3 real client reviews..." and the cards with "[Real client quote N]" must NOT render in production. Render the reviews block only when real reviews exist in `src/data`. Show the placeholder note only in dev mode (`import.meta.env.DEV`). Report this.
3. Monthly report card (`.hp-report`): at 420px and below stack the ring above the number, keep the "99.9%" text fully visible, and keep the "Example" tag inside the card.
4. Trust bar (`.hp-tb-ic`): add `flex:none` so icons never shrink. Make the 5 items wrap cleanly in 2 columns on phones (no icon smaller than its box).
5. Comparison tabs ("With vs without maintenance", "WMS vs freelancer vs agency"): replace the two full-width pills with a compact segmented control or a horizontally scrolling tab row (min-height 44px, font 15px). No giant pills.
6. Country chips: add `min-width:0` to `.country`, flag 26px, font-size .875rem, padding 8px 10px. Use 1 column below 360px. "Netherlands" and "Switzerland" must never be clipped at 320, 360, 390.

### 2B. Make the tests catch this kind of bug
Extend `scripts/design-qa.mjs` (and the browser tests) so they FAIL on:
- text clipped or sticking out of its own card: any element whose text box is wider than its parent card, or `scrollWidth > clientWidth` on a non-scroll element;
- any element wider than the viewport (not only page overflow);
- tap targets under 44px on phones;
- the strings "Design placeholder", "[Real client", "Lorem", "TODO" anywhere in `dist`;
- an "Example" tag outside its card;
- the strings "Free hosting" or "We use analytics cookies" in `dist`, except on the redesign page for "Free hosting".
Run on every template and the homepage at 320, 360, 390, 430, 600, 768, 900, 1024, 1280, 1440, 1920, light and dark.

### 2C. Responsive audit of all templates
Run the new tests on: homepage, service, pricing, wp-plans, repair, form, article, blog index, generic, country pages, about, contact. Fix every failure with CSS only. Keep all text, title, meta, H1, URLs, schema and internal links unchanged.

Stage 2 report: every problem found (page, width, selector, before and after screenshot), every fix, anything you could not fix. Commit.

---

## STAGE 3: `hacked-page`
Follow `plan-files/batch-1/HACKED-PAGE-PROMPT.md` exactly (all its rules, order, responsive behavior, length targets and "do not decide yourself" list), with the design in `design-reference/hacked/`. Its "Create branch" step is replaced by the branch rule at the top of this file. Run the Stage 2 responsive tests on this page too.

## STAGE 4: `malware-page`
Follow `plan-files/batch-1/MALWARE-PAGE-PROMPT.md` exactly, with the design in `design-reference/malware/`. Same replacement for the branch step. Run the Stage 2 responsive tests on this page too.

## STAGE 5: `migration-page`
Follow `plan-files/batch-1/MIGRATION-PAGE-PROMPT.md` exactly, with the design in `design-reference/migration/`. Same replacement for the branch step. Run the Stage 2 responsive tests on this page too.

For Stages 3, 4 and 5, where a page prompt says "stop and show me" or "ask me", do this instead: do not stop. Use the safe choice (keep the old text collapsed with an `<!-- OWNER CHECK -->` comment, keep the held-back claims off the visible hero, trust strip, headings and cards, do not hard-code any price that is not in `src/data/prices.json`), and put the question in the final report under "Owner decisions". A price that is missing from `prices.json` is added to `prices.json` only as a clearly marked pending value and listed in the report.
None of the three pages may show "Free hosting" or a cookie bar, and the top bar must not exist (Stage 1).

---

## Final combined report (after Stage 5)
One file `reports/batch-1/FINAL.md` and the same text in your reply, with:
1. A table of the 5 branches (name, commit, what it holds).
2. Stage 1: every removed offer text (page, old text, new text), the kept "free ..." offers, the list of cookies and scripts, the new Services menu structure.
3. Stage 2: problems found and fixed, anything not fixed.
4. Stages 3, 4, 5: real heights at 390, 768, 1280 and 1440 against the targets; the parity report; the held-back claims; placeholders you replaced; schema or heading changes.
5. "Owner decisions": a numbered list of every question you did not answer yourself.
6. Merge order for me: `global-cleanup`, `responsive-fix`, `hacked-page`, `malware-page`, `migration-page`.
Do not merge. Do not push. Wait for my OK.
