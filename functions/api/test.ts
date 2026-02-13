/**
 * 测试 API 端点
 * 简单返回 JSON 数据
 */

export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    message: "API 工作正常！",
    timestamp: new Date().toISOString(),
    data: {
      pageViews: 12847,
      uniqueVisitors: 4823,
      countries: 6
    }
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}
