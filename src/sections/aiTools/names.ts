/**
 * 市场和产品类别的中英文名映射。
 *
 * 拆分自原 aiToolsMarketContext.tsx，被 mockData 和 marketContext 共享。
 *
 * 备注：这里维护一份硬编码映射作为兜底。当映射缺失时，fallback 到 id 本身。
 * 长期方案：把这部分抽到后端 CMS 维护，但当前阶段硬编码在 i18n 包中更可控。
 */

const MARKET_NAMES_EN: Record<string, string> = {
  usa: 'USA',
  canada: 'Canada',
  mexico: 'Mexico',
  germany: 'Germany',
  france: 'France',
  uk: 'UK',
  japan: 'Japan',
  australia: 'Australia',
  southkorea: 'South Korea',
  singapore: 'Singapore',
  nz: 'New Zealand',
  indonesia: 'Indonesia',
  thailand: 'Thailand',
  vietnam: 'Vietnam',
  saudiarabia: 'Saudi Arabia',
  uae: 'UAE',
  egypt: 'Egypt',
  nigeria: 'Nigeria',
  southafrica: 'South Africa',
  kenya: 'Kenya',
  india: 'India',
  malaysia: 'Malaysia',
  philippines: 'Philippines',
  brazil: 'Brazil',
  argentina: 'Argentina',
  chile: 'Chile',
};

const CATEGORY_NAMES_EN: Record<string, string> = {
  supplement: 'Health Supplements',
  nutraceutical: 'Nutraceuticals',
  vitamin: 'Vitamins & Minerals',
  herbal: 'Herbal Slices',
  decoction: 'TCM Granules',
  decoctions: 'Herbal Decoctions',
  patent: 'Patent TCM',
  skincare: 'Skincare Products',
  makeup: 'Makeup Products',
  fragrance: 'Fragrances',
  diagnostic: 'Diagnostic Equipment',
  therapeutic: 'Therapeutic Equipment',
  aids: 'Rehabilitation Aids',
};

export function getMarketEnName(marketId: string): string {
  return MARKET_NAMES_EN[marketId] || marketId;
}

export function getCategoryEnName(categoryId: string): string {
  return CATEGORY_NAMES_EN[categoryId] || categoryId;
}
