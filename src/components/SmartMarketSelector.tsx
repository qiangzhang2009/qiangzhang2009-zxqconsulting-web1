/**
 * 智能市场选择器组件
 * 支持按地理位置、经济热度、华人影响力等多种维度选择
 */

import { useState, useEffect } from 'react';
import i18n from 'i18next';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Languages,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';
import { MARKET_DIMENSIONS, HOT_MARKETS, type Market } from '@/data/marketData';

interface SmartMarketSelectorProps {
  value: string;
  onChange: (marketId: string) => void;
  label?: string;
}

type DimensionType = 'geography' | 'economy' | 'chineseInfluence' | 'language' | 'hot';

const SmartMarketSelector = ({ value, onChange, label }: SmartMarketSelectorProps) => {
  const [activeDimension, setActiveDimension] = useState<DimensionType>('hot');
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<string>(value);

  // 当外部 value 变化时，同步更新内部状态（标准化后）
  useEffect(() => {
    const normalizedValue = normalizeMarketId(value);
    setSelectedMarket(normalizedValue);
  }, [value]);

  const isZh = i18n.language === 'zh';

  const dimensions = [
    { id: 'hot' as DimensionType, icon: Sparkles, name: isZh ? '热门推荐' : 'Hot Picks', nameEn: 'Hot Picks' },
    { id: 'geography' as DimensionType, icon: Globe, name: isZh ? '按地理位置' : 'By Geography', nameEn: 'By Geography' },
    { id: 'economy' as DimensionType, icon: TrendingUp, name: isZh ? '按经济热度' : 'By Economy', nameEn: 'By Economy' },
    { id: 'chineseInfluence' as DimensionType, icon: Users, name: isZh ? '按华人影响' : 'By Chinese', nameEn: 'By Chinese' },
    { id: 'language' as DimensionType, icon: Languages, name: isZh ? '按网站语言' : 'By Language', nameEn: 'By Language' },
  ];

// 简化的市场类型，用于处理 MARKET_DIMENSIONS 中的数据
interface SimpleMarket {
  id: string;
  name: string;
  nameEn?: string;
  flag: string;
  reason?: string;
  reasonEn?: string;
}

  // 标准化市场 ID，确保与后端数据格式一致
  const normalizeMarketId = (id: string): string => {
    // 统一映射规则
    const idMap: Record<string, string> = {
      'middleeast': 'middleEast',
      'hongkong': 'hongKong',
      'newzealand': 'newZealand',
    };
    return idMap[id] || id;
  };

  const handleSelect = (market: SimpleMarket) => {
    const normalizedId = normalizeMarketId(market.id);
    setSelectedMarket(normalizedId);
    onChange(normalizedId);
  };

  const renderMarketCard = (market: SimpleMarket, compact = false) => (
    <button
      key={market.id}
      onClick={() => handleSelect(market)}
      className={`flex items-center gap-2 rounded-lg transition-all ${
        selectedMarket === market.id 
          ? 'bg-emerald-500 text-white' 
          : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 border border-gray-200'
      } ${compact ? 'px-2 py-1 text-sm' : 'p-3 w-full text-left'}`}
    >
      <span className="text-lg">{market.flag}</span>
      <span className="font-medium">{isZh ? market.name : (market.nameEn || market.name)}</span>
      {selectedMarket === market.id && <Check className="ml-auto w-4 h-4" />}
    </button>
  );

  const renderHotMarkets = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {HOT_MARKETS.map(market => (
        <div key={market.id} className="relative">
          {renderMarketCard(market)}
          <div className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full ${
            selectedMarket === market.id ? 'bg-emerald-400' : 'bg-amber-400'
          } text-white`}>
            HOT
          </div>
        </div>
      ))}
    </div>
  );

  const renderGeography = () => {
    const data = MARKET_DIMENSIONS.geography;
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {data.regions?.map(region => (
          <div key={region.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedRegion(expandedRegion === region.id ? null : region.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">{isZh ? region.name : region.nameEn}</span>
              {expandedRegion === region.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedRegion === region.id && (
              <div className="p-3 grid grid-cols-2 gap-2 bg-white">
                {region.markets.map(market => renderMarketCard(market, true))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEconomy = () => {
    const data = MARKET_DIMENSIONS.economy;
    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.categories?.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="font-medium text-gray-800">{isZh ? category.name : category.nameEn}</div>
              <div className="text-sm text-gray-500">{isZh ? category.desc : category.descEn}</div>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 bg-white">
              {category.markets.map(market => renderMarketCard(market, true))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderChineseInfluence = () => {
    const data = MARKET_DIMENSIONS.chineseInfluence;
    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.categories?.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="font-medium text-gray-800">{isZh ? category.name : category.nameEn}</div>
              <div className="text-sm text-gray-500">{isZh ? category.desc : category.descEn}</div>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 bg-white">
              {category.markets.map(market => renderMarketCard(market, true))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLanguage = () => {
    const data = MARKET_DIMENSIONS.language;
    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {data.categories?.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedRegion(expandedRegion === category.id ? null : category.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">{category.name}</span>
              {expandedRegion === category.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedRegion === category.id && (
              <div className="p-3 grid grid-cols-2 gap-2 bg-white">
                {category.markets.map(market => renderMarketCard(market, true))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeDimension) {
      case 'hot': return renderHotMarkets();
      case 'geography': return renderGeography();
      case 'economy': return renderEconomy();
      case 'chineseInfluence': return renderChineseInfluence();
      case 'language': return renderLanguage();
      default: return null;
    }
  };

  // 获取当前选中市场的信息
  const getSelectedMarketInfo = (): SimpleMarket | undefined => {
    const allMarkets: SimpleMarket[] = [
      ...(HOT_MARKETS as SimpleMarket[]),
      ...(MARKET_DIMENSIONS.geography.regions?.flatMap(r => r.markets) || []),
      ...(MARKET_DIMENSIONS.economy.categories?.flatMap(c => c.markets) || []),
      ...(MARKET_DIMENSIONS.chineseInfluence.categories?.flatMap(c => c.markets) || []),
      ...(MARKET_DIMENSIONS.language.categories?.flatMap(c => c.markets) || []),
    ];
    return allMarkets.find(m => m.id === selectedMarket);
  };

  const selectedInfo = getSelectedMarketInfo();

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* 维度切换标签 */}
      <div className="flex flex-wrap gap-2 pb-3 border-b border-gray-200">
        {dimensions.map(dim => (
          <button
            key={dim.id}
            onClick={() => setActiveDimension(dim.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeDimension === dim.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <dim.icon className="w-4 h-4" />
            <span>{isZh ? dim.name : dim.nameEn}</span>
          </button>
        ))}
      </div>

      {/* 选择内容 */}
      <div className="min-h-[300px]">
        {renderContent()}
      </div>

      {/* 已选择显示 */}
      {selectedInfo && (
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <div className="text-sm text-emerald-600 mb-1">{isZh ? '已选择' : 'Selected'}</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedInfo.flag}</span>
            <span className="text-lg font-semibold text-gray-800">
              {isZh ? selectedInfo.name : (selectedInfo.nameEn || selectedInfo.name)}
            </span>
          </div>
          {(selectedInfo as Market).reason && (
            <div className="mt-2 text-sm text-gray-600">
              {isZh ? (selectedInfo as Market).reason : ((selectedInfo as Market).reasonEn || (selectedInfo as Market).reason)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartMarketSelector;
