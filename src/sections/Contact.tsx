import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Bot,
  Building,
  CalendarRange,
  ClipboardList,
  Globe2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { tracking } from '@/lib/tracking';
import { useMarket } from '@/sections/aiTools/context';

gsap.registerPlugin(ScrollTrigger);

const STAGE_OPTIONS = ['exploring', 'committed', 'testing', 'expanding'];
const BUDGET_OPTIONS = ['below500k', '500k2m', '2m5m', 'above5m'];
const VALIDATION_OPTIONS = ['idea', 'domestic', 'overseas', 'business'];

const Contact = () => {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectStage: '',
    targetMarkets: '',
    timeline: '',
    challenge: '',
    budget: '',
    hasValidation: '',
    message: '',
  });
  const { selectedMarket, selectedCategory, diagnosisInput, diagnosisReport, qualificationDecision } = useMarket();

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      projectStage: diagnosisInput.projectStage || current.projectStage,
      targetMarkets: selectedMarket?.name || current.targetMarkets,
      challenge: diagnosisReport?.primaryBlocker || diagnosisInput.keyQuestion || current.challenge,
      budget: diagnosisInput.budget || current.budget,
      hasValidation: diagnosisInput.validationStatus || current.hasValidation,
      message: qualificationDecision
        ? `${diagnosisReport?.recommendation || ''}\n${qualificationDecision.escalationReason}`.trim()
        : current.message,
    }));
  }, [diagnosisInput, diagnosisReport?.primaryBlocker, diagnosisReport?.recommendation, qualificationDecision, selectedMarket?.name]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
      gsap.fromTo(
        formRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      company: fd.get('company') as string,
      projectStage: fd.get('projectStage') as string,
      targetMarkets: fd.get('targetMarkets') as string,
      timeline: fd.get('timeline') as string,
      challenge: fd.get('challenge') as string,
      budget: fd.get('budget') as string,
      hasValidation: fd.get('hasValidation') as string,
      message: fd.get('message') as string,
      source_page: window.location.pathname,
    };

    try {
      const outboundForm = new FormData();
      outboundForm.append('name', data.name);
      outboundForm.append('email', data.email);
      outboundForm.append('phone', data.phone);
      outboundForm.append('company', data.company);
      outboundForm.append('message', [
        `${t('expertReview.projectStage')}: ${data.projectStage}`,
        `${t('expertReview.targetMarkets')}: ${data.targetMarkets}`,
        `${t('expertReview.diagnosisRec')}: ${diagnosisReport?.recommendedPath || ''}`,
        `${t('expertReview.qualificationDecision')}: ${qualificationDecision?.escalationReason || ''}`,
        `${t('expertReview.expectedTimeline')}: ${data.timeline}`,
        `${t('expertReview.budgetRange')}: ${data.budget}`,
        `${t('expertReview.existingValidation')}: ${data.hasValidation}`,
        `${t('expertReview.productCategory')}: ${selectedCategory || ''}`,
        `${t('expertReview.mostImportantProblem')}: ${data.challenge}`,
        `${t('expertReview.additionalNotes')}: ${data.message}`,
      ].join('\n'));

      const [primary, backup, api] = await Promise.all([
        fetch('https://formsubmit.co/ajax/customer@zxqconsulting.com', { method: 'POST', headers: { Accept: 'application/json' }, body: outboundForm }),
        fetch('https://formsubmit.co/ajax/3740977@qq.com', { method: 'POST', headers: { Accept: 'application/json' }, body: outboundForm }),
        fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      ]);
      if (!primary.ok && !backup.ok && !api.ok) throw new Error('All contact submission channels failed.');
      tracking.formSubmit('expert_review_form', true, data);
      setShowDialog(true);
      form.reset();
      setFormData({ name: '', email: '', phone: '', company: '', projectStage: '', targetMarkets: '', timeline: '', challenge: '', budget: '', hasValidation: '', message: '' });
    } catch (error) {
      console.error(t('expertReview.submitError'), error);
      tracking.formSubmit('expert_review_form', false, data);
      alert(t('expertReview.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const label = (key: string, fallback: string) => t(`expertReview.${key}`, fallback);
  const optLabel = (prefix: string, value: string) => t(`expertReview.${prefix}_${value}`, value);

  return (
    <section id="contact" ref={sectionRef} className="bg-[#07111a] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <ClipboardList className="h-4 w-4" />
            {t('diagnosis.expertReviewSection')}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            {t('expertReview.title')}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            {t('expertReview.desc')}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div ref={imageRef} className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 shadow-xl">
              <img src="/contact-bg.jpg" alt="Contact" className="h-[280px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111a] via-[#07111a]/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">{t('diagnosis.expertReviewTitle')}</div>
                <h3 className="mt-2 text-2xl font-semibold">{t('expertReview.expertReviewCardTitle')}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold text-white">{t('expertReview.expertDesk')}</div>
                    <div className="mt-1 text-sm text-slate-400">{t('expertReview.expertDeskRole')}</div>
                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                      <Globe2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <span>{t('expertReview.expertDeskMarkets')}</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <a href="mailto:customer@zxqconsulting.com" className="flex items-center gap-2 text-slate-300 transition-colors hover:text-white">
                        <Mail className="h-4 w-4 text-emerald-300" /> customer@zxqconsulting.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                <span>{t('diagnosis.recommendComplete')}</span>
              </div>
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-sm md:p-8">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-emerald-300/80">
                {t('diagnosis.highValueForm')}
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {t('expertReview.submitBtn')}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {t('expertReview.formDesc')}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <User className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.contactName')}
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mac-input focus-ring" placeholder={t('expertReview.contactNamePlaceholder')} />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Building className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.companyBrand')}
                  </label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange}
                    className="mac-input focus-ring" placeholder={t('expertReview.companyPlaceholder')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Mail className="h-4 w-4 text-emerald-300" /> Email
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="mac-input focus-ring" placeholder={t('expertReview.emailPlaceholder')} />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Phone className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.phone')}
                  </label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    className="mac-input focus-ring" placeholder={t('expertReview.phonePlaceholder')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <ClipboardList className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.projectStage')}
                  </label>
                  <select name="projectStage" value={formData.projectStage} onChange={handleChange}
                    className="mac-input focus-ring">
                    <option value="">{t('diagnosis.selectPlease')}</option>
                    {STAGE_OPTIONS.map(o => <option key={o} value={o}>{optLabel('stage', o)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <CalendarRange className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.expectedTimeline')}
                  </label>
                  <input type="text" name="timeline" value={formData.timeline} onChange={handleChange}
                    className="mac-input focus-ring" placeholder={t('expertReview.timelinePlaceholder')} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Globe2 className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.targetMarkets')}
                  </label>
                  <input type="text" name="targetMarkets" value={formData.targetMarkets} onChange={handleChange}
                    className="mac-input focus-ring" placeholder={t('expertReview.marketsPlaceholder')} />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <ClipboardList className="h-4 w-4 text-emerald-300" />
                    {t('expertReview.budgetRange')}
                  </label>
                  <select name="budget" value={formData.budget} onChange={handleChange}
                    className="mac-input focus-ring">
                    <option value="">{t('diagnosis.selectPlease')}</option>
                    {BUDGET_OPTIONS.map(o => <option key={o} value={o}>{optLabel('budget', o)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  {t('expertReview.existingValidation')}
                </label>
                <select name="hasValidation" value={formData.hasValidation} onChange={handleChange}
                  className="mac-input focus-ring">
                  <option value="">{t('diagnosis.selectPlease')}</option>
                  {VALIDATION_OPTIONS.map(o => <option key={o} value={o}>{optLabel('validation', o)}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MessageSquare className="h-4 w-4 text-emerald-300" />
                  {t('expertReview.mostImportantProblem')}
                </label>
                <textarea name="challenge" value={formData.challenge} onChange={handleChange} rows={3}
                  className="mac-input focus-ring resize-none"
                  placeholder={t('expertReview.problemPlaceholder')} />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <MessageSquare className="h-4 w-4 text-emerald-300" />
                  {t('expertReview.additionalNotes')}
                </label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={4}
                  className="mac-input focus-ring resize-none"
                  placeholder={t('expertReview.notesPlaceholder')} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? t('expertReview.submitting') : t('expertReview.submitBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border-white/10 bg-[#0b1620] text-white">
          <DialogHeader>
            <DialogTitle>{t('expertReview.requestSubmitted')}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {t('expertReview.requestSubmittedMsg')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Contact;
