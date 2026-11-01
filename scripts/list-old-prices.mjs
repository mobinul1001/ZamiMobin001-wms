// Lists every line in page bodies with the old $95/$195/$395 plans or old plan names.
// Writes reports/old-price-lines.md so the owner can see what still shows an old price.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const OLD = /\$\s?(95|195|395|76|156|316|912|1,?140|1,?872|2,?340|3,?792|4,?740)\b|\bSave \$228\b|\b(Advanced|Elevate)\b(?= (plan|package|tier|website maintenance|at|\(|\$))|\bWP (Starter|Growth|Premium)\b/;
const rows = [];
for (const dir of ['src/content/pages', 'src/content/blog']) {
  for (const f of readdirSync(dir)) {
    const lines = readFileSync(`${dir}/${f}`, 'utf8').split('\n');
    const end = lines.indexOf('---', 1);
    lines.slice(end + 1).forEach((l, i) => {
      if (OLD.test(l)) rows.push({ page: f.replace('.md', ''), line: i + end + 2, text: l.replace(/\|/g, '/').trim() });
    });
  }
}
const pages = [...new Set(rows.map((r) => r.page))];
const md = `# Old plan prices still in page bodies\n\n${rows.length} lines on ${pages.length} pages.\n\n| Page | Line | Text |\n|---|---|---|\n${rows.map((r) => `| ${r.page} | ${r.line} | ${r.text.slice(0, 220)} |`).join('\n')}\n`;
writeFileSync('reports/old-price-lines.md', md);
console.log(`${rows.length} lines on ${pages.length} pages`);
for (const p of pages) console.log(rows.filter((r) => r.page === p).length, p);
