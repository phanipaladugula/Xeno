import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Copy, CheckCircle2, Loader2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import api from '../services/api';

const SUGGESTIONS = [
  "Who are my at-risk customers?",
  "Write a WhatsApp message for VIP customers",
  "Suggest a re-engagement campaign for churned users",
  "What's my best performing customer segment?",
  "Create message template for Diwali sale",
  "How should I target customers who spent over ₹5000?",
];

function Message({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-xeno-500 to-xeno-600 flex items-center justify-center shrink-0 shadow-sm border border-xeno-600">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-5 py-3.5 shadow-sm ${
          isUser
            ? 'bg-xeno-600 text-white rounded-tr-sm ml-auto border border-xeno-700'
            : 'bg-white border border-border text-text rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-xeno-600">
              <ReactMarkdown
                components={{
                  p: ({children}) => <p className="text-sm mb-3 last:mb-0 text-text">{children}</p>,
                  ul: ({children}) => <ul className="text-sm list-disc pl-5 space-y-1.5 mb-3 text-text">{children}</ul>,
                  ol: ({children}) => <ol className="text-sm list-decimal pl-5 space-y-1.5 mb-3 text-text">{children}</ol>,
                  li: ({children}) => <li className="pl-1">{children}</li>,
                  strong: ({children}) => <strong className="font-bold text-text">{children}</strong>,
                  code: ({children}) => <code className="text-xeno-700 bg-xeno-50 border border-xeno-100 px-1.5 py-0.5 rounded-md text-[13px] font-semibold">{children}</code>,
                  h1: ({children}) => <h1 className="text-lg tracking-tight text-text mb-3">{children}</h1>,
                  h2: ({children}) => <h2 className="text-base tracking-tight text-text mb-2.5">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm tracking-tight text-text mb-2">{children}</h3>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-1.5 ml-2">
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">{new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
            <button onClick={handleCopy} className="p-1 rounded text-text-tertiary hover:text-text-secondary hover:bg-background-tertiary transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-background-tertiary border border-border shadow-sm flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-text-secondary" />
        </div>
      )}
    </motion.div>
  );
}

export default function AiChat() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'assistant', ts: Date.now(),
      content: `# Hi! I'm Xeno AI 👋

I'm your intelligent CRM assistant. I have full context of your customer data, segments, and campaigns.

**I can help you:**
- Analyze customer segments and behavior
- Draft personalized campaign messages
- Suggest re-engagement strategies
- Interpret campaign performance
- Plan multi-channel outreach

**Try asking me something like:**
- *"Who should I target for a summer sale?"*
- *"Write a WhatsApp message for VIP customers"*
- *"How are my campaigns performing?"*`
    }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async (text) => {
    if (!text.trim() || thinking) return;

    const userMsg = { id: Date.now(), role: 'user', content: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      // Build history for context (last 10 messages)
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res = await api.chat(text.trim(), history);
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: res.response || '...', ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Failed to get AI response: ' + err.message);
      const errMsg = {
        id: Date.now() + 1, role: 'assistant', ts: Date.now(),
        content: `⚠️ **Error:** ${err.message}\n\nMake sure the backend is running and OPENROUTER_API_KEY is set.`
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setThinking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-4 shrink-0 bg-white z-10 shadow-sm relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xeno-500 to-xeno-600 flex items-center justify-center shadow-md border border-xeno-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-text text-lg tracking-tight">Xeno AI Assistant</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Online · CRM context loaded</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-xeno-50 border border-xeno-200 rounded-full shadow-sm">
          <Zap className="w-4 h-4 text-xeno-600" />
          <span className="text-xs text-xeno-700 font-bold uppercase tracking-wider">AI-Native</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        </AnimatePresence>

        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-xeno-500 to-xeno-600 flex items-center justify-center shrink-0 shadow-sm border border-xeno-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-border shadow-soft rounded-2xl rounded-tl-sm px-5 py-4">
              <div className="flex items-center gap-1.5">
                {[0, 0.15, 0.3].map((delay, i) => (
                  <motion.div key={i}
                    animate={{ y: [-3, 0, -3] }}
                    transition={{ duration: 0.8, delay, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-xeno-400"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 py-4 border-t border-border bg-white z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.slice(0, 3).map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="px-4 py-2 text-[13px] font-bold bg-white hover:bg-background-tertiary border border-border text-text-secondary hover:text-text rounded-full transition-all shadow-sm hover:shadow">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-white shrink-0 z-10 relative">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={thinking}
            placeholder="Ask anything about your customers, segments, or campaigns..."
            className="flex-1 px-5 py-3.5 bg-background border border-border rounded-xl text-text font-medium text-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-xeno-500/20 focus:border-xeno-400 disabled:opacity-50 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="px-5 py-3.5 bg-xeno-600 hover:bg-xeno-700 disabled:bg-background-tertiary disabled:text-text-tertiary disabled:border disabled:border-border text-white rounded-xl font-bold transition-all flex items-center justify-center shadow-medium hover:shadow-large disabled:shadow-none"
          >
            {thinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-xs font-bold text-text-tertiary mt-3 text-center uppercase tracking-wider">
          Xeno AI has access to your live CRM data and campaign history
        </p>
      </div>
    </div>
  );
}
