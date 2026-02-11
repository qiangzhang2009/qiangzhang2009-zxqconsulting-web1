import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Cpu, HeartPulse } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WhyUs = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: t('whyUs.features.local.title'),
      description: t('whyUs.features.local.description'),
      color: 'from-[#d4a373] to-[#c89f5e]',
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: t('whyUs.features.ai.title'),
      description: t('whyUs.features.ai.description'),
      color: 'from-[#a67c52] to-[#8b6914]',
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: t('whyUs.features.expertise.title'),
      description: t('whyUs.features.expertise.description'),
      color: 'from-[#5c4f3a] to-[#3d352e]',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Cards animation
      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="whyus"
      ref={sectionRef}
      className="section py-24 bg-[#f5f0e8]"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-block text-[#d4a373] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('whyUs.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-4">
            {t('whyUs.subtitle')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d4a373] to-[#c89f5e] mx-auto mb-4 rounded-full" />
          <p className="text-[#5c4f3a] text-lg">
            {t('whyUs.description')}
          </p>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-8"
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover"
              style={{ marginTop: index === 1 ? '40px' : '0' }}
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
              >
                {card.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#3d352e] mb-4">
                {card.title}
              </h3>
              <p className="text-[#5c4f3a] leading-relaxed">
                {card.description}
              </p>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#d4a373]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4a373]/10 to-transparent transform rotate-45 translate-x-16 -translate-y-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
