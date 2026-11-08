import { z } from 'zod';

export const createAcademicYearSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    code: z
      .string()
      .trim()
      .min(2, 'Code must be at least 2 characters')
      .max(20, 'Code must be at most 20 characters'),
    startDate: z.string().trim().optional(),
    start_date: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    end_date: z.string().trim().optional(),
    current: z.boolean().optional().default(false),
    centers: z.array(z.string().trim()).optional().default([]),
    status: z.enum(['active', 'inactive']).default('active'),
  })
  .transform((data) => ({
    name: data.name,
    code: data.code,
    startDate: (data.startDate || data.start_date || '').trim(),
    endDate: (data.endDate || data.end_date || '').trim(),
    current: data.current ?? false,
    centers: data.centers ?? [],
    status: data.status,
  }))
  .refine((data) => !!data.startDate, {
    message: 'Start date is required',
    path: ['startDate'],
  })
  .refine((data) => !!data.endDate, {
    message: 'End date is required',
    path: ['endDate'],
  })
  .refine((data) => !data.startDate || !isNaN(Date.parse(data.startDate)), {
    message: 'Invalid start date format',
    path: ['startDate'],
  })
  .refine((data) => !data.endDate || !isNaN(Date.parse(data.endDate)), {
    message: 'Invalid end date format',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

export const updateAcademicYearSchema = createAcademicYearSchema;
