import { z } from 'zod';
import {
  latitudeSchema,
  longitudeSchema,
  objectIdSchema,
  optionalImageSchema,
  timeSchema,
} from './sharedValidators.js';

const coordinateQuery = {
  latitude: latitudeSchema,
  longitude: longitudeSchema,
};

export const nearbyRestaurantsSchema = z.object({
  query: z.object({
    ...coordinateQuery,
    radius: z.coerce.number().positive().max(50).optional(),
  }),
});

export const customerRestaurantSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  query: z
    .object({
      latitude: latitudeSchema.optional(),
      longitude: longitudeSchema.optional(),
    })
    .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), {
      message: 'Latitude and longitude must be provided together',
    }),
});

export const updateRestaurantSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().min(20).max(800).optional(),
      cuisines: z.array(z.string().trim().min(2).max(50)).min(1).max(10).optional(),
      phone: z.string().trim().min(7).max(30).optional(),
      image: optionalImageSchema,
      coverImage: optionalImageSchema,
      addressLine: z.string().trim().min(3).max(180).optional(),
      area: z.string().trim().min(2).max(80).optional(),
      landmark: z.string().trim().min(2).max(160).optional(),
      latitude: latitudeSchema.optional(),
      longitude: longitudeSchema.optional(),
      openingTime: timeSchema.optional(),
      closingTime: timeSchema.optional(),
      isAcceptingOrders: z.boolean().optional(),
      minimumOrder: z.coerce.number().min(0).optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide at least one field')
    .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), {
      message: 'Latitude and longitude must be updated together',
      path: ['location'],
    }),
});

export const adminRestaurantListSchema = z.object({
  query: z.object({ status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional() }),
});

export const adminRestaurantIdSchema = z.object({ params: z.object({ id: objectIdSchema }) });

export const rejectRestaurantSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({ reason: z.string().trim().min(3).max(300) }).strict(),
});

export const suspendRestaurantSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({ reason: z.string().trim().min(3).max(300).optional() }).strict(),
});

