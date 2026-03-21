CREATE TABLE IF NOT EXISTS visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  first_path TEXT,
  last_path TEXT,
  created_ip_hash TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  entry_path TEXT,
  exit_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  ip_hash TEXT,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  timezone TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  language TEXT,
  page_title TEXT,
  navigation_reason TEXT,
  end_reason TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  country TEXT,
  metadata_json TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON sessions(visitor_id);
