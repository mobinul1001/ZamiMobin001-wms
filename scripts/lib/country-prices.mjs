// Country pages show the master plans in local currency (owner, 2026-11-01). Prices come from src/data/prices.json.
import { readFileSync } from 'node:fs';

const prices = JSON.parse(readFileSync('src/data/prices.json', 'utf8'));
const NAMES = ['Essential', 'Growth', 'Business'];
const HASH = ['essential', 'growth', 'business'];
const OLD_ANNUAL = ['or $76/mo billed annually', 'or $156/mo billed annually', 'or $316/mo billed annually'];

const CARDS = {
  usa: { old: ['$49/mo', '$99/mo', '$199/mo'], button: 'Get Started', heads: ['Basic', 'Standard', 'Premium'] },
  uk: { old: ['£39/mo', '£89/mo', '£179/mo'], button: 'Choose Plan', heads: ['Basic', 'Standard', 'Premium'] },
  canada: { old: ['CAD 49/mo', 'CAD 99/mo', 'CAD 199/mo'], button: 'Choose Plan', heads: ['Basic', 'Standard', 'Premium'] },
  australia: { old: ['AUD 99/mo', 'AUD 199/mo', 'AUD 399/mo'], button: 'Select Plan', heads: ['Basic Care', 'Standard Care', 'Premium Care'] },
  france: { old: ['€49/mo', '€99/mo', '€199/mo'], button: 'Choose Plan', heads: ['Basic Plan', 'Standard Plan', 'Premium Plan'] },
  ireland: { old: ['€49/mo', '€99/mo', '€199/mo'], button: 'Choose Plan', heads: ['Basic Plan', 'Standard Plan', 'Premium Plan'] },
  netherlands: { old: ['$95/mo', '$195/mo', '$395/mo'], button: 'Get Started', heads: ['Essential', 'Advanced', 'Elevate'], annualLine: true },
  switzerland: { old: ['$95/mo', '$195/mo', '$395/mo'], button: 'Get Started', heads: ['Essential', 'Advanced', 'Elevate'], annualLine: true },
  spain: { old: ['$95/mo', '$195/mo', '$395/mo'], button: 'Get Started', heads: ['Essential', 'Advanced', 'Elevate'], annualLine: true, note: 'es' },
  brazil: { old: ['R$ 249/mês', 'R$ 499/mês', 'R$ 999/mês'], button: 'Escolher Plano', heads: ['Plano Básico', 'Plano Padrão', 'Plano Premium'], names: ['Plano Essential', 'Plano Growth', 'Plano Business'], note: 'pt', month: 'mês', year: 'ano', or: 'ou' },
};

const SENTENCES = {
  australia: [
    ['monthly (Basic), bi-weekly (Standard), or weekly (Premium)', 'monthly (Essential), bi-weekly (Growth), or weekly (Business)'],
    ['specifically included in our Premium plan', 'specifically included in our Business plan'],
    ['for our Standard and Premium plan clients', 'for our Growth and Business plan clients'],
  ],
  france: [['Pick Basic, Standard, or Premium based on your needs.', 'Pick Essential, Growth, or Business based on your needs.']],
  ireland: [['Pick Basic, Standard, or Premium based on your needs.', 'Pick Essential, Growth, or Business based on your needs.']],
  brazil: [
    ['Inclui tudo no Básico +', 'Inclui tudo no Essential +'],
    ['Inclui tudo no Padrão +', 'Inclui tudo no Growth +'],
    ['Escolha entre Básico, Padrão ou Premium.', 'Escolha entre Essential, Growth ou Business.'],
  ],
};
const PLAN_FAQ_EN = /Our plans start at \$79\/month \(Essential\), \$149\/month \(Growth\), and \$299\/month \(Business\), or \$790, \$1,490 and \$2,990 per year \(2 months free\)\.[\s ]+Prices are shown in USD with (?:EUR|CHF) billing available on request\./;
const PLAN_FAQ_ES = /Nuestros planes comienzan en 79[\s ]USD\/mes \(Essential\), 149[\s ]USD\/mes \(Growth\) y 299[\s ]USD\/mes \(Business\), o 790, 1\.490 y 2\.990[\s ]USD al año \(2 meses gratis\)\.[\s ]+Los precios se muestran en USD; facturación en EUR disponible bajo petición\./;

const countryOf = (path) => /^\/website-maintenance-services-for-([a-z]+)\/$/.exec(path)?.[1];
export const localPrices = (path) => prices.local[path];

// Text pairs for one country page, applied to the converted Markdown.
export function countryPairs(path) {
  const country = countryOf(path);
  const card = CARDS[country];
  const local = prices.local[path];
  if (!card || !local) return [];
  const note = prices.annualNote[card.note ?? 'en'];
  const pairs = [];
  card.old.forEach((old, i) => {
    const from = `${old}\n\n${card.annualLine ? `${OLD_ANNUAL[i]}\n\n` : ''}[${card.button}](/get-a-free-quote/)`;
    const to = `${local.monthly[i]}/${card.month ?? 'mo'}\n\n${card.or ?? 'or'} ${local.annual[i]}/${card.year ?? 'yr'}, ${note}\n\n[${card.button}](/get-a-free-quote/#${HASH[i]})`;
    pairs.push([from, to]);
    pairs.push([`#### ${card.heads[i]}\n`, `#### ${(card.names ?? NAMES)[i]}\n`]);
  });
  if (card.heads[0] === 'Basic' || card.heads[0] === 'Basic Care' || card.heads[0] === 'Basic Plan') {
    pairs.push(['Everything in Basic +', 'Everything in Essential +'], ['Everything in Standard +', 'Everything in Growth +']);
  }
  pairs.push(...(SENTENCES[country] ?? []));
  if (card.annualLine) {
    pairs.push(['Save 20% with annual billing.', card.note === 'es' ? '2 meses gratis with annual billing.' : 'Get 2 months free with annual billing.']);
    pairs.push([/Prices shown in USD; (?:EUR|CHF) billing available on request\./, `Prices shown in ${local.currency}.`]);
    const [a, b, c] = local.monthly;
    const [x, y, z] = local.annual;
    pairs.push([PLAN_FAQ_EN, `Our plans start at ${a}/month (Essential), ${b}/month (Growth), and ${c}/month (Business), or ${x}, ${y} and ${z} per year (2 months free). Prices are shown in ${local.currency}.`]);
    const num = (s) => s.replace('€', '').replace(',', '.');
    pairs.push([PLAN_FAQ_ES, `Nuestros planes comienzan en ${a}/mes (Essential), ${b}/mes (Growth) y ${c}/mes (Business), o ${num(x)}, ${num(y)} y ${num(z)} EUR al año (2 meses gratis). Los precios se muestran en EUR.`]);
  }
  return pairs;
}

// Old lines these changes replace, for the parity line check.
export const COUNTRY_OLD_LINES = [...new Set(Object.values(CARDS).flatMap((c) => [...c.old, ...c.heads, ...(c.annualLine ? OLD_ANNUAL : [])])), 'Prices shown in USD; EUR billing available on request. See full plans, packages & costs.', 'Prices shown in USD; CHF billing available on request. See full plans, packages & costs.'];

export function countryMeta(path, value) {
  const local = prices.local[path];
  if (!local || typeof value !== 'string') return value;
  return value.replace(/From \$\d+\/mo, (?:EUR on request|CHF avail)\./, `From ${local.monthly[0]}/mo.`);
}
