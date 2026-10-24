import { z } from 'zod';

export const createAssessmentSchema = z
  .object({
    name: z
      .string({ required_error: 'Assessment name is required' })
      .trim()
      .min(1, 'Assessment name is required')
      .max(100, 'Assessment name cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z0-9\s-]+$/,
        'Assessment title can only contain letters, numbers, hyphens, and spaces'
      )
      .refine(
        (val) => /[a-zA-Z]/.test(val),
        'Assessment title must contain letters (cannot be numbers only)'
      ),
    academicYearId: z
      .string({ required_error: 'Academic year is required' })
      .trim()
      .min(1, 'Academic year is required'),
    startDate: z.coerce.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Valid start date is required',
    }),
    endDate: z.coerce.date({
      required_error: 'End date is required',
      invalid_type_error: 'Valid end date is required',
    }),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.startDate >= today;
    },
    {
      message: 'Start date cannot be in the past',
      path: ['startDate'],
    }
  )
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const updateAssessmentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Assessment name is required')
      .max(100, 'Assessment name cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z0-9\s-]+$/,
        'Assessment title can only contain letters, numbers, hyphens, and spaces'
      )
      .refine(
        (val) => /[a-zA-Z]/.test(val),
        'Assessment title must contain letters (cannot be numbers only)'
      )
      .optional(),
    academicYearId: z.string().trim().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.startDate >= today;
      }
      return true;
    },
    {
      message: 'Start date cannot be in the past',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );
