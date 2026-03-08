/**
 * 网站配置文件
 */

// AI 服务配置 - 使用 Cloudflare Worker 代理
export const AI_CONFIG = {
  // 使用 Cloudflare Worker 代理 API，保护 API 密钥
  apiUrl: '/api/ai/chat',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2048,
};

/**
 * AI 助手名称替换
 * 用于在AI回复中替换 "DeepSeek" 为自定义名称
 */
export const AI_NAME_REPLACEMENTS = {
  'DeepSeek': '智探Global 智能体',
  'deepseek': '智探Global 智能体',
  'DEEPSEEK': '智探Global 智能体',
};

// 其他配置
export const SITE_CONFIG = {
  name: '张小强咨询',
  tagline: '专注本草出海 | 可靠 专业 高效',
  email: 'customer@zxqconsulting.com',
  wechat: 'zxq_consulting',
  // 追踪 API 端点
  trackingApi: '/api/track',
};
