import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import WhyUs from './sections/WhyUs';
import Markets from './sections/Markets';
import AIAdvisor from './sections/AIAdvisor';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import FloatingContact from './components/FloatingContact';
import { initAutoTracking } from './lib/tracking';

// "我们的成就"版块数据不够真实，暂不显示
// import StatsEnhanced from './sections/StatsEnhanced';
// import VisitorStats from './components/VisitorStats';
// import AIShowcase from './components/AIShowcase';
// import Testimonials from './sections/Testimonials';
// TODO: 出海攻略版块暂时隐藏，如有需要可以重新启用
// import BlogSection from './components/BlogSection';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Initialize scroll-triggered animations
    const sections = document.querySelectorAll('.animate-on-scroll');

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 初始化自动追踪
    initAutoTracking();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* 春节装饰已暂停 */}
      {/* <SpringDecorations /> */}
      
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyUs />
        <Markets />
        <AIAdvisor />
        {/* "我们的成就"版块数据不够真实，暂不显示
        <StatsEnhanced />
        <VisitorStats />
        <AIShowcase />
        */}
        {/* "他们说什么"版块数据不够真实，暂不显示
        <Testimonials />
        */}
        {/* <BlogSection /> */}
        <Contact />
      </main>
      <Footer />
      
      {/* Floating Contact Button - 浮动联系按钮 */}
      <FloatingContact />
    </div>
  );
}

export default App;
