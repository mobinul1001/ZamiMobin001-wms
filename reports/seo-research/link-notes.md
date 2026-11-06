# Link notes (backlinks)

Source: `data/backlinks/` (owner's export, 2026-11-06): top-target-pages.csv (26 pages), top-linking-text.csv (75 anchors), top-linking-sites.csv (53 sites). Script for the internal side: `scripts/seo/anchor-check.mjs` (built site).

## Where the external links go
- **Homepage: 1,188 of the incoming links, from 33 sites.** Most come from a few sites with sitewide (footer/sidebar) links: islamarc.com (696 linking pages), goodfirms.co (303), superbcompanies.com (62), tools.org.ua (50, to 25 pages), stluciantaxiandtours.com (47). The homepage holds almost all link strength, which supports keeping it as the owner of "website maintenance services".
- **Every other page has 1 to 14 links:** best for small business 14 (6 sites), maintenance cost 12 (9), WordPress maintenance cost 11 (8), monthly packages 5 (4), WordPress packages 4 (3), agreement, best companies, ecommerce, checklist 3 each, the rest 1 or 2.
- **Redirected URLs with links** (the link value passes through a single 301 to the final page; checked in url-map.csv and dist/_redirects, no chains):

| Old URL (links) | 301 target | Correct? |
|---|---|---|
| /plan-packages-and-costs/ (6 links, 4 sites) | /monthly-website-maintenance-packages/ | yes: the pricing page that absorbed it (merge in the plan) |
| /website-management-packages/ (2 links, 1 site) | /monthly-website-maintenance-packages/ | yes: same merge |
| /website-maintenance-services-for-small-business/ (2 links, 1 site) | /best-website-maintenance-for-small-business/ | yes: the small-business owner page |
The versions without the trailing slash also go straight to the same targets (url-map.csv rows "no-slash").

## External anchor texts
Mostly brand and URL anchors ("wms", "visit website", "websitemaintenanceservices org", logo alt texts), then the main keywords: "website maintenance services" (and "website maintenance services 2026"), "small business website maintenance", "monthly website maintenance", "monthly website maintenance packages", "website maintenance packages", and year-style anchors for the articles: "10 best website maintenance companies in 2026", "how long does website maintenance take in 2026", "how much does wordpress website maintenance cost in 2026", "website maintenance cost in 2026 how much does it cost".

## Internal anchors vs the external ones (built site, `<main>` links)
| Anchor phrase | Internal links to the owner page | Internal links to another page | Verdict |
|---|---|---|---|
| website maintenance services | 22 pages → / | **47 pages → /about-us/** ("By: Website Maintenance Services", the article byline); 1 page → /monthly-website-maintenance-packages/ ("ongoing website maintenance services", backup page body) | Fights the homepage's main external anchor. Proposal below. |
| small business website maintenance | 5 pages → owner | none | consistent |
| monthly website maintenance (packages) / website maintenance packages | 3 pages → owner | none | consistent |
| website maintenance cost | 14 pages → owner | 1 ("WordPress website maintenance cost" → the WordPress cost page, its own owner) | consistent |
| how long does website maintenance take | 6 pages → owner | none | consistent |
| best website maintenance companies | 7 pages → owner | none | consistent |

## Proposals (not applied: text or template changes need the owner's yes)
1. **Article byline** "By: Website Maintenance Services" links to /about-us/ on 47 articles. The visible brand name is the homepage's main keyword, so 47 internal links tell Google that phrase belongs to /about-us/. Options: (a) keep the text, link the byline to the homepage; (b) keep the link to /about-us/, change the byline text to the short brand "WMS" (the brand used in titles). Recommendation: (b), one change in the article template. Risk of keeping: weak but sitewide anchor conflict; risk of changing: none for rankings (author name only).
2. **Backup page body** "ongoing website maintenance services" → /monthly-website-maintenance-packages/. Recommendation: point it to / (the owner of the phrase) or change the anchor to "ongoing maintenance plans". Text edit, owner's yes needed.
3. Internal anchors for the year-style article anchors already use the article topics; no change needed.
