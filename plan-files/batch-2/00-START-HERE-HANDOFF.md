# WMS (websitemaintenanceservices.org): full project handoff

> **Owner note (Banglish):** Ei file ta notun Claude ke prothome dao. Bolo: "Read 00-START-HERE-HANDOFF.md first, then the other files in this folder. Follow every rule in it." Sob decision, plan, design, SEO r baki kaj ekhane ache.

Last updated: 2026-11-04. Written by the previous Claude session that worked with the owner from 2026-10-27 to 2026-11-04.

---

## 0. How to work with this owner (read first)

1. **The site is LIVE and ranking.** Before changing or removing ANY content, title, H1, URL, price or claim, **ask the owner first**. Never remove anything without asking.
2. **No invented facts.** No made-up stats, testimonials, reviews, client names, awards, case studies or prices. Use only the facts in section 3. If something is missing, ask.
3. **Zero SEO risk.** The owner wants to stay #1 on Google and never get hit by keyword cannibalization. Choose the zero-risk option every time. If it's a close call, explain the risk and ask.
4. **100% responsive on every device:** all desktops, laptops, tablets and phones. Test at 360, 390, 768, 1024, 1280 and 1440 px, in light and dark theme. No horizontal scroll, no squeezed text, no broken words, tap targets ≥ 44px.
5. **Design taste:** modern, premium, conversion-focused. The owner dislikes plain, "2010-style" pages. Pages must make visitors want to buy and not leave.
6. **Language:** the owner writes in Banglish (Bangla in Latin letters). Reply in short, clear Banglish. Keep code, prompts and site copy in English.
7. **Plan → approve → do.** For big work, show a short plan, wait for approval, then build and show evidence: screenshots, test output and counts.
8. Never touch the live WordPress site, DNS or email. Secrets never go in chat or files.

---

## 1. Project in one paragraph

websitemaintenanceservices.org (brand **WMS**, "Website Maintenance Services") is a website maintenance/support agency site. It currently runs on WordPress + Elementor. It is being **rebuilt as a static Astro site on Netlify** by Claude Code on the owner's Windows PC (`C:\Users\user\wms-rebuild`). The rebuild must keep every URL and fix keyword cannibalization. The rules for Claude Code are in `CLAUDE.md`, `SEO-GUARDRAILS.md`, `CMS-REQUIREMENTS.md`, `CLAIMS-AND-DESIGN.md`, `DESIGN-QA.md`, `PROMPTS.md` and `LAUNCH-CHECKLIST.md`. These copies are in this folder; Claude Code's local copies may be newer.

---

## 2. Current status (from Claude Code's last reports, Nov 1–2)

All work is in **local git commits only**. Nothing is pushed, nothing is deployed, and the live site is untouched.

| Phase | Status |
|---|---|
| 0 Setup | Done: Astro static, `trailingSlash: always`, sitemap, content collections |
| 1 Crawl | Done: 817 URLs, 96 real pages, 919 upload files |
| 2 URL map | Done: `url-map.csv`, 815 rows (121 at 200, 680 at 301, 14 at 404). 0 chains, 0 missing targets |
| Keyword map | Approved and applied to titles + H1s on 92 pages. **Body heading/secondary keyword edits NOT done** |
| 3 Design | All templates built. The new homepage design (section 7) was rolled to all 11 templates. Commit `3c4cf43` |
| 4 Build pages | 92 pages + /thank-you/. **Not done:** old prices on some pages, moving content from merged pages, body keyword edits, service-page section reorder |
| 5 Parity | Local passes 815/815. The live-vs-preview run waits for deploy |
| Redirects | 246 path rules, 97 query rules, 1 feed rewrite; 18 failure tests pass |
| 6 Preview QA | Not started: the owner must create a private GitHub repo, push, and connect Netlify (no custom domain, no DNS change) |
| CMS | Sveltia CMS planned (GitHub fine-grained token, 1-year expiry), not installed |
| 7 Launch / 8 Monitor | Not started |

Latest Claude Code Lighthouse mobile scores: home 100/100, pricing 100/100, service 99/98, blog 99/100, CLS 0.

Read `claude-code-reports/` (Claude Code's own reports, in date order) for detail. The latest full STATUS is `2026-11-01_18-02_c4c62a42.txt`. Later changes are in `2026-11-02_00-08_849b3eae.txt` (the owner's instruction) and `2026-11-02_15-25_f298fdcc.txt` (the result).

---

## 3. Company facts and approved claims (the ONLY facts to use)

- **Brand:** "Website Maintenance Services" / **WMS**. Title suffix: `| WMS`.
- **Experience:** 12+ years. No founding year anywhere.
- **Stats:** 650+ websites maintained, 120+ websites built, 70+ migrations, 190+ redesigns.
- **Reach line:** "650+ websites maintained and 120+ built for businesses in the USA, Canada, the UK, Australia, the Netherlands, Ireland, France, Spain, Switzerland and the Caribbean."
- **Confirmed TRUE by the owner:**
  - "+142% Growth"
  - "Page 1 Top 3"
  - "98/100 Passed" and "99/100 Passed"
  - "Expert Developers: Certified, experienced team"
  - "Certified, Experienced, Trusted."
  - Altitude Care case study numbers: page load 4.8s → 1.9s, security none → 24/7, downtime often → ~0%, booking form errors → fixed
  - "99.9% uptime guarantee"
  - **Google Partner = yes**
- **Rating:** "5.0 on Clutch". This is the only clean rating, and it rests on 1 review.
- **Guarantee:** "If we can't clean your hacked site, you don't pay." No other guarantees.
- **Hours:** "We work US & UK business hours."
- **NEVER mention** Dhaka, Bangladesh, or the +880 number, and never say which country the team is in.
- **No phone in the header or footer** (owner's rule). The phone appears only in the GMB/NAP block.
- **NAP (must match the verified Google Business Profile exactly):**
  - GBP name: "Chrein - Web Design, Development, Maintenance, Support"
  - Address: 14 Wall St Ste 2036, New York, NY 10005, United States
  - Phone: +1 212-496-1637
  - Email: contact@websitemaintenanceservices.org
  - The GMB/NAP block appears on the **homepage only**. (Claude Code put it on every page earlier. The owner's latest decision is homepage only; confirm before changing.)
- **Removed, do not bring back:** "First month free", "Engineers online now", "Trusted by 500+", "John Doe", fake countdowns, the "30+ websites" line, team stock photo captioned as our team, and "★★★★★ 5-Star Service" without a source.

### Known risks to tell the owner about
- The Clutch, GoodFirms, Sortlist, Techreviewer, C2C Review and Trustpilot profiles still show a **Dhaka/Bangladesh address**, and Clutch says "Founded 2025". The site says New York and 12+ years. Visitors who click "Find us on" see a conflict. **Update the profiles before launch.**
- "99.9% uptime guarantee" may be a legal promise. Check that the Terms page has the conditions.
- 4 blog posts mention Bangladesh as general info (CDN region, .bd domain, Shopify prices), and /works/ links to one client. These were kept because they are not about the company. Ask the owner.

---

## 4. Prices

### Master plans (approved; `src/data/prices.json` in the rebuild)

| Plan | Monthly | Yearly |
|---|---|---|
| Essential | $79/mo | $790/yr |
| Growth (most popular) | $149/mo | $1,490/yr |
| Business | $299/mo | $2,990/yr |

- Yearly = 10× monthly. Always say **"2 months free"** for yearly.
- Every plan includes free hosting for the first year and 2 webmail accounts.
- "No contract. Cancel anytime." Write "Included", not just tick icons.
- **Store plans:**
  - WooCommerce Store Starter $199 / Store Growth $349 / Store Pro $599 (with free hosting + 2 webmail)
  - Shopify Starter $149 / Growth $299 / Pro $499 (no hosting offer)
- **Country pages** use the owner's rounded local-currency prices (Claude Code `reports/country-prices.md`).
- **Payment:** form-only. No checkout. A plan button opens the quote form with the plan pre-selected (hash links like `/get-a-free-quote/#growth`, never `?plan=`). Then a call, then manual payment.

### One-time prices: latest discussion (2026-11-04)

The owner asked for competitor research. Competitor one-time fix prices: FixingWP $39, WP Fix It $47, FixRunner $49 (30 min), WP Small Fix $49, WP Tech Support $79, FixMySite from $99, WPFIXD $129. Hacked cleanup in the market: Wordfence ~$490, agencies $500–$3,000+, Sucuri plans from $199.99/yr.

| Item | Status |
|---|---|
| **Website repair: "From $49"** | **Owner decided to KEEP $49** (for CTR). Agreed condition: $49 must be a real tier, a "small fix" (one issue, ~1 hour of work). Bigger issues get a fixed quote before work starts. Suggested copy: *"Small fixes from $49 · Bigger issues get a fixed quote before we start · Most fixes within 24 hours."* |
| Turnaround | Use "Most fixes within 24 hours", not "usually same day". Proposed; confirm with the owner. |
| Hacked cleanup | Currently **$149** (approved earlier). Claude suggested **$199**. **Owner has NOT confirmed. Ask.** |
| Speed optimization | Suggested "from $199". **Not confirmed. Ask.** |

**Open price items:**
- Service package prices for design, migration, SEO, speed and white-label (Claude Code `reports/service-package-prices.md`)
- White-label: $59/site flat vs $39/site for 6–20 sites. Which one is real?
- Hosting price after year 1: not decided
- 122 old price lines on 10 pages (`reports/old-price-lines.md`)
- Old feature rows in comparison tables

---

## 5. SEO and keyword cannibalization (most important)

### Rules
- **One keyword = one owner URL.** Only the owner page uses that phrase in title/H1/H2/H3. Other pages may mention it in body text and link to the owner with natural anchors.
- **Intent rule:** "best / top / companies / agency" phrases go to the listicle or comparison page. "Services / packages / plans / cost" phrases go to service, pricing or article pages as mapped.
- **Order of fixing:** strengthen the owner page first, **wait 4–6 weeks** until it ranks, THEN de-optimize the competing page. Never de-optimize both at once.
- Fix tools:
  - merge + 301 (only when the content truly duplicates)
  - de-optimize the title/H1/H2/meta of the non-owner page
  - internal links pointing to the owner
- **Do NOT combine noindex + canonical** on one page; it sends mixed signals. Use one or the other.
- **Top-10 rule:** a page already in the top 10 for its primary keyword keeps its current title (plus `| WMS`; updating the year is OK).
- **After launch:** request reindexing in Search Console for changed pages, submit the sitemap, and monitor for 6 weeks.

### Keyword owners (approved)

| URL | Owns |
|---|---|
| `/` | website maintenance services, website maintenance company/agency, web maintenance services. Title/H1: "Website Maintenance Services & Support \| WMS" |
| `/best-website-maintenance-companies/` | best/top website maintenance companies (comparison only) |
| `/best-website-maintenance-for-small-business/` | small business website maintenance |
| `/monthly-website-maintenance-packages/` | website maintenance packages/plans/pricing/monthly. **The single pricing page**; absorbs `/plan-packages-and-costs/` and `/website-management-packages/` |
| `/how-much-does-website-maintenance-cost/` | website maintenance cost |
| `/wordpress-website-maintenance-packages/` | WordPress maintenance services/packages/plans |
| `/how-much-does-wordpress-website-maintenance-cost/` | WordPress maintenance cost |
| `/ecommerce-website-maintenance-packages/` | ecommerce website maintenance |
| `/shopify-website-maintenance-packages/` | shopify website maintenance |
| `/website-support-services/` | website support services |
| Country pages (`/website-maintenance-services-for-usa/` etc.) | "website maintenance services in {country}" |
| `/how-long-does-website-maintenance-take/`, `/website-maintenance-checklist/`, `/best-wp-buffs-alternatives/`, `/sitecare-alternative/` | their own topics only |

Full detail is in `seo-cannibalization/`:
- `wms-cannibalization-fix-plan.pdf/.xlsx`: Action Plan, Query Map, Page Pairs
- `wms-cannibalization-implementation-lists.pdf`: 8 lists covering 301s, expand, remove, titles, H1s, internal links, singular/plural and pairs
- `wms-homepage-cannibalization-fix.pdf`
- `wms-keyword-targets-by-page.pdf` and `wms-keyword-targeting-map.xlsx`

Raw GSC data: `data/gsc/wms-gsc-query-page-last-3-months.csv`.

### Biggest SEO facts
- **Biggest problem:** the listicle `/best-website-maintenance-companies/` competes with the homepage. They share 145 keywords and 21,153 impressions. Fix: strengthen the homepage, then remove homepage phrases from the listicle.
- **Biggest opportunity:** the packages page (was #70) becomes the one pricing page after the merges.
- Ignore "website maintenance package pricing small business" (13,800+ impressions, 0 clicks). It is not real demand.

### Other approved SEO decisions
- `/get-a-free-quote/` and `/free-website-maintenance-audit/`: noindex, follow, out of the sitemap.
- No city pages. Country pages stay.
- Brazil page is in Portuguese (`lang="pt-BR"`). Spain stays in English.
- **Malware:**
  1. Strengthen the malware service page.
  2. Link to it from the malware article.
  3. Only after the service page gets impressions, change the article title. No merge.
- **FAQs:**
  - All 24 approved FAQs are visible on the pages.
  - FAQ schema uses the exact visible question and answer; the build enforces this.
- **robots.txt:**
  - Allows search engines and AI bots, training bots included (Option A).
  - llms.txt is skipped for now.
- Deleted pages return 404 (no 410).
- **Preview safety:** every non-production deploy sends `noindex, nofollow`.
- See `SEO-GUARDRAILS.md` for the other ranking risks: crawling, internal links, Core Web Vitals, E-E-A-T, schema, AI search (GEO/AEO) and launch.

---

## 6. Microsoft Clarity and conversion audit findings

Sources: "wms clarity data.pdf" and "Website Conversion Audit — websitemaintenanceservices.org.pdf". Both were given to Claude Code and are not in this folder. Ask the owner if you need the originals.

- **Homepage scroll depth is only 22–24%.** Put the H1, price ("from $79/mo"), real proof and one main CTA in the first screen.
- **Most dead clicks are on the pricing table's feature and add-on names** (Spam & Bot Protection 369, Care & Protection 256). People want to know what these are. Make each feature expandable, show its price, and write "Included" instead of ✓ only.
- **8–11 CTAs per page now.** Use one main CTA per page type: blog → free audit, hack/error page → "Fix my site", pricing → "Start plan".
- **Remove fake urgency** (resetting countdowns) and conflicting numbers (100+/500+/4,800+).
- **Speed:** desktop LCP was ~28s on the old Elementor site. 12 of 13 form submissions came from desktop, so desktop matters as much as mobile.
- **Audit vs SEO plan conflicts. Resolved in favour of the SEO plan:**
  - Keep the keyword in the H1 and use the audit's line as a sub-headline.
  - Don't cut blog text (parity needs ~95% of the words). Add a quick answer + table of contents and collapsible sections that stay in the HTML.
  - Make sections more compact instead of deleting content.
  - `/monthly-website-maintenance-packages/` stays the pricing page. The audit wanted `/plan-packages-and-costs/`; rejected.

---

## 7. Design

### Homepage design (approved direction)
File: `design/wms-homepage-design.html` (open it in a browser). Screenshots are in `design/`.

**Design system:**
- Inter font
- Purple `#6D28D9` → magenta `#C026D3` gradient, green `#22C55E` for status/ticks
- Light + dark theme via `data-theme`; the choice is saved in localStorage key `wms-theme`
- Rounded cards, soft purple shadows
- Brand icons from simple-icons; Lucide-style inline SVG icons
- Google G / Maps / Business Profile icon stack as hero proof

**Homepage section order (final):**
1. Hero + quick form (H1, ticks, CTAs, Google icon stack "5.0 on Clutch · Google Partner", stats 650+ / 12+ / 120+)
2. Find us on (directory profiles)
3. Platforms + stats
4. What's included (short, one screen)
5. One-line proof strip, directly above pricing
6. Pricing (monthly/yearly toggle)
7. Comparison (tabs)
8. How it works (5 steps)
9. Results + trust strip
10. Services
11. FAQ (only one open at a time; 6 visible + "Show all")
12. Guides + countries
13. GMB/NAP block → final CTA with form → footer

**Header and footer rules:**
- Header: logo, Services dropdown, Pricing, Blog, About, Contact, theme toggle, "Get a free quote". No phone.
- On mobile: hamburger menu plus a sticky bottom "Get a free quote" bar.

**Form fields:**
- Full name; Phone*
- Email*; Website URL
- What do you need?* (select)
- Description* (textarea)
- Formspree free plan via fetch, then redirect to `/thank-you/`, where GA4 counts the conversion. A honeypot field is included.

**Consent:** consent bar with GA4 Consent Mode v2 + Clarity consentv2.

### Service pages
- `SERVICE-PAGE-BLUEPRINT.md` gives the section order for each page type: plan/package, one-time fix, project, country and white-label.
- Designs were made for the WordPress maintenance page:
  - **A:** conversion-first, form in the hero
  - **B:** sticky price sidebar
  - **C:** problem picker
  - **D:** dark hero + sample dashboard
  - **E:** pricing-first + plan finder
- **Recommended final: `design/service-final-recommended.html` (A + C mix).** It has the hero with the form, then the interactive problem picker ("What's happening with your WordPress site?" with 4 tabs, each showing the fix and a recommended plan), then included, proof strip + pricing, compare, steps, case study + risk-free band, FAQ, related services, and final CTA. **The owner has not given final approval yet.**

**Changes the owner asked for that are NOT yet made in the design files:**
1. **Don't over-highlight Altitude Care** (it is one case study of many):
   - Remove it from the proof strip; use "650+ sites maintained · 12+ years · 5.0 on Clutch · No contract" instead.
   - Remove "Example: Altitude Care…" from the problem picker.
   - The Results section becomes a grid/slider of 3–4 case-study cards (industry, problem, before → after) plus totals (120+ built, 70+ migrations, 190+ redesigns).
   - **The owner must send the real case studies.** Don't invent them.
2. Picker "Something broke" text: change to "Small fixes from $49 · bigger issues quoted first · most fixes within 24 hours".
3. Hacked price $149 vs $199, and speed price: waiting for the owner.

**Responsive standard:** test every page at 360, 390, 768, 1024, 1280 and 1440, light and dark. Check:
- no element wider than the viewport
- grids use `minmax(0,1fr)`
- tables either scroll inside their own wrapper or switch to cards on mobile
- the sticky mobile bar never covers the content's last button (add bottom padding)

---

## 8. Open items waiting for the owner

| # | Item |
|---|---|
| 1 | Choose and approve the service page design (recommended: A + C mix) |
| 2 | Real case studies (2–4): client or anonymous label, problem, before → after numbers |
| 3 | Hacked cleanup price ($149 or $199), speed optimization price, repair turnaround wording |
| 4 | Service package prices (design, migration, SEO, speed, white-label $59 vs $39) and hosting price after year 1 |
| 5 | Real directory logos/badges for "Find us on" and real profile URLs |
| 6 | Real testimonials, client avatars, team photos, author name/bio (E-E-A-T) |
| 7 | Social URLs (Facebook, LinkedIn, Instagram) |
| 8 | Update review profiles (Clutch etc.): remove the Dhaka address, fix the founding year |
| 9 | Logo: paused ("logo pore koro"). Rules: no 3 letters joined together; the owner disliked all concepts so far |
| 10 | Schema: LocalBusiness/Organization. The owner will give exact details; remind them before launch |
| 11 | Push to private GitHub → connect Netlify → run `reports/netlify-only-tests.md` → install CMS → parity vs preview → owner approval → launch with `LAUNCH-CHECKLIST.md` (the owner changes DNS) → monitor 6 weeks |
| 12 | Bing Webmaster Tools verification + IndexNow key |
| 13 | Portfolio table: which sites may be shown |

---

## 9. Files in this folder

| File/folder | What |
|---|---|
| `00-START-HERE-HANDOFF.md` | This file |
| `CLAUDE.md` | Main rules given to Claude Code for the rebuild |
| `SEO-GUARDRAILS.md` | Ranking risks besides cannibalization (incl. AI search) |
| `CMS-REQUIREMENTS.md` | Sveltia CMS requirements |
| `CLAIMS-AND-DESIGN.md` | Claims rules + design rules (section 3 here is newer) |
| `DESIGN-QA.md` | Design self-review loop + checklist |
| `PROMPTS.md` | Phase-by-phase prompts for Claude Code |
| `LAUNCH-CHECKLIST.md` | Launch + rollback steps |
| `SERVICE-PAGE-BLUEPRINT.md` | Section order per service page type |
| `url-map.csv` | Old → new URL map (an early copy; Claude Code's final has 815 rows) |
| `design/` | Homepage design + 5 service options + recommended final, with screenshots |
| `seo-cannibalization/` | All cannibalization plans, keyword maps, implementation lists |
| `data/gsc/` | GSC query × page export (3 months) |
| `data/live-platform-and-services-audit.html` | Audit of the live site's platforms/services |
| `claude-code-reports/` | Claude Code's reports to the owner (Bangla/English), in date order |

---

## 10. Suggested first message for the new Claude

> Read 00-START-HERE-HANDOFF.md, then every file in this folder. Follow section 0 rules always. Don't change anything yet. Reply in Banglish with: (1) your understanding of the current status in 5 lines, (2) the open items you need from me, in priority order, (3) your plan for the next step.
