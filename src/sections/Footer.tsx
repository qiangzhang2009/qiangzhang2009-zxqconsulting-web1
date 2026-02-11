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
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-[#d4a373] to-[#c89f5e] py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('footer.title')}
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            {t('footer.description')}
          </p>
          <button
            onClick={() => scrollToSection('#contact')}
            className="bg-white text-[#d4a373] px-8 py-4 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-[#f5f0e8] transition-colors group"
          >
            {t('footer.cta')}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4a373] to-[#c89f5e] flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg">{t('brand.fullName')}</div>
                  <div className="text-xs text-white/60">{t('brand.name')}</div>
                </div>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                {t('brand.tagline')}
              </p>
              <div className="text-sm text-white/60">
                <div>{t('contact.social')}</div>
              </div>
            </div>

            {/* Links */}
            {footerLinks.map((group, index) => (
              <div key={index}>
                <h4 className="font-bold mb-4 text-[#e6c9a8]">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(link.href);
                        }}
                        className="text-white/70 hover:text-[#d4a373] transition-colors"
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

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/60 text-sm">
            {t('footer.copyright')}
          </div>
          <div className="text-white/40 text-sm">
            {t('brand.tagline')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
