// Owner decisions from CLAIMS-AND-DESIGN.md section A, applied to old page HTML. The migration and
// the parity test both run this, and every change goes into reports/claims-applied.csv.
export const LINE_NUMBERS = '650+ websites maintained in 12+ years.';
export const LINE_LOCATION = 'We work US & UK business hours.';
export const LINE_HACKED = "If we can't clean your hacked site, you don't pay.";
export const LINE_PLAN = 'No contract. Cancel anytime.';

export const NUMBERS = /(?<![$£€\d,.–-])\b(?:400|500|4,800)\+|\b100\+\s*Websites\b|\b1(?:20|50|65|80|87)\+\s*(?:Verified|Accelerated|Managed|clients|small business)/i;
export const YEARS = /\b1[01]\+\s*(?:years?|yrs?)\b|\ba decade of experience\b|\bfor over a decade\b|\bsince 2016\b/i;
export const RATINGS = /\b[1-5](?:\.\d)?\s*\/\s*5(?:\.0)?\b|\b[345]\.\d\s*(?:★|-?\s*star)|\b5[- ]star\b|★{2,}|\brated\s+4\.9|\bverified reviews\b|\breview platforms\b|\bRating Based\b|\bwould recommend us\b|\bClutch & G2 Rated\b|\bGoogle & Clutch Rating\b/i;
export const GUARANTEES = /\bguarantee[sd]?\b|\bwarrant(?:y|ies)\b|\bmoney[- ]back\b|\brisk[- ]free\b|\b99\.9\s*%|\bAverage Rating\b|(?<!near-)\bzero[- ](?:downtime|traffic loss|ranking loss|rank loss|data loss)\b|\bno data loss\b|\b0 rank loss\b/i;
const LOCATION = /\b(?:USA|US)[- ]Based\b/i;

// Pages where "guarantee" is about us. Elsewhere the word is general advice or about other companies.
export const OWN_CLAIM_PAGES = new Set(['/', '/best-fixrunner-alternatives/', '/best-wp-buffs-alternatives/', '/sitecare-alternative/', '/best-website-maintenance-for-small-business/', '/how-much-does-wordpress-website-maintenance-cost/', '/how-much-does-website-maintenance-cost/', '/monthly-website-maintenance-packages/', '/wordpress-website-maintenance-packages/', '/shopify-website-maintenance-packages/', '/ecommerce-website-maintenance-packages/', '/website-design-services/', '/website-hacked-recovery-services/', '/website-migration-services/', '/website-redesign-services/', '/website-repair-services/', '/website-seo-services/', '/website-speed-optimization-services/', '/website-support-services/', '/website-update-services/', '/white-label-website-maintenance-services-for-agencies/', '/white-label-wordpress-maintenance-support/', '/wordpress-backup-services/', '/wordpress-malware-removal-service/', '/website-maintenance-services-for-canada/', '/website-maintenance-services-for-usa/', '/website-maintenance-services-for-uk/', '/website-maintenance-services-for-australia/', '/website-maintenance-services-for-france/', '/website-maintenance-services-for-spain/', '/website-maintenance-services-for-netherlands/', '/website-maintenance-services-for-switzerland/', '/website-maintenance-services-for-ireland/', '/website-maintenance-services-for-brazil/', '/website-maintenance-case-study/']);

// Statements about other companies or general facts, which stay.
const KEEP = /Sucuri|WP Buffs holds|Fewer verified|fake 100%/i;
const KEEP_GUARANTEE = /\b(?:does not|do not|doesn't|don't|cannot|can't|no legitimate|not|no|never|without)\b(?:\s+\w+){0,3}\s+guarantee|\bnot (?:a |an )?(?:absolute )?guarantee|Offer a guarantee against|Ask about|What's your guaranteed|No warranty|Zero support or warranty|no guaranteed backup/i;

// Pages whose quoted lines are error messages, search terms or the page's own voice, not testimonials.
const QUOTES_NOT_TESTIMONIALS = /^["“](?:Error establishing|There has been|White Screen|Sorry, you|The site is|Briefly|Parse error|403|404|Too many|Allowed memory|Maximum execution|How do I actually|Salon SEO|Did our|Which improvements|Fixing the symptom|Free"|Think of it|Most business|Most one-time|Most basic|This site may)/i;

const TESTIMONIAL_SECTION = /\b(?:what (?:our )?clients? say|client (?:feedback|reviews|words|testimonials)|testimonials?|social proof|partner proof|speed proof|real feedback|verified client|client stories|what .* say)\b/i;

const words = (s) => (s.match(/\S+/g) ?? []).length;
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Owner, 2026-11-02: the 99.9% uptime guarantee is true. It returns on the pages that had it; the white-label page stays without.
const UPTIME_PAGES = new Set(['/', '/best-fixrunner-alternatives/', '/best-wp-buffs-alternatives/', '/sitecare-alternative/']);
let uptimeOk = false;

export function bannedIn(text, own) {
  if (KEEP.test(text)) return null;
  if (uptimeOk && /uptime guarantee|99\.9\s*%/i.test(text) && !/\b1[01]\+|5\.0|decade/i.test(text)) return null;
  if (NUMBERS.test(text)) return 'A1 numbers';
  if (YEARS.test(text)) return 'A2 years';
  if (RATINGS.test(text)) return 'A3 ratings';
  if (LOCATION.test(text)) return 'A5 location';
  if (own && GUARANTEES.test(text) && !KEEP_GUARANTEE.test(text)) return 'A7 guarantee';
  return null;
}

// Removes banned sentences from plain text. Returns the cleaned text.
export function cleanString(text, own) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const kept = sentences
    .map((s) => (s.includes(' • ') ? s.split(' • ').filter((p) => !bannedIn(p, own)).join(' • ') : s))
    .filter((s) => s && !bannedIn(s, own));
  let out = kept.join(' ');
  if (own && !KEEP.test(out)) out = out.replace(/\b100%\s+(?=[A-Za-z])/g, '');
  return out;
}

const EXACT = new Map([
  ['100% Malware Removal & Blacklist Reversal Guarantee', LINE_HACKED],
  ['100% Hack Cleanup Guarantee', LINE_HACKED],
  ['Malware-Free Guarantee', LINE_HACKED],
  ['Our 30-Day Re-Infection Guarantee', LINE_HACKED],
  ['Start Your Cleanup — Guaranteed', 'Start Your Cleanup'],
  ['No contract • Guaranteed results • Fast response', 'No contract • Cancel anytime • Fast response'],
  ['Join 500+ Businesses — Clean My Site Now', 'Clean My Site Now'],
  ['Work With a Top-Rated Website Maintenance Company', 'Work With a Website Maintenance Company'],
  ['Trusted Website Repair Since 2016 • USA • UK • CA • AU', 'Website Repair • USA • UK • CA • AU'],
  ['USA-Based Business Support', LINE_LOCATION],
  ['Guaranteed Malware Removal', 'Malware Removal'],
  ['10+ Years Experience Zero Downtime Priority Support Global Reach', 'Priority Support Global Reach'],
]);

// Wording fixes inside longer sentences, so that the rest of the sentence stays.
const SUBSTITUTIONS = [
  [/A decade of experience, a 99\.9% uptime guarantee, a 5\.0-star rating(?: verified on 8 review platforms|, and independent verification on 8 review platforms)? — plus /g, '12+ years of experience, a 99.9% uptime guarantee, plus '],
  [/— a decade of experience, a 99\.9% uptime guarantee, a 5\.0-star rating verified on 8 platforms, plus /g, '— 12+ years of experience, a 99.9% uptime guarantee, plus '],
  [/\b10\+ years of experience\b/g, '12+ years of experience'],
  [/\b10\+ [Yy]ears [Ee]xperience\b/g, '12+ Years Experience'],
  [/,? and independently verified on 8 review platforms/g, ''],
  [/\bour top-rated website maintenance company\b/g, 'our top pick for website maintenance'],
  [/ with a guarantee against reinfection/g, ''],
  [/\band removal guarantees\b/g, 'and malware removal'],
];

export function applyClaims($, path, log = []) {
  uptimeOk = UPTIME_PAGES.has(path);
  // Owner, 2026-11-02: the old 10+ years stat tiles now say 12+.
  $('span, b, strong, div, p').filter((_, e) => $(e).children().length === 0 && $(e).text().trim() === '10+' && /^years/i.test(norm($(e).next().text()))).text('12+');
  const own = OWN_CLAIM_PAGES.has(path);
  let numberLineUsed = false;
  const record = (rule, before, after = '') => log.push({ path, rule, before: norm(before).slice(0, 300), after });
  const swapOrRemove = (el, rule, before) => {
    if (rule === 'A1 numbers' && !numberLineUsed) {
      numberLineUsed = true;
      $(el).text(LINE_NUMBERS);
      record(rule, before, LINE_NUMBERS);
    } else {
      $(el).remove();
      record(rule, before);
    }
  };

  // A4: testimonials and A8: the "Paraphrased" quote.
  const quotes = !own ? [] : $('body *').toArray().filter((e) => {
    const t = norm($(e).text());
    return /^["“].{30,}/.test(t) && /["”]$/.test(t) && !$(e).find('*').toArray().some((c) => /^["“].{30,}/.test(norm($(c).text()))) && !QUOTES_NOT_TESTIMONIALS.test(t);
  });
  for (const q of quotes) {
    let card = $(q);
    const size = words(norm(card.text()));
    while (card.parent().length && !card.parent().is('body, section, main') && words(norm(card.parent().text())) <= size + 30 && !/["“].{30,}["”].*["“].{30,}["”]/s.test(norm(card.parent().text()))) card = card.parent();
    let holder = card.parent();
    record('A4 testimonial', card.text());
    card.remove();
    while (holder.length && !holder.is('body') && !norm(holder.text())) {
      const up = holder.parent();
      holder.remove();
      holder = up;
    }
    if (holder.length && !holder.is('body') && words(norm(holder.text())) <= 70 && TESTIMONIAL_SECTION.test(holder.text())) {
      record('A4 testimonial section', holder.text());
      holder.remove();
    }
  }
  $('h2, h3, h4').each((_, h) => {
    const t = norm($(h).text());
    if (!TESTIMONIAL_SECTION.test(t) || !own) return;
    const after = norm($(h).nextAll().text());
    if (words(after) <= 40) {
      record('A4 testimonial section', `${t} ${after}`);
      $(h).nextAll().remove();
      $(h).remove();
    }
  });

  // A7: exact replacements come first.
  for (const e of $('body *').toArray()) {
    const t = norm($(e).text());
    const to = EXACT.get(t);
    if (to && !$(e).children().toArray().some((c) => norm($(c).text()) === t)) {
      $(e).text(to);
      record(to === LINE_LOCATION ? 'A5 location' : to === LINE_HACKED ? 'A7 guarantee' : 'A1-A7 rewording', t, to);
    }
  }

  // Comparison rows and FAQ entries go as a whole.
  $('tr').each((_, tr) => {
    const t = norm($(tr).text());
    const rule = /Track record/i.test(t) && YEARS.test(t) ? 'A2 years' : bannedIn(t, own);
    if (rule && !/^(?:\d|#)/.test(t.slice(0, 1))) {
      $(tr).remove();
      record(rule, t);
    }
  });
  // Star-rating column on the ranked list.
  if (path === '/best-website-maintenance-companies/') {
    $('table').each((_, table) => {
      const heads = $(table).find('tr').first().children().toArray();
      const col = heads.findIndex((c) => /^rating$/i.test(norm($(c).text())));
      if (col < 0) return;
      $(table).find('tr').each((__, tr) => $(tr).children().eq(col).remove());
      record('A3 ratings', 'Rating column in the comparison table');
    });
  }
  $('details').each((_, d) => {
    const q = norm($(d).find('summary').text());
    const rule = bannedIn(q, own);
    if (rule) {
      $(d).remove();
      record(rule, norm($(d).text()));
    }
  });
  $('h2, h3, h4, h5, h6').each((_, h) => {
    const t = norm($(h).text());
    const rule = bannedIn(t, own);
    if (!rule) return;
    swapOrRemove(h, rule, t);
  });

  // Short badges, stat tiles and list items.
  for (const e of $('body *').toArray().reverse()) {
    if (!$(e).closest('body').length) continue;
    const t = norm($(e).text());
    if (!t || words(t) > 12 || $(e).is('form, form *')) continue;
    const rule = bannedIn(t, own);
    if (!rule) continue;
    if ($(e).children().toArray().some((c) => bannedIn(norm($(c).text()), own))) continue;
    // Words inside a sentence: drop the whole sentence, so nothing is left half finished.
    if (['strong', 'b', 'em', 'i', 'span', 'a', 'u', 'mark', 'small'].includes(e.name)) {
      const block = $(e).closest('p, li, td, th, dd, blockquote');
      const blockText = norm(block.text());
      if (block.length && words(blockText) > words(t) + 2) {
        const kept = cleanString(blockText, own);
        record(rule, blockText, kept);
        if (kept) block.text(kept);
        else block.remove();
        continue;
      }
    }
    let target = $(e);
    while (target.parent().length && !target.parent().is('body, section, main, ul, ol, table, tbody, tr') && words(norm(target.parent().text())) <= 10) target = target.parent();
    swapOrRemove(target, rule, target.text());
  }

  // Sentences inside longer text.
  const textNodes = [];
  const walk = (n) => {
    for (const c of n.children ?? []) {
      if (c.type === 'text') textNodes.push(c);
      else if (c.type === 'tag' && !['script', 'style', 'code', 'pre', 'form'].includes(c.name)) walk(c);
    }
  };
  walk($('body')[0]);
  for (const node of textNodes) {
    let before = node.data;
    if (!before.trim()) continue;
    for (const [from, to] of SUBSTITUTIONS) {
      const swapped = before.replace(from, to);
      if (swapped !== before) {
        record('A1-A7 rewording', before, norm(swapped));
        before = swapped;
        node.data = swapped;
      }
    }
    const t = norm(before);
    const cleaned = cleanString(t, own);
    if (cleaned === t) continue;
    const rule = t.split(/(?<=[.!?])\s+/).map((part) => bannedIn(part, own)).find(Boolean) ?? 'A7 guarantee';
    if (rule === 'A1 numbers' && !numberLineUsed) {
      numberLineUsed = true;
      node.data = ` ${[cleaned, LINE_NUMBERS].filter(Boolean).join(' ')} `;
      record(rule, t, LINE_NUMBERS);
    } else {
      node.data = cleaned ? ` ${cleaned} ` : ' ';
      record(rule, t, cleaned);
    }
  }

  // Containers left empty.
  for (const e of $('body *').toArray().reverse()) {
    if (['img', 'input', 'select', 'textarea', 'br', 'hr', 'iframe', 'video', 'button', 'option', 'td', 'th', 'a'].includes(e.name)) continue;
    if (!norm($(e).text()) && !$(e).find('img, input, select, textarea, iframe, video').length) $(e).remove();
  }
  return log;
}

// Banned claims in a finished page. Used by the build check.
export function findBanned(text, path) {
  uptimeOk = UPTIME_PAGES.has(path);
  const own = OWN_CLAIM_PAGES.has(path);
  return text.split(/\n|(?<=[.!?])\s+/).map(norm).filter((l) => l && bannedIn(l, own));
}
