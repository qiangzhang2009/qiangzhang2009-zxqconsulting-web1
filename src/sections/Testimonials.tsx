import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  avatar: string;
}

const Testimonials = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const testimonials: Testimonial[] = [
    {
      quote: t('testimonials.items.wang.quote'),
      author: t('testimonials.items.wang.name'),
      position: t('testimonials.items.wang.position'),
      avatar: '/avatar1.jpg',
    },
    {
      quote:
        '从合规到运营，张小强提供了一站式服务，让我们的欧洲扩张之路顺畅无阻。特别是他们在中医药领域的专业资源，为我们打开了新的市场大门。',
      author: '李婷',
      position: '某中医药企业创始人',
      avatar: '/avatar2.jpg',
    },
    {
      quote:
        'AI赋能的市场调研让我们节省了大量时间和成本，精准定位目标客户群体。张小强团队的效率和专业度令人印象深刻，是值得信赖的合作伙伴。',
      author: '张伟',
      position: '某科技公司国际业务负责人',
      avatar: '/avatar3.jpg',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        carouselRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="section py-24 relative"
      style={{
        background: 'linear-gradient(180deg, var(--gray-50) 0%, var(--primary-50) 50%, var(--health-50) 100%)'
      }}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#d4a05a] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('testimonials.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#292524] mb-4">
            {t('testimonials.subtitle')}
          </h2>
          <p className="text-[#57534e] max-w-2xl mx-auto leading-relaxed">
            {t('testimonials.description')}
          </p>
        </div>

        {/* Carousel */}
        <div ref={carouselRef} className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#fefdfb]/50 via-white/30 to-[#f0f7ff]/50 pointer-events-none"></div>

              {/* Quote icon with gradient */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4a05a]/20 to-[#5b6ee8]/20 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-[#d4a05a]" />
                </div>
              </div>

              <p className="text-lg md:text-xl text-[#3d352e] leading-relaxed mb-8">
                "{testimonials[activeIndex].quote}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#d4a373]"
                />
                <div>
                  <div className="font-bold text-[#3d352e]">
                    {testimonials[activeIndex].author}
                  </div>
                  <div className="text-sm text-[#5c4f3a]">
                    {testimonials[activeIndex].position}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#3d352e] hover:bg-[#d4a373] hover:text-white transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeIndex === index
                        ? 'bg-[#d4a373] w-8'
                        : 'bg-[#d4a373]/30 hover:bg-[#d4a373]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-[#3d352e] hover:bg-[#d4a373] hover:text-white transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
