/**
 * 市场洞察板块 - 用户需求深度分析
 * 设计理念: 选择市场、实时分析、洞察可视化
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Sparkles,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUp,
} from 'lucide-react';
import { useMarket } from './aiToolsMarketContext';

// 产品类别
const PRODUCT_CATEGORIES = [
  { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
  { value: 'traditional', label: '中医药饮片', labelEn: 'TCM Products' },
  { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
];

// 市场洞察数据
const INSIGHT_DATA: Record<string, Record<string, {
  marketSize: string;
  growth: number;
  ageGroups: { range: string; percentage: number }[];
  channels: { name: string; percentage: number }[];
  competitors: { name: string; percentage: number }[];
  trends: { trend: string; trendEn: string; growth: number }[];
  painPoints: { point: string; pointEn: string; priority: 'high' | 'medium' | 'low' }[];
  opportunities: { opp: string; oppEn: string }[];
  priceRange: { min: number; max: number; avg: number };
}>> = {
  japan: {
    supplement: {
      marketSize: '¥850亿',
      growth: 7.4,
      ageGroups: [
        { range: '18-30岁', percentage: 15 },
        { range: '31-45岁', percentage: 25 },
        { range: '46-60岁', percentage: 35 },
        { range: '60岁以上', percentage: 25 },
      ],
      channels: [
        { name: '药妆店', percentage: 45 },
        { name: '电商平台', percentage: 30 },
        { name: '超市', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: 'Fancl', percentage: 12 },
        { name: 'DHC', percentage: 10 },
        { name: 'Unichi', percentage: 8 },
        { name: '其他', percentage: 70 },
      ],
      trends: [
        { trend: '功能性声称', trendEn: 'Functional claims', growth: 15 },
        { trend: '天然有机', trendEn: 'Natural/Organic', growth: 12 },
        { trend: '肠道健康', trendEn: 'Gut health', growth: 18 },
        { trend: '美容口服', trendEn: 'Beauty from within', growth: 20 },
      ],
      painPoints: [
        { point: '对功效成分敏感', pointEn: 'Sensitive to efficacy ingredients', priority: 'high' },
        { point: '偏好日本本土品牌', pointEn: 'Prefer Japanese local brands', priority: 'high' },
        { point: '包装规格偏好小份量', pointEn: 'Prefer smaller package sizes', priority: 'medium' },
      ],
      opportunities: [
        { opp: '汉方草本概念接受度高', oppEn: 'High acceptance of Kampo/herbal concepts' },
        { opp: '功效差异化竞争空间大', oppEn: 'Large differentiation opportunity' },
        { opp: '银发经济潜力大', oppEn: 'Huge silver economy potential' },
      ],
      priceRange: { min: 1500, max: 8000, avg: 3500 },
    },
    traditional: {
      marketSize: '¥420亿',
      growth: 5.2,
      ageGroups: [
        { range: '18-30岁', percentage: 10 },
        { range: '31-45岁', percentage: 20 },
        { range: '46-60岁', percentage: 35 },
        { range: '60岁以上', percentage: 35 },
      ],
      channels: [
        { name: '药局', percentage: 50 },
        { name: '电商', percentage: 25 },
        { name: '百货', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: '津村', percentage: 25 },
        { name: '久光制药', percentage: 15 },
        { name: '小太郎', percentage: 10 },
        { name: '其他', percentage: 50 },
      ],
      trends: [
        { trend: '汉方现代化', trendEn: 'Modernization of Kampo', growth: 8 },
        { trend: '便利性需求', trendEn: 'Convenience demand', growth: 10 },
        { trend: '预防保健', trendEn: 'Preventive healthcare', growth: 12 },
      ],
      painPoints: [
        { point: '服用不便（需煎煮）', pointEn: 'Inconvenient consumption (decoction needed)', priority: 'high' },
        { point: '对中药认知不足', pointEn: 'Limited TCM awareness', priority: 'medium' },
      ],
      opportunities: [
        { opp: '汉方颗粒制剂需求上升', oppEn: 'Growing demand for Kampo granules' },
        { opp: '养生日益流行', oppEn: 'Wellness becoming mainstream' },
      ],
      priceRange: { min: 2000, max: 15000, avg: 6000 },
    },
    cosmetic: {
      marketSize: '¥1200亿',
      growth: 8.1,
      ageGroups: [
        { range: '18-25岁', percentage: 25 },
        { range: '26-35岁', percentage: 35 },
        { range: '36-50岁', percentage: 30 },
        { range: '50岁以上', percentage: 10 },
      ],
      channels: [
        { name: '药妆店', percentage: 40 },
        { name: '电商', percentage: 35 },
        { name: '百货', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: 'Shiseido', percentage: 18 },
        { name: 'KOSE', percentage: 12 },
        { name: 'Kanebo', percentage: 10 },
        { name: '其他', percentage: 60 },
      ],
      trends: [
        { trend: 'Clean Beauty', trendEn: 'Clean Beauty', growth: 25 },
        { trend: '本草护肤', trendEn: 'Herbal skincare', growth: 15 },
        { trend: '敏感肌友好', trendEn: 'Sensitive skin friendly', growth: 20 },
        { trend: '抗衰老', trendEn: 'Anti-aging', growth: 18 },
      ],
      painPoints: [
        { point: '注重成分安全性', pointEn: 'Focus on ingredient safety', priority: 'high' },
        { point: '品牌忠诚度高', pointEn: 'High brand loyalty', priority: 'high' },
        { point: '包装设计要求高', pointEn: 'High packaging design standards', priority: 'medium' },
      ],
      opportunities: [
        { opp: 'Clean Beauty概念快速增长', oppEn: 'Clean Beauty concept growing rapidly' },
        { opp: '天然草本差异化优势', oppEn: 'Natural herbal differentiation advantage' },
        { opp: '男性护肤市场兴起', oppEn: 'Rising male skincare market' },
      ],
      priceRange: { min: 2000, max: 20000, avg: 6000 },
    },
  },
  europe: {
    supplement: {
      marketSize: '€120亿',
      growth: 6.8,
      ageGroups: [
        { range: '18-30岁', percentage: 20 },
        { range: '31-45岁', percentage: 30 },
        { range: '46-60岁', percentage: 30 },
        { range: '60岁以上', percentage: 20 },
      ],
      channels: [
        { name: '药店', percentage: 40 },
        { name: '电商', percentage: 35 },
        { name: '超市', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: 'Centrum', percentage: 10 },
        { name: 'Berocca', percentage: 8 },
        { name: 'Solgar', percentage: 6 },
        { name: '其他', percentage: 76 },
      ],
      trends: [
        { trend: '免疫健康', trendEn: 'Immune health', growth: 20 },
        { trend: '维生素D补充', trendEn: 'Vitamin D supplementation', growth: 18 },
        { trend: 'Omega-3', trendEn: 'Omega-3', growth: 12 },
      ],
      painPoints: [
        { point: '功效声称要求严格', pointEn: 'Strict efficacy claim requirements', priority: 'high' },
        { point: '偏好本地品牌', pointEn: 'Prefer local brands', priority: 'medium' },
      ],
      opportunities: [
        { opp: '天然草本概念受欢迎', oppEn: 'Natural herbal concepts popular' },
        { opp: '意大利市场成熟', oppEn: 'Mature Italian market' },
      ],
      priceRange: { min: 10, max: 80, avg: 30 },
    },
    traditional: {
      marketSize: '€35亿',
      growth: 4.5,
      ageGroups: [
        { range: '18-30岁', percentage: 12 },
        { range: '31-45岁', percentage: 25 },
        { range: '46-60岁', percentage: 35 },
        { range: '60岁以上', percentage: 28 },
      ],
      channels: [
        { name: '药店', percentage: 45 },
        { name: '电商', percentage: 30 },
        { name: '其他', percentage: 25 },
      ],
      competitors: [
        { name: 'Bayer', percentage: 15 },
        { name: 'Schwabe', percentage: 10 },
        { name: '其他', percentage: 75 },
      ],
      trends: [
        { trend: '传统草本复兴', trendEn: 'Herbal renaissance', growth: 8 },
        { trend: '天然健康', trendEn: 'Natural wellness', growth: 10 },
      ],
      painPoints: [
        { point: '认知度低', pointEn: 'Low awareness', priority: 'high' },
        { point: '法规严格', pointEn: 'Strict regulations', priority: 'high' },
      ],
      opportunities: [
        { opp: '华人社区需求大', oppEn: 'Large Chinese community demand' },
        { opp: '自然疗法兴起', oppEn: 'Rise of natural therapies' },
      ],
      priceRange: { min: 15, max: 100, avg: 40 },
    },
    cosmetic: {
      marketSize: '€180亿',
      growth: 9.2,
      ageGroups: [
        { range: '18-25岁', percentage: 20 },
        { range: '26-35岁', percentage: 32 },
        { range: '36-50岁', percentage: 33 },
        { range: '50岁以上', percentage: 15 },
      ],
      channels: [
        { name: '电商', percentage: 40 },
        { name: '药店', percentage: 25 },
        { name: '百货', percentage: 20 },
        { name: '其他', percentage: 15 },
      ],
      competitors: [
        { name: 'L\'Oreal', percentage: 15 },
        { name: 'Nivea', percentage: 10 },
        { name: 'The Body Shop', percentage: 5 },
        { name: '其他', percentage: 70 },
      ],
      trends: [
        { trend: 'Clean Beauty', trendEn: 'Clean Beauty', growth: 30 },
        { trend: '可持续包装', trendEn: 'Sustainable packaging', growth: 25 },
        { trend: '素食美妆', trendEn: 'Vegan cosmetics', growth: 22 },
        { trend: '本草护肤', trendEn: 'Herbal skincare', growth: 15 },
      ],
      painPoints: [
        { point: '环保意识强', pointEn: 'Strong environmental awareness', priority: 'high' },
        { point: '法规要求严格', pointEn: 'Strict regulatory requirements', priority: 'high' },
      ],
      opportunities: [
        { opp: '本草概念有差异化', oppEn: 'Herbal concept has differentiation' },
        { opp: '可持续包装受欢迎', oppEn: 'Sustainable packaging well-received' },
      ],
      priceRange: { min: 15, max: 150, avg: 45 },
    },
  },
  southeast: {
    supplement: {
      marketSize: '$85亿',
      growth: 13.7,
      ageGroups: [
        { range: '18-25岁', percentage: 30 },
        { range: '26-35岁', percentage: 40 },
        { range: '36-50岁', percentage: 25 },
        { range: '50岁以上', percentage: 5 },
      ],
      channels: [
        { name: '电商平台', percentage: 55 },
        { name: '药店', percentage: 20 },
        { name: '超市', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: 'Blackmores', percentage: 12 },
        { name: 'Swisse', percentage: 10 },
        { name: 'Herbalife', percentage: 8 },
        { name: '其他', percentage: 70 },
      ],
      trends: [
        { trend: '美容口服', trendEn: 'Beauty from within', growth: 25 },
        { trend: '免疫增强', trendEn: 'Immune boost', growth: 20 },
        { trend: '代餐/体重管理', trendEn: 'Meal replacement/weight management', growth: 18 },
      ],
      painPoints: [
        { point: '价格敏感', pointEn: 'Price sensitive', priority: 'high' },
        { point: '品牌认知度重要', pointEn: 'Brand awareness matters', priority: 'medium' },
      ],
      opportunities: [
        { opp: '电商渠道极其活跃', oppEn: 'Very active e-commerce channels' },
        { opp: '年轻消费者驱动增长', oppEn: 'Young consumers driving growth' },
        { opp: '华人市场购买力强', oppEn: 'Strong purchasing power in Chinese community' },
      ],
      priceRange: { min: 10, max: 100, avg: 35 },
    },
    traditional: {
      marketSize: '$28亿',
      growth: 11.2,
      ageGroups: [
        { range: '18-30岁', percentage: 25 },
        { range: '31-45岁', percentage: 40 },
        { range: '46-60岁', percentage: 25 },
        { range: '60岁以上', percentage: 10 },
      ],
      channels: [
        { name: '中药店', percentage: 40 },
        { name: '电商', percentage: 35 },
        { name: '超市', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: '余仁生', percentage: 20 },
        { name: '宝蟾堂', percentage: 10 },
        { name: '其他', percentage: 70 },
      ],
      trends: [
        { trend: '养生保健', trendEn: 'Health preservation', growth: 15 },
        { trend: '便利性需求', trendEn: 'Convenience demand', growth: 12 },
      ],
      painPoints: [
        { point: '质量参差不齐', pointEn: 'Inconsistent quality', priority: 'high' },
        { point: 'HALAL认证重要', pointEn: 'HALAL certification important', priority: 'high' },
      ],
      opportunities: [
        { opp: '华人市场庞大', oppEn: 'Large Chinese community' },
        { opp: '马来西亚HALAL市场', oppEn: 'HALAL market in Malaysia' },
      ],
      priceRange: { min: 15, max: 120, avg: 45 },
    },
    cosmetic: {
      marketSize: '$65亿',
      growth: 10.5,
      ageGroups: [
        { range: '18-25岁', percentage: 40 },
        { range: '26-35岁', percentage: 38 },
        { range: '36-50岁', percentage: 17 },
        { range: '50岁以上', percentage: 5 },
      ],
      channels: [
        { name: '电商平台', percentage: 60 },
        { name: '药妆店', percentage: 20 },
        { name: '百货', percentage: 12 },
        { name: '其他', percentage: 8 },
      ],
      competitors: [
        { name: 'SK-II', percentage: 10 },
        { name: 'Laneige', percentage: 8 },
        { name: 'Innisfree', percentage: 7 },
        { name: '其他', percentage: 75 },
      ],
      trends: [
        { trend: 'K-Beauty影响', trendEn: 'K-Beauty influence', growth: 20 },
        { trend: '护肤步骤简化', trendEn: 'Simplified skincare routine', growth: 15 },
        { trend: '本土品牌崛起', trendEn: 'Local brands rising', growth: 18 },
      ],
      painPoints: [
        { point: '价格敏感', pointEn: 'Price sensitive', priority: 'high' },
        { point: '喜新厌旧快', pointEn: 'Quick to change brands', priority: 'medium' },
      ],
      opportunities: [
        { opp: '电商平台主导', oppEn: 'E-commerce platforms dominate' },
        { opp: '社交媒体营销有效', oppEn: 'Social media marketing effective' },
      ],
      priceRange: { min: 8, max: 80, avg: 25 },
    },
  },
  australia: {
    supplement: {
      marketSize: '$35亿',
      growth: 5.8,
      ageGroups: [
        { range: '18-30岁', percentage: 18 },
        { range: '31-45岁', percentage: 28 },
        { range: '46-60岁', percentage: 32 },
        { range: '60岁以上', percentage: 22 },
      ],
      channels: [
        { name: '药店', percentage: 45 },
        { name: '电商', percentage: 30 },
        { name: '超市', percentage: 18 },
        { name: '其他', percentage: 7 },
      ],
      competitors: [
        { name: 'Blackmores', percentage: 20 },
        { name: 'Swisse', percentage: 18 },
        { name: 'Nature\'s Way', percentage: 10 },
        { name: '其他', percentage: 52 },
      ],
      trends: [
        { trend: '天然有机', trendEn: 'Natural/Organic', growth: 12 },
        { trend: '维生素D', trendEn: 'Vitamin D', growth: 10 },
        { trend: '肠道健康', trendEn: 'Gut health', growth: 15 },
      ],
      painPoints: [
        { point: '信任TGA认证', pointEn: 'Trust TGA certification', priority: 'high' },
        { point: '偏好本地品牌', pointEn: 'Prefer local brands', priority: 'medium' },
      ],
      opportunities: [
        { opp: 'TGA认证背书效应强', oppEn: 'Strong TGA endorsement effect' },
        { opp: '天然概念溢价高', oppEn: 'High premium for natural concepts' },
      ],
      priceRange: { min: 15, max: 100, avg: 40 },
    },
    traditional: {
      marketSize: '$8亿',
      growth: 4.2,
      ageGroups: [
        { range: '18-30岁', percentage: 15 },
        { range: '31-45岁', percentage: 25 },
        { range: '46-60岁', percentage: 35 },
        { range: '60岁以上', percentage: 25 },
      ],
      channels: [
        { name: '中药店', percentage: 35 },
        { name: '电商', percentage: 35 },
        { name: '其他', percentage: 30 },
      ],
      competitors: [
        { name: 'Honey Island', percentage: 15 },
        { name: '其他', percentage: 85 },
      ],
      trends: [
        { trend: '整体养生', trendEn: 'Holistic wellness', growth: 8 },
      ],
      painPoints: [
        { point: '认知度低', pointEn: 'Low awareness', priority: 'high' },
      ],
      opportunities: [
        { opp: '可作为功效背书', oppEn: 'Can serve as efficacy endorsement' },
      ],
      priceRange: { min: 20, max: 150, avg: 55 },
    },
    cosmetic: {
      marketSize: '$28亿',
      growth: 7.9,
      ageGroups: [
        { range: '18-25岁', percentage: 22 },
        { range: '26-35岁', percentage: 35 },
        { range: '36-50岁', percentage: 30 },
        { range: '50岁以上', percentage: 13 },
      ],
      channels: [
        { name: '电商', percentage: 38 },
        { name: '药店', percentage: 30 },
        { name: '百货', percentage: 20 },
        { name: '其他', percentage: 12 },
      ],
      competitors: [
        { name: 'Incyte', percentage: 12 },
        { name: 'Aesop', percentage: 8 },
        { name: '其他', percentage: 80 },
      ],
      trends: [
        { trend: '天然有机', trendEn: 'Natural/Organic', growth: 18 },
        { trend: '可持续', trendEn: 'Sustainability', growth: 15 },
        { trend: '简约护肤', trendEn: 'Minimalist skincare', growth: 12 },
      ],
      painPoints: [
        { point: '注重环保', pointEn: 'Focus on environmental protection', priority: 'high' },
      ],
      opportunities: [
        { opp: '天然有机溢价高', oppEn: 'High premium for natural/organic' },
      ],
      priceRange: { min: 20, max: 150, avg: 55 },
    },
  },
  middleeast: {
    supplement: {
      marketSize: '$18亿',
      growth: 8.5,
      ageGroups: [
        { range: '18-30岁', percentage: 35 },
        { range: '31-45岁', percentage: 40 },
        { range: '46-60岁', percentage: 20 },
        { range: '60岁以上', percentage: 5 },
      ],
      channels: [
        { name: '药店', percentage: 40 },
        { name: '电商', percentage: 35 },
        { name: '超市', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: 'Caltrate', percentage: 12 },
        { name: 'Centrum', percentage: 10 },
        { name: '其他', percentage: 78 },
      ],
      trends: [
        { trend: 'HALAL健康产品', trendEn: 'HALAL health products', growth: 15 },
        { trend: '维生素补充', trendEn: 'Vitamin supplementation', growth: 12 },
        { trend: '运动营养', trendEn: 'Sports nutrition', growth: 18 },
      ],
      painPoints: [
        { point: '必须HALAL认证', pointEn: 'HALAL certification required', priority: 'high' },
        { point: '价格敏感', pointEn: 'Price sensitive', priority: 'medium' },
      ],
      opportunities: [
        { opp: '消费力强', oppEn: 'Strong purchasing power' },
        { opp: 'HALAL市场快速增长', oppEn: 'HALAL market growing rapidly' },
      ],
      priceRange: { min: 20, max: 150, avg: 60 },
    },
    traditional: {
      marketSize: '$5亿',
      growth: 6.3,
      ageGroups: [
        { range: '18-30岁', percentage: 20 },
        { range: '31-45岁', percentage: 35 },
        { range: '46-60岁', percentage: 30 },
        { range: '60岁以上', percentage: 15 },
      ],
      channels: [
        { name: '药店', percentage: 40 },
        { name: '电商', percentage: 30 },
        { name: '其他', percentage: 30 },
      ],
      competitors: [
        { name: 'Herbalife', percentage: 15 },
        { name: '其他', percentage: 85 },
      ],
      trends: [
        { trend: '传统养生', trendEn: 'Traditional wellness', growth: 10 },
      ],
      painPoints: [
        { point: '认知度低', pointEn: 'Low awareness', priority: 'high' },
        { point: 'HALAL要求', pointEn: 'HALAL requirements', priority: 'high' },
      ],
      opportunities: [
        { opp: '华人市场需求', oppEn: 'Chinese community demand' },
      ],
      priceRange: { min: 25, max: 200, avg: 70 },
    },
    cosmetic: {
      marketSize: '$32亿',
      growth: 9.1,
      ageGroups: [
        { range: '18-25岁', percentage: 28 },
        { range: '26-35岁', percentage: 40 },
        { range: '36-50岁', percentage: 25 },
        { range: '50岁以上', percentage: 7 },
      ],
      channels: [
        { name: '电商', percentage: 45 },
        { name: '百货', percentage: 30 },
        { name: '药店', percentage: 15 },
        { name: '其他', percentage: 10 },
      ],
      competitors: [
        { name: 'L\'Oreal', percentage: 15 },
        { name: 'Yves Saint Laurent', percentage: 8 },
        { name: '其他', percentage: 77 },
      ],
      trends: [
        { trend: '奢华护肤', trendEn: 'Luxury skincare', growth: 15 },
        { trend: 'HALAL美妆', trendEn: 'HALAL cosmetics', growth: 20 },
        { trend: '抗衰老', trendEn: 'Anti-aging', growth: 18 },
      ],
      painPoints: [
        { point: '高端品牌偏好', pointEn: 'Preference for luxury brands', priority: 'high' },
        { point: 'HALAL认证重要', pointEn: 'HALAL certification important', priority: 'high' },
      ],
      opportunities: [
        { opp: '高端市场消费力强', oppEn: 'Strong luxury market purchasing power' },
        { opp: 'HALAL美妆增长快', oppEn: 'HALAL cosmetics growing fast' },
      ],
      priceRange: { min: 30, max: 300, avg: 100 },
    },
  },
  usa: {
    supplement: {
      marketSize: '$580亿',
      growth: 6.2,
      ageGroups: [
        { range: '18-30岁', percentage: 22 },
        { range: '31-45岁', percentage: 30 },
        { range: '46-60岁', percentage: 28 },
        { range: '60岁以上', percentage: 20 },
      ],
      channels: [
        { name: '电商', percentage: 45 },
        { name: '药店', percentage: 25 },
        { name: '超市', percentage: 18 },
        { name: '其他', percentage: 12 },
      ],
      competitors: [
        { name: 'GNC', percentage: 12 },
        { name: 'Nature Made', percentage: 10 },
        { name: 'Centrum', percentage: 8 },
        { name: '其他', percentage: 70 },
      ],
      trends: [
        { trend: '免疫健康', trendEn: 'Immune health', growth: 22 },
        { trend: 'CBD产品', trendEn: 'CBD products', growth: 20 },
        { trend: '个性化营养', trendEn: 'Personalized nutrition', growth: 18 },
      ],
      painPoints: [
        { point: '竞争激烈', pointEn: 'Highly competitive', priority: 'high' },
        { point: '品牌信任重要', pointEn: 'Brand trust important', priority: 'high' },
      ],
      opportunities: [
        { opp: '市场规模全球最大', oppEn: 'Largest market globally' },
        { opp: '电商渗透率高', oppEn: 'High e-commerce penetration' },
      ],
      priceRange: { min: 10, max: 100, avg: 35 },
    },
    traditional: {
      marketSize: '$25亿',
      growth: 4.8,
      ageGroups: [
        { range: '18-30岁', percentage: 15 },
        { range: '31-45岁', percentage: 25 },
        { range: '46-60岁', percentage: 35 },
        { range: '60岁以上', percentage: 25 },
      ],
      channels: [
        { name: '电商', percentage: 45 },
        { name: '中药店', percentage: 25 },
        { name: '其他', percentage: 30 },
      ],
      competitors: [
        { name: 'Herbalife', percentage: 18 },
        { name: '其他', percentage: 82 },
      ],
      trends: [
        { trend: '替代医学', trendEn: 'Alternative medicine', growth: 8 },
      ],
      painPoints: [
        { point: 'FDA监管严格', pointEn: 'Strict FDA regulation', priority: 'high' },
        { point: '认知度待提升', pointEn: 'Awareness to improve', priority: 'high' },
      ],
      opportunities: [
        { opp: '华人市场需求大', oppEn: 'Large Chinese community demand' },
      ],
      priceRange: { min: 20, max: 150, avg: 55 },
    },
    cosmetic: {
      marketSize: '$1020亿',
      growth: 5.5,
      ageGroups: [
        { range: '18-25岁', percentage: 20 },
        { range: '26-35岁', percentage: 32 },
        { range: '36-50岁', percentage: 30 },
        { range: '50岁以上', percentage: 18 },
      ],
      channels: [
        { name: '电商', percentage: 40 },
        { name: '药店', percentage: 25 },
        { name: '百货', percentage: 20 },
        { name: '其他', percentage: 15 },
      ],
      competitors: [
        { name: 'L\'Oreal', percentage: 15 },
        { name: 'Estee Lauder', percentage: 10 },
        { name: 'Clinique', percentage: 6 },
        { name: '其他', percentage: 69 },
      ],
      trends: [
        { trend: 'Clean Beauty', trendEn: 'Clean Beauty', growth: 25 },
        { trend: '个性化护肤', trendEn: 'Personalized skincare', growth: 20 },
        { trend: '护肤步骤简化', trendEn: 'Simplified skincare', growth: 15 },
      ],
      painPoints: [
        { point: '品牌忠诚度高', pointEn: 'High brand loyalty', priority: 'high' },
        { point: '营销投入大', pointEn: 'High marketing investment', priority: 'high' },
      ],
      opportunities: [
        { opp: 'Clean Beauty增长快', oppEn: 'Clean Beauty growing fast' },
        { opp: '社交媒体营销有效', oppEn: 'Social media marketing effective' },
      ],
      priceRange: { min: 15, max: 200, avg: 50 },
    },
  },
};

// 迷你饼图组件
const MiniPieChart = ({ data }: { data: { name: string; percentage: number }[] }) => {
  const total = data.reduce((sum, d) => sum + d.percentage, 0);
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
  
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          {data.map((item, i) => {
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(item.percentage / total) * circumference} ${circumference}`;
            const offsetPercent = data.slice(0, i).reduce((sum, d) => sum + d.percentage, 0);
            const strokeDashoffset = -((offsetPercent / total) * circumference);
            
            return (
              <circle
                key={i}
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex-1 space-y-1">
        {data.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-gray-600 flex-1 truncate">{item.name}</span>
            <span className="text-gray-400">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MarketInsight() {
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

  // 获取当前数据
  const currentData = useMemo(() => {
    return INSIGHT_DATA[regionKey]?.[selectedCategory] || {
      marketSize: '-',
      growth: 0,
      ageGroups: [],
      channels: [],
      competitors: [],
      trends: [],
      painPoints: [],
      opportunities: [],
      priceRange: { min: 0, max: 0, avg: 0 },
    };
  }, [regionKey, selectedCategory]);

  // 市场名称
  const categoryName = PRODUCT_CATEGORIES.find(c => c.value === selectedCategory);

  return (
    <div className="p-6 animate-fadeIn">
      {/* 显示当前选中市场 */}
      {contextMarket && (
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full">
            <span className="text-xl">{contextMarket.flag}</span>
            <span className="font-medium">{isZh ? contextMarket.name : contextMarket.nameEn}</span>
            <span className="text-sm text-amber-600">({isZh ? '市场洞察' : 'Market Insight'})</span>
          </span>
        </div>
      )}

      {/* 筛选栏 */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* 产品类别 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {isZh ? '产品类别' : 'Product Category'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {isZh ? cat.label : cat.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 市场规模 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '市场规模' : 'Market Size'}</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{currentData.marketSize}</div>
        </div>

        {/* 年增长率 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '年增长率' : 'Annual Growth'}</span>
          </div>
          <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            +{currentData.growth}%
          </div>
        </div>

        {/* 主要消费群体 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '主力消费' : 'Main Consumers'}</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {currentData.ageGroups[0]?.range || '-'}
          </div>
        </div>

        {/* 平均价格 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500">{isZh ? '平均价格' : 'Avg Price'}</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ${currentData.priceRange.avg.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 渠道分布 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            {isZh ? '渠道分布' : 'Channel Distribution'}
          </h4>
          <MiniPieChart data={currentData.channels} />
        </div>

        {/* 竞争格局 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            {isZh ? '竞争格局' : 'Competitive Landscape'}
          </h4>
          <MiniPieChart data={currentData.competitors} />
        </div>
      </div>

      {/* 趋势洞察 */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          {isZh ? '热门趋势' : 'Trending Topics'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentData.trends.map((trend, i) => (
            <div key={i} className="bg-amber-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {isZh ? trend.trend : trend.trendEn}
              </div>
              <div className="text-xs text-emerald-600 flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                +{trend.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 痛点与机会 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 用户痛点 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            {isZh ? '用户痛点' : 'User Pain Points'}
          </h4>
          <div className="space-y-3">
            {currentData.painPoints.map((pain, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  pain.priority === 'high' ? 'bg-red-500' : 
                  pain.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                }`} />
                <span className="text-gray-600">
                  {isZh ? pain.point : pain.pointEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 市场机会 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            {isZh ? '市场机会' : 'Market Opportunities'}
          </h4>
          <div className="space-y-3">
            {currentData.opportunities.map((opp, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="text-gray-600">
                  {isZh ? opp.opp : opp.oppEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 建议 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">{isZh ? '市场进入建议' : 'Market Entry Suggestion'}</div>
            <div className="text-sm text-white/90">
              {isZh 
                ? `${contextMarket?.flag || ''} ${contextMarket?.name || ''} ${categoryName?.label || ''}市场${currentData.growth > 5 ? '增长迅速，建议优先布局' : '稳步增长，可根据自身资源选择时机'}。主力消费群体为${currentData.ageGroups[0]?.range}，建议重点关注${currentData.trends[0]?.trend || '功能性产品'}趋势。`
                : `${contextMarket?.flag || ''} ${contextMarket?.nameEn || ''} ${categoryName?.labelEn || ''} market ${currentData.growth > 5 ? 'is growing rapidly, recommend priority layout' : 'is growing steadily, choose timing based on resources'}. Main consumers are ${currentData.ageGroups[0]?.range}, recommend focusing on ${currentData.trends[0]?.trendEn || 'functional products'} trend.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
