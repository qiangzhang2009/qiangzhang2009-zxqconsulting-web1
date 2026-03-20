import { useTranslation } from 'react-i18next';
import { Globe, ArrowRight } from 'lucide-react';
import { tracking } from '../lib/tracking';

const Footer = () => {
  const { t } = useTranslation();

  const scrollToSection = (href: string, label?: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (label) {
      tracking.click(label, 'footer');
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
        { name: t('services.tabs.bencao'), href: '#services' },
        { name: t('services.tabs.education'), href: '#services' },
        { name: t('services.tabs.culture'), href: '#services' },
        { name: t('services.tabs.consulting'), href: '#services' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* CTA Banner - macOS style: clean, minimal */}
      <div className="bg-gray-900 py-16 border-b border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <span className="inline-block text-blue-600 font-medium mb-3 text-sm">
            {t('footer.banner.badge')}
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
            {t('footer.banner.title')}
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            {t('footer.banner.description')}
          </p>
          <button
            onClick={() => scrollToSection('#contact', 'footer_cta')}
            className="btn btn-primary"
          >
            {t('footer.banner.button')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AfricaZero Cross-Promotion Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 py-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A0</span>
            </div>
            <span className="text-orange-100 text-sm font-medium">
              AfricaZero · 全球首款非洲原产地 × 多市场关税套利决策平台
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
            非洲零关税政策已生效，2026年5月1日起全面执行
          </h3>
          <p className="text-orange-100 text-sm max-w-xl mx-auto mb-6">
            中国对非洲53个建交国100%税目零关税。关税计算器、原产地自测、选品清单——AfricaZero一站式解决。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://africa.zxqconsulting.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-xl transition-all hover:scale-105"
            >
              立即体验 AfricaZero
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://africa.zxqconsulting.com/calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              关税计算器
            </a>
            <a
              href="https://africa.zxqconsulting.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              选品清单
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer - macOS style */}
      <div className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">{t('brand.fullName')}</div>
                  <div className="text-xs text-gray-400">{t('brand.name')}</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {t('brand.tagline')}
              </p>
            </div>

            {/* Links */}
            {footerLinks.map((group, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-3 text-sm text-white">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(link.href, `footer_link_${index}_${linkIndex}`);
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
        </div>
      </div>

      {/* Bottom Bar - macOS style */}
      <div className="border-t border-gray-600 py-4">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-gray-400 text-xs">
            {t('footer.copyright')}
          </div>
          <div className="text-gray-400 text-xs">
            {t('brand.tagline')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
