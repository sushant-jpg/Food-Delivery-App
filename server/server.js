import http from 'node:http';
import { once } from 'node:events';
import { Server as SocketServer } from 'socket.io';
import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { env } from './src/config/env.js';
import { configureSockets } from './src/sockets/index.js';

const httpServer = http.createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: env.NODE_ENV === 'development' ? true : env.CLIENT_URL.split(',').map((origin) => origin.trim()),
    credentials: true,
  },
});

configureSockets(io);

const start = async () => {
  await connectDatabase();
  httpServer.listen(env.PORT, '0.0.0.0');
  // Wait for the listening event so bind errors reach the startup handler.
  await once(httpServer, 'listening');
  console.log(`Nepalgungdaba API listening on http://0.0.0.0:${env.PORT}`);
};

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down gracefully`);
  io.close();
  httpServer.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  shutdown('unhandledRejection');
});

start().catch(async (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Cannot start: port ${env.PORT} is already in use.`);
    console.error('If NepalgunjDaba is already running in another terminal, keep using that instance.');
    console.error('To restart it, press Ctrl+C in its terminal before running npm run dev:server again.');
  } else {
    console.error('Server failed to start:', error.message);
  }
  io.close();
  await disconnectDatabase();
  process.exit(1);
});
