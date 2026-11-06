# Batch 2: final report

Nothing is merged and nothing is pushed. Work order (owner, 2026-11-06): content, pages and SEO first; the full design QA, Lighthouse, screenshots and the gallery are on the later list (`reports/TODO.md`).

## Pages

| Page | Branch | Commit | Status | Height 1440 / 390 |
|---|---|---|---|---|
| /website-redesign-services/ | b2-services-a | d384c20 | rebuilt | 9,103 / 7,522 |
| /website-design-services/ | b2-services-a | d384c20 | rebuilt | 8,490 / 6,773 |
| /website-seo-services/ | b2-services-a | d384c20 | rebuilt | 9,127 / 7,418 |
| /website-speed-optimization-services/ | b2-services-a | d384c20 | rebuilt | 10,438 / 7,526 |
| /website-support-services/ | b2-services-b | dee36f7 | rebuilt | 10,034 / 7,474 |
| /website-update-services/ | b2-services-b | dee36f7 | rebuilt | 9,959 / 8,320 |
| /wordpress-backup-services/ | b2-services-b | dee36f7 | rebuilt | 8,757 / 7,182 |
| /white-label-website-maintenance-services-for-agencies/ | b2-agency | a396a84 | rebuilt | 10,355 / 7,827 |
| /wms-partner-program/ | b2-agency | a396a84 | rebuilt | 6,642 / 6,601 |
| /ecommerce-website-maintenance-packages/ | b2-plans-countries | 567ebd4 | rebuilt | 9,395 / 7,248 |
| /shopify-website-maintenance-packages/ | b2-plans-countries | 567ebd4 | rebuilt | 8,494 / 7,591 |
| 9 country pages (USA, UK, Canada, Australia, Ireland, France, Netherlands, Spain, Switzerland) | b2-plans-countries | 567ebd4 | rebuilt | 4,617 to 7,787 / 6,423 to 8,974 |
| /website-maintenance-services-for-brazil/ | – | – | held (Portuguese labels) | – |
| /website-hosting-and-maintenance/ | – | – | held (Tier B blog post) | – |
| /website-malware-scanner/ | – | – | kept on its form layout | – |
| Stage 7 pages (comparison posts, case study, works, about, contact, blog, forms, policies, articles) | – | – | not started | – |
| All 92 real pages: titles and metas | b2-seo-research | d40c2ae | done | – |
| Safety pass and this report | b2-final | (this commit) | done | – |

Lighthouse was not run (later list). Height targets: phones are under 12,000 everywhere; desktop service pages are 8,500 to 10,400 against 7,000 (header, final CTA band and footer are about 1,450 of that); country pages are over 3,500 / 7,000 (their local plan cards stay open on purpose).

## What changed visually (two lines per group)
- **Service pages (redesign, design, SEO, speed, support, update, backup, white-label, partner):** a new hero with one main button and the quick form, an "In short" answer with original art, the proof strip above pricing, a risk band, FAQ with 6 shown and "Show all", related links and countries.
  Long parts open from "Read more", card grids show 4 at a time, and tables scroll in their own box. Nothing was removed. Redesign also gets "What we protect" and a "Redesign or repair" table.
- **Store plan pages (ecommerce, Shopify):** same layout with "Start plan"; the confirmed store prices stay visible.
- **Country pages:** hero with the local "Plans from" price, quick answer with local prices, the local plan cards open, every other part under its own heading, and art with the country flag. The language sections are kept as they are.

## Titles and metas (snippets.csv)
- Tier A (11 pages): title = live title on all 11 (three titles the rebuild had changed were set back); only the meta changed. Phase 2 title ideas are in the `phase2_title` column for /, best companies, best for small business, WP Buffs, how long, maintenance cost, WordPress cost, SiteCare and UK.
- Tier B (8 pages): primary keyword first, live ranking words kept; 4 titles changed, 8 metas.
- Tier C (73 pages): 62 titles and 73 metas changed.
- Every title is at most 580 px and every meta at most 920 px, all unique, and every number in them is on the page. Meta length is 130 to 158 characters, because 920 px is reached at about 140.
- **Phase 2 test plan (4 to 6 weeks after launch):**
  1. Change one Tier A title at a time.
  2. Wait 4 weeks.
  3. Compare clicks, impressions, CTR and average position for that page in Search Console (28 days before vs after).
  4. Keep the change only if clicks went up and the position did not drop by more than 1.
  5. Then move to the next page.

## Additions and removal proposals
- `reports/seo-research/additions.md`: quick answers on 20 pages (each 40 to 60 words, facts and prices from the page and prices.json). Also on the redesign page, a "What we protect" panel and a "Redesign or repair" table. Related links on every rebuilt page. Support FAQ questions are now marked up as H3. No new FAQs were added: the GSC export has almost no question queries for these pages.
- `reports/seo-research/removal-proposals.md`: no proposals. Nothing was removed.
- One heading changed (cannibalization lint, page built in this batch): white-label H2 "Our Rigorous Website Maintenance Process" → "Our Rigorous White Label Maintenance Process" (it used the primary keyword of /website-maintenance-process/).

## SEO safety (reports/batch-2/safety.md, old build = commit 32d32cd)
1. URLs unchanged: 93 pages in the old and new build, none gone; URL parity 815 of 815 (fails []).
2. H1 unchanged on every page; canonical, robots and lang unchanged.
3. Titles unchanged on Tier A (equal to the live titles); titles and metas differ only as snippets.csv says (92 of 92).
4. Text parity: lowest page 98.9% of old text blocks; every old heading still there (one changed on purpose, above), no internal link lost, no schema value lost.
5. Cannibalization lint: 0 hits on pages built in this batch after the fix; hits on other pages listed under "Later" in safety.md (phase 2, not done now).
6. Sitemap, robots.txt and _redirects are byte-identical to the old build (the 18 Netlify redirect tests need a Netlify deploy; the redirect file they test did not change). Build check 0 failures; build tests 31/31; browser tests 29/29; no duplicate titles or metas.

Forbidden-string scan: 16 hits, all in existing article text from before batch 2 (".bd to Bangladesh" in domain articles, "guaranteed" used as "not guaranteed", "little or no downtime"), plus the migration page's "no downtime", which has been held and collapsed since batch 1. None were added; none were removed (owner decision).

## Owner questions (priority order)
1. **Pending prices:**
   - Design ($1,499 / $2,999 / $5,499+), SEO ($299 / $599 / $1,999 per month, audit $199), speed ($149 / $299 / $499), redesign ($1,200 to $5,500+).
   - WS support plans ($199 / $399 / $699).
   - White-label ($59 and $49 per site on the page; the brief said $59 and $39).
   - Malware Protect / Priority ($249 / $349).
   - Hosting after year 1 (the redesign line has no duration).

   These pages show "Fixed quote after a free check" or "Per-site pricing on request", and the old prices stay in the HTML under "Price note". Prices inside FAQ answers were left as they are, because the FAQ schema must match.
2. **UK (Tier A):** its layout changed and a quick answer was added. Keep, or go back to the old layout (one line in `src/pages/[...slug].astro`)?
3. **Brazil:** Portuguese labels for the new layout (Leia mais, Mostrar mais, Em resumo, Peça um orçamento, form text)? Until then it keeps its layout.
4. **Hosting-and-maintenance (Tier B blog post):** move it to the service layout (its author and date block would go), or keep it as an article?
5. **Claims left in body text for you to check:**
   - White-label resale margins ("keep up to $110 per site", "saves over $4,500+ per month", "$5k to $22k/Mo").
   - Support "24/7".
   - The partner earnings example.
   - The design, SEO and speed "Client result" panels (shown as Example, collapsed).
6. **Real case studies** for the results sections (none added).
7. **Batch 1 questions still open:** analytics and EU/UK consent (GA4 and Clarity are not loading), held claims, comparison posts with "hosting included", real reviews, menu groups.
8. **Cannibalization phase 2:** the "Later" list in safety.md (comparison posts and others using "website maintenance services" in H2s). Wait 4 to 6 weeks after the owner pages rank, as the plan says.
9. **Not built (Stage 7 and visual QA):** comparison and "best" pages, case study, works, about, contact, blogs, forms, policies and articles. Also the 8-width light and dark sweep, Lighthouse, OG images, screenshots and gallery.html. All are on the later list.

## Review and merge order (do not merge yet)
Batch 1 first (global-cleanup → responsive-fix → hacked-page → malware-page → migration-page), then batch 2, each branch stacked on the one before:
`b2-seo-research` → `b2-services-a` → `b2-services-b` → `b2-agency` → `b2-plans-countries` → `b2-final`.
To review everything at once, check out `b2-final` and run `CONTEXT=production URL=https://websitemaintenanceservices.org npm run build`.
