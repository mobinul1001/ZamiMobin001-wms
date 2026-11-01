# LAUNCH-CHECKLIST.md — websitemaintenanceservices.org

## Before launch day
- [ ] Parity test: 0 unresolved FAIL (reports/parity.csv).
- [ ] Owner approved the preview (design, content, claims).
- [ ] Full backup of the WordPress site (files + database) downloaded and stored safely. Keep at least 3 months.
- [ ] Export of current DNS records saved (screenshot + text): A, AAAA, CNAME, **MX**, **TXT (SPF, DKIM, DMARC, Google verification)**.
- [ ] Netlify production site created with the custom domain added (not yet pointed).
- [ ] Search Console verification method that survives the move (DNS TXT record preferred).
- [ ] Analytics / tag IDs added to the new site.
- [ ] Contact form sends to the right inbox (tested on preview).
- [ ] Pick a low-traffic time (US night).
- [ ] Set the Effective Date on /privacy-policy/ and /cookie-policy/ to launch day.

## Launch day
1. [ ] Set the custom domain as primary in Netlify, then run a new production build. Noindex lifts only on that build (it needs CONTEXT=production and URL=the real domain). Confirm production pages output index robots tags.
2. [ ] Point DNS to Netlify **without touching MX/TXT records** (if you change nameservers, re-create every MX/TXT record first).
3. [ ] Wait for DNS; confirm HTTPS certificate is active on Netlify.
4. [ ] curl -I the homepage and 10 key URLs → 200 from Netlify.
5. [ ] curl -I every 301 in url-map.csv → 301 to the final URL, no chains.
6. [ ] Open /sitemap.xml and /robots.txt on the live domain.
7. [ ] Send a test email to and from the domain (email still works).
8. [ ] Submit the sitemap in Search Console; Request indexing for /, /monthly-website-maintenance-packages/, /best-website-maintenance-companies/, /best-website-maintenance-for-small-business/, /wordpress-website-maintenance-packages/.
9. [ ] Turn the old WordPress install off from public access (or keep it on a private URL) so it is not reachable as a duplicate.

## Weeks 1–6
- [ ] Daily (week 1), then weekly: Search Console → Pages → "Not found (404)" and "Page with redirect"; fix any unexpected 404 with a 301.
- [ ] Compare clicks/impressions per page with the pre-launch export.
- [ ] Expect 2–4 weeks of ranking fluctuation; do not make large changes during this time.

## Rollback plan (if something goes badly wrong)
- Point DNS back to the old hosting (old A/CNAME records saved above). The WordPress backup stays untouched until week 12.
