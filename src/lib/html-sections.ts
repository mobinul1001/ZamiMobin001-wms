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

export const dropHeading = (html: string) => html.replace(/^\s*<h\d[^>]*>.*?<\/h\d>/s, '');
