import { Router } from 'express';
import {
  customerRestaurantController,
  nearbyRestaurantsController,
  ownedRestaurantController,
  updateOwnedRestaurantController,
} from '../controllers/restaurantController.js';
import { authorize, protect, requireActiveAccount } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  customerRestaurantSchema,
  nearbyRestaurantsSchema,
  updateRestaurantSchema,
} from '../validators/restaurantValidators.js';

const router = Router();
router.use(protect, requireActiveAccount);
router.get('/nearby', authorize('customer'), validate(nearbyRestaurantsSchema), nearbyRestaurantsController);
router.get('/me', authorize('restaurant'), ownedRestaurantController);
router.patch('/me', authorize('restaurant'), validate(updateRestaurantSchema), updateOwnedRestaurantController);
router.get('/:id', authorize('customer'), validate(customerRestaurantSchema), customerRestaurantController);

export default router;

