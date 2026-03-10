// Vercel API 路由 - 网站分析
// GET /api/analytics

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // 返回模拟数据 - 如果需要真实数据，可以在 Vercel 后台配置环境变量
  // 或者集成其他分析服务如 Google Analytics, Plausible 等
  
  const mockData = {
    isMockData: true,
    message: "Configure SUPABASE_URL and SUPABASE_ANON_KEY for real analytics data",
    totals: { 
      pageViews: 12847, 
      uniqueVisitors: 4823, 
      requests: 35621 
    },
    countryMap: [
      { country: "CN", visitors: 2102, percentage: 43.6 },
      { country: "US", visitors: 923, percentage: 19.1 },
      { country: "AU", visitors: 487, percentage: 10.1 },
      { country: "JP", visitors: 324, percentage: 6.7 },
      { country: "GB", visitors: 289, percentage: 6.0 },
      { country: "DE", visitors: 198, percentage: 4.1 }
    ]
  };

  // 如果配置了 Supabase，尝试从数据库获取真实数据
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      // 获取访客数量
      const visitorsResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.zxqconsulting`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
          }
        }
      );
      
      // 获取表单提交数量
      const submissionsResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.zxqconsulting`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
          }
        }
      );

      if (visitorsResponse.ok && submissionsResponse.ok) {
        const visitors = await visitorsResponse.json();
        const submissions = await submissionsResponse.json();
        
        return new Response(JSON.stringify({
          isRealData: true,
          totals: { 
            pageViews: visitors.length * 10 || 100,
            uniqueVisitors: visitors.length || 0, 
            requests: submissions.length || 0 
          },
          countryMap: mockData.countryMap
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    } catch (error) {
      console.error('[Analytics API] Database error:', error);
    }
  }

  return new Response(JSON.stringify(mockData), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders },
  });
}
