import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Market {
  id: string;
  name: string;
  description: string;
  image: string;
  position: { x: number; y: number };
  details: string[];
}

const Markets = () => {
  const { t } = useTranslation();
  const [activeMarket, setActiveMarket] = useState<string>('australia');
  const sectionRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const markets: Market[] = [
    {
      id: 'japan',
      name: t('markets.japan.title'),
      description: t('markets.japan.description'),
      image: '/osaka.jpg',
      position: { x: 78, y: 35 },
      details: [
        t('markets.japan.features.resident'),
        t('markets.japan.features.local'),
        t('markets.japan.features.service'),
        t('markets.japan.features.language'),
      ],
    },
    {
      id: 'europe',
      name: t('markets.europe.title'),
      description: t('markets.europe.description'),
      image: '/europe.jpg',
      position: { x: 52, y: 28 },
      details: [
        t('markets.europe.features.hub'),
        t('markets.europe.features.network'),
        t('markets.europe.features.local'),
        t('markets.europe.features.compliance'),
      ],
    },
    {
      id: 'sea',
      name: t('markets.southeast.title'),
      description: t('markets.southeast.description'),
      image: '/malaysia.jpg',
      position: { x: 72, y: 55 },
      details: [
        t('markets.southeast.features.market'),
        t('markets.southeast.features.growth'),
        t('markets.southeast.features.local'),
        t('markets.southeast.features.support'),
      ],
    },
    {
      id: 'australia',
      name: t('markets.australia.title'),
      description: t('markets.australia.description'),
      image: '/australia.jpg',
      position: { x: 85, y: 58 },
      details: [
        t('markets.australia.features.resident'),
        t('markets.australia.features.local'),
        t('markets.australia.features.service'),
        t('markets.australia.features.language'),
      ],
    },
    {
      id: 'mena',
      name: t('markets.middleEast.title'),
      description: t('markets.middleEast.description'),
      image: '/mideast.jpg',
      position: { x: 58, y: 40 },
      details: [
        t('markets.middleEast.features.opportunity'),
        t('markets.middleEast.features.partners'),
        t('markets.middleEast.features.culture'),
        t('markets.middleEast.features.support'),
      ],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Map animation
      gsap.fromTo(
        mapRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Content animation
      gsap.fromTo(
        contentRef.current,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activeMarketData = markets.find((m) => m.id === activeMarket);

  return (
    <section
      id="markets"
      ref={sectionRef}
      className="section py-24 bg-white overflow-hidden"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#10b981] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('markets.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#064e3b] mb-4">
            {t('markets.subtitle')}
          </h2>
          <p className="text-[#5c4f3a] max-w-2xl mx-auto">
            {t('markets.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Map */}
          <div ref={mapRef} className="lg:col-span-3 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              {/* Market Background Image */}
              <img 
                src={activeMarketData?.image} 
                alt="Market Background"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              />
              
              {/* Dark overlay for better visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:col-span-2">
            {activeMarketData && (
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-emerald-100/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#064e3b]">
                    {activeMarketData.name}
                  </h3>
                </div>

                <p className="text-[#5c4f3a] mb-6 leading-relaxed">
                  {activeMarketData.description}
                </p>

                <div className="space-y-3">
                  {activeMarketData.details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-[#064e3b]"
                    >
                      <ArrowRight className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Market selector */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {markets.map((market) => (
                    <button
                      key={market.id}
                      onClick={() => setActiveMarket(market.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeMarket === market.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {market.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Markets;
