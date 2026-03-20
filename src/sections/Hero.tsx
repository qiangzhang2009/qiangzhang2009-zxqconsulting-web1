import { useEffect, useRef, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ArrowRight, Globe, Sparkles, TrendingUp, Shield, CheckCircle, Leaf } from 'lucide-react';
import { tracking } from '../lib/tracking';

// 延迟加载 WalkingFigures
const WalkingFigures = lazy(() => import('@/components/WalkingFigures'));

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 标题动画
      gsap.fromTo('.hero-char', 
        { opacity: 0, y: 60, rotateX: -90 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.3 }
      );

      // 副标题动画
      gsap.fromTo('.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 1 }
      );

      // 按钮动画
      gsap.fromTo('.hero-cta',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)', delay: 1.2 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToAITools = () => {
    const element = document.querySelector('#ai-tools');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    tracking.click('hero_ai_tools', 'cta');
  };

  const scrollToContact = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    tracking.click('hero_consult', 'cta');
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* 科技感背景 - 网格和发光效果 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
            linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
          `
        }}
      />
      
      {/* 科技网格背景 */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* 扫描线效果 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-scan" />
      </div>

      {/* 国风装饰元素 - 抽象云纹 */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }} />
        <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)', filter: 'blur(25px)' }} />
      </div>

      {/* 内容层 */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* 标签 */}
          <div className="hero-subtitle inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 mb-10">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-gray-300 text-sm font-medium">中医药出海智能解决方案</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>

          {/* 主标题 - 国风科技风 */}
          <div ref={titleRef} className="mb-8">
            <div className="flex flex-wrap justify-center items-baseline gap-4 mb-4">
              <span className="hero-char text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500" style={{ textShadow: '0 0 60px rgba(245,158,11,0.5)' }}>
                AI
              </span>
              <span className="hero-char text-4xl md:text-6xl font-bold text-white">一站式</span>
            </div>
            
            <div className="hero-char text-6xl md:text-8xl lg:text-9xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400" style={{ textShadow: '0 0 80px rgba(6,182,212,0.4)' }}>
                中医出海
              </span>
            </div>

            {/* 副标题英文 */}
            <div className="hero-subtitle mt-4 text-xl md:text-2xl text-gray-400 font-light tracking-wider">
              AI-Powered Traditional Chinese Medicine Global Expansion
            </div>
          </div>

          {/* 核心价值 - 卡片式设计 */}
          <div className="hero-subtitle grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">35+ 全球市场</h3>
              <p className="text-gray-400 text-sm">覆盖全球主要经济体，一站式市场数据分析</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">AI 智能决策</h3>
              <p className="text-gray-400 text-sm">基于大数据+AI算法，精准评估市场风险</p>
            </div>

            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">7×24 专家服务</h3>
              <p className="text-gray-400 text-sm">专业团队全程护航，助力企业无忧出海</p>
            </div>
          </div>

          {/* CTA 按钮 */}
          <div className="hero-cta flex flex-wrap justify-center gap-5">
            <button
              onClick={scrollToAITools}
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                开始智能评估
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button
              onClick={scrollToContact}
              className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-lg text-white hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-3"
            >
              <Shield className="w-6 h-6" />
              咨询专家
            </button>
          </div>

          {/* 底部信任标识 */}
          <div className="hero-subtitle mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>服务企业 <strong className="text-white">500+</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>市场覆盖 <strong className="text-white">35+</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>成功率 <strong className="text-emerald-400">95%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 滚动指示器 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs uppercase tracking-widest">向下滚动</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Mirofish 风格卡通人物带 */}
      <Suspense fallback={null}>
        <WalkingFigures />
      </Suspense>
    </section>
  );
};

export default Hero;
