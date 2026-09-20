import crypto from 'node:crypto';
import { CustomerProfile, Restaurant, Rider, User } from '../models/index.js';
import { USER_ROLES } from '../constants/roles.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken } from '../utils/jwt.js';

const createSlug = (name) =>
  `${name}`
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'restaurant';

const ensureUniqueIdentity = async (email, phone) => {
  const existing = await User.findOne({ $or: [{ email }, { phone }] }).select('email phone');
  if (!existing) return;
  throw new AppError(existing.email === email ? 'An account with that email already exists' : 'An account with that phone already exists', 409);
};

const safeCreateProfile = async (user, createProfile) => {
  try {
    return await createProfile();
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }
};

export const registerCustomer = async (input) => {
  await ensureUniqueIdentity(input.email, input.phone);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    password: input.password,
    profileImage: input.profileImage || null,
    role: USER_ROLES.CUSTOMER,
    status: 'active',
  });
  await safeCreateProfile(user, () => CustomerProfile.create({ user: user._id }));
  return { user, token: signAccessToken(user) };
};

export const applyAsRestaurant = async (input) => {
  await ensureUniqueIdentity(input.email, input.phone);
  const user = await User.create({
    fullName: input.ownerName,
    email: input.email,
    phone: input.phone,
    password: input.password,
    profileImage: input.profileImage || null,
    role: USER_ROLES.RESTAURANT,
    status: 'pending',
  });

  const baseSlug = createSlug(input.restaurantName);
  const duplicateCount = await Restaurant.countDocuments({ slug: new RegExp(`^${baseSlug}(?:-|$)`) });
  const slug = duplicateCount ? `${baseSlug}-${duplicateCount + 1}` : baseSlug;
  const restaurant = await safeCreateProfile(user, () =>
    Restaurant.create({
      owner: user._id,
      name: input.restaurantName,
      slug,
      description: input.description,
      cuisines: input.cuisines,
      phone: input.restaurantPhone,
      image: input.restaurantImage || null,
      addressLine: input.addressLine,
      area: input.area,
      city: input.city,
      landmark: input.landmark,
      location: { type: 'Point', coordinates: [input.longitude, input.latitude] },
      openingTime: input.openingTime,
      closingTime: input.closingTime,
    }),
  );
  return { user, restaurant, token: signAccessToken(user) };
};

export const applyAsRider = async (input) => {
  await ensureUniqueIdentity(input.email, input.phone);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    password: input.password,
    profileImage: input.profileImage || null,
    role: USER_ROLES.RIDER,
    status: 'pending',
  });
  const rider = await safeCreateProfile(user, () =>
    Rider.create({
      user: user._id,
      vehicleType: input.vehicleType,
      vehicleNumber: input.vehicleNumber,
      drivingLicenseNumber: input.drivingLicenseNumber || null,
      drivingLicenseImage: input.drivingLicenseImage || null,
      currentAddress: input.currentAddress,
      city: input.city,
    }),
  );
  return { user, rider, token: signAccessToken(user) };
};

export const login = async ({ emailOrPhone, password }) => {
  const normalized = emailOrPhone.trim().toLowerCase();
  const phoneDigits = normalized.replace(/[\s-]/g, '');
  const phone = /^9[678]\d{8}$/.test(phoneDigits) ? `+977${phoneDigits}` : phoneDigits;
  const user = await User.findOne({ $or: [{ email: normalized }, { phone }] }).select('+password');

  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email/phone or password', 401);
  if (user.status === 'suspended') throw new AppError('This account is suspended', 403);
  if (user.status === 'rejected') throw new AppError('This account application was rejected', 403);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  user.password = undefined;
  return { user, token: signAccessToken(user) };
};

export const getAccountContext = async (user) => {
  let profile = null;
  if (user.role === USER_ROLES.CUSTOMER) profile = await CustomerProfile.findOne({ user: user._id }).populate('defaultAddress');
  if (user.role === USER_ROLES.RESTAURANT) profile = await Restaurant.findOne({ owner: user._id });
  if (user.role === USER_ROLES.RIDER) profile = await Rider.findOne({ user: user._id });
  return { user, profile };
};

export const beginPasswordReset = async (email) => {
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
  if (!user) return null;
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return { user, token };
};

export const completePasswordReset = async ({ token, password }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) throw new AppError('Reset token is invalid or has expired', 400);
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  user.password = undefined;
  return { user, token: signAccessToken(user) };
};
