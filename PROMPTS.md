# PROMPTS.md — paste one phase at a time into Claude Code

Start every session with: "Read CLAUDE.md and follow it strictly."
Each phase: Claude Code shows a plan → you approve → it implements → it reports with evidence.

---
## Phase 0 — Project setup
```
Read CLAUDE.md. Set up a new Astro project in this folder for the rebuild of websitemaintenanceservices.org, configured exactly as CLAUDE.md "Tech decisions" says (static output, trailingSlash 'always', build.format 'directory', content collections, sitemap, Netlify adapter not needed for static). Initialise git. Add netlify.toml with: build command, publish directory, and headers that send "X-Robots-Tag: noindex, nofollow" on every non-production context (deploy-preview and branch-deploy). Show me the plan first and wait for approval.
```

## Phase 1 — Collect everything from the old site (read-only)
```
Read-only crawl of https://websitemaintenanceservices.org/. Do not change anything on the live site.
1) Build the full URL inventory from: /sitemap.xml (and any sitemap index), the WordPress REST API (GET /wp-json/wp/v2/pages, /posts, /media, /categories, /tags, /users with per_page=100 and pagination), every internal link found while crawling, and the Search Console exports in ./gsc/.
2) For every URL save to ./export/: final status code, redirect target, <title>, meta description, canonical, robots, Open Graph/Twitter tags, all JSON-LD, H1–H3 list, full main body text, internal links, images (src + alt), and word count.
3) Download every image and file under /wp-content/uploads/ that is referenced, keeping the exact path.
4) Save the inventory as ./export/inventory.csv and a summary: number of pages, posts, images, categories, authors, URLs without trailing slash, URLs in Search Console but not in the sitemap.
Show me the plan first (tools, rate limit of at most 1 request per second, output files), then wait for approval.
```

## Phase 2 — URL map
```
Using ./export/inventory.csv and the plan files, complete ./url-map.csv so that EVERY old URL has a row: status 200 (same path) or 301 (final target). Rules from CLAUDE.md: same paths with trailing slash, merges and redirects as in the PDF list 1, no chains, WordPress system URLs (/category/, /author/, /feed/, /page/N/, /?p=ID, attachment pages) mapped sensibly. Mark anything you are unsure about as "NEEDS OWNER DECISION". Show me the counts per status/type and every "NEEDS OWNER DECISION" row, then stop.
```

## Phase 3 — Design system and templates
```
Propose the design: either (a) keep the current look as close as possible, or (b) a cleaner modern design using the current brand colours, logo and fonts. Show me 2–3 homepage section mockups as a preview page before building everything. Templates needed: homepage, service page, packages/pricing page, comparison/listicle page, blog post, blog index, category page, country page, contact, 404, thank-you. Every template outputs the SEO fields from CLAUDE.md. Plan first, then wait.
```

## Phase 4 — Build pages and blog with the fixes applied
```
Build every 200 page from url-map.csv using the exported content. Apply the PDF lists exactly: merged content moved into targets, titles (proposed list 4), H1 rules (list 5), internal links (list 6), singular/plural rule (list 7), page pairs (list 8), expanded content (list 2) and shortened sections (list 3). Use {BRAND} = <owner fills in>. Do not invent facts; list every existing claim (numbers, testimonials, client names) for me to verify. Set up the blog CMS at /admin/ (noindex). Show me the plan first, then build in batches of 10 pages and report each batch.
```

## Phase 5 — Parity test (automatic)
```
Write ./scripts/parity-test.mjs that, for every row of url-map.csv, requests the old URL (live) and the matching URL on the preview build, and checks:
- status: 200 rows return 200 on the preview; 301 rows return 301 to exactly new_url (no chains);
- path identical incl. trailing slash;
- title, meta description, canonical, robots, H1 match the approved values (old values unless the plan changes them);
- JSON-LD types present;
- word count on the preview ≥ 95% of old (except approved merges/removals);
- every image URL from the old page returns 200 on the preview;
- no internal link on the preview points to a redirecting URL or a 404.
Output ./reports/parity.csv and a summary. Every FAIL must be fixed or approved by me. Paste the summary.
```

## Phase 6 — Preview QA
```
Deploy to a Netlify deploy preview. Paste evidence that the preview sends "X-Robots-Tag: noindex, nofollow" (curl -I). Run Lighthouse mobile on /, /monthly-website-maintenance-packages/, /best-website-maintenance-companies/ and one blog post; paste scores. Test the contact form end to end. Check 404 returns HTTP 404. Paste everything and stop for my approval.
```

## Phase 7 — Launch (follow LAUNCH-CHECKLIST.md)
```
Walk me through LAUNCH-CHECKLIST.md one step at a time. You may change the Netlify site and repo; I make the DNS change myself. After I confirm DNS is switched, verify on the live domain: robots tags (no noindex on production), 30 random 200 URLs, all 301 URLs (curl -I), sitemap, robots.txt, forms, analytics. Paste evidence.
```

## Phase 8 — Monitoring (weeks 1–6)
```
Re-run the parity test against the live domain. Read the Search Console exports I add to ./gsc/ (Pages → Not found (404), Performance by page) and list any URL that lost traffic or returns 404, with a proposed fix. Do not change anything without my approval.
```
