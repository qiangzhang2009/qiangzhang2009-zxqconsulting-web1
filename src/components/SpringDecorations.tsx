import { useEffect, useMemo, useState, useId } from 'react';

// 飘落元素配置
const snowflakeSymbols = ['❄', '✦', '✧', '✶', '✴', '⭐', '🌟'];
const blessingSymbols = ['🧧', '福', '吉', '祥', '瑞', '🎊', '🎉'];
const flowerSymbols = ['🌸', '🌺', '🌻', '🌼', '💮', '🏮', '🧧'];

interface FloatingElement {
  id: number;
  symbol: string;
  left: number;
  animationDuration: number;
  animationDelay: number;
  fontSize: number;
  type: 'snowflake' | 'blessing' | 'flower' | 'gold' | 'lantern';
}

export const SpringDecorations = () => {
  const [isMobile, setIsMobile] = useState(false);
  const stableId = useId();

  useEffect(() => {
    // 检测是否为移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const elements = useMemo(() => {
    // Deterministic pseudo-random generator based on a stable id.
    // Must stay pure during render (no mutation / reassignment).
    let seed = 0;
    for (let i = 0; i < stableId.length; i++) {
      seed = (seed * 31 + stableId.charCodeAt(i)) >>> 0;
    }
    const rand = (n: number) => {
      // Produce [0, 1) from a hash-like transform.
      const x = Math.sin(seed + n * 99991) * 10000;
      return x - Math.floor(x);
    };

    const newElements: FloatingElement[] = [];
    const count = isMobile ? 8 : 25;

    for (let i = 0; i < count; i++) {
      const types: FloatingElement['type'][] = [
        'snowflake',
        'blessing',
        'flower',
        'gold',
      ];
      const type = types[Math.floor(rand(i * 10 + 1) * types.length)];

      let symbol = '';
      switch (type) {
        case 'snowflake':
          symbol = snowflakeSymbols[Math.floor(rand(i * 10 + 2) * snowflakeSymbols.length)];
          break;
        case 'blessing':
          symbol = blessingSymbols[Math.floor(rand(i * 10 + 3) * blessingSymbols.length)];
          break;
        case 'flower':
          symbol = flowerSymbols[Math.floor(rand(i * 10 + 4) * flowerSymbols.length)];
          break;
        case 'gold':
          symbol = ['🪙', '💰', '✨', '🌟'][Math.floor(rand(i * 10 + 5) * 4)];
          break;
      }

      newElements.push({
        id: i,
        symbol,
        left: rand(i * 10 + 6) * 100,
        animationDuration: isMobile ? 8 + rand(i * 10 + 7) * 10 : 10 + rand(i * 10 + 7) * 15,
        animationDelay: rand(i * 10 + 8) * 10,
        fontSize: isMobile ? 12 + rand(i * 10 + 9) * 14 : 16 + rand(i * 10 + 9) * 20,
        type,
      });
    }

    return newElements;
  }, [isMobile, stableId]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[9990]">
      {/* 飘落元素 - 移动端减少不透明度，避免遮挡 */}
      {elements.map((el) => (
        <div
          key={el.id}
          className={`falling-item ${
            el.type === 'gold' ? 'gold-sparkle' : ''
          }`}
          style={{
            left: `${el.left}%`,
            fontSize: `${el.fontSize}px`,
            animationDuration: `${el.animationDuration}s`,
            animationDelay: `${el.animationDelay}s`,
            opacity: isMobile ? Math.min(0.5, el.type === 'blessing' ? 0.6 : 0.5) : (el.type === 'blessing' ? 0.9 : 0.7),
          }}
        >
          {el.symbol}
        </div>
      ))}

      {/* 左侧装饰 - 奔腾的骏马 - 移动端隐藏或缩小 */}
      <div className={`fixed left-4 top-1/4 lantern ${isMobile ? 'hidden sm:block' : ''}`}>
        <span className={`${isMobile ? 'text-4xl' : 'text-6xl'} filter drop-shadow-lg`}>🐴</span>
      </div>

      {/* 右侧装饰 - 灯笼 - 移动端调整位置 */}
      <div className={`fixed right-4 top-1/3 lantern ${isMobile ? 'hidden sm:block' : ''}`} style={{ animationDelay: '1s' }}>
        <span className={`${isMobile ? 'text-3xl' : 'text-5xl'} filter drop-shadow-lg`}>🏮</span>
      </div>

      {/* 右上角装饰 - 马蹄铁 - 移动端缩小 */}
      <div className="fixed right-8 top-20 gold-sparkle">
        <span className={`${isMobile ? 'text-3xl' : 'text-5xl'}`}>🧧</span>
      </div>

      {/* 左上角装饰 - 星星 - 移动端缩小并调整位置 */}
      <div className="fixed left-4 top-20 gold-sparkle sm:left-20 sm:top-24" style={{ animationDelay: '0.5s' }}>
        <span className={`${isMobile ? 'text-2xl' : 'text-4xl'}`}>🌟</span>
      </div>

      {/* 福字装饰 - 移动端调整位置 */}
      <div className="fixed right-4 bottom-1/4 fortune-text sm:right-16">
        <span className={`${isMobile ? 'text-3xl' : 'text-5xl'} text-[#C41E3A]`}>福</span>
      </div>

      {/* 底部装饰 - 鞭炮 - 移动端隐藏 */}
      <div className="fixed left-8 bottom-32 lantern sm:block hidden" style={{ animationDelay: '2s' }}>
        <span className="text-5xl">🎊</span>
      </div>

      {/* 更多飘落效果 - 仅在桌面显示 */}
      <div className="fixed top-0 left-1/4 gold-sparkle sm:block hidden" style={{ animationDelay: '3s' }}>
        <span className="text-3xl">✨</span>
      </div>
      <div className="fixed top-0 right-1/3 gold-sparkle sm:block hidden" style={{ animationDelay: '4s' }}>
        <span className="text-3xl">⭐</span>
      </div>
    </div>
  );
};

// 马年徽章组件
export const YearOfTheHorseBadge = () => (
  <div className="inline-flex items-center gap-2 horse-badge">
    <span>🐴</span>
    <span>2026 马年</span>
  </div>
);

// 春节祝福横幅
export const SpringBanner = ({ message }: { message: string }) => (
  <div className="blessing-banner">
    {message}
  </div>
);

// 装饰性马蹄铁
export const HorseshoeDecoration = ({ size = 2 }: { size?: number }) => (
  <span
    className="horseshoe"
    style={{ fontSize: `${size}rem` }}
  >
    🧧
  </span>
);

// 红包装饰
export const RedPacket = ({ children }: { children: React.ReactNode }) => (
  <div className="red-packet">
    {children}
  </div>
);

// 春节主题卡片装饰
export const SpringCard = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`spring-card ${className}`}>
    {children}
  </div>
);

// 马年按钮组件
export const SpringButton = ({
  children,
  onClick,
  className = '',
  variant = 'primary'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}) => (
  <button
    onClick={onClick}
    className={`btn-spring ${variant === 'secondary' ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#722F37]' : ''} ${className}`}
  >
    {children}
  </button>
);

// 动态福字
export const FortuneText = ({ text = '福' }: { text?: string }) => (
  <span className="fortune-text text-[#C41E3A] font-bold">
    {text}
  </span>
);

// 星星装饰
export const StarDecoration = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className="twinkle-star"
        style={{ animationDelay: `${i * 0.3}s` }}
      >
        ⭐
      </span>
    ))}
  </div>
);

// 春节主题分隔线
export const SpringDivider = () => (
  <div className="spring-divider my-8" />
);

export default SpringDecorations;
