// Reads an .xlsx (zip of XML) with the system `unzip` and writes each sheet as CSV. No dependencies.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const [file, out] = process.argv.slice(2);
const x = (p) => { try { return execFileSync('unzip', ['-p', file, p], { maxBuffer: 1 << 28 }).toString(); } catch { return ''; } };
const dec = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const shared = [...x('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => dec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')));
const wb = x('xl/workbook.xml'), rels = x('xl/_rels/workbook.xml.rels');
mkdirSync(out, { recursive: true });
for (const m of wb.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
  const target = new RegExp(`Id="${m[2]}"[^>]*Target="([^"]+)"`).exec(rels)?.[1] ?? new RegExp(`Target="([^"]+)"[^>]*Id="${m[2]}"`).exec(rels)[1];
  const xml = x('xl/' + target.replace(/^\/?xl\//, ''));
  const rows = [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((r) => {
    const cells = [];
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = [...c[1]].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const v = /<v>([\s\S]*?)<\/v>/.exec(c[3] ?? '')?.[1] ?? /<t[^>]*>([\s\S]*?)<\/t>/.exec(c[3] ?? '')?.[1] ?? '';
      cells[col] = /t="s"/.test(c[2]) ? shared[+v] : dec(v);
    }
    return [...cells].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
  });
  const name = dec(m[1]).replace(/[^\w-]+/g, '-');
  writeFileSync(`${out}/${name}.csv`, rows.join('\n'));
  console.log(name, rows.length);
}
