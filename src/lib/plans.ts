// Master plan cards, as HTML strings, for the homepage and the pricing page.
import prices from '../data/prices.json';
import features from '../data/features.json';
import { icon, tick } from './icons';

const money = (n: number) => `$${n.toLocaleString('en-US')}`;
const explain = features.explain as Record<string, string>;

export function plansHtml(fade = '') {
  const cards = prices.plans.map((p) => {
    const popular = 'popular' in p && p.popular;
    return `<article class="card plan${popular ? ' pop' : ''}${fade}">
      ${popular ? '<span class="pop-tag">Most popular</span>' : ''}
      <h3>${p.name}</h3>
      <div class="price"><span class="m"><b>${money(p.monthly)}</b><small>/mo</small></span><span class="y"><b>${money(p.annual)}</b><small>/yr</small></span></div>
      <p class="note"><span class="m">${prices.firstMonthNote.en}</span><span class="y">${prices.annualNote.en}</span></p>
      <p class="annual m">or ${money(p.annual)}/yr, <b>${prices.annualNote.en}</b></p>
      <a class="btn ${popular ? 'primary' : 'ghost'}" href="/get-a-free-quote/#${p.name.toLowerCase()}">Start ${p.name}${icon('arrow')}</a>
      <ul class="feat">${p.includes.map((f) => (explain[f] ? `<li>${tick}<details><summary>${f}</summary><p>${explain[f]}</p></details></li>` : `<li>${tick}<span>${f}</span></li>`)).join('')}</ul>
    </article>`;
  }).join('');
  return `<input class="bill" type="radio" name="bill" id="bm" checked aria-label="Monthly billing"><input class="bill" type="radio" name="bill" id="by" aria-label="Annual billing">
  <div class="toggle-row"><div class="toggle" role="group" aria-label="Billing period"><label for="bm">Monthly</label><label for="by">Annual</label></div><span class="save">${prices.annualNote.en}</span></div>
  <div class="grid g3 plans">${cards}</div>`;
}
