/**
 * 访客数据追踪 API
 * POST /api/track
 * 
 * 收集用户行为数据：页面访问、点击、滚动、提交等
 */

export async function onRequestPost(context) {
  const { env } = context;
  
  // 获取或生成访客ID
  const getVisitorId = (cookies, body) => {
    if (body.visitor_id) return body.visitor_id;
    if (cookies && cookies.get('visitor_id')) return cookies.get('visitor_id').value;
    return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  try {
    const contentType = context.request.headers.get('content-type') || '';
    let body = {};
    let cookies = {};
    
    if (contentType.includes('application/json')) {
      body = await context.request.json();
    }
    
    // 获取客户端信息
    const cf = context.request.cf || {};
    const userAgent = context.request.headers.get('user-agent') || '';
    
    // 解析User-Agent判断设备类型
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    
    // 解析浏览器
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    const visitorId = getVisitorId(cookies, body);
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';
    const city = cf.city || '';
    
    // 解析事件数据
    const eventType = body.event_type || 'page_view';
    const eventCategory = body.event_category || '';
    const eventLabel = body.event_label || '';
    const pageUrl = body.page_url || new URL(context.request.url).pathname;
    const pageTitle = body.page_title || '';
    const durationSeconds = body.duration_seconds || null;
    const metadata = body.metadata ? JSON.stringify(body.metadata) : null;
    
    // 获取D1数据库
    const DB = env.DB;
    
    if (DB) {
      // 检查访客是否存在
      const existingVisitor = await DB.prepare(
        'SELECT id, visit_count FROM visitors WHERE visitor_id = ?'
      ).bind(visitorId).first();
      
      if (existingVisitor) {
        // 更新访客的最后访问时间
        await DB.prepare(
          'UPDATE visitors SET last_visit = datetime("now"), visit_count = visit_count + 1 WHERE visitor_id = ?'
        ).bind(visitorId).run();
      }
      
      // 记录行为
      await DB.prepare(`
        INSERT INTO behaviors (visitor_id, event_type, event_category, event_label, page_url, page_title, duration_seconds, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
      `).bind(
        visitorId,
        eventType,
        eventCategory,
        eventLabel,
        pageUrl,
        pageTitle,
        durationSeconds,
        metadata
      ).run();
      
      // 更新每日统计
      const today = new Date().toISOString().split('T')[0];
      
      // 更新页面浏览或工具使用统计
      let updateField = 'page_views';
      if (eventCategory === 'tools') {
        updateField = 'tools_uses';
      } else if (eventType === 'submit' && eventCategory === 'decision_workspace') {
        updateField = 'decision_workspace_starts';
      }
      
      // 检查今天的统计是否存在
      const todayStats = await DB.prepare(
        'SELECT id FROM daily_analytics WHERE date = ?'
      ).bind(today).first();
      
      if (todayStats) {
        await DB.prepare(
          `UPDATE daily_analytics SET ${updateField} = ${updateField} + 1 WHERE date = ?`
        ).bind(today).run();
      } else {
        await DB.prepare(
          'INSERT INTO daily_analytics (date, page_views) VALUES (?, 1)'
        ).bind(today).run();
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      visitor_id: visitorId,
      message: '行为已记录'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `visitor_id=${visitorId}; Path=/; Max-Age=31536000; HttpOnly`
      }
    });
    
  } catch (error) {
    console.error('Track API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
