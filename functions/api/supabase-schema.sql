-- =====================================================
-- Supabase 数据库 Schema
-- 支持多网站数据统一存储
-- =====================================================

-- 网站配置表
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id TEXT UNIQUE NOT NULL,  -- 唯一标识，如 'zxqconsulting', '别的网站'
  name TEXT NOT NULL,               -- 网站名称
  domain TEXT,                       -- 域名
  description TEXT,                  -- 描述
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 访客基础信息表
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  website_id TEXT NOT NULL,          -- 关联网站
  visitor_id TEXT NOT NULL,          -- 访客唯一标识 (cookie)
  company_name TEXT,                 -- 公司名称
  contact_name TEXT,                 -- 联系人姓名
  contact_phone TEXT,                -- 联系电话
  email TEXT,                       -- 邮箱
  product_category TEXT,            -- 产品类型
  product_name TEXT,                -- 产品名称
  target_region TEXT,               -- 目标区域
  main_need TEXT,                   -- 主要需求
  readiness_score INTEGER,          -- 准备度得分
  selected_markets JSONB,           -- 选择的市场
  ip_address TEXT,                  -- IP地址
  country TEXT,                      -- 国家
  city TEXT,                         -- 城市
  device_type TEXT,                  -- 设备类型
  browser TEXT,                      -- 浏览器
  first_visit TIMESTAMPTZ,          -- 首次访问
  last_visit TIMESTAMPTZ,           -- 最后访问
  visit_count INTEGER DEFAULT 1,     -- 访问次数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(website_id, visitor_id)
);

-- 联系表单提交表
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  website_id TEXT NOT NULL,          -- 关联网站
  visitor_id TEXT,                   -- 访客ID（可选）
  name TEXT NOT NULL,                -- 姓名
  email TEXT,                       -- 邮箱
  phone TEXT,                        -- 电话
  company TEXT,                      -- 公司
  message TEXT,                      -- 留言
  product_interest TEXT,            -- 感兴趣的产品
  source_page TEXT,                  -- 来源页面
  ip_address TEXT,                   -- IP地址
  country TEXT,                      -- 国家
  status TEXT DEFAULT 'new',         -- new/contacted/closed
  notes TEXT,                        -- 备注
  assigned_to TEXT,                  -- 分配给
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户行为追踪表
CREATE TABLE IF NOT EXISTS behaviors (
  id BIGSERIAL PRIMARY KEY,
  website_id TEXT NOT NULL,          -- 关联网站
  visitor_id TEXT NOT NULL,          -- 访客ID
  event_type TEXT NOT NULL,          -- page_view, click, scroll, submit
  event_category TEXT,               -- 事件分类
  event_label TEXT,                  -- 事件标签
  page_url TEXT NOT NULL,            -- 页面URL
  page_title TEXT,                   -- 页面标题
  duration_seconds INTEGER,          -- 停留时长
  metadata JSONB,                    -- 额外数据
  ip_address TEXT,                   -- IP地址
  country TEXT,                      -- 国家
  city TEXT,                         -- 城市
  device_type TEXT,                  -- 设备类型
  browser TEXT,                      -- 浏览器
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_visitors_website ON visitors(website_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_website ON submissions(website_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_behaviors_website ON behaviors(website_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_visitor ON behaviors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_behaviors_type ON behaviors(event_type);
CREATE INDEX IF NOT EXISTS idx_behaviors_created ON behaviors(created_at);

-- RLS 策略（可选，生产环境建议开启）
-- ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE behaviors ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 示例数据
-- =====================================================

-- 添加网站配置
INSERT INTO websites (website_id, name, domain, description) VALUES 
('zxqconsulting', '智信企管咨询', 'www.zxqconsulting.com', '中医药产品出海咨询服务')
ON CONFLICT (website_id) DO NOTHING;
