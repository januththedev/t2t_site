import { renderToString } from "react-dom/server";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { App } from "./App";
import content from "./content.json";
import type { Payload, ImageAsset, Page } from "./types";
export function renderPages(
  output: string,
  images: Record<string, ImageAsset> = {},
) {
  let footer = readFileSync("ui/footer.html", "utf8");
  const rewrite = (html: string, base = "/") =>
    html.replace(/<img\b[^>]*>/gi, (tag) => {
      const path = tag.match(/\bsrc="([^"]+)"/)?.[1];
      const asset = path
        ? images[new URL(path, "https://t2t.local" + base).pathname.slice(1)]
        : undefined;
      if (!asset) return tag;
      const attrs = {
        src: asset.src,
        srcset: asset.srcset,
        sizes: asset.sizes,
        width: String(asset.width),
        height: String(asset.height),
        decoding: "async",
      };
      for (const [name, value] of Object.entries(attrs)) {
        tag = tag.replace(new RegExp(`\\s${name}="[^"]*"`, "i"), "");
        tag = tag.replace(/\s*\/?>$/, ` ${name}="${value}" />`);
      }
      return tag;
    });
  footer = rewrite(footer);
  for (const original of Object.values(content)) {
    const page: Page = {
      ...original,
      html: rewrite(original.html, original.path),
    };
    const used = Object.fromEntries(
      Object.entries(images).filter(
        ([key]) =>
          page.html.includes(images[key].src) ||
          key === "images/logos/t2t.png" ||
          (page.path === "/" &&
            key === "images/IMG_20250330_121443-scaled.jpg"),
      ),
    );
    const payload: Payload = { page, images: used, footer };
    const html = renderToString(<App payload={payload} />)
      .replaceAll("srcSet=", "srcset=")
      .replaceAll("fetchPriority=", "fetchpriority=");
    const escape = (s: string) =>
      s
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;");
    const destination = join(
      output,
      page.path.endsWith("/") ? page.path + "index.html" : page.path,
    );
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(
      destination,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="theme-color" content="#f7f8fb"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:type" content="website"><link rel="icon" href="/images/logos/t2t.png"><link rel="stylesheet" href="/styles.css"><!--REACT_ASSETS--><script defer src="/chatbot/widget.js"></script></head><body class="${page.bodyClass}"><div id="root">${html}</div><script id="t2t-data" type="application/json">${JSON.stringify(payload).replaceAll("<", "\\u003c")}</script></body></html>`,
    );
  }
}
