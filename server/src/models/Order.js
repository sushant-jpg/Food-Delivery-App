import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants/order.js';
import { addressSnapshotSchema } from './shared.js';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    instructions: { type: String, trim: true, maxlength: 250, default: '' },
  },
  { _id: true },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, trim: true, maxlength: 250, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null, index: true },
    items: { type: [orderItemSchema], required: true },
    deliveryAddress: { type: addressSnapshotSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['NPR'], default: 'NPR' },
    promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
    preparationMinutes: { type: Number, min: 1, max: 180, default: null },
    estimatedDeliveryAt: { type: Date, default: null },
    deliveryInstructions: { type: String, trim: true, maxlength: 300, default: '' },
    cancelledBy: { type: String, enum: ['customer', 'restaurant', 'rider', 'admin'], default: null },
    cancellationReason: { type: String, trim: true, maxlength: 250, default: null },
    cancelledAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ rider: 1, status: 1 });

export const Order = mongoose.model('Order', orderSchema);

