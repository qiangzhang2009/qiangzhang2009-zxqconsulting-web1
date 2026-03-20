// Vercel API 路由 - AI Chat
// 使用 DeepSeek API

const FALLBACK_DEEPSEEK_API_KEY = 'sk-af7161086d14482aac4d8127002e6bcd';

export default async function handler(req, res) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).send('');
  }

  if (req.method !== 'POST') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const { messages, model = 'deepseek-chat', temperature = 0.7, max_tokens = 800 } = body;

    if (!messages || !Array.isArray(messages)) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(400).json({ error: 'Missing or invalid messages parameter' });
    }

    // 使用环境变量或 fallback
    const apiKey = process.env.DEEPSEEK_API_KEY || FALLBACK_DEEPSEEK_API_KEY;

    if (!apiKey) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(500).json({ error: 'Server configuration error: Missing API key' });
    }

    // 调用 DeepSeek API
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是中医药产品出海咨询专家。请用专业但易懂的语言回答用户问题。只返回纯文本，不要使用Markdown格式符号。涉及台湾地区时必须表述为"中国台湾"，涉及香港地区时必须表述为"中国香港"。' },
          ...messages,
        ],
        temperature,
        max_tokens,
      }),
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      console.error('[AI API] error:', apiResponse.status, error);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return res.status(apiResponse.status).json({
        error: 'AI service error',
        details: error,
        status: apiResponse.status
      });
    }

    const data = await apiResponse.json();

    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json(data);

  } catch (error) {
    console.error('[AI API] Error:', error);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(500).json({ error: error.message });
  }
}
