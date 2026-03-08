/**
 * AI解决方案专业能力展示
 * 展示6大模块功能矩阵和专业服务能力
 */

import { useTranslation } from 'react-i18next';
import {
  Shield,
  Calculator,
  BarChart3,
  Compass,
  Globe,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';

// 模块数据
const MODULES = [
  {
    id: 'compliance',
    name: '合规准入',
    nameEn: 'Compliance',
    icon: Shield,
    color: 'bg-purple-500',
    features: [
      '准入可行性评估',
      '成分红线智能筛查',
      '标签宣传合规审核',
      '注册流程全程管控',
    ],
    featuresEn: [
      'Feasibility Assessment',
      'Ingredient Screening',
      'Label Compliance',
      'Process Management',
    ],
  },
  {
    id: 'cost',
    name: '成本ROI',
    nameEn: 'Cost & ROI',
    icon: Calculator,
    color: 'bg-emerald-500',
    features: [
      '全链路成本测算',
      '动态ROI模拟',
      '多场景对比分析',
      '成本波动预警',
    ],
    featuresEn: [
      'Full Cost Calculation',
      'Dynamic ROI Simulation',
      'Scenario Comparison',
      'Cost Alerts',
    ],
  },
  {
    id: 'insight',
    name: '市场洞察',
    nameEn: 'Market Insight',
    icon: BarChart3,
    color: 'bg-blue-500',
    features: [
      '用户需求分析',
      '竞品深度拆解',
      '市场规模预测',
      '差异化定位建议',
    ],
    featuresEn: [
      'User Needs Analysis',
      'Competitor Analysis',
      'Market Sizing',
      'Positioning Strategy',
    ],
  },
  {
    id: 'channel',
    name: '渠道匹配',
    nameEn: 'Channel Match',
    icon: Globe,
    color: 'bg-cyan-500',
    features: [
      '智能渠道推荐',
      '入驻门槛分析',
      '经销商风险筛查',
      '铺市节奏规划',
    ],
    featuresEn: [
      'Smart Recommendations',
      'Entry Threshold',
      'Risk Screening',
      'Rollout Planning',
    ],
  },
  {
    id: 'risk',
    name: '风险管控',
    nameEn: 'Risk Control',
    icon: AlertTriangle,
    color: 'bg-red-500',
    features: [
      '政策实时监测',
      '汇率关税跟踪',
      '供应链风险预警',
      '应急方案生成',
    ],
    featuresEn: [
      'Policy Monitoring',
      'Exchange Rate Tracking',
      'Supply Chain Alerts',
      'Contingency Plans',
    ],
  },
  {
    id: 'advisor',
    name: 'AI问答',
    nameEn: 'AI Advisor',
    icon: Compass,
    color: 'bg-amber-500',
    features: [
      '7x24实时响应',
      '专业问题解答',
      '案例智能推荐',
      '个性化建议',
    ],
    featuresEn: [
      '24/7 Real-time Response',
      'Expert Q&A',
      'Case Recommendations',
      'Personalized Advice',
    ],
  },
];

// 价值主张数据
const VALUE_PROPS = [
  {
    icon: Zap,
    title: '效率提升10倍',
    titleEn: '10x Efficiency',
    description: '从数月缩短至数分钟，AI自动化完成市场调研、数据分析',
    descriptionEn: 'From months to minutes, AI automates research and analysis',
  },
  {
    icon: Target,
    title: '风险识别率95%+',
    titleEn: '95%+ Risk Detection',
    description: '从源头预防合规踩坑、产品水土不服等致命问题',
    descriptionEn: 'Prevent compliance pitfalls and product adaptation issues',
  },
  {
    icon: TrendingUp,
    title: '决策科学化',
    titleEn: 'Data-Driven Decisions',
    description: '基于全球30+国家数据积累，精准测算投入产出比',
    descriptionEn: 'Based on 30+ countries data, accurate ROI calculation',
  },
  {
    icon: Users,
    title: '服务规模化',
    titleEn: 'Scalable Service',
    description: '一对多服务海量企业，边际成本趋近于零',
    descriptionEn: 'Serve unlimited enterprises with near-zero marginal cost',
  },
];

// 客户评价数据
const TESTIMONIALS = [
  {
    name: '张总',
    nameEn: 'Mr. Zhang',
    company: '某中医药企业创始人',
    companyEn: 'TCM Company Founder',
    quote: 'AI工具帮我们3分钟完成了原本需要2个月的市场调研，直接避开了合规坑',
    quoteEn: 'AI tools completed 2 months of research in 3 minutes, helping us avoid compliance pitfalls',
  },
  {
    name: '李总',
    nameEn: 'Mr. Li',
    company: '本草护肤品品牌',
    companyEn: 'Herbal Skincare Brand',
    quote: '成本测算非常精准，和实际成本误差在10%以内，推荐的渠道ROI超出预期',
    quoteEn: 'Cost calculation is accurate within 10%, recommended channels exceeded ROI expectations',
  },
];

export default function AISolutionsShowcase() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  return (
    <section id="ai-solutions" className="py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* 标题区 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            {isZh ? '专业方案' : 'Professional Solution'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {isZh ? 'AI赋能出海全链路解决方案' : 'AI-Powered Overseas Solution'}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {isZh 
              ? '覆盖出海前决策、出海中落地、出海后运营的全生命周期'
              : 'Covering the full lifecycle from pre-entry decision to post-entry operations'}
          </p>
        </div>

        {/* 6大模块矩阵 */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-white text-center mb-8">
            {isZh ? '6大核心功能模块' : '6 Core Function Modules'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:border-emerald-500/30"
                >
                  <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {isZh ? module.name : module.nameEn}
                  </h4>
                  <ul className="space-y-2">
                    {(isZh ? module.features : module.featuresEn).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* 价值主张 */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-white text-center mb-8">
            {isZh ? '为什么选择我们' : 'Why Choose Us'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUE_PROPS.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div
                  key={i}
                  className="bg-gradient-to-br from-emerald-900/50 to-slate-800/50 border border-emerald-500/20 rounded-xl p-6 text-center"
                >
                  <div className="w-14 h-14 bg-emerald-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {isZh ? prop.title : prop.titleEn}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {isZh ? prop.description : prop.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 客户评价 */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold text-white text-center mb-8">
            {isZh ? '客户评价' : 'Client Testimonials'}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {isZh ? testimonial.name : testimonial.nameEn}
                    </div>
                    <div className="text-sm text-slate-400">
                      {isZh ? testimonial.company : testimonial.companyEn}
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 italic">
                  "{isZh ? testimonial.quote : testimonial.quoteEn}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4">
          </div>
        </div>

      </div>
    </section>
  );
}
