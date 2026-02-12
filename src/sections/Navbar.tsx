import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Star } from 'lucide-react';
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
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo with Horse Year Badge */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#FFD700] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              {/* Small horse badge */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <span className="text-sm">🐴</span>
              </div>
            </div>
            <div>
              <span className={`font-serif font-bold text-lg transition-colors duration-300 ${
                isScrolled ? 'text-[#3d352e]' : 'text-[#3d352e]'
              }`}>
                {t('brand.name')}
              </span>
              <div className="text-xs text-[#C41E3A] font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-[#FFD700]" />
                2026 马年
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
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
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-[#3d352e] hover:text-[#C41E3A] font-medium transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex items-center gap-4 mt-2">
                <LanguageSwitcher />
                <button
                  onClick={() => scrollToSection('#contact')}
                  className="btn-spring text-sm flex-1"
                >
                  🧧 {t('footer.cta')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
