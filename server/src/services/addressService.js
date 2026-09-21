import { Address, CustomerProfile } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const serializeAddress = (address) => {
  const value = address.toObject ? address.toObject() : address;
  return {
    ...value,
    deliveryInstructions: value.deliveryInstructions || value.instructions || '',
  };
};

const ensureOwnedAddress = async (customerId, addressId) => {
  const address = await Address.findOne({ _id: addressId, customer: customerId });
  if (!address) throw new AppError('Address not found', 404);
  return address;
};

const setOnlyDefault = async (customerId, addressId) => {
  await Address.updateMany({ customer: customerId, _id: { $ne: addressId }, isDefault: true }, { $set: { isDefault: false } });
  const address = await Address.findOneAndUpdate(
    { _id: addressId, customer: customerId },
    { $set: { isDefault: true } },
    { new: true, runValidators: true },
  );
  if (!address) throw new AppError('Address not found', 404);
  await CustomerProfile.findOneAndUpdate({ user: customerId }, { $set: { defaultAddress: address._id } }, { upsert: true });
  return address;
};

export const listAddresses = async (customerId) => {
  const addresses = await Address.find({ customer: customerId }).sort({ isDefault: -1, updatedAt: -1 });
  return addresses.map(serializeAddress);
};

export const createAddress = async (customerId, input) => {
  const count = await Address.countDocuments({ customer: customerId });
  const makeDefault = input.isDefault || count === 0;
  if (makeDefault) await Address.updateMany({ customer: customerId, isDefault: true }, { $set: { isDefault: false } });

  const address = await Address.create({
    customer: customerId,
    label: input.label,
    city: 'Nepalgunj',
    district: 'Banke',
    province: 'Lumbini',
    area: input.area,
    ward: input.ward,
    addressLine: input.addressLine,
    landmark: input.landmark,
    deliveryInstructions: input.deliveryInstructions,
    instructions: input.deliveryInstructions,
    location: { type: 'Point', coordinates: [input.longitude, input.latitude] },
    isDefault: makeDefault,
  });

  if (makeDefault) {
    await CustomerProfile.findOneAndUpdate({ user: customerId }, { $set: { defaultAddress: address._id } }, { upsert: true });
  }
  return serializeAddress(address);
};

export const updateAddress = async (customerId, addressId, input) => {
  const address = await ensureOwnedAddress(customerId, addressId);
  const fields = ['label', 'area', 'ward', 'addressLine', 'landmark', 'deliveryInstructions'];
  fields.forEach((field) => {
    if (input[field] !== undefined) address[field] = input[field];
  });
  if (input.deliveryInstructions !== undefined) address.instructions = input.deliveryInstructions;
  if (input.latitude !== undefined) address.location = { type: 'Point', coordinates: [input.longitude, input.latitude] };
  await address.save();
  return serializeAddress(address);
};

export const deleteAddress = async (customerId, addressId) => {
  const address = await ensureOwnedAddress(customerId, addressId);
  const wasDefault = address.isDefault;
  await address.deleteOne();

  if (wasDefault) {
    const replacement = await Address.findOne({ customer: customerId }).sort({ updatedAt: -1 });
    if (replacement) await setOnlyDefault(customerId, replacement._id);
    else await CustomerProfile.findOneAndUpdate({ user: customerId }, { $set: { defaultAddress: null } });
  }
};

export const setDefaultAddress = async (customerId, addressId) => serializeAddress(await setOnlyDefault(customerId, addressId));

