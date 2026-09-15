import { z } from 'zod';

export const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name must be at most 100 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Subject code must be at least 2 characters')
    .max(20, 'Subject code must be at most 20 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Code must contain letters, numbers, or hyphens only'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must be at most 500 characters'),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
