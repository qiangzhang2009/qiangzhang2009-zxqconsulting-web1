/**
 * Market Context 实例与 hook
 *
 * 拆出 MarketContext + useMarket 到独立文件，避免 react-refresh 警告
 * （fast-refresh 只能热更新"只导出组件"的文件）
 */

import { createContext, useContext } from 'react';
import type { MarketContextType } from './types';

export const MarketContext = createContext<MarketContextType>({
  selectedMarket: null,
  selectedRegion: null,
  selectedCategory: 'supplement',
  setSelectedMarket: () => {},
  setSelectedRegion: () => {},
  setSelectedCategory: () => {},
  prefetchAllData: async () => {},
  isPrefetching: false,
  prefetchProgress: 0,
  cachedData: {},
  dataSource: {},
  error: null,
  setError: () => {},
  marketingData: null,
  setMarketingData: () => {},
  diagnosisInput: {
    projectStage: '',
    budget: '',
    validationStatus: '',
    targetMarketsCount: '',
    keyQuestion: '',
  },
  setDiagnosisInput: () => {},
  diagnosisReport: null,
  evidenceBlocks: [],
  qualificationDecision: null,
});

export const useMarket = () => useContext(MarketContext);
