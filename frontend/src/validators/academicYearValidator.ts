import { z } from 'zod';

export const academicYearSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Academic year name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    code: z
      .string()
      .min(1, 'Code is required')
      .min(2, 'Code must be at least 2 characters')
      .max(20, 'Code cannot exceed 20 characters')
      .regex(/^[A-Za-z0-9\-_/]+$/, 'Code can only contain letters, numbers, hyphens, slashes, and underscores'),
    startDate: z
      .string()
      .min(1, 'Start date is required'),
    endDate: z
      .string()
      .min(1, 'End date is required'),
    current: z.boolean(),
    centers: z.array(z.string()),
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

export type AcademicYearFormData = z.infer<typeof academicYearSchema>;
