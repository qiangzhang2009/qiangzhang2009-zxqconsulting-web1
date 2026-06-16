import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { tracking } from '../lib/tracking';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', shortName: 'EN' },
  { code: 'zh', name: '中文', flag: '🇨🇳', shortName: '中' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', shortName: '日' },
  { code: 'es', name: 'Español', flag: '🇪🇸', shortName: 'ES' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', shortName: 'DE' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', shortName: 'FR' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', shortName: 'PT' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', shortName: 'AR' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', shortName: 'RU' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', shortName: '한' },
  { code: 'id', name: 'Bahasa', flag: '🇮🇩', shortName: 'ID' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', shortName: 'VN' },
  { code: 'ms', name: 'Bahasa', flag: '🇲🇾', shortName: 'MY' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦', shortName: 'LO' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', shortName: 'TH' },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    tracking.click(`lang_${langCode}`, 'language_switch');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 主按钮 - 直接显示当前语言 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600 hover:border-gray-500"
        aria-label="切换语言"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="text-xs font-bold text-gray-300 min-w-[20px] text-center">
          {currentLanguage.shortName}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 - 直接列表选择 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[100] animate-fade-in-up">
          {/* 头部 */}
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
            <span className="text-sm font-semibold text-gray-300">
              {i18n.language === 'zh' ? '切换语言 / Language' : 'Switch Language'}
            </span>
          </div>
          
          {/* 语言列表 */}
          <div className="max-h-80 overflow-y-auto py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                  i18n.language === lang.code 
                    ? 'bg-emerald-600/20 text-emerald-400' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="text-sm font-medium flex-1">{lang.name}</span>
                {i18n.language === lang.code && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
