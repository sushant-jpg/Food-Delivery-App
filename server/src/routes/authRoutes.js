import { Router } from 'express';
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  registerCustomerController,
  registerRestaurantController,
  registerRiderController,
  resetPasswordController,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerCustomerSchema,
  registerRestaurantSchema,
  registerRiderSchema,
  resetPasswordSchema,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', validate(registerCustomerSchema), registerCustomerController);
router.post('/register/restaurant', validate(registerRestaurantSchema), registerRestaurantController);
router.post('/register/rider', validate(registerRiderSchema), registerRiderController);
router.post('/login', validate(loginSchema), loginController);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);
router.get('/me', protect, meController);
router.post('/logout', protect, logoutController);

export default router;

