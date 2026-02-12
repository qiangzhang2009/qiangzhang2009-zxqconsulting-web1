import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, Network, Settings, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ServiceTab {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: React.ReactNode;
}

const Services = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const services: ServiceTab[] = [
    {
      id: 'market',
      title: t('services.strategy.title'),
      description: t('services.strategy.description'),
      features: [
        t('services.strategy.features.research'),
        t('services.strategy.features.compliance'),
        t('services.strategy.features.tax'),
      ],
      image: '/service-market.jpg',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'network',
      title: t('services.resources.title'),
      description: t('services.resources.description'),
      features: [
        t('services.resources.features.partners'),
        t('services.resources.features.channels'),
        t('services.resources.features.customers'),
      ],
      image: '/service-network.jpg',
      icon: <Network className="w-5 h-5" />,
    },
    {
      id: 'operation',
      title: t('services.support.title'),
      description: t('services.support.description'),
      features: [
        t('services.support.features.local'),
        t('services.support.features.marketing'),
        t('services.support.features.legal'),
      ],
      image: '/service-operation.jpg',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Tabs animation
      gsap.fromTo(
        tabsRef.current?.children || [],
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Content animation
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleTabChange = (index: number) => {
    if (index === activeTab) return;

    // Animate content out
    gsap.to(contentRef.current, {
      opacity: 0,
      x: index > activeTab ? -30 : 30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(index);
        // Animate content in
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, x: index > activeTab ? 30 : -30 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
        );
      },
    });
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="section py-24 bg-white relative"
    >
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 gold-sparkle hidden lg:block">
        <span className="text-4xl">✨</span>
      </div>
      <div className="absolute bottom-20 right-10 gold-sparkle hidden lg:block" style={{ animationDelay: '1s' }}>
        <span className="text-4xl">🌟</span>
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Spring Festival Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C41E3A]/10 to-[#FFD700]/10 border border-[#C41E3A]/20 rounded-full px-6 py-2 mb-4">
            <span className="text-lg">🐴</span>
            <span className="text-sm font-medium text-[#C41E3A]">2026 马年特惠服务</span>
            <span className="text-lg">🧧</span>
          </div>
          
          <span className="inline-block text-[#C41E3A] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('services.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-4">
            {t('services.subtitle')}
          </h2>
          <p className="text-[#5c4f3a] max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        {/* Tabs - Spring Theme */}
        <div
          ref={tabsRef}
          className="flex flex-wrap justify-center gap-2 mb-12 relative"
        >
          <button
            onClick={() => handleTabChange(0)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 0
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#DC143C] text-white shadow-lg'
                : 'bg-[#fef2f2] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white border border-[#C41E3A]/30'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {t('services.tabs.strategy')}
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 1
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#DC143C] text-white shadow-lg'
                : 'bg-[#fef2f2] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white border border-[#C41E3A]/30'
            }`}
          >
            <Network className="w-5 h-5" />
            {t('services.tabs.resources')}
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 2
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#DC143C] text-white shadow-lg'
                : 'bg-[#fef2f2] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white border border-[#C41E3A]/30'
            }`}
          >
            <Settings className="w-5 h-5" />
            {t('services.tabs.support')}
          </button>
        </div>

        {/* Content - Spring Card Style */}
        <div ref={contentRef} className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={activeTab % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
            {/* Card Badge */}
            <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 border border-[#FFD700]/40 rounded-full px-4 py-1.5 mb-4">
              <span className="text-sm">🏆</span>
              <span className="text-xs font-medium text-[#C41E3A]">专业服务 · 马到成功</span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-[#3d352e] mb-4">
              {services[activeTab].title}
            </h3>
            <p className="text-[#5c4f3a] mb-8 leading-relaxed">
              {services[activeTab].description}
            </p>

            <div className="space-y-4">
              {services[activeTab].features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#fef2f2] to-[#fff7ed] rounded-xl group hover:from-[#C41E3A]/10 hover:to-[#FFD700]/10 transition-colors border border-[#C41E3A]/10"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C41E3A] to-[#FFD700] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <span className="text-[#3d352e] font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div
            className={`relative ${
              activeTab % 2 === 0 ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl spring-card">
              <img
                src={services[activeTab].image}
                alt={services[activeTab].title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#C41E3A]/30 via-transparent to-transparent" />
              
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐴</span>
                  <span className="font-medium text-[#3d352e]">专业出海服务</span>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FFD700]/20 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#C41E3A]/20 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
