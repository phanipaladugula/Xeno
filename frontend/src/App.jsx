import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatInterface from './components/ChatInterface';
import './index.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

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
          <span className="logo-text">Xeno</span>
        </div>
        <div className="user-info">
          <span className="username">{user.username}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
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
      </main>
    </div>
  );
}

export default App;