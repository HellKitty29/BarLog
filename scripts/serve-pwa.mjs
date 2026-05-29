import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

import { getNetworkUrls } from "./network-url.mjs";

const isWindows = process.platform === "win32";
const npmBin = isWindows ? "npm.cmd" : "npm";
const root = process.cwd();
const distDir = join(root, "dist");
const envPath = join(root, ".env");
const port = Number(process.env.PORT ?? 5173);
const host = process.env.HOST ?? "0.0.0.0";

loadEnvFile();

const healthUrl = process.env.VITE_HEALTH_API_URL ?? process.env.EXPO_PUBLIC_HEALTH_API_URL;
const explicitApiUrl = process.env.VITE_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL;
const apiBaseUrl = explicitApiUrl ?? healthUrl?.replace(/\/health\/?$/, "");

if (!apiBaseUrl) {
  console.warn("No backend URL found. Set EXPO_PUBLIC_HEALTH_API_URL or VITE_API_BASE_URL in .env.");
}

function loadEnvFile() {
  if (!existsSync(envPath)) {
    return;
  }

  const env = readFileSync(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: isWindows
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function sendStatic(request, response) {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const normalizedPath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const candidate = join(distDir, normalizedPath === "/" ? "index.html" : normalizedPath);
  const filePath = existsSync(candidate) && statSync(candidate).isFile()
    ? candidate
    : join(distDir, "index.html");
  const extension = extname(filePath);

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": contentTypes[extension] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}

async function proxyApi(request, response) {
  if (!apiBaseUrl) {
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Backend URL is not configured." }));
    return;
  }

  const upstreamUrl = new URL(request.url ?? "/", apiBaseUrl);
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": request.headers["access-control-request-headers"] ?? "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    response.end();
    return;
  }

  const headers = new Headers();
  const blockedHeaders = new Set([
    "host",
    "connection",
    "content-length",
    "origin",
    "referer",
    "sec-fetch-dest",
    "sec-fetch-mode",
    "sec-fetch-site",
    "sec-fetch-user"
  ]);

  for (const [key, value] of Object.entries(request.headers)) {
    if (!value || blockedHeaders.has(key.toLowerCase())) {
      continue;
    }

    headers.set(key, Array.isArray(value) ? value.join(",") : value);
  }

  let body = undefined;
  if (!["GET", "HEAD"].includes(request.method ?? "GET")) {
    body = await readRequestBody(request);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body
    });

    const responseHeaders = {};
    upstream.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    responseHeaders["access-control-allow-origin"] = "*";

    response.writeHead(upstream.status, responseHeaders);
    if (upstream.body) {
      for await (const chunk of upstream.body) {
        response.write(chunk);
      }
    }
    response.end();
  } catch (error) {
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      message: error instanceof Error ? error.message : "Failed to proxy API request."
    }));
  }
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
    request.on("error", reject);
  });
}

await run(npmBin, ["run", "build"]);

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname;

  if (pathname.startsWith("/api/") || pathname === "/health") {
    void proxyApi(request, response);
    return;
  }

  sendStatic(request, response);
});

server.listen(port, host, () => {
  console.log(`BarLog PWA listening at http://localhost:${port}/`);
  for (const url of getNetworkUrls(port)) {
    console.log(`Network URL: ${url}`);
  }
  if (apiBaseUrl) {
    console.log(`Proxying /api/* to ${apiBaseUrl}`);
  }
});
