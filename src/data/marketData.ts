/**
 * 多维度目标市场智能选择系统
 * 支持按地理位置、经济热度、华人影响力分类
 * 包含二级/三级市场选择
 */

// 市场分类维度
export const MARKET_DIMENSIONS = {
  geography: {
    name: '按地理位置',
    nameEn: 'By Geography',
    regions: [
      {
        id: 'east-asia',
        name: '东亚',
        nameEn: 'East Asia',
        markets: [
          { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', level: 1 },
          { id: 'korea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', level: 1 },
          { id: 'taiwan', name: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', level: 2 },
          { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', flag: '🇭🇰', level: 2 },
          { id: 'mongolia', name: '蒙古', nameEn: 'Mongolia', flag: '🇲🇳', level: 3 },
        ]
      },
      {
        id: 'southeast-asia',
        name: '东南亚',
        nameEn: 'Southeast Asia',
        markets: [
          { id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', level: 1 },
          { id: 'thailand', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭', level: 1 },
          { id: 'malaysia', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾', level: 1 },
          { id: 'indonesia', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩', level: 2 },
          { id: 'vietnam', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳', level: 2 },
          { id: 'philippines', name: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭', level: 2 },
          { id: 'myanmar', name: '缅甸', nameEn: 'Myanmar', flag: '🇲🇲', level: 3 },
          { id: 'cambodia', name: '柬埔寨', nameEn: 'Cambodia', flag: '🇰🇭', level: 3 },
          { id: 'laos', name: '老挝', nameEn: 'Laos', flag: '🇱🇦', level: 3 },
          { id: 'brunei', name: '文莱', nameEn: 'Brunei', flag: '🇧🇳', level: 3 },
        ]
      },
      {
        id: 'oceania',
        name: '大洋洲',
        nameEn: 'Oceania',
        markets: [
          { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', level: 1 },
          { id: 'newzealand', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', level: 1 },
          { id: 'fiji', name: '斐济', nameEn: 'Fiji', flag: '🇫🇯', level: 3 },
          { id: 'pacific', name: '太平洋岛国', nameEn: 'Pacific Islands', flag: '🇵🇼', level: 3 },
        ]
      },
      {
        id: 'europe',
        name: '欧洲',
        nameEn: 'Europe',
        markets: [
          { id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪', level: 1 },
          { id: 'france', name: '法国', nameEn: 'France', flag: '🇫🇷', level: 1 },
          { id: 'uk', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧', level: 1 },
          { id: 'italy', name: '意大利', nameEn: 'Italy', flag: '🇮🇹', level: 1 },
          { id: 'spain', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸', level: 2 },
          { id: 'netherlands', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱', level: 2 },
          { id: 'belgium', name: '比利时', nameEn: 'Belgium', flag: '🇧🇪', level: 2 },
          { id: 'portugal', name: '葡萄牙', nameEn: 'Portugal', flag: '🇵🇹', level: 2 },
          { id: 'poland', name: '波兰', nameEn: 'Poland', flag: '🇵🇱', level: 2 },
          { id: 'sweden', name: '瑞典', nameEn: 'Sweden', flag: '🇸🇪', level: 2 },
          { id: 'norway', name: '挪威', nameEn: 'Norway', flag: '🇳🇴', level: 2 },
          { id: 'finland', name: '芬兰', nameEn: 'Finland', flag: '🇫🇮', level: 2 },
          { id: 'denmark', name: '丹麦', nameEn: 'Denmark', flag: '🇩🇰', level: 2 },
          { id: 'switzerland', name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭', level: 2 },
          { id: 'austria', name: '奥地利', nameEn: 'Austria', flag: '🇦🇹', level: 2 },
          { id: 'ireland', name: '爱尔兰', nameEn: 'Ireland', flag: '🇮🇪', level: 2 },
          { id: 'greece', name: '希腊', nameEn: 'Greece', flag: '🇬🇷', level: 3 },
          { id: 'czech', name: '捷克', nameEn: 'Czech Republic', flag: '🇨🇿', level: 3 },
          { id: 'hungary', name: '匈牙利', nameEn: 'Hungary', flag: '🇭🇺', level: 3 },
          { id: 'romania', name: '罗马尼亚', nameEn: 'Romania', flag: '🇷🇴', level: 3 },
        ]
      },
      {
        id: 'north-america',
        name: '北美洲',
        nameEn: 'North America',
        markets: [
          { id: 'usa', name: '美国', nameEn: 'United States', flag: '🇺🇸', level: 1 },
          { id: 'canada', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', level: 1 },
          { id: 'mexico', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', level: 2 },
        ]
      },
      {
        id: 'south-america',
        name: '南美洲',
        nameEn: 'South America',
        markets: [
          { id: 'brazil', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', level: 1 },
          { id: 'argentina', name: '阿根廷', nameEn: 'Argentina', flag: '🇦🇷', level: 2 },
          { id: 'chile', name: '智利', nameEn: 'Chile', flag: '🇨🇱', level: 2 },
          { id: 'colombia', name: '哥伦比亚', nameEn: 'Colombia', flag: '🇨🇴', level: 2 },
          { id: 'peru', name: '秘鲁', nameEn: 'Peru', flag: '🇵🇪', level: 2 },
        ]
      },
      {
        id: 'middle-east',
        name: '中东',
        nameEn: 'Middle East',
        markets: [
          { id: 'saudi', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦', level: 1 },
          { id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪', level: 1 },
          { id: 'qatar', name: '卡塔尔', nameEn: 'Qatar', flag: '🇶🇦', level: 2 },
          { id: 'kuwait', name: '科威特', nameEn: 'Kuwait', flag: '🇰🇼', level: 2 },
          { id: 'bahrain', name: '巴林', nameEn: 'Bahrain', flag: '🇧🇭', level: 2 },
          { id: 'oman', name: '阿曼', nameEn: 'Oman', flag: '🇴🇲', level: 2 },
          { id: 'israel', name: '以色列', nameEn: 'Israel', flag: '🇮🇱', level: 2 },
          { id: 'turkey', name: '土耳其', nameEn: 'Turkey', flag: '🇹🇷', level: 2 },
          { id: 'iran', name: '伊朗', nameEn: 'Iran', flag: '🇮🇷', level: 3 },
        ]
      },
      {
        id: 'africa',
        name: '非洲',
        nameEn: 'Africa',
        markets: [
          { id: 'egypt', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', level: 2 },
          { id: 'southafrica', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', level: 2 },
          { id: 'nigeria', name: '尼日利亚', nameEn: 'Nigeria', flag: '🇳🇬', level: 3 },
          { id: 'morocco', name: '摩洛哥', nameEn: 'Morocco', flag: '🇲🇦', level: 3 },
          { id: 'kenya', name: '肯尼亚', nameEn: 'Kenya', flag: '🇰🇪', level: 3 },
          { id: 'ethiopia', name: '埃塞俄比亚', nameEn: 'Ethiopia', flag: '🇪🇹', level: 3 },
        ]
      },
      {
        id: 'south-asia',
        name: '南亚',
        nameEn: 'South Asia',
        markets: [
          { id: 'india', name: '印度', nameEn: 'India', flag: '🇮🇳', level: 1 },
          { id: 'pakistan', name: '巴基斯坦', nameEn: 'Pakistan', flag: '🇵🇰', level: 2 },
          { id: 'bangladesh', name: '孟加拉国', nameEn: 'Bangladesh', flag: '🇧🇩', level: 3 },
          { id: 'srilanka', name: '斯里兰卡', nameEn: 'Sri Lanka', flag: '🇱🇰', level: 3 },
          { id: 'nepal', name: '尼泊尔', nameEn: 'Nepal', flag: '🇳🇵', level: 3 },
        ]
      },
      {
        id: 'central-asia',
        name: '中亚',
        nameEn: 'Central Asia',
        markets: [
          { id: 'kazakhstan', name: '哈萨克斯坦', nameEn: 'Kazakhstan', flag: '🇰🇿', level: 2 },
          { id: 'uzbekistan', name: '乌兹别克斯坦', nameEn: 'Uzbekistan', flag: '🇺🇿', level: 3 },
          { id: 'turkmenistan', name: '土库曼斯坦', nameEn: 'Turkmenistan', flag: '🇹🇲', level: 3 },
        ]
      },
    ]
  },
  economy: {
    name: '按经济热度',
    nameEn: 'By Economic Growth',
    categories: [
      {
        id: 'tier1',
        name: '一线热门市场',
        nameEn: 'Tier 1 - Hot Markets',
        desc: '经济发达、市场成熟、准入门槛高',
        descEn: 'Developed economies, mature markets, high entry barriers',
        markets: [
          { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', gdp: 4.9, chinesePop: 1.2 },
          { id: 'usa', name: '美国', nameEn: 'United States', flag: '🇺🇸', gdp: 25.3, chinesePop: 5.5 },
          { id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪', gdp: 4.3, chinesePop: 0.2 },
          { id: 'uk', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧', gdp: 3.3, chinesePop: 0.5 },
          { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', gdp: 1.7, chinesePop: 1.4 },
          { id: 'canada', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', gdp: 2.1, chinesePop: 1.8 },
          { id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', gdp: 0.4, chinesePop: 2.8 },
        ]
      },
      {
        id: 'tier2',
        name: '二线新兴市场',
        nameEn: 'Tier 2 - Emerging Markets',
        desc: '经济增长快、市场潜力大、准入适中',
        descEn: 'Fast growth, high potential, moderate entry',
        markets: [
          { id: 'korea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', gdp: 1.8, chinesePop: 1.1 },
          { id: 'thailand', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭', gdp: 0.5, chinesePop: 0.9 },
          { id: 'malaysia', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾', gdp: 0.4, chinesePop: 0.8 },
          { id: 'indonesia', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩', gdp: 1.3, chinesePop: 0.3 },
          { id: 'vietnam', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳', gdp: 0.4, chinesePop: 0.1 },
          { id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪', gdp: 0.5, chinesePop: 0.4 },
          { id: 'saudi', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦', gdp: 1.1, chinesePop: 0.05 },
          { id: 'india', name: '印度', nameEn: 'India', flag: '🇮🇳', gdp: 3.7, chinesePop: 0.02 },
          { id: 'brazil', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', gdp: 2.1, chinesePop: 0.05 },
        ]
      },
      {
        id: 'tier3',
        name: '三线潜力市场',
        nameEn: 'Tier 3 - Potential Markets',
        desc: '市场起步晚、增长空间大、需要培育',
        descEn: 'Early stage, large growth potential, needs development',
        markets: [
          { id: 'philippines', name: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭', gdp: 0.4, chinesePop: 0.1 },
          { id: 'mexico', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', gdp: 1.4, chinesePop: 0.01 },
          { id: 'poland', name: '波兰', nameEn: 'Poland', flag: '🇵🇱', gdp: 0.8, chinesePop: 0.05 },
          { id: 'turkey', name: '土耳其', nameEn: 'Turkey', flag: '🇹🇷', gdp: 0.9, chinesePop: 0.03 },
          { id: 'egypt', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', gdp: 0.4, chinesePop: 0.02 },
          { id: 'southafrica', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', gdp: 0.4, chinesePop: 0.03 },
          { id: 'pakistan', name: '巴基斯坦', nameEn: 'Pakistan', flag: '🇵🇰', gdp: 0.4, chinesePop: 0 },
        ]
      },
      {
        id: 'niche',
        name: '细分市场',
        nameEn: 'Niche Markets',
        desc: '特定领域有优势、竞争较小',
        descEn: 'Specific advantages, less competition',
        markets: [
          { id: 'newzealand', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', gdp: 0.25, chinesePop: 0.25 },
          { id: 'taiwan', name: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', gdp: 0.8, chinesePop: 23 },
          { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', flag: '🇭🇰', gdp: 0.4, chinesePop: 7.5 },
          { id: 'france', name: '法国', nameEn: 'France', flag: '🇫🇷', gdp: 0.3, chinesePop: 0.3 },
          { id: 'italy', name: '意大利', nameEn: 'Italy', flag: '🇮🇹', gdp: 2.1, chinesePop: 0.3 },
          { id: 'netherlands', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱', gdp: 1.0, chinesePop: 0.15 },
          { id: 'switzerland', name: '瑞士', nameEn: 'Switzerland', flag: '🇨🇭', gdp: 0.9, chinesePop: 0.05 },
          { id: 'chile', name: '智利', nameEn: 'Chile', flag: '🇨🇱', gdp: 0.3, chinesePop: 0.05 },
        ]
      }
    ]
  },
  chineseInfluence: {
    name: '按华人影响力',
    nameEn: 'By Chinese Community',
    categories: [
      {
        id: 'very-high',
        name: '华人密集区',
        nameEn: 'Very High Chinese Population',
        desc: '华人占比高、中医药接受度最高',
        descEn: 'High Chinese population, highest TCM acceptance',
        markets: [
          { id: 'taiwan', name: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', chinesePop: 23, chineseRatio: 100 },
          { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', flag: '🇭🇰', chinesePop: 7.5, chineseRatio: 100 },
          { id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', chinesePop: 2.8, chineseRatio: 74 },
          { id: 'malaysia', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾', chinesePop: 0.8, chineseRatio: 23 },
        ]
      },
      {
        id: 'high',
        name: '华人较多区',
        nameEn: 'High Chinese Population',
        desc: '华人社区成熟、市场认知度高',
        descEn: 'Established Chinese community, high market awareness',
        markets: [
          { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', chinesePop: 1.4, chineseRatio: 5.5 },
          { id: 'canada', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', chinesePop: 1.8, chineseRatio: 5 },
          { id: 'usa', name: '美国', nameEn: 'United States', flag: '🇺🇸', chinesePop: 5.5, chineseRatio: 1.7 },
          { id: 'uk', name: '英国', nameEn: 'United Kingdom', flag: '🇬🇧', chinesePop: 0.5, chineseRatio: 0.8 },
          { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', chinesePop: 1.2, chineseRatio: 1 },
          { id: 'korea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', chinesePop: 1.1, chineseRatio: 2 },
        ]
      },
      {
        id: 'medium',
        name: '华人适中区',
        nameEn: 'Medium Chinese Population',
        desc: '有华人社区、中医药正在普及',
        descEn: 'Chinese community exists, TCM spreading',
        markets: [
          { id: 'thailand', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭', chinesePop: 0.9, chineseRatio: 1.3 },
          { id: 'vietnam', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳', chinesePop: 0.1, chineseRatio: 0.1 },
          { id: 'philippines', name: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭', chinesePop: 0.1, chineseRatio: 0.1 },
          { id: 'indonesia', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩', chinesePop: 0.3, chineseRatio: 0.1 },
          { id: 'france', name: '法国', nameEn: 'France', flag: '🇫🇷', chinesePop: 0.3, chineseRatio: 0.5 },
          { id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪', chinesePop: 0.2, chineseRatio: 0.3 },
        ]
      },
      {
        id: 'low',
        name: '新兴市场',
        nameEn: 'Emerging Markets',
        desc: '华人较少、中医药认知度低、潜力大',
        descEn: 'Few Chinese, low TCM awareness, high potential',
        markets: [
          { id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪', chinesePop: 0.4, chineseRatio: 5 },
          { id: 'saudi', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦', chinesePop: 0.05, chineseRatio: 0.2 },
          { id: 'india', name: '印度', nameEn: 'India', flag: '🇮🇳', chinesePop: 0.02, chineseRatio: 0 },
          { id: 'brazil', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', chinesePop: 0.05, chineseRatio: 0 },
          { id: 'southafrica', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', chinesePop: 0.03, chineseRatio: 0.1 },
          { id: 'egypt', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', chinesePop: 0.02, chineseRatio: 0 },
          { id: 'pakistan', name: '巴基斯坦', nameEn: 'Pakistan', flag: '🇵🇰', chinesePop: 0, chineseRatio: 0 },
        ]
      }
    ]
  },
  // 按语言覆盖
  language: {
    name: '按网站语言',
    nameEn: 'By Website Language',
    desc: '选择与您网站语言匹配的市场',
    descEn: 'Choose markets matching your website language',
    categories: [
      {
        id: 'zh',
        name: '中文简体',
        markets: [
          { id: 'china', name: '中国大陆', flag: '🇨🇳' },
          { id: 'hongkong', name: '香港', flag: '🇭🇰' },
          { id: 'taiwan', name: '台湾', flag: '🇹🇼' },
          { id: 'singapore', name: '新加坡', flag: '🇸🇬' },
          { id: 'malaysia', name: '马来西亚', flag: '🇲🇾' },
        ]
      },
      {
        id: 'en',
        name: 'English',
        markets: [
          { id: 'usa', name: 'USA', flag: '🇺🇸' },
          { id: 'uk', name: 'UK', flag: '🇬🇧' },
          { id: 'australia', name: 'Australia', flag: '🇦🇺' },
          { id: 'canada', name: 'Canada', flag: '🇨🇦' },
          { id: 'singapore', name: 'Singapore', flag: '🇸🇬' },
        ]
      },
      {
        id: 'ja',
        name: '日本語',
        markets: [
          { id: 'japan', name: '日本', flag: '🇯🇵' },
        ]
      },
      {
        id: 'ko',
        name: '한국어',
        markets: [
          { id: 'korea', name: '韓国', flag: '🇰🇷' },
        ]
      },
      {
        id: 'ar',
        name: 'العربية',
        markets: [
          { id: 'saudi', name: 'السعودية', flag: '🇸🇦' },
          { id: 'uae', name: 'الإمارات', flag: '🇦🇪' },
          { id: 'egypt', name: 'مصر', flag: '🇪🇬' },
        ]
      },
      {
        id: 'ru',
        name: 'Русский',
        markets: [
          { id: 'russia', name: 'Россия', flag: '🇷🇺' },
          { id: 'kazakhstan', name: 'Казахстан', flag: '🇰🇿' },
        ]
      },
      {
        id: 'pt',
        name: 'Português',
        markets: [
          { id: 'brazil', name: 'Brasil', flag: '🇧🇷' },
          { id: 'portugal', name: 'Portugal', flag: '🇵🇹' },
        ]
      },
      {
        id: 'es',
        name: 'Español',
        markets: [
          { id: 'spain', name: 'España', flag: '🇪🇸' },
          { id: 'mexico', name: 'México', flag: '🇲🇽' },
          { id: 'argentina', name: 'Argentina', flag: '🇦🇷' },
        ]
      },
      {
        id: 'de',
        name: 'Deutsch',
        markets: [
          { id: 'germany', name: 'Deutschland', flag: '🇩🇪' },
          { id: 'austria', name: 'Österreich', flag: '🇦🇹' },
          { id: 'switzerland', name: 'Schweiz', flag: '🇨🇭' },
        ]
      },
      {
        id: 'fr',
        name: 'Français',
        markets: [
          { id: 'france', name: 'France', flag: '🇫🇷' },
          { id: 'belgium', name: 'Belgique', flag: '🇧🇪' },
          { id: 'switzerland', name: 'Suisse', flag: '🇨🇭' },
        ]
      },
      {
        id: 'th',
        name: 'ไทย',
        markets: [
          { id: 'thailand', name: 'ประเทศไทย', flag: '🇹🇭' },
        ]
      },
      {
        id: 'vi',
        name: 'Tiếng Việt',
        markets: [
          { id: 'vietnam', name: 'Việt Nam', flag: '🇻🇳' },
        ]
      },
      {
        id: 'id',
        name: 'Bahasa Indonesia',
        markets: [
          { id: 'indonesia', name: 'Indonesia', flag: '🇮🇩' },
        ]
      },
      {
        id: 'ms',
        name: 'Bahasa Melayu',
        markets: [
          { id: 'malaysia', name: 'Malaysia', flag: '🇲🇾' },
          { id: 'brunei', name: 'Brunei', flag: '🇧🇳' },
        ]
      },
      {
        id: 'it',
        name: 'Italiano',
        markets: [
          { id: 'italy', name: 'Italia', flag: '🇮🇹' },
        ]
      },
      {
        id: 'lo',
        name: 'Lao',
        markets: [
          { id: 'laos', name: 'Laos', flag: '🇱🇦' },
        ]
      },
      {
        id: 'nl',
        name: 'Nederlands',
        markets: [
          { id: 'netherlands', name: 'Nederland', flag: '🇳🇱' },
          { id: 'belgium', name: 'België', flag: '🇧🇪' },
        ]
      }
    ]
  }
};

// 热门推荐市场（首页展示）
export const HOT_MARKETS = [
  { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', reason: '门槛高但回报丰厚', reasonEn: 'High barrier but high return' },
  { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', reason: '华人多市场成熟', reasonEn: 'Large Chinese community, mature market' },
  { id: 'southeast', name: '东南亚', nameEn: 'Southeast Asia', flag: '🇸🇬', reason: '门槛低增长快', reasonEn: 'Low barrier, fast growth' },
  { id: 'usa', name: '美国', nameEn: 'USA', flag: '🇺🇸', reason: '全球最大市场', reasonEn: 'Largest global market' },
  { id: 'europe', name: '欧洲', nameEn: 'Europe', flag: '🇪🇺', reason: '高端市场认证', reasonEn: 'High-end market certification' },
  { id: 'middleeast', name: '中东', nameEn: 'Middle East', flag: '🇸🇦', reason: '新兴高消费市场', reasonEn: 'Emerging high-consumption market' },
];

// 便捷筛选条件
export const QUICK_FILTERS = [
  { id: 'budget-low', name: '💰 低预算(<10万)', nameEn: '💰 Low Budget (<$100K)', condition: { maxBudget: 100000 } },
  { id: 'budget-med', name: '💰💰 中预算(10-50万)', nameEn: '💰💰 Medium Budget ($100K-$500K)', condition: { minBudget: 100000, maxBudget: 500000 } },
  { id: 'budget-high', name: '💰💰💰 高预算(>50万)', nameEn: '💰💰💰 High Budget (>$500K)', condition: { minBudget: 500000 } },
  { id: 'timeline-fast', name: '🚀 快速进入(<6个月)', nameEn: '🚀 Fast Entry (<6 months)', condition: { maxTimeline: 6 } },
  { id: 'timeline-med', name: '🚶 常规进入(6-12月)', nameEn: '🚶 Normal Entry (6-12 months)', condition: { minTimeline: 6, maxTimeline: 12 } },
  { id: 'chinese-friendly', name: '🇨🇳 华人友好', nameEn: '🇨🇳 Chinese Friendly', condition: { minChineseRatio: 1 } },
  { id: 'high-margin', name: '💎 高利润市场', nameEn: '💎 High Margin Market', condition: { marketType: 'premium' } },
];

// 类型定义
export interface Market {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  level?: number;
  gdp?: number;
  chinesePop?: number;
  chineseRatio?: number;
  reason?: string;
  reasonEn?: string;
}

export interface MarketRegion {
  id: string;
  name: string;
  nameEn: string;
  markets: Market[];
}

export interface MarketCategory {
  id: string;
  name: string;
  nameEn: string;
  desc?: string;
  descEn?: string;
  markets: Market[];
}

export interface MarketDimension {
  name: string;
  nameEn: string;
  regions?: MarketRegion[];
  categories?: MarketCategory[];
}
