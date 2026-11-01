# CMS-REQUIREMENTS.md: what the owner must be able to do without a developer

These requirements add to CLAUDE.md and SEO-GUARDRAILS.md. Same rules apply: plan first, wait for approval, show evidence.

**Owner changes on approving the plan (2026-11-01):** 410 is dropped, so removed pages return 404 and there is no edge function. The Redirects type field offers 301 and 302 only. The small test also covers the Editorial Workflow (draft, PR, deploy preview, publish). The owner creates the CMS token with a 1-year expiry, and `CMS-GUIDE.md` must include "renew CMS token" with the expiry date.

## Choice of CMS
- Use a git-based CMS at `/admin/` that edits the Astro content files and commits to GitHub. Netlify then rebuilds automatically (1–3 minutes).
- First choice: Sveltia CMS (free, Decap-compatible config, good media library). Alternatives to compare in the plan: Decap CMS, Keystatic. Check each one's current documentation before choosing. Show the owner a short comparison (login method, image handling, cost, limits) and wait for approval.
- Login: the owner is the only editor for now. Propose the simplest secure login, e.g. Sveltia's GitHub sign-in through its auth worker or a GitHub access token. Netlify Identity's status has changed in the past, so check its current status before using it. Secrets go only into Netlify/Cloudflare environment variables, never into the repo.
- `/admin/` is `noindex`, excluded from the sitemap and blocked in robots.txt (already decided).

## What the owner must be able to do in the CMS
1. **Blog posts:** create, edit, save as draft, publish, unpublish. Fields:
   - title
   - URL slug (auto from title, editable before first publish)
   - SEO title (live character counter, max ~60)
   - meta description (counter, max ~155)
   - H1
   - featured image + alt text (alt is required)
   - body (rich text/Markdown with headings, lists, tables, links, images, YouTube embeds)
   - FAQ list (question + answer → FAQPage schema automatically)
   - author (select from the Authors list)
   - category
   - published date and "updated" date
   - noindex toggle (off by default)
   - canonical override (empty by default)
2. **Pages:** edit the text, images, FAQs and SEO fields of every existing page (homepage, services, packages, country pages, about, contact…). Page sections are editable fields (hero, features, FAQ, CTA), not raw code. The page URL/slug of a live page is locked in the CMS. Changing a live URL is done only through the redirect flow below.
3. **Images:** one media library. Upload, choose, replace, with required alt text. New uploads go to `public/images/uploads/`. Old images stay at `/wp-content/uploads/...` and keep working. Images are resized and converted to modern formats at build time automatically, so the owner can upload a normal JPG/PNG. Warn on uploads over ~2 MB.
4. **Redirects manager:** a "Redirects" list in the CMS (stored as a data file) with fields: from path, to path, type (301 permanent / 302 temporary / 410 gone), note. The build turns it into Netlify `_redirects`. The build fails with a clear message if:
   - a redirect creates a chain or a loop;
   - the target does not exist (returns 404);
   - the "from" path is a live page;
   - the same "from" appears twice.
   The owner sees the error in the Netlify deploy log, and the live site stays on the previous good version.
5. **Deleted or renamed pages:** if a URL that was live in the last build disappears and has no redirect, the build fails and lists the URL. This way a URL can never break by mistake.
6. **Site settings (one place each):**
   - Master price list (plan names, monthly/annual prices, what's included). Every page that shows a price reads from this one file.
   - Navigation menu, footer links.
   - Contact details (email, phone, address, hours).
   - Social/profile links (used in Organization schema `sameAs`).
   - Authors (name, role, photo, short bio), and the team on the About page.
   - Default CTA button text and link.
7. **Preview before publishing:** the CMS preview shows the post or page. For full-site preview, use Netlify deploy previews (noindex). Explain in the plan how the owner previews a change before it goes live.
8. **Undo:** every change is a git commit. Write a short how-to for rolling back a bad change (CMS history or Netlify "Publish deploy" of an earlier deploy).

## 404 handling (important: do NOT redirect all 404s to the homepage)
Redirecting every missing page to the homepage creates soft 404s. Google treats them as errors, and visitors get confused. This is already forbidden in SEO-GUARDRAILS.md §1.

Instead:
1. a helpful 404 page that returns real HTTP 404, with a search box (or list of top pages), links to Pricing, Services, Blog and Contact, and the main CTA;
2. 404 tracking: the 404 page sends an analytics event with the requested URL and referrer. Clarity/GA4 is fine; no extra paid tool;
3. a short monthly routine for the owner: look at the 404 list → for any URL that had a real page or gets visits, add a 301 to the closest matching page in the Redirects manager. Homepage only if nothing related exists.

## Owner guide
At the end, write `CMS-GUIDE.md` in plain English with screenshots. Short step-by-step for: add a blog post, edit a page, upload/replace an image, change a price, add a redirect, find 404s, roll back a change.

## Plan to show the owner first
The CMS choice + login method, the content model (collections and fields), the build checks (redirects, missing URLs, required alt, title/description length), and what happens when a build fails. Wait for approval before installing anything.
