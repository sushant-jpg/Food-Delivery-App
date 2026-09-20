import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['restaurant', 'menu_item'], required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  },
  { timestamps: true },
);

favoriteSchema.index(
  { customer: 1, restaurant: 1 },
  { unique: true, partialFilterExpression: { targetType: 'restaurant' } },
);
favoriteSchema.index(
  { customer: 1, menuItem: 1 },
  { unique: true, partialFilterExpression: { targetType: 'menu_item' } },
);

favoriteSchema.pre('validate', function validateTarget(next) {
  const validRestaurant = this.targetType === 'restaurant' && this.restaurant && !this.menuItem;
  const validMenuItem = this.targetType === 'menu_item' && this.menuItem && !this.restaurant;
  if (!validRestaurant && !validMenuItem) return next(new Error('Favorite must reference exactly one matching target'));
  next();
});

export const Favorite = mongoose.model('Favorite', favoriteSchema);
