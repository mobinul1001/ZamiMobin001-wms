# SEO-GUARDRAILS.md: other ranking problems to avoid (besides cannibalization)

These rules add to CLAUDE.md. CLAUDE.md wins if anything conflicts.
Every phase report must say which of these checks were run, with real output as evidence.
Same working rules as CLAUDE.md: plan first, ask before removing or rewriting content, never invent facts.

## 1. Crawling and indexing
- **Production robots:** after launch, production must have NO `noindex` (no meta tag, no `X-Robots-Tag` header). `robots.txt` must not contain `Disallow: /` and must not block CSS, JS or images. Add a test that fails the build if production HTML contains `noindex` on any URL that is in the sitemap.
- **Preview stays noindex** (already in CLAUDE.md). Check both directions on every deploy.
- **Soft 404s:** a page that does not exist returns a real HTTP 404 (not 200 with "not found" text, and not a redirect to the homepage). Never 301 many unrelated old URLs to the homepage. Each one goes to its closest matching page, or returns 404/410 if the owner approves.
- **Crawl traps:** no URL parameters that create duplicate pages (sorting, filters, `?replytocom=`, `?amp`, session IDs). No infinite calendar or tag archives. Tag/category/author archives that have no unique content: 301 to the closest page, or `noindex, follow`. Decide per URL in `url-map.csv`.
- **One host:** only `https://websitemaintenanceservices.org/` resolves. `http://` and `www.` versions 301 to it in one hop.
- **Sitemap:** only 200, indexable, canonical URLs. `<lastmod>` only changes when the content really changes.
- **Pagination:** blog pages `/page/2/` etc. keep self-canonicals. Never canonical them all to page 1.

## 2. Site architecture and internal links
- **Click depth:** every money page (homepage, packages, WordPress, eCommerce, Shopify, support, small business, cost posts) is reachable within 2 clicks of the homepage. Every other indexable page within 3 clicks.
- **No orphan pages:** every page in the sitemap has at least 2 internal links pointing to it from other pages. Produce a report: page → number of internal links in → anchors used.
- **Hub structure:** blog posts link up to the service page that owns their topic (cost post → packages page, WordPress posts → WordPress page, hack/malware posts → repair/malware page). Use descriptive anchors that vary naturally. Never use the homepage's primary keyword as anchor text to any page other than the homepage.
- **Breadcrumbs** on all inner pages, with BreadcrumbList schema that matches the visible breadcrumb.
- **No broken links, no chains:** every internal link points straight to a final 200 URL. Run a link checker on the preview build. The report must show 0 broken internal links and 0 internal links to redirects.
- Do not pile extra links into the footer or sidebar. Keep the navigation simple.

## 3. Core Web Vitals and page experience
- **Targets (field and lab), mobile and desktop:** LCP < 2.5 s, CLS < 0.1, INP < 200 ms. Desktop matters too (most form submits come from desktop).
- **LCP:** hero image preloaded and sized. No hero slider or animation that delays the main heading. Fonts self-hosted with `font-display: swap`, at most 2 families.
- **CLS:** every image, video, iframe and embed has width/height or an aspect-ratio. No banners, cookie bars or chat widgets that push content down after load.
- **Third-party scripts** (Clarity, analytics, chat, reviews widgets) load after the page is interactive (`defer` / on idle / on interaction). List every third-party script in the plan for approval.
- **Mobile:** body text ≥ 16 px, tap targets ≥ 44 px with spacing, no horizontal scroll at 360 px width. Pricing tables must be readable on mobile (stacked cards, not a squashed table).
- Report Lighthouse (mobile + desktop) for the homepage, packages page, one blog post and one country page on every build phase.

## 4. Trust, E-E-A-T and content quality
- **Real people:** an About page with the real team (names, roles, photos supplied by the owner). Blog posts show a real author with a short bio and an author page. Do not create fake authors.
- **Honest claims only:** no fake countdowns, no invented numbers or reviews (see CLAUDE.md rule 5). Use one consistent set of facts sitewide (client count, years, location "Dhaka-based, US hours"). List every claim found on the old site that conflicts with another page, for the owner to decide.
- **Trust pages** linked in the footer: Contact (real email, phone if any), Privacy Policy, Terms, Refund/Cancellation policy. HTTPS everywhere, no mixed content.
- **Dates:** blog posts show "Updated" date only when the content was really updated.
- **Thin content:** flag pages under ~300 words or with little unique text (e.g. near-identical country pages). Do NOT delete or rewrite them yourself. Put them in a list with a suggestion (expand, merge or noindex) for the owner.
- **No auto-generated or spun content.** Any new text you draft is marked as a draft for owner review before it goes live.

## 5. Backlinks
- Before the URL map is final, get the list of pages that have backlinks (Search Console → Links → "Top linked pages", export; plus Semrush Backlinks/Indexed Pages if the owner provides it). Every URL with a backlink must return 200 or a 1-hop 301 to the closest relevant page. Never 404.
- Keep the old image URLs (`/wp-content/uploads/...`), because image backlinks point there.
- Do not build, buy or suggest spammy links. Do not disavow anything unless Search Console shows a manual action, and only with the owner's approval.
- External links in content: keep them as they are. Mark paid or affiliate links with `rel="sponsored"` and user-generated ones with `rel="ugc"`.

## 6. Search intent
- Keep each page's format matched to its intent:
  - informational queries (cost, how long, checklist, what's included) → article pages with a quick answer at the top;
  - commercial queries (best companies, alternatives) → comparison pages;
  - transactional queries (services, packages, plans) → service/pricing pages with one clear CTA.
- Do not turn an informational article into a sales page, and do not put a long blog-style article on the pricing page.
- Do not create city pages (decided). Country pages stay as they are until the owner decides after 4–6 weeks of data.

## 7. Structured data
- Schema only for things that are visible on the page: FAQPage = visible Q&A, Article/BlogPosting = real author and dates, Organization/LocalBusiness only with real details.
- No Review/AggregateRating schema unless there are real, visible reviews collected on this site.
- Validate every template with the Schema.org validator. The report must show 0 errors.

## 8. AI search (GEO / AEO): being found and cited by ChatGPT, Perplexity, Google AI Overviews, Claude
Most of this is the same as good SEO. Do these concrete things, nothing more:
- **AI crawler access in `robots.txt`:** allow the search/answer bots: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Bingbot`, `Googlebot`. Training bots (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`): ask the owner allow or block, and show the plan before changing. Never block Googlebot or Bingbot. Check that the Netlify/CDN firewall does not block these bots either.
- **Bing matters:** ChatGPT search relies heavily on Bing's index. Plan for Bing Webmaster Tools verification (owner does it) and IndexNow pings on deploy.
- **Everything in the first HTML:** all text, FAQ answers, prices and tables are in the server HTML (Astro static already does this). No content that only appears after JavaScript or a click-to-load.
- **Answer-first writing (no content removal):** on informational pages, add a 2–3 sentence direct answer right under the H1 (e.g. "Website maintenance costs $X–$Y per month for most small businesses…"), then the existing content. Every H2 section should make sense on its own (AI tools quote single passages). Use real tables for prices and comparisons, not images of tables. New text is a draft for owner approval.
- **Clear, consistent facts (entity):** one brand name (WMS / websitemaintenanceservices.org), same prices, same location, same contact on every page and in Organization schema (`name`, `url`, `logo`, `sameAs` = real social/profile URLs the owner gives). The pricing page states plan names, prices and what's included in plain text so AI tools can quote it correctly.
- **`llms.txt`:** optional and low priority. No major AI search engine has confirmed it uses it. If the owner wants it, add a short `/llms.txt` listing the key pages (homepage, packages, WordPress, eCommerce, cost post, contact) with one-line descriptions. It must not contain anything that is not on the site.
- **Not needed:** "RAG", "vector search" and "embeddings" are how the AI tools work internally. There is nothing to install for them. The practical result is the answer-first, self-contained sections above.
- **Measuring (after launch):** in Analytics, track referral traffic from `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai` as a separate "AI referrals" channel. The owner checks monthly, by hand, about 10 key questions (e.g. "best website maintenance companies", "how much does website maintenance cost") in ChatGPT, Perplexity and Google AI Overviews, and notes whether WMS is mentioned or linked. Paid "AI share of voice" tools are optional.

## 9. Launch and after
- **Before DNS switch:** full crawl of the preview, compared with the old-site crawl (status, title, H1, canonical, word count per URL). Owner approves the diff.
- **Launch day:** submit the sitemap in Search Console, inspect the homepage + top 10 pages, check `robots.txt` and that no `noindex` is live.
- **Analytics continuity:** same Google Analytics / Search Console properties, so data before and after can be compared. Clarity script kept.
- **Monitor for 6 weeks:** weekly check of Search Console (Pages report errors, 404s, Soft 404, "Crawled – currently not indexed", Core Web Vitals report, clicks/impressions of the top 30 pages compared with before). Report any page that drops more than 30% so it can be fixed fast.
