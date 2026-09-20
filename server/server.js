import http from 'node:http';
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
  httpServer.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Nepalgungdaba API listening on http://0.0.0.0:${env.PORT}`);
  });
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

start().catch((error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);
});

