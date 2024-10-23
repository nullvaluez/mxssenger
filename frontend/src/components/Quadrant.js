// Quadrant.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import socket from './socket';
import axios from 'axios';

function Quadrant() {
  const [message, setMessage] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [avatarUrl, setAvatarUrl] = useState('/avatars/default.jpg');
  const token = localStorage.getItem('token');
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:9090/get_data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;
        setMessage(data.message || '');
        setFontSize(data.fontSize || 16);
        setAvatarUrl(data.avatar ? `/avatars/${data.avatar}` : '/avatars/default.jpg');
        console.log('Initial data fetched:', data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    socket.on('update_message', (data) => {
      setMessage(data.message);
      console.log('Message updated:', data.message);
    });

    socket.on('update_font_size', (data) => {
      setFontSize(data.fontSize);
      console.log('Font size updated:', data.fontSize);
    });

    socket.on('update_avatar', (data) => {
      setAvatarUrl(data.avatarUrl);
      console.log('Avatar updated:', data.avatarUrl);
    });

    return () => {
      socket.off('update_message');
      socket.off('update_font_size');
      socket.off('update_avatar');
    };
  }, [token]);

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    socket.emit('save_message', { message: newMessage });
    console.log('Message change emitted:', newMessage);
  };

  const handleFontSizeChange = (increment) => {
    const newFontSize = Math.min(Math.max(fontSize + increment, 10), 72);
    setFontSize(newFontSize);
    socket.emit('save_font_size', { fontSize: newFontSize });
    console.log('Font size change emitted:', newFontSize);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB.');
        return;
      }
      const formData = new FormData();
      formData.append('avatar', file);

      axios
        .post(`http://localhost:9090/upload_avatar`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const data = response.data;
          if (data.success) {
            setAvatarUrl(data.avatar_url);
            console.log('Avatar uploaded:', data.avatar_url);
          } else {
            console.error(data.error);
          }
        })
        .catch((error) => {
          console.error('Error uploading avatar:', error);
        });
    }
  };

  return (
    <Box
      position="relative"
      height="100%"
      sx={{
        backgroundColor: 'background.default',
        color: 'text.primary',
      }}
    >
      {/* Font Size Buttons */}
      <Box
        position="absolute"
        top={16}
        right={16}
        display="flex"
        flexDirection="column"
        zIndex={1}
      >
        <IconButton
          onClick={() => handleFontSizeChange(2)}
          color="primary"
          size="large"
        >
          <Add />
        </IconButton>
        <IconButton
          onClick={() => handleFontSizeChange(-2)}
          color="primary"
          size="large"
        >
          <Remove />
        </IconButton>
      </Box>

      {/* Avatar Upload */}
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload-quadrant"
        type="file"
        onChange={handleAvatarChange}
      />
      <label htmlFor="avatar-upload-quadrant">
        <IconButton
          component="span"
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
        >
          <Avatar
            src={avatarUrl}
            sx={{ width: 64, height: 64, opacity: 0.8 }}
          />
        </IconButton>
      </label>

      {/* Text Field */}
      <TextField
        multiline
        fullWidth
        value={message}
        onChange={handleMessageChange}
        variant="outlined"
        InputProps={{
          style: {
            fontSize: fontSize,
            height: '100%',
            alignItems: 'flex-start',
          },
        }}
        sx={{
          height: '100%',
          backgroundColor: 'transparent',
          '.MuiOutlinedInput-notchedOutline': { border: 'none' },
        }}
      />
    </Box>
  );
}

export default Quadrant;
