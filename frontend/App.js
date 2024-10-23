// App.js

import React from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import Login from './components/Login';
import Header from './components/Header';
import axios from 'axios';

function App({ darkMode, toggleTheme }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem('token')
  );
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [username, setUsername] = React.useState('');

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchUserData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:9090/get_user_data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setAvatarUrl(data.avatar ? `/avatars/${data.avatar}` : '/avatars/default.jpg');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUsername(decodedToken.username);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Box sx={{ height: '100vh', overflow: 'hidden' }}>
        {isAuthenticated && (
          <Header
            avatarUrl={avatarUrl}
            username={username}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
          />
        )}
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<ChatRoom />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Box>
    </Router>
  );
}

export default App;
