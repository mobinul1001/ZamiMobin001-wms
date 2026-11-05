# BATCH 2 FINAL: research, CTR-optimized snippets, all remaining pages, zero ranking loss

This file replaces any earlier `BATCH-2-PROMPT.md`. If you already started that one, keep the finished work, read `reports/batch-2/PROGRESS.md`, and continue under this file. Where this file disagrees with an older prompt, this file wins. Nothing is merged and nothing is pushed.

Read first: `00-START-HERE-HANDOFF.md`, `CLAUDE.md`, `SEO-GUARDRAILS.md`, `CLAIMS-AND-DESIGN.md`, `DESIGN-QA.md`, `SERVICE-TEMPLATE-SPEC.md`, `reports/batch-1/FINAL.md`, `STATUS.md`, `url-map.csv`, and the keyword map `seo-cannibalization/wms-keyword-targeting-map.xlsx` (sheets "Page Targets", "Full Keyword Map", "Rules").

## 0. Owner goals (in this order)

1. **Do not lose any current Google position.** The site is live and ranking. Every change is judged first by "can this lower a ranking?".
2. **No keyword cannibalization.** One keyword, one owner page.
3. **Higher click-through rate (CTR).** Positions are fine on several pages but clicks are almost zero (see section 3). Better titles and meta descriptions, with the safety rules below.
4. **Visitors who read the page want to buy.** Conversion design (section 6).
5. **100% responsive on every device**, light and dark.
6. Aim for #1 for each page's own keywords. Nobody can promise a rank: do the work that gives the best chance, and never write ranking promises on the site.

## 1. Work rules (limits)

The owner's Claude usage limit is almost used. Be economical:
- Use scripts (`rg`, node, Playwright) and print short summaries. Do not re-read big files or paste long output.
- One build per page. Commit after each page or each stage step (`feat(<slug>): ...`, `seo(<scope>): ...`).
- Keep `reports/batch-2/PROGRESS.md` current: item, status (done / partly / skipped), commit, open question. If you restart, read it and continue from the first item that is not done. Never redo a done item.
- Do not stop to ask. Take the safest option, continue, and put the question in `reports/batch-2/FINAL.md`.
- Priority if time runs short: stages 1, 2, 3, 4, 5, 6, 8, then 7.

## 2. Hard rules (break one and the work fails)

1. **URLs never change.** No page is created, renamed or deleted. Use `url-map.csv` to know which URLs are real pages (status 200) and which are redirects (301/404). Do not build pages that are redirects. The 815-row parity check must pass.
2. **Nothing is deleted without the owner's yes.** Every existing word, heading, link, FAQ and schema fact stays in the HTML (text parity >= 95%, 0 missing headings). Long text goes into native `<details>` (collapsed but in the DOM). No `display:none` text, no JS-injected text. Text edits go through `scripts/lib/text-edits.mjs` and are listed in the report.
   **If research shows that something should be removed or rewritten for SEO** (for example a duplicate paragraph, a phrase that competes with another page's keyword, thin or off-topic text, an outdated claim): do research first (stage 1), then do NOT remove it. Write it to `reports/seo-research/removal-proposals.md` with: page, exact text or element, why (the data: GSC queries, overlap with which page, intent mismatch), the risk of removing it, the risk of keeping it, and your recommendation (remove / move into `<details>` / rewrite / keep). Keep the text in place until the owner approves in the final report. Moving text into `<details>` is not a removal and is allowed.
3. **Titles, meta descriptions, H1:** the H1 and the URL never change. Title and meta description change only through stage 2 and only by its tier rules (section 3). No other stage touches them.
4. **Approved facts only:** 650+ websites maintained, 12+ years, 120+ websites built, 70+ migrations, 190+ redesigns, "5.0 rated by our clients" (never "on Clutch"), Google Partner certified agency, 99.9% uptime guarantee (only where already on the page). No new stats, testimonials, reviews, client names, awards, logos, guarantees, "no downtime", "guaranteed rankings", "page 1 in X days". No AggregateRating or Review schema.
5. **Prices only from `src/data/prices.json`.** If a price is missing, add a pending value, show no number, and show "Fixed quote after a free check". Master plans $79 / $149 / $299. Confirmed one-time prices: Repair "From $49" (small fix; bigger issues get a fixed quote first), Hacked cleanup $149, Migration $149 (free with any annual plan) / From $399 / From $1,199. Design, SEO, Speed, White-label prices are NOT confirmed: no numbers in titles, metas or pages unless they are already in `prices.json`.
6. **"Free hosting" and "2 free email accounts" only on `/website-redesign-services/`.** Allowed elsewhere: "2 months free on yearly plans", "free migration with any annual plan", free check / quote / audit / scan. No top bar and no cookie bar (removed in batch 1). Header, footer and the final CTA band are never touched.
7. No NAP block (address, phone) on these pages. Never mention Dhaka, Bangladesh, +880 or the team's country. No phone in header or footer.
8. **Adding content for SEO is allowed and expected** (owner decision): new FAQs, new H2/H3 sections, short explainers, comparison tables, definitions. Rules for added content: (a) it must come from the research in stage 1 (GSC question queries, secondary keywords, competitor and "People also ask" gaps), never from guessing; (b) it serves that page's own keywords only, so it cannot create cannibalization; (c) it states only general, correct knowledge about the topic and approved facts, with no invented stats, client stories, testimonials, awards, guarantees or prices; (d) FAQ schema equals the visible FAQ exactly, new FAQs included; (e) long additions go inside `<details>` or accordions so the page height targets still hold; (f) every addition is listed in `reports/seo-research/additions.md` (page, what was added, which keyword or question it targets, the data that justified it) so the owner can review. **No new case study and no new company claims** are still not allowed: those go to the owner questions in the final report.
9. **CSS and markup only.** No new JavaScript beyond the existing theme toggle, quick form and menu. Tabs, accordions and toggles are CSS only.
10. **Keyword ownership:** a page uses its own primary and secondary keywords in H2/H3, body and FAQ. It never uses another page's primary keyword in its title, H1, H2 or H3. Other topics appear only in body text with a natural link to the owner. Do not run the "phase 2" de-optimization steps of the cannibalization plan (removing phrases from competing pages) now: the plan says to wait 4 to 6 weeks after the owner page ranks. List those steps in the report as "later".
11. **Reuse the design that exists.** Use the components and CSS of the finished Repair, Hacked, Malware, Migration, WordPress plans, pricing and homepage pages. Do not invent a new style. If shared parts are trapped in page files, extract them in one small refactor commit and prove the dist of finished pages is byte-identical before and after.

## 3. Stage 1: SEO research and the protection tiers (no page changes)

**Research gate:** no page is built, no title or meta is changed, and nothing is added or proposed for removal until the files below exist. Every addition (new FAQ, section, table) and every removal proposal must point to evidence in these files.

Create `reports/seo-research/`. Use only data that exists: GSC export `data/gsc/wms-gsc-query-page-last-3-months.csv` (columns: Query, Page, Clicks, Impressions, CTR, Position), the keyword map, the crawl of the live site (live titles and metas), the Microsoft Clarity findings in the handoff, and backlink exports if they exist in `data/` (top target pages, linking text, linking sites). If you have web search, also read the top 10 results for each page's primary keyword. If you do not, skip that part and say so.

Build these files with a script (short summary in chat, details in files):
1. `tiers.csv`: for every real page: URL, primary keyword, impressions, clicks, CTR, weighted position, best position, top 5 queries, **tier**.
   - **Tier A (protected):** the page has a query at position <= 10 with >= 50 impressions, or it is at position 10 to 13 for its primary keyword. Expected members (check against the data): `/`, `/best-website-maintenance-for-small-business/`, `/best-website-maintenance-companies/`, `/how-long-does-website-maintenance-take/`, `/best-wp-buffs-alternatives/`, `/website-maintenance-services-for-uk/`, `/php-vulnerability-php2shell/`, `/wordpress-php-vulnerability/`.
   - **Tier B (careful):** best position 11 to 30 with >= 50 impressions.
   - **Tier C (free):** everything else.
2. `page-briefs.csv`: per page: primary keyword, secondary keywords (from the map), search intent (informational, commercial, transactional), question-type queries from GSC (queries starting with how, what, why, can, does, is, which) with impressions, the competitor title patterns if you could read them, the internal-link plan (which owner pages to link, with which natural anchors), and the schema plan.
3. `ctr-findings.md`: the pages with high impressions and very low CTR. Known from GSC (3 months): `/best-website-maintenance-for-small-business/` ranks about 4 to 6 with 16,381 impressions and only 5 clicks; `/best-website-maintenance-companies/` ranks about 6 to 7 for "best ..." queries with thousands of impressions and almost no clicks; `/how-long-does-website-maintenance-take/` ranks about 6 with 0.22% CTR; `/` has 26,638 impressions and 25 clicks. Explain in 5 lines what the likely causes are (weak title and meta, SERP features, AI answers, sitelink rows such as `#list`, `#plans`) and what the plan is. Ignore bot or unrelated queries ("Not a target" sheet).
4. `content-gaps.csv`: per page, what the page lacks for its keywords: question queries with no matching heading or FAQ, secondary keywords that appear nowhere on the page, subtopics that the top results cover (if you could read them), and entities or terms a complete page on this topic must explain. Each row says: add as FAQ, add as H2/H3 section, add as table, or add as a definition. Also list text on the page that overlaps another page's keyword or does not match the page's intent (input for `removal-proposals.md`).
5. `link-notes.md` (only if backlink files exist): which pages have external links and which anchor texts, so internal anchors stay consistent with them.

## 4. Stage 2: CTR-optimized titles and meta descriptions (all real pages, scripted)

Compare the **live** title and meta (from the crawl) with the title and meta in the rebuild. Write `reports/seo-research/snippets.csv`: URL, tier, live title, rebuild title, new title, title characters, title pixel width, live meta, new meta, meta characters, why. Measure pixel width with Playwright (title <= 580 px at 20px Arial, meta <= 920 px at 14px Arial; also keep meta <= 158 characters).

Rules by tier:
- **Tier A:** the title must equal the **live** title, only a year refresh is allowed where the title already has a year. Change only the meta description (a meta description is not a ranking factor, so this is the safe CTR lever). If the rebuild title differs from the live title, set it back to the live title and report it. Put your better title idea in the "phase 2" column of `snippets.csv` for the owner to test in 4 to 6 weeks, one page at a time, watching Search Console.
- **Tier B:** the primary keyword stays at the very start of the title, and every word of the live title that appears in a ranking query stays. You may add one modifier after it (a real price, "2026", "Fixed price", "Free quote"). New meta.
- **Tier C:** full CTR optimization, still primary keyword first.

Title formula: `Primary keyword: benefit or modifier | WMS`, 50 to 60 characters, no repeated words, no ALL CAPS, no emojis. Use a price or number only if it is a real, confirmed value (section 2, rule 5) and the same number is visible on the page. Add the current year only if the page content is current for that year.

Meta formula (140 to 158 characters): start with the answer or the benefit using the primary keyword once, add one proof fact (650+ sites, 12+ years) or a confirmed price, end with a clear action ("Get a free quote", "Start a plan", "Get a free scan"). Match the intent: "best / top / compare" pages say what is compared and how it was judged; cost pages say the plan range ($79 to $299 per month) and what is included; fix pages say what we fix and the fixed-quote-first promise; country pages name the country and the local currency price. Every meta is unique across the site. No "free hosting". No claim that is not approved.

Apply the new titles and metas to the build only through the existing title/meta data source or `text-edits.mjs`. The H1 stays. Confirm that the keyword-map titles from earlier work are not overwritten for pages the map marks "top-10 keep". Output the final CSV for the owner to approve (the owner changes nothing on the live site until launch, so this is safe).

## 5. Stages 3 to 7: build the pages

First list every real (status 200) service-like page that is not yet on the new design and write the list in PROGRESS.md. Live URLs for reference (`url-map.csv` decides which are real pages; redirects are not built):

| Group | Live URLs |
|---|---|
| Done, do not touch | `/`, `/monthly-website-maintenance-packages/`, `/wordpress-website-maintenance-packages/`, `/website-repair-services/`, `/website-hacked-recovery-services/`, `/wordpress-malware-removal-service/`, `/website-migration-services/` |
| Stage 3: services A | `/website-redesign-services/`, `/website-design-services/`, `/website-seo-services/`, `/website-speed-optimization-services/` |
| Stage 4: services B | `/website-support-services/`, `/website-update-services/`, `/wordpress-backup-services/`, `/website-hosting-and-maintenance/`, `/website-malware-scanner/`, `/website-maintenance-services-for-small-business/` (only if it is a real page) |
| Stage 5: agency | `/white-label-website-maintenance-services-for-agencies/`, `/wms-partner-program/` |
| Stage 6: plans and countries | `/ecommerce-website-maintenance-packages/`, `/shopify-website-maintenance-packages/`, and the 10 country pages `/website-maintenance-services-for-{usa,uk,canada,australia,ireland,france,netherlands,spain,switzerland,brazil}/` |
| Stage 7: other templates (light polish) | comparison and "best" pages (`/best-website-maintenance-companies/`, `/best-website-maintenance-for-small-business/`, `/best-wp-buffs-alternatives/`, `/best-fixrunner-alternatives/`, `/sitecare-alternative/`, `/best-web-hosting-for-small-business/`), `/website-maintenance-case-study/`, `/works/`, `/about-us/`, `/contact/`, `/blogs/`, `/free-website-maintenance-audit/`, `/get-a-free-quote/`, the policy pages, and the article template (all blog posts, including the redesign cluster: `/website-redesign-checklist/`, `/website-redesign-seo/`, `/cost-to-redesign-website/`, `/how-to-redesign-a-website-without-losing-seo/`, `/ecommerce-website-redesign/`, `/how-often-should-you-redesign-your-website/`, `/how-long-does-it-take-to-redesign-a-website/`) |

Branches (stacked, each from the previous; the first from the current HEAD after batch 1; check `git branch` and `reports/` and do not redo what exists): `b2-seo-research` (stages 1 and 2), `b2-services-a`, `b2-services-b`, `b2-agency`, `b2-plans-countries`, `b2-other-templates`, `b2-final`.

### Page structure (from `SERVICE-TEMPLATE-SPEC.md`, shortened)
- **Service pages:** hero with quick form, proof strip, finder ("What is happening with your site?", 4 tabs), included (8 cards, first 4 visible), pricing (3 tier cards: 3 columns on desktop, 2 + 1 between 520 and 1079 px, 1 column under 520), compare (one table inside a scroll wrapper with a sticky first column), process (3 to 7 steps, vertical on phone), results (only real approved stories, else the totals strip), why us, learn-more accordions (the existing long text), risk band (free check, fixed quote first, no contract), FAQ (6 visible + "Show all N"), related, final CTA. A slot with no content is not rendered.
- **Agency pages:** same skeleton; partner has no pricing or results slot.
- **Country pages:** short: hero, proof, finder, included, pricing in local currency (`reports/country-prices.md`), process, FAQ, related, final CTA. Do not pad. Brazil keeps `lang="pt-BR"` and Portuguese labels. Netherlands, Spain and Switzerland keep their Dutch, Spanish, German and French sections and `lang` attributes.
- **Plans pages:** same as the WordPress plans page with the store price sets in `prices.json`.
- **Other templates (stage 7):** CSS and markup polish only so they match the new look and the conversion rules; no removals; content additions only as section 2 rule 8 and section 6 (2b) allow, and for Tier A pages additions go into `additions.md` as proposals only (do not apply them), because those pages hold page-1 positions.

### Page notes
- **Redesign:** SEO-safe redesign. Show a "what we protect" panel (URLs, titles, redirects, schema, internal links) using wording already on the page. Compare "redesign vs repair". The only page where free hosting and 2 free email accounts may stay. No price in the snippet.
- **Design:** tiers only from `prices.json`; scope (pages, forms, revisions, days) only from existing text. Mention 120+ built.
- **SEO:** separate "SEO audit" and "monthly SEO" if the page already does. No ranking, traffic or "page 1" promises.
- **Speed:** Core Web Vitals explainer (LCP, INP, CLS) from existing text. Scores shown are labeled "Example", or are the approved case numbers inside a normal case card, not highlighted. No "guaranteed 90+".
- **Support:** keep it clearly different from the homepage (maintenance) and Repair (one-time fix): ongoing help, small tasks, requests. Do not use the homepage's or repair's primary keyword in H1/H2/H3.
- **Update:** very long page: rely on accordions. **Backup:** only schedules and retention already on the page.
- **White-label:** per-site tiers only from `prices.json`; if the $59 (1 to 5 sites) and $39 (6 to 20 sites) values are not both there, show "Per-site pricing on request". **Partner program:** existing text only.

## 6. SEO optimization and conversion rules for every built page

SEO (add what the research supports; remove nothing without the owner's yes):
1. Primary keyword in title, H1 and first paragraph (check; if the first paragraph lacks it, report, do not rewrite).
2. Secondary keywords from the map go into H2/H3 labels, section intros, image alt text and existing FAQ answers, naturally. At most one secondary keyword per heading, headings under 70 characters, no keyword more than 3 times on the page, no stuffing. Use the question-type queries from `page-briefs.csv` to phrase H2/H3 where an existing section already answers that question.
2b. **Fill the content gaps** from `content-gaps.csv` on the pages you build or polish (and on finished pages only if the owner approves in the report): new FAQs, H2/H3 sections, definitions and tables, following section 2 rule 8. Keep the FAQ list readable: 6 visible + "Show all N". Do not exceed the height targets (use `<details>`).
3. **Quick answer block:** directly under the hero, a 40 to 60 word plain answer to the page's main question (what it is, who it is for, the starting price if it exists, how to start), built only from facts on the page. Add it as `<p class="quick-answer">` through `text-edits.mjs`. This feeds featured snippets and AI answers.
4. One H1, then H2, H3, no skipped levels; section headings name the topic.
5. Schema: keep what exists; add `BreadcrumbList` if missing; add `Service` (name, description, provider = existing Organization, areaServed) if missing; add `Offer` only with a real price; `FAQPage` equals the visible FAQ.
6. Internal links: link once per body to the owner pages (pricing page, the matching service pages, the cost article, and the homepage with the anchor "website maintenance services"). No exact-match anchor to a non-owner page. Related block has at least 3 links. Link only to final URLs (no redirects, no 404s).
7. Images: meaningful alt, width and height, lazy-load except the first screen, AVIF/WebP with a fallback, under 120 KB each. Decorative SVG gets `aria-hidden="true"`.
8. Performance on every new page: Lighthouse mobile performance >= 95, SEO >= 95, CLS 0, LCP < 2.5 s, no render-blocking third-party scripts.

Conversion (from the Clarity data: scroll depth is only 22 to 24%, dead clicks on feature names, 8 to 11 CTAs per page):
1. First screen: H1, a one-line value statement, the price or "fixed quote first" line, **one main CTA** and the quick form. Everything needed to decide sits inside the first 1,500 px at 1440 and the first 2,400 px at 390.
2. One main CTA per page type: fix and hack pages "Fix my site", plans "Start plan", service pages "Get a free quote", blog "Get a free audit". Secondary CTAs are text links, not competing buttons. Maximum 5 CTA buttons per page.
3. Every feature or add-on name is expandable (native `<details>`) and says "Included" in words, with its price if it has one.
4. Proof strip right above pricing: 650+ websites maintained, 12+ years, 5.0 rated by our clients, Google Partner certified agency, no contract.
5. Risk band: free check, fixed quote before work starts, no contract. No refund wording that is not approved.
6. Objection handling through the existing FAQ and a short "Is this right for me?" finder, not new claims.
7. Phone: sticky bottom "Get a free quote" bar that never covers the last button. Forms: same Formspree endpoint, same fields, honeypot kept, redirect to `/thank-you/`.
8. No fake urgency, no countdowns, no invented scarcity.

## 7. Generated visuals (the owner cannot supply images)

Create original artwork yourself:
- **One hero illustration per page**, different for each, as an inline SVG component in `src/components/art/`, drawn with the brand gradient (`#6d34e0 -> #c026d3 -> #f43f5e`), light and dark both working through CSS variables, under 15 KB, fixed aspect ratio (no layout shift), `aria-hidden="true"` when decorative (else `role="img"` plus `<title>`). Ideas: Speed = gauge + waterfall bars; Backup = restore points on a timeline; Redesign = before/after wireframes joined by "URL map" arrows; Design = browser frame with layout blocks; SEO = search result card + abstract growth curve (no numbers); Update = version ladder with a shield; Support = ticket thread cards; White-label = "Your brand" / "Our team" slots; Partner = hand-off flow; Country = pin with the country name and the existing flag asset.
- Anything that looks like a dashboard or report carries an "Example" tag in the card. No fake client names or fake numbers shown as results.
- Icons: Lucide-style inline SVG. Platform logos only from `simple-icons`, as already used.
- **Social image per page (1200 x 630):** `scripts/gen-og.mjs` renders an HTML template (brand gradient, the page H1, "WMS") with Playwright to `public/og/<slug>.png`, under 120 KB. Reuse any existing OG pipeline; generate only what is missing. Set `og:image` and `twitter:image` only where missing, and list them.
- Forbidden: stock photos, AI-generated people or faces, "our team" photos, fake client logos, fake screenshots of real websites, copyrighted artwork.

## 8. Responsive and quality checks (every new or polished page)

Test at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 px, light and dark, with the stronger tests from batch 1 (clipped text, elements wider than the viewport, tap targets under 44 px, forbidden strings). Fix problems, do not just report them.
- No horizontal scroll. Grids use `minmax(0,1fr)`. Tables scroll inside their own wrapper with a sticky first column, or become cards.
- Phone: body text 16 px minimum, secondary 15 px, eyebrow labels 13 px, tap targets 44 px. No sideways swipe except a CSS-only auto-moving strip (paused on hover, focus and touch, off for `prefers-reduced-motion`, draggable by touch). If `reports/` shows a mobile redesign was done, follow its rules.
- No text overflows buttons, badges, chips or cards. No broken words. Prices never wrap in the middle.
- Collapsed height targets (Playwright), saved in `reports/batch-2/heights.md`: most pages <= 7,000 px at 1440 and <= 12,000 px at 390; Update and other very long pages <= 9,000 and <= 15,000; country pages <= 3,500 and <= 7,000.
- Lighthouse numbers (mobile and desktop) in `reports/batch-2/lighthouse.md`. Accessibility: visible focus, AA contrast in both themes, `<details>` summaries 48 px tall and keyboard friendly.

## 9. Stage 8: final SEO safety pass and owner review pack

Run and report:
1. URL parity 815 of 815. Any difference fails the batch.
2. Old dist vs new dist, per page: canonical, robots, `lang`, H1, list of headings (every old heading still exists; changed ones listed with the reason), internal links (none lost), JSON-LD (no fact lost). Titles and metas differ only as stage 2 says. Fail on any other loss.
3. Text parity >= 95% per page, 0 missing words.
4. **Cannibalization lint** on every page: no title, H1, H2 or H3 contains another page's primary keyword. List and fix hits on pages built in this batch; list hits on other pages as "later".
5. Forbidden strings in `dist`: "Free hosting" and "2 free email" outside the redesign page, "Lorem", "TODO", "placeholder", "[Real client", "on Clutch", "Dhaka", "Bangladesh", "+880", "No downtime", "guaranteed", "cookie".
6. Broken internal links, links to redirected URLs, missing alt, images without width and height, duplicate H1, duplicate IDs, sitemap and robots unchanged, Netlify redirect tests (18) still pass, duplicate titles and duplicate metas across the site (0).
7. Screenshots in `reports/batch-2/shots/<slug>/`: 1440 light, 1440 dark, 768 light, 390 light, 390 dark. Build `reports/batch-2/gallery.html`: one page with every screenshot in a grid, with URL, branch and status, so the owner does the final check from one file.

## 10. Final report: `reports/batch-2/FINAL.md` (simple English)

- Table: page, branch, commit, status, Lighthouse mobile, height at 1440 and 390.
- Two lines per page on what changed visually.
- `snippets.csv` summary: how many titles and metas changed per tier, which Tier A pages only got a new meta, and the "phase 2" title tests with a simple 4 to 6 week test plan (change one page at a time, compare clicks, impressions and position in Search Console).
- `additions.md` summary (how many FAQs, sections and tables were added per page) and `removal-proposals.md` summary: each proposal with your recommendation, for the owner to approve or reject. Nothing in that file was removed.
- Everything held back or not built, and why.
- Owner questions in priority order. Expected: pending prices (Design, SEO, Speed, White-label, hosting after year 1), real case studies, claims left out, Brazil / Netherlands / Spain / Switzerland language handling, the removal proposals, the "later" cannibalization steps.
- Review commands: which branch to check out and the merge order (`b2-seo-research`, `b2-services-a`, `b2-services-b`, `b2-agency`, `b2-plans-countries`, `b2-other-templates`, `b2-final`). Do not merge.
- SEO safety summary in 6 lines: URLs unchanged, H1 unchanged, titles unchanged on Tier A, parity numbers, cannibalization lint result, redirects tests.

When everything is done, print only: the final table, the owner questions and the path to `gallery.html`.
