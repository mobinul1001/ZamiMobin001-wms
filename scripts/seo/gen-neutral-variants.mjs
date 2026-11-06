// Rebuilds the WordPress size variants (name-WxH.ext) of a replaced image from the new full-size file: same names,
// same sizes (cover crop for the square thumbnail), same format. Usage: node scripts/seo/gen-neutral-variants.mjs <public path>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, basename, extname, join } from 'node:path';
import sharp from 'sharp';
sharp.cache(false);
const path = process.argv[2];
const file = `public${path}`, dir = dirname(file), ext = extname(file), base = basename(file, ext);
const src = readFileSync(file);
for (const n of readdirSync(dir)) {
  const m = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)x(\\d+)${ext.replace('.', '\\.')}$`).exec(n);
  if (!m) continue;
  const f = join(dir, n);
  const old = await sharp(readFileSync(f)).metadata();
  const out = await sharp(src).resize({ width: +m[1], height: +m[2], fit: 'cover' }).toFormat(old.format, { quality: 82 }).toBuffer();
  writeFileSync(f, out);
  const nm = await sharp(readFileSync(f)).metadata();
  if (nm.width !== old.width || nm.height !== old.height || nm.format !== old.format) throw new Error(`${n}: size or format changed`);
  console.log(`${n}: ${nm.width}x${nm.height} ${nm.format} ${statSync(f).size} bytes`);
}
