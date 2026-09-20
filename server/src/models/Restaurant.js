import mongoose from 'mongoose';
import { APPROVAL_STATUSES } from '../constants/roles.js';
import { pointSchema } from './shared.js';

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 800 },
    cuisines: [{ type: String, trim: true, maxlength: 50 }],
    phone: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: null },
    coverImage: { type: String, trim: true, default: null },
    addressLine: { type: String, required: true, trim: true, maxlength: 180 },
    area: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, default: 'Nepalgunj', index: true },
    landmark: { type: String, required: true, trim: true, maxlength: 160 },
    location: { type: pointSchema, required: true },
    openingTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    closingTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    timezone: { type: String, default: 'Asia/Kathmandu' },
    status: { type: String, enum: APPROVAL_STATUSES, default: 'pending', index: true },
    rejectionReason: { type: String, trim: true, default: null },
    isAcceptingOrders: { type: Boolean, default: false },
    minimumOrder: { type: Number, min: 0, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 'text', cuisines: 'text', area: 'text' });
restaurantSchema.index({ city: 1, status: 1, isAcceptingOrders: 1 });

export const Restaurant = mongoose.model('Restaurant', restaurantSchema);

