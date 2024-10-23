// socket.js

import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  socket = io('http://localhost:9090', {
    auth: {
      token: token,
    },
    transports: ['websocket'],
  });

  return socket;
};

export const getSocket = () => socket;
