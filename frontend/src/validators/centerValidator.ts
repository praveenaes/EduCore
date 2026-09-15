import { z } from 'zod';

export const centerSchema = z.object({
  name: z
    .string()
    .min(1, 'Center name is required')
    .min(2, 'Center name must be at least 2 characters')
    .max(100, 'Center name cannot exceed 100 characters'),
  code: z
    .string()
    .min(1, 'Center code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(5, 'Enter a valid phone number')
    .max(20, 'Phone number cannot exceed 20 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  timezone: z
    .string()
    .min(1, 'Timezone is required'),
  addressLine1: z
    .string()
    .min(1, 'Address line 1 is required')
    .min(3, 'Address must be at least 3 characters'),
  city: z
    .string()
    .min(1, 'City is required'),
  state: z
    .string()
    .min(1, 'State is required'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required'),
  country: z
    .string()
    .min(1, 'Country is required'),
  status: z.enum(['active', 'inactive']),
});

export type CenterFormData = z.infer<typeof centerSchema>;
