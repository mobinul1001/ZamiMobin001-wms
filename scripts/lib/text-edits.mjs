// Owner-approved wording changes on one page, applied by migrate-content.mjs to the body and to schema strings.
// Each entry replaces a whole text exactly; the build of the migration fails if a "from" text is not found.
export const TEXT_EDITS = {
  // Owner, 2026-11-05: the process shows 4 steps, so the heading and its label say 4.
  '/website-repair-services/': [
    ['Our 5-Step Website Repair Process', 'Our 4-Step Website Repair Process'],
    ['Documented 5-Step System', 'Documented 4-Step System'],
  ],
};

const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Body: the element whose own text is exactly the old wording gets the new wording.
export function applyTextEdits($, path) {
  for (const [from, to] of TEXT_EDITS[path] ?? []) {
    const hits = $('body *').toArray().filter((e) => norm($(e).text()) === from && !$(e).children().toArray().some((c) => norm($(c).text()) === from));
    if (!hits.length) throw new Error(`text-edits: "${from}" not found on ${path}`);
    for (const e of hits) $(e).text(to);
  }
}

// Schema: a string that is exactly the old wording.
export const editString = (path, s) => (TEXT_EDITS[path] ?? []).find(([from]) => norm(s) === from)?.[1] ?? s;

// HowTo schema that must match the page's visible steps. Owner, 2026-11-05: the repair page shows 4 steps,
// so the empty fifth step (left over from the removed "30-Day Warranty" step) goes, and the steps that remain
// must have the same names in the same order as the "### Step N: Name" headings in the body.
const HOWTO_MATCH_STEPS = ['/website-repair-services/'];
export function fixHowTo(path, schema, body) {
  if (!HOWTO_MATCH_STEPS.includes(path)) return;
  const visible = [...body.matchAll(/^#{2,4} Step (\d+): (.+)$/gm)].map((m) => [Number(m[1]), norm(m[2])]);
  const nodes = schema.flatMap((d) => d['@graph'] ?? [d]).filter((n) => [].concat(n['@type'] ?? []).includes('HowTo'));
  if (!nodes.length) throw new Error(`text-edits: no HowTo schema on ${path}`);
  for (const n of nodes) {
    n.step = (n.step ?? []).filter((s) => norm(String(s.name ?? '')));
    const got = n.step.map((s) => [s.position, norm(s.name)]);
    if (JSON.stringify(got) !== JSON.stringify(visible)) throw new Error(`text-edits: HowTo steps on ${path} ${JSON.stringify(got)} do not match the page ${JSON.stringify(visible)}`);
  }
}
