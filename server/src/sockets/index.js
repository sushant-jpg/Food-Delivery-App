import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const configureSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const rawToken = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!rawToken) return next(new Error('Authentication required'));
      const payload = verifyAccessToken(rawToken);
      const user = await User.findById(payload.sub).select('role status');
      if (!user || ['rejected', 'suspended'].includes(user.status)) return next(new Error('Account unavailable'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);

    socket.on('order:subscribe', (orderId) => {
      if (typeof orderId === 'string' && /^[a-f\d]{24}$/i.test(orderId)) socket.join(`order:${orderId}`);
    });

    socket.on('order:unsubscribe', (orderId) => socket.leave(`order:${orderId}`));
  });
};

