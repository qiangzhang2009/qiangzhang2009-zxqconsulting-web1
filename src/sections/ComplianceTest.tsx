/**
 * 合规自测板块 - 产品合规准入评估
 * 设计理念: 选择输入、实时评估、结果可视化
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCheck,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useMarket } from './aiToolsMarketContext';

// 产品类别
const PRODUCT_CATEGORIES = [
  { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
  { value: 'traditional', label: '中医药饮片', labelEn: 'TCM Products' },
  { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
  { value: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
];

// 成分选项
const INGREDIENTS = [
  { value: 'herbal', label: '草本植物', labelEn: 'Herbal' },
  { value: 'animal', label: '动物成分', labelEn: 'Animal Derived' },
  { value: 'mineral', label: '矿物成分', labelEn: 'Mineral' },
  { value: 'synthetic', label: '合成成分', labelEn: 'Synthetic' },
  { value: 'mixed', label: '混合成分', labelEn: 'Mixed' },
];

// 合规评估数据
const COMPLIANCE_DATA: Record<string, Record<string, {
  allowed: boolean;
  score: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  categoryEn: string;
  requirements: string[];
  requirementsEn: string[];
  timeline: string;
  timelineEn: string;
  cost: { min: number; max: number };
  certificate: string;
  certificateEn: string;
  tips: string;
  tipsEn: string;
}>> = {
  japan: {
    supplement: {
      allowed: true,
      score: 75,
      risk: 'medium',
      category: '特定保健食品',
      categoryEn: 'Food for Specified Health Uses',
      requirements: ['PMDA注册', '功效成分检测', '生产资质证明', '日文标签'],
      requirementsEn: ['PMDA registration', 'Efficacy component testing', 'Production qualification', 'Japanese labeling'],
      timeline: '12-18个月',
      timelineEn: '12-18 months',
      cost: { min: 80000, max: 250000 },
      certificate: '特定保健食品许可',
      certificateEn: 'FOSHU Approval',
      tips: '建议从特定保健食品入手，比医药品门槛低',
      tipsEn: 'Recommend starting with FOSHU, lower barrier than pharmaceuticals',
    },
    traditional: {
      allowed: true,
      score: 55,
      risk: 'high',
      category: '医药品',
      categoryEn: 'Pharmaceuticals',
      requirements: ['PMDA医药品注册', '药效试验数据', '临床试验', '质量标准证明'],
      requirementsEn: ['PMDA pharmaceutical registration', 'Efficacy test data', 'Clinical trials', 'Quality standard proof'],
      timeline: '18-36个月',
      timelineEn: '18-36 months',
      cost: { min: 200000, max: 600000 },
      certificate: '医药品许可',
      certificateEn: 'Pharmaceutical Approval',
      tips: '需提供30年以上使用历史证明，建议从食品补充剂切入',
      tipsEn: 'Requires 30+ years usage history, recommend starting as food supplements',
    },
    cosmetic: {
      allowed: true,
      score: 85,
      risk: 'low',
      category: '医药部外品/普通化妆品',
      categoryEn: 'Quasi-drug / General Cosmetics',
      requirements: ['PMDA备案', '安全性评估', '功效成分说明', '日文标签'],
      requirementsEn: ['PMDA notification', 'Safety assessment', 'Efficacy ingredient description', 'Japanese labeling'],
      timeline: '3-12个月',
      timelineEn: '3-12 months',
      cost: { min: 15000, max: 60000 },
      certificate: '化妆品届入许可',
      certificateEn: 'Cosmetics Import Approval',
      tips: '普通化妆品门槛最低，本草概念有优势',
      tipsEn: 'General cosmetics have lowest barrier, herbal concept has advantage',
    },
    medical: {
      allowed: true,
      score: 45,
      risk: 'high',
      category: '医疗器械',
      categoryEn: 'Medical Devices',
      requirements: ['PMDA认证', '技术文件', '临床评估', '质量管理体系'],
      requirementsEn: ['PMDA certification', 'Technical documentation', 'Clinical evaluation', 'QMS'],
      timeline: '12-36个月',
      timelineEn: '12-36 months',
      cost: { min: 150000, max: 800000 },
      certificate: '医疗器械认证',
      certificateEn: 'Medical Device Certification',
      tips: '建议与日本经销商合作，借用其认证资质',
      tipsEn: 'Recommend partnering with Japanese distributors with certification',
    },
  },
  europe: {
    supplement: {
      allowed: true,
      score: 78,
      risk: 'medium',
      category: '食品补充剂',
      categoryEn: 'Food Supplements',
      requirements: ['EFSA批准', '功效声称验证', '生产GMP认证', '欧盟授权代表'],
      requirementsEn: ['EFSA approval', 'Health claim verification', 'GMP certification', 'EU authorized representative'],
      timeline: '6-15个月',
      timelineEn: '6-15 months',
      cost: { min: 50000, max: 150000 },
      certificate: 'CE食品补充剂注册',
      certificateEn: 'CE Food Supplement Registration',
      tips: '功效声称是关键难点，建议委托专业机构办理',
      tipsEn: 'Health claims are key challenge, recommend using professional services',
    },
    traditional: {
      allowed: true,
      score: 50,
      risk: 'high',
      category: '传统草药制品',
      categoryEn: 'Traditional Herbal Medicinal Products',
      requirements: ['THMPD注册', '30年使用历史证明', '质量标准', '传统使用证据'],
      requirementsEn: ['THMPD registration', '30 years usage history', 'Quality standards', 'Traditional use evidence'],
      timeline: '12-24个月',
      timelineEn: '12-24 months',
      cost: { min: 80000, max: 250000 },
      certificate: 'THMPD注册证书',
      certificateEn: 'THMPD Registration',
      tips: '注册难度高，可考虑作为食品补充剂销售',
      tipsEn: 'High difficulty, consider selling as food supplements',
    },
    cosmetic: {
      allowed: true,
      score: 90,
      risk: 'low',
      category: '化妆品',
      categoryEn: 'Cosmetics',
      requirements: ['CPNP通报', '安全评估报告', '产品信息文件', ' Responsible Person'],
      requirementsEn: ['CPNP notification', 'Safety assessment report', 'PIF', 'Responsible Person'],
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      cost: { min: 5000, max: 20000 },
      certificate: 'CPNP通报号',
      certificateEn: 'CPNP Notification Number',
      tips: '流程相对简单，可快速进入市场',
      tipsEn: 'Relatively simple process, can enter market quickly',
    },
    medical: {
      allowed: true,
      score: 40,
      risk: 'high',
      category: '医疗器械',
      categoryEn: 'Medical Devices',
      requirements: ['MDR合规', '公告机构审核', '技术文件', '临床评估'],
      requirementsEn: ['MDR compliance', 'Notified Body audit', 'Technical documentation', 'Clinical evaluation'],
      timeline: '12-36个月',
      timelineEn: '12-36 months',
      cost: { min: 100000, max: 500000 },
      certificate: 'CE认证',
      certificateEn: 'CE Certification',
      tips: 'MDR法规趋严，建议提前准备技术文件',
      tipsEn: 'MDR regulations tightening, recommend preparing technical documents early',
    },
  },
  southeast: {
    supplement: {
      allowed: true,
      score: 82,
      risk: 'low',
      category: '保健食品',
      categoryEn: 'Health Supplements',
      requirements: ['各国注册', '检测报告', '进口许可', '标签合规'],
      requirementsEn: ['Country registration', 'Test reports', 'Import license', 'Labeling compliance'],
      timeline: '3-9个月',
      timelineEn: '3-9 months',
      cost: { min: 15000, max: 50000 },
      certificate: '各国保健食品注册',
      certificateEn: 'Country Health Product Registration',
      tips: '各国法规不同，可多国同时申请',
      tipsEn: 'Different regulations per country, can apply to multiple countries simultaneously',
    },
    traditional: {
      allowed: true,
      score: 75,
      risk: 'low',
      category: '中药材/中成药',
      categoryEn: 'Chinese Medicine',
      requirements: ['各国药品注册', '质量标准', 'HALAL认证(马来西亚)', '进口许可'],
      requirementsEn: ['Country drug registration', 'Quality standards', 'HALAL certification (Malaysia)', 'Import license'],
      timeline: '4-10个月',
      timelineEn: '4-10 months',
      cost: { min: 20000, max: 60000 },
      certificate: '药品注册证',
      certificateEn: 'Drug Registration Certificate',
      tips: '华人市场接受度高，马来西亚需HALAL认证',
      tipsEn: 'High acceptance in Chinese market, HALAL required for Malaysia',
    },
    cosmetic: {
      allowed: true,
      score: 88,
      risk: 'low',
      category: '化妆品',
      categoryEn: 'Cosmetics',
      requirements: ['各国化妆品注册', '检测报告', '标签合规'],
      requirementsEn: ['Country cosmetics registration', 'Test reports', 'Labeling compliance'],
      timeline: '2-6个月',
      timelineEn: '2-6 months',
      cost: { min: 8000, max: 30000 },
      certificate: '化妆品通知/注册',
      certificateEn: 'Cosmetics Notification/Registration',
      tips: '电商渠道活跃，可快速布局',
      tipsEn: 'Active e-commerce channels, can deploy quickly',
    },
    medical: {
      allowed: true,
      score: 60,
      risk: 'medium',
      category: '医疗器械',
      categoryEn: 'Medical Devices',
      requirements: ['各国注册', '质量体系认证', '产品测试', '本地代理'],
      requirementsEn: ['Country registration', 'QMS certification', 'Product testing', 'Local agent'],
      timeline: '6-15个月',
      timelineEn: '6-15 months',
      cost: { min: 30000, max: 100000 },
      certificate: '医疗器械注册证',
      certificateEn: 'Medical Device Registration',
      tips: '建议从新加坡起步，辐射周边国家',
      tipsEn: 'Recommend starting from Singapore, radiating to neighboring countries',
    },
  },
  australia: {
    supplement: {
      allowed: true,
      score: 76,
      risk: 'medium',
      category: '补充药品',
      categoryEn: 'Complementary Medicines',
      requirements: ['ARTG注册', 'TGA审批', 'GMP认证', '标签合规'],
      requirementsEn: ['ARTG registration', 'TGA approval', 'GMP certification', 'Labeling compliance'],
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      cost: { min: 30000, max: 80000 },
      certificate: 'ARTG注册证',
      certificateEn: 'ARTG Registration',
      tips: 'TGA认证国际认可度高，可作为跳板',
      tipsEn: 'TGA certification internationally recognized, can be stepping stone',
    },
    traditional: {
      allowed: true,
      score: 68,
      risk: 'medium',
      category: '补充药品',
      categoryEn: 'Complementary Medicines',
      requirements: ['ARTG注册', '传统使用证明', '质量标准'],
      requirementsEn: ['ARTG registration', 'Traditional use evidence', 'Quality standards'],
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      cost: { min: 35000, max: 90000 },
      certificate: 'ARTG注册证',
      certificateEn: 'ARTG Registration',
      tips: '澳大利亚市场可作为产品功效背书',
      tipsEn: 'Australian market can serve as product efficacy endorsement',
    },
    cosmetic: {
      allowed: true,
      score: 92,
      risk: 'low',
      category: '化妆品',
      categoryEn: 'Cosmetics',
      requirements: ['CCN通报', '安全评估', '标签合规'],
      requirementsEn: ['CCN notification', 'Safety assessment', 'Labeling compliance'],
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      cost: { min: 3000, max: 10000 },
      certificate: 'CCN通知号',
      certificateEn: 'CCN Notification Number',
      tips: '流程最简，天然有机概念有溢价优势',
      tipsEn: 'Simplest process, natural/organic concepts have premium advantage',
    },
    medical: {
      allowed: true,
      score: 55,
      risk: 'medium',
      category: '医疗器械',
      categoryEn: 'Medical Devices',
      requirements: ['TGA注册', '质量体系认证', '临床评估'],
      requirementsEn: ['TGA registration', 'QMS certification', 'Clinical evaluation'],
      timeline: '9-18个月',
      timelineEn: '9-18 months',
      cost: { min: 50000, max: 150000 },
      certificate: 'TGA注册证',
      certificateEn: 'TGA Registration',
      tips: '与当地经销商合作可加速准入',
      tipsEn: 'Partnering with local distributors can accelerate access',
    },
  },
  middleeast: {
    supplement: {
      allowed: true,
      score: 80,
      risk: 'low',
      category: '保健食品',
      categoryEn: 'Health Supplements',
      requirements: ['ESMA注册', 'HALAL认证', '检测报告', '阿拉伯语标签'],
      requirementsEn: ['ESMA registration', 'HALAL certification', 'Test reports', 'Arabic labeling'],
      timeline: '4-8个月',
      timelineEn: '4-8 months',
      cost: { min: 15000, max: 45000 },
      certificate: 'ESMA注册证书',
      certificateEn: 'ESMA Registration Certificate',
      tips: 'HALAL认证是关键，建议优先申请',
      tipsEn: 'HALAL certification is key, recommend applying first',
    },
    traditional: {
      allowed: true,
      score: 65,
      risk: 'medium',
      category: '传统药品',
      categoryEn: 'Traditional Medicines',
      requirements: ['进口许可', 'HALAL认证', '质量标准', '阿语标签'],
      requirementsEn: ['Import license', 'HALAL certification', 'Quality standards', 'Arabic labeling'],
      timeline: '4-10个月',
      timelineEn: '4-10 months',
      cost: { min: 20000, max: 55000 },
      certificate: '进口许可',
      certificateEn: 'Import License',
      tips: '阿联酋对中药管理相对开放',
      tipsEn: 'UAE relatively open to TCM',
    },
    cosmetic: {
      allowed: true,
      score: 85,
      risk: 'low',
      category: '化妆品',
      categoryEn: 'Cosmetics',
      requirements: ['GCC注册', 'HALAL认证', '安全评估', '阿语标签'],
      requirementsEn: ['GCC registration', 'HALAL certification', 'Safety assessment', 'Arabic labeling'],
      timeline: '2-5个月',
      timelineEn: '2-5 months',
      cost: { min: 10000, max: 35000 },
      certificate: 'GCC化妆品注册',
      certificateEn: 'GCC Cosmetics Registration',
      tips: '高端定位、本草概念有差异化优势',
      tipsEn: 'Premium positioning, herbal concept has differentiation advantage',
    },
    medical: {
      allowed: true,
      score: 58,
      risk: 'medium',
      category: '医疗器械',
      categoryEn: 'Medical Devices',
      requirements: ['SFDA/ESMA注册', '质量体系认证', '产品测试'],
      requirementsEn: ['SFDA/ESMA registration', 'QMS certification', 'Product testing'],
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      cost: { min: 35000, max: 100000 },
      certificate: '医疗器械注册证',
      certificateEn: 'Medical Device Registration',
      tips: '建议以阿联酋为基地辐射海湾国家',
      tipsEn: 'Recommend using UAE as base to radiate Gulf countries',
    },
  },
  usa: {
    supplement: {
      allowed: true,
      score: 72,
      risk: 'medium',
      category: '膳食补充剂',
      categoryEn: 'Dietary Supplements',
      requirements: ['FDA备案', 'DSHEA合规', 'GMP认证', '成分标识'],
      requirementsEn: ['FDA registration', 'DSHEA compliance', 'GMP certification', 'Ingredient labeling'],
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      cost: { min: 20000, max: 60000 },
      certificate: 'FDA facility registration',
      certificateEn: 'FDA Facility Registration',
      tips: '上市前无需审批，但需确保成分合规',
      tipsEn: 'No pre-market approval needed, but ensure ingredient compliance',
    },
    traditional: {
      allowed: true,
      score: 35,
      risk: 'high',
      category: '药品',
      categoryEn: 'Drugs',
      requirements: ['FDA审批', '临床试验', '质量标准', '标签审批'],
      requirementsEn: ['FDA approval', 'Clinical trials', 'Quality standards', 'Label approval'],
      timeline: '18-48个月',
      timelineEn: '18-48 months',
      cost: { min: 300000, max: 1000000 },
      certificate: 'FDA批准文号',
      certificateEn: 'FDA Approval',
      tips: '准入门槛极高，建议作为长期目标',
      tipsEn: 'Very high barrier, recommend as long-term goal',
    },
    cosmetic: {
      allowed: true,
      score: 88,
      risk: 'low',
      category: '化妆品',
      categoryEn: 'Cosmetics',
      requirements: ['FDA备案', '安全评估', '标签合规'],
      requirementsEn: ['FDA registration', 'Safety assessment', 'Labeling compliance'],
      timeline: '2-4个月',
      timelineEn: '2-4 months',
      cost: { min: 5000, max: 20000 },
      certificate: 'FDA化妆品备案',
      certificateEn: 'FDA Cosmetics Registration',
      tips: '门槛最低，可快速进入',
      tipsEn: 'Lowest barrier, can enter quickly',
    },
    medical: {
      allowed: true,
      score: 38,
      risk: 'high',
      category: '医疗器械',
      categoryEn: 'Medical Devices',
      requirements: ['FDA 510(k)或PMA', '临床试验', '质量体系', '器械注册'],
      requirementsEn: ['FDA 510(k) or PMA', 'Clinical trials', 'QMS', 'Device registration'],
      timeline: '12-48个月',
      timelineEn: '12-48 months',
      cost: { min: 200000, max: 1000000 },
      certificate: 'FDA 510(k)批准',
      certificateEn: 'FDA 510(k) Clearance',
      tips: '建议与专业咨询机构合作',
      tipsEn: 'Recommend partnering with professional consulting firms',
    },
  },
};

// 风险标签
const RISK_LABELS = {
  low: { label: '低风险', labelEn: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  medium: { label: '中等风险', labelEn: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  high: { label: '较高风险', labelEn: 'High Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

// 评分颜色
const getScoreColor = (score: number) => {
  if (score >= 75) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

export default function ComplianceTest() {
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
  const [selectedIngredient, setSelectedIngredient] = useState('herbal');
  const [showDetails, setShowDetails] = useState(false);

  // 获取当前数据
  const currentData = useMemo(() => {
    return COMPLIANCE_DATA[regionKey]?.[selectedCategory] || {
      allowed: false,
      score: 0,
      risk: 'high' as const,
      category: isZh ? '暂无数据' : 'No data',
      categoryEn: 'No data',
      requirements: [],
      requirementsEn: [],
      timeline: '-',
      timelineEn: '-',
      cost: { min: 0, max: 0 },
      certificate: '-',
      certificateEn: '-',
      tips: isZh ? '暂无建议' : 'No tips available',
      tipsEn: 'No tips available',
    };
  }, [regionKey, selectedCategory, isZh]);

  // 风险信息
  const riskInfo = RISK_LABELS[currentData.risk];

  return (
    <div className="p-6 animate-fadeIn">
      {/* 显示当前选中市场 */}
      {contextMarket && (
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
            <span className="text-xl">{contextMarket.flag}</span>
            <span className="font-medium">{isZh ? contextMarket.name : contextMarket.nameEn}</span>
            <span className="text-sm text-purple-600">({isZh ? '合规自测' : 'Compliance Test'})</span>
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {isZh ? cat.label : cat.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* 成分类型 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {isZh ? '主要成分' : 'Main Ingredients'}
            </label>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
            >
              {INGREDIENTS.map(ing => (
                <option key={ing.value} value={ing.value}>
                  {isZh ? ing.label : ing.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 评估结果 */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-purple-600 mb-1">{isZh ? '准入可行性评分' : 'Feasibility Score'}</div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold" style={{ color: getScoreColor(currentData.score) }}>
                {currentData.score}
              </span>
              <span className="text-lg text-gray-400 mb-1">/100</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${riskInfo.bg} ${riskInfo.color} font-medium`}>
            {isZh ? riskInfo.label : riskInfo.labelEn}
          </div>
        </div>

        {/* 进度条 */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${currentData.score}%`,
              backgroundColor: getScoreColor(currentData.score)
            }}
          />
        </div>
      </div>

      {/* 关键信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 准入类别 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '准入类别' : 'Category'}</span>
          </div>
          <div className="font-medium text-gray-900">
            {isZh ? currentData.category : currentData.categoryEn}
          </div>
        </div>

        {/* 预计周期 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '预计周期' : 'Timeline'}</span>
          </div>
          <div className="font-medium text-gray-900">
            {isZh ? currentData.timeline : currentData.timelineEn}
          </div>
        </div>

        {/* 预计成本 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '预计成本' : 'Estimated Cost'}</span>
          </div>
          <div className="font-medium text-gray-900">
            ${currentData.cost.min.toLocaleString()} - ${currentData.cost.max.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 详细要求 */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium text-gray-900">
            {isZh ? '查看详细要求' : 'View Detailed Requirements'}
          </span>
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {showDetails && (
          <div className="px-4 pb-4 border-t border-gray-100 animate-fadeIn">
            <div className="pt-4 space-y-4">
              {/* 准入要求 */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  {isZh ? '准入要求' : 'Requirements'}
                </h4>
                <ul className="space-y-2">
                  {(isZh ? currentData.requirements : currentData.requirementsEn).map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 所需证书 */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  {isZh ? '所需证书' : 'Required Certificate'}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600" />
                  {isZh ? currentData.certificate : currentData.certificateEn}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI 建议 */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">{isZh ? 'AI 建议' : 'AI Suggestion'}</div>
            <div className="text-sm text-white/90">
              {isZh ? currentData.tips : currentData.tipsEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
