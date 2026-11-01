// Runs after `astro build`. netlify.toml has no per-context headers, so the noindex
// header is written at build time. Only a production build on the real domain goes without it.
import { appendFileSync, existsSync } from 'node:fs';

const LIVE_URL = 'https://websitemaintenanceservices.org';
const { CONTEXT: context, URL: url } = process.env;
if (!existsSync('dist')) throw new Error('dist/ not found: run astro build first');

if (context === 'production' && url === LIVE_URL) {
  console.log('preview-headers: live production build, no noindex header added');
} else {
  appendFileSync('dist/_headers', '/*\n  X-Robots-Tag: noindex, nofollow\n');
  console.log(`preview-headers: context "${context ?? 'unset'}", url "${url ?? 'unset'}", added X-Robots-Tag: noindex, nofollow`);
}
