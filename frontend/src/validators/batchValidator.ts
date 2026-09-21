import { z } from 'zod';

export const batchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Batch name is required')
    .max(100, 'Batch name cannot exceed 100 characters'),
  courseId: z.string().trim().min(1, 'Course is required'),
  levelNumber: z.string().trim().min(1, 'Level / Semester is required'),
  centerId: z.string().trim().min(1, 'Center is required'),
  academicYearId: z.string().trim().min(1, 'Academic Year is required'),
  teacherId: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;
