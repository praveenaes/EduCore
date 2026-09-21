import { z } from 'zod';

const centerAddressSchema = z.object({
  addressLine1: z.string().trim().min(2, 'Address line 1 is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(2, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
});

export const createCenterSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    code: z
      .string()
      .trim()
      .min(2, 'Code must be at least 2 characters')
      .max(20, 'Code must be at most 20 characters'),
    phone: z.string().trim().min(5, 'Phone is required'),
    email: z.string().trim().email('Invalid email address'),
    timezone: z.string().trim().min(2, 'Timezone is required').default('Asia/Kolkata'),
    address: centerAddressSchema.optional(),
    addressLine1: z.string().trim().optional(),
    address_line_1: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
    country: z.string().trim().optional(),
    country_id: z.string().trim().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
  })
  .transform((data) => {
    const address = data.address || {
      addressLine1: (data.addressLine1 || data.address_line_1 || '').trim(),
      city: (data.city || '').trim(),
      state: (data.state || '').trim(),
      postalCode: (data.postalCode || data.postal_code || '').trim(),
      country: (data.country || data.country_id || '').trim(),
    };

    return {
      name: data.name,
      code: data.code,
      phone: data.phone,
      email: data.email,
      timezone: data.timezone,
      address,
      status: data.status,
    };
  })
  .refine(
    (data) =>
      data.address.addressLine1 &&
      data.address.city &&
      data.address.state &&
      data.address.postalCode &&
      data.address.country,
    {
      message:
        'Complete address is required (addressLine1, city, state, postalCode, country)',
      path: ['address'],
    }
  );

export const updateCenterSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    code: z.string().trim().min(2).max(20).optional(),
    phone: z.string().trim().min(5).optional(),
    email: z.string().trim().email().optional(),
    timezone: z.string().trim().min(2).optional(),
    address: centerAddressSchema.partial().optional(),
    addressLine1: z.string().trim().optional(),
    address_line_1: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
    country: z.string().trim().optional(),
    country_id: z.string().trim().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  })
  .transform((data) => {
    let address = data.address;
    if (
      !address &&
      (data.addressLine1 ||
        data.address_line_1 ||
        data.city ||
        data.state ||
        data.postalCode ||
        data.postal_code ||
        data.country ||
        data.country_id)
    ) {
      address = {
        addressLine1: data.addressLine1 || data.address_line_1,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode || data.postal_code,
        country: data.country || data.country_id,
      };
    }

    return {
      name: data.name,
      code: data.code,
      phone: data.phone,
      email: data.email,
      timezone: data.timezone,
      address,
      status: data.status,
    };
  });
