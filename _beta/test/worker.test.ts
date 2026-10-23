import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.ts";
import { mockEnv, mockContext, validForm } from "./mock.ts";

let env: ReturnType<typeof mockEnv>;
let ctx: ReturnType<typeof mockContext>;
let sent: { url: string; body: string }[];
const realFetch = globalThis.fetch;
beforeEach(() => {
  env = mockEnv(); ctx = mockContext(); sent = [];
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), body: String(init?.body) });
    return Response.json({ result: "success" });
  };
});
afterEach(async () => { await ctx.drain(); globalThis.fetch = realFetch; env.BETA_DB.sqlite.close(); });

function request(form: Record<string, string> | URLSearchParams = validForm, headers = {}, method = "POST") {
  return new Request("https://dollhousemcp.com/api/beta-request", {
    method, headers: { Origin: env.PUBLIC_ORIGIN, "CF-Connecting-IP": "192.0.2.1", ...headers },
    ...(method === "POST" ? { body: form instanceof URLSearchParams ? form : new URLSearchParams(form) } : {}),
  });
}
const submit = (form = validForm, headers = {}) => worker.fetch(request(form, headers), env, ctx);
const count = () => env.BETA_DB.sqlite.prepare("SELECT COUNT(*) AS n FROM beta_requests").get().n;

test("disabled or incomplete configuration fails closed without storage or notifications", async () => {
  env.BETA_REQUESTS_ENABLED = "false";
  assert.equal((await submit()).status, 503);
  env.BETA_REQUESTS_ENABLED = "true"; env.RATE_LIMIT_SECRET = "";
  assert.equal((await submit()).status, 503);
  assert.equal(count(), 0); assert.equal(sent.length, 0);
});

test("health, route, method, origin and content type restrictions", async () => {
  assert.equal((await worker.fetch(request(validForm, {}, "GET"), env, ctx)).status, 200);
  assert.equal((await worker.fetch(request(validForm, {}, "DELETE"), env, ctx)).status, 405);
  assert.equal((await worker.fetch(new Request("https://dollhousemcp.com/other"), env, ctx)).status, 404);
  assert.equal((await submit(validForm, { Origin: "https://evil.example.test" })).status, 403);
  assert.equal((await submit(validForm, { "Content-Type": "application/json" })).status, 415);
  assert.equal((await submit(validForm, { "CF-Connecting-IP": "" })).status, 503);
  assert.equal(count(), 0);
});

test("stores selected clients and consent, sends only opaque ID to owned notification endpoint", async () => {
  const form = new URLSearchParams({ ...validForm, email: "TESTER@example.test" });
  form.append("clients", "Claude Code");
  const response = await worker.fetch(request(form), env, ctx);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  await ctx.drain();
  const row = env.BETA_DB.sqlite.prepare("SELECT * FROM beta_requests").get();
  assert.equal(row.email, "tester@example.test");
  assert.deepEqual(JSON.parse(row.clients), ["Codex", "Claude Code"]);
  assert.equal(row.consent_version, "beta-contact-2026-10-22");
  assert.equal(row.notification_sent, 1);
  assert.equal(sent[0].url, "https://zulip.example.test/api/v1/messages");
  assert.ok(sent[0].body.includes(row.id));
  assert.ok(!sent[0].body.includes("tester") && !sent[0].body.includes("supervised"));
  assert.ok(!JSON.stringify(await response.json()).includes(row.id));
  const limit = env.BETA_DB.sqlite.prepare("SELECT * FROM beta_rate_limits").get();
  assert.match(limit.key, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(limit).includes("192.0.2.1"));
});

test("honeypot silently discards submissions", async () => {
  assert.equal((await submit({ ...validForm, website: "https://spam.example.test" })).status, 200);
  assert.equal(count(), 0); assert.equal(sent.length, 0);
});

test("server rejects missing required fields, malformed email, unknown clients and oversized fields", async () => {
  const cases = [{ name: " " }, { email: "broken@" }, { use_case: " " }, { clients: "Unknown" }, { consent: "no" },
    { name: "x".repeat(101) }, { organisation: "x".repeat(161) }, { client_notes: "x".repeat(301) }];
  for (let i = 0; i < cases.length; i++) {
    assert.equal((await submit({ ...validForm, ...cases[i] }, { "CF-Connecting-IP": `192.0.2.${i + 10}` })).status, 400);
  }
  assert.equal(count(), 0);
});

test("rejects duplicate fields, duplicate clients, missing clients and unknown fields", async () => {
  for (const field of ["name", "clients", "unexpected"]) {
    const form = new URLSearchParams(validForm); form.append(field, field === "clients" ? "Codex" : "extra");
    assert.equal((await worker.fetch(request(form), env, ctx)).status, 400);
  }
  const form = new URLSearchParams(validForm); form.delete("clients");
  assert.equal((await worker.fetch(request(form), env, ctx)).status, 400);
  assert.equal(count(), 0);
});

test("caps actual request bytes even without Content-Length", async () => {
  assert.equal((await submit({ ...validForm, use_case: "x".repeat(9000) })).status, 413);
  assert.equal(count(), 0);
});

test("atomic rate limit accepts five then rejects concurrent attempts, permits another IP", async () => {
  // SQLite mock serializes transactions as D1 does, while handler requests overlap.
  const originalBatch = env.BETA_DB.batch.bind(env.BETA_DB);
  let queue = Promise.resolve();
  env.BETA_DB.batch = (statements) => {
    const job = queue.then(() => originalBatch(statements));
    queue = job.then(() => undefined, () => undefined);
    return job;
  };
  const responses = await Promise.all(Array.from({ length: 12 }, () => submit()));
  assert.equal(responses.filter((r) => r.status === 201).length, 5);
  const rejected = responses.filter((r) => r.status === 429);
  assert.equal(rejected.length, 7);
  assert.ok(Number(rejected[0].headers.get("Retry-After")) > 0);
  assert.equal((await submit(validForm, { "CF-Connecting-IP": "192.0.2.200" })).status, 201);
});

test("database errors fail closed", async () => {
  env.BETA_DB.batch = async () => { throw new Error("private database detail"); };
  const response = await submit();
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("private database detail"));
  assert.equal(sent.length, 0);
});

test("notification outage keeps a saved request pending, daily job retries and purges expired data", async () => {
  globalThis.fetch = async () => new Response("unavailable", { status: 503 });
  assert.equal((await submit()).status, 201); await ctx.drain();
  assert.equal(env.BETA_DB.sqlite.prepare("SELECT notification_sent FROM beta_requests").get().notification_sent, 0);
  env.BETA_DB.sqlite.exec("INSERT INTO beta_requests SELECT 'expired', 1, name, email, organisation, use_case, clients, client_notes, consent_version, 0 FROM beta_requests LIMIT 1");
  env.BETA_DB.sqlite.exec("INSERT INTO beta_rate_limits VALUES ('expired', 1, 1)");
  globalThis.fetch = async () => Response.json({ result: "success" });
  await worker.scheduled({}, env);
  assert.equal(count(), 1);
  assert.equal(env.BETA_DB.sqlite.prepare("SELECT notification_sent FROM beta_requests").get().notification_sent, 1);
  assert.equal(env.BETA_DB.sqlite.prepare("SELECT COUNT(*) AS n FROM beta_rate_limits WHERE key = 'expired'").get().n, 0);
  env.BETA_REQUESTS_ENABLED = "false";
  env.BETA_DB.sqlite.exec("UPDATE beta_requests SET created_at = 1");
  await worker.scheduled({}, env);
  assert.equal(count(), 0);
});
