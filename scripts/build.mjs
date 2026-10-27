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

buildKnowledge();
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const name of [...files, ...directories]) {
  cpSync(join(root, name), join(output, name), {
    recursive: true,
    filter: (source) => !basename(source).startsWith("."),
  });
}

// Shared markup is rendered at build time: no navigation fetch or layout shift.
const header = readFileSync(join(root, "ui/header.html"), "utf8");
const footer = readFileSync(join(root, "ui/footer.html"), "utf8");
function renderShell(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) renderShell(path);
    else if (entry.name.endsWith(".html")) {
      const html = readFileSync(path, "utf8");
      writeFileSync(
        path,
        html
          .replace("<!--T2T_HEADER-->", header)
          .replace("<!--T2T_FOOTER-->", footer),
      );
    }
  }
}
renderShell(output);

await optimizeSiteImages(output);
console.log(
  `Static site built in dist/ (${files.length} root files, ${directories.length} content directories).`,
);
