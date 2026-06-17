import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Brain,
  Compass,
  FileBarChart,
  LayoutTemplate,
  ShieldCheck,
  UserRoundSearch,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Capability {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  outputs: string[];
}

const Services = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const methodRef = useRef<HTMLDivElement>(null);

  const capabilities: Capability[] = [
    {
      id: 'market-priority',
      icon: <Compass className="h-6 w-6" />,
      titleKey: 'services.cap_market_priority',
      descKey: 'services.cap_market_priority_desc',
      outputs: [
        t('services.cap_market_priority_out1'),
        t('services.cap_market_priority_out2'),
        t('services.cap_market_priority_out3'),
      ],
    },
    {
      id: 'entry-complexity',
      icon: <ShieldCheck className="h-6 w-6" />,
      titleKey: 'services.cap_entry_complexity',
      descKey: 'services.cap_entry_complexity_desc',
      outputs: [
        t('services.cap_entry_complexity_out1'),
        t('services.cap_entry_complexity_out2'),
        t('services.cap_entry_complexity_out3'),
      ],
    },
    {
      id: 'diagnosis-summary',
      icon: <FileBarChart className="h-6 w-6" />,
      titleKey: 'services.cap_diagnosis_summary',
      descKey: 'services.cap_diagnosis_summary_desc',
      outputs: [
        t('services.cap_diagnosis_summary_out1'),
        t('services.cap_diagnosis_summary_out2'),
        t('services.cap_diagnosis_summary_out3'),
      ],
    },
    {
      id: 'follow-up',
      icon: <Brain className="h-6 w-6" />,
      titleKey: 'services.cap_followup',
      descKey: 'services.cap_followup_desc',
      outputs: [
        t('services.cap_followup_out1'),
        t('services.cap_followup_out2'),
        t('services.cap_followup_out3'),
      ],
    },
    {
      id: 'sample-proof',
      icon: <LayoutTemplate className="h-6 w-6" />,
      titleKey: 'services.cap_sample_proof',
      descKey: 'services.cap_sample_proof_desc',
      outputs: [
        t('services.cap_sample_proof_out1'),
        t('services.cap_sample_proof_out2'),
        t('services.cap_sample_proof_out3'),
      ],
    },
    {
      id: 'expert-upgrade',
      icon: <UserRoundSearch className="h-6 w-6" />,
      titleKey: 'services.cap_expert_upgrade',
      descKey: 'services.cap_expert_upgrade_desc',
      outputs: [
        t('services.cap_expert_upgrade_out1'),
        t('services.cap_expert_upgrade_out2'),
        t('services.cap_expert_upgrade_out3'),
      ],
    },
  ];

  const methodSteps = [
    {
      step: '01',
      title: t('about.step1Title'),
      description: t('about.step1Desc'),
    },
    {
      step: '02',
      title: t('about.step2Title'),
      description: t('about.step2Desc'),
    },
    {
      step: '03',
      title: t('about.step3Title'),
      description: t('about.step3Desc'),
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.capability-card',
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: capabilitiesRef.current, start: 'top 75%' },
        }
      );
      gsap.fromTo(
        '.method-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: methodRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="relative bg-[#08131d] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <Brain className="h-4 w-4" />
            {t('about.sixLayersTitle')}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            {t('about.sixLayersSubtitle')}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            {t('about.sixLayersSubtitleEn')}
          </p>
        </div>

        <div ref={capabilitiesRef} className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((capability) => (
            <div
              key={capability.id}
              className="capability-card rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="inline-flex rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/10 p-3 text-white">
                {capability.icon}
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{t(capability.titleKey)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{t(capability.descKey)}</p>
              <div className="mt-6 space-y-3">
                {capability.outputs.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div ref={methodRef} className="mt-16 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 md:p-10">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
              {t('services.howItWorks')}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white md:text-4xl">
              {t('about.approachTitle')}
            </h3>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {methodSteps.map((step) => (
              <div key={step.step} className="method-card rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm font-semibold tracking-[0.22em] text-emerald-300/80">{step.step}</div>
                <h4 className="mt-4 text-xl font-semibold text-white">{step.title}</h4>
                <p className="mt-3 text-sm leading-7 text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>

          <Link
            to="/expert"
            className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {t('about.viewExpertPath')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
