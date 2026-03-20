import { useEffect, useRef, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import FloatingContact from './components/FloatingContact';
import GA4 from './components/GA4';
import { initAutoTracking, tracking } from './lib/tracking';
import { MarketProvider } from './sections/aiToolsMarketContext';

// 延迟加载非首屏区块
const About = lazy(() => import('./sections/About'));
const Services = lazy(() => import('./sections/Services'));
const AIToolsHub = lazy(() => import('./sections/AIToolsHub'));
const AIAdvisor = lazy(() => import('./sections/AIAdvisor'));
const CaseStudies = lazy(() => import('./sections/CaseStudies'));
const Contact = lazy(() => import('./sections/Contact'));
const Footer = lazy(() => import('./sections/Footer'));

gsap.registerPlugin(ScrollTrigger);

function App() {
  const trackedSections = useRef<Set<string>>(new Set());

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

    // 区块浏览追踪 - 使用 IntersectionObserver
    const sectionIds = ['hero', 'about', 'services', 'ai-tools', 'ai-advisor', 'cases', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const sectionId = entry.target.id;
            if (sectionId && !trackedSections.current.has(sectionId)) {
              trackedSections.current.add(sectionId);
              tracking.sectionView(sectionId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      observer.disconnect();
    };
  }, []);

  return (
    <MarketProvider>
      <div className="min-h-screen relative">
        {/* Google Analytics 4 */}
        <GA4 />
        
        <Navbar />
        <main>
          <Hero />
          <Suspense fallback={null}>
            <About />
            <Services />
            <AIToolsHub />
            <AIAdvisor />
            <CaseStudies />
            <Contact />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        
        {/* Floating Contact Button - 浮动联系按钮 */}
        <FloatingContact />
      </div>
    </MarketProvider>
  );
}

export default App;
