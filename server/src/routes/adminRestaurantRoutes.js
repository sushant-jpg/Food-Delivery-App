import { Router } from 'express';
import {
  approveRestaurantController,
  listRestaurantsController,
  reactivateRestaurantController,
  rejectRestaurantController,
  suspendRestaurantController,
} from '../controllers/adminRestaurantController.js';
import { authorize, protect, requireActiveAccount } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminRestaurantIdSchema,
  adminRestaurantListSchema,
  rejectRestaurantSchema,
  suspendRestaurantSchema,
} from '../validators/restaurantValidators.js';

const router = Router();
router.use(protect, requireActiveAccount, authorize('admin'));
router.get('/', validate(adminRestaurantListSchema), listRestaurantsController);
router.patch('/:id/approve', validate(adminRestaurantIdSchema), approveRestaurantController);
router.patch('/:id/reject', validate(rejectRestaurantSchema), rejectRestaurantController);
router.patch('/:id/suspend', validate(suspendRestaurantSchema), suspendRestaurantController);
router.patch('/:id/reactivate', validate(adminRestaurantIdSchema), reactivateRestaurantController);

export default router;
