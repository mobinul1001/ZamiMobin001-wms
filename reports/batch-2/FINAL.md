# Batch 2: final report

Nothing is merged and nothing is pushed. Work order (owner, 2026-11-06): content, pages and SEO first; the full design QA, Lighthouse, screenshots and the gallery are on the later list (`reports/TODO.md`).

## Pages

| Page | Branch | Commit | Status | Height 1440 / 390 |
|---|---|---|---|---|
| /website-redesign-services/ | b2-services-a | d384c20 | rebuilt | 9,103 / 7,522 |
| /website-design-services/ | b2-services-a | d384c20 | rebuilt | 8,490 / 6,773 |
| /website-seo-services/ | b2-services-a | d384c20 | rebuilt | 9,127 / 7,418 |
| /website-speed-optimization-services/ | b2-services-a | d384c20 | rebuilt | 10,438 / 7,526 |
| /website-support-services/ | b2-services-b | dee36f7 | rebuilt | 10,034 / 7,474 |
| /website-update-services/ | b2-services-b | dee36f7 | rebuilt | 9,959 / 8,320 |
| /wordpress-backup-services/ | b2-services-b | dee36f7 | rebuilt | 8,757 / 7,182 |
| /white-label-website-maintenance-services-for-agencies/ | b2-agency | a396a84 | rebuilt | 10,355 / 7,827 |
| /wms-partner-program/ | b2-agency | a396a84 | rebuilt | 6,642 / 6,601 |
| /ecommerce-website-maintenance-packages/ | b2-plans-countries | 567ebd4 | rebuilt | 9,395 / 7,248 |
| /shopify-website-maintenance-packages/ | b2-plans-countries | 567ebd4 | rebuilt | 8,494 / 7,591 |
| 9 country pages (USA, UK, Canada, Australia, Ireland, France, Netherlands, Spain, Switzerland) | b2-plans-countries | 567ebd4 | rebuilt | 4,617 to 7,787 / 6,423 to 8,974 |
| /website-maintenance-services-for-brazil/ | – | – | held (Portuguese labels) | – |
| /website-hosting-and-maintenance/ | – | – | held (Tier B blog post) | – |
| /website-malware-scanner/ | – | – | kept on its form layout | – |
| Stage 7 pages (comparison posts, case study, works, about, contact, blog, forms, policies, articles) | – | – | not started | – |
| All 92 real pages: titles and metas | b2-seo-research | d40c2ae | done | – |
| Safety pass and this report | b2-final | (this commit) | done | – |

Lighthouse was not run (later list). Height targets: phones are under 12,000 everywhere; desktop service pages are 8,500 to 10,400 against 7,000 (header, final CTA band and footer are about 1,450 of that); country pages are over 3,500 / 7,000 (their local plan cards stay open on purpose).

## What changed visually (two lines per group)
- **Service pages (redesign, design, SEO, speed, support, update, backup, white-label, partner):** a new hero with one main button and the quick form, an "In short" answer with original art, the proof strip above pricing, a risk band, FAQ with 6 shown and "Show all", related links and countries.
  Long parts open from "Read more", card grids show 4 at a time, and tables scroll in their own box. Nothing was removed. Redesign also gets "What we protect" and a "Redesign or repair" table.
- **Store plan pages (ecommerce, Shopify):** same layout with "Start plan"; the confirmed store prices stay visible.
- **Country pages:** hero with the local "Plans from" price, quick answer with local prices, the local plan cards open, every other part under its own heading, and art with the country flag. The language sections are kept as they are.

## Titles and metas (snippets.csv)
- Tier A (11 pages): title = live title on all 11 (three titles the rebuild had changed were set back); only the meta changed. Phase 2 title ideas are in the `phase2_title` column for /, best companies, best for small business, WP Buffs, how long, maintenance cost, WordPress cost, SiteCare and UK.
- Tier B (8 pages): primary keyword first, live ranking words kept; 4 titles changed, 8 metas.
- Tier C (73 pages): 62 titles and 73 metas changed.
- Every title is at most 580 px and every meta at most 920 px, all unique, and every number in them is on the page. Meta length is 130 to 158 characters, because 920 px is reached at about 140.
- **Phase 2 test plan (4 to 6 weeks after launch):**
  1. Change one Tier A title at a time.
  2. Wait 4 weeks.
  3. Compare clicks, impressions, CTR and average position for that page in Search Console (28 days before vs after).
  4. Keep the change only if clicks went up and the position did not drop by more than 1.
  5. Then move to the next page.

## Additions and removal proposals
- `reports/seo-research/additions.md`: quick answers on 20 pages (each 40 to 60 words, facts and prices from the page and prices.json). Also on the redesign page, a "What we protect" panel and a "Redesign or repair" table. Related links on every rebuilt page. Support FAQ questions are now marked up as H3. No new FAQs were added: the GSC export has almost no question queries for these pages.
- `reports/seo-research/removal-proposals.md`: no proposals. Nothing was removed.
- One heading changed (cannibalization lint, page built in this batch): white-label H2 "Our Rigorous Website Maintenance Process" → "Our Rigorous White Label Maintenance Process" (it used the primary keyword of /website-maintenance-process/).

## SEO safety (reports/batch-2/safety.md, old build = commit 32d32cd)
1. URLs unchanged: 93 pages in the old and new build, none gone; URL parity 815 of 815 (fails []).
2. H1 unchanged on every page; canonical, robots and lang unchanged.
3. Titles unchanged on Tier A (equal to the live titles); titles and metas differ only as snippets.csv says (92 of 92).
4. Text parity: lowest page 98.9% of old text blocks; every old heading still there (one changed on purpose, above), no internal link lost, no schema value lost.
5. Cannibalization lint: 0 hits on pages built in this batch after the fix; hits on other pages listed under "Later" in safety.md (phase 2, not done now).
6. Sitemap, robots.txt and _redirects are byte-identical to the old build (the 18 Netlify redirect tests need a Netlify deploy; the redirect file they test did not change). Build check 0 failures; build tests 31/31; browser tests 29/29; no duplicate titles or metas.

Forbidden-string scan: 16 hits, all in existing article text from before batch 2 (".bd to Bangladesh" in domain articles, "guaranteed" used as "not guaranteed", "little or no downtime"), plus the migration page's "no downtime", which has been held and collapsed since batch 1. None were added; none were removed (owner decision).

## Owner questions (priority order)
1. **Pending prices:**
   - Design ($1,499 / $2,999 / $5,499+), SEO ($299 / $599 / $1,999 per month, audit $199), speed ($149 / $299 / $499), redesign ($1,200 to $5,500+).
   - WS support plans ($199 / $399 / $699).
   - White-label ($59 and $49 per site on the page; the brief said $59 and $39).
   - Malware Protect / Priority ($249 / $349).
   - Hosting after year 1 (the redesign line has no duration).

   These pages show "Fixed quote after a free check" or "Per-site pricing on request", and the old prices stay in the HTML under "Price note". Prices inside FAQ answers were left as they are, because the FAQ schema must match.
2. **UK (Tier A):** its layout changed and a quick answer was added. Keep, or go back to the old layout (one line in `src/pages/[...slug].astro`)?
3. **Brazil:** Portuguese labels for the new layout (Leia mais, Mostrar mais, Em resumo, Peça um orçamento, form text)? Until then it keeps its layout.
4. **Hosting-and-maintenance (Tier B blog post):** move it to the service layout (its author and date block would go), or keep it as an article?
5. **Claims left in body text for you to check:**
   - ~~White-label resale margins, support "24/7", the partner earnings example~~ (owner, 2026-11-06: approved, CLAIMS-AND-DESIGN.md A4b; shown normally, no longer held).
   - The design, SEO and speed "Client result" panels (shown as Example, collapsed).
6. **Real case studies** for the results sections (none added).
7. **Batch 1 questions still open:** analytics and EU/UK consent (GA4 and Clarity are not loading), held claims, comparison posts with "hosting included", real reviews, menu groups.
8. **Cannibalization phase 2:** the "Later" list in safety.md (comparison posts and others using "website maintenance services" in H2s). Wait 4 to 6 weeks after the owner pages rank, as the plan says.
9. **Not built (Stage 7 and visual QA):** comparison and "best" pages, case study, works, about, contact, blogs, forms, policies and articles. Also the 8-width light and dark sweep, Lighthouse, OG images, screenshots and gallery.html. All are on the later list.

## Review and merge order (do not merge yet)
Batch 1 first (global-cleanup → responsive-fix → hacked-page → malware-page → migration-page), then batch 2, each branch stacked on the one before:
`b2-seo-research` → `b2-services-a` → `b2-services-b` → `b2-agency` → `b2-plans-countries` → `b2-final`.
To review everything at once, check out `b2-final` and run `CONTEXT=production URL=https://websitemaintenanceservices.org npm run build`.

## Batch 2b (branch `b2-content`, stacked on `b2-final`; nothing merged or pushed)

| Task | What was done | Commit |
|---|---|---|
| A | Live-site prices shown in the normal pricing cards: design, SEO, speed, redesign, support, white-label ($59 / $49), malware Protect / Priority ($249 / $349). They are in `src/data/prices.json` (`liveSitePrices`, `malwareTiers`) with `confirmed: false` and "as on live site, owner to confirm". The build stops if a page stops showing a listed price. Titles and metas still use only confirmed prices. Fixed a bug: the update, backup and store hero lines showed "from 79/mo" without "$". UK went back to its old layout with no quick answer (new layout logged as a phase 2 proposal). Brazil moved to the new layout in pt-BR (`lang="pt-BR"` kept). The hosting post is unchanged. The malware service page and article pair is an approved exception in safety.md. | d5ff119 |
| B | Duplicate IDs fixed on 18 pages: 17 articles had an empty anchor right before a heading with the same id; the malware page had two forms with the same id prefix. Result: 0 pages with duplicate IDs. 622 in-page links on those pages checked, 0 broken, no text changed. New build check `duplicate-id` with a test (build tests 32/32). | c180e14 |
| C1 | `reports/seo-research/link-notes.md`: the homepage has 1,188 of the incoming links (33 sites). The 3 redirected URLs that have links each go by a single 301 to the right owner page. One anchor conflict found: the article byline "Website Maintenance Services" links to /about-us/ on 47 pages (proposal). | 3762dac |
| C2–C4 | `serp-notes.csv` covers 25 priority keywords (top-10 titles and common topics). The search tool returns no People-also-ask boxes. 25 SERP rows added to `content-gaps.csv`. 4 FAQs added (visible FAQ and schema): migration, white-label, SEO, WordPress packages. 6 Tier A FAQ proposals are in additions.md. Most top-10 topics were already answered by the existing FAQs. | fb723fc |
| D | Stage 7, light: a free-audit offer card (the audit page's own words, "Get a free audit") at the top of the 43 articles that are not Tier A. Tier A pages unchanged (`src/data/tier-a.json`). About, works, contact, blogs, forms and policies: no change. | b8325e7 |
| E | This section, TODO.md, and the safety pass re-run against a separate clone of commit 32d32cd with its own `npm ci`. | (this commit) |

**Checks (production build, b2-content):**
- Build: 0 failures.
- URL parity: 815/815.
- Build tests: 32/32. Browser tests: 29/29.
- Titles and metas: 92/92 as snippets.csv.
- Safety pass: 0 failures, lowest text 98.5%; sitemap, robots.txt and _redirects unchanged.
- Page checks on the rebuilt pages: 100% text.
- WordPress packages page: my page checker shows 88% because of how its comparison table joins cells; that page is on its Batch 1 template, unchanged except for one added FAQ. The official parity on that page passes.

**pt-BR labels on the Brazil page:**
- From your list: Leia mais, Mostrar mais, Mostrar tudo, Em resumo, Peça um orçamento gratuito, Perguntas frequentes, Relacionados, Sem contrato, Orçamento fixo antes de começarmos, Verificação gratuita, Planos a partir de, Incluído, and the form labels.
- Ours (needs native review):
  - the quick answer;
  - the form's select options, placeholders and footer line;
  - the trust strip ("sites mantidos", "anos de experiência", "avaliação dos nossos clientes", "agência certificada");
  - "Países que atendemos", "Guias", "Exemplo";
  - the related-link anchors;
  - "Correção avulsa a partir de … · Limpeza de site invadido …".

### Owner questions (Batch 2b)
1. **Prices on the live site:** confirm or change each one in `prices.json` (`confirmed: false`). Design, SEO, speed, redesign, support, white-label $59 / $49, malware $249 / $349.
2. **Prices inside FAQ answers that differ from the cards:** for example, the SEO FAQ says SEO Pro $999 while the card says custom from $1,999. They were left as they are.
3. **pt-BR wording:** native review of the Brazil labels marked as ours.
4. **Byline anchor:** the article byline "Website Maintenance Services" links to /about-us/ on 47 articles. Change the text to "WMS" (recommended), or link it to the homepage?
5. **Comparison-post images:** the featured images (e.g. best FixRunner alternatives) show "2 Free Business Emails" and "Hosting Included". New images, or keep?
6. **Tier A proposals:** the UK new layout and 6 FAQs (additions.md). Approve any to test one page at a time?
7. **Claims still open:** the "Client result" panels (Example, collapsed) until real case studies arrive. White-label margins, support "24/7", the partner earnings example and migration "no downtime" are approved (owner, 2026-11-06: approved, CLAIMS-AND-DESIGN.md A4b; shown normally, no longer held).
8. **Still on TODO.md:** GA4 / Clarity and EU/UK consent, design QA, Lighthouse, screenshots and gallery.

**Merge order:** Batch 1 branches → `b2-seo-research` → `b2-services-a` → `b2-services-b` → `b2-agency` → `b2-plans-countries` → `b2-final` → `b2-content`. Do not merge yet.

## Batch 2c (branch `b2-content`, 2026-11-06; nothing merged or pushed)

| # | What was done | Commit |
|---|---|---|
| 1 | `reports/price-mismatches.md`: 11 FAQ answers on 8 pages name prices that are not on the page's cards. Nothing changed. A live check today also found that the SEO, speed and white-label **cards** differ from the live site (live: SEO $499 / $999 / $1,999, speed $99 / $199 / $349 / $499, white-label $59 / $39). | ed73d91 |
| 2 | Byline "By: Website Maintenance Services" → "By: WMS" on the 39 non-Tier-A articles (link to /about-us/ kept). The 8 Tier A articles are a phase 2 proposal. Internal "website maintenance services" anchors pointing to /about-us/: 47 pages → 8. | 49700a2 |
| 3 | 3 featured images replaced (FixRunner, WP Buffs, SiteCare comparisons), plus their 15 WordPress size variants. Each keeps its path, name, size, format and alt text and is under 120 KB. The live URL is the rebuild URL; no redirects. Record: `reports/batch-2/images-replaced.md`, originals in `reports/batch-2/images-original/`. Visual search of 73 featured/OG images found no other free-offer text. | bce6d93 |
| 4 | Stage 7 finished on about, works, blogs, contact, free audit, get a free quote and the 4 policy pages: offer line and one main button under the H1 (a text link on policies). One primary button per page; the other body buttons on about, works and the blog index are now secondary. The empty band on the audit page is gone. | 82cd7c7 |
| 5 | The four claims (white-label margins, support "24/7", partner earnings example, migration "no downtime") are approved facts in CLAIMS-AND-DESIGN.md A4b, word for word as on the live pages. They are off the held lists and owner questions. Migration's Host-to-Host card shows them normally; they are not in the title or meta. The forbidden scan exempts only those exact phrases on the migration page. | b16be43 |
| 6 | All checks, this section and TODO.md. | (this commit) |

**Checks (production build):**
- Build: 0 failures.
- URL parity: 815/815.
- Page checks: 22 of 22 rebuilt pages pass.
- Tests: build 32/32, browser 29/29.
- Titles and metas: 92/92 as snippets.csv.
- Duplicate IDs: 0 pages.
- Safety pass against the separate pre-batch-2 clone: 0 failures, lowest text 98.5%; sitemap, robots and redirects unchanged; 15 forbidden-string hits, all older article text.

### Owner questions (current)
1. **SEO, speed and white-label cards:** show your list (as now), or the prices on the live site today? `reports/price-mismatches.md`, second table.
2. **FAQ answers that name other prices than the cards** (11 answers, 8 pages): which value is right? `reports/price-mismatches.md`.
3. **Old plan prices and claims in images:** several images show $95 / $195 / $395 and "99.9% uptime" / "24/7" badges (the WordPress cost featured image, small business plans comparison, small business featured image, DIY vs professional). Replace them like the three comparison images?
4. **Alt texts of the 3 replaced images:** they still describe a comparison ("…highlighting… hosting…"). Shorten them to match the new image?
5. **pt-BR wording on the Brazil page:** native review of the labels marked as ours.
6. **Tier A proposals:** UK new layout, 6 FAQs, "By: WMS" on 8 articles. Test one page at a time?
7. **"Client result" panels:** real case studies to replace them.
8. **TODO.md:** GA4 / Clarity and EU/UK consent, design QA, Lighthouse, screenshots and gallery.
