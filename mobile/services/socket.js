import { io } from 'socket.io-client';
import { socketBaseUrl } from './runtimeConfig';

let socket;

export const connectSocket = (token) => {
  if (!socketBaseUrl) return null;
  if (socket) socket.disconnect();
  socket = io(socketBaseUrl, { auth: { token }, transports: ['websocket'], autoConnect: true });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = undefined;
};

export const getSocket = () => socket;
