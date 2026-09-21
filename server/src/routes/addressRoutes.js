import { Router } from 'express';
import {
  createAddressController,
  deleteAddressController,
  listAddressesController,
  setDefaultAddressController,
  updateAddressController,
} from '../controllers/addressController.js';
import { authorize, protect, requireActiveAccount } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressIdSchema, createAddressSchema, updateAddressSchema } from '../validators/addressValidators.js';

const router = Router();
router.use(protect, requireActiveAccount, authorize('customer'));
router.get('/', listAddressesController);
router.post('/', validate(createAddressSchema), createAddressController);
router.patch('/:id', validate(updateAddressSchema), updateAddressController);
router.delete('/:id', validate(addressIdSchema), deleteAddressController);
router.patch('/:id/default', validate(addressIdSchema), setDefaultAddressController);

export default router;
