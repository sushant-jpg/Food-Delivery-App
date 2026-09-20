import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed', 'free_delivery'], required: true },
    value: { type: Number, required: true, min: 0 },
    minimumOrder: { type: Number, min: 0, default: 0 },
    maximumDiscount: { type: Number, min: 0, default: null },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usageLimit: { type: Number, min: 1, default: null },
    usedCount: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
  },
  { timestamps: true },
);

export const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

