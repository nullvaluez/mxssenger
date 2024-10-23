// UserList.js

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

function UserList({ connectedUsers }) {
  return (
    <Box
      className="user-list"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Typography variant="h6" sx={{ padding: 2 }}>
        Connected Users
      </Typography>
      {Object.entries(connectedUsers).map(([username, user]) => (
        <Box
          key={username}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar src={user.avatar} alt={username} sx={{ marginRight: 1 }} />
          <Typography variant="body1">{username}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default UserList;
