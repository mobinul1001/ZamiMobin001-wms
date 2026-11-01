# Local migration and parity report (2026-11-01)

Old crawl against a local production build. Keyword, title and price changes are not applied, so old values should match. Row-level output: `parity-local.csv`.

## Parity
| Check | Result |
|---|---|
| URL map rows | 815: 121 at 200, 680 at 301, 14 at 404; all PASS |
| Pages compared (title, H1, canonical, robots, words, schema types, social tags) | 92 of 92 PASS |
| Old text lines found in the new page | 20,492 of 20,492 (the "Skip to content" link is left to the layout) |
| Images in page bodies | 130 of 130, same alt text |
| Upload files in build | 919 of 919 |
| Words, old to new | 224,308 to 226,726; per page 96% to 118.3%, median 99.9% |

Word counts above 100% come from spacing: the old count joined neighbouring table cells into one word. The text-line check confirms no text was lost.

## Build checks
`npm run build` on the production and preview contexts: 0 failures.

Warnings: 53 title or description lengths, 7 anchors, 5 external images without a size, 1 live URL list not readable (WordPress has none yet). The 7 anchors also have no target on the old site.

`scripts/test-build-checks.mjs` breaks the build 15 ways. All 15 stop the build with the right message:
redirect chain, loop, missing target, redirect from a live page, duplicate "from", live URL disappearing, image without alt, empty title, empty description, two H1s, link to a redirect, link to `?plan=`, broken link, noindex on a sitemap URL, robots.txt blocking a search bot.

## Redirects
`public/_redirects`: 246 path rules, 97 query rules, 1 feed rewrite. 92 slash-only rows rely on Netlify (test list).

## What changed from the old pages, on purpose
| Change | Pages | Why |
|---|---|---|
| Resetting 50% offer countdown removed | 9 | SEO-GUARDRAILS section 4 |
| Review and AggregateRating schema removed | 9 | SEO-GUARDRAILS section 7, as proposed |
| Links rewritten to final URLs | 379 links | CLAUDE.md |
| `?plan=`, `?package=`, `?industry=` links changed to hashes | 28 links | Owner decision |
| Links to the 7 pages that return 404 turned into plain text | 8 links | Owner decision |
| First heading used as H1 where the old page had none | 8 | One H1 per page, until the keyword map |
| Forms kept but disabled | 12 | Real Netlify forms come later |
| Footer ebook form left out of the placeholder footer | all | Footer is not page content; design decision later |

## Not done yet
- Keyword map, master prices and claim fixes are not applied; pages still show old prices.
- The 4 merged pages' unique content is not yet moved to their targets.
- Page bodies are one Markdown field; section fields (hero, features, FAQ, CTA) come with the CMS work.
- CMS, real forms, image conversion, Lighthouse and schema validation are not done.
- 24 FAQ schema questions on 9 pages were not found as visible text on the old page either. SEO-GUARDRAILS section 7 requires visible Q&A, so the owner must choose: show them or drop them. Most are on `/website-repair-services/` (11) and `/website-speed-optimization-services/` (4). Accents or wording may explain a few.
