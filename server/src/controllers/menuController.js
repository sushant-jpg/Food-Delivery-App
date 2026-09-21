import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getOwnedMenu,
  setMenuItemAvailability,
  updateCategory,
  updateMenuItem,
} from '../services/menuService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getMenuController = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Menu loaded', data: await getOwnedMenu(req.user._id) });
});
export const createCategoryController = asyncHandler(async (req, res) => {
  const category = await createCategory(req.user._id, req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Category created', data: { category } });
});
export const updateCategoryController = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.user._id, req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: 'Category updated', data: { category } });
});
export const deleteCategoryController = asyncHandler(async (req, res) => {
  await deleteCategory(req.user._id, req.validated.params.id);
  sendSuccess(res, { message: 'Category deleted' });
});
export const createMenuItemController = asyncHandler(async (req, res) => {
  const menuItem = await createMenuItem(req.user._id, req.validated.body);
  sendSuccess(res, { statusCode: 201, message: 'Menu item created', data: { menuItem } });
});
export const updateMenuItemController = asyncHandler(async (req, res) => {
  const menuItem = await updateMenuItem(req.user._id, req.validated.params.id, req.validated.body);
  sendSuccess(res, { message: 'Menu item updated', data: { menuItem } });
});
export const availabilityController = asyncHandler(async (req, res) => {
  const menuItem = await setMenuItemAvailability(req.user._id, req.validated.params.id, req.validated.body.isAvailable);
  sendSuccess(res, { message: 'Menu item availability updated', data: { menuItem } });
});
export const deleteMenuItemController = asyncHandler(async (req, res) => {
  await deleteMenuItem(req.user._id, req.validated.params.id);
  sendSuccess(res, { message: 'Menu item deleted' });
});

