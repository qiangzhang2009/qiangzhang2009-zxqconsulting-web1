// Vercel API 路由 - AI营销内容生成
//
// 重要：DeepSeek API Key 必须通过环境变量 DEEPSEEK_API_KEY 注入。
// 代码中严禁硬编码密钥或提供 fallback 占位符。

export default async function handler(request, response) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(200).send('');
  }

  if (request.method !== 'POST') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { market, marketEn, category, categoryEn, productName, tone, language } = request.body;

    if (!market || !category) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(400).json({ error: 'Missing market or category' });
    }

    // 强制从环境变量读取，缺失时返回明确错误（无 fallback 占位）
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(500).json({
        error: 'Server misconfiguration: DEEPSEEK_API_KEY is not set. Please configure it in Vercel environment variables.',
      });
    }
    const prodName = productName || category;
    const normalizedLanguage = (language || 'zh').split('-')[0].toLowerCase();
    const languageInstruction = normalizedLanguage === 'zh'
      ? 'Chinese (Simplified)'
      : `Primarily ${normalizedLanguage}, with natural English fallback where needed`;

    const userMessage = `Generate multi-platform marketing content for ${prodName} (${category}) entering ${market} market.
    
Tone: ${tone || 'professional'}
Language: ${languageInstruction}

Generate content for 6 platforms:

1. Social Post (LinkedIn/Facebook):
- Content: 100-150 Chinese characters, engaging post about market opportunity
- Hashtags: 5 relevant hashtags

2. Xiaohongshu Post:
- Title: Attention-grabbing title
- Content: 200-300 Chinese characters with emojis
- Tags: 5 relevant tags

3. Website Hero Copy:
- Hero Title: Professional headline
- Hero Subtitle: Value proposition
- 3 Value propositions
- CTA button text

4. B2B Email:
- Subject (English)
- Subject (Chinese)
- Body: 150-200 words in English

5. SEO Content:
- Meta Title
- Meta Description  
- 5 Keywords
- Content outline (5 H2 headings)

6. Press Release:
- Headline
- Subheadline
- Lead paragraph
- Body (2-3 paragraphs)
- Boilerplate
- Contact info

Return JSON format:
{
  "social": {"content": "", "hashtags": []},
  "xiaohongshu": {"title": "", "content": "", "tags": []},
  "website": {"heroTitle": "", "heroSubtitle": "", "valueProps": [{"title": "", "desc": ""}], "cta": ""},
  "email": {"subject": "", "subjectCn": "", "body": ""},
  "seo": {"metaTitle": "", "metaDescription": "", "keywords": [], "contentOutline": []},
  "pr": {"headline": "", "subheadline": "", "lead": "", "body": "", "boilerplate": "", "contact": ""}
}

JSON only. No other text.`;

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `你是专业的营销文案专家。请严格按照JSON格式返回数据。只返回JSON，不要有其他文字。当前输出语言偏好: ${normalizedLanguage}。` },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('[AI Marketing API] API error:', res.status, error);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(res.status).json({
        error: 'AI service error',
        details: error
      });
    }

    const data = await res.json();
    console.log('[AI Marketing API] API response received');

    // 解析返回的JSON
    let parsedData = {};
    try {
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        let jsonStr = content;
        const jsonCodeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonCodeBlockMatch) {
          jsonStr = jsonCodeBlockMatch[1];
        } else {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        try {
          parsedData = JSON.parse(jsonStr);
        } catch (parseErr) {
          jsonStr = jsonStr.replace(/,(\s*[\]\}])/g, '$1');
          try {
            parsedData = JSON.parse(jsonStr);
          } catch (secondErr) {
            console.error('[AI Marketing API] JSON parse failed:', secondErr);
          }
        }
      }
    } catch (e) {
      console.error('[AI Marketing API] Parse error:', e);
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    return response.status(200).json({
      success: true,
      data: parsedData,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Marketing API] Error:', error);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(500).json({ error: error.message });
  }
}
