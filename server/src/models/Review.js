import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
    restaurantRating: { type: Number, required: true, min: 1, max: 5 },
    riderRating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, trim: true, maxlength: 800, default: '' },
  },
  { timestamps: true },
);

export const Review = mongoose.model('Review', reviewSchema);

