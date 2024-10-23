// Login.js

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister
      ? 'http://localhost:9090/register'
      : 'http://localhost:9090/login';
    try {
      const response = await axios.post(url, { username, password });
      if (response.data.success) {
        if (!isRegister) {
          localStorage.setItem('token', response.data.token);
          onLogin();
        } else {
          setIsRegister(false);
          setError('Registration successful. Please log in.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      console.error('Authentication error:', err);
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" mb={2}>
          {isRegister ? 'Register' : 'Login'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{ mt: 2 }}
          >
            {isRegister ? 'Register' : 'Login'}
          </Button>
        </form>
        <Button
          color="primary"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          sx={{ mt: 2 }}
        >
          {isRegister ? 'Already have an account? Login' : 'No account? Register'}
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;
