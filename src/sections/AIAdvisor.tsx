/**
 * AI顾问板块 - 专业B2B咨询风格
 * 支持Demo兜底模式，当API不可用时显示预设答案
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  Send,
  Loader2,
  MessageCircle,
  ArrowRight,
  RefreshCw,
  WifiOff,
  Lightbulb,
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

// Demo 模式回复（当 API 不可用时）
const DEMO_RESPONSES: Record<string, { zh: string; en: string }> = {
  q1: {
    zh: '进入日本市场主要需要以下资质：\n\n1. 医药品认证（PMDA）：中成药需通过药品医疗器械法认证\n2. 食品卫生法备案：保健品/功能性食品需向厚生劳动省备案\n3. JAS有机认证（如适用）：有机产品需日本农业标准认证\n4. 商标注册：建议提前在日本特许厅（JPO）注册商标\n\n我们提供全程代办服务，含检测、标签审查、注册递交，周期约12-18个月。',
    en: 'Entering Japan market requires: PMDA certification, Food Sanitation Law filing, JAS organic certification (if applicable), and trademark registration at the Japan Patent Office.',
  },
  q2: {
    zh: '成功案例参考：\n\n某中药饮片企业进入日本，挑战是语言不通、法规复杂。方案是以「食品」分类备案绕开药品注册。结果6个月进入，月销200万日元。\n\n某保健食品企业进入日本，挑战是无认证、无渠道。方案是先做OEM代工再建立品牌。结果2年成为细分品类TOP3。\n\n如需个性化方案，欢迎咨询我们的专家。',
    en: 'Success story: A TCM decoction company entered Japan in 6 months by filing as food products, achieving 2M JPY monthly sales. A health supplement company became a top-3 brand in 2 years through OEM manufacturing.',
  },
  q3: {
    zh: '日本PMDA注册流程：\n\n1. 产品分类确认（1-2个月）：确定药品/医药部外品/化妆品分类\n2. 资料准备（3-6个月）：日文CTD格式资料、品质试验报告\n3. PMDA审评（12-24个月）：提交申请、补充资料，发补回复\n4. 认证取得：获得PMDA认证后即可上市\n\n建议：中药产品通常走「医药部外品」路径，门槛较低，周期约18-24个月。',
    en: 'PMDA registration: Product classification (1-2 months) → Document prep (3-6 months) → PMDA review (12-24 months) → Certification. TCM products typically fall under quasi-drug with lower barriers.',
  },
  q4: {
    zh: '东南亚市场准入难度排序（从易到难）：\n\n越南：门槛最低，食品注册约3-6个月\n印度尼西亚：BPOM注册约6-12个月，但市场最大\n泰国：TFDA注册约6-9个月，法规较完善\n\n我们的建议：先做越南「试水」，再复制到其他国家。我们的AI工具可以帮您一键评估各国准入难度。',
    en: 'SE Asia market accessibility (easiest first): Vietnam (3-6 months), Indonesia (6-12 months, largest market), Thailand (6-9 months).',
  },
  q5: {
    zh: '中医药产品出口必备文件：\n\n基础文件：营业执照、产品配方表（中英文）、质量检测报告（3个月内有效）、生产许可证\n\n出口文件：自由销售证明（CFS）、原产地证（COO）、出口合同/发票/装箱单\n\n目标市场文件（按需）：GMP认证证书、注册证书/备案证明、标签样本（日文/英文）\n\n我们提供一站式文件代办服务。',
    en: 'Essential TCM export documents: Business license, product formula, quality test report (within 3 months), production license, CFS, COO, export contract/invoice/packing list.',
  },
  q6: {
    zh: '海外仓 vs 直邮对比：\n\n配送速度：海外仓3-5天达，直邮7-15天达\n物流成本：海外仓低（批量运输），直邮高（单件清关）\n库存风险：海外仓有，直邮无\n适合阶段：海外仓适合成熟期，直邮适合初期测款\n\n建议：初期直邮测款，月销超过500单后转海外仓。我们合作的海外仓覆盖日本、澳洲、东南亚。',
    en: 'Overseas warehouse: 3-5 day delivery, lower per-unit cost, requires inventory. Direct mail: 7-15 days, no inventory risk, best for initial testing. Switch to warehouse after 500+ orders/month.',
  },
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isDemo?: boolean;
};

const stripMarkdown = (text: string): string => {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const findDemoResponse = (question: string, isZh: boolean): string | null => {
  const lowerQ = question.toLowerCase();
  for (const [key, resp] of Object.entries(DEMO_RESPONSES)) {
    const qData = PRESET_QUESTIONS.find(pq => pq.id === key);
    if (qData) {
      if (
        lowerQ.includes(qData.question.substring(0, 4)) ||
        lowerQ.includes(qData.questionEn.substring(0, 8))
      ) {
        return isZh ? resp.zh : resp.en;
      }
    }
  }
  return null;
};

const AIAdvisor = () => {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

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
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一位专业的中医药/本草产品出海咨询顾问。请用专业、简洁的方式回答用户问题。' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content');

      content = stripMarkdown(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        isDemo: false,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setIsDemoMode(true);

      const demo = findDemoResponse(messageText, isZh);
      const defaultDemo = isZh
        ? `感谢您的问题！关于「${messageText}」，建议您：\n\n1. 使用上方的「AI智能工具」选择具体市场和产品，获取针对性分析报告\n2. 联系我们的专家，获取一对一咨询\n\n邮箱：customer@zxqconsulting.com`
        : `For your question, we recommend:\n\n1. Use the AI Tools to select a specific market and product for tailored analysis\n2. Contact our experts for 1-on-1 consultation\n\nEmail: customer@zxqconsulting.com`;

      const demoMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: demo || defaultDemo,
        timestamp: new Date(),
        isDemo: true,
      };
      setMessages(prev => [...prev, demoMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowChat(false);
    setIsDemoMode(false);
  };

  return (
    <section ref={sectionRef} id="ai-advisor" className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            {isZh ? 'AI 顾问' : 'AI Advisor'}
            {isDemoMode && (
              <span className="ml-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded">
                Demo
              </span>
            )}
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

        {isDemoMode && (
          <div className="mb-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 max-w-xl mx-auto">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            {isZh ? 'AI 服务暂时不可用，显示 Demo 回复。联系专家获取完整解答。' : 'AI service unavailable, showing demo. Contact experts for full answers.'}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 overflow-hidden relative">
          <div className="absolute inset-0 rounded-xl pointer-events-none">
            <div className="absolute inset-0 rounded-xl border border-emerald-500/20" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          </div>

          {!showChat && messages.length === 0 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">
                    {isZh ? '试试这些常见问题' : 'Try these common questions'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRESET_QUESTIONS.map((pq) => (
                    <button
                      key={pq.id}
                      onClick={() => sendMessage(isZh ? pq.question : pq.questionEn)}
                      className="p-4 text-left border border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-500/5 transition-colors"
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

          {(showChat || messages.length > 0) && (
            <div>
              <div className="h-[400px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-300 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{isZh ? '请输入您的问题...' : 'Please enter your question...'}</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : msg.isDemo
                          ? 'bg-amber-500/20 border border-amber-500/30 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {msg.isDemo && (
                        <div className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                          <WifiOff className="w-3 h-3" />
                          Demo — {isZh ? '联系专家获取完整解答' : 'Contact experts for full answers'}
                        </div>
                      )}
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

              <div className="border-t border-gray-700 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isZh ? '输入您的问题...' : 'Type your question...'}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-700 rounded-lg focus:border-emerald-500 focus:outline-none disabled:opacity-50 bg-gray-700 text-white placeholder-gray-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="px-5 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button onClick={clearChat} className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    {isZh ? '清空对话' : 'Clear chat'}
                  </button>
                  <div className="text-xs text-gray-500">
                    {isZh ? 'Enter 发送 · Shift+Enter 换行' : 'Enter to send · Shift+Enter for newline'}
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
