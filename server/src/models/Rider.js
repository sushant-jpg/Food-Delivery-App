import mongoose from 'mongoose';
import { APPROVAL_STATUSES } from '../constants/roles.js';
import { pointSchema } from './shared.js';

const riderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'bicycle'], required: true },
    vehicleNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },
    drivingLicenseNumber: { type: String, trim: true, uppercase: true, default: null },
    drivingLicenseImage: { type: String, trim: true, default: null },
    currentAddress: { type: String, required: true, trim: true, maxlength: 250 },
    city: { type: String, required: true, trim: true, default: 'Nepalgunj', index: true },
    status: { type: String, enum: APPROVAL_STATUSES, default: 'pending', index: true },
    isOnline: { type: Boolean, default: false },
    currentLocation: { type: pointSchema, default: undefined },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, trim: true, default: null },
  },
  { timestamps: true },
);

riderSchema.index({ currentLocation: '2dsphere' }, { sparse: true });
riderSchema.index({ city: 1, status: 1, isOnline: 1 });

export const Rider = mongoose.model('Rider', riderSchema);

