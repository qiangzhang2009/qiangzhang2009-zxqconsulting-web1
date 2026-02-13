import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Star, Languages } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsMobileMenuOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

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
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#FFD700] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              {/* Small horse badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <span className="text-xs sm:text-sm">🐴</span>
              </div>
            </div>
            <div>
              <span className={`font-serif font-bold text-base sm:text-lg transition-colors duration-300 ${
                isScrolled ? 'text-[#3d352e]' : 'text-[#3d352e]'
              }`}>
                {t('brand.name')}
              </span>
              <div className="text-xs text-[#C41E3A] font-medium flex items-center gap-1">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current text-[#FFD700]" />
                <span className="hidden xs:inline">2026 马年</span>
                <span className="xs:hidden">马年</span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className={`text-sm font-medium transition-colors duration-300 hover:text-[#C41E3A] ${
                  isScrolled
                    ? 'text-[#3d352e]'
                    : 'text-[#3d352e]'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Language & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Simple Language Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-sm font-medium text-gray-700">{currentLang.name}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-primary-50 transition-colors ${
                      i18n.language === lang.code ? 'text-[#C41E3A] font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
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
                  className="text-[#3d352e] hover:text-[#C41E3A] font-medium transition-colors py-3 px-2 rounded-lg hover:bg-gray-50"
                >
                  {link.name}
                </a>
              ))}
              
              {/* Mobile Language Section - Grid Style */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 px-2 mb-3">
                  <Languages className="w-5 h-5 text-[#C41E3A]" />
                  <span className="font-semibold text-[#3d352e]">选择语言</span>
                  <span className="text-sm text-gray-500">({currentLang.flag} {currentLang.name})</span>
                </div>
                
                {/* Language Grid */}
                <div className="grid grid-cols-3 gap-2 px-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border-2 transition-all ${
                        i18n.language === lang.code
                          ? 'border-[#C41E3A] bg-red-50 text-[#C41E3A]'
                          : 'border-gray-200 hover:border-[#C41E3A] text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.name}</span>
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
