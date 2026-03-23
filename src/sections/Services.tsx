import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Compass,
  Factory,
  Truck,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Shield,
  Globe,
  Users,
  Sparkles
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ServiceStage {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  bgColor: string;
  services: {
    name: string;
    description: string;
  }[];
}

const Services = () => {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  const stages: ServiceStage[] = [
    {
      id: 'planning',
      title: '规划期',
      description: '明确方向，降低试错成本',
      duration: '1-3个月',
      icon: <Compass className="w-6 h-6" />,
      bgColor: 'bg-blue-500',
      services: [
        { name: '目标市场调研', description: '35+市场可行性分析' },
        { name: '风险评估报告', description: '法规/市场/竞争全维度' },
        { name: '进入策略制定', description: '市场优先级排序' },
      ],
    },
    {
      id: 'execution',
      title: '执行期',
      description: '合规落地，构建渠道',
      duration: '3-12个月',
      icon: <Factory className="w-6 h-6" />,
      bgColor: 'bg-green-500',
      services: [
        { name: '产品合规注册', description: '各国法规认证办理' },
        { name: '渠道建设', description: '经销商/电商布局' },
        { name: '品牌本地化', description: '包装/营销本土化' },
      ],
    },
    {
      id: 'operation',
      title: '运营期',
      description: '持续增长，本地深耕',
      duration: '长期',
      icon: <Truck className="w-6 h-6" />,
      bgColor: 'bg-purple-500',
      services: [
        { name: '运营支持', description: '销售/物流/售后' },
        { name: '市场扩张', description: '新市场拓展咨询' },
        { name: '本地团队', description: '人才招聘/管理' },
      ],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stages animation
      gsap.fromTo(
        '.stage-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stagesRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-24 bg-gray-900 relative"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-blue-600 font-semibold mb-3 text-sm tracking-wide">
            全生命周期服务
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            陪伴式出海服务
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            从规划到运营，我们不只是提供方案，更是陪您走完全程
          </p>
        </div>

        {/* User Journey Stages */}
        <div ref={stagesRef} className="grid md:grid-cols-3 gap-6 mb-16">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="stage-card relative bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 hover:shadow-xl transition-all duration-300"
            >
              {/* Stage Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Icon & Title */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stage.bgColor} rounded-xl flex items-center justify-center text-white`}>
                  {stage.icon}
                </div>
                <span className="text-xs font-medium text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
                  {stage.duration}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {stage.title}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {stage.description}
              </p>

              {/* Services List */}
              <div className="space-y-3">
                {stage.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white text-sm">
                        {service.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {service.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Arrow to next stage */}
              {index < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 跨境独立站专项服务 */}
        <div className="mb-12 bg-gradient-to-br from-emerald-900/40 to-blue-900/40 rounded-2xl p-8 border border-emerald-700/40">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-3">
              <Globe className="w-4 h-4" />
              {isZh ? '跨境独立站服务' : 'Cross-Border Independent Site'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {isZh ? '免费搭建跨境独立站' : 'Free Cross-Border Independent Site Setup'}
            </h3>
            <p className="text-gray-300 max-w-xl mx-auto text-sm">
              {isZh
                ? '告别平台内卷，建立品牌私域流量池。我们提供一站式独立站建设服务'
                : 'Build your brand private traffic pool. We offer one-stop independent site setup'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: '🛒', zh: 'Shopify/WooCommerce', en: 'Shopify/WooCommerce' },
              { icon: '🌐', zh: '多语言本地化', en: 'Multi-language' },
              { icon: '💳', zh: '全球支付接入', en: 'Global Payments' },
              { icon: '📦', zh: '海外仓对接', en: 'Overseas Warehouse' },
            ].map((f, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-sm font-medium text-white">{isZh ? f.zh : f.en}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={scrollToContact}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              {isZh ? '立即咨询独立站方案' : 'Get Independent Site Quote'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            {isZh ? '为什么选择我们？' : 'Why Choose Us?'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">{isZh ? 'AI 嵌入全流程' : 'AI Embedded Process'}</h4>
              <p className="text-gray-400 text-sm">
                {isZh ? 'AI+行业认知嵌入中医出海全流程' : 'AI + industry expertise in full TCM export process'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">{isZh ? '风险可控' : 'Risk Controlled'}</h4>
              <p className="text-gray-400 text-sm">
                {isZh ? '先行风险评估，避免盲目投入' : 'Prior risk assessment, avoid blind investment'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-amber-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">{isZh ? '本地化深耕' : 'Deep Localization'}</h4>
              <p className="text-gray-400 text-sm">
                {isZh ? '深入理解目标市场文化法规' : 'Deep understanding of local culture and regulations'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">{isZh ? '陪伴式服务' : 'Companion Service'}</h4>
              <p className="text-gray-400 text-sm">
                {isZh ? '从0到1全程陪跑，问题随时响应' : 'Full support from 0 to 1, instant response'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">{isZh ? '35+国家覆盖' : '35+ Countries'}</h4>
              <p className="text-gray-400 text-sm">
                {isZh ? '覆盖全球主要出海目的国' : 'Coverage of major global export destinations'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={scrollToContact}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
          >
            {isZh ? '开始您的出海规划' : 'Start Your Export Plan'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
