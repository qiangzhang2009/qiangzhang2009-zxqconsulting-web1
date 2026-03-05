/**
 * Cloudflare D1 数据库 Schema
 * 用于访客数据收集和管理
 */

-- 访客基础信息表
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT UNIQUE NOT NULL,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  email TEXT,
  product_category TEXT,
  product_name TEXT,
  target_region TEXT,
  main_need TEXT,
  readiness_score INTEGER,
  selected_markets TEXT,
  source_url TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
  visit_count INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 联系表单提交表
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  message TEXT,
  product_interest TEXT,
  source_page TEXT,
  ip_address TEXT,
  country TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  assigned_to TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户行为追踪表
CREATE TABLE IF NOT EXISTS behaviors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_label TEXT,
  page_url TEXT NOT NULL,
  page_title TEXT,
  duration_seconds INTEGER,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 每日统计表
CREATE TABLE IF NOT EXISTS daily_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  decision_workspace_starts INTEGER DEFAULT 0,
  tools_uses INTEGER DEFAULT 0,
  top_pages TEXT,
  top_countries TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_behaviors_visitor ON behaviors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_type ON behaviors(event_type);
CREATE INDEX IF NOT EXISTS idx_behaviors_created ON behaviors(created_at);
CREATE INDEX IF NOT EXISTS idx_visitors_created ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
