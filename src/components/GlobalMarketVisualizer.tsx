import { useEffect, useRef, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';

// 市场数据接口
interface MarketNode {
  id: string;
  name: string;
  nameEn: string;
  lat: number;  // 纬度 -90 到 90 (赤道=0，北极=90，南极=-90)
  lng: number;  // 经度 -180 到 180 (本初子午线=0)
  heat: number;
  connections: string[];
}

// 市场节点数据 - 使用更精确的经纬度
const getMarketNodes = (): MarketNode[] => [
  { id: 'cn', name: '中国', nameEn: 'China', lat: 35, lng: 105, heat: 95, connections: ['jp', 'sea', 'us', 'eu', 'au'] },
  { id: 'jp', name: '日本', nameEn: 'Japan', lat: 36, lng: 138, heat: 92, connections: ['cn', 'sea', 'us', 'au'] },
  { id: 'sea', name: '东南亚', nameEn: 'Southeast Asia', lat: 5, lng: 115, heat: 87, connections: ['cn', 'jp', 'us', 'au', 'eu'] },
  { id: 'us', name: '美国', nameEn: 'USA', lat: 38, lng: -97, heat: 78, connections: ['cn', 'jp', 'sea', 'eu'] },
  { id: 'eu', name: '欧洲', nameEn: 'Europe', lat: 50, lng: 10, heat: 65, connections: ['cn', 'us', 'jp', 'sea'] },
  { id: 'au', name: '澳大利亚', nameEn: 'Australia', lat: -25, lng: 134, heat: 58, connections: ['cn', 'jp', 'sea'] },
];

// 3D地球组件 - 使用更精确的投影
const Globe3D = ({ nodes }: { nodes: MarketNode[] }) => {
  const { i18n } = useTranslation();
  const [rotation, setRotation] = useState({ x: 20, y: 0 }); // 初始倾角20度
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  
  const WIDTH = 400;
  const HEIGHT = 300;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2;
  const RADIUS = 90;
  const FOCAL_LENGTH = 300;
  
  // 自动旋转
  useEffect(() => {
    let angle = 0;
    const timer = setInterval(() => {
      if (!isDragging) {
        angle += 0.25;
        setRotation({ x: 20, y: angle });
      }
    }, 35);
    return () => clearInterval(timer);
  }, [isDragging]);
  
  // 拖拽交互
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setRotation(prev => ({ x: Math.max(-30, Math.min(60, prev.x + dy * 0.2)), y: prev.y + dx * 0.5 }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  // 将经纬度转换为3D球面坐标并投影到2D
  const project = (lat: number, lng: number): { x: number; y: number; z: number; visible: boolean } => {
    // 转换为弧度
    const latRad = (lat * Math.PI) / 180;
    const lngRad = ((lng + 180) * Math.PI) / 180; // 将经度偏移使0度在后面
    
    // 3D球面坐标 (x向右，y向上，z向前)
    let x3d = RADIUS * Math.cos(latRad) * Math.cos(lngRad);
    let y3d = RADIUS * Math.sin(latRad);
    let z3d = RADIUS * Math.cos(latRad) * Math.sin(lngRad);
    
    // 绕X轴旋转 (倾角)
    const radX = (rotation.x * Math.PI) / 180;
    const y3dRotX = y3d * Math.cos(radX) - z3d * Math.sin(radX);
    const z3dRotX = y3d * Math.sin(radX) + z3d * Math.cos(radX);
    y3d = y3dRotX;
    z3d = z3dRotX;
    
    // 绕Y轴旋转 (水平旋转)
    const radY = (rotation.y * Math.PI) / 180;
    const x3dRotY = x3d * Math.cos(radY) - z3d * Math.sin(radY);
    const z3dRotY = x3d * Math.sin(radY) + z3d * Math.cos(radY);
    x3d = x3dRotY;
    z3d = z3dRotY;
    
    // 透视投影
    const scale = FOCAL_LENGTH / (FOCAL_LENGTH - z3d);
    const x2d = CENTER_X + x3d * scale;
    const y2d = CENTER_Y - y3d * scale; // Y轴反转(屏幕坐标)
    
    return { 
      x: x2d, 
      y: y2d, 
      z: z3d,
      visible: z3d < 0 // 前面可见
    };
  };
  
  // 渲染经纬线
  const renderGrid = (): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    // 纬线 - 每30度一条
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: string[] = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        const proj = project(lat, lng - 180);
        points.push(`${proj.x},${proj.y}`);
      }
      elements.push(
        <polyline
          key={`lat-${lat}`}
          points={points.join(' ')}
          fill="none"
          stroke="rgba(6, 182, 212, 0.15)"
          strokeWidth="0.5"
        />
      );
    }
    
    // 经线 - 每30度一条
    for (let lng = -150; lng <= 180; lng += 30) {
      const points: string[] = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        const proj = project(lat, lng);
        points.push(`${proj.x},${proj.y}`);
      }
      elements.push(
        <polyline
          key={`lng-${lng}`}
          points={points.join(' ')}
          fill="none"
          stroke="rgba(6, 182, 212, 0.12)"
          strokeWidth="0.5"
        />
      );
    }
    
    return elements;
  };
  
  // 渲染连接线
  const renderConnections = (): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (!target) return;
        
        const start = project(node.lat, node.lng);
        const end = project(target.lat, target.lng);
        const midLat = (node.lat + target.lat) / 2;
        const midLng = (node.lng + target.lng) / 2;
        const mid = project(midLat, midLng);
        
        // 贝塞尔曲线
        const path = `M ${start.x} ${start.y} Q ${mid.x} ${mid.y - 5} ${end.x} ${end.y}`;
        const isVisible = start.visible && end.visible;
        
        elements.push(
          <g key={`${node.id}-${targetId}`}>
            <path
              d={path}
              fill="none"
              stroke={isVisible ? "rgba(6, 182, 212, 0.5)" : "rgba(6, 182, 212, 0.15)"}
              strokeWidth={isVisible ? "1" : "0.5"}
            />
            {isVisible && (
              <circle r="2.5" fill="#06b6d4">
                <animateMotion dur="3s" repeatCount="indefinite" path={path} />
              </circle>
            )}
          </g>
        );
      });
    });
    
    return elements;
  };
  
  // 渲染节点
  const renderNodes = (): JSX.Element[] => {
    return nodes.map(node => {
      const proj = project(node.lat, node.lng);
      const opacity = proj.visible ? 1 : 0.3;
      const scale = proj.visible ? 1 : 0.7;
      
      return (
        <g 
          key={node.id}
          style={{ opacity, transform: `scale(${scale})`, transformOrigin: `${proj.x}px ${proj.y}px` }}
        >
          {/* 光晕 */}
          <circle 
            cx={proj.x} 
            cy={proj.y} 
            r={10 + (node.heat / 100) * 10}
            fill={node.id === 'cn' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(6, 182, 212, 0.15)'}
          />
          {/* 核心 */}
          <circle 
            cx={proj.x} 
            cy={proj.y} 
            r={5 + (node.heat / 100) * 5}
            fill={node.id === 'cn' ? '#f59e0b' : '#06b6d4'}
          />
          {/* 高光 */}
          <circle 
            cx={proj.x - 1.5} 
            cy={proj.y - 1.5} 
            r={2}
            fill="rgba(255,255,255,0.7)"
          />
          {/* 标签 */}
          {proj.visible && (
            <g>
              <text 
                x={proj.x} 
                y={proj.y + 16} 
                textAnchor="middle"
                fill="white"
                fontSize="6"
                fontWeight="600"
                style={{ textShadow: '0 0 4px rgba(0,0,0,0.9)' }}
              >
                {i18n.language === 'zh' ? node.name : node.nameEn}
              </text>
              <text 
                x={proj.x} 
                y={proj.y - 10} 
                textAnchor="middle"
                fill="#06b6d4"
                fontSize="5"
                fontWeight="bold"
              >
                {node.heat}%
              </text>
            </g>
          )}
        </g>
      );
    });
  };
  
  return (
    <div 
      className="relative w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
        <defs>
          <radialGradient id="globeFill" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.35)" />
            <stop offset="60%" stopColor="rgba(6, 182, 212, 0.12)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.05)" />
          </radialGradient>
          <radialGradient id="globeShadow" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor="rgba(0, 0, 0, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>
        
        {/* 球体背景 */}
        <ellipse cx={CENTER_X} cy={CENTER_Y} rx={RADIUS} ry={RADIUS} fill="url(#globeFill)" />
        
        {/* 经纬线 */}
        {renderGrid()}
        
        {/* 连接线 */}
        {renderConnections()}
        
        {/* 节点 */}
        {renderNodes()}
        
        {/* 阴影 */}
        <ellipse cx={CENTER_X} cy={CENTER_Y + RADIUS + 15} rx={RADIUS * 0.7} ry={10} fill="url(#globeShadow)" opacity="0.4" />
      </svg>
      
      {/* 提示 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-60">
        拖拽旋转
      </div>
    </div>
  );
};

// 粒子系统组件 - 围绕球体的粒子
const OrbitingParticles = ({ nodes }: { nodes: MarketNode[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    // 固定比例 - 基于SVG viewBox 400x300
    const VIEWBOX_WIDTH = 400;
    const VIEWBOX_HEIGHT = 300;
    const GLOBE_RADIUS = 90;
    
    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    const particles = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * Math.PI * 0.6,
      speed: 0.005 + Math.random() * 0.01,
      orbitRadius: GLOBE_RADIUS * (1.15 + Math.random() * 0.35), // 围绕球体的轨道
      size: 0.8 + Math.random() * 1.8,
    }));
    
    const draw = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 计算容器中心
      const containerCenterX = canvas.width / 2;
      const containerCenterY = canvas.height / 2;
      
      // 计算缩放比例 - 使地球在容器中居中并适当缩放
      const scaleX = canvas.width / VIEWBOX_WIDTH;
      const scaleY = canvas.height / VIEWBOX_HEIGHT;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 留一点边距
      
      // 地球在画布上的中心位置
      const globeCx = containerCenterX;
      const globeCy = containerCenterY;
      
      particles.forEach(p => {
        p.angle += p.speed;
        
        // 3D轨道粒子 - 围绕球体
        const orbitR = p.orbitRadius * scale;
        const x = globeCx + Math.cos(p.angle) * orbitR;
        const y = globeCy + Math.sin(p.tilt) * orbitR * 0.3 + Math.sin(p.angle) * Math.sin(p.tilt) * orbitR * 0.25;
        
        // 深度计算 - 前后遮挡效果
        const depth = (Math.cos(p.angle) + 1) / 2;
        const alpha = 0.12 + depth * 0.4;
        const size = p.size * scale * (0.3 + depth * 0.5);
        
        // 发光效果
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
        gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(6, 182, 212, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 核心亮点
        ctx.beginPath();
        ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(draw);
    };
    
    resize();
    window.addEventListener('resize', resize);
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [nodes]);
  
  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

// 主组件
const GlobalMarketVisualizer = () => {
  const nodes = useMemo(() => getMarketNodes(), []);
  const { t } = useTranslation();
  
  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10">
      {/* 标题 */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          {t('ai.showcase.globalVisualization', '全球市场动态')}
        </h3>
      </div>
      
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* 3D地球仪 */}
      <Globe3D nodes={nodes} />
      
      {/* 轨道粒子 */}
      <OrbitingParticles nodes={nodes} />
      
      {/* 图例 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-slate-400 z-10">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" />
          <span>{t('ai.showcase.marketNode', '市场节点')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-6 h-0.5 bg-cyan-500/50" />
          <span>{t('ai.showcase.tradeFlow', '贸易流向')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
          <span>{t('ai.showcase.originPoint', '数据源')}</span>
        </div>
      </div>
      
      {/* 实时数据提示 */}
      <div className="absolute bottom-4 right-4 text-xs text-slate-500 z-10">
        {t('ai.showcase.liveData', '实时数据流')} · AI驱动
      </div>
    </div>
  );
};

export default GlobalMarketVisualizer;
