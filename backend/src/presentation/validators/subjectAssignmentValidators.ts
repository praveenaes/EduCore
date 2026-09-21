import { z } from 'zod';

export const createSubjectAssignmentSchema = z.object({
  courseId: z.string().trim().min(1, 'Course is required'),
  levelNumber: z.coerce.number().min(1, 'Level number must be at least 1'),
  subjectId: z.string().trim().min(1, 'Subject is required'),
  teacherId: z.string().trim().nullable().optional().transform((val) => (val === '' || val === null ? undefined : val)),
});

export const updateSubjectAssignmentSchema = z.object({
  courseId: z.string().trim().min(1).optional(),
  levelNumber: z.coerce.number().min(1).optional(),
  subjectId: z.string().trim().min(1).optional(),
  teacherId: z.string().trim().nullable().optional().transform((val) => (val === '' ? null : val)),
});
