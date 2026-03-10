/**
 * 渠道推荐板块 - 智能渠道匹配
 * 设计理念: 选择输入、智能匹配、结果可视化
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Store,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useMarket } from './aiToolsMarketContext';

// 产品类别
const PRODUCT_CATEGORIES = [
  { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
  { value: 'traditional', label: '中医药饮片', labelEn: 'TCM Products' },
  { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
  { value: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
];

// 预算区间
const BUDGET_RANGES = [
  { value: 'low', label: '¥50万以下', labelEn: 'Under $50K' },
  { value: 'medium', label: '¥50-200万', labelEn: '$50K - $200K' },
  { value: 'high', label: '¥200-500万', labelEn: '$200K - $500K' },
  { value: 'enterprise', label: '¥500万以上', labelEn: 'Over $500K' },
];

// 渠道数据
const CHANNEL_DATA: Record<string, Record<string, {
  channels: {
    name: string;
    nameEn: string;
    type: 'online' | 'offline' | 'both';
    rating: number;
    investment: { min: number; max: number };
    roi: { min: number; max: number };
    timeline: string;
    pros: string[];
    prosEn: string[];
    cons: string[];
    consEn: string[];
    tips: string;
    tipsEn: string;
  }[];
  recommendation: string;
  recommendationEn: string;
}>> = {
  japan: {
    supplement: {
      channels: [
        {
          name: '药妆店连锁',
          nameEn: 'Drug Store Chains',
          type: 'offline',
          rating: 95,
          investment: { min: 300000, max: 800000 },
          roi: { min: 150, max: 300 },
          timeline: '3-6个月',
          pros: ['客单价高', '信任度高', '陈列优势'],
          prosEn: ['High客单价', 'High trust', 'Display advantage'],
          cons: ['入驻门槛高', '账期较长'],
          consEn: ['High threshold', 'Long payment terms'],
          tips: '推荐松本清、唐吉诃德等连锁',
          tipsEn: 'Recommend Matsumoto Kiyoshi, Don Quijote',
        },
        {
          name: 'Amazon日本',
          nameEn: 'Amazon Japan',
          type: 'online',
          rating: 90,
          investment: { min: 50000, max: 200000 },
          roi: { min: 100, max: 200 },
          timeline: '1-2个月',
          pros: ['流量大', '物流完善', 'FBA服务'],
          prosEn: ['Large traffic', 'Complete logistics', 'FBA service'],
          cons: ['竞争激烈', '佣金较高'],
          consEn: ['Intense competition', 'High commissions'],
          tips: '优化搜索排名和评价',
          tipsEn: 'Optimize search ranking and reviews',
        },
        {
          name: 'Qoo10',
          nameEn: 'Qoo10',
          type: 'online',
          rating: 75,
          investment: { min: 30000, max: 100000 },
          roi: { min: 80, max: 150 },
          timeline: '1个月',
          pros: ['华人用户多', '推广成本低'],
          prosEn: ['Many Chinese users', 'Low promotion cost'],
          cons: ['主要面向华人市场'],
          consEn: ['Mainly Chinese market'],
          tips: '适合初期市场测试',
          tipsEn: 'Good for initial market testing',
        },
      ],
      recommendation: '建议线上线下结合，初期通过Qoo10测试市场，成熟后拓展药妆店渠道',
      recommendationEn: 'Recommend online-offline combination, test market via Qoo10 initially, expand to drug stores later',
    },
    traditional: {
      channels: [
        {
          name: '中医药房',
          nameEn: 'TCM Pharmacies',
          type: 'offline',
          rating: 85,
          investment: { min: 200000, max: 500000 },
          roi: { min: 120, max: 250 },
          timeline: '3-5个月',
          pros: ['目标客群精准', '专业推荐'],
          prosEn: ['Precise target customers', 'Professional recommendation'],
          cons: ['渠道有限', '拓展慢'],
          consEn: ['Limited channels', 'Slow expansion'],
          tips: '优先东京、大阪中华街',
          tipsEn: 'Prioritize Tokyo, Osaka Chinatown',
        },
        {
          name: 'Amazon日本',
          nameEn: 'Amazon Japan',
          type: 'online',
          rating: 80,
          investment: { min: 50000, max: 150000 },
          roi: { min: 80, max: 180 },
          timeline: '1-2个月',
          pros: ['覆盖广泛', 'FBA支持'],
          prosEn: ['Wide coverage', 'FBA support'],
          cons: ['需要日文客服'],
          consEn: ['Need Japanese customer service'],
          tips: '搭配Amazonfresh提升曝光',
          tipsEn: 'Combine with Amazonfresh for exposure',
        },
      ],
      recommendation: '以线上为主，线下中医药房为辅，主攻Amazon平台',
      recommendationEn: 'Focus on online, TCM pharmacies as supplement, focus on Amazon',
    },
    cosmetic: {
      channels: [
        {
          name: '药妆店',
          nameEn: 'Drug Stores',
          type: 'offline',
          rating: 95,
          investment: { min: 200000, max: 600000 },
          roi: { min: 180, max: 350 },
          timeline: '3-6个月',
          pros: ['客流稳定', '试用便利', '品牌展示'],
          prosEn: ['Stable traffic', 'Trial convenient', 'Brand display'],
          cons: ['入场费高', '账期长'],
          consEn: ['High entry fee', 'Long payment terms'],
          tips: '松本清、麒麟堂 COSMOS',
          tipsEn: 'Matsumoto Kiyoshi, Kirindon Cosmos',
        },
        {
          name: 'Rakuten',
          nameEn: 'Rakuten',
          type: 'online',
          rating: 88,
          investment: { min: 80000, max: 250000 },
          roi: { min: 120, max: 220 },
          timeline: '2-3个月',
          pros: ['会员体系强', '促销资源丰富'],
          prosEn: ['Strong member system', 'Rich promotion resources'],
          cons: ['规则复杂', '竞争激烈'],
          consEn: ['Complex rules', 'Intense competition'],
          tips: '参加Rakuten SUPER SALE',
          tipsEn: 'Participate in Rakuten SUPER SALE',
        },
        {
          name: 'Zozo',
          nameEn: 'Zozo',
          type: 'online',
          rating: 82,
          investment: { min: 50000, max: 150000 },
          roi: { min: 100, max: 200 },
          timeline: '1-2个月',
          pros: ['时尚用户多', '服装导流'],
          prosEn: ['Fashion users', 'Fashion traffic'],
          cons: ['主要服装品类'],
          consEn: ['Mainly fashion category'],
          tips: '适合护肤+服装搭配销售',
          tipsEn: 'Good for skincare + fashion bundle',
        },
      ],
      recommendation: '线上Rakuten+Amazon双轨，线下药妆店切入，打造品牌矩阵',
      recommendationEn: 'Online Rakuten + Amazon dual-track, offline drug stores, build brand matrix',
    },
    medical: {
      channels: [
        {
          name: '医疗器械专卖店',
          nameEn: 'Medical Device Stores',
          type: 'offline',
          rating: 90,
          investment: { min: 500000, max: 1500000 },
          roi: { min: 100, max: 200 },
          timeline: '6-12个月',
          pros: ['专业客户', '利润高'],
          prosEn: ['Professional customers', 'High profit'],
          cons: ['门槛极高', '周期长'],
          consEn: ['Very high threshold', 'Long cycle'],
          tips: '需要深厚本地资源',
          tipsEn: 'Requires strong local resources',
        },
        {
          name: '医疗代理经销商',
          nameEn: 'Medical Distributors',
          type: 'offline',
          rating: 85,
          investment: { min: 300000, max: 1000000 },
          roi: { min: 80, max: 150 },
          timeline: '6-12个月',
          pros: ['快速进入医院渠道', '专业推广'],
          prosEn: ['Quick hospital access', 'Professional promotion'],
          cons: ['利润分成', '渠道依赖'],
          consEn: ['Profit sharing', 'Channel dependency'],
          tips: '通过医疗展会结识代理商',
          tipsEn: 'Meet distributors at medical exhibitions',
        },
      ],
      recommendation: '建议通过日本医疗代理经销商进入市场，长期布局',
      recommendationEn: 'Recommend entering via Japanese medical distributors, long-term strategy',
    },
  },
  europe: {
    supplement: {
      channels: [
        {
          name: '线上药店',
          nameEn: 'Online Pharmacies',
          type: 'online',
          rating: 88,
          investment: { min: 80000, max: 250000 },
          roi: { min: 100, max: 200 },
          timeline: '2-4个月',
          pros: ['专业可信', '复购率高'],
          prosEn: ['Professional & trustworthy', 'High repurchase'],
          cons: ['准入审核严'],
          consEn: ['Strict admission review'],
          tips: '德国medpanox、英国Pharmacy2U',
          tipsEn: 'German medpanox, UK Pharmacy2U',
        },
        {
          name: 'Amazon欧盟',
          nameEn: 'Amazon EU',
          type: 'online',
          rating: 85,
          investment: { min: 50000, max: 200000 },
          roi: { min: 80, max: 180 },
          timeline: '2-3个月',
          pros: ['多国销售', '物流覆盖广'],
          prosEn: ['Multi-country sales', 'Wide logistics'],
          cons: ['VAT复杂', '语言多'],
          consEn: ['Complex VAT', 'Multiple languages'],
          tips: '利用泛欧FBA',
          tipsEn: 'Use Pan-European FBA',
        },
      ],
      recommendation: '优先线上渠道，Amazon欧盟+本地线上药店组合',
      recommendationEn: 'Prioritize online channels, Amazon EU + local online pharmacies',
    },
    traditional: {
      channels: [
        {
          name: '中药店/中医馆',
          nameEn: 'TCM Shops',
          type: 'offline',
          rating: 80,
          investment: { min: 150000, max: 400000 },
          roi: { min: 80, max: 150 },
          timeline: '3-6个月',
          pros: ['目标客群精准'],
          prosEn: ['Precise target customers'],
          cons: ['规模小', '拓展慢'],
          consEn: ['Small scale', 'Slow expansion'],
          tips: '伦敦、巴黎、唐人街',
          tipsEn: 'London, Paris, Chinatown',
        },
        {
          name: 'Amazon欧盟',
          nameEn: 'Amazon EU',
          type: 'online',
          rating: 75,
          investment: { min: 50000, max: 150000 },
          roi: { min: 60, max: 120 },
          timeline: '2-3个月',
          pros: ['物流便利'],
          prosEn: ['Convenient logistics'],
          cons: ['认知度低', '推广难'],
          consEn: ['Low awareness', 'Hard to promote'],
          tips: '配合社交媒体营销',
          tipsEn: 'Combine with social media marketing',
        },
      ],
      recommendation: '线下中医馆建立口碑，线上Amazon辅助扩展',
      recommendationEn: 'Build reputation via offline TCM shops, expand via Amazon',
    },
    cosmetic: {
      channels: [
        {
          name: 'Sephora',
          nameEn: 'Sephora',
          type: 'offline',
          rating: 92,
          investment: { min: 300000, max: 800000 },
          roi: { min: 150, max: 300 },
          timeline: '6-12个月',
          pros: ['品牌形象高', '客流精准'],
          prosEn: ['High brand image', 'Precise traffic'],
          cons: ['准入门槛极高'],
          consEn: ['Very high entry threshold'],
          tips: '需有差异化定位',
          tipsEn: 'Need differentiated positioning',
        },
        {
          name: 'Douglas',
          nameEn: 'Douglas',
          type: 'offline',
          rating: 88,
          investment: { min: 200000, max: 500000 },
          roi: { min: 120, max: 250 },
          timeline: '4-8个月',
          pros: ['欧洲多国覆盖', '高端定位'],
          prosEn: ['Multi-country coverage', 'Premium positioning'],
          cons: ['审核周期长'],
          consEn: ['Long review cycle'],
          tips: '德国、奥地利核心市场',
          tipsEn: 'Core markets: Germany, Austria',
        },
        {
          name: 'Amazon欧盟',
          nameEn: 'Amazon EU',
          type: 'online',
          rating: 85,
          investment: { min: 50000, max: 150000 },
          roi: { min: 100, max: 200 },
          timeline: '2-3个月',
          pros: ['启动快', '覆盖广'],
          prosEn: ['Quick start', 'Wide coverage'],
          cons: ['价格战激烈'],
          consEn: ['Intense price wars'],
          tips: 'Clean Beauty概念有优势',
          tipsEn: 'Clean Beauty concept has advantage',
        },
      ],
      recommendation: '高端定位优先Sephora/Douglas，线上作为增量渠道',
      recommendationEn: 'Premium positioning first Sephora/Douglas, online as incremental channel',
    },
    medical: {
      channels: [
        {
          name: '医疗经销商',
          nameEn: 'Medical Distributors',
          type: 'offline',
          rating: 95,
          investment: { min: 500000, max: 2000000 },
          roi: { min: 80, max: 150 },
          timeline: '12-18个月',
          pros: ['医院渠道', '长期合作'],
          prosEn: ['Hospital channels', 'Long-term cooperation'],
          cons: ['门槛极高', '周期长'],
          consEn: ['Very high threshold', 'Long cycle'],
          tips: '通过医疗展会接触',
          tipsEn: 'Contact via medical exhibitions',
        },
      ],
      recommendation: '通过欧盟医疗经销商进入，需有CE认证',
      recommendationEn: 'Enter via EU medical distributors, need CE certification',
    },
  },
  southeast: {
    supplement: {
      channels: [
        {
          name: 'Shopee',
          nameEn: 'Shopee',
          type: 'online',
          rating: 95,
          investment: { min: 20000, max: 80000 },
          roi: { min: 150, max: 300 },
          timeline: '1-2周',
          pros: ['流量巨大', '本土化强', '推广工具有效'],
          prosEn: ['Huge traffic', 'Strong localization', 'Effective promotion tools'],
          cons: ['价格战激烈', '佣金上升'],
          consEn: ['Intense price wars', 'Rising commissions'],
          tips: '参加闪购、直播活动',
          tipsEn: 'Join flash sales, live streaming',
        },
        {
          name: 'Lazada',
          nameEn: 'Lazada',
          type: 'online',
          rating: 88,
          investment: { min: 20000, max: 80000 },
          roi: { min: 120, max: 250 },
          timeline: '1-2周',
          pros: ['阿里系资源', 'LazMall扶持'],
          prosEn: ['Alibaba resources', 'LazMall support'],
          cons: ['覆盖国家有限'],
          consEn: ['Limited country coverage'],
          tips: '重点新加坡、马来、泰国',
          tipsEn: 'Focus on Singapore, Malaysia, Thailand',
        },
        {
          name: '屈臣氏',
          nameEn: 'Watsons',
          type: 'offline',
          rating: 85,
          investment: { min: 100000, max: 300000 },
          roi: { min: 120, max: 250 },
          timeline: '2-4个月',
          pros: ['品牌背书', '客流稳定'],
          prosEn: ['Brand endorsement', 'Stable traffic'],
          cons: ['入场费', '账期'],
          consEn: ['Entry fee', 'Payment terms'],
          tips: '先线上再线下',
          tipsEn: 'Online first then offline',
        },
      ],
      recommendation: 'Shopee+Lazada双平台布局，配合屈臣氏线下渠道',
      recommendationEn: 'Shopee + Lazada dual platform, with Watsons offline',
    },
    traditional: {
      channels: [
        {
          name: 'Shopee/Lazada',
          nameEn: 'Shopee/Lazada',
          type: 'online',
          rating: 90,
          investment: { min: 20000, max: 80000 },
          roi: { min: 120, max: 250 },
          timeline: '1-2周',
          pros: ['华人用户多', '物流完善'],
          prosEn: ['Many Chinese users', 'Complete logistics'],
          cons: ['价格敏感'],
          consEn: ['Price sensitive'],
          tips: '主推养生礼盒装',
          tipsEn: 'Focus on wellness gift boxes',
        },
        {
          name: '余仁生',
          nameEn: 'Eu Yan Sang',
          type: 'offline',
          rating: 88,
          investment: { min: 150000, max: 400000 },
          roi: { min: 100, max: 200 },
          timeline: '3-6个月',
          pros: ['品牌可信', '专业推荐'],
          prosEn: ['Trusted brand', 'Professional recommendation'],
          cons: ['合作门槛高'],
          consEn: ['High cooperation threshold'],
          tips: '马来西亚、新加坡重点',
          tipsEn: 'Focus on Malaysia, Singapore',
        },
      ],
      recommendation: '电商平台主推，余仁生作为线下高端渠道',
      recommendationEn: 'E-commerce as main, Eu Yan Sang as premium offline channel',
    },
    cosmetic: {
      channels: [
        {
          name: 'Shopee/Lazada',
          nameEn: 'Shopee/Lazada',
          type: 'online',
          rating: 95,
          investment: { min: 20000, max: 80000 },
          roi: { min: 150, max: 350 },
          timeline: '1-2周',
          pros: ['美妆品类流量大', '社交电商支持'],
          prosEn: ['Large beauty traffic', 'Social e-commerce support'],
          cons: ['价格战激烈'],
          consEn: ['Intense price wars'],
          tips: '直播带货+KOL合作',
          tipsEn: 'Live streaming + KOL collaboration',
        },
        {
          name: 'Sephora线上',
          nameEn: 'Sephora Online',
          type: 'online',
          rating: 85,
          investment: { min: 50000, max: 150000 },
          roi: { min: 100, max: 200 },
          timeline: '2-3个月',
          pros: ['品牌形象高端'],
          prosEn: ['Premium brand image'],
          cons: ['准入审核严'],
          consEn: ['Strict admission review'],
          tips: '需有差异化定位',
          tipsEn: 'Need differentiated positioning',
        },
      ],
      recommendation: 'Shopee/Lazada社交电商为主，高端产品走Sephora',
      recommendationEn: 'Shopee/Lazada social e-commerce main, premium via Sephora',
    },
    medical: {
      channels: [
        {
          name: '医疗设备代理',
          nameEn: 'Medical Equipment Agents',
          type: 'offline',
          rating: 90,
          investment: { min: 300000, max: 1000000 },
          roi: { min: 80, max: 150 },
          timeline: '6-12个月',
          pros: ['医院渠道', '专业推广'],
          prosEn: ['Hospital channels', 'Professional promotion'],
          cons: ['门槛高', '周期长'],
          consEn: ['High threshold', 'Long cycle'],
          tips: '通过医疗展会接触',
          tipsEn: 'Contact via medical exhibitions',
        },
      ],
      recommendation: '通过当地医疗设备代理商进入医院渠道',
      recommendationEn: 'Enter hospital channels via local medical equipment agents',
    },
  },
  australia: {
    supplement: {
      channels: [
        {
          name: 'Chemist Warehouse',
          nameEn: 'Chemist Warehouse',
          type: 'offline',
          rating: 95,
          investment: { min: 200000, max: 500000 },
          roi: { min: 150, max: 300 },
          timeline: '3-6个月',
          pros: ['最大连锁', '客流大', '议价能力强'],
          prosEn: ['Largest chain', 'Large traffic', 'Strong bargaining'],
          cons: ['账期长', '要求高'],
          consEn: ['Long payment terms', 'High requirements'],
          tips: 'TGA认证是前提',
          tipsEn: 'TGA certification prerequisite',
        },
        {
          name: 'Amazon澳洲',
          nameEn: 'Amazon Australia',
          type: 'online',
          rating: 82,
          investment: { min: 40000, max: 120000 },
          roi: { min: 80, max: 180 },
          timeline: '1-2个月',
          pros: ['流量增长快', 'FBA支持'],
          prosEn: ['Fast growing traffic', 'FBA support'],
          cons: ['市场较小'],
          consEn: ['Smaller market'],
          tips: '配合站外引流',
          tipsEn: 'Combine with off-site traffic',
        },
      ],
      recommendation: '线下Chemist Warehouse为主，Amazon为线上补充',
      recommendationEn: 'Offline Chemist Warehouse main, Amazon as online supplement',
    },
    traditional: {
      channels: [
        {
          name: '健康品店',
          nameEn: 'Health Food Stores',
          type: 'offline',
          rating: 85,
          investment: { min: 100000, max: 300000 },
          roi: { min: 100, max: 200 },
          timeline: '2-4个月',
          pros: ['目标客群精准'],
          prosEn: ['Precise target customers'],
          cons: ['规模有限'],
          consEn: ['Limited scale'],
          tips: '主要城市健康品连锁',
          tipsEn: 'Major city health food chains',
        },
        {
          name: 'Amazon澳洲',
          nameEn: 'Amazon Australia',
          type: 'online',
          rating: 78,
          investment: { min: 30000, max: 100000 },
          roi: { min: 60, max: 120 },
          timeline: '1-2个月',
          pros: ['覆盖广'],
          prosEn: ['Wide coverage'],
          cons: ['竞争增加'],
          consEn: ['Increasing competition'],
          tips: '配合社交媒体',
          tipsEn: 'Combine with social media',
        },
      ],
      recommendation: '线下健康品店+线上Amazon组合',
      recommendationEn: 'Offline health food stores + online Amazon',
    },
    cosmetic: {
      channels: [
        {
          name: 'Mecca',
          nameEn: 'Mecca',
          type: 'offline',
          rating: 92,
          investment: { min: 200000, max: 500000 },
          roi: { min: 150, max: 300 },
          timeline: '4-8个月',
          pros: ['高端美妆领先', '品牌形象好'],
          prosEn: ['Premium beauty leader', 'Good brand image'],
          cons: ['准入严格'],
          consEn: ['Strict admission'],
          tips: '需有独特卖点',
          tipsEn: 'Need unique selling points',
        },
        {
          name: 'Adore Beauty',
          nameEn: 'Adore Beauty',
          type: 'online',
          rating: 88,
          investment: { min: 40000, max: 120000 },
          roi: { min: 100, max: 200 },
          timeline: '1-2个月',
          pros: ['专业美妆电商'],
          prosEn: ['Professional beauty e-commerce'],
          cons: ['流量有限'],
          consEn: ['Limited traffic'],
          tips: '适合中高端定位',
          tipsEn: 'Suitable for mid-premium positioning',
        },
      ],
      recommendation: 'Mecca线下+Adore Beauty线上组合',
      recommendationEn: 'Mecca offline + Adore Beauty online',
    },
    medical: {
      channels: [
        {
          name: '医疗设备经销商',
          nameEn: 'Medical Device Distributors',
          type: 'offline',
          rating: 95,
          investment: { min: 500000, max: 1500000 },
          roi: { min: 80, max: 150 },
          timeline: '6-12个月',
          pros: ['医院渠道', '专业推广'],
          prosEn: ['Hospital channels', 'Professional promotion'],
          cons: ['门槛高'],
          consEn: ['High threshold'],
          tips: '需TGA认证',
          tipsEn: 'Need TGA certification',
        },
      ],
      recommendation: '通过TGA认证后进入医疗设备经销商渠道',
      recommendationEn: 'Enter medical device distributor channels after TGA certification',
    },
  },
  middleeast: {
    supplement: {
      channels: [
        {
          name: 'Noon',
          nameEn: 'Noon',
          type: 'online',
          rating: 90,
          investment: { min: 30000, max: 100000 },
          roi: { min: 120, max: 250 },
          timeline: '1-2个月',
          pros: ['中东最大电商', 'HALAL支持'],
          prosEn: ['Largest Middle East e-commerce', 'HALAL support'],
          cons: ['物流挑战'],
          consEn: ['Logistics challenges'],
          tips: '阿联酋、沙特优先',
          tipsEn: 'Focus on UAE, Saudi',
        },
        {
          name: 'Carrefour中东',
          nameEn: 'Carrefour Middle East',
          type: 'offline',
          rating: 85,
          investment: { min: 150000, max: 400000 },
          roi: { min: 100, max: 200 },
          timeline: '3-6个月',
          pros: ['大型连锁', '客流大'],
          prosEn: ['Large chain', 'Large traffic'],
          cons: ['入场费高'],
          consEn: ['High entry fee'],
          tips: '需HALAL认证',
          tipsEn: 'Need HALAL certification',
        },
      ],
      recommendation: 'Noon线上为主，Carrefour线下为辅',
      recommendationEn: 'Noon online main, Carrefour offline supplement',
    },
    traditional: {
      channels: [
        {
          name: '中药店',
          nameEn: 'TCM Shops',
          type: 'offline',
          rating: 75,
          investment: { min: 100000, max: 300000 },
          roi: { min: 80, max: 150 },
          timeline: '3-5个月',
          pros: ['华人市场'],
          prosEn: ['Chinese market'],
          cons: ['规模小'],
          consEn: ['Small scale'],
          tips: '迪拜、龙城',
          tipsEn: 'Dubai, Dragon Mart',
        },
        {
          name: 'Noon',
          nameEn: 'Noon',
          type: 'online',
          rating: 80,
          investment: { min: 30000, max: 100000 },
          roi: { min: 80, max: 180 },
          timeline: '1-2个月',
          pros: ['覆盖广泛'],
          prosEn: ['Wide coverage'],
          cons: ['需推广'],
          consEn: ['Need promotion'],
          tips: '配合阿拉伯语客服',
          tipsEn: 'Combine with Arabic customer service',
        },
      ],
      recommendation: '线下中药店+线上Noon组合',
      recommendationEn: 'Offline TCM shops + online Noon',
    },
    cosmetic: {
      channels: [
        {
          name: 'Sephora中东',
          nameEn: 'Sephora Middle East',
          type: 'offline',
          rating: 92,
          investment: { min: 250000, max: 600000 },
          roi: { min: 150, max: 300 },
          timeline: '4-8个月',
          pros: ['高端形象', '消费力强'],
          prosEn: ['Premium image', 'Strong purchasing power'],
          cons: ['准入严格'],
          consEn: ['Strict admission'],
          tips: '需HALAL+高端定位',
          tipsEn: 'Need HALAL + premium positioning',
        },
        {
          name: 'Noon',
          nameEn: 'Noon',
          type: 'online',
          rating: 88,
          investment: { min: 30000, max: 100000 },
          roi: { min: 120, max: 250 },
          timeline: '1-2个月',
          pros: ['流量大', 'HALAL支持'],
          prosEn: ['Large traffic', 'HALAL support'],
          cons: ['价格竞争'],
          consEn: ['Price competition'],
          tips: '主推高端礼盒',
          tipsEn: 'Focus on premium gift boxes',
        },
      ],
      recommendation: 'Sephora高端渠道+Noon大众渠道组合',
      recommendationEn: 'Sephora premium channel + Noon mass channel',
    },
    medical: {
      channels: [
        {
          name: '医疗设备代理',
          nameEn: 'Medical Device Agents',
          type: 'offline',
          rating: 90,
          investment: { min: 400000, max: 1200000 },
          roi: { min: 80, max: 150 },
          timeline: '6-12个月',
          pros: ['医院渠道', '高利润'],
          prosEn: ['Hospital channels', 'High profit'],
          cons: ['门槛高'],
          consEn: ['High threshold'],
          tips: '阿联酋医疗展会',
          tipsEn: 'UAE medical exhibitions',
        },
      ],
      recommendation: '通过阿联酋医疗设备代理商进入',
      recommendationEn: 'Enter via UAE medical device agents',
    },
  },
  usa: {
    supplement: {
      channels: [
        {
          name: 'Amazon美国',
          nameEn: 'Amazon US',
          type: 'online',
          rating: 95,
          investment: { min: 80000, max: 300000 },
          roi: { min: 100, max: 200 },
          timeline: '1-2个月',
          pros: ['全球最大市场', 'FBA完善'],
          prosEn: ['Largest global market', 'Complete FBA'],
          cons: ['竞争极其激烈'],
          consEn: ['Extremely intense competition'],
          tips: '差异化定位+评价积累',
          tipsEn: 'Differentiated positioning + review accumulation',
        },
        {
          name: 'iHerb',
          nameEn: 'iHerb',
          type: 'online',
          rating: 88,
          investment: { min: 50000, max: 150000 },
          roi: { min: 80, max: 180 },
          timeline: '1-2个月',
          pros: ['健康品类专业', '自然流量'],
          prosEn: ['Health category professional', 'Organic traffic'],
          cons: ['审核严格'],
          consEn: ['Strict review'],
          tips: '需美国仓发货',
          tipsEn: 'Need US warehouse delivery',
        },
        {
          name: 'GNC',
          nameEn: 'GNC',
          type: 'offline',
          rating: 85,
          investment: { min: 300000, max: 800000 },
          roi: { min: 120, max: 250 },
          timeline: '6-12个月',
          pros: ['品牌背书', '专业客户'],
          prosEn: ['Brand endorsement', 'Professional customers'],
          cons: ['门槛极高'],
          consEn: ['Very high threshold'],
          tips: '需美国本地公司',
          tipsEn: 'Need US local company',
        },
      ],
      recommendation: 'Amazon+iHerb双线上渠道，GNC作为长期目标',
      recommendationEn: 'Amazon + iHerb dual online channels, GNC as long-term goal',
    },
    traditional: {
      channels: [
        {
          name: 'Amazon美国',
          nameEn: 'Amazon US',
          type: 'online',
          rating: 80,
          investment: { min: 50000, max: 150000 },
          roi: { min: 60, max: 120 },
          timeline: '1-2个月',
          pros: ['华人市场大'],
          prosEn: ['Large Chinese market'],
          cons: ['认知度低'],
          consEn: ['Low awareness'],
          tips: '配合社交媒体营销',
          tipsEn: 'Combine with social media marketing',
        },
        {
          name: '中药店',
          nameEn: 'TCM Shops',
          type: 'offline',
          rating: 75,
          investment: { min: 150000, max: 400000 },
          roi: { min: 80, max: 150 },
          timeline: '3-6个月',
          pros: ['目标客群精准'],
          prosEn: ['Precise target customers'],
          cons: ['规模有限'],
          consEn: ['Limited scale'],
          tips: '洛杉矶、纽约唐人街',
          tipsEn: 'Los Angeles, New York Chinatown',
        },
      ],
      recommendation: 'Amazon线上+线下中药店组合',
      recommendationEn: 'Amazon online + offline TCM shops',
    },
    cosmetic: {
      channels: [
        {
          name: 'Amazon美国',
          nameEn: 'Amazon US',
          type: 'online',
          rating: 95,
          investment: { min: 80000, max: 250000 },
          roi: { min: 120, max: 250 },
          timeline: '1-2个月',
          pros: ['最大美妆电商', '流量巨大'],
          prosEn: ['Largest beauty e-commerce', 'Huge traffic'],
          cons: ['竞争激烈'],
          consEn: ['Intense competition'],
          tips: 'Clean Beauty差异化',
          tipsEn: 'Clean Beauty differentiation',
        },
        {
          name: 'Sephora',
          nameEn: 'Sephora',
          type: 'offline',
          rating: 90,
          investment: { min: 400000, max: 1000000 },
          roi: { min: 150, max: 300 },
          timeline: '8-18个月',
          pros: ['品牌形象最高', '高端客户'],
          prosEn: ['Highest brand image', 'Premium customers'],
          cons: ['准入极其严格'],
          consEn: ['Extremely strict admission'],
          tips: '需有独特故事',
          tipsEn: 'Need unique story',
        },
        {
          name: 'Ulta Beauty',
          nameEn: 'Ulta Beauty',
          type: 'offline',
          rating: 88,
          investment: { min: 250000, max: 600000 },
          roi: { min: 120, max: 250 },
          timeline: '6-12个月',
          pros: ['覆盖广', '高中低端'],
          prosEn: ['Wide coverage', 'High-mid-low end'],
          cons: ['竞争激烈'],
          consEn: ['Intense competition'],
          tips: '定位中高端',
          tipsEn: 'Position mid-premium',
        },
      ],
      recommendation: 'Amazon为主攻渠道，Ulta作为线下切入点，Sephora为长期目标',
      recommendationEn: 'Amazon as main channel, Ulta as offline entry, Sephora as long-term goal',
    },
    medical: {
      channels: [
        {
          name: '医疗设备经销商',
          nameEn: 'Medical Device Distributors',
          type: 'offline',
          rating: 95,
          investment: { min: 800000, max: 3000000 },
          roi: { min: 80, max: 150 },
          timeline: '12-24个月',
          pros: ['医院渠道', '高利润'],
          prosEn: ['Hospital channels', 'High profit'],
          cons: ['门槛极高', 'FDA认证难'],
          consEn: ['Very high threshold', 'FDA certification difficult'],
          tips: '通过医疗展会+专业代理',
          tipsEn: 'Via medical exhibitions + professional agents',
        },
      ],
      recommendation: '需要FDA认证，通过专业医疗经销商进入',
      recommendationEn: 'Need FDA certification, enter via professional medical distributors',
    },
  },
};

export default function ChannelMatch() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  // 从上下文获取选中的市场
  const { selectedMarket: contextMarket } = useMarket();

  // 将选中的市场映射到区域（用于获取数据）
  const getRegionKey = () => {
    if (!contextMarket) return 'japan';
    const regionMap: Record<string, string> = {
      usa: 'usa', canada: 'usa', mexico: 'usa',
      germany: 'europe', france: 'europe', uk: 'europe', italy: 'europe', spain: 'europe', netherlands: 'europe',
      japan: 'japan', australia: 'australia',
      southkorea: 'southeast', singapore: 'southeast', hongkong: 'southeast', taiwan: 'southeast', nz: 'australia',
      indonesia: 'southeast', thailand: 'southeast', vietnam: 'southeast', malaysia: 'southeast', philippines: 'southeast', myanmar: 'southeast',
      saudiarabia: 'middleeast', uae: 'middleeast', israel: 'middleeast', qatar: 'middleeast', turkey: 'middleeast',
    };
    return regionMap[contextMarket.id] || 'japan';
  };

  const regionKey = getRegionKey();

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState('supplement');
  const [selectedBudget, setSelectedBudget] = useState('medium');

  // 获取当前数据
  const currentData = useMemo(() => {
    return CHANNEL_DATA[regionKey]?.[selectedCategory] || {
      channels: [],
      recommendation: isZh ? '暂无推荐' : 'No recommendation',
      recommendationEn: 'No recommendation',
    };
  }, [regionKey, selectedCategory, isZh]);

  // 根据预算筛选渠道
  const filteredChannels = useMemo(() => {
    const budgetRanges = {
      low: { max: 50000 },
      medium: { min: 50000, max: 200000 },
      high: { min: 200000, max: 500000 },
      enterprise: { min: 500000 },
    };
    const range = budgetRanges[selectedBudget as keyof typeof budgetRanges] as { min?: number; max?: number };
    
    return currentData.channels.filter(ch => {
      const minInv = ch.investment.min;
      if (range.max !== undefined && minInv > range.max) return false;
      if (range.min !== undefined && minInv < range.min) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating);
  }, [currentData, selectedBudget]);

  return (
    <div className="p-6 animate-fadeIn">
      {/* 显示当前选中市场 */}
      {contextMarket && (
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full">
            <span className="text-xl">{contextMarket.flag}</span>
            <span className="font-medium">{isZh ? contextMarket.name : contextMarket.nameEn}</span>
            <span className="text-sm text-cyan-600">({isZh ? '渠道推荐' : 'Channel Match'})</span>
          </span>
        </div>
      )}

      {/* 筛选栏 */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 产品类别 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {isZh ? '产品类别' : 'Product Category'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none bg-white"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {isZh ? cat.label : cat.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* 预算区间 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {isZh ? '预算区间' : 'Budget Range'}
            </label>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none bg-white"
            >
              {BUDGET_RANGES.map(budget => (
                <option key={budget.value} value={budget.value}>
                  {isZh ? budget.label : budget.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 渠道列表 */}
      <div className="space-y-4 mb-6">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-cyan-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    channel.type === 'online' ? 'bg-blue-100' : 
                    channel.type === 'offline' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {channel.type === 'online' ? (
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    ) : channel.type === 'offline' ? (
                      <Store className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Globe className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {isZh ? channel.name : channel.nameEn}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        channel.type === 'online' ? 'bg-blue-50 text-blue-600' :
                        channel.type === 'offline' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {channel.type === 'online' ? (isZh ? '线上' : 'Online') :
                         channel.type === 'offline' ? (isZh ? '线下' : 'Offline') : (isZh ? '线上+线下' : 'Online+Offline')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-cyan-600 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    {channel.rating}%
                  </div>
                  <div className="text-xs text-gray-400">{isZh ? '推荐指数' : 'Rating'}</div>
                </div>
              </div>

              {/* 关键指标 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-xs">{isZh ? '投资' : 'Investment'}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${(channel.investment.min / 10000).toFixed(0)}-${(channel.investment.max / 10000).toFixed(0)}万
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">ROI</span>
                  </div>
                  <div className="text-sm font-medium text-emerald-600">
                    {channel.roi.min}-{channel.roi.max}%
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{isZh ? '周期' : 'Timeline'}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {channel.timeline}
                  </div>
                </div>
              </div>

              {/* 优缺点 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs font-medium text-emerald-600 mb-2">{isZh ? '优势' : 'Pros'}</div>
                  <ul className="space-y-1">
                    {(isZh ? channel.pros : channel.prosEn).map((pro, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-medium text-amber-600 mb-2">{isZh ? '挑战' : 'Challenges'}</div>
                  <ul className="space-y-1">
                    {(isZh ? channel.cons : channel.consEn).map((con, i) => (
                      <li key={i} className="flex items-start gap-1 text-xs text-gray-600">
                        <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 小贴士 */}
              <div className="bg-cyan-50 rounded-lg p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-sm text-cyan-700">
                  <span className="font-medium">{isZh ? '建议' : 'Tip'}:</span> {isZh ? channel.tips : channel.tipsEn}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{isZh ? '暂无匹配的渠道' : 'No matching channels'}</p>
          </div>
        )}
      </div>

      {/* AI 综合建议 */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">{isZh ? '综合建议' : 'Comprehensive Suggestion'}</div>
            <div className="text-sm text-white/90">
              {isZh ? currentData.recommendation : currentData.recommendationEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
