import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react';

const Hero = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set([badgeRef.current, titleRef.current, descRef.current, ctaRef.current], {
        opacity: 0,
        y: 20,
      });

      // Animation timeline - macOS style: smooth and subtle
      const tl = gsap.timeline({ delay: 0.2 });

      tl.to(badgeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        .to(
          descRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          '-=0.3'
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          '-=0.2'
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
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 z-0 bg-white/70" />

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-3xl">
          {/* Badge - macOS style: simple pill */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 shadow-sm border border-gray-200/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">
              {t('hero.badge')}
            </span>
          </div>

          {/* Title - macOS style: clean, bold */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-6 tracking-tight"
          >
            {t('hero.title')}
            <span className="text-blue-600"> {t('hero.highlight')}</span>
          </h1>

          {/* Description - macOS style: clear, readable */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-gray-500 leading-relaxed mb-8 max-w-xl"
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons - macOS style: simple, clean */}
          <div ref={ctaRef} className="flex flex-wrap gap-3">
            <button
              onClick={scrollToContact}
              className="btn btn-primary flex items-center gap-2 group"
            >
              <Zap className="w-4 h-4" />
              {t('hero.cta')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-secondary"
            >
              {t('hero.learnMore')}
            </a>
          </div>

          {/* Trust indicators - macOS style: minimal */}
          <div className="mt-10 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">200+</span>
              <span className="text-gray-500">{t('stats.items.companies')}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">30+</span>
              <span className="text-gray-500">{t('stats.items.countries')}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">10+</span>
              <span className="text-gray-500">{t('stats.items.experience')}</span>
            </div>
          </div>

          {/* Trust Badge - macOS style: subtle */}
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100/80 backdrop-blur-sm rounded-full px-4 py-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
              <span>{t('hero.trustBadge')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative - macOS style: minimal, abstract */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent z-10" />
    </section>
  );
};

export default Hero;
