// Rough PDF text extraction (FlateDecode streams, Tj/TJ operators). Usage: node scripts/seo/pdf-text.mjs file.pdf
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
const buf = readFileSync(process.argv[2]);
const s = buf.toString('latin1');
const out = [];
const unesc = (x) => x.replace(/\\([()\\])/g, '$1').replace(/\\(\d{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
for (const m of s.matchAll(/stream\r?\n/g)) {
  const start = m.index + m[0].length;
  const end = s.indexOf('endstream', start);
  let txt;
  try { txt = inflateSync(buf.subarray(start, end)).toString('latin1'); } catch { continue; }
  if (!/T[Jj]/.test(txt)) continue;
  const parts = [];
  for (const t of txt.matchAll(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj|(T\*|Td|TD|ET)/g)) {
    if (t[3]) { parts.push('\n'); continue; }
    if (t[1] !== undefined) parts.push([...t[1].matchAll(/\(((?:[^)\\]|\\.)*)\)/g)].map((x) => unesc(x[1])).join(''));
    else parts.push(unesc(t[2]));
  }
  out.push(parts.join('').replace(/\n{2,}/g, '\n'));
}
console.log(out.join('\n'));
