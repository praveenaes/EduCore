import { z } from 'zod';

export const getAssessmentSchema = (_mode: 'create' | 'edit' = 'create') =>
  z
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
        ),
      academicYearId: z.string().trim().min(1, 'Academic Year is required'),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().min(1, 'End date is required'),
      status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']).optional(),
    })
    .refine(
      (data) => {
        if (data.startDate) {
          const selected = new Date(data.startDate + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selected >= today;
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
          return new Date(data.startDate) <= new Date(data.endDate);
        }
        return true;
      },
      {
        message: 'End date must be on or after start date',
        path: ['endDate'],
      }
    );

export const assessmentSchema = getAssessmentSchema('create');

export type AssessmentFormValues = z.infer<typeof assessmentSchema>;
