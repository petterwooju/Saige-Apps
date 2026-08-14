# SaigeAPPs

SaigeAPPs 是一个用于集中展示 SaigeVision 网页工具的三语言入口站点。首页从 `content/apps.json` 自动生成应用卡片，并使用项目内的静态截图作为封面。

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run build
```

## 新增应用

运行交互式命令：

```bash
npm run app:add
```

完整的截图规范、字段说明和更新方式请查看 [ADDING_APPS.md](./ADDING_APPS.md)。

## 内容结构

- `app/`：首页与全站样式
- `content/apps.json`：应用列表的唯一数据源
- `public/apps/<slug>/cover.png`：应用卡片截图
- `scripts/add-app.mjs`：新增应用向导
- `public/og.png`：社交链接预览图
