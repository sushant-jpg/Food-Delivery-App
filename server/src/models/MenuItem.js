import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    image: { type: String, trim: true, default: null },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    preparationTime: { type: Number, required: true, min: 1, max: 180 },
    isVegetarian: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurant: 1, category: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

