// Contact sheet (2 per row, 700 px wide) of public images, for a visual check. Usage: node sheet.mjs out.png /path1 /path2 ...
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
sharp.cache(false);
const [out, ...imgs] = process.argv.slice(2);
const W = 700, tiles = [];
for (const p of imgs) { const b = await sharp(readFileSync(`public${p}`)).resize({ width: W }).png().toBuffer(); tiles.push({ b, h: (await sharp(b).metadata()).height }); }
const comp = []; let y = 0;
for (let i = 0; i < tiles.length; i += 2) { const r = tiles.slice(i, i + 2); r.forEach((t, j) => comp.push({ input: t.b, left: j * (W + 10), top: y })); y += Math.max(...r.map((t) => t.h)) + 10; }
await sharp({ create: { width: W * 2 + 10, height: y, channels: 3, background: '#fff' } }).composite(comp).png().toFile(out);
console.log(out, y);
