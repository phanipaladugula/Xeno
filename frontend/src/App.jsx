import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

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
        <div className="welcome-section">
          <h1>Welcome, {user.username}!</h1>
          <p>This is your Xeno Agent dashboard.</p>
        </div>
      </main>
    </div>
  );
}

export default App;