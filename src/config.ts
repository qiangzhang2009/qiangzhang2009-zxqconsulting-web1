/**
 * 网站配置文件
 */

// DeepSeek API 配置
export const DEEPSEEK_CONFIG = {
  apiKey: 'sk-5e05ef423c5446c599afe2ad15263233',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
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
};
