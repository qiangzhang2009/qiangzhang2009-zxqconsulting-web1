/**
 * 访客数据追踪 SDK
 * 用于前端页面收集用户行为数据
 * 
 * 使用方法：
 * 1. 在页面引入: import { trackPageView, trackEvent } from '@/utils/analytics';
 * 2. 初始化: initAnalytics('zxqconsulting');
 * 3. 追踪事件: trackPageView(), trackEvent('click', 'button', 'contact');
 */

import { DEEPSEEK_CONFIG } from '@/config';

const API_BASE = ''; // 同域名下调用

// 获取或生成访客ID
function getVisitorId(): string {
  const COOKIE_NAME = 'visitor_id';
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
  if (match) {
    return match[2];
  }
  
  // 生成新ID
  const newId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=${newId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  
  return newId;
}

// 网站ID配置（多网站用）
const WEBSITE_ID = 'zxqconsulting';

/**
 * 初始化追踪器
 */
export function initAnalytics() {
  const visitorId = getVisitorId();
  
  // 页面加载时自动追踪
  trackPageView();
  
  return visitorId;
}

/**
 * 追踪页面浏览
 */
export async function trackPageView(): Promise<string> {
  const visitorId = getVisitorId();
  
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website_id: WEBSITE_ID,
        visitor_id: visitorId,
        event_type: 'page_view',
        page_url: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer,
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error('Analytics: Track page view failed', error);
  }
  
  return visitorId;
}

/**
 * 追踪用户行为
 */
export async function trackEvent(
  eventType: string,
  eventCategory: string,
  eventLabel?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const visitorId = getVisitorId();
  
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website_id: WEBSITE_ID,
        visitor_id: visitorId,
        event_type: eventType,
        event_category: eventCategory,
        event_label: eventLabel,
        page_url: window.location.pathname,
        page_title: document.title,
        metadata,
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error('Analytics: Track event failed', error);
  }
}

/**
 * 追踪页面停留时长
 */
let pageStartTime = Date.now();

export function trackPageDuration(): void {
  const duration = Math.floor((Date.now() - pageStartTime) / 1000);
  
  trackEvent('page_view', 'duration', undefined, { duration_seconds: duration });
  
  // 更新开始时间（用于统计下一个页面）
  pageStartTime = Date.now();
}

/**
 * 保存访客信息（决策工作台）
 */
export async function saveVisitorInfo(info: {
  company_name?: string;
  contact_name: string;
  contact_phone: string;
  email?: string;
  product_category?: string;
  product_name?: string;
  target_region?: string;
  main_need?: string;
  readiness_score?: number;
  selected_markets?: string[];
}): Promise<string> {
  const visitorId = getVisitorId();
  
  try {
    const response = await fetch('/api/visitors', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website_id: WEBSITE_ID,
        visitor_id: visitorId,
        ...info,
      }),
    });
    
    const data = await response.json();
    return data.visitor_id || visitorId;
  } catch (error) {
    console.error('Analytics: Save visitor info failed', error);
    return visitorId;
  }
}

/**
 * 提交联系表单
 */
export async function submitContactForm(data: {
  name: string;
  email?: string;
  phone: string;
  company?: string;
  message?: string;
  product_interest?: string;
  source_page?: string;
}): Promise<{ success: boolean; id?: number }> {
  const visitorId = getVisitorId();
  
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        website_id: WEBSITE_ID,
        visitor_id: visitorId,
        ...data,
      }),
    });
    
    const result = await response.json();
    return { success: result.success, id: result.id };
  } catch (error) {
    console.error('Analytics: Submit contact form failed', error);
    return { success: false };
  }
}

/**
 * 获取当前访客ID
 */
export function getCurrentVisitorId(): string {
  return getVisitorId();
}

// 自动初始化（页面加载时）
if (typeof window !== 'undefined') {
  // 页面卸载时发送停留时长
  window.addEventListener('beforeunload', () => {
    trackPageDuration();
  });
  
  // SPA路由切换时追踪
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    trackPageView();
  };
}
