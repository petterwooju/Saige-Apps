import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT ?? 3000);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    let filePath = resolve(root, `.${pathname}`);

    if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) filePath = resolve(filePath, "index.html");

    const finalStat = await stat(filePath).catch(() => null);
    if (!finalStat?.isFile()) filePath = resolve(root, "404.html");

    response.writeHead(finalStat?.isFile() ? 200 : 404, {
      "Content-Type": types[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(500).end("Internal Server Error");
  }
}).listen(port, () => {
  console.log(`Static preview: http://localhost:${port}`);
});
