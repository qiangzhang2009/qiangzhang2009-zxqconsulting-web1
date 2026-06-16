/**
 * 网站配置文件
 *
 * ⚠️ 不再直接配置敏感信息（API Key、GA ID 等），全部从环境变量读取：
 * - DEEPSEEK_API_KEY：服务端使用
 * - VITE_GA4_ID：前端编译时注入的 GA4 Measurement ID（可选）
 */

// AI 服务配置
export const AI_CONFIG = {
  // 使用 Cloudflare Worker 代理 API，保护 API 密钥
  apiUrl: '/api/ai/chat',
  model: 'chatgpt-4o-latest',
  temperature: 0.7,
  maxTokens: 2048,
};

// 其他配置
export const SITE_CONFIG = {
  name: '张小强咨询',
  tagline: '专注本草出海 | 可靠 专业 高效',
  email: 'customer@zxqconsulting.com',
  wechat: 'zxq_consulting',
  // 追踪 API 端点 - 使用 /api/tracking 转发到后台管理系统
  trackingApi: '/api/tracking',
  trackingTenant: 'zxqconsulting',
  // GA4 ID 已迁移到 VITE_GA4_ID 环境变量
  // 保留此字段仅作向后兼容，新代码请用 getGa4Id() 或 lib/ga4.ts
  ga4MeasurementId: '',
};

/**
 * 读取 GA4 Measurement ID。
 * 优先从 Vite 环境变量 VITE_GA4_ID 读取，缺失则回退到 SITE_CONFIG。
 */
export function getGa4Id(): string {
  const envId = (import.meta.env?.VITE_GA4_ID as string | undefined) || '';
  return envId || SITE_CONFIG.ga4MeasurementId || '';
}
