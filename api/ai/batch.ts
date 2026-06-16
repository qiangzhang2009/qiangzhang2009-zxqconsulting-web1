/**
 * Vercel API 路由 - AI 批量分析
 * 快速模式（phase='priority'）：只返回可行性分析（3-5 秒）
 * 完整模式（phase='full'）：返回全部 6 个模块（15-30 秒）
 *
 * 重要：DeepSeek API Key 必须通过环境变量 DEEPSEEK_API_KEY 注入。
 * 代码中严禁硬编码密钥或提供 fallback 占位符。
 */

function getApiKeyOrError() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      error: {
        status: 500,
        body: {
          error: 'Server misconfiguration: DEEPSEEK_API_KEY is not set. Please configure it in Vercel environment variables.',
        },
      },
    };
  }
  return { apiKey };
}

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
    const { market, marketEn, category, categoryEn, region, language } = request.body;

    if (!market || !category) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(400).json({ error: 'Missing market or category' });
    }

    const keyResult = getApiKeyOrError();
    if (keyResult.error) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.setHeader(key, value);
      });
      return response.status(keyResult.error.status).json(keyResult.error.body);
    }
    const apiKey = keyResult.apiKey;

    // 判断加载阶段：priority=快速可行性 / full=完整 6 模块
    const phase = request.body.phase === 'priority' || request.body.priority === 'priority' || request.body.fastMode === true
      ? 'priority'
      : 'full';

    let userMessage: string;
    let maxTokens: number;
    const normalizedLanguage = (language || 'zh').split('-')[0].toLowerCase();
    const isChineseOutput = normalizedLanguage === 'zh';

    if (phase === 'priority') {
      // 快速模式：只获取可行性分析，max_tokens 大幅减少
      userMessage = `Analyze ${market} market for ${category} products and return content tailored for ${normalizedLanguage} UI users.

Return ONLY valid JSON:
{"feasibility": {"heat": 50, "growth": 15, "risk": "medium", "competition": 60, "recommendation": "${isChineseOutput ? '建议' : 'Recommendation'}", "recommendationEn": "Recommendation", "conclusion": "${isChineseOutput ? '结论' : 'Conclusion'}", "conclusionEn": "Conclusion", "policyPoints": "${isChineseOutput ? '政策要点' : 'Policy Points'}", "policyPointsEn": "Policy Points", "threshold": "${isChineseOutput ? '准入门槛' : 'Entry Threshold'}", "thresholdEn": "Entry Threshold", "logistics": "${isChineseOutput ? '物流渠道' : 'Logistics'}", "logisticsEn": "Logistics", "caseStudies": "${isChineseOutput ? '成功案例' : 'Case Studies'}", "caseStudiesEn": "Case Studies"}}

JSON only.`;
      maxTokens = 600;
    } else {
      // 完整模式：获取所有6个模块，使用极简提示词
      userMessage = `${market} + ${category} market analysis for ${normalizedLanguage} UI users. Return JSON:

IMPORTANT:
- Fill both localized fields and English fallback fields.
- If language is zh, Chinese fields should be native Chinese.
- If language is not zh, localized display fields should prefer the target language or natural English, and corresponding *En fields must also be valid English.
- Use ONLY 2025 or 2026 data if available. If data is older than 1 year, do NOT include the year in any numbers - just show the raw numbers without year labels.

Insight section format (insight):
- marketSize: MUST be a number with unit like "2850亿美元" or "28.5B USD" (NO year included)
- growth: MUST be percentage like 8 or 12 (NO year included)
- consumerInsights: Market insights without year references
- channels: Distribution channels without year references

Example insight: {"marketSize":"2850亿美元","growth":8,"consumerInsights":"消费者趋势","channels":[{"name":"电商","percentage":45}]}

Return JSON:
{"feasibility":{"heat":50,"growth":15,"risk":"medium","competition":60,"recommendation":"建议","recommendationEn":"Recommendation","conclusion":"结论","conclusionEn":"Conclusion","policyPoints":"政策","policyPointsEn":"Policy","threshold":"门槛","thresholdEn":"Threshold","logistics":"物流","logisticsEn":"Logistics","caseStudies":"案例","caseStudiesEn":"Cases"},
"cost":{"items":[{"name":"成本项","nameEn":"Cost","min":5000,"max":20000,"description":"说明","descriptionEn":"Description"}],"timeline":{"months":12,"phases":["阶段1"],"phasesEn":["Phase 1"]},"roi":{"expected":20,"payback":"12个月","paybackEn":"12 months"}},
"compliance":{"status":"passed","score":85,"requirements":["要求"],"requirementsEn":["Requirement"],"documents":["文件"],"documentsEn":["Document"],"timeline":"时间","timelineEn":"Timeline","warnings":["警告"],"warningsEn":["Warning"],"tips":["建议"],"tipsEn":["Tip"]},
"insight":{"marketSize":"2850亿美元","growth":8,"consumerInsights":"洞察","consumerInsightsEn":"Insights","channels":[{"name":"渠道","nameEn":"Channel","percentage":45}]},
"risk":{"level":"medium","score":45,"warnings":["警告"],"warningsEn":["Warning"]},
"channel":{"recommendation":"推荐","recommendationEn":"Recommendation","channels":[{"name":"渠道","nameEn":"Channel","rating":85,"investment":{"min":50000,"max":200000}}]}}

JSON only. Use 2025/2026 data. Never include "(2023)" or "(2024)" or any year in marketSize numbers - only show the value itself like "2850亿美元".`;
      maxTokens = 2000;
    }

    const systemPrompt = `你是专业的国际贸易咨询专家。请严格按照JSON格式返回数据。只返回JSON，不要有其他文字。当前输出语言偏好: ${normalizedLanguage}。请同时尽量补全英文回退字段（*En）。`;

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
