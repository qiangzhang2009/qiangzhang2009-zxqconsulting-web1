import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Star } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

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
                <span>2026 马年</span>
              </div>
            </div>
          </a>

          {/* Navigation - Language Switcher + Nav Links */}
          <div className="flex items-center gap-4 lg:gap-6">
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

          {/* Desktop CTA Button (Right) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-spring text-sm"
            >
              🧧 {t('footer.cta')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
