CREATE TABLE beta_requests (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT NOT NULL,
  use_case TEXT NOT NULL,
  clients TEXT NOT NULL,
  client_notes TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  notification_sent INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX beta_requests_created_at ON beta_requests(created_at);
CREATE INDEX beta_requests_email ON beta_requests(email);

CREATE TABLE beta_rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL
);
CREATE INDEX beta_rate_limits_window ON beta_rate_limits(window_start);
