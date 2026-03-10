import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import AIToolsHub from './sections/AIToolsHub';
import AIAdvisor from './sections/AIAdvisor';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import FloatingContact from './components/FloatingContact';
import GA4 from './components/GA4';
import { initAutoTracking } from './lib/tracking';
import CaseStudies from './sections/CaseStudies';
import { MarketContext, type TargetMarket } from './sections/aiToolsMarketContext';

gsap.registerPlugin(ScrollTrigger);

function App() {
  // 共享的市场选择状态 - 供所有需要市场选择的组件使用
  const [selectedMarket, setSelectedMarket] = useState<TargetMarket | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

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
    <MarketContext.Provider value={{ selectedMarket, selectedRegion, setSelectedMarket, setSelectedRegion }}>
      <div className="min-h-screen relative">
        {/* Google Analytics 4 */}
        <GA4 />
        
        <Navbar />
        <main>
          <Hero />
          <About />
          <Services />
          <AIToolsHub />
          <AIAdvisor />
          <CaseStudies />
          <Contact />
        </main>
        <Footer />
        
        {/* Floating Contact Button - 浮动联系按钮 */}
        <FloatingContact />
      </div>
    </MarketContext.Provider>
  );
}

export default App;
