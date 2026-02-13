import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Users, TrendingUp, Eye, MapPin, ArrowRight } from 'lucide-react';

// 模拟访客数据 - 可后续接入真实 Analytics
const mockVisitorData = {
  totalVisitors: 12847,
  countries: 38,
  onlineNow: 23,
  topCountries: [
    { code: 'CN', name: '中国', nameEn: 'China', flag: '🇨🇳', percentage: 45, visitors: 5781 },
    { code: 'US', name: '美国', nameEn: 'USA', flag: '🇺🇸', percentage: 20, visitors: 2569 },
    { code: 'JP', name: '日本', nameEn: 'Japan', flag: '🇯🇵', percentage: 12, visitors: 1542 },
    { code: 'GB', name: '英国', nameEn: 'UK', flag: '🇬🇧', percentage: 8, visitors: 1028 },
    { code: 'CA', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', percentage: 5, visitors: 642 },
    { code: 'AU', name: '澳洲', nameEn: 'Australia', flag: '🇦🇺', percentage: 4, visitors: 514 },
    { code: 'DE', name: '德国', nameEn: 'Germany', flag: '🇩🇪', percentage: 3, visitors: 385 },
    { code: 'OTHER', name: '其他', nameEn: 'Other', flag: '🌍', percentage: 3, visitors: 386 },
  ],
  popularPages: [
    { name: '国际市场进入策略', views: 4230 },
    { name: '日本市场布局', views: 3150 },
    { name: '中医药出海', views: 2890 },
    { name: '欧洲合规服务', views: 2150 },
    { name: '联系我们', views: 1870 },
  ],
};

const VisitorStats = () => {
  const { t, i18n } = useTranslation();
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedOnline, setAnimatedOnline] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('visitor-stats');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // 数字动画效果
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedTotal(Math.floor(mockVisitorData.totalVisitors * easeOut));
      setAnimatedOnline(Math.floor(mockVisitorData.onlineNow * (0.5 + Math.random() * 0.5 * easeOut)));

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedTotal(mockVisitorData.totalVisitors);
        setAnimatedOnline(mockVisitorData.onlineNow);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  const getCountryName = (item: typeof mockVisitorData.topCountries[0]) => {
    if (i18n.language === 'zh') {
      return item.name;
    }
    return item.nameEn;
  };

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
            <span className="text-cyan-400 text-sm font-medium">{t('stats.globalReach', '全球覆盖')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('stats.visitorTitle', '全球访客统计数据')}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t('stats.visitorDesc', '来自全球各地的企業選擇我們的出海服務')}
          </p>
        </div>

        {/* 核心数字 */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12">
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              {animatedTotal.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">
              {t('stats.totalVisitors', '累计访问')}
            </div>
          </div>

          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
              {mockVisitorData.countries}+
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
              {animatedOnline}
            </div>
            <div className="text-slate-400 text-sm">
              {t('stats.onlineNow', '在线访客')}
            </div>
          </div>
        </div>

        {/* 国家分布和热门页面 */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* 国家分布 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              {t('stats.countryDist', '国家/地区分布')}
            </h3>
            <div className="space-y-4">
              {mockVisitorData.topCountries.map((country, index) => (
                <div key={country.code} className="flex items-center gap-3">
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-sm">{getCountryName(country)}</span>
                      <span className="text-slate-400 text-xs">{country.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                        style={{
                          width: isVisible ? `${country.percentage}%` : '0%',
                          transitionDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 热门页面 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              {t('stats.popularPages', '热门页面')}
            </h3>
            <div className="space-y-3">
              {mockVisitorData.popularPages.map((page, index) => (
                <div
                  key={page.name}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold text-sm w-6">#{index + 1}</span>
                    <span className="text-slate-200">{page.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{page.views.toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 数据更新时间 */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {t('stats.lastUpdate', '数据实时更新中 · 最后更新')}: {new Date().toLocaleString('zh-CN')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default VisitorStats;
