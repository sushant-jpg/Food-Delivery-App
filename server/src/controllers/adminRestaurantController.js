import {
  approveRestaurant,
  listRestaurantsForAdmin,
  reactivateRestaurant,
  rejectRestaurant,
  suspendRestaurant,
} from '../services/restaurantService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const listRestaurantsController = asyncHandler(async (req, res) => {
  const restaurants = await listRestaurantsForAdmin(req.validated.query.status);
  sendSuccess(res, { message: 'Restaurants loaded', data: { restaurants } });
});

const transitionResponse = (message, operation) =>
  asyncHandler(async (req, res) => {
    const restaurant = await operation(req);
    sendSuccess(res, { message, data: { restaurant } });
  });

export const approveRestaurantController = transitionResponse('Restaurant approved', (req) =>
  approveRestaurant(req.validated.params.id, req.user._id),
);
export const rejectRestaurantController = transitionResponse('Restaurant rejected', (req) =>
  rejectRestaurant(req.validated.params.id, req.user._id, req.validated.body.reason),
);
export const suspendRestaurantController = transitionResponse('Restaurant suspended', (req) =>
  suspendRestaurant(req.validated.params.id, req.user._id, req.validated.body.reason),
);
export const reactivateRestaurantController = transitionResponse('Restaurant reactivated', (req) =>
  reactivateRestaurant(req.validated.params.id, req.user._id),
);

