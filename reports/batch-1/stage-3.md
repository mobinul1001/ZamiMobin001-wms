# Stage 3: Hacked website recovery page (branch `hacked-page`, on top of `responsive-fix`)

Brief: `plan-files/batch-1/HACKED-PAGE-PROMPT.md`, design `design-reference/hacked/`. New template `src/components/templates/HackedPage.astro`, parser `src/lib/hacked.ts`, styles `src/styles/hacked-page.css` on top of the plans and repair stylesheets (sections, table scroll, FAQ, price cards, countries reused). No new JavaScript.

## Heights (collapsed state, real build)
| Width | Height | Target | |
|---|---|---|---|
| 390 | 9,568 | 7,900 | +21% |
| 360 | 9,997 | – | |
| 768 | 13,192 | 11,600 | +14% |
| 1024 | 11,620 | 11,600 | met (+0.2%) |
| 1280 | 9,175 | 9,100 | +0.8% |
| 1440 | 9,175 | 9,100 | +0.8% |

H1, price line and form: desktop H1 at 200 px, price 477 px, form at 113 px (visible without scrolling); 390 px: H1 176, price 441, form 836 (target 2,400). Phones: signs, "Why every hour matters" and Pricing open; every other section closed; sticky "Get Emergency Help Now" bar. The phone and tablet heights are over target because the page has more real text than the mockup (8 signs, 6 steps, a 4-column cost table, 20 FAQs) and the three sections the brief opens on phones are long; collapsing more would need the owner's OK.

## Sections (brief's numbered order)
Hero → trust strip (650+, 12+ years, 5.0 rated by our clients, Google Partner) → platforms strip (page's own platform names, the "Security Status" card as a closed accordion, held blocks) → Is your website actually hacked? (4 + "Show 4 more signs", strip) → Why every hour matters (cost table, real table in a scroll box) → Recovery process (6 steps, Website Backup Services link kept) → What's included (3 + "Show 3 more included items") → How pricing works (3 cards from prices.json, "Free initial diagnosis · Flat-fee quote · No contract", 4 factors behind "Read more") → DIY / plugin / professional (one table, 6 rows) → Real recovery outcomes → Platforms and industries (accordions) → FAQ (6 + "Show all 20 questions", answers unchanged) → Countries we serve → final CTA band (Base, heading "Your Website Doesn't Have to Stay Compromised").
The mockup's own order differs (pricing and compare before process, why after outcomes); the brief's numbered list was followed because its phone rules depend on it.

## Held back (brief rule 6), collapsed with `<!-- OWNER CHECK -->`
- "Avg. Response: 30 Mins" (hero card).
- The whole "Independently Verified by Leading Tech Platforms" section (H2 kept, text and its 3 links to Sortlist, TechReviewer, ITFirms).
- The paragraph with "The average malware dwell time is over 45 days…" (source needed); the next paragraph is the visible intro.
- "Also Trusted By Brands Like …" (9 brands, listed twice on the old page).
- From the closing section: "Instant Diagnosis 30-Min SLA Response Confidential" and "24/7 Security Triage Active" (same response-time claim). The route moves the first out of the final CTA band so the band never shows it.

## Placeholders replaced, wording and links
- Comparison: built from the page's 6 capability cards (each H3 kept as a row heading) with the page's table header; each cell keeps its card label as screen-reader text. Professional "Typical time to resolution" has no text on the page, so that cell is empty.
- FAQ answers: all 20 from the page (unchanged schema).
- "Real recovery outcomes": the page has no case studies, so no case cards; the old template's "See our work" card (650+ / 120+, the site line, `/works/`) is kept there so the `/works/` link stays.
- Price cards: wording from the brief's rule 4 ("Hacked site cleanup", "Larger or complex infections" quoted after a free diagnosis, "Ongoing protection" From $79/mo); prices from prices.json ($149, $79).
- Hero: the page's labels "Get Emergency Help Now" (now `#quote`, the form) and "Run Free Hack Scan" (now `/website-malware-scanner/`: the page links `#scan`, which does not exist). "Run Free 60-Second Scan" also goes to the scanner. The form preselects "Hacked site / malware".
- Not rendered (no page text): mockup's related-service cards. Guides: none for this page.
- Mockup wording not used: section titles, hero price-line extras, form title (homepage form wording used).

## SEO
Title, meta description, canonical, robots, Open Graph, schema (FAQ unchanged): same. One H1. Headings: 81 before, 81 after, none missing, no level change. Internal links: all kept except `#contact` and `#scan` (broken anchors, replaced by `#quote` and the scanner page as the brief allows); added `#quote`, `/website-malware-scanner/` and the 10 country pages. Lighthouse: performance 97 mobile / 100 desktop, accessibility 99 (heading order: the page's "Security Status" H3 sits right after the H1, as on the old page; levels not changed), CLS ≤ 0.001.

## Parity
`reports/batch-1/hacked-parity.md`: 259 blocks, all on the page (31 of them held and collapsed), 0 missing. Official parity: 815 of 815 rows PASS.

## Checks
Build 0 failures; parity 815/815; build tests 31/31; browser tests 29/29; design QA templates 0 (hacked added), 11-width sweep of the hacked page 0, all pages phone 0, desktop 1 (backup page, as on main). Screenshots: `reports/batch-1/hacked/sheet-{360,390,768,1024,1280,1440}.png` (light | dark).
