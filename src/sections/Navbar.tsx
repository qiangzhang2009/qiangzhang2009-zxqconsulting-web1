import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Star, Languages } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

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

  // 获取当前语言显示
  const currentLang = {
    en: '🇺🇸 English',
    zh: '🇨🇳 中文',
    es: '🇪🇸 Español',
    ja: '🇯🇵 日本語',
    de: '🇩🇪 Deutsch',
    fr: '🇫🇷 Français',
  }[i18n.language] || '🌐 Language';

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

          {/* Language Switcher & CTA Button with Spring Theme */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
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
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-[#3d352e] hover:text-[#C41E3A] font-medium transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
              
              {/* Mobile Language Switcher - 更明显的入口 */}
              <div className="mt-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#3d352e]">
                    <Languages className="w-5 h-5" />
                    <span className="font-medium">🌐 {currentLang}</span>
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>
              
              {/* Mobile CTA Button */}
              <button
                onClick={() => scrollToSection('#contact')}
                className="btn-spring text-sm mt-2 w-full justify-center"
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
