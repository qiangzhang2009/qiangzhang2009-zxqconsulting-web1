/**
 * 网站追踪 SDK - 增强版
 * 用于追踪用户行为、页面访问等数据
 * 数据格式与后台管理系统 (backend-admin) 一致
 * 包含：基础行为数据、工具版块深度数据、业务意向数据
 */

import { SITE_CONFIG } from '@/config';

// 追踪配置
const TRACKING_CONFIG = {
  apiUrl: SITE_CONFIG.trackingApi || '/api/tracking',
  tenantSlug: SITE_CONFIG.trackingTenant || 'zxqconsulting',
  sessionTimeout: 30 * 60 * 1000, // 30 分钟会话超时
};

// 用户设备信息
interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
}

// 获取设备信息
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown', screenWidth: 0, screenHeight: 0, language: 'unknown' };
  }
  
  const ua = navigator.userAgent;
  
  // 设备类型
  let deviceType = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'mobile';
  }
  
  // 浏览器
  let browser = 'unknown';
  if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari')) {
    browser = 'Safari';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
  } else if (ua.includes('MSIE') || ua.includes('Trident')) {
    browser = 'IE';
  }
  
  // 操作系统
  let os = 'unknown';
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }
  
  return {
    deviceType,
    browser,
    os,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language || 'unknown',
  };
}

// 访问来源类型
function getTrafficSource(): string {
  if (typeof document === 'undefined') return 'direct';
  
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  
  try {
    const refUrl = new URL(referrer);
    const hostname = refUrl.hostname;
    
    // 搜索引擎
    const searchEngines = ['google', 'bing', 'yahoo', 'baidu', 'yandex', 'duckduckgo', 'sogou'];
    if (searchEngines.some(se => hostname.includes(se))) {
      return 'search';
    }
    
    // 社交媒体
    const socialMedia = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok', 'weibo', 'zhihu'];
    if (socialMedia.some(sm => hostname.includes(sm))) {
      return 'social';
    }
    
    // 其他外部链接
    return 'referral';
  } catch {
    return 'direct';
  }
}

// 存储访客 ID (与后台系统一致)
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'zt_visitor_id';
  let visitorId = localStorage.getItem(storageKey);
  
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);
  }
  
  return visitorId;
}

// 存储会话 ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'zt_session_id';
  const sessionTimeKey = 'zt_session_time';
  const now = Date.now();
  
  let sessionId = localStorage.getItem(storageKey);
  const sessionTime = parseInt(localStorage.getItem(sessionTimeKey) || '0');
  
  // 检查会话是否超时
  if (!sessionId || (now - sessionTime > TRACKING_CONFIG.sessionTimeout)) {
    sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, sessionId);
    localStorage.setItem(sessionTimeKey, now.toString());
  }
  
  return sessionId;
}

// 地理位置信息缓存
let geoCache: { data: Record<string, unknown> | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

// 获取地理位置 (使用浏览器原生 Geolocation API + Nominatim 反向地理编码)
async function getGeoInfo(): Promise<Record<string, unknown>> {
  const now = Date.now();
  const cacheDuration = 3600000; // 缓存1小时
  
  if (geoCache.data && (now - geoCache.timestamp) < cacheDuration) {
    return geoCache.data;
  }
  
  // 检查浏览器是否支持 Geolocation
  if (!navigator.geolocation) {
    return {};
  }
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // 使用 Nominatim (OpenStreetMap) 进行反向地理编码
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'ZxqConsulting/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            
            const geoData = {
              latitude,
              longitude,
              country: address.country || '',
              country_code: address.country_code?.toUpperCase() || '',
              region: address.state || address.county || '',
              city: address.city || address.town || address.village || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            };
            
            geoCache = { data: geoData, timestamp: now };
            resolve(geoData);
          } else {
            resolve({ latitude, longitude });
          }
        } catch (error) {
          console.log('[Tracking] Geo reverse geocoding failed:', error);
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        console.log('[Tracking] Geolocation permission denied or failed:', error.message);
        resolve({});
      },
      { timeout: 5000, maximumAge: 3600000 }
    );
  });
}

// 发送追踪数据 (格式与后台系统一致)
async function track(eventType: string, eventData?: Record<string, unknown>): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') return;
  
  try {
    const deviceInfo = getDeviceInfo();
    const geoInfo = await getGeoInfo();
    
    const payload = {
      event_type: eventType,
      tenant_slug: TRACKING_CONFIG.tenantSlug,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      timestamp: new Date().toISOString(),
      website_url: window.location.origin,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      // 设备信息
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      screen_resolution: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
      language: deviceInfo.language,
      // 访问来源
      traffic_source: getTrafficSource(),
      // 地理位置
      geo_country: geoInfo.country,
      geo_region: geoInfo.region,
      geo_city: geoInfo.city,
      geo_isp: geoInfo.isp,
      // 事件数据
      event_data: eventData,
    };
    
    console.log('[Tracking] Sending:', eventType, eventData);
    
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
  pageView: (data?: Record<string, unknown>) => {
    track('page_view', {
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
      viewport_width: typeof window !== 'undefined' ? window.innerWidth : 0,
      viewport_height: typeof window !== 'undefined' ? window.innerHeight : 0,
      ...data,
    });
  },
  
  // 追踪点击
  click: (label: string, category?: string, data?: Record<string, unknown>) => {
    track('click', {
      element: 'link',
      label: label,
      category: category,
      ...data,
    });
  },
  
  // 追踪滚动深度
  scroll: (depth: number) => {
    track('scroll', {
      scroll_depth: depth,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  },
  
  // 追踪表单提交（完整字段）
  formSubmit: (formName: string, success: boolean, fields?: Record<string, unknown>) => {
    track('form_submit', {
      form_name: formName,
      submit_result: success ? 'success' : 'error',
      fields: fields || {},
      // 从表单字段中提取业务意向数据
      visitor_name: fields?.name || fields?.['姓名'] || '',
      visitor_email: fields?.email || fields?.['邮箱'] || '',
      visitor_phone: fields?.phone || fields?.['电话'] || '',
      company_name: fields?.company || fields?.['公司名称'] || '',
      product_type: fields?.productType || fields?.['产品类型'] || '',
      target_market: fields?.targetMarket || fields?.['目标市场'] || '',
      message: fields?.message || fields?.['需求'] || fields?.['询价内容'] || '',
    });
  },
  
  // 追踪 AI 工具交互（深度数据）
  toolInteraction: (toolName: string, action: string, data?: Record<string, unknown>) => {
    track('tool_interaction', {
      tool_name: toolName,
      action: action,
      // 工具版块深度数据 - 支持多种字段名
      tool_section: data?.tool_section,
      // 市场相关
      target_region: data?.targetRegion || data?.target_market || data?.marketName || data?.marketId || '',
      selected_market: data?.selectedMarket || data?.marketName || data?.marketId || '',
      market_id: data?.marketId,
      market_name: data?.marketName,
      // 产品相关
      product_type: data?.productType || data?.product_type || data?.typeValue || '',
      product_category: data?.productCategory || data?.product_category || data?.category || data?.categoryValue || '',
      category_level1: data?.categoryLevel1 || data?.typeValue,
      category_level2: data?.categoryLevel2 || data?.categoryValue,
      // 预算和需求
      budget_range: data?.budgetRange || data?.budget_range || '',
      need_agent: data?.needAgent || data?.need_agent || data?.needLocalAgent,
      need_compliance: data?.needCompliance || data?.need_compliance || data?.requireCertification,
      // AI 分析相关
      analysis_mode: data?.analysisMode || data?.analysis_mode,
      user_role: data?.userRole || data?.user_role,
      business_stage: data?.businessStage || data?.business_stage,
      // 使用时长和结果
      duration_seconds: data?.durationSeconds || data?.duration_seconds,
      duration_ms: data?.durationMs || data?.duration_ms,
      completed_steps: data?.completedSteps || data?.completed_steps,
      total_steps: data?.totalSteps || data?.total_steps || 1,
      is_abandoned: data?.isAbandoned || data?.is_abandoned || false,
      is_saved: data?.isSaved || data?.is_saved || false,
      is_shared: data?.isShared || data?.is_shared || false,
      // 结果数据
      result_summary: data?.resultSummary || data?.result_summary,
      ai_result_content: data?.aiResultContent || data?.ai_result_content,
      ai_result_length: data?.aiResultLength || data?.ai_result_length,
      // 其他数据
      ...data,
    });
  },
  
  // 追踪 AI 查询
  aiQuery: (query: string, resultLength: number, toolName?: string) => {
    track('tool_interaction', {
      tool_name: toolName || 'ai-query',
      action: 'submit',
      input_params: { 
        queryLength: query.length,
        query: query.substring(0, 200), // 限制长度
      },
      output_result: { resultLength },
    });
  },
  
  // 追踪区块浏览
  sectionView: (sectionId: string, sectionName?: string) => {
    track('module_select', {
      module_id: sectionId,
      module_name: sectionName || sectionId,
    });
  },
  
  // 追踪高意向行为
  highIntentAction: (actionType: string, data?: Record<string, unknown>) => {
    track('custom', {
      event_name: 'high_intent',
      intent_type: actionType,
      ...data,
    });
  },
  
  // 追踪页面访问路径（用于计算跳出率和回访）
  trackPagePath: (previousPage?: string) => {
    track('page_view', {
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
      previous_page: previousPage || '',
      is_first_page: !previousPage,
    });
  },
  
  // 获取访客ID
  getVisitorId,
  
  // 获取会话ID
  getSessionId,
};

// 页面访问历史（用于计算跳出率）
let pageHistory: string[] = [];

// 自动追踪功能
export function initAutoTracking(): void {
  if (typeof window === 'undefined') return;
  
  // 记录之前的页面
  const previousPage = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : '';
  pageHistory.push(window.location.pathname);
  
  // 页面浏览追踪
  tracking.pageView({ previous_page: previousPage });
  
  // 页面离开事件
  const pageStartTime = Date.now();
  const currentPage = window.location.pathname;
  
  window.addEventListener('beforeunload', () => {
    const duration = Math.round((Date.now() - pageStartTime) / 1000);
    track('page_leave', {
      duration_seconds: duration,
      page_path: currentPage,
      is_bounce: pageHistory.length === 1, // 如果只有一个页面，则为跳出
    });
  });
  
  // 滚动深度追踪 (每30秒记录一次最大滚动深度)
  let maxScroll = 0;
  const trackedMilestones = new Set<number>();
  
  const updateScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScroll) maxScroll = scrollPercent;
    
    // 记录 25%, 50%, 75%, 100% 滚动点
    const milestones = [25, 50, 75, 100] as const;
    for (const m of milestones) {
      if (maxScroll >= m && !trackedMilestones.has(m)) {
        tracking.scroll(m);
        trackedMilestones.add(m);
      }
    }
  };
  
  window.addEventListener('scroll', updateScroll, { passive: true });
  
  // 每30秒发送一次滚动数据
  setInterval(() => {
    if (maxScroll > 0) {
      tracking.scroll(maxScroll);
      maxScroll = 0;
      trackedMilestones.clear();
    }
  }, 30000);
  
  // 点击追踪 (带有 data-track 属性的元素)
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const trackData = target.getAttribute('data-track');
    
    if (trackData) {
      try {
        const data = JSON.parse(trackData);
        tracking.click(data.label || target.textContent || 'unknown', data.category, data);
      } catch {
        tracking.click(target.textContent || 'unknown');
      }
    }
  });
  
  // 高意向行为追踪
  const highIntentSections = ['case-studies', 'services', 'success-stories'];
  const sectionViewCount: Record<string, number> = {};
  const sectionViewTime: Record<string, number> = {};
  
  // 追踪高价值页面访问
  highIntentSections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!sectionViewCount[sectionId]) {
              sectionViewCount[sectionId] = 0;
              sectionViewTime[sectionId] = Date.now();
            }
            sectionViewCount[sectionId]++;
            
            // 多次访问或长时间停留
            if (sectionViewCount[sectionId] > 1) {
              tracking.highIntentAction('multiple_view', { section: sectionId });
            }
          } else if (sectionViewTime[sectionId]) {
            const viewDuration = (Date.now() - sectionViewTime[sectionId]) / 1000;
            if (viewDuration > 300) { // 超过5分钟
              tracking.highIntentAction('long_stay', { section: sectionId, duration: viewDuration });
            }
            sectionViewTime[sectionId] = 0;
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(element);
    }
  });
}

export default tracking;
