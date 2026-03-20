// Vercel API 路由 - 批量AI分析
// 快速模式：先返回可行性分析(3-5秒)，完整模式返回全部数据(15-30秒)

const FALLBACK_DEEPSEEK_API_KEY = 'sk-af7161086d14482aac4d8127002e6bcd';

export default async function handler(request, response) {
  // CORS headers - 使用 setHeader
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle OPTIONS
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
    const { market, marketEn, category, categoryEn, region } = request.body;

    if (!market || !category) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(400).json({ error: 'Missing market or category' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || FALLBACK_DEEPSEEK_API_KEY;

    // 判断是否为快速模式（只获取可行性分析）
    const fastMode = request.body.fastMode === true;

    let userMessage: string;
    let maxTokens: number;

    if (fastMode) {
      // 快速模式：只获取可行性分析，max_tokens 大幅减少
      userMessage = `Analyze ${market} market for ${category} products. 

Return ONLY valid JSON:
{"feasibility": {"heat": 50, "growth": 15, "risk": "medium", "competition": 60, "recommendation": "建议", "recommendationEn": "Recommendation", "conclusion": "结论", "conclusionEn": "Conclusion", "policyPoints": "政策要点", "policyPointsEn": "Policy Points", "threshold": "准入门槛", "thresholdEn": "Entry Threshold", "logistics": "物流渠道", "logisticsEn": "Logistics", "caseStudies": "成功案例", "caseStudiesEn": "Case Studies"}}

JSON only.`;
      maxTokens = 600;
    } else {
      // 完整模式：获取所有6个模块，使用极简提示词
      userMessage = `${market} + ${category} market analysis. Return JSON:

IMPORTANT: Use ONLY 2025 or 2026 data if available. If data is older than 1 year, do NOT include the year in any numbers - just show the raw numbers without year labels.

Insight section format (insight):
- marketSize: MUST be a number with unit like "2850亿美元" or "28.5B美元" (NO year included)
- growth: MUST be percentage like 8 or 12 (NO year included)  
- consumerInsights: Market insights without year references
- channels: Distribution channels without year references

Example insight: {"marketSize":"2850亿美元","growth":8,"consumerInsights":"消费者趋势","channels":[{"name":"电商","percentage":45}]}

Return JSON:
{"feasibility":{"heat":50,"growth":15,"risk":"medium","competition":60,"recommendation":"建议","recommendationEn":"Recommendation","conclusion":"结论","conclusionEn":"Conclusion","policyPoints":"政策","policyPointsEn":"Policy","threshold":"门槛","thresholdEn":"Threshold","logistics":"物流","logisticsEn":"Logistics","caseStudies":"案例","caseStudiesEn":"Cases"},
"cost":{"items":[{"name":"成本项","nameEn":"Cost","min":5000,"max":20000}],"timeline":{"months":12},"roi":{"expected":20}},
"compliance":{"status":"passed","score":85,"requirements":["要求"],"timeline":"时间"},
"insight":{"marketSize":"2850亿美元","growth":8,"consumerInsights":"洞察","consumerInsightsEn":"Insights","channels":[{"name":"渠道","percentage":45}]},
"risk":{"level":"medium","score":45,"warnings":["警告"]},
"channel":{"recommendation":"推荐","channels":[{"name":"渠道","rating":85,"investment":{"min":50000,"max":200000}}]}}

JSON only. Use 2025/2026 data. Never include "(2023)" or "(2024)" or any year in marketSize numbers - only show the value itself like "2850亿美元".`;
      maxTokens = 2000;
    }

    const systemPrompt = '你是专业的国际贸易咨询专家。请严格按照JSON格式返回数据。只返回JSON，不要有其他文字。';

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('[AI Batch API] API error:', res.status, error);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(res.status).json({
        error: 'AI service error',
        details: error
      });
    }

    const data = await res.json();

    console.log('[AI Batch API] API raw response:', JSON.stringify(data, null, 2));

    // 解析返回的JSON，增加容错处理
    let parsedData = {};
    try {
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        // 提取 JSON 代码块
        let jsonStr = content;
        const jsonCodeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonCodeBlockMatch) {
          jsonStr = jsonCodeBlockMatch[1];
        } else {
          // 如果没有代码块，尝试直接提取JSON
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        // 尝试解析JSON
        try {
          parsedData = JSON.parse(jsonStr);
        } catch (parseErr) {
          // 尝试移除可能的尾随逗号
          jsonStr = jsonStr.replace(/,(\s*[\]\}])/g, '$1');
          try {
            parsedData = JSON.parse(jsonStr);
          } catch (secondErr) {
            console.error('[AI Batch API] JSON parse failed after fix:', secondErr);
          }
        }
      }
    } catch (e) {
      console.error('[AI Batch API] Parse error:', e);
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });

    console.log('[AI Batch API] Parsed data:', JSON.stringify(parsedData, null, 2));

    return response.status(200).json({
      success: true,
      data: parsedData,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[AI Batch API] Error:', error);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.setHeader(key, value);
    });
    return response.status(500).json({ error: error.message });
  }
}
