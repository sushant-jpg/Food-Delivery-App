import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    details = error.issues.map(({ path, message: issue }) => ({ field: path.join('.'), message: issue }));
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    details = Object.values(error.errors).map(({ path, message: issue }) => ({ field: path, message: issue }));
  } else if (error?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'value';
    message = `An account with that ${field} already exists`;
  } else if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session is invalid or has expired';
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  const response = { success: false, message };
  if (details) response.details = details;
  if (env.NODE_ENV === 'development' && statusCode === 500) response.stack = error.stack;

  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json(response);
};

