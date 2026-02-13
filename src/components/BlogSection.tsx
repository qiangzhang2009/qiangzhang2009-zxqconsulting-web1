import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, Eye, ArrowRight, Sparkles } from 'lucide-react';

// 文章数据类型
interface Article {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  category: string;
  categoryEn: string;
  date: string;
  views: number;
  tags: string[];
  image?: string;
}

// 模拟文章数据 - 可后续对接 CMS 或 API 实现自动更新
const generateArticles = (): Article[] => {
  const today = new Date();
  const articles: Article[] = [
    {
      id: '1',
      title: '日本公司注册全攻略：流程、费用、注意事项一文详解',
      titleEn: 'Complete Guide to Registering a Company in Japan',
      excerpt: '详细介绍日本公司注册的完整流程、所需材料、费用预算以及常见注意事项，帮助企业顺利进入日本市场。',
      excerptEn: 'A comprehensive guide to company registration in Japan, covering procedures, required documents, cost estimates, and key considerations.',
      category: '日本',
      categoryEn: 'Japan',
      date: formatDate(today),
      views: 1247,
      tags: ['日本', '公司注册', '出海'],
    },
    {
      id: '2',
      title: '欧盟CE认证避坑指南：常见问题与解决方案',
      titleEn: 'EU CE Certification Guide: Common Issues & Solutions',
      excerpt: '深入解析欧盟CE认证的常见问题和难点，提供实用的解决方案，帮助企业顺利进入欧洲市场。',
      excerptEn: 'In-depth analysis of common CE certification issues with practical solutions for entering the European market.',
      category: '欧洲',
      categoryEn: 'Europe',
      date: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
      views: 986,
      tags: ['欧洲', 'CE认证', '合规'],
    },
    {
      id: '3',
      title: '中医药出海日本市场：机遇与挑战全分析',
      titleEn: 'TCM Entering Japan Market: Opportunities & Challenges',
      excerpt: '分析中医药产品进入日本市场的机遇、挑战及合规要求，提供实用的市场进入策略。',
      excerptEn: 'Analyzing opportunities and challenges for TCM products entering the Japanese market with practical strategies.',
      category: '中医',
      categoryEn: 'TCM',
      date: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
      views: 1543,
      tags: ['中医药', '日本', '市场策略'],
    },
    {
      id: '4',
      title: '2026年全球税务政策变化：企业出海必看',
      titleEn: 'Global Tax Policy Changes 2026: Must-Read for Businesses',
      excerpt: '汇总2026年各国税务政策的重要变化，为企业出海提供税务筹划参考。',
      excerptEn: 'Summary of significant tax policy changes in 2026 with tax planning insights for businesses going global.',
      category: '税务',
      categoryEn: 'Tax',
      date: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
      views: 2156,
      tags: ['税务', '政策', '合规'],
    },
    {
      id: '5',
      title: '东南亚市场进入指南：各国市场特点分析',
      titleEn: 'Southeast Asia Market Entry Guide',
      excerpt: '深入分析东南亚各国的市场特点、准入条件及投资环境，帮助企业制定精准的市场进入策略。',
      excerptEn: 'In-depth analysis of Southeast Asian market characteristics and investment environments.',
      category: '东南亚',
      categoryEn: 'Southeast Asia',
      date: formatDate(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)),
      views: 1876,
      tags: ['东南亚', '市场策略', '投资'],
    },
    {
      id: '6',
      title: '海外公司运营合规手册：避免常见法律风险',
      titleEn: 'Overseas Company Compliance Handbook',
      excerpt: '全面解析海外公司运营中的法律合规要点，帮助企业规避常见法律风险。',
      excerptEn: 'Comprehensive guide to legal compliance in overseas company operations.',
      category: '合规',
      categoryEn: 'Compliance',
      date: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
      views: 1654,
      tags: ['合规', '法律', '运营'],
    },
  ];
  return articles;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 分类配置
const categories = [
  { id: 'all', name: '全部', nameEn: 'All', icon: '🌐', color: 'from-gray-500 to-slate-600' },
  { id: '日本', name: '日本', nameEn: 'Japan', icon: '🏯', color: 'from-red-500 to-pink-500' },
  { id: '欧洲', name: '欧洲', nameEn: 'Europe', icon: '🇪🇺', color: 'from-blue-500 to-indigo-600' },
  { id: '中医', name: '中医', nameEn: 'TCM', icon: '💊', color: 'from-green-500 to-emerald-600' },
  { id: '东南亚', name: '东南亚', nameEn: 'SE Asia', icon: '🌴', color: 'from-amber-500 to-orange-500' },
];

const BlogSection = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 初始化文章数据
    setArticles(generateArticles());

    // 监听滚动显示
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('blog-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // 模拟每日自动更新 - 实际可对接 CMS/API
  useEffect(() => {
    const dailyUpdate = setInterval(() => {
      // 模拟更新文章浏览量
      setArticles(prev => prev.map(article => ({
        ...article,
        views: article.views + Math.floor(Math.random() * 5),
      })));
    }, 60000); // 每分钟更新一次浏览量

    return () => clearInterval(dailyUpdate);
  }, []);

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter(article => article.category === activeCategory);

  const getCategoryName = (cat: typeof categories[0]) => {
    return i18n.language === 'zh' ? cat.name : cat.nameEn;
  };

  const getArticleTitle = (article: Article) => {
    return i18n.language === 'zh' ? article.title : article.titleEn;
  };

  const getArticleExcerpt = (article: Article) => {
    return i18n.language === 'zh' ? article.excerpt : article.excerptEn;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'from-gray-500 to-slate-600';
  };

  return (
    <section id="blog-section" className="py-20 bg-gradient-to-br from-amber-50 via-white to-orange-50 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full mb-4">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">{t('blog.dailyUpdate', '每日更新')}</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('blog.title', '出海攻略')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('blog.subtitle', '专业出海资讯与实战攻略，助力企业顺利开拓全球市场')}
          </p>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <span>{category.icon}</span>
              <span>{getCategoryName(category)}</span>
            </button>
          ))}
        </div>

        {/* 文章列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => (
            <article
              key={article.id}
              className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                transitionDuration: '500ms',
              }}
            >
              {/* 文章内容 */}
              <div className="p-6">
                {/* 分类标签 */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(article.category)} text-white`}>
                    {i18n.language === 'zh' ? article.category : article.categoryEn}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Eye className="w-3 h-3" />
                    <span>{article.views.toLocaleString()}</span>
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {getArticleTitle(article)}
                </h3>

                {/* 摘要 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {getArticleExcerpt(article)}
                </p>

                {/* 底部信息 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>{t('blog.readMore', '阅读全文')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 悬停时的装饰 */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </article>
          ))}
        </div>

        {/* 查看更多 */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
            <span>{t('blog.viewMore', '查看更多文章')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 自动更新提示 */}
        <div className="text-center mt-6 text-gray-400 text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {t('blog.autoUpdate', '内容每日自动更新')} · {t('blog.lastUpdate', '最后更新')}: {new Date().toLocaleString('zh-CN')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
