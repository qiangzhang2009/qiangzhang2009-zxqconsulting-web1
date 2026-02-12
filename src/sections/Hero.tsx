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
  const horseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set([badgeRef.current, titleRef.current, descRef.current, ctaRef.current, horseRef.current], {
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
        )
        .to(
          horseRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.5'
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
      
      {/* Spring Festival Gradient Overlay - 马年春节主题 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, rgba(254,242,242,0.92) 0%, rgba(254,226,226,0.85) 30%, rgba(255,247,237,0.8) 70%, rgba(254,252,232,0.85) 100%)'
        }}
      />

      {/* Decorative Elements - 马年装饰 */}
      <div ref={horseRef} className="absolute right-10 top-1/3 opacity-0 hidden lg:block z-10">
        <div className="relative">
          <span className="text-9xl filter drop-shadow-2xl animate-float">🐴</span>
          <div className="absolute -top-4 -right-4 gold-sparkle">
            <Star className="w-6 h-6 text-[#FFD700] fill-current" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-20 pt-20">
        <div className="max-w-2xl">
          {/* Spring Festival Banner - 春节横幅 */}
          <div className="mb-6">
            <div className="blessing-banner text-sm md:text-base py-3">
              🏮 恭贺新禧 · 2026 马年大吉 · 马到成功 🏮
            </div>
          </div>

          {/* Badge with Horse Year */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xl rounded-full px-6 py-3 mb-6 shadow-xl border-2 border-[#FFD700]"
          >
            <div className="flex gap-1">
              <Star className="w-4 h-4 text-[#FFD700] fill-current animate-pulse" />
              <Star className="w-4 h-4 text-[#C41E3A] fill-current" />
              <Star className="w-4 h-4 text-[#FFD700] fill-current animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-[#C41E3A]">
              🐴 2026 马年春节特惠
            </span>
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
          </div>

          {/* Title with Spring Theme */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#292524] leading-tight mb-6"
          >
            {t('hero.title')}
            <span className="spring-text"> 马到成功 · 跃向全球</span>
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-[#57534e] leading-relaxed mb-8 max-w-xl"
          >
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons - Spring Theme */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <button
              onClick={scrollToContact}
              className="btn-spring flex items-center gap-2 group px-8 py-4 rounded-xl font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              {t('hero.cta')}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 border-2 border-[#C41E3A] text-[#C41E3A] rounded-xl font-semibold hover:bg-[#C41E3A] hover:text-white transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg"
            >
              {t('hero.learnMore')}
            </a>
          </div>

          {/* Trust indicators with Spring Theme */}
          <div className="mt-12 flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold spring-text">200+</div>
              <div className="text-sm text-[#57534e]">{t('stats.items.companies')}</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-[#C41E3A]/40 to-[#FFD700]/40" />
            <div>
              <div className="text-3xl font-bold text-[#C41E3A]">30+</div>
              <div className="text-sm text-[#5c4f3a]">{t('stats.items.countries')}</div>
            </div>
            <div className="w-px h-12 bg-[#C41E3A]/30" />
            <div>
              <div className="text-3xl font-bold text-[#C41E3A]">10+</div>
              <div className="text-sm text-[#5c4f3a]">{t('stats.items.experience')}</div>
            </div>
          </div>

          {/* Horse Year Badge */}
          <div className="mt-8">
            <div className="inline-flex items-center gap-2 horse-badge">
              <span className="text-lg">🐴</span>
              <span>龙马精神 · 奔腾万里</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fef2f2] to-transparent z-10" />
      
      {/* Corner decorations */}
      <div className="absolute top-20 right-20 gold-sparkle hidden lg:block">
        <span className="text-4xl">✨</span>
      </div>
      <div className="absolute bottom-40 left-20 gold-sparkle hidden lg:block" style={{ animationDelay: '1s' }}>
        <span className="text-3xl">🌟</span>
      </div>
    </section>
  );
};

export default Hero;
