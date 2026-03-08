/**
 * AI 智慧商业顾问
 * 世界级的 AI 商业分析工具 - 乔布斯审美水准
 * 
 * 核心特性：
 * - 沉浸式仪表盘设计
 * - 实时市场情报分析
 * - 智能风险评估
 * - 竞争格局分析
 * - 增长预测引擎
 * - 令人上瘾的交互体验
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Globe, 
  Target, 
  Sparkles,
  ChevronRight,
  Users,
  RefreshCw,
  CheckCircle,
  Award,
  Rocket,
  Send,
  Bot,
  Loader2,
  Package,
  Heart,
  Leaf,
  Scale
} from 'lucide-react';
import { AI_CONFIG, AI_NAME_REPLACEMENTS } from '@/config';
import { tracking } from '@/lib/tracking';

gsap.registerPlugin(ScrollTrigger);

// 去除Markdown格式符号
const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// 市场数据
const MARKET_DATA = [
  { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', gdp: 4.9, growth: 1.2, marketSize: 450, risk: '低', barrier: '高', competition: '中等', opportunity: 92, timeline: '12-18月', investment: 120 },
  { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', gdp: 1.7, growth: 2.1, marketSize: 180, risk: '低', barrier: '中', competition: '低', opportunity: 88, timeline: '8-12月', investment: 80 },
  { id: 'usa', name: '美国', nameEn: 'USA', flag: '🇺🇸', gdp: 25, growth: 2.3, marketSize: 2800, risk: '低', barrier: '高', competition: '高', opportunity: 85, timeline: '18-24月', investment: 200 },
  { id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', gdp: 0.4, growth: 1.8, marketSize: 45, risk: '低', barrier: '低', competition: '中', opportunity: 95, timeline: '3-6月', investment: 35 },
  { id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪', gdp: 4.3, growth: 1.5, marketSize: 380, risk: '低', barrier: '高', competition: '高', opportunity: 78, timeline: '12-18月', investment: 150 },
  { id: 'korea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', gdp: 1.8, growth: 2.0, marketSize: 120, risk: '中', barrier: '中', competition: '高', opportunity: 82, timeline: '6-10月', investment: 65 },
  { id: 'thailand', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭', gdp: 0.5, growth: 3.5, marketSize: 65, risk: '中', barrier: '低', competition: '低', opportunity: 90, timeline: '4-8月', investment: 40 },
  { id: 'malaysia', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾', gdp: 0.4, growth: 4.2, marketSize: 55, risk: '低', barrier: '低', competition: '低', opportunity: 91, timeline: '3-6月', investment: 35 },
  { id: 'indonesia', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩', gdp: 1.3, growth: 5.1, marketSize: 180, risk: '中', barrier: '中', competition: '低', opportunity: 94, timeline: '6-10月', investment: 55 },
  { id: 'vietnam', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳', gdp: 0.4, growth: 6.5, marketSize: 85, risk: '中', barrier: '低', competition: '低', opportunity: 96, timeline: '3-6月', investment: 30 },
  { id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪', gdp: 0.5, growth: 2.8, marketSize: 75, risk: '低', barrier: '中', competition: '中', opportunity: 87, timeline: '4-8月', investment: 50 },
  { id: 'taiwan', name: '中国台湾', nameEn: 'Taiwan', flag: '🇹🇼', gdp: 0.8, growth: 1.5, marketSize: 95, risk: '低', barrier: '低', competition: '高', opportunity: 80, timeline: '4-8月', investment: 45 },
  { id: 'hongkong', name: '中国香港', nameEn: 'Hong Kong', flag: '🇭🇰', gdp: 0.36, growth: 3.2, marketSize: 42, risk: '低', barrier: '低', competition: '高', opportunity: 83, timeline: '2-4月', investment: 25 },
  { id: 'newzealand', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', gdp: 0.25, growth: 1.8, marketSize: 28, risk: '低', barrier: '低', competition: '低', opportunity: 86, timeline: '4-6月', investment: 30 },
];

// 产品类别
const PRODUCT_CATEGORIES = [
  { id: 'supplement', name: '保健食品', nameEn: 'Health Supplements', icon: Heart, color: 'from-rose-500 to-pink-500' },
  { id: 'traditional', name: '中药产品', nameEn: 'Traditional Chinese Medicine', icon: Leaf, color: 'from-emerald-500 to-teal-500' },
  { id: 'cosmetic', name: '功效化妆品', nameEn: 'Functional Cosmetics', icon: Sparkles, color: 'from-purple-500 to-violet-500' },
  { id: 'food', name: '功能性食品', nameEn: 'Functional Food', icon: Package, color: 'from-amber-500 to-orange-500' },
  { id: 'medical', name: '医疗器械', nameEn: 'Medical Devices', icon: Scale, color: 'from-blue-500 to-cyan-500' },
];

// 分析类型
const ANALYSIS_TYPES = [
  { 
    id: 'market', 
    name: '市场情报', 
    nameEn: 'Market Intelligence',
    icon: Globe, 
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    description: '深度分析目标市场规模、增长趋势、竞争格局',
    shortDesc: '市场规模、趋势、竞争'
  },
  { 
    id: 'risk', 
    name: '风险评估', 
    nameEn: 'Risk Assessment',
    icon: Shield, 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    description: '全面评估市场准入风险、政策风险、运营风险',
    shortDesc: '政策风险、准入门槛、合规要点'
  },
  { 
    id: 'roi', 
    name: '投资回报', 
    nameEn: 'ROI Analysis',
    icon: TrendingUp, 
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    description: '计算投资回报周期、预期收益、成本结构优化',
    shortDesc: '回报周期、收益预测、成本优化'
  },
  { 
    id: 'strategy', 
    name: '战略规划', 
    nameEn: 'Strategy Planning',
    icon: Target, 
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    description: '定制化的市场进入战略、渠道策略、品牌定位',
    shortDesc: '进入策略、渠道规划、品牌定位'
  },
];

// 风险等级
const RISK_LEVELS = {
  低: { label: '低风险', labelEn: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
  中: { label: '中等风险', labelEn: 'Medium Risk', color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  高: { label: '高风险', labelEn: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' },
};

// 机会等级
const getOpportunityLevel = (score: number) => {
  if (score >= 90) return { label: '极佳', labelEn: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100', bar: 'bg-emerald-500' };
  if (score >= 80) return { label: '优秀', labelEn: 'Great', color: 'text-blue-600', bg: 'bg-blue-100', bar: 'bg-blue-500' };
  if (score >= 70) return { label: '良好', labelEn: 'Good', color: 'text-indigo-600', bg: 'bg-indigo-100', bar: 'bg-indigo-500' };
  return { label: '一般', labelEn: 'Average', color: 'text-slate-600', bg: 'bg-slate-100', bar: 'bg-slate-500' };
};

// 聊天消息类型
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'recommendation' | 'warning';
  data?: any;
}

export default function AIAdvisor() {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  // 选中的产品类别
  const [selectedCategory, setSelectedCategory] = useState('supplement');
  
  // 选中的目标市场
  const [selectedMarket, setSelectedMarket] = useState('japan');
  
  // 聊天消息
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // 分析状态
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  // 当前市场数据
  const marketData = MARKET_DATA.find(m => m.id === selectedMarket) || MARKET_DATA[0];
  const categoryData = PRODUCT_CATEGORIES.find(c => c.id === selectedCategory) || PRODUCT_CATEGORIES[0];

  // 滚动动画
  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.analysis-card');
      cards.forEach((card, index) => {
        gsap.fromTo(card, 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            delay: index * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            }
          }
        );
      });
    }
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      gsap.to(chatContainerRef.current, {
        scrollTop: chatContainerRef.current.scrollHeight,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [messages]);

  // 运行AI分析
  const runAIAnalysis = async (type: string) => {
    tracking.toolInteraction('AI Advisor', type, {
      category: selectedCategory,
      market: selectedMarket
    });
    
    setCurrentAnalysis(type);
    
    const market = marketData;
    const category = categoryData;
    
    let prompt = '';
    if (type === 'market') {
      prompt = `作为中医药产品出海专家，请分析${category.name}产品进入${market.name}市场的深度情报。包括：市场规模、增长趋势、主要竞争对手、消费者偏好、渠道结构、入场机会评分（0-100）。请用简洁专业的语言列出5-8个要点，不需要使用Markdown格式符号。`;
    } else if (type === 'risk') {
      prompt = `作为中医药产品出海专家，请分析${category.name}产品进入${market.name}市场的风险评估。包括：政策监管风险、准入门槛、合规要求、认证周期、潜在风险点、风险缓解建议。请用简洁专业的语言列出5-8个要点。`;
    } else if (type === 'roi') {
      prompt = `作为中医药产品出海专家，请分析${category.name}产品进入${market.name}市场的投资回报分析。包括：预估总投资成本、预期年营收、投资回报周期、利润率预测、成本优化建议。请用简洁专业的语言列出5-8个要点。`;
    } else if (type === 'strategy') {
      prompt = `作为中医药产品出海专家，请为${category.name}产品制定进入${market.name}市场的战略规划。包括：市场进入模式、渠道策略、定价建议、品牌定位、推广策略、合作伙伴建议。请用简洁专业的语言列出5-8个要点。`;
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: ANALYSIS_TYPES.find(t => t.id === type)?.[isZh ? 'name' : 'nameEn'] || type,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 添加AI思考消息
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await fetch(`${AI_CONFIG.apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: '你是中医药产品出海咨询专家，请用专业但易懂的语言回答用户问题。重要：请不要使用任何Markdown格式符号（如#、*、-等），直接用纯文本段落形式回答。涉及台湾地区时必须表述为"中国台湾"，涉及香港地区时必须表述为"中国香港"。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '抱歉，分析服务暂时不可用。';
      content = stripMarkdown(content);
      
      // 替换 AI 名称
      Object.entries(AI_NAME_REPLACEMENTS).forEach(([key, value]) => {
        content = content.replace(new RegExp(key, 'gi'), value);
      });

      // 更新思考消息为实际内容
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content, type: 'analysis' as const }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content: '抱歉，AI分析服务暂时不可用。请稍后再试。', type: 'warning' as const }
          : msg
      ));
    } finally {
      setCurrentAnalysis(null);
    }
  };

  // 发送聊天消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await fetch(`${AI_CONFIG.apiUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            { role: 'system', content: '你是中医药产品出海咨询专家，请用专业但易懂的语言回答用户问题。涉及台湾地区时必须表述为"中国台湾"，涉及香港地区时必须表述为"中国香港"。' },
            ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: inputMessage }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '抱歉，服务暂时不可用。';
      content = stripMarkdown(content);
      
      Object.entries(AI_NAME_REPLACEMENTS).forEach(([key, value]) => {
        content = content.replace(new RegExp(key, 'gi'), value);
      });

      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content, type: 'text' as const }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content: '抱歉，服务暂时不可用。', type: 'warning' as const }
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  // 快速开始分析

  return (
    <section ref={sectionRef} id="ai-advisor" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 标题区 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 shadow-lg shadow-emerald-500/25">
            <Brain className="w-4 h-4" />
            {isZh ? 'AI 智慧商业顾问' : 'AI Business Advisor'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            {isZh ? '让AI成为您的出海军师' : 'Let AI Be Your Export Strategy Expert'}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {isZh 
              ? '基于深度市场数据 + AI智能分析，为您提供精准的商业决策建议'
              : 'Based on deep market data + AI intelligence, provide precise business insights'}
          </p>
        </div>

        {/* 选择器区域 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* 产品类别选择 */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">{isZh ? '产品类别' : 'Product Category'}</div>
                <div className="text-xs text-slate-500">{isZh ? '选择您的产品类型' : 'Select your product type'}</div>
              </div>
            </div>
            <div className="space-y-2">
              {PRODUCT_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-r ' + cat.color + ' text-white shadow-lg' 
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : ''}`} />
                    <span className="font-medium">{isZh ? cat.name : cat.nameEn}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 目标市场选择 */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{isZh ? '目标市场' : 'Target Market'}</div>
                  <div className="text-xs text-slate-500">{isZh ? '选择您感兴趣的市场' : 'Select your target market'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full">
                <span className="text-2xl">{marketData.flag}</span>
                <span className="font-semibold text-slate-800">{marketData.name}</span>
              </div>
            </div>

            {/* 市场卡片网格 */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {MARKET_DATA.slice(0, 14).map(market => {
                const isSelected = selectedMarket === market.id;
                return (
                  <button
                    key={market.id}
                    onClick={() => setSelectedMarket(market.id)}
                    className={`relative p-3 rounded-2xl transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105' 
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-2xl mb-1">{market.flag}</div>
                    <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {isZh ? market.name : market.nameEn}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 快速市场情报 */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">{isZh ? '市场机会' : 'Opportunity'}</div>
                  <div className={`text-2xl font-bold ${getOpportunityLevel(marketData.opportunity).color}`}>
                    {marketData.opportunity}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">{isZh ? '投资预算' : 'Investment'}</div>
                  <div className="text-2xl font-bold text-slate-800">
                    ${marketData.investment}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">{isZh ? '准入风险' : 'Risk Level'}</div>
                  <div className={`text-2xl font-bold ${RISK_LEVELS[marketData.risk as keyof typeof RISK_LEVELS]?.color || 'text-slate-800'}`}>
                    {marketData.risk}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">{isZh ? '进入周期' : 'Timeline'}</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {marketData.timeline}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 分析卡片区域 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              {isZh ? '智能分析模块' : 'AI Analysis Modules'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isZh ? '点击卡片获取深度分析' : 'Click cards for deep analysis'}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ANALYSIS_TYPES.map((type) => {
              const Icon = type.icon;
              const isLoading = currentAnalysis === type.id;
              
              return (
                <div 
                  key={type.id}
                  className="analysis-card group cursor-pointer transition-all duration-500"
                  onClick={() => runAIAnalysis(type.id)}
                >
                  <div className={`bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-200 ${
                    isLoading ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                  }`}>
                    {/* 卡片头部 */}
                    <div className={`p-6 bg-gradient-to-br ${type.color} text-white`}>
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-2xl ${type.iconBg} flex items-center justify-center backdrop-blur-sm`}>
                          {isLoading ? (
                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                          ) : (
                            <Icon className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <ChevronRight className={`w-5 h-5 text-white/60 transition-transform group-hover:translate-x-1 ${isLoading ? 'animate-pulse' : ''}`} />
                      </div>
                      <div className="mt-4">
                        <h4 className="text-xl font-bold">{isZh ? type.name : type.nameEn}</h4>
                        <p className="text-white/80 text-sm mt-1">{isZh ? type.shortDesc : type.description}</p>
                      </div>
                    </div>
                    
                    {/* 卡片内容 */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{isZh ? '预计耗时' : 'Est. Time'}</span>
                        <span className="font-medium text-slate-700">3-5s</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-500">{isZh ? '数据来源' : 'Data Source'}</span>
                        <span className="font-medium text-slate-700">AI + Market DB</span>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <button className={`w-full py-3 rounded-xl font-medium bg-gradient-to-r ${type.color} text-white flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <Sparkles className="w-4 h-4" />
                          {isZh ? '立即分析' : 'Analyze Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI 对话区域 */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* 对话头部 */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {isZh ? '智慧商业顾问' : 'Business Strategy Advisor'}
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      AI Online
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {isZh 
                      ? `${categoryData.name} → ${marketData.name}市场专家`
                      : `${categoryData.nameEn} → ${marketData.nameEn} Market Expert`}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setMessages([])}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isZh ? '清空对话' : 'Clear Chat'}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 欢迎提示 */}
          {messages.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {isZh ? '准备好开始您的出海之旅了吗？' : 'Ready to start your export journey?'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {isZh 
                  ? '点击上方的分析卡片，或直接在这里向我提问关于市场准入、投资回报、风险评估等问题'
                  : 'Click the analysis cards above, or ask me anything about market access, ROI, risk assessment'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { text: isZh ? '日本市场好进吗？' : 'How is Japan market?', type: 'market' },
                  { text: isZh ? '投资多少钱合适？' : 'How much to invest?', type: 'roi' },
                  { text: isZh ? '有什么风险？' : 'Any risks?', type: 'risk' },
                  { text: isZh ? '怎么做品牌？' : 'How to build brand?', type: 'strategy' },
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputMessage(suggestion.text);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-full text-sm font-medium transition-colors"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-6 space-y-4"
          >
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                }`}>
                  {message.role === 'user' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`px-5 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : message.type === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}>
                    {message.content || (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-sm text-slate-500">{isZh ? 'AI思考中...' : 'AI thinking...'}</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs text-slate-400 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isZh ? '向AI顾问提问...' : 'Ask AI advisor...'}
                disabled={isTyping}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  inputMessage.trim() && !isTyping
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="text-center mt-2 text-xs text-slate-400">
              {isZh 
                ? 'AI会基于您选择的市场和产品提供专业建议'
                : 'AI provides advice based on your selected market and product'}
            </div>
          </div>
        </div>

        {/* 底部CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border border-slate-200">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-slate-700 font-medium">
              {isZh ? '已有 2,847 位企业家获得AI分析报告' : '2,847 entrepreneurs got AI analysis reports'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
