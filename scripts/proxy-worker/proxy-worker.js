/**
 * Proxy Worker — serves zxqconsulting.com by proxying to Cloudflare Pages.
 *
 * Architecture:
 *   Browser → Zone Worker → Pages CDN → strip beacon → clean HTML
 *
 * The Cloudflare Pages framework injects a Browser Analytics beacon script into HTML.
 * This proxy strips that beacon to avoid CORS errors on cloudflareinsights.com.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

// The Pages CDN domain — this serves as the origin for all static content
const PAGES_CDN = 'https://qiangzhang2009-zxqconsulting-web1.pages.dev';

// Remove the Browser Analytics beacon injected by Cloudflare Pages at build time
const BEACON_RE = /<!-- Cloudflare Pages Analytics --><script[^>]*><\/script>/gi;
const BEACON_COMMENT_RE = /<!-- Cloudflare Pages Analytics -->/gi;

function cleanHtml(html) {
  return html.replace(BEACON_RE, '').replace(BEACON_COMMENT_RE, '');
}

export default {
  async fetch(request, env, ctx) {
    const backend = env.BACKEND_URL || PAGES_CDN;
    const url = new URL(request.url);
    const backendUrl = backend + url.pathname + (url.search || '');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: Object.fromEntries(
          [...request.headers.entries()].filter(
            ([k]) => !['host', 'connection', 'content-length', 'cf-ray', 'cf-request-id'].includes(k.toLowerCase())
          )
        ),
        body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? request.body : undefined,
      });

      const contentType = response.headers.get('content-type') || '';

      // For HTML responses, strip the injected beacon script
      if (contentType.includes('text/html')) {
        const html = await response.text();

        if (html.includes('cloudflareinsights.com') || html.includes('Cloudflare Pages Analytics')) {
          const cleaned = cleanHtml(html);
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Content-Length', String(new TextEncoder().encode(cleaned).length));
          newHeaders.set('Access-Control-Allow-Origin', '*');
          return new Response(cleaned, { status: response.status, headers: newHeaders });
        }
      }

      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, { status: response.status, headers: newHeaders });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || 'Proxy error', code: 'PROXY_ERROR' }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
};
