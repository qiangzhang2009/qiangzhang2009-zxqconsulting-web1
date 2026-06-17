import { useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Loader2,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MarketContext } from '@/sections/aiTools/context';
import { tracking } from '@/lib/tracking';

const REGIONS = [
  { id: 'northamerica', nameKey: 'region_northamerica', nameEn: 'North America' },
  { id: 'europe', nameKey: 'region_europe', nameEn: 'Europe' },
  { id: 'asiapacific', nameKey: 'region_asiapacific', nameEn: 'Asia Pacific' },
  { id: 'southeastasia', nameKey: 'region_southeastasia', nameEn: 'SE Asia' },
  { id: 'middleeast', nameKey: 'region_middleeast', nameEn: 'Middle East & Africa' },
  { id: 'latinamerica', nameKey: 'region_latinamerica', nameEn: 'Latin America' },
] as const;

const TARGET_MARKETS = [
  { id: 'usa', region: 'northamerica', name: '美国', nameEn: 'United States', priority: 'tier1' },
  { id: 'canada', region: 'northamerica', name: '加拿大', nameEn: 'Canada', priority: 'tier2' },
  { id: 'germany', region: 'europe', name: '德国', nameEn: 'Germany', priority: 'tier1' },
  { id: 'france', region: 'europe', name: '法国', nameEn: 'France', priority: 'tier2' },
  { id: 'uk', region: 'europe', name: '英国', nameEn: 'United Kingdom', priority: 'tier1' },
  { id: 'japan', region: 'asiapacific', name: '日本', nameEn: 'Japan', priority: 'tier1' },
  { id: 'australia', region: 'asiapacific', name: '澳大利亚', nameEn: 'Australia', priority: 'tier1' },
  { id: 'southkorea', region: 'asiapacific', name: '韩国', nameEn: 'South Korea', priority: 'tier2' },
  { id: 'singapore', region: 'southeastasia', name: '新加坡', nameEn: 'Singapore', priority: 'tier1' },
  { id: 'thailand', region: 'southeastasia', name: '泰国', nameEn: 'Thailand', priority: 'tier2' },
  { id: 'malaysia', region: 'southeastasia', name: '马来西亚', nameEn: 'Malaysia', priority: 'tier2' },
  { id: 'uae', region: 'middleeast', name: '阿联酋', nameEn: 'UAE', priority: 'tier2' },
  { id: 'saudiarabia', region: 'middleeast', name: '沙特', nameEn: 'Saudi Arabia', priority: 'tier2' },
  { id: 'brazil', region: 'latinamerica', name: '巴西', nameEn: 'Brazil', priority: 'tier2' },
] as const;

type ProductCategoryOption = { value: string; label: string; labelEn: string };
type ProductTypeOption = { value: string; label: string; labelEn: string; children: ProductCategoryOption[] };

const PRODUCT_TYPES: ProductTypeOption[] = [
  {
    value: 'supplement', label: '保健食品与营养', labelEn: 'Supplements & Nutrition',
    children: [
      { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
      { value: 'nutraceutical', label: '功能性食品', labelEn: 'Nutraceuticals' },
      { value: 'probiotic', label: '益生菌产品', labelEn: 'Probiotics' },
    ],
  },
  {
    value: 'traditional', label: '中医药与本草', labelEn: 'TCM & Herbal',
    children: [
      { value: 'traditional', label: '中药饮片', labelEn: 'TCM Herbs' },
      { value: 'decoction', label: '配方颗粒', labelEn: 'Granules' },
      { value: 'patent', label: '中成药', labelEn: 'Patent TCM' },
    ],
  },
  {
    value: 'cosmetic', label: '汉方护肤', labelEn: 'Hanfang Skincare',
    children: [
      { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
      { value: 'skincare', label: '功效护肤品', labelEn: 'Cosmeceuticals' },
      { value: 'bodycare', label: '身体护理', labelEn: 'Body Care' },
    ],
  },
  {
    value: 'medical', label: '医疗与健康器械', labelEn: 'Medical & Devices',
    children: [
      { value: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
      { value: 'healthdevice', label: '健康器械', labelEn: 'Health Devices' },
      { value: 'diagnostic', label: '诊断设备', labelEn: 'Diagnostic Equipment' },
    ],
  },
] as const;

const STAGE_OPTIONS = [
  { value: 'idea' }, { value: 'pilot' }, { value: 'launch' }, { value: 'scale' },
] as const;
const BUDGET_OPTIONS = [
  { value: 'below-500k' }, { value: '500k-2m' }, { value: '2m-5m' }, { value: 'above-5m' },
] as const;
const VALIDATION_OPTIONS = [
  { value: 'none' }, { value: 'domestic-only' }, { value: 'some-testing' }, { value: 'existing-overseas' },
] as const;
const TARGET_COUNT_OPTIONS = [
  { value: '1' }, { value: '2-3' }, { value: '4+' },
] as const;

const qualificationStyle = {
  self_serve: 'border-slate-500/30 bg-slate-500/10 text-slate-200',
  prepare_then_apply: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  expert_review: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
} as const;

export default function AIToolsHub() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [selectedProductType, setSelectedProductType] = useState<string>('supplement');
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>('market');

  const {
    selectedMarket, selectedRegion, selectedCategory,
    setSelectedMarket, setSelectedRegion, setSelectedCategory,
    prefetchAllData, isPrefetching, prefetchProgress,
    error, setError, diagnosisInput, setDiagnosisInput,
    diagnosisReport, evidenceBlocks, qualificationDecision,
  } = useContext(MarketContext);

  const filteredMarkets = useMemo(() => {
    if (!selectedRegion) return [];
    return TARGET_MARKETS.filter((market) => market.region === selectedRegion);
  }, [selectedRegion]);

  const currentProductType = PRODUCT_TYPES.find((type) => type.value === selectedProductType) || PRODUCT_TYPES[0];
  const currentSubCategories = currentProductType.children;
  const selectedCategoryLabel = PRODUCT_TYPES.flatMap((type) => type.children as ProductCategoryOption[]).find((item) => item.value === selectedCategory);

  const handleRunDiagnosis = async () => {
    setError(null);
    tracking.click('run_diagnosis_workspace', 'ai_tool');
    tracking.toolInteraction('diagnosis_workspace', 'run', {
      market: selectedMarket?.id, category: selectedCategory,
      stage: diagnosisInput.projectStage, budget: diagnosisInput.budget,
    });
    await prefetchAllData();
  };

  const handleQualificationCTA = () => {
    tracking.click('qualification_cta', 'ai_tool');
  };

  const decisionTone = diagnosisReport?.goToMarketDecision === 'expert_review'
    ? 'text-emerald-300'
    : diagnosisReport?.goToMarketDecision === 'prepare_first'
    ? 'text-amber-300'
    : 'text-blue-300';

  const decisionLabel = diagnosisReport?.goToMarketDecision === 'expert_review'
    ? t('diagnosis.goToMarket_escalate')
    : diagnosisReport?.goToMarketDecision === 'prepare_first'
    ? t('diagnosis.goToMarket_wait')
    : t('diagnosis.goToMarket_go');

  const reviewFitLabel = qualificationDecision?.reviewFit === 'expert_review'
    ? t('diagnosis.reviewFit_expert')
    : qualificationDecision?.reviewFit === 'prepare_then_apply'
    ? t('diagnosis.reviewFit_prepare')
    : t('diagnosis.reviewFit_selfServe');

  const nextActionText = qualificationDecision?.reviewFit === 'expert_review'
    ? t('diagnosis.nextAction_expert')
    : qualificationDecision?.reviewFit === 'prepare_then_apply'
    ? t('diagnosis.nextAction_prepare')
    : t('diagnosis.nextAction_selfServe');

  const ctaButtonLabel = qualificationDecision?.reviewFit === 'expert_review'
    ? t('diagnosis.cta_expertReview')
    : t('diagnosis.cta_viewEntry');

  const expertReviewCTA = () => {
    const text = qualificationDecision?.reviewFit === 'expert_review'
      ? t('diagnosis.applyExpertReview')
      : t('diagnosis.viewExpertEntry');
    return text;
  };

  const regionLabel = (region: typeof REGIONS[number]) =>
    t(`diagnosis.${region.nameKey}`, region.nameEn);

  const optionLabel = (prefix: string, value: string) =>
    t(`diagnosis.${prefix}_${value}`, value);

  const budgetPressureLabel = (level: string) =>
    level === 'low' ? t('diagnosis.pressure_low')
    : level === 'medium' ? t('diagnosis.pressure_medium')
    : t('diagnosis.pressure_high');

  return (
    <section id="ai-tools" className="bg-[#07111a] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <Bot className="h-4 w-4" />
            {t('services.diagnosisEngineSection')}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            {t('services.diagnosisEngineTitle')}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            {t('services.diagnosisEngineDesc')}
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
          {/* LEFT: Intake Stage */}
          <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                {t('diagnosis.intakeStage')}
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {t('diagnosis.intakeLabel')}
              </h3>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-slate-300">{t('diagnosis.region')}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {REGIONS.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${selectedRegion === region.id ? 'border-emerald-400/40 bg-emerald-400/10 text-white' : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'}`}
                  >
                    <div className="font-medium">{regionLabel(region)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-slate-300">{t('diagnosis.regionCand')}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredMarkets.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => { setSelectedMarket(market as any); tracking.click(`select_market_${market.id}`, 'ai_tool'); }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${selectedMarket?.id === market.id ? 'border-emerald-400/40 bg-emerald-400/10 text-white' : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{isZh ? market.name : market.nameEn}</span>
                      <span className="text-xs text-slate-400">{t(market.priority === 'tier1' ? 'diagnosis.tier1' : 'diagnosis.tier2')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-slate-300">{t('diagnosis.pathwayCand')}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => { setSelectedProductType(type.value); setSelectedCategory(type.children[0].value); }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${selectedProductType === type.value ? 'border-blue-400/40 bg-blue-400/10 text-white' : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'}`}
                  >
                    <div className="font-medium">{t(`diagnosis.productType_${type.value}`, isZh ? type.label : type.labelEn)}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {currentSubCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${selectedCategory === category.value ? 'border-blue-400/40 bg-blue-400/10 text-blue-200' : 'border-white/10 text-slate-400 hover:border-white/20'}`}
                  >
                    {t(`diagnosis.category_${category.value}`, isZh ? category.label : category.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">{t('diagnosis.projectStage')}</span>
                <select
                  value={diagnosisInput.projectStage}
                  onChange={(e) => setDiagnosisInput({ ...diagnosisInput, projectStage: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
                >
                  <option value="">{t('diagnosis.selectPlease')}</option>
                  {STAGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{optionLabel('stage', o.value)}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">{t('diagnosis.budgetLevel')}</span>
                <select
                  value={diagnosisInput.budget}
                  onChange={(e) => setDiagnosisInput({ ...diagnosisInput, budget: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
                >
                  <option value="">{t('diagnosis.selectPlease')}</option>
                  {BUDGET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{optionLabel('budget', o.value)}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">{t('diagnosis.validationStatus')}</span>
                <select
                  value={diagnosisInput.validationStatus}
                  onChange={(e) => setDiagnosisInput({ ...diagnosisInput, validationStatus: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
                >
                  <option value="">{t('diagnosis.selectPlease')}</option>
                  {VALIDATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{optionLabel('validation', o.value)}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">{t('diagnosis.targetMarketsCount')}</span>
                <select
                  value={diagnosisInput.targetMarketsCount}
                  onChange={(e) => setDiagnosisInput({ ...diagnosisInput, targetMarketsCount: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none"
                >
                  <option value="">{t('diagnosis.selectPlease')}</option>
                  {TARGET_COUNT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{optionLabel('count', o.value)}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">{t('diagnosis.mostImportantQ')}</span>
              <textarea
                rows={4}
                value={diagnosisInput.keyQuestion}
                onChange={(e) => setDiagnosisInput({ ...diagnosisInput, keyQuestion: e.target.value })}
                placeholder={t('diagnosis.mostImportantQPlaceholder')}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </label>

            <button
              onClick={handleRunDiagnosis}
              disabled={!selectedMarket || !selectedCategory || !diagnosisInput.projectStage || !diagnosisInput.budget || isPrefetching}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPrefetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {t('diagnosis.generateBtn')}
            </button>

            {isPrefetching && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>{t('diagnosis.composing')}</span>
                  <span>{prefetchProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${prefetchProgress}%` }} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT: Output panels */}
          <div className="space-y-6">
            {/* Strategic Decision */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-slate-500">{t('diagnosis.strategicDecision')}</div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{t('diagnosis.strategicLabel')}</h3>
                </div>
                {diagnosisReport && (
                  <div className={`rounded-full border px-4 py-2 text-sm ${qualificationDecision ? qualificationStyle[qualificationDecision.reviewFit] : 'border-white/10 text-white'}`}>
                    {reviewFitLabel}
                  </div>
                )}
              </div>

              {!diagnosisReport ? (
                <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">
                  {t('diagnosis.strategicDesc')}
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    {[
                      { icon: TrendingUp, label: t('diagnosis.opportunity'), value: diagnosisReport.opportunityScore },
                      { icon: Shield, label: t('diagnosis.complexity'), value: diagnosisReport.complexityScore },
                      { icon: Wallet, label: t('diagnosis.budgetPressure'), value: budgetPressureLabel(diagnosisReport.budgetPressure) },
                      { icon: Target, label: t('diagnosis.firstMarket'), value: diagnosisReport.firstMarketLabel },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                        <div className="mt-3 text-2xl font-semibold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <div className={`text-sm font-medium uppercase tracking-[0.2em] ${decisionTone}`}>{decisionLabel}</div>
                      <p className="mt-4 text-lg leading-8 text-white">{diagnosisReport.summary}</p>
                      <p className="mt-4 text-sm leading-7 text-slate-300">{diagnosisReport.recommendation}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
                      <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{t('diagnosis.primaryBlocker')}</div>
                      <p className="mt-4 text-base leading-7 text-slate-200">{diagnosisReport.primaryBlocker}</p>
                      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-7 text-amber-100">
                        {t('diagnosis.recommendedWedge', { category: selectedCategoryLabel?.labelEn || 'current category' })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pathway Analysis */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-slate-500">{t('diagnosis.pathwayAnalysis')}</div>
              <h3 className="mt-3 text-2xl font-semibold text-white">{t('diagnosis.pathwayLabel')}</h3>
              <div className="mt-6 space-y-3">
                {evidenceBlocks.map((block) => {
                  const expanded = expandedEvidence === block.id;
                  return (
                    <div key={block.id} className="rounded-3xl border border-white/10 bg-slate-900/50">
                      <button
                        onClick={() => setExpandedEvidence(expanded ? null : block.id)}
                        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
                      >
                        <div>
                          <div className="text-base font-semibold text-white">{block.title}</div>
                          <p className="mt-2 text-sm leading-7 text-slate-400">{block.summary}</p>
                        </div>
                        {expanded ? <ChevronUp className="mt-1 h-5 w-5 text-slate-400" /> : <ChevronDown className="mt-1 h-5 w-5 text-slate-400" />}
                      </button>
                      {expanded && (
                        <div className="border-t border-white/10 px-5 py-5">
                          <ul className="space-y-3">
                            {block.bullets.map((bullet) => (
                              <li key={bullet} className="flex gap-3 text-sm leading-7 text-slate-300">
                                <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-300" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!evidenceBlocks.length && (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm leading-7 text-slate-400">
                    {t('diagnosis.pathwayDesc')}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Qualification Gate */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="text-sm uppercase tracking-[0.22em] text-slate-500">{t('diagnosis.qualificationGate')}</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">{t('diagnosis.qualificationLabel')}</h3>

                {!qualificationDecision ? (
                  <p className="mt-6 text-sm leading-7 text-slate-400">
                    {t('diagnosis.qualificationDesc')}
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className={`rounded-3xl border p-4 ${qualificationStyle[qualificationDecision.reviewFit]}`}>
                      <div className="text-sm uppercase tracking-[0.2em] opacity-80">Lead Tier {qualificationDecision.leadTier}</div>
                      <p className="mt-3 text-base leading-7">{qualificationDecision.escalationReason}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{t('diagnosis.currentBlockers')}</div>
                      <ul className="mt-3 space-y-2">
                        {qualificationDecision.blockers.map((blocker) => (
                          <li key={blocker} className="flex gap-3 text-sm leading-7 text-slate-300">
                            <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-amber-300" />
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{t('diagnosis.requiredBefore')}</div>
                      <ul className="mt-3 space-y-2">
                        {qualificationDecision.requiredBeforeExpert.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-7 text-slate-300">
                            <Compass className="mt-1 h-4 w-4 flex-shrink-0 text-blue-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Follow-Up Copilot */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
                <div className="text-sm uppercase tracking-[0.22em] text-slate-500">{t('diagnosis.followUpCopilot')}</div>
                <h3 className="mt-3 text-2xl font-semibold text-white">{t('diagnosis.followupLabel')}</h3>
                <div className="mt-6 grid gap-3">
                  {[
                    t('diagnosis.q_whySingleMarket'),
                    t('diagnosis.q_budgetDowngrade'),
                    t('diagnosis.q_expertThreshold'),
                  ].map((question) => (
                    <button
                      key={question}
                      onClick={handleQualificationCTA}
                      className="block w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-4 text-left text-sm leading-7 text-slate-200 transition hover:border-white/20"
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <div className="text-sm font-medium text-emerald-200">{t('diagnosis.nextAction')}</div>
                  <p className="mt-3 text-sm leading-7 text-emerald-50">{nextActionText}</p>
                  <Link
                    to="/expert"
                    onClick={handleQualificationCTA}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                  >
                    {ctaButtonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
