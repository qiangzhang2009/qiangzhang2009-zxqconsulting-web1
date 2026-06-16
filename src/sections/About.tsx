import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Database, FileSearch, ShieldAlert, Waypoints, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const principles = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: t('about.p1_title'),
      description: t('about.p1_desc'),
    },
    {
      icon: <ShieldAlert className="h-5 w-5" />,
      title: t('about.p2_title'),
      description: t('about.p2_desc'),
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: t('about.p3_title'),
      description: t('about.p3_desc'),
    },
    {
      icon: <Waypoints className="h-5 w-5" />,
      title: t('about.p4_title'),
      description: t('about.p4_desc'),
    },
  ];

  const evidence = [
    t('about.evidence1'),
    t('about.evidence2'),
    t('about.evidence3'),
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToCases = () => {
    document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about" ref={sectionRef} className="overflow-hidden bg-[#07111a] py-24">
      <div className="container mx-auto px-6">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div ref={contentRef}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-emerald-300">
              {t('about.platformLogic')}
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
              {t('about.notAgencyHomepage')}
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              {t('about.platformPurpose')}
            </p>
            <p className="mt-5 text-base leading-8 text-slate-400">
              {t('about.platformOutcome')}
            </p>

            <div className="mt-8 space-y-3">
              {evidence.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={scrollToCases}
              className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t('about.viewProofCases')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div ref={cardsRef} className="grid gap-5 sm:grid-cols-2">
            {principles.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
              >
                <div className="inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                  {pillar.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
