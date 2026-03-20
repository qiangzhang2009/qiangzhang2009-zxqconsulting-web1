/**
 * 网站配置文件
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
  // 追踪 API 端点 - 改为后台管理系统的API
  trackingApi: '/api/tracking',
  trackingTenant: 'zxqconsulting',
  // Google Analytics 4 - 请替换为你的 GA4 测量 ID (格式: G-XXXXXXXXXX)
  ga4MeasurementId: '',
};
