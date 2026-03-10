import { createContext, useContext } from 'react';

export type TargetMarket = {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  region: string;
  priority: 'tier1' | 'tier2' | 'tier3';
  gdp?: string;
};

export interface MarketContextType {
  selectedMarket: TargetMarket | null;
  selectedRegion: string | null;
  setSelectedMarket: (market: TargetMarket | null) => void;
  setSelectedRegion: (region: string | null) => void;
}

export const MarketContext = createContext<MarketContextType>({
  selectedMarket: null,
  selectedRegion: null,
  setSelectedMarket: () => {},
  setSelectedRegion: () => {},
});

export const useMarket = () => useContext(MarketContext);

