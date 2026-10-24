import { z } from 'zod';

export const assessmentCriteriaSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Criteria name is required')
      .max(100, 'Criteria name cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z\s-]+$/,
        'Criteria name can only contain letters, spaces, and hyphens'
      )
      .refine(
        (val) => /[a-zA-Z]/.test(val),
        'Criteria name must contain at least one letter'
      ),
    courseId: z.string().trim().min(1, 'Please select a course'),
    levelNumber: z.string().trim().min(1, 'Please select a course level'),
    subjectId: z.string().trim().min(1, 'Please select a subject'),
    assessmentType: z.enum(['exam', 'viva', 'assignment', 'project', 'quiz', 'other'], {
      message: 'Please select an assessment type',
    }),
    maxMarks: z
      .string()
      .trim()
      .min(1, 'Max marks is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 1000, {
        message: 'Max marks must be between 1 and 1000',
      }),
    passMarks: z
      .string()
      .trim()
      .min(1, 'Pass marks is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Pass marks cannot be negative',
      }),
    hasCe: z.boolean(),
  })
  .refine(
    (data) => {
      const max = Number(data.maxMarks);
      const pass = Number(data.passMarks);
      if (isNaN(max) || isNaN(pass)) return true;
      return pass <= max;
    },
    {
      message: 'Pass marks cannot be greater than max marks',
      path: ['passMarks'],
    }
  );

export type AssessmentCriteriaFormValues = z.infer<typeof assessmentCriteriaSchema>;
