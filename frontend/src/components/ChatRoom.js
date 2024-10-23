// ChatRoom.js

import React, { useState, useEffect, useRef } from 'react';
import { Box, useMediaQuery, Avatar, Typography, Link } from '@mui/material';
import UserList from './UserList';
import MessageInput from './MessageInput';
import { getSocket, connectSocket } from './socket';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState({});
  const [userData, setUserData] = useState({});
  const token = localStorage.getItem('token');
  const username = JSON.parse(atob(token.split('.')[1])).username;
  const theme = useTheme();
  const messageListRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:9090/get_user_data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch recent messages
    const fetchRecentMessages = async () => {
      try {
        const response = await axios.get('http://localhost:9090/get_recent_messages', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching recent messages:', error);
      }
    };

    fetchUserData();
    fetchRecentMessages();

    // Connect to Socket.IO
    const socket = connectSocket(token);

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('new_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('new_file', (data) => {
      setMessages((prevMessages) => [...prevMessages, { ...data, type: 'file' }]);
    });

    socket.on('user_list', (users) => {
      setConnectedUsers(users);
    });

    socket.on('update_avatar', (data) => {
      setConnectedUsers((prevUsers) => ({
        ...prevUsers,
        [data.username]: {
          ...prevUsers[data.username],
          avatar: data.avatarUrl,
        },
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Scroll to the bottom of the message list when new messages arrive
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box className="chat-container">
      {!isMobile && <UserList connectedUsers={connectedUsers} />}
      <Box className="chat-room" sx={{ backgroundColor: theme.palette.background.default }}>
        <Box className="message-list" ref={messageListRef}>
          {messages.map((msg, index) => {
            const isSelf = msg.username === username || msg.uploader === username;
            const userAvatar = connectedUsers[msg.username]?.avatar || connectedUsers[msg.uploader]?.avatar || '/avatars/default.jpg';
            const displayName = msg.username || msg.uploader || 'Unknown';
            const timestamp = new Date(msg.timestamp).toLocaleTimeString();

            return (
              <Box
                key={index}
                className={`message ${isSelf ? 'self' : 'other'}`}
                sx={{ display: 'flex', alignItems: 'flex-end', marginBottom: '12px' }}
              >
                {!isSelf && (
                  <Avatar
                    src={userAvatar}
                    alt={displayName}
                    className="avatar-small"
                    sx={{ marginRight: 1 }}
                  />
                )}
                <Box>
                  {msg.type === 'file' ? (
                    <Box
                      className="message-content"
                      sx={{
                        backgroundColor: isSelf
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: isSelf
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      }}
                    >
                      <Typography variant="body1">
                        {isSelf ? 'You' : displayName} shared a file:
                      </Typography>
                      <Link
                        href={msg.fileUrl}
                        download={msg.originalName}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ wordBreak: 'break-all' }}
                      >
                        {msg.originalName}
                      </Link>
                    </Box>
                  ) : (
                    <Box
                      className="message-content"
                      sx={{
                        backgroundColor: isSelf
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: isSelf
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                      }}
                    >
                      {msg.message}
                    </Box>
                  )}
                  <Box className="message-info">
                    {isSelf ? 'You' : displayName}, {timestamp}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
        <MessageInput />
      </Box>
    </Box>
  );
}

export default ChatRoom;
