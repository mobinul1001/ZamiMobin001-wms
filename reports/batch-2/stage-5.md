# Batch 2, Stage 5: agency pages (branch b2-agency)

Built on the shared ServicePage template: /white-label-website-maintenance-services-for-agencies/ and /wms-partner-program/.
- White-label: the per-site prices on the page are $59 (1 to 5 sites) and $49 (6 to 20 sites); the brief expected $59 and $39, and neither is in prices.json, so the cards and hero say "Per-site pricing on request" and the old prices stay in the HTML under "Price note" (OWNER CHECK). Body text that states resale margins ("Resell at $149 and keep up to $110 per site", "saves over $4,500+ per month", "Scaling Retainers from $5k to $22k/Mo") is unchanged and listed as an owner question; the case studies section is folded under "Read more" as before.
- Partner: no pricing or results slot (the page has none). The main button is the page's own "Become a WMS Partner" to the partner application form (#partner-form), which stays open and posts to Formspree as before. The earnings example ($250 / $200 / +$50) is the page's own example text.
- Original art: white-label ("your brand" and dashed "our team" slots), partner (hand-off flow).

## Checks
Build 0 failures; URL parity 815/815; page check 100% text on both, every heading, link and FAQ kept; build tests 31/31; browser tests 29/29; titles and metas 92/92.

## Heights
| Page | 1440 | 390 | 360 |
|---|---|---|---|
| white-label | 10,253 | 7,827 | 8,116 |
| partner | 6,538 | 6,601 | 6,856 |
