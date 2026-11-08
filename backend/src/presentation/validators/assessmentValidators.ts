import { z } from 'zod';

const baseAssessmentSchema = z.object({
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
  courseId: z
    .string({ required_error: 'Course is required' })
    .trim()
    .min(1, 'Course is required'),
  levelNumber: z.coerce
    .number({
      required_error: 'Course level is required',
      invalid_type_error: 'Course level must be a number',
    })
    .min(1, 'Course level must be at least 1'),
  startDate: z.coerce.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Valid start date is required',
  }),
  endDate: z.coerce.date({
    required_error: 'End date is required',
    invalid_type_error: 'Valid end date is required',
  }),
});

export const createAssessmentSchema = baseAssessmentSchema
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

export const updateAssessmentSchema = baseAssessmentSchema
  .extend({
    status: z.enum(['SCHEDULED', 'COMPLETED', 'GRADED', 'PUBLISHED', 'CANCELLED']).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const assessmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  academicYearId: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  levelNumber: z.coerce.number().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'GRADED', 'PUBLISHED', 'CANCELLED']).optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const requestDelegationSchema = z.object({
  reason: z
    .string({ required_error: 'Reason is required' })
    .trim()
    .min(1, 'Reason cannot be empty')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export const reviewDelegationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    required_error: 'Status must be APPROVED or REJECTED',
  }),
  reviewNotes: z.string().trim().max(500).optional(),
});
