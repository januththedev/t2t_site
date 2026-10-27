import {
  cpSync,
  mkdirSync,
  readdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { renderPages } from "../src/render.tsx";
import { buildKnowledge } from "./build-knowledge.mjs";
import { optimizeSiteImages } from "./optimize-images.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");
// Publish only website content, never repository metadata or local tooling.
const directories = [
  "corporate-programs",
  "data",
  "docs",
  "events",
  "images",
  "privacy_policy",
  "programs",
  "register",
  "chatbot",
];
const files = readdirSync(root).filter((name) => /\.(html|css|js)$/.test(name));

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const name of [...files, ...directories]) {
  cpSync(join(root, name), join(output, name), {
    recursive: true,
    filter: (source) => !basename(source).startsWith("."),
  });
}

// Generate real HTML before indexing: pages and chatbot use the same published content.
renderPages(output);
const images = await optimizeSiteImages(output);
renderPages(output, Object.fromEntries(images));
buildKnowledge(output);
await build();
const manifest = JSON.parse(
  readFileSync(join(output, ".vite/manifest.json"), "utf8"),
);
const entry = manifest["src/client.tsx"];
const assets = [
  ...(entry.css || []).map((path) => `<link rel="stylesheet" href="/${path}">`),
  `<script type="module" src="/${entry.file}"></script>`,
].join("");
function inject(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) inject(path);
    else if (item.name.endsWith(".html"))
      writeFileSync(
        path,
        readFileSync(path, "utf8").replace("<!--REACT_ASSETS-->", assets),
      );
  }
}
inject(output);
console.log(
  "React pages prerendered; chatbot knowledge and responsive images generated.",
);
