import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Menu, X, Globe, Star, Languages } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: '#hero' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.markets'), href: '#markets' },
    { name: t('nav.contact'), href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo with Horse Year Badge */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-2 sm:gap-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              {/* Small plant badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <span className="text-xs sm:text-sm">🌿</span>
              </div>
            </div>
            <div>
              <span className={`font-serif font-bold text-base sm:text-lg transition-colors duration-300 ${
                isScrolled ? 'text-emerald-800' : 'text-emerald-800'
              }`}>
                {t('brand.name')}
              </span>
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current text-teal-400" />
                <span>{t('brand.tagline')}</span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation - Language Switcher + Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {/* Language Switcher - First Position */}
            <div className="relative">
              <LanguageSwitcher />
            </div>
            
            {/* Nav Links */}
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`text-sm font-medium transition-colors duration-300 hover:text-emerald-600 ${
                  isScrolled
                    ? 'text-[#3d352e]'
                    : 'text-[#3d352e]'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Button (Right) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-spring text-sm"
            >
              🧧 {t('footer.cta')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#3d352e]" />
            ) : (
              <Menu className="w-6 h-6 text-[#3d352e]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200/50 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-emerald-800 hover:text-emerald-600 font-medium transition-colors py-3 px-2 rounded-lg hover:bg-gray-50"
                >
                  {link.name}
                </a>
              ))}
              
              {/* Mobile Language Section - Direct grid display */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 px-2 mb-3">
                  <Languages className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-[#3d352e]">{t('brand.selectLanguage')}</span>
                </div>
                
                {/* 直接显示所有语言 - 3列网格 */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'zh', name: '中文', flag: '🇨🇳' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' },
                    { code: 'ja', name: '日本語', flag: '🇯🇵' },
                    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'pt', name: 'Português', flag: '🇧🇷' },
                    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                    { code: 'ko', name: '한국어', flag: '🇰🇷' },
                    { code: 'id', name: 'Bahasa', flag: '🇮🇩' },
                    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
                    { code: 'ms', name: 'Bahasa', flag: '🇲🇾' },
                    { code: 'lo', name: 'Lao', flag: '🇱🇦' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                        i18n.language === lang.code 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-600' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="mt-1">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mobile CTA Button */}
              <button
                onClick={() => scrollToSection('#contact')}
                className="btn-spring text-sm mt-4 w-full justify-center py-3"
              >
                🧧 {t('footer.cta')}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
