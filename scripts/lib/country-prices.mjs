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
  brazil: { old: ['R$ 249/mês', 'R$ 499/mês', 'R$ 999/mês'], button: 'Escolher Plano', heads: ['Plano Básico', 'Plano Padrão', 'Plano Premium'], names: ['Plano Essential', 'Plano Growth', 'Plano Business'], note: 'pt', month: 'mês', year: 'ano', or: 'ou', lang: 'pt' },
};

const PT = {
  'Everything in Essential': 'Tudo do Essential',
  'Everything in Growth': 'Tudo do Growth',
  'Free hosting for the first year': 'Hospedagem grátis no primeiro ano',
  '2 free webmail accounts': '2 contas de webmail grátis',
  'Weekly updates': 'Atualizações semanais',
  'Weekly backups': 'Backups semanais',
  'Security scan': 'Verificação de segurança',
  'Uptime monitoring': 'Monitoramento de disponibilidade',
  '1 hour edits/month': '1 hora de edições/mês',
  'Daily backups': 'Backups diários',
  '3 hours edits/month': '3 horas de edições/mês',
  'Malware removal': 'Remoção de malware',
  'Speed optimization': 'Otimização de velocidade',
  'Monthly report': 'Relatório mensal',
  'WooCommerce support': 'Suporte WooCommerce',
  '6 hours edits/month': '6 horas de edições/mês',
  'Staging-tested updates': 'Atualizações testadas em staging',
  '24/7 emergency fixes': 'Correções de emergência 24/7',
  'Priority support': 'Suporte prioritário',
};

const SENTENCES = {
  australia: [
    ['Depending on your plan, we perform updates monthly (Basic), bi-weekly (Standard), or weekly (Premium).', 'We perform updates weekly on every plan.'],
    ['Yes, we specialize in WooCommerce and Shopify maintenance, specifically included in our Premium plan.', 'Yes, we specialize in WooCommerce and Shopify maintenance. See our [WooCommerce store plans](/ecommerce-website-maintenance-packages/) and [Shopify plans](/shopify-website-maintenance-packages/).'],
    ['for our Standard and Premium plan clients', 'for our Growth and Business plan clients'],
  ],
  france: [['Pick Basic, Standard, or Premium based on your needs.', 'Pick Essential, Growth, or Business based on your needs.']],
  ireland: [['Pick Basic, Standard, or Premium based on your needs.', 'Pick Essential, Growth, or Business based on your needs.']],
  brazil: [['Escolha entre Básico, Padrão ou Premium.', 'Escolha entre Essential, Growth ou Business.']],
};
const PLAN_FAQ_EN = /Our plans start at \$79\/month \(Essential\), \$149\/month \(Growth\), and \$299\/month \(Business\), or \$790, \$1,490 and \$2,990 per year \(2 months free\)\.[\s ]+Prices are shown in USD with (?:EUR|CHF) billing available on request\./;
const PLAN_FAQ_ES = /Nuestros planes comienzan en 79[\s ]USD\/mes \(Essential\), 149[\s ]USD\/mes \(Growth\) y 299[\s ]USD\/mes \(Business\), o 790, 1\.490 y 2\.990[\s ]USD al año \(2 meses gratis\)\.[\s ]+Los precios se muestran en USD; facturación en EUR disponible bajo petición\./;

const countryOf = (path) => /^\/website-maintenance-services-for-([a-z]+)\/$/.exec(path)?.[1];
export const localPaths = () => Object.keys(prices.local);
export const cardHeadsFor = (path) => CARDS[countryOf(path)]?.heads ?? [];

// The list under each plan: the master features exactly.
const featureList = (i, lang) => prices.plans[i].includes.map((f) => `-   ${lang === 'pt' ? PT[f] : f}`).join('\n');

// Text pairs for one country page, applied to the converted Markdown.
export function countryPairs(path) {
  const country = countryOf(path);
  const card = CARDS[country];
  const local = prices.local[path];
  if (!card || !local) return [];
  const note = prices.annualNote[card.note ?? 'en'];
  const hash = (i) => `${HASH[i]}${local.currency === 'USD' ? '' : `-${local.currency.toLowerCase()}`}`;
  const pairs = [];
  card.old.forEach((old, i) => {
    const from = `${old}\n\n${card.annualLine ? `${OLD_ANNUAL[i]}\n\n` : ''}[${card.button}](/get-a-free-quote/)`;
    const to = `${local.monthly[i]}/${card.month ?? 'mo'}\n\n${card.or ?? 'or'} ${local.annual[i]}/${card.year ?? 'yr'}, ${note}\n\n[${card.button}](/get-a-free-quote/#${hash(i)})\n\n${featureList(i, card.lang)}`;
    pairs.push([from, to]);
    pairs.push([`### ${card.heads[i]}\n`, `### ${(card.names ?? NAMES)[i]}\n`]);
  });
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
