import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
    marketingOptIn: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);

