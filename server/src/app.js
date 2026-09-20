import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { sanitizeRequest } from './middleware/sanitize.js';
import { sendSuccess } from './utils/apiResponse.js';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.NODE_ENV === 'development' ? true : env.CLIENT_URL.split(',').map((origin) => origin.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(sanitizeRequest);
  if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (_req, res) => {
    sendSuccess(res, {
      message: 'Nepalgungdaba API is healthy',
      data: { environment: env.NODE_ENV, timestamp: new Date().toISOString() },
    });
  });

  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.NODE_ENV === 'test' ? 1000 : 100,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
    }),
    authRoutes,
  );

  app.use(notFound);
  app.use(errorHandler);
  return app;
};

export default createApp();

