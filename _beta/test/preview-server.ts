import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import worker from "../worker.ts";
import { mockEnv, mockContext } from "./mock.ts";

const root = resolve(import.meta.dirname, "../../_site");
const env = mockEnv();
env.PUBLIC_ORIGIN = "http://localhost:4173";
globalThis.fetch = () => Promise.resolve(Response.json({ result: "success" }));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml" };
createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url || "/", env.PUBLIC_ORIGIN);
  if (url.pathname === "/api/beta-request") {
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const headers = new Headers(incoming.headers);
    headers.set("CF-Connecting-IP", "192.0.2.1");
    const request = new Request(url, { method: incoming.method, headers,
      ...(incoming.method === "POST" ? { body: Buffer.concat(chunks) } : {}),
    });
    const ctx = mockContext();
    const closed = headers.get("Referer")?.includes("closed=1");
    const response = await worker.fetch(request, { ...env, BETA_REQUESTS_ENABLED: closed ? "false" : "true" }, ctx);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
    await ctx.drain();
    return;
  }
  try {
    const pathname = url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname;
    const path = resolve(root, "." + decodeURIComponent(pathname));
    if (!path.startsWith(`${root}/`)) throw new Error("outside root");
    const body = await readFile(path);
    outgoing.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    outgoing.end(body);
  } catch { outgoing.writeHead(404); outgoing.end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("Local mock preview: http://localhost:4173/beta.html (notifications intercepted)"));
