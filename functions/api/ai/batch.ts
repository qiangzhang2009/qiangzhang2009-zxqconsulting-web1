/**
 * AI 批量分析 API - 市场分析工具专用
 * 提供可行性、成本、合规、洞察、渠道、风险六大模块的数据
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
        console.log(`[AI Batch] Attempt ${i + 1} failed, retrying in ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY * (i + 1));
        continue;
      }

      return response;
    } catch (error) {
      if (i < retries - 1) {
        console.log(`[AI Batch] Network error, retry ${i + 1}/${retries}:`, error);
        await sleep(RETRY_DELAY * (i + 1));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Prompt 模板
const PROMPTS = {
  feasibility: (market: string, marketEn: string, category: string, categoryEn: string) =>
    `请作为中医药/健康产品出海市场分析专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的市场准入可行性分析。请返回JSON格式的数据，包含以下字段：{"heat": 0-100的市场热度评分,"growth": 预期的年增长率(0-100),"risk": "low"或"medium"或"high"的风险等级,"competition": 0-100的竞争激烈程度,"recommendation": 简短的中文推荐建议,"recommendationEn": 简短英文推荐,"conclusion": 中文总结,"conclusionEn": 英文总结,"policyPoints": 中文政策要点,"policyPointsEn": 英文政策要点,"threshold": 中文准入门槛,"thresholdEn": 英文准入门槛,"logistics": 中文物流要点,"logisticsEn": 英文物流要点,"caseStudies": 中文案例,"caseStudiesEn": 英文案例}只返回JSON。`,

  cost: (market: string, marketEn: string, category: string, categoryEn: string) =>
    `请作为成本测算专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的成本测算。请返回JSON格式：{"items": [{"name": "成本项","nameEn":"Item","min": 1000,"max": 5000,"description":"说明","descriptionEn":"Desc"}],"timeline": {"months": 12,"phases": ["阶段1"],"phasesEn": ["Phase 1"]},"roi": {"expected": 20,"payback":"12个月","paybackEn":"12 months"}}只返回JSON。`,

  compliance: (market: string, marketEn: string, category: string, categoryEn: string) =>
    `请作为合规专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的合规评估。请返回JSON格式：{"status": "passed","score": 85,"requirements": ["要求1"],"requirementsEn": ["Req 1"],"documents": ["文件1"],"documentsEn": ["Doc 1"],"timeline": "时间线","timelineEn":"Timeline","warnings": ["警告1"],"warningsEn": ["Warning 1"],"tips": ["建议1"],"tipsEn": ["Tip 1"]}只返回JSON。`,

  insight: (market: string, marketEn: string, category: string, categoryEn: string) =>
    `请作为市场洞察专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的洞察。请返回JSON格式：{"marketSize": "约50亿美元","growth": 15,"ageGroups": [{"range": "18-25岁","rangeEn": "18-25","percentage": 20}],"channels": [{"name": "线上电商","nameEn": "Online","percentage": 45}],"competitors": [{"name": "品牌A","nameEn": "Brand A","share": 25}],"trends": ["趋势1"],"trendsEn": ["Trend 1"],"consumerInsights": "消费者洞察","consumerInsightsEn": "Insights"}只返回JSON。`,

  channel: (market: string, marketEn: string, category: string, categoryEn: string) =>
    `请作为渠道专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的渠道推荐。请返回JSON格式：{"channels": [{"name": "电商","nameEn": "E-commerce","type": "online","rating": 85,"investment": {"min": 10000,"max": 50000},"pros": ["优势1"],"prosEn": ["Pro 1"],"cons": ["劣势1"],"consEn": ["Con 1"],"description": "描述","descriptionEn": "Desc"}],"recommendation": "推荐","recommendationEn": "Recommendation"}只返回JSON。`,

  risk: (market: string, marketEn: string, category: string, categoryEn: string) =>
    `请作为风险管理专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的风险预警。请返回JSON格式：{"level": "medium","score": 45,"factors": [{"name": "风险因素","nameEn": "Risk","impact": "negative","description": "描述","descriptionEn": "Desc"}],"warnings": ["警告1"],"warningsEn": ["Warning 1"],"mitigations": ["缓解措施1"],"mitigationsEn": ["Mitigation 1"],"trend": "stable"}只返回JSON。`,
};

// 调用 DeepSeek API 获取单个模块数据
async function fetchModule(toolType: string, market: string, marketEn: string, category: string, categoryEn: string, apiKey: string): Promise<any> {
  const promptFn = PROMPTS[toolType as keyof typeof PROMPTS];
  if (!promptFn) return null;

  const prompt = promptFn(market, marketEn, category, categoryEn);

  const response = await fetchWithRetry('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是专业的国际贸易咨询专家。请严格按照JSON格式返回数据。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  }, MAX_RETRIES);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI Batch] DeepSeek API error for ${toolType}:`, response.status, errorText);
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content;
  if (!aiMessage) throw new Error('No response from AI');

  // 提取 JSON
  const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON解析失败');

  return JSON.parse(jsonMatch[0]);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  console.log('[AI Batch] Request received');

  const apiKey = env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('[AI Batch] Missing DEEPSEEK_API_KEY');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key', success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const {
      market,
      marketEn,
      category,
      categoryEn,
      region,
      priority = 'full'
    } = body;

    if (!market || !category) {
      return new Response(JSON.stringify({ error: 'Missing market or category', success: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[AI Batch] Processing: ${market}/${category}, priority: ${priority}`);

    const result: Record<string, any> = {};

    // feasibility 模块 (优先级最高)
    result.feasibility = await fetchModule('feasibility', market, marketEn, category, categoryEn, apiKey);

    // 如果是 full 优先级，获取其余模块
    if (priority === 'full') {
      const otherModules = ['cost', 'compliance', 'insight', 'channel', 'risk'];

      // 并发获取其余模块
      const results = await Promise.allSettled(
        otherModules.map(toolType => fetchModule(toolType, market, marketEn, category, categoryEn, apiKey))
      );

      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          result[otherModules[i]] = r.value;
        }
      });
    }

    console.log(`[AI Batch] Success: ${Object.keys(result).join(', ')}`);

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('[AI Batch] Error:', error);

    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      success: false,
      retry: true
    }), {
      status: 503,
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
