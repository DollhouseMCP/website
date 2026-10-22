const ENDPOINT = "/api/beta-request";
const MAX_BODY = 8192;
const HOUR = 3600;
const RETENTION = 90 * 86400;
const CLIENTS = new Set(["Claude Desktop", "Claude Code", "Cursor", "VS Code", "Codex", "Gemini CLI", "Other"]);
const unavailable = "This form is not accepting requests yet. Please check back later.";

function json(status: number, body: object, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: {
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra,
  } });
}

function configured(env: Env) {
  try {
    const origin = new URL(env.ZULIP_ORIGIN);
    return env.BETA_REQUESTS_ENABLED === "true" && !!env.BETA_DB &&
      env.RATE_LIMIT_SECRET?.length >= 32 && !!env.ZULIP_BOT_EMAIL && !!env.ZULIP_API_KEY &&
      origin.protocol === "https:" && origin.origin === env.ZULIP_ORIGIN &&
      !origin.hostname.endsWith(".invalid") && /^[1-9]\d*$/.test(env.ZULIP_STREAM_ID);
  } catch {
    return false;
  }
}

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) {
      await reader.cancel();
      throw new RangeError("body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes);
}

async function rateKey(ip: string, windowStart: number, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${windowStart}:${ip}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function notify(env: Env, id: string) {
  // Only an opaque ID leaves D1. Configure a Zulip server owned by DollhouseMCP.
  const response = await fetch(`${env.ZULIP_ORIGIN}/api/v1/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${env.ZULIP_BOT_EMAIL}:${env.ZULIP_API_KEY}`)}` },
    body: new URLSearchParams({
      type: "stream", to: env.ZULIP_STREAM_ID, topic: env.ZULIP_TOPIC,
      content: `Hosted beta request ${id} is ready for manual review in the beta requests database.`,
    }),
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
  const ok = response.ok;
  await response.body?.cancel();
  if (!ok) throw new Error("notification failed");
  await env.BETA_DB.prepare("UPDATE beta_requests SET notification_sent = 1 WHERE id = ?").bind(id).run();
}

async function tryNotify(env: Env, id: string) {
  try { await notify(env, id); } catch { /* Saved request stays pending for the daily retry. No PII in logs. */ }
}

async function handle(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);
  if (url.pathname !== ENDPOINT) return json(404, { message: "Not found." });
  if (request.method !== "GET" && request.method !== "POST") {
    return json(405, { message: "Use GET or POST." }, { Allow: "GET, POST" });
  }
  if (!configured(env)) return json(503, { enabled: false, message: unavailable });
  if (request.method === "GET") return json(200, { enabled: true });
  if (url.origin !== env.PUBLIC_ORIGIN || request.headers.get("Origin") !== env.PUBLIC_ORIGIN) {
    return json(403, { message: "Send the form from the DollhouseMCP website." });
  }
  if (request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/x-www-form-urlencoded") {
    return json(415, { message: "Use the request access form." });
  }
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return json(503, { message: unavailable });
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / HOUR) * HOUR;
  const key = await rateKey(ip, windowStart, env.RATE_LIMIT_SECRET);
  // One atomic UPSERT prevents concurrent requests from bypassing the limit.
  const limits = await env.BETA_DB.batch([
    env.BETA_DB.prepare("DELETE FROM beta_rate_limits WHERE window_start < ?").bind(windowStart),
    env.BETA_DB.prepare(`INSERT INTO beta_rate_limits (key, window_start, hits) VALUES (?, ?, 1)
      ON CONFLICT(key) DO UPDATE SET hits = hits + 1 WHERE hits < 5 RETURNING hits`).bind(key, windowStart),
  ]);
  if (!limits[1].results.length) return json(429, { message: "Too many requests. Please try again in an hour." }, { "Retry-After": String(windowStart + HOUR - now) });
  let data: URLSearchParams;
  try { data = new URLSearchParams(await readBody(request)); }
  catch (error) { return json(error instanceof RangeError ? 413 : 400, { message: "The form could not be read. Please check its size and try again." }); }
  // Honeypot responses look successful but store nothing and send no notification.
  if (data.get("website")) return json(200, { received: true });
  const fields: Record<string, number> = { name: 100, email: 254, organisation: 160, use_case: 2000, client_notes: 300, consent: 3, website: 0 };
  for (const [field, max] of Object.entries(fields)) {
    if (data.getAll(field).length > 1 || (data.get(field) || "").length > max) {
      return json(400, { message: "Please check the form fields and their lengths." });
    }
  }
  if ([...data.keys()].some((field) => !Object.hasOwn(fields, field) && field !== "clients")) {
    return json(400, { message: "The form contains an unknown field." });
  }
  const name = (data.get("name") || "").trim();
  const email = (data.get("email") || "").trim().toLowerCase();
  const useCase = (data.get("use_case") || "").trim();
  const clients = data.getAll("clients");
  if (!name || !useCase || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      data.get("consent") !== "yes" || clients.length < 1 || clients.length > CLIENTS.size ||
      clients.some((client) => !CLIENTS.has(client)) || new Set(clients).size !== clients.length) {
    return json(400, { message: "Enter your name, a valid email, a use case, at least one MCP client, and consent to be contacted." });
  }
  const id = crypto.randomUUID();
  await env.BETA_DB.prepare(`INSERT INTO beta_requests
    (id, created_at, name, email, organisation, use_case, clients, client_notes, consent_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, now, name, email, (data.get("organisation") || "").trim(), useCase,
      JSON.stringify(clients), (data.get("client_notes") || "").trim(), "beta-contact-2026-10-22").run();
  ctx.waitUntil(tryNotify(env, id));
  return json(201, { received: true });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try { return await handle(request, env, ctx); }
    catch { return json(503, { message: "We could not save your request. Please try again later." }); }
  },
  async scheduled(_event: ScheduledController, env: Env) {
    const now = Math.floor(Date.now() / 1000);
    // Retention still runs while intake is closed. D1 backups expire on their own schedule.
    await env.BETA_DB.batch([
      env.BETA_DB.prepare("DELETE FROM beta_requests WHERE created_at <= ?").bind(now - RETENTION),
      env.BETA_DB.prepare("DELETE FROM beta_rate_limits WHERE window_start < ?").bind(Math.floor(now / HOUR) * HOUR),
    ]);
    if (!configured(env)) return;
    const pending = await env.BETA_DB.prepare("SELECT id FROM beta_requests WHERE notification_sent = 0 ORDER BY created_at LIMIT 50").all<{ id: string }>();
    for (const { id } of pending.results) await tryNotify(env, id);
  },
} satisfies ExportedHandler<Env>;
