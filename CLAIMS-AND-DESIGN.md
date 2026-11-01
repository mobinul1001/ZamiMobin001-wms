# CLAIMS-AND-DESIGN.md: owner decisions on claims + design direction (2026-11-01)

Same rules as CLAUDE.md: no invented facts. Apply the claim decisions below sitewide (every page, schema, meta descriptions, FAQ answers).

---

## A. Claims: what to replace, keep or remove

### A1. Client / website numbers
- Remove every "100+ websites", "500+ businesses", "500+ websites", "500+ sites" and "4,800+ repaired".
- Replace with ONE line used everywhere: **"30+ websites built and maintained for businesses in Canada, the UK, the Caribbean and Bangladesh."**
  (The basis is the owner's portfolio list of 35 sites in section A6. 30+ is the conservative figure.)

### A2. Years of experience
- Remove all "10+ / 11+ / 12+ years" and "since 2016" until the owner confirms the founding year.
- Do not replace with another number. Leave a TODO in claims-list.csv: `founding year: owner to confirm`.

### A3. Ratings and review counts
- Remove every star rating and review count (4.9, 213, 165, 120, 4,800, 150, 180) from visible text. Schema is already removed.
- Add nothing in their place now. Later, when real reviews exist on Google Business Profile or Clutch, link to that profile and show the real count from there.

### A4. Testimonials
- Remove all ~70 quote-style testimonials. None of them can be verified, and some mention old plan names.
- Replace the testimonial sections with a **"Websites we look after" portfolio block**: site name, industry, country, and a link to the live site (links: `rel="nofollow noopener"`). The live sites are real proof that a visitor can check.
- Keep an empty, reusable "Client words" component. Add a quote only when the owner sends one with the client's name, company and written OK.

### A5. Location
- Replace "USA-Based" and any similar wording with: **"Dhaka-based team, working US & UK business hours."**
- Keep the +880 phone number as it is. The rename of `/website-maintenance-services-for-usa/` content follows the same rule: it is a page for US customers, not a US office.

### A6. Portfolio list (owner-supplied, 2026-11-01)
Use only for the portfolio block, after the owner confirms which ones may be shown (send the owner this table to tick).
The industry is guessed from the site name, so check each site before publishing. Sites marked "own brand" seem to belong to the owner's group, so label them **"Our projects"**, not "clients".

| Site | Likely industry | Country (from domain/name) | Note |
|---|---|---|---|
| moarmortgages.ca | Mortgage | Canada | |
| mipropertyportal.com | Real estate portal | ? | |
| dhakakitchen.ca | Restaurant | Canada | |
| dhakabazar.ca | Grocery / retail | Canada | |
| seocourseinbangladesh.com | Education | Bangladesh | own brand? |
| softwaredevelopmentontario.ca | Software agency | Canada | own brand? |
| websitemaintenanceservices.org | — | — | this site: exclude |
| whitelabelseolocal.com | Agency | ? | own brand? |
| whitelabelwebsitedevelopment.com | Agency | ? | own brand? |
| cybershieldbd.com | Cyber security | Bangladesh | own brand? |
| unitscaledigital.com | Digital agency | ? | own brand? |
| zaagsys.com | Software | ? | |
| glamhairstudio.uk | Hair salon | UK | |
| woodwardbarbers.com | Barber | ? | |
| southamptonseo.agency | SEO agency | UK | own brand? |
| stluciantaxiandtours.com | Taxi & tours | St Lucia | |
| premiumshawarma.com | Restaurant | ? | |
| galavizbarbershop.com | Barber | ? | |
| marcstaxiservicetours.com | Taxi & tours | St Lucia? | |
| mariustaxiandtours.com | Taxi & tours | St Lucia? | |
| commerdo.com | B2B eCommerce | ? | own brand? |
| nextjsdevelopment.agency | Dev agency | ? | own brand? |
| thatsaas.com | SaaS | ? | own brand? |
| estatyc.com | Real estate | ? | |
| aqsaalmadena.com (Amco) | Business | ? | |
| dermatologywebsitedesign.com | Agency | ? | own brand? |
| islamarc.com | Islamic content | ? | |
| launchcraftar.com | ? | ? | |
| leerenbeautysalon.com | Beauty salon | ? | |
| riadalashekin.com | Hotel / riad | Morocco? | |
| whatgenerationami.fun | Web app | — | own project? |
| nannugroup.com | Business group | Bangladesh? | |
| altitudecare.net | Healthcare/care | ? | |
| socanalyst.pro | Security / SOC | ? | own brand? |
| thanavimadani.org | Nonprofit / education | ? | |

### A7. Guarantee
- Replace "100% Malware Removal & Blacklist Reversal Guarantee" with: **"If we can't clean your hacked site, you don't pay."** (Owner to confirm. This is a promise the business can always keep.)
- Sitewide plan promise: **"No contract. Cancel anytime."**
- No other guarantees (uptime %, ranking, "100%") anywhere.

### A8. Case study
- `/website-maintenance-case-study/`: remove the "Paraphrased" quote. Keep the page only if the client is in the portfolio list and the owner confirms the facts. Otherwise list it for the owner as "rewrite or noindex". Do not delete it (the URL must keep working).

---

## B. Design direction: "Modern premium SaaS" (2026 style)

Replaces "Calm engineering" (owner, 2026-11-01), which looked too plain: mostly text lists, small headings, links instead of buttons, little colour or visuals.

**Goal:** the site should look like a premium software product, and the visitor should still see exactly what they get and what it costs. Honest claims and visible prices remain the advantage.

### B1. Look
One design with two themes (owner, 2026-11-01), switched by a sun/moon button in the header. The default follows the visitor's system setting, the choice is remembered, and an inline script in `<head>` sets the theme so there is no flash on load.
- **Dark:** dark navy with brand purple glow and gradients in CSS only, in the spirit of linear.app and vercel.com.
- **Light:** white base with bold purple gradients and colourful cards, in the spirit of stripe.com and framer.com.

Both themes pass contrast checks and keep CLS 0. Also in both:
- **Colour:** the brand purple and the purple/neon style of the blog images. Text keeps readable contrast.
- **Type:** one self-hosted sans-serif (Inter). Big bold headings, 56–72px on desktop, clear hierarchy and generous spacing. Body at least 16px. Tabular figures for prices.
- **Visual motif:** a large "live maintenance dashboard" built in HTML, CSS and SVG, clearly labelled "Example". Nothing in it is presented as a real client result.
- **Icons:** inline SVG line icons (Lucide). No icon library download.
- **Buttons:** real buttons for every call to action, not plain text links.
- **Motion:** hover lift and scroll fade-in only, and none under prefers-reduced-motion. No carousels, popups or countdowns.
- **Spacing:** one container (1200px), section padding 112px on desktop and 64px on mobile, an 8px spacing scale, one type scale, text at most 65ch, everything on the same grid.
- **Imagery:** real team photos when the owner supplies them; no stock people.

### B2. Homepage structure
1. **First screen:** H1 "Website Maintenance Services & Support", subline, offer line "Plans from $79/mo · First month free · Free hosting for 1 year · No contract", real buttons on the left; large dashboard visual, labelled "Example", on the right. Then the row "Dhaka-based team · US & UK hours · 30+ websites maintained".
2. **Platforms we support:** WordPress, WooCommerce, Shopify, all logos the same height.
3. **What's included:** bento grid with icons and mini visuals.
4. **Pricing:** master plan cards with a monthly/annual toggle ("2 months free"). Growth highlighted by a gradient border and glow.
5. **How it works:** 4-step timeline with a connecting line.
6. **Example monthly report**, labelled "Example".
7. **Websites we look after:** portfolio block (A4), when the owner confirms the table.
8. **Comparison:** WMS, freelancer and typical agency, shown as cards. No competitor brand names on the homepage.
9. **Existing homepage content:** all kept, each part in the new design as a proper section, not accordions under the bento. "Find us on": one row of profile names, no badges, ratings or stars. FAQ as an accordion.
10. **Final CTA:** dark gradient band with buttons.

### B3. Pricing page (most important commercial page)
- 3 cards on top; monthly/annual toggle ("2 months free"), with prices from the master list.
- Full feature comparison below. Sticky plan header on desktop; stacked cards on mobile.
- Each feature row expands to one sentence; add-ons in the same table.
- One CTA per plan: `/get-a-free-quote/#essential` and so on.
- FAQ about billing, contract, free hosting, the free month and webmail.

### B4. Other templates
- **Service pages:** first screen = H1, sub-headline, starting price, CTA. Then problem → what's included → price → FAQ.
- **Blog posts:** quick answer box under the H1, table of contents, readable 70ch column, author box, one contextual CTA, related posts. Long sections stay in the HTML (no content removed).
- **Hack/error pages:** one CTA "Fix my site now".
- **Header:** logo, Services, Pricing, Blog, About, Contact, and the CTA button. Keep it to these items.
- **Footer:** service links, company links, trust pages, contact, Cookie settings.

### B5. Speed is part of the design
- Lighthouse mobile at least 90, CLS 0. LCP under 1.5 s on desktop and under 2.5 s on mobile.
- No heavy libraries. Glow, gradients and charts in CSS and inline SVG. The cookie bar must not cover the first-screen button on phones. Third-party scripts load only after consent.

### B6. What to deliver for approval
One static homepage mockup, both themes, desktop and mobile, full page. Wait for the owner's approval before changing the templates or writing new text into pages.
