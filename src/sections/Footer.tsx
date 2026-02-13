import { useTranslation } from 'react-i18next';
import { Globe, ArrowRight, Star } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const footerLinks = [
    {
      title: t('footer.quickLinks'),
      links: [
        { name: t('nav.home'), href: '#hero' },
        { name: t('nav.about'), href: '#about' },
        { name: t('nav.services'), href: '#services' },
        { name: t('nav.markets'), href: '#markets' },
      ],
    },
    {
      title: t('footer.markets'),
      links: [
        { name: t('markets.japan.title'), href: '#markets' },
        { name: t('markets.europe.title'), href: '#markets' },
        { name: t('markets.southeast.title'), href: '#markets' },
        { name: t('markets.australia.title'), href: '#markets' },
        { name: t('markets.middleEast.title'), href: '#markets' },
      ],
    },
    {
      title: t('footer.services'),
      links: [
        { name: t('services.tabs.strategy'), href: '#services' },
        { name: t('services.tabs.resources'), href: '#services' },
        { name: t('services.tabs.support'), href: '#services' },
        { name: 'AI赋能', href: '#services' },
      ],
    },
  ];

  return (
    <footer className="bg-[#3d352e] text-white">
      {/* Spring Festival CTA Banner - 马年春节特别版 */}
      <div className="bg-gradient-to-r from-[#C41E3A] via-[#DC143C] to-[#FFD700] py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-4 left-10 text-4xl animate-float">🐴</div>
        <div className="absolute top-4 right-10 text-4xl animate-float" style={{ animationDelay: '1s' }}>🏮</div>
        <div className="absolute bottom-4 left-1/4 text-3xl gold-sparkle">✨</div>
        <div className="absolute bottom-4 right-1/4 text-3xl gold-sparkle" style={{ animationDelay: '0.5s' }}>🌟</div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Horse Year Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Star className="w-5 h-5 text-[#FFD700] fill-current" />
            <span className="text-white font-medium">🐴 2026 马年春节 🐴</span>
            <Star className="w-5 h-5 text-[#FFD700] fill-current" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            🧧 马年大吉 · 马到成功 🧧
          </h2>
          <p className="text-white/95 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            感谢您一直以来的信任与支持！在新的一年里，祝您龙马精神、奔腾万里、万事如意！
            <br />
            <span className="font-semibold text-[#FFD700]">2026，与您一起再创辉煌！</span>
          </p>
          <button
            onClick={() => scrollToSection('#contact')}
            className="bg-white text-[#C41E3A] px-10 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-[#FFF8DC] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            🧧 立即咨询，开启全球之旅
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#FFD700] flex items-center justify-center shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="font-bold text-xl">{t('brand.fullName')}</div>
                  <div className="text-xs text-white/60">{t('brand.name')}</div>
                </div>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                {t('brand.tagline')}
              </p>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-[#FFD700]">🐴</span>
                <span>2026 马年春节特惠进行中</span>
                <span className="text-[#FFD700]">✨</span>
              </div>
            </div>

            {/* Links */}
            {footerLinks.map((group, index) => (
              <div key={index}>
                <h4 className="font-bold mb-4 text-[#FFD700] flex items-center gap-2">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(link.href);
                        }}
                        className="text-white/70 hover:text-[#FFD700] transition-colors flex items-center gap-2"
                      >
                        <span className="text-[#C41E3A]">›</span>
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 relative">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l border-t border-[#FFD700]/30 rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-r border-t border-[#FFD700]/30 rounded-tr-3xl"></div>
        
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/60 text-sm">
            {t('footer.copyright')}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <span>🐴</span>
              <span>龙马精神</span>
              <span>·</span>
              <span>奔腾万里</span>
            </div>
          </div>
          <div className="text-white/40 text-sm flex items-center gap-2">
            <span>✨</span>
            <span>{t('brand.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
