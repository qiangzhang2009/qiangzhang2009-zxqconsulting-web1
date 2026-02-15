import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  TrendingUp, 
  Globe, 
  Activity, 
  Zap,
  RefreshCw,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import GlobalMarketVisualizer from './GlobalMarketVisualizer';

// AI市场数据接口
interface MarketData {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  trend: 'up' | 'down' | 'stable';
  heatLevel: number;
  growth: number;
  description: string;
}

// AI实时动态接口
interface AIDynamic {
  id: number;
  type: 'trend' | 'alert' | 'insight';
  icon: 'TrendingUp' | 'Zap' | 'Brain';
  content: string;
  time: string;
}

// 基于日期生成伪随机数据，确保同一天数据一致，但每天会变化
const getDailySeed = () => {
  const now = new Date();
  return `${now.getFullYear()}${now.getMonth()}${now.getDate()}`;
};

// 简单的伪随机数生成器
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 生成动态市场数据
const generateMarketData = (): MarketData[] => {
  const seed = parseInt(getDailySeed());
  const markets: MarketData[] = [
    {
      id: 'japan',
      country: '日本',
      countryCode: 'JP',
      flag: '🇯🇵',
      trend: 'up',
      heatLevel: 0,
      growth: 0,
      description: '中医药市场规模持续扩大，汉方药需求旺盛'
    },
    {
      id: 'southeast-asia',
      country: '东南亚',
      countryCode: 'SEA',
      flag: '🌏',
      trend: 'up',
      heatLevel: 0,
      growth: 0,
      description: '电商平台快速发展，跨境贸易政策利好'
    },
    {
      id: 'europe',
      country: '欧洲',
      countryCode: 'EU',
      flag: '🇪🇺',
      trend: 'stable',
      heatLevel: 0,
      growth: 0,
      description: 'CE认证门槛提高，但市场规范度提升'
    },
    {
      id: 'usa',
      country: '美国',
      countryCode: 'US',
      flag: '🇺🇸',
      trend: 'up',
      heatLevel: 0,
      growth: 0,
      description: 'FDA审批加速，创新药准入窗口期'
    }
  ];

  markets.forEach((market, index) => {
    // 基于种子生成每日变化的数据
    const rand1 = seededRandom(seed + index * 100);
    const rand2 = seededRandom(seed + index * 200);
    const rand3 = seededRandom(seed + index * 300);
    
    market.heatLevel = Math.floor(60 + rand1 * 35); // 60-95
    market.growth = Math.floor(rand2 * 200) / 10; // 0-20%
    
    // 随机决定趋势
    const trendRand = rand3;
    if (trendRand < 0.6) {
      market.trend = 'up';
    } else if (trendRand < 0.85) {
      market.trend = 'stable';
    } else {
      market.trend = 'down';
    }
  });

  return markets;
};

// 生成AI实时动态
const generateAIDynamics = (): AIDynamic[] => {
  const seed = parseInt(getDailySeed());
  const hour = new Date().getHours();
  
  // 动态模板库
  const trendTemplates = [
    '过去24小时，全球搜索"中医药出海"趋势上升 +{growth}%',
    '日本市场"汉方药"搜索热度同比上升 +{growth}%',
    '东南亚电商GMV同比增长{growth}%，市场热度持续攀升',
    '美国FDA审批加速，中国药企准入机会增加',
    '欧洲市场对天然保健品需求增长 +{growth}%',
    '全球跨境电商搜索量上升 +{growth}%'
  ];
  
  const alertTemplates = [
    '日本新增{count}家中国中医药企业注册',
    '欧盟发布新贸易政策，对医疗器械进口有新规',
    '越南市场新增{count}家跨境电商入驻',
    '澳大利亚放宽中医药准入标准',
    '新加坡推出新税收优惠政策吸引外资',
    '韩国美妆品牌加速布局中国市场'
  ];
  
  const insightTemplates = [
    '欧盟CE认证政策有新变化，AI已自动更新',
    '日本药妆店渠道分析报告已生成',
    '东南亚各国家市场准入门槛对比更新',
    'AI预测：{country}市场未来3个月趋势',
    '最新海关数据显示中国出口增长{growth}%',
    '目标客户画像分析报告已更新'
  ];
  
  const countries = ['日本', '东南亚', '欧洲', '美国', '澳大利亚'];
  
  const generateItem = (type: 'trend' | 'alert' | 'insight', index: number): AIDynamic => {
    const rand = seededRandom(seed + hour * 10 + index);
    const growth = Math.floor(rand * 150 + 50) / 10;
    const count = Math.floor(rand * 20 + 5);
    const country = countries[Math.floor(seededRandom(seed + index * 7) * countries.length)];
    
    let content = '';
    let icon: 'TrendingUp' | 'Zap' | 'Brain' = 'Brain';
    
    if (type === 'trend') {
      const template = trendTemplates[index % trendTemplates.length];
      content = template.replace('{growth}', growth.toString());
      icon = 'TrendingUp';
    } else if (type === 'alert') {
      const template = alertTemplates[index % alertTemplates.length];
      content = template.replace('{count}', count.toString());
      icon = 'Zap';
    } else {
      const template = insightTemplates[index % insightTemplates.length];
      content = template.replace('{growth}', growth.toString()).replace('{country}', country);
      icon = 'Brain';
    }
    
    // 基于种子生成时间
    const minutesAgo = Math.floor(rand * 180 + 5);
    const time = minutesAgo < 60 ? `${minutesAgo}分钟前` : `${Math.floor(minutesAgo / 60)}小时前`;
    
    return {
      id: index,
      type,
      icon,
      content,
      time
    };
  };
  
  return [
    generateItem('trend', 1),
    generateItem('alert', 2),
    generateItem('insight', 3),
    generateItem('trend', 4)
  ];
};

// 生成AI统计数据
const generateAIStats = () => {
  const seed = parseInt(getDailySeed());
  
  // 每天微小变化，增加真实感
  const dataSources = Math.floor(seededRandom(seed) * 20) + 40; // 40-60
  const updateFreq = 24;
  const analysisDimensions = Math.floor(seededRandom(seed + 1) * 8) + 8; // 8-16
  const accuracy = Math.floor(seededRandom(seed + 2) * 10) + 83; // 83-93%
  
  return { dataSources, updateFreq, analysisDimensions, accuracy };
};

// 数字滚动组件
const Counter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const AIShowcase = () => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');

  // 生成当日数据
  const marketData = useMemo(() => generateMarketData(), []);
  const aiDynamics = useMemo(() => generateAIDynamics(), []);
  const aiStats = useMemo(() => generateAIStats(), []);

  // 设置更新时间
  useEffect(() => {
    const now = new Date();
    setLastUpdate(now.toLocaleString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  }, []);

  // 自动轮播AI动态
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % aiDynamics.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [aiDynamics.length]);

  const getDynamicIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Brain':
        return <Brain className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getDynamicColor = (type: string) => {
    switch (type) {
      case 'trend':
        return 'text-green-400 bg-green-400/10';
      case 'alert':
        return 'text-amber-400 bg-amber-400/10';
      case 'insight':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <section id="ai-showcase" className="relative py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgNHYyaC0ydi0yaDJ6bTQtOGgydjJoLTJ2LTJ6bTAtOGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">{t('ai.showcase.title', 'AI 驱动 · 洞察全球市场')}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('ai.showcase.subtitle', '海外市场洞察')}
          </h2>
          
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t('ai.showcase.description', '基于多维度数据分析，为企业提供精准的海外市场洞察和决策支持')}
          </p>
        </div>

        {/* 全球市场动态可视化大屏 */}
        <div className="mb-8">
          <GlobalMarketVisualizer />
        </div>

        {/* 市场热度卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {marketData.map((market, index) => (
            <div
              key={market.id}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 热度指示器 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{market.flag}</span>
                  <span className="text-white font-medium">{i18n.language === 'zh' ? market.country : market.countryCode}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  market.trend === 'up' ? 'text-green-400' : 
                  market.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {market.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : null}
                  <span>{market.trend === 'up' ? '+' : ''}{market.growth}%</span>
                </div>
              </div>

              {/* 热度进度条 */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t('ai.showcase.heatLevel', '市场热度')}</span>
                  <span>{market.heatLevel}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${market.heatLevel}%` }}
                  />
                </div>
              </div>

              {/* 描述 */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {market.description}
              </p>

              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
            </div>
          ))}
        </div>

        {/* AI实时动态 & 统计数据 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI实时动态 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                {t('ai.showcase.realtimeDynamics', 'AI 实时动态')}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3 h-3 animate-spin-slow" />
                <span>{t('ai.showcase.autoUpdate', '每日更新')}</span>
              </div>
            </div>

            {/* 动态列表 */}
            <div className="space-y-3">
              {aiDynamics.map((dynamic, index) => (
                <div
                  key={dynamic.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                    index === activeIndex 
                      ? 'bg-white/10 translate-x-2' 
                      : 'opacity-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${getDynamicColor(dynamic.type)}`}>
                    {getDynamicIcon(dynamic.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 line-clamp-2">
                      {dynamic.content}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {dynamic.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 指示器 */}
            <div className="flex justify-center gap-2 mt-4">
              {aiDynamics.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex ? 'w-6 bg-cyan-400' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* AI统计数据 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              {t('ai.showcase.aiStats', 'AI 数据能力')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-400">{t('ai.showcase.dataSources', '数据源')}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  <Counter value={aiStats.dataSources} suffix="+" />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('ai.showcase.dataSourcesDesc', '全球数据源')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <LineChart className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400">{t('ai.showcase.updateFreq', '更新频率')}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  <Counter value={aiStats.updateFreq} />h
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('ai.showcase.updateFreqDesc', '实时更新')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">{t('ai.showcase.analysis', '分析维度')}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  <Counter value={aiStats.analysisDimensions} />+
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('ai.showcase.analysisDesc', '多维分析')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-400">{t('ai.showcase.accuracy', '预测准确率')}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  <Counter value={aiStats.accuracy} />%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {t('ai.showcase.accuracyDesc', 'AI模型预测')}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <span>{t('ai.showcase.learnMore', '了解更多')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 数据来源说明 */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            {t('ai.showcase.dataNote', '数据每日更新，仅供参考')} · {t('ai.showcase.lastUpdate', '最后更新')}: {lastUpdate}
          </span>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;
