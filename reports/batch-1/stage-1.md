# Stage 1: global cleanup (branch `global-cleanup`)

Owner brief: BATCH 1, Stage 1 (2026-11-05). Nothing merged, nothing pushed.

## 1A. Top bar removed
- Markup (`<p class="topbar">` and its English and Portuguese texts) removed from `src/layouts/Base.astro`; CSS removed from `src/styles/site.css`. It had no JS.
- The header was already `position: sticky; top: 0`, so no offset was left. The mobile menu takes its top from the header at runtime. Checked: header at 0 px on every page (browser test and design QA); phone sticky bars unchanged.

## 1B. Cookie consent bar removed
Inventory before removal (production build, 94 pages):

| What | Pages | What it does | Cookies / storage |
|---|---|---|---|
| `/consent.js` (removed) | all | showed the bar; after Accept loaded GA4 `GT-K522B6T8` (googletagmanager.com) and Microsoft Clarity `wqnjbhbxww` (clarity.ms) | GA4: `_ga`, `_ga_*`, `_gid`; Clarity: `_clck`, `_clsk`, `CLID`, `MUID` (only after Accept); localStorage `wms-analytics-consent` |
| Consent Mode default (inline, production only) | all | sets ad and analytics storage to "denied" in `dataLayer` | none |
| Theme script (inline) | all | remembers light/dark | localStorage `wms-theme` (not a cookie) |
| Header/footer script (inline) | all | menu, Esc, footer columns, fade-in | none |
| `/forms.js` | 13 form pages | sends the form to Formspree (formspree.io) on submit | none on our domain; Formspree receives the form data on submit |
| 404 page script | 404 | sends a "page not found" event only if GA is loaded | none |
| Quote page and scanner scripts (inline) | 2 | plan hash, URL check | none |
| Fonts | all | Inter, self-hosted (`/fonts/`) | none |
| Images from other hosts | 1 page | a YouTube thumbnail from `img.youtube.com` | a request to Google when that page loads |
| Embeds / iframes | none | | |

Removed: the bar markup, its CSS, `public/consent.js` (the tag loader and its localStorage code) and the phone layout rule made for the bar.
Kept: the Privacy policy page and its footer link; the Consent Mode default (it sets nothing). The footer is unchanged, so the "Cookie settings" button is still there but now opens nothing (owner decision).

**After this change no script sets a cookie without consent, because no analytics script loads at all.** GA4 and Clarity were loaded only by `consent.js` after Accept; with the bar gone they never load, so analytics data stops until the owner decides how consent should work. The only storage left is `wms-theme` in localStorage (a display preference, not a cookie). For visitors in the UK, EU, Canada, Australia and Brazil the site now sets no tracking cookies; a YouTube thumbnail on one page and Formspree on form submit are the only third-party requests.

## 1C. Free hosting and the 2 free email accounts: only with a redesign
The redesign page (`/website-redesign-services/`) has no free hosting or free email text today, so nothing was kept there and nothing was added. Every other mention was removed.

Content rules live in `scripts/lib/text-edits.mjs`. `migrate-content.mjs` applies them to the body, meta, social and schema strings, and again to the finished Markdown, so later migration steps cannot bring the text back. Every page-scoped rule must be used, or the migration stops.

Code and data (not content):
- `src/data/prices.json`: "Free hosting for the first year" and "2 free webmail accounts" removed from every plan list (12). `scripts/build-country-prices.mjs` no longer adds them (`OFFERS = []`).
- `src/data/features.json`: the "Hosting and email" group (2 rows) and their two explanations removed.
- `src/lib/home.ts`: final CTA tick "Free hosting for the first year" removed; plans line "Plans from $79/mo · Free hosting for 1 year · No contract" → "Plans from $79/mo · No contract"; pricing intro "Every plan includes free hosting for the first year and 2 webmail accounts. Pay yearly and get 2 months free." → "Pay yearly and get 2 months free."; compare row "Free hosting & email | First year | No | No" removed; bento card "Free hosting + 2 webmail" removed (its list item "Hosting Services" moved to the Uptime card).
- `src/components/templates/Pricing.astro`: FAQs "What happens after the first year of free hosting?" and "What do the webmail accounts include?" removed (the paid "$19/month or $190/year" stays in the page's own FAQ); hero card items "Free hosting for the first year" and "2 free webmail accounts" removed.
- `src/components/templates/Service.astro`: "Plans from $79/mo · Free hosting for 1 year · No contract" → "Plans from $79/mo · No contract" (also the Spanish and Portuguese lines); "Store plans from $199/mo · Free hosting for 1 year · No contract" → "Store plans from $199/mo · No contract".
- `src/components/service/PriceCards.astro` (repair page strip): same shortening.
- `src/layouts/Base.astro`: top bar "Free hosting for 1 year on every plan · Free website check · No contract" removed with the bar (1A).
- `src/lib/wp-plans.ts`: the plans page comparison has 15 rows now (was 17).

Content changes, page by page (generated from `git diff main -- src/content`): see "Offer text removed" below.

Kept (not the free hosting/email offer; owner to check):
- "2 months free" on yearly plans (19 pages).
- "Free migration with any annual plan" (pricing and migration pages).
- "Free website check", "free website audit", "free quote", "free scan", "free initial diagnosis", "free website review", "free store audit", "free speed audit", "free instant audit", "free PDF checklist".
- Paid hosting: "Hosting is $19/month or $190/year." (pricing page FAQ, now "Yes. Hosting is $19/month or $190/year.").
- Not sure, kept and listed: "one month of free maintenance after launch" and "free maintenance to start" (`/caribbean-taxi-transport-website-guide/`); "free daily backups" (`/best-wp-buffs-alternatives/`); "free website maintenance" (4 pages, in "free website maintenance audit/quote").
- Not a WMS offer (about other companies): "free web hosting", "free email", "free website hosting" in the hosting and CDN guides.
- "Hosting included" claims without "free" (owner to decide): the comparison posts say WMS plans include or bundle hosting (`/best-fixrunner-alternatives/`, `/best-wp-buffs-alternatives/`, `/sitecare-alternative/`; `/how-much-does-website-maintenance-cost/` "Shopify … (hosting included)"). The SiteCare post's "Round 2 — Hosting" and "Round 3 — Free Extras", and the cost charts ("$79" next to competitors' "+ hosting" prices), were built on the free hosting offer; their winners and the verdict need the owner's own wording.

## 1D. Services menu
Every service page, from the footer Services group, the homepage service list and the page collection (no invented pages):

| Group | Links |
|---|---|
| Maintenance | WordPress maintenance, Ecommerce maintenance, Shopify maintenance, Website support, Website updates, Website backup |
| Fix and security | Website repair, Hacked site recovery, Malware removal, Website speed optimization |
| Build and grow | Website migration, Website SEO, Website design, Website redesign |
| Partners | White-label services, Partner program |

- Desktop (above 1080 px): a 3-column dropdown (Maintenance | Fix and security + Partners | Build and grow) with group titles, kept inside the window.
- Tablet and phone: inside the existing mobile menu, "Services" is a closed accordion with the same groups; links 48 px tall; the menu scrolls inside the screen and the page behind stays locked (unchanged behavior).
- Keyboard: `<details>`/`<summary>`; the existing header script now keeps `aria-expanded` on both "Services" buttons and returns focus to "Services" on Esc; visible focus ring.
- Logo, other menu items, theme toggle and "Get a free quote" unchanged.
- Screenshots: `reports/batch-1/stage-1/header-sheet-{390,768,1440}.png` (light closed, light open, dark closed, dark open).

## Checks changed
- `scripts/check-build.mjs`: removed the rule that country pages must show the free hosting/webmail offers; "cookie bar is missing" replaced by "the removed cookie bar is back"; new "the removed top bar is back"; new `free-offer` rule (fails on free hosting/free webmail text on any page except the redesign page); new `menu` rule (fails if a header or mobile menu link has no page).
- `scripts/test-build-checks.mjs`: "Cookie bar missing" replaced by "Cookie bar back"; new cases "Top bar back", "Free hosting offer", "Broken menu link".
- `scripts/test-browser-features.mjs`: the 6 consent tests (bar, Accept, Reject, Cookie settings) replaced by: no cookie bar and no consent script; no top bar and header at the top; no analytics tag and no cookie; consent default denied; Services menu has 4 groups and 16 links (mobile too); `aria-expanded`; the first-screen button is on the first phone screen.
- `scripts/design-qa.mjs`: the first-screen rule now checks that the cookie bar and top bar are gone and the header is at the top (it measured the cookie bar before).
- `scripts/lib/text-edits.mjs`: rule types `exact`, `drop`, `dropRow`, `sub`; a Markdown pass; a used-rule check. `scripts/lib/faq-approved.mjs`: parity accepts lines changed by these rules.
- `src/styles/repair-page.css`: small-phone hero sizes restored so the hero button stays on the first 360×640 screen (found by the new browser test).

## Results

Checks on the final Stage 1 build:

- Build: 0 failures (93 pages, 8,602 internal links).
- Parity: 815 of 815 URL rows PASS (121 at 200, 680 at 301, 14 at 404), 0 fails.
- Build tests: 27 of 27 PASS. Browser tests: 28 of 28 PASS.
- Design QA: templates 0 problems; all pages phone 0; all pages desktop 2 (the same 2 flags as on main: /website-hacked-recovery-services/ and /wordpress-backup-services/).
- Header screenshots: reports/batch-1/stage-1/.

## Offer text removed (content)

| Page | Where | Old text | New text |
|---|---|---|---|
| /best-fixrunner-alternatives/ | schema |  staging-tested updates and 24/7 emergency fixes on Business — plus 1 year of free hosting, 2 free business webmails, cancel-anytime terms, WhatsApp e … mergency support, and no hidden charges. Because FixRunner charges separately for hosting, the real first-year value difference is significant."}},{" | (offer words removed in the same string) |
| /best-fixrunner-alternatives/ | faqs |  staging-tested updates and 24/7 emergency fixes on Business — plus 1 year of free hosting, 2 free business webmails, cancel-anytime terms, WhatsApp e … mergency support, and no hidden charges. Because FixRunner charges separately for hosting, the real first-year value difference is significant."},{"q | (offer words removed in the same string) |
| /best-fixrunner-alternatives/ | body | …](/) — 12+ years of experience, a 99.9% uptime guarantee, plus 1 year free hosting, 2 free webmails, WhatsApp emergency support, cancel-anytime terms, and no hidden charges. | **The short answer:** FixRunner is a solid, fast-response WordPress support service — great if you mainly want cheap, on-demand emergency fixes. But many site o… |
| /best-fixrunner-alternatives/ | body | \| Entry price \| ~$59/mo + hosting extra \| $79/mo, hosting included (1yr free) \| | \| Entry price \| ~$59/mo + hosting extra \| $79/mo, hosting included \| |
| /best-fixrunner-alternatives/ | body | \| Business email (webmail) \| ✗ Not included \| ✓ 2 free webmails \| | (removed) |
| /best-fixrunner-alternatives/ | body | …nce fee plus typical hosting. Website Maintenance Services includes 1 year of hosting free. | Entry maintenance fee plus typical hosting. |
| /best-fixrunner-alternatives/ | body | $79 (hosting free) | $79 |
| /best-fixrunner-alternatives/ | body | …, the "premium" $79 becomes the *lower* real cost — and that's before counting the 2 free webmails, the cancel-anytime freedom (no 3-month lock-in), and zero hidden add-on charges.… | Once hosting is in the equation, the "premium" $79 becomes the *lower* real cost — and that's before counting the cancel-anytime freedom (no 3-month lock-in), a… |
| /best-fixrunner-alternatives/ | body | …ere [our plans](/monthly-website-maintenance-packages/) shine, with a year of free hosting on top. | **You want a full-service partner and the best total value:** a plan that includes hosting, has no lock-in, and bundles everything under one roof usually wins —… |
| /best-fixrunner-alternatives/ | body | … staging-tested updates and 24/7 emergency fixes on Business — plus 1 year of free hosting, 2 free business webmails, cancel-anytime terms, WhatsApp emergency support, and no hidde… | <details><summary>Is FixRunner a good WordPress maintenance service?</summary><div>Yes — FixRunner is a credible, established provider known for fast one-hour r… |
| /best-website-maintenance-for-small-business/ | body | -   Free hosting for the first year | (removed) |
| /best-website-maintenance-for-small-business/ | body | -   2 free webmail accounts | (removed) |
| /best-website-maintenance-for-small-business/ | body | -   Free hosting for the first year | (removed) |
| /best-website-maintenance-for-small-business/ | body | -   2 free webmail accounts | (removed) |
| /best-website-maintenance-for-small-business/ | body | -   Free hosting for the first year | (removed) |
| /best-website-maintenance-for-small-business/ | body | -   2 free webmail accounts | (removed) |
| /best-website-maintenance-for-small-business/ | body | \| Free hosting for the first year \| Included \| Included \| Included \| | (removed) |
| /best-website-maintenance-for-small-business/ | body | \| 2 free webmail accounts \| Included \| Included \| Included \| | (removed) |
| /best-wp-buffs-alternatives/ | schema |  staging-tested updates and 24/7 emergency fixes on Business — plus 1 year of free hosting, 2 free business webmails, full access, WhatsApp emergency  … support, and no hidden charges. Because WP Buffs charges separately for hosting, the real first-year value difference is significant."}},{" | (offer words removed in the same string) |
| /best-wp-buffs-alternatives/ | faqs |  staging-tested updates and 24/7 emergency fixes on Business — plus 1 year of free hosting, 2 free business webmails, full access, WhatsApp emergency  … support, and no hidden charges. Because WP Buffs charges separately for hosting, the real first-year value difference is significant."},{"q | (offer words removed in the same string) |
| /best-wp-buffs-alternatives/ | body | …et everything a strong maintenance plan should include, **plus 1 year free hosting, 2 free business webmails, full access, WhatsApp emergency support (24/7 emergency fixes on Busin… | **The short answer:** WP Buffs is a solid, well-known WordPress maintenance provider, but many site owners look for an alternative because they want staging-tes… |
| /best-wp-buffs-alternatives/ | body | \| Business email (webmail) \| ✗ Not included \| ✓ 2 free webmails \| | (removed) |
| /best-wp-buffs-alternatives/ | body | \| Entry price \| ~$79/mo + hosting extra \| $79/mo, hosting included (1yr free) \| | \| Entry price \| ~$79/mo + hosting extra \| $79/mo, hosting included \| |
| /best-wp-buffs-alternatives/ | body | …nce fee plus typical hosting. Website Maintenance Services includes 1 year of hosting free. | Entry maintenance fee plus typical hosting. |
| /best-wp-buffs-alternatives/ | body | $79 (hosting free) | $79 |
| /best-wp-buffs-alternatives/ | body | …remium" entry price becomes the *lower* real cost — and that's before counting the 2 free business webmails, and the fact that there are no hidden add-on charges waiting behind the… | Once hosting is in the equation, the "premium" entry price becomes the *lower* real cost — and that's before counting the fact that there are no hidden add-on c… |
| /best-wp-buffs-alternatives/ | body | …ere [our plans](/monthly-website-maintenance-packages/) shine, with a year of free hosting on top. | **You run a small business or brochure site:** prioritise staging-tested updates, reliable backups, security, and honest pricing over big enterprise features yo… |
| /best-wp-buffs-alternatives/ | body | … staging-tested updates and 24/7 emergency fixes on Business — plus 1 year of free hosting, 2 free business webmails, full access, WhatsApp emergency support, and no hidden charges… | <details><summary>Is WP Buffs a good WordPress maintenance service?</summary><div>Yes — WP Buffs is a well-established, reputable provider offering weekly updat… |
| /caribbean-taxi-transport-website-guide/ | schema | ebsite?","acceptedAnswer":{"@type":"Answer","text":"We include a full year of free hosting, two free business webmail addresses on your own domain, fu | (offer words removed in the same string) |
| /caribbean-taxi-transport-website-guide/ | faqs | included when you build my transport website?","a":"We include a full year of free hosting, two free business webmail addresses on your own domain, fu | (offer words removed in the same string) |
| /caribbean-taxi-transport-website-guide/ | body | Notice the pattern: **free hosting, free webmail, full access in your hands, free maintenance to start, and real 24/7 support includ… | Notice the pattern: **full access in your hands, free maintenance to start, and real 24/7 support including weekends and WhatsApp emergencies.** Everything the … |
| /caribbean-taxi-transport-website-guide/ | body | … when you build my transport website?</summary><div>We include a full year of free hosting, two free business webmail addresses on your own domain, full hosting and site access tha… | <details><summary>What should a taxi or transport website include?</summary><div>At minimum: a mobile-first design, an obvious way to book or request a ride, cl… |
| /caribbean-taxi-transport-website-guide/ | body | …you or scrolling to the next result. And with us it comes with 1 year free hosting, 2 free webmails, full access, and 24/7 support — weekends and WhatsApp included. Get a free quot… | A fast, mobile-first, booking-ready website that you fully own is the difference between a tourist choosing you or scrolling to the next result. And with us it … |
| /how-much-does-website-maintenance-cost/ | body | -   Free hosting for the first year | (removed) |
| /how-much-does-website-maintenance-cost/ | body | -   2 free webmail accounts | (removed) |
| /how-much-does-website-maintenance-cost/ | body | -   Free hosting for the first year | (removed) |
| /how-much-does-website-maintenance-cost/ | body | -   2 free webmail accounts | (removed) |
| /how-much-does-website-maintenance-cost/ | body | -   Free hosting for the first year | (removed) |
| /how-much-does-website-maintenance-cost/ | body | -   2 free webmail accounts | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | -   Free hosting for the first year | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | -   2 free webmail accounts | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | -   Free hosting for the first year | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | -   2 free webmail accounts | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | -   Free hosting for the first year | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | -   2 free webmail accounts | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | \| Free hosting for the first year \| Included \| Included \| Included \| | (removed) |
| /how-much-does-wordpress-website-maintenance-cost/ | body | \| 2 free webmail accounts \| Included \| Included \| Included \| | (removed) |
| /sitecare-alternative/ | description | parison for 2026. See how Website Maintenance Services wins on price, free hosting, flexibility, support, and verified trust — round by round. | (offer words removed in the same string) |
| /sitecare-alternative/ | social | parison for 2026. See how Website Maintenance Services wins on price, free hosting, flexibility, support, and verified trust — round by round. | (offer words removed in the same string) |
| /sitecare-alternative/ | schema | parison for 2026. See how Website Maintenance Services wins on price, free hosting, flexibility, support, and verified trust — round by round. … parison for 2026. See how Website Maintenance Services wins on price, free hosting, flexibility, support, and verified trust — round by round. … y tier, yes — Website Maintenance Services starts at $79/month with a year of hosting included free, while SiteCare's reported plans run roughly  … ything. Website Maintenance Services goes further by including a full year of hosting free."}},{"@type":"Question","name":"Does SiteCare require  … same full-service, hosting-included care at a lower entry price, plus free hosting for a year, free webmails, and cancel-anytime flexibility.  | (offer words removed in the same string) |
| /sitecare-alternative/ | faqs | y tier, yes — Website Maintenance Services starts at $79/month with a year of hosting included free, while SiteCare's reported plans run roughly  … ything. Website Maintenance Services goes further by including a full year of hosting free."},{"q":"Does SiteCare require a long-term contract?", … same full-service, hosting-included care at a lower entry price, plus free hosting for a year, free webmails, and cancel-anytime flexibility.  | (offer words removed in the same string) |
| /sitecare-alternative/ | body | \| Hosting included \| ✓ Yes \| ✓ Yes — 1 year free \| | \| Hosting included \| ✓ Yes \| ✓ Yes \| |
| /sitecare-alternative/ | body | \| Free business webmail \| ✗ Not included \| ✓ 2 free webmails \| | (removed) |
| /sitecare-alternative/ | body | Both include hosting — a genuine strength they share. The tiebreaker: Website Maintenance Services includes a full **year of hosting free**, a concrete first-year savin… | Both include hosting — a genuine strength they share. |
| /sitecare-alternative/ | body | Beyond hosting, Website Maintenance Services throws in 2 free business webmails. These aren't standard with SiteCare, and they add real value on day one. | (removed) |
| /sitecare-alternative/ | body | …aintenance Services comes in lower at the entry tier while offering a year of hosting free on top: | Both include hosting, so this is an apples-to-apples price comparison — and Website Maintenance Services comes in lower at the entry tier: |
| /sitecare-alternative/ | body | $79 + 1yr free hosting | $79 |
| /sitecare-alternative/ | body | …y tier, yes — Website Maintenance Services starts at $79/month with a year of hosting included free, while SiteCare's reported plans run roughly $99–$299/month. Both bundle hosting… | <details><summary>Is SiteCare a good WordPress maintenance service?</summary><div>Yes — SiteCare is a respected, premium full-service provider that bundles host… |
| /sitecare-alternative/ | body | …, fully managed care as SiteCare — at a more accessible price, with a year of free hosting, free webmails, WhatsApp emergency support, and no lock-in. See it line-by-line. | The same hosting-included, fully managed care as SiteCare — at a more accessible price, with WhatsApp emergency support, and no lock-in. See it line-by-line. |
| /ecommerce-website-maintenance-packages/ | body | -   Free hosting for the first year | (removed) |
| /ecommerce-website-maintenance-packages/ | body | -   2 free webmail accounts | (removed) |
| /ecommerce-website-maintenance-packages/ | body | -   Free hosting for the first year | (removed) |
| /ecommerce-website-maintenance-packages/ | body | -   2 free webmail accounts | (removed) |
| /ecommerce-website-maintenance-packages/ | body | -   Free hosting for the first year | (removed) |
| /ecommerce-website-maintenance-packages/ | body | -   2 free webmail accounts | (removed) |
| /ecommerce-website-maintenance-packages/ | body | \| Free hosting for the first year \| Included \| Included \| Included \| | (removed) |
| /ecommerce-website-maintenance-packages/ | body | \| 2 free webmail accounts \| Included \| Included \| Included \| | (removed) |
| /monthly-website-maintenance-packages/ | body | Yes. Every plan includes free hosting for the first year. After that, hosting is $19/month or $190/year. | Yes. Hosting is $19/month or $190/year. |
| /website-maintenance-services-for-australia/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-australia/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-australia/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-australia/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-australia/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-australia/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-brazil/ | body | -   Hospedagem grátis no primeiro ano | (removed) |
| /website-maintenance-services-for-brazil/ | body | -   2 contas de webmail grátis | (removed) |
| /website-maintenance-services-for-brazil/ | body | -   Hospedagem grátis no primeiro ano | (removed) |
| /website-maintenance-services-for-brazil/ | body | -   2 contas de webmail grátis | (removed) |
| /website-maintenance-services-for-brazil/ | body | -   Hospedagem grátis no primeiro ano | (removed) |
| /website-maintenance-services-for-brazil/ | body | -   2 contas de webmail grátis | (removed) |
| /website-maintenance-services-for-canada/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-canada/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-canada/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-canada/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-canada/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-canada/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-france/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-france/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-france/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-france/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-france/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-france/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-ireland/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-ireland/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-ireland/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-ireland/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-ireland/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-ireland/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-netherlands/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-netherlands/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-netherlands/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-netherlands/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-netherlands/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-netherlands/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-spain/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-spain/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-spain/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-spain/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-spain/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-spain/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-switzerland/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-switzerland/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-switzerland/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-switzerland/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-switzerland/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-switzerland/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-uk/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-uk/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-uk/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-uk/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-uk/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-uk/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-usa/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-usa/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-usa/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-usa/ | body | -   2 free webmail accounts | (removed) |
| /website-maintenance-services-for-usa/ | body | -   Free hosting for the first year | (removed) |
| /website-maintenance-services-for-usa/ | body | -   2 free webmail accounts | (removed) |
| /wordpress-website-maintenance-packages/ | body | -   Free hosting for the first year | (removed) |
| /wordpress-website-maintenance-packages/ | body | -   2 free webmail accounts | (removed) |
| /wordpress-website-maintenance-packages/ | body | -   Free hosting for the first year | (removed) |
| /wordpress-website-maintenance-packages/ | body | -   2 free webmail accounts | (removed) |
| /wordpress-website-maintenance-packages/ | body | -   Free hosting for the first year | (removed) |
| /wordpress-website-maintenance-packages/ | body | -   2 free webmail accounts | (removed) |
| /wordpress-website-maintenance-packages/ | body | \| Free hosting for the first year \| Included \| Included \| Included \| | (removed) |
| /wordpress-website-maintenance-packages/ | body | \| 2 free webmail accounts \| Included \| Included \| Included \| | (removed) |
