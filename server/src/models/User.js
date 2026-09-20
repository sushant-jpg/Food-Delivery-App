import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { USER_ROLES, USER_STATUSES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(USER_ROLES), required: true, immutable: true },
    status: { type: String, enum: USER_STATUSES, default: 'active', index: true },
    profileImage: { type: String, trim: true, default: null },
    passwordChangedAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.index({ role: 1, status: 1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.passwordChangedAfter = function passwordChangedAfter(issuedAtSeconds) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > issuedAtSeconds;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_document, object) => {
    delete object.password;
    delete object.passwordResetToken;
    delete object.passwordResetExpires;
    delete object.__v;
    return object;
  },
});

export const User = mongoose.model('User', userSchema);

