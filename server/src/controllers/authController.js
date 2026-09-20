import { env } from '../config/env.js';
import {
  applyAsRestaurant,
  applyAsRider,
  beginPasswordReset,
  completePasswordReset,
  getAccountContext,
  login,
  registerCustomer,
} from '../services/authService.js';
import { sendPasswordReset } from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const registerCustomerController = asyncHandler(async (req, res) => {
  const result = await registerCustomer(req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Customer account created successfully', data: result });
});

export const registerRestaurantController = asyncHandler(async (req, res) => {
  const result = await applyAsRestaurant(req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Restaurant application submitted for approval', data: result });
});

export const registerRiderController = asyncHandler(async (req, res) => {
  const result = await applyAsRider(req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Rider application submitted for approval', data: result });
});

export const loginController = asyncHandler(async (req, res) => {
  const result = await login(req.validated.body);
  sendSuccess(res, { message: 'Logged in successfully', data: result });
});

export const meController = asyncHandler(async (req, res) => {
  const account = await getAccountContext(req.user);
  sendSuccess(res, { message: 'Account loaded', data: account });
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const reset = await beginPasswordReset(req.validated.body.email);
  let developmentResetToken;
  if (reset) {
    await sendPasswordReset(reset);
    if (env.NODE_ENV === 'development' && env.LOG_PASSWORD_RESET_TOKEN) developmentResetToken = reset.token;
  }
  sendSuccess(res, {
    message: 'If an account exists for that email, password reset instructions have been sent',
    data: developmentResetToken ? { developmentResetToken } : null,
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await completePasswordReset(req.validated.body);
  sendSuccess(res, { message: 'Password reset successfully', data: result });
});

export const logoutController = (_req, res) => {
  sendSuccess(res, { message: 'Logged out successfully' });
};

