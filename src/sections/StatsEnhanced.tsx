import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Award, Users, TrendingUp, Building2, Star } from 'lucide-react';

interface StatItem {
  id: string;
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

const StatsSection = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<Record<string, string>>({});

  const stats: StatItem[] = [
    {
      id: 'years',
      icon: <Building2 className="w-6 h-6" />,
      value: '10+',
      label: t('stats.years', '年行业经验'),
      color: 'from-red-500 to-pink-500',
    },
    {
      id: 'clients',
      icon: <Users className="w-6 h-6" />,
      value: '500+',
      label: t('stats.clients', '服务客户'),
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'countries',
      icon: <Globe className="w-6 h-6" />,
      value: '20+',
      label: t('stats.countries', '覆盖国家'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'success',
      icon: <TrendingUp className="w-6 h-6" />,
      value: '98%',
      label: t('stats.success', '成功率'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'team',
      icon: <Star className="w-6 h-6" />,
      value: '50+',
      label: t('stats.team', '专家团队'),
      color: 'from-purple-500 to-violet-500',
    },
    {
      id: 'awards',
      icon: <Award className="w-6 h-6" />,
      value: '15+',
      label: t('stats.awards', '荣誉奖项'),
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateValues();
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const animateValues = () => {
    stats.forEach((stat, index) => {
      setTimeout(() => {
        setAnimatedValues(prev => ({
          ...prev,
          [stat.id]: stat.value
        }));
      }, index * 150);
    });
  };

  return (
    <section
      id="stats-section"
      className="relative py-16 sm:py-20 bg-gradient-to-br from-[#fef2f2] via-white to-[#fffbeb] overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-100 rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-red-50 text-[#C41E3A] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            <span>2026 马年特惠</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3d352e] mb-4">
            {t('stats.title', '选择我们的理由')}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('stats.subtitle', '深耕企业出海领域多年，以专业服务和成功案例赢得客户信赖')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="group relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* 渐变背景 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              {/* 图标 */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              
              {/* 数字 */}
              <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {isVisible ? (animatedValues[stat.id] || '0') : '0'}
              </div>
              
              {/* 标签 */}
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
          {[
            '24小时响应',
            '专业顾问一对一',
            '成功案例丰富',
            '售后无忧服务',
          ].map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
