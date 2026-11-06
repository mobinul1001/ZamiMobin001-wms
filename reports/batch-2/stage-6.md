# Batch 2, Stage 6: plans and countries (branch b2-plans-countries)

Built on the shared ServicePage template:
- /ecommerce-website-maintenance-packages/ and /shopify-website-maintenance-packages/ (Tier B): main button "Start plan" to the plan cards; the store plan prices (prices.json storePlans, monthly and annual) stay visible; #plans and #packages anchors kept; FAQs in <details> stay as they are.
- 9 country pages (USA, UK, Canada, Australia, Ireland, France, Netherlands, Spain, Switzerland): hero with the local "Plans from" price and "Start plan" to #plans, quick answer with local prices, proof strip, the local plan cards open with the local one-time fix and hacked cleanup prices under them, every other H3 part opens from its own heading, the Dutch, Spanish, German and French sections kept as they are, related services, countries, final CTA. Buy-now links to the plans page go to the local cards (as before); the USA store line is kept. Original art: a map pin with the country name and its existing flag.
Held: /website-maintenance-services-for-brazil/ stays on its current layout. Its page language is pt-BR and the new template's labels, quick form and risk band are English; Portuguese labels need the owner's wording (owner question). Its title and meta (Portuguese) were updated in stage 2.
UK is Tier A: the title is the live title; the layout changed and a quick answer was added. If the owner prefers, the UK page can go back to the old layout in one line in src/pages/[...slug].astro.

## Checks
Build 0 failures (country-price and store-price checks pass: #plans, local prices, no dollar price outside the USA page); URL parity 815/815; page check 100% text on all 11 pages, every heading, link and FAQ kept, one H1, no duplicate ids; build tests 31/31; browser tests 29/29; titles and metas 92/92.

## Heights
| Page | 1440 | 390 |
|---|---|---|
| ecommerce | 9,524 | 7,562 |
| shopify | 8,854 | 8,195 |
| USA / UK / Canada / Australia | 4,516 to 4,656 | 7,649 to 7,751 |
| Ireland / France | 5,364 | 8,949 |
| Netherlands / Spain / Switzerland | 7,127 to 7,686 | 6,423 to 6,697 |
Country targets are 3,500 at 1440 and 7,000 at 390: most country pages are over (the local plan cards, open on purpose, and the language sections). No sideways scroll; the main button is on the first phone screen.
