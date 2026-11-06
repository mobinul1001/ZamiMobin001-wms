# Stage 5: Website migration page (branch `migration-page`, on top of `malware-page`)

Brief: `plan-files/batch-1/MIGRATION-PAGE-PROMPT.md`, design `design-reference/migration/`. New template `src/components/templates/MigrationPage.astro`, parser `src/lib/migration.ts`, styles `src/styles/migration-page.css` on top of the plans, repair, hacked and malware stylesheets. No new JavaScript (the case-study strip moves with CSS only).

## Heights (collapsed state, real build)
| Width | Height | Target |
|---|---|---|
| 360 | 10,058 | – |
| 390 | 9,419 | 9,500 |
| 520 | 8,126 | – |
| 640 | 7,650 | – |
| 768 | 13,255 | 12,200 |
| 1024 | 12,414 | – |
| 1280 | 9,694 | 9,760 |
| 1440 | 9,694 | 9,760 |

## Prices (brief rule 4)
`prices.json` had none of the migration prices. Added as a pending entry: `migrationPrices: { status: "PENDING owner confirmation …", hostMove: 149, full: 399, platformFrom: 1199 }`. The cards and the hero price line use it ($149, $399, from $1,199); the build stops if the page's $149 / $399 differ from it.
Conflicting old values still on the page (not changed until the owner confirms): the Platform Change card text "Starting from $1499" (kept in the HTML, collapsed with `<!-- OWNER CHECK -->`), and the FAQ answer and FAQ schema "a platform change starts at $999" (visible, `<!-- OWNER CHECK -->` next to it). **Owner: confirm $399 and $1,199, and that $1,199 replaces $1,499 and $999 in the FAQ answer and schema.**

## Held back (brief rule 6)
Collapsed with `<!-- OWNER CHECK -->`, never in the hero, trust strip, headings, cards or meta:
- The full hero intro with "without losing traffic, data, or SEO rankings" (the visible lead is its second sentence, verbatim).
- The 3 hero stat cards: 100% data integrity, zero SEO ranking loss, under 15 minutes downtime.
- The "Live Transfer" panel: kept, labelled Example, as a closed accordion.
- ~~"No downtime" and "with no downtime" (Host-to-Host card).~~ (owner, 2026-11-06: approved, CLAIMS-AND-DESIGN.md A4b; shown normally, no longer held)
- "30-Day Post Support Window" / "Free fix within 30 days" (included item and the paragraph after the table, which keeps the emergency recovery link).
- The case-study numbers (0 mins downtime, +45% speed, 100% database integrity, 0 errors GSC index, 100% booking integrity, under 24 hrs turnaround).

Kept visible with an `<!-- OWNER CHECK -->` comment, because rule 6 bans them only in the hero, trust strip, headings, cards and meta:
- "Zero size limits" (table cell).
- "No." (SEO FAQ answer).
- "visitors won't notice any interruption" (downtime FAQ answer).
- "If something we moved breaks within 30 days, we fix it free" (second paragraph of the credentials answer; the FAQ schema has both paragraphs together, so the page does too).
- "50+ Point QA Testing" stays as the step 4 title, as the brief says.

## Sections (brief's order)
Hero (H1, lead, price line linking to `#pricing`, "Get a Free Migration Quote" and "View Our Process" `#migration-process`, ticks, form with "Migration or redesign" preselected) → trust strip → hosts and platforms → What is our website migration service (3 types) → 7-step process (`id="migration-process"`, desktop 4 + 3 with the page's "Start Your Migration Today" link as the 8th cell, tablet 2 columns, phone timeline) → platforms (8 chips, cards behind "Read more", "Don't see your platform" strip) → pricing (`id="pricing"`, 3 cards, desktop 3 in a row, 520–1079 px 2 + 1 with the wide card split from 760 px, phones 1 column; scope chips; "What affects your cost?" strip) → what's included (11 items: 4 + "Show 7 more included items"; the 12th is held; compact rows on phones) → checklist block → DIY vs professional (real table in a scroll box, backup and emergency links kept) → case studies (CSS-only auto-scrolling strip, duplicate row `aria-hidden`, pauses on hover, focus and touch, still for reduced motion, scrollable by hand) with "More successfully migrated client portals" and "See Our Works Portfolio" → FAQ (6 + "Show all 9 questions") → the page's closing section "Ready to Migrate Your Website? We'll Handle Everything." with its links → countries → final CTA band (Base).
The AMZ Hospital BD case has no challenge text on the page (only the healthcare notes), so no challenge line is shown; its numbers are held.

## SEO
Title, meta description, canonical, robots, Open Graph, schema: same. One H1. Headings: 58 before, 58 after, none missing, no level change. Internal links: all kept; added `#quote`, `#pricing` (price line) and the 10 country pages. Lighthouse: performance 97 mobile / 100 desktop, accessibility 100, CLS ≤ 0.001.

## Parity
`reports/batch-1/migration-parity.md`: 234 blocks, all on the page (20 held and collapsed); 3 lines show as missing only because of `&lt;` / `&amp;` escaping in the report ("< 15 Mins Average Downtime", "Travel & Tours Case #02", "<24 Hrs Turnaround" are on the page, the first and last held). Official parity: 815 of 815 rows PASS.

## Checks
Build 0 failures; parity 815/815; build tests 31/31; browser tests 29/29; schema same; headings 58/58; no links lost; 11-width sweep of the page 0 problems. The all-templates / all-pages design QA run was finished afterwards (see FINAL.md).
QA exemptions added for the case-study strip (it scrolls sideways by design) and the step connector lines (as for the plans and repair steps).
