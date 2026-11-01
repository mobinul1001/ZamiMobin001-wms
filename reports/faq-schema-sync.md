# FAQ schema sync and old prices (2026-11-01)

All 498 FAQ schema entries on 50 pages now use the exact visible question and answer. The difference was bigger than the 51 reported earlier, because that figure covered only 10 pages: 228 entries changed and 270 already matched. `npm run build` now fails if a schema question or answer is not on the page.

## Our own prices replaced in FAQ answers
24 replacements on 12 pages, using Essential $79/$790, Growth $149/$1,490, Business $299/$2,990. Annual prices say "2 months free" or "2 meses gratis". Full list: `scripts/lib/faq-approved.mjs`.

## Left unchanged: needs an owner decision

### Other price sets
Master list says to remove these, but replacing them changes what the sentence means.
| Page | Visible answer says |
|---|---|
| `/ecommerce-website-maintenance-packages/` | Costs $145 to $600+; stores pay $145–$295; plans from $145; Ecommerce Starter $145 or $116 billed annually |
| `/shopify-website-maintenance-packages/` | Costs $125 to $500+; stores pay $125–$245; Shopify Premium plan |
| `/website-update-services/` | Plans $49 to $299 per month; "Professional" plan names |
| `/white-label-wordpress-maintenance-support/` | Wholesale $49, $99, $179; $39, $79, $143 at 10+ sites; reselling Advanced at $79; differs from the agencies page ($59, $39) |
| `/website-repair-services/` | Repairs $99–$899; master says one-time fix from $49 |
| `/wordpress-backup-services/` | Plans $29–$199+ per month |

### Market ranges that equal the old prices
These describe the market, so they may be right as they stand. They now sit next to lower plan prices.
| Page | Visible answer says |
|---|---|
| `/best-website-maintenance-for-small-business/` | Most pay $95–$195; typically $95–$195; a professional plan costs $95–$195; WooCommerce $395+ |
| `/how-much-does-website-maintenance-cost/` | Managed plans $95–$395; most pay $95–$195; budget $95–$195 |
| `/how-much-does-wordpress-website-maintenance-cost/` | Managed care plans $95–$395; WooCommerce $195–$600+ |
| `/best-website-maintenance-companies/` | Most companies $95–$500+; entry-level plans $95–$195 |

Proposal: change them to $79–$149 and $79–$299 where the sentence describes full-service plans like ours, and keep wider market ranges such as "$20 to $500+".

### Plan features that no longer match
Names and prices were replaced; the feature wording was not.
- `/best-website-maintenance-for-small-business/`: Growth "adds speed optimization, SEO checks, content edits, and priority support". Master Growth has no SEO checks or priority support.
- `/best-website-maintenance-for-small-business/`: "WooCommerce stores need Business". Master Growth includes WooCommerce support.
- `/wordpress-website-maintenance-packages/`: "Business for WooCommerce stores", same point.

### Service package prices
Design, migration, SEO, speed and white-label FAQ prices wait for `service-package-prices.md`.

## Page language
| Page | Body words by language | Result |
|---|---|---|
| Brazil | Portuguese 608, English 0 | `lang="pt-BR"`, Portuguese meta description, `og:locale`, `og:title`, `og:description` and WebPage schema |
| Spain | English 387, Spanish 342 | Not mostly Spanish: stays `en-US`, description unchanged |

The Portuguese description is new text for owner review: "Manutenção de sites confiável para empresas no Brasil. Mantemos seu site rápido, seguro e atualizado, com cuidado e monitoramento especializado."

## Annual prices
- Rule added: `npm run build` fails if $790, $1,490 or $2,990 appears without "2 months free" or "2 meses gratis".
- `src/data/prices.json` holds the master list and the note.
- Old annual prices outside FAQs ($76, $156, $316 and "20% off" in page bodies) change in the master price step.
