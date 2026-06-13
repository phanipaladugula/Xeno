import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ChatList.css';

function ChatList({ selectedChat, onChatSelect }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [chatType, setChatType] = useState('single');
  const [chatTitle, setChatTitle] = useState('');

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

  const handleNewChat = async (e) => {
    e.preventDefault();
    try {
      const title = chatTitle.trim() || (chatType === 'group' ? 'New Group' : 'New Chat');
      let newChat;
      if (chatType === 'group') {
        newChat = await api.createGroupChat(title);
      } else {
        newChat = await api.createChat(title);
      }
      setChats([newChat, ...chats]);
      onChatSelect(newChat);
      setShowNewChatModal(false);
      setChatTitle('');
      setChatType('single');
    } catch (err) {
      console.error('Failed to create chat:', err);
      alert('Failed to create chat: ' + err.message);
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
        <button className="new-chat-button" onClick={() => setShowNewChatModal(true)}>
          + New Chat
        </button>
      </div>

      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Chat</h3>
              <button className="close-modal" onClick={() => setShowNewChatModal(false)}>✕</button>
            </div>
            <form onSubmit={handleNewChat} className="modal-body">
              <div className="form-group">
                <label>Chat Type</label>
                <div className="chat-type-selector">
                  <button
                    type="button"
                    className={`type-option ${chatType === 'single' ? 'active' : ''}`}
                    onClick={() => setChatType('single')}
                  >
                    💬 Single
                  </button>
                  <button
                    type="button"
                    className={`type-option ${chatType === 'group' ? 'active' : ''}`}
                    onClick={() => setChatType('group')}
                  >
                    👥 Group
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  placeholder={chatType === 'group' ? 'Group name...' : 'Chat name...'}
                />
              </div>
              <button type="submit" className="submit-button">Create Chat</button>
            </form>
          </div>
        </div>
      )}

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