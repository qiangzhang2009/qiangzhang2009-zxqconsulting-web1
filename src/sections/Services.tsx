import { useState, useEffect, useRef } from 'react';
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
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const services: ServiceTab[] = [
    {
      id: 'market',
      title: '国际市场进入策略',
      description:
        '结合AI数据洞察，提供目标市场深度报告，精准定位需求与机会。涵盖海外公司注册、合规支持、税务筹划等全方位服务。',
      features: [
        'AI驱动的市场调研与可行性分析',
        '欧盟CE认证、日本合规支持',
        '税务筹划与法律架构设计',
      ],
      image: '/service-market.jpg',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'network',
      title: '资源整合与商务对接',
      description:
        '联合目标市场法律、财务、供应链专家，直连欧洲本地合作伙伴、分销商及侨商网络。',
      features: [
        '专家网络与行业权威资源',
        '本地合作伙伴与分销商对接',
        '侨商网络与海外服务机构',
      ],
      image: '/service-network.jpg',
      icon: <Network className="w-5 h-5" />,
    },
    {
      id: 'operation',
      title: '持续运营支持',
      description:
        'AI驱动数字化营销，提供国际化品牌策略，协助招聘培训本地人才，提供跨文化商业培训。',
      features: [
        'AI驱动数字化营销推广',
        '本地化人才招聘与管理',
        '跨文化商业培训',
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
            核心服务
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-4">
            全方位出海解决方案
          </h2>
          <p className="text-[#5c4f3a] max-w-2xl mx-auto">
            从战略规划到落地执行，我们提供端到端的专业服务
          </p>
        </div>

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="flex flex-wrap justify-center gap-2 mb-12 relative"
        >
          {services.map((service, index) => (
            <button
              key={service.id}
              onClick={() => handleTabChange(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTab === index
                  ? 'bg-[#d4a373] text-white shadow-lg'
                  : 'bg-[#f5f0e8] text-[#3d352e] hover:bg-[#e6c9a8]'
              }`}
            >
              {service.icon}
              {service.title}
            </button>
          ))}
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
