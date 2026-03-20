/**
 * AI顾问板块 - 专业B2B咨询风格
 * 简洁问答形式
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  Send,
  Loader2,
  MessageCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { AI_CONFIG } from '@/config';
import { tracking } from '@/lib/tracking';

// 预设问题
const PRESET_QUESTIONS = [
  { id: 'q1', question: '进入日本市场需要哪些资质认证？', questionEn: 'What certifications are needed to enter Japan market?' },
  { id: 'q2', question: '保健食品出海日本的成功案例？', questionEn: 'Success stories of health supplements entering Japan?' },
  { id: 'q3', question: '日本PMDA注册流程是怎样的？', questionEn: 'What is the PMDA registration process in Japan?' },
  { id: 'q4', question: '东南亚哪个国家市场最容易进入？', questionEn: 'Which Southeast Asian country is easiest to enter?' },
  { id: 'q5', question: '中医药产品出口需要准备哪些文件？', questionEn: 'What documents are needed for TCM product export?' },
  { id: 'q6', question: '海外仓和直邮有什么区别？', questionEn: 'What is the difference between overseas warehouse and direct mail?' },
];

const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const AIAdvisor = () => {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowChat(true);
    setIsLoading(true);
    tracking.toolInteraction('AI Advisor', 'send_message', { message: userMessage.content });

    try {
      const response = await fetch(`${AI_CONFIG.apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      // 检查响应状态
      if (!response.ok) {
        let errorMsg = isZh ? '服务暂时不可用，请稍后再试。' : 'Service temporarily unavailable. Please try again later.';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // 忽略 JSON 解析错误
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error(isZh ? 'AI 未返回有效回复' : 'AI did not return a valid response');
      }

      content = stripMarkdown(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorContent = error instanceof Error ? error.message : (isZh ? '抱歉，服务暂时不可用。请稍后再试。' : 'Sorry, service is temporarily unavailable. Please try again later.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowChat(false);
  };

  return (
    <section ref={sectionRef} id="ai-advisor" className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* 标题 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            {isZh ? 'AI 顾问' : 'AI Advisor'}
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            {isZh ? '专业问题解答' : 'Expert Q&A'}
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            {isZh 
              ? '关于中医药产品出海的一切问题，AI专家随时为您解答' 
              : 'Get instant answers to all your TCM product export questions'}
          </p>
        </div>

        {/* 主内容区 - 科技感发光边框 */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 overflow-hidden relative">
          {/* 发光边框效果 */}
          <div className="absolute inset-0 rounded-xl pointer-events-none">
            <div className="absolute inset-0 rounded-xl border border-emerald-500/20" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          </div>
          
          {/* 预设问题 - 未开始对话时显示 */}
          {!showChat && messages.length === 0 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-gray-300 mb-6">
                  {isZh ? '点击常见问题或输入您的问题' : 'Click a common question or type your question'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRESET_QUESTIONS.map((pq) => (
                    <button
                      key={pq.id}
                      onClick={() => sendMessage(isZh ? pq.question : pq.questionEn)}
                      className="p-4 text-left border border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-300">
                          {isZh ? pq.question : pq.questionEn}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowChat(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                >
                  {isZh ? '向 AI 提问' : 'Ask AI'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 对话区域 - 开始对话后显示 */}
          {(showChat || messages.length > 0) && (
            <div>
              {/* 消息列表 */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-300 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{isZh ? '请输入您的问题...' : 'Please enter your question...'}</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{isZh ? 'AI 思考中...' : 'AI thinking...'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isZh ? '输入您的问题...' : 'Type your question...'}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-700 rounded-lg focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-5 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* 快捷操作 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={clearChat}
                      className="text-xs text-gray-300 hover:text-gray-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {isZh ? '清空对话' : 'Clear chat'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {isZh ? '按 Enter 发送' : 'Press Enter to send'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default AIAdvisor;
