import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin, Send, User, Building, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { tracking } from '@/lib/tracking';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const { t } = useTranslation();
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
    message: '',
  });

  const contacts = [
    {
      name: t('contact.team.zhang.name'),
      role: t('contact.team.zhang.region'),
      phone: t('contact.team.zhang.phone'),
      email: t('contact.team.zhang.email'),
    },
    {
      name: t('contact.team.li.name'),
      role: t('contact.team.li.region'),
      phone1: t('contact.team.li.phoneCn'),
      phone2: t('contact.team.li.phoneJp'),
      email: t('contact.team.li.email'),
    },
    {
      name: t('contact.team.liu.name'),
      role: t('contact.team.liu.region'),
      phone1: t('contact.team.liu.phoneCn'),
      phone2: t('contact.team.liu.phoneAu'),
      email: t('contact.team.liu.email'),
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image animation
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      // Form animation
      gsap.fromTo(
        formRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    const data = {
      name: formDataObj.get('name') as string,
      email: formDataObj.get('email') as string,
      phone: formDataObj.get('phone') as string,
      company: formDataObj.get('company') as string,
      message: formDataObj.get('message') as string,
      source_page: window.location.pathname,
    };

    try {
      // 发送到自己的 API（同时保存数据到数据库）
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // 追踪表单提交事件
        tracking.formSubmit('contact_form', true);
        
        // 显示成功弹窗并重置表单
        setShowDialog(true);
        form.reset();
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('提交失败:', error);
      tracking.formSubmit('contact_form', false);
      alert(t('contact.form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 bg-gray-50/50"
    >
      <div className="container mx-auto px-6">
        {/* Header - macOS style */}
        <div className="text-center mb-12">
          <span className="inline-block text-blue-600 font-medium mb-3 text-sm">
            {t('contact.title')}
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
            {t('contact.subtitle')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact Info & Image */}
          <div>
            <div
              ref={imageRef}
              className="relative rounded-2xl overflow-hidden shadow-md mb-6"
            >
              <img
                src="/contact-bg.jpg"
                alt="Contact"
                className="w-full h-[240px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-lg font-semibold">{t('brand.fullName')}</h3>
                <p className="text-sm text-white/70">{t('brand.tagline')}</p>
              </div>
            </div>

            {/* Contact Cards - macOS style */}
            <div className="space-y-3">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{contact.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{contact.role}</div>
                      <div className="flex flex-col gap-1 text-xs">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.phone1 && (
                          <a
                            href={`tel:${contact.phone1}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone1}
                          </a>
                        )}
                        {contact.phone2 && (
                          <a
                            href={`tel:${contact.phone2}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {contact.phone2}
                          </a>
                        )}
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social - macOS style */}
            <div className="mt-4 p-4 bg-gray-100/50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{t('contact.social')}</span>
              </div>
            </div>
          </div>

          {/* Form - macOS style */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-5">{t('contact.form.title')}</h3>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-4 h-4 text-blue-500" />
                    {t('contact.form.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mac-input"
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Building className="w-4 h-4 text-blue-500" />
                    {t('contact.form.company')}
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="mac-input"
                    placeholder={t('contact.form.companyPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mac-input"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="w-4 h-4 text-blue-500" />
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mac-input"
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="mac-input resize-none"
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full justify-center py-3 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-gray-900">{t('contact.form.success')}</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              {t('contact.form.successMessage')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowDialog(false)}
              className="btn btn-primary"
            >
              {t('contact.form.gotIt')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Contact;
