import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw new AppError('Authentication is required', 401);

  const token = authorization.slice(7).trim();
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub);

  if (!user) throw new AppError('The account for this session no longer exists', 401);
  if (user.status === 'suspended') throw new AppError('This account is suspended', 403);
  if (user.status === 'rejected') throw new AppError('This account application was rejected', 403);
  if (user.passwordChangedAfter(payload.iat)) throw new AppError('Password changed; please log in again', 401);

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('You do not have permission for this action', 403));
  next();
};

export const requireActiveAccount = (req, _res, next) => {
  if (req.user?.status !== 'active') return next(new AppError('Your account is awaiting approval', 403));
  next();
};

