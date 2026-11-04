// In-text links the owner approved (2026-11-04), so these pages are not linked only from the footer.
// Each one links words that are already on the page; no other text changes.
const LINKS = {
  '/wordpress-malware-removal-service/': [
    ['while an automated **wordpress malware scanner** is useful', 'while an automated **[wordpress malware scanner](/website-malware-scanner/)** is useful'],
  ],
  '/white-label-website-maintenance-services-for-agencies/': [
    ['Our **white label partner program** makes handing off', 'Our **[white label partner program](/wms-partner-program/)** makes handing off'],
  ],
  '/common-website-maintenance-mistakes/': [
    ['<p class="eyebrow">Contributor</p>', '<p class="eyebrow"><a href="/write-for-us/">Contributor</a></p>'],
  ],
};

// Fails loudly if a sentence changed on the old page, instead of linking the wrong words.
export function addApprovedLinks(path, body) {
  let out = body;
  for (const [from, to] of LINKS[path] ?? []) {
    const count = out.split(from).length - 1;
    if (count !== 1) throw new Error(`${path}: link text found ${count} times: ${from}`);
    out = out.replace(from, () => to);
  }
  return out;
}

export const linkedPaths = () => Object.keys(LINKS);
