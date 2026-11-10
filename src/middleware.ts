// Batch 4 mobile redesign, Z3 phone tables: every body cell gets a data-label taken from its column header, so the
// phone layout (src/styles/mobile.css) can print the column name above the value. Only an attribute is added; no
// text, heading, link or order changes. Cells that already have a data-label keep it. Runs at build time.
import { defineMiddleware } from 'astro:middleware';

const strip = (s: string) => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().replace(/"/g, '&quot;');
const cellsOf = (row: string) => [...row.matchAll(/<(t[hd])\b([^>]*)>([\s\S]*?)<\/\1>/g)];

export function labelTables(html: string) {
  return html.replace(/<table\b[\s\S]*?<\/table>/g, (table) => {
    const head = /<thead\b[\s\S]*?<\/thead>/.exec(table)?.[0];
    const firstRow = head && /<tr\b[\s\S]*?<\/tr>/.exec(head)?.[0];
    if (!firstRow) return table;
    const labels = cellsOf(firstRow).map((m) => strip(m[3]));
    if (!labels.length) return table;
    return table.replace(/<tbody\b[\s\S]*?<\/tbody>/g, (body) => body.replace(/<tr\b[\s\S]*?<\/tr>/g, (row) => {
      let i = 0;
      return row.replace(/<(t[hd])\b([^>]*)>/g, (tag, name: string, attrs: string) => {
        const label = labels[i++];
        if (label === undefined || /\sdata-label=/.test(attrs) || /\scolspan=/.test(attrs)) return tag;
        return `<${name}${attrs} data-label="${label}">`;
      });
    }));
  });
}

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  if (!(res.headers.get('content-type') ?? '').includes('text/html')) return res;
  const html = await res.text();
  if (!html.includes('<table')) return new Response(html, res);
  return new Response(labelTables(html), { status: res.status, statusText: res.statusText, headers: res.headers });
});
