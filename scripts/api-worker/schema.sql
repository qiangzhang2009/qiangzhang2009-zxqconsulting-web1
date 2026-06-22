-- Comments table for zxqconsulting.com Q&A community
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL DEFAULT '',
  user_email TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  liked_by TEXT NOT NULL DEFAULT '[]',
  replies TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'approved',
  geo_country TEXT NOT NULL DEFAULT '',
  geo_region TEXT NOT NULL DEFAULT '',
  geo_city TEXT NOT NULL DEFAULT '',
  ip_address TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'zh'
);

CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status DESC);
CREATE INDEX IF NOT EXISTS idx_comments_likes ON comments(likes DESC);

-- Seed log to prevent duplicate seeding
CREATE TABLE IF NOT EXISTS seed_log (
  date TEXT NOT NULL PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
;
