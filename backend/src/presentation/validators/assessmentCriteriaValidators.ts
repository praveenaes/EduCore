import { z } from 'zod';

const assessmentTypes = ['exam', 'viva', 'assignment', 'project', 'quiz', 'other'] as const;

export const createAssessmentCriteriaSchema = z
  .object({
    name: z
      .string({ required_error: 'Criteria name is required' })
      .trim()
      .min(1, 'Criteria name is required')
      .max(100, 'Criteria name cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z0-9\s\-._()]+$/,
        'Criteria name can only contain letters, numbers, spaces, hyphens, and periods'
      )
      .refine(
        (val) => /[a-zA-Z]/.test(val),
        'Criteria name must contain at least one letter'
      ),
    courseId: z
      .string({ required_error: 'Course is required' })
      .trim()
      .min(1, 'Course is required'),
    levelNumber: z.coerce
      .number({ required_error: 'Course level is required' })
      .min(1, 'Course level must be at least 1'),
    subjectId: z
      .string({ required_error: 'Subject is required' })
      .trim()
      .min(1, 'Subject is required'),
    assessmentType: z.enum(assessmentTypes, {
      required_error: 'Assessment type is required',
    }),
    maxMarks: z.coerce
      .number({ required_error: 'Maximum marks is required' })
      .min(1, 'Maximum marks must be at least 1')
      .max(1000, 'Maximum marks cannot exceed 1000'),
    passMarks: z.coerce
      .number({ required_error: 'Passing marks is required' })
      .min(0, 'Passing marks cannot be negative'),
    hasCe: z.boolean().default(false),
  })
  .refine((data) => data.passMarks <= data.maxMarks, {
    message: 'Passing marks cannot exceed maximum marks',
    path: ['passMarks'],
  });

export const updateAssessmentCriteriaSchema = createAssessmentCriteriaSchema;

export const assessmentCriteriaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  courseId: z.string().trim().optional(),
  levelNumber: z.coerce.number().min(1).optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
