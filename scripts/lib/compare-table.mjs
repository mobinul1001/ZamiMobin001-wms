// Builds a plan comparison table in Markdown from a list of plans (owner, 2026-11-01): "Included" or "—" only.
const kindOf = (f) => (/edits/.test(f) ? 'edits' : /backup/i.test(f) ? 'backups' : /response/.test(f) ? 'response' : '');

export function compareTable(plans, annualNote) {
  const money = (n) => `$${n.toLocaleString('en-US')}`;
  const names = plans.map((p) => p.name);
  const rows = [];
  plans.forEach((plan, i) => {
    for (const item of plan.includes) {
      const parent = /^Everything in (.+)$/.exec(item)?.[1];
      if (parent && names.includes(parent)) continue;
      const label = parent ? `Everything in the ${parent} plan` : item;
      if (rows.some((r) => r.label === label)) continue;
      // A bigger allowance replaces a smaller one: 3 hours of edits does not sit on top of 1 hour.
      const kind = kindOf(item);
      const next = kind ? plans.findIndex((p, j) => j > i && p.includes.some((f) => kindOf(f) === kind)) : -1;
      rows.push({ label, from: i, until: next < 0 ? plans.length - 1 : next - 1 });
    }
  });
  const head = `| Feature | ${plans.map((p) => `${p.name} ${money(p.monthly)}/mo`).join(' | ')} |`;
  const line = `| --- | ${plans.map(() => '---').join(' | ')} |`;
  const annual = `| Annual billing (per year) | ${plans.map((p) => `${money(p.annual)}, ${annualNote}`).join(' | ')} |`;
  const body = rows.map((r) => `| ${r.label} | ${plans.map((_, j) => (j >= r.from && j <= r.until ? 'Included' : '—')).join(' | ')} |`);
  return [head, line, annual, ...body].join('\n') + '\n';
}
