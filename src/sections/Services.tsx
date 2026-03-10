import { useEffect, useRef } from 'react';
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
  Users
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<HTMLDivElement>(null);

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
      className="py-24 bg-white relative"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-blue-600 font-semibold mb-3 text-sm tracking-wide">
            全生命周期服务
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            陪伴式出海服务
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            从规划到运营，我们不只是提供方案，更是陪您走完全程
          </p>
        </div>

        {/* User Journey Stages */}
        <div ref={stagesRef} className="grid md:grid-cols-3 gap-6 mb-16">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="stage-card relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
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
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {stage.duration}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {stage.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {stage.description}
              </p>

              {/* Services List */}
              <div className="space-y-3">
                {stage.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
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
                  <div className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            为什么选择我们？
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">风险可控</h4>
              <p className="text-gray-400 text-sm">
                先行风险评估，避免盲目投入
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">本地化深耕</h4>
              <p className="text-gray-400 text-sm">
                深入理解目标市场文化法规
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">陪伴式服务</h4>
              <p className="text-gray-400 text-sm">
                从0到1全程陪跑，问题随时响应
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
            开始您的出海规划
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
