import test from 'node:test';
import assert from 'node:assert/strict';
import { createAddressSchema, updateAddressSchema } from '../src/validators/addressValidators.js';
import { createMenuItemSchema } from '../src/validators/menuValidators.js';
import { nearbyRestaurantsSchema } from '../src/validators/restaurantValidators.js';
import { isWithinActiveServiceArea } from '../src/services/platformService.js';
import { calculateDeliveryFee, isWithinOpeningHours } from '../src/utils/restaurant.js';

test('address validation accepts separate latitude and longitude and rejects client-owned fields', () => {
  const valid = createAddressSchema.safeParse({
    body: {
      label: 'Home',
      area: 'Dhamboji',
      ward: '4',
      addressLine: 'Surkhet Road',
      landmark: 'Near Dhamboji Chowk',
      deliveryInstructions: 'Blue gate',
      latitude: 28.05,
      longitude: 81.62,
      isDefault: true,
    },
  });
  assert.equal(valid.success, true);
  assert.equal(createAddressSchema.safeParse({ body: { ...valid.data.body, userId: '507f1f77bcf86cd799439011' } }).success, false);
});

test('address update requires both coordinates', () => {
  const result = updateAddressSchema.safeParse({
    params: { id: '507f1f77bcf86cd799439011' },
    body: { latitude: 28.05 },
  });
  assert.equal(result.success, false);
});

test('menu validation rejects a discount that is not lower than price', () => {
  const result = createMenuItemSchema.safeParse({
    body: {
      category: '507f1f77bcf86cd799439011',
      name: 'Chicken momo',
      description: 'Steamed chicken dumplings',
      price: 180,
      discountPrice: 180,
      preparationTime: 20,
    },
  });
  assert.equal(result.success, false);
});

test('nearby restaurant coordinates are range validated', () => {
  assert.equal(nearbyRestaurantsSchema.safeParse({ query: { latitude: 28.05, longitude: 81.62 } }).success, true);
  assert.equal(nearbyRestaurantsSchema.safeParse({ query: { latitude: 128.05, longitude: 81.62 } }).success, false);
});

test('delivery fee applies base, distance rate, and minimum', () => {
  const pricing = { baseFee: 40, perKmRate: 15, minimumFee: 50 };
  assert.equal(calculateDeliveryFee(0, pricing), 50);
  assert.equal(calculateDeliveryFee(2, pricing), 70);
});

test('opening hours support ordinary and overnight schedules', () => {
  assert.equal(isWithinOpeningHours('09:00', '21:00', 12 * 60), true);
  assert.equal(isWithinOpeningHours('09:00', '21:00', 22 * 60), false);
  assert.equal(isWithinOpeningHours('18:00', '02:00', 23 * 60), true);
  assert.equal(isWithinOpeningHours('18:00', '02:00', 12 * 60), false);
});

test('service area check uses configured active radii', () => {
  const settings = {
    serviceAreas: [
      { active: true, center: { latitude: 28.0507, longitude: 81.6167 }, radiusKm: 12 },
    ],
  };
  assert.equal(isWithinActiveServiceArea(settings, { latitude: 28.05, longitude: 81.62 }), true);
  assert.equal(isWithinActiveServiceArea(settings, { latitude: 27.7, longitude: 81.62 }), false);
});
