import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the SaigeAPPs collection", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>SaigeAPPs/);
  assert.match(html, /为 SaigeVision 工作流制作的轻量网页工具/);
  assert.match(html, /SaigeVision V1 项目导出助手/);
  assert.match(html, /SaigeVision 项目转换器/);
  assert.match(html, /SaigeVision 标注检查器/);
  assert.match(html, /svpa-export-beta\.saigeai\.com/);
  assert.match(html, /saige-label-switcher-beta\.saigeai\.com/);
  assert.match(html, /saige-label-checker-beta\.saigeai\.com/);
  assert.doesNotMatch(html, /好用的工具|持续生长的工具集合|更多工具，正在路上/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

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

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
