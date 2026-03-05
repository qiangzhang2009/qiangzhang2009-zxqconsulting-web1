/**
 * Cloudflare Pages API Worker
 * 处理 /api/* 路由
 */

import track from './functions/api/track';
import visitors from './functions/api/visitors';
import contact from './functions/api/contact';
import analytics from './functions/api/admin/analytics';
import adminVisitors from './functions/api/admin/visitors';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 路由匹配
    if (path === '/api/track' && request.method === 'POST') {
      return await track.onRequestPost(context);
    }
    
    if (path === '/api/visitors' && request.method === 'PUT') {
      return await visitors.onRequestPut(context);
    }
    
    if (path === '/api/contact' && request.method === 'POST') {
      return await contact.onRequestPost(context);
    }
    
    if (path === '/api/admin/analytics' && request.method === 'GET') {
      return await analytics.onRequestGet(context);
    }
    
    if (path === '/api/admin/visitors' && request.method === 'GET') {
      return await adminVisitors.onRequestGet(context);
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
