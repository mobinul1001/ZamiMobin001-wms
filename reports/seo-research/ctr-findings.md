# CTR findings (GSC, last 3 months; bot and unrelated queries from "Not a target" removed)

| Page | Tier | Impressions | Clicks | CTR | Weighted position | Best position |
|---|---|---|---|---|---|---|
| /best-website-maintenance-companies/ | A | 51624 | 14 | 0.03% | 26.8 | 1 |
| /best-website-maintenance-for-small-business/ | A | 32511 | 5 | 0.02% | 8.8 | 1 |
| / | A | 26624 | 25 | 0.09% | 25.9 | 1 |
| /how-much-does-website-maintenance-cost/ | A | 13558 | 1 | 0.01% | 41.2 | 1 |
| /wordpress-website-maintenance-packages/ | B | 12780 | 0 | 0.00% | 51.8 | 1 |
| /monthly-website-maintenance-packages/ | C | 7762 | 0 | 0.00% | 75.9 | 1 |
| /how-much-does-wordpress-website-maintenance-cost/ | A | 7535 | 2 | 0.03% | 20.4 | 1 |
| /website-maintenance-checklist/ | B | 3084 | 2 | 0.06% | 43.3 | 1 |
| /shopify-website-maintenance-packages/ | B | 2775 | 2 | 0.07% | 29.7 | 1 |
| /salon-seo/ | B | 2363 | 0 | 0.00% | 15.5 | 1 |
| /how-long-does-website-maintenance-take/ | A | 1782 | 4 | 0.22% | 11.0 | 1 |
| /agreement/ | B | 1702 | 1 | 0.06% | 38.7 | 1 |
| /ecommerce-website-maintenance-packages/ | B | 1659 | 2 | 0.12% | 41.3 | 1 |
| /wordpress-malware-removal/ | C | 1017 | 0 | 0.00% | 41.4 | 1 |

Likely causes (5 lines):
1. Titles and metas read like a list of keywords, not an answer: nothing in the snippet says why to click (no price, no "compare N companies", no time answer).
2. The "best / small business" pages rank on long commercial queries (e.g. "website maintenance package pricing small business") where Google shows ads, a list and AI answers above position 4 to 6, so clicks go elsewhere.
3. Weighted positions are much lower than best positions: many impressions come from positions 20 to 60 where clicks are near zero.
4. The homepage's main query sits around #12, page 2, which explains its very low CTR more than the snippet does.
5. Sitelink and fragment rows (#list, #plans): 0 GSC rows point at URLs with a fragment, so part of the impressions are sitelinks that rarely get clicked.

Plan: Tier A pages keep their live title and get a new meta description (answer + proof + action); Tier B keeps the primary keyword first and every ranking word, adds one modifier; Tier C gets full title and meta optimization (snippets.csv). Track CTR per page in Search Console 4 to 6 weeks after launch.
