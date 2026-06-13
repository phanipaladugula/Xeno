import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ChatList.css';

function ChatList({ selectedChat, onChatSelect }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await api.createChat('New Chat');
      setChats([newChat, ...chats]);
      onChatSelect(newChat);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await api.deleteChat(chatId);
        setChats(chats.filter(c => c.id !== chatId));
        if (selectedChat && selectedChat.id === chatId) {
          onChatSelect(null);
        }
      } catch (err) {
        console.error('Failed to delete chat:', err);
      }
    }
  };

  if (loading) {
    return <div className="chat-list loading">Loading chats...</div>;
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
        <button className="new-chat-button" onClick={handleNewChat}>
          + New Chat
        </button>
      </div>

      <div className="chat-list-content">
        {chats.length === 0 ? (
          <div className="no-chats">
            <p>No chats yet</p>
            <p>Click "New Chat" to start a conversation</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat && selectedChat.id === chat.id ? 'active' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              <div className="chat-item-content">
                <div className="chat-icon">
                  <span>💬</span>
                </div>
                <div className="chat-info">
                  <div className="chat-title">{chat.title}</div>
                  <div className="chat-time">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                className="delete-chat-button"
                onClick={(e) => handleDeleteChat(e, chat.id)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;