import { io } from 'socket.io-client';

const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';
let socket;

export const connectSocket = (token) => {
  if (socket) socket.disconnect();
  socket = io(socketUrl, { auth: { token }, transports: ['websocket'], autoConnect: true });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = undefined;
};

export const getSocket = () => socket;

