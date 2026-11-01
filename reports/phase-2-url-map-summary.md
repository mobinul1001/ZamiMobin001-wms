# Phase 2: URL map summary (2026-11-01)

Full map: `url-map.csv`. Generator: `scripts/build-url-map.mjs`. The original 16-row map is kept at `reports/url-map-original.csv`.

## Totals
| Status | Rows |
|---|---|
| 200 | 121 |
| 301 | 680 |
| 404 | 14 |
| NEEDS OWNER DECISION | 0 |
| **Total** | **815** |

Final: the owner approved all 18 proposals below on 2026-11-01, covering slash and no-slash copies (22 rows became 301, 14 became 404).

The 2 crawled rows for the made-up test URL are left out. The 919 upload files (53.6 MB) are not rows; they stay at their exact paths.

## 200 rows
| Type | Rows |
|---|---|
| Pages | 44 |
| Posts | 48 |
| Query-string variants (`?plan=`, `?package=`, `?industry=`) | 28 |
| RSS feed at `/feed/` | 1 |

## 301 rows
| Type | Rows |
|---|---|
| Attachment pages to their file | 370 |
| WordPress ID URLs (`/?p=`) | 97 |
| No-slash URLs | 97 |
| Dead link targets to the closest page | 50 |
| Post and archive feeds | 34 |
| Merged pages (4) and `/home/` | 5 |
| No-slash URLs with a query string | 3 |
| `/page/2/` | 2 |
| Owner-approved archives (14) and dead link targets (8) | 22 |

## Validation output
| Check | Count |
|---|---|
| Redirect chains | 0 |
| Redirects to themselves | 0 |
| Targets with no row | 0 |
| Redirects to a file not saved | 0 |
| Original rows changed | 0 |
| Backlink URLs not returning 200 or 301 | 0 |
| Proposed 404s with backlinks, clicks or impressions | 0 |

Distinct URLs sent to the homepage: `/home/`, `/?p=42`, `/page/2/`, `/services`, `/Site`, `/website-maintenance-services/`.

## Owner-approved decisions
36 rows: 18 URLs, each with a slash and a no-slash copy. The no-slash copy follows the same decision.

| URL | Proposal | Pages linking | GSC impressions, 16 months |
|---|---|---|---|
| `/category/industry/` | 301 to `/blogs/` | 52 | 20 |
| `/category/industry/page/2/` | 301 to `/blogs/` | 3 | 5 |
| `/category/industry/page/3/` | 301 to `/blogs/` | 3 | 11 |
| `/category/industry/page/4/` | 301 to `/blogs/` | 3 | 0 |
| `/category/industry/page/5/` | 301 to `/blogs/` | 5 | 0 |
| `/category/news/` | 301 to `/blogs/` | 2 | 0 |
| `/author/websitemaintenanceservices/` | 301 to `/about-us/` | 54 | 0 |
| `/website-security/` | 301 to `/wordpress-malware-removal-service/` | 10 | 0 |
| `/website-security-services/` | 301 to `/wordpress-malware-removal-service/` | 3 | 0 |
| `/website-monitoring/` | 301 to `/monthly-website-maintenance-packages/` | 4 | 0 |
| `/website-monitoring-services/` | 301 to `/monthly-website-maintenance-packages/` | 5 | 0 |
| `/affiliate-disclosure/` | 404 | 1 | 0 |
| `/copyright-notice/` | 404 | 1 | 0 |
| `/agency-resources/` | 404 | 1 | 0 |
| `/reporting-guides/` | 404 | 1 | 0 |
| `/local-seo-white-label-pricing/` | 404 | 1 | 0 |
| `/white-label-local-ranking-reports/` | 404 | 1 | 0 |
| `/white-label-local-seo-for-agencies/` | 404 | 1 | 0 |

## Not yet tested
Netlify behaviour needs a preview deploy: query-string rules on `/` for `/?p=` URLs, the capital letter in `/Site`, and no-slash redirects.

## Guardrail checks in this phase
| Guardrail | Output |
|---|---|
| 1. Soft 404, no mass homepage redirects | 6 distinct homepage targets, each listed above |
| 1. Crawl traps | Query variants have no internal links on the new site; archives await decision |
| 5. Backlinks | All 26 target pages keep 200 or a one-hop 301 |
| 5. Old image URLs | 919 of 919 media files saved, 0 failed |
