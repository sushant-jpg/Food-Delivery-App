import { Router } from 'express';
import {
  availabilityController,
  createCategoryController,
  createMenuItemController,
  deleteCategoryController,
  deleteMenuItemController,
  getMenuController,
  updateCategoryController,
  updateMenuItemController,
} from '../controllers/menuController.js';
import { authorize, protect, requireActiveAccount } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createCategorySchema,
  createMenuItemSchema,
  menuAvailabilitySchema,
  menuEntityIdSchema,
  updateCategorySchema,
  updateMenuItemSchema,
} from '../validators/menuValidators.js';

const router = Router();
router.use(protect, requireActiveAccount, authorize('restaurant'));
router.get('/', getMenuController);
router.post('/categories', validate(createCategorySchema), createCategoryController);
router.patch('/categories/:id', validate(updateCategorySchema), updateCategoryController);
router.delete('/categories/:id', validate(menuEntityIdSchema), deleteCategoryController);
router.post('/items', validate(createMenuItemSchema), createMenuItemController);
router.patch('/items/:id', validate(updateMenuItemSchema), updateMenuItemController);
router.patch('/items/:id/availability', validate(menuAvailabilitySchema), availabilityController);
router.delete('/items/:id', validate(menuEntityIdSchema), deleteMenuItemController);

export default router;
