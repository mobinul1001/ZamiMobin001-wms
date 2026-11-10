# Batch 3: final report

Branch `b2-content`. Nothing merged, nothing pushed.

| Item | Status before | What I did | Commit |
|---|---|---|---|
| Card prices = live site (SEO, speed, white-label) | done wrongly (an earlier price script swapped the live tiers) | Removed the swapping rules. Cards are now SEO $499 / $999 / custom from $1,999; speed $99 / $199 / $349 / $499 (4 cards: 4 columns from 1280 px, 2 + 2 from 520, 1 below); white-label $59 / $39 / custom. `prices.json` updated (`confirmed: false`), price guard kept. Design, redesign, support and malware already matched. | de993c1 |
| FAQ prices | mismatched | SEO, speed and white-label FAQs now match the live page. No other number qualified for an edit. 4 proposals (design, repair, update, backup) are in reports/price-mismatches.md. | de993c1 |
| Old-price images ($95 / $195 / $395) | 7 left | Replaced (same path, name, size, format and alt; 29–44 KB). Found and fixed: each migration run was silently restoring the old images; replaced files now live in `overrides/` and survive re-runs. | de993c1 |
| Alt of the 3 comparison images | described the old image | Shortened to describe the new banner. | de993c1 |
| plan-files/ | not in git | Committed (batch 1, 2, 3 prompts). | de993c1 |
| Gap audit | – | reports/final-gap/gap-audit.md (10 areas, evidence per row). | 6dfa7df |
| og:title / twitter:image | missing (og:title on 1 page, twitter:image on all 90) | Base.astro fallbacks. | 97a0279 |
| Service schema | missing on 9 service pages | Added (name, description, provider, areaServed; no Offer). | 97a0279 |
| "John Doe" placeholders | 10 forms | "Your name". | 97a0279, 38de84e |
| Old price in /wordpress-site-hacked-what-to-do/ | $95/mo | $79/mo (master plan). | 97a0279 |
| Repair page sideways swipes | 2 strips | Stack / wrap on phones and tablets (CSS only). | 97a0279 |
| "on Clutch" in the handoff doc | 3 lines | "5.0 rated by our clients". | 97a0279 |
| CMS | missing | `public/admin/` config and page (Sveltia, noindex, no token); `/admin/` excluded from page checks. | 38de84e |
| Launch steps | – | reports/final-gap/launch-remaining.md (11 steps). | 38de84e |

## Still missing, and why
- **Cannibalization lists PDF:** the text is encoded glyphs and no PDF tool is installed, so I audited the same lists from the xlsx.
- **De-optimizing competing pages:** phase 2, by rule (wait 4–6 weeks).
- **Secondary keywords in headings (211 gaps):** heading changes on ranking pages are risky, so these stay proposals.
- **Tier A changes:** proposals only (homepage swipe rows, the old price in the WordPress cost title and stat, the small business "$95+" stat, 8 bylines, the UK layout).
- **Footer phone and address on every page:** this breaks the rule, but the footer may not be touched, so it is listed.
- **/works/ "bangladeshcityhospital.com":** a client's domain; removing it needs the owner's yes.
- **Per-page OG images:** every page has an og:image, so none were generated; 26 pages use the logo.
- **CMS:** needs the owner's repo name and a sign-in, and a test on the preview.

## Owner questions (most important first)
1. **Backup page:** "Emergency restore without a plan starts at $99" is not on the live page (the live tiers are $29 / $59 / $199 a month). Keep it, change it to the live sentence, or remove it?
2. **Design FAQ:** it says $799 / $1,499 / $2,499; the cards (live) say $1,499 / $2,999 / from $5,499. Use the live sentence (proposal in price-mismatches.md)?
3. **SEO audit $199:** not on the live page. Keep the sentence (collapsed, not a card), or remove it?
4. **Repair and update FAQs** use other tiers than the live page (repair $99–$899 ranges vs the confirmed "From $49"; update tiers $49 / $99 / $299 vs the master plans). Which wins?
5. **Footer phone and address on every page:** remove them from the footer, and keep them on the homepage and contact page?
6. **/works/ client domain with "Bangladesh":** keep or remove?
7. **Phase 2 Tier A proposals:**
   - the UK layout;
   - 6 FAQs;
   - bylines on 8 articles;
   - the WordPress cost title "$95–$395";
   - the small business "$95+" stat;
   - the homepage swipe rows.
8. **Native review** of the Portuguese labels on the Brazil page.
9. **Analytics and EU/UK consent:** GA4 and Clarity do not load today.

No screenshots, tests or design checks were run, as ordered.
