// The self-review loop in DESIGN-QA.md, on the built site in dist/. Shoots each template at 1440, 768 and 390 in both themes,
// measures the checklist rules in the browser, checks theme contrast and runs Lighthouse per theme.
// Usage: node scripts/design-qa.mjs [template names] [--no-lighthouse]. With --serve it only serves dist/ on port 4396.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = 'reports/design-qa';
const TEMPLATES = { home: '/', pricing: '/monthly-website-maintenance-packages/', package: '/wordpress-website-maintenance-packages/', service: '/website-update-services/', repair: '/website-repair-services/', hacked: '/website-hacked-recovery-services/', malware: '/wordpress-malware-removal-service/', country: '/website-maintenance-services-for-uk/', about: '/about-us/', 'blog-post': '/how-long-does-website-maintenance-take/', 'blog-index': '/blogs/', form: '/get-a-free-quote/', '404': '/404.html', 'thank-you': '/thank-you/' };
const names = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const RUN = names.length ? names : Object.keys(TEMPLATES);
const SWEEP = [[320, 640], [360, 640], [390, 844], [430, 932], [600, 960], [768, 1024], [900, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
const WIDTHS = process.argv.includes('--sweep') ? SWEEP : [[1440, 900], [768, 1024], [390, 844], [360, 640]];
const SHOT_WIDTHS = [1440, 768, 390];
const ALL = process.argv.includes('--all-pages');
const THEMES = ['dark', 'light'];

// Runs inside the page (same-origin iframe). Returns checklist measurements.
const MEASURE = `(d, w, vh) => {
  const win = d.defaultView, out = {}, bad = [];
  const R = (e) => e.getBoundingClientRect();
  const e_shortOk = (b) => vh < 720 && !!b.closest('.service-hero');
  const vis = (e) => { const r = R(e); return r.width > 0 && r.height > 0 && win.getComputedStyle(e).visibility !== 'hidden'; };
  const round = (n) => Math.round(n * 10) / 10;
  // Sections and their rectangles, for cropping.
  out.sections = [...d.querySelectorAll('[data-sec]')].map((s) => { const r = R(s); return { id: s.dataset.sec, top: Math.round(r.top + win.scrollY), height: Math.round(r.height) }; });
  // Horizontal scroll
  out.scrollW = d.documentElement.scrollWidth;
  if (out.scrollW > w) bad.push('horizontal scroll ' + out.scrollW);
  // Container edges
  const edges = new Set(), rights = new Set();
  d.querySelectorAll('.wrap').forEach((e) => { const s = win.getComputedStyle(e), r = R(e); edges.add(round(r.left + parseFloat(s.paddingLeft))); rights.add(round(r.right - parseFloat(s.paddingRight))); });
  out.edges = [...edges]; out.rights = [...rights];
  if (edges.size > 1 || rights.size > 1) bad.push('container edges differ ' + [...edges] + ' / ' + [...rights]);
  // Blocks that do not reach the container edges
  d.querySelectorAll('.sec[data-sec] > .wrap > *').forEach((e) => { if (!vis(e) || e.classList.contains('head') || e.classList.contains('sub-head') || e.classList.contains('btn-row') || e.classList.contains('line-a1') || e.classList.contains('toggle-row') || e.classList.contains('bill') || e.classList.contains('hp-swipe') || e.tagName === 'H2') return; const r = R(e), wr = R(e.parentElement), s = win.getComputedStyle(e.parentElement); const inner = wr.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight); if (Math.abs(r.width - inner) > 1) bad.push('block narrower than container: ' + e.className + ' ' + Math.round(r.width) + '/' + Math.round(inner)); });
  // Section padding
  out.pads = [...new Set([...d.querySelectorAll('.sec')].map((e) => win.getComputedStyle(e).paddingTop))];
  const expectPad = w > 760 ? '80px' : '48px';
  if (out.pads.length > 1 || (out.pads.length && out.pads[0] !== expectPad)) bad.push('section padding ' + out.pads);
  // Buttons
  const expectH = w > 760 ? 48 : 52;
  const heights = new Set(), radii = new Set();
  d.querySelectorAll('main .btn, header .btn, .final .btn').forEach((b) => { if (!vis(b)) return; radii.add(win.getComputedStyle(b).borderRadius); const h = Math.round(R(b).height); heights.add(h); if (h < expectH && !e_shortOk(b)) bad.push('button too short ' + h + ': ' + b.textContent.trim().slice(0, 30)); if (h > expectH && w > 1080 && !b.closest('.card, .split-side')) bad.push('button taller than the rule ' + h + ': ' + b.textContent.trim().slice(0, 40)); });
  out.btnHeights = [...heights]; out.btnRadii = [...radii];
  if (radii.size > 1) bad.push('button radius differs ' + [...radii]);
  // Stacked buttons on phones: full and equal width
  if (w <= 760) d.querySelectorAll('.btn-row, .callout .act').forEach((row) => { if (row.closest('details')) return; const bs = [...row.querySelectorAll('.btn')].filter(vis); if (!bs.length) return; const ws = new Set(bs.map((b) => Math.round(R(b).width))); if (ws.size > 1) bad.push('stacked buttons differ ' + [...ws]); if (Math.abs(R(bs[0]).width - R(row).width) > 1) bad.push('stacked button not full width: ' + bs[0].textContent.trim().slice(0, 30)); });
  // Every section: eyebrow, H2, intro
  d.querySelectorAll('.sec[data-sec]').forEach((s) => { if (s.dataset.sec === 'final') return; for (const q of ['.head .eyebrow', '.head h2', '.head .intro']) if (!s.querySelector(q)) bad.push('section ' + s.dataset.sec + ' has no ' + q); });
  out.h1 = d.querySelectorAll('h1').length; if (out.h1 !== 1) bad.push('h1 count ' + out.h1);
  // Text overflow and broken words
  d.querySelectorAll('main *, footer *, header *, .gmb *, .final *').forEach((e) => { if (!vis(e) || e.closest('.sr-only, svg, .dash-wrap, pre, code, .tbl thead, .post-grid .tbl-wrap, .hp-mq ul, .hp-mini, .hp-swipe > *, .wf-mark, .pp-tscroll > *, .rp-cmp-nav > *, .rp-stories > *') || e.matches('.post-grid .tbl-wrap, .crumbs') || e.matches('.hero-grid, .hero-grid > div, .steps li')) return; const r = R(e); if (r.right > w + 1 || r.left < -1) bad.push('off screen: ' + e.tagName + '.' + e.className + ' ' + Math.round(r.right)); if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && !e.matches('.hp-mq, .hp-swipe, .hp-more-wrap:has(> .hp-swipe), .pp-tscroll, .pp-step, .rp-cmp-nav, .rp-stories') && win.getComputedStyle(e).display !== 'inline') bad.push('text overflow: ' + e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 30)); });
  // Batch 1, Stage 2B (owner, 2026-11-05): text or boxes sticking out of their card.
  const CARD = '.card, article, aside, .country, .hp-bc, .hp-tq, .plan, .pp-plan, .rp-plan, .hp-report, .status-panel, .qf';
  const scrolls = (e) => { for (let x = e.parentElement; x; x = x.parentElement) { const o = win.getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  d.querySelectorAll('main *').forEach((e) => { if (!vis(e) || e.closest('.sr-only, svg') || e.matches(CARD)) return; const card = e.parentElement && e.parentElement.closest(CARD); if (!card || !vis(card) || scrolls(e) || win.getComputedStyle(e).position === 'absolute') return; const r = R(e), c = R(card); if (r.width && (r.right > c.right + 1 || r.left < c.left - 1)) bad.push('sticks out of its card: ' + e.tagName + '.' + e.className + ' ' + (e.textContent || '').trim().slice(0, 30)); });
  // "Example" tags stay inside their card.
  d.querySelectorAll('main .tag, main .badge, main .rp-badge, main .chip').forEach((t) => { if (!vis(t) || (t.textContent || '').trim() !== 'Example') return; const card = t.closest(CARD); if (!card) { bad.push('Example tag outside a card'); return; } const r = R(t), c = R(card); if (r.right > c.right + 1 || r.left < c.left - 1 || r.top < c.top - 1 || r.bottom > c.bottom + 1) bad.push('Example tag outside its card'); });
  // Tap targets on phones: at least 44 px tall (links inside a sentence are exempt, as in WCAG 2.5.8).
  if (w <= 430) d.querySelectorAll('main a, main button, main summary, main select, main input:not([type=hidden]), main textarea, header a, header button, .mbar a, .pp-stick a').forEach((e) => { if (!vis(e) || e.closest('.sr-only')) return; const st = win.getComputedStyle(e); if (e.matches('input') && (st.opacity === '0' || e.type === 'radio' || e.type === 'checkbox')) return; if (st.display === 'inline' && ([...e.parentElement.childNodes].some((n) => n.nodeType === 3 && n.data.trim()) || e.closest('p, li, td, dd, blockquote, figcaption, small, .crumbs, h1, h2, h3, h4'))) return; const h = Math.round(R(e).height); if (h < 44) bad.push('tap target ' + h + 'px: ' + e.tagName + ' ' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)); });
  // Words split across lines inside a heading or a card title
  const range = d.createRange();
  d.querySelectorAll('h1, h2, h3, .btn, strong').forEach((e) => { if (!vis(e) || e.closest('.sr-only')) return; const walker = d.createTreeWalker(e, 4); let n; while ((n = walker.nextNode())) { const re = /\\S+/g; let m; while ((m = re.exec(n.data))) { range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length); const rects = [...range.getClientRects()].filter((x) => x.width > 0); if (rects.length > 1 && Math.abs(rects[0].top - rects[rects.length - 1].top) > 4 && !/[-\\/–—@_.]/.test(m[0])) bad.push('word broken: ' + m[0]); } } });
  // Process line runs from first number to last number
  const nums = [...d.querySelectorAll('.steps .num')];
  if (nums.length) {
    const lis = [...d.querySelectorAll('.steps li')];
    lis.forEach((li, i) => {
      const a = win.getComputedStyle(li, '::after');
      if (i === lis.length - 1) { if (a.content !== 'none' && a.content !== 'normal') bad.push('line continues past the last step'); return; }
      const lr = R(li), left = lr.left + parseFloat(a.left), top = lr.top + parseFloat(a.top), endX = left + parseFloat(a.width), endY = top + parseFloat(a.height), next = R(nums[i + 1]), nx = next.left + next.width / 2, ny = next.top + next.height / 2;
      if (w > 1080) { if (endX < next.left || endX > next.right) bad.push('line segment ' + i + ' misses next number'); } else if (endY < next.top - 1 || endY > next.bottom + 1) bad.push('line segment ' + i + ' misses next number ' + Math.round(endY) + ' vs ' + Math.round(ny));
      void nx;
    });
    out.processCount = d.querySelectorAll('.steps').length;
  }
  // Contrast against the composed solid background
  const parse = (c) => { const m = c.match(/[\\d.]+/g); if (!m) return null; const k = /^color\\(/.test(c) ? 255 : 1; return { r: +m[0] * k, g: +m[1] * k, b: +m[2] * k, a: m[3] === undefined ? 1 : +m[3] }; };
  const lin = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const bgOf = (e) => { const stack = []; for (let x = e; x; x = x.parentElement) { const s = win.getComputedStyle(x); if (/gradient/.test(s.backgroundImage) && !x.closest('.cell, .callout, .case-panel, .hero, .page-hero, .plan, .vs, .answer')) return null; const c = parse(s.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; } } let b = { r: 255, g: 255, b: 255, a: 1 }; for (const c of stack.reverse()) b = over(c, b); return b; };
  let low = 99, lowAt = '', checked = 0;
  d.querySelectorAll('main *, footer *, header *, .gmb *').forEach((e) => { if (!vis(e) || e.closest('svg, .sr-only, .hl, .final, .btn.primary, .pop-tag, .bubble.me, .toggle, .tbl th, .stat b, button[type=submit], .num, .n')) return; const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.data.trim()); if (!own) return; const s = win.getComputedStyle(e); if (s.color === 'rgba(0, 0, 0, 0)') return; const bg = bgOf(e); if (!bg) return; const fg = over(parse(s.color), bg); const [a, b] = [L(fg), L(bg)].sort((x, y) => y - x); const ratio = (a + 0.05) / (b + 0.05); checked++; if (ratio < low) { low = ratio; lowAt = e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 24) + '"'; } const size = parseFloat(s.fontSize), big = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700); if (ratio < (big ? 3 : 4.5)) bad.push('contrast ' + ratio.toFixed(2) + ': ' + e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 24) + '"'); });
  out.contrast = { checked, low: round(low), lowAt };
  // Type scale
  const px = (q) => { const e = d.querySelector(q); return e ? parseFloat(win.getComputedStyle(e).fontSize) : 0; };
  out.type = { h1: px('h1'), h2: px('.sec h2, .pp-sec h2'), h3: px('.sec h3, .pp-sec h3'), body: parseFloat(win.getComputedStyle(d.body).fontSize) };
  if (w > 1080 && (out.type.h1 < (d.querySelector('.page-hero, .pp-hero, .rp-hero') ? 44 : 56) || out.type.h1 > 72 || (out.type.h2 && (out.type.h2 < 40 || out.type.h2 > 48)) || (out.type.h3 && (out.type.h3 < 20 || out.type.h3 > 24)) || out.type.body < 17 || out.type.body > 18)) bad.push('type scale ' + JSON.stringify(out.type));
  // Header
  const cta = [...d.querySelectorAll('header .btn')].filter(vis);
  out.headerCta = cta.map((b) => b.textContent.trim());
  if (w > 760 && !out.headerCta.includes('Get a free quote')) bad.push('header CTA missing');
  const burger = d.getElementById('burger');
  if (w <= 1080) {
    if (!vis(burger)) bad.push('no hamburger');
    burger.click();
    const m = d.getElementById('mnav');
    out.menu = { opens: vis(m) && burger.getAttribute('aria-expanded') === 'true', links: m.querySelectorAll('a').length, focusInside: m.contains(d.activeElement), cta: !!m.querySelector('.btn') };
    if (!out.menu.opens || !out.menu.cta || out.menu.links < 10 || !out.menu.focusInside) bad.push('menu ' + JSON.stringify(out.menu));
    d.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if (vis(m) || burger.getAttribute('aria-expanded') !== 'false' || d.activeElement !== burger) bad.push('Escape does not close the menu');
  } else {
    if (vis(burger)) bad.push('hamburger on desktop');
    if (!vis(d.querySelector('.nav'))) bad.push('no desktop nav');
  }
  // Owner's layout rules at desktop width: empty right side, big gaps, plain leftover lines.
  if (w > 1080) {
    const wrapW = 1200;
    d.querySelectorAll('main > section, main > .wrap').forEach((sec) => {
      const title = (sec.querySelector('h2') || sec.querySelector('h1') || {}).textContent || sec.className;
      const left = (w - wrapW) / 2, right = left + wrapW;
      const leaves = [...sec.querySelectorAll('h1, h2, h3, h4, h5, p, li, table, img, form, details, .card, .cell, .mini, .stat, .btn, .hp-bc, .hp-step, .hp-case, .hp-tq, .hp-stat, .hp-plat, .qf, .hp-report, .hp-svc-link, .hp-tabs, svg, pre, label, .toggle, .callout, .text-cols, .tbl-wrap')].filter((e) => vis(e) && !e.closest('.sr-only, .page-hero.center .crumbs, summary') && !(e.closest('details:not([open])') && !e.matches('details')) && !e.matches('svg') );
      const sr = R(sec), split = sec.matches('.read') || !!sec.querySelector('.split, .hero-split, .post-grid:not(.no-toc)');
      const boxes = leaves.map((e) => { const range = d.createRange(); range.selectNodeContents(e); const r = e.matches('p, h1, h2, h3, h4, h5, li') ? range.getBoundingClientRect() : R(e); return { e, top: r.top, bottom: r.bottom, left: r.left, right: e.closest('.head, .sub-head, .faq, .hero') ? right + 1 : r.right }; }).filter((b) => b.bottom > b.top).sort((a, b) => a.top - b.top);
      // (a) a tall stretch that stays in the left part with nothing to the right, unless it is a centred column
      if (!split && boxes.length) { const reach = left + wrapW * 0.7, covers = boxes.filter((x) => x.right > reach || Math.abs((x.left - left) - (right - x.right)) < 60).sort((x, y) => x.top - y.top); let y = boxes[0].top; const last = Math.max(...boxes.map((x) => x.bottom)); const check = (to) => { if (to - y > 160) { const at = boxes.find((x) => x.top >= y - 1); bad.push('empty right side ' + Math.round(to - y) + 'px: ' + title.trim().slice(0, 40) + ' <' + (at ? at.e.tagName + '.' + at.e.className + ' ' + at.e.textContent.trim().slice(0, 30) : '') + '>'); } }; for (const c of covers) { check(c.top); y = Math.max(y, c.bottom); } check(last); }
      // (b) vertical gaps inside a section
      let low = null; for (const b of boxes) { if (low !== null && b.top - low > 120) bad.push('gap ' + Math.round(b.top - low) + 'px in: ' + title.trim().slice(0, 40) + ' <' + b.e.tagName + '.' + b.e.className + ' ' + b.e.textContent.trim().slice(0, 30) + '>'); low = Math.max(low ?? 0, b.bottom); }
      void sr;
    });
    d.querySelectorAll('.prose .fill').forEach((g) => { const kids = [...g.children].filter(vis); if (kids.length >= 3 && kids.every((k) => R(k).left === R(kids[0]).left) && !g.closest('.split-side')) bad.push('grid stacked in one column: ' + kids[0].textContent.trim().slice(0, 30)); });
    d.querySelectorAll('.split').forEach((sp) => { const a = sp.querySelector('.split-main'), b = sp.querySelector('.split-side'); if (a && b && R(a).height > 700 && R(b).height < R(a).height * 0.3) bad.push('side element too short: ' + a.textContent.trim().slice(0, 40)); });
    // (c) plain uppercase or one-word lines
    d.querySelectorAll('main p').forEach((e) => { if (!vis(e) || e.closest('.card, .stat, .tbl, form, .btn, .head, .chips, .icon-badges, details, .hero, .final, .steps, nav, .toc, .dash, .num-cards, .side-panel') || e.matches('.n, .eyebrow, .badge-label, .line-label, .emoji-tile')) return; const t = e.textContent.trim(); if (t && (!/\\s/.test(t) || (t === t.toUpperCase() && /[A-Z]{3}/.test(t)))) bad.push('plain line: ' + t.slice(0, 40)); });
  }
  // Footer
  const foot = d.querySelector('footer');
  out.footer = { cols: foot.querySelectorAll('.wf-col').length, nap: !!foot.querySelector('.wf-contact a[href^="tel:"]') && !!foot.querySelector('.wf-contact a[href^="mailto:"]'), badges: foot.querySelectorAll('img[src*="/2026/06/"]').length, strip: new Set([...d.querySelectorAll('.hp-trust a:not([tabindex])')].map((a) => a.href)).size, heights: [...new Set([...d.querySelectorAll('.hp-trust li:not([aria-hidden]) .hp-dir')].map((i) => Math.round(R(i).height)))], cookie: !!foot.querySelector('#cookie-settings') };
  const home = !!d.querySelector('.hp-hero');
  if (out.footer.cols !== 3 || !out.footer.nap || out.footer.badges !== 0 || (home && (out.footer.strip !== 7 || out.footer.heights.length !== 1)) || !out.footer.cookie || !d.querySelector('.final .btn, .hp-final .btn')) bad.push('footer ' + JSON.stringify(out.footer));
  // Owner, 2026-11-04: no GMB block on any page; the company details are in the footer.
  if (d.querySelector('.gmb')) bad.push('GMB block still on the page');
  if (out.footer.heights.length > 1) bad.push('badge heights differ');
  out.bad = bad;
  return out;
}`;

// First-screen rule (owner, 2026-11-05): no cookie bar and no top bar; the header sits at the top of the page.
const FIRST = `(d) => { const bad = []; if (d.getElementById('cookie-bar') || d.querySelector('.cookie-bar')) bad.push('cookie bar is back'); if (d.querySelector('.topbar')) bad.push('top bar is back'); const h = d.querySelector('header'); if (h && Math.round(h.getBoundingClientRect().top + d.defaultView.scrollY) !== 0) bad.push('header not at the top: ' + Math.round(h.getBoundingClientRect().top)); return { barTop: 'none', bad }; }`;

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const wrapper = (u) => {
  const t = u.searchParams.get('t'), w = u.searchParams.get('w'), h = u.searchParams.get('h'), mode = u.searchParams.get('m'), PAGE = u.searchParams.get('p');
  const body = {
    full: `const r=d.documentElement;d.querySelectorAll('.fade').forEach((e)=>{e.style.transition='none';e.classList.add('in')});d.querySelector('.top').style.position='static';f.style.height=r.scrollHeight+'px';document.body.dataset.h=r.scrollHeight;`,
    measure: `setTimeout(()=>{d.querySelectorAll('.fade').forEach((e)=>{e.style.transition='none';e.classList.add('in')});try{document.body.dataset.r=encodeURIComponent(JSON.stringify((${MEASURE})(d,${w},${h})));}catch(e){document.body.dataset.r=encodeURIComponent(JSON.stringify({bad:['measure failed: '+e.message]}));}},500);`,
    first: `setTimeout(()=>{document.body.dataset.r=encodeURIComponent(JSON.stringify((${FIRST})(d)));},800);`,
    menu: `d.getElementById('burger').click();`,
  }[mode] ?? '';
  return `<!doctype html><body style="margin:0"><script>localStorage.setItem('wms-theme','${t}');localStorage.removeItem('wms-consent')</script><iframe id="f" src="${PAGE}" style="border:0;display:block;width:${w}px;height:${h}px"></iframe><script>const f=document.getElementById('f');f.onload=()=>{const d=f.contentDocument;${body}};</script>`;
};
const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/_w') { res.writeHead(200, { 'content-type': TYPES['.html'] }); return res.end(wrapper(u)); }
  // Lighthouse clears storage, so this route fixes the theme for it.
  if (u.pathname.startsWith('/_forced/')) {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    const parts = u.pathname.split('/');
    const pagePath = `/${parts.slice(3).join('/')}`;
    const file = pagePath.endsWith('.html') ? join('dist', pagePath) : join('dist', pagePath, 'index.html');
    return res.end(readFileSync(file, 'utf8').replace(/t=matchMedia\([^?]*\?'dark':'light'/, `t='${parts[2]}'`));
  }
  let f = join('dist', decodeURIComponent(u.pathname));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600', 'access-control-allow-origin': '*' });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(4396, r));
if (process.argv.includes('--serve')) { console.log('serving on 4396'); await new Promise(() => {}); }
const ORIGIN = 'http://localhost:4396';
const chrome = (args) => new Promise((done) => {
  let out = '';
  // One throwaway profile per run, removed afterwards so the disk does not fill up.
  const profile = mkdtempSync(join(tmpdir(), 'qa-'));
  const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, '--force-device-scale-factor=1', '--virtual-time-budget=4000', ...args]);
  c.stdout.on('data', (d) => (out += d));
  c.on('exit', () => { setTimeout(() => { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); done(out); }, 200); });
});
const q = (p, t, w, h, m) => `${ORIGIN}/_w?p=${encodeURIComponent(p)}&t=${t}&w=${w}&h=${h}&m=${m}`;
const data = (dom) => JSON.parse(decodeURIComponent(/data-r="([^"]*)"/.exec(dom)?.[1] ?? '%7B%22bad%22%3A%5B%22no%20result%22%5D%7D'));

let problems = 0;
const summary = [];
// Every page once at desktop width, measurements only.
if (ALL) {
  const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : n === 'index.html' ? [p] : []; });
  const seen = {};
  for (const file of walk('dist')) {
    const page = `/${file.replace(/\\/g, '/').replace(/^dist\//, '').replace(/index\.html$/, '')}`;
    if (page.startsWith('/admin')) continue;
    const size = process.argv.includes('--phone') ? [360, 640] : [1440, 900];
    const m = data(await chrome(['--dump-dom', q(page, 'light', size[0], size[1], 'measure')]));
    problems += m.bad.length;
    for (const b of new Set(m.bad)) { const key = b.replace(/\d+px/, 'Npx'); (seen[key] ??= []).push(page); }
    if (m.bad.length) console.log(page, m.bad.length);
  }
  writeFileSync(`${ROOT}/all-pages.json`, JSON.stringify(seen, null, 1));
  console.log(`all pages: ${problems} problems, details in ${ROOT}/all-pages.json`);
  server.close();
  process.exit(problems ? 1 : 0);
}
for (const name of RUN) {
const PAGE = TEMPLATES[name];
const OUT = `${ROOT}/${name}`;
mkdirSync(OUT, { recursive: true });
const results = {};
const before = problems;
const say = (label, bad) => { problems += bad.length; console.log(`${name} ${label}: ${bad.length ? `${bad.length} problems` : 'clean'}`); for (const b of [...new Set(bad)].slice(0, 14)) console.log(`   ${b}`); };

// 1. Measurements
for (const t of THEMES) for (const [w, h] of WIDTHS) {
  const m = data(await chrome(['--dump-dom', q(PAGE, t, w, h, 'measure')]));
  results[`${t}-${w}`] = m;
  const first = data(await chrome(['--dump-dom', q(PAGE, t, w, h, 'first')]));
  say(`${t} ${w}: contrast low ${m.contrast?.low} (${m.contrast?.checked} texts), buttons ${m.btnHeights}, pads ${m.pads}, cookie bar at ${first.barTop}`, [...m.bad, ...first.bad]);
}
writeFileSync(`${OUT}/measurements.json`, JSON.stringify(results, null, 1));

// 2. Screenshots: full page, first screen, and a montage per section with all six views.
const crops = {};
const buffers = {};
for (const t of THEMES) for (const [w, h] of WIDTHS.filter(([x]) => SHOT_WIDTHS.includes(x))) {
  const pageH = +(/data-h="(\d+)"/.exec(await chrome(['--dump-dom', q(PAGE, t, w, h, 'full')]))?.[1] ?? 0);
  if (!pageH) throw new Error(`no height ${t} ${w}`);
  const raw = resolve(OUT, `_${t}-${w}.png`);
  // Chrome sometimes writes a broken file for a very tall page, so it gets more tries.
  for (let tries = 0; tries < 3; tries++) {
    await chrome([`--window-size=${Math.max(w, 500)},${pageH}`, `--screenshot=${raw}`, q(PAGE, t, w, h, 'full')]);
    try { await sharp(raw).metadata(); break; } catch { if (tries === 2) throw new Error(`no screenshot for ${name} ${t} ${w}`); }
  }
  const full = await sharp(raw).extract({ left: 0, top: 0, width: w, height: pageH }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(`${OUT}/${t}-${w}-full.png`, full);
  buffers[`${t}-${w}`] = full;
  await chrome([`--window-size=${Math.max(w, 500)},${h}`, `--screenshot=${raw}`, q(PAGE, t, w, h, 'none')]);
  await sharp(raw).extract({ left: 0, top: 0, width: w, height: h }).png({ compressionLevel: 9 }).toFile(`${OUT}/${t}-${w}-first-screen.png`);
  rmSync(raw);
  crops[`${t}-${w}`] = { h: pageH };
}
if (name === 'home') for (const t of THEMES) {
  const raw = resolve(OUT, '_m.png');
  await chrome(['--window-size=500,844', `--screenshot=${raw}`, q(PAGE, t, 390, 844, 'menu')]);
  await sharp(raw).extract({ left: 0, top: 0, width: 390, height: 844 }).png().toFile(`${OUT}/${t}-390-menu-open.png`);
  rmSync(raw);
}
const sectionsAt = (key) => results[key].sections;
const ids = sectionsAt('dark-1440').map((s) => s.id);
const SCALE = { 1440: 0.5, 768: 0.5, 390: 0.6 };
mkdirSync(`${OUT}/sections`, { recursive: true });
for (const [n, id] of ids.entries()) {
  const tiles = [];
  let y = 8, maxW = 0;
  for (const t of THEMES) {
    let x = 8, rowH = 0;
    for (const w of SHOT_WIDTHS) {
      const s = sectionsAt(`${t}-${w}`).find((v) => v.id === id);
      const meta = await sharp(buffers[`${t}-${w}`]).metadata();
      const height = Math.min(s.height, meta.height - s.top);
      if (height < 1) continue;
      const img = await sharp(buffers[`${t}-${w}`]).extract({ left: 0, top: s.top, width: w, height }).resize(Math.round(w * SCALE[w])).png().toBuffer();
      const m = await sharp(img).metadata();
      tiles.push({ input: img, left: x, top: y });
      x += m.width + 8; rowH = Math.max(rowH, m.height);
    }
    maxW = Math.max(maxW, x); y += rowH + 8;
  }
  await sharp({ create: { width: maxW, height: y, channels: 3, background: '#808080' } }).composite(tiles).png({ compressionLevel: 9 }).toFile(`${OUT}/sections/${String(n + 1).padStart(2, '0')}-${id}.png`);
}
console.log(`${name} sections: ${ids.length}`);
summary.push([name, problems - before]);
}
console.log(summary.map(([n, c]) => `${n}: ${c}`).join(' | '));

// 3. Theme colours (WCAG 4.5:1), including both ends of each button gradient.
const lum = (hex) => { const h = hex.slice(1); const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16); const f = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const css = readFileSync('src/styles/site.css', 'utf8');
const parts = { light: css.slice(0, css.indexOf('/*dark*/')), dark: /\/\*dark\*\/([\s\S]*?)\/\*end\*\//.exec(css)[1] };
for (const [name, part] of Object.entries(parts)) {
  const v = Object.fromEntries([...part.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6})\b/gi)].map((m) => [m[1], m[2]]));
  const pairs = [['ink', 'sec'], ['ink', 'alt'], ['ink', 'card'], ['head', 'sec'], ['head', 'alt'], ['head', 'card'], ['muted', 'sec'], ['muted', 'alt'], ['muted', 'card'], ['muted', 'footbg'], ['ink', 'footbg'], ['link', 'sec'], ['link', 'alt'], ['link', 'card'], ['accent', 'sec'], ['accent', 'alt'], ['accent', 'card'], ['ok', 'sec'], ['ok', 'alt'], ['ok', 'card'], ['bad', 'card'], ['th-ink', 'th'], ['ink', 'with'], ['head', 'with'], ['cookie-ink', 'cookie'], ['head', 'pop-bg'], ['ok', 'pop-bg'], ['muted', 'pop-bg']];
  const rows = pairs.filter(([f, b]) => v[f] && v[b]).map(([f, b]) => [f, b, ratio(v[f], v[b])]);
  for (const c of [...(/--btn: linear-gradient\(([^)]*)\)/.exec(part)?.[1] ?? '').matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0])) rows.push(['white', `button ${c}`, ratio('#ffffff', c)]);
  for (const c of ['#1d6fd8', '#0a7f54', '#c2410c', '#7e22ce', '#be185d']) rows.push(['white', `step ${c}`, ratio('#ffffff', c)]);
  const low = rows.filter((r) => r[2] < 4.5);
  problems += low.length;
  console.log(`theme colours ${name}: ${rows.length} pairs, lowest ${Math.min(...rows.map((r) => r[2])).toFixed(2)}:1, under 4.5: ${low.map((r) => `${r[0]} on ${r[1]} ${r[2].toFixed(2)}`).join(', ') || 'none'}`);
}

// 4. Lighthouse
if (!process.argv.includes('--no-lighthouse')) {
  for (const name of RUN) for (const t of THEMES) for (const form of ['mobile', 'desktop']) {
    const file = resolve(ROOT, `.lh-${name}-${t}-${form}.json`);
    await new Promise((done) => {
      const args = ['lighthouse', `${ORIGIN}/_forced/${t}${TEMPLATES[name]}`, '--quiet', '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices', '--chrome-flags=--headless=new --disable-gpu', ...(form === 'desktop' ? ['--preset=desktop'] : [])];
      spawn('npx', args, { shell: true, env: { ...process.env, CHROME_PATH: CHROME } }).on('exit', done);
    });
    if (!existsSync(file)) { console.log(`${name} ${t} ${form}: no result`); problems++; continue; }
    const { categories: c, audits: a } = JSON.parse(readFileSync(file, 'utf8'));
    const perf = Math.round(c.performance.score * 100), cls = a['cumulative-layout-shift'].numericValue, contrast = a['color-contrast'].score === 1;
    if ((form === 'mobile' && perf < 90) || cls > 0.001 || !contrast) problems++;
    console.log(`lighthouse ${name} ${t} ${form}: perf ${perf}, a11y ${Math.round(c.accessibility.score * 100)}, contrast ${contrast ? 'pass' : 'FAIL'}, LCP ${a['largest-contentful-paint'].displayValue}, CLS ${a['cumulative-layout-shift'].displayValue}, TBT ${a['total-blocking-time'].displayValue}`);
    for (const x of c.accessibility.auditRefs.map((r) => a[r.id]).filter((r) => r?.score === 0)) console.log(`   a11y ${x.id}: ${(x.details?.items ?? []).slice(0, 5).map((i) => i.node?.snippet?.slice(0, 90)).join(' || ')}`);
    rmSync(file);
  }
}
console.log(`TOTAL PROBLEMS: ${problems}`);
server.close();
process.exit(problems ? 1 : 0);
