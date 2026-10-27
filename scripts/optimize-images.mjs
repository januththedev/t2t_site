import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';

sharp.concurrency(1);
sharp.cache({ memory: 32, files: 0, items: 20 });
const imageType = /\.(?:png|jpe?g|webp)$/i;
const critical = new Set(['images/T2T-Website.png', 'programs/ifap/ifap.png']);
const portraits = /(?:P\.K\.U-Dewaki|Sivalingam-Lakshanan|Shazan-Shazan|people\/)/i;

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'assets') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path)); else files.push(path);
  }
  return files;
}
function attribute(tag, name) { return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1]; }
function setAttribute(tag, name, value) {
  tag = tag.replace(new RegExp(`\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'i'), '');
  return tag.replace(/\s*\/?>$/, ` ${name}="${value}" />`);
}
function localImage(url, page) {
  if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url) || url.includes('${')) return null;
  try {
    const path = decodeURIComponent(new URL(url, 'https://t2t.local/' + page).pathname).slice(1);
    return imageType.test(path) ? path : null;
  } catch { return null; }
}

export async function optimizeSiteImages(output) {
  const pages = (await walk(output)).filter(path => path.endsWith('.html'));
  const html = new Map(); const wanted = new Set();
  for (const page of pages) {
    const text = await readFile(page, 'utf8'); html.set(page, text);
    for (const match of text.matchAll(/<img\b[^>]*>/gi)) {
      const path = localImage(attribute(match[0], 'src'), relative(output, page));
      if (path) wanted.add(path);
    }
  }
  const eventsPath = join(output, 'data/events.json');
  const events = JSON.parse(await readFile(eventsPath, 'utf8'));
  for (const event of events) wanted.add(event.image);
  const assetDirectory = join(output, 'assets/images');
  await mkdir(assetDirectory, { recursive: true });
  const manifest = new Map(); let originalBytes = 0; let optimizedBytes = 0;
  for (const source of wanted) {
    const input = await readFile(join(output, source));
    const metadata = await sharp(input).metadata();
    const rotated = metadata.orientation >= 5 && metadata.orientation <= 8;
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
    const logo = source.includes('/logos/'); const avatar = portraits.test(source);
    const sizes = source === 'images/logos/t2t.png' ? [48,96] : logo ? [120,240,480] : avatar ? [80,160,320] : [480,960,1600];
    const widths = [...new Set(sizes.map(size => Math.min(size,width)))];
    const hash = createHash('sha256').update(input).update('webp-q82-v1').digest('hex').slice(0,12);
    const stem = basename(source).replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi,'-').slice(0,60);
    const variants = [];
    for (const size of widths) {
      const name = `${stem}-${hash}-${size}.webp`;
      const target = join(assetDirectory,name);
      await sharp(input).autoOrient().resize({ width:size, withoutEnlargement:true }).webp({ quality:82, effort:4 }).toFile(target);
      variants.push({ width:size, url:'/assets/images/' + name, bytes:(await stat(target)).size });
    }
    const preferred = variants.find(item => item.width >= (logo || avatar ? 160 : 960)) || variants.at(-1);
    manifest.set(source, { width,height,src:preferred.url,srcset:variants.map(item => `${item.url} ${item.width}w`).join(', '),variants,
      sizes:source === 'images/logos/t2t.png' ? '44px' : logo ? '180px' : avatar ? '48px' : '(max-width: 800px) calc(100vw - 40px), (max-width: 1200px) 50vw, 600px' });
    originalBytes += input.length; optimizedBytes += preferred.bytes;
  }
  for (const [page,text] of html) {
    const result = text.replace(/<img\b[^>]*>/gi, tag => {
      const source = localImage(attribute(tag,'src'),relative(output,page)); const item = manifest.get(source);
      if (!item) return tag;
      const eager = critical.has(source) || attribute(tag,'loading') === 'eager';
      for (const [name,value] of Object.entries({src:item.src,srcset:item.srcset,sizes:item.sizes,decoding:'async',loading:eager?'eager':'lazy'})) tag = setAttribute(tag,name,value);
      if (!attribute(tag,'width')) tag = setAttribute(tag,'width',item.width);
      if (!attribute(tag,'height')) tag = setAttribute(tag,'height',item.height);
      if (critical.has(source)) tag = setAttribute(tag,'fetchpriority','high');
      return tag;
    });
    await writeFile(page,result);
  }
  for (const event of events) {
    const item = manifest.get(event.image);
    if (item) Object.assign(event,{ image:item.src,imageSrcset:item.srcset,imageWidth:item.width,imageHeight:item.height });
  }
  await writeFile(eventsPath,JSON.stringify(events));
  console.log(`Images: ${wanted.size} sources, ${(originalBytes/1048576).toFixed(1)} MB → ${(optimizedBytes/1048576).toFixed(2)} MB at default sizes (${Math.round((1-optimizedBytes/originalBytes)*100)}% smaller).`);
  return manifest;
}
