# To do later (owner's list, 2026-11-06)

Not done on purpose. The owner asked to focus on content, pages and SEO first.

| # | Item | State | Notes |
|---|---|---|---|
| 1 | GA4 and Microsoft Clarity | Not set up. The owner sets them up later. | The built site loads no analytics. `Base.astro` sets only the Consent Mode default (everything "denied"); the old loader (`consent.js`, IDs GT-K522B6T8 and wqnjbhbxww) was removed with the cookie bar in batch 1, Stage 1. Until a loader is added, GA4 and Clarity record nothing on the new site. Decide the EU/UK consent approach at the same time (see the risk in reports/batch-1/FINAL.md). |
| 2 | Design QA, all templates and all 93 pages (desktop and phone) | Not run. Run it only when the owner asks. | Done so far: the 11-width sweep of each new page (repair, hacked, malware, migration) with 0 problems; all pages at desktop and phone after Stage 4. Command: `node scripts/design-qa.mjs --no-lighthouse`, then `--all-pages` and `--all-pages --phone`. |
| 3 | Batch 2 responsive and visual checks (section 8 of BATCH-2-FINAL-PROMPT: 8 widths, light and dark, heights, Lighthouse, screenshots, gallery.html) | Not run. Run with item 2. | Batch 2 is done content-and-SEO first. |
| 4 | Phone first-screen test on the malware page (360 x 640) | Fixed 2026-11-06, owner to re-check later. | The hero price line got longer when the pending $249/$349 were replaced by "fixed quote after a free check", which pushed the main button below the first 360 x 640 screen (it already failed by a few px at the batch-1 commit). The line now reads "Cleanup $149 · Protect and Priority: fixed quote after a free check", with a smaller price line under 390 px. Browser tests 29/29. |
