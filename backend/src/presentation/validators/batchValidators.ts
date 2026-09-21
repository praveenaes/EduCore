import { z } from 'zod';

export const createBatchSchema = z.object({
  name: z.string().trim().min(1, 'Batch name is required').max(100),
  courseId: z.string().trim().min(1, 'Course is required'),
  levelNumber: z.coerce.number().min(1, 'Level is required'),
  centerId: z.string().trim().min(1, 'Center is required'),
  academicYearId: z.string().trim().min(1, 'Academic year is required'),
  teacherId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === '' || val === null ? undefined : val)),
});

export const updateBatchSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  courseId: z.string().trim().min(1).optional(),
  levelNumber: z.coerce.number().min(1).optional(),
  centerId: z.string().trim().min(1).optional(),
  academicYearId: z.string().trim().min(1).optional(),
  teacherId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === '' ? null : val)),
  isActive: z.boolean().optional(),
});
