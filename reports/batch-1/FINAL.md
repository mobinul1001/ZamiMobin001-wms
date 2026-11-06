# Batch 1: final report

Nothing is merged and nothing is pushed.

## Stages

| Stage | Branch | Commit | What |
|---|---|---|---|
| 1 | `global-cleanup` | e321608 (6b64ec3 + e321608) | Top bar and cookie bar removed, free hosting / free email removed outside the redesign page, full Services menu (4 groups) |
| 2 | `responsive-fix` | 9e9851c | Mobile and tablet fixes, 44 px tap targets, stronger design QA and build checks |
| 3 | `hacked-page` | b46ec6a | Hacked website recovery page to the owner's design |
| 4 | `malware-page` | 19c45c0 | WordPress malware removal page to the owner's design |
| 5 | `migration-page` | c92565a, follow-up 770c801 | Website migration page; owner answers of 2026-11-06 (below) |

Merge order: `global-cleanup` → `responsive-fix` → `hacked-page` → `malware-page` → `migration-page`. Each branch is stacked on the one before, so merging `migration-page` alone brings all five.

## Test results (on `migration-page`, 770c801, production build)

- Build check: 93 pages, 0 failures (76 warnings, the same kinds as on main: SEO lengths, form notes, 1 image size, 4 anchors, 1 missing URL note).
- URL parity: 815 of 815 rows PASS, `fails: []`.
- Build-check tests: 31 of 31. Browser tests: 29 of 29.
- 11-width sweep (320 to 1920 px), light and dark: 0 problems on the repair, hacked, malware and migration pages.
- All-templates and all-93-pages design QA: last full run after Stage 4 (phone 0, desktop 1 on the backup page, the same as on main). The run after Stage 5 was stopped; the owner moved it to later (`reports/TODO.md`).

## What changed (summary)

- Stage 1: top bar and cookie bar gone from every page; the free hosting and 2 free webmail offers are removed from plans, tables, the country pages and the comparison posts (136 places, listed in stage-1.md); the menu shows every service page.
- Stage 2: phone and tablet fixes on the homepage and shared parts; tap targets; tables scroll in their own box.
- Stages 3 to 5: three new page designs (hacked, malware, migration). All text stays in the HTML; held claims are collapsed with `<!-- OWNER CHECK -->`.
- Follow-up 2026-11-06 (owner answers):
  - Migration prices confirmed in `prices.json` ($149 free with any annual plan / from $399 / from $1,199). The old "Starting from $1499" and the FAQ "starts at $999" (body and FAQ schema) now say $1,199, through `text-edits.mjs`.
  - Malware Protect and Priority show no number: "Fixed quote after a free check" (the old $249 / $349 text stays in the HTML, collapsed under "Price note"). Hacked cleanup stays $149.
  - `/website-redesign-services/`: one line added in the pricing section, through `text-edits.mjs` (new rule type `insertBefore`): "Free hosting and 2 free email accounts are included with a redesign." The paid line "Hosting is $19/month or $190/year" stays on the pricing page.
  - Footer: the dead "Cookie settings" button is now a plain text link "Cookie policy" to `/cookie-policy/` (Portuguese pages: "Política de cookies"). This is the only footer change.

## Analytics (check 3a)

What the built site does now: `Base.astro` sets only the Consent Mode default (all "denied") on production. Nothing loads GA4 (GT-K522B6T8) or Clarity (wqnjbhbxww): their loader was in `consent.js`, which ran only after "Accept" and was removed with the cookie bar. So **with the bar gone, GA4 and Clarity record nothing on the new site.** The owner will set them up later (`reports/TODO.md`, item 1). The analytics setup was not changed.

## Owner decisions

1. **Analytics and EU/UK consent.** GA4 and Clarity are not loading (see above). If they load without asking, visitors from the EU/UK (and the 6 European country pages) are tracked without consent, which GDPR / UK PECR require for analytics cookies. Options: a consent banner for EU/UK only, cookieless GA4 (Consent Mode "denied" with modelling), or accept the risk.
2. **Redesign hosting duration.** The new line states no duration. Is it "first year" or something else?
3. **Malware prices** ($249 Protect, $349 Priority): still pending.
4. **Held claims** ("no downtime" on the migration page is no longer held: owner, 2026-11-06: approved, CLAIMS-AND-DESIGN.md A4b; shown normally, no longer held) (collapsed with OWNER CHECK) on the repair, hacked, malware and migration pages: zero SEO loss, 30-day free fix / re-clean, "you don't pay", 256-bit portal, case numbers. STATUS.md lists "you don't pay" and the malware 30-day re-clean as approved on 2026-11-01, but the malware brief holds them: which wins?
5. **Comparison posts with "hosting included"** (not "free", left as they are): `/best-fixrunner-alternatives/`, `/best-wp-buffs-alternatives/`, `/sitecare-alternative/`, `/how-much-does-website-maintenance-cost/`. With free hosting gone, is "hosting included" still true? The SiteCare post's rounds and verdict also leaned on free hosting.
6. **Real reviews** for the homepage (`src/data/reviews.json` is empty, so the section is not shown).
7. **Services menu groups**: Maintenance, Fix and security, Build and grow, Partners. OK, or move the Partner program?

Kept as false positives (owner, 2026-11-06): CDN free tier, generic free-email advice, the Roundcube webmail post.
