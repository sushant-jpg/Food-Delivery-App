import { Category, MenuItem, Restaurant, User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { haversineDistanceKm } from '../utils/location.js';
import {
  calculateDeliveryFee,
  calculateEstimatedDeliveryMinutes,
  getMinutesInTimezone,
  isWithinOpeningHours,
} from '../utils/restaurant.js';
import { getPlatformSettings, isWithinActiveServiceArea } from './platformService.js';

const restaurantOpen = (restaurant) =>
  restaurant.status === 'approved' &&
  restaurant.isAcceptingOrders &&
  isWithinOpeningHours(
    restaurant.openingTime,
    restaurant.closingTime,
    getMinutesInTimezone(new Date(), restaurant.timezone || 'Asia/Kathmandu'),
  );

const preparationTimesByRestaurant = async (restaurantIds) => {
  const values = await MenuItem.aggregate([
    { $match: { restaurant: { $in: restaurantIds }, isAvailable: true } },
    { $group: { _id: '$restaurant', average: { $avg: '$preparationTime' } } },
  ]);
  return new Map(values.map((value) => [String(value._id), value.average]));
};

const publicSummary = (restaurant, distanceKm, pricing, averagePreparationTime) => {
  const value = restaurant.toObject ? restaurant.toObject() : restaurant;
  const estimatedMinutes = calculateEstimatedDeliveryMinutes(distanceKm, averagePreparationTime);
  return {
    id: String(value._id),
    name: value.name,
    image: value.image,
    coverImage: value.coverImage,
    cuisines: value.cuisines,
    area: value.area,
    rating: value.averageRating,
    ratingCount: value.ratingCount,
    distanceKm,
    deliveryFee: calculateDeliveryFee(distanceKm, pricing),
    estimatedDeliveryTime: `${estimatedMinutes}-${estimatedMinutes + 10} min`,
    openingTime: value.openingTime,
    closingTime: value.closingTime,
    isOpen: restaurantOpen(value),
    minimumOrder: value.minimumOrder,
  };
};

export const findNearbyRestaurants = async ({ latitude, longitude, radius }) => {
  const settings = await getPlatformSettings();
  if (!isWithinActiveServiceArea(settings, { latitude, longitude })) return [];
  const pricing = settings.deliveryPricing;
  const radiusKm = Math.min(radius || pricing.maximumDistanceKm, pricing.maximumDistanceKm);
  const restaurants = await Restaurant.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitude, latitude] },
        key: 'location',
        distanceField: 'distanceKm',
        distanceMultiplier: 0.001,
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: { status: 'approved', isAcceptingOrders: true },
      },
    },
    { $sort: { distanceKm: 1, averageRating: -1 } },
    { $limit: 50 },
  ]);
  const preparationTimes = await preparationTimesByRestaurant(restaurants.map((restaurant) => restaurant._id));
  return restaurants.map((restaurant) =>
    publicSummary(
      restaurant,
      Number(restaurant.distanceKm.toFixed(2)),
      pricing,
      preparationTimes.get(String(restaurant._id)) || 20,
    ),
  );
};

export const getCustomerRestaurant = async (restaurantId, coordinates) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, status: 'approved' });
  if (!restaurant) throw new AppError('Restaurant is unavailable', 404);

  const settings = await getPlatformSettings();
  const [restaurantLongitude, restaurantLatitude] = restaurant.location.coordinates;
  const distanceKm = coordinates.latitude === undefined
    ? 0
    : haversineDistanceKm(
        { latitude: coordinates.latitude, longitude: coordinates.longitude },
        { latitude: restaurantLatitude, longitude: restaurantLongitude },
      );
  const categories = await Category.find({ restaurant: restaurant._id, isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  const items = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true }).sort({ name: 1 }).lean();
  const groupedCategories = categories.map((category) => ({
    ...category,
    id: String(category._id),
    items: items.filter((item) => String(item.category) === String(category._id)).map((item) => ({ ...item, id: String(item._id) })),
  }));
  const averagePreparationTime = items.length
    ? items.reduce((total, item) => total + item.preparationTime, 0) / items.length
    : 20;

  return {
    ...publicSummary(restaurant, distanceKm, settings.deliveryPricing, averagePreparationTime),
    description: restaurant.description,
    phone: restaurant.phone,
    addressLine: restaurant.addressLine,
    landmark: restaurant.landmark,
    categories: groupedCategories,
  };
};

export const getOwnedRestaurant = async (ownerId) => {
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  if (!restaurant) throw new AppError('Restaurant profile not found', 404);
  return restaurant;
};

export const updateOwnedRestaurant = async (ownerId, input) => {
  const restaurant = await getOwnedRestaurant(ownerId);
  if (restaurant.status !== 'approved') throw new AppError('Only an approved restaurant can update its profile', 403);
  const allowed = [
    'name',
    'description',
    'cuisines',
    'phone',
    'image',
    'coverImage',
    'addressLine',
    'area',
    'landmark',
    'openingTime',
    'closingTime',
    'isAcceptingOrders',
    'minimumOrder',
  ];
  allowed.forEach((field) => {
    if (input[field] !== undefined) restaurant[field] = input[field] === '' ? null : input[field];
  });
  if (input.latitude !== undefined) restaurant.location = { type: 'Point', coordinates: [input.longitude, input.latitude] };
  await restaurant.save();
  return restaurant;
};

export const listRestaurantsForAdmin = (status) => {
  const query = status ? { status } : {};
  return Restaurant.find(query).populate('owner', 'fullName email phone status').sort({ createdAt: -1 });
};

const transitionRestaurant = async (restaurantId, adminId, expectedStatus, update, userStatus) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, status: expectedStatus });
  if (!restaurant) throw new AppError(`Restaurant is not ${expectedStatus}`, 409);
  Object.assign(restaurant, update);
  if (update.status === 'approved') {
    restaurant.approvedAt = new Date();
    restaurant.approvedBy = adminId;
  }
  await restaurant.save();
  await User.findByIdAndUpdate(restaurant.owner, { $set: { status: userStatus } }, { runValidators: true });
  return restaurant.populate('owner', 'fullName email phone status');
};

export const approveRestaurant = (restaurantId, adminId) =>
  transitionRestaurant(restaurantId, adminId, 'pending', { status: 'approved', rejectionReason: null, isAcceptingOrders: true }, 'active');

export const rejectRestaurant = (restaurantId, adminId, reason) =>
  transitionRestaurant(restaurantId, adminId, 'pending', { status: 'rejected', rejectionReason: reason, isAcceptingOrders: false }, 'rejected');

export const suspendRestaurant = (restaurantId, adminId, reason) =>
  transitionRestaurant(restaurantId, adminId, 'approved', { status: 'suspended', rejectionReason: reason || null, isAcceptingOrders: false }, 'suspended');

export const reactivateRestaurant = (restaurantId, adminId) =>
  transitionRestaurant(restaurantId, adminId, 'suspended', { status: 'approved', rejectionReason: null, isAcceptingOrders: true }, 'active');
