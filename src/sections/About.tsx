import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Award, TrendingUp, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image 1 reveal
      gsap.fromTo(
        image1Ref.current,
        { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0% 0 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Image 2 slide in
      gsap.fromTo(
        image2Ref.current,
        { x: 50, y: 50, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Badge animation
      gsap.fromTo(
        badgeRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Content animation
      gsap.fromTo(
        contentRef.current?.children || [],
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        }
      );

      // Parallax effect on images
      gsap.to(image1Ref.current, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to(image2Ref.current, {
        y: -80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    t('about.features.ai'),
    t('about.features.medicine'),
    t('about.features.opportunity'),
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="section py-24 bg-[#f5f0e8] overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Images */}
          <div className="relative h-[500px] lg:h-[600px]">
            {/* Main Image */}
            <div
              ref={image1Ref}
              className="absolute top-0 left-0 w-[70%] h-[80%] rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="/about-team.jpg"
                alt="Our Team"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Secondary Image */}
            <div
              ref={image2Ref}
              className="absolute bottom-0 right-0 w-[55%] h-[55%] rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <img
                src="/about-partnership.jpg"
                alt="Partnership"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Experience Badge */}
            <div
              ref={badgeRef}
              className="absolute top-[60%] right-[30%] w-28 h-28 bg-gradient-to-br from-[#10b981] to-[#34d399] rounded-full flex flex-col items-center justify-center text-white shadow-xl animate-spin-slow"
              style={{ animationDuration: '20s' }}
            >
              <span className="text-3xl font-bold">{t('about.experience')}</span>
              <span className="text-xs">{t('about.experienceLabel')}</span>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef}>
            <span className="inline-block text-[#10b981] font-medium mb-4 tracking-wider uppercase text-sm">
              {t('about.title')}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-6 leading-tight">
              {t('about.subtitle')}
              <span className="gradient-text">Global Partner</span>
            </h2>

            <p className="text-[#5c4f3a] mb-6 leading-relaxed">
              {t('about.description')}
            </p>

            <p className="text-[#5c4f3a] mb-8 leading-relaxed">
              {t('about.highlight')}
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#10b981]/10 flex items-center justify-center group-hover:bg-[#10b981]/20 transition-colors">
                    <Check className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <span className="text-[#3d352e] font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Award className="w-6 h-6 text-[#10b981] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3d352e]">{t('about.values.professional.title')}</div>
                <div className="text-xs text-[#5c4f3a]">{t('about.values.professional.desc')}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <TrendingUp className="w-6 h-6 text-[#10b981] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3d352e]">{t('about.values.efficient.title')}</div>
                <div className="text-xs text-[#5c4f3a]">{t('about.values.efficient.desc')}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Users className="w-6 h-6 text-[#10b981] mx-auto mb-2" />
                <div className="text-xl font-bold text-[#3d352e]">{t('about.values.intimate.title')}</div>
                <div className="text-xs text-[#5c4f3a]">{t('about.values.intimate.desc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
