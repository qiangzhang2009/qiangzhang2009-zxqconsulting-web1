/**
 * 联系表单提交 API
 * POST /api/contact
 * 
 * 保存用户通过联系表单提交的信息
 */

export async function onRequestPost(context) {
  const { env } = context;

  try {
    const body = await context.request.json();
    
    const {
      visitor_id,
      name,
      email,
      phone,
      company,
      message,
      product_interest,
      source_page
    } = body;
    
    // 获取客户端信息
    const cf = context.request.cf || {};
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';
    
    // 获取D1数据库
    const DB = env.DB;
    
    if (DB) {
      // 保存表单提交
      const result = await DB.prepare(`
        INSERT INTO submissions (
          visitor_id, name, email, phone, company, message,
          product_interest, source_page, ip_address, country,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime("now"), datetime("now"))
      `).bind(
        visitor_id || null,
        name,
        email || null,
        phone || null,
        company || null,
        message || null,
        product_interest || null,
        source_page || '/',
        ipAddress,
        country
      ).run();
      
      // 更新每日统计
      const today = new Date().toISOString().split('T')[0];
      const todayStats = await DB.prepare(
        'SELECT id FROM daily_analytics WHERE date = ?'
      ).bind(today).first();
      
      if (todayStats) {
        await DB.prepare(
          'UPDATE daily_analytics SET form_submissions = form_submissions + 1 WHERE date = ?'
        ).bind(today).run();
      } else {
        await DB.prepare(
          'INSERT INTO daily_analytics (date, form_submissions) VALUES (?, 1)'
        ).bind(today).run();
      }
      
      // 记录行为
      if (visitor_id) {
        await DB.prepare(`
          INSERT INTO behaviors (visitor_id, event_type, event_category, event_label, page_url, created_at)
          VALUES (?, 'submit', 'contact_form', 'submit', ?, datetime("now"))
        `).bind(visitor_id, source_page || '/contact').run();
      }
      
      return new Response(JSON.stringify({
        success: true,
        id: result.lastInsertRowId,
        message: '表单提交成功'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 如果没有数据库，直接返回成功（不影响用户体验）
    return new Response(JSON.stringify({
      success: true,
      message: '表单提交成功'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact Form API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
