import { z } from 'zod';

export const createHomeworkSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().max(1000).optional(),
  batchId: z.string().trim().min(1, 'Batch ID is required'),
  subjectId: z.string().trim().min(1, 'Subject ID is required'),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine(
      (val) => {
        const selected = new Date(val);
        if (isNaN(selected.getTime())) return false;
        return selected > new Date();
      },
      { message: 'Due date must be in the future' }
    ),
  attachments: z.array(z.any()).optional(),
});

export const updateHomeworkSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const selected = new Date(val);
        if (isNaN(selected.getTime())) return false;
        return selected > new Date();
      },
      { message: 'Due date must be in the future' }
    ),
  attachments: z.array(z.any()).optional(),
});
