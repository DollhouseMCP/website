import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

// D1-shaped adapter running the real migration and SQL against local SQLite.
export function mockDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../migrations/0001_beta_requests.sql", import.meta.url), "utf8"));
  function prepare(sql: string) {
    let values: unknown[] = [];
    const statement = {
      bind(...args: unknown[]) { values = args; return statement; },
      all() { return Promise.resolve({ success: true, results: sqlite.prepare(sql).all(...values) }); },
      run() { const result = sqlite.prepare(sql).run(...values); return Promise.resolve({ success: true, results: [], meta: { changes: result.changes } }); },
    };
    return statement;
  }
  return {
    sqlite,
    prepare,
    async batch(statements: ReturnType<typeof prepare>[]) {
      sqlite.exec("BEGIN");
      try {
        const result = [];
        for (const statement of statements) result.push(await statement.all());
        sqlite.exec("COMMIT");
        return result;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
}

export function mockEnv() {
  return {
    BETA_REQUESTS_ENABLED: "true",
    PUBLIC_ORIGIN: "https://dollhousemcp.com",
    RATE_LIMIT_SECRET: "local-test-secret-at-least-32-characters",
    ZULIP_ORIGIN: "https://zulip.example.test",
    ZULIP_STREAM_ID: "123",
    ZULIP_TOPIC: "Hosted beta requests",
    ZULIP_BOT_EMAIL: "bot@example.test",
    ZULIP_API_KEY: "test-only-never-a-real-key",
    BETA_DB: mockDatabase(),
  };
}

export const validForm = {
  name: "Test Person", email: "tester@example.test", organisation: "", use_case: "Test supervised workflows.",
  clients: "Codex", client_notes: "", consent: "yes", website: "",
};

export function mockContext() {
  const pending: Promise<unknown>[] = [];
  return { waitUntil(promise: Promise<unknown>) { pending.push(promise); }, async drain() { await Promise.all(pending); } };
}
