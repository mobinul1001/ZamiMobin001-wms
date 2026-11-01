# DESIGN-QA.md: design quality standard + self-review loop

The owner should NOT have to point out design problems one by one. Act as a senior UI designer: review your own work against this file, fix everything, and only then send screenshots. This file adds to CLAIMS-AND-DESIGN.md section B. Parity, SEO and claim rules stay the same.

---

## 1. Self-review loop (required before every report)
1. Screenshot every section of the page at **1440px, 768px and 390px**, in **both dark and light** themes (6 screenshots per section).
2. Check each screenshot against section 3 (checklist) and section 4 (known issues).
3. Fix, re-screenshot, repeat until the checklist is clean.
4. Only then report. The report includes:
   - a table "checklist item → pass" per template;
   - first-screen + full-page screenshots in both themes, desktop and mobile;
   - anything you could not fix, and why.
5. Before designing, look at 3–4 high-quality references (e.g. linear.app, vercel.com, stripe.com, kinsta.com, wpbuffs.com) and the owner's **live site** (websitemaintenanceservices.org). The owner likes the live site's **process section**. Use its structure as the base and make it better.

## 2. Design system rules
- **Container:** one width (max 1200px) with 24px side padding on mobile. Every section, table, callout and card row uses the full container width. No block takes half the width and leaves the other half empty, unless the other half has a deliberate visual.
- **Spacing:** 8px scale only. Section padding 112px desktop / 64px mobile. Space between heading and content and between cards is the same everywhere.
- **Type scale:** H1 56–72 / H2 40–48 / H3 22–24 / body 17–18 (desktop). Body text max 65ch. Section intros centred OR left-aligned, never mixed on the same page.
- **Buttons:** one primary style (filled gradient) and one secondary style (outline), same height (48px desktop / 52px mobile), same radius. On mobile, stacked buttons are **full width and equal width**. A CTA is never a plain text link.
- **Cards:** same radius, border and padding everywhere. Light theme: white cards on a tinted section background, with a visible border + soft shadow. Dark theme: subtle border + inner glow. Alternate section backgrounds so sections are visually separated in both themes.
- **Highlights in light mode:** accent colour must be visible. Use coloured eyebrow labels, tinted icon backgrounds, gradient text on key words, a highlighted pricing card, coloured table headers. Light mode must never look grey and flat.
- **Icons:** one set (Lucide), same size per context, always inside a tinted rounded square.
- **Tables:** coloured header row; the "with maintenance / our plan" column is tinted with the accent colour and its header is highlighted; good rows get a ✓ icon, bad rows an ✗ icon. On mobile, tables turn into stacked cards (no horizontal scroll).
- **Lists of short items** (e.g. "What's included in every plan"): a 2–3 column grid of icon cards, never a narrow column of pills.
- **Two-column blocks** (case study, about, CTA): text on one side, a visual / stats / image on the other. Stack on mobile.
- **Process / steps:** one process section per page only. Use a card per step with number, icon, title and text. The connecting line must start at step 1 and end exactly at the last step. Vertical timeline on mobile.
- **Motion:** hover lift on cards and buttons, fade-in on scroll, respecting `prefers-reduced-motion`.

## 3. Checklist (every page, both themes, 3 widths)
- [ ] Header: logo, nav links, theme switch, primary CTA "Get a free quote" (desktop). **Mobile: hamburger menu** opening a full menu (all nav links + Services submenu + CTA), keyboard and screen-reader accessible.
- [ ] Header nav: Services (dropdown), Pricing, Blog, About, Contact. The primary header CTA is **"Get a free quote"** (to /get-a-free-quote/); "See plans" is not the header CTA.
- [ ] Footer: logo + short line, 4 link columns, contact, "Find us on" badges row, cookie settings, copyright. Styled for both themes, with a visual separation from the page.
- [ ] No empty half-width areas; every block aligned to the container edges.
- [ ] All buttons follow the button rules; equal widths when stacked on mobile.
- [ ] Every section has an eyebrow label + H2 + intro in the same style.
- [ ] No duplicated sections (e.g. two "how it works" processes, two "what's included" lists). Merge them.
- [ ] Light mode: accent visible in every section (no flat grey sections).
- [ ] Tables highlighted as in section 2; stacked on mobile.
- [ ] Cookie bar does not cover the header CTA or the first-screen buttons.
- [ ] No text overflow, no broken words, no horizontal scroll at 360px.
- [ ] Lighthouse mobile ≥ 90, CLS 0, contrast ≥ 4.5:1 in both themes.

## 4. Known issues from the owner's review (2026-11-01), all must be fixed
1. **Mobile header has no menu.** Add a hamburger menu. Header CTA = "Get a free quote".
2. **"How it works":** the line runs past step 4, the steps look empty, and there is a second 5-step process ("How do I get started") further down. Merge them into ONE process section styled like the live site's process (cards with number + icon), improved.
3. **"Find us on":** use the real badge/logo images from the live site, each linking to the **same profile URL the live site uses**. Show them at the same height in one row (wrapping on mobile), greyscale with colour on hover in dark mode, colour in light mode. No ratings or stars. Keep only profiles the owner confirms; ITFirms is out.
4. **"Why maintenance matters":** the "Bottom line" callout is half width with empty space on the right. Make it full container width. Highlight the table header, and tint the "With Maintenance" column (light and dark).
5. **Case study card:** the text uses half the card and the right side is empty. Use two columns: text + buttons on the left, a stats/visual panel on the right.
6. **Mobile stacked buttons** ("Choose a plan / Get a quote", "Learn more about us / See our works"): full width, equal width.
7. **"What's Included in Every Plan":** narrow pills with empty space. Use a grid of icon cards (2 columns on mobile, 3–4 on desktop).
8. **Light mode** generally lacks highlights. Apply the light-mode highlight rules to every section.

## 5. Claims still on the mockups (follow CLAIMS-AND-DESIGN.md section A)
- Remove "+142% Growth", "Page 1 Top 3", "98/100 Passed" (SEO page) and "99/100 Passed" (design page), even with an "Example" label.
- Remove "Certified" from "Expert Developers: Certified, experienced team" (no certification confirmed).
- Case study (Altitude Care): keep the numbers only if the owner confirms them; until then show the problem and the work done, without numbers.
- "Expert, Dedicated Team" card text (draft, owner to confirm): "A Dhaka-based team of WordPress developers who work your business hours and explain every change in plain words."

## 6. Workflow
1. Apply this file to the **homepage**, run the self-review loop, and send screenshots.
2. After owner approval, roll the design out to **all templates** in batches (pricing, package, service, country, blog post, blog index, form, about, 404, thank-you). Run the self-review loop for every template before reporting.
3. Do not wait for owner comments on things this file already covers.
