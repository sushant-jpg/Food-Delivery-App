import { z } from 'zod';
import { latitudeSchema, longitudeSchema, objectIdSchema } from './sharedValidators.js';

const addressFields = {
  label: z.enum(['Home', 'Work', 'Other']),
  area: z.string().trim().min(2).max(80),
  ward: z.string().trim().max(20).optional().default(''),
  addressLine: z.string().trim().min(3).max(180),
  landmark: z.string().trim().min(2).max(160),
  deliveryInstructions: z.string().trim().max(300).optional().default(''),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  isDefault: z.boolean().optional().default(false),
};

export const createAddressSchema = z.object({ body: z.object(addressFields).strict() });

export const updateAddressSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      label: addressFields.label.optional(),
      area: addressFields.area.optional(),
      ward: z.string().trim().max(20).optional(),
      addressLine: addressFields.addressLine.optional(),
      landmark: addressFields.landmark.optional(),
      deliveryInstructions: z.string().trim().max(300).optional(),
      latitude: latitudeSchema.optional(),
      longitude: longitudeSchema.optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'Provide at least one field')
    .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), {
      message: 'Latitude and longitude must be updated together',
      path: ['location'],
    }),
});

export const addressIdSchema = z.object({ params: z.object({ id: objectIdSchema }) });

