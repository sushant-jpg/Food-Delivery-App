import { z } from 'zod';

export const nepalPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+977[- ]?)?9[678]\d{8}$/, 'Enter a valid Nepal mobile number')
  .transform((value) => {
    const local = value.replace(/[\s-]/g, '').replace(/^\+977/, '');
    return `+977${local}`;
  });

export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(160);
const nameSchema = z.string().trim().min(2).max(80);
const optionalImageSchema = z.union([z.url(), z.literal(''), z.null()]).optional();

const passwordConfirmation = (data) => data.password === data.confirmPassword;
const passwordConfirmationOptions = {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
};

export const registerCustomerSchema = z.object({
  body: z
    .object({
      fullName: nameSchema,
      email: emailSchema,
      phone: nepalPhoneSchema,
      password: strongPasswordSchema,
      confirmPassword: z.string(),
      profileImage: optionalImageSchema,
    })
    .refine(passwordConfirmation, passwordConfirmationOptions),
});

export const registerRestaurantSchema = z.object({
  body: z
    .object({
      ownerName: nameSchema,
      email: emailSchema,
      phone: nepalPhoneSchema,
      password: strongPasswordSchema,
      confirmPassword: z.string(),
      profileImage: optionalImageSchema,
      restaurantName: z.string().trim().min(2).max(120),
      description: z.string().trim().min(20).max(800),
      cuisines: z.array(z.string().trim().min(2).max(50)).min(1).max(10),
      restaurantPhone: nepalPhoneSchema,
      restaurantImage: optionalImageSchema,
      addressLine: z.string().trim().min(3).max(180),
      area: z.string().trim().min(2).max(80),
      city: z.string().trim().min(2).max(80).default('Nepalgunj'),
      landmark: z.string().trim().min(2).max(160),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm format'),
      closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm format'),
    })
    .refine(passwordConfirmation, passwordConfirmationOptions),
});

export const registerRiderSchema = z.object({
  body: z
    .object({
      fullName: nameSchema,
      email: emailSchema,
      phone: nepalPhoneSchema,
      password: strongPasswordSchema,
      confirmPassword: z.string(),
      profileImage: optionalImageSchema,
      vehicleType: z.enum(['bike', 'scooter', 'bicycle']),
      vehicleNumber: z.string().trim().min(2).max(40),
      drivingLicenseNumber: z.string().trim().max(60).optional().nullable(),
      drivingLicenseImage: optionalImageSchema,
      currentAddress: z.string().trim().min(3).max(250),
      city: z.string().trim().min(2).max(80).default('Nepalgunj'),
    })
    .superRefine((data, context) => {
      if (data.password !== data.confirmPassword) {
        context.addIssue({ code: 'custom', message: 'Passwords do not match', path: ['confirmPassword'] });
      }
      if (data.vehicleType !== 'bicycle' && !data.drivingLicenseNumber) {
        context.addIssue({ code: 'custom', message: 'A driving license is required for this vehicle', path: ['drivingLicenseNumber'] });
      }
    }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrPhone: z.string().trim().min(1, 'Email or phone is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({ body: z.object({ email: emailSchema }) });

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(32),
      password: strongPasswordSchema,
      confirmPassword: z.string(),
    })
    .refine(passwordConfirmation, passwordConfirmationOptions),
});

