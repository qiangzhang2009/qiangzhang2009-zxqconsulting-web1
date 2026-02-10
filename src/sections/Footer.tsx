import { Globe, ArrowRight } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const footerLinks = [
    {
      title: '快速链接',
      links: [
        { name: '首页', href: '#hero' },
        { name: '关于我们', href: '#about' },
        { name: '服务', href: '#services' },
        { name: '市场布局', href: '#markets' },
      ],
    },
    {
      title: '市场区域',
      links: [
        { name: '日本市场', href: '#markets' },
        { name: '欧洲市场', href: '#markets' },
        { name: '东南亚', href: '#markets' },
        { name: '中东', href: '#markets' },
      ],
    },
    {
      title: '专业服务',
      links: [
        { name: '中医药出海', href: '#services' },
        { name: 'AI赋能', href: '#services' },
        { name: '合规服务', href: '#services' },
        { name: '商务对接', href: '#services' },
      ],
    },
  ];

  return (
    <footer className="bg-[#3d352e] text-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-[#d4a373] to-[#c89f5e] py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            准备好出海了吗？
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            让我们携手开启您的全球化之旅，用专业和资源助您征服世界市场
          </p>
          <button
            onClick={() => scrollToSection('#contact')}
            className="bg-white text-[#d4a373] px-8 py-4 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-[#f5f0e8] transition-colors group"
          >
            立即咨询
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
                  <div className="font-bold text-lg">上海张小强企业咨询事务所</div>
                  <div className="text-xs text-white/60">ZXQ Consulting</div>
                </div>
              </div>
              <p className="text-white/70 mb-6 leading-relaxed">
                立足上海，服务全国。我们是一家专业的出海咨询与落地服务公司，
                致力于为企业提供高效、专业、一站式的国际化解决方案。
              </p>
              <div className="text-sm text-white/60">
                <div>公众号/视频号：张小强出海</div>
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
            © 2024 上海张小强企业咨询事务所. All rights reserved.
          </div>
          <div className="text-white/40 text-sm">
            Your Loyal and Reliable Global Partner
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
