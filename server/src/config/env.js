import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/nepalgungdaba'),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-before-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:8081'),
  PASSWORD_RESET_URL: z.string().default('nepalgungdaba://reset-password'),
  LOG_PASSWORD_RESET_TOKEN: z.string().default('false').transform((value) => value === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', z.prettifyError(parsed.error));
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET.includes('development-only')) {
  console.error('JWT_SECRET must be changed before running in production.');
  process.exit(1);
}

export const env = Object.freeze(parsed.data);

