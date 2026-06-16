import { useState, useRef, useContext } from 'react';
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
  Globe2,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { AI_CONFIG } from '@/config';
import { tracking } from '@/lib/tracking';
import { MarketContext } from './aiTools/context';

const DEMO_RESPONSES: Record<string, { zh: string; en: string }> = {
  budget_shift: {
    zh: '如果预算只有 50 万，建议优先选择准入路径更清晰、可测试成本更低的市场和品类组合，避免一开始就进入需要重注册、重教育市场的高投入路径。',
    en: 'If the budget is limited, prioritize markets and categories with clearer entry pathways and lower first-test costs instead of entering high-education or heavy-registration routes first.',
  },
  japan_vs_germany: {
    zh: '日本通常在消费者认知、功能性食品接受度和渠道承接速度上更适合中医健康产品做首站；德国更适合作为法规和长期品牌证明市场，但路径通常更慢。',
    en: 'Japan is often stronger as a first market for TCM health products because of consumer familiarity, category acceptance and faster channel capture. Germany can be stronger for long-term regulatory proof, but usually moves slower.',
  },
  supplement_path: {
    zh: '如果先走 supplement 分类，优势是先验证需求、降低首阶段门槛；风险是后续转药品或更高监管分类时，资料体系、功效表达与注册要求可能需要重做。',
    en: 'Starting with the supplement path can validate demand faster and reduce first-stage barriers, but moving later into a drug or more regulated path may require substantial rework in claims, data and regulatory documentation.',
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

const AIAdvisor = () => {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';
  const { selectedMarket, selectedCategory } = useContext(MarketContext);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const selectedMarketName = selectedMarket ? (isZh ? selectedMarket.name : selectedMarket.nameEn) : isZh ? '当前目标市场' : 'the selected market';
  const selectedCategoryName = selectedCategory || (isZh ? '当前产品' : 'the current product');

  const contextualQuestions = isZh
    ? [
        `为什么 ${selectedMarketName} 比其他市场更适合当前产品？`,
        '如果预算只有 50 万，优先路径应该怎么变？',
        `如果先走 ${selectedCategoryName} 分类，后续路径上有什么需要重点关注的风险？`,
      ]
    : [
        `Why is ${selectedMarketName} a better first market for the current product?`,
        'How should the path change if the budget is limited?',
        `What are the risks of starting with the ${selectedCategoryName} category?`,
      ];

  const buildSystemPrompt = () => {
    const context = `Selected market: ${selectedMarketName}; selected category: ${selectedCategoryName}.`;
    return isZh
      ? `你是一位中医药与健康产品全球化顾问。你的角色不是泛聊天，而是围绕当前诊断结果做二次追问解释。请结合以下上下文回答：${context} 回答要专业、结构化、简洁，重点回答为什么、风险是什么、下一步做什么。`
      : `You are a globalization advisor for TCM and health products. You are not a generic chatbot. You answer follow-up questions around the current diagnosis. Use this context: ${context} Keep answers concise, structured and decision-oriented, explaining why, risks and the next best action.`;
  };

  const getDemoResponse = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes('50') || q.includes('budget')) return isZh ? DEMO_RESPONSES.budget_shift.zh : DEMO_RESPONSES.budget_shift.en;
    if (q.includes('日本') || q.includes('germany') || q.includes('japan')) return isZh ? DEMO_RESPONSES.japan_vs_germany.zh : DEMO_RESPONSES.japan_vs_germany.en;
    if (q.includes('supplement') || q.includes('分类') || q.includes('category')) return isZh ? DEMO_RESPONSES.supplement_path.zh : DEMO_RESPONSES.supplement_path.en;
    return isZh
      ? `基于当前诊断，建议优先围绕 ${selectedMarketName} / ${selectedCategoryName} 继续追问：为什么这条路径成立、最大的阻力在哪里、如果预算或时间变化下一步应如何调整。`
      : `Based on the current diagnosis, continue the follow-up around ${selectedMarketName} / ${selectedCategoryName}: why this path makes sense, what the biggest blocker is, and how the next move changes if budget or timing shifts.`;
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowChat(true);
    setIsLoading(true);
    tracking.toolInteraction('AI Diagnosis Follow-up', 'send_message', { message: userMessage.content, market: selectedMarket?.id, category: selectedCategory });

    try {
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
          max_tokens: 800,
          temperature: 0.5,
        }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content');
      content = stripMarkdown(content);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date(),
          isDemo: false,
        },
      ]);
    } catch {
      setIsDemoMode(true);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getDemoResponse(messageText),
          timestamp: new Date(),
          isDemo: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

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
            {isZh ? '诊断追问器' : 'Diagnosis follow-up'}
            {isDemoMode && (
              <span className="ml-1 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded">Demo</span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            {isZh ? '围绕当前诊断结果继续追问' : 'Keep questioning the current diagnosis'}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto leading-7">
            {isZh
              ? '这不是泛问答机器人，而是围绕你已选择的市场和品类，继续解释为什么、风险在哪、下一步做什么。'
              : 'This is not a generic chatbot. It follows up on the market and category you selected to explain why, surface the risk and clarify the next move.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[
            { icon: Globe2, title: isZh ? '当前市场' : 'Current market', value: selectedMarketName },
            { icon: Target, title: isZh ? '当前品类' : 'Current category', value: selectedCategoryName },
            { icon: ShieldCheck, title: isZh ? '追问目标' : 'Follow-up goal', value: isZh ? '解释路径与风险' : 'Explain path and risk' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <Icon className="w-4 h-4" />
                  {item.title}
                </div>
                <div className="mt-2 text-white font-semibold">{item.value}</div>
              </div>
            );
          })}
        </div>

        {isDemoMode && (
          <div className="mb-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 max-w-2xl mx-auto">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            {isZh ? 'AI 服务暂时不可用，当前显示的是上下文化演示回答。' : 'AI service is temporarily unavailable, so contextual demo answers are shown.'}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-600 overflow-hidden relative">
          {!showChat && messages.length === 0 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">
                    {isZh ? '基于当前诊断推荐追问' : 'Suggested follow-ups for the current diagnosis'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contextualQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => sendMessage(question)}
                      className="p-4 text-left border border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-500/5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-300">{question}</span>
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
                  {isZh ? '继续追问' : 'Ask a follow-up'}
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
                    <p>{isZh ? '输入你想继续追问的问题...' : 'Ask the next diagnostic follow-up question...'}</p>
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
                          Demo — {isZh ? '基于当前上下文的演示回答' : 'Contextual demo answer'}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-100">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{isZh ? 'AI 正在解释诊断...' : 'AI is explaining the diagnosis...'}</span>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={isZh ? '继续追问当前市场、路径或风险...' : 'Ask about the current market, path or risk...'}
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
                    {isZh ? '围绕当前诊断继续追问' : 'Follow up on the current diagnosis'}
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
