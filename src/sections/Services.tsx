import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Package, 
  GraduationCap, 
  Globe, 
  Landmark, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

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
      id: 'bencao',
      title: t('services.bencao.title'),
      description: t('services.bencao.description'),
      features: [
        t('services.bencao.features.product'),
        t('services.bencao.features.compliance'),
        t('services.bencao.features.channel'),
      ],
      image: '/bencao.jpeg',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'education',
      title: t('services.education.title'),
      description: t('services.education.description'),
      features: [
        t('services.education.features.training'),
        t('services.education.features.certification'),
        t('services.education.features.exchange'),
      ],
      image: '/education.jpg',
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: 'culture',
      title: t('services.culture.title'),
      description: t('services.culture.description'),
      features: [
        t('services.culture.features.media'),
        t('services.culture.features.events'),
        t('services.culture.features.brand'),
      ],
      image: '/culture.jpg',
      icon: <Globe className="w-5 h-5" />,
    },
    {
      id: 'consulting',
      title: t('services.consulting.title'),
      description: t('services.consulting.description'),
      features: [
        t('services.consulting.features.strategy'),
        t('services.consulting.features.legal'),
        t('services.consulting.features.operation'),
      ],
      image: '/consulting.jpeg',
      icon: <Landmark className="w-5 h-5" />,
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
          {/* Policy Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-6 py-2 mb-4">
            <span className="text-lg">🏥</span>
            <span className="text-sm font-medium text-emerald-600">{t('services.policyBadge')}</span>
            <span className="text-lg">🌍</span>
          </div>
          
          <span className="inline-block text-emerald-600 font-medium mb-4 tracking-wider uppercase text-sm">
            {t('services.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('services.subtitle')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'
            }`}
          >
            <Package className="w-5 h-5" />
            {t('services.tabs.bencao')}
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 1
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            {t('services.tabs.education')}
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 2
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'
            }`}
          >
            <Globe className="w-5 h-5" />
            {t('services.tabs.culture')}
          </button>
          <button
            onClick={() => handleTabChange(3)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 3
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200'
            }`}
          >
            <Landmark className="w-5 h-5" />
            {t('services.tabs.consulting')}
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={activeTab % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}>
            {/* Card Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 rounded-full px-4 py-1.5 mb-4">
              <span className="text-sm">🏆</span>
              <span className="text-xs font-medium text-emerald-700">
                {t('services.serviceBadge')}
              </span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {services[activeTab].title}
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {services[activeTab].description}
            </p>

            <div className="space-y-4">
              {services[activeTab].features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl group hover:from-emerald-100 hover:to-teal-100 transition-colors border border-emerald-100"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Learn More Button */}
            <button 
              onClick={scrollToContact}
              className="mt-8 flex items-center gap-2 text-emerald-600 font-medium hover:gap-3 transition-all"
            >
              {t('services.learnMore', '了解更多')}
              <ArrowRight className="w-4 h-4" />
            </button>
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
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
              
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏥</span>
                  <span className="font-medium text-gray-800">
                    {t('services.bencaoHealth')}
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-teal-100 rounded-full -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-100 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
