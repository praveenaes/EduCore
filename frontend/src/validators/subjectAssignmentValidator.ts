import { z } from 'zod';

export const subjectAssignmentSchema = z.object({
  courseId: z.string().trim().min(1, 'Please select a course'),
  levelNumber: z.string().trim().min(1, 'Please select a course level'),
  subjectId: z.string().trim().min(1, 'Please select a subject'),
  teacherId: z.string().trim().optional(),
});

export type SubjectAssignmentFormValues = z.infer<typeof subjectAssignmentSchema>;
