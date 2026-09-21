import {
  findNearbyRestaurants,
  getCustomerRestaurant,
  getOwnedRestaurant,
  updateOwnedRestaurant,
} from '../services/restaurantService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const nearbyRestaurantsController = asyncHandler(async (req, res) => {
  const restaurants = await findNearbyRestaurants(req.validated.query);
  sendSuccess(res, { message: 'Nearby restaurants loaded', data: { restaurants } });
});

export const customerRestaurantController = asyncHandler(async (req, res) => {
  const restaurant = await getCustomerRestaurant(req.validated.params.id, req.validated.query);
  sendSuccess(res, { message: 'Restaurant loaded', data: { restaurant } });
});

export const ownedRestaurantController = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Restaurant profile loaded', data: { restaurant: await getOwnedRestaurant(req.user._id) } });
});

export const updateOwnedRestaurantController = asyncHandler(async (req, res) => {
  const restaurant = await updateOwnedRestaurant(req.user._id, req.validated.body);
  sendSuccess(res, { message: 'Restaurant profile updated', data: { restaurant } });
});

