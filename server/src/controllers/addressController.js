import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress } from '../services/addressService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const listAddressesController = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Addresses loaded', data: { addresses: await listAddresses(req.user._id) } });
});

export const createAddressController = asyncHandler(async (req, res) => {
  const address = await createAddress(req.user._id, req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Address saved', data: { address } });
});

export const updateAddressController = asyncHandler(async (req, res) => {
  const address = await updateAddress(req.user._id, req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: 'Address updated', data: { address } });
});

export const deleteAddressController = asyncHandler(async (req, res) => {
  await deleteAddress(req.user._id, req.validated.params.id);
  sendSuccess(res, { message: 'Address deleted' });
});

export const setDefaultAddressController = asyncHandler(async (req, res) => {
  const address = await setDefaultAddress(req.user._id, req.validated.params.id);
  sendSuccess(res, { message: 'Default address updated', data: { address } });
});

