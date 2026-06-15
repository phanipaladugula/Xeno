import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Copy, CheckCircle2, MoreVertical } from 'lucide-react';
import { Button } from './ui';
import { Input } from './ui';
import { Card, CardContent } from './ui';
import { Badge } from './ui';
import { Tooltip } from './ui';
import AgentThought from './AgentThought';
import { cn, formatTime, generateId } from '@/lib/utils';

const mockMessages = [
  {
    id: generateId(),
    role: 'user',
    content: 'I want to re-engage customers who haven\'t purchased in 30 days',
    timestamp: Date.now() - 60000,
  },
  {
    id: generateId(),
    role: 'agent',
    content: 'I\'ll help you create a re-engagement campaign. Let me analyze your customer data first...',
    timestamp: Date.now() - 55000,
    thinking: true,
  },
];

function ChatInterface({ chat }) {
  const [messages, setMessages] = useState(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    const userMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const aiMessage = {
        id: generateId(),
        role: 'agent',
        content: `Based on your customer data, I've identified 1,234 customers who haven't made a purchase in the past 30 days. I recommend a multi-channel approach:\n\n1. **WhatsApp Message** - Personalized product recommendations\n2. **Email Follow-up** - Exclusive discount offer\n3. **SMS Reminder** - Time-sensitive promotion\n\nWould you like me to create the campaign now?`,
        timestamp: Date.now(),
        sources: [
          { id: 1, title: 'Customer Purchase History', type: 'database', relevance: 0.95 },
          { id: 2, title: 'Previous Campaign Performance', type: 'file', relevance: 0.88 },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleCopy = async (content, id) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Start a Conversation
          </h2>
          <p className="text-gray-600">
            Select a chat from the sidebar or start a new conversation with the AI agent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
            AI
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chat.title}</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:flex">
            {messages.length} messages
          </Badge>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, idx) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.05 }}
              className={cn('flex gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {message.role === 'agent' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className={cn('flex-1 max-w-2xl', message.role === 'user' && 'max-w-md')}>
                {message.thinking ? (
                  <AgentThought thinking={message.thinking} />
                ) : (
                  <Card className={cn('shadow-[0_2px_8px_rgba(0,0,0,0.04)]', message.role === 'user' && 'bg-blue-500 border-blue-500')}>
                    <CardContent className="p-4">
                      <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', message.role === 'agent' ? 'text-gray-900' : 'text-white')}>
                        {message.content}
                      </p>
                      <div className={cn('flex items-center gap-2 mt-3 pt-3 border-t', message.role === 'agent' ? 'border-gray-200' : 'border-white/20')}>
                        <span className={cn('text-xs', message.role === 'agent' ? 'text-gray-400' : 'text-white/70')}>
                          {formatTime(message.timestamp)}
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(message.content, message.id)}>
                                {copiedId === message.id ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className={cn('w-3 h-3', message.role === 'agent' ? 'text-gray-400' : 'text-white/70')} />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{copiedId === message.id ? 'Copied!' : 'Copy'}</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {message.sources && (
                  <div className="mt-2 space-y-2">
                    {message.sources.map((source) => (
                      <div key={source.id} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{source.title}</span>
                        <Badge variant="outline" className="ml-auto">{(source.relevance * 100).toFixed(0)}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex-1 max-w-2xl">
              <Card className="shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isTyping || !inputValue.trim()} className="shrink-0">
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;