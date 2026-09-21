import { Category, MenuItem } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { getOwnedRestaurant } from './restaurantService.js';

const slugify = (name) =>
  name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'category';

const getApprovedRestaurant = async (ownerId) => {
  const restaurant = await getOwnedRestaurant(ownerId);
  if (restaurant.status !== 'approved') throw new AppError('Restaurant approval is required to manage a menu', 403);
  return restaurant;
};

const ensureOwnedCategory = async (restaurantId, categoryId) => {
  const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

const ensureOwnedItem = async (restaurantId, itemId) => {
  const item = await MenuItem.findOne({ _id: itemId, restaurant: restaurantId });
  if (!item) throw new AppError('Menu item not found', 404);
  return item;
};

export const getOwnedMenu = async (ownerId) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  const categories = await Category.find({ restaurant: restaurant._id }).sort({ sortOrder: 1, name: 1 }).lean();
  const items = await MenuItem.find({ restaurant: restaurant._id }).sort({ name: 1 }).lean();
  return {
    restaurant,
    categories: categories.map((category) => ({
      ...category,
      items: items.filter((item) => String(item.category) === String(category._id)),
    })),
  };
};

export const createCategory = async (ownerId, input) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let suffix = 2;
  while (await Category.exists({ restaurant: restaurant._id, slug })) slug = `${baseSlug}-${suffix++}`;
  return Category.create({ ...input, image: input.image || null, restaurant: restaurant._id, slug });
};

export const updateCategory = async (ownerId, categoryId, input) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  const category = await ensureOwnedCategory(restaurant._id, categoryId);
  Object.entries(input).forEach(([field, value]) => {
    category[field] = field === 'image' && value === '' ? null : value;
  });
  await category.save();
  return category;
};

export const deleteCategory = async (ownerId, categoryId) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  const category = await ensureOwnedCategory(restaurant._id, categoryId);
  if (await MenuItem.exists({ restaurant: restaurant._id, category: category._id })) {
    throw new AppError('Delete or move this category’s menu items first', 409);
  }
  await category.deleteOne();
};

const validateFinalPrice = (item) => {
  if (item.discountPrice !== null && item.discountPrice >= item.price) {
    throw new AppError('Discount price must be lower than the regular price', 422);
  }
};

export const createMenuItem = async (ownerId, input) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  await ensureOwnedCategory(restaurant._id, input.category);
  const item = new MenuItem({ ...input, image: input.image || null, restaurant: restaurant._id });
  validateFinalPrice(item);
  await item.save();
  return item;
};

export const updateMenuItem = async (ownerId, itemId, input) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  const item = await ensureOwnedItem(restaurant._id, itemId);
  if (input.category) await ensureOwnedCategory(restaurant._id, input.category);
  Object.entries(input).forEach(([field, value]) => {
    item[field] = field === 'image' && value === '' ? null : value;
  });
  validateFinalPrice(item);
  await item.save();
  return item;
};

export const setMenuItemAvailability = (ownerId, itemId, isAvailable) =>
  updateMenuItem(ownerId, itemId, { isAvailable });

export const deleteMenuItem = async (ownerId, itemId) => {
  const restaurant = await getApprovedRestaurant(ownerId);
  const item = await ensureOwnedItem(restaurant._id, itemId);
  await item.deleteOne();
};

