/**
 * 实用工具板块 - 极简实时计算
 * 设计理念: 选择即计算、无需提交、核心结论突出
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, 
  Clock, 
  FileText, 
  TrendingUp,
  RefreshCw,
  Download,
  MessageCircle,
  Package,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useMarket } from './aiToolsMarketContext';

// 产品类型选项
const PRODUCT_TYPES = [
  { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
  { value: 'traditional', label: '中医药饮片', labelEn: 'TCM Products' },
  { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
  { value: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
];

// 成本数据 (按市场+产品类型)
const COST_DATA: Record<string, Record<string, { items: { name: string; min: number; max: number }[] }>> = {
  japan: {
    supplement: {
      items: [
        { name: 'PMDA注册费', min: 50000, max: 200000 },
        { name: 'QUATCO检测费', min: 3000, max: 10000 },
        { name: '翻译公证费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 5000, max: 15000 },
      ]
    },
    traditional: {
      items: [
        { name: 'PMDA注册费', min: 80000, max: 300000 },
        { name: '药效试验费', min: 20000, max: 80000 },
        { name: '翻译公证费', min: 5000, max: 15000 },
        { name: '当地代理费', min: 10000, max: 30000 },
      ]
    },
    cosmetic: {
      items: [
        { name: 'PMDA备案费', min: 5000, max: 20000 },
        { name: '功效试验费', min: 10000, max: 40000 },
        { name: '翻译公证费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 5000, max: 15000 },
      ]
    },
    medical: {
      items: [
        { name: 'PMDA认证费', min: 100000, max: 500000 },
        { name: '临床试验费', min: 50000, max: 300000 },
        { name: '翻译公证费', min: 10000, max: 30000 },
        { name: '当地代理费', min: 20000, max: 80000 },
      ]
    },
  },
  europe: {
    supplement: {
      items: [
        { name: 'EFSA审批费', min: 30000, max: 100000 },
        { name: '功效试验费', min: 20000, max: 80000 },
        { name: '翻译公证费', min: 5000, max: 15000 },
        { name: '当地代理费', min: 10000, max: 30000 },
      ]
    },
    traditional: {
      items: [
        { name: 'THMPD注册费', min: 50000, max: 200000 },
        { name: '传统使用证明', min: 10000, max: 30000 },
        { name: '翻译公证费', min: 8000, max: 20000 },
        { name: '当地代理费', min: 15000, max: 40000 },
      ]
    },
    cosmetic: {
      items: [
        { name: 'CPNP通报费', min: 1000, max: 5000 },
        { name: '安全评估费', min: 3000, max: 10000 },
        { name: '翻译公证费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 3000, max: 10000 },
      ]
    },
    medical: {
      items: [
        { name: 'MDR认证费', min: 80000, max: 400000 },
        { name: '技术文件费', min: 30000, max: 150000 },
        { name: '翻译公证费', min: 10000, max: 30000 },
        { name: '公告机构费', min: 30000, max: 150000 },
      ]
    },
  },
  southeast: {
    supplement: {
      items: [
        { name: '各国注册费', min: 5000, max: 20000 },
        { name: '检测费', min: 3000, max: 10000 },
        { name: '翻译费', min: 1000, max: 3000 },
        { name: '当地代理费', min: 3000, max: 10000 },
      ]
    },
    traditional: {
      items: [
        { name: '各国注册费', min: 8000, max: 30000 },
        { name: '检测费', min: 5000, max: 15000 },
        { name: 'HALAL认证费', min: 5000, max: 15000 },
        { name: '当地代理费', min: 5000, max: 15000 },
      ]
    },
    cosmetic: {
      items: [
        { name: '各国注册费', min: 3000, max: 10000 },
        { name: '检测费', min: 2000, max: 8000 },
        { name: '翻译费', min: 1000, max: 3000 },
        { name: '当地代理费', min: 2000, max: 8000 },
      ]
    },
    medical: {
      items: [
        { name: '各国注册费', min: 10000, max: 50000 },
        { name: '检测费', min: 8000, max: 30000 },
        { name: '翻译费', min: 3000, max: 10000 },
        { name: '当地代理费', min: 8000, max: 25000 },
      ]
    },
  },
  australia: {
    supplement: {
      items: [
        { name: 'TGA注册费', min: 10000, max: 50000 },
        { name: '毒理测试费', min: 5000, max: 15000 },
        { name: '翻译公证费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 5000, max: 15000 },
      ]
    },
    traditional: {
      items: [
        { name: 'TGA注册费', min: 15000, max: 60000 },
        { name: '传统使用证明', min: 5000, max: 15000 },
        { name: '翻译公证费', min: 3000, max: 8000 },
        { name: '当地代理费', min: 8000, max: 20000 },
      ]
    },
    cosmetic: {
      items: [
        { name: 'CCN通报费', min: 500, max: 2000 },
        { name: '安全评估费', min: 2000, max: 8000 },
        { name: '翻译费', min: 1000, max: 3000 },
        { name: '当地代理费', min: 2000, max: 5000 },
      ]
    },
    medical: {
      items: [
        { name: 'TGA认证费', min: 30000, max: 150000 },
        { name: '临床评估费', min: 20000, max: 80000 },
        { name: '翻译公证费', min: 5000, max: 15000 },
        { name: '当地代理费', min: 10000, max: 30000 },
      ]
    },
  },
  middleEast: {
    supplement: {
      items: [
        { name: 'ESMA注册费', min: 5000, max: 15000 },
        { name: 'HALAL认证费', min: 5000, max: 15000 },
        { name: '翻译费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 3000, max: 10000 },
      ]
    },
    traditional: {
      items: [
        { name: '进口许可费', min: 8000, max: 25000 },
        { name: 'HALAL认证费', min: 5000, max: 15000 },
        { name: '翻译费', min: 3000, max: 8000 },
        { name: '当地代理费', min: 5000, max: 15000 },
      ]
    },
    cosmetic: {
      items: [
        { name: 'GCC注册费', min: 3000, max: 10000 },
        { name: 'HALAL认证费', min: 3000, max: 10000 },
        { name: '翻译费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 3000, max: 8000 },
      ]
    },
    medical: {
      items: [
        { name: 'SFDA注册费', min: 15000, max: 60000 },
        { name: '技术评估费', min: 10000, max: 40000 },
        { name: '翻译费', min: 5000, max: 15000 },
        { name: '当地代理费', min: 8000, max: 25000 },
      ]
    },
  },
  usa: {
    supplement: {
      items: [
        { name: 'FDA备案费', min: 5000, max: 20000 },
        { name: '检测费', min: 8000, max: 25000 },
        { name: '翻译公证费', min: 3000, max: 8000 },
        { name: '当地代理费', min: 5000, max: 15000 },
      ]
    },
    traditional: {
      items: [
        { name: 'FDA审批费', min: 100000, max: 500000 },
        { name: '临床试验费', min: 100000, max: 500000 },
        { name: '翻译公证费', min: 15000, max: 50000 },
        { name: '当地代理费', min: 20000, max: 80000 },
      ]
    },
    cosmetic: {
      items: [
        { name: 'FDA备案费', min: 3000, max: 10000 },
        { name: '安全评估费', min: 5000, max: 20000 },
        { name: '翻译费', min: 2000, max: 5000 },
        { name: '当地代理费', min: 3000, max: 10000 },
      ]
    },
    medical: {
      items: [
        { name: 'FDA认证费', min: 150000, max: 800000 },
        { name: '临床试验费', min: 200000, max: 1000000 },
        { name: '翻译公证费', min: 20000, max: 80000 },
        { name: '当地代理费', min: 30000, max: 150000 },
      ]
    },
  },
};

// 时间数据 (按市场+产品类型)
const TIMELINE_DATA: Record<string, Record<string, { phases: { name: string; duration: string }[] }>> = {
  japan: {
    supplement: {
      phases: [
        { name: '资料准备', duration: '2-3月' },
        { name: 'PMDA审查', duration: '8-12月' },
        { name: '现场核查', duration: '2-3月' },
        { name: '获得认证', duration: '1-2月' },
      ]
    },
    traditional: {
      phases: [
        { name: '资料准备', duration: '3-6月' },
        { name: 'PMDA审查', duration: '12-18月' },
        { name: '临床试验', duration: '6-12月' },
        { name: '获得认证', duration: '2-3月' },
      ]
    },
    cosmetic: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'PMDA备案', duration: '3-6月' },
        { name: '功效审查', duration: '2-4月' },
        { name: '获得许可', duration: '1-2月' },
      ]
    },
    medical: {
      phases: [
        { name: '技术文件', duration: '3-6月' },
        { name: 'PMDA审查', duration: '12-24月' },
        { name: '临床试验', duration: '12-24月' },
        { name: '获得认证', duration: '3-6月' },
      ]
    },
  },
  europe: {
    supplement: {
      phases: [
        { name: '资料准备', duration: '2-4月' },
        { name: 'EFSA审批', duration: '6-12月' },
        { name: '补充资料', duration: '2-4月' },
        { name: '获得批准', duration: '1-2月' },
      ]
    },
    traditional: {
      phases: [
        { name: '资料准备', duration: '4-6月' },
        { name: 'THMPD审查', duration: '12-18月' },
        { name: '评估补充', duration: '6-12月' },
        { name: '获得注册', duration: '2-3月' },
      ]
    },
    cosmetic: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'CPNP通报', duration: '1-2月' },
        { name: '安全评估', duration: '1-2月' },
        { name: '可上市', duration: '即时' },
      ]
    },
    medical: {
      phases: [
        { name: '技术文件', duration: '6-12月' },
        { name: '公告机构审核', duration: '12-24月' },
        { name: '临床评估', duration: '6-18月' },
        { name: '获得CE', duration: '2-4月' },
      ]
    },
  },
  southeast: {
    supplement: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: '各国审查', duration: '2-6月' },
        { name: '批准上市', duration: '1-2月' },
      ]
    },
    traditional: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'HALAL认证', duration: '2-3月' },
        { name: '各国审查', duration: '2-4月' },
      ]
    },
    cosmetic: {
      phases: [
        { name: '资料准备', duration: '1月' },
        { name: '各国注册', duration: '2-4月' },
        { name: '批准上市', duration: '1月' },
      ]
    },
    medical: {
      phases: [
        { name: '资料准备', duration: '2-3月' },
        { name: '各国审查', duration: '4-8月' },
        { name: '批准上市', duration: '2-3月' },
      ]
    },
  },
  australia: {
    supplement: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'TGA审查', duration: '4-10月' },
        { name: '补充资料', duration: '1-3月' },
        { name: '获得认证', duration: '1-2月' },
      ]
    },
    traditional: {
      phases: [
        { name: '资料准备', duration: '2-3月' },
        { name: 'TGA审查', duration: '6-12月' },
        { name: '补充资料', duration: '2-4月' },
        { name: '获得认证', duration: '1-2月' },
      ]
    },
    cosmetic: {
      phases: [
        { name: '资料准备', duration: '0.5月' },
        { name: 'CCN通报', duration: '0.5-1月' },
        { name: '可上市', duration: '即时' },
      ]
    },
    medical: {
      phases: [
        { name: '资料准备', duration: '3-6月' },
        { name: 'TGA审查', duration: '6-12月' },
        { name: '补充评估', duration: '3-6月' },
        { name: '获得认证', duration: '1-2月' },
      ]
    },
  },
  middleEast: {
    supplement: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'HALAL认证', duration: '2-3月' },
        { name: 'ESMA审批', duration: '2-4月' },
        { name: '获得许可', duration: '1月' },
      ]
    },
    traditional: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'HALAL认证', duration: '2-3月' },
        { name: '进口许可', duration: '2-4月' },
      ]
    },
    cosmetic: {
      phases: [
        { name: '资料准备', duration: '1月' },
        { name: 'HALAL认证', duration: '1-2月' },
        { name: 'GCC审批', duration: '1-2月' },
      ]
    },
    medical: {
      phases: [
        { name: '资料准备', duration: '2-4月' },
        { name: 'SFDA审查', duration: '4-8月' },
        { name: '补充资料', duration: '2-3月' },
        { name: '获得许可', duration: '1-2月' },
      ]
    },
  },
  usa: {
    supplement: {
      phases: [
        { name: '资料准备', duration: '1-2月' },
        { name: 'FDA备案', duration: '4-8月' },
        { name: '补充资料', duration: '2-3月' },
        { name: '获得备案', duration: '1-2月' },
      ]
    },
    traditional: {
      phases: [
        { name: '资料准备', duration: '6-12月' },
        { name: 'FDA审批', duration: '18-36月' },
        { name: '临床试验', duration: '12-24月' },
        { name: '获得批准', duration: '3-6月' },
      ]
    },
    cosmetic: {
      phases: [
        { name: '资料准备', duration: '1月' },
        { name: 'FDA备案', duration: '2-4月' },
        { name: '可上市', duration: '即时' },
      ]
    },
    medical: {
      phases: [
        { name: '技术文件', duration: '6-12月' },
        { name: 'FDA审查', duration: '12-36月' },
        { name: '临床试验', duration: '12-36月' },
        { name: '获得批准', duration: '3-6月' },
      ]
    },
  },
};

// 政策数据
const POLICY_DATA: Record<string, Record<string, { allowed: boolean; difficulty: string; timeline: string; requirements?: string }>> = {
  japan: {
    supplement: { allowed: true, difficulty: '中', timeline: '12-18个月', requirements: '需PMDA注册，保健品标准' },
    traditional: { allowed: true, difficulty: '高', timeline: '18-24个月', requirements: '需PMDA医药品注册，严格审批' },
    cosmetic: { allowed: true, difficulty: '低', timeline: '3-12个月', requirements: '普通化妆品或医药部外品备案' },
    medical: { allowed: true, difficulty: '高', timeline: '12-36个月', requirements: '根据风险等级I-IV类，III-IV类需认证' },
  },
  europe: {
    supplement: { allowed: true, difficulty: '中', timeline: '6-12个月', requirements: '需EFSA批准功效声称' },
    traditional: { allowed: true, difficulty: '高', timeline: '12-24个月', requirements: '需THMPD注册，30年使用证明' },
    cosmetic: { allowed: true, difficulty: '低', timeline: '1-3个月', requirements: 'CPNP通报即可' },
    medical: { allowed: true, difficulty: '高', timeline: '12-36个月', requirements: '需MDR认证，公告机构审核' },
  },
  southeast: {
    supplement: { allowed: true, difficulty: '低', timeline: '3-9个月', requirements: '各国要求不同，可多国同时申请' },
    traditional: { allowed: true, difficulty: '低', timeline: '3-6个月', requirements: '马来西亚需HALAL认证' },
    cosmetic: { allowed: true, difficulty: '低', timeline: '2-5个月', requirements: '各国化妆品法规不同' },
    medical: { allowed: true, difficulty: '中', timeline: '6-12个月', requirements: '各国医疗器材法规不同' },
  },
  australia: {
    supplement: { allowed: true, difficulty: '中', timeline: '6-12个月', requirements: '需ARTG注册，TGA审批' },
    traditional: { allowed: true, difficulty: '中', timeline: '6-12个月', requirements: '需ARTG注册，补充药品框架' },
    cosmetic: { allowed: true, difficulty: '低', timeline: '0.5-1个月', requirements: 'CCN通报即可' },
    medical: { allowed: true, difficulty: '中', timeline: '9-15个月', requirements: '需TGA认证，根据风险分类' },
  },
  middleEast: {
    supplement: { allowed: true, difficulty: '低', timeline: '4-8个月', requirements: 'ESMA标准，部分需HALAL' },
    traditional: { allowed: true, difficulty: '中', timeline: '4-8个月', requirements: '进口许可，HALAL认证' },
    cosmetic: { allowed: true, difficulty: '低', timeline: '2-4个月', requirements: 'GCC法规，HALAL认证' },
    medical: { allowed: true, difficulty: '中', timeline: '6-12个月', requirements: 'SFDA/ESMA注册' },
  },
  usa: {
    supplement: { allowed: true, difficulty: '中', timeline: '6-12个月', requirements: 'FDA备案，GRAS认证' },
    traditional: { allowed: true, difficulty: '高', timeline: '18-36个月', requirements: 'FDA药品审批，临床试验' },
    cosmetic: { allowed: true, difficulty: '低', timeline: '2-4个月', requirements: 'FDA备案即可' },
    medical: { allowed: true, difficulty: '高', timeline: '12-36个月', requirements: 'FDA 510(k)或PMA认证' },
  },
};

const TABS = [
  { id: 'cost', name: '成本分析', nameEn: 'Cost Analysis', icon: Calculator },
  { id: 'timeline', name: '时间规划', nameEn: 'Timeline', icon: Clock },
  { id: 'policy', name: '政策查询', nameEn: 'Policy', icon: FileText },
  { id: 'roi', name: '投资回报', nameEn: 'ROI', icon: TrendingUp },
];

// 迷你柱状图组件
const MiniBarChart = ({ data, maxValue }: { data: { label: string; value: number }[]; maxValue: number }) => {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-emerald-600 rounded-sm transition-all duration-700"
            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
          />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default function Tools() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  // 从上下文获取选中的市场
  const { selectedMarket } = useMarket();

  // 将选中的市场映射到区域（用于获取数据）
  const getRegionKey = () => {
    if (!selectedMarket) return 'japan';
    const regionMap: Record<string, string> = {
      usa: 'usa', canada: 'usa', mexico: 'usa',
      germany: 'europe', france: 'europe', uk: 'europe', italy: 'europe', spain: 'europe', netherlands: 'europe',
      japan: 'japan', australia: 'australia',
      southkorea: 'southeast', singapore: 'southeast', hongkong: 'southeast', taiwan: 'southeast', nz: 'australia',
      indonesia: 'southeast', thailand: 'southeast', vietnam: 'southeast', malaysia: 'southeast', philippines: 'southeast', myanmar: 'southeast',
      saudiarabia: 'middleEast', uae: 'middleEast', israel: 'middleEast', qatar: 'middleEast', turkey: 'middleEast',
    };
    return regionMap[selectedMarket.id] || 'japan';
  };

  const regionKey = getRegionKey();

  // 筛选状态
  const [selectedProductType, setSelectedProductType] = useState('supplement');
  
  // Tab 状态
  const [activeTab, setActiveTab] = useState('cost');
  
  // ROI 参数
  const [roiInvestment, setRoiInvestment] = useState(100000);
  const [roiProductPrice, setRoiProductPrice] = useState(50);
  const [roiAnnualSales, setRoiAnnualSales] = useState(10000);

  // 数据获取 - 根据市场+产品类型
  const costData = COST_DATA[regionKey]?.[selectedProductType];
  const timelineData = TIMELINE_DATA[regionKey]?.[selectedProductType];
  const policyData = POLICY_DATA[regionKey]?.[selectedProductType];

  // 计算总成本
  const totalCost = useMemo(() => {
    if (!costData?.items) return 0;
    return costData.items.reduce((sum, item) => sum + (item.min + item.max) / 2, 0);
  }, [costData]);

  // 计算 ROI
  const roiResult = useMemo(() => {
    const revenue = roiProductPrice * roiAnnualSales;
    const cost = totalCost;
    const profit = revenue - cost;
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    return { revenue, cost, profit, roi };
  }, [roiProductPrice, roiAnnualSales, totalCost]);

  // 计算总时间
  const totalMonths = useMemo(() => {
    if (!timelineData?.phases) return { min: 0, max: 0 };
    let min = 0, max = 0;
    timelineData.phases.forEach(p => {
      const match = p.duration.match(/(\d+)-(\d+)/);
      if (match) {
        min += parseInt(match[1]);
        max += parseInt(match[2]);
      } else {
        const single = p.duration.match(/(\d+)/);
        if (single) {
          min += parseInt(single[1]);
          max += parseInt(single[1]);
        }
      }
    });
    return { min, max };
  }, [timelineData]);

  // 成本数据可视化
  const costChartData = useMemo(() => {
    if (!costData?.items) return [];
    return costData.items.map(item => ({
      label: item.name.replace(/注册费|检测费|翻译费|代理费|审批费|试验费|备案费/g, ''),
      value: (item.min + item.max) / 2
    }));
  }, [costData]);

  const maxCost = useMemo(() => Math.max(...costChartData.map(d => d.value), 1), [costChartData]);

  const currentRegion = selectedMarket 
    ? { flag: selectedMarket.flag, label: isZh ? selectedMarket.name : selectedMarket.nameEn }
    : { flag: '🇯🇵', label: 'Japan' };

  return (
    <section id="tools" className="py-8 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* 显示当前选中市场 */}
        {selectedMarket && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full">
              <span className="text-xl">{selectedMarket.flag}</span>
              <span className="font-medium">{isZh ? selectedMarket.name : selectedMarket.nameEn}</span>
              <span className="text-sm text-emerald-600">({isZh ? '成本测算' : 'Cost Calculator'})</span>
            </span>
          </div>
        )}

        {/* 产品类型筛选 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* 产品类型 */}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">{isZh ? '产品类型' : 'Product Type'}</span>
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white min-w-[160px]"
              >
                {PRODUCT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {isZh ? type.label : type.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 重置按钮 */}
            <button
              onClick={() => {
                setSelectedProductType('supplement');
              }}
              className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {isZh ? '重置' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-px bg-gray-200">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{isZh ? tab.name : tab.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 核心结论 - 根据选择实时显示 */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 mb-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-white/80 mb-1">
                {currentRegion?.flag} {currentRegion?.label} {isZh ? '市场准入' : 'Market Entry'}
              </div>
              <div className="text-3xl font-bold">
                ${(totalCost * 0.8).toLocaleString()} — ${(totalCost * 1.2).toLocaleString()}
              </div>
              <div className="text-sm text-white/70 mt-1">{isZh ? '预估总成本' : 'Estimated Total Cost'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80 mb-1">{isZh ? '预计周期' : 'Estimated Timeline'}</div>
              <div className="text-2xl font-bold">
                {totalMonths.min}—{totalMonths.max} {isZh ? '个月' : 'months'}
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white border border-gray-100 rounded-xl">
          
          {/* 成本分析 */}
          {activeTab === 'cost' && (
            <div className="p-8 animate-fadeIn">
              {/* 成本分布图 */}
              <div className="mb-8">
                <div className="text-xs tracking-wider text-gray-400 uppercase mb-4">
                  {isZh ? '成本分布' : 'Cost Distribution'}
                </div>
                <MiniBarChart data={costChartData} maxValue={maxCost} />
              </div>

              {/* 明细列表 */}
              <div>
                <div className="text-xs tracking-wider text-gray-400 uppercase mb-4">
                  {isZh ? '详细分解' : 'Detailed Breakdown'}
                </div>
                <div className="divide-y divide-gray-100">
                  {costData?.items.map((item, i) => (
                    <div key={i} className="py-4 flex items-center justify-between">
                      <span className="text-gray-600 font-light">{item.name}</span>
                      <span className="text-gray-900 font-medium">
                        ${item.min.toLocaleString()} – ${item.max.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 时间规划 */}
          {activeTab === 'timeline' && (
            <div className="p-8 animate-fadeIn">
              {/* 时间线 */}
              <div className="space-y-0">
                {timelineData?.phases.map((phase, i) => (
                  <div key={i} className="flex group">
                    <div className="flex flex-col items-center mr-8">
                      <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-600/20" />
                      {i < timelineData.phases.length - 1 && (
                        <div className="w-px h-12 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-light text-lg">{phase.name}</span>
                        <span className="text-emerald-600 font-medium">{phase.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 政策查询 */}
          {activeTab === 'policy' && (
            <div className="p-8 animate-fadeIn">
              {policyData ? (
                <div className="space-y-6">
                  {/* 准入状态 */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-gray-500 font-light">{isZh ? '市场准入状态' : 'Market Access Status'}</span>
                    <span className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                      policyData.allowed 
                        ? 'text-emerald-700 bg-emerald-50' 
                        : 'text-red-700 bg-red-50'
                    }`}>
                      {policyData.allowed ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {policyData.allowed ? (isZh ? '准入' : 'Allowed') : (isZh ? '受限' : 'Restricted')}
                    </span>
                  </div>
                  
                  {/* 关键指标 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50">
                      <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                        {isZh ? '准入难度' : 'Difficulty Level'}
                      </div>
                      <div className="text-xl font-medium text-emerald-700">{policyData.difficulty}</div>
                    </div>
                    <div className="p-4 bg-gray-50">
                      <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                        {isZh ? '审批周期' : 'Approval Timeline'}
                      </div>
                      <div className="text-xl font-medium text-emerald-700">{policyData.timeline}</div>
                    </div>
                  </div>

                  {/* 关键要求 */}
                  {policyData.requirements && (
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-300">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-amber-900 mb-1">{isZh ? '关键要求' : 'Key Requirements'}</div>
                          <div className="text-sm text-amber-800 font-light leading-relaxed">{policyData.requirements}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-light">{isZh ? '暂无政策数据' : 'No policy data available'}</p>
                </div>
              )}
            </div>
          )}

          {/* ROI 计算 */}
          {activeTab === 'roi' && (
            <div className="p-8 animate-fadeIn">
              {/* 输入区域 */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                    {isZh ? '初始投资 (USD)' : 'Initial Investment'}
                  </label>
                  <input
                    type="number"
                    value={roiInvestment}
                    onChange={(e) => setRoiInvestment(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 font-mono text-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                    {isZh ? '产品单价 (USD)' : 'Unit Price'}
                  </label>
                  <input
                    type="number"
                    value={roiProductPrice}
                    onChange={(e) => setRoiProductPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 font-mono text-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                    {isZh ? '年销量' : 'Annual Volume'}
                  </label>
                  <input
                    type="number"
                    value={roiAnnualSales}
                    onChange={(e) => setRoiAnnualSales(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 font-mono text-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 结果展示 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6">
                  <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                    {isZh ? '预计年营收' : 'Annual Revenue'}
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    ${roiResult.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-6">
                  <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                    {isZh ? '投资回报率' : 'Return on Investment'}
                  </div>
                  <div className={`text-3xl font-bold ${roiResult.roi >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {roiResult.roi >= 0 ? '+' : ''}{roiResult.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 转化按钮 */}
          <div className="px-6 pb-6 pt-4 flex flex-wrap gap-3 justify-center border-t border-gray-100">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
              <Download className="w-4 h-4" />
              {isZh ? '导出PDF报告' : 'Export PDF'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm">
              <MessageCircle className="w-4 h-4" />
              {isZh ? '对接出海顾问' : 'Contact Advisor'}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
