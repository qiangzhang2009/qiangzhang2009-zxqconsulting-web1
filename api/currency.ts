/**
 * 实时汇率 API
 * 使用 Yahoo Finance API 获取真实汇率数据
 */

import { type VercelRequest, type VercelResponse } from '@vercel/node';

// Yahoo Finance 货币对代码映射
const CURRENCY_PAIRS: Record<string, string> = {
  'USD/JPY': 'JPY=X',
  'EUR/USD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X',
  'USD/CNY': 'CNY=X',
  'USD/AUD': 'AUD=X',
  'USD/CAD': 'CAD=X',
  'USD/CHF': 'CHF=X',
  'USD/HKD': 'HKD=X',
  'USD/SGD': 'SGD=X',
  'USD/MYR': 'MYR=X',
  'USD/THB': 'THB=X',
  'USD/KRW': 'KRW=X',
  'USD/INR': 'INR=X',
  'USD/BRL': 'BRL=X',
  'USD/MXN': 'MXN=X',
  'USD/ZAR': 'ZAR=X',
  'EUR/JPY': 'EURJPY=X',
  'GBP/JPY': 'GBPJPY=X',
  'AUD/USD': 'AUDUSD=X',
  'NZD/USD': 'NZDUSD=X',
};

interface CurrencyData {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

async function fetchCurrencyRate(pair: string, yahooSymbol: string): Promise<CurrencyData | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch ${pair}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return null;
    }

    const meta = data.chart.result[0].meta;
    const currentPrice = meta.regularMarketPrice;
    
    // 获取前一天的收盘价来计算变化
    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      pair,
      rate: currentPrice,
      change,
      changePercent,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching ${pair}:`, error);
    return null;
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Cache-Control', 'public, max-age=300'); // 缓存 5 分钟

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取所有货币对的汇率
    const currencyPromises = Object.entries(CURRENCY_PAIRS).map(([pair, symbol]) =>
      fetchCurrencyRate(pair, symbol)
    );

    const results = await Promise.all(currencyPromises);
    
    const validResults = results.filter((r): r is CurrencyData => r !== null);

    // 如果无法获取真实数据，返回模拟数据作为后备
    if (validResults.length === 0) {
      return response.status(200).json({
        success: false,
        error: 'Unable to fetch real-time data',
        fallback: true,
        data: getFallbackData(),
      });
    }

    // 按 pair 分组返回
    const currencyMap: Record<string, CurrencyData> = {};
    validResults.forEach((r) => {
      currencyMap[r.pair] = r;
    });

    return response.status(200).json({
      success: true,
      source: 'Yahoo Finance',
      timestamp: new Date().toISOString(),
      data: currencyMap,
    });
  } catch (error) {
    console.error('Currency API error:', error);
    return response.status(200).json({
      success: false,
      fallback: true,
      data: getFallbackData(),
    });
  }
}

// 后备模拟数据
function getFallbackData() {
  return {
    'USD/JPY': { pair: 'USD/JPY', rate: 148.5, change: -0.5, changePercent: -0.34, timestamp: Date.now() },
    'EUR/USD': { pair: 'EUR/USD', rate: 1.09, change: 0.002, changePercent: 0.18, timestamp: Date.now() },
    'GBP/USD': { pair: 'GBP/USD', rate: 1.26, change: -0.001, changePercent: -0.08, timestamp: Date.now() },
    'USD/CNY': { pair: 'USD/CNY', rate: 7.24, change: 0.01, changePercent: 0.14, timestamp: Date.now() },
    'USD/AUD': { pair: 'USD/AUD', rate: 1.52, change: 0.003, changePercent: 0.20, timestamp: Date.now() },
  };
}
