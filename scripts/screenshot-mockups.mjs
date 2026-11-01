// Takes desktop and mobile screenshots of the mockups with headless Chrome.
// Pages load inside an iframe, so the mobile width is exact. Usage: node scripts/screenshot-mockups.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = resolve('export/.chrome-shots');
const OUT = 'reports/mockups';
mkdirSync(OUT, { recursive: true });
const SIZES = { desktop: [1440, 900], mobile: [390, 844] };
const MAX_HEIGHT = 8000;

const chrome = (args) => spawnSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--user-data-dir=${PROFILE}`, '--force-device-scale-factor=1', ...args], { encoding: 'utf8', timeout: 120000, maxBuffer: 80 * 1024 * 1024 });

for (const page of ['home', 'pricing', 'blog']) {
  for (const [name, [width, viewH]] of Object.entries(SIZES)) {
    const target = pathToFileURL(resolve(`mockups/${page}.html`)).href;
    const wrapper = resolve(`mockups/_shot-${page}-${name}.html`);
    writeFileSync(wrapper, `<!doctype html><html><body style="margin:0;background:#fff"><iframe id="f" src="${target}" style="border:0;display:block;width:${width}px;height:${viewH}px"></iframe>
<script>const f=document.getElementById('f');f.onload=()=>{const h=f.contentDocument.documentElement.scrollHeight;const w=f.contentDocument.documentElement.scrollWidth;f.style.height=h+'px';document.body.dataset.h=h;document.body.dataset.w=w;};</script></body></html>`);
    const dom = chrome(['--virtual-time-budget=6000', '--dump-dom', pathToFileURL(wrapper).href]);
    const h = +(/data-h="(\d+)"/.exec(dom.stdout)?.[1] ?? 0);
    const w = +(/data-w="(\d+)"/.exec(dom.stdout)?.[1] ?? 0);
    if (!h) throw new Error(`No height for ${page} ${name}: ${dom.stderr?.slice(0, 200)}`);
    const shotH = Math.min(h, MAX_HEIGHT);
    const raw = resolve(OUT, `_raw-${page}-${name}.png`);
    chrome([`--window-size=${Math.max(width, 500)},${shotH}`, '--virtual-time-budget=6000', `--screenshot=${raw}`, pathToFileURL(wrapper).href]);
    await sharp(raw).extract({ left: 0, top: 0, width, height: shotH }).png({ compressionLevel: 9 }).toFile(`${OUT}/${page}-${name}.png`);
    rmSync(raw);
    rmSync(wrapper);
    console.log(`${page}-${name}: page ${w}x${h}, saved height ${shotH}${w > width ? '  HORIZONTAL OVERFLOW' : ''}`);
  }
}
rmSync(PROFILE, { recursive: true, force: true });
