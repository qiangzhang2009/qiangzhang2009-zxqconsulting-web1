/**
 * Google Analytics 4 (GA4) 追踪组件
 * 使用 gtag.js 进行网站分析
 *
 * Measurement ID 由 lib/ga4.ts 中的 getEffectiveId() 解析：
 * 1. 显式传入的 measurementId prop
 * 2. VITE_GA4_ID 环境变量
 * 3. SITE_CONFIG.ga4MeasurementId（兜底）
 */

import { useEffect } from 'react';
import { initGA4 } from '@/lib/ga4';

interface GA4Props {
  measurementId?: string;
}

export default function GA4({ measurementId }: GA4Props) {
  useEffect(() => {
    initGA4(measurementId);
  }, [measurementId]);

  return null;
}
