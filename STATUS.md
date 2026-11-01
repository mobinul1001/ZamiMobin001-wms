# STATUS: websitemaintenanceservices.org rebuild

Last updated: 2026-11-01. Project folder: `C:\Users\user\wms-rebuild`. All work is in local git commits. No remote is set and nothing is pushed or deployed. The live WordPress site, DNS and email are untouched.

Rules live in `CLAUDE.md` (wins on conflict), `SEO-GUARDRAILS.md`, `CMS-REQUIREMENTS.md`, `CLAIMS-AND-DESIGN.md` and `PROMPTS.md`.

## 1. What is done, per phase

| Phase | Status | Result |
|---|---|---|
| 0 Setup | Done locally | Astro static site, trailing slashes, sitemap, content collections, git. Only a production build on the real domain can be indexed. |
| 1 Read-only crawl | Done | 817 URLs, 96 real pages, 919 upload files (53.6 MB), 0 failed. Output in `export/` (not in git). |
| 2 URL map | Done, final | `url-map.csv`: 815 rows (121 at 200, 680 at 301, 14 at 404). 0 chains, 0 missing targets. |
| Keyword map | Approved and applied to titles and H1s | `reports/phase-3-keyword-map.csv`, 92 pages. Heading and secondary-keyword edits inside page bodies are not done. |
| 3 Design | Done locally | "Calm engineering" mockups and template plan approved 2026-11-01. All 4 template batches built and committed. Screenshots in `reports/batch-1` to `batch-4`. |
| 4 Build pages | Partly done | 92 pages plus /thank-you/ on the new templates. Claims and FAQs applied. See "not done" below. |
| 5 Parity | Local version passes | 815/815 rows, 92/92 pages; no old text lost apart from approved changes. `reports/parity-local.csv`. The live-versus-preview run waits for a deploy. |
| Redirects and build checks | Done | 246 path rules, 97 query rules, 1 feed rewrite. 18 failure tests pass. |
| 6 Preview QA | Not started | Needs the owner's push. 13 tests are listed in `reports/netlify-only-tests.md`. |
| CMS | Plan approved, nothing installed | Sveltia CMS. |
| 7 Launch, 8 Monitoring | Not started | |

**Not done in Phase 4 yet:**
- Master prices are on the homepage, pricing, WordPress packages and the articles. All 10 country pages use the owner's rounded local prices (`reports/country-prices.md`). 122 lines on 10 pages still show old plan prices (`reports/old-price-lines.md`, run `node scripts/list-old-prices.mjs`). Ecommerce, Shopify, USA and the other sets wait for question 11. Launch stays blocked until these are settled.
- Keyword edits inside page bodies, and expanding the homepage and packages page.
- Rearranging service pages (problem, included, price, FAQ): first screen is new, the rest keeps its old order.
- Section-based page fields, CMS, build-time image conversion, schema validation. Forms post to Formspree once IDs are added; 404 tracking can only be proven on Netlify.

## 2. Decisions the owner approved on 2026-11-01

**URLs and indexing**
- All 18 unsure URLs approved as proposed, slash and no-slash: category archives 301 to `/blogs/`, the author page 301 to `/about-us/`, security URLs 301 to the malware service, monitoring URLs 301 to the packages page, and 7 pages that never existed return 404.
- `/get-a-free-quote/` and `/free-website-maintenance-audit/`: `noindex, follow`, not in the sitemap, self-canonical or no canonical. Neither had backlinks or more than 10 clicks.
- `tools.org.ua`: no disavow.
- No city pages. Country and off-topic pages stay for now.

**Keyword map**
- Plan approved, with `| WMS` as the title suffix.
- Homepage title "Website Maintenance Services & Support | WMS". The H1 is the same, per CLAIMS-AND-DESIGN.md B2.
- Top-10 title rule: a page in the top 10 for its primary keeps its current title plus `| WMS`; updating the year is fine. Applied only with 5+ impressions (my threshold), so the WordPress page (#1 on 1 impression) took its new title.
- Country names in titles and H1s, and the WordPress, white-label and hacked splits, approved.
- Malware order: strengthen the service page, link from the article, and change the article title last, after the service page gets impressions. No merge. Article keeps its title for now.
- Brazil: H1, title and meta description in Portuguese, `lang="pt-BR"`. Spain checked (English 387 words, Spanish 342 words), so it stays `en-US`.

**FAQs**
- All 24 approved. 10 added to pages, 14 were already visible and not duplicated. Links added on the repair and white-label pages.
- All FAQ schema uses the exact visible question and answer (498 entries); the build enforces it.
- Old own prices in FAQ answers follow the master list.

**Prices and buying**
- Essential $79/mo or $790/yr, Growth $149/mo or $1,490/yr (most popular), Business $299/mo or $2,990/yr. One-time fix from $49. Hacked site cleanup $149. `src/data/prices.json`.
- Country pages use the owner's rounded table (`scripts/build-country-prices.mjs`); annual is 10 times the local monthly. Quote links carry the currency (`#growth-gbp`) and the form pre-fills Currency.
- Every plan includes free hosting for the first year and 2 free webmail accounts. First month free applies to monthly billing only.
- Store plans in `prices.json`: WooCommerce Store Starter $199, Store Growth $349, Store Pro $599 (free hosting and 2 webmail); Shopify Starter $149, Growth $299, Pro $499 (no hosting offer). Annual is 10 times monthly; first month free on monthly.
- Removal of the /blogs/ hidden list and the quote-form coupon box: confirmed by the owner.
- Repair: small fix $49, most repairs $99–$299, complex work quoted, hacked cleanup $149. Backup and updates are in every plan; emergency restore and catch-up update from $99 without a plan.
- White-label wholesale per site/month: 1–5 sites $59, 6–20 $49, 21+ $39. Hosting after year one: $19/month or $190/year. Guarantee wording approved: "If we can't clean your hacked site, you don't pay."
- Promises allowed: repair "No fix, no fee" in the owner's wording with its exclusions; "If we can't clean your hacked site, you don't pay."; malware free re-clean if reinfected within 30 days; migration free fix within 30 days if something we moved breaks. No others; the build fails on the removed wording.
- SEO tiers: Local SEO Starter $299 (Google Business Profile, on-page SEO for 5 pages, monthly report); SEO Growth $599 (+2 articles/month, local citations); SEO Pro $999 (+4 articles/month, link outreach, 1 call/month).
- Service prices set: see `reports/service-package-prices.md`. Free migration (host-to-host) with any annual plan. White-label tiers have the same Essential-level features; only the rate changes. Backup retention 30/60/90 days.
- /plan-packages-and-costs/, /website-management-packages/ and /website-maintenance-services-for-small-business/: unique content moved, 301s kept.
- 48 blog posts confirmed against the owner's list. /website-support/ is a 301 to /website-support-services/, its unique content moved there.
- Market ranges in articles: $49–$99 entry, $149–$299 mid, $300–$600+ premium; small businesses typically $75–$200/month.
- Annual prices always say "2 months free" (Spanish "2 meses gratis"); the build enforces it.
- Write "Included", not tick icons. "No contract. Cancel anytime."
- Form-only payment: no checkout on the site. Plan buttons open a form (name, email, website URL, platform, message, plan pre-selected), then Formspree, a thank-you page, and manual payment after a call.
- Hash plan links: `/get-a-free-quote/#essential`, `#growth`, `#business`, `#growth-design`, `#starter-seo` and so on. Never link to `?plan=`, `?package=` or `?industry=`. Old query URLs get no redirect.
- Service packages stay on the design, migration, SEO, speed and white-label pages. The owner confirms each price before launch. White-label prices must say wholesale for agencies.

**Claims (CLAIMS-AND-DESIGN.md section A, applied sitewide)**
- One line for numbers: "30+ websites built and maintained for businesses in Canada, the UK, the Caribbean and Bangladesh."
- Years, star ratings, review counts and all testimonials removed. "John Doe" and "Trusted by 500+" removed from `/contact/`.
- "Dhaka-based team, working US & UK business hours."
- "If we can't clean your hacked site, you don't pay." No other guarantees.
- Portfolio block and "Client words" stay empty until the owner confirms.

**CMS and AI search**
- Sveltia CMS with a fine-grained GitHub token. The owner creates it with a 1-year expiry, and `CMS-GUIDE.md` carries the renewal date.
- No 410: removed pages return 404, with no edge function. Editorial Workflow goes into the small test.
- `robots.txt` allows the named search and AI bots. Training bots allowed (Option A). `llms.txt` skipped for now.

**Working method**
- The owner pushes later. Commit locally after each step.
- No visual design beyond the mockups until a direction is approved.

## 3. Open questions waiting for the owner

2. **Portfolio table:** tick client or our project, and may show, in `reports/portfolio-table.md`.
3. **"30+" line:** the list includes US and Iraq sites that the line does not name. Check it after ticking.
4. **Mockup gaps:** response time, add-on prices (6), what counts as an edit hour, what happens on cancel.
5. **Real author:** name, role, photo and bio; also team photos and the founding year.
7. **Removed guarantees:** say if any were real terms (30-day warranties, 14-day satisfaction, money-back, 4-hour SLA).
8. **Items outside section A** (`reports/claims-open-items.md`): result figures, repair stats, agency case cards, certifications, platform badges, free hosting and free month offers, people and claims inside images.
9. **Case study:** keep after confirming the facts, or rewrite or noindex.
11. **Other promises on service pages:** see the TODO list.
13. **Semrush "wordpress maintenance" seed export:** optional, could change the WordPress primary.
14. **Git identity:** commits use the name "WMS" and the owner's email. Change before pushing if wanted.
15. **Bing and Organization schema:** Bing Webmaster Tools verification, the IndexNow key in Netlify, and real profile URLs for `sameAs`.

**TODO for the owner (added 2026-11-01):**
- Pricing FAQ drafts to confirm: "we go through the setup with you on your call". Mailbox size and limits are not stated.
- White-label: tier names Agency Starter, Agency Growth and Agency Scale are drafts. The service page's tiers still list different features, including unlimited edits at $49/site. The post's comparison says "Ask us" for 4 features.
- /wordpress-malware-removal-service/ shows $149, $249 and $349 per single site. $149 matches hacked cleanup; the other two are unconfirmed.
- Formspree: Free plan, one shared ID from the owner (`reports/formspree-setup.md`). Test reCAPTCHA with fetch on the first real submission. The privacy policy names Hostinger as the email provider, confirmed by the owner.
- Update page case studies and the FAQ keep their old claims; plan names changed to the master names.

**For later, after the owner pushes (not blocking current work):**
- Formspree form ID (`src/data/forms.json`, `default`).
- Confirm the GA4 Measurement ID and Clarity project ID. The site keeps the old site's IDs (`GT-K522B6T8`, `wqnjbhbxww`) unless the owner sends new ones.
- Clarity dashboard consent setting.
- Live consent test: Accept, then confirm data arrives in GA4 and Clarity.
- Portfolio table and case study.
- Real author details.
- Webmail details.
- Netlify redirect tests.

## 4. Next steps

1. Owner answers question 11 and the portfolio table.
2. Apply the remaining prices. Move the merged pages' content. Make keyword edits inside bodies, homepage and packages page first.
3. Plan image conversion and section fields.
4. Keep every template change passing: `npm run build`, `npm run parity`, `node scripts/test-build-checks.mjs`, `node scripts/test-browser-features.mjs`, `node scripts/link-report.mjs`.
5. Owner creates the private GitHub repo, pushes, and connects Netlify. Steps were given earlier in this project; no custom domain and no DNS change.
6. Run the Netlify-only tests in `reports/netlify-only-tests.md`, then install the CMS and write `CMS-GUIDE.md`.
7. Run parity against the preview, then preview QA and owner approval.
8. Launch with `LAUNCH-CHECKLIST.md`; the owner changes DNS. Monitor for 6 weeks, and change the malware article title once the service page has impressions.
