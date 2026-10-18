import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, MapPin, ExternalLink, X, RefreshCw, AlertCircle } from 'lucide-react';
import { GeoLocation } from '../../types/maps';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mapsGrounding?: Array<{ uri: string; title: string }>;
}

interface GeospatialAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  locations: GeoLocation[];
  onFocusLocation?: (loc: GeoLocation) => void;
}

const QUICK_PROMPTS = [
  'تحليل المناطق الأكثر كثافة في بلاغات صيانة UberFix',
  'ما هي أقرب مراكز الصيانة والمستودعات في محيط سيدي جابر؟',
  'ما هي المشروعات الحالية المرتبطة بـ ERPNext ونسب إنجازها؟',
  'أين تتمركز سيارات وفنيو الطوارئ والتدخل السريع الآن؟'
];

export const GeospatialAssistant: React.FC<GeospatialAssistantProps> = ({
  isOpen,
  onClose,
  locations,
  onFocusLocation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'مرحباً بك! أنا المساعد الذكي لنظام Alazab Maps (az-maps). مدعوم بنموذج Gemini 3.8 Flash مع ميزة خرائط جوجل المكانية (Google Maps Grounding). كيف يمكنني مساعدتك في استعلام المواقع، تحليل كثافة بلاغات UberFix، أو فحص مشروعات وأصول العزب؟',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Call server-side /api/chat with Gemini 3.8 Flash & Maps Grounding
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          userLocation: {
            latitude: 31.216,
            longitude: 29.949 // Default to Sidi Gaber
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'تعذر الاتصال بخادم الذكاء الاصطناعي');
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'تم استلام الاستفسار بنجاح.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        mapsGrounding: data.mapsGrounding || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء معالجة المحادثة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh]">
        {/* Assistant Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">المساعد الجغرافي الذكي (Alazab Geospatial AI)</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  gemini-3.8-flash + Maps Grounding
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تحليل كثافة البلاغات، المسارات الهندسية، وبيانات الأماكن الحية من Google Maps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>مقترحات سريعة:</span>
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 rounded-lg whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Thread */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-amber-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Google Maps Grounding links if returned */}
                  {msg.mapsGrounding && msg.mapsGrounding.length > 0 && (
                    <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                      <div className="font-bold text-blue-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>أماكن ومعالم موثقة من Google Maps:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.mapsGrounding.map((item, gi) => (
                          <a
                            key={gi}
                            href={item.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 block px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>جاري معالجة الاستفسار وتحليل البيانات المكانية وخرائط Google...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder="اكتب استفسارك الجغرافي أو طلب تحليل كثافة الصيانة..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>إرسال</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
