import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin, Send, User, Building, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [showDialog, setShowDialog] = useState(false);
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

    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    // 转换为 URL 编码格式发送
    const data = new URLSearchParams();
    data.append('name', formDataObj.get('name') as string);
    data.append('email', formDataObj.get('email') as string);
    data.append('phone', formDataObj.get('phone') as string);
    data.append('company', formDataObj.get('company') as string);
    data.append('message', formDataObj.get('message') as string);

    try {
      // 发送到 FormSubmit 服务
      await fetch('https://formsubmit.co/ajax/customer@zxqconsulting.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: data
      });

      // 显示成功弹窗并重置表单
      setShowDialog(true);
      form.reset();
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请稍后重试或直接发送邮件至 customer@zxqconsulting.com');
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
      className="section py-24 bg-white"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#d4a373] font-medium mb-4 tracking-wider uppercase text-sm">
            {t('contact.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3d352e] mb-4">
            {t('contact.subtitle')}
          </h2>
          <p className="text-[#5c4f3a] max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info & Image */}
          <div>
            <div
              ref={imageRef}
              className="relative rounded-2xl overflow-hidden shadow-xl mb-8"
            >
              <img
                src="/contact-bg.jpg"
                alt="Contact"
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d352e]/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-xl font-bold mb-2">{t('brand.fullName')}</h3>
                <p className="text-sm text-white/80">{t('brand.tagline')}</p>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-[#f5f0e8] rounded-xl p-5 hover:bg-[#e6c9a8]/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#d4a373] flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#3d352e]">{contact.name}</div>
                      <div className="text-sm text-[#5c4f3a] mb-2">{contact.role}</div>
                      <div className="flex flex-col gap-1 text-sm">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-[#3d352e] hover:text-[#d4a373] transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.phone1 && (
                          <a
                            href={`tel:${contact.phone1}`}
                            className="flex items-center gap-2 text-[#3d352e] hover:text-[#d4a373] transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.phone1}
                          </a>
                        )}
                        {contact.phone2 && (
                          <a
                            href={`tel:${contact.phone2}`}
                            className="flex items-center gap-2 text-[#3d352e] hover:text-[#d4a373] transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {contact.phone2}
                          </a>
                        )}
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-2 text-[#3d352e] hover:text-[#d4a373] transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="mt-6 p-5 bg-gradient-to-r from-[#d4a373]/10 to-[#e6c9a8]/10 rounded-xl">
              <div className="flex items-center gap-2 text-[#3d352e]">
                <MapPin className="w-5 h-5 text-[#d4a373]" />
                <span className="font-medium">{t('contact.social')}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-8 shadow-xl border border-[#e6c9a8]/30"
          >
            <h3 className="text-xl font-bold text-[#3d352e] mb-6">{t('contact.form.title')}</h3>

            <div className="space-y-5">
              <div className="input-focus">
                <label className="flex items-center gap-2 text-sm font-medium text-[#3d352e] mb-2">
                  <User className="w-4 h-4 text-[#d4a373]" />
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#f5f0e8] rounded-lg border-0 focus:ring-2 focus:ring-[#d4a373] transition-all"
                  placeholder={t('contact.form.namePlaceholder')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="input-focus">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#3d352e] mb-2">
                    <Mail className="w-4 h-4 text-[#d4a373]" />
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#f5f0e8] rounded-lg border-0 focus:ring-2 focus:ring-[#d4a373] transition-all"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <div className="input-focus">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#3d352e] mb-2">
                    <Phone className="w-4 h-4 text-[#d4a373]" />
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#f5f0e8] rounded-lg border-0 focus:ring-2 focus:ring-[#d4a373] transition-all"
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="input-focus">
                <label className="flex items-center gap-2 text-sm font-medium text-[#3d352e] mb-2">
                  <Building className="w-4 h-4 text-[#d4a373]" />
                  {t('contact.form.company')}
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f0e8] rounded-lg border-0 focus:ring-2 focus:ring-[#d4a373] transition-all"
                  placeholder={t('contact.form.companyPlaceholder')}
                />
              </div>

              <div className="input-focus">
                <label className="flex items-center gap-2 text-sm font-medium text-[#3d352e] mb-2">
                  <MessageSquare className="w-4 h-4 text-[#d4a373]" />
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f5f0e8] rounded-lg border-0 focus:ring-2 focus:ring-[#d4a373] transition-all resize-none"
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                <Send className="w-4 h-4" />
                {t('contact.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[#3d352e]">提交成功</DialogTitle>
            <DialogDescription className="text-center text-[#5c4f3a]">
              感谢您的咨询！我们的专业顾问将在24小时内与您联系。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowDialog(false)}
              className="btn-primary"
            >
              知道了
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Contact;
