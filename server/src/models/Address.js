import mongoose from 'mongoose';
import { pointSchema } from './shared.js';

const addressSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, enum: ['Home', 'Work', 'Other'], required: true },
    addressLine: { type: String, required: true, trim: true, maxlength: 180 },
    area: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, default: 'Nepalgunj', index: true },
    district: { type: String, required: true, trim: true, default: 'Banke' },
    province: { type: String, required: true, trim: true, default: 'Lumbini' },
    ward: { type: String, trim: true, maxlength: 20, default: '' },
    landmark: { type: String, required: true, trim: true, maxlength: 160 },
    instructions: { type: String, trim: true, maxlength: 300, default: '' },
    deliveryInstructions: { type: String, trim: true, maxlength: 300, default: '' },
    location: { type: pointSchema, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ location: '2dsphere' });
addressSchema.index({ customer: 1, isDefault: 1 });
addressSchema.index(
  { customer: 1 },
  { unique: true, partialFilterExpression: { isDefault: true }, name: 'one_default_address_per_customer' },
);

export const Address = mongoose.model('Address', addressSchema);
