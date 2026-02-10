import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const Stats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const hasAnimated = useRef(false);

  const stats: Stat[] = [
    { value: 200, suffix: '+', label: '成功出海企业' },
    { value: 10, suffix: '+', label: '年行业经验' },
    { value: 50, suffix: '+', label: '全球合作伙伴' },
    { value: 30, suffix: '+', label: '覆盖国家地区' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => {
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            animateCounts();
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const animateCounts = () => {
    stats.forEach((stat, index) => {
      const obj = { value: 0 };
      gsap.to(obj, {
        value: stat.value,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => {
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = Math.round(obj.value);
            return newCounts;
          });
        },
      });
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/stats-bg.jpg"
          alt="Stats Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3d352e]/90 via-[#5c4f3a]/80 to-[#3d352e]/90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-[#e6c9a8] font-medium mb-4 tracking-wider uppercase text-sm">
            我们的成就
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            数字见证实力
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="stat-number text-white mb-2">
                {counts[index]}
                {stat.suffix}
              </div>
              <div className="text-[#e6c9a8] text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
