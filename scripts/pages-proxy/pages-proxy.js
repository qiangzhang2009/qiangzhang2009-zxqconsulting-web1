/**
 * zxqconsulting-pages-proxy — Zone-level Worker that removes Cloudflare Browser Analytics beacon.
 *
 * Architecture:
 *   Browser → Zone Worker → Pages CDN (bypassing cache) → strip beacon → clean HTML
 *
 * The beacon is injected into HTML at Pages build time and cached at CDN edge.
 * By fetching from the CDN with cache-bypass, we always get fresh HTML and can strip
 * the beacon before it reaches the browser.
 *
 * Route: zone-level, attached to zxqconsulting.com/*
 */

const PAGES_CDN = 'https://qiangzhang2009-zxqconsulting-web1.pages.dev';
const API_WORKER = 'https://zxqconsulting.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

// Remove the Browser Analytics beacon injected by Cloudflare Pages at build time
const BEACON_RE = /<!-- Cloudflare Pages Analytics --><script[^>]*><\/script>/gi;
const BEACON_COMMENT_RE = /<!-- Cloudflare Pages Analytics -->/gi;

function cleanHtml(html) {
  return html.replace(BEACON_RE, '').replace(BEACON_COMMENT_RE, '');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // API routes → proxy to the API Worker
    if (path.startsWith('/api/')) {
      try {
        const headers = {};
        request.headers.forEach((v, k) => {
          if (!['host', 'connection', 'content-length', 'cf-ray', 'cf-request-id', 'cf-connecting-ip'].includes(k.toLowerCase())) {
            headers[k] = v;
          }
        });
        const res = await fetch(`${API_WORKER}${path}${url.search}`, {
          method: request.method,
          headers: { 'Content-Type': 'application/json', ...headers },
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        });
        const data = await res.text();
        return new Response(data, {
          status: res.status,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'API proxy error' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // HTML pages → fetch from Pages CDN, strip beacon
    try {
      const headers = {};
      request.headers.forEach((v, k) => {
        if (!['host', 'connection', 'content-length', 'cf-ray', 'cf-request-id', 'cf-connecting-ip'].includes(k.toLowerCase())) {
          headers[k] = v;
        }
      });

      // Bypass CDN cache by using Cache-Control: no-cache
      // This ensures we get the latest HTML from Pages origin (not cached edge response)
      const fetchReq = new Request(`${PAGES_CDN}${path}${url.search}`, {
        method: request.method,
        headers,
        body: request.body,
      });
      fetchReq.headers.set('Cache-Control', 'no-cache');

      const res = await fetch(fetchReq);
      const contentType = res.headers.get('content-type') || '';

      if (!contentType.includes('text/html')) {
        return new Response(res.body, { status: res.status, headers: res.headers });
      }

      const html = await res.text();

      if (html.includes('cloudflareinsights.com') || html.includes('Cloudflare Pages Analytics')) {
        const cleaned = cleanHtml(html);
        const newHeaders = new Headers(res.headers);
        newHeaders.set('Content-Length', String(new TextEncoder().encode(cleaned).length));
        return new Response(cleaned, { status: res.status, headers: newHeaders });
      }

      return new Response(res.body, { status: res.status, headers: res.headers });
    } catch (e) {
      return new Response('Service unavailable', { status: 503 });
    }
  },
};
