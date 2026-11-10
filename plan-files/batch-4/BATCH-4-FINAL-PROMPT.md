# BATCH 4: owner decisions, footer, then the mobile redesign (guideline-only mode)

Branch: first finish Parts 1 to 3 on `b2-content`; then create `mobile-redesign` from `b2-content` for Part 4. Commit after every numbered item. Nothing is merged and nothing is pushed. All rules of `plan-files/batch-2/BATCH-2-FINAL-PROMPT.md` and `plan-files/batch-3/BATCH-3-FINAL-FIX-PROMPT.md` still apply (SEO frozen except what they allow, approved facts only, Tier A protection, no new company claims, free hosting and 2 free email accounts only on the redesign page, no cookie bar, no top bar). Where this file disagrees with an older prompt, this file wins.

## 0. WORKING MODE (owner order, same as batch 3)

The owner has almost no Claude usage left. Until the owner writes "now run checks":
- **No screenshots. No design checks, no responsive sweeps, no Lighthouse, no parity tests, no page checks, no browser tests, no safety pass, no gallery, no new test scripts.** Work from the guidelines. Find problems by reading source, content, `git diff` and the last `dist`.
- Allowed: editing, `git`, scripts that generate image assets, and **one** plain `npm run build` at the end of each Part.
- Do not ask questions. Take the safest option, continue, and put the question in the report.
- Keep `reports/final-gap/PROGRESS.md` (Parts 1 to 3) and `reports/mobile-redesign/PROGRESS.md` (Part 4) current: task, status, commit. If you are stopped and restarted, read them and continue from the first task that is not done.

## PART 1: FAQ decisions (apply)

1. **Backup FAQ:** replace the sentence "emergency restore starts at $99" with a sentence built from the live backup page (plans $29 / $59 / $199 per month).
2. **Design FAQ:** apply your proposed replacement built from the live tiers ($1,499 / $2,999 / from $5,499).
3. **SEO audit $199:** it is not on the live page. Apply your proposal that uses only live-page content. Keep no $199 anywhere.
4. **Repair FAQ:** use only the owner-confirmed wording: small fixes from $49, bigger issues get a fixed quote before work starts, hacked site cleanup $149. Do not add a turnaround time.
5. **Update FAQ:** use the live one-time tiers ($49 / $99 / $299) and say updates are also included in every plan from $79/month.
For 1 to 5: change the visible FAQ text and the FAQ schema together through `text-edits.mjs`, and update `reports/price-mismatches.md` with before and after.

## PART 2: footer contact card (owner decision)

The phone number and the address must show **only on the homepage**. On every other page remove them from the footer HTML (do not just hide them with CSS). Keep the rest of the footer (email, links, columns, social) exactly as it is, and keep the footer on the homepage exactly as it is. Do it in `Base.astro` / `footer.json` with a page check on the path. Do not change the Organization JSON-LD. The homepage NAP block (before the final CTA) stays. The contact page shows the email and the form only. This is the only footer change allowed.

## PART 3: /works/

Leave the "bangladeshcityhospital.com" entry as it is (owner decision: keep). Nothing to do. Remove this question from the owner questions.

Commit Parts 1 to 3, run one plain build, update `reports/final-gap/FINAL.md`.

## PART 4: mobile redesign

Read `plan-files/MOBILE-REDESIGN-PROMPT.md` completely. Do it on branch `mobile-redesign` (from `b2-content`). It is approved by the owner and wins over older prompts about MOBILE layout. The adjustments below win over that file.

### 4.1 Overrides of the mobile prompt
1. **Its section 4 (tests), the Lighthouse and screenshot requirements, the "desktop screenshots must be identical" check, the parity run, the old-vs-new `dist` diff script and the before/after screenshot report (section 7) are NOT to be run now.** Instead keep the SEO guard rules (its section 1) as design rules: same words, headings, links, JSON-LD, alt, FAQ, `lang`; same markup order; mobile layouts by CSS on the same markup. The owner will run the checks later.
2. The report is text only: `reports/mobile-redesign/FINAL.md`, per section: done / partly / not done, files changed, and owner decisions. Skip `AUDIT.md` screenshots; the audit table is a plain list from reading the CSS (file, selector, line).
3. **Tier A pages** (`/`, `/best-website-maintenance-companies/`, `/best-website-maintenance-for-small-business/`, `/how-long-does-website-maintenance-take/`, `/best-wp-buffs-alternatives/`, the php pages): the **homepage mobile redesign is owner-approved, so build it**, but with zero text, heading, link or order changes in the HTML (the duplicate copy of an auto-moving strip, with `aria-hidden="true"` and `tabindex="-1"`, is the only addition). The other Tier A pages get only the global rules (no sideways swipe, font floor, tap targets, no clipping), not the new section layouts, and no quick-answer box.
4. **Article quick answer box (P1):** only on non-Tier-A articles that already have a usable summary or first paragraph. Never invent text. List the others under Owner decisions.
5. **Includes the pages built in batch 2:** apply the service-template rules to `ServicePage.astro` (the 20 rebuilt pages), the country pages and the plans pages, using what is already there (the `<details>` sections, the Read more blocks, the 4-card speed pricing). Do not rebuild them; only fix swipe rows, font sizes, tap targets, tables (Z3), the sticky bar (G1) and clipping.
6. **Header (H2 drill-in menu):** use the real current menu items and the 4 service groups that batch 1 created in `Base.astro`. Every service link stays in the HTML. Do not touch the desktop header. The footer is not touched in Part 4 (Part 2 above was the only footer change).
7. **Directory logos (B2) and case stories (M1):** use only the real logos and stories already in the site or in `src/data`. If something is missing, keep the old text, add `<!-- OWNER CHECK -->`, and list it. Never invent a logo, name, quote or number.
8. The 2-step hero form (H3) may use the small `reportValidity()` script the mobile prompt allows. Same single form, same field names, same Formspree action, same honeypot, same redirect to `/thank-you/`.
9. Prices always come from `prices.json` (Q3 pricing rows included). No hard-coded price.

### 4.2 Priority order (limit-safe, commit after each step)
1. Global CSS rules for all templates: remove sideways swipe and scroll-snap on phones (except the allowed auto-moving strips and `pre`), font floor (nothing under 13 px; body 16 px, secondary 15 px), tap targets 44 px (buttons 52 px), remove `nowrap` that can clip at 320 px, `min-width:0` on grid and flex children. Write the plain-list audit while doing it.
2. Sticky bottom bar G1 and the Z3 phone tables on all templates.
3. Header drill-in menu.
4. Homepage sections in the order of the mobile prompt (hero 2-step form, trust bar K2, Find us on B2, platforms P2, bento C1, pricing Q3, comparison C2, how it works D2, results M1, services accordion D, more services M2, guides F, FAQ E2, countries F2, report card I1).
5. Service-type templates: picker tabs grid, included rows, comparison tiles L1, case stories M1, FAQ E2, countries F2.
6. Blog article (P1) and blog index.
7. Country, about and contact leftovers.

If you run short, stop after the step you are on, write what is done and what is not in `reports/mobile-redesign/FINAL.md`, and commit.

## FINAL REPORT

Final chat message: only a table (Part, status, commit), the owner questions, and anything that failed. Expected owner questions: directory logos and real case stories if missing, article quick answers not built, Tier A mobile layouts left for phase 2, the analytics and EU/UK consent decision, native review of the Portuguese labels, and one line: "No screenshots, tests or design checks were run, as ordered. Run the checks (design QA at 320 to 1440, parity, heading/link/JSON-LD diff, Lighthouse) before merging."
