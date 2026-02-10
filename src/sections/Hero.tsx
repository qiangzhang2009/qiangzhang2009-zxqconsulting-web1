import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set([badgeRef.current, titleRef.current, descRef.current, ctaRef.current], {
        opacity: 0,
        y: 30,
      });

      // Animation timeline
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.3'
        )
        .to(
          descRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.4'
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.3'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Global Network"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5f0e8]/95 via-[#f5f0e8]/70 to-transparent" />
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e6c9a8]/20 via-transparent to-[#d4a373]/10 animate-gradient z-0" />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-2xl" ref={contentRef}>
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-[#d4a373]" />
            <span className="text-sm font-medium text-[#3d352e]">
              全球出海咨询服务
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#3d352e] leading-tight mb-6"
          >
            助力企业征服
            <span className="gradient-text block">全球市场</span>
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg text-[#5c4f3a] mb-8 leading-relaxed max-w-xl"
          >
            从市场进入策略到运营落地，我们提供全方位的出海咨询服务，
            让您的业务无缝拓展至世界各地。AI赋能，资源驱动，
            用更短的时间，做更精准的决策。
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <button
              onClick={scrollToContact}
              className="btn-primary flex items-center gap-2 group"
            >
              开启您的全球之旅
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 border-2 border-[#d4a373] text-[#d4a373] rounded-lg font-medium hover:bg-[#d4a373] hover:text-white transition-all duration-300"
            >
              了解更多
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-[#d4a373]">200+</div>
              <div className="text-sm text-[#5c4f3a]">成功出海企业</div>
            </div>
            <div className="w-px h-12 bg-[#d4a373]/30" />
            <div>
              <div className="text-3xl font-bold text-[#d4a373]">30+</div>
              <div className="text-sm text-[#5c4f3a]">覆盖国家地区</div>
            </div>
            <div className="w-px h-12 bg-[#d4a373]/30" />
            <div>
              <div className="text-3xl font-bold text-[#d4a373]">10+</div>
              <div className="text-sm text-[#5c4f3a]">年行业经验</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f5f0e8] to-transparent z-10" />
    </section>
  );
};

export default Hero;
