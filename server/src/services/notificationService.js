import { env } from '../config/env.js';

export const sendPasswordReset = async ({ user, token }) => {
  const resetUrl = `${env.PASSWORD_RESET_URL}?token=${encodeURIComponent(token)}`;

  // Email/SMS providers are deliberately injected here in production. Tokens are never
  // logged unless a developer explicitly opts in through LOG_PASSWORD_RESET_TOKEN.
  if (env.NODE_ENV === 'development' && env.LOG_PASSWORD_RESET_TOKEN) {
    console.info(`Password reset for ${user.email}: ${resetUrl}`);
  }

  return { delivered: false, resetUrl };
};

