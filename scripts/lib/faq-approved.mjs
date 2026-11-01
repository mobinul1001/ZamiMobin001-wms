// FAQ changes the owner approved on 2026-11-01. Questions that were in the schema but not on the
// page are shown; where the page already asks the same question, nothing is duplicated and the
// schema is aligned to the visible wording.
const SERVICE = '/wordpress-malware-removal-service/';
const WL_POST = '/white-label-wordpress-maintenance-support/';

// Schema question -> the visible question that already says the same thing.
export const ALIGN = {
  '/agreement/': { 'What is the difference between a maintenance agreement and a support contract?': "What's the difference between a maintenance agreement and a support contract?" },
  '/best-website-maintenance-for-small-business/': { 'Can you recommend a reliable WordPress website maintenance company for a small business?': 'Can you recommend a reliable WordPress website maintenance company?' },
  '/how-much-does-wordpress-website-maintenance-cost/': { 'What is the difference between a maintenance plan and managed hosting?': "What's the difference between a maintenance plan and managed hosting?" },
  '/website-maintenance-services-for-spain/': { 'Ofrecen servicios de mantenimiento web en Espana?': '¿Ofrecen servicios de mantenimiento web en España?', 'Cuanto cuesta el mantenimiento web en Espana?': '¿Cuánto cuesta el mantenimiento web en España?' },
  '/website-redesign-services/': { "What's the difference between a website redesign and a website refresh?": "What's the difference between a redesign and a refresh?", 'What ongoing support is available after the redesign launches?': 'What ongoing support is available after launch?' },
  '/website-repair-services/': {
    'What is the difference between website repair and website maintenance?': "What's the difference between repair and maintenance?",
    'What is the difference between website repair and website redesign?': "What's the difference between repair and redesign?",
    'Why is my website showing a White Screen of Death (WSOD)?': 'What causes a white screen of death?',
  },
  '/website-speed-optimization-services/': {
    'Does page speed affect Google SEO rankings?': 'Does website speed affect SEO rankings?',
    'How does website speed affect conversion rates?': 'Does page speed impact conversion rates?',
    'How does speed optimization work with your maintenance and security plans?': 'How does speed optimization work with your maintenance & security plans?',
  },
  '/white-label-website-maintenance-services-for-agencies/': { 'Do you offer white label WordPress maintenance services specifically?': 'Do you offer white label WordPress maintenance specifically?' },
};

// Questions shown on the page. "format" follows how that page's FAQ is written.
export const ADD = {
  '/website-repair-services/': {
    format: 'plain',
    section: /^## Frequently Asked Questions/,
    end: /^#{2,3} /,
    questions: [
      'How to fix a broken website?',
      'How to fix a 500 Internal Server Error on WordPress?',
      'How do I fix broken 404 links on my website?',
      'How to resolve WordPress plugin conflicts?',
      'Why is my website contact form not sending emails?',
      'Why is my WooCommerce checkout not working?',
      'How to repair a hacked website or malware infection?',
      'How fast is emergency website repair vs scheduled repair?',
    ],
  },
  '/website-speed-optimization-services/': { format: 'h3', section: /^## Frequently Asked Questions About Website Speed/, end: /^## /, questions: ['Why is my WordPress website slow on mobile?'] },
  '/website-update-services/': { format: 'numbered', section: /^## Frequently Asked Questions/, end: /^#{2,3} /, questions: ['What happens when a WordPress update breaks your site?'] },
};

// Links the owner asked for, using words already in the text.
const ANSWER_LINKS = {
  'How to repair a hacked website or malware infection?': ['clearing malicious files and database injections', SERVICE],
};
const BODY_LINKS = {
  '/white-label-website-maintenance-services-for-agencies/': [['### Do you offer white label WordPress maintenance specifically?', `### Do you offer [white label WordPress maintenance](${WL_POST}) specifically?`]],
};

// Master price list replaces old prices in these answers.
const PRICE_CHANGES = {
  '/best-website-maintenance-for-small-business/': [[/from \$95\/month/g, 'from $79/month']],
  '/website-maintenance-services-for-spain/': [[/95(?:&nbsp;|\s)USD\/mes \(Essential\), 195(?:&nbsp;|\s)USD\/mes \(Advanced\) y 395(?:&nbsp;|\s)USD\/mes \(Elevate\), con un 20% de descuento en el pago anual/g, '79 USD/mes (Essential), 149 USD/mes (Growth) y 299 USD/mes (Business), o 790, 1.490 y 2.990 USD al año']],
};
export const APPROVED_OLD_LINES = /from \$95\/month|95[\s\u00a0]USD\/mes \(Essential\)/;

const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[*_`\\]/g, '').replace(/\s+/g, ' ').trim();

function visibleAnswer(body, question) {
  const lines = body.split('\n');
  const i = lines.findIndex((l) => l.includes(question) && !l.startsWith('[') );
  if (i < 0) return null;
  const inline = new RegExp(`${question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:<i></i>)*</summary><(p|div)>(.*?)</\\1>`).exec(lines[i]);
  if (inline) return plain(inline[2]);
  for (let j = i + 1; j < lines.length; j++) if (lines[j].trim()) return plain(lines[j]);
  return null;
}

function faqNodes(node, found = []) {
  if (Array.isArray(node)) node.forEach((n) => faqNodes(n, found));
  else if (node && typeof node === 'object') {
    if ([].concat(node['@type'] ?? []).includes('FAQPage')) found.push(...[].concat(node.mainEntity ?? []));
    Object.values(node).forEach((v) => faqNodes(v, found));
  }
  return found;
}

export function applyFaqChanges(path, body, schema, log) {
  let out = body;
  for (const [from, to] of PRICE_CHANGES[path] ?? []) {
    const before = out;
    out = out.replace(from, to);
    log.push({ path, change: 'price', applied: before !== out });
  }
  const nodes = faqNodes(schema);
  const add = ADD[path];
  if (add) {
    const lines = out.split('\n');
    const start = lines.findIndex((l) => add.section.test(l));
    if (start < 0) throw new Error(`${path}: FAQ section not found`);
    let end = lines.findIndex((l, i) => i > start && add.end.test(l));
    if (end < 0) end = lines.length;
    let n = 0;
    if (add.format === 'numbered') for (const l of lines.slice(start, end)) n = Math.max(n, +(/^(\d+)\\\./.exec(l)?.[1] ?? 0));
    const blocks = [];
    for (const q of add.questions) {
      const node = nodes.find((x) => x.name === q);
      if (!node) throw new Error(`${path}: schema question not found: ${q}`);
      let answer = node.acceptedAnswer.text;
      const link = ANSWER_LINKS[q];
      if (link) {
        if (!answer.includes(link[0])) throw new Error(`Link phrase not in answer: ${link[0]}`);
        answer = answer.replace(link[0], `[${link[0]}](${link[1]})`);
      }
      const heading = add.format === 'h3' ? `### ${q}` : add.format === 'numbered' ? `${++n}\\. ${q}` : q;
      blocks.push(heading, '', answer, '');
      log.push({ path, change: 'shown', question: q });
    }
    lines.splice(end, 0, ...blocks);
    out = lines.join('\n');
  }
  for (const [from, to] of BODY_LINKS[path] ?? []) {
    if (!out.includes(from)) throw new Error(`${path}: text for link not found: ${from}`);
    out = out.replace(from, to);
    log.push({ path, change: 'link', to });
  }
  for (const [schemaQ, visibleQ] of Object.entries(ALIGN[path] ?? {})) {
    const node = nodes.find((x) => x.name === schemaQ);
    if (!node) throw new Error(`${path}: schema question not found: ${schemaQ}`);
    const searchQ = visibleQ;
    const answer = visibleAnswer(out, searchQ) ?? visibleAnswer(out, `[white label WordPress maintenance](${WL_POST}) specifically?`);
    if (!answer) throw new Error(`${path}: visible answer not found: ${visibleQ}`);
    node.name = visibleQ;
    node.acceptedAnswer.text = answer;
    log.push({ path, change: 'schema aligned', question: visibleQ });
  }
  return out;
}
