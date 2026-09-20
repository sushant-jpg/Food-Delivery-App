import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, { autoIndex: env.NODE_ENV !== 'production' });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

export const disconnectDatabase = () => mongoose.disconnect();

