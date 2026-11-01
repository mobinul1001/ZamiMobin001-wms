# CHANGELOG

## Phase 0: Project setup (2026-11-01)
- Created the Astro project: static output, `trailingSlash: 'always'`, `build.format: 'directory'`, sitemap, content collections for pages and blog.
- Non-production builds get `X-Robots-Tag: noindex, nofollow` and a robots meta tag. A build is production only when Netlify sets `CONTEXT=production`.
- Copied the plan files, Search Console exports and GA4 snapshot into this folder.

## Phase 1: Read-only crawl (2026-11-01)
- Added `scripts/crawl.mjs`: GET only, at most one request per second, stops if the site blocks it, safe to re-run.
- Output: `export/inventory.csv`, `export/summary.json`, `export/pages/`, `export/wp-json/`, `export/assets/` (ignored raw HTML in `export/raw/`).
- Reports: `reports/phase-1-crawl-report.md`, `reports/phase1-404-catchall-links.csv`, `reports/service-package-prices.md`.

## Phase 2: URL map (2026-11-01)
- `url-map.csv` is final with 815 rows from `scripts/build-url-map.mjs`: 121 at 200, 680 at 301, 14 at 404. The owner approved all 18 open decisions. Validation found 0 chains and 0 missing targets.
- Noindex rule tightened: only a production build whose Netlify `URL` is the real domain can be indexed, so the `netlify.app` address stays noindex. A new production build is needed after the domain is added on launch day.
- `export/` is left out of git (large, can be crawled again); it stays on this computer.
- Added `scripts/download-media.mjs` and saved the 580 media files the page crawl had not reached (919 in total).
- Reports: `reports/phase-2-url-map-summary.md`, `reports/phase-2-url-map-summary.json`.

## Local migration and checks (2026-11-01)
- All 92 pages and posts migrated to `src/content/` by `scripts/migrate-content.mjs`, with old titles, H1s, schema and text. 919 upload files are in `public/wp-content/`.
- Added a plain placeholder layout, a real 404 page and an RSS feed. No visual design.
- Added `scripts/generate-redirects.mjs`, `scripts/check-build.mjs`, `scripts/test-build-checks.mjs` and `scripts/parity-local.mjs`.
- Proposed the keyword map in `reports/phase-3-keyword-plan.md`; not applied.
- Commits stay local. The owner pushes later.

## Keyword map applied (2026-11-01)
- Owner approved the keyword map with changes. All 92 pages now use its titles and H1s (`reports/phase-3-keyword-map.csv`). Heading and secondary-keyword edits inside page bodies are still to do.
- Top-10 rule: pages with 5+ impressions in the top 10 for their primary keep their current title plus `| WMS` (`reports/phase-3-top10-pages.json`).
- `/wordpress-malware-removal/` keeps its title and H1 until the service page gets impressions. The service page has its new title and H1, and existing phrases on 5 pages now link to it.
- Brazil H1 is in Portuguese, using a line already on the page. The old H1 stays as a subheading.
- `/contact/`: "John Doe" testimonial and "Trusted by 500+ Businesses" removed.
- Added `reports/claims-list.md`, `reports/claims-list.csv` and `reports/faq-not-visible.md` for owner review.

## FAQs and Brazil title (2026-11-01)
- 24 approved FAQs are visible: 10 added, 14 already on the page and not duplicated (`reports/faq-outcome.md`). Requested links added; master prices used in those answers.
- Brazil title is now in Portuguese, same as the H1.
- Claims are unchanged until the owner sends answers.

## Owner decisions (2026-11-01)
- Added `CMS-REQUIREMENTS.md`. CMS plan approved: Sveltia CMS, fine-grained GitHub token with 1-year expiry, no 410, Editorial Workflow included in the small test. Nothing is installed yet.
- Separate service packages stay on the design, migration, SEO, speed and white-label pages; the master price list covers maintenance plans and one-time fixes only. Each price is listed for the owner to confirm or correct before launch. Their buttons use the hash method, for example `/get-a-free-quote/#growth-design` and `#starter-seo`. `?industry=` and `?package=` URLs follow the `?plan=` rule: no redirect, no internal links. White-label agency prices must be clearly labelled as wholesale for agencies so they do not contradict the main plan prices.
- Quote form: plan buttons link to `/get-a-free-quote/#essential`, `#growth` and `#business`, and the form reads the hash to pre-select the plan. No internal link may use `?plan=`. Old `?plan=` URLs get no redirect; they load the same noindex page.
- `/get-a-free-quote/` and `/free-website-maintenance-audit/` are self-canonical or have no canonical; they must not point a canonical at another URL.
- `/get-a-free-quote/` and `/free-website-maintenance-audit/` become `noindex, follow` on the new site and are left out of the sitemap. Checked first: neither is in the GSC external links list; 16-month clicks are 0 and not listed, so the owner's condition (backlinks or more than 10 clicks) is not met.
- `tools.org.ua`: no disavow.
- Query+Page export added at `gsc/query-page/query-page-last-3-months.csv`.
- `SEO-GUARDRAILS.md` updated with section 8 (AI search / GEO). `robots.txt` now names and allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot and Claude-User. Training bots (GPTBot, ClaudeBot, Google-Extended, CCBot) are allowed too (Option A). `llms.txt` is skipped for now.
- Added `SEO-GUARDRAILS.md`. It adds to CLAUDE.md, which wins on conflict. Every phase report must list the guardrail checks run, with output.
- Title suffix: `| WMS`.
- Master price list: Essential $79/mo or $790/yr, Growth $149/mo or $1,490/yr, Business $299/mo or $2,990/yr, one-time fix from $49, hacked site cleanup $149. All other own prices are removed. Use "Included", not tick icons.
- No checkout on the site. Plan buttons open a form (name, email, website URL, platform, message, plan pre-selected) through Netlify Forms to a thank-you page. Payment is taken manually after a call.
- Semrush data is from the US database.
