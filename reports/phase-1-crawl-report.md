# Phase 1: read-only crawl report (2026-11-01)

Only GET requests were sent, at most one per second. Nothing on the live site changed.

## Inventory
| Item | Count |
|---|---|
| URLs crawled (`export/inventory.csv`) | 817 |
| First response 200 / 301 | 150 / 667 |
| Real pages (47 pages + 49 posts in REST and sitemap) | 96 |
| Live sitemap URLs (`sitemap_index.xml`) | 99 (96 + 2 categories + 1 author) |
| Sitemap URLs not returning a clean 200 | 0 |
| Real pages missing from the sitemap | 0 |
| REST media items / categories / tags / users | 187 / 2 / 0 / 1 |
| Upload files saved (`export/assets/`) | 919 of 919, 53.6 MB, 0 failed (339 from page references, 580 added in Phase 2 from the REST media list) |
| Backlink target pages not returning a clean 200 | 0 of 26 |
| Redirect chains of 2+ hops on the same host | 0 |
| Redirects to an upload file (attachment pages) | 373 |
| No-slash to slash redirects | 121 |
| Query-string redirects, mostly `?p=` | 100 |
| Non-existent or removed URLs sent to the homepage | 74 |

## Guardrail checks run
| Guardrail | Result on the live site | Action on the new site |
|---|---|---|
| 1. Soft 404 | **Fail.** A made-up URL returns 301 to `/`. | Real 404; each known old URL gets its closest page. |
| 1. One host | `http://www` takes 2 hops; `http://` and `https://www` take 1. | One hop for all; verify on Netlify. |
| 1. Sitemap | Clean. | Keep clean. |
| 1. Pagination | `/page/2/` canonicals to `/`. | Decide in the URL map. |
| 2. Broken links | **34 link targets do not exist** and land on the homepage (`phase1-404-catchall-links.csv`). | Point each to a real page. |
| 2. Links to redirects | 6 header links use no-slash URLs, on 98 pages. | Final URLs only. |
| 2. Orphans | 35 of 96 pages have under 2 inbound links; 4 have 0. | Fix in the hub structure. |
| 4. Thin content | Under 300 words: `/blogs/` 97, `/website-malware-scanner/` 205, `/contact/` 254, `/category/news/` 45, `/category/industry/page/5/` 294. | Owner list. |
| 5. Backlinks | All 26 target pages return 200. | Keep 200 or one-hop 301. |
| 7. Review schema | Review or AggregateRating on 9 pages. | Owner decision. |
| Single H1 | 9 pages have none; 10 have two. | One H1 on every page. |

Not run in this phase: Core Web Vitals, Lighthouse, schema validation, and the production noindex build test. They need the built pages.

## Pages with no H1
`/agreement/`, `/contact/`, `/free-website-maintenance-audit/`, `/shopify-website-maintenance-packages/`, `/website-maintenance-process/`, `/website-maintenance-services-for-switzerland/`, `/website-malware-scanner/`, `/website-management-packages/`, `/works/`

## Pages with two H1s
`/caribbean-web-design/`, `/php-vulnerability-php2shell/`, `/website-design-trinidad/`, `/web-design-bahamas/`, `/web-design-barbados/`, `/web-design-dominican-republic/`, `/web-design-jamaica/`, `/web-design-saint-lucia/`, `/what-is-dns/`, `/wordpress-php-vulnerability/`

## Pages with Review or AggregateRating schema
`/how-much-does-wordpress-website-maintenance-cost/`, `/website-design-services/`, `/website-migration-services/`, `/website-repair-services/`, `/website-seo-services/`, `/website-speed-optimization-services/`, `/website-update-services/`, `/white-label-website-maintenance-services-for-agencies/`, `/wordpress-backup-services/`

## Limits
- Word counts leave out the header, footer and nav. They include banners and form labels.
- Inbound link counts come from HTML links, after resolving redirects. They count pages, not individual links.
- The claims scan used a text pattern and is only a first pass. The full claims list comes in Phase 4.
