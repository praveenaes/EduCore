import { z } from 'zod';

export const courseSchema = z.object({
  programId: z
    .string()
    .trim()
    .min(1, 'Please select a program'),
  name: z
    .string()
    .trim()
    .min(2, 'Course name must be at least 2 characters')
    .max(100, 'Course name must be at most 100 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Course code must be at least 2 characters')
    .max(20, 'Course code must be at most 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase letters, numbers, or hyphens only'),
  durationMonths: z
    .string()
    .trim()
    .min(1, 'Duration is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 60, {
      message: 'Duration must be between 1 and 60 months',
    }),
  levelName: z
    .string()
    .trim()
    .min(1, 'Level name is required (e.g. Base, Semester, Level)')
    .max(30, 'Level name must be at most 30 characters'),
  levelCount: z
    .string()
    .trim()
    .min(1, 'Level count is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 10, {
      message: 'Level count must be between 1 and 10',
    }),
  description: z
    .string()
    .trim()
    .min(5, 'Description is required and must be at least 5 characters')
    .max(500, 'Description must be at most 500 characters'),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
