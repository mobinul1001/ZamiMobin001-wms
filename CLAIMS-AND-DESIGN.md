# CLAIMS-AND-DESIGN.md: owner decisions on claims + design direction (2026-11-01)

Same rules as CLAUDE.md: no invented facts. Apply the claim decisions below sitewide (every page, schema, meta descriptions, FAQ answers).

---

## A. Claims: what to replace, keep or remove

### A1. Client / website numbers
- Remove every "100+ websites", "500+ businesses", "500+ websites", "500+ sites" and "4,800+ repaired".
- Owner, 2026-11-02, replaces all old versions. Stat block: **650+ websites maintained · 120+ built · 190+ redesigns · 70+ migrations · 12+ years.**
- Short line: **"650+ websites maintained in 12+ years."**
- Under the stat block and on About: **"650+ websites maintained in 12+ years — most of them built by other agencies or freelancers, and 120+ built by us."**
- Reach, short spots: **"for businesses in the USA, Canada, the UK, Australia and Europe"**. Full list, only on About and "Countries we serve": the USA, Canada, the UK, Australia, the Netherlands, Ireland, France, Spain, Switzerland and the Caribbean.

### A2. Years of experience
- Owner, 2026-11-02: **12+ years**. No founding year and no "since" dates for this website.
- About page and one short line on the homepage near the stats: **"Our team has been building and maintaining websites for 12+ years. We launched websitemaintenanceservices.org to focus only on what we do best: website maintenance and support."**

### A3. Ratings and review counts
- Remove every star rating and review count (4.9, 213, 165, 120, 4,800, 150, 180) from visible text. Schema is already removed.
- Add nothing in their place now. Later, when real reviews exist on Google Business Profile or Clutch, link to that profile and show the real count from there.

### A4. Testimonials
- Remove all ~70 quote-style testimonials. None of them can be verified, and some mention old plan names.
- Replace the testimonial sections with a **"Websites we look after" portfolio block**: site name, industry, country, and a link to the live site (links: `rel="nofollow noopener"`). The live sites are real proof that a visitor can check.
- Keep an empty, reusable "Client words" component. Add a quote only when the owner sends one with the client's name, company and written OK.

### A5. Location
- Owner, 2026-11-02: no mention of Dhaka, Bangladesh or the +880 number. Do not say which country the team is in. Use: **"We work US & UK business hours."**
- Contact details match the Google Business Profile exactly: 14 Wall St Ste 2036, New York, NY 10005, United States · +1 212-496-1637 · contact@websitemaintenanceservices.org. Values live in `src/data/site.json`.
- Google Business Profile name: "Chrein - Web Design, Development, Maintenance, Support". The site brand stays "Website Maintenance Services" / "WMS".
- We are a Google Partner: "Google Partner" stays on the design and SEO pages.

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
- **99.9% uptime guarantee** (owner confirmed 2026-11-02): back on the homepage and the 3 comparison posts. The white-label page keeps its old removal of SLA claims.
- No other guarantees (ranking, "100%") anywhere.

### A8. Case study
- Owner confirmed 2026-11-02: the Altitude Care numbers are true and shown prominently. H2 "Real Maintenance Results, Backed by Numbers". Also confirmed: "+142% Growth", "Page 1 Top 3", "98/100 Passed", "99/100 Passed", "Expert Developers: Certified, experienced team", "Certified, Experienced, Trusted."
- `/website-maintenance-case-study/`: remove the "Paraphrased" quote. Keep the page only if the client is in the portfolio list and the owner confirms the facts. Otherwise list it for the owner as "rewrite or noindex". Do not delete it (the URL must keep working).

---

## B. Design direction: "Modern premium SaaS" (2026 style)

Replaces "Calm engineering" (owner, 2026-11-01), which looked too plain: mostly text lists, small headings, links instead of buttons, little colour or visuals.

**Goal:** the site should look like a premium software product, and the visitor should still see exactly what they get and what it costs. Honest claims and visible prices remain the advantage.

`DESIGN-QA.md` adds the detailed design rules and the required self-review loop.

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
9. **Existing homepage content:** all kept, each part in the new design as a proper section, not accordions under the bento. "Find us on": the real badge images and profile links from the live site, in the footer, one height, greyscale until hover in dark mode. FAQ as an accordion.
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
