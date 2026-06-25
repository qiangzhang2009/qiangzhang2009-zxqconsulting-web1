/**
 * Cloudflare Pages Worker — serves as a clean reverse proxy.
 *
 * Problem: Cloudflare Pages injects a Browser Analytics beacon script into HTML at build
 * time. The beacon calls cloudflareinsights.com which returns 404, causing CORS errors.
 *
 * Solution: This worker fetches HTML from the Pages CDN origin, strips the beacon
 * injection, and serves clean HTML. API routes are proxied to the api-worker.
 */

const PAGES_CDN = 'https://48c974ba.qiangzhang2009-zxqconsulting-web1.pages.dev';
const API_WORKER = 'https://zxqconsulting.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

// Match the injected script: <!-- comment --><script beacon.min.js data-cf-beacon=...></script>
const BEACON_SCRIPT_RE = /<!-- Cloudflare Pages Analytics --><script[^>]*><\/script>/gi;
const BEACON_COMMENT_RE = /<!-- Cloudflare Pages Analytics -->/gi;
const RADAR_BEACON_RE = /src="https:\/\/performance\.radar\.cloudflare\.com\/beacon\.js"[^>]*>/gi;

function cleanHtml(html) {
  return html
    .replace(BEACON_SCRIPT_RE, '')
    .replace(BEACON_COMMENT_RE, '')
    .replace(RADAR_BEACON_RE, '')
    .replace(/\s{2,}/g, ' ');
}

export async function onRequest(context) {
  const { request } = context;
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
      const newHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS };
      return new Response(data, { status: res.status, headers: newHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'API proxy error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  }

  // HTML pages → fetch from CDN, strip beacon, serve clean
  try {
    const headers = {};
    request.headers.forEach((v, k) => {
      if (!['host', 'connection', 'content-length', 'cf-ray', 'cf-request-id', 'cf-connecting-ip'].includes(k.toLowerCase())) {
        headers[k] = v;
      }
    });

    const res = await fetch(`${PAGES_CDN}${path}${url.search}`, {
      method: request.method,
      headers,
      body: request.body,
    });

    const contentType = res.headers.get('content-type') || '';
    const status = res.status;

    // Non-HTML → pass through (JS, CSS, images, etc.)
    if (!contentType.includes('text/html')) {
      return new Response(res.body, { status, headers: res.headers });
    }

    const html = await res.text();

    // If beacon is present, strip it
    if (html.includes('cloudflareinsights.com') || html.includes('Cloudflare Pages Analytics') || html.includes('performance.radar.cloudflare.com')) {
      const cleaned = cleanHtml(html);
      const newHeaders = new Headers(res.headers);
      newHeaders.set('Content-Length', String(new TextEncoder().encode(cleaned).length));
      return new Response(cleaned, { status, headers: newHeaders });
    }

    return new Response(res.body, { status, headers: res.headers });
  } catch (e) {
    return new Response('Service temporarily unavailable', { status: 503 });
  }
}
