// Read-only: downloads WordPress media files the page crawl did not reach, so that every
// attachment redirect and old image URL has a file. GET only, at most one request per second.
// Usage: node scripts/download-media.mjs [--dry-run]
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ORIGIN = 'https://websitemaintenanceservices.org';
const USER_AGENT = 'WMS-rebuild-crawler/1.0 (owner-approved read-only site migration)';
const dryRun = process.argv.includes('--dry-run');

const urls = new Set();
for (const m of JSON.parse(readFileSync('export/wp-json/media.json', 'utf8'))) {
  if (m.source_url) urls.add(m.source_url);
  for (const s of Object.values(m.media_details?.sizes ?? {})) if (s.source_url) urls.add(s.source_url);
}
for (const f of readdirSync('export/pages')) {
  const r = JSON.parse(readFileSync(join('export/pages', f), 'utf8'));
  if (r.redirectChain?.length && r.finalUrl?.includes('/wp-content/uploads/')) urls.add(r.finalUrl);
}

const target = (url) => join('export/assets', decodeURI(new URL(url).pathname).slice(1));
const list = [...urls].filter((u) => u.startsWith(`${ORIGIN}/wp-content/uploads/`));
const missing = list.filter((u) => !existsSync(target(u)));
console.log(`media urls ${list.length}, already saved ${list.length - missing.length}, missing ${missing.length}`);
if (dryRun) process.exit(0);

const failed = [];
for (const [i, url] of missing.entries()) {
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60000) });
    if (res.status === 200) {
      mkdirSync(dirname(target(url)), { recursive: true });
      writeFileSync(target(url), Buffer.from(await res.arrayBuffer()));
    } else {
      await res.body?.cancel();
      failed.push({ url, status: res.status });
    }
  } catch (e) {
    failed.push({ url, status: 0, error: String(e) });
  }
  if ((i + 1) % 100 === 0) console.log(`${i + 1}/${missing.length}`);
  const wait = 1000 - (Date.now() - start);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}
writeFileSync('export/media-failed.json', JSON.stringify(failed, null, 1));
console.log(`done. saved ${missing.length - failed.length}, failed ${failed.length}`);
