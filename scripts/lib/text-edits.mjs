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
