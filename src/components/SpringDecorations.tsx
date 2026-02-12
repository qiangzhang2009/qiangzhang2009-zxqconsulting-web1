import { useEffect, useState } from 'react';

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
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // 生成飘落元素
    const newElements: FloatingElement[] = [];
    const count = 25;

    for (let i = 0; i < count; i++) {
      const types: FloatingElement['type'][] = ['snowflake', 'blessing', 'flower', 'gold'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let symbol = '';
      switch (type) {
        case 'snowflake':
          symbol = snowflakeSymbols[Math.floor(Math.random() * snowflakeSymbols.length)];
          break;
        case 'blessing':
          symbol = blessingSymbols[Math.floor(Math.random() * blessingSymbols.length)];
          break;
        case 'flower':
          symbol = flowerSymbols[Math.floor(Math.random() * flowerSymbols.length)];
          break;
        case 'gold':
          symbol = ['🪙', '💰', '✨', '🌟'][Math.floor(Math.random() * 4)];
          break;
      }

      newElements.push({
        id: i,
        symbol,
        left: Math.random() * 100,
        animationDuration: 10 + Math.random() * 15,
        animationDelay: Math.random() * 10,
        fontSize: 16 + Math.random() * 20,
        type,
      });
    }

    setElements(newElements);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[9990]">
      {/* 飘落元素 */}
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
            opacity: el.type === 'blessing' ? 0.9 : 0.7,
          }}
        >
          {el.symbol}
        </div>
      ))}

      {/* 左侧装饰 - 奔腾的骏马 */}
      <div className="fixed left-4 top-1/4 lantern">
        <span className="text-6xl filter drop-shadow-lg">🐴</span>
      </div>

      {/* 右侧装饰 - 灯笼 */}
      <div className="fixed right-4 top-1/3 lantern" style={{ animationDelay: '1s' }}>
        <span className="text-5xl filter drop-shadow-lg">🏮</span>
      </div>

      {/* 右上角装饰 - 马蹄铁 */}
      <div className="fixed right-8 top-20 gold-sparkle">
        <span className="text-5xl">🧧</span>
      </div>

      {/* 左上角装饰 - 星星 */}
      <div className="fixed left-20 top-24 gold-sparkle" style={{ animationDelay: '0.5s' }}>
        <span className="text-4xl">🌟</span>
      </div>

      {/* 福字装饰 */}
      <div className="fixed right-16 bottom-1/4 fortune-text">
        <span className="text-5xl text-[#C41E3A]">福</span>
      </div>

      {/* 底部装饰 - 鞭炮 */}
      <div className="fixed left-8 bottom-32 lantern" style={{ animationDelay: '2s' }}>
        <span className="text-5xl">🎊</span>
      </div>

      {/* 更多飘落效果 - 仅在视口内显示 */}
      <div className="fixed top-0 left-1/4 gold-sparkle" style={{ animationDelay: '3s' }}>
        <span className="text-3xl">✨</span>
      </div>
      <div className="fixed top-0 right-1/3 gold-sparkle" style={{ animationDelay: '4s' }}>
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
