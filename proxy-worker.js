/**
 * Proxy Worker — serves zxqconsulting.com by proxying to qiangzhang2009-zxqconsulting-web1.pages.dev
 * Bypasses the expired SSL certificate on the custom domain for the Pages project.
 */

const BACKEND = 'https://qiangzhang2009-zxqconsulting-web1.pages.dev';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const backendUrl = BACKEND + url.pathname + (url.search || '');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(
            [...request.headers.entries()].filter(
              ([k]) => !['host', 'connection', 'content-length'].includes(k.toLowerCase())
            )
          ),
        },
        body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.body : undefined,
      });

      const clone = response.clone();
      const text = await clone.text();

      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || 'Proxy error', code: 'PROXY_ERROR' }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
};
