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
    assert.ok(!/Application Received|Check Your Inbox|<form\b/.test(html));
  }
  assert.ok(
    readFileSync(join(dist, "programs/ifap/index.html"), "utf8").includes(
      "/programs/ifap/IFAP-2026-Student-Brochure-NEW.pdf",
    ),
  );
});
