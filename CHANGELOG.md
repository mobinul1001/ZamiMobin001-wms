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

## Portals, healthcare by country, Formspree (2026-11-01)
- Healthcare sections: portal wording and booking wording from the owner. Migration case line removed. Country notes use UK GDPR, GDPR, PIPEDA, the Privacy Act and LGPD; USA keeps the HIPAA wording.
- All 12 forms post to Formspree (src/data/forms.json). Honeypot _gotcha, form_name field. Removed the disabled attribute that the migration had left on every submit button. Line about patient information under forms on healthcare-related pages.
- Build checks and browser tests expect Formspree. A real Netlify production build fails without IDs.

## One healthcare note, Formspree Free with fetch (2026-11-01)
- One healthcare note on every page and country (Portuguese on Brazil). No law or provider named in it. Portal line unchanged.
- Formspree Free with one shared ID. public/forms.js submits with fetch and opens /thank-you/; validation and rate-limit messages show on the form; other failures fall back to a normal post; no JavaScript still works.
- Privacy policy addition drafted, not applied.

## Consent bar, privacy and cookie policy (2026-11-01)
- Bottom bar with Accept and Reject of equal weight, privacy link, and a Cookie settings link in the footer. The choice is remembered. Google Analytics and Clarity load only after Accept, with Consent Mode v2 default denied and Clarity consentv2.
- Privacy policy names Formspree, Hostinger, Google Analytics, Microsoft Clarity, Netlify and WhatsApp. Cookie policy names Google Analytics and Clarity and describes the choice.
- Launch checklist: set the Effective Date on launch day. Later items recorded in STATUS.md.

## Cookie policy without advertising (2026-11-01)
- Removed the marketing and retargeting card and the targeted advertising line; the site has no ad tags. Build fails if advertising wording returns to the cookie or privacy policy.
- Hostinger confirmed as the email provider. Later items listed in STATUS.md.

## Design review (2026-11-01)
- reports/design-review/: desktop and mobile, full page and first screen, for 11 templates (scripts/design-review.mjs).
- Fixed a bug found in the screenshots: removing the Hosting Management add-on had taken the whole add-on list off the WordPress page. Added scripts/audit-removals.mjs, which lists what each approved removal takes (reports/removal-audit.md).

## New design direction, mockups and fixes (2026-11-01)
- CLAIMS-AND-DESIGN.md section B rewritten as "Modern premium SaaS".
- Mockups A (dark premium) and B (light vibrant): mockups/v2/, built by scripts/build-mockups-v2.mjs from prices.json and the old homepage text. Screenshots and Lighthouse by scripts/screenshot-mockups-v2.mjs, in reports/mockups-v2/.
- Converter: run-together text pieces become title + label, rows of them become cards; repair panel rebuilt and labelled "Example".
- Approved removals: repeated line under the H1 on about, UK, Canada, France, Ireland; fake label on repair; 99.99% Uptime SLA on white-label agencies.
- Service and country body now lines up with the page heading.
- Research and outlines: reports/content-outlines/. No new text in pages.

## One design, two themes (2026-11-01)
- Mockups A and B merged into mockups/v2/home.html: light and dark themes, sun/moon switch, default from the system setting, choice remembered, no flash.
- Every homepage section is in the new design; the 3 accordions became sections; one container, 8px spacing and one type scale; wider headline and larger dashboard; platform logos one height.
- "Find us on" row replaces the badges in the mockup only. The live page keeps them until the design is approved.
- Fake panels removed on design, migration, SEO, updates, backup and malware, the same way as repair: label gone, rows kept, labelled "Example".
- Outlines updated with the owner's answers. Cancel, edit hours and response times are still open.

## Design QA round (2026-11-01)
- DESIGN-QA.md added. scripts/design-qa.mjs runs the self-review loop: 1440, 768, 390 and 360 in both themes, measured checklist, section montages, Lighthouse. Replaces screenshot-mockups-v2.mjs.
- Homepage mockup rebuilt to the rules: hamburger menu, "Get a free quote" in the header, one process section, one included section, full-width callouts, tinted table column, two-column case study, icon-card grid for every-plan items, 4-column footer with Find us on badges.
- Claims removed from the content, and the build now fails if they return: +142% Growth, Page 1 Top 3, 98/100 Passed, 99/100 Passed, "Certified" on Expert Developers, and the Altitude Care numbers on the homepage, case study page and 3 comparison posts. H2 shortened to "Real Maintenance Results".
- STATUS.md: cancel, edit hours and response time answers saved.

## Brand guideline (2026-11-02)
- BRAND-GUIDELINE.md added: colours, type, spacing, components and themes, with steps for reusing the system at another company. Values checked against mockups/v2/design.css.

## Claims restored, company facts, page end, rollout (2026-11-02)
- Claims confirmed by the owner are back; their build checks are removed. Old contact details and location lines replaced sitewide (scripts/lib/company-facts.mjs, claims.mjs).
- Design moved from the mockup into the site: src/styles/site.css, Base.astro, all templates, src/lib/home.ts, polish.ts, plans.ts, icons.ts. mockups/v2 and build-mockups-v2.mjs removed.
- Every page ends with the GMB block, final CTA box and new footer. A short call to action at the end of a page moves into the CTA box.
- scripts/design-qa.mjs runs on dist/ for 11 templates.

## 2026-11-02: owner's layout rules on all templates
- Status panels on the SEO and design pages now say "Client result"; the other panels and the homepage visuals keep "Example".
- Brazil added to the full country list. The GMB block is on the homepage only.
- polish.ts places every section: text + side card, centred reading column, or two text columns above a wide block.
- Leftover lines become chips, icon badges, check lists, numbered cards, stat cards and small labels. Short lists become icon-card grids.
- FAQs are one 2-column accordion per page; pricing merges its billing questions into it.
- Quote, contact and audit forms: fields side by side, sticky "What happens next" panel.
- Section padding 80/48, heading gap 24, shorter inner-page heroes with a side card or centred.
- design-qa.mjs: new checks at 1440 (empty right side, gaps, plain lines, stacked grids), --all-pages and --phone, Lighthouse on all 11 templates.

## 2026-11-03: uptime wording
- Owner keeps "99.9% uptime guarantee". No site text changed. Terms for the Terms page added to the owner's later list in STATUS.md.
- STATUS.md: GMB line corrected to homepage only.

## 2026-11-03: homepage merge
- Homepage top is the owner's design (hero with quick-quote form, Google icons, "5.0 on Clutch", Google Partner; "Find us on" strip; 29-platform rows; 5 stats; bento; 5-step process; case study with speed bars; review placeholders; compare table; final CTA with form; phone sticky bar). The old homepage text fills it; parity still passes with no lines missing.
- One bento holds "What's Included in Professional Website Maintenance", "Everything We Take Care Of", "What's Included in Every Plan" and "Everything Your Website Needs in One Place"; each list item sits in the card it belongs to, once.
- Quick-quote forms post to Formspree like the other forms (`home-hero`, `home-final`), with honeypot and form_name.
- Wording changed from the design file so it matches approved facts: hero tick "Real engineers make your edits, same business day" is now "1–6 hours a month, by plan" (response times are 4 hours to 2 business days); compare row "Response" says "4 hours to 2 business days, by plan" and "Monthly report" says "Growth and Business"; compare heading is "How we compare" because the design's "Big-agency experience, small-team care" line is still unconfirmed; "Verified on Google" dropped (no Google rating given). The design's "Need something fixed today?" and 6-question FAQ are not used: the owner's order uses the old services sections and the 12 old FAQs.
- "First month free" removed sitewide (claims.mjs rules, price generators, prices.json, templates); check-build fails on it.
- Footer: owner's dark design on all pages, email and hours lines, square social buttons (Facebook, LinkedIn, Instagram), Refund policy link; badges removed. Top bar added on all pages.
- design-qa.mjs: badges expected in the homepage strip, not the footer; scrolling rows are exempt from the off-screen check.

## 2026-11-03: shorter homepage
- 22 parts down to 11 sections in main, plus GMB and the final CTA. Order: hero+form, find us on, platforms+stats, what's included, pricing, how it works, results, services, comparison, FAQ, guides+countries.
- One bento holds the included work, "Everything We Take Care Of", "Your Dedicated Website Maintenance Partner" and "Why Choose Us?".
- One services section: 4 illustrated cards, then the other 10 services as a compact link grid.
- One comparison section with two tabs (radio buttons, no script): "With vs without maintenance" and "WMS vs freelancer vs agency". Tables on wide screens, accordions on phones.
- Results section: case study with the monthly report example beside it, then the review cards.
- The two text cards under the stats are gone: the opening paragraph and chips are the bento intro (the longer definition is under "Read more"); the 12+ years and 650+ lines are already on the About page.
- FAQ shows 6 of 12 and guides 3 of 6; "Show all" reveals the rest. Everything stays in the HTML; parity has 0 lines missing.
- Phones: bento and service cards are swipe carousels (CSS scroll-snap).
- Fixed: hidden "Explore service" text inside carousel cards widened the page on phones.
- Page height: desktop 1440 18,670 to 14,886 px; phone 390 36,586 to 22,111 px.
- New owner rule: responsive on every device. Width sweep 320 to 1920 (14 widths) on 11 templates, 154 checks, 0 problems.

## 2026-11-04: "What's included" on one screen, trust strip, new order
- What's included: the big card with the 4 stats and 8 short cards (Updates, Security, Backups, Uptime, Speed, Edits by real people, Free hosting + 2 webmail, Monthly report), each with an icon, a title and one line. The old card text and the care lists are behind "Read more" in each card; the longer intro is behind "Read more" under the heading. About 970 px tall at 1440, so it fits one screen.
- One-liners come from the owner's design file; "Monthly report" says "on Growth and Business" because Essential has no report.
- "Your Dedicated Website Maintenance Partner" and "Why Choose Us?" moved from the homepage to /about-us/ (new section at the end of the page, built from the homepage text, so there is one source). Parity checks each moved line is on /about-us/ (21 lines).
- Trust strip under the results: No contract, Fast response, Transparent pricing, Expert developers, 24/7 on Business, and "Learn More About Us".
- Order: hero+form, find us on, platforms+stats, what's included, results + trust strip, pricing, comparison, how it works, services, FAQ, guides+countries, GMB, final CTA.
- Phones: reviews and guides are swipe carousels too; country links are compact.
- design-qa.mjs ignores text inside closed "Read more" panels.
- Page height (QA screenshots): 1440 14,832 to 13,159 px; 390 22,132 to 20,301 px.
