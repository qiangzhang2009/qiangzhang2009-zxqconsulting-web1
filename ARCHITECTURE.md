# zxqconsulting-web 项目架构文档

> 本文档详细记录了「张小强咨询」网站的功能架构逻辑和技术实现细节，供后续项目参考复用。

---

## 一、项目概述

### 1.1 核心定位

一个面向中医药/健康产品出海（B2B）领域的智能咨询平台网站，核心功能是**AI驱动的市场可行性分析工具链**——用户选择目标市场 + 产品类别，系统通过 DeepSeek LLM 实时生成六大分析模块数据（可行性评估、成本测算、合规自测、市场洞察、渠道推荐、风险预警），并支持多语言（15种语言）和多内容平台营销文案生成。

### 1.2 技术栈总览

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **框架** | React 19 + TypeScript | 最新 React + 严格类型 |
| **构建** | Vite 7 | 快速 HMR，代码分割优化 |
| **样式** | Tailwind CSS 3 + CSS Variables | 深色主题 + 暗色模式 |
| **路由** | React Router DOM 7 | 客户端路由 |
| **AI 服务** | DeepSeek Chat API | AI 数据生成 + 对话 |
| **后端 API** | Vercel Serverless Functions | API Routes |
| **国际化** | i18next + react-i18next | 15种语言 |
| **动画** | GSAP 3 + ScrollTrigger | 滚动动画 |
| **UI 组件** | Radix UI（无头）+ CVA | 可访问性 + 样式变体 |
| **表单** | React Hook Form + Zod | 高性能表单验证 |
| **图表** | Recharts | 数据可视化 |
| **3D** | Three.js + React Three Fiber | 3D 装饰元素 |
| **状态** | React Context + Hooks | 轻量级状态管理 |
| **提示** | Sonner (toast) | 用户反馈 |

---

## 二、目录结构

```
zxqconsulting-web/
├── src/
│   ├── main.tsx              # 应用入口
│   ├── App.tsx              # 根组件 + 路由 + 全局初始化
│   ├── i18n.ts              # 国际化配置（15种语言）
│   ├── index.css            # 全局样式 + CSS Variables 色彩系统
│   │
│   ├── sections/            # ⭐ 页面级区块组件（核心业务逻辑）
│   │   ├── AIToolsHub.tsx           # AI工具中心主容器
│   │   ├── aiToolsMarketContext.tsx # AI数据全局状态（Context Provider）
│   │   ├── FeasibilityAssessment.tsx # 可行性评估模块
│   │   ├── Tools.tsx                # 成本测算模块
│   │   ├── ComplianceTest.tsx        # 合规自测模块
│   │   ├── MarketInsight.tsx         # 市场洞察模块
│   │   ├── ChannelMatch.tsx          # 渠道推荐模块
│   │   ├── RiskWarning.tsx           # 风险预警模块
│   │   ├── AIMarketingContent.tsx    # 营销内容生成模块
│   │   ├── Hero.tsx                  # 首屏
│   │   ├── Navbar.tsx                # 导航栏
│   │   ├── Footer.tsx
│   │   └── ...
│   │
│   ├── components/          # 通用 UI 组件
│   │   ├── ui/              # shadcn/ui 风格组件（Radix 包装）
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...（30+ 组件）
│   │   ├── LanguageSwitcher.tsx       # 语言切换器
│   │   ├── FloatingContact.tsx        # 悬浮联系按钮
│   │   ├── SmartMarketSelector.tsx    # 智能市场选择器
│   │   └── ...
│   │
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAIData.ts     # AI 数据获取（从 Context 取数据）
│   │   └── use-mobile.ts    # 响应式断点检测
│   │
│   ├── lib/                 # 工具库
│   │   ├── utils.ts         # cn()（clsx + tailwind-merge）
│   │   ├── animations.ts     # GSAP 动画配置
│   │   ├── ga4.ts           # Google Analytics 4 集成
│   │   └── tracking.ts       # 用户行为追踪
│   │
│   └── locales/             # 国际化资源文件
│       ├── zh.json          # 中文（默认）
│       ├── en.json          # 英文
│       ├── ja.json / es.json / ar.json / fr.json / ...
│       └── ...（共15种）
│
├── api/                     # Vercel Serverless API Routes
│   ├── ai/
│   │   ├── chat.ts          # DeepSeek 对话 API
│   │   ├── batch.ts         # 批量 AI 分析 API（6模块）
│   │   └── marketing.ts     # 营销内容生成 API
│   ├── news.ts              # 全球新闻情报 API（RSS 聚合）
│   ├── track.ts             # 用户行为追踪 API
│   ├── contact.ts           # 联系表单 API
│   ├── analytics.ts         # 统计分析 API
│   ├── visitors.ts          # 访客统计 API
│   ├── social-intelligence.ts # 社交媒体情报 API
│   └── geopolitical-risks.ts  # 地缘政治风险 API
│
├── functions/               # Cloudflare Workers（备选部署）
│   └── api/...
│
├── dist/                    # 构建产物
├── index.html
├── vite.config.ts           # Vite 配置（alias、代码分割）
├── tailwind.config.js      # Tailwind 配置（CSS Variables）
├── package.json
└── tsconfig.json
```

---

## 三、核心架构模式

### 3.1 AI 数据层 — 三层架构

这是项目最核心的架构模式，实现了「Context 统一管理 → Hook 按需消费 → API 异步获取」的响应式数据流：

```
用户选择市场/类别
        │
        ▼
MarketProvider (Context)
  ├─ selectedMarket / selectedCategory
  ├─ cachedData (Record<AIToolType, any>)
  ├─ isPrefetching / prefetchProgress
  └─ prefetchAllData() → /api/ai/batch
        │
        ▼
/api/ai/batch (Serverless)
  └─ DeepSeek API (single prompt → 6 modules in 1 call)
        │
        ▼
返回 JSON: { feasibility, cost, compliance, insight, channel, risk }
        │
        ▼
useAIData(toolType) / useAIFeasibility() / ...
  └─ 返回: { content, loading, error, refresh }
        │
        ▼
Section 组件渲染（FeasibilityAssessment / Tools / ComplianceTest / ...）
```

**关键设计要点：**

#### (1) 分步加载策略

```typescript
// aiToolsMarketContext.tsx
// 第一阶段：只获取 feasibility（快速，3-5秒），UI 立即可用
// 第二阶段：并发获取其余5个模块（15-30秒）
// 用户体验：不用等全部加载完就能看到最有价值的可行性评估
```

#### (2) 本地缓存防抖

```typescript
// 24小时缓存，过期自动失效
const CACHE_EXPIRY_HOURS = 24;
// 缓存 key = 市场ID + 产品类别 + 区域
getCacheKey(toolType, marketId, category, regionId)
// 同一市场重复访问秒出结果
```

#### (3) Mock 数据降级

```typescript
// API 不可用时，自动生成演示数据，保证 UI 不崩溃
generateMockData(toolType, market, category)
// 带有 _mock: true 标记，UI 可差异化显示「示例数据」提示
```

#### (4) 请求竞态条件防护

```typescript
// useRef 追踪请求ID，快速切换市场时旧请求结果被忽略
const requestIdRef = useRef(0);
const currentRequestMarketRef = useRef<string>('');
```

#### (5) Prompt 模板驱动

```typescript
// 所有6个工具的 Prompt 集中管理在中控
const PROMPT_TEMPLATES: Record<AIToolType, ...> = {
  feasibility: (market, marketEn, category, categoryEn) => `...`,
  cost: (market, marketEn, category, categoryEn) => `...`,
  compliance: (market, marketEn, category, categoryEn) => `...`,
  insight: (market, marketEn, category, categoryEn) => `...`,
  channel: (market, marketEn, category, categoryEn) => `...`,
  risk: (market, marketEn, category, categoryEn) => `...`,
};
```

#### (6) Hook 按需消费

```typescript
// hooks/useAIData.ts — 简洁的消费者接口
export const useAIFeasibility = () => useAIData('feasibility');
export const useAICost = () => useAIData('cost');
export const useAICompliance = () => useAIData('compliance');
// ...各模块组件直接使用，无需关心数据来源
```

---

### 3.2 UI 组件层 — Section 模式

所有页面内容区块均为独立 `section` 组件，特点：

- **自包含**：每个 Section 有自己的数据获取逻辑（调用 Hook）
- **统一状态处理**：loading → error → empty → data 四态渲染模式
- **国际化**：通过 `useTranslation()` 获取 `i18n.language` 判断中英文
- **动画**：`animate-fadeIn` 入口动画 + GSAP 滚动触发动画

**典型 Section 结构：**

```typescript
export default function XXXSection() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const { content: data, loading, error, refresh } = useAIXXX();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState onRetry={refresh} />;
  if (!data) return <EmptyState />;

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 — 图标 + 标题 + 刷新按钮 */}
      {/* 数据卡片 — 网格布局 + 进度条 */}
      {/* 详情列表 — 可折叠 */}
      {/* 底部抽屉 — 全屏遮罩 + 详情弹窗 */}
    </section>
  );
}
```

**抽屉（Drawer）模式复用：**

```typescript
// 所有 Section 共享相同的底部抽屉实现
// 触发：点击列表项 → 打开抽屉 → 显示详情
// 关闭：点击遮罩 / 关闭按钮
<div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
  <div className="bg-gray-800 w-full sm:max-w-lg max-h-[80vh] rounded-t-2xl ...">
    {/* 标题栏 + 关闭按钮 */}
    {/* 滚动内容区 */}
    {/* 底部关闭按钮 */}
  </div>
</div>
```

---

### 3.3 双语数据模型

项目中所有 AI 返回数据均为双语文档结构：

```typescript
// AI Prompt 要求返回中英文两个版本
{
  "name": "渠道名称",
  "nameEn": "Channel Name",
  "description": "中文描述",
  "descriptionEn": "English Description",
  "pros": ["优势1", "优势2"],
  "prosEn": ["Pro 1", "Pro 2"],
}
// UI 根据 isZh 选择展示哪个版本
{isZh ? data.name : data.nameEn}
```

好处：
- AI 一次请求同时产出中英文
- 无需额外翻译 API 调用
- 数据结构统一，便于存储和缓存

---

## 四、AI 模块数据格式

### 6 大分析工具的数据结构

```typescript
// 1. 可行性评估 (feasibility)
{
  heat: number,           // 0-100 市场热度
  growth: number,         // 年增长率 %
  risk: 'low'|'medium'|'high',
  competition: number,     // 0-100 竞争程度
  recommendation: string,
  recommendationEn: string,
  conclusion: string,
  conclusionEn: string,
  policyPoints: string,
  threshold: string,
  logistics: string,
  caseStudies: string,
}

// 2. 成本测算 (cost)
{
  items: [{ name, nameEn, min, max, description, descriptionEn }],
  timeline: { months: number, phases: string[], phasesEn: string[] },
  roi: { expected: number, payback: string, paybackEn: string },
}

// 3. 合规评估 (compliance)
{
  status: 'passed'|'warning'|'failed'|'partial',
  score: number,           // 0-100 合规评分
  requirements: string[],
  documents: string[],
  timeline: string,
  warnings: string[],
  tips: string[],
}

// 4. 市场洞察 (insight)
{
  marketSize: string,
  growth: number,
  ageGroups: [{ range, rangeEn, percentage }],
  channels: [{ name, nameEn, percentage }],
  competitors: [{ name, nameEn, share }],
  trends: string[],
  consumerInsights: string,
  consumerInsightsEn: string,
}

// 5. 渠道推荐 (channel)
{
  channels: [{
    name, nameEn, type: 'online'|'offline'|'b2b',
    rating: number, investment: { min, max },
    pros: string[], cons: string[],
    description, descriptionEn,
  }],
  recommendation: string,
  recommendationEn: string,
}

// 6. 风险预警 (risk)
{
  level: 'low'|'medium'|'high'|'critical',
  score: number,
  factors: [{ name, nameEn, impact: 'positive'|'negative'|'neutral', description }],
  warnings: string[],
  mitigations: string[],
  trend: 'stable'|'worsening'|'improving',
}
```

---

## 五、API 路由层

### 5.1 API 列表

| 端点 | 方法 | 功能 | 调用方 |
|------|------|------|--------|
| `/api/ai/chat` | POST | DeepSeek 对话 | AIAdvisor 组件 |
| `/api/ai/batch` | POST | 6模块批量分析 | MarketContext |
| `/api/ai/marketing` | POST | 6平台营销文案 | AIMarketingContent |
| `/api/news` | GET | RSS 新闻聚合 | NewsSection |
| `/api/track` | POST | 行为追踪 | tracking.ts |
| `/api/contact` | POST | 联系表单提交 | Contact 组件 |
| `/api/analytics` | GET | 分析数据 | Dashboard |
| `/api/visitors` | GET | 访客统计 | VisitorStats |
| `/api/geopolitical-risks` | GET | 地缘政治风险 | — |
| `/api/social-intelligence` | GET | 社交媒体情报 | — |
| `/api/currency` | GET | 实时汇率 | — |

### 5.2 Batch API 的 Prompt 策略

```typescript
// /api/ai/batch.ts — 一次调用返回所有6个模块
// 完整模式 prompt 包含所有模块的数据格式要求
// 减少 API 调用次数（6次 → 1次），降低延迟和成本

// 但分两步执行：
// 1. priority='feasibility' — feasibility 单独调用，max_tokens=600
// 2. priority='full' — 全部模块，max_tokens=2000
// 第一步结果立即返回渲染，第二步结果静默更新
```

### 5.3 API 安全模式

```typescript
// 所有 API 使用统一的 CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// API Key 严格从环境变量读取，缺失时返回 500
const apiKey = process.env.DEEPSEEK_API_KEY;

// JSON 解析容错：支持 code block + 直接提取 + 尾随逗号修复
const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  ?? content.match(/\{[\s\S]*\}/);
```

---

## 六、国际化架构

### 6.1 语言支持（15种）

```
zh(中文) / en(英文) / ja(日语) / es(西班牙语) / ar(阿拉伯语)
fr(法语) / it(意大利语) / de(德语) / pt(葡萄牙语) / ru(俄语)
ko(韩语) / vi(越南语) / id(印尼语) / ms(马来语) / th(泰语) / lo(老挝语)
```

### 6.2 初始化策略（防 SSR/hydration 不匹配）

```typescript
// i18n.ts — 三级降级
function getInitialLanguage(): string {
  // 1. localStorage (用户上次选择)
  const stored = localStorage.getItem('i18nextLng');
  if (stored && supportedLanguages.includes(stored)) return stored;
  // 2. 浏览器语言
  const navLang = navigator.language.split('-')[0].toLowerCase();
  if (supportedLanguages.includes(navLang)) return navLang;
  // 3. 默认中文
  return 'zh';
}

i18n.init({
  lng: getInitialLanguage(),  // 同步获取，防止 hydration mismatch
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'], // 选择结果自动持久化
  },
});
```

### 6.3 组件内使用模式

```typescript
// 模式一：UI 文本（翻译文件管理）
const { t } = useTranslation();
<p>{t('hero.title')}</p>

// 模式二：双语文档（AI 生成的数据本身含中英文）
const { i18n } = useTranslation();
const isZh = i18n.language === 'zh';
{isZh ? data.name : data.nameEn}

// 模式三：静态中英文字符串（代码中直接写）
const LABELS = [
  { value: 'social', label: '社交媒体', labelEn: 'Social Post' },
];
{isZh ? ct.label : ct.labelEn}
```

---

## 七、样式系统

### 7.1 CSS Variables 色彩系统

```css
/* index.css — 定义全站色彩变量 */
:root {
  /* 深青色 — 主品牌色 */
  --primary-500: #3d8a7a;
  /* 暖金色 — 辅助色 */
  --accent-500: #e8894d;
  /* 薰衣草紫 — AI 智能色 */
  --ai-500: #8b5cf6;
  /* 健康绿 — 状态色 */
  --health-500: #10b981;
  /* 深色主题背景 */
  --background: #09090b;
  --foreground: #fafafa;
  /* 边框和卡片 */
  --border: #27272a;
  --card: #18181b;
}

/* 语义化映射 */
colors: {
  primary: "hsl(var(--primary))",    /* → hsl(var(--primary)) */
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
}
```

### 7.2 深色主题 + 暗色模式

```css
/* Tailwind darkMode: ["class"] */
/* html 添加 class="dark" 激活深色模式 */
/* 由于默认为深色主题（--background: #09090b），无需额外处理 */
```

### 7.3 组件样式变体（CVA）

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive ...",
        outline: "border border-input ...",
        secondary: "bg-secondary text-secondary-foreground ...",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
      },
    },
  }
);
```

---

## 八、性能优化策略

### 8.1 代码分割（Vite Rollup）

```typescript
// vite.config.ts — 按需分割 vendor chunk
manualChunks: {
  'vendor-react': ['react', 'react-dom'],
  'vendor-gsap': ['gsap'],
  'vendor-i18n': ['i18next', 'react-i18next'],
}
```

### 8.2 路由级懒加载

```typescript
// App.tsx — 非首屏 Section 懒加载
const About = lazy(() => import('./sections/About'));
const Services = lazy(() => import('./sections/Services'));
const AIToolsHub = lazy(() => import('./sections/AIToolsHub'));
// ...
<Suspense fallback={<Skeleton />}>{children}</Suspense>
```

### 8.3 滚动动画优化

```typescript
// GSAP ScrollTrigger — 仅首屏初始化
// 区块浏览追踪使用 IntersectionObserver，轻量
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        tracking.sectionView(sectionId);
      }
    });
  },
  { threshold: 0.5 }
);
```

### 8.4 AI 数据本地缓存

- 24小时 localStorage 缓存
- 相同市场/类别组合秒出结果
- 减少 API 调用节省成本

---

## 九、追踪与埋点系统

```typescript
// src/lib/tracking.ts
export const tracking = {
  pageView(path: string): void {},      // 页面浏览
  sectionView(sectionId: string): void {},  // 区块曝光
  toolInteraction(tool: string, action: string, metadata?: object): void {},
  click(element: string, category: string): void {},
};
// → POST /api/track → Supabase (可选)
```

---

## 十、可复用架构模式总结

### 模式 1：多工具 AI 数据平台

```
Context(全局状态) → API Route(批量获取) → Hook(按需消费) → Section(独立渲染)
```

适用于：多个功能模块需要共享同一个 AI 数据源的场景。
关键：分步加载（先给最重要的数据）+ Mock 数据降级 + 缓存防抖。

### 模式 2：双语数据模型

```
AI Prompt 要求返回中英文两个版本 → 同一 JSON 结构含 name + nameEn
→ isZh ? data.name : data.nameEn 选择展示
```

适用于：面向多语言用户的 AI 应用，一次 API 调用产出所有语言版本。

### 模式 3：Section 组件体系

```
每个 Section = 独立数据获取 + 四态渲染(loading/error/empty/data)
+ 底部抽屉详情 + 刷新按钮
```

适用于：中后台管理平台、多模块 SaaS 产品。

### 模式 4：Serverless Proxy API

```
Frontend(fetch /api/ai/xxx) → Vercel Serverless → DeepSeek API
```

适用于：需要隐藏 API Key、需要跨域调用、需要数据预处理的场景。

### 模式 5：国际化三层架构

```
翻译文件(t('key')) + 双语数据(data.zh + data.en) + 静态硬编码({isZh ? '中' : 'En'})
```

适用于：内容高度本地化的产品，避免大量翻译文件维护负担。

### 模式 6：AI 分步加载 UX

```
Step 1: 获取核心数据(3-5s) → 立即渲染 UI ← 用户看到结果
Step 2: 获取完整数据(15-30s) → 静默更新缓存 ← 后台处理
```

适用于：AI 生成延迟较长的场景，通过优先级策略改善感知性能。

---

## 十一、环境变量配置

```bash
# .env.production
DEEPSEEK_API_KEY=sk-...          # DeepSeek API 密钥
SUPABASE_URL=...                 # Supabase (可选，追踪存储)
SUPABASE_ANON_KEY=...            # Supabase 密钥
```

---

## 十二、「提交询盘」板块 — 技术详解

> 对应文件：`src/sections/Contact.tsx` + `src/components/FloatingContact.tsx` + `api/contact.ts`

### 12.1 组件层级

```
FloatingContact.tsx   — 全局悬浮联系入口（右下角 FAB）
        ↓ 滚动 / 点击
Contact.tsx            — 完整联系区块（表单 + 团队顾问）
        ↓ 提交
/api/contact.ts        — Serverless 数据持久化（Vercel Edge Runtime）
```

---

### 12.2 表单数据结构

**前端字段（用户填写）：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 姓名 |
| `email` | ✅ | 邮箱（`type="email"`） |
| `phone` | — | 电话（`type="tel"`） |
| `company` | — | 公司名称 |
| `message` | — | 询价内容（textarea 4行） |
| `source_page` | 自动 | `window.location.pathname`，追踪来源页面 |

**后端扩展字段（自动生成）：**

```typescript
{
  website_id: 'zxqconsulting',   // 网站标识
  visitor_id: string | null,     // 追踪系统生成的访客ID
  status: 'new',               // 初始状态（待跟进）
  created_at: ISO8601          // 时间戳
}
```

---

### 12.3 三路并行提交机制

这是该模块最核心的设计亮点 — 表单提交、邮件通知、追踪三条路径完全并行独立，互不阻塞：

```typescript
// Contact.tsx — handleSubmit
const data = {
  name, email, phone, company, message,
  source_page: window.location.pathname,
};

// 三路并行，Promise.allSettled 保证一路失败不影响其他
const [r1, r2, r3] = await Promise.allSettled([
  // 路1：Formsubmit.co → customer@zxqconsulting.com（纯前端邮件服务）
  fetch('https://formsubmit.co/ajax/customer@zxqconsulting.com', {
    method: 'POST', headers: { 'Accept': 'application/json' },
    body: new FormData(form),
  }),

  // 路2：Formsubmit.co → 3740977@qq.com（抄送第二个邮箱）
  fetch('https://formsubmit.co/ajax/3740977@qq.com', {
    method: 'POST', headers: { 'Accept': 'application/json' },
    body: new FormData(form),
  }),

  // 路3：/api/contact → Supabase（持久化存储）
  fetch('/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
]);

// 追踪：无论成功/失败都上报
tracking.formSubmit('contact_form', hasAnySuccess, { name, email, phone, company, message });
```

**为什么用 Formsubmit.co 而不是 SMTP？**

- 纯前端调用，无需服务器配置，通过 CORS 直发邮件
- 无需暴露任何 SMTP 凭证在代码中
- 适合 Vercel 等 Serverless 部署环境
- 注册后自定义邮件模板和重定向页面

**为什么用 `Promise.allSettled` 而不是 `Promise.all`？**

```typescript
// Promise.all — 一路失败全部失败，不适合三路独立场景
// Promise.allSettled — 每路独立 resolve/reject，最终都返回结果
// 邮件和追踪即使失败，表单依然正常提交给 Supabase
```

---

### 12.4 后端 API — /api/contact

```typescript
// api/contact.ts
export const config = {
  runtime: 'edge',  // Vercel Edge Runtime，全球边缘节点，冷启动 < 50ms
};

export default async function handler(request) {
  const body = await request.json();

  const submissionData = {
    website_id: website_id || 'zxqconsulting',
    visitor_id: visitor_id || null,
    name, email, phone, company, message,
    source_page: source_page || '/',
    status: 'new',
    created_at: new Date().toISOString()
  };

  // 保存到 Supabase（可选，无环境变量时静默失败）
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });
  }

  return { success: true };
}
```

**安全设计要点：**
- API Key 只在服务器端环境变量中，不在前端代码中暴露
- Supabase 开启 RLS（Row Level Security）进一步控制读写权限
- CORS 配置允许所有来源访问（`'*'`），但实际受 Supabase 凭证保护

---

### 12.5 UI/UX 设计

#### macOS 风格输入框

```css
/* src/index.css */
.mac-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 999px;                      /* 全圆角胶囊 */
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(51, 65, 85, 0.5);
  transition: all 0.15s ease;
}

.mac-input:focus {
  border-color: var(--primary-500);         /* 品牌色聚焦 */
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 1),
              0 0 0 3px rgba(61, 138, 122, 0.3);  /* 双层光晕 */
  transform: translateY(-1px);              /* 上浮 1px 反馈 */
}
```

#### GSAP 滚动入场动画

```typescript
// 左侧配图：clipPath 从右向左展开（类似刷子涂抹效果）
gsap.fromTo(imageRef.current,
  { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
  { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 1, ease: 'power3.out' }
);

// 右侧表单：子元素依次从下往上 stagger 淡入
gsap.fromTo(formRef.current?.children || [],
  { y: 30, opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out' }
);
```

#### 四态表单反馈

| 状态 | 表现 |
|------|------|
| **空闲** | 输入框可编辑，「提交询盘」按钮可用 |
| **提交中** | 按钮禁用显示「正在提交...」，输入框不可编辑 |
| **成功** | Radix Dialog 弹窗感谢提示 + 自动重置表单 |
| **失败** | `alert()` 错误提示 + 追踪失败事件 + 按钮恢复 |

#### 团队顾问卡片（配置驱动）

```typescript
// 三位区域负责人，配置数组驱动，添加新人只需改这里
const contacts = [
  { name: '张强', region: '中国负责人',    phone: '137...',  email: 'zxq@...' },
  { name: '李静', region: '日本/东南亚',  phoneCn: '...', phoneJp: '...', email: '...' },
  { name: '刘潇', region: '澳大利亚/香港', phoneCn: '...', phoneAu: '...', email: '...' },
];
```

---

### 12.6 FloatingContact — 悬浮 FAB

**触发条件：** 滚动超过 300px 后淡入显示

```typescript
useEffect(() => {
  const handleScroll = () => setIsVisible(window.scrollY > 300);
  window.addEventListener('scroll', handleScroll);
}, []);
```

**四种联系方式：**

| 入口 | 行为 | 实现方式 |
|------|------|---------|
| 立即拨打 | `tel:` 协议 | 跳转系统拨号 |
| 微信咨询 | 点击复制微信号 `zxq_consulting` | `navigator.clipboard.writeText()` |
| 发送邮件 | `mailto:` 协议 | 打开本地邮件客户端 |
| 在线留言 | 平滑滚动到 `#contact` | `scrollIntoView({ behavior: 'smooth' })` |

**展开动画：** 主按钮点击 → 面板从底部滑出 + 图标旋转 90°

---

### 12.7 Radix UI Dialog 成功弹窗

```typescript
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent className="sm:max-w-md">
    <DialogTitle>提交成功</DialogTitle>
    <DialogDescription>
      感谢您的垂询！我们的专业顾问将在24小时内与您联系。
    </DialogDescription>
    <button onClick={() => setShowDialog(false)}>知道了</button>
  </DialogContent>
</Dialog>
```

Radix UI 自动处理：焦点陷阱、ESC 关闭、点击遮罩关闭、滚动锁定。

---

### 12.8 国际化

所有文本集中在 `src/locales/zh.json` 管理：

```json
"contact": {
  "title": "联系我们",
  "form": {
    "title": "提交询盘",
    "name": "姓名",
    "email": "电子邮件",
    "phone": "电话",
    "company": "公司名称",
    "message": "询价内容",
    "submit": "提交询盘",
    "submitting": "正在提交...",
    "success": "提交成功",
    "successMessage": "感谢您的垂询！我们的专业顾问将在24小时内与您联系。",
    "gotIt": "知道了",
    "error": "提交失败。请稍后重试或直接发送电子邮件至..."
  }
},
"floatingContact": {
  "workTime": "工作时间：周一至周五 9:00-18:00"
}
```

英文等语言只需覆盖对应 locale 文件的 `contact` 节点，表单组件无需修改。

---

### 12.9 可复用设计模式总结

| 模式 | 实现方式 | 复用场景 |
|------|---------|---------|
| **三路并行提交** | `Promise.allSettled` | 表单提交 + 通知 + 追踪完全解耦 |
| **Formsubmit.co 发邮件** | 纯前端 CORS POST | Serverless 环境无需 SMTP |
| **MacOS 胶囊输入框** | `border-radius: 999px` + 双层光晕 | 企业/SaaS B2B 表单通用风格 |
| **GSAP clipPath 入场** | `inset(0 100% 0 0)` → `inset(0 0%)` | 配图区域入场动画 |
| **团队顾问配置数组** | `contacts[]` 配置驱动 | 客服/销售团队展示 |
| **悬浮 FAB 组件** | `scroll > 300px` + 展开面板 | 高转化 B2B 网站标配 |
| **Supabase REST 存储** | `fetch /rest/v1/table` | 轻量无服务器后端 CRUD |
| **追踪 + DB 双写** | `tracking.formSubmit()` + `/api/contact` | 用户行为分析 + CRM 数据同步 |
| **Radix Dialog** | 无头 Dialog 自动处理 | 无障碍弹窗（焦点陷阱/ESC/滚动锁） |
| **配置驱动区域顾问** | `contacts[]` 数组 | 快速更换团队成员无需改代码 |

---

*文档版本：1.0.0 | 最后更新：2026-04-07*
