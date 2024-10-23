// Header.js

import React from 'react';
import { AppBar, Toolbar, Typography, Avatar, IconButton, Switch } from '@mui/material';
import { Logout } from '@mui/icons-material';

function Header({ avatarUrl, username, darkMode, toggleTheme, onLogout }) {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Bidirectional Messaging App
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme}>
          <Switch checked={darkMode} />
        </IconButton>
        <Avatar src={avatarUrl} alt={username} sx={{ marginLeft: 1, marginRight: 1 }} />
        <IconButton color="inherit" onClick={onLogout}>
          <Logout />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
