# Gap audit (batch 3, 2026-11-10)

Method: reading files only (source, content, the last `dist/`, prompt files), as ordered: no screenshots, tests or design checks. Scripts used to read: `scripts/seo/gap-scan.mjs` (reads dist), `rg`, `scripts/seo/xlsx-to-csv.mjs` (the fix plan workbook).
Status words: **done**, **partly**, **missing**, **done wrongly**, **decided** (owner decision, leave), **later** (rule: phase 2).

## 1. Cannibalization implementation lists
The PDF (`plan-files/wms-cannibalization-implementation-lists.pdf`) stores its text as encoded glyphs and no PDF tool is installed, so it could not be read; the same lists are in `plan-files/wms-cannibalization-fix-plan.xlsx` (Action Plan, Query Map, Page Pairs), audited here.

| Action plan row | Status | Evidence |
|---|---|---|
| Merge + 301 /plan-packages-and-costs/ → packages page | done | dist/_redirects `/plan-packages-and-costs/ /monthly-website-maintenance-packages/ 301`; content moved by scripts/lib/merged-pages.mjs |
| Merge + 301 /website-management-packages/ → packages page | done | same; MANAGEMENT_SECTIONS in merged-pages.mjs |
| Merge + 301 /website-maintenance-services-for-small-business/ → small business page | done | _redirects; SMALL_BUSINESS_SECTIONS |
| Merge + 301 /website-support/ → /website-support-services/ | done | _redirects |
| Merge + 301 /home/ → / | done | _redirects |
| Fix no-slash URLs (/about-us, /contact, /works, …) | done (Netlify) | no line in _redirects: Netlify's pretty-URL rule sends `/about-us` to `/about-us/` (301); listed in reports/netlify-only-tests.md, to confirm on the preview |
| Strengthen owner: / ("Website Maintenance Services" in title) | done | title "Website Maintenance Services \| Keep Your Website Fast & Secure" (Tier A, live title) |
| Strengthen owner: /monthly-website-maintenance-packages/ | done | title "Website Maintenance Packages: Plans from $79/mo \| WMS", H1 "Website Maintenance Packages, Plans & Pricing" |
| Strengthen owner: /wordpress-website-maintenance-packages/ | done | batch 1 WordPress plans page; title "WordPress Maintenance Packages & Plans \| WMS" |
| Re-scope /best-website-maintenance-for-small-business/ | partly (Tier A) | title kept as live ("…Packages & Pricing 2026"), removing "packages" is a phase 2 title test (snippets.csv phase2_title) |
| Re-scope /how-much-does-website-maintenance-cost/ (no "packages" in title/H1) | done | title / H1 "How Much Does Website Maintenance Cost? (2026 Guide)" |
| Re-scope /how-much-does-wordpress-website-maintenance-cost/ | done (title) / partly (old price) | no "packages" in title; the live title still says "($95–$395/mo)" (Tier A: kept, proposal) |
| De-optimize /best-website-maintenance-companies/ (homepage terms in H2s) | later | H2s still say "Best Website Maintenance Company…"; batch 2 rule 10: wait 4–6 weeks after the owner page ranks |
| De-optimize /how-long-…/, /website-maintenance-checklist/ | later | same rule |
| De-optimize /contact/ (plain "Contact Us") | done | title "Contact Us: Website Help from Our Team \| WMS", H1 "Contact Us" |
| Separate country pages (country name in title and H1) | done | e.g. "Website Maintenance Services Netherlands: from €69/mo", H1 "…in the Netherlands" |
| Separate WP Buffs vs SiteCare (link between them) | done | each links to the other in dist |
Query Map and Page Pairs: the owner pages above own their queries; the "remove phrase from title/H1/headings" steps on competing pages are the phase 2 list (later).

## 2. Phase 4 leftovers
| Item | Status | Evidence |
|---|---|---|
| Old price lines (reports/old-price-lines.md) | partly → fixed where allowed | the report now lists 1 line (malware $249, approved live price). In content: `/wordpress-site-hacked-what-to-do/` "$95/mo Prevention via maintenance" (Tier C): fixed to $79/mo. Tier A: `/how-much-does-wordpress-website-maintenance-cost/` "$95–$395" (title + stat) and `/best-website-maintenance-for-small-business/` "$95+" stat: proposals only |
| Content moved from merged pages | done | scripts/lib/merged-pages.mjs (PLAN_FAQS, MANAGEMENT_SECTIONS, SMALL_BUSINESS_SECTIONS) applied by service-prices.mjs |
| Body H2/H3 secondary-keyword edits | partly | content-gaps.csv: 211 "secondary keyword not on the page" rows. Heading changes on ranking pages are risky; proposals, not applied (see removal-proposals.md / additions.md) |
| Service-page section order | done | ServicePage.astro (20 pages) follows SERVICE-TEMPLATE-SPEC order as written in the batch 2 prompt |
| Old feature rows in comparison tables | done | free hosting / free email rows dropped (text-edits '*' dropRow); no "Free hosting" outside the redesign page |

## 3. Internal link hub
| Item | Status | Evidence |
|---|---|---|
| No orphan pages | done | gap-scan: every real page has an inbound body link |
| No link to a redirecting URL | done | the only hits are `/` query-string rules (`/ p=1012 …`), not page links |
| Related blocks on service pages and articles | done | ServicePage "Related services" (with the owner pages); Article "Related articles" |
| No exact-match anchor to a non-owner page | partly | byline fixed on 39 articles (8 Tier A as proposal); backup page anchor "ongoing website maintenance services" → packages page: proposal (owner yes needed) |
| Anchors vs backlink anchors | done | link-notes.md table |

## 4. Header, footer, menu
| Item | Status | Evidence |
|---|---|---|
| No phone in header | done | header has no number |
| No phone in footer | **done wrongly (owner decision needed)** | footer contact card on every page shows "+1 212-496-1637" and "14 Wall St Ste 2036, New York" (Base.astro / footer.json). The rule says no phone in the footer and NAP on the homepage only, and also "header and footer are never touched": listed, not changed |
| NAP only on the homepage | done wrongly (listed) | the same footer card = 89 pages besides the homepage |
| Services menu: every real service page, no broken link | done | check-build "menu" rule (all header/mobile menu links exist) |
| Footer "Cookie policy" link | done | Base.astro |
| No top bar, no cookie bar | done | check-build rules `topbar`, `cookie-bar` |

## 5. Text and wording scan (`rg`)
| Text | Status | Evidence |
|---|---|---|
| "on Clutch" | done in site content; fixed in docs | none in src/; `plan-files/batch-2/00-START-HERE-HANDOFF.md` (3 lines) changed to "5.0 rated by our clients". SERVICE-TEMPLATE-SPEC.md, CLAUDE-CODE-APPLY-PROMPT.md and service-template/index.html are not in the repo (only in Downloads/service-template.zip): not changed |
| "First month free", "Engineers online now", "Trusted by 500+", "30+ websites", countdowns | done | none in src/ |
| "John Doe" | done wrongly → fixed | 8 form placeholders "e.g. John Doe" (design, redesign, white-label, malware, speed ×2, SEO, partner): now "Your name" (wireForms) |
| "Free hosting" / "2 free email" outside the redesign page | done | none in src/content outside the redesign page |
| "Dhaka", "+880" | done | none |
| "Bangladesh" | partly | the four allowed general-info posts (best CDN, best hosting, buy a domain, what is a domain) + **/works/: a client domain "bangladeshcityhospital.com"** in the portfolio list → removal-proposals.md (not removed) |

## 6. Social images and meta
| Item | Status | Evidence |
|---|---|---|
| og:title on every page | done wrongly → fixed | missing on /website-migration-services/ (the old one was cleaned of a claim to empty); Base.astro now falls back to the page title for og:title |
| og:description, og:image | done | present on all 90 real pages |
| twitter:card | done | present |
| twitter:image | missing → fixed | missing on all 90; Base.astro now sets it from og:image |
| Per-page 1200×630 images | partly | every page has an og:image (featured image), 26 pages use the brand logo as og:image; nothing was "missing", so none generated (rule: set og:image only where missing) |

## 7. Schema (built JSON-LD)
| Item | Status | Evidence |
|---|---|---|
| BreadcrumbList | done | all real pages |
| Organization | done | all real pages |
| FAQPage equals the visible FAQ | done | every schema question is visible (quote marks normalised) |
| No AggregateRating / Review | done | none |
| Service on service pages | missing → fixed | missing on redesign, support, backup, partner, Shopify, hacked, malware, WordPress plans, monthly plans; added (name = H1, description = meta, provider = #organization, areaServed = the approved reach list; no Offer) |

## 8. Mobile redesign rules
MOBILE-REDESIGN-PROMPT.md is not in the repo or Downloads: audited against the rules quoted in the batch 3 prompt.
| Rule | Status | Evidence |
|---|---|---|
| 16 px body text | done | site.css body uses `var(--body)` (16 px); smaller sizes are labels and eyebrows only (11–13 px) |
| No sideways swipe except CSS-only auto-moving strips | partly → fixed where allowed | repair page: `.rp-stories` (case stories) and `.rp-cmp-nav` (comparison tabs) scrolled sideways on phones: now stack / wrap. Homepage `.hp-swipe` (Tier A): not changed, proposal. Migration `.mg-marquee` is the allowed auto-moving strip. Tables scroll inside their own box (allowed) |

## 9. Open pages
| Page | Status |
|---|---|
| /website-malware-scanner/ | decided (stays) |
| /website-hosting-and-maintenance/ | decided (stays an article) |
| Brazil pt-BR labels | decided (owner will get a native review) |

## 10. Other leftovers (reports/TODO.md)
| Item | Status |
|---|---|
| GA4 / Clarity, EU/UK consent, design QA, Lighthouse, screenshots, gallery | owner-blocked (left) |
| Stage 7 polish | done (batch 2c) |
| Old-price images | done (batch 3 part 1) |
| Delete C:\Users\user\wms-old-clone | owner (a folder outside the repo) |
| CMS config (`public/admin/config.yml`) | see Part 3 |
