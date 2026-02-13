import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, X, Wechat, Send } from 'lucide-react';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 滚动超过 300px 后显示
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contactOptions = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: '立即拨打',
      value: '+86 138-1790-9618',
      href: 'tel:+8613817909618',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <Wechat className="w-5 h-5" />,
      label: '微信咨询',
      value: 'zxq_consulting',
      color: 'bg-[#07C160] hover:bg-[#06AE56]',
      copyable: true,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: '发送邮件',
      value: 'info@zxqconsulting.com',
      href: 'mailto:info@zxqconsulting.com',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: '在线留言',
      value: '联系我们',
      action: 'scroll',
      color: 'bg-[#C41E3A] hover:bg-[#A01830]',
    },
  ];

  const handleOptionClick = (option: typeof contactOptions[0]) => {
    if (option.action === 'scroll') {
      // 滚动到联系区域
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制微信号: ' + text);
  };

  return (
    <>
      {/* 浮动按钮 - 只在滚动后显示 */}
      <div
        className={`fixed right-4 sm:right-6 bottom-6 sm:bottom-8 z-40 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        {/* 展开的联系方式面板 */}
        <div
          className={`absolute bottom-16 right-0 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'
          }`}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-[#C41E3A] to-[#DC143C] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">联系我们</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 联系选项 */}
          <div className="p-3 space-y-2">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={option.href}
                onClick={() => handleOptionClick(option)}
                className={`flex items-center gap-3 p-3 rounded-xl text-white ${option.color} transition-transform hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex-shrink-0">{option.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-90 truncate">{option.value}</div>
                </div>
                {option.copyable && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyToClipboard(option.value);
                    }}
                    className="flex-shrink-0 p-1 bg-white/20 rounded hover:bg-white/30"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                )}
              </a>
            ))}
          </div>

          {/* 工作时间 */}
          <div className="px-4 pb-3">
            <div className="text-xs text-gray-500 text-center">
              工作时间: 周一至周五 9:00-18:00
            </div>
          </div>
        </div>

        {/* 主按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#C41E3A] to-[#FFD700] rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
          aria-label="联系我们"
        >
          {/* 消息提示 */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            !
          </span>
          
          {/* 图标切换 */}
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform duration-300" 
            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} 
          />
          
          {/* 悬停效果 */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>
      </div>

      {/* 移动端底部安全区域 */}
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none sm:hidden" />
    </>
  );
};

export default FloatingContact;
