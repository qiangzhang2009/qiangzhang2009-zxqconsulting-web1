/**
 * 网站追踪 SDK
 * 用于追踪用户行为、页面访问等数据
 */

import { SITE_CONFIG } from '@/config';

// 追踪配置
const TRACKING_CONFIG = {
  apiUrl: SITE_CONFIG.trackingApi || '/api/track',
  sessionTimeout: 30 * 60 * 1000, // 30 分钟会话超时
};

// 事件类型
export type EventType = 
  | 'page_view'
  | 'click'
  | 'scroll'
  | 'form_submit'
  | 'tool_interaction'
  | 'ai_query'
  | 'section_view';

// 追踪数据接口
interface TrackData {
  event_type: EventType;
  event_category?: string;
  event_label?: string;
  page_url?: string;
  page_title?: string;
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
}

// 存储访客 ID
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'zxq_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

// 存储会话 ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'zxq_session_id';
  const sessionTimeKey = 'zxq_session_time';
  const now = Date.now();
  
  let sessionId = localStorage.getItem(storageKey);
  const sessionTime = parseInt(localStorage.getItem(sessionTimeKey) || '0');
  
  // 检查会话是否超时
  if (!sessionId || (now - sessionTime > TRACKING_CONFIG.sessionTimeout)) {
    sessionId = `s_${now}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, sessionId);
    localStorage.setItem(sessionTimeKey, now.toString());
  }
  
  return sessionId;
}

// 发送追踪数据
async function track(data: TrackData): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    const payload = {
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      website_id: 'zxqconsulting',
      ...data,
      page_url: data.page_url || window.location.href,
      page_title: data.page_title || document.title,
    };
    
    // 使用 sendBeacon 或 fetch 发送数据
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(TRACKING_CONFIG.apiUrl, blob);
    } else {
      await fetch(TRACKING_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch (error) {
    // 静默失败，不影响用户体验
    console.error('Tracking error:', error);
  }
}

// 公开 API
export const tracking = {
  // 追踪页面浏览
  pageView: (data?: Partial<TrackData>) => {
    track({ event_type: 'page_view', ...data });
  },
  
  // 追踪点击
  click: (label: string, category?: string) => {
    track({ 
      event_type: 'click', 
      event_category: category, 
      event_label: label 
    });
  },
  
  // 追踪滚动深度
  scroll: (depth: number) => {
    track({ 
      event_type: 'scroll', 
      event_label: `${depth}%`,
      metadata: { depth }
    });
  },
  
  // 追踪表单提交
  formSubmit: (formName: string, success: boolean) => {
    track({ 
      event_type: 'form_submit', 
      event_label: formName,
      metadata: { success }
    });
  },
  
  // 追踪 AI 工具交互
  toolInteraction: (toolName: string, action: string, data?: Record<string, unknown>) => {
    track({
      event_type: 'tool_interaction',
      event_category: toolName,
      event_label: action,
      metadata: data,
    });
  },
  
  // 追踪 AI 查询
  aiQuery: (query: string, resultLength: number) => {
    track({
      event_type: 'ai_query',
      event_label: query.substring(0, 100),
      metadata: { resultLength, queryLength: query.length },
    });
  },
  
  // 追踪区块浏览
  sectionView: (sectionId: string) => {
    track({
      event_type: 'section_view',
      event_label: sectionId,
    });
  },
};

// 自动追踪功能
export function initAutoTracking(): void {
  if (typeof window === 'undefined') return;
  
  // 页面浏览追踪
  tracking.pageView();
  
  // 滚动深度追踪
  let maxScroll = 0;
  let scrollTracked = false;
  window.addEventListener('scroll', () => {
    if (scrollTracked) return;
    
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScroll) maxScroll = scrollPercent;
    
    // 记录 25%, 50%, 75%, 100% 滚动点
    if (maxScroll >= 25 && maxScroll < 50 && !scrollTracked) {
      tracking.scroll(25);
      scrollTracked = true;
    } else if (maxScroll >= 50 && maxScroll < 75) {
      tracking.scroll(50);
    } else if (maxScroll >= 75 && maxScroll < 100) {
      tracking.scroll(75);
    } else if (maxScroll >= 100) {
      tracking.scroll(100);
    }
  });
  
  // 点击追踪 (带有 data-track 属性的元素)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const trackData = target.getAttribute('data-track');
    
    if (trackData) {
      try {
        const data = JSON.parse(trackData);
        tracking.click(data.label || target.textContent || 'unknown', data.category);
      } catch {
        tracking.click(target.textContent || 'unknown');
      }
    }
  });
}

export default tracking;
