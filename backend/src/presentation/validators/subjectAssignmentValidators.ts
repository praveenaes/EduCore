import { z } from 'zod';

export const createSubjectAssignmentSchema = z.object({
  courseId: z.string().trim().min(1, 'Course is required'),
  levelNumber: z.coerce.number().min(1, 'Level number must be at least 1'),
  subjectId: z.string().trim().min(1, 'Subject is required'),
  teacherId: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
});

export const updateSubjectAssignmentSchema = z.object({
  levelNumber: z.coerce.number().min(1).optional(),
  teacherId: z.string().trim().optional().transform((val) => (val === '' ? undefined : val)),
});

export const subjectAssignmentQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  levelNumber: z.coerce.number().optional(),
  subjectId: z.string().trim().optional(),
  teacherId: z.string().trim().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
