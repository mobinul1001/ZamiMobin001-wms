# Mobile audit (plain list from reading the CSS, batch 4)

No screenshots (owner order). Every item below is fixed for phones (max-width 760px) in src/styles/mobile.css unless the note says otherwise. Footer items are listed but not changed (footer is not touched in Part 4).

## Sideways scroll, scroll-snap, fixed-percent flex basis, nowrap

| File:line | Selector / rule | Fix |
|---|---|---|
| src/styles/home.css:80 | `.hp-plat ` | kept: inside the auto-moving platforms strip |
| src/styles/home.css:284 | `.hp-report-rows b ` | removed / wrapped on phones |
| src/styles/home.css:353 | `.hp-swipe ` | removed / wrapped on phones |
| src/styles/home.css:354 | `.hp-swipe > * ` | removed / wrapped on phones |
| src/styles/home.css:417 | `.hp-tb-link ` | removed / wrapped on phones |
| src/styles/home.css:437 | `.hp-ring b ` | removed / wrapped on phones |
| src/styles/site.css:61 | `body ` | page-level clip, kept |
| src/styles/site.css:72 | `.sr-only ` | not text (screen reader helper) |
| src/styles/site.css:191 | `.log span:last-child ` | removed / wrapped on phones |
| src/styles/site.css:192 | `.float ` | removed / wrapped on phones |
| src/styles/site.css:353 | `@media (min-width: 1081px) ` | desktop/tablet only, not on phones |
| src/styles/site.css:412 | `.cell.w12 ` | removed / wrapped on phones |
| src/styles/site.css:513 | `.prose pre ` | allowed (code block) |
| src/styles/site.css:589 | `@media (min-width: 761px) ` | desktop/tablet only, not on phones |
| src/styles/site.css:840 | `main .card table ` | removed / wrapped on phones |
| src/styles/site.css:846 | `.tbl-wrap ` | removed / wrapped on phones |
| src/styles/plans-page.css:32 | `.pp-toggle .save ` | removed / wrapped on phones |
| src/styles/plans-page.css:89 | `.pp-tscroll ` | removed / wrapped on phones |
| src/styles/plans-page.css:176 | `.pp-toggle label ` | removed / wrapped on phones |
| src/styles/repair-page.css:182 | `.rp-cmp-nav ` | removed / wrapped on phones |
| src/styles/repair-page.css:257 | `.rp-stories ` | removed / wrapped on phones |
| src/styles/repair-page.css:258 | `.rp-stories > * ` | removed / wrapped on phones |
| src/styles/repair-page.css:275 | `.rp-priceline ` | removed / wrapped on phones |
| src/styles/repair-page.css:312 | `.rp-stories ` | removed / wrapped on phones |
| src/styles/repair-page.css:313 | `.rp-cmp-nav ` | removed / wrapped on phones |
| src/styles/migration-page.css:66 | `.mg-marquee ` | allowed auto-moving strip |
| src/styles/footer.css:18 | `.wf-stats span` | not changed (footer) |

## Font sizes under 15px

| File:line | Selector | Size | Phone size now |
|---|---|---|---|
| src/styles/home.css:13 | `.hp-proof ` | .875rem | 15px |
| src/styles/home.css:24 | `.hp-gp small, .hp-hstats small ` | .8125rem | 15px |
| src/styles/home.css:29 | `.hp-float ` | .875rem | 15px |
| src/styles/home.css:42 | `.qf label ` | .875rem | 13px label |
| src/styles/home.css:48 | `.qf-foot ` | .8125rem | 15px |
| src/styles/home.css:54 | `.hp-trust-t ` | .875rem | 15px |
| src/styles/home.css:88 | `.hp-stat span ` | .875rem | 15px |
| src/styles/home.css:97 | `.hp-list ` | .875rem | 15px |
| src/styles/home.css:106 | `.hp-bc .hp-big-label ` | .875rem | 13px label |
| src/styles/home.css:110 | `.hp-big-stats span ` | .875rem | 15px |
| src/styles/home.css:137 | `.hp-chip ` | .8125rem | 13px label |
| src/styles/home.css:150 | `.hp-bar-label ` | .875rem | 13px label |
| src/styles/home.css:157 | `.hp-metrics strong ` | .8125rem | 15px |
| src/styles/home.css:166 | `.hp-tq small ` | .8125rem | 15px |
| src/styles/home.css:167 | `.hp-av ` | .875rem | 15px |
| src/styles/home.css:168 | `.hp-src ` | .8125rem | 15px |
| src/styles/home.css:169 | `.hp-ph-note ` | .8125rem | 15px |
| src/styles/home.css:176 | `.hp-cmp thead > * ` | .875rem | 13px label |
| src/styles/home.css:262 | `.hp-label ` | .8125rem | 13px label |
| src/styles/home.css:271 | `.hp-report-kicker ` | .8125rem | 13px label |
| src/styles/home.css:280 | `.hp-ring span ` | .875rem | 15px |
| src/styles/home.css:282 | `.hp-report-rows li ` | .875rem | 15px |
| src/styles/home.css:288 | `.hp-report-note ` | .8125rem | 15px |
| src/styles/home.css:300 | `.hp-svc-link .d ` | .875rem | 15px |
| src/styles/home.css:324 | `.hp-acc dt ` | .8125rem | 13px label |
| src/styles/home.css:371 | `.hp-bento .hp-bc > p ` | .875rem | 15px |
| src/styles/home.css:376 | `.hp-card-more ` | .875rem | 15px |
| src/styles/home.css:383 | `.hp-card-more .hp-list ` | .8125rem | 15px |
| src/styles/home.css:451 | `.hp-countries .country.card ` | .875rem | 15px |
| src/styles/site.css:135 | `.drop-h ` | .75rem | 13px label |
| src/styles/site.css:140 | `.mnav-h ` | .75rem | 13px label |
| src/styles/site.css:513 | `.prose pre ` | .875rem | 14px (code, allowed) |
| src/styles/site.css:814 | `.hero .offer li ` | .8125rem | 15px |
| src/styles/site.css:854 | `.post-offer .post-offer-k ` | 13px | 13px label |
| src/styles/plans-page.css:7 | `.plans-pg .eyebrow ` | 13px | 13px label |
| src/styles/plans-page.css:32 | `.pp-toggle .save ` | 12px | 13px label |
| src/styles/plans-page.css:40 | `.pp-tag ` | 13px | 13px label |
| src/styles/plans-page.css:88 | `.pp-swipe ` | 14px | 15px |
| src/styles/plans-page.css:177 | `.pp-toggle .save ` | 11px | 13px label |
| src/styles/plans-page.css:183 | `.pp-proof li ` | 14px | 15px |
| src/styles/plans-page.css:223 | `.pp-work-stats span ` | 14px | 15px |
| src/styles/plans-page.css:291 | `.sx > summary .eyebrow ` | 11px | 13px label |
| src/styles/plans-page.css:295 | `.pp-t th, .pp-t td ` | 14px | 15px |
| src/styles/plans-page.css:303 | `.pp-chips li ` | 14px | 13px label |
| src/styles/plans-page.css:333 | `.pp-hero .crumbs ` | 14px | 15px |
| src/styles/plans-page.css:341 | `.pp-hero .eyebrow ` | 12px | 13px label |
| src/styles/repair-page.css:31 | `.rp-k ` | 13px | 13px label |
| src/styles/repair-page.css:55 | `.rp-pick-k ` | 13px | 13px label |
| src/styles/repair-page.css:91 | `.rp-cmp-k ` | 13px | 13px label |
| src/styles/repair-page.css:110 | `.rp-chip ` | 13px | 13px label |
| src/styles/repair-page.css:134 | `.rp-faq-label ` | 13px | 13px label |
| src/styles/repair-page.css:141 | `.rp-subhd ` | 13px | 13px label |
| src/styles/repair-page.css:235 | `.rp-guide-hd .eyebrow ` | 11px | 13px label |
| src/styles/repair-page.css:280 | `.rp-priceline ` | 14px | 15px |
| src/styles/repair-page.css:298 | `.rp-hero .eyebrow ` | 11px | 13px label |
| src/styles/migration-page.css:62 | `.mg-inc p ` | 14px | 15px |
| src/styles/hacked-page.css:12 | `.hk-status p:last-of-type ` | 13px | 15px |
| src/styles/hacked-page.css:35 | `.hk-chips li ` | 14px | 13px label |
| src/styles/malware-page.css:16 | `.mw-cards .card p:last-child:not(:first-child) ` | 14px | 15px |
| src/styles/malware-page.css:31 | `.mw-close label ` | 14px | 13px label |
| src/styles/service-page.css:26 | `.sv-ex-tag ` | 13px | 13px label |
| src/styles/service-page.css:45 | `.sv-pnote summary ` | 14px | 15px |
| src/styles/footer.css:12 | `.wf-eb` | .75rem | not changed (footer) |
| src/styles/footer.css:18 | `.wf-stats span` | .8125rem | not changed (footer) |
| src/styles/footer.css:32 | `.wf-col summary` | .8125rem | not changed (footer) |
| src/styles/footer.css:35 | `.wf-legal` | .875rem | not changed (footer) |
| src/styles/footer.css:41 | `@media(min-width:1001px) and (max-width:1240px)` | .8125rem | not changed (footer) |
| src/styles/footer.css:48 | `.wf-ci a` | .8125rem | not changed (footer) |
| src/styles/footer.css:65 | `.wf-contact` | .75rem | not changed (footer) |
| src/styles/footer.css:69 | `.wf-col summary` | .875rem | not changed (footer) |
