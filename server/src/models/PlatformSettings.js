import mongoose from 'mongoose';

const serviceAreaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    center: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
    },
    radiusKm: { type: Number, required: true, min: 0.5 },
  },
  { _id: true },
);

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'default', immutable: true },
    deliveryPricing: {
      baseFee: { type: Number, min: 0, default: 40 },
      perKmRate: { type: Number, min: 0, default: 15 },
      minimumFee: { type: Number, min: 0, default: 40 },
      maximumDistanceKm: { type: Number, min: 1, default: 15 },
    },
    commissionPercentage: { type: Number, min: 0, max: 100, default: 15 },
    serviceAreas: { type: [serviceAreaSchema], default: [] },
  },
  { timestamps: true },
);

export const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

