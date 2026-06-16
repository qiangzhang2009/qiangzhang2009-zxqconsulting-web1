import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type SeoEntry = {
  lang: string;
  title: string;
  description: string;
  ogLocale: string;
  siteName: string;
};

const DEFAULT_SEO: SeoEntry = {
  lang: 'en',
  title: 'ZXQ Consulting | AI Platform for TCM Global Expansion',
  description:
    'ZXQ Consulting is an AI platform for TCM global expansion decisions. Evaluate market priority, entry complexity, compliance pathways, channel fit and project risk for TCM, supplements, Hanfang skincare and health products before deeper expert review.',
  ogLocale: 'en_US',
  siteName: 'ZXQ Consulting',
};

const SEO_BY_LANGUAGE: Record<string, SeoEntry> = {
  en: DEFAULT_SEO,
  zh: {
    lang: 'zh-CN',
    title: 'ZXQ Consulting | 中医药全球化 AI 决策平台',
    description:
      'ZXQ Consulting 是面向中医药、保健食品、汉方护肤与健康产品的全球化 AI 决策平台，帮助团队在进入深度专家复核前，先完成市场优先级、进入复杂度、合规路径、渠道匹配与项目风险判断。',
    ogLocale: 'zh_CN',
    siteName: 'ZXQ Consulting',
  },
  ja: {
    lang: 'ja',
    title: 'ZXQ Consulting | TCM海外展開の戦略アドバイザリー',
    description:
      'ZXQ Consulting は、中医薬・健康食品・漢方スキンケアの海外展開に向けて、市場参入戦略、規制対応、チャネル設計、AI診断を提供します。',
    ogLocale: 'ja_JP',
    siteName: 'ZXQ Consulting',
  },
  es: {
    lang: 'es',
    title: 'ZXQ Consulting | Asesoría estratégica para la expansión global de MTC',
    description:
      'ZXQ Consulting ayuda a marcas de medicina tradicional china, suplementos y cuidado Hanfang a entrar en mercados globales con estrategia de acceso, cumplimiento, canales y diagnóstico con IA.',
    ogLocale: 'es_ES',
    siteName: 'ZXQ Consulting',
  },
  fr: {
    lang: 'fr',
    title: 'ZXQ Consulting | Conseil stratégique pour l’expansion mondiale de la MTC',
    description:
      'ZXQ Consulting accompagne les marques de médecine traditionnelle chinoise, compléments et soins Hanfang avec stratégie d’entrée marché, conformité, canaux et diagnostic IA.',
    ogLocale: 'fr_FR',
    siteName: 'ZXQ Consulting',
  },
  de: {
    lang: 'de',
    title: 'ZXQ Consulting | Strategische Beratung für die globale TCM-Expansion',
    description:
      'ZXQ Consulting unterstützt TCM-, Supplement- und Hanfang-Hautpflegemarken mit Markteintrittsstrategie, Compliance, Kanalaufbau und KI-gestützter Diagnose.',
    ogLocale: 'de_DE',
    siteName: 'ZXQ Consulting',
  },
  pt: {
    lang: 'pt',
    title: 'ZXQ Consulting | Consultoria estratégica para expansão global da MTC',
    description:
      'A ZXQ Consulting apoia marcas de medicina tradicional chinesa, suplementos e skincare Hanfang com estratégia de entrada, compliance, canais e diagnóstico com IA.',
    ogLocale: 'pt_BR',
    siteName: 'ZXQ Consulting',
  },
  ar: {
    lang: 'ar',
    title: 'ZXQ Consulting | استشارات استراتيجية للتوسع العالمي في الطب الصيني التقليدي',
    description:
      'تدعم ZXQ Consulting علامات الطب الصيني التقليدي والمكملات والعناية Hanfang عبر استراتيجية دخول السوق والامتثال والقنوات وتشخيص الذكاء الاصطناعي.',
    ogLocale: 'ar_SA',
    siteName: 'ZXQ Consulting',
  },
  ru: {
    lang: 'ru',
    title: 'ZXQ Consulting | Стратегический консалтинг для глобальной экспансии Т��М',
    description:
      'ZXQ Consulting помогает брендам ТКМ, БАДов и Hanfang выходить на мировые рынки через стратегию входа, комплаенс, каналы и AI-диагностику.',
    ogLocale: 'ru_RU',
    siteName: 'ZXQ Consulting',
  },
  ko: {
    lang: 'ko',
    title: 'ZXQ Consulting | 중의약 글로벌 진출 전략 자문',
    description:
      'ZXQ Consulting은 중의약, 건강보조식품, 한방 스킨케어 브랜드를 위해 시장 진입 전략, 규제 대응, 채널 설계 및 AI 진단을 제공합니다.',
    ogLocale: 'ko_KR',
    siteName: 'ZXQ Consulting',
  },
  id: {
    lang: 'id',
    title: 'ZXQ Consulting | Konsultasi strategis untuk ekspansi global TCM',
    description:
      'ZXQ Consulting membantu merek TCM, suplemen, dan skincare Hanfang masuk ke pasar global melalui strategi pasar, kepatuhan, kanal, dan diagnosis AI.',
    ogLocale: 'id_ID',
    siteName: 'ZXQ Consulting',
  },
  ms: {
    lang: 'ms',
    title: 'ZXQ Consulting | Nasihat strategik untuk pengembangan global TCM',
    description:
      'ZXQ Consulting menyokong jenama TCM, suplemen dan penjagaan kulit Hanfang dengan strategi kemasukan pasaran, pematuhan, saluran dan diagnosis AI.',
    ogLocale: 'ms_MY',
    siteName: 'ZXQ Consulting',
  },
  vi: {
    lang: 'vi',
    title: 'ZXQ Consulting | Tư vấn chiến lược cho mở rộng toàn cầu ngành TCM',
    description:
      'ZXQ Consulting hỗ trợ thương hiệu y học cổ truyền Trung Hoa, thực phẩm bổ sung và Hanfang với chiến lược vào thị trường, tuân thủ, kênh phân phối và chẩn đoán AI.',
    ogLocale: 'vi_VN',
    siteName: 'ZXQ Consulting',
  },
  it: {
    lang: 'it',
    title: 'ZXQ Consulting | Consulenza strategica per l’espansione globale della MTC',
    description:
      'ZXQ Consulting supporta marchi di medicina tradizionale cinese, integratori e skincare Hanfang con strategia di ingresso, compliance, canali e diagnosi AI.',
    ogLocale: 'it_IT',
    siteName: 'ZXQ Consulting',
  },
  lo: {
    lang: 'lo',
    title: 'ZXQ Consulting | ທີ່ປຶກສາຍຸດທະສາດສໍາລັບການຂະຫຍາຍ TCM ສູ່ຕະຫຼາດໂລກ',
    description:
      'ZXQ Consulting ສະໜັບສະໜູນແບຣນຢາຈີນດັ້ງເດີມ ອາຫານເສີມ ແລະ Hanfang ດ້ວຍຍຸດທະສາດເຂົ້າຕະຫຼາດ, ຄວາມສອດຄ່ອງ ແລະ AI diagnosis.',
    ogLocale: 'lo_LA',
    siteName: 'ZXQ Consulting',
  },
};

function updateMeta(name: string, content: string) {
  const element = document.querySelector(`meta[name="${name}"]`);
  if (element) {
    element.setAttribute('content', content);
  }
}

function updateProperty(property: string, content: string) {
  const element = document.querySelector(`meta[property="${property}"]`);
  if (element) {
    element.setAttribute('content', content);
  }
}

function updateLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute('href', href);
  }
}

export default function SEO() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const rawLanguage = (i18n.language || 'en').split('-')[0].toLowerCase();
    const language = rawLanguage === 'en' ? 'en' : rawLanguage;
    const seo = SEO_BY_LANGUAGE[language] || DEFAULT_SEO;
    const baseUrl = 'https://zxqconsulting.com/';
    const currentUrl = new URL(baseUrl);
    if (language !== 'zh' && language !== 'en') {
      currentUrl.searchParams.set('lang', language);
    }

    document.title = seo.title;
    document.documentElement.lang = seo.lang;

    updateMeta('description', seo.description);
    updateMeta('twitter:title', seo.title);
    updateMeta('twitter:description', seo.description);
    updateProperty('og:title', seo.title);
    updateProperty('og:description', seo.description);
    updateProperty('og:locale', seo.ogLocale);
    updateProperty('og:site_name', seo.siteName);
    updateProperty('og:url', currentUrl.toString());
    updateLink('canonical', currentUrl.toString());

    Object.entries(SEO_BY_LANGUAGE).forEach(([code]) => {
      const href = new URL(baseUrl);
      if (code !== 'zh' && code !== 'en') {
        href.searchParams.set('lang', code);
      }
      updateLink('alternate', href.toString(), code);
    });

    updateLink('alternate', baseUrl, 'x-default');
  }, [i18n.language]);

  return null;
}
