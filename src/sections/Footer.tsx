import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Globe2, ArrowRight, ShieldCheck, MapPinned, Building2 } from 'lucide-react';
import { tracking } from '../lib/tracking';

const Footer = () => {
  const { t } = useTranslation();

  const navGroups = [
    {
      title: t('footer.nav'),
      links: [
        { name: t('nav2.product'), to: '/' },
        { name: t('nav2.diagnosisEngine'), to: '/diagnose' },
        { name: t('nav2.useCases'), to: '/markets' },
        { name: t('nav2.caseProof'), to: '/cases' },
        { name: t('nav2.expertUpgrade'), to: '/expert' },
      ],
    },
    {
      title: t('footer.priorityMarkets'),
      links: [
        { name: t('footer.jpKorea'), to: '/markets' },
        { name: t('footer.euUk'), to: '/markets' },
        { name: t('footer.seAsia'), to: '/markets' },
        { name: t('footer.middleEast'), to: '/markets' },
      ],
    },
    {
      title: t('footer.platformCapabilities'),
      links: [
        { name: t('footer.marketEntry'), to: '/method' },
        { name: t('footer.compliancePathway'), to: '/method' },
        { name: t('footer.channelGrowth'), to: '/method' },
        { name: t('footer.diagnosisExpert'), to: '/diagnose' },
      ],
    },
  ];

  const affiliatedPlatforms = [
    {
      label: 'AfricaZero',
      description: t('footer.africaDesc'),
      href: 'https://africa.zxqconsulting.com/',
      trackingLabel: 'footer_africa',
    },
    {
      label: 'Global2China',
      description: t('footer.global2chinaDesc'),
      href: 'https://global2china.zxqconsulting.com/',
      trackingLabel: 'footer_global2china',
    },
  ];

  return (
    <footer className="bg-[#050d15] text-slate-300">
      <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(9,20,31,0.98),rgba(6,13,21,0.98))]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                {t('footer2.highTrust')}
              </div>
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">
                {t('footer2.footerMission')}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
                {t('footer2.footerDesc')}
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <div className="text-sm uppercase tracking-[0.18em] text-slate-500">
                {t('footer2.nextStep')}
              </div>
              <div className="text-xl font-semibold text-white">
                {t('footer2.nextStepDesc')}
              </div>
              <p className="text-sm leading-7 text-slate-400">
                {t('footer2.audience')}
              </p>
              <Link
                to="/expert"
                onClick={() => tracking.click('footer_consultation', 'footer')}
                className="inline-flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                {t('footer2.applyBtn')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-[0_12px_30px_rgba(16,185,129,0.25)]">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">{t('brand.name')}</div>
                <div className="text-lg font-semibold text-white">
                  {t('brand.tagline')}
                </div>
              </div>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-400">
              {t('footer2.platformFocus')}
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-4 w-4 text-emerald-300" />
                <span>{t('footer2.positioning')}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPinned className="mt-1 h-4 w-4 text-emerald-300" />
                <span>{t('footer.positioningCoverage')}</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 text-emerald-300" />
                <span>{t('footer.positioningDisclaimer')}</span>
              </div>
            </div>
          </div>

          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link, index) => (
                  <li key={`${group.title}-${link.name}-${index}`}>
                    <Link
                      to={link.to}
                      onClick={() => tracking.click(`footer_${group.title}_${index}`, 'footer')}
                      className="text-sm text-slate-300 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/8 pt-8">
          <div className="mb-4 text-xs uppercase tracking-[0.18em] text-slate-500">
            {t('footer.affiliatedPlatforms')}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {affiliatedPlatforms.map((platform) => (
              <a
                key={platform.href}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => tracking.click(platform.trackingLabel, 'footer_affiliated_platform')}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{platform.label}</div>
                    <div className="mt-1 text-sm text-slate-400">{platform.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 py-4">
        <div className="container mx-auto flex flex-col gap-2 px-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>{t('footer.copyright')}</div>
          <div>{t('footer.tagline')}</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
