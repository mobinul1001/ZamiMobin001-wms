# Batch 2 progress

Prompt: plan-files/batch-2/BATCH-2-FINAL-PROMPT.md. Owner, 2026-11-06: content, pages and SEO first; design QA, responsive sweeps, Lighthouse, screenshots and the gallery are later (reports/TODO.md). GA4 / Clarity later.

| # | Item | Status | Branch / commit | Open question |
|---|---|---|---|---|
| 1 | Stage 1 research: tiers.csv, page-briefs.csv, ctr-findings.md, content-gaps.csv | done | b2-seo-research | Web search for competitor titles not run (left out to save usage); link-notes skipped (no backlink export for this domain) |
| 2 | Stage 2 snippets: snippets.csv, 92 titles and metas applied via reports/phase-3-keyword-map.csv (newTitle, new column newMeta) | done | b2-seo-research | Meta length: 920 px at 14px Arial is reached at about 140 characters, so the rule used is 130 to 158 characters and at most 920 px |
| 3 | Stage 3 services A: redesign, design, SEO, speed | done | b2-services-a d384c20 | Desktop heights 8,700 to 9,050 (target 7,000); prices pending (pendingServicePrices); prices inside FAQ answers left as they are |
| 4 | Stage 4 services B: support, update, backup | done | b2-services-b | Hosting-and-maintenance (Tier B blog post) and the malware scanner (form tool page) not moved; WS support prices pending |
| 5 | Stage 5 agency: white-label, partner program | done | b2-agency | White-label prices $59 / $49 not confirmed (brief said $59 / $39): "Per-site pricing on request"; resale margin claims in the body for the owner |
| 6 | Stage 6 plans and countries: ecommerce, shopify, 9 country pages | done (Brazil held) | b2-plans-countries | Brazil needs Portuguese labels; country heights over the 3,500 / 7,000 targets; UK (Tier A) layout changed |
| 7 | Stage 7 other templates (light polish) | skipped (lowest priority; owner later list) | – | |
| 8 | Stage 8 final SEO safety pass and report | done | b2-final | safety.md: 0 failures; FINAL.md written |

Real (status 200) pages not yet on the new design, from url-map.csv and the templates in src/pages/[...slug].astro: see the stage rows above.

## Batch 2b (branch b2-content, on b2-final)
| # | Item | Status | Commit | Note |
|---|---|---|---|---|
| A | Decisions 1–4 and 6: live-site prices shown (prices.json liveSitePrices / malwareTiers, confirmed: false); UK back on its old layout, quick answer removed (proposal in additions.md); Brazil on the new layout in pt-BR; hosting post unchanged; malware pair approved exception in final-check | done | (see git log) | pt-BR labels not in the owner's list are marked "needs native review" |
| B | Duplicate ids: 17 articles had an empty anchor before a heading with the same id (dropped at build by dropDuplicateAnchors in src/lib/html-sections.ts; the heading keeps the id); the malware hero form got its own id prefix. New build check "duplicate-id" and test (32/32). Result: 0 pages with duplicate ids; 622 in-page links on those pages, 0 broken; no text change | done | (see git log) | |
| C1 | link-notes.md from data/backlinks (homepage 1,188 links / 33 sites; redirected URLs checked: all single 301s to the right owner pages; internal anchor check: the article byline "Website Maintenance Services" → /about-us/ on 47 pages conflicts, proposal written) | done | (see git log) | byline change needs the owner's yes |
| C2 | serp-notes.csv: 25 priority keywords searched (top-10 titles and common topics; the search tool returns no People-also-ask boxes) | done | (see git log) | |
| C3 | content-gaps.csv: 25 SERP rows added (gap per page, or "no gap" where the existing FAQs already answer it) | done | (see git log) | |
| C4 | 4 FAQs added on non-Tier-A pages (migration, white-label, SEO, WordPress packages) through text-edits addFaq: visible FAQ and FAQPage schema both; 6 Tier A FAQ proposals in additions.md | done | (see git log) | Most top-10 topics were already answered by the existing FAQs, so few additions |
