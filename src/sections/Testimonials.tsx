import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote, Star, BadgeCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  position: string;
  avatar: string;
}

const Testimonials = () => {
  const { t, i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

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
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
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
    <section ref={sectionRef} className="relative bg-[#08131d] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            {isZh ? '客户引言与顾问信任' : 'Client voice and advisory trust'}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            {isZh ? '来自项目一线的评价，而不是模板化好评。' : 'Words from real engagements, not decorative testimonials.'}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            {isZh
              ? '这些反馈关注的不是热闹，而是判断质量、落地效率、合规风险控制与市场进入节奏。'
              : 'These quotes emphasize decision quality, execution efficiency, compliance risk control and market-entry pacing.'}
          </p>
        </div>

        <div ref={carouselRef} className="mx-auto max-w-5xl">
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm md:p-12">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%)] pointer-events-none" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex rounded-2xl border border-white/10 bg-white/5 p-4 text-emerald-300">
                  <Quote className="h-7 w-7" />
                </div>

                <p className="text-xl leading-9 text-slate-100 md:text-2xl">
                  “{testimonials[activeIndex].quote}”
                </p>

                <div className="mt-8 flex items-center gap-2 text-amber-300">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>

              <div className="relative flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0b1723] px-5 py-4">
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].author}
                  className="h-16 w-16 rounded-full border border-emerald-400/30 object-cover"
                />
                <div>
                  <div className="text-lg font-semibold text-white">{testimonials[activeIndex].author}</div>
                  <div className="mt-1 text-sm text-slate-400">{testimonials[activeIndex].position}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prevSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'w-10 bg-emerald-400' : 'w-2.5 bg-white/20 hover:bg-white/35'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
