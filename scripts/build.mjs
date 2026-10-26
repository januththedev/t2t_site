import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKnowledge } from './build-knowledge.mjs';
import { optimizeSiteImages } from './optimize-images.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
// Publish only website content, never repository metadata or local tooling.
const directories = [
  'corporate-programs', 'data', 'docs', 'events', 'images',
  'privacy_policy', 'programs', 'register',
  'chatbot',
];
const files = readdirSync(root).filter((name) => /\.(html|css|js)$/.test(name));

buildKnowledge();
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const name of [...files, ...directories]) {
  cpSync(join(root, name), join(output, name), {
    recursive: true,
    filter: (source) => !basename(source).startsWith('.'),
  });
}

await optimizeSiteImages(output);
console.log(`Static site built in dist/ (${files.length} root files, ${directories.length} content directories).`);
