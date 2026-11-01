# Brand and Design Guideline

The design system behind websitemaintenanceservices.org: colours, type, spacing and components, in a light and a dark theme.

**Source of truth:** `src/styles/site.css`. If this file and the CSS differ, the CSS is right.

**Status:** in use on the site; values may still change during owner review.

## 1. Reusing this for another company

**Keep as it is:** spacing, type scale, radius, layout, components, motion and accessibility rules.

**Change for each company:**
1. Logo and company name.
2. The brand colours in section 3.
3. The icon colours and step colours, if they clash with the new brand.
4. All text, prices, claims, badges and profile links.

**Do not carry over:** the WMS logo, the WMS badges and profile links, and any WMS claim or price.

After changing colours, run the contrast check in section 13. A brand colour that works on white often fails as dark-mode text, so each theme needs its own accent.

## 2. Design character

Modern premium SaaS: a software product feel, with plain words and visible prices.

- Confident: big bold headings and generous space.
- Honest: anything that looks like data but is not real carries an "Example" label.
- Clear: every section has one job, and nothing appears twice.
- Colourful with control: one brand colour leads, and other colours only mark categories.

## 3. Colour

### Brand

| Role | Token | Light | Dark |
|---|---|---|---|
| Accent (labels, icons, borders) | `--accent` | `#6d34e0` | `#b39dff` |
| Link | `--link` | `#5a28c4` | `#c9b8ff` |
| Eyebrow text | `--eyebrow` | `#5a28c4` | `#d4c6ff` |
| Eyebrow background | `--eyebrow-bg` | `#e8ddff` | `rgba(167,139,250,.18)` |
| Focus ring | `--focus` | `#6d34e0` | `#c9b8ff` |

### Gradients

| Use | Token | Light | Dark |
|---|---|---|---|
| Primary button | `--btn` | `linear-gradient(120deg, #6d34e0, #a21caf)` | `linear-gradient(135deg, #6d34e0, #9333ea)` |
| Highlighted word in a heading | `--hl` | `linear-gradient(100deg, #6d34e0, #c026d3 55%, #e11d48)` | `linear-gradient(100deg, #c4b5fd, #e879f9 60%, #a5b4fc)` |
| Lines and highlighted borders | `--grad` | `linear-gradient(115deg, #6d34e0 0%, #c026d3 55%, #f43f5e 100%)` | `linear-gradient(115deg, #8b5cf6 0%, #d946ef 55%, #6366f1 100%)` |

Final call-to-action band, the same in both themes:
`radial-gradient(60% 90% at 15% 0%, #7c3aed 0%, transparent 70%), radial-gradient(55% 90% at 90% 100%, #a21caf 0%, transparent 70%), #120a30`, with white headings and `#e4e1f3` text.

### Text

| Role | Token | Light | Dark |
|---|---|---|---|
| Headings | `--head` | `#15102e` | `#fff` |
| Body | `--ink` | `#33304a` | `#d3d7e9` |
| Secondary | `--muted` | `#57546f` | `#a9afca` |

### Surfaces

| Role | Token | Light | Dark |
|---|---|---|---|
| Page and hero | `--bg` | `#fff` | `#070a1c` |
| Section | `--sec` | `#fbf9ff` | `#070a1c` |
| Alternate section | `--alt` | `#f1ebff` | `#0e1233` |
| Card | `--card` | `#fff` | `#12173a` |
| Highlighted card | `--pop-bg` | `#f8f3ff` | `#171b47` |
| Footer | `--footbg` | `#ece4ff` | `#04061a` |
| Small inner tile | `--mini` | `#f4f0fd` | `rgba(255,255,255,.06)` |
| Table header | `--th` | `#e3d6ff` | `#2a2266` |
| Table header text | `--th-ink` | `#3b1a94` | `#e4dbff` |
| Highlighted table column | `--with` | `#f3ecff` | `#1c1f50` |

### Lines

| Role | Token | Light | Dark |
|---|---|---|---|
| Divider | `--line` | `#e5dff5` | `rgba(255,255,255,.1)` |
| Strong divider | `--line-strong` | `#b4abd3` | `rgba(255,255,255,.3)` |
| Card border | `--card-line` | `#e2daf6` | `rgba(167,139,250,.22)` |

### Status

| Role | Token | Light | Dark |
|---|---|---|---|
| Good | `--ok` | `#047857` | `#4ade9e` |
| Good, small text on a tint | `--ok-ink` | `#065f46` | `#4ade9e` |
| Bad | `--bad` | `#be123c` | `#fb7185` |

### Icon category colours

Used on icon backgrounds in rotation.

| Token | Light | Dark |
|---|---|---|
| `--c1` | `#6d34e0` | `#b39dff` |
| `--c2` | `#0369a1` | `#7dd3fc` |
| `--c3` | `#be185d` | `#f9a8d4` |
| `--c4` | `#047857` | `#6ee7b7` |
| `--c5` | `#b45309` | `#fcd34d` |
| `--c6` | `#4338ca` | `#a5b4fc` |

### Process step colours

White numbers on solid circles, the same in both themes: `#1d6fd8`, `#0a7f54`, `#c2410c`, `#7e22ce`, `#be185d`.

## 4. Typography

**Font:** Inter, variable, self-hosted as one Latin `woff2` file with `font-display: swap`. It is free to use under the SIL Open Font License. Fallback: Arial, adjusted to Inter's size so the page does not shift when the font loads:

```css
@font-face { font-family: Inter; src: url(/fonts/inter-latin-wght-normal.woff2) format("woff2"); font-weight: 100 900; font-display: swap; }
@font-face { font-family: "Inter Fallback"; src: local("Arial"); size-adjust: 107%; ascent-override: 90%; descent-override: 22%; line-gap-override: 0%; }
body { font-family: Inter, "Inter Fallback", Arial, sans-serif; }
```

| Style | Desktop | Tablet (to 1080px) | Phone (to 760px) | Weight | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| H1 | 72px | 56px | 40px | 800 | 1.04 | -0.04em |
| H2 | 48px | 40px | 32px | 800 | 1.12 | -0.03em |
| H3 | 22px | 22px | 20px | 700 | 1.3 | -0.015em |
| Hero subline | 24px | 24px | 18px | 400 | 1.45 | 0 |
| Section intro | 18px | 18px | 16px | 400 | 1.6 | 0 |
| Body | 17px | 17px | 16px | 400 | 1.6 | 0 |
| Small, labels | 15px | 15px | 15px | 400 to 700 | 1.5 | 0 |
| Large price | 56px | 56px | 56px | 800 | 1 | -0.04em |

Rules:
- Body text stays within 65 characters per line.
- Numbers in prices and stats use tabular figures.
- Section headings are left-aligned on every page.
- One key word in a heading may carry the `--hl` gradient, never a whole heading.

## 5. Spacing and layout

**Spacing scale, 8px steps only:** 8, 16, 24, 32, 40, 48, 56, 64, 80, 112.

| Item | Desktop | Phone |
|---|---|---|
| Container, content width | 1200px maximum | Full width |
| Side padding | 24px | 24px |
| Section padding, top and bottom | 112px | 64px |
| Gap between cards | 24px | 16px |
| Heading block to content | 48px | 32px |

Breakpoints: tablet at 1080px and below, phone at 760px and below.

Rules:
- Every block reaches both container edges. No block sits at half width with empty space beside it, unless the other half holds a deliberate visual.
- Section backgrounds alternate, so sections read as separate in both themes.
- Two-column blocks stack on phones.

## 6. Shape and depth

| Item | Value |
|---|---|
| Small radius (tags, small tiles) | 8px |
| Medium radius (buttons, icon squares, FAQ) | 16px |
| Large radius (cards, callouts, tables) | 24px |
| Pills (eyebrows, chips) | 99px |

| Shadow | Light | Dark |
|---|---|---|
| Card | `0 2px 8px rgba(40,20,90,.05), 0 16px 32px -24px rgba(40,20,90,.28)` | `inset 0 1px 0 rgba(255,255,255,.08), inset 0 0 32px rgba(139,92,246,.08)` |
| Card on hover | `0 24px 56px -24px rgba(76,29,149,.42)` | `inset 0 1px 0 rgba(255,255,255,.1), inset 0 0 32px rgba(139,92,246,.14), 0 24px 56px rgba(109,52,224,.34)` |
| Primary button | `0 8px 24px rgba(109,52,224,.32)` | `0 0 0 1px rgba(196,176,255,.32) inset, 0 8px 32px rgba(139,92,246,.48)` |
| Highlighted card | `0 24px 64px -24px rgba(192,38,211,.5)` | `0 0 72px rgba(168,85,247,.38)` |

## 7. Logo

- Height 42px in the header and footer on desktop, 36px in the header on phones. Left-aligned, with a fixed width and height so nothing shifts on load.
- Dark theme: use a white logo file if there is one. Otherwise `filter: brightness(0) invert(1)`.
- Do not stretch it, recolour it, or put it on a busy background.

## 8. Icons

- One set only: Lucide, free under the ISC license, as inline SVG. Stroke 2px, round caps and joins, no fill.
- Sizes: 24px in cards, 16px inside buttons and tick marks.
- Card icons always sit in a tinted rounded square: 48 × 48px, radius 16px, background = the icon colour at 14%.
- Tick and cross: 24 × 24px square, radius 8px, in the good or bad colour at 14%.

## 9. Components

### Buttons
| Item | Value |
|---|---|
| Height | 48px desktop, 52px phone |
| Padding | 8px 24px |
| Radius | 16px |
| Text | 16px, weight 650 |
| Primary | `--btn` gradient, white text, button shadow |
| Secondary | Transparent, 2px border in the accent colour |
| Hover | Lift 2px |

- Only these two styles.
- A call to action is always a button, never a plain text link.
- Buttons stacked on phones are full width and equal width.
- On dark bands, the primary becomes a white button with dark text.

### Cards
Radius 24px, padding 24px, 1px `--card-line` border, card shadow, 4px lift on hover. Same on every card.
- Light theme: white cards on tinted sections.
- Dark theme: subtle border with inner glow.

### Section heading block
Every section has the same three parts, in this order: eyebrow (a pill with 15px bold text), H2, then an intro of 18px or less in `--muted`.

### Chips
Small facts such as "No contract". Pill, 15px, weight 600, 1px border.

### Callout
Full container width, radius 24px, 4px accent border on the left, a soft accent tint fading to the card colour. Text on the left, button on the right.

### Pricing cards
Three across. The popular plan has a 2px `--grad` border, `--pop-bg` background, a large shadow and a "Most popular" tag. Monthly/annual toggle above the cards. Features as a tick list.

### Tables
- Coloured header row, using `--th`.
- The "our plan" or "with" column: gradient header with white text, `--with` tint on the cells.
- A tick on good rows, a cross on bad rows.
- On phones, each row becomes a stacked card with its column labels. No horizontal scroll.

### Process steps
- One process section per page.
- A numbered circle (64px, 48px on phones) above a card with icon, title and text.
- The connecting line runs from the first number and ends exactly at the last.
- Desktop: one row. At 1080px and below: vertical timeline.

### Short lists
Grid of icon cards, 2 columns on phones and 3 to 5 on desktop. Never a narrow column of pills.

### FAQ
Accordion, 2 columns on desktop and 1 at 1080px and below. The plus icon rotates 45° when open. Answers stay in the page HTML even when closed.

### Hero
Full-width H1 on top. Below it, 5 columns of text, chips, buttons and facts on the left, and 7 columns with a product visual on the right. The background is soft radial gradients in CSS.

### Example visuals
Dashboards and reports are built in HTML, CSS and SVG, carry a visible "Example" tag, and are never presented as real client data.

### Case study
Two columns: text and buttons on the left, a tinted panel on the right showing before → after.

### Final call to action
A rounded band using the final gradient, text on the left, buttons on the right.

### Header
Logo, Services dropdown, other nav links, theme switch and one primary button, on a sticky blurred bar. At 1080px and below: a hamburger opens a full menu. On phones the primary button moves into that menu.

### Footer
4px gradient line on top; logo, short description, three icon lines and social buttons on the left; 3 link columns on the right; a "Find us on" badge row; a bottom bar with copyright on the left and legal links on the right.

### Page end
On every page, in this order: business details block (eyebrow, name, one line, then address, phone and website cards in one bordered row), final call-to-action box, footer.

Badges are all 48px high (40px on phones). They are colour in light mode, and greyscale until hover in dark mode.

### Cookie bar
Fixed to the bottom, with Accept and Reject of equal weight. It must never cover the header button or the first-screen buttons.

## 10. Themes

- Light and dark are two themes of one design: same layout, different tokens.
- A sun/moon button switches them. The default follows the visitor's system setting, and the choice is remembered.
- This script goes inline in `<head>`, before the CSS, so there is no flash:

```html
<script>(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})()</script>
```

- Light mode must never look flat and grey. Use coloured eyebrows, tinted icons, gradient key words, a highlighted pricing card and coloured table headers.
- Dark mode uses dark navy, not pure black, with glow in CSS only.

## 11. Motion

- Hover lift on cards and buttons, 0.18 to 0.22s.
- Fade-in on scroll: 16px rise, 0.55s.
- All of it switches off under `prefers-reduced-motion`.
- No carousels, popups or countdowns.

## 12. Writing and claims

- Short sentences and plain words.
- No invented statistics, clients, reviews, awards, prices or results.
- Only state what the company can prove.
- Prices are visible on the page.

## 13. Quality checks

Before any page is shown, check it at 1440, 768 and 390px in both themes.

| Check | Target |
|---|---|
| Lighthouse mobile performance | At least 90 |
| Layout shift (CLS) | 0 |
| Text contrast | At least 4.5:1 (3:1 for large text) in both themes |
| Horizontal scroll at 360px | None |
| Broken words or overflowing text | None |
| Duplicate sections | None |

Colour pairs to re-test whenever colours change, in each theme:
- `--ink`, `--muted`, `--head` and `--accent` on `--sec`, `--alt` and `--card`.
- `--link` and `--ok` on `--sec`, `--alt` and `--card`.
- `--bad` on `--card`.
- `--th-ink` on `--th`.
- White on both ends of `--btn`, and on each step colour.

## 14. Copy-paste tokens

```css
:root {
  --s1: 8px; --s2: 16px; --s3: 24px; --s4: 32px; --s5: 40px; --s6: 48px; --s7: 56px; --s8: 64px; --s10: 80px; --s14: 112px;
  --body: 1.0625rem; --fs-small: .9375rem; --fs-h3: 1.375rem; --fs-h2: 3rem; --fs-h1: 4.5rem;
  --section: var(--s14); --gutter: var(--s3); --measure: 65ch; --btn-h: 48px;
  --r-s: 8px; --r-m: 16px; --r-l: 24px;

  /* Light theme */
  --bg: #fff; --sec: #fbf9ff; --alt: #f1ebff; --card: #fff; --footbg: #ece4ff;
  --ink: #33304a; --head: #15102e; --muted: #57546f; --link: #5a28c4;
  --accent: #6d34e0; --ok: #047857; --ok-ink: #065f46; --bad: #be123c; --focus: #6d34e0;
  --line: #e5dff5; --line-strong: #b4abd3; --card-line: #e2daf6; --mini: #f4f0fd;
  --eyebrow-bg: #e8ddff; --eyebrow: #5a28c4;
  --btn: linear-gradient(120deg, #6d34e0, #a21caf);
  --grad: linear-gradient(115deg, #6d34e0 0%, #c026d3 55%, #f43f5e 100%);
  --hl: linear-gradient(100deg, #6d34e0, #c026d3 55%, #e11d48);
  --pop-bg: #f8f3ff; --th: #e3d6ff; --th-ink: #3b1a94; --with: #f3ecff;
  --c1: #6d34e0; --c2: #0369a1; --c3: #be185d; --c4: #047857; --c5: #b45309; --c6: #4338ca;
  color-scheme: light;
}
:root[data-theme="dark"] {
  --bg: #070a1c; --sec: #070a1c; --alt: #0e1233; --card: #12173a; --footbg: #04061a;
  --ink: #d3d7e9; --head: #fff; --muted: #a9afca; --link: #c9b8ff;
  --accent: #b39dff; --ok: #4ade9e; --ok-ink: #4ade9e; --bad: #fb7185; --focus: #c9b8ff;
  --line: rgba(255,255,255,.1); --line-strong: rgba(255,255,255,.3); --card-line: rgba(167,139,250,.22); --mini: rgba(255,255,255,.06);
  --eyebrow-bg: rgba(167,139,250,.18); --eyebrow: #d4c6ff;
  --btn: linear-gradient(135deg, #6d34e0, #9333ea);
  --grad: linear-gradient(115deg, #8b5cf6 0%, #d946ef 55%, #6366f1 100%);
  --hl: linear-gradient(100deg, #c4b5fd, #e879f9 60%, #a5b4fc);
  --pop-bg: #171b47; --th: #2a2266; --th-ink: #e4dbff; --with: #1c1f50;
  --c1: #b39dff; --c2: #7dd3fc; --c3: #f9a8d4; --c4: #6ee7b7; --c5: #fcd34d; --c6: #a5b4fc;
  color-scheme: dark;
}
@media (max-width: 1080px) { :root { --fs-h1: 3.5rem; --fs-h2: 2.5rem; } }
@media (max-width: 760px) { :root { --section: var(--s8); --fs-h1: 2.5rem; --fs-h2: 2rem; --fs-h3: 1.25rem; --body: 1rem; --btn-h: 52px; } }
```
