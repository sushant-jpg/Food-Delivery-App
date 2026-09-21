import { z } from 'zod';
import { objectIdSchema, optionalImageSchema } from './sharedValidators.js';

const categoryBody = {
  name: z.string().trim().min(2).max(60),
  image: optionalImageSchema,
  sortOrder: z.coerce.number().int().min(0).max(1000).optional().default(0),
  isActive: z.boolean().optional().default(true),
};

export const createCategorySchema = z.object({ body: z.object(categoryBody).strict() });
export const updateCategorySchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      name: categoryBody.name.optional(),
      image: optionalImageSchema,
      sortOrder: z.coerce.number().int().min(0).max(1000).optional(),
      isActive: z.boolean().optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide at least one field'),
});

const menuItemShape = {
  category: objectIdSchema,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(500),
  image: optionalImageSchema,
  price: z.coerce.number().positive().max(100000),
  discountPrice: z.union([z.coerce.number().min(0).max(100000), z.null()]).optional().default(null),
  preparationTime: z.coerce.number().int().min(1).max(180),
  isVegetarian: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
};

const validDiscount = (value) => value.discountPrice === null || value.discountPrice === undefined || value.discountPrice < value.price;

export const createMenuItemSchema = z.object({
  body: z.object(menuItemShape).strict().refine(validDiscount, {
    message: 'Discount price must be lower than the regular price',
    path: ['discountPrice'],
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      category: menuItemShape.category.optional(),
      name: menuItemShape.name.optional(),
      description: menuItemShape.description.optional(),
      image: optionalImageSchema,
      price: menuItemShape.price.optional(),
      discountPrice: z.union([z.coerce.number().min(0).max(100000), z.null()]).optional(),
      preparationTime: menuItemShape.preparationTime.optional(),
      isVegetarian: z.boolean().optional(),
      isAvailable: z.boolean().optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide at least one field'),
});

export const menuEntityIdSchema = z.object({ params: z.object({ id: objectIdSchema }) });

export const menuAvailabilitySchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({ isAvailable: z.boolean() }).strict(),
});

