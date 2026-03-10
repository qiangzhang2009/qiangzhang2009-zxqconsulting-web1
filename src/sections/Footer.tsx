import { useTranslation } from 'react-i18next';
import { Globe, ArrowRight } from 'lucide-react';

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
        { name: t('services.tabs.bencao'), href: '#services' },
        { name: t('services.tabs.education'), href: '#services' },
        { name: t('services.tabs.culture'), href: '#services' },
        { name: t('services.tabs.consulting'), href: '#services' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-100 text-gray-700">
      {/* CTA Banner - macOS style: clean, minimal */}
      <div className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <span className="inline-block text-blue-600 font-medium mb-3 text-sm">
            {t('footer.banner.badge')}
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900">
            {t('footer.banner.title')}
          </h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            {t('footer.banner.description')}
          </p>
          <button
            onClick={() => scrollToSection('#contact')}
            className="btn btn-primary"
          >
            {t('footer.banner.button')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Footer - macOS style */}
      <div className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t('brand.fullName')}</div>
                  <div className="text-xs text-gray-500">{t('brand.name')}</div>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                {t('brand.tagline')}
              </p>
            </div>

            {/* Links */}
            {footerLinks.map((group, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-3 text-sm text-gray-900">
                  {group.title}
                </h4>
                <ul className="space-y-2">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(link.href);
                        }}
                        className="text-gray-500 hover:text-blue-600 transition-colors text-sm"
                      >
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

      {/* Bottom Bar - macOS style */}
      <div className="border-t border-gray-200 py-4">
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
