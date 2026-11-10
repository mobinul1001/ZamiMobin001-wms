# BATCH 3: apply the owner's decisions, audit what is missing or wrong, fix it (guideline-only mode)

Branch: continue on `b2-content` (stacked on batch 2). Commit after every numbered task. Nothing is merged and nothing is pushed. All rules of `plan-files/batch-2/BATCH-2-FINAL-PROMPT.md` still apply (SEO frozen except what it allows, approved facts only, Tier A protection, no new company claims, free hosting and 2 free email accounts only on the redesign page, no cookie bar, no top bar). Where this file disagrees with an older prompt, this file wins.

## 0. WORKING MODE (owner order, overrides everything else)

The owner has almost no Claude usage left. Until the owner writes "now run checks":
- **Do NOT take screenshots. Do NOT run design checks, responsive sweeps, Lighthouse, parity tests, page checks, browser tests, safety passes or build the gallery.** Do not write new test suites. Do not open the browser.
- Work only from the guidelines in the prompt files and the owner's decisions below. Find problems by reading files (`rg`, `git diff`, reading source, content and the last `dist` if it exists), not by running test suites.
- Allowed: editing files, scripts that generate image assets (OG images, replaced images), `git`, and **one** plain `npm run build` at the end of each part to make sure the site still compiles. If the build fails, fix it. Do not run other commands that check pages.
- Do not ask questions. Take the safest option, continue, and put the question in the report.
- Keep `reports/final-gap/PROGRESS.md` current (task, status, commit). If you are stopped and restarted, read it and continue from the first task that is not done.
- Priority if you run short: Part 1, then Part 2 steps 1 to 4, then 5 to 8, then Part 3.

## PART 1: owner decisions to apply

1. **Card prices must equal what the LIVE site shows today.** Read the live HTML under `export/raw` (and, if you have web access, the live pages) for SEO, Speed and White-label, then set `src/data/prices.json` `liveSitePrices` (keep `"confirmed": false`) to exactly those values:
   - SEO: $499 / $999 / $1,999 per month. Show the $199 audit as a card price only if the live page shows it. If it does not, keep the audit text in the HTML but not as a price card, and list it for the owner.
   - Speed: $99 / $199 / $349 / $499. Show every live tier: 4 columns on wide desktop (>= 1280), 2 + 2 from 520 to 1279, 1 column below 520, same card style.
   - White-label: $59 (1 to 5 sites) / $39 (6 to 20 sites). The "keep up to $110 per site" wording stays (it matches $39).
   - Re-check design, redesign, support and malware against the live HTML (they matched before). Keep the build guard so a page cannot print a price that is not in `prices.json`.
2. **FAQ prices:** use `reports/price-mismatches.md` as the input. Change only the price number, through `text-edits.mjs`, when the FAQ and the card describe the same tier (the schema follows the visible text). Where the tier names or the number of tiers differ (design FAQ $799/$1,499/$2,499 vs cards $1,499/$2,999/$5,499, SEO, speed, white-label, backup "emergency restore $99"), do NOT edit: write in `reports/price-mismatches.md` the current sentence, the live-page tiers (names, scope, prices read from the live HTML) and one proposed replacement sentence built only from the live page. Do not list the ecommerce and Shopify FAQ prices $199/$349/$599 and $149/$299/$499 (they are the approved store plans). Market-range sentences ("$50 to $500 a month") stay.
3. **Images with old plan prices** ($95 / $195 / $395): replace them the way the 3 comparison images were replaced (neutral generated image, same path, name, size, format and alt, under 120 KB, live URL unchanged). Keep images that only show "99.9% uptime" or "24/7". Search all images and OG images again for old prices and for any free-hosting or free-email text. Append the files to `reports/batch-2/images-replaced.md`.
4. **Alt text:** shorten the alt of the 3 replaced comparison images so it describes the new image. Change no other alt text.
5. Commit `plan-files/` (batch 1, 2 and 3 prompts) so nothing is lost.

## PART 2: audit, then fix (the owner asked: "check what is missing or not done right, and fix it")

Step 1: write `reports/final-gap/gap-audit.md`. For each item below say: **done**, **partly**, **missing**, or **done wrongly**, with the evidence (file path and what you saw). Judge by reading the code, content and prompt files. Sources to compare against:
`plan-files/batch-1/*`, `plan-files/batch-2/*`, the page prompts (WordPress plans, Repair, Hacked, Malware, Migration), the mobile redesign prompt if it is in the repo, `SERVICE-TEMPLATE-SPEC.md`, `00-START-HERE-HANDOFF.md`, `CLAUDE.md`, `SEO-GUARDRAILS.md`, `CLAIMS-AND-DESIGN.md`, `CMS-REQUIREMENTS.md`, `LAUNCH-CHECKLIST.md`, `reports/TODO.md`, the `seo-cannibalization/` plans and the keyword map.

Items to audit (these are known suspects; also add anything else you find):
1. **Cannibalization implementation lists** (8 lists in `seo-cannibalization/wms-cannibalization-implementation-lists.pdf`: 301s, expand, remove, titles, H1s, internal links, singular/plural, pairs). Status of every row.
2. **Phase 4 leftovers from the handoff:** old price lines (`reports/old-price-lines.md`, 122 lines on 10 pages), content moved from merged pages (`/plan-packages-and-costs/` and `/website-management-packages/` into `/monthly-website-maintenance-packages/`), body H2/H3 secondary-keyword edits from the keyword map on every page, service-page section order, old feature rows in comparison tables.
3. **Internal link hub:** each owner page gets natural contextual links from related pages; no orphan pages (no inbound internal link); no internal link to a URL that redirects (link the final URL); no exact-match anchor pointing to a non-owner page; Related blocks present on all service pages and articles; the anchors match the real backlink anchors in `reports/seo-research/link-notes.md`.
4. **Header, footer, menu:** no phone in header or footer; NAP block on the homepage only (if it is elsewhere, list it, do not change it); the Services menu lists every real service page and has no broken link; the footer "Cookie policy" link; no top bar; no cookie bar.
5. **Text and wording scan (by `rg` on source and content, not by a test run):** "on Clutch" (also in docs and templates such as `CLAUDE-CODE-APPLY-PROMPT.md`, `SERVICE-TEMPLATE-SPEC.md`, `service-template/index.html`: in site content fix it to "5.0 rated by our clients"; in docs fix the wording and say so), "First month free", "Engineers online now", "Trusted by 500+", "John Doe", "30+ websites", countdowns, "Free hosting" / "2 free email" outside the redesign page, "Dhaka", "Bangladesh" (only the four general-info blog mentions are allowed), "+880".
6. **Social images and meta:** every real page has `og:title`, `og:description`, `og:image`, `twitter:card` and `twitter:image`. Generate the missing 1200 x 630 images with `scripts/gen-og.mjs` (brand gradient, the page H1, "WMS", under 120 KB, `public/og/<slug>.png`; reuse any existing pipeline). Do not change titles or metas.
7. **Schema by reading the built JSON-LD:** `BreadcrumbList`, `Service` (service pages), `FAQPage` equal to the visible FAQ, `Organization`; no `AggregateRating` or `Review`. Fix what is missing on pages that should have it.
8. **Mobile redesign rules** (`MOBILE-REDESIGN-PROMPT.md`: no sideways swipe except CSS-only auto-moving strips, 16 px body text, new mobile layouts): check by reading CSS whether it was done. If not done, implement it by CSS only on the same markup, last priority, following that prompt's rules. If it is done, say so.
9. **Open pages:** `/website-malware-scanner/` and `/website-hosting-and-maintenance/` stay as they are; list them as "decided". Brazil Portuguese labels stay (owner will get a native review).
10. **Other leftovers:** anything in `reports/TODO.md` that is not blocked on the owner (GA4 and Clarity, EU/UK consent, design QA, Lighthouse and screenshots are owner-blocked: leave them).

Step 2: fix everything you marked partly, missing or done wrongly, in the priority order of section 0. SEO safety still decides: no URL, H1 or canonical changes; titles and metas only as the Stage 2 tiers allow; Tier A pages get proposals only. Content additions follow rule 8 of the batch 2 prompt (research-based, own keyword only, no new claims). Removals are never done: write them in `reports/seo-research/removal-proposals.md` for the owner.

Step 3: for owner-blocked or unclear items, write the exact question and your recommendation in the report. Do not stop for them.

## PART 3: launch preparation (list and prepare, do not deploy)

Write `reports/final-gap/launch-remaining.md`: the exact remaining steps and what the owner must provide, in order (private GitHub repo and remote, Netlify preview with no custom domain, Formspree form ID, Sveltia CMS with a fine-grained GitHub token, image conversion plan, analytics decision, review-profile updates, preview approval, DNS change by the owner, 6-week monitoring). If you can do a step locally with no secrets (for example the CMS config file `public/admin/config.yml` from `CMS-REQUIREMENTS.md`), do it and say so. Never add a token or a secret to a file.

## FINAL REPORT: `reports/final-gap/FINAL.md`

Plain English, short:
- Table: item, status before, what you did, commit.
- What is still missing and why.
- Owner questions, most important first (expected: backup "emergency restore $99", design FAQ tiers, SEO audit price, the phase 2 Tier A proposals, native review of Portuguese labels, analytics and consent).
- One line: "No screenshots, tests or design checks were run, as ordered."

Final chat message: only the table, the owner questions and anything that failed.
