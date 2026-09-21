import { Cart, MenuItem } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const populateCart = (query) =>
  query
    .populate('restaurant', 'name image area status isAcceptingOrders')
    .populate('items.menuItem', 'name image price discountPrice isAvailable restaurant');

const serializeCart = (cart) => {
  if (!cart) return { cart: null, subtotal: 0, itemCount: 0 };
  const value = cart.toObject();
  const items = value.items
    .filter((item) => item.menuItem)
    .map((item) => {
      const unitPrice = item.menuItem.discountPrice ?? item.menuItem.price;
      return { ...item, unitPrice, lineTotal: unitPrice * item.quantity };
    });
  return {
    cart: { ...value, items },
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
  };
};

export const getCart = async (customerId) => serializeCart(await populateCart(Cart.findOne({ customer: customerId })));

export const addCartItem = async (customerId, input) => {
  const menuItem = await MenuItem.findById(input.menuItemId).populate('restaurant', 'name status isAcceptingOrders');
  if (!menuItem || !menuItem.isAvailable) throw new AppError('Menu item is unavailable', 404);
  if (!menuItem.restaurant || menuItem.restaurant.status !== 'approved' || !menuItem.restaurant.isAcceptingOrders) {
    throw new AppError('Restaurant is not accepting orders', 409);
  }

  let cart = await Cart.findOne({ customer: customerId }).populate('restaurant', 'name');
  if (cart && String(cart.restaurant._id) !== String(menuItem.restaurant._id)) {
    if (!input.replaceExisting) {
      throw new AppError('Your cart contains food from another restaurant.', 409, {
        code: 'CART_RESTAURANT_CONFLICT',
        currentRestaurant: cart.restaurant.name,
        requestedRestaurant: menuItem.restaurant.name,
      });
    }
    cart.restaurant = menuItem.restaurant._id;
    cart.items = [];
  }

  if (!cart) cart = new Cart({ customer: customerId, restaurant: menuItem.restaurant._id, items: [] });
  const existing = cart.items.find((item) => String(item.menuItem) === String(menuItem._id));
  if (existing) {
    if (existing.quantity + input.quantity > 50) throw new AppError('Maximum quantity for an item is 50', 422);
    existing.quantity += input.quantity;
    if (input.instructions) existing.instructions = input.instructions;
  } else {
    cart.items.push({ menuItem: menuItem._id, quantity: input.quantity, instructions: input.instructions });
  }
  await cart.save();
  return getCart(customerId);
};

export const updateCartItem = async (customerId, itemId, input) => {
  const cart = await Cart.findOne({ customer: customerId });
  const item = cart?.items.id(itemId);
  if (!cart || !item) throw new AppError('Cart item not found', 404);
  if (input.quantity !== undefined) item.quantity = input.quantity;
  if (input.instructions !== undefined) item.instructions = input.instructions;
  await cart.save();
  return getCart(customerId);
};

export const removeCartItem = async (customerId, itemId) => {
  const cart = await Cart.findOne({ customer: customerId });
  const item = cart?.items.id(itemId);
  if (!cart || !item) throw new AppError('Cart item not found', 404);
  cart.items.pull(item._id);
  if (cart.items.length === 0) await cart.deleteOne();
  else await cart.save();
  return getCart(customerId);
};

export const clearCart = async (customerId) => {
  await Cart.deleteOne({ customer: customerId });
};
