# Hosted beta request access

Review only. No infrastructure has been created, no route attached, and no
production deployment is part of this PR. Intake is disabled in `wrangler.jsonc`.

`beta.html` uses the existing Jekyll layout, local fonts, and theme toggle.
The homepage and navigation link to it. The form checks the same-origin
`/api/beta-request` endpoint before enabling submission. Static previews display
a closed notice and cannot collect applications.

## Smallest owned backend

One Cloudflare Worker and one D1 database in DollhouseMCP's account. The Worker
handles only `/api/beta-request`; existing static hosting stays in place.
The checked-in workflows currently describe GitHub Pages. A Worker route works
with that origin behind Cloudflare; a Pages Function would need a hosting change.

No form vendor, analytics, tracking script, CAPTCHA service, or external font
request is added. Cloudflare processes requests as the hosting provider.
Answers stay in the owned D1 database. Notifications send only an opaque request
ID through a **self-hosted Zulip server controlled by DollhouseMCP**, using its
standard bot API. Never configure a third-party notification destination.
The example origin is deliberately invalid until Mick supplies his endpoint.
Tests intercept notifications; no test messages leave the machine.

Jekyll ignores `_beta/` because it starts with an underscore. Worker source,
migrations, dependencies, and these instructions do not enter the public build.
They remain public source code in this repository.

## What Mick must create after review

These are launch instructions, **not steps to execute during PR review**.

1. Confirm `dollhousemcp.com` DNS is proxied through the owned Cloudflare zone and
   `contact@dollhousemcp.com` receives deletion requests.
2. Create D1 database `dollhouse-beta-requests` in the intended account. Replace the
   all-zero `database_id` in `wrangler.jsonc`. Bind it as `BETA_DB`. Keep previews
   on local storage or a separate test database.
3. Apply `migrations/0001_beta_requests.sql` to create the request and rate-limit
   tables and their indexes.
4. Create a bot on the owned Zulip server with access to a private channel Mick
   reads. Set `ZULIP_ORIGIN` to its HTTPS origin without a trailing slash,
   `ZULIP_STREAM_ID` to the numeric channel ID, and `ZULIP_TOPIC` to the review
   topic. The Worker calls `/api/v1/messages`. Messages contain the request ID;
   Mick reads answers through authenticated D1 access.
5. Create secrets `RATE_LIMIT_SECRET` (at least 32 random characters),
   `ZULIP_BOT_EMAIL`, and `ZULIP_API_KEY` in the Worker dashboard or interactive
   `wrangler secret put NAME`. Never put values in config, shell arguments, or
   PR comments. Local `.dev.vars` files are ignored; use fake values for tests.
6. After visual approval, arrange deployment separately. Set
   `BETA_REQUESTS_ENABLED` to `"true"` only after storage, notification, retention,
   and deletion handling are checked. Attach the Worker route
   `dollhousemcp.com/api/beta-request*` in the owned zone. Keep `workers_dev` and
   `preview_urls` false. This PR adds no deploy automation and attaches no route.
7. Verify the daily `0 6 * * *` UTC trigger runs. It removes requests at least
   90 days old, deletes expired rate-limit rows, and retries up to 50 pending
   notifications. Monitor its status and pending notifications during the beta.

Explicit setup commands for Mick to run later:

```sh
cd _beta
npm ci --ignore-scripts
npx wrangler d1 create dollhouse-beta-requests
# Set the returned ID in wrangler.jsonc before continuing.
npx wrangler d1 migrations apply dollhouse-beta-requests --remote
npx wrangler secret put RATE_LIMIT_SECRET
npx wrangler secret put ZULIP_BOT_EMAIL
npx wrangler secret put ZULIP_API_KEY
```

No deployment command is included in the review workflow.

## Review, notifications, and deletion

Use the authenticated D1 console in Cloudflare. Approvals and replies are manual;
this handler never creates beta accounts.

```sql
SELECT id, created_at, name, email, organisation, use_case, clients, client_notes
FROM beta_requests ORDER BY created_at DESC;

SELECT id, created_at FROM beta_requests
WHERE notification_sent = 0 ORDER BY created_at;
```

Notification failure leaves the request saved and pending for daily retry.
Check the bot credentials, channel access, and owned server if failures persist.
Delivery followed by a failed status update can cause duplicate ID notifications.
Applicant answers never enter the notification channel.

For deletion, verify the request came from the submitted email address, then bind
its lower-case value to this parameterized statement in authenticated tooling:

```sql
DELETE FROM beta_requests WHERE email = ?;
```

Remove any operator exports or replies containing applicant data. Live requests
are removed daily once 90 days old (within 91 days). Deleted rows can remain in
D1 Time Travel backups until the account's backup window expires. Check that
setting and tell the requester the applicable window. Never restore deleted
submissions into live service. Disable intake if retention stops working.

Rate-limit keys use HMAC-SHA256 of the Cloudflare-provided IP and UTC hour, with a
Worker secret. Raw IPs, user agents, and referrers are not stored by this app.
Expired keys are removed on the next POST or daily job. Cloudflare infrastructure
logs and backups have their own retention. Worker application observability is
disabled to avoid logging request data.

## Local checks

Use Node 24 or newer for native TypeScript stripping and SQLite. No remote binding
or credential is needed.

```sh
cd _beta
npm ci --ignore-scripts
npm run check
npm test
npm run bundle
# Optional runtime check: D1 writes remain local.
npx wrangler d1 migrations apply dollhouse-beta-requests --local
npm run dev
```

The dry run bundles only. `check` generates binding/runtime types and checks the
Worker; generated declarations are ignored. Tests import the actual Worker, run
the real migration and queries against local SQLite through a D1-shaped mock, and
intercept notifications. Coverage includes the kill switch, configuration,
required fields, consent, checkbox values, duplicate fields, body bounds,
honeypot, concurrent rate limits, origin/method checks, database failure,
notification failure/retry, and deletion while intake is closed.

Five POST attempts per IP per UTC hour are allowed, including invalid forms and
honeypot hits. A sixth returns 429 with `Retry-After`. One atomic SQL update avoids
the races of KV read/write counters. Shared networks share this limit. This is
basic spam control, not a defense against a distributed attack. Bodies are capped
at 8 KiB while streaming even without Content-Length. Only same-origin URL-encoded
submissions are accepted. Origin checks are not authentication. There is no
public read or deletion API.

For Chrome QA, build Jekyll in one terminal, then run from `_beta/`:

```sh
node test/preview-server.ts
```

Open `http://localhost:4173/beta.html`. This loopback-only server serves `_site/`,
forwards the API to the real handler with local SQLite, and intercepts Zulip
notifications. Restart to clear data. For a closed-form preview, open
`http://localhost:4173/beta.html?closed=1`.

## References

- [Worker routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [D1 statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [Zulip messages](https://zulip.com/api/send-message)
