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

## FAQ schema, language and annual note (2026-11-01)
- All 498 FAQ schema entries use the exact visible question and answer; the build fails if they differ.
- Our own old prices and plan names in FAQ answers follow the master list (24 replacements). Other price sets, market ranges and mismatched features are listed in `reports/faq-schema-sync.md`.
- Brazil: `lang="pt-BR"`, Portuguese meta description and social tags. Spain stays `en-US` because its body is not mostly Spanish.
- Annual prices must say "2 months free" or "2 meses gratis"; the build enforces it. Master list saved in `src/data/prices.json`.

## Claims and design mockups (2026-11-01)
- CLAIMS-AND-DESIGN.md section A applied to all pages, meta descriptions, social tags, schema and FAQ answers by `scripts/lib/claims.mjs`. Change log: `reports/claims-applied.csv`. Open items: `reports/claims-open-items.md`. The build fails on banned claims.
- Portfolio and "Client words" components added, empty and not on any page. Table for the owner: `reports/portfolio-table.md`.
- Static mockups in `mockups/` with screenshots in `reports/mockups/`. They are outside the site build; other templates wait for approval.

## Status snapshot (2026-11-01)
- Added `STATUS.md`: work done per phase, approved decisions, open questions and next steps.

## Owner decisions (2026-11-01)
- "Calm engineering" mockups approved for the homepage, pricing page and blog post.
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

## Templates, Batch 1 (2026-11-01)
- New global layout: header with no-JS Services dropdown, footer, approved "Calm engineering" CSS, self-hosted Inter. Google tag and Clarity load after the page is interactive, on the live production build only.
- Converter keeps small card grids as cards; whole-section layout grids stay as normal flow; table cells stay on one line (fixes the homepage comparison table).
- Homepage and pricing templates. Old plan sections removed under the approved plan: homepage pricing section, packages page plan cards.
- Pricing page FAQ: 2 old price and plan lines changed to the master list.
- A2: added "for over a decade" to the claim rules.
- Guard added: an approved removal over its word limit stops the run, and parity fails any page under 75% of the old page's words. Reason: a removal bug took 85% of the homepage while parity still passed, because parity compared against the same removal. Found from the word ratio before any commit.
- Added scripts/screenshot-pages.mjs, scripts/link-report.mjs and the lighthouse dev dependency.

## Templates, Batch 2 (2026-11-01)
- Article template for 48 posts and 4 article pages: breadcrumbs, updated line, quick-answer box, table of contents, author line, related articles, link to the matching service.
- Blog index lists every post in plain links, grouped by topic (src/data/blog-hubs.json). The old list was filled by JavaScript, so 42 pages had no crawlable link. Now 0 unreachable, every page within 2 clicks.
- Removed the old JavaScript post list from /blogs/: filter row and hidden placeholders ("Loading Title...", "Kono result paowa jayni!"). Flagged to the owner.
- Article heading labels (class "eb") moved out of the heading tag, so "DecideHow to Choose" reads properly.
- Footer links added: partner program, write for us, malware scanner.

## Templates, Batch 3 (2026-11-01)
- Service template for 16 pages (3 package, 13 service) and 10 country pages: breadcrumb, H1, first sentence as sub-headline, starting price from the master list, calls to action. The rest of the body keeps its old order. Spanish and Portuguese labels on those two country pages.
- Master prices on /wordpress-website-maintenance-packages/ and the Netherlands, Spain and Switzerland pages: cards, tables, text, meta, social tags and schema offers.
- Service pages link back to their blog posts.
- scripts/list-old-prices.mjs writes reports/old-price-lines.md: lines that still show an old plan price.

## Templates, Batch 4 (2026-11-01)
- Form template: contact, quote and audit forms post to Netlify Forms with a honeypot, then /thank-you/. Labels linked to their fields.
- Quote form: platform field added, plan list follows the master list and is pre-selected from the URL hash. Coupon box removed (it needed the old JavaScript), button now "Get My Quote".
- Malware scanner rebuilt as a small browser script: address format, HTTPS, links to Google Safe Browsing, Sucuri and VirusTotal.
- New /thank-you/ (noindex, not in sitemap). 404 restyled, sends a page_not_found event to Google Analytics on production.
- Plan names Growth and Business on the Netherlands, Spain and Switzerland cards.
- Build check fails on "[Owner" text and on any form that does not post to Netlify Forms.
- Text pieces inside links no longer run together.
- Added scripts/test-browser-features.mjs: runs the quote hash and the scanner in headless Chrome. It caught the scanner crashing on a missing results list before commit.
- The forms check found 9 service-page forms not connected. All 12 forms now post to Netlify Forms with unique names.

## USA prices (2026-11-01, owner's decision)
- USA page: Basic $49, Standard $99, Premium $199 became Essential $79, Growth $149, Business $299. Plan buttons use the hash links. Card feature lists are unchanged.
- Corrected a Batch 3 mistake: "Plans from $79/mo" was on the UK, France and Ireland first screens, whose cards show £ and € prices. Removed until the owner decides those prices.

## Country prices (2026-11-01, owner's decision)
- All 10 country pages: homepage plans converted to local currency with the local sign. See reports/country-prices.md. Names Essential, Growth, Business; buttons use hash links; annual price added to each card.
- Corrected: Canada, Australia and Brazil also had their own prices, and their first screens wrongly said "Plans from $79/mo".
- Build check fails if a country page misses a local price or shows a dollar price (USA excepted).

## Owner's price and offer instructions (2026-11-01)
- Country prices: owner's rounded table, plus local one-time fix and hacked cleanup prices under the plan cards.
- Country pages: See plans goes to #plans; quote links carry the currency (#growth-gbp); quote form has a Currency field, pre-filled from the link.
- Country plan cards list the master features exactly; Australia's FAQ changed to match. Fixed Advanced and Elevate still showing on the Netherlands, Spain and Switzerland cards.
- Offers: free hosting for the first year and 2 free webmail accounts on every plan card and in the comparison table; first month free under the monthly price; hero lines on home, country and WordPress pages; 3 pricing FAQ answers (drafts).
- Articles and WordPress page: master names and prices, 2 months free, market ranges from the owner. Hosting claims on the FixRunner, WP Buffs and SiteCare pages kept.
- White-label post: wholesale $59/site/month, example resell at $149 for a $90 margin. Tiers and volume rows without a confirmed price now say "Ask for your rate" or "Let's talk".
- Best companies listicle: disclosure added near the top.

## Store plans and owner's answers (2026-11-01)
- WooCommerce (ecommerce page): Store Starter $199, Store Growth $349, Store Pro $599. Shopify: Starter $149, Growth $299, Pro $499, no hosting offer. Cards, tables, FAQs, meta, schema, hero, #plans, quote hashes, form options.
- Pricing page line pointing to both store plan pages. "Save 20%" gone from both store pages; the build now fails on any "save 20%" or "20% off" in a page body.
- WordPress page and article plan cards list the master features exactly. Plan names Essential, Growth, Business.
- Removed the "Hosting Management" add-on from the WordPress page and the pricing page.
- WordPress cost post: 24/7 emergency fixes on Business only. WooCommerce recommendations in articles now point to the Store plans.

## Owner's answers, comparison tables and service prices (2026-11-01)
- All 49 URLs in the owner's list checked: 48 posts on the same URL and on /blogs/, /website-support/ a 301. Its unique content moved to /website-support-services/.
- Comparison tables on WordPress, ecommerce, Shopify and 2 articles rebuilt from prices.json: "Included" or "—". A bigger allowance replaces a smaller one, also on the pricing page.
- "Every plan" lists trimmed on home, pricing, WordPress and Shopify.
- WooCommerce support removed from Growth and from Australia's FAQ. Store plans line added under the plans.
- FixRunner, WP Buffs and SiteCare: 24/7 emergency fixes and staging on Business.
- Repair, backup, update and white-label prices set. Hosting after year one in the pricing FAQ.

## Service prices, white-label features, merged pages (2026-11-01)
- Malware, speed, migration, design and SEO prices, names, cards, FAQs, schema and first-screen price lines. Malware tiers list only the owner's features. Speed's Enterprise tier removed.
- White-label: same Essential-level features on all 3 tiers. Removed unlimited edits, dedicated manager, speed, emergency and staging claims. "50%+" replaced; build fails if it returns.
- Backup retention 30, 60, 90 days; "9 deliverables" removed. Free migration line on pricing and migration pages.
- Unique content moved from the 3 remaining merged pages. Add-ons from website-management-packages added to pricing.

## Promises, white-label claims, SEO tiers, layout shift (2026-11-01)
- Removed backup free month and refund, repair "no fix no fee" and 30-day refix, redesign free fix, small business refund, migration full redo. Kept malware re-clean and migration fix.
- White-label: removed 99.99% SLA, 24/7 SLA, 3.8-hour response, Slack, dashboard, WAF and the two mock panels. "Hosting not included" on agency tiers.
- SEO tiers set; dedicated strategist, weekly call and SLA removed; "11 deliverables" wording changed.
- Malware tiers: vulnerability patch and short written report on all three.
- Metric-matched fallback font and a fixed logo width, to stop text reflow when the web font loads.

## HIPAA, response times, migration line (2026-11-01)
- HIPAA compliance claims removed from design, hacked recovery, redesign, SEO, speed, white-label, backup and malware pages. Build fails if one returns.
- Repair: 60-minute response claims replaced with "Repair work usually starts the same business day."
- White-label: "Every Single Update Is Tested On Staging First" removed.
- Migration: free-fix line under "30-Day Post Support Window".

## Healthcare note, staging wording, repair times, No fix no fee (2026-11-01)
- Healthcare note added once on each page that offers healthcare or medical sites. Hacked recovery risk lines kept.
- Staging claims about our plans changed to "Staging-tested updates on the Business plan." White-label process rewritten without staging. Migration, redesign, repair and backup keep their own staging steps; store plans keep theirs.
- Repair time: one wording. "No fix, no fee" restored on the repair page with the owner's exclusions.
