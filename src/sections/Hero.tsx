import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  const { t } = useTranslation();
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
      {/* Hero Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(250,248,245,0.85) 0%, rgba(250,240,225,0.75) 30%, rgba(245,243,255,0.7) 70%, rgba(245,247,255,0.75) 100%)'
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-2xl" ref={contentRef}>
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-full px-5 py-2.5 mb-6 shadow-lg border border-white/50"
          >
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse"></div>
            <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm font-medium text-[#44403c]">
              {t('brand.slogan')}
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#292524] leading-tight mb-6"
          >
            {t('hero.title')}
            <span className="text-gradient bg-gradient-to-r from-[#d4a05a] via-[#8b5cf6] to-[#10b981]"> Global Markets</span>
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-[#57534e] leading-relaxed mb-8 max-w-xl"
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <button
              onClick={scrollToContact}
              className="btn-primary flex items-center gap-2 group px-8 py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('hero.cta')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 border-2 border-[#d4a05a] text-[#d4a05a] rounded-xl font-semibold hover:bg-[#d4a05a] hover:text-white transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              {t('hero.learnMore')}
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#d4a05a] to-[#8b5cf6] bg-clip-text text-transparent">200+</div>
              <div className="text-sm text-[#57534e]">{t('stats.items.companies')}</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-[#d4a05a]/30 to-[#8b5cf6]/30" />
            <div>
              <div className="text-3xl font-bold text-[#d4a373]">30+</div>
              <div className="text-sm text-[#5c4f3a]">{t('stats.items.countries')}</div>
            </div>
            <div className="w-px h-12 bg-[#d4a373]/30" />
            <div>
              <div className="text-3xl font-bold text-[#d4a373]">10+</div>
              <div className="text-sm text-[#5c4f3a]">{t('stats.items.experience')}</div>
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
