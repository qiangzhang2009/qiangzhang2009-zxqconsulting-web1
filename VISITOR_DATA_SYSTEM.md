# 访客数据收集与后台管理系统设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     前端网站 (zxqconsulting.com)            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ 决策工作台   │  │ 联系表单    │  │ 行为埋点收集        │ │
│  │ (企业信息)   │  │ (Contact)   │  │ (页面浏览/点击)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼───────────────────┼────────────┘
          │                │                   │
          └────────────────┴───────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Workers API                          │
│  ┌─────────────────┐  ┌──────────────────────────────────┐ │
│  │ /api/visitors   │  │ /api/track (POST)                │ │
│  │   (获取列表)    │  │   (收集访客行为)                  │ │
│  └────────┬────────┘  └──────────────┬───────────────────┘ │
└───────────┼───────────────────────────┼─────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare D1 数据库                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ visitors     │  │ submissions  │  │ behaviors        │  │
│  │ 访客记录     │  │ 提交表单    │  │ 用户行为         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              管理后台 (admin.zxqconsulting.com)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ 仪表盘        │  │ 客户列表     │  │ 数据导出         │ │
│  │ Dashboard    │  │ Visitors    │  │ Export          │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 数据表设计

### 1. visitors 表 - 访客基础信息
```sql
CREATE TABLE visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT UNIQUE NOT NULL,     -- 唯一标识 (cookie或生成的UUID)
  company_name TEXT,                    -- 公司名称
  contact_name TEXT NOT NULL,           -- 联系人姓名
  contact_phone TEXT NOT NULL,          -- 联系电话
  email TEXT,                           -- 邮箱
  product_category TEXT,                -- 产品类型
  product_name TEXT,                    -- 产品名称
  target_region TEXT,                   -- 目标区域
  main_need TEXT,                       -- 主要需求
  readiness_score INTEGER,              -- 准备度得分
  selected_markets TEXT,                -- 选择的市场 (JSON数组)
  source_url TEXT,                      -- 来源页面
  ip_address TEXT,                      -- IP地址
  country TEXT,                         -- 国家
  city TEXT,                            -- 城市
  device_type TEXT,                     -- 设备类型
  browser TEXT,                         -- 浏览器
  first_visit DATETIME,                 -- 首次访问
  last_visit DATETIME,                  -- 最后访问
  visit_count INTEGER DEFAULT 1,        -- 访问次数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. submissions 表 - 联系表单提交
```sql
CREATE TABLE submissions (
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
  status TEXT DEFAULT 'new',           -- new/contacted/closed
  notes TEXT,
  assigned_to TEXT,                     -- 分配给
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. behaviors 表 - 用户行为追踪
```sql
CREATE TABLE behaviors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,            -- page_view/click/scroll/submit
  event_category TEXT,                  -- section/button/form
  event_label TEXT,                     -- 具体元素标识
  page_url TEXT NOT NULL,
  page_title TEXT,
  duration_seconds INTEGER,             -- 停留时长
  metadata TEXT,                        -- 额外数据 (JSON)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_behaviors_visitor ON behaviors(visitor_id);
CREATE INDEX idx_behaviors_type ON behaviors(event_type);
CREATE INDEX idx_behaviors_created ON behaviors(created_at);
```

### 4. analytics 表 - 每日统计
```sql
CREATE TABLE daily_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  decision_workspace_starts INTEGER DEFAULT 0,
  tools_uses INTEGER DEFAULT 0,
  top_pages TEXT,                       -- JSON
  top_countries TEXT,                   -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 收集的数据内容

### 用户主动提交的数据
1. **决策工作台**
   - 企业基础信息（公司名、联系人、电话、产品类型、目标区域、需求）
   - 准备度评估结果
   - 选择的目标市场
   
2. **联系表单**
   - 姓名、电话、邮箱、公司
   - 咨询内容、感兴趣的产品

### 自动收集的行为数据
1. **页面访问**
   - 访问的页面URL
   - 停留时长
   - 来源页面
   
2. **用户互动**
   - 点击的按钮/链接
   - 使用的工具（成本计算器、政策查询等）
   - 决策工作台的步骤进度
   
3. **设备信息**
   - IP地址、国家、城市
   - 设备类型（PC/手机/平板）
   - 浏览器类型

## API 设计

### POST /api/track - 行为追踪
```json
Request:
{
  "visitor_id": "uuid-or-cookie-id",
  "event_type": "page_view|click|scroll|submit",
  "event_category": "section-name",
  "event_label": "element-id",
  "page_url": "/decision-workspace",
  "page_title": "智能决策工作台",
  "duration_seconds": 120,
  "metadata": {}
}

Response:
{
  "success": true,
  "visitor_id": "generated-uuid"
}
```

### GET /api/visitors - 获取访客列表
```
Query params: ?page=1&limit=20&search=&date_from=&date_to=&status=
Response: { "total": 100, "data": [...], "page": 1 }
```

### GET /api/visitors/:id - 访客详情
```
Response: { "visitor": {...}, "behaviors": [...], "submissions": [...] }
```

### POST /api/submissions - 提交联系表单
```
Request: { "name": "", "phone": "", "email": "", "message": "" }
Response: { "success": true, "id": 123 }
```

### GET /api/analytics - 数据统计
```
Response: {
  "today": { "visitors": 50, "submissions": 5 },
  "trend": [...],
  "top_sources": [...],
  "conversion_rate": 2.5
}
```

## 管理后台功能

### 1. 仪表盘 (Dashboard)
- 今日/本周/本月关键指标
- 访客趋势图表
- 转化漏斗（访问→决策工作台→提交表单）
- 最近提交的表单

### 2. 客户管理 (Visitors)
- 访客列表（可搜索、筛选）
- 客户详情（基本信息 + 行为轨迹）
- 客户分类（潜在客户/已联系/已成交）
- 导出功能（CSV/Excel）

### 3. 表单提交 (Submissions)
- 联系表单提交列表
- 状态管理（标记处理状态）
- 添加备注
- 批量操作

### 4. 行为分析 (Analytics)
- 页面热度图
- 用户行为路径
- 工具使用统计
- 地域分布

### 5. 数据导出 (Export)
- 按时间范围导出
- 按数据类型导出
- 自定义字段选择

## 安全考虑

1. **API 认证**
   - 管理后台需要登录验证
   - API 请求需要 API Key 验证
   
2. **数据脱敏**
   - IP地址可选择隐藏或只显示省份
   - 电话号码部分脱敏显示
   
3. **合规性**
   - 遵守 GDPR（欧盟用户）
   - 提供数据删除接口
   - 用户同意后才收集数据
