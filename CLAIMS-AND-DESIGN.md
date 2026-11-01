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

## B. Design direction: "Calm engineering"

**Goal:** the visitor should feel "engineers who know what they're doing run this, and I can see exactly what I get and what it costs". The competitors (WP Buffs, SiteCare, FixRunner, Seahawk) are either loud sales pages with badges and countdowns, or hide their prices behind quotes. We win on **clarity, honesty and speed**.

### B1. Look
- **Colours:** keep the current logo colour as the single brand/accent colour (buttons, links, key numbers only). Everything else is neutral: white / very light grey background, near-black text (#111–#1a1a1a), mid-grey secondary text, thin 1px borders. One green only for "Included" / "Up" status. No gradients, no glow, no stock-photo hero.
- **Type:** one sans-serif family, self-hosted (e.g. Inter or Geist), 2 weights for text + 1 bold for headings. Body 17–18px, line-height 1.6. Numbers in tabular figures (prices, times).
- **Visual motif:** a "maintenance dashboard" style. Small status cards (✓ Updated, ✓ Backed up, ✓ Uptime OK, response time) made in HTML/CSS, not images, and clearly labelled "Example". It shows what the service does without fake claims.
- **Imagery:** real team photos when the owner supplies them; until then no people photos. Icons: one simple line-icon set.
- **Motion:** almost none. No carousels, no popups, no countdowns, no chat bubble covering content (load chat on click if needed).

### B2. Homepage structure (fits the 22–24% average scroll: the key facts must be on the first screen)
1. **First screen:**
   - H1 "Website Maintenance Services & Support"
   - one-line sub-headline (the audit's "Your site kept fast, secure and up to date" idea)
   - **"Plans from $79/mo · No contract"**
   - primary button "See plans & pricing" and secondary text link "Get a free website check"
   - a thin row under it: "Dhaka-based team · US & UK hours · 30+ websites maintained"
2. **What's included:** 6 tiles (updates, backups, security, uptime monitoring, speed, edits/support), each one line.
3. **Pricing preview:** the 3 plan cards from the master price list, "Most popular" on Growth, "Included" text instead of tick icons, every feature name clickable to a one-line explanation (fixes the dead clicks on "Spam & Bot Protection" and "Care & Protection").
4. **How it works:** 3 steps (Free check → Pick a plan → We take care of it monthly + report).
5. **Example monthly report** (dashboard cards, labelled "Example").
6. **Websites we look after:** portfolio block (A4).
7. **Comparison table:** WMS vs "freelancer" vs "typical agency" (price range, contract, response time, report). No competitor brand names on the homepage.
8. **Existing homepage content:** all kept, regrouped into these sections + FAQ accordion (text stays in the HTML).
9. **Final CTA:** one button.

### B3. Pricing page (most important commercial page)
- 3 cards on top; monthly/annual toggle ("2 months free"), with prices from the master list.
- Full feature comparison table below. Sticky plan header on desktop; stacked cards on mobile.
- Each feature row expands to one sentence; add-ons with their price in the same table.
- One CTA per plan → `/get-a-free-quote/#essential` etc.
- FAQ about billing, contract, what counts as an "edit hour", what happens if you cancel.

### B4. Other templates
- **Service pages:** first screen = H1, sub-headline, starting price, CTA. Then problem → what we do → included → price → FAQ.
- **Blog posts:** quick answer box under the H1 (AI/answer-first), table of contents, readable 70ch column, author box, one contextual CTA (free check), related posts. Long sections stay in the HTML (no content removed).
- **Hack/error pages:** one CTA "Fix my site now".
- **Header:** logo, Services, Pricing, Blog, About, Contact, and the CTA button. Keep it to these items.
- **Footer:** service links, company links, trust pages, contact.

### B5. Speed is part of the design
- Targets: LCP < 1.5 s on desktop, < 2.5 s on mobile. The site itself is proof of the service, so later we can say "this site loads in X s" as an honest, checkable claim.
- No web-font flash, no layout shift, third-party scripts deferred (SEO-GUARDRAILS §3).

### B6. What to deliver for approval
Static mockups (in the browser, no CMS yet) of: **homepage, pricing page, one blog post**, desktop + mobile screenshots. Wait for owner approval before building the other templates.
