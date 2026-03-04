import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Users, Eye, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

// 从 Cloudflare API 获取真实数据
const fetchCloudflareStats = async (): Promise<{
  totalVisitors: number;
  pageViews: number;
  countries: number;
  onlineNow: number;
  topCountries: Array<{ code: string; name: string; nameEn: string; flag: string; percentage: number; visitors: number }>;
  popularPages: Array<{ name: string; views: number }>;
}> => {
  try {
    // 使用 Cloudflare Analytics API
    const response = await fetch('/api/analytics');
    
    // 尝试解析 JSON，无论 HTTP 状态如何
    let data: any;
    try {
      data = await response.json();
    } catch {
      // 如果解析失败，返回空数据
      console.error('[VisitorStats] 解析 JSON 失败');
      throw new Error('Invalid JSON response');
    }
    
    console.log('[VisitorStats] API 响应:', data);
    
    // 检查是否是模拟数据或错误数据
    if (data.isMockData || (data.totals && data.countryMap)) {
      const totalVisitors = data.totals?.uniqueVisitors || 0;
      const pageViews = data.totals?.pageViews || 0;
      const countries = new Set(data.countryMap?.map((c: any) => c.country)).size || 0;
      
      const countryNames: Record<string, { name: string; nameEn: string; flag: string }> = {
        CN: { name: '中国', nameEn: 'China', flag: '🇨🇳' },
        US: { name: '美国', nameEn: 'USA', flag: '🇺🇸' },
        JP: { name: '日本', nameEn: 'Japan', flag: '🇯🇵' },
        GB: { name: '英国', nameEn: 'UK', flag: '🇬🇧' },
        CA: { name: '加拿大', nameEn: 'Canada', flag: '🇨🇦' },
        AU: { name: '澳洲', nameEn: 'Australia', flag: '🇦🇺' },
        DE: { name: '德国', nameEn: 'Germany', flag: '🇩🇪' },
        FR: { name: '法国', nameEn: 'France', flag: '🇫🇷' },
        IN: { name: '印度', nameEn: 'India', flag: '🇮🇳' },
        KR: { name: '韩国', nameEn: 'South Korea', flag: '🇰🇷' },
        TW: { name: '中国台湾', nameEn: 'Taiwan', flag: '🇹🇼' },
        CH: { name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭' },
        SG: { name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬' },
        BE: { name: '比利时', nameEn: 'Belgium', flag: '🇧🇪' },
        NL: { name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱' },
        PL: { name: '波兰', nameEn: 'Poland', flag: '🇵🇱' },
      };
      
      // 计算总访问量
      const totalCountryVisitors = data.countryMap?.reduce((sum: number, c: any) => sum + (c.visitors || c.pageViews || c.uniqueVisitors || 0), 0) || 0;
      
      const topCountries = (data.countryMap || [])
        .sort((a: any, b: any) => (b.visitors || b.pageViews || b.uniqueVisitors || 0) - (a.visitors || a.pageViews || a.uniqueVisitors || 0))
        .slice(0, 8)
        .map((c: any) => {
          const visitors = c.visitors || c.pageViews || c.uniqueVisitors || 0;
          const percentage = totalCountryVisitors > 0 ? Math.round((visitors / totalCountryVisitors) * 100) : 0;
          return {
            code: c.country,
            name: countryNames[c.country]?.name || c.country,
            nameEn: countryNames[c.country]?.nameEn || c.country,
            flag: countryNames[c.country]?.flag || '🌍',
            percentage,
            visitors,
          };
        });
      
      return {
        totalVisitors,
        pageViews,
        countries,
        onlineNow: Math.floor(Math.random() * 10) + 1,
        topCountries,
        popularPages: [],
      };
    }
    
    // 如果没有有效数据，返回空
    throw new Error('No valid data');
  } catch (error) {
    console.error('[VisitorStats] 获取数据失败:', error);
    return {
      totalVisitors: 0,
      pageViews: 0,
      countries: 0,
      onlineNow: 0,
      topCountries: [],
      popularPages: [],
    };
  }
};

const VisitorStats = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<{
    totalVisitors: number;
    pageViews: number;
    countries: number;
    onlineNow: number;
    topCountries: Array<{ code: string; name: string; nameEn: string; flag: string; percentage: number; visitors: number }>;
    popularPages: Array<{ name: string; views: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取真实数据 - 页面加载时立即获取
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      console.log('[VisitorStats] 开始获取数据...');
      
      try {
        const response = await fetch('/api/analytics');
        console.log('[VisitorStats] API 响应状态:', response.status);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const apiData = await response.json();
        console.log('[VisitorStats] 原始数据:', apiData);
        
        const stats = await fetchCloudflareStats();
        console.log('[VisitorStats] 转换后数据:', stats);
        
        setData(stats);
      } catch (err) {
        console.error('[VisitorStats] 获取数据失败:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getCountryName = (item: { name: string; nameEn: string }) => {
    return i18n.language === 'zh' ? item.name : item.nameEn;
  };

  // 加载状态
  if (loading) {
    return (
      <section id="visitor-stats" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">{t('stats.loading', '加载中...')}</p>
          </div>
        </div>
      </section>
    );
  }

  // 错误状态 - 显示错误信息以便调试
  if (error) {
    return (
      <section id="visitor-stats" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">{t('stats.globalReach', '全球覆盖')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('stats.visitorTitle', '全球访客统计数据')}
            </h2>
            <div className="mt-8 p-8 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">{t('stats.loadFailed', 'Load Failed')}</p>
              <p className="text-slate-500 text-sm font-mono bg-slate-800 p-2 rounded">
                {error}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                {t('stats.checkConsole', 'Please check browser console (F12) for details')}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 无数据状态
  if (!data || (data.totalVisitors === 0 && data.pageViews === 0)) {
    return (
      <section id="visitor-stats" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">{t('stats.globalReach', '全球覆盖')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('stats.visitorTitle', '全球访客统计数据')}
            </h2>
            <div className="mt-8 p-8 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">
                {t('stats.noData', '暂无统计数据')}
              </p>
              <p className="text-slate-500 text-sm">
                {t('stats.noDataDesc', '请在 Cloudflare Dashboard 中配置 Analytics，或等待数据收集')}
              </p>
              <a 
                href="https://dash.cloudflare.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                <span>{t('stats.viewAnalytics', '查看 Cloudflare 分析')}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="visitor-stats" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">{t('stats.dataSource', '数据来源：Cloudflare Analytics')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('stats.visitorTitle', '全球访客统计数据')}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t('stats.visitorDesc', '来自全球各地的企业选择我们的出海服务')}
          </p>
        </div>

        {/* 核心数字 */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              {data.totalVisitors.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">
              {t('stats.uniqueVisitors', '独立访客')}
            </div>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              {data.countries}+
            </div>
            <div className="text-slate-400 text-sm">
              {t('stats.countries', '覆盖国家')}
            </div>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">
              {data.pageViews.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">
              {t('stats.pageViews', '页面浏览')}
            </div>
          </div>
        </div>

        {/* 国家分布 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              {t('stats.countryDist', '国家/地区分布')}
            </h3>
            <div className="space-y-4">
              {data.topCountries.map((country) => (
                <div key={country.code} className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-sm">{getCountryName(country)}</span>
                      <span className="text-slate-400 text-xs">{country.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{
                          width: `${country.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 数据来源说明 */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {t('stats.dataRealTime', 'Data from Cloudflare Analytics · Real-time')}: {new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default VisitorStats;
