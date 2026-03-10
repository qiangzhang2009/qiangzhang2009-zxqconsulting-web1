/**
 * 网站动态背景效果集合
 * 可直接在组件中引入使用
 */

// 浮动粒子背景效果
export function createParticleBackground(canvasId: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  let particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }> = [];
  
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  const createParticles = () => {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
  };
  
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制粒子
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      
      // 边界检测
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(46, 125, 50, ${p.opacity})`; // emerald-600
      ctx.fill();
    });
    
    // 绘制连线
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach((p2) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(46, 125, 50, ${0.1 * (1 - dist / 150)})`;
          ctx.stroke();
        }
      });
    });
    
    requestAnimationFrame(draw);
  };
  
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
  
  resize();
  createParticles();
  draw();
}

// 渐变光晕效果
export function createGlowOrb(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const orb = document.createElement('div');
  orb.style.cssText = `
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(46, 125, 50, 0.15) 0%, transparent 70%);
    filter: blur(40px);
    animation: floatOrb 8s ease-in-out infinite;
    pointer-events: none;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -20px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
  `;
  document.head.appendChild(style);
  container.appendChild(orb);
  
  return orb;
}

// 数字滚动动画
export function animateValue(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number,
  prefix: string = '',
  suffix: string = ''
) {
  const startTime = performance.now();
  
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 缓动函数
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOut);
    
    element.textContent = prefix + current.toLocaleString() + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  
  requestAnimationFrame(update);
}

// 进度条动画
export function animateProgressBar(element: HTMLElement, targetWidth: number, duration: number = 1500) {
  const startTime = performance.now();
  
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 缓动函数
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = targetWidth * easeOut;
    
    element.style.width = `${current}%`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  
  requestAnimationFrame(update);
}

// 打字机效果
export function typeWriter(element: HTMLElement, text: string, speed: number = 50) {
  let index = 0;
  element.textContent = '';
  
  const type = () => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  };
  
  type();
}

// 脉冲动画圆点
export function createPulseDot(containerId: string, color: string = '#2E7D32') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const dot = document.createElement('span');
  dot.style.cssText = `
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${color};
    animation: pulse 2s ease-in-out infinite;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
  container.appendChild(dot);
  
  return dot;
}

// 加载骨架屏动画
export function createSkeletonLoading(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.classList.add('skeleton-loading');
  
  const style = document.createElement('style');
  style.textContent = `
    .skeleton-loading {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

// 浮动卡片动画
export function createFloatingCard(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.style.cssText += `
    animation: floatCard 6s ease-in-out infinite;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatCard {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
}

// 交互动效 - 鼠标跟随高亮
export function createMouseFollower(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const follower = document.createElement('div');
  follower.style.cssText = `
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(46, 125, 50, 0.1) 0%, transparent 70%);
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease-out;
  `;
  container.appendChild(follower);
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    follower.style.left = `${x}px`;
    follower.style.top = `${y}px`;
  });
  
  return follower;
}
