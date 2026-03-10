/**
 * Google Analytics 4 (GA4) 追踪组件
 * 使用 gtag.js 进行网站分析
 */

import { useEffect } from 'react';
import { SITE_CONFIG } from '@/config';
import { initGA4 } from '@/lib/ga4';

interface GA4Props {
  measurementId?: string;
}

export default function GA4({ measurementId }: GA4Props) {
  const ga4Id = measurementId || SITE_CONFIG.ga4MeasurementId;

  useEffect(() => {
    if (ga4Id) {
      initGA4(ga4Id);
    }
  }, [ga4Id]);

  return null;
}
