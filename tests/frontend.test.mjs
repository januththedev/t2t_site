import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { publishedEventDay, colomboDay } from "../event-dates.js";
const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(join(dir, entry.name))
      : entry.name.endsWith(".html")
        ? [join(dir, entry.name)]
        : [],
  );
test("published dates do not shift a day in positive-offset browser time zones", () => {
  assert.equal(publishedEventDay({ date: "Wed, 17 Dec 2025" }), "2025-12-17");
  assert.equal(publishedEventDay({ date: "Mon, 15 Dec 2025" }), "2025-12-15");
  assert.equal(
    publishedEventDay({
      date: "Sat, 7 Mar at 09:30",
      image: "events/research-excellence/flyer.jpg",
    }),
    "2026-03-07",
  );
  assert.equal(publishedEventDay({ date: "Fri, 31 Feb 2026" }), null);
  assert.equal(publishedEventDay({ date: "Sat, 7 Mar" }), null);
  assert.equal(colomboDay(new Date("2026-10-25T20:00:00Z")), "2026-10-26");
});
test("shared page shell is rendered into every redesigned page without runtime fetching", () => {
  for (const file of walk(dist)) {
    if (file.includes("/register/")) continue;
    const html = readFileSync(file, "utf8");
    assert.ok(!html.includes("<!--T2T_"), file);
    assert.equal((html.match(/class="site-header"/g) || []).length, 1, file);
    assert.equal((html.match(/class="site-footer"/g) || []).length, 1, file);
    assert.equal((html.match(/<main\b/g) || []).length, 1, file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    assert.ok(html.includes("Skip to content"), file);
  }
});
test("all local navigation, brochure links and fragment destinations resolve", () => {
  for (const file of walk(dist)) {
    const html = readFileSync(file, "utf8");
    const base = "https://t2t.local/" + file.slice(dist.length + 1);
    for (const [, href] of html.matchAll(/\bhref="([^"]*)"/g)) {
      if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) continue;
      const url = new URL(href, base);
      let target = join(dist, decodeURIComponent(url.pathname));
      assert.ok(existsSync(target), `${file}: missing ${href}`);
      if (statSync(target).isDirectory()) target = join(target, "index.html");
      if (url.hash && target.endsWith(".html")) {
        const content = readFileSync(target, "utf8");
        assert.ok(
          content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `${file}: missing fragment ${href}`,
        );
      }
    }
  }
});
test("program applications use the established destinations and do not simulate success", () => {
  const applications = {
    crisp: "KAqXzHDPBsFPy5EJ6",
    aix: "2V5hW6fKw9fCTFxeA",
    leadx: "xPPyZCp4LB5qKd237",
    ifap: "CFRTJTGr4M343xTF7",
  };
  for (const [program, id] of Object.entries(applications)) {
    const html = readFileSync(
      join(dist, "programs", program, "index.html"),
      "utf8",
    );
    assert.ok(html.includes("https://forms.gle/" + id));
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(
      footer?.includes('href="https://forms.gle/' + id + '"'),
      `${program}: footer must apply to the current program`,
    );
    assert.equal(
      (html.match(/id="apply"/g) || []).length,
      1,
      `${program}: application anchor must remain unique`,
    );
    assert.ok(!/Application Received|Check Your Inbox|<form\b/.test(html));
  }
  assert.ok(
    readFileSync(join(dist, "programs/ifap/index.html"), "utf8").includes(
      "/programs/ifap/IFAP-2026-Student-Brochure-NEW.pdf",
    ),
  );
});

test("React hydration uses the same responsive page content as the static HTML", () => {
  for (const file of walk(dist)) {
    if (file.includes("/register/")) continue;
    const html = readFileSync(file, "utf8");
    const serialized = html.match(
      /<script id="t2t-data" type="application\/json">([\s\S]*?)<\/script>/,
    )?.[1];
    assert.ok(serialized, file);
    const payload = JSON.parse(serialized);
    assert.ok(
      html.includes(payload.page.html),
      `${file}: rendered content differs from hydration data`,
    );
    assert.ok(!/<script\b/i.test(payload.page.html));
    assert.ok(!payload.page.html.includes('src="../../images/'));
  }
});
test("Three.js is deferred and program content is available before React loads", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  for (const name of ["CRISP", "AI-X", "Lead-x", "IFAP"])
    assert.ok(html.includes(name));
  assert.ok(!/<(?:script|link)[^>]+(?:src|href)="[^\"]*three-/i.test(html));
  const manifest = JSON.parse(
    readFileSync(join(dist, ".vite/manifest.json"), "utf8"),
  );
  assert.ok(Object.keys(manifest).some((key) => key.includes("DepthScene")));
  assert.ok(
    !JSON.stringify(manifest["src/client.tsx"].imports || []).includes("three"),
  );
});

test("program chooser preserves direct links and a coherent accessible initial selection", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const tabs = [...html.matchAll(/<a\b[^>]*role="tab"[^>]*>/g)].map(
    (match) => match[0],
  );
  assert.equal(tabs.length, 4);
  assert.equal(
    tabs.filter((tag) => tag.includes('aria-selected="true"')).length,
    1,
  );
  assert.equal(tabs.filter((tag) => tag.includes('tabindex="0"')).length, 1);
  for (const name of ["crisp", "aix", "leadx", "ifap"]) {
    const tab = tabs.find((tag) => tag.includes(`id="program-tab-${name}"`));
    assert.ok(tab?.includes(`href="/programs/${name}/"`), name);
    assert.ok(tab.includes('aria-controls="program-panel"'));
  }
  assert.ok(
    /id="program-panel"[^>]*role="tabpanel"[^>]*aria-labelledby="program-tab-crisp"/.test(
      html,
    ),
  );
});

test("published React pages include working stylesheet and module assets", () => {
  for (const file of walk(dist)) {
    if (file.includes("/register/")) continue;
    const html = readFileSync(file, "utf8");
    assert.ok(
      !html.includes("<!--REACT_ASSETS-->"),
      `${file}: build did not finish asset injection`,
    );
    const script = html.match(/<script type="module" src="([^"]+)"/);
    const css = [
      ...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g),
    ].map((match) => match[1]);
    assert.ok(script, `${file}: React entry missing`);
    assert.ok(
      existsSync(join(dist, script[1])),
      `${file}: React script missing on disk`,
    );
    assert.ok(
      css.some((path) => path.startsWith("/assets/client-")),
      `${file}: design stylesheet missing`,
    );
    for (const path of css)
      assert.ok(existsSync(join(dist, path)), `${file}: missing ${path}`);
  }
});
