# CLAUDE.md — websitemaintenanceservices.org rebuild

## Goal
Rebuild https://websitemaintenanceservices.org/ (currently WordPress + Elementor) as a static Astro site hosted on Netlify, with **zero SEO loss**, and apply the keyword-cannibalization fixes in the provided plan. Build and test on a Netlify preview first; the live domain is switched only after the owner approves.

## Inputs in this folder
- `wms-cannibalization-implementation-lists.pdf` — the 8 implementation lists (301s, expand, remove, titles, H1s, internal links, singular/plural, page pairs).
- `wms-cannibalization-fix-plan.xlsx` — Action Plan, Query Map (owner page per query), Page Pairs.
- `url-map.csv` — old URL → new URL map. Pre-filled with the known redirects; you complete it in Phase 2.
- `PROMPTS.md` — the phase-by-phase instructions.
- `LAUNCH-CHECKLIST.md` — launch and rollback steps.
- `gsc/` — Search Console exports the owner adds (indexed pages, performance by page).

## Working rules (always)
1. **Plan first.** For every phase: show a written plan (what will change, files, risks) and STOP for the owner's approval. Implement only the approved items.
2. **Evidence, not claims.** Every report pastes real output (command output, curl headers, counts, diff summaries). Never write "done" without evidence.
3. **Never touch the live WordPress site, its database, DNS or email settings.** Read-only access only (crawling, REST API GET requests).
4. **Never delete or remove content** that exists on the old site unless the owner approved it in the plan. Ask first.
5. **No invented facts.** No new statistics, client names, testimonials, reviews, awards, prices or results. Copy existing claims only as they appear on the old site, and list them for the owner to verify.
6. **Secrets** (API keys, passwords, tokens) are never written into the repo, files or chat. The owner sets them as environment variables or in Netlify.
7. Keep a running `CHANGELOG.md` of what changed per phase.

## Tech decisions
- **Astro**, static output (`output: 'static'`), `trailingSlash: 'always'`, `build.format: 'directory'` so every URL ends with `/` exactly like WordPress.
- Content in **Astro content collections** (Markdown/MDX): `src/content/pages/`, `src/content/blog/`.
- **Blog editing for non-developers:** a git-based CMS at `/admin/` (Decap CMS or Sveltia CMS, GitHub backend). `/admin/` is `noindex` and excluded from the sitemap. Check the CMS's current documentation for the auth setup on Netlify before implementing.
- **Images:** keep every image at its original path under `public/wp-content/uploads/...` so existing image URLs keep working. Keep original alt text. Add width/height and modern formats where possible without changing the URL.
- **Forms:** contact/quote forms via Netlify Forms (with honeypot spam protection), sending to the owner's email; show a thank-you page.
- **Redirects:** server-side 301s in `public/_redirects` (or `netlify.toml`), generated from `url-map.csv`. No JavaScript or meta-refresh redirects. No redirect chains: every old URL points straight to its final URL.
- **Sitemap** via `@astrojs/sitemap`, listing only indexable canonical URLs. `robots.txt` points to it.
- **Real 404 page** returning HTTP 404 with `noindex`.
- **Preview protection:** on every non-production Netlify context (deploy previews, branch deploys), send `X-Robots-Tag: noindex, nofollow` for all paths and add `<meta name="robots" content="noindex, nofollow">`. Production gets the normal robots tags. Never let the preview be indexed.

## SEO parity requirements (old → new, per URL)
For every URL that stays (status 200 in `url-map.csv`):
- identical path including the trailing slash;
- all body content kept (design may change; text changes only where the plan says so);
- `<title>`, meta description, canonical (absolute, `https://websitemaintenanceservices.org/...`), robots, Open Graph/Twitter tags, schema (Organization, WebSite, BreadcrumbList, FAQPage, Article/BlogPosting where present);
- one `<h1>` per page;
- all internal links pointing to final URLs (never to a URL that redirects);
- every text in the first-load HTML (FAQ answers included).
For WordPress system URLs (`/category/...`, `/author/...`, `/feed/`, `/page/N/`, `/?p=ID`, attachment pages, `/home/`, URLs without a trailing slash): map each to 200 or a 301 target in `url-map.csv`. None may return 404 unless the owner approved it.

## Keyword ownership (from the plan — only the owner page uses these phrases in title/H1/H2/H3)
- `/` — website maintenance services, website maintenance company / agency, web maintenance services.
- `/best-website-maintenance-companies/` — best / top website maintenance companies (comparison only).
- `/best-website-maintenance-for-small-business/` — small business website maintenance.
- `/monthly-website-maintenance-packages/` — website maintenance packages / plans / pricing / monthly (absorbs /plan-packages-and-costs/ and /website-management-packages/).
- `/how-much-does-website-maintenance-cost/` — website maintenance cost questions.
- `/wordpress-website-maintenance-packages/` — WordPress maintenance services / packages / plans.
- `/how-much-does-wordpress-website-maintenance-cost/` — WordPress maintenance cost.
- `/how-long-does-website-maintenance-take/`, `/website-maintenance-checklist/`, country pages, `/best-wp-buffs-alternatives/`, `/sitecare-alternative/` — their own topics only.
Full detail: the PDF lists and the Query Map sheet.

## Brand in titles
The domain contains the main keyword. Use the short brand the owner chooses (placeholder `{BRAND}`) at the end of titles, never "Website Maintenance Services", so titles do not compete with the homepage.

## Definition of done (before launch)
- Parity test passes for 100% of rows in `url-map.csv` (see PROMPTS.md Phase 5).
- Lighthouse mobile: Performance ≥ 90, SEO = 100, Accessibility ≥ 90 on the homepage and 3 key pages.
- Forms tested end to end. Analytics and Search Console verification in place.
- Owner has approved the preview.
