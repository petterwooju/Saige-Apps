import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const appsFile = path.join(projectRoot, "content", "apps.json");
const allowedStatuses = [
  "stable",
  "beta",
  "experimental",
  "maintenance",
  "archived",
];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexPattern = /^#[0-9a-f]{6}$/i;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const terminal = createInterface({ input, output });

async function askRequired(label) {
  while (true) {
    const answer = (await terminal.question(`${label}: `)).trim();
    if (answer) return answer;
    console.log("此项不能为空，请重新输入。");
  }
}

async function askWithDefault(label, defaultValue) {
  const answer = (
    await terminal.question(`${label}（默认：${defaultValue}）: `)
  ).trim();
  return answer || defaultValue;
}

async function askSlug(apps) {
  while (true) {
    const slug = (await terminal.question("slug（小写英文、数字和短横线）: "))
      .trim()
      .toLowerCase();

    if (!slugPattern.test(slug)) {
      console.log("slug 格式不正确，例如：project-exporter");
      continue;
    }

    if (apps.some((app) => app.slug.toLowerCase() === slug)) {
      console.log(`slug "${slug}" 已存在，请换一个。`);
      continue;
    }

    return slug;
  }
}

function normalizeUrl(value) {
  const url = new URL(value);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("只支持 http 或 https 网址。");
  }

  if (url.username || url.password) {
    throw new Error("网址中不能包含用户名或密码。");
  }

  url.hash = "";
  return url.href;
}

function comparableUrl(value) {
  const url = new URL(normalizeUrl(value));
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  return `${url.protocol}//${url.hostname.toLowerCase()}${
    url.port ? `:${url.port}` : ""
  }${pathname}${url.search}`;
}

async function askUrl(apps) {
  while (true) {
    const rawUrl = await askRequired("应用网址");

    try {
      const url = normalizeUrl(rawUrl);
      const duplicate = apps.some(
        (app) => comparableUrl(app.url) === comparableUrl(url),
      );

      if (duplicate) {
        console.log("这个网址已经在应用列表中，请检查后重试。");
        continue;
      }

      return url;
    } catch (error) {
      console.log(`网址无效：${error.message}`);
    }
  }
}

async function askStatus() {
  while (true) {
    const status = (
      await askWithDefault("状态 stable/beta/experimental/maintenance/archived", "beta")
    ).toLowerCase();
    if (allowedStatuses.includes(status)) return status;
    console.log(`状态只能是：${allowedStatuses.join("、")}`);
  }
}

function splitTags(value) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function askTags() {
  while (true) {
    const zh = splitTags(await askRequired("中文标签（用逗号分隔，建议 3 个）"));
    const en = splitTags(await askRequired("英文标签（用逗号分隔）"));
    const ko = splitTags(await askRequired("韩文标签（用逗号分隔）"));

    if (zh.length !== en.length || zh.length !== ko.length) {
      console.log("三种语言的标签数量需要一致，请重新输入。");
      continue;
    }

    return { zh, en, ko };
  }
}

async function askHex(label, defaultValue) {
  while (true) {
    const color = await askWithDefault(label, defaultValue);
    if (hexPattern.test(color)) return color.toUpperCase();
    console.log("请输入 6 位十六进制颜色，例如 #2563EB。");
  }
}

async function askDate() {
  const today = new Date().toISOString().slice(0, 10);

  while (true) {
    const date = await askWithDefault("发布日期 YYYY-MM-DD", today);
    if (datePattern.test(date)) {
      const [year, month, day] = date.split("-").map(Number);
      const parsed = new Date(Date.UTC(year, month - 1, day));
      const isRealDate =
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month - 1 &&
        parsed.getUTCDate() === day;

      if (isRealDate) return date;
    }

    console.log("日期格式不正确，例如：2026-08-14");
  }
}

async function askYesNo(label, defaultValue = false) {
  const hint = defaultValue ? "Y/n" : "y/N";

  while (true) {
    const answer = (await terminal.question(`${label} [${hint}]: `))
      .trim()
      .toLowerCase();
    if (!answer) return defaultValue;
    if (["y", "yes", "是"].includes(answer)) return true;
    if (["n", "no", "否"].includes(answer)) return false;
    console.log("请输入 y 或 n。");
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function readApps() {
  const raw = await readFile(appsFile, "utf8");
  const apps = JSON.parse(raw);

  if (!Array.isArray(apps)) {
    throw new Error("content/apps.json 的顶层必须是数组。");
  }

  return apps;
}

async function confirmCover(slug) {
  const coverDirectory = path.join(projectRoot, "public", "apps", slug);
  const coverFile = path.join(coverDirectory, "cover.png");
  await mkdir(coverDirectory, { recursive: true });

  if (await fileExists(coverFile)) return;

  console.log("\n尚未找到应用截图。");
  console.log(`请把 cover.png 放到：${coverDirectory}`);
  await terminal.question("放好后按 Enter 继续检查……");

  if (!(await fileExists(coverFile))) {
    throw new Error(`仍未找到截图：${coverFile}\n应用条目尚未写入。`);
  }
}

async function main() {
  const apps = await readApps();

  console.log("\n新增 SaigeAPPs 应用\n");
  const slug = await askSlug(apps);
  const url = await askUrl(apps);
  const name = {
    zh: await askRequired("中文名称"),
    en: await askRequired("英文名称"),
    ko: await askRequired("韩文名称"),
  };
  const description = {
    zh: await askRequired("中文简介"),
    en: await askRequired("英文简介"),
    ko: await askRequired("韩文简介"),
  };
  const status = await askStatus();
  const category = await askWithDefault("分类 ID", "saigevision");
  const tags = await askTags();
  const accent = {
    primary: await askHex("强调色", "#2563EB"),
    soft: await askHex("浅色背景", "#EFF6FF"),
  };
  const privacy = await askWithDefault("处理方式标识", "local");
  const publishedAt = await askDate();
  const hidden = await askYesNo("先隐藏这个应用吗？", false);

  await confirmCover(slug);

  const app = {
    slug,
    name,
    description,
    url,
    cover: `/apps/${slug}/cover.png`,
    coverAlt: {
      zh: `${name.zh}的应用界面`,
      en: `${name.en} application interface`,
      ko: `${name.ko} 애플리케이션 화면`,
    },
    status,
    category,
    tags,
    accent,
    privacy,
    publishedAt,
    hidden,
  };

  apps.push(app);
  await writeFile(appsFile, `${JSON.stringify(apps, null, 2)}\n`, "utf8");

  console.log(`\n已添加：${name.zh}`);
  console.log(`数据：content/apps.json`);
  console.log(`截图：public/apps/${slug}/cover.png`);
  console.log("请运行 npm run build 做发布前检查。\n");
}

try {
  await main();
} catch (error) {
  console.error(`\n添加失败：${error.message}`);
  process.exitCode = 1;
} finally {
  terminal.close();
}
