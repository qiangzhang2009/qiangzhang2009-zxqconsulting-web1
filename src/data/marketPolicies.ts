/**
 * 中医药产品出海各国市场准入政策数据库
 * 数据来源：各国官方机构公开信息
 */

// 市场列表
export const MARKETS = [
  { id: 'japan', name: '日本', flag: '🇯🇵', nameEn: 'Japan' },
  { id: 'australia', name: '澳大利亚', flag: '🇦🇺', nameEn: 'Australia' },
  { id: 'usa', name: '美国', flag: '🇺🇸', nameEn: 'United States' },
  { id: 'eu', name: '欧盟', flag: '🇪🇺', nameEn: 'European Union' },
  { id: 'southeast', name: '东南亚', flag: '🇸🇬', nameEn: 'Southeast Asia' },
  { id: 'korea', name: '韩国', flag: '🇰🇷', nameEn: 'South Korea' },
  { id: 'middleeast', name: '中东', flag: '🇸🇦', nameEn: 'Middle East' },
  { id: 'canada', name: '加拿大', flag: '🇨🇦', nameEn: 'Canada' },
];

// 产品品类列表
export const PRODUCT_CATEGORIES = [
  { id: 'supplement', name: '保健食品/膳食补充剂', nameEn: 'Health Food / Dietary Supplement' },
  { id: 'traditional', name: '传统草药/中药制剂', nameEn: 'Traditional Herbal Medicine' },
  { id: 'cosmetic', name: '化妆品/护肤品', nameEn: 'Cosmetics / Skincare' },
  { id: 'medical', name: '医疗器械', nameEn: 'Medical Device' },
  { id: 'food', name: '普通食品', nameEn: 'General Food' },
];

// 各国准入规则数据库
export const MARKET_POLICIES: Record<string, Record<string, MarketPolicy>> = {
  japan: {
    supplement: {
      market: '日本',
      category: '保健食品',
      allowed: true,
      difficulty: '高',
      timeline: '12-24个月',
      timelineEn: '12-24 months',
      requirements: [
        'PMDA（ Pharmaceutical and Medical Devices Agency）注册',
        '需要日本当地代理商',
        '产品功效需符合日本功能性标示食品制度',
        '需提供日文产品标签',
      ],
      requirementsEn: [
        'PMDA registration',
        'Required Japanese local agent',
        'Compliance with Japanese Functional Claim Food system',
        'Japanese product label required',
      ],
      documents: [
        '产品技术文件（日文）',
        '功效成分分析报告',
        '生产工厂GMP认证',
        '产品稳定性测试报告',
        '日文标签设计稿',
      ],
      documentsEn: [
        'Product technical documents (Japanese)',
        'Functional ingredient analysis report',
        'GMP certification',
        'Product stability test report',
        'Japanese label design',
      ],
      warnings: [
        '日本对保健功能声称要求严格',
        '部分中药成分可能被列为医药部外品',
        '需要持续的市场后监测',
      ],
      warningsEn: [
        'Strict requirements for health claims',
        'Some TCM ingredients may be classified as quasi-drugs',
        'Requires ongoing post-market surveillance',
      ],
      officialLinks: [
        { name: 'PMDA官网', url: 'https://www.pmda.go.jp' },
        { name: '功能性标示食品制度', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/hyoukakikaku.html' },
      ],
    },
    traditional: {
      market: '日本',
      category: '传统草药',
      allowed: true,
      difficulty: '非常高',
      timeline: '18-36个月',
      timelineEn: '18-36 months',
      requirements: [
        'PMDA医药部外品注册',
        '需要日本医药品卸卖商作为代理商',
        '处方成分需符合日本药局方',
        '需进行日本人种间临床试验',
      ],
      requirementsEn: [
        'PMDA quasi-drug registration',
        'Required Japanese pharmaceutical wholesaler as agent',
        'Ingredients must comply with Japanese Pharmacopoeia',
        'Clinical trials in Japanese population may be required',
      ],
      documents: [
        '完整的日文医药品注册资料',
        '处方及配方工艺文件',
        '质量标准及检验方法',
        '药理毒理研究报告',
        '临床试验数据',
      ],
      documentsEn: [
        'Complete Japanese registration documents',
        'Formulation and process documentation',
        'Quality standards and testing methods',
        'Pharmacology and toxicology reports',
        'Clinical trial data',
      ],
      warnings: [
        '注册难度极高，审批周期长',
        '很多传统中药成分在日本被归类为医药部外品',
        '需要日本药剂师作为联系人',
      ],
      warningsEn: [
        'Very high difficulty, long approval timeline',
        'Many traditional TCM ingredients classified as quasi-drugs',
        'Requires Japanese pharmacist as contact person',
      ],
      officialLinks: [
        { name: 'PMDA医药部外品', url: 'https://www.pmda.go.jp/english/' },
      ],
    },
    cosmetic: {
      market: '日本',
      category: '化妆品',
      allowed: true,
      difficulty: '中',
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      requirements: [
        '日本化妆品制造贩卖业许可',
        '产品备案（医药部外品除外）',
        '配合成分需在已批准清单中',
        '日文全成分标识',
      ],
      requirementsEn: [
        'Japanese cosmetics manufacturing/sales license',
        'Product notification (except quasi-drugs)',
        'Ingredients must be in approved list',
        'Japanese full ingredient labeling',
      ],
      documents: [
        '配合成分清单',
        '制造工艺流程',
        '安全性评估报告',
        '日文标签',
      ],
      documentsEn: [
        'Ingredient list',
        'Manufacturing process',
        'Safety assessment report',
        'Japanese label',
      ],
      warnings: [
        '部分中药成分需要医药部外品审批',
        '功效宣传需符合化妆品广告法',
      ],
      warningsEn: [
        'Some TCM ingredients require quasi-drug approval',
        'Efficacy claims must comply with Cosmetics Advertisement Law',
      ],
      officialLinks: [
        { name: '厚生劳动省', url: 'https://www.mhlw.go.jp' },
      ],
    },
    food: {
      market: '日本',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '3-6个月',
      timelineEn: '3-6 months',
      requirements: [
        '进口食品通知书',
        '日本食品表示标准符合',
        '日文营养成分标签',
      ],
      requirementsEn: [
        'Imported Food Notification',
        'Compliance with Japanese Food Labeling Standards',
        'Japanese nutrition facts label',
      ],
      documents: [
        '产品成分表',
        '营养成分分析',
        '日文标签',
        '进口商信息',
      ],
      documentsEn: [
        'Product ingredient list',
        'Nutrition analysis',
        'Japanese label',
        'Importer information',
      ],
      warnings: [
        '需确认无禁用成分',
        '营养标识需符合日本标准',
      ],
      warningsEn: [
        'Verify no prohibited ingredients',
        'Nutrition labeling must meet Japanese standards',
      ],
      officialLinks: [
        { name: '消费者厅', url: 'https://www.caa.go.jp' },
      ],
    },
  },
  australia: {
    supplement: {
      market: '澳大利亚',
      category: '保健食品',
      allowed: true,
      difficulty: '中',
      timeline: '6-18个月',
      timelineEn: '6-18 months',
      requirements: [
        'TGA（Therapeutic Goods Administration）注册',
        '需要澳大利亚当地 sponsor',
        '符合TGA功效声称要求',
        'GMP生产认证',
      ],
      requirementsEn: [
        'TGA registration',
        'Required Australian local sponsor',
        'Compliance with TGA efficacy claims',
        'GMP manufacturing certification',
      ],
      documents: [
        '产品标签',
        '成分分析',
        'GMP证书',
        '功效证据材料',
      ],
      documentsEn: [
        'Product label',
        'Ingredient analysis',
        'GMP certificate',
        'Efficacy evidence',
      ],
      warnings: [
        'TGA对功效声称要求严格',
        '需提供临床证据支持功能声称',
      ],
      warningsEn: [
        'Strict TGA requirements for efficacy claims',
        'Clinical evidence required for functional claims',
      ],
      officialLinks: [
        { name: 'TGA官网', url: 'https://www.tga.gov.au' },
      ],
    },
    traditional: {
      market: '澳大利亚',
      category: '传统草药',
      allowed: true,
      difficulty: '中高',
      timeline: '12-24个月',
      timelineEn: '12-24 months',
      requirements: [
        'TGA注册为 complementary medicine',
        '需提供传统使用证据',
        '符合澳大利亚药物标准',
      ],
      requirementsEn: [
        'TGA registration as complementary medicine',
        'Traditional use evidence required',
        'Compliance with Australian Medicines Standards',
      ],
      documents: [
        '传统使用历史文档',
        '质量标准',
        '安全性评估',
      ],
      documentsEn: [
        'Traditional use history documentation',
        'Quality standards',
        'Safety assessment',
      ],
      warnings: [
        '部分成分可能被列为处方药',
        '需确认成分在允许清单中',
      ],
      warningsEn: [
        'Some ingredients may be classified as prescription medicines',
        'Verify ingredients are on allowed list',
      ],
      officialLinks: [
        { name: 'TGA补充药品', url: 'https://www.tga.gov.au/products/complementary-medicines' },
      ],
    },
    cosmetic: {
      market: '澳大利亚',
      category: '化妆品',
      allowed: true,
      difficulty: '低',
      timeline: '3-6个月',
      timelineEn: '3-6 months',
      requirements: [
        '澳大利亚化妆品通知（ICNA）',
        '符合澳大利亚化妆品标准',
        '责任人的澳大利亚联系方式',
      ],
      requirementsEn: [
        'Australian cosmetic notification (ICNA)',
        'Compliance with Australian Cosmetic Standards',
        'Australian contact for responsible person',
      ],
      documents: [
        '产品配方',
        '安全评估',
        '标签',
      ],
      documentsEn: [
        'Product formulation',
        'Safety assessment',
        'Label',
      ],
      warnings: [
        '需在澳大利亚化妆品数据库登记',
      ],
      warningsEn: [
        'Must register in Australian Cosmetic Database',
      ],
      officialLinks: [
        { name: 'NICNAS', url: 'https://www.industrialchemicals.gov.au' },
      ],
    },
    food: {
      market: '澳大利亚',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        '进口食品许可证（如需要）',
        '符合澳大利亚新西兰食品标准',
        'FSANZ批准的新成分（如使用新原料）',
      ],
      requirementsEn: [
        'Imported Food License (if required)',
        'Compliance with Australia New Zealand Food Standards',
        'FSANZ approval for novel ingredients',
      ],
      documents: [
        '产品成分表',
        '营养信息',
        '原产地证明',
      ],
      documentsEn: [
        'Product ingredient list',
        'Nutritional information',
        'Country of origin certificate',
      ],
      warnings: [
        '部分中药材可能需要FSANZ新成分审批',
      ],
      warningsEn: [
        'Some TCM materials may require FSANZ novel ingredient approval',
      ],
      officialLinks: [
        { name: 'FSANZ', url: 'https://www.foodstandards.gov.au' },
      ],
    },
  },
  usa: {
    supplement: {
      market: '美国',
      category: '保健食品',
      allowed: true,
      difficulty: '中',
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      requirements: [
        'FDA膳食补充剂工厂注册',
        '符合DSHEA（Dietary Supplement Health and Education Act）',
        'GMP合规（21 CFR Part 111）',
        '新膳食成分（NDI）通知（如使用新成分）',
      ],
      requirementsEn: [
        'FDA dietary supplement facility registration',
        'Compliance with DSHEA',
        'GMP compliance (21 CFR Part 111)',
        'New Dietary Ingredient (NDI) notification if using new ingredients',
      ],
      documents: [
        '产品标签',
        '成分分析',
        'GMP合规文件',
        'NDI通知文件（如需要）',
      ],
      documentsEn: [
        'Product label',
        'Ingredient analysis',
        'GMP compliance documentation',
        'NDI notification (if required)',
      ],
      warnings: [
        '不允许声称治疗疾病',
        '新成分需要NDI通知',
        'FDA抽查频率增加',
      ],
      warningsEn: [
        'Cannot claim to treat diseases',
        'New ingredients require NDI notification',
        'Increased FDA inspection frequency',
      ],
      officialLinks: [
        { name: 'FDA膳食补充剂', url: 'https://www.fda.gov/food/dietary-supplements' },
      ],
    },
    traditional: {
      market: '美国',
      category: '传统草药',
      allowed: false,
      difficulty: '非常高',
      timeline: '24-48个月',
      timelineEn: '24-48 months',
      requirements: [
        'FDA药品注册（NDA/ANDA）',
        '需进行美国临床试验',
        '符合FDA药品生产规范',
      ],
      requirementsEn: [
        'FDA drug registration (NDA/ANDA)',
        'US clinical trials required',
        'FDA drug GMP compliance',
      ],
      documents: [
        '完整的药品注册文件',
        '临床试验数据',
        'CMC文档',
      ],
      documentsEn: [
        'Complete drug registration documents',
        'Clinical trial data',
        'CMC documentation',
      ],
      warnings: [
        '几乎所有传统中药都需要FDA药品审批',
        '难度极高，周期很长',
        '建议以膳食补充剂形式进入',
      ],
      warningsEn: [
        'Almost all traditional Chinese medicines require FDA drug approval',
        'Extremely high difficulty, very long timeline',
        'Recommend entering as dietary supplement',
      ],
      officialLinks: [
        { name: 'FDA药品评估与研究中心', url: 'https://www.fda.gov/drugs' },
      ],
    },
    cosmetic: {
      market: '美国',
      category: '化妆品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        'FDA化妆品工厂注册（自愿）',
        '符合FDA化妆品法规',
        '不良事件报告（FDA注册企业）',
      ],
      requirementsEn: [
        'FDA cosmetic facility registration (voluntary)',
        'Compliance with FDA cosmetic regulations',
        'Adverse event reporting (for registered facilities)',
      ],
      documents: [
        '产品成分',
        '安全评估',
        '标签',
      ],
      documentsEn: [
        'Product ingredients',
        'Safety assessment',
        'Label',
      ],
      warnings: [
        '不允许声称药品功效',
        '需确保成分无禁用物质',
      ],
      warningsEn: [
        'Cannot claim drug efficacy',
        'Ensure ingredients are not prohibited',
      ],
      officialLinks: [
        { name: 'FDA化妆品', url: 'https://www.fda.gov/cosmetics' },
      ],
    },
    food: {
      market: '美国',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        'FDA食品设施注册',
        '符合FSMA（食品安全现代化法案）',
        '标签符合FDA要求',
      ],
      requirementsEn: [
        'FDA food facility registration',
        'Compliance with FSMA',
        'Label compliance with FDA requirements',
      ],
      documents: [
        'HACCP计划（如需要）',
        '产品标签',
        '进口商信息',
      ],
      documentsEn: [
        'HACCP plan (if required)',
        'Product label',
        'Importer information',
      ],
      warnings: [
        '需遵守FDA食品安全法规',
        '新成分可能需要GRAS认证',
      ],
      warningsEn: [
        'Must comply with FDA food safety regulations',
        'Novel ingredients may require GRAS certification',
      ],
      officialLinks: [
        { name: 'FDA食品安全', url: 'https://www.fda.gov/food' },
      ],
    },
  },
  eu: {
    supplement: {
      market: '欧盟',
      category: '保健食品',
      allowed: true,
      difficulty: '中高',
      timeline: '12-24个月',
      timelineEn: '12-24 months',
      requirements: [
        '符合欧盟食品补充剂指令（2002/46/EC）',
        '在Novel Food目录或获得批准（如使用新成分）',
        '符合欧盟功效声称法规（EC 1924/2006）',
        '指定欧盟责任人或进口商',
      ],
      requirementsEn: [
        'Compliance with EU Food Supplement Directive (2002/46/EC)',
        'Listed in Novel Food catalog or approved (if using new ingredients)',
        'Compliance with EU Nutrition and Health Claims Regulation (EC 1924/2006)',
        'Appoint EU responsible person or importer',
      ],
      documents: [
        '产品标签（符合欧盟格式）',
        '成分规格',
        '安全性评估',
        '功效声称支持文件',
      ],
      documentsEn: [
        'Product label (EU format)',
        'Ingredient specifications',
        'Safety assessment',
        'Claims support documentation',
      ],
      warnings: [
        '新成分需要Novel Food审批',
        '功效声称需EFSA批准',
        '各国法规可能有差异',
      ],
      warningsEn: [
        'New ingredients require Novel Food approval',
        'Health claims require EFSA approval',
        'National regulations may vary',
      ],
      officialLinks: [
        { name: 'EFSA', url: 'https://www.efsa.europa.eu' },
      ],
    },
    traditional: {
      market: '欧盟',
      category: '传统草药',
      allowed: true,
      difficulty: '非常高',
      timeline: '24-48个月',
      timelineEn: '24-48 months',
      requirements: [
        '传统草药注册（THR）或集中/互认审批',
        '需提供25年传统使用证明（至少15年在欧盟）',
        '符合EMA草药专论',
      ],
      requirementsEn: [
        'Traditional Herbal Registration (THR) or central/mutual recognition',
        '25 years traditional use proof (at least 15 in EU)',
        'Compliance with EMA monograph',
      ],
      documents: [
        '传统使用证据',
        '质量标准',
        '安全性评估',
        '产品特征文件',
      ],
      documentsEn: [
        'Traditional use evidence',
        'Quality standards',
        'Safety assessment',
        'Product specification',
      ],
      warnings: [
        '传统使用证明很难获取',
        '审批周期很长',
      ],
      warningsEn: [
        'Traditional use proof difficult to obtain',
        'Very long approval timeline',
      ],
      officialLinks: [
        { name: 'EMA', url: 'https://www.ema.europa.eu' },
      ],
    },
    cosmetic: {
      market: '欧盟',
      category: '化妆品',
      allowed: true,
      difficulty: '中',
      timeline: '3-6个月',
      timelineEn: '3-6 months',
      requirements: [
        '符合欧盟化妆品法规（EC 1223/2009）',
        '指定欧盟责任人',
        '化妆品安全性评估',
        '在CPNP（欧盟化妆品通报门户）注册',
      ],
      requirementsEn: [
        'Compliance with EU Cosmetic Regulation (EC 1223/2009)',
        'Appoint EU responsible person',
        'Cosmetic safety assessment',
        'Register in CPNP (Cosmetic Products Notification Portal)',
      ],
      documents: [
        '产品信息文件（PIF）',
        '安全评估报告',
        '标签',
      ],
      documentsEn: [
        'Product Information File (PIF)',
        'Safety assessment report',
        'Label',
      ],
      warnings: [
        '需要欧盟责任人',
        '需完成CPNP注册',
      ],
      warningsEn: [
        'EU responsible person required',
        'CPNP registration required',
      ],
      officialLinks: [
        { name: 'EC CPNP', url: 'https://ec.europa.eu/growth/sectors/cosmetics/cosmetics_en' },
      ],
    },
    food: {
      market: '欧盟',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        '符合欧盟食品法规（178/2002等）',
        '新成分需要Novel Food批准',
        '标签符合欧盟要求',
      ],
      requirementsEn: [
        'Compliance with EU Food Law (178/2002 etc.)',
        'Novel Food approval for new ingredients',
        'Label compliance with EU requirements',
      ],
      documents: [
        '产品成分',
        '营养信息',
        '标签',
      ],
      documentsEn: [
        'Product ingredients',
        'Nutritional information',
        'Label',
      ],
      warnings: [
        '新成分限制严格',
      ],
      warningsEn: [
        'Strict novel ingredient restrictions',
      ],
      officialLinks: [
        { name: '欧盟食品安全', url: 'https://food.ec.europa.eu' },
      ],
    },
  },
  southeast: {
    supplement: {
      market: '东南亚',
      category: '保健食品',
      allowed: true,
      difficulty: '中低',
      timeline: '3-12个月',
      timelineEn: '3-12 months',
      requirements: [
        '各国FDA/药品监管机构注册',
        '符合各国功能性声称要求',
        '需要当地代理商',
      ],
      requirementsEn: [
        'Registration with local FDA/drug regulatory authorities',
        'Compliance with local functional claim requirements',
        'Local agent required',
      ],
      documents: [
        '产品标签',
        '成分分析',
        'GMP证书',
        '功效材料',
      ],
      documentsEn: [
        'Product label',
        'Ingredient analysis',
        'GMP certificate',
        'Efficacy documentation',
      ],
      warnings: [
        '各国法规差异大',
        '新加坡、马来西亚准入相对容易',
        '印尼、泰国要求较严格',
      ],
      warningsEn: [
        'Regulations vary by country',
        'Singapore, Malaysia relatively easier',
        'Indonesia, Thailand more strict',
      ],
      officialLinks: [
        { name: '新加坡HSA', url: 'https://www.hsa.gov.sg' },
        { name: '马来西亚NPRA', url: 'https://www.npra.gov.my' },
      ],
    },
    traditional: {
      market: '东南亚',
      category: '传统草药',
      allowed: true,
      difficulty: '中',
      timeline: '6-18个月',
      timelineEn: '6-18 months',
      requirements: [
        '各国传统药品注册',
        '需提供传统使用证据',
        '符合各国药典标准',
      ],
      requirementsEn: [
        'Traditional medicine registration in each country',
        'Traditional use evidence required',
        'Compliance with local pharmacopoeia',
      ],
      documents: [
        '传统使用文档',
        '质量标准',
        '安全性评估',
      ],
      documentsEn: [
        'Traditional use documentation',
        'Quality standards',
        'Safety assessment',
      ],
      warnings: [
        '各国要求差异大',
        '部分国家对传统药有专门分类',
      ],
      warningsEn: [
        'Requirements vary by country',
        'Some countries have specific traditional medicine categories',
      ],
      officialLinks: [
        { name: '泰国FDA', url: 'https://www.fda.th' },
      ],
    },
    cosmetic: {
      market: '东南亚',
      category: '化妆品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        '各国化妆品通知/注册',
        '符合各国化妆品法规',
      ],
      requirementsEn: [
        'Cosmetics notification/registration in each country',
        'Compliance with local cosmetics regulations',
      ],
      documents: [
        '产品配方',
        '标签',
        '安全评估',
      ],
      documentsEn: [
        'Product formulation',
        'Label',
        'Safety assessment',
      ],
      warnings: [
        'ASEAN化妆品指令逐步统一',
      ],
      warningsEn: [
        'ASEAN Cosmetic Directive gradually harmonized',
      ],
      officialLinks: [
        { name: 'ASEAN化妆品', url: 'https://aseancosmetics.org' },
      ],
    },
    food: {
      market: '东南亚',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        '各国进口食品要求',
        '符合各国食品标准',
        '标签符合要求',
      ],
      requirementsEn: [
        'Import food requirements for each country',
        'Compliance with local food standards',
        'Label compliance',
      ],
      documents: [
        '产品成分',
        '卫生证书',
        '标签',
      ],
      documentsEn: [
        'Product ingredients',
        'Health certificate',
        'Label',
      ],
      warnings: [
        '各国要求不同',
      ],
      warningsEn: [
        'Requirements vary by country',
      ],
      officialLinks: [],
    },
  },
  korea: {
    supplement: {
      market: '韩国',
      category: '保健食品',
      allowed: true,
      difficulty: '中',
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      requirements: [
        'MFDS（食品医药品安全处）健康功能食品注册',
        '需韩国当地代理商',
        '符合韩国功效声称制度',
      ],
      requirementsEn: [
        'MFDS Health Functional Food registration',
        'Korean local agent required',
        'Compliance with Korean claims system',
      ],
      documents: [
        '产品标签（韩文）',
        '功效临床资料',
        '制造工艺',
      ],
      documentsEn: [
        'Product label (Korean)',
        'Efficacy clinical data',
        'Manufacturing process',
      ],
      warnings: [
        '功效声称需MFDS批准',
        '韩文标签必须',
      ],
      warningsEn: [
        'Claims require MFDS approval',
        'Korean label mandatory',
      ],
      officialLinks: [
        { name: 'MFDS', url: 'https://www.mfds.go.kr' },
      ],
    },
    traditional: {
      market: '韩国',
      category: '传统草药',
      allowed: true,
      difficulty: '高',
      timeline: '12-24个月',
      timelineEn: '12-24 months',
      requirements: [
        'MFDS医药品注册',
        '符合韩国药局方',
        '需临床试验数据',
      ],
      requirementsEn: [
        'MFDS pharmaceutical registration',
        'Compliance with Korean Pharmacopoeia',
        'Clinical trial data required',
      ],
      documents: [
        '韩文注册文件',
        '临床数据',
        '质量标准',
      ],
      documentsEn: [
        'Korean registration documents',
        'Clinical data',
        'Quality standards',
      ],
      warnings: [
        '注册难度高',
        '审批周期长',
      ],
      warningsEn: [
        'High registration difficulty',
        'Long approval timeline',
      ],
      officialLinks: [],
    },
    cosmetic: {
      market: '韩国',
      category: '化妆品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        'MFDS化妆品制造/进口许可',
        '符合韩国化妆品法',
        '标签符合KFDA标准',
      ],
      requirementsEn: [
        'MFDS cosmetics manufacturing/import license',
        'Compliance with Korean Cosmetics Act',
        'Label meets KFDA standards',
      ],
      documents: [
        '产品配方',
        '安全性评估',
        '韩文标签',
      ],
      documentsEn: [
        'Product formulation',
        'Safety assessment',
        'Korean label',
      ],
      warnings: [
        '功能性化妆品需额外审批',
      ],
      warningsEn: [
        'Functional cosmetics require additional approval',
      ],
      officialLinks: [],
    },
    food: {
      market: '韩国',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-2个月',
      timelineEn: '1-2 months',
      requirements: [
        '进口食品申报',
        '符合韩国食品标准',
        '韩文标签',
      ],
      requirementsEn: [
        'Imported food notification',
        'Compliance with Korean Food Standards',
        'Korean label',
      ],
      documents: [
        '成分表',
        '营养信息',
        '韩文标签',
      ],
      documentsEn: [
        'Ingredient list',
        'Nutritional information',
        'Korean label',
      ],
      warnings: [],
      warningsEn: [],
      officialLinks: [],
    },
  },
  middleeast: {
    supplement: {
      market: '中东',
      category: '保健食品',
      allowed: true,
      difficulty: '中',
      timeline: '3-9个月',
      timelineEn: '3-9 months',
      requirements: [
        '各国SFDA（沙特）/ UAE等注册',
        '符合GCC（海合会）法规',
        '需要当地代理商',
      ],
      requirementsEn: [
        'Registration with local SFDA (Saudi) / UAE etc.',
        'Compliance with GCC regulations',
        'Local agent required',
      ],
      documents: [
        '产品标签（阿拉伯文/英文）',
        '成分分析',
        'GMP证书',
      ],
      documentsEn: [
        'Product label (Arabic/English)',
        'Ingredient analysis',
        'GMP certificate',
      ],
      warnings: [
        '需要Halal认证（沙特等）',
        '标签需阿拉伯文',
      ],
      warningsEn: [
        'Halal certification required (Saudi etc.)',
        'Arabic label required',
      ],
      officialLinks: [
        { name: '沙特SFDA', url: 'https://www.sfda.gov.sa' },
      ],
    },
    traditional: {
      market: '中东',
      category: '传统草药',
      allowed: true,
      difficulty: '中高',
      timeline: '6-18个月',
      timelineEn: '6-18 months',
      requirements: [
        '各国传统药注册',
        '符合当地药典',
        '安全性评估',
      ],
      requirementsEn: [
        'Traditional medicine registration in each country',
        'Compliance with local pharmacopoeia',
        'Safety assessment',
      ],
      documents: [
        '质量标准',
        '安全性评估',
        '传统使用证据',
      ],
      documentsEn: [
        'Quality standards',
        'Safety assessment',
        'Traditional use evidence',
      ],
      warnings: [
        '各国法规差异大',
        'Halal认证重要',
      ],
      warningsEn: [
        'Regulations vary by country',
        'Halal certification important',
      ],
      officialLinks: [],
    },
    cosmetic: {
      market: '中东',
      category: '化妆品',
      allowed: true,
      difficulty: '低',
      timeline: '1-3个月',
      timelineEn: '1-3 months',
      requirements: [
        'GCC化妆品注册',
        '符合GCC化妆品法规',
        'Halal认证（可选但推荐）',
      ],
      requirementsEn: [
        'GCC cosmetics registration',
        'Compliance with GCC Cosmetic Regulation',
        'Halal certification (optional but recommended)',
      ],
      documents: [
        '产品配方',
        '安全评估',
        '标签',
      ],
      documentsEn: [
        'Product formulation',
        'Safety assessment',
        'Label',
      ],
      warnings: [
        'Halal认证有助于市场准入',
      ],
      warningsEn: [
        'Halal certification helps market access',
      ],
      officialLinks: [],
    },
    food: {
      market: '中东',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-2个月',
      timelineEn: '1-2 months',
      requirements: [
        '进口食品许可',
        '符合Halal要求',
        '阿拉伯文标签',
      ],
      requirementsEn: [
        'Imported food permit',
        'Halal compliance',
        'Arabic label',
      ],
      documents: [
        'Halal证书',
        '成分表',
        '阿拉伯文标签',
      ],
      documentsEn: [
        'Halal certificate',
        'Ingredient list',
        'Arabic label',
      ],
      warnings: [
        'Halal认证在海湾国家很重要',
      ],
      warningsEn: [
        'Halal certification important in Gulf countries',
      ],
      officialLinks: [],
    },
  },
  canada: {
    supplement: {
      market: '加拿大',
      category: '保健食品',
      allowed: true,
      difficulty: '中',
      timeline: '6-12个月',
      timelineEn: '6-12 months',
      requirements: [
        'NPN（Natural Product Number）许可',
        '符合加拿大自然健康产品法规',
        '需要加拿大持牌人',
      ],
      requirementsEn: [
        'NPN (Natural Product Number) license',
        'Compliance with Canadian Natural Health Products Regulations',
        'Canadian license holder required',
      ],
      documents: [
        '产品标签',
        '功效证据',
        '安全性评估',
        'GMP证书',
      ],
      documentsEn: [
        'Product label',
        'Efficacy evidence',
        'Safety assessment',
        'GMP certificate',
      ],
      warnings: [
        'NPN申请审批时间长',
        '功效声称需证据支持',
      ],
      warningsEn: [
        'Long NPN approval timeline',
        'Claims require evidence support',
      ],
      officialLinks: [
        { name: '加拿大卫生部', url: 'https://www.canada.ca/en/health-canada.html' },
      ],
    },
    traditional: {
      market: '加拿大',
      category: '传统草药',
      allowed: true,
      difficulty: '中',
      timeline: '8-14个月',
      timelineEn: '8-14 months',
      requirements: [
        'NPN传统药品申请',
        '需提供传统使用证据',
        '安全性评估',
      ],
      requirementsEn: [
        'NPN traditional medicine application',
        'Traditional use evidence required',
        'Safety assessment',
      ],
      documents: [
        '传统使用历史',
        '质量标准',
        '安全性文档',
      ],
      documentsEn: [
        'Traditional use history',
        'Quality standards',
        'Safety documentation',
      ],
      warnings: [
        '传统使用证据需详尽',
      ],
      warningsEn: [
        'Detailed traditional use evidence required',
      ],
      officialLinks: [],
    },
    cosmetic: {
      market: '加拿大',
      category: '化妆品',
      allowed: true,
      difficulty: '低',
      timeline: '1-2个月',
      timelineEn: '1-2 months',
      requirements: [
        '符合加拿大化妆品法规',
        '化妆品通知（自愿）',
      ],
      requirementsEn: [
        'Compliance with Canadian Cosmetics Regulations',
        'Cosmetics notification (voluntary)',
      ],
      documents: [
        '产品成分',
        '安全评估',
      ],
      documentsEn: [
        'Product ingredients',
        'Safety assessment',
      ],
      warnings: [],
      warningsEn: [],
      officialLinks: [],
    },
    food: {
      market: '加拿大',
      category: '普通食品',
      allowed: true,
      difficulty: '低',
      timeline: '1-2个月',
      timelineEn: '1-2 months',
      requirements: [
        '符合加拿大食品检验局要求',
        '标签符合CFIA标准',
      ],
      requirementsEn: [
        'Compliance with Canadian Food Inspection Agency requirements',
        'Label compliance with CFIA standards',
      ],
      documents: [
        '产品信息',
        '营养标签',
      ],
      documentsEn: [
        'Product information',
        'Nutrition label',
      ],
      warnings: [],
      warningsEn: [],
      officialLinks: [],
    },
  },
};

// 准入难度等级
export const DIFFICULTY_LEVELS = {
  低: { label: '低', color: 'green', level: 1 },
  中: { label: '中', color: 'yellow', level: 2 },
  中高: { label: '中高', color: 'orange', level: 3 },
  高: { label: '高', color: 'red', level: 4 },
  非常高: { label: '非常高', color: 'red', level: 5 },
};

// 类型定义
export interface MarketPolicy {
  market: string;
  category: string;
  allowed: boolean;
  difficulty: string;
  timeline: string;
  timelineEn: string;
  requirements: string[];
  requirementsEn: string[];
  documents: string[];
  documentsEn: string[];
  warnings: string[];
  warningsEn: string[];
  officialLinks: { name: string; url: string }[];
}

export interface Market {
  id: string;
  name: string;
  flag: string;
  nameEn: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameEn: string;
}
