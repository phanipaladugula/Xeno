import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatInterface from './components/ChatInterface';
import TaskManager from './components/TaskManager';
import './index.css';
import './App.css';

// Xeno logo SVG component
function XenoLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="url(#grad1)" />
      <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#667eea',stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#764ba2',stopOpacity:1}} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (token && userId && username) {
      setUser({
        id: userId,
        username: username,
        token: token
      });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSelectedChat(null);
  };

  const handleChatTitleUpdate = (chatId, newTitle) => {
    if (selectedChat && selectedChat.id === chatId) {
      setSelectedChat({ ...selectedChat, title: newTitle });
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <XenoLogo size={32} />
          <span className="logo-text">Xeno Agent</span>
        </div>
        <div className="user-info">
          <span className="username">{user.username}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="tab-nav">
          <button
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            ✅ Tasks
          </button>
        </div>

        {activeTab === 'chat' && (
          <div className="tab-content">
            <div className="chat-container">
              <ChatList
                selectedChat={selectedChat}
                onChatSelect={setSelectedChat}
              />
              <ChatInterface
                chat={selectedChat}
                onChatTitleUpdate={handleChatTitleUpdate}
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tab-content">
            <TaskManager />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-logo">Xeno Agent</div>
        <div className="footer-links">
          <a href="https://xeno.ai" target="_blank" rel="noopener noreferrer">About</a>
          <a href="https://xeno.ai" target="_blank" rel="noopener noreferrer">Help</a>
          <a href="https://xeno.ai" target="_blank" rel="noopener noreferrer">Privacy</a>
        </div>
        <div className="footer-copyright">
          © 2024 Xeno. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;