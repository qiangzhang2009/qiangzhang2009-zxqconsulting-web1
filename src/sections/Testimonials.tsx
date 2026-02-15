import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

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
      quote: t('testimonials.items.li.quote'),
      author: t('testimonials.items.li.name'),
      position: t('testimonials.items.li.position'),
      avatar: '/avatar2.jpg',
    },
    {
      quote: t('testimonials.items.zhang.quote'),
      author: t('testimonials.items.zhang.name'),
      position: t('testimonials.items.zhang.position'),
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
        background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 50%, #fff7ed 100%)'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 gold-sparkle hidden lg:block">
        <span className="text-4xl">✨</span>
      </div>
      <div className="absolute bottom-20 right-10 gold-sparkle hidden lg:block" style={{ animationDelay: '1s' }}>
        <span className="text-4xl">🌟</span>
      </div>
      <div className="absolute top-1/3 right-20 hidden lg:block">
        <span className="text-6xl animate-float">🧧</span>
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Spring Festival Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10b981]/20 to-[#059669]/10 border border-[#10b981]/40 rounded-full px-6 py-2 mb-4">
            <span className="text-lg">🐴</span>
            <span className="text-sm font-medium text-[#059669]">{t('testimonials.header')}</span>
            <span className="text-lg">⭐</span>
          </div>

          <span className="inline-block text-[#059669] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('testimonials.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#064e3b] mb-4">
            {t('testimonials.subtitle')}
          </h2>
          <p className="text-[#065f46] max-w-2xl mx-auto leading-relaxed">
            {t('testimonials.description')}
          </p>
        </div>

        {/* Carousel */}
        <div ref={carouselRef} className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main Card - Spring Style */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl spring-card relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ecfdf5]/50 via-white/30 to-[#d1fae5]/50 pointer-events-none"></div>

              {/* Quote icon with gradient */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#059669]/20 to-[#10b981]/20 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-[#059669]" />
                </div>
              </div>

              <p className="text-lg md:text-xl text-[#065f46] leading-relaxed mb-8">
                "{testimonials[activeIndex].quote}"
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-[#10b981] fill-current" />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#10b981]"
                />
                <div>
                  <div className="font-bold text-[#065f46] flex items-center gap-2">
                    {testimonials[activeIndex].author}
                    <span className="text-[#10b981]">🐴</span>
                  </div>
                  <div className="text-sm text-[#047857]">
                    {testimonials[activeIndex].position}
                  </div>
                </div>
              </div>

              {/* Horse badge */}
              <div className="absolute top-6 right-6">
                <div className="bg-gradient-to-br from-[#10b981]/20 to-[#059669]/10 rounded-full p-3">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#059669] to-[#10b981] shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 hover:scale-110"
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
                        ? 'bg-gradient-to-r from-[#059669] to-[#10b981] w-10'
                        : 'bg-[#059669]/30 hover:bg-[#059669]/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#059669] to-[#10b981] shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 hover:scale-110"
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
