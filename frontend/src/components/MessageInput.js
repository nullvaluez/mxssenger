// MessageInput.js

import React, { useState } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';
import { getSocket } from './socket';
import axios from 'axios';

function MessageInput() {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const socket = getSocket();
  const token = localStorage.getItem('token');

  const handleSendMessage = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:9090/upload_file', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else if (message.trim() !== '') {
      socket.emit('send_message', { message });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileButtonClick = () => {
    document.getElementById('file-input').click();
  };

  return (
    <Box
      className="message-input"
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'background.paper',
      }}
    >
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <IconButton color="primary" onClick={handleFileButtonClick}>
        <AttachFile />
      </IconButton>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        variant="outlined"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          backgroundColor: 'background.default',
          borderRadius: 1,
        }}
        InputProps={{
          endAdornment: file && (
            <InputAdornment position="end">
              {file.name}
            </InputAdornment>
          ),
        }}
      />
      <IconButton color="primary" onClick={handleSendMessage} sx={{ marginLeft: 1 }}>
        <Send />
      </IconButton>
    </Box>
  );
}

export default MessageInput;
