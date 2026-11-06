# Batch 2, Stage 4: services B (branch b2-services-b)

Built on the shared ServicePage template (stage 3): /website-support-services/, /website-update-services/, /wordpress-backup-services/.
Held, not rebuilt:
- /website-hosting-and-maintenance/ is a blog post (Article template) in Tier B (best query "hosting website maintenance" #17 with 211 impressions). Moving it to the service template would drop its author and date block and change its page type, so it stays as it is (owner decision).
- /website-malware-scanner/ is a short tool page with its own form (Form template, 5.8 KB); it stays on the form layout.
- /website-maintenance-services-for-small-business/ is not a real page (not in url-map.csv as 200).

Template additions: unconfirmed prices hide per page, confirmed ones stay (update and backup show "Plans from $79/mo"); support's WS Starter / Growth / Premium prices ($199 / $399 / $699) are not in prices.json, so they show "Fixed quote after a free check" with the old text under "Price note" (OWNER CHECK). Long feature tables in pricing open from "Compare all features". FAQs written as plain paragraphs are read too. Original art: support (ticket thread), update (version ladder and shield), backup (restore points). The hero shows all of the page's own links as text links.

## Checks (production build)
Build 0 failures; URL parity 815/815; page check 100% text on all 7 batch-2 service pages, every heading, link and FAQ kept, one H1, no duplicate ids; build tests 31/31; browser tests 29/29; titles and metas 92/92.

## Heights
| Page | 1440 | 390 | 360 |
|---|---|---|---|
| support | 9,932 | 7,474 | 7,758 |
| update (long page, target 9,000 / 15,000) | 9,830 | 8,320 | 8,628 |
| backup | 8,628 | 7,182 | 7,519 |
No sideways scroll; main button on the first phone screen.
