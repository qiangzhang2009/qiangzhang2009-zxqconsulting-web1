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
  position: { x: number; y: number };
  details: string[];
}

const Markets = () => {
  const { t } = useTranslation();
  const [activeMarket, setActiveMarket] = useState<string>('japan');
  const sectionRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const markets: Market[] = [
    {
      id: 'japan',
      name: t('markets.japan.title'),
      description: t('markets.japan.description'),
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
      position: { x: 72, y: 55 },
      details: [
        t('markets.southeast.features.market'),
        t('markets.southeast.features.growth'),
        t('markets.southeast.features.local'),
        t('markets.southeast.features.support'),
      ],
    },
    {
      id: 'mena',
      name: t('markets.middleEast.title'),
      description: t('markets.middleEast.description'),
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

      // Hotspots animation
      gsap.fromTo(
        '.market-hotspot',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
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
          <span className="inline-block text-[#d4a373] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('markets.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-4">
            {t('markets.subtitle')}
          </h2>
          <p className="text-[#5c4f3a] max-w-2xl mx-auto">
            {t('markets.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Map */}
          <div ref={mapRef} className="lg:col-span-3 relative">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[#f5f0e8] to-[#e6c9a8] rounded-3xl overflow-hidden shadow-xl">
              {/* World Map SVG */}
              <svg
                viewBox="0 0 100 60"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Simplified world map paths */}
                <path
                  d="M20,15 Q25,10 35,12 Q45,15 50,20 Q55,25 50,35 Q45,45 35,48 Q25,50 20,45 Q15,40 15,30 Q15,20 20,15"
                  fill="#d4a373"
                  opacity="0.3"
                />
                <path
                  d="M45,20 Q50,15 60,18 Q70,22 75,30 Q78,40 72,48 Q65,55 55,52 Q48,48 45,40 Q42,30 45,20"
                  fill="#d4a373"
                  opacity="0.3"
                />
                <path
                  d="M75,25 Q80,20 88,22 Q95,28 92,38 Q88,48 80,50 Q72,48 70,38 Q68,30 75,25"
                  fill="#d4a373"
                  opacity="0.3"
                />
                <path
                  d="M55,45 Q60,42 68,45 Q75,50 72,58 Q65,62 58,58 Q52,52 55,45"
                  fill="#d4a373"
                  opacity="0.3"
                />

                {/* Connection lines */}
                <line
                  x1="78"
                  y1="35"
                  x2="52"
                  y2="28"
                  stroke="#d4a373"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                <line
                  x1="52"
                  y1="28"
                  x2="58"
                  y2="40"
                  stroke="#d4a373"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                <line
                  x1="58"
                  y1="40"
                  x2="72"
                  y2="55"
                  stroke="#d4a373"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
              </svg>

              {/* Hotspots */}
              {markets.map((market) => (
                <button
                  key={market.id}
                  className={`market-hotspot absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    activeMarket === market.id ? 'scale-125 z-10' : 'hover:scale-110'
                  }`}
                  style={{ left: `${market.position.x}%`, top: `${market.position.y}%` }}
                  onClick={() => setActiveMarket(market.id)}
                >
                  <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#d4a373] animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-0 rounded-full border-2 border-[#d4a373] animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />

                    {/* Dot */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-lg transition-colors duration-300 ${
                        activeMarket === market.id
                          ? 'bg-[#d4a373]'
                          : 'bg-[#a67c52]'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:col-span-2">
            {activeMarketData && (
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#e6c9a8]/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#d4a373] flex items-center justify-center text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#3d352e]">
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
                      className="flex items-center gap-3 text-[#3d352e]"
                    >
                      <ArrowRight className="w-4 h-4 text-[#d4a373] flex-shrink-0" />
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
                          ? 'bg-[#d4a373] text-white'
                          : 'bg-[#f5f0e8] text-[#3d352e] hover:bg-[#e6c9a8]'
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
