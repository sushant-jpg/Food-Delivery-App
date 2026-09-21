import { Router } from 'express';
import {
  addCartItemController,
  clearCartController,
  getCartController,
  removeCartItemController,
  updateCartItemController,
} from '../controllers/cartController.js';
import { authorize, protect, requireActiveAccount } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addCartItemSchema, cartItemIdSchema, updateCartItemSchema } from '../validators/cartValidators.js';

const router = Router();
router.use(protect, requireActiveAccount, authorize('customer'));
router.get('/', getCartController);
router.post('/items', validate(addCartItemSchema), addCartItemController);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateCartItemController);
router.delete('/items/:itemId', validate(cartItemIdSchema), removeCartItemController);
router.delete('/', clearCartController);

export default router;
