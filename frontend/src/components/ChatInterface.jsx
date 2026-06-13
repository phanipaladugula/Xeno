import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './ChatInterface.css';

function ChatInterface({ chat, onChatTitleUpdate }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chat) {
      loadMessages(chat.id);
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (chatId) => {
    setLoading(true);
    try {
      const data = await api.getMessages(chatId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat || sending) return;

    const content = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      // Send user message
      const userMessage = await api.sendMessage(chat.id, content, 'user', false);
      setMessages([...messages, userMessage]);

      // Update chat title if this is the first message
      if (messages.length === 0) {
        const newTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        onChatTitleUpdate(chat.id, newTitle);
      }

      // TODO: Add AI response (will be implemented in Phase 5)
      // For now, just show a placeholder
      const aiMessage = await api.sendMessage(chat.id, "I'll help you with that! (AI response coming soon)", 'ai', true);
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (!chat) {
    return (
      <div className="chat-interface empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>Select a chat to start messaging</h2>
          <p>Choose a conversation from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>{chat.title}</h2>
        <div className="chat-info">
          <span className="chat-type">{chat.type === 'GROUP' ? '👥 Group' : '💬 Single'}</span>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.sender === 'ai' ? 'ai-message' : 'user-message'}`}
            >
              <div className="message-bubble">
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {message.sender === 'ai' ? '🤖 AI' : '👤 You'} • {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !inputValue.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;