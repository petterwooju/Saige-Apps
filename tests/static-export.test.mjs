import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../out/", import.meta.url);

test("exports a complete static GitHub Pages site", async () => {
  const html = await readFile(new URL("index.html", output), "utf8");

  assert.match(html, /<title>SaigeAPPs/);
  assert.match(html, /SaigeVision V1 项目导出助手/);
  assert.match(html, /SaigeVision 项目转换器/);
  assert.match(html, /SaigeVision 标注检查器/);
  assert.match(html, /saige-label-checker-beta\.saigeai\.com/);
  assert.match(html, /https:\/\/saige-apps-beta\.saigeai\.com\/og-v2\.png/);

  await access(new URL("404.html", output));
  await access(new URL("favicon.png", output));
  await access(new URL("og-v2.png", output));
  await access(new URL("apps/saige-label-checker/cover.png", output));
  await assert.rejects(access(new URL("server/index.js", output)));
});

test("keeps the custom domain in the exported artifact", async () => {
  const cname = await readFile(new URL("CNAME", output), "utf8");
  assert.equal(cname.trim(), "saige-apps-beta.saigeai.com");
});
