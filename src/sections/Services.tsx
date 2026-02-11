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
      className="section py-24 bg-white"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#d4a373] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('services.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-4">
            {t('services.subtitle')}
          </h2>
          <p className="text-[#5c4f3a] max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="flex flex-wrap justify-center gap-2 mb-12 relative"
        >
          <button
            onClick={() => handleTabChange(0)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 0
                ? 'bg-[#d4a373] text-white shadow-lg'
                : 'bg-[#f5f0e8] text-[#3d352e] hover:bg-[#e6c9a8]'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {t('services.tabs.strategy')}
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 1
                ? 'bg-[#d4a373] text-white shadow-lg'
                : 'bg-[#f5f0e8] text-[#3d352e] hover:bg-[#e6c9a8]'
            }`}
          >
            <Network className="w-5 h-5" />
            {t('services.tabs.resources')}
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 2
                ? 'bg-[#d4a373] text-white shadow-lg'
                : 'bg-[#f5f0e8] text-[#3d352e] hover:bg-[#e6c9a8]'
            }`}
          >
            <Settings className="w-5 h-5" />
            {t('services.tabs.support')}
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={activeTab % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
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
                  className="flex items-center gap-3 p-4 bg-[#f5f0e8] rounded-xl group hover:bg-[#e6c9a8]/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#d4a373] flex items-center justify-center text-white flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
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
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={services[activeTab].image}
                alt={services[activeTab].title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#d4a373]/10 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#e6c9a8]/30 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
