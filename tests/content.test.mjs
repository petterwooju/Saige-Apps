import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("keeps app data complete and screenshots local", async () => {
  const appJson = JSON.parse(
    await readFile(new URL("../content/apps.json", import.meta.url), "utf8"),
  );
  const locales = ["zh", "en", "ko"];
  const slugs = new Set();

  assert.equal(appJson.length, 3);

  for (const app of appJson) {
    assert.match(app.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!slugs.has(app.slug), `duplicate slug: ${app.slug}`);
    slugs.add(app.slug);
    assert.doesNotThrow(() => new URL(app.url));
    assert.equal(app.hidden, false);
    assert.match(app.cover, new RegExp(`^/apps/${app.slug}/cover\\.png$`));

    for (const locale of locales) {
      assert.ok(app.name[locale]);
      assert.ok(app.description[locale]);
      assert.ok(app.coverAlt[locale]);
      assert.ok(app.tags[locale].length >= 2);
    }

    await access(new URL(`../public${app.cover}`, import.meta.url));
  }
});

test("uses only browser-side behavior in the published app", async () => {
  const [page, layout, config] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /^"use client";/);
  assert.doesNotMatch(page, /fetch\s*\(|\/api\//);
  assert.doesNotMatch(layout, /next\/headers|cookies\s*\(/);
  assert.match(config, /output:\s*["']export["']/);
});
