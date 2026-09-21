import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from '../services/cartService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCartController = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Cart loaded', data: await getCart(req.user._id) });
});
export const addCartItemController = asyncHandler(async (req, res) => {
  const data = await addCartItem(req.user._id, req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Item added to cart', data });
});
export const updateCartItemController = asyncHandler(async (req, res) => {
  const data = await updateCartItem(req.user._id, req.validated.params.itemId, req.validated.body);
  sendSuccess(res, { message: 'Cart updated', data });
});
export const removeCartItemController = asyncHandler(async (req, res) => {
  const data = await removeCartItem(req.user._id, req.validated.params.itemId);
  sendSuccess(res, { message: 'Item removed from cart', data });
});
export const clearCartController = asyncHandler(async (req, res) => {
  await clearCart(req.user._id);
  sendSuccess(res, { message: 'Cart cleared' });
});

