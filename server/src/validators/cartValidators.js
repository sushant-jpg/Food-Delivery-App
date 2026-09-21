import { z } from 'zod';
import { objectIdSchema } from './sharedValidators.js';

export const addCartItemSchema = z.object({
  body: z
    .object({
      menuItemId: objectIdSchema,
      quantity: z.coerce.number().int().min(1).max(50).optional().default(1),
      instructions: z.string().trim().max(250).optional().default(''),
      replaceExisting: z.boolean().optional().default(false),
    })
    .strict(),
});

export const updateCartItemSchema = z.object({
  params: z.object({ itemId: objectIdSchema }),
  body: z
    .object({
      quantity: z.coerce.number().int().min(1).max(50).optional(),
      instructions: z.string().trim().max(250).optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide quantity or instructions'),
});

export const cartItemIdSchema = z.object({ params: z.object({ itemId: objectIdSchema }) });

