# Stage 4: WordPress malware removal page (branch `malware-page`, on top of `hacked-page`)

Brief: `plan-files/batch-1/MALWARE-PAGE-PROMPT.md`, design `design-reference/malware/`. New template `src/components/templates/MalwarePage.astro`, parser `src/lib/malware.ts`, styles `src/styles/malware-page.css` on top of the plans, repair and hacked stylesheets. No new JavaScript.

## Heights (collapsed state, real build)
| Width | Height | Target | |
|---|---|---|---|
| 390 | 9,962 | 8,150 | +22% |
| 360 | 10,320 | – | |
| 768 | 13,912 | 11,300 | +23% |
| 1024 | 12,882 | 11,300 | +14% |
| 1280 | 9,778 | 8,950 | +9% |
| 1440 | 9,778 | 8,950 | +9% |

H1, price line and form: desktop H1 200 px, price 555 px, form 113 px (visible without scrolling); 390 px: H1 193, price 504, form 1,074. Phones: symptoms and Pricing open, every other section closed; sticky "Remove My Malware Now" bar. Over target on phones and tablets because the page has more real text than the mockup and the closing section keeps its own form (collapsed under its own heading).

## Prices (brief rule 4)
`prices.json` had $149 (hacked site cleanup) but not $249 or $349. Added as a pending entry: `malwareTiers: { status: "PENDING owner confirmation …", protect: 249, priority: 349 }`; Cleanup uses `hackedSiteCleanup` ($149). The build stops if the page text and prices.json differ. **Owner: confirm $249 and $349.**

## Held back (brief rule 6), collapsed with `<!-- OWNER CHECK -->`
- The whole section "If we can't clean your hacked site, you don't pay." (H2 kept, its text with the 30-day re-clean, its link) — under Pricing, behind "Read more".
- FAQ "What if the malware comes back after cleanup?" (30-day re-clean) and FAQ "Do I need to share my WordPress password? Is that safe?" (256-bit encrypted client portal): inside "Show all 12 questions", after the other FAQs. FAQ schema unchanged.
- Step 1 text and its badge ("256-bit encrypted client portal", "Encrypted Credentials"): the step title stays, the text is behind "Read more".
- The eyebrow "Authoritative Methodology": behind "Read more"; the process H2 shows no eyebrow.
- A leftover table row "No warranty" (from the old guarantee row): behind "Read more" under the table.
- The "Example" incident panel stays, labelled Example, as a closed accordion in the hero (not presented as live data).
Note: STATUS.md lists "If we can't clean your hacked site, you don't pay." and the 30-day malware re-clean as promises the owner approved on 2026-11-01; this brief holds them, so they are held here (owner decision).

## Sections (brief's order)
Hero (page's eyebrow, H1, intro, 3-tier price line linking to the prices, the page's own buttons "Remove My Malware Now" and "Get a Free Site Scan" → `/contact/`, the page's 5 fact lines, Example panel; quick form with "Hacked site / malware" preselected) → trust strip → symptoms (4 + "Show 4 more symptoms", strip with the hack-recovery link) → complete removal (intro behind "Read more", 3 + "Show 3 more included items", ongoing-protection block) → pricing (3 tiers with their real lists and links `#malware-cleanup/-protect/-priority`, "See prices · Get a free website check", agency strip, held guarantee) → plugin vs professional (real table in a scroll box, scanner link kept) → process (5 steps, links in steps 3 and 4 kept) → malware types (6 + "Show 4 more malware types", CTA) → industries (8 chips, the 8 cards behind "Read more", CTA) → FAQ (6 + "Show all 12 questions") → the page's closing section "Get Your WordPress Site Clean Today" (text and links open, its own Formspree form under "Fast Emergency Cleanup Request") with the related links → countries → final CTA band (Base).
Base.astro's final CTA band shows its default text: the page's closing section has a form, so it stays in the page (as before).

## SEO
Title, meta description, canonical, robots, Open Graph, schema: same. One H1. Headings: 69 before, 69 after, none missing, no level change. Internal links: all 19 kept; added `#quote` and the 10 country pages. Lighthouse: performance 96 mobile / 100 desktop, accessibility 100, CLS ≤ 0.001.

## Parity
`reports/batch-1/malware-parity.md`: 256 blocks, 255 placed (11 of them held and collapsed); the one "missing" line is "Global Trust US, UK, CA &amp; AU", an escaping difference in the report (the page shows "US, UK, CA & AU"). Official parity: 815 of 815 rows PASS.

## Checks
Build 0 failures; parity 815/815; build tests 31/31; browser tests 29/29; design QA templates 0 after fixes (malware added), 11-width sweep of the page 0, all pages phone 0, desktop 1 (backup page, as on main). Screenshots: `reports/batch-1/malware/sheet-{360,390,768,1024,1280,1440}.png`.
