import formIds from '../data/forms.json';
// Splits rendered page HTML into sections so a template can place them. All text stays in the HTML.
export interface Section {
  title: string;
  html: string;
}

const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&#x26;/g, '&').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").trim();

export function splitBy(html: string, level: 2 | 3): { intro: string; sections: Section[] } {
  const parts = html.split(new RegExp(`(?=<h${level}[ >])`));
  const intro = /^\s*<h\d/.test(parts[0]) && parts[0].startsWith(`<h${level}`) ? '' : parts.shift() ?? '';
  const sections = parts.map((html) => ({ title: strip(/<h\d[^>]*>(.*?)<\/h\d>/s.exec(html)?.[1] ?? ''), html }));
  return { intro, sections };
}

// Takes the first section whose title matches, removing it from the list.
export function take(sections: Section[], re: RegExp): Section | undefined {
  const i = sections.findIndex((s) => re.test(s.title));
  return i < 0 ? undefined : sections.splice(i, 1)[0];
}

// Gives repeated "Learn More" links their meaning for screen readers and search engines. The visible text stays.
const LINK_CONTEXT: Record<string, string> = {
  '/wordpress-website-maintenance-packages/': 'about WordPress maintenance',
  '/shopify-website-maintenance-packages/': 'about Shopify maintenance',
  '/ecommerce-website-maintenance-packages/': 'about ecommerce maintenance',
  '/monthly-website-maintenance-packages/': 'about website management',
};
export const describeLinks = (html: string) =>
  html.replace(/<a href="([^"]+)">Learn More<\/a>/g, (all, href) => (LINK_CONTEXT[href] ? `<a href="${href}">Learn More<span class="sr-only"> ${LINK_CONTEXT[href]}</span></a>` : all));

// Every form posts to Formspree. IDs live in src/data/forms.json; the redirect to /thank-you/ is set in each form's Formspree settings.
const FORM_IDS = formIds as Record<string, string>;
const HEALTH_FORM_LINE = '<p class="small muted form-note">Please don\'t send patient or health information through this form.</p>';
const HEALTH_FORM_PAGES = ['/website-design-services/', '/website-redesign-services/', '/website-seo-services/', '/website-speed-optimization-services/', '/white-label-website-maintenance-services-for-agencies/', '/wordpress-backup-services/', '/wordpress-malware-removal-service/'];
const FORM_NAMES: Record<string, string> = { '/contact/': 'contact', '/get-a-free-quote/': 'quote', '/free-website-maintenance-audit/': 'audit' };
// Opening tag and hidden fields of a Formspree form, for forms a template builds itself.
export const formOpen = (name: string, cls = '') => `<form class="${cls}" data-form="${name}" method="POST" action="https://formspree.io/f/${FORM_IDS[name] || FORM_IDS.default || `MISSING-${name}`}"><input type="hidden" name="form_name" value="${name}"><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">`;

export function wireForms(html: string, path: string) {
  const base = FORM_NAMES[path] ?? path.replace(/^\/|\/$/g, '');
  let count = 0;
  const wired = html.replace(/<form data-placeholder-form="true">/g, () => {
    count += 1;
    const name = count === 1 ? base : `${base}-${count}`;
    const extra = name === 'quote' ? '<input type="hidden" name="package" id="requested-package">' : '';
    const id = FORM_IDS[name] || FORM_IDS.default || `MISSING-${name}`;
    return `<form data-form="${name}" method="POST" action="https://formspree.io/f/${id}"><input type="hidden" name="form_name" value="${name}"><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">${extra}`;
  });
  // The migration kept the old disabled submit buttons.
  // Batch 3: the old forms used "e.g. John Doe" as the name placeholder (a fake-person name); now "Your name".
  const enabled = wired.replace(/<button([^>]*?) disabled(?:="[^"]*")?([^>]*)>/g, '<button$1$2>').replace(/placeholder="[^"]*John Doe[^"]*"/g, 'placeholder="Your name"');
  const noted = HEALTH_FORM_PAGES.includes(path) ? enabled.replace(/<\/form>/g, `</form>${HEALTH_FORM_LINE}`) : enabled;
  // The old labels point at ids the converter removed. Each control gets its label's id back.
  return noted.replace(/<label for="([^"]+)">((?:(?!<\/label>).)*)<\/label>(\s*(?:<div>\s*)?)<(input|select|textarea) /gs, '<label for="$1">$2</label>$3<$4 id="$1" ');
}

// The old pages put an empty anchor <p><a id="x"></a></p> right before a heading that has the same id, so the id was
// on the page twice. The empty anchor goes; the heading keeps the id, so every "#x" link (TOC, in-page links) still
// lands on the same place. No text changes. An empty anchor whose id is used nowhere else stays.
export function dropDuplicateAnchors(html: string) {
  return html.replace(/(?:<p>)?<a id="([^"]+)"><\/a>(?:<\/p>)?\s*/g, (all, id: string) => {
    const uses = html.split(`id="${id}"`).length - 1;
    return uses > 1 ? '' : all;
  });
}

export const dropHeading = (html: string) => html.replace(/^\s*<h\d[^>]*>.*?<\/h\d>/s, '');
