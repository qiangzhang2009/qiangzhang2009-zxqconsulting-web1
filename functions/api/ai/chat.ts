/**
 * AI 聊天代理 API
 * 通过 Cloudflare Worker 代理 DeepSeek API，保护 API 密钥不暴露在前端
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries: number = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if ((response.status >= 500 || response.status === 429) && i < retries - 1) {
        console.log(`[AI Proxy] Attempt ${i + 1} failed, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (i + 1));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i < retries - 1) {
        console.log(`[AI Proxy] Network error, retry ${i + 1}/${retries}:`, error);
        await sleep(RETRY_DELAY * (i + 1));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  console.log('[AI Proxy] Request received');
  
  const apiKey = env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error('[AI Proxy] Missing DEEPSEEK_API_KEY');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  console.log('[AI Proxy] API key configured:', !!apiKey);

  try {
    const body = await request.json();
    const { 
      messages, 
      model = 'deepseek-chat', 
      temperature = 0.7, 
      max_tokens = 2048 
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid messages parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AI Proxy] Calling DeepSeek API...');
    
    const response = await fetchWithRetry('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    }, MAX_RETRIES);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Proxy] DeepSeek API error:', response.status, errorText);
      
      let errorMessage = 'AI service error';
      if (response.status === 401) {
        errorMessage = 'AI service authentication failed - check API key';
      } else if (response.status === 429) {
        errorMessage = 'AI service rate limit exceeded';
      } else if (response.status >= 500) {
        errorMessage = 'AI service temporarily unavailable';
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('[AI Proxy] Success! Got response');
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[AI Proxy] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      retry: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
