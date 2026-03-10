import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, Eye, ArrowRight, Sparkles, X, Loader2 } from 'lucide-react';

// 文章数据类型
interface Article {
  id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  content?: string;
  contentEn?: string;
  category: string;
  categoryEn: string;
  date: string;
  views?: number;
  tags: string[];
  image?: string;
}

// 从 JSON 文件获取文章数据
const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch('/articles.json');
    if (!response.ok) throw new Error('Failed to fetch articles');
    const data = await response.json();
    
    // 为每篇文章添加随机浏览量（模拟）
    return (data.articles || []).map((article: Article) => ({
      ...article,
      views: Math.floor(Math.random() * 2000) + 500,
      content: article.content || article.excerpt,
      contentEn: article.contentEn || article.excerptEn,
    }));
  } catch (error) {
    console.error('Error loading articles:', error);
    return generateArticles();
  }
};

// 备用文章数据（当 /articles.json 不可用时）
const generateArticles = (): Article[] => {
  const today = new Date();
  const articles: Article[] = [
    {
      id: '1',
      title: '日本公司注册全攻略：流程、费用、注意事项一文详解',
      titleEn: 'Complete Guide to Registering a Company in Japan',
      excerpt: '详细介绍日本公司注册的完整流程、所需材料、费用预算以及常见注意事项，帮助企业顺利进入日本市场。',
      excerptEn: 'A comprehensive guide to company registration in Japan, covering procedures, required documents, cost estimates, and key considerations.',
      content: `日本作为世界第三大经济体，具有成熟的市场环境和完善的法律体系，吸引着众多中国企业前往投资注册公司。以下是详细的注册流程和注意事项。

## 一、选择公司类型

在日本最常见的公司形式包括：
- **株式会社（Kabushiki Kaisha）**: 最常见的公司形式，适合大型企业
- **合同会社（Godo Kaisha）**: 类似于美国的LLC，适合中小企业
- **合名会社**: 类似于无限责任公司

## 二、注册资本金

- 最低注册资本金为1日元
- 建议资本金：100万日元以上（便于申请经营管理签证）
- 资本金需实际到位并提供证明

## 三、注册流程

1. **准备材料**
   - 公司章程（定款）
   - 股东会决议
   - 董事就任承诺书
   - 注册通知书

2. **提交法务局**
   - 在线申请或现场提交
   - 审查时间：约1-2周

3. **完成注册**
   - 获取营业执照
   - 开设银行账户
   - 办理税务登记

## 四、注意事项

- 建议聘请当地行政书士协助
- 注意公司地址的选择（影响纳税）
- 了解日本的公司税法`,
      contentEn: `Japan, as the world's third-largest economy, attracts many Chinese companies to invest and register businesses due to its mature market environment and well-developed legal system. Here is a detailed registration process and precautions.

## 1. Choose Company Type

The most common company types in Japan include:
- **Kabushiki Kaisha (Stock Company)**: Most common form, suitable for large enterprises
- **Godo Kaisha (LLC)**: Similar to US LLC, suitable for SMEs
- **Gomei Kaisha**: Similar to unlimited liability company

## 2. Registered Capital

- Minimum registered capital: 1 yen
- Recommended capital: Over 1 million yen (facilitates business manager visa application)
- Capital must be actually paid and documented

## 3. Registration Process

1. **Prepare Materials**
   - Articles of incorporation
   - Shareholder meeting resolution
   - Director appointment letter
   - Registration notice

2. **Submit to Legal Affairs Bureau**
   - Online application or in-person submission
   - Review time: approximately 1-2 weeks

3. **Complete Registration**
   - Obtain business license
   - Open bank account
   - Complete tax registration

## 4. Precautions

- It is recommended to hire a local administrative scrivener
- Pay attention to company address selection (affects taxation)
- Understand Japanese corporate tax law`,
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
      content: `CE认证是进入欧盟市场的"通行证"，但许多企业在认证过程中遇到各种问题。本文将详细解析常见问题及解决方案。

## 一、CE认证基础

### 什么是CE认证？
CE标志是欧盟对产品安全、健康和环境保护的强制性认证标志，表明产品符合欧盟相关指令的基本要求。

### 适用范围
- 电子电气产品
- 机械设备
- 建筑材料
- 个人防护设备
- 医疗器械等

## 二、常见问题

### 问题1：指令选择错误
**解决方案**：仔细确认产品所属指令类别，必要时寻求专业机构帮助。

### 问题2：技术文件不完整
**解决方案**：建立完整的技术文件体系，包括：
- 产品描述
- 设计和制造图纸
- 原材料清单
- 测试报告
- 符合性声明

### 问题3：认证机构选择
**解决方案**：
- 确认机构是否具有欧盟认可资质
- 比较不同机构的认证周期和费用
- 了解机构的行业口碑

### 问题4：工厂审查
**解决方案**：
- 建立质量管理体系
- 准备完整的生产记录
- 培训相关人员

## 三、认证流程

1. 确定适用指令
2. 评估产品符合性
3. 编制技术文件
4. 进行测试（如需要）
5. 编写符合性声明
6. 加贴CE标志`,
      contentEn: `CE certification is the "passport" to enter the EU market, but many enterprises encounter various problems during the certification process. This article provides detailed analysis of common problems and solutions.

## 1. CE Certification Basics

### What is CE Certification?
The CE mark is a mandatory certification mark for product safety, health, and environmental protection in the EU, indicating that products meet the basic requirements of relevant EU directives.

### Scope of Application
- Electrical and electronic products
- Machinery and equipment
- Construction materials
- Personal protective equipment
- Medical devices, etc.

## 2. Common Problems

### Problem 1: Incorrect Directive Selection
**Solution**: Carefully confirm the product's directive category and seek professional help if needed.

### Problem 2: Incomplete Technical Documentation
**Solution**: Establish a complete technical documentation system including:
- Product description
- Design and manufacturing drawings
- Bill of materials
- Test reports
- Declaration of conformity

### Problem 3: Certification Body Selection
**Solution**:
- Confirm if the body has EU recognized qualification
- Compare certification cycles and costs
- Understand the body's industry reputation

### Problem 4: Factory Inspection
**Solution**:
- Establish quality management system
- Prepare complete production records
- Train relevant personnel

## 3. Certification Process

1. Determine applicable directives
2. Assess product conformity
3. Prepare technical documentation
4. Conduct testing (if required)
5. Write declaration of conformity
6. Affix CE mark`,
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
      content: `日本汉方市场持续增长，为中医药企业提供了巨大的商机。本文深入分析市场机遇与挑战。

## 一、市场机遇

### 1. 市场规模
- 日本汉方市场规模约2,000亿日元
- 年增长率：5-8%
- 消费者对天然药物接受度高

### 2. 政策支持
- 日本政府将汉方纳入医疗保险
- 支持中医药现代化研究
- 放宽部分产品进口限制

### 3. 消费趋势
- 老龄化社会带动保健品需求
- 预防医学理念普及
- 对天然成分产品偏好上升

## 二、主要挑战

### 1. 法规要求
- 严格药品审批流程
- 需要日本当地代理商
- 临床试验要求

### 2. 文化差异
- 日本对品质要求极高
- 需要本地化包装和说明
- 建立品牌信任需要时间

### 3. 竞争格局
- 本土企业占据主导
- 韩国汉方产品竞争
- 价格竞争激烈

## 三、市场进入策略

### 1. 产品定位
- 选择有特色的产品线
- 注重品质和安全性
- 差异化竞争

### 2. 渠道选择
- 药店/药妆店渠道
- 电商平台（如Amazon日本）
- 专门店渠道

### 3. 营销策略
- 强调产品科学性
- 开展消费者教育
- 建立专家推荐体系`,
      contentEn: `The Japanese Kampo (Chinese medicine) market continues to grow, providing huge business opportunities for TCM enterprises. This article provides in-depth analysis of market opportunities and challenges.

## 1. Market Opportunities

### 1. Market Size
- Japanese Kampo market size: approximately 200 billion yen
- Annual growth rate: 5-8%
- High consumer acceptance of natural medicines

### 2. Policy Support
- Japanese government includes Kampo in national health insurance
- Supports modernization research of traditional medicine
- Relaxes some product import restrictions

### 3. Consumer Trends
- Aging society drives health product demand
- Popularity of preventive medicine philosophy
- Increasing preference for natural ingredient products

## 2. Main Challenges

### 1. Regulatory Requirements
- Strict drug approval process
- Requires local Japanese agent
- Clinical trial requirements

### 2. Cultural Differences
- Extremely high quality requirements in Japan
- Need for localized packaging and instructions
- Building brand trust takes time

### 3. Competition Landscape
- Domestic companies dominate
- Competition from Korean Kampo products
- Fierce price competition

## 3. Market Entry Strategy

### 1. Product Positioning
- Choose distinctive product lines
- Focus on quality and safety
- Differentiated competition

### 2. Channel Selection
- Drugstore/pharmacy channels
- E-commerce platforms (e.g., Amazon Japan)
- Specialty store channels

### 3. Marketing Strategy
- Emphasize product scientific basis
- Conduct consumer education
- Establish expert recommendation system`,
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
      content: `2026年各国税务政策出现多项重要变化，企业出海需密切关注。本文汇总主要变化及应对策略。

## 一、主要变化

### 1. 企业所得税
- **日本**：中小企业税率下调至19%
- **德国**：引入全球最低税15%
- **东南亚**：多国下调税率吸引投资

### 2. 数字服务税
- **欧盟**：继续推进数字服务税方案
- **东南亚**：多国开征数字税
- **应对**：优化定价和分成模式

### 3. 碳边境调节机制
- **欧盟**：CBAM全面实施
- **影响**：出口型企业需关注
- **应对**：提前布局碳排放管理

### 4. 转让定价
- **全球**：OECD最低税改方案生效
- **要求**：更严格的文档要求
- **应对**：完善转让定价体系

## 二、应对策略

### 1. 提前规划
- 关注各国税法变化
- 提前调整企业架构
- 建立税务风险预警

### 2. 专业支持
- 聘请当地税务顾问
- 参与税企对话
- 申请税收优惠

### 3. 数字化管理
- 使用税务管理系统
- 自动化申报流程
- 实时监控税负变化`,
      contentEn: `Significant changes in tax policies of various countries in 2026 require close attention from enterprises expanding overseas. This article summarizes major changes and coping strategies.

## 1. Major Changes

### 1. Corporate Income Tax
- **Japan**: SME tax rate reduced to 19%
- **Germany**: Introduction of global minimum tax of 15%
- **Southeast Asia**: Multiple countries reduce tax rates to attract investment

### 2. Digital Services Tax
- **EU**: Continues to advance digital services tax plan
- **Southeast Asia**: Multiple countries levy digital taxes
- **Response**: Optimize pricing and revenue sharing models

### 3. Carbon Border Adjustment Mechanism
- **EU**: Full implementation of CBAM
- **Impact**: Export-oriented enterprises need to pay attention
- **Response**: Plan carbon emission management in advance

### 4. Transfer Pricing
- **Global**: OECD minimum tax reform program takes effect
- **Requirements**: Stricter documentation requirements
- **Response**: Improve transfer pricing system

## 2. Coping Strategies

### 1. Advance Planning
- Monitor tax law changes in various countries
- Adjust corporate structure in advance
- Establish tax risk early warning

### 2. Professional Support
- Hire local tax consultants
- Participate in tax-corporate dialogue
- Apply for tax incentives

### 3. Digital Management
- Use tax management systems
- Automate declaration processes
- Monitor tax burden changes in real-time`,
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
      content: `东南亚市场潜力巨大，但各国特点各异。本文深入分析主要国家的市场特点。

## 一、各国市场特点

### 1. 印度尼西亚
- **人口**：2.7亿，世界第四大人口国
- **优势**：资源丰富、市场潜力大
- **挑战**：基础设施薄弱、官僚主义
- **建议**：选择雅加达等大城市作为切入点

### 2. 泰国
- **人口**：7,000万
- **优势**：营商环境好、地理位置优越
- **挑战**：政治稳定性
- **建议**：利用东部经济走廊优惠政策

### 3. 越南
- **人口**：1亿
- - **优势**：劳动力成本低、经济增长快
- **挑战**：法规不完善、腐败
- **建议**：关注工业园区、享受 FDI 优惠

### 4. 马来西亚
- **人口**：3,300万
- **优势**：多元文化、英文环境好
- **挑战**：市场规模较小
- **建议**：作为区域总部选址

### 5. 新加坡
- **人口**：560万
- **优势**：营商环境最优、金融中心
- **挑战**：成本高
- **建议**：作为区域总部和融资平台

## 二、进入策略

### 1. 市场调研
- 了解当地消费者偏好
- 分析竞争对手
- 评估渠道伙伴

### 2. 合作伙伴
- 选择有实力的本地代理商
- 建立合资企业
- 利用华人商业网络

### 3. 合规经营
- 了解当地劳动法
- 遵守税务规定
- 重视环境保护`,
      contentEn: `The Southeast Asian market has huge potential, but each country has its own characteristics. This article provides in-depth analysis of major countries' market characteristics.

## 1. Country Market Characteristics

### 1. Indonesia
- **Population**: 270 million, world's fourth-largest
- **Advantages**: Rich resources, large market potential
- **Challenges**: Weak infrastructure, bureaucracy
- **Recommendation**: Start with major cities like Jakarta

### 2. Thailand
- **Population**: 70 million
- **Advantages**: Good business environment, strategic location
- **Challenges**: Political stability
- **Recommendation**: Utilize Eastern Economic Corridor incentives

### 3. Vietnam
- **Population**: 100 million
- **Advantages**: Low labor costs, fast economic growth
- **Challenges**: Incomplete regulations, corruption
- **Recommendation**: Focus on industrial parks, enjoy FDI incentives

### 4. Malaysia
- **Population**: 33 million
- **Advantages**: Multicultural, English-speaking environment
- **Challenges**: Smaller market size
- **Recommendation**: As regional headquarters location

### 5. Singapore
- **Population**: 5.6 million
- **Advantages**: Best business environment, financial center
- **Challenges**: High costs
- **Recommendation**: As regional headquarters and financing platform

## 2. Entry Strategies

### 1. Market Research
- Understand local consumer preferences
- Analyze competitors
- Evaluate channel partners

### 2. Partners
- Choose capable local agents
- Establish joint ventures
- Utilize Chinese business networks

### 3. Compliant Operations
- Understand local labor laws
- Follow tax regulations
- Emphasize environmental protection`,
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
      content: `海外公司运营涉及复杂的法律合规要求。本文全面解析关键合规要点。

## 一、公司合规

### 1. 公司注册
- 按时完成年度申报
- 保持注册地址有效
- 及时更新公司信息

### 2. 股东和董事
- 维护股东名册
- 按时召开董事会
- 记录重要决议

### 3. 财务合规
- 开设当地银行账户
- 建立规范的财务制度
- 按时进行审计

## 二、税务合规

### 1. 税务登记
- 及时办理税务登记
- 了解适用税种
- 申请税号

### 2. 申报义务
- 按时申报所得税
- 申报增值税（如适用）
- 代扣代缴税款

### 3. 转让定价
- 准备转让定价文档
- 遵守预约定价安排
- 保留关联交易记录

## 三、劳动合规

### 1. 雇佣合同
- 签订规范的劳动合同
- 明确工作条件和薪资
- 遵守试用期规定

### 2. 社会保险
- 了解当地社保要求
- 按时缴纳社保
- 保留缴纳记录

### 3. 工作签证
- 及时办理工作签证
- 遵守居留规定
- 定期更新签证

## 四、知识产权

### 1. 商标保护
- 注册当地商标
- 监控侵权行为
- 维护品牌价值

### 2. 专利和技术
- 申请专利保护
- 签订保密协议
- 管理技术许可`,
      contentEn: `Overseas company operations involve complex legal compliance requirements. This article provides comprehensive analysis of key compliance points.

## 1. Company Compliance

### 1. Company Registration
- Complete annual filings on time
- Maintain valid registered address
- Update company information promptly

### 2. Shareholders and Directors
- Maintain shareholder register
- Hold board meetings on time
- Record important resolutions

### 3. Financial Compliance
- Open local bank accounts
- Establish standardized financial systems
- Conduct audits on time

## 2. Tax Compliance

### 1. Tax Registration
- Complete tax registration promptly
- Understand applicable taxes
- Apply for tax numbers

### 2. Filing Obligations
- File income tax on time
- Report VAT (if applicable)
- Withhold and remit taxes

### 3. Transfer Pricing
- Prepare transfer pricing documentation
- Comply with advance pricing arrangements
- Keep records of related party transactions

## 3. Labor Compliance

### 1. Employment Contracts
- Sign standardized labor contracts
- Clarify working conditions and salary
- Comply with probation period regulations

### 2. Social Insurance
- Understand local social insurance requirements
- Pay social insurance on time
- Keep payment records

### 3. Work Visas
- Process work visas promptly
- Comply with residence regulations
- Renew visas regularly

## 4. Intellectual Property

### 1. Trademark Protection
- Register local trademarks
- Monitor infringement
- Maintain brand value

### 2. Patents and Technology
- Apply for patent protection
- Sign confidentiality agreements
- Manage technology licenses`,
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
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  useEffect(() => {
    // 从 JSON 文件加载文章数据
    const loadArticles = async () => {
      const data = await fetchArticles();
      setArticles(data);
      setLoading(false);
    };
    loadArticles();

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
        views: (article.views || 0) + Math.floor(Math.random() * 5),
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

  const getArticleContent = (article: Article) => {
    return i18n.language === 'zh' 
      ? (article.content || article.excerpt) 
      : (article.contentEn || article.excerptEn);
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'from-gray-500 to-slate-600';
  };

  // 切换文章展开/收起
  const toggleArticle = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  // 关闭弹窗
  const closeModal = () => {
    setExpandedArticle(null);
  };

  // 格式化内容（简单处理换行）
  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-bold text-gray-800 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-md font-semibold text-gray-700 mt-3 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong className="text-gray-700">{match[1]}</strong>{match[2] && `: ${match[2]}`}</span>
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1">
            <span className="text-orange-500 mt-1">•</span>
            <span className="text-gray-600">{line.replace('- ', '')}</span>
          </div>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return <div key={idx} className="text-gray-600 my-1 ml-4">{line}</div>;
      }
      if (line.trim() === '') {
        return <br key={idx} />;
      }
      return <p key={idx} className="text-gray-600 my-2">{line}</p>;
    });
  };

  // 找到当前展开的文章
  const currentArticle = articles.find(a => a.id === expandedArticle);

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
        {loading ? (
          <div className="col-span-full text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-500">{t('blog.loading', '加载中...')}</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('blog.noArticles', '暂无文章')}</p>
          </div>
        ) : (
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
              onClick={() => toggleArticle(article.id)}
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
                    <span>{(article.views || 0).toLocaleString()}</span>
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
                    <span>{t('blog.readMore', expandedArticle === article.id ? '收起' : '阅读全文')}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${expandedArticle === article.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* 悬停时的装饰 */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </article>
          ))}
          </div>
        )}

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

      {/* 文章详情弹窗 */}
      {expandedArticle && currentArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* 弹窗内容 */}
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            {/* 关闭按钮 */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* 文章内容 */}
            <div className="p-8">
              {/* 分类和日期 */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(currentArticle.category)} text-white`}>
                  {i18n.language === 'zh' ? currentArticle.category : currentArticle.categoryEn}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{currentArticle.date}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Eye className="w-3 h-3" />
                  <span>{(currentArticle.views || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {getArticleTitle(currentArticle)}
              </h2>

              {/* 分割线 */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* 正文内容 */}
              <div className="prose prose-sm max-w-none">
                {formatContent(getArticleContent(currentArticle))}
              </div>

              {/* 底部操作 */}
              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  {t('blog.tags', '标签')}: {currentArticle.tags.join(', ')}
                </div>
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {t('blog.close', '关闭')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
