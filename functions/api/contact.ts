/**
 * 联系表单提交 API
 * POST /api/contact
 *
 * 保存用户通过联系表单提交的信息
 * 1. 转发到本地后台 SQLite 数据库（主要）
 * 2. 备选：Supabase submissions 表（如果有配置）
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  BACKEND_URL: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();

    const {
      website_id,
      visitor_id,
      name,
      email,
      phone,
      company,
      projectStage,
      targetMarkets,
      timeline,
      challenge,
      budget,
      hasValidation,
      message,
      source_page,
    } = body;

    // 获取客户端信息（Cloudflare Edge）
    const cf = (request as any).cf || {};
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';
    const city = cf.city || '';

    const formData = {
      website_id: website_id || 'zxqconsulting',
      visitor_id: visitor_id || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      project_stage: projectStage || null,
      target_markets: targetMarkets || null,
      timeline: timeline || null,
      challenge: challenge || null,
      budget: budget || null,
      has_validation: hasValidation || null,
      message: message || null,
      source_page: source_page || '/',
      ip_address: ipAddress,
      country: country,
      city: city,
      status: 'pending',
    };

    // ================================================================
    // 方案1: 转发到本地后台 SQLite 数据库（主要）
    // ================================================================
    const backendUrl = env.BACKEND_URL || 'https://websites-admin.zxqconsulting.com';

    try {
      const trackingPayload = {
        event_type: 'form_submit',
        tenant_slug: website_id || 'zxqconsulting',
        visitor_id: visitor_id || null,
        event_data: {
          form_name: 'expert_review_form',
          fields: formData,
          submit_result: 'success',
        },
      };

      // 使用 sendBeacon 风格的异步请求（fire-and-forget for non-critical）
      // 但我们需要等待确认，所以用 fetch
      const forwardRes = await fetch(backendUrl + '/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingPayload),
      });

      if (forwardRes.ok) {
        console.log('[Contact] Successfully forwarded to local backend');
      } else {
        console.error('[Contact] Backend forward failed:', forwardRes.status, await forwardRes.text());
      }
    } catch (forwardErr) {
      console.error('[Contact] Failed to forward to backend:', forwardErr);
    }

    // ================================================================
    // 方案2: Supabase submissions 表（如果有配置）
    // ================================================================
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      const supabaseData = {
        website_id: website_id || 'zxqconsulting',
        visitor_id: visitor_id || null,
        name: name || null,
        email: email || null,
        phone: phone || null,
        company: company || null,
        message: [
          `项目阶段: ${projectStage || '-'}`,
          `目标市场: ${targetMarkets || '-'}`,
          `时间线: ${timeline || '-'}`,
          `核心挑战: ${challenge || '-'}`,
          `预算范围: ${budget || '-'}`,
          `已有认证: ${hasValidation || '-'}`,
          `留言: ${message || '-'}`,
        ].join('\n'),
        source_page: source_page || '/',
        ip_address: ipAddress,
        country: country,
        status: 'new',
        created_at: new Date().toISOString(),
      };

      try {
        const supabaseRes = await fetch(env.SUPABASE_URL + '/rest/v1/submissions', {
          method: 'POST',
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(supabaseData),
        });

        if (!supabaseRes.ok) {
          console.error('[Contact] Supabase save failed:', supabaseRes.status, await supabaseRes.text());
        } else {
          console.log('[Contact] Supabase save success');
        }
      } catch (supabaseErr) {
        console.error('[Contact] Supabase error:', supabaseErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: '表单提交成功',
      forwarded_to: 'local_backend',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Contact] Form submission error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
