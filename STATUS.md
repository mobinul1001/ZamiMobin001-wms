# STATUS: websitemaintenanceservices.org rebuild

Last updated: 2026-11-05. Project folder: `C:\Users\user\wms-rebuild`. All work is in local git commits. No remote is set and nothing is pushed or deployed. The live WordPress site, DNS and email are untouched.

Rules live in `CLAUDE.md` (wins on conflict), `SEO-GUARDRAILS.md`, `CMS-REQUIREMENTS.md`, `CLAIMS-AND-DESIGN.md` and `PROMPTS.md`.

## Current work order (owner, 2026-11-01)
Not pushing yet. A plan and the owner's approval before each step. Commit locally, update this file after each step.

| Step | Status |
|---|---|
| 1. Design review screenshots | Done. Owner chose both, as two themes of one design. Mockup: `mockups/v2/home.html`, rebuilt to `DESIGN-QA.md`. QA: `node scripts/design-qa.mjs`, screenshots in `reports/design-qa/home/`. **Waiting for the owner to approve the homepage; then roll out to all templates in batches.** |
| 2. Content expansion: homepage, pricing, WordPress, ecommerce, Shopify, cost post, WordPress cost post, small business, best companies, service pages | Research and outlines done for homepage, pricing and WordPress: `reports/content-outlines/`. No new text goes into pages until the owner approves the design screenshots. |
| 3. Service pages: problem, included, price, FAQ | Not started. |
| 4. H2/H3 keyword edits and internal-link hub | Not started. |
| 5. Sveltia CMS in local mode | Not started. |
| 6. Image conversion and schema validation | Not started. |

## New design direction (owner, 2026-11-01)
The owner finds the current design too plain and outdated: mostly text lists, small headings, links instead of buttons, little colour or visuals. The owner said a full design brief comes right after the compact; the brief sent just before it is recorded here.

- Replace "calm engineering" with "modern premium SaaS" (2026 style). Update `CLAIMS-AND-DESIGN.md` section B.
- Two homepage mockups, desktop and mobile, full page, for the owner to choose:
  - **A, Dark premium:** dark navy sections, brand purple glow and gradients in CSS only, like linear.app and vercel.com.
  - **B, Light vibrant:** white base, bold purple gradients, colourful cards, large visuals, like stripe.com and framer.com.
- Both include: headings 56–72px on desktop; hero with headline, subline, offer line and real buttons, plus a large "live maintenance dashboard" visual in HTML/CSS/SVG labelled "Example"; platforms strip (WordPress, WooCommerce, Shopify); bento grid for "What's included" with inline SVG icons and mini visuals; pricing cards with Growth highlighted by gradient border and glow, monthly/annual toggle; 4-step timeline with connecting line; comparison table as cards; FAQ accordion; dark gradient final CTA band; buttons instead of text links for CTAs; hover lift and scroll fade-in that respect prefers-reduced-motion; the purple/neon style of the blog images.
- Limits: no heavy libraries, Lighthouse mobile at least 90, CLS 0, all existing text kept (parity).
- Also fix: left alignment on service and country pages; the old fake panel and broken text rows on the repair page; flattened stats and labels; duplicate "About Us" and UK heading text.

## Owner answers, plans (2026-11-01)
- **Cancel:** anytime. Service runs to the end of the paid month; no partial-month refunds. After cancelling, the site, files and data stay the client's. Hosting and email can continue at $19/month.
- **Edit hours:** unused hours don't roll over.
- **Response time:** Essential 2 business days, Growth 1 business day, Business 4 hours + 24/7 emergency fixes.
- **"Find us on":** use the badge images and profile URLs exactly as on the live site. Keep Clutch, GoodFirms, Sortlist, Techreviewer, C2C Review, Trustpilot. Agency Spotter only if the live site links to our profile (it does: agencyspotter.com/website-maintenance-services). ITFirms is out.
- **Claims:** the section 5 removal was reversed on 2026-11-02, see below.
- **Design process:** from now on follow `DESIGN-QA.md`: self-review at 1440, 768 and 390 in both themes, fix, then report with the checklist table. Homepage first; after approval, roll out in batches.

## Owner decisions (2026-11-02)
- Restored, confirmed true: "+142% Growth", "Page 1 Top 3", "98/100 Passed", "99/100 Passed", "Expert Developers: Certified, experienced team", the Altitude Care numbers, H2 "Real Maintenance Results, Backed by Numbers", "99.9% uptime guarantee". Build checks that blocked them are gone. "Certified, Experienced, Trusted." and "Google Partner" stay.
- Company facts, contact details and reach: `CLAIMS-AND-DESIGN.md` section A; values in `src/data/site.json`. No Dhaka, Bangladesh or +880 about the company.
- No GMB block (owner, 2026-11-04): the company name, address, phone and email are in the footer on every page. Every page ends: content → final CTA box → footer. Footer: 3 link groups (Services, Company, Resources), latest owner zip.
- Service cards: no "5-Star Service" line (already gone).
- General mentions of Bangladesh stay in 5 blog posts (CDN regions, .bd domains, Shopify pricing) and one portfolio link, since they are not about the company. The owner can ask to remove them.

## Design fixes done (2026-11-01)
- `CLAIMS-AND-DESIGN.md` section B is now "Modern premium SaaS". Section A is unchanged.
- Left alignment on service and country pages fixed.
- Flattened stats fixed in the converter: 2 text pieces become a title and label (`.pair`), and rows of them become cards.
- Repair page: old panel is now a clean status panel labelled "Example"; the "emergency-repair-engine.v2" label is gone.
- Duplicate line under the H1 removed on about, UK, Canada, France and Ireland.
- A "99.99% Uptime SLA" stat on the white-label agencies page had escaped the check because its text was joined to the next word. The owner had already removed this claim, so it is now removed.

- The same fake panels are fixed on design, migration, SEO, updates, backup and malware: label gone, rows kept, labelled "Example".

**Owner decisions (2026-11-01):**
- Both designs, as light and dark themes with a switcher. Default follows the system, choice remembered, no flash.
- Replace the "Trusted & Rated" badges with one row, "Find us on": small same-height names, no ratings or stars. Only real profiles.
- Plan changes: upgrade or downgrade anytime; takes effect from the next billing month.
- Page builders: Elementor, Divi, Beaver Builder, WPBakery and Gutenberg. We upgrade sites from PHP 7.4 to 8.x.
- Add-on prices: "Ask for a price".

**Waiting on the owner:**
- Approve the homepage.
- Confirm the draft text: "Expert, Dedicated Team" card, short section labels (`DRAFT_LABELS` in `scripts/build-mockups-v2.mjs`), and the H2 "Real Maintenance Results".
- Confirm the Altitude Care numbers if they should come back (removed from the homepage, case study page and 3 comparison posts).

## 1. What is done, per phase

| Phase | Status | Result |
|---|---|---|
| 0 Setup | Done locally | Astro static site, trailing slashes, sitemap, content collections, git. Only a production build on the real domain can be indexed. |
| 1 Read-only crawl | Done | 817 URLs, 96 real pages, 919 upload files (53.6 MB), 0 failed. Output in `export/` (not in git). |
| 2 URL map | Done, final | `url-map.csv`: 815 rows (121 at 200, 680 at 301, 14 at 404). 0 chains, 0 missing targets. |
| Keyword map | Approved and applied to titles and H1s | `reports/phase-3-keyword-map.csv`, 92 pages. Heading and secondary-keyword edits inside page bodies are not done. |
| 3 Design | Being replaced | "Calm engineering" templates are built and committed, and the owner now wants a new direction (see above). Current screenshots: `reports/design-review/`. |
| 4 Build pages | Partly done | 92 pages plus /thank-you/ on the new templates. Claims and FAQs applied. See "not done" below. |
| 5 Parity | Local version passes | 815/815 rows, 92/92 pages; no old text lost apart from approved changes. `reports/parity-local.csv`. The live-versus-preview run waits for a deploy. |
| Redirects and build checks | Done | 246 path rules, 97 query rules, 1 feed rewrite. 24 failure tests and 28 browser tests pass. |
| 6 Preview QA | Not started | Needs the owner's push. 13 tests are listed in `reports/netlify-only-tests.md`. |
| CMS | Plan approved, nothing installed | Sveltia CMS. |
| 7 Launch, 8 Monitoring | Not started | |

**Not done in Phase 4 yet:**
- `node scripts/list-old-prices.mjs` is the check for old plan prices. Its one remaining hit, $249 on the malware page, is now an approved price.
- Keyword edits inside page bodies, and expanding the homepage and packages page.
- Rearranging service pages (problem, included, price, FAQ): first screen is new, the rest keeps its old order.
- Section-based page fields, CMS, build-time image conversion, schema validation. Forms post to Formspree once the ID is added; 404 tracking can only be proven on Netlify.

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
- Every plan includes free hosting for the first year and 2 free webmail accounts. No free first month (owner, 2026-11-03); yearly billing is 2 months free.
- **Store plans** (`prices.json`). WooCommerce: Store Starter $199, Store Growth $349 (most popular), Store Pro $599, all with free hosting for the first year and 2 webmail. Shopify: Shopify Starter $149, Shopify Growth $299 (most popular), Shopify Pro $499, no hosting offer. Annual is 10 times monthly; first month free on monthly.
- **Malware removal:** Cleanup $149; Cleanup + Protect $249 (adds blacklist removal and hardening); Priority $349 (adds 4-hour start and 3 months of monitoring). All three: patch the vulnerability that let the hack in, and a short written report.
- **Speed (one-time):** Speed Boost $149 (caching, images, up to 10 pages); Core Web Vitals $299; WooCommerce / Large Site $499. Growth and Business include speed optimization.
- **Migration (one-time):** Host-to-Host Move $149 (up to 20 pages, no downtime), free with any annual plan; Full Migration $399 (domain change, 301 redirects, SEO check, up to 100 pages); Platform Change from $999.
- **Design (one-time):** Starter $799 (up to 5 pages); Business $1,499 (up to 10 pages, blog, speed and SEO setup); Store $2,499 (WooCommerce, up to 50 products).
- **SEO (monthly):** Local SEO Starter $299 (Google Business Profile, on-page SEO for 5 pages, monthly report); SEO Growth $599 (+2 articles/month, local citations); SEO Pro $999 (+4 articles/month, link outreach, 1 call/month). One-time SEO audit $199.
- **Repair:** small fix $49; most repairs $99–$299; complex work quoted; hacked cleanup $149. Repair time, one wording: "Small fixes are usually done within 24 hours; bigger repairs within 24–48 hours." Also: "Repair work usually starts the same business day."
- **Backup:** included in every plan, with retention of 30 days on Essential, 60 on Growth, 90 on Business. Emergency restore without a plan from $99.
- **Updates:** included in every plan. One-time catch-up update for long-outdated sites from $99.
- **White-label wholesale, per site per month:** 1–5 sites $59, 6–20 sites $49, 21+ sites $39. Same Essential-level features on every tier, "Hosting not included", "Wholesale for agencies", "Resell at $149 and keep up to $110 per site". Removed: unlimited edits, dedicated manager, 50%+ margin, 99.99% SLA, 24/7 SLA, 3.8-hour response, Slack channel, agency dashboard, WAF. Tier names Agency Starter, Agency Growth and Agency Scale are drafts.
- **Hosting after the first year:** $19/month or $190/year (in the pricing FAQ).
- **Comparison tables** on WordPress, ecommerce, Shopify and articles are built from `prices.json`, "Included" or "—".
- **Staging:** claims about our plans say "Staging-tested updates on the Business plan." Store plans include staging-tested WooCommerce updates. "WooCommerce support" is no longer on Growth; online stores go to the Store plans.
- /blogs/ hidden list and the quote-form coupon box: removal confirmed by the owner.
- /plan-packages-and-costs/, /website-management-packages/, /website-maintenance-services-for-small-business/ and /website-support/: unique content moved, 301s kept.
- 48 blog posts confirmed at the same URL and on /blogs/ against the owner's list of 49.
- Market ranges in articles: $49–$99 entry, $149–$299 mid, $300–$600+ premium; small businesses typically $75–$200/month.
- Annual prices always say "2 months free" (Spanish "2 meses gratis"); the build enforces it.
- Write "Included", not tick icons. "No contract. Cancel anytime."
- Form-only payment: no checkout on the site. Plan buttons open a form (name, email, website URL, platform, message, plan pre-selected), then Formspree, a thank-you page, and manual payment after a call.
- Hash plan links: `/get-a-free-quote/#essential`, `#growth`, `#business`, `#growth-design`, `#starter-seo` and so on. Never link to `?plan=`, `?package=` or `?industry=`. Old query URLs get no redirect.

**Claims (CLAIMS-AND-DESIGN.md section A, applied sitewide)**
- Numbers: see "Owner decisions (2026-11-02)".
- Years, star ratings, review counts and all testimonials removed. "John Doe" and "Trusted by 500+" removed from `/contact/`.
- "We work US & UK business hours."
- **Promises allowed, and no others:** (1) "If we can't clean your hacked site, you don't pay." (2) Malware: free re-clean if reinfected within 30 days. (3) Migration: free fix within 30 days if something we moved breaks. (4) Repair: "No fix, no fee: we check your site and quote before we start. If we can't fix the issue, you don't pay. (Excludes problems caused by your hosting provider's outage or by third-party services we don't control.)" The build fails on the removed wording.
- Portfolio block and "Client words" stay empty until the owner confirms.

**Healthcare**
- No HIPAA compliance or certification claim anywhere; the build enforces it. Risk lines on the hacked recovery page stay.
- One note on every page and country (Portuguese on Brazil): "Healthcare websites: patient form submissions go straight to your practice's own secure account — only your team can see them, not us. We don't store patient information on your website."
- Portal line: "Patient & client portals: we build them as a separate, secured system — your marketing website stays free of patient data. Patient portals run on HIPAA-eligible hosting (US) or hosting that meets local privacy law, and we build and maintain them under a signed BAA (US) or data processing agreement (UK, EU, Canada, Australia, Brazil)."
- Booking line: "We connect your practice's booking system to your website, or build a booking feature inside your patient portal."
- "Please don't send patient or health information through this form." under forms on design, redesign, SEO, speed, white-label, backup and malware pages. Not on quote, contact or audit.

**Forms**
- Formspree Free plan (50 submissions a month), one shared ID in `src/data/forms.json`, `form_name` in every submission, honeypot `_gotcha`. `public/forms.js` submits with fetch and opens /thank-you/. With no JavaScript the form posts normally and shows Formspree's page. Setup: `reports/formspree-setup.md`. Test reCAPTCHA with fetch on the first real submission.

**Consent and policies**
- Bottom bar on all pages with Accept and Reject of equal weight and a privacy link; "Cookie settings" in the footer; the choice is remembered. Google Analytics and Clarity load only after Accept, using Google Consent Mode v2 default denied and Clarity consentv2 (`public/consent.js`). CLS stays 0, and the bar does not cover the first-screen button on phones.
- Privacy policy names Formspree, Hostinger (email, confirmed by the owner), Google Analytics, Microsoft Clarity, Netlify and WhatsApp (only if a visitor clicks). Effective Date is set on launch day (`LAUNCH-CHECKLIST.md`).
- Cookie policy names Google Analytics and Clarity. Advertising, marketing and retargeting lines removed because the site has no ad tags; if ads are added later, update the policy and the bar.

**CMS and AI search**
- Sveltia CMS with a fine-grained GitHub token. The owner creates it with a 1-year expiry, and `CMS-GUIDE.md` carries the renewal date.
- No 410: removed pages return 404, with no edge function. Editorial Workflow goes into the small test.
- `robots.txt` allows the named search and AI bots. Training bots allowed (Option A). `llms.txt` skipped for now.

**Working method**
- The owner pushes later. Commit locally after each step.
- No new text goes into pages until the owner chooses design A or B. A plan and approval before each step.

## 3. Open questions waiting for the owner

2. **Portfolio table:** tick client or our project, and may show, in `reports/portfolio-table.md`.
4. **Plan gaps:** answered, see "Owner answers, plans".
5. **Real author:** name, role, photo and bio; also team photos and the founding year.
8. **Items outside section A** (`reports/claims-open-items.md`): result figures, repair stats, agency case cards, certifications, platform badges, people and claims inside images.
9. **Case study:** keep after confirming the facts, or rewrite or noindex.
13. **Semrush "wordpress maintenance" seed export:** optional, could change the WordPress primary.
14. **Git identity:** commits use the name "WMS" and the owner's email. Change before pushing if wanted.
15. **Bing and Organization schema:** Bing Webmaster Tools verification, the IndexNow key in Netlify, and real profile URLs for `sameAs`.

**TODO for the owner (added 2026-11-01):**
- Pricing FAQ drafts to confirm: "we go through the setup with you on your call". Mailbox size and limits are not stated.
- White-label process text still has some old lines to check against Essential level. Update page case studies keep their old claims, with master plan names.
- Some articles still describe staging in general advice, which is not a claim about our plans.


## Homepage merge (owner, 2026-11-03)
- Top of the homepage is the owner's design file (`wms-homepage-design.html`); below it, the old homepage text. Order: top bar, header, hero with quick-quote form, "Find us on" strip, platforms + 5 stats, one bento for what's included, pricing, process, monthly report, case study + review cards, why it matters, explore services, our services, compare, guides, dedicated partner, why choose us, countries, 12 FAQs, GMB, final CTA with form, footer, phone sticky bar.
- "Find us on" badges moved from the footer (all pages) to a scrolling strip under the homepage hero.
- Footer is the owner's dark design on every page; the top bar is on every page.
- "First month free" removed everywhere: plans, country, store and WordPress cards, articles, comparison rows, pricing FAQ. The build fails if it comes back.
- "5.0 rated by our clients" (linked to the Clutch profile) with stars in the hero, and the review cards (placeholders), are allowed on the homepage only (`data-claim-ok`). The build warns until the placeholders are replaced.
- **Waiting on the owner:** 3 real reviews; X and YouTube profile URLs if the footer should show them (only Facebook, LinkedIn and Instagram are real now); my wording changes to the design (see CHANGELOG 2026-11-03).

## Shorter homepage (owner, 2026-11-03)
- 11 sections in main plus GMB and the final CTA, with tabs, "Read more" and "Show all" so no text is lost (parity 0 lines missing). Details in CHANGELOG.
- Owner rule: every page responsive on all desktop, tablet and phone sizes; see DESIGN-QA.md section 0.

## Homepage, 2026-11-04
- "What's included" fits one screen; "Who We Are" and "Why Choose Us" text moved to /about-us/; trust strip under the results; new section order. Details in CHANGELOG.

## WordPress plans page, 2026-11-05
- Built to the owner's design on branch `wp-plans-page`; not merged. Owner accepted 7,696 px on phones with Compare open; tablet plans are 2 + 1. Waiting for the owner: wording questions (help card title, section labels, hero buttons, stat strip, removed hero card). Details in CHANGELOG.

## Website repair page, 2026-11-05
- Built to the owner's design on branch `repair-page` (based on `wp-plans-page`); not merged. Owner answers applied (No fix, no fee shown; 4-Step heading; repairRange in prices.json; hero button to #quote; real flags; heights within about 10% of the targets accepted). Still held until the owner confirms: 98.4%, 45 min, 0 sites with data loss. Merge order (owner): wp-plans-page first, then repair-page. HowTo schema matches the 4 visible steps. Next pages (hacked, malware, migration): wait until the owner says both branches are merged, then branch from main.

**Later list (owner, 2026-11-02):**
- **LocalBusiness/Organization schema: remind the owner before launch; owner will give the exact details.** Not added yet.
- Testimonials.
- More case studies.
- Full portfolio list.
- Social URLs (the footer uses the URLs from the old site's schema until then).
- Google Partner profile link, to link the badge.
- Current number of active client sites.
- How WMS relates to Chrein (owner to explain).
- A possible "Big-agency experience, small-team care" section (owner to confirm which promises are true).
- Real team photos. The stock team photo from the old homepage is left out.
- Review profiles: the owner updates them (New York address, correct founding year). They still show a Dhaka address, and Clutch shows "Founded 2025".
- New logo: the owner sends it later; no logo change until then.
- **Uptime guarantee terms: the owner adds them to the Terms page before launch.** The owner chose to keep "99.9% uptime guarantee" (2026-11-03) and will supply the terms.

**After the owner pushes (not blocking current work):**
- Formspree form ID (`src/data/forms.json`, `default`).
- Confirm the GA4 Measurement ID and Clarity project ID. The site keeps the old site's IDs (`GT-K522B6T8`, `wqnjbhbxww`) unless the owner sends new ones.
- Clarity dashboard consent setting.
- Live consent test: Accept, then confirm data arrives in GA4 and Clarity.
- Portfolio table and case study.
- Real author details.
- Webmail details.
- Netlify redirect tests.

## 4. Next steps

1. Owner approves the screenshots. Then apply the design to all templates (homepage first), including the badge block removal.
2. Write new text after that.
3. Steps 3 to 6 of the work order, each with a plan and approval.
4. Keep every template change passing: `npm run build`, `npm run parity`, `node scripts/test-build-checks.mjs`, `node scripts/test-browser-features.mjs`, `node scripts/link-report.mjs`.
5. Owner creates the private GitHub repo, pushes, and connects Netlify. Steps were given earlier in this project; no custom domain and no DNS change.
6. Run the Netlify-only tests in `reports/netlify-only-tests.md`, then install the CMS and write `CMS-GUIDE.md`.
7. Run parity against the preview, then preview QA and owner approval.
8. Launch with `LAUNCH-CHECKLIST.md`; the owner changes DNS. Monitor for 6 weeks, and change the malware article title once the service page has impressions.
