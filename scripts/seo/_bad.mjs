import fs from 'fs'; import { parseCsv } from './csv-lite.mjs';
for (const r of parseCsv(fs.readFileSync('reports/seo-research/snippets.csv', 'utf8'))) if (r.check !== 'ok') console.log(r.meta_chars, r.meta_px, r.url, '|', r.check);
