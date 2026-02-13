import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import WhyUs from './sections/WhyUs';
import Markets from './sections/Markets';
import StatsEnhanced from './sections/StatsEnhanced';
import Testimonials from './sections/Testimonials';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import FloatingContact from './components/FloatingContact';

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
        <StatsEnhanced />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      
      {/* Floating Contact Button - 浮动联系按钮 */}
      <FloatingContact />
    </div>
  );
}

export default App;
