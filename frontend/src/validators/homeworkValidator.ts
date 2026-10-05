import { z } from 'zod';

export const createHomeworkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Please provide a homework title.')
    .max(100, 'Title cannot exceed 100 characters.'),
  batchId: z.string().min(1, 'Please select a target batch.'),
  subjectId: z.string().min(1, 'Please select a subject.'),
  dueDate: z
    .string()
    .min(1, 'Please select a due date & time.')
    .refine(
      (val) => {
        const selected = new Date(val);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        return selected > todayEnd;
      },
      { message: 'Due date must be in the future (from tomorrow onwards).' }
    ),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters.').optional(),
});

export const updateHomeworkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Please provide a homework title.')
    .max(100, 'Title cannot exceed 100 characters.'),
  dueDate: z
    .string()
    .min(1, 'Please select a due date & time.')
    .refine(
      (val) => {
        const selected = new Date(val);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        return selected > todayEnd;
      },
      { message: 'Due date must be in the future (from tomorrow onwards).' }
    ),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters.').optional(),
});

export type CreateHomeworkFormValues = z.infer<typeof createHomeworkFormSchema>;
export type UpdateHomeworkFormValues = z.infer<typeof updateHomeworkFormSchema>;
